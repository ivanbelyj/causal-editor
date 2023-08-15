import * as d3 from "d3";
import { CausalModelUtils } from "../causal-view/causal-model-utils.js";

// CausesItem is a UI element representing causes expression.
// It includes top (with type dropdown) and content that can include
// another CausesItem inner elements
export class CausesItem {
  // There are some properties that don't change after reset. They are set in constructor.
  // Selector for item is constant (the item is always in the same place in DOM).
  // It does not depend on the causesExpression whether the element can be deleted or not
  // so isRemovable and isRoot are also constant.
  constructor({
    selector,
    isRemovable,
    onRemoveClick,

    onCausesRemove,
    onCauseIdChange,

    isRoot,
  }) {
    this.selector = selector;
    this.component = d3.select(selector);
    this.isRemovable = isRemovable ?? false;
    this.onRemoveClick = onRemoveClick;

    // Necessary to update changes in CausalView because d3 tracks flat data,
    // not nested and mutating
    this.onCausesRemove = onCausesRemove;
    this.onCauseIdChange = onCauseIdChange;

    // Knowing isRootItem is required to have only one right border for inner items
    this.isRoot = isRoot ?? false;
  }

  // Actions that are relevant to CausesItem regardless of causesExpression structure.
  // init() must be called only once
  init(causesExpression) {
    // Every causes-item has item top (for selecting the type or removing the item)
    this.itemTop = this.component
      .append("div")
      .attr("class", "causes-item__item-top");

    // Removable item has remove-icon instead of padding
    if (this.isRemovable) {
      this.itemTop.style("padding-right", "0");
    }

    const typeDropdown = (this.typeDropdown = this.itemTop
      .append("select")
      .attr("class", "input-item input-item__input"));

    if (this.isRemovable) {
      this.itemTop
        .append("img")
        .attr("src", "images/bin.svg")
        .attr("class", "causes-item__remove-icon")
        .on(
          "click",
          function () {
            this.component.remove();
            this.onRemoveClick?.(this.causesExpression);
          }.bind(this)
        );
    }

    typeDropdown.append("option").attr("value", "none").text("None");
    typeDropdown.append("option").attr("value", "factor").text("Factor");
    typeDropdown.append("option").attr("value", "and").text("And");
    typeDropdown.append("option").attr("value", "or").text("Or");
    typeDropdown.append("option").attr("value", "not").text("Not");

    typeDropdown.on(
      "change",
      function (e) {
        const newType = e.target.value;
        const prevType = this.causesExpression?.$type;

        let removedCauseIds;
        if (
          (prevType == "and" && newType == "or") ||
          (prevType == "or" && newType == "and")
        ) {
          // To fix: в некоторых случах вложенные элементы все равно убираются
          // To change $type is enough (next)
          console.log("causesExpression will not modified");
        } else {
          const expr = this.causesExpression;
          removedCauseIds = CausalModelUtils.findCauseIds(expr);

          // We should mutate this.causesExpression instead of creating a new one
          for (const key in expr) {
            delete expr[`${key}`];
          }
          if (newType == "and" || newType == "or") {
            expr.Operands = [];
          }
          if (newType == "not") {
            // Add a child that has not been defined yet, but is required
            expr.CausesExpression = {};
          }
          if (newType == "factor") {
            expr.Edge = {
              Probability: 1,
            };
          }
        }
        this.causesExpression.$type = newType;

        // Tracked to update causal view
        if (removedCauseIds) this.onCausesRemove(removedCauseIds);

        // In most cases new CausesItem structure is not similar to previous
        this.reset(this.causesExpression);
      }.bind(this)
    );

    if (causesExpression) {
      this.reset(causesExpression);
    }
  }

  reset(causesExpression) {
    if (!causesExpression)
      console.error("causes expression can't be ", causesExpression);

    this.causesExpression = causesExpression;
    CausesItem.resetCausesItem(this, this.causesExpression);
  }

  static resetCausesItem(causeItem, expr) {
    // Update top
    causeItem.typeDropdown.property("value", expr?.$type ?? "none");

    // Reset content and remove inner items
    causeItem.resetContent(expr?.$type);

    if (!expr) return;

    // Create actual inner items
    const childrenExpr = [];
    if (expr.Operands) childrenExpr.push(...expr.Operands);
    else if (expr.CausesExpression) childrenExpr.push(expr.CausesExpression);
    if (childrenExpr.length > 0) {
      for (const childExpr of childrenExpr) {
        const newItem = causeItem.appendInnerItem(
          expr.$type !== "not",
          // Inner items are not removable only in inversion operation (there is always only an operand)
          childExpr
        );
        // Create item from expression
        CausesItem.resetCausesItem(newItem, childExpr);
      }
    }
  }

  // After removing all content including inner items resetContent() creates
  // only item content itself (without inner items)
  resetContent(type) {
    if (this.content) {
      this.content.remove();
    }
    this.content = this.component.append("div");
    if (this.innerItemsParent) {
      this.innerItemsParent = null;
    }

    switch (type) {
      case "factor":
        this.setFactorItemContent();
        break;
      case "and":
      case "or":
        this.setAndOrItemContent();
        break;
      case "not":
        this.setNotItemContent();

      default:
    }
  }

  setFactorItemContent() {
    const probabilityInput = this.content
      .append("input")
      .attr("type", "number")
      .attr("min", "0")
      .attr("max", "1")
      .attr("step", "0.01")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "Probability");
    const causeIdInput = this.content
      .append("input")
      .attr("type", "text")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "CauseId");

    if (this.causesExpression) {
      if (this.causesExpression.$type === "factor") {
        probabilityInput.property(
          "value",
          this.causesExpression.Edge.Probability
        );
        causeIdInput.property("value", this.causesExpression.Edge.CauseId);
      } else {
        console.error(
          "Incorrect causesExpression for factor item creation: ",
          this.causesExpression
        );
      }
    }

    probabilityInput.on(
      "change",
      function (event) {
        this.causesExpression.Edge.Probability = parseFloat(
          d3.select(event.target).property("value")
        );
      }.bind(this)
    );

    causeIdInput.on(
      "change",
      function (event) {
        const oldCauseId = this.causesExpression.Edge.CauseId;
        this.causesExpression.Edge.CauseId = d3
          .select(event.target)
          .property("value");

        // this.fireCauseIdChange(oldCauseId, this.causesExpression.Edge.CauseId);
        this.onCauseIdChange(oldCauseId, this.causesExpression.Edge.CauseId);
      }.bind(this)
    );
  }

  setAndOrItemContent() {
    this.content.style("padding-right", "0"); // reduced to save space

    // Button to add new items
    var addButton = this.content
      .append("button")
      .attr("class", "button input-item cause-item__add-button")
      .text("Add Operand");

    addButton.on(
      "click",
      function (event) {
        const newItem = {};
        this.causesExpression.Operands.push(newItem);
        // New operand is empty so cause change will be handled on change type
        this.appendInnerItem(true, newItem);
      }.bind(this)
    );
  }

  setNotItemContent() {
    this.content.style("padding-right", "0"); // reduced to save space
  }

  // Inner item is visually separated from outer (borders and padding)
  appendInnerItem(isRemovable, causesExpression) {
    if (!this.innerItemsParent)
      this.innerItemsParent = this.content.append("div");

    const itemSelection = this.innerItemsParent
      .append("div")
      .attr("class", "causes-item__inner-item")
      .style("padding-right", "0"); // Every inner item reduces padding-right to save space

    if (!this.isRoot) {
      itemSelection.style("border-right", "none");
    }

    const newItem = new CausesItem({
      selector: itemSelection.node(),
      isRemovable,
      onCausesRemove: this.onCausesRemove,
      onCauseIdChange: this.onCauseIdChange,
      onRemoveClick: function (removingExpr) {
        const removeIndex =
          this.causesExpression.Operands.indexOf(removingExpr);
        this.causesExpression.Operands.splice(removeIndex, 1);

        // Pass removed causes to update causal-view
        this.onCausesRemove(CausalModelUtils.findCauseIds(removingExpr));
      }.bind(this),
      isRoot: false, // Inner item can't be a root
    });
    newItem.init(causesExpression);

    return newItem;
  }
}
