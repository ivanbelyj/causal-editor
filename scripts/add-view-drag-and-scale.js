function addDragAndScale(selection, width, height) {
    // svgSelection
    //     .call(d3.drag()
    //         .on("start", dragStarted)
    //         .on("drag", dragged)
    //         .on("end", dragEnded))
    selection
        .call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([1, 8])
            .on("zoom", zoomed));
    
    function dragStarted() {
        d3.select(this).raise();
        selection.attr("cursor", "grabbing");
    }
    
    function dragged(event, d) {
        d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
    }
    
    function dragEnded() {
        selection.attr("cursor", "grab");
    }
    
    function zoomed({transform}) {
        console.log("zoomed. transform: ", transform);
        selection.attr("transform", transform);
    }
}
