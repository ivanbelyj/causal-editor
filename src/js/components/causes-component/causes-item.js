import * as d3 from "d3";
import { SelectNodeElement } from "../../elements/select-node-element.js";
import binSrc from "../../../images/bin.svg";

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

    isRoot,

    causalView,
    causesExpressionProvider,
  }) {
    this.selector = selector;
    this.component = d3.select(selector);
    this.isRemovable = isRemovable ?? false;
    this.onRemoveClick = onRemoveClick;

    // Necessary to update changes in CausalView because d3 tracks flat data,
    // not nested and mutating

    // Knowing isRootItem is required to have only one right border for inner items
    this.isRoot = isRoot ?? false;
    // this.rootCausesExpression = rootCausesExpression;

    this.causalView = causalView;

    this.causesExpressionProvider = causesExpressionProvider;
    causesExpressionProvider.addEventListener(
      "causes-expression-reset",
      this.reset.bind(this)
    );
    causesExpressionProvider.addEventListener(
      "causes-expression-mutated",
      this.reset.bind(this)
    );
  }

  // Resets causes item's provider with causes expression
  resetProvider(causesExpression) {
    this.causesExpressionProvider.set(causesExpression);
  }

  reset() {
    const expr = this.causesExpressionProvider.get();
    console.log("reset causes-item. expr:", expr);

    this.resetItemTop();

    // Reset content and remove inner items
    this.resetContent();

    if (!expr) return;

    // Create actual inner items
    // const childrenExpr = [];
    // if (expr.Operands) childrenExpr.push(...expr.Operands);
    // else if (expr.CausesExpression) childrenExpr.push(expr.CausesExpression);
    const childrenProviders =
      this.causesExpressionProvider.createAndSetChildrenExpressionProviders();
    if (childrenProviders.length > 0) {
      for (const childProvider of childrenProviders) {
        const newItem = this.appendInnerItem(
          expr.$type !== "not",
          // Inner items are not removable only in inversion operation (there is always only an operand)
          childProvider
        );
        newItem.reset();
      }
    }
  }

  resetItemTop() {
    if (this.itemTop) {
      this.itemTop.remove();
    }

    // Every causes-item has item top (for selecting the type or removing the item)
    this.itemTop = this.component
      .append("div")
      .attr("class", "component__inner-item-top");

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
        .attr("src", binSrc)
        .attr("class", "component__remove-icon")
        .on(
          "click",
          function () {
            this.component.remove();
            this.onRemoveClick?.();
          }.bind(this)
        );
    }

    typeDropdown.append("option").attr("value", "none").text("None");
    typeDropdown.append("option").attr("value", "factor").text("Factor");
    typeDropdown.append("option").attr("value", "and").text("And");
    typeDropdown.append("option").attr("value", "or").text("Or");
    typeDropdown.append("option").attr("value", "not").text("Not");

    typeDropdown.property(
      "value",
      this.causesExpressionProvider.get()?.$type ?? "none"
    );

    typeDropdown.on(
      "change",
      function (e) {
        this.causesExpressionProvider.changeExpressionType(e.target.value);
      }.bind(this)
    );
  }

  // After removing all content including inner items resetContent() creates
  // only item content itself (without inner items)
  resetContent() {
    if (this.content) {
      this.content.remove();
    }
    this.content = this.component.append("div");
    if (this.innerItemsParent) {
      this.innerItemsParent = null;
    }

    switch (this.causesExpressionProvider.get().$type) {
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
    const expr = this.causesExpressionProvider.get();
    if (expr.$type != "factor") {
      console.error(
        "Incorrect causesExpression for factor item creation: ",
        this.expr
      );
    }

    const probabilityInput = this.content
      .append("input")
      .attr("type", "number")
      .attr("min", "0")
      .attr("max", "1")
      .attr("step", "0.01")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "Probability")
      .property("value", expr.Edge.Probability)
      .on(
        "change",
        function (event) {
          this.causesExpressionProvider.changeProbability(
            parseFloat(d3.select(event.target).property("value"))
          );
        }.bind(this)
      );

    new SelectNodeElement(
      this.content.append("div").node(),
      this.causalView,
      this.causesExpressionProvider.changeCauseId.bind(
        this.causesExpressionProvider
      )
    ).init(expr.Edge.CauseId);
  }

  setAndOrItemContent() {
    this.content.style("padding-right", "0"); // reduced to save space

    // Button to add new items
    const addButton = this.content
      .append("button")
      .attr("class", "button input-item")
      .text("Add Operand");

    addButton.on(
      "click",
      function (event) {
        this.causesExpressionProvider.addNewOperand(
          function (newExprProvider) {
            this.appendInnerItem(true, newExprProvider);
          }.bind(this)
        );
      }.bind(this)
    );
  }

  setNotItemContent() {
    this.content.style("padding-right", "0"); // reduced to save space
  }

  // Inner item is visually separated from outer (borders and padding)
  appendInnerItem(isRemovable, causesExpressionProvider) {
    if (!this.innerItemsParent)
      this.innerItemsParent = this.content.append("div");

    const itemSelection = this.innerItemsParent
      .append("div")
      .attr("class", "component__inner-item")
      .style("padding-right", "0"); // Every inner item reduces padding-right to save space

    if (!this.isRoot) {
      itemSelection.style("border-right", "none");
    }

    const newItem = new CausesItem({
      selector: itemSelection.node(),
      isRemovable,
      onRemoveClick: this.causesExpressionProvider.removeOperand.bind(
        this.causesExpressionProvider
      ),
      isRoot: false, // Inner item can't be a root
      causalView: this.causalView,
      causesExpressionProvider,
    });

    return newItem;
  }
}
