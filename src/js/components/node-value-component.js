import * as d3 from "d3";
import { CausalFactProvider } from "./providers/causal-fact-provider";

export class NodeValueComponent {
  causalView = null;
  selector = null;

  constructor(selector, causalView, api, undoRedoManager) {
    this.selector = selector;
    this.component = d3.select(selector);
    this.causalView = causalView;

    this.causalFactProvider = new CausalFactProvider(undoRedoManager, null);

    api.onReset(
      function (event, data) {
        this.resetProvider(null);
      }.bind(this)
    );

    this.causalFactProvider.addEventListener("reset", () => this.reset());

    this.causalFactProvider.addEventListener("mutated", () => {
      console.log("mutated. new causal fact", this.causalFactProvider.get());
    });
  }

  resetProvider(causalModelFact) {
    this.causalFactProvider.set(causalModelFact);
  }

  init() {
    this.component.classed("component", true);

    this.causalView.selectionManager.addEventListener(
      "singleNodeSelected",
      (event) => {
        const causalModelFact = event.nodeData.fact;
        this.resetProvider(causalModelFact);
      }
    );

    this.causalView.selectionManager.addEventListener(
      "singleNodeNotSelected",
      (event) => {
        this.resetProvider(null);
      }
    );
  }

  reset() {
    console.log("reset");
    this.component.html("");

    const causalFact = this.causalFactProvider.get();
    if (!causalFact) return;

    // this.causalModelFact = causalFact;

    this.titleInput = this.appendInputItem({
      name: "Title",
      factPropName: "Title",
      inputId: "node-title-input",
      dontShowLabel: true,
    });
    this.valueInput = this.appendInputItem({
      name: "Node Value",
      factPropName: "NodeValue",
      inputId: "node-id-input",
      isReadonly: false,
      useTextArea: true,
    });
    this.idInput = this.appendInputItem({
      name: "Id",
      factPropName: "Id",
      inputId: "node-id-input",
      isReadonly: true,
    });

    this.getFactPropNamesAndInputs().forEach(([propertyName, input]) =>
      input.on("input", () => {
        this.causalFactProvider.changeNonCauseProperty(
          propertyName,
          input.property("value"),
          this.causalView.structure
        );
      })
    );

    this.getFactPropNamesAndInputs().forEach(([propName, input]) => {
      this.updateInputByPropName(input, propName);
      this.causalFactProvider.addEventListener("property-changed", (event) => {
        if (propName === event.propertyName) {
          console.log("property changed", event.propertyName, event.newValue);
          this.updateInputByPropName(input, event.propertyName);
        }
      });
    });
  }

  getFactPropNamesAndInputs() {
    return Array.from(this.factPropNameToInput.entries());
  }

  updateInputByPropName(input, causalFactPropertyName) {
    input.property(
      "value",
      this.causalFactProvider.get()[causalFactPropertyName] ?? ""
    );
  }

  // Returns input (or textarea) containing in input-item
  appendInputItem({
    name,
    inputId,
    isReadonly,
    useTextArea,
    dontShowLabel,
    factPropName,
  }) {
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

    if (!this.factPropNameToInput) {
      this.factPropNameToInput = new Map();
    }
    if (factPropName) this.factPropNameToInput.set(factPropName, input);

    return input;
  }

  // onChange() {
  //   if (!this.causalModelFact) return;

  //   this.causalModelFact.Title = this.titleInput.property("value");
  //   this.causalModelFact.NodeValue = this.valueInput.property("value");

  //   this.causalView.structure.render();
  // }
}
