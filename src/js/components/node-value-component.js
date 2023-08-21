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

    this.causalView.selectionManager.addEventListener(
      "singleNodeSelected",
      function (event) {
        this.onSingleNodeSelected(event);
      }.bind(this)
    );
  }

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

  onSingleNodeSelected(event) {
    const nodeData = event.data.node.data;
    this.causalModelFact = nodeData;

    this.update({
      id: nodeData["Id"],
      title: nodeData["Title"],
      value: nodeData["NodeValue"],
    });
  }

  onChange() {
    if (!this.causalModelFact) return;

    this.causalModelFact.Title = this.titleInput.property("value");
    this.causalModelFact.NodeValue = this.valueInput.property("value");

    this.causalView.structure.render();
  }

  update({ id, title, value }) {
    this.idInput.property("value", id ?? "");
    this.titleInput.property("value", title ?? "");
    this.valueInput.property("value", value ?? "");
  }
}
