import * as d3 from "d3";
import { ProbabilityBlock } from "./probability-block.js";

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

    this.probabilityBlock = new ProbabilityBlock(
      this.content.append("div").node(),
      this.causalView
    );

    // this.weightsBlock = new WeightBlock(this.content.append("div").node());

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
    this.probabilityBlock.reset(causalModelFact);
    // this.weightsBlock.reset(causalModelFact);
  }

  // createWeightsNest() {}
}
