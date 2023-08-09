import { CausalViewStructure } from "./causal-view-structure.js";
import * as d3 from "d3"; // "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const nodeSelectionStrokeWidth = 12;

export class CausalViewSelection {
  currentSelectedNodeId = null;
  _structure = null;

  constructor(structure) {
    this._structure = structure;
    // const selection = this;
    // structure.addEventListener("nodeClicked", (event) =>
    //   this.onNodeClicked(selection, event)
    // );
    structure.addEventListener("nodeClicked", this.onNodeClicked.bind(this));

    structure.addEventListener("zoomed", () => {
      d3.selectAll(".node__rect_selected").attr("stroke-width", () =>
        this.getSelectionStrokeWidthIgnoreZoom()
      );
    });
  }

  selectNode(nodeId) {
    const causalViewSelection = this;
    d3.select(CausalViewStructure.getNodeIdClassByNodeId(nodeId))
      .raise()
      .select("rect")
      .attr(
        "stroke-width",
        causalViewSelection.getSelectionStrokeWidthIgnoreZoom()
      )
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

  onNodeClicked(event) {
    const prevSelectedNodeId = this.currentSelectedNodeId;
    const nodeData = event.data.i.data;
    this.currentSelectedNodeId = nodeData["Id"];

    this.selectNode(this.currentSelectedNodeId);
    if (prevSelectedNodeId) this.deselectNode(prevSelectedNodeId);

    console.log("clicked node", nodeData);
  }
}
