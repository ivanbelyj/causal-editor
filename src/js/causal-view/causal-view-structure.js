import * as d3 from "d3";
import * as d3dag from "d3-dag";
import { CausalModelUtils } from "./causal-model-utils.js";

// Displays interactive causal view elements and provides some of their common events
// (node click, enter, etc.)
export class CausalViewStructure extends EventTarget {
  // ===== Set in constructor / init =====
  showDebugMessages = true;

  nodeWidth = 140;
  nodeHeight = 40;

  // The line for rendering edges may be required at different stages
  line;

  svg;
  svgChild;

  // ===== Set on reset =====

  mutGraph; // MutGraph
  implementationEdgesSet; // Set of impl. edges is required for their special displaying

  init(svgParent, causalModelFacts) {
    this.line = d3
      .line()
      .curve(d3.curveCatmullRom)
      .x((d) => d.x)
      .y((d) => d.y);

    this.layout = d3dag
      .sugiyama() // base layout
      .decross(d3dag.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => [
        (node ? 1.3 : 0) * this.nodeWidth,
        3 * this.nodeHeight,
      ]);

    const width = parseFloat(svgParent.style("width"));
    const height = (this.svgParentInitialHeight = parseFloat(
      svgParent.style("height")
    ));

    this.svg = svgParent
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    const svgChild = this.svg
      .append("g")
      .attr("class", "causal-view__svg-child");
    this.svgChild = svgChild;

    this.addZoom(this.svg, svgChild, width, height);

    this.edgesParent = svgChild.append("g").attr("class", "edges-parent");
    this.nodesParent = svgChild.append("g").attr("class", "nodes-parent");
    this.edgesDefs = svgChild.append("defs");

    if (causalModelFacts) {
      this.reset(causalModelFacts);
    }
  }

  addZoom(svg, svgChild, width, height) {
    svg.call(
      d3.zoom().on(
        "zoom",
        function () {
          svgChild.attr("transform", () => d3.zoomTransform(this.svg.node()));
          this.dispatchEvent(new Event("zoomed"));
        }.bind(this)
      )
    );
  }

  reset(causalModelFacts) {
    this.setDag(causalModelFacts);

    const { width: dagWidth, height: dagHeight } = this.layout(this.mutGraph);
    this.svg.attr("viewBox", [0, 0, dagWidth, dagHeight].join(" "));

    this.nodesParent.html("");
    this.edgesParent.html("");
    this.edgesDefs.html("");

    this.render();
  }

  getNodes() {
    return Array.from(this.mutGraph.nodes());
  }

  getNodeById(nodeId) {
    return this.getNodes().find((node) => node.data.Id === nodeId);
  }

  // Устанавливает dag на основе каузальной модели, а также способ
  // получения набора ребер-реализаций абстрактных фактов в виде строк
  setDag(causalModelFacts) {
    this.implementationEdgesSet = new Set();
    const structure = this;
    this.mutGraph = d3dag
      .graphStratify()
      .id(({ Id: id }) => id)
      .parentIds((node) => {
        return structure.addNodeParentsToSet(
          node,
          structure.implementationEdgesSet
        );
      })(causalModelFacts);
  }

  // Причинно-следственные связи преобразуются в id-based parent data,
  // предназначенные для отображения
  addNodeParentsToSet(node, implementationEdgesSet) {
    const res = CausalModelUtils.findCauseIds(node["ProbabilityNest"]);
    const abstractFactId = node["AbstractFactId"];
    if (abstractFactId) {
      if (!res.includes(abstractFactId)) res.push(abstractFactId);
      implementationEdgesSet.add(
        CausalModelUtils.sourceAndTargetIdsToEdgeId(abstractFactId, node["Id"])
      );
    }
    return res;
  }

  addNode(causalModelFact, nodeData) {
    const newNode = this.mutGraph.node(causalModelFact);
    newNode.ux = nodeData.x;
    newNode.uy = nodeData.y;
    return newNode;
  }
  removeNode(nodeId) {
    const nodeToRemove = this.getNodes().find((x) => x.data.Id == nodeId);
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
        link.source.data.Id == sourceId && link.target.data.Id == targetId
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

    const showLog = this.showDebugMessages;
    if (showLog) console.log("nodes");
    d3.select(".nodes-parent")
      .selectAll("g")
      .data(nodes, (node) => node.data.Id)
      .join(
        function (enter) {
          if (showLog) console.log("enter", Array.from(enter));
          const enterNodesSelection = enter
            .append("g")
            .attr("class", (d) => {
              return `node id-${d.data.Id}`;
            })
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
            .on("click", (d, i) => {
              const nodeClickedEventData = new Event("nodeClicked");
              nodeClickedEventData.data = { d, i };
              this.dispatchEvent(nodeClickedEventData);
            })
            .on("mouseenter", (d, i) => {
              const nodeEnterEvent = new Event("nodeEnter");
              nodeEnterEvent.data = { d, i };
              this.dispatchEvent(nodeEnterEvent);
            })
            .on("mouseleave", (d, i) => {
              const nodeLeaveEvent = new Event("nodeLeave");
              nodeLeaveEvent.data = { d, i };
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

          this.appendNodesDrag(enterNodesSelection);
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
      (d) => d.data["Title"] || d.data["NodeValue"] || d.data["Id"]
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

  appendNodesDrag(nodesSelection) {
    nodesSelection
      .attr("cursor", "grab")
      .call(
        d3
          .drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

    function dragStarted() {
      d3.select(this).attr("cursor", "grabbing");
    }
    const causalView = this;
    function dragged(event, d) {
      d3.select(this)
        .attr(
          "transform",
          `translate(${(d.x += event.dx)}, ${(d.y += event.dy)})`
        )
        .raise();

      causalView.updateEdges();
    }

    function dragEnded() {
      nodesSelection.attr("cursor", "grab");
    }
  }

  renderEdges() {
    const edgePathsSelection = d3
      .select(".edges-parent")
      .selectAll("path")
      .data(this.mutGraph.links(), (d) =>
        CausalModelUtils.sourceAndTargetIdsToEdgeId(d.source.Id, d.target.Id)
      );

    // For edges gradients
    const edgesDefs = this.edgesDefs;

    const showLog = this.showDebugMessages;
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
              source.data["Id"],
              target.data["Id"]
            );
            const grad = edgesDefs
              .append("linearGradient")
              .attr("id", gradId)
              .attr("gradientUnits", "userSpaceOnUse");
            grad
              .append("stop")
              .attr("offset", "0%")
              .attr("stop-color", source.data.color ?? "#aaa");
            grad
              .append("stop")
              .attr("offset", "100%")
              .attr("stop-color", target.data.color ?? "#aaa");
            return `url(#${gradId})`;
            //
          })
          .attr("stroke-dasharray", ({ source, target }) => {
            const edgeId = CausalModelUtils.sourceAndTargetIdsToEdgeId(
              source.data["Id"],
              target.data["Id"]
            );
            const isEdgeImplementation =
              this.implementationEdgesSet.has(edgeId);
            return isEdgeImplementation ? "" : "5,5";
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
    edgePathsSelection.attr("d", (d) => {
      return this.line([
        { x: d.source.x + nodeWidth / 2, y: d.source.y + nodeHeight / 2 },
        { x: d.target.x + nodeWidth / 2, y: d.target.y + nodeHeight / 2 },
      ]);
    });

    // Gradients
    edgePathsSelection.attr("stroke", ({ source, target }) => {
      const gradId = CausalModelUtils.sourceAndTargetIdsToEdgeId(
        source.data["Id"],
        target.data["Id"]
      );
      d3.select(`#${gradId}`)
        .attr("x1", source.x)
        .attr("x2", target.x)
        .attr("y1", source.y)
        .attr("y2", target.y);
      return `url(#${gradId})`;
    });

    return edgePathsSelection;
  }
}
