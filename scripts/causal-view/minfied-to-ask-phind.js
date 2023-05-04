export class CausalView {
  constructor(selector, causalModelNodes) {
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

  updateNodeById(nodeToSet) {
    this._causalModelNodes.map((node) =>
      node.Id === nodeToSet.Id ? node : nodeToSet
    );
    d3.select(`.${nodeToSet.Id}`)
      .select("text")
      .text((d) => d.data.NodeValue);
  }

  setDagAndImplementationEdgesSet(causalModelNodes) {
    const implementationEdgesSet = new Set();
    this._dag = d3
      .dagStratify()
      .id(({ Id: id }) => id)
      .parentIds((node) => {
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
    this._implementationEdgesSet = implementationEdgesSet;
  }

  render(svgParentSelection) {
    const layout = d3
      .sugiyama()
      .decross(d3.decrossOpt())
      .nodeSize((node) => [
        (node ? 1.3 : 0) * this._nodeWidth,
        3 * this._nodeHeight,
      ]);
    const { width: dagWidth, height: dagHeight } = layout(this._dag);

    const width = parseFloat(svgParentSelection.style("width"));
    const height = parseFloat(svgParentSelection.style("height"));

    this._svgSelection = svgParentSelection
      .append("svg")
      .style("width", width)
      .style("height", height);
    this._svgSelection.attr("viewBox", [0, 0, dagWidth, height].join(" "));
    const svgChild = this._svgSelection.append("g");
    svgChild
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    this.addDragAndScale(svgChild, width, height);

    const interp = d3.interpolateRainbow;
    this._nodeIdsAndColors = new Map();
    for (const node of this._dag.idescendants()) {
      const rndStep = Math.random() * this._dag.size();
      this._nodeIdsAndColors.set(node.data["Id"], interp(rndStep));
    }

    this.addEdges(svgChild);

    this.addNodes(svgChild);
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

  addNodes(nodesParentSelection) {
    const nodesSelection = nodesParentSelection
      .append("g")
      .selectAll("g")
      .data(this._dag.descendants())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${(d.x = d.x)}, ${(d.y = d.y)})`)
      .attr("cursor", "grab")
      .attr("class", (d) => {
        return `node ${d.data.Id}`;
      });

    nodesSelection
      .append("rect")
      .attr("fill", (n) => this._nodeIdsAndColors.get(n.data["Id"]))
      .attr("stroke-width", 1.5);
    this.addText(nodesSelection, (d) => d.data["NodeValue"] || d.data["Id"]);

    this.addNodesDragAndDrop(nodesSelection);
  }

  addText(selection, getText) {
    selection
      .append("text")
      .text(getText)
      .attr(
        "transform",
        `translate(${this._nodeWidth / 2}, ${this._nodeHeight / 2})`
      )
      // .attr("dominant-baseline", "hanging")
      .attr("fill", "white");
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
    return `${source}--${target}`;
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
      .attr("stroke-width", 3);
  }
}
