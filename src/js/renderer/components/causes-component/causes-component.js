import { CausesItem } from "./causes-item.js";
import { CausesExpressionProvider } from "../providers/causes-expression-provider.js";
import { BaseCausesComponent } from "../base-causes-component.js";

export class CausesComponent extends BaseCausesComponent {
  shouldHandleReset(nodeData) {
    return !!(nodeData.fact);
  }

  render(nodeData) {
    const fact = nodeData.fact;

    const rootCausesExpr = fact.causesExpression;
    const rootCausesItem = new CausesItem({
      selector: this.content.node(),
      isRemovable: false,
      isRoot: true,
      rootCausesExpression: rootCausesExpr,
      causalView: this.causalView,
      causesExpressionProvider: new CausesExpressionProvider(
        this.undoRedoManager,
        this.causesChangeManager,
        fact
      ),
    });
    rootCausesItem.resetProvider(rootCausesExpr);
  }
}
