import * as d3 from "d3";
import { CauseItem } from "./cause-item.js";

export class CausesComponent {
  constructor(selector, causalModelFact) {
    this.probabilityNest = causalModelFact.ProbabilityNest;
    this.component = d3.select(selector);
  }

  init() {
    this.component.attr("class", "causes-component component");
    const rootSelection = this.component
      .append("div")
      .attr("class", "input-item");
    const rootCauseItem = new CauseItem(rootSelection.node(), null);
    rootCauseItem.init();
  }
}
