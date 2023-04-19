import { sourceAndTargetIdsToEdgeId, addEdges } from "./edges.js";
import { addNodes } from "./nodes.js";

export function causalView(selector, idBasedData) {
  const { dag, implementationEdges } = getDagAndImplementationEdgesSet(idBasedData);
  const parentSelection = d3.select(selector);
  const width = parseFloat(parentSelection.style("width"));
  const height = parseFloat(parentSelection.style("height"));
  renderCausalView(parentSelection, dag, implementationEdges, width, height);
}

// Создает dag из id-based parent data, а также
  // набор ребер-реализаций абстрактных фактов в виде строк
  function getDagAndImplementationEdgesSet(data) {
    const implementationEdges = new Set();
    const dag = d3
      .dagStratify()
      .id(({ "Id": id }) => id)
      .parentIds((node) => {
        const res = findCauseIds(node["ProbabilityNest"]);
        const abstractFactId = node["AbstractFactId"];
        if (abstractFactId) {
          res.push(abstractFactId);
          implementationEdges.add(sourceAndTargetIdsToEdgeId(abstractFactId, node["Id"]));
        }
        return res;
      })
      (data);
    return { dag, implementationEdges };
  }

// Список id ребер-реализаций требуется для особого отображения
function renderCausalView(svgParentSelection, dag, implementationEdges, width, height) {
    // const nodeRadius = 20;
    const nodeWidth = 140;
    const nodeHeight = 40;
    const layout = d3
      .sugiyama() // base layout
      .decross(d3.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => [(node ? 1.3 : 0) * nodeWidth, 3 * nodeHeight]);
    const { dagWidth, dagHeight } = layout(dag);
  
    // Rendering
    const svgSelection = svgParentSelection.append("svg");
    svgSelection.attr("viewBox", [0, 0, width, height].join(" "));
    const svgChild = svgSelection.append("g");
    svgChild
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    addDragAndScale(svgChild, width, height);
  
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
    
    addEdges(svgChild, dag, nodeIdsAndColors, implementationEdges, line);

    addNodes(svgChild, dag, nodeWidth, nodeHeight, nodeIdsAndColors, line);

    // addArrows(svgChild, dag, 15, nodeIdsAndColors);
}
  
  function findCauseIds(obj) {
    let edgeProps = [];
    for (let prop in obj) {
      if (prop === "Edge") {
        if (obj[prop].hasOwnProperty("CauseId"))
          edgeProps.push(obj[prop]["CauseId"]);
      }
      if (typeof obj[prop] === "object") {
        let nestedEdgeProps = findCauseIds(obj[prop]);
        edgeProps = edgeProps.concat(nestedEdgeProps);
      }
    }
    return edgeProps;
  }
