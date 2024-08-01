/** Renders Causal View base layout */
export class ViewRenderer {
  edgesParent;
  nodesParent;
  edgesDefs;
  onSvgClick;

  constructor(svgParent, onSvgClick) {
    this.onSvgClick = onSvgClick;

    this.#setSvg(svgParent);
    this.#setSvgChild();

    this.#setParents();
  }

  reset() {
    // this.svg.attr("viewBox", [0, 0, dagWidth, dagHeight].join(" "));

    this.#clearParents();
  }

  #setSvg(svgParent) {
    this.svg = svgParent
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .on("click", this.onSvgClick);
  }

  #setSvgChild() {
    const svgChild = this.svg
      .append("g")
      .classed("causal-view__svg-child", true);

    this.svgChild = svgChild;
  }

  #setParents() {
    this.edgesParent = this.svgChild.append("g").attr("class", "edges-parent");
    this.nodesParent = this.svgChild.append("g").attr("class", "nodes-parent");
    this.edgesDefs = this.svgChild.append("defs");
  }

  #clearParents() {
    this.nodesParent.html("");
    this.edgesParent.html("");
    this.edgesDefs.html("");
  }
}
