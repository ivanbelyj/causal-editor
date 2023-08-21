import * as d3 from "d3";

export class SelectNodeElement {
  constructor(selector, causalView, onNodeIdSelected) {
    this.component = d3.select(selector);
    this.causalView = causalView;
    this.onNodeIdSelected = onNodeIdSelected;
  }

  init(initialId) {
    this.onNodeClicked = this.onNodeClicked.bind(this);

    this.component.attr("class", "input-item select-node-element");

    this.idInput = this.component
      .append("input")
      .attr("type", "text")
      .attr("class", "text-input input-item__input select-node-element__input")
      .attr("placeholder", "CauseId")
      .attr("readonly", true)
      .property("value", initialId ?? "");

    const selectNodeButton = this.component
      .append("button")
      .attr("class", "button")
      .text("Select")
      .on("click", this.onClick.bind(this));
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
    this.causalView.selectionManager.isSelectByClick = true;

    this.onNodeIdSelected?.(causalModelFact.Id);
  }
}
