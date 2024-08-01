import { CausalModelUtils } from "../causal-model-utils";
import { CausalView } from "../causal-view";
import * as d3 from "d3";

const nodeSelectionStrokeWidth = 4;
const defaultSelectionColor = "#F5AE00";

export class SelectionRenderer {
  constructor(causalView) {
    this._causalView = causalView;
  }

  initCausalViewSelectionZoom() {
    this._causalView.addEventListener("zoomed", () => {
      d3.selectAll(".node__rect_selected").attr("stroke-width", () =>
        this.getSelectionStrokeWidthIgnoreZoom()
      );
    });
  }

  setSelectedAppearance(nodeId, selectionColor) {
    selectionColor ??= defaultSelectionColor;
    CausalView.getNodeSelectionById(nodeId)
      .raise()
      .select("rect")
      .attr("stroke-width", this.getSelectionStrokeWidthIgnoreZoom())
      .attr("stroke", selectionColor)
      .classed("node__rect_selected", true);
  }

  setNotSelectedAppearance(nodeId) {
    d3.select(`.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`)
      .select("rect")
      .attr("stroke", "none")
      .classed("node__rect_selected", false);
  }

  getSelectionStrokeWidthIgnoreZoom() {
    return (
      nodeSelectionStrokeWidth /
      d3.zoomTransform(this._causalView.getViewNode()).k
    );
  }
}
