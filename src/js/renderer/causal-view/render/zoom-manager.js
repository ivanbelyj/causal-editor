import * as d3 from "d3";

export class ZoomManager {
  constructor(svg, svgChild, onZoom) {
    this.svg = svg;
    this.svgChild = svgChild;

    this.onZoom = onZoom;

    this.#setupZoom();
  }

  #setupZoom() {
    this.zoom = d3.zoom().on("zoom", this.onZoom);
    this.svg.call(this.zoom);
  }

  // Todo: scale extent
  updateScaleExtent(dagWidth, dagHeight) {
    const defaultMinScale = 0.5;
    this.zoom.scaleExtent([
      dagWidth > 0
        ? Math.min(this.svg.node().clientWidth / dagWidth / 2, defaultMinScale)
        : defaultMinScale,
      2,
      // Math.max(
      //   this.svg.node().clientWidth / this.nodeWidth,
      //   this.svg.node().clientHeight / this.nodeHeight
      // ),
    ]); // Zoom limits
  }

  setInitialZoom(dagWidth, dagHeight) {
    // Calculate initial scale factor
    const isNotEmpty = dagWidth > 0;

    const scaleFactor = isNotEmpty
      ? Math.min(
          this.svg.node().clientWidth / dagWidth,
          this.svg.node().clientHeight / dagHeight
        )
      : null;

    // Calculate translation coordinates
    const translateX =
      (this.svg.node().clientWidth - dagWidth * scaleFactor) / 2;
    const translateY =
      (this.svg.node().clientHeight - dagHeight * scaleFactor) / 2;

    // Apply initial zoom and center the graph
    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform,
        isNotEmpty
          ? d3.zoomIdentity.translate(translateX, translateY).scale(scaleFactor)
          : d3.zoomIdentity
      );
  }
}
