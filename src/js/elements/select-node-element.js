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

    this.selectNodeButton = this.component
      .append("button")
      .attr("class", "button")
      .text("Select")
      .on("click", this.onSelectButtonClick.bind(this));

    this.clearButton = this.component
      .append("button")
      .attr("class", "button select-node-element__input")
      .text("Clear")
      .on("click", this.onClearButtonClick.bind(this));

    this.cancelSelectButton = this.component
      .append("button")
      .attr("class", "button")
      .text("Cancel")
      .on("click", this.onCancelButtonClick.bind(this));

    this.setButtonsVisible(true);
  }

  setButtonsVisible(showSelectButtonOnly) {
    this.selectNodeButton.style(
      "display",
      showSelectButtonOnly ? "inline-block" : "none"
    );
    this.clearButton.style(
      "display",
      !showSelectButtonOnly ? "inline-block" : "none"
    );
    this.cancelSelectButton.style(
      "display",
      !showSelectButtonOnly ? "inline-block" : "none"
    );

    // [this.selectNodeButton, this.clearButton, this.cancelSelectButton].forEach(
    //   (btn) => {
    //     btn.style("display", showSelectButtonOnly ? "inline-block" : "none");
    //   }
    // );
  }

  onCancelButtonClick(event) {
    this.cancelSelect();
  }

  onClearButtonClick(event) {
    this.setIdInputAndCancelSelect("");
  }

  onNodeClicked(event) {
    const causalModelFact = event.nodeSelection.data.fact;
    this.setIdInputAndCancelSelect(causalModelFact.Id);
  }

  setIdInputAndCancelSelect(causalModelFactId) {
    this.idInput.property("value", causalModelFactId);

    this.cancelSelect();

    this.onNodeIdSelected?.(causalModelFactId);
  }

  onSelectButtonClick(event) {
    // The last click is to select the cause id, not to select the node to edit
    this.causalView.selectionManager.isSelectByClick = false;

    this.causalView.structure.addEventListener(
      "nodeClicked",
      this.onNodeClicked // already bound to this
    );

    this.setButtonsVisible(false);
  }

  cancelSelect() {
    this.causalView.structure.removeEventListener(
      "nodeClicked",
      this.onNodeClicked // the same function as in addEventListener
    );
    this.causalView.selectionManager.isSelectByClick = true;
    this.setButtonsVisible(true);
  }
}
