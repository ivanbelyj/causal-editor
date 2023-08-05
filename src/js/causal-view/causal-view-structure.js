// import * as d3 from "../../../node_modules/d3/dist/d3.js";
// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7";
import * as d3 from "d3";

// import * as d3dag from "https://cdn.skypack.dev/d3-dag@1.0.0-1";
// import * as d3dag from "../../../node_modules/d3-dag/bundle/d3-dag.esm.min.js";
import * as d3dag from "d3-dag";

// Displays interactive causal view elements
export class CausalViewStructure extends EventTarget {
  // MutGraph
  _dag;

  // Set of implementation edges is required for their special rendering
  _implementationEdgesSet;

  _nodeWidth = 140;
  _nodeHeight = 40;

  // Линия для отображения ребер может потребоваться на разных этапах
  _line;
  _nodeIdsAndColors;

  svg;
  svgChild;

  _nodesParent;

  // События, вызываемые узлами, создаваемыми renderer-ом
  nodeClicked;
  nodeEnter;
  nodeLeave;
  zoomed;

  // get causalModelNodes() {
  //   return this._causalModelNodes;
  // }

  init(svgParent, causalModelFacts) {
    this.nodeClicked = new Event("nodeClicked");
    this.nodeEnter = new Event("nodeEnter");
    this.nodeLeave = new Event("nodeLeave");
    this.zoomed = new Event("zoomed");

    this.setDag(causalModelFacts);

    this._line = d3
      .line()
      .curve(d3.curveCatmullRom)
      .x((d) => d.x)
      .y((d) => d.y);

    const layout = d3dag
      .sugiyama() // base layout
      .decross(d3dag.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => [
        (node ? 1.3 : 0) * this._nodeWidth,
        3 * this._nodeHeight,
      ]);
    const { width: dagWidth, height: dagHeight } = layout(this._dag);

    const width = parseFloat(svgParent.style("width"));
    const height = parseFloat(svgParent.style("height"));

    this.svg = svgParent
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    this.svg.attr("viewBox", [0, 0, dagWidth, height].join(" "));
    const svgChild = this.svg.append("g");
    this.svgChild = svgChild;
    this.addZoom(this.svg, svgChild, width, height);

    this._nodesParent = svgChild.append("g").selectAll("g");

    this.render(causalModelFacts);
  }

  // Changes displaying text of node
  updateNodeTitleById(nodeId, nodeTitle) {
    d3.select(CausalViewStructure.getNodeIdClassByNodeId(nodeId))
      .select("text")
      .text((d) => nodeTitle);
    // const index = this._causalModelNodes.findIndex(
    //   (node) => node.Id === nodeId
    // );
    // if (index !== -1) {
    //   this._causalModelNodes[index].NodeTitle = nodeTitle;
    //   this._causalModelNodes[index].NodeValue = nodeValue;

    //   d3.select(CausalViewStructure.getNodeIdClassByNodeId(nodeId))
    //     .select("text")
    //     .text((d) => nodeTitle);
    // }
  }

  static getNodeIdClassByNodeId(nodeId) {
    return `.id-${nodeId}`;
  }

  // Устанавливает dag на основе каузальной модели, а также способ
  // получения набора ребер-реализаций абстрактных фактов в виде строк
  setDag(causalModelNodes) {
    this._implementationEdgesSet = new Set();
    const structure = this;
    this._dag = d3dag
      .graphStratify()
      .id(({ Id: id }) => id)
      .parentIds((node) => {
        return structure.addNodeParentsToSet(
          node,
          structure._implementationEdgesSet
        );
      })(causalModelNodes);
  }

  // Причинно-следственные связи преобразуются в id-based parent data,
  // предназначенные для отображения
  addNodeParentsToSet(node, implementationEdgesSet) {
    const res = this.findCauseIds(node["ProbabilityNest"]);
    const abstractFactId = node["AbstractFactId"];
    if (abstractFactId) {
      if (!res.includes(abstractFactId)) res.push(abstractFactId);
      implementationEdgesSet.add(
        this.sourceAndTargetIdsToEdgeId(abstractFactId, node["Id"])
      );
    }
    return res;
  }

  addNode(causalModelFact, nodeData) {
    const newNode = this._dag.node(causalModelFact);
    newNode.ux = nodeData.x;
    newNode.uy = nodeData.y;
  }
  removeNode(nodeId) {
    const nodeToRemove = Array.from(this._dag.nodes()).find(
      (x) => x.data.Id == nodeId
    );
    if (!nodeToRemove) {
      console.error("Node to remove is not found. ", nodeToRemove);
      return;
    }
    // console.log("before delete: ", this._dag.nnodes());
    nodeToRemove.delete();
    // console.log("after delete: ", this._dag.nnodes());
  }

  render() {
    const causalModelFacts = Array.from(this._dag.nodes()).map((x) => x.data);
    // this.setColorsForNodes(causalModelFacts); // this._dag.nodes());
    // console.log("_dag.nodes()", Array.from(this._dag.nodes()));
    this.renderNodes();
    this.renderEdges(this.svgChild);
  }

  addZoom(svg, svgChild, width, height) {
    const structure = this;
    svg.call(
      d3.zoom().on("zoom", function () {
        svgChild.attr("transform", () => d3.zoomTransform(this));
        structure.dispatchEvent(structure.zoomed);
      })
    );
  }

  // addArrows() {
  //   const arrow = d3
  //     .arrow1()
  //     .id("my-arrow")
  //     .attr("fill", "steelblue")
  //     .attr("stroke", "steelblue");
  //   this._svgSelection.call(arrow);
  //   this._svgSelection
  //     .append("polyline")
  //     .attr("marker-end", "url(#my-arrow)")
  //     .attr("points", [
  //       [5, 10],
  //       [55, 10],
  //     ])
  //     .attr("stroke", "steelblue")
  //     .attr("stroke-width", 2);
  // }

  findCauseIds(obj) {
    let edgeProps = new Set();
    for (let prop in obj) {
      if (prop === "Edge") {
        if (
          obj[prop].hasOwnProperty("CauseId") &&
          !edgeProps.has(obj[prop]["CauseId"])
        )
          edgeProps.add(obj[prop]["CauseId"]);
      }
      if (typeof obj[prop] === "object") {
        const nestedEdgeProps = this.findCauseIds(obj[prop]);
        // for (const nestedEdgeProp in nestedEdgeProps) {
        //   if (!edgeProps.has(nestedEdgeProp)) edgeProps.add(nestedEdgeProp);
        // }
        edgeProps = new Set(Array.from(edgeProps).concat(nestedEdgeProps));
      }
    }
    return [...edgeProps];
  }

  renderNodes() {
    const nodes = Array.from(this._dag.nodes());

    const nodesParent = this._nodesParent;

    // nodesParent.exit().remove();

    // Set missing color fields
    const interp = d3.interpolateRainbow;
    for (const node of nodes) {
      if (!node.data.color) {
        const rndStep = Math.random() * nodes.length;
        node.data.color = interp(rndStep);
      }
    }

    nodesParent.data(nodes).join(
      function (enter) {
        const nodesSelection = enter
          .append("g")
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
          .attr("class", (d) => {
            return `node id-${d.data.Id}`;
          })
          .on("click", (d, i) => {
            this.nodeClicked.data = { d, i };
            this.dispatchEvent(this.nodeClicked);
          })
          .on("mouseenter", (d, i) => {
            this.nodeEnter.data = { d, i };
            this.dispatchEvent(this.nodeEnter);
          })
          .on("mouseleave", (d, i) => {
            this.nodeLeave.data = { d, i };
            this.dispatchEvent(this.nodeLeave);
          });

        nodesSelection
          .append("rect")
          .attr("width", this._nodeWidth)
          .attr("height", this._nodeHeight)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("fill", (n) => n.data.color ?? "#aaa");

        this.addText(
          nodesSelection,
          (d) => d.data["Title"] || d.data["NodeValue"] || d.data["Id"]
        );

        this.addNodesDrag(nodesSelection);
      }.bind(this)
    );
  }

  addText(selection, getText) {
    selection
      .append("text")
      .text(getText)
      .attr("font-weight", "bold")
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr(
        "transform",
        `translate(${this._nodeWidth / 2}, ${this._nodeHeight / 2})`
      )
      // .attr("dominant-baseline", "hanging")
      .attr("fill", "white");
  }

  // Делает узлы, переданные в выборке, перетаскиваемыми. line требуется для обновления линий svg
  // (совпадает с line, использованным при отображении графа до перетаскиваний)
  addNodesDrag(nodesSelection) {
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

      causalView.updateEdges(d3.selectAll(".edge"));
    }

    function dragEnded() {
      nodesSelection.attr("cursor", "grab");
    }
  }

  updateEdges(edgePathsSelection) {
    const nodeWidth = this._nodeWidth;
    const nodeHeight = this._nodeHeight;
    return edgePathsSelection.attr("d", (d) => {
      return this._line([
        { x: d.source.x + nodeWidth / 2, y: d.source.y + nodeHeight / 2 },
        { x: d.target.x + nodeWidth / 2, y: d.target.y + nodeHeight / 2 },
      ]);
    });
  }

  // Ребра идентифицируются по id источника и цели
  sourceAndTargetIdsToEdgeId(source, target) {
    return `id-${source}--${target}`;
  }

  initEdges() {}

  _edgesParent;
  _edgesDefs;
  renderEdges() {
    let defs = this._edgesDefs;
    if (!this._edgesDefs) {
      defs = this._edgesDefs = this.svgChild.append("defs"); // For gradients
    }

    if (!this._edgesParent) {
      this._edgesParent = this.svgChild.append("g");
    }
    const edgePathSelection = this._edgesParent
      .selectAll("path")
      .data(this._dag.links())
      .enter()
      .append("path")
      .attr("class", "edge");

    this.updateEdges(edgePathSelection);
    edgePathSelection
      .attr("fill", "none")
      .attr("stroke-width", 3)
      .attr("stroke", ({ source, target }) => {
        // encodeURIComponents for spaces, hope id doesn't have a `--` in it
        const gradId = encodeURIComponent(
          `${source.data["Id"]}--${target.data["Id"]}`
        );
        const grad = defs
          .append("linearGradient")
          .attr("id", gradId)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", source.x)
          .attr("x2", target.x)
          .attr("y1", source.y)
          .attr("y2", target.y);
        grad
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", source.data.color ?? "#aaa");
        grad
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", target.data.color ?? "#aaa");
        return `url(#${gradId})`;
      })
      .attr("stroke-dasharray", ({ source, target }) => {
        const edgeId = this.sourceAndTargetIdsToEdgeId(
          source.data["Id"],
          target.data["Id"]
        );
        const isEdgeImplementation = this._implementationEdgesSet.has(edgeId);
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
      .attr("fill", "#222");
  }

  // addArrows(selection, colorMap) {
  //   const arrowSize = (this._nodeWidth * this._nodeWidth) / 50.0;
  //   const arrowLen = Math.sqrt((4 * arrowSize) / Math.sqrt(3));
  //   const arrow = d3.symbol().type(d3.symbolTriangle).size(arrowSize);
  //   selection
  //     .append("g")
  //     .selectAll("path")
  //     .data(this._dag.links())
  //     .enter()
  //     .append("path")
  //     .attr("d", arrow)
  //     .attr("transform", ({ source, target, points }) => {
  //       const [end, start] = points.slice().reverse();
  //       // This sets the arrows the node radius (20) + a little bit (3) away from the node center,
  //       // on the last line segment of the edge. This means that edges that only span ine level
  //       // will work perfectly, but if the edge bends, this will be a little off.
  //       const dx = start.x - end.x;
  //       const dy = start.y - end.y;
  //       const scale = (this._nodeWidth * 1.15) / Math.sqrt(dx * dx + dy * dy);
  //       // This is the angle of the last line segment
  //       const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI + 90;
  //       // console.log(angle, dx, dy);
  //       return `translate(${end.x + dx * scale}, ${
  //         end.y + dy * scale
  //       }) rotate(${angle})`;
  //     })
  //     .attr("fill", ({ target }) => colorMap[target.data["Id"]])
  //     .attr("stroke", "white")
  //     .attr("stroke-width", 1.5)
  //     .attr("stroke-dasharray", `${arrowLen},${arrowLen}`);
  // }
}
