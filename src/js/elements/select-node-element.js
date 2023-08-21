import * as d3 from "d3";

export class SelectNodeElement {
  constructor(selector, causalView) {
    this.component = d3.select(selector);
    this.causalView = causalView;
  }

  init() {
    this.onNodeSelected = this.onNodeClicked.bind(this);

    this.idInput = this.component
      .append("input")
      .attr("type", "text")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "CauseId");

    const selectNodeButton = this.component
      .append("button")
      .attr("class", "button")
      .text("Select Node")
      .on("click", this.onClick.bind(this));

    return { idInput: this.idInput, selectNodeButton };
  }

  onClick(event) {
    console.log("select node button is clicked. event", event);

    // The last click is to select the cause id, not to select the node to edit
    this.causalView.selectionManager.isSelectByClick = false;

    this.causalView.structure.addEventListener(
      "nodeClicked",
      this.onNodeClicked // already bound to this
    );
  }

  onNodeClicked(event) {
    const causalModelFact = event.data.i.data;

    this.idInput.property("value", causalModelFact.Id);

    this.causalView.structure.removeEventListener(
      "nodeClicked",
      this.onNodeClicked // the same function as in addEventListener
    );
    this.causalView.selectionManager.isSelectByClick = false;
  }
}
