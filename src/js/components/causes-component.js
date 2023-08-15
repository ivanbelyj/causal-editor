import * as d3 from "d3";
import { CausesItem } from "./causes-item.js";
import { CausalModelUtils } from "../causal-view/causal-model-utils.js";

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
    if (!this.rootCausesItem) {
      const rootCausesItem = (this.rootCausesItem = new CausesItem({
        selector: this.content.node(),
        isRemovable: false,
        isRoot: true,
        onCausesRemove: this.onCausesRemove.bind(this),
        onCauseIdChange: this.onCauseIdChange.bind(this),
      }));
      rootCausesItem.init();
    }
    this.rootCausesItem.reset(
      causalModelFact?.ProbabilityNest?.CausesExpression
    );
  }

  // toEdgeIds(targetIds) {
  //   return targetIds.map((id) =>
  //     CausalModelUtils.sourceAndTargetIdsToEdgeId(this.causalModelFact.Id, id)
  //   );
  // }

  onCausesRemove(removedCauseIds) {
    console.log("removing cause ids", removedCauseIds);
    for (const removedCauseId of removedCauseIds) {
      this.causalView.structure.removeLink(
        removedCauseId,
        this.causalModelFact.Id
      );
      this.causalView.structure.render();
    }
  }
  onCauseIdChange(oldId, newId) {
    if (oldId)
      this.causalView.structure.removeLink(oldId, this.causalModelFact.Id);
    if (newId)
      this.causalView.structure.addLink(newId, this.causalModelFact.Id);
    if (oldId || newId) this.causalView.structure.render();
  }

  createWeightsNest() {}
}
