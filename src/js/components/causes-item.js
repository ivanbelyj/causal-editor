import * as d3 from "d3";

// CausesItem is a UI element representing causes expression.
// It includes top (with type dropdown) and content that can include
// another CausesItem inner elements
export class CausesItem {
  constructor({ selector, isRemovable, onRemove, isRoot, causesExpression }) {
    this.selector = selector;
    this.component = d3.select(selector);
    // this.data = probabilityNest;
    this.isRemovable = isRemovable ?? false;
    this.onRemove = onRemove ?? null;

    // Knowing isRootItem is required to have only one right border for inner items
    this.isRoot = isRoot ?? false;

    this.causesExpression = causesExpression;
  }

  init() {
    // every causes-item has item top (for select type or remove item)
    const itemTop = this.component
      .append("div")
      .attr("class", "causes-item__item-top");

    // Removable item has remove-icon instead of padding
    if (this.isRemovable) {
      itemTop.style("padding-right", "0");
    }

    const typeDropdown = (this.typeDropdown = itemTop
      .append("select")
      .attr("class", "input-item input-item__input"));

    if (this.isRemovable) {
      // itemTop.append("button").attr("class", "button").text("Remove");
      itemTop
        .append("img")
        .attr("src", "images/bin.svg")
        .attr("class", "causes-item__remove-icon")
        .on("click", this.onRemove);
    }

    typeDropdown.append("option").attr("value", "not selected").text("None");
    typeDropdown.append("option").attr("value", "factor").text("Factor");
    typeDropdown.append("option").attr("value", "and").text("And");
    typeDropdown.append("option").attr("value", "or").text("Or");
    typeDropdown.append("option").attr("value", "not").text("Not");

    typeDropdown.on(
      "change",
      function () {
        var selectedValue = typeDropdown.node().value;
        this.causesExpression = null;
        this.updateContent(selectedValue);
        // Todo: transform old causesExpression data to new type
      }.bind(this)
    );

    if (this.causesExpression) this.setCausalExpression(this.causesExpression);
  }

  setCausalExpression(expr) {
    CausesItem.setCausesExpressionForItem(this, expr);
  }

  static setCausesExpressionForItem(causeItem, expr) {
    // Update top
    causeItem.typeDropdown.property("value", expr.$type);

    // Update content
    causeItem.updateContent(expr.$type);

    // Update inner items

    const childrenExpr = [];
    if (expr.Operands) childrenExpr.push(...expr.Operands);
    else if (expr.CausesExpression) childrenExpr.push(expr.CausesExpression);
    if (childrenExpr.length > 0) {
      for (const operandExpr of childrenExpr) {
        const newItem = causeItem.appendInnerItem(
          expr.$type !== "not",
          // Inner items are not removable only in inversion operation (there is always only an operand)
          operandExpr
        );
        CausesItem.setCausesExpressionForItem(newItem, operandExpr);
      }
    }
  }

  // updates item itself (for some types may create inner items)
  updateContent(type) {
    if (this.content) {
      this.content.remove();
    }
    this.content = this.component.append("div");
    if (this.innerItemsParent) {
      this.innerItemsParent = null;
    }

    switch (type) {
      case "factor":
        this.createFactorItemContent();
        break;
      case "and":
      case "or":
        this.createAndOrItemContent();
        break;
      case "not":
        this.createNotItemContent();

      default:
    }
  }

  createFactorItemContent() {
    const probabilityInput = this.content
      .append("input")
      .attr("type", "number")
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

    probabilityInput.on("change", (event) => {
      console.log("probability is changed");
      //   this.data.Edge.Probability = parseFloat(
      //     d3.select(event.target).property("value")
      //   );
    });

    causeIdInput.on("change", (event) => {
      console.log("causeId is changed");
      //   this.data.Edge.CauseId = d3.select(event.target).property("value");
    });
  }

  createAndOrItemContent() {
    this.content.style("padding-right", "0"); // reduced to save space

    // Button to add new items
    var addButton = this.content
      .append("button")
      .attr("class", "button input-item cause-item__add-button")
      .text("Add Operand");

    addButton.on("click", this.appendInnerItem.bind(this, true, null));
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
      onRemove: isRemovable
        ? () => {
            itemSelection.remove();
          }
        : null,
      isRoot: false, // New inner item is not root item,
      causesExpression: causesExpression ?? null,
    });
    newItem.init();

    return newItem;
  }

  createNotItemContent() {
    // const inner = this.content.append("div");
    this.content.style("padding-right", "0"); // reduced to save space

    if (!this.causesExpression) this.appendInnerItem(false, null); // Else it must be added recursively
  }
}
