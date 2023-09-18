import { Command } from "../undo-redo/command.js";
import { CausalModelUtils } from "./causal-model-utils.js";
import * as d3 from "d3"; // "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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
      this._structure.getNodes().map((node) => node.data.Id)
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
    const res = new Command(
      this.setSelectedNodeIds.bind(this, nodeIds),
      this.setSelectedNodeIds.bind(this, prevSelected),

      // Merge only if the old selection is a subset
      CausalViewSelectionManager.shouldMerge(prevSelected, nodeIds)
        ? "select"
        : null
    );
    return res;
  }

  static shouldMerge(oldSelection, newSelection) {
    const res = CausalViewSelectionManager.isSubsetOrEqual(
      newSelection,
      oldSelection
    );
    // console.log(
    //   "should merge: ",
    //   res,
    //   ". ",
    //   oldSelection,
    //   "is",
    //   res ? "" : "not",
    //   "subset or equal of ",
    //   newSelection
    // );
    return res;
  }

  static isSubsetOrEqual(superset, subset) {
    return subset.every((x) => superset.includes(x));
  }

  reset() {
    this.selectedNodesIds = null;
    this.isSelectByClick = true;
  }

  setSelectedAppearance(nodeId) {
    d3.select(`.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`)
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
    event.data = {
      node: ids.length == 1 ? this._structure.getNodeById(ids[0]) : null,
    };
    this.dispatchEvent(event);
  }

  onViewClicked(event) {
    if (!this.isSelectByClick) return;
    this.executeSelectNodeIds([]);
    // this.setSelectedNodeIds([]);
  }

  executeSelectNodeIds(nodeIds) {
    this.undoRedoManager.execute(this.getSelectNodesCommand(nodeIds));
  }

  onNodeClicked(event) {
    if (!this.isSelectByClick) return;

    const nodeData = event.data.i.data;
    const eventData = event.data.d;

    console.log("node clicked!", nodeData["Id"]);
    if (this.selectedNodesIds)
      console.log("selected ids", [...this.selectedNodesIds]);

    const isMultiSelect = eventData.ctrlKey || eventData.metaKey;
    const removeClicked =
      isMultiSelect && this.selectedNodesIds?.has(nodeData["Id"]);
    let newSelected = [
      ...(isMultiSelect ? this.selectedNodesIds ?? [] : []),
      nodeData["Id"],
    ];
    if (removeClicked)
      newSelected = newSelected.filter((x) => x != nodeData["Id"]);

    this.executeSelectNodeIds(newSelected);

    eventData.stopPropagation();
  }

  getNodesIdsToDrag(draggedNodeId) {
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
