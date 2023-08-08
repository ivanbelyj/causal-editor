import * as d3 from "d3";
import { CausesItem } from "./causes-item.js";

export class CausesComponent {
  constructor(selector, causalModelFact, causalView) {
    this.component = d3.select(selector);
    this.causalModelFact = causalModelFact;
    this.causalView = causalView;
  }

  init() {
    this.component.attr("class", "causes-component component");
    this.content = this.component.append("div").attr("class", "input-item");

    this.causalView.structure.addEventListener(
      "nodeClicked",
      function (event) {
        const causalModelFact = event.data.i.data;
        this.reset(causalModelFact);
      }.bind(this)
    );

    this.buildRoot();
  }

  reset(causalModelFact) {
    this.causalModelFact = causalModelFact;
    d3.select(this.rootCausesItem.selector).html("");
    this.buildRoot();
  }

  buildRoot() {
    const rootCausesItem = (this.rootCausesItem = new CausesItem({
      selector: this.content.node(),
      isRemovable: false,
      onRemove: null,
      isRoot: true,
      causesExpression: this.causalModelFact?.ProbabilityNest?.CausesExpression,
    }));
    rootCausesItem.init();

    this.createWeightsNest();

    const probabilityNest = this.causalModelFact?.ProbabilityNest;
    if (probabilityNest) {
      this.rootCausesItem.buildFromCausalExpression(
        probabilityNest.CausesExpression
      );
    }
  }

  createWeightsNest() {}
}
