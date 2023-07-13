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

  _nodesParent;

  nodeClicked = null;

  get causalModelNodes() {
    return this._causalModelNodes;
  }

  constructor(selector, causalModelNodes) {
    super();
    this.nodeClicked = new Event("nodeClicked");

    this._causalModelNodes = causalModelNodes;
    this.setDagAndImplementationEdgesSet(causalModelNodes);

    this._line = d3
      .line()
      .curve(d3.curveCatmullRom)
      .x((d) => d.x)
      .y((d) => d.y);

    const parentSelection = d3.select(selector);
    this.render(parentSelection);
  }

  updateNodeTitleAndValueById(nodeId, nodeTitle, nodeValue) {
    const index = this._causalModelNodes.findIndex(
      (node) => node.Id === nodeId
    );
    if (index !== -1) {
      this._causalModelNodes[index].NodeTitle = nodeTitle;
      this._causalModelNodes[index].NodeValue = nodeValue;

      d3.select(`.id-${nodeId}`)
        .select("text")
        .text((d) => nodeTitle);
    }
  }

  // Устанавливает dag на основе каузальной модели, а также
  // набор ребер-реализаций абстрактных фактов в виде строк
  setDagAndImplementationEdgesSet(causalModelNodes) {
    const implementationEdgesSet = new Set();
    const causalView = this;
    this._dag = d3
      .dagStratify()
      .id(({ Id: id }) => id)
      .parentIds((node) => {
        return causalView.getParents(node, implementationEdgesSet);
      })(causalModelNodes);
    this._implementationEdgesSet = implementationEdgesSet;
  }

  getParents(node, implementationEdgesSet) {
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

    // this.addDragAndScale(svgParentSelection, width, height);

    this._svgSelection.attr("viewBox", [0, 0, dagWidth, height].join(" "));
    const svgChild = this._svgSelection.append("g");
    // svgChild
    //   .append("rect")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .attr("fill", "white");
    this.addDragAndScale(this._svgSelection, svgChild, width, height);

    // Map colors to nodes
    const interp = d3.interpolateRainbow;
    this._nodeIdsAndColors = new Map();
    for (const node of this._dag.idescendants()) {
      const rndStep = Math.random() * this._dag.size();
      this._nodeIdsAndColors.set(node.data["Id"], interp(rndStep));
    }

    this.addEdges(svgChild);

    this._nodesParentSelection = svgChild.append("g").selectAll("g");
    this.addNodes(this._dag.descendants());

    // addArrows(svgChild);
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
      });

    nodesSelection
      .append("rect")
      .attr("width", this._nodeWidth)
      .attr("height", this._nodeHeight)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", (n) => this._nodeIdsAndColors.get(n.data["Id"]))
      .attr("stroke-width", 1.5);
    // .attr("stroke", "#888");

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
      d3.select(this)
        // .raise()
        .attr("cursor", "grabbing");
    }
    const causalView = this;
    function dragged(event, d) {
      d3.select(this)
        .attr(
          "transform",
          `translate(${(d.x += event.dx)}, ${(d.y += event.dy)})`
        )
        .raise();

      // Обновляем все ребра (пока что просадки по производительности не заметны)
      // d3.selectAll(".edge")
      //     .attr("d", (d) => {
      //         const l = line([{ x: d.source.x, y: d.source.y }, { x: d.target.x, y: d.target.y }]);
      //         return l;
      //     });
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
      });
  }

  addArrows(selection, colorMap) {
    const arrowSize = (this._nodeWidth * this._nodeWidth) / 5.0;
    const arrowLen = Math.sqrt((4 * arrowSize) / Math.sqrt(3));
    const arrow = d3.symbol().type(d3.symbolTriangle).size(arrowSize);
    selection
      .append("g")
      .selectAll("path")
      .data(this._dag.links())
      .enter()
      .append("path")
      .attr("d", arrow)
      .attr("transform", ({ source, target, points }) => {
        const [end, start] = points.slice().reverse();
        // This sets the arrows the node radius (20) + a little bit (3) away from the node center,
        // on the last line segment of the edge. This means that edges that only span ine level
        // will work perfectly, but if the edge bends, this will be a little off.
        const dx = start.x - end.x;
        const dy = start.y - end.y;
        const scale = (nodeWidth * 1.15) / Math.sqrt(dx * dx + dy * dy);
        // This is the angle of the last line segment
        const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI + 90;
        // console.log(angle, dx, dy);
        return `translate(${end.x + dx * scale}, ${
          end.y + dy * scale
        }) rotate(${angle})`;
      })
      .attr("fill", ({ target }) => colorMap[target.data["Id"]])
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", `${arrowLen},${arrowLen}`);
  }
  addDragAndScale(svgSelection, svgChildselection, width, height) {
    svgSelection.call(
      d3.zoom().on("zoom", function () {
        svgChildselection.attr("transform", (e) => d3.zoomTransform(this));
      })
    );

    // svgSelection
    //     .call(d3.drag()
    //         .on("start", dragStarted)
    //         .on("drag", dragged)
    //         .on("end", dragEnded))

    // selection.call(
    //   d3
    //     .zoom()
    //     .extent([
    //       [0, 0],
    //       [width, height],
    //     ])
    //     .scaleExtent([1, 8])
    //     .on("zoom", zoomed)
    // );

    // function dragStarted() {
    //   d3.select(this).raise();
    //   svgChildselection.attr("cursor", "grabbing");
    // }

    // function dragged(event, d) {
    //   d3.select(this)
    //     .attr("cx", (d.x = event.x))
    //     .attr("cy", (d.y = event.y));
    // }

    // function dragEnded() {
    //   svgChildselection.attr("cursor", "grab");
    // }

    // function zoomed({ transform }) {
    //   console.log("zoomed. transform: ", transform);
    //   svgChildselection.attr("transform", transform);
    // }
  }
}
