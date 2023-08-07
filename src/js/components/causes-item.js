import * as d3 from "d3";

export class CausesItem {
  constructor(selector, probabilityNest, isInnerItem, onRemove) {
    this.component = d3.select(selector);
    this.data = probabilityNest;
    this.isInnerItem = isInnerItem ?? false;
    this.onRemove = onRemove ?? null;
  }

  init() {
    // this.component.attr("class", "causes-component component");

    const itemTop = this.component
      .append("div")
      .attr("class", "causes-item__item-top");

    const selectElem = itemTop
      .append("select")
      .attr("class", "input-item input-item__input");

    if (this.isInnerItem) {
      // itemTop.append("button").attr("class", "button").text("Remove");
      itemTop
        .append("img")
        .attr("src", "images/bin.svg")
        .attr("class", "causes-item__remove-icon")
        .on("click", this.onRemove);
    }

    selectElem.append("option").attr("value", "not selected").text("None");
    selectElem.append("option").attr("value", "factor").text("Factor");
    selectElem.append("option").attr("value", "and").text("And");
    selectElem.append("option").attr("value", "or").text("Or");

    selectElem.on(
      "change",
      function () {
        var selectedValue = selectElem.node().value;

        this.updateComponent(selectedValue);
      }.bind(this)
    );
  }

  updateComponent(type) {
    // обновляем $type в данных
    // this.data.CausesExpression.$type = type;
    if (!this.content) this.content = this.component.append("div");
    this.content.html("");

    switch (type) {
      case "factor":
        if (this.isInnerItem) {
          this.content.style("padding-right", "1em");
        }
        this.createFactorComponent();
        break;
      case "and":
      case "or":
        this.createAndOrComponent();
        break;
      default:
    }
  }

  createFactorComponent() {
    // this.content.html(function (d, i) {
    //   return `
    //     <div>
    //         <input type="number" class="input-item text-input input-item__input" placeholder="Probability">
    //         <input type="number" class="input-item text-input input-item__input" placeholder="CauseId">
    //     </div>
    //     `;
    // });
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

  createAndOrComponent() {
    // создаем элементы для добавления новых операндов
    var addButton = this.content
      .append("button")
      .attr("class", "button input-item cause-item__add-button")
      .text("Add Operand");

    let listParent; // Created only after click

    // добавляем обработчик событий на клик по кнопке
    addButton.on("click", () => {
      if (!listParent)
        listParent = this.content
          .append("ul")
          .attr("class", "causes-item__content");

      const newItem = listParent
        .append("li")
        .attr("class", "causes-item__inner-item");

      // создаем новый компонент для нового операнда
      var operandComponent = new CausesItem(
        newItem.node(),
        null,
        true,
        () => {
          newItem.remove();
        }
        // this.data.Operands[this.data.Operands.length - 1]
      );
      operandComponent.init();
    });
  }
}
