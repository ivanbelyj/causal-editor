import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";

/**
 * Class responsible for rendering nodes in the causal view structure.
 */
export class NodeRenderer {
  constructor(nodesParent, dragAndDropManager) {
    this.nodesParent = nodesParent;
    this.dragAndDropManager = dragAndDropManager;
  }

  /**
   * Renders nodes for the given graph data.
   * @param {Array} nodesData - Array of graph nodes data to render.
   */
  renderNodes(nodesData) {
    const nodes = nodesData.map(node => ({
      ...node,
      id: node.data.fact.id,
      color: node.data.color ?? "#aaa"
    }));

    const nodeGroups = this.nodesParent
      .selectAll("g")
      .data(nodes, d => d.id)
      .join(
        enter => this.createNodeGroups(enter),
        update => this.updateNodeGroups(update),
        exit => this.removeNodeGroups(exit)
      );

    this.dragAndDropManager.addNodesDrag(nodeGroups);
  }

  createNodeGroups(enter) {
    const nodeGroups = enter
      .append("g")
      .attr("class", d => `node ${CausalModelUtils.getNodeIdClassNameByNodeId(d.id)}`)
      .attr("transform", d => `translate(${d.x}, ${d.y})`);

    nodeGroups
      .append("rect")
      .attr("width", this.nodeWidth)
      .attr("height", this.nodeHeight)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", d => d.color);

    nodeGroups.append("text");
  }

  updateNodeGroups(update) {
    update.select("rect")
      .attr("fill", d => d.color);

    this.updateNodeText(update.select("text"), d => this.truncateTextWithEllipsis(d.data.title || d.data.fact.factValue || d.data.fact.id));
  }

  removeNodeGroups(exit) {
    exit.remove();
  }

  /**
   * Updates the text of the nodes.
   * @param {D3 Selection} textSelection - D3 selection of text elements.
   * @param {Function} getText - Function that returns the text for each node.
   */
  updateNodeText(textSelection, getText) {
    textSelection
      .text(getText)
      .attr("font-weight", "bold")
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("transform", `translate(${this.nodeWidth / 2}, ${this.nodeHeight / 2})`)
      .attr("fill", "var(--color)");
  }

  /**
   * Truncates the text with an ellipsis if it exceeds the maximum length.
   * @param {string} str - The string to truncate.
   * @returns {string} The truncated string.
   */
  truncateTextWithEllipsis(str) {
    return str.length > maxNodeTextLength ? `${str.slice(0, maxNodeTextLength - 3)}...` : str;
  }
}
