import { SelectionCommand } from "../undo-redo/commands/selection-command.js";
import { CausalModelUtils } from "./causal-model-utils.js";
import * as d3 from "d3"; // "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { CausalViewStructure } from "./causal-view-structure.js";

const nodeSelectionStrokeWidth = 4;

export class CausalViewSelectionManager extends EventTarget {
  selectedNodesIds = null;
  _structure = null;

  _isSelectByClick = true;
  get isSelectByClick() {
    return this._isSelectByClick;
  }
  set isSelectByClick(val) {
    this._isSelectByClick = val;
  }

  constructor(api, undoRedoManager) {
    super();
    this.undoRedoManager = undoRedoManager;
    this.api = api;
    this.api.onSelectAll(this.selectAll.bind(this));
  }

  selectAll() {
    this.executeSelectNodeIds(
      this._structure.getNodeFacts().map((fact) => fact.Id)
      // this._structure.getNodes().map((node) => node.data.fact.Id)
    );
  }

  init(structure) {
    this._structure = structure;

    structure.addEventListener("nodeClicked", this.onNodeClicked.bind(this));
    structure.addEventListener("viewClicked", this.onViewClicked.bind(this));

    structure.addEventListener("zoomed", () => {
      d3.selectAll(".node__rect_selected").attr("stroke-width", () =>
        this.getSelectionStrokeWidthIgnoreZoom()
      );
    });

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

  setSelectedAppearance(nodeId) {
    CausalViewStructure.getNodeSelectionById(nodeId)
      .raise()
      .select("rect")
      .attr("stroke-width", this.getSelectionStrokeWidthIgnoreZoom())
      .attr("stroke", "#F5AE00")
      .classed("node__rect_selected", true);
  }

  getSelectionStrokeWidthIgnoreZoom() {
    return (
      nodeSelectionStrokeWidth /
      d3.zoomTransform(this._structure.svgChild.node()).k
    );
  }

  setNotSelectedAppearance(nodeId) {
    d3.select(`.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`)
      .select("rect")
      .attr("stroke", "none")
      .classed("node__rect_selected", false);
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
      this.setSelectedAppearance(id);
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
        this.setNotSelectedAppearance(id);
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
    console.log("selection manager; nodeClicked, event", event);
    const clickEvent = event.clickEvent;
    event.clickEvent.stopPropagation();

    if (!this.isSelectByClick) return;

    const nodeFact = event.nodeSelection.data.fact;

    const isMultiSelect = clickEvent.ctrlKey || clickEvent.metaKey;
    const removeClicked =
      isMultiSelect && this.selectedNodesIds?.has(nodeFact["Id"]);
    let newSelected = [
      ...(isMultiSelect ? this.selectedNodesIds ?? [] : []),
      nodeFact["Id"],
    ];
    if (removeClicked)
      newSelected = newSelected.filter((x) => x != nodeFact["Id"]);

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
