import * as d3 from "d3";
import { CausesItem } from "./causes-item.js";
import { CausesChangeManager } from "../causes-change-manager.js";
import { CausesExpressionProvider } from "../providers/causes-expression-provider.js";

// Block representing probability nest in causes component
export class ProbabilityBlock {
  constructor(selector, causalView, undoRedoManager) {
    this.content = d3.select(selector);
    this.causalView = causalView;
    this.undoRedoManager = undoRedoManager;

    this.causesChangeManager = new CausesChangeManager(causalView);
  }

  reset(causalModelFact) {
    this.causalModelFact = causalModelFact;
    this.causesChangeManager.reset(causalModelFact);

    if (!causalModelFact) {
      this.content.html("");
      return;
    }

    const rootCausesExpr =
      this.causalModelFact?.ProbabilityNest?.CausesExpression;
    if (!this.rootCausesItem) {
      this.rootCausesItem = new CausesItem({
        selector: this.content.node(),
        isRemovable: false,
        isRoot: true,
        rootCausesExpression: rootCausesExpr,
        causalView: this.causalView,
        causesExpressionProvider: new CausesExpressionProvider(
          this.undoRedoManager,
          this.causesChangeManager
        ),
      });
    }
    this.rootCausesItem.resetProvider(rootCausesExpr);
  }
}
