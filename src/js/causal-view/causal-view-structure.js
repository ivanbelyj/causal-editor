import * as d3 from "d3";
import * as d3dag from "d3-dag";
import { CausalModelUtils } from "./causal-model-utils.js";
import { DragAndDropManager } from "./drag-and-drop-manager.js";

const showDebugMessages = false;
// Displays interactive causal view elements and provides some of their common events
// (node click, enter, etc.)
export class CausalViewStructure extends EventTarget {
  // ===== Set in constructor / init =====

  // Default width and height
  nodeWidth = 140;
  nodeHeight = 40;

  stratify;

  line; // A line for rendering edges

  svg;
  svgChild;

  // ===== Set on reset =====

  mutGraph; // MutGraph

  // Todo: handle when causal view component is hidden

  constructor(undoRedoManager) {
    super();
    this.undoRedoManager = undoRedoManager;
  }

  init(svgParent, nodesData, selectionManager) {
    this.selectionManager = selectionManager;

    this.line = d3
      .line()
      .curve(d3.curveCatmullRom)
      .x((d) => d.x)
      .y((d) => d.y);

    this.layout = d3dag
      .sugiyama() // base layout
      .decross(d3dag.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => {
        return [(node ? 1.3 : 0) * this.nodeWidth, 3 * this.nodeHeight];
      });

    this.svg = svgParent
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .on(
        "click",
        function (event, svgSelection) {
          const viewClickedEvent = new Event("viewClicked");
          viewClickedEvent.clickEvent = event;
          viewClickedEvent.svgSelection = svgSelection;
          this.dispatchEvent(viewClickedEvent);
        }.bind(this)
      );

    const svgChild = this.svg
      .append("g")
      .classed("causal-view__svg-child", true);

    this.svgChild = svgChild;

    this.addZoom();

    this.edgesParent = svgChild.append("g").attr("class", "edges-parent");
    this.nodesParent = svgChild.append("g").attr("class", "nodes-parent");
    this.edgesDefs = svgChild.append("defs");

    this.stratify = d3dag
      .graphStratify()
      .id(({ fact }) => fact.Id)
      .parentIds(
        function ({ fact }) {
          return CausalModelUtils.getCausesIdsUnique(fact);
        }.bind(this)
      );

    if (nodesData) {
      this.reset(nodesData);
    }
  }

  setInitialZoom() {
    // Calculate initial scale factor
    const isNotEmpty = this.dagWidth > 0;

    const scaleFactor = isNotEmpty
      ? Math.min(
          this.svg.node().clientWidth / this.dagWidth,
          this.svg.node().clientHeight / this.dagHeight
        )
      : null;

    // Calculate translation coordinates
    const translateX =
      (this.svg.node().clientWidth - this.dagWidth * scaleFactor) / 2;
    const translateY =
      (this.svg.node().clientHeight - this.dagHeight * scaleFactor) / 2;

    // Apply initial zoom and center the graph
    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform,
        isNotEmpty
          ? d3.zoomIdentity.translate(translateX, translateY).scale(scaleFactor)
          : d3.zoomIdentity
      );
  }

  addZoom() {
    this.zoom = d3.zoom().on(
      "zoom",
      function () {
        this.svgChild.attr("transform", () =>
          d3.zoomTransform(this.svg.node())
        );
        this.dispatchEvent(new Event("zoomed"));
      }.bind(this)
    );
    this.svg.call(this.zoom);
  }

  reset(nodesData) {
    if (!nodesData) {
      nodesData = this.getNodesData();
      if (!nodesData) {
        console.error(
          "Cannot reset empty causa-view-structure with",
          nodesData
        );
      }
    }
    this.resetGraph(nodesData);

    const { width: dagWidth, height: dagHeight } = this.layout(this.mutGraph);
    this.dagWidth = dagWidth;
    this.dagHeight = dagHeight;
    // this.svg.attr("viewBox", [0, 0, dagWidth, dagHeight].join(" "));

    this.nodesParent.html("");
    this.edgesParent.html("");
    this.edgesDefs.html("");

    this.render();
  }

  // Todo: scale extent
  updateScaleExtent() {
    const defaultMinScale = 0.5;
    this.zoom.scaleExtent([
      this.dagWidth > 0
        ? Math.min(
            this.svg.node().clientWidth / this.dagWidth / 2,
            defaultMinScale
          )
        : defaultMinScale,
      2,
      // Math.max(
      //   this.svg.node().clientWidth / this.nodeWidth,
      //   this.svg.node().clientHeight / this.nodeHeight
      // ),
    ]); // Zoom limits
  }

  getNodes() {
    return Array.from(this.mutGraph.nodes());
  }

  getNodesData() {
    return this.getNodes().map((node) => node.data);
  }

  getNodeFacts() {
    return this.getNodes().map((node) => node.data.fact);
  }

  getNodeById(nodeId) {
    return this.getNodes().find((node) => node.data.fact.Id === nodeId);
  }

  getNodeDataById(nodeId) {
    return this.getNodeById(nodeId).data;
  }

  static getNodeSelectionById(nodeId) {
    return d3.select(`.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`);
  }

  // Sets directed acyclic graph by causal model facts
  resetGraph(nodesData) {
    this.mutGraph = this.stratify(nodesData);
  }

  addNodeWithData(nodeData) {
    const newNode = this.mutGraph.node(nodeData);

    newNode.ux = nodeData.x;
    newNode.uy = nodeData.y;
    return newNode;
  }

  removeNode(nodeId) {
    const nodeToRemove = this.getNodeById(nodeId);
    if (!nodeToRemove) {
      console.error("Node to remove is not found. ", nodeToRemove);
      return;
    }
    nodeToRemove.delete();
  }

  addLink(sourceId, targetId) {
    const [source, target] = [sourceId, targetId].map(this.getNodeById, this);

    this.mutGraph.link(source, target);
  }

  getLinkBySourceAndTargetIds(sourceId, targetId) {
    return Array.from(this.mutGraph.links()).find(
      (link) =>
        link.source.data.fact.Id === sourceId &&
        link.target.data.fact.Id === targetId
    );
  }

  removeLink(sourceId, targetId) {
    this.getLinkBySourceAndTargetIds(sourceId, targetId).delete();
  }

  render() {
    this.renderNodes();
    this.renderEdges();
  }

  renderNodes() {
    const nodes = this.getNodes();

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
      .data(nodes, (node) => node.data.fact.Id)
      .join(
        function (enter) {
          if (showLog) console.log("enter", Array.from(enter));
          const enterNodesSelection = enter
            .append("g")
            .attr("class", (d) => {
              return `node ${CausalModelUtils.getNodeIdClassNameByNodeId(
                d.data.fact.Id
              )}`;
            })
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
            .on("click", (event, nodeSelection) => {
              const nodeClickedEvent = new Event("nodeClicked");
              nodeClickedEvent.nodeSelection = nodeSelection;
              nodeClickedEvent.clickEvent = event;
              this.dispatchEvent(nodeClickedEvent);
            })
            .on("mouseenter", (event, nodeSelection) => {
              const nodeEnterEvent = new Event("nodeEnter");
              nodeEnterEvent.enterEvent = event;
              nodeEnterEvent.nodeSelection = nodeSelection;
              this.dispatchEvent(nodeEnterEvent);
            })
            .on("mouseleave", (event, nodeSelection) => {
              const nodeLeaveEvent = new Event("nodeLeave");
              nodeLeaveEvent.enterEvent = event;
              nodeLeaveEvent.nodeSelection = nodeSelection;
              this.dispatchEvent(nodeLeaveEvent);
            });

          enterNodesSelection
            .append("rect")
            .attr("width", this.nodeWidth)
            .attr("height", this.nodeHeight)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", (n) => n.data.color ?? "#aaa");

          enterNodesSelection.append("text");

          this.dragAndDropManager = new DragAndDropManager(
            this,
            this.undoRedoManager,
            this.selectionManager
          );
          this.dragAndDropManager.addNodesDrag(enterNodesSelection);
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
      (d) => d.data["Title"] || d.data.fact["NodeValue"] || d.data.fact["Id"]
    );
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

  edgeDataToString(d) {
    return `edge (${d.source.data.fact.NodeValue}, ${d.target.data.fact.NodeValue})`;
  }

  printEdge(d) {
    console.log(this.edgeDataToString(d));
  }

  // Todo: show probabilities
  renderEdges() {
    if (showDebugMessages)
      console.log(
        "render edges. links",
        [...this.mutGraph.links()].map((d) => this.edgeDataToString(d), this)
      );
    const edgePathsSelection = d3
      .select(".edges-parent")
      .selectAll("path")
      .data(this.mutGraph.links(), ({ source, target }) => {
        return CausalModelUtils.sourceAndTargetIdsToEdgeId(
          source.data.fact.Id,
          target.data.fact.Id
        );
      });

    // For edges gradients
    const edgesDefs = this.edgesDefs;

    const edgeDataToString = this.edgeDataToString;

    const showLog = showDebugMessages;
    if (showLog) console.log("edges");
    edgePathsSelection.join(
      function (enter) {
        if (showLog) console.log("enter", Array.from(enter));
        enter
          .append("path")
          .attr("class", "edge")
          .attr("fill", "none")
          .attr("stroke-width", 3)
          .attr("stroke", function ({ source, target }) {
            // Edges gradients
            const gradId = CausalModelUtils.sourceAndTargetIdsToEdgeId(
              source.data.fact["Id"],
              target.data.fact["Id"]
            );

            const grad = edgesDefs
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

        // Add arrows
        this.svgChild
          .selectAll("marker")
          .data(["end"]) // Different link / path types can be defined here
          .enter()
          .append("svg:marker") // This section adds in the arrows
          .attr("id", "arrowId")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 25)
          .attr("refY", 0)
          .attr("markerWidth", 4)
          .attr("markerHeight", 4)
          .attr("orient", "auto")
          .append("svg:path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", "var(--color)");
      }.bind(this),
      function (update) {
        if (showLog) console.log("update", Array.from(update));
      }.bind(this),
      function (exit) {
        if (showLog) console.log("exit", Array.from(exit));
        exit.remove();
      }
    );
    this.updateEdges();
  }

  updateEdges() {
    const nodeWidth = this.nodeWidth;
    const nodeHeight = this.nodeHeight;

    const edgePathsSelection = d3.selectAll(".edge");
    edgePathsSelection.attr("stroke-dasharray", ({ source, target }) => {
      const factSrc = source.data.fact;
      const factTarget = target.data.fact;

      return factTarget.AbstractFactId &&
        factTarget.AbstractFactId == factSrc.Id
        ? ""
        : "5,5";
    });
    // d3.select(".edges-parent").selectAll("path");
    edgePathsSelection.attr("d", (d) => {
      return this.line([
        { x: d.source.x + nodeWidth / 2, y: d.source.y + nodeHeight / 2 },
        { x: d.target.x + nodeWidth / 2, y: d.target.y + nodeHeight / 2 },
      ]);
    });

    // Gradients
    edgePathsSelection.attr("stroke", ({ source, target }) => {
      // this.printEdge({ source, target });
      const gradId = CausalModelUtils.sourceAndTargetIdsToEdgeId(
        source.data.fact.Id,
        target.data.fact.Id
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
