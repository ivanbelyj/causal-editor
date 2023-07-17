const nodeSelectionStrokeWidth = 12;

export class CausalView extends EventTarget {
  _causalModelNodes = null;
  _dag = null;

  // Список id ребер-реализаций требуется для их особого отображения
  _implementationEdgesSet = null;

  _nodeWidth = 140;
  _nodeHeight = 40;

  // Линия для отображения ребер может потребоваться на разных этапах
  _line = null;
  _nodeIdsAndColors = null;

  _svgSelection = null;
  _svgChild = null;

  _nodesParent;

  nodeClicked = null;
  nodeEnter = null;
  nodeLeave = null;

  get causalModelNodes() {
    return this._causalModelNodes;
  }

  constructor(causalModelNodes) {
    super();
    this.nodeClicked = new Event("nodeClicked");
    this.nodeEnter = new Event("nodeEnter");
    this.nodeLeave = new Event("nodeLeave");

    this._causalModelNodes = causalModelNodes;
    this.setDag(causalModelNodes);

    this._line = d3
      .line()
      .curve(d3.curveCatmullRom)
      .x((d) => d.x)
      .y((d) => d.y);
  }

  updateNodeTitleAndValueById(nodeId, nodeTitle, nodeValue) {
    const index = this._causalModelNodes.findIndex(
      (node) => node.Id === nodeId
    );
    if (index !== -1) {
      this._causalModelNodes[index].NodeTitle = nodeTitle;
      this._causalModelNodes[index].NodeValue = nodeValue;

      d3.select(CausalView.getNodeIdClassByNodeId(nodeId))
        .select("text")
        .text((d) => nodeTitle);
    }
  }

  selectNode(nodeId) {
    const causalView = this;
    d3.select(CausalView.getNodeIdClassByNodeId(nodeId))
      .raise()
      .select("rect")
      .attr("stroke-width", causalView.getSelectionStrokeWidthIgnoreZoom())
      .attr("stroke", "#F5AE00")
      .classed("node__rect_selected", true);
  }

  getSelectionStrokeWidthIgnoreZoom() {
    return nodeSelectionStrokeWidth / d3.zoomTransform(this._svgChild.node()).k;
  }

  deselectNode(nodeId) {
    d3.select(CausalView.getNodeIdClassByNodeId(nodeId))
      .select("rect")
      .attr("stroke", "none")
      .classed("node__rect_selected", false);
  }

  // selectNode(nodeId) {
  //   this.setNodeSelected(nodeId, true);
  // }

  // deselectNode(nodeId) {
  //   this.setNodeSelected(nodeId, false);
  // }

  // setNodeSelected(nodeId, val) {
  //   d3.select(CausalView.getNodeIdClassByNodeId(nodeId))
  //     .select("rect")
  //     .classed("node__rect_selected", val);
  // }

  static getNodeIdClassByNodeId(nodeId) {
    return `.id-${nodeId}`;
  }

  // Устанавливает dag на основе каузальной модели, а также способ
  // получения набора ребер-реализаций абстрактных фактов в виде строк
  setDag(causalModelNodes) {
    this._implementationEdgesSet = new Set();
    const causalView = this;
    this._dag = d3
      .dagStratify()
      .id(({ Id: id }) => id)
      .parentIds((node) => {
        return causalView.addNodeParents(
          node,
          causalView._implementationEdgesSet
        );
      })(causalModelNodes);
  }

  addNodeParents(node, implementationEdgesSet) {
    // Причинно-следственные связи преобразуются в id-based parent data,
    // предназначенные для отображения
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

  render(svgParentSelection) {
    const layout = d3
      .sugiyama() // base layout
      .decross(d3.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => [
        (node ? 1.3 : 0) * this._nodeWidth,
        3 * this._nodeHeight,
      ]);
    const { width: dagWidth, height: dagHeight } = layout(this._dag);

    const width = parseFloat(svgParentSelection.style("width"));
    const height = parseFloat(svgParentSelection.style("height"));

    // Rendering
    this._svgSelection = svgParentSelection
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    this._svgSelection.attr("viewBox", [0, 0, dagWidth, height].join(" "));
    const svgChild = this._svgSelection.append("g");
    this._svgChild = svgChild;
    this.addZoom(this._svgSelection, svgChild, width, height);

    this._nodesParentSelection = svgChild.append("g").selectAll("g");

    this.setColorsForNodes();
    console.log("descendants", this._dag.descendants());
    this.addNodes(this._dag.descendants());

    this.addEdges(svgChild);
  }

  setColorsForNodes() {
    // Map colors to nodes
    const interp = d3.interpolateRainbow;
    if (!this._nodeIdsAndColors) this._nodeIdsAndColors = new Map();
    console.log("this._dag.idescendants()", this._dag.idescendants());
    for (const node of this._dag.idescendants()) {
      const rndStep = Math.random() * this._dag.size();
      this._nodeIdsAndColors.set(node.data["Id"], interp(rndStep));
    }
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

  addZoom(svgSelection, svgChildselection, width, height) {
    const causalView = this;
    svgSelection.call(
      d3.zoom().on("zoom", function () {
        svgChildselection.attr("transform", () => d3.zoomTransform(this));
        d3.selectAll(".node__rect_selected").attr("stroke-width", () =>
          causalView.getSelectionStrokeWidthIgnoreZoom()
        );
      })
    );
  }

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

  addNodes(data) {
    console.log("nodes data", data);

    const nodesSelection = this._nodesParentSelection
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${(d.x = d.x)}, ${(d.y = d.y)})`)
      .attr("cursor", "grab")
      .attr("class", (d) => {
        return `node id-${d.data.Id}`;
      })
      .on("click", (d, i) => {
        this.nodeClicked.data = { d, i };
        this.dispatchEvent(this.nodeClicked);
      })
      .on("mouseenter", (d, i) => {
        this.nodeClicked.data = { d, i };
        this.dispatchEvent(this.nodeEnter);
      })
      .on("mouseleave", (d, i) => {
        this.nodeClicked.data = { d, i };
        this.dispatchEvent(this.nodeLeave);
      });

    nodesSelection
      .append("rect")
      .attr("width", this._nodeWidth)
      .attr("height", this._nodeHeight)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", (n) => this._nodeIdsAndColors.get(n.data["Id"]) ?? "#eee");

    this.addText(
      nodesSelection,
      (d) => d.data["Title"] || d.data["NodeValue"] || d.data["Id"]
    );
    // addText(nodes, "test string for node");

    this.addNodesDrag(nodesSelection);
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
    nodesSelection.call(
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

  // Updates all edges in causal view
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

  addEdges(selection) {
    const defs = selection.append("defs"); // For gradients

    const edgePathSelection = selection
      .append("g")
      .selectAll("path")
      .data(this._dag.links())
      .enter()
      .append("path")
      .attr("class", "edge");

    this.updateEdges(edgePathSelection)
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
          .attr("stop-color", this._nodeIdsAndColors.get(source.data["Id"]));
        grad
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", this._nodeIdsAndColors.get(target.data["Id"]));
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
    this._svgChild
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
