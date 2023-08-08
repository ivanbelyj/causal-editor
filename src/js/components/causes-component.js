import * as d3 from "d3";
import { CausesItem } from "./causes-item.js";

export class CausesComponent {
  constructor(selector, causalModelFact) {
    this.component = d3.select(selector);
    this.causalModelFact = causalModelFact;
  }

  init() {
    this.component.attr("class", "causes-component component");
    const rootItemSelection = this.component
      .append("div")
      .attr("class", "input-item");
    const rootCausesItem = (this.rootCausesItem = new CausesItem({
      selector: rootItemSelection.node(),
      isRemovable: false,
      onRemove: null,
      isRoot: true,
      causesExpression: this.causalModelFact
        ? this.causalModelFact.ProbabilityNest.CausesExpression
        : null,
    }));
    rootCausesItem.init();

    this.createWeightsNest();
  }

  // setCausalModelFact(causalModelFact) {
  //   const probabilityNest = causalModelFact.ProbabilityNest;
  //   if (probabilityNest) {
  //     CausesItem.createCausesItemFromCausesExpression(
  //       this.rootCausesItem,
  //       probabilityNest.CausesExpression
  //     );
  //   }
  // }

  createWeightsNest() {}
}
