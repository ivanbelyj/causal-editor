import * as d3 from "d3";
import { CausesItem } from "./causes-item.js";

export class CausesComponent {
  constructor(selector, causalView) {
    this.component = d3.select(selector);
    this.causalView = causalView;
  }

  // Actions that are relevant to CausesComponent regardless of causalModelFact structure.
  // init() must be called only once
  init(causalModelFact) {
    this.component.attr("class", "causes-component component");
    this.content = this.component.append("div").attr("class", "input-item");

    this.causalView.structure.addEventListener(
      "nodeClicked",
      function (event) {
        const causalModelFact = event.data.i.data;
        this.reset(causalModelFact);
      }.bind(this)
    );

    if (causalModelFact) this.reset(causalModelFact);
  }

  reset(causalModelFact) {
    this.causalModelFact = causalModelFact;
    // d3.select(this.rootCausesItem.selector).html("");
    // this.buildRoot();
    if (!this.rootCausesItem) {
      const rootCausesItem = (this.rootCausesItem = new CausesItem({
        selector: this.content.node(),
        isRemovable: false,
        isRoot: true,
      }));
      rootCausesItem.init();
    }
    this.rootCausesItem.reset(
      causalModelFact?.ProbabilityNest?.CausesExpression
    );
    console.log("reset with ", this.rootCausesItem.causesExpression);
  }

  createRoot() {
    const rootCausesItem = (this.rootCausesItem = new CausesItem({
      selector: this.content.node(),
      isRemovable: false,
      isRoot: true,
    }));
    rootCausesItem.init();
    // this.causalModelFact?.ProbabilityNest?.CausesExpression

    // const probabilityNest = this.causalModelFact?.ProbabilityNest;
    // if (probabilityNest) {
    //   this.rootCausesItem.buildFromCausalExpression(
    //     probabilityNest.CausesExpression
    //   );
    // }
  }

  createWeightsNest() {}
}
