import { CausalModelUtils } from "../causal-model-utils";
import { CausalView } from "../causal-view";
import * as d3 from "d3";
import { NodeRenderer } from "../render/node-renderer";

const nodeSelectionStrokeWidth = 4;
const defaultSelectionColor = "#F5AE00";

export class SelectionRenderer {
  constructor(causalView, nodeAppearanceProvider) {
    this._causalView = causalView;
    this.nodeAppearanceProvider = nodeAppearanceProvider;
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
      .attr("stroke", selectionColor)
      .attr("stroke-width", this.getSelectionStrokeWidthIgnoreZoom())
      .classed("node__rect_selected", true);
  }

  setNotSelectedAppearance(nodeId) {
    d3.select(`.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`)
      .select("rect")
      .classed("node__rect_selected", false)

      .each(function (n) {
        var nodeRect = d3.select(this);

        NodeRenderer.applyNodeStrokeAndFill(n, nodeRect)
      });
  }

  getSelectionStrokeWidthIgnoreZoom() {
    return (
      nodeSelectionStrokeWidth /
      d3.zoomTransform(this._causalView.getViewNode()).k
    );
  }
}
