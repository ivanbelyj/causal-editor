import { CausalViewStructure } from "./causal-view-structure.js";

const nodeSelectionStrokeWidth = 12;

export class CausalViewSelection {
  currentSelectedNodeId = null;
  _structure = null;

  constructor(structure) {
    this._structure = structure;
    const selection = this;
    structure.addEventListener("nodeClicked", (event) =>
      this.onNodeClicked(selection, event)
    );

    structure.addEventListener("zoomed", () => {
      d3.selectAll(".node__rect_selected").attr("stroke-width", () =>
        this.getSelectionStrokeWidthIgnoreZoom()
      );
    });
  }

  selectNode(nodeId) {
    const selection = this;
    d3.select(CausalViewStructure.getNodeIdClassByNodeId(nodeId))
      .raise()
      .select("rect")
      .attr("stroke-width", selection.getSelectionStrokeWidthIgnoreZoom())
      .attr("stroke", "#F5AE00")
      .classed("node__rect_selected", true);
  }

  getSelectionStrokeWidthIgnoreZoom() {
    return (
      nodeSelectionStrokeWidth /
      d3.zoomTransform(this._structure.svgChild.node()).k
    );
  }

  deselectNode(nodeId) {
    d3.select(CausalViewStructure.getNodeIdClassByNodeId(nodeId))
      .select("rect")
      .attr("stroke", "none")
      .classed("node__rect_selected", false);
  }

  onNodeClicked(selection, event) {
    const prevSelectedNodeId = selection.currentSelectedNodeId;
    const nodeData = event.data.i.data;
    selection.currentSelectedNodeId = nodeData["Id"];

    selection.selectNode(selection.currentSelectedNodeId);
    if (prevSelectedNodeId) selection.deselectNode(prevSelectedNodeId);
  }
}
