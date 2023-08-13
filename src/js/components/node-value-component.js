import * as d3 from "d3";

export class NodeValueComponent {
  causalView = null;
  selector = null;

  constructor(selector, causalView) {
    this.selector = selector;
    this.component = d3.select(selector);
    this.causalView = causalView;
  }

  init() {
    this.component.attr("class", "component");

    this.idInput = this.appendInputItem({
      name: "Id",
      inputId: "node-id-input",
      isReadonly: true,
    });
    this.titleInput = this.appendInputItem({
      name: "Title",
      inputId: "node-title-input",
    });
    this.valueInput = this.appendInputItem({
      name: "Node Value",
      inputId: "node-id-input",
      isReadonly: false,
      useTextArea: true,
    });

    this.titleInput
      .merge(this.valueInput)
      .on("change", this.onChange.bind(this));

    this.causalView.structure.addEventListener(
      "nodeClicked",
      function (event) {
        this.onNodeClicked(event);
      }.bind(this)
    );
  }

  buildStructure() {}

  // Returns input (or textarea) containing in input-item
  appendInputItem({ name, inputId, isReadonly, useTextArea }) {
    const inputItem = this.component.append("div").attr("class", "input-item");
    inputItem.append("label").attr("class", "input-item__label").text(name);
    const input = inputItem
      .append(useTextArea ? "textarea" : "input")
      .attr(
        "class",
        "input-item__input " + (useTextArea ? "textarea" : "text-input")
      )
      .attr("placeholder", name)
      .attr("id", inputId);

    if (!useTextArea) {
      input.attr("type", "text");
    }
    if (isReadonly) input.attr("readonly", true);
    return input;
  }

  // Todo: single node selected event
  onNodeClicked(event) {
    const nodeData = event.data.i.data;

    this.idInput.property("value", nodeData["Id"]);
    this.titleInput.property("value", nodeData["NodeTitle"] ?? "");
    this.valueInput.property("value", nodeData["NodeValue"] ?? "");
  }

  onChange() {
    console.log("node-value-component changed");
    const currentSelectedNodeId =
      this.causalView.selection.currentSelectedNodeId;
    if (!currentSelectedNodeId) return;
    const nodeTitleInput = this.titleInput.property("value");
    const nodeValueInput = this.valueInput.property("value");
    this.causalView.structure.updateNodeTitleAndValueById(
      currentSelectedNodeId,
      nodeTitleInput,
      nodeValueInput
    );
  }

  reset() {
    this.idInput.property("value", "");
    this.titleInput.property("value", "");
    this.valueInput.property("value", "");
  }
}
