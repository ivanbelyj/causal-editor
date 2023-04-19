// Делает узлы, переданные в выборке, перетаскиваемыми. line требуется для обновления линий svg
// (совпадает с line, использованным при отображении графа до перетаскиваний)
function addDraggableNodes(nodesSelection, line) {
    nodesSelection
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));
    
    function dragStarted() {
        d3.select(this).raise().attr("cursor", "grabbing");
    }
    
    function dragged(event, d) {
        d3.select(this).attr("transform", `translate(${ d.x += event.dx }, ${ d.y += event.dy })`);
        console.log("dragged", d3.select(this));
        
        // Обновляем все ребра (пока что просадки по производительности не заметны)
        // d3.selectAll(".edge")
        //     .attr("d", (d) => {
        //         const l = line([{ x: d.source.x, y: d.source.y }, { x: d.target.x, y: d.target.y }]);
        //         return l;
        //     });
        updateEdge(d3.selectAll(".edge"), line, 140, 40);
    }
    
    function dragEnded() {
        nodesSelection.attr("cursor", "grab");
    }
}
