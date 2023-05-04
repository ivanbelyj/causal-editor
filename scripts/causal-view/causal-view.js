export class CausalView {
  constructor(selector, causalModelNodes) {
    this.causalModelNodes = causalModelNodes;
    const { dag, implementationEdgesSet } =
      this.getDagAndImplementationEdgesSet(causalModelNodes);
    const parentSelection = d3.select(selector);
    this.renderCausalView(parentSelection, dag, implementationEdgesSet);
  }
  updateNodeById(nodeToSet) {
    this.causalModelNodes.map((node) =>
      node.Id === nodeToSet.Id ? node : nodeToSet
    );
    // Todo:
    // Обновить ребра-причины (абстрактные или вероятностные)
    d3.select(`.${nodeToSet.Id}`)
      .select("text")
      .text((d) => d.data.NodeValue);
  }

  // Создает dag на основе каузальной модели, а также
  // набор ребер-реализаций абстрактных фактов в виде строк
  getDagAndImplementationEdgesSet(causalModelNodes) {
    const implementationEdgesSet = new Set();
    const dag = d3
      .dagStratify()
      .id(({ Id: id }) => id)
      // Получаем
      .parentIds((node) => {
        // Причинно-следственные связи преобразуются в id-based parent data,
        // предназначенные для отображения
        const res = this.findCauseIds(node["ProbabilityNest"]);
        const abstractFactId = node["AbstractFactId"];
        if (abstractFactId) {
          res.push(abstractFactId);
          implementationEdgesSet.add(
            this.sourceAndTargetIdsToEdgeId(abstractFactId, node["Id"])
          );
        }
        return res;
      })(causalModelNodes);
    return { dag, implementationEdgesSet };
  }

  // Список id ребер-реализаций требуется для особого отображения
  renderCausalView(svgParentSelection, dag, implementationEdges) {
    // const nodeRadius = 20;
    const nodeWidth = 140;
    const nodeHeight = 40;
    const layout = d3
      .sugiyama() // base layout
      .decross(d3.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => [(node ? 1.3 : 0) * nodeWidth, 3 * nodeHeight]);
    const { width: dagWidth, height: dagHeight } = layout(dag);

    const width = parseFloat(svgParentSelection.style("width"));
    const height = parseFloat(svgParentSelection.style("height"));
    console.log("width: ", width, "height: ", height);

    // Rendering
    const svgSelection = svgParentSelection
      .append("svg")
      .style("width", width)
      .style("height", height);
    svgSelection.attr("viewBox", [0, 0, dagWidth, height].join(" "));
    const svgChild = svgSelection.append("g");
    svgChild
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    this.addDragAndScale(svgChild, width, height);

    // Map colors to nodes
    const interp = d3.interpolateRainbow;
    const nodeIdsAndColors = new Map();
    for (const node of dag.idescendants()) {
      const rndStep = Math.random() * dag.size();
      nodeIdsAndColors.set(node.data["Id"], interp(rndStep));
    }

    const line = d3
      .line()
      .curve(d3.curveCatmullRom)
      .x((d) => d.x)
      .y((d) => d.y);

    this.addEdges(svgChild, dag, nodeIdsAndColors, implementationEdges, line);

    this.addNodes(svgChild, dag, nodeWidth, nodeHeight, nodeIdsAndColors, line);

    // addArrows(svgChild, dag, 15, nodeIdsAndColors);
  }

  findCauseIds(obj) {
    let edgeProps = [];
    for (let prop in obj) {
      if (prop === "Edge") {
        if (obj[prop].hasOwnProperty("CauseId"))
          edgeProps.push(obj[prop]["CauseId"]);
      }
      if (typeof obj[prop] === "object") {
        let nestedEdgeProps = this.findCauseIds(obj[prop]);
        edgeProps = edgeProps.concat(nestedEdgeProps);
      }
    }
    return edgeProps;
  }

  addNodes(
    nodesParentSelection,
    dag,
    nodeWidth,
    nodeHeight,
    nodeIdsAndColors,
    line
  ) {
    const nodes = nodesParentSelection
      .append("g")
      .selectAll("g")
      .data(dag.descendants())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${(d.x = d.x)}, ${(d.y = d.y)})`)
      .attr("cursor", "grab")
      .attr("class", (d) => {
        return `node ${d.data.Id}`;
      });

    // Plot node circles
    // nodes
    //   .append("circle")
    //   .attr("r", nodeRadius)
    //   .attr("fill", (n) => colorMap.get(n.data.id));

    // Add rect
    nodes
      .append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", (n) => nodeIdsAndColors.get(n.data["Id"]))
      .attr("stroke-width", 1.5);
    // .attr("stroke", "#888");

    // Todo: заголовки, а не значения
    this.addText(
      nodes,
      nodeWidth,
      nodeHeight,
      (d) => d.data["NodeValue"] || d.data["Id"]
    );
    // addText(nodes, "test string for node");

    this.addNodesDragAndDrop(nodes, line, nodeWidth, nodeHeight);
  }

  addText(selection, nodeWidth, nodeHeight, getText) {
    selection
      .append("text")
      .text(getText)
      .attr("font-weight", "bold")
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("transform", `translate(${nodeWidth / 2}, ${nodeHeight / 2})`)
      // .attr("dominant-baseline", "hanging")
      .attr("fill", "white");
  }

  // Делает узлы, переданные в выборке, перетаскиваемыми. line требуется для обновления линий svg
  // (совпадает с line, использованным при отображении графа до перетаскиваний)
  addNodesDragAndDrop(nodesSelection, line, nodeWidth, nodeHeight) {
    nodesSelection.call(
      d3
        .drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    );

    function dragStarted() {
      d3.select(this).raise().attr("cursor", "grabbing");
    }
    const causalView = this;
    function dragged(event, d) {
      d3.select(this).attr(
        "transform",
        `translate(${(d.x += event.dx)}, ${(d.y += event.dy)})`
      );

      // Обновляем все ребра (пока что просадки по производительности не заметны)
      // d3.selectAll(".edge")
      //     .attr("d", (d) => {
      //         const l = line([{ x: d.source.x, y: d.source.y }, { x: d.target.x, y: d.target.y }]);
      //         return l;
      //     });
      causalView.updateEdges(
        d3.selectAll(".edge"),
        line,
        nodeWidth,
        nodeHeight
      );
    }

    function dragEnded() {
      nodesSelection.attr("cursor", "grab");
    }
  }

  updateEdges(edgePathSelection, line, nodeWidth, nodeHeight) {
    return edgePathSelection.attr("d", (d) => {
      return line([
        { x: d.source.x + nodeWidth / 2, y: d.source.y + nodeHeight / 2 },
        { x: d.target.x + nodeWidth / 2, y: d.target.y + nodeHeight / 2 },
      ]);
    });
  }

  // Ребра идентифицируются по id источника и цели
  sourceAndTargetIdsToEdgeId(source, target) {
    return `${source}--${target}`;
  }

  addEdges(svgSelection, dag, nodeIdsAndColors, implementationEdges, line) {
    const defs = svgSelection.append("defs"); // For gradients

    const edgePathSelection = svgSelection
      .append("g")
      .selectAll("path")
      .data(dag.links())
      .enter()
      .append("path")
      .attr("class", "edge");

    this.updateEdges(edgePathSelection, line, 140, 40)
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
          .attr("stop-color", nodeIdsAndColors.get(source.data["Id"]));
        grad
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", nodeIdsAndColors.get(target.data["Id"]));
        return `url(#${gradId})`;
      })
      .attr("stroke-dasharray", ({ source, target }) => {
        const edgeId = this.sourceAndTargetIdsToEdgeId(
          source.data["Id"],
          target.data["Id"]
        );
        const isEdgeImplementation = implementationEdges.has(edgeId);
        return isEdgeImplementation ? "5,5" : "";
      });
  }

  addArrows(svgSelection, dag, nodeWidth, colorMap) {
    const arrowSize = (nodeWidth * nodeWidth) / 5.0;
    const arrowLen = Math.sqrt((4 * arrowSize) / Math.sqrt(3));
    const arrow = d3.symbol().type(d3.symbolTriangle).size(arrowSize);
    svgSelection
      .append("g")
      .selectAll("path")
      .data(dag.links())
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
  addDragAndScale(selection, width, height) {
    // svgSelection
    //     .call(d3.drag()
    //         .on("start", dragStarted)
    //         .on("drag", dragged)
    //         .on("end", dragEnded))
    selection.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([1, 8])
        .on("zoom", zoomed)
    );

    function dragStarted() {
      d3.select(this).raise();
      selection.attr("cursor", "grabbing");
    }

    function dragged(event, d) {
      d3.select(this)
        .attr("cx", (d.x = event.x))
        .attr("cy", (d.y = event.y));
    }

    function dragEnded() {
      selection.attr("cursor", "grab");
    }

    function zoomed({ transform }) {
      console.log("zoomed. transform: ", transform);
      selection.attr("transform", transform);
    }
  }
}
