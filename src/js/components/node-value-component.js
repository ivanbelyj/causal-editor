import * as d3 from "d3";

export class NodeValueComponent {
  causalView = null;
  selector = null;
  causalModelFact = null;

  constructor(selector, causalView) {
    this.selector = selector;
    this.component = d3.select(selector);
    this.causalView = causalView;
  }

  init(causalModelFact) {
    this.component.attr("class", "component");

    this.causalView.selectionManager.addEventListener(
      "singleNodeSelected",
      function (event) {
        const causalModelFact = event.data.node.data;
        this.reset(causalModelFact);
      }.bind(this)
    );

    if (causalModelFact) this.reset(causalModelFact);
  }

  reset(causalModelFact) {
    this.component.html("");
    if (!causalModelFact) return;

    this.causalModelFact = causalModelFact;

    this.titleInput = this.appendInputItem({
      name: "Title",
      inputId: "node-title-input",
      dontShowLabel: true,
    });
    this.valueInput = this.appendInputItem({
      name: "Node Value",
      inputId: "node-id-input",
      isReadonly: false,
      useTextArea: true,
    });
    this.idInput = this.appendInputItem({
      name: "Id",
      inputId: "node-id-input",
      isReadonly: true,
    });

    [this.titleInput, this.valueInput].forEach((x) =>
      x.on("change", this.onChange.bind(this))
    );

    this.update({
      id: causalModelFact["Id"],
      title: causalModelFact["Title"],
      value: causalModelFact["NodeValue"],
    });
  }

  update({ id, title, value }) {
    this.idInput.property("value", id ?? "");
    this.titleInput.property("value", title ?? "");
    this.valueInput.property("value", value ?? "");
  }

  // Returns input (or textarea) containing in input-item
  appendInputItem({ name, inputId, isReadonly, useTextArea, dontShowLabel }) {
    const inputItem = this.component.append("div").attr("class", "input-item");

    if (!dontShowLabel)
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

  onChange() {
    if (!this.causalModelFact) return;

    this.causalModelFact.Title = this.titleInput.property("value");
    this.causalModelFact.NodeValue = this.valueInput.property("value");
    console.log(
      "new value and title: ",
      this.causalModelFact.NodeValue,
      this.causalModelFact.Title
    );

    this.causalView.structure.render();
  }
}
