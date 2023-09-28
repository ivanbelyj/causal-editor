import { CausalModelUtils } from "../../causal-view/causal-model-utils";
import { Command } from "../../undo-redo/commands/command";
import { DataProvider } from "./data-provider";

// Provides api of CausesExpression change,
// performing all related actions such as CausalView updating
// (via CausesChangeManager) and undo / redo support
export class CausesExpressionProvider extends DataProvider {
  constructor(undoRedoManager, causesChangeManager, causalFact) {
    super(undoRedoManager, causesChangeManager);
    this.causalFact = causalFact;
  }

  // Todo: fix bug
  // 1. add Or -> Factor link (Or just factor)
  // 2. select other node
  // 3. Undo select
  // 4. undo link
  // 5. after undo link is hidden, but it's still in Causes Component

  get _causesExpression() {
    return this._data;
  }
  set _causesExpression(value) {
    this._data = value;
  }

  createAndSetChildrenExpressionProviders() {
    const childrenExpr = [];
    const expression = this._causesExpression;
    if (this._causesExpression.Operands)
      childrenExpr.push(...expression.Operands);
    else if (expression.CausesExpression)
      childrenExpr.push(expression.CausesExpression);
    const res = childrenExpr.map((expr) => {
      const newProvider = new CausesExpressionProvider(
        this.undoRedoManager,
        this.causesChangeManager,
        this.causalFact
      );
      newProvider.set(expr);
      return newProvider;
    });
    return res;
  }

  changeExpressionType(causalFact, newType) {
    const prevCausesExpr = structuredClone(this._causesExpression);
    const changedCausesExpr = this.getChangedTypeCausesExpression(
      this._causesExpression,
      newType // e.target.value
    );

    const cmd = new Command(
      this.mutateCausesExpression.bind(this, causalFact, changedCausesExpr),
      this.mutateCausesExpression.bind(this, causalFact, prevCausesExpr)
    );
    this.undoRedoManager.execute(cmd);
    // this.#dispatchMutated();
  }

  getChangedTypeCausesExpression(causesExpression, newType) {
    const prevType = causesExpression?.$type;
    let res = {};

    if (
      (prevType == "and" && newType == "or") ||
      (prevType == "or" && newType == "and")
    ) {
      // Structure is almost the same
      res = structuredClone(causesExpression);
    } else {
      if (newType == "and" || newType == "or") {
        res.Operands = [];
      }
      if (newType == "not") {
        // Add a child that has not been defined yet, but is required
        res.CausesExpression = CausalModelUtils.createFactorExpression();
      }
      if (newType == "factor") {
        res.Edge = {
          Probability: 1,
        };
      }
    }
    res.$type = newType;

    return res;
  }

  mutateCausesExpression(causalFact, newExpr) {
    const removedExprClone = structuredClone(this._causesExpression);

    // Tracked to update causal view
    this.causesChangeManager.onCausesExpressionAdd(
      causalFact,
      newExpr
      // CausalModelUtils.causesExpressionComplement(newExpr, removedExprClone)
    );

    // We should mutate this.causesExpression instead of creating a new one
    for (const key in this._causesExpression) {
      delete this._causesExpression[`${key}`];
    }
    Object.assign(this._causesExpression, newExpr);

    // Tracked to update causal view
    this.causesChangeManager.onCausesExpressionRemoved(
      causalFact,
      removedExprClone
      // CausalModelUtils.causesExpressionComplement(
      //   removedExprClone,
      //   this.causesExpression
      // )
    );

    // this.reset(structuredClone(newExpr));
    this._dispatchMutated();
  }

  changeProbability(newProbability) {
    const prevProbability = this._causesExpression.Edge.Probability;
    const expr = this._causesExpression;
    const setProbability = function (newVal) {
      expr.Edge.Probability = newVal;
      this._dispatchMutated();
    }.bind(this);
    const changeProbCmd = new Command(
      () => setProbability(newProbability),
      () => setProbability(prevProbability)
    );
    this.undoRedoManager.execute(changeProbCmd);
  }

  changeCauseId(causalFact, newCauseId) {
    const expr = this._causesExpression;
    const setCauseId = function (causeId) {
      const oldId = expr.Edge.CauseId;
      expr.Edge.CauseId = causeId;

      this.causesChangeManager.onCauseIdChanged(
        causalFact,
        oldId,
        expr.Edge.CauseId
      );
      this._dispatchMutated();
    }.bind(this);
    const oldCauseId = this._causesExpression?.Edge?.CauseId;
    const cmd = new Command(
      () => setCauseId(newCauseId),
      () => setCauseId(oldCauseId)
    );
    this.undoRedoManager.execute(cmd);
  }

  addNewOperand() {
    const newExpr = CausalModelUtils.createFactorExpression();
    const baseExpr = this._causesExpression;
    const causalFact = this.causalFact;
    const cmd = new Command(
      function () {
        this.#addOperand(causalFact, baseExpr, newExpr);
      }.bind(this),
      function () {
        this.#removeOperand(causalFact, baseExpr, newExpr);
      }.bind(this)
    );
    this.undoRedoManager.execute(cmd);
  }

  removeOperand(expr) {
    const baseExpr = this._causesExpression;
    const causalFact = this.causalFact;
    const cmd = new Command(
      function () {
        this.#removeOperand(causalFact, baseExpr, expr);
      }.bind(this),
      function () {
        this.#addOperand(causalFact, baseExpr, expr);
      }.bind(this)
    );
    this.undoRedoManager.execute(cmd);
  }

  #addOperand(causalFact, baseExpr, newExpr) {
    if (!newExpr) console.error("add empty operand", newExpr);
    baseExpr.Operands.push(newExpr);
    // New operand has no cause so cause change will be handled on change type

    const newExprProvider = new CausesExpressionProvider(
      this.undoRedoManager,
      this.causesChangeManager,
      causalFact
    );

    this.causesChangeManager.onCausesExpressionAdd(causalFact, newExpr);

    // onNewOperandAdded?.(newExprProvider);
    newExprProvider.set(newExpr);
    this._dispatchMutated();
  }

  #removeOperand(causalFact, baseExpr, operandExpr) {
    const removeIndex = baseExpr.Operands.indexOf(operandExpr);
    baseExpr.Operands.splice(removeIndex, 1);

    // Pass removed causes to update causal-view
    this.causesChangeManager.onCausesExpressionRemoved(causalFact, operandExpr);
    this._dispatchMutated();
  }
}
