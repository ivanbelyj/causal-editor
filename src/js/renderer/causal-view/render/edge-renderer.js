import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";

/**
 * Class responsible for rendering edges in the causal view structure.
 */
export class EdgeRenderer {
  constructor(svgChild, edgesDefs) {
    this.svgChild = svgChild;
    this.edgesDefs = edgesDefs;
  }

  /**
   * Renders edges for the given graph links.
   * @param {Array} links - Array of graph links to render.
   */
  renderEdges(links) {
    const edgePathsSelection = d3
      .select(".edges-parent")
      .selectAll("path")
      .data(links, ({ source, target }) => {
        return CausalModelUtils.sourceAndTargetIdsToEdgeId(
          source.data.fact.id,
          target.data.fact.id
        );
      });

    edgePathsSelection.join(
      function (enter) {
        enter
          .append("path")
          .attr("class", "edge")
          .attr("fill", "none")
          .attr("stroke-width", 3)
          .attr("stroke", function ({ source, target }) {
            const gradId = CausalModelUtils.sourceAndTargetIdsToEdgeId(
              source.data.fact.id,
              target.data.fact.id
            );

            const grad = this.edgesDefs
              .append("linearGradient")
              .attr("id", gradId)
              .attr("gradientUnits", "userSpaceOnUse");
            grad
              .append("stop")
              .attr("offset", "0%")
              .attr("stop-color", source.data.color);
            grad
              .append("stop")
              .attr("offset", "100%")
              .attr("stop-color", target.data.color);
            return `url(#${gradId})`;
          })
          .attr("marker-end", "url(#arrowId)");
      }.bind(this),
      function (update) {},
      function (exit) {
        exit.remove();
      }
    );
  }

  /**
   * Updates existing edges based on the current state of the graph.
   * @param {Array} links - Array of graph links to update.
   */
  updateEdges(links) {
    const edgePathsSelection = d3.selectAll(".edge");
    edgePathsSelection.attr("d", (d) => {
      return this.line([
        { x: d.source.x + this.nodeWidth / 2, y: d.source.y + this.nodeHeight / 2 },
        { x: d.target.x + this.nodeWidth / 2, y: d.target.y + this.nodeHeight / 2 },
      ]);
    });

    edgePathsSelection.attr("stroke", ({ source, target }) => {
      const gradId = CausalModelUtils.sourceAndTargetIdsToEdgeId(
        source.data.fact.id,
        target.data.fact.id
      );
      d3.select(`#${gradId}`)
        .attr("x1", source.x)
        .attr("x2", target.x)
        .attr("y1", source.y)
        .attr("y2", target.y);
      return `url(#${gradId})`;
    });
  }
}
