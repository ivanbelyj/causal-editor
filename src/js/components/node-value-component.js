import * as d3 from "d3";
import { NodeDataProvider } from "./providers/node-data-provider";

export class NodeValueComponent {
  causalView = null;
  selector = null;

  constructor(selector, causalView, api, undoRedoManager) {
    this.selector = selector;
    this.component = d3.select(selector);
    this.causalView = causalView;

    this.nodeDataProvider = new NodeDataProvider(undoRedoManager, null);

    api.onReset(
      function (event, data) {
        this.resetProvider(null);
      }.bind(this)
    );

    this.nodeDataProvider.addEventListener("reset", () => this.reset());

    this.nodeDataProvider.addEventListener("mutated", () => {
      console.log("mutated. new causal fact", this.nodeDataProvider.getFact());
    });
  }

  resetProvider(nodeData) {
    this.nodeDataProvider.set(nodeData);
  }

  init() {
    this.component.classed("component", true);

    this.causalView.selectionManager.addEventListener(
      "singleNodeSelected",
      (event) => {
        this.resetProvider(event.nodeData);
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

    if (!this.nodeDataProvider.getFact()) return;

    this.titleInput = this.appendInputItem({
      name: "Title",
      factPropName: "Title",
      inputId: "node-title-input",
      dontShowLabel: true,
      isFactProp: false,
    });
    this.valueInput = this.appendInputItem({
      name: "Node Value",
      factPropName: "NodeValue",
      inputId: "node-id-input",
      isReadonly: false,
      useTextArea: true,
      isFactProp: true,
    });
    this.idInput = this.appendInputItem({
      name: "Id",
      factPropName: "Id",
      inputId: "node-id-input",
      isReadonly: true,
      isFactProp: true,
    });

    this.getFactPropNamesToData().forEach(
      ([propertyName, { input, isFactProp }]) =>
        input.on("input", () => {
          this.nodeDataProvider.changeNonCauseProperty(
            propertyName,
            isFactProp,
            input.property("value"),
            this.causalView.structure
          );
        })
    );

    // Todo: rename provider
    this.getFactPropNamesToData().forEach(
      ([propName, { input, isFactProp }]) => {
        this.updateInput(input, propName, isFactProp);
        this.nodeDataProvider.addEventListener("property-changed", (event) => {
          if (propName === event.propertyName) {
            console.log("property changed", event.propertyName, event.newValue);
            this.updateInput(input, event.propertyName, isFactProp);
          }
        });
      }
    );
  }

  getFactPropNamesToData() {
    return Array.from(this.factPropNameToData.entries());
  }

  updateInput(input, propertyName, isFactProp) {
    const objToGetProp = isFactProp
      ? this.nodeDataProvider.getFact()
      : this.nodeDataProvider.get();
    console.log(
      "update input. prop ",
      propertyName,
      "will be get from ",
      objToGetProp
    );
    input.property("value", objToGetProp[propertyName] ?? "");
  }

  // Returns input (or textarea) containing in input-item
  appendInputItem({
    name,
    inputId,
    isReadonly,
    useTextArea,
    dontShowLabel,
    factPropName,
    isFactProp,
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

    if (!this.factPropNameToData) {
      this.factPropNameToData = new Map();
    }
    if (factPropName)
      this.factPropNameToData.set(factPropName, { input, isFactProp });

    return input;
  }
}
