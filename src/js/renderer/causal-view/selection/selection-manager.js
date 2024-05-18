import { SelectionCommand } from "../../undo-redo/commands/selection-command.js";
import { SelectionRenderer } from "./selection-renderer.js";

export class CausalViewSelectionManager extends EventTarget {
  selectedNodesIds = null;
  _structure = null;

  _isSelectByClick = true;

  constructor(api, undoRedoManager) {
    super();
    this.undoRedoManager = undoRedoManager;
    this.api = api;
    this.api.onSelectAll(this.selectAll.bind(this));
  }

  get isSelectByClick() {
    return this._isSelectByClick;
  }
  set isSelectByClick(val) {
    this._isSelectByClick = val;
  }

  selectAll() {
    this.executeSelectNodeIds(
      this._structure.getNodeFacts().map((fact) => fact.id)
    );
  }

  init(structure) {
    this._structure = structure;
    this.selectionRenderer = new SelectionRenderer(structure);
    this.selectionRenderer.initCausalViewSelectionZoom();

    structure.addEventListener("nodeClicked", this.onNodeClicked.bind(this));
    structure.addEventListener("viewClicked", this.onViewClicked.bind(this));

    this.reset();
  }

  getSelectNodesCommand(nodeIds) {
    const prevSelected = [...(this.selectedNodesIds ?? [])];

    const res = new SelectionCommand(this, nodeIds, prevSelected);

    return res;
  }

  reset() {
    this.selectedNodesIds = null;
    this.isSelectByClick = true;
  }

  setSelectedNodeIds(ids) {
    // throw new Error("set selected node ids " + ids.length);

    const prevSelected = this.selectedNodesIds;
    const toSelectAll = (this.selectedNodesIds = new Set(ids)); // Including already selected

    const toSelect = new Set();

    for (const id of ids) {
      if (!prevSelected || !prevSelected.has(id)) {
        toSelect.add(id);
      } else {
        // Already selected
      }
    }

    for (const id of toSelect.values()) {
      this.selectionRenderer.setSelectedAppearance(id);
    }

    if (prevSelected) {
      const toDeselect = new Set();
      for (const id of prevSelected) {
        if (!toSelectAll.has(id)) {
          toDeselect.add(id);
        } else {
          // Already selected
        }
      }

      for (const id of toDeselect.values()) {
        this.selectionRenderer.setNotSelectedAppearance(id);
      }
    }

    const event = new Event(
      ids.length == 1 ? "singleNodeSelected" : "singleNodeNotSelected"
    );
    if (ids.length == 1)
      event.nodeData = this._structure.getNodeDataById(ids[0]);
    this.dispatchEvent(event);
  }

  onViewClicked(event) {
    if (!this.isSelectByClick) return;
    this.executeSelectNodeIds([]);
  }

  executeSelectNodeIds(nodeIds) {
    // Commands that do nothing are ignored
    // if (
    //   (nodeIds && nodeIds.length > 0) ||
    //   (this.selectedNodesIds && this.selectedNodesIds.length) > 0
    // )
    this.undoRedoManager.execute(this.getSelectNodesCommand(nodeIds));
  }

  onNodeClicked(event) {
    const clickEvent = event.clickEvent;
    event.clickEvent.stopPropagation();

    if (!this.isSelectByClick) return;

    const nodeFact = event.nodeSelection.data.fact;

    const isMultiSelect = clickEvent.ctrlKey || clickEvent.metaKey;
    const removeClicked =
      isMultiSelect && this.selectedNodesIds?.has(nodeFact.id);
    let newSelected = [
      ...(isMultiSelect ? this.selectedNodesIds ?? [] : []),
      nodeFact.id,
    ];
    if (removeClicked)
      newSelected = newSelected.filter((x) => x != nodeFact.id);

    this.executeSelectNodeIds(newSelected);
  }

  getNodeIdsToDrag(draggedNodeId) {
    // When dragging one of the selected nodes,
    // all the selected nodes must be dragged
    if (this.selectedNodesIds && this.selectedNodesIds.has(draggedNodeId)) {
      return [...this.selectedNodesIds];
    } else {
      // Not selected node is always dragging alone
      return [draggedNodeId];
    }
  }
}
