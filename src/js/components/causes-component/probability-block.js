import * as d3 from "d3";
import { CausesItem } from "./causes-item.js";

// Block representing probability nest in causes component
export class ProbabilityBlock {
  constructor(selector, causalView) {
    this.content = d3.select(selector);
    this.causalView = causalView;
  }

  reset(causalModelFact) {
    this.causalModelFact = causalModelFact;

    const rootCausesExpr =
      this.causalModelFact?.ProbabilityNest?.CausesExpression;
    if (!this.rootCausesItem) {
      const rootCausesItem = (this.rootCausesItem = new CausesItem({
        selector: this.content.node(),
        isRemovable: false,
        isRoot: true,
        onCausesRemove: this.onCausesRemove.bind(this),
        onCauseIdChange: this.onCauseIdChange.bind(this),
        rootCausesExpression: rootCausesExpr,
        causalView: this.causalView,
      }));
      rootCausesItem.init();
    }
    this.rootCausesItem.reset(rootCausesExpr);
  }

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
}
