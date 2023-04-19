import { updateEdges } from "./edges.js";

export function addNodes(svgSelection, dag, nodeWidth, nodeHeight,
    nodeIdsAndColors, line) { 
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

    addNodesDragAndDrop(nodes, line, nodeWidth, nodeHeight);
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

// Делает узлы, переданные в выборке, перетаскиваемыми. line требуется для обновления линий svg
// (совпадает с line, использованным при отображении графа до перетаскиваний)
function addNodesDragAndDrop(nodesSelection, line, nodeWidth, nodeHeight) {
    nodesSelection
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));
    
    function dragStarted() {
        d3.select(this).raise().attr("cursor", "grabbing");
    }
    
    function dragged(event, d) {
        d3.select(this).attr("transform",
            `translate(${ d.x += event.dx }, ${ d.y += event.dy })`);
        
        // Обновляем все ребра (пока что просадки по производительности не заметны)
        // d3.selectAll(".edge")
        //     .attr("d", (d) => {
        //         const l = line([{ x: d.source.x, y: d.source.y }, { x: d.target.x, y: d.target.y }]);
        //         return l;
        //     });
        updateEdges(d3.selectAll(".edge"), line, nodeWidth, nodeHeight);
    }
    
    function dragEnded() {
        nodesSelection.attr("cursor", "grab");
    }
}
