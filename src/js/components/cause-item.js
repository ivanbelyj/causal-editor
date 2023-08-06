import * as d3 from "d3";

export class CauseItem {
  constructor(selector, probabilityNest) {
    this.component = d3.select(selector);
    this.data = probabilityNest;
  }

  init() {
    // this.component.attr("class", "causes-component component");

    const selectElem = this.component
      .append("select")
      .attr("class", "input-item input-item__input");

    selectElem
      .append("option")
      .attr("value", "not selected")
      .text("Not selected");
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
    if (this.content) this.content.html("");
    this.content = this.component.append("div");

    switch (type) {
      case "factor":
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
      .attr("class", "button input-item")
      .text("Add Operand");

    let listParent; // Created only after click

    // добавляем обработчик событий на клик по кнопке
    addButton.on("click", () => {
      // добавляем новый операнд
      //   this.data.Operands.push({
      //     $type: "factor",
      //     Edge: {
      //       Probability: 0,
      //       CauseId: "",
      //     },
      //   });
      if (!listParent)
        listParent = this.content
          .append("ul")
          .attr("class", "causes-item__inner-items");

      const newItem = listParent
        .append("li")
        .attr("class", "causes-item__inner-item");

      // создаем новый компонент для нового операнда
      var operandComponent = new CauseItem(
        newItem.node(),
        null
        // this.data.Operands[this.data.Operands.length - 1]
      );
      operandComponent.init();
    });
  }
}
