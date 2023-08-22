import * as d3 from "d3";
import { CausesItem } from "./causes-item.js";
import { CausesChangeManager } from "../../causal-view/causes-change-manager.js";

// Block representing probability nest in causes component
export class ProbabilityBlock {
  constructor(selector, causalView) {
    this.content = d3.select(selector);
    this.causalView = causalView;

    this.causesChangeManager = new CausesChangeManager(causalView);
  }

  reset(causalModelFact) {
    this.causalModelFact = causalModelFact;
    this.causesChangeManager.reset(causalModelFact);

    const rootCausesExpr =
      this.causalModelFact?.ProbabilityNest?.CausesExpression;
    if (!this.rootCausesItem) {
      const rootCausesItem = (this.rootCausesItem = new CausesItem({
        selector: this.content.node(),
        isRemovable: false,
        isRoot: true,
        // onCausesRemove: this.onCausesRemove.bind(this),
        // onCauseIdChange: this.onCauseIdChange.bind(this),
        causesChangeManager: this.causesChangeManager,
        rootCausesExpression: rootCausesExpr,
        causalView: this.causalView,
      }));
      rootCausesItem.init();
    }
    this.rootCausesItem.reset(rootCausesExpr);
  }
}
