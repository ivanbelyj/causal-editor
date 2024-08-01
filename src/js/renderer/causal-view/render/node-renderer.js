import * as d3 from "d3";
import * as d3dag from "d3-dag";
import { CausalModelUtils } from "../causal-model-utils.js";
import { DragAndDropManager } from "../drag-and-drop-manager.js";

const showDebugMessages = false;

const maxNodeTextLength = 22;

/**
 * Class responsible for rendering nodes in the causal view structure.
 */
export class NodeRenderer {
  nodeWidth;
  nodeHeight;

  dragAndDropManager;
  layout;
  nodesParent;
  graphManager;

  dagWidth;
  dagHeight;

  onNodeClicked;
  onMouseEnter;
  onMouseLeave;

  onEnterNodesSelection;

  constructor(
    nodesParent,
    graphManager,
    nodeWidth,
    nodeHeight,
    onNodeClicked,
    onMouseEnter,
    onMouseLeave,
    onEnterNodesSelection
  ) {
    this.nodesParent = nodesParent;
    this.graphManager = graphManager;
    this.nodeWidth = nodeWidth;
    this.nodeHeight = nodeHeight;

    this.onNodeClicked = onNodeClicked;
    this.onMouseEnter = onMouseEnter;
    this.onMouseLeave = onMouseLeave;

    this.onEnterNodesSelection = onEnterNodesSelection;

    this.#setLayout();
  }

  #setLayout() {
    this.layout = d3dag
      .sugiyama() // base layout
      .decross(d3dag.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => {
        return [(node ? 1.1 : 0) * this.nodeWidth, 3 * this.nodeHeight];
      });
  }

  reset() {
    this.#setDagWidthAndHeight();
  }

  #setDagWidthAndHeight() {
    const { width: dagWidth, height: dagHeight } = this.layout(
      this.graphManager.mutGraph
    );
    this.dagWidth = dagWidth;
    this.dagHeight = dagHeight;
  }

  renderNodes() {
    const nodes = this.graphManager.getNodes();

    // Set missing color fields
    const interp = d3.interpolateRainbow;
    for (const node of nodes) {
      if (!node.data.color) {
        const rndStep = Math.random() * nodes.length;
        node.data.color = interp(rndStep);
      }
    }

    const showLog = showDebugMessages;
    if (showLog) console.log("nodes");
    d3.select(".nodes-parent")
      .selectAll("g")
      .data(nodes, (node) => node.data.fact.id)
      .join(
        function (enter) {
          if (showLog) console.log("enter", Array.from(enter));
          const enterNodesSelection = enter
            .append("g")
            .attr("class", (d) => {
              return `node ${CausalModelUtils.getNodeIdClassNameByNodeId(
                d.data.fact.id
              )}`;
            })
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
            .on("click", this.onNodeClicked)
            .on("mouseenter", this.onMouseEnter)
            .on("mouseleave", this.onMouseLeave);

          enterNodesSelection
            .append("rect")
            .attr("width", this.nodeWidth)
            .attr("height", this.nodeHeight)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", (n) => n.data.color ?? "#aaa");

          enterNodesSelection.append("text");

          this.onEnterNodesSelection(enterNodesSelection);
        }.bind(this),
        function (update) {
          if (showLog) console.log("update", Array.from(update));
        }.bind(this),
        function (exit) {
          if (showLog) console.log("exit", Array.from(exit));
          exit.remove();
        }.bind(this)
      );
    this.updateNodes();
  }

  updateNodes() {
    this.updateNodeText(
      d3.select(".nodes-parent").selectAll("g").select("text"),
      (d) =>
        this.truncateTextWithEllipsis(
          d.data.title || d.data.fact.factValue || d.data.fact.id
        )
    );
  }

  // Todo: text truncating by width
  truncateTextWithEllipsis(str) {
    return str.length > maxNodeTextLength
      ? str.slice(0, maxNodeTextLength - 3) + "..."
      : str;
  }

  updateNodeText(textSelection, getText) {
    textSelection
      .text(getText)
      .attr("font-weight", "bold")
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr(
        "transform",
        `translate(${this.nodeWidth / 2}, ${this.nodeHeight / 2})`
      )
      .attr("fill", "var(--color)");
  }
}
