import * as d3 from "d3";
import { CausesItem } from "./causes-item.js";
import { CausesExpressionProvider } from "../providers/causes-expression-provider.js";

export class CausesComponent {
  constructor(selector, causalView, api, undoRedoManager, causesChangeManager) {
    this.component = d3.select(selector);
    this.causalView = causalView;
    this.undoRedoManager = undoRedoManager;
    this.causesChangeManager = causesChangeManager;

    api.onReset(
      function (event, data) {
        this.reset(null);
      }.bind(this)
    );
  }

  // Actions that are relevant to CausesComponent regardless of causalModelFact structure.
  // init() must be called only once
  init() {
    this.component.classed("component", true);
    this.content = this.component.append("div").attr("class", "input-item");

    // Todo: add event listeners for components in external code?
    this.causalView.selectionManager.addEventListener(
      "singleNodeSelected",
      function (event) {
        const causalModelFact = event.nodeData.fact;
        this.reset(causalModelFact);
      }.bind(this)
    );

    this.causalView.selectionManager.addEventListener(
      "singleNodeNotSelected",
      function (event, data) {
        this.reset(null);
      }.bind(this)
    );
  }

  reset(causalModelFact) {
    this.causalModelFact = causalModelFact;

    this.content.html("");
    if (!causalModelFact) {
      return;
    }

    const rootCausesExpr =
      this.causalModelFact.ProbabilityNest?.CausesExpression;
    // if (!this.rootCausesItem) {
    // this.rootCausesItem =
    const rootCausesItem = new CausesItem({
      selector: this.content.node(),
      isRemovable: false,
      isRoot: true,
      rootCausesExpression: rootCausesExpr,
      causalView: this.causalView,
      causesExpressionProvider: new CausesExpressionProvider(
        this.undoRedoManager,
        this.causesChangeManager,
        causalModelFact
      ),
    });
    // }
    // this.rootCausesItem
    rootCausesItem.resetProvider(rootCausesExpr);
  }
}
