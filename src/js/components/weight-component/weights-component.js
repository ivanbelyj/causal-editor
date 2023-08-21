import * as d3 from "d3";
import { SelectNodeElement } from "../../elements/select-node-element.js";

// Block is used as a part of a component
export class WeightsComponent {
  constructor(selector, causalView) {
    // Parent element
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

    this.causalModelFact = causalModelFact;

    // Button to add new items
    const addButton = this.component
      .append("button")
      .attr("class", "button input-item")
      .text("Add Weight Edge")
      .on(
        "click",
        function (event) {
          const newItem = {};
          this.weights.push(newItem);
          this.appendItem(newItem);
        }.bind(this)
      );

    this.resetItems();
  }

  // Content is a part of component that is changing
  resetItems() {
    if (this.itemsParent) {
      this.itemsParent.remove();
      this.itemsParent = null;
    }

    if (!this.causalModelFact.WeightNest?.Weights)
      this.causalModelFact.WeightNest = { Weights: [] };
    this.weights = this.causalModelFact.WeightNest.Weights;
    // console.log("weights: ", this.weights);

    for (const weightEdge of this.weights) {
      this.appendItem(weightEdge);
    }
  }

  appendItem(weightEdge) {
    if (!this.itemsParent) this.itemsParent = this.component.append("div");

    const item = this.itemsParent
      .append("div")
      .attr("class", "component__inner-item");

    const itemTop = item
      .append("div")
      .attr("class", "component__inner-item-top");

    const itemContent = item.append("div");

    const weightInput = itemTop
      .append("input")
      .attr("type", "number")
      .attr("step", "1")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "Weight")
      .property("value", weightEdge.Weight ?? "");

    weightInput.on(
      "change",
      function (event) {
        weightEdge.Weight = parseFloat(
          d3.select(event.target).property("value")
        );
      }.bind(this)
    );

    itemTop
      .append("img")
      .attr("src", "images/bin.svg")
      .attr("class", "component__remove-icon")
      .style("padding-right", "0")
      .on(
        "click",
        function (event) {
          item.remove();
          // Todo: remove from this.weights
          // console.log("to remove:", this.weights.indexOf());
          console.log("weights", this.weights);
          console.log("weight edge", weightEdge);
          const removeIndex = this.weights.indexOf(weightEdge);
          this.weights.splice(removeIndex, 1);
        }.bind(this)
      );

    new SelectNodeElement(
      itemContent.append("div").node(),
      this.causalView,
      function (id) {
        const oldCauseId = weightEdge.CauseId;
        weightEdge.CauseId = id;
      }.bind(this)
    ).init(weightEdge.CauseId);
  }
}