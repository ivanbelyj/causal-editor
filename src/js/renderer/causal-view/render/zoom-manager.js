class ZoomManager {
    constructor(svgElement, zoomableArea) {
        this.svgElement = svgElement;
        this.zoomableArea = zoomableArea;

        this.setupZoom();
    }

    setupZoom() {
        this.zoom = d3.zoom()
        .scaleExtent([0.1, 10]) // Минимальное и максимальное масштабирование
        .on("zoom", () => this.handleZoom());

        this.svgElement.call(this.zoom);
    }

    handleZoom() {
        this.zoomableArea.attr("transform", d3.event.transform);
    }

    resetZoom() {
        this.svgElement.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
    }
}
  