// import { scaleFeature } from "./svg-scale";

(async () => {
    const data = await getIdBasedData();

    // Ребра-реализации отображаются особо
    const { dag, implementationEdges } = getDagAndImplementationEdgesSet(data);

    // const nodeRadius = 20;
    const nodeWidth = 140;
    const nodeHeight = 40;
    const layout = d3
      .sugiyama() // base layout
      .decross(d3.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => [(node ? 1.3 : 0) * nodeWidth, 3 * nodeHeight]);
    const { width, height } = layout(dag);
  
    // Rendering
    const svgSelection = d3.select("svg");
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
})();

async function getIdBasedData() {
  // fetch data and render
  const resp = await fetch(
    "https://raw.githubusercontent.com/erikbrinkman/d3-dag/main/examples/grafo.json"
  );
  // const data1 = await resp.json();
  const data = JSON.parse(testData);
  console.log(data);
  // console.log("fetched data: ", data1);
  return data;
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

function sourceAndTargetIdsToEdgeId(source, target) {
  return `${source}--${target}`; 
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

function addNodes(svgSelection, dag, nodeWidth, nodeHeight, nodeIdsAndColors, line) { 
  const nodes = svgSelection
    .append("g")
    .selectAll("g")
    .data(dag.descendants())
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x = d.x}, ${d.y = d.y})`)
    .attr("cursor", "grab")
    .classed("node", true);

  // Plot node circles
  // nodes
  //   .append("circle")
  //   .attr("r", nodeRadius)
  //   .attr("fill", (n) => colorMap.get(n.data.id));

  // Add rect
  nodes.append("rect")
    .attr("width", nodeWidth)
    .attr("height", nodeHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", n => nodeIdsAndColors.get(n.data["Id"]))
    .attr("stroke-width", 1.5);
    // .attr("stroke", "#888");

  // Todo: заголовки, а не значения
  addText(nodes, nodeWidth, nodeHeight, (d) => d.data["NodeValue"] || d.data["Id"]);
  // addText(nodes, "test string for node");

  addDraggableNodes(nodes, line);
}

function addText(selection, nodeWidth, nodeHeight, getText) {
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

