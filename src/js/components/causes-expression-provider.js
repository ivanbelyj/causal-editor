import { CausalModelUtils } from "../causal-view/causal-model-utils";
import { Command } from "../undo-redo/commands/command";
// import { CausesExpressionCommand } from "../undo-redo/commands/causes-expression-command";

// Provides api of CausesExpression change,
// performing all related actions such as CausalView updating
// (via CausesChangeManager) and undo / redo support
export class CausesExpressionProvider extends EventTarget {
  constructor(undoRedoManager, causesChangeManager) {
    super();
    this.undoRedoManager = undoRedoManager;
    this.causesChangeManager = causesChangeManager;
  }

  set(causesExpression) {
    this._causesExpression = causesExpression;
    this.#dispatchReset();
  }

  #dispatchReset() {
    this.dispatchEvent(new Event("causes-expression-reset"));
  }
  #dispatchMutated() {
    this.dispatchEvent(new Event("causes-expression-mutated"));
  }

  get() {
    return Object.freeze({ ...this._causesExpression });
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
        this.causesChangeManager
      );
      newProvider.set(expr);
      return newProvider;
    });
    return res;
  }

  changeExpressionType(newType) {
    const prevCausesExpr = structuredClone(this._causesExpression);
    const changedCausesExpr = this.getChangedTypeCausesExpression(
      this._causesExpression,
      newType // e.target.value
    );

    const cmd = new Command(
      this.mutateCausesExpression.bind(this, changedCausesExpr),
      this.mutateCausesExpression.bind(this, prevCausesExpr)
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

  mutateCausesExpression(newExpr) {
    const removedExprClone = structuredClone(this._causesExpression);

    // Tracked to update causal view
    this.causesChangeManager.onCausesExpressionAdd(
      newExpr
      // CausalModelUtils.causesExpressionComplement(newExpr, removedExprClone)
    );

    // We should mutate this.causesExpression instead of creating a new one
    for (const key in this._causesExpression) {
      delete this._causesExpression[`${key}`];
    }
    Object.assign(this._causesExpression, newExpr);

    // Tracked to update causal view
    this.causesChangeManager.onCausesExpressionRemove(
      removedExprClone
      // CausalModelUtils.causesExpressionComplement(
      //   removedExprClone,
      //   this.causesExpression
      // )
    );

    // this.reset(structuredClone(newExpr));
    this.#dispatchMutated();
  }

  changeProbability(newProbability) {
    const prevProbability = this._causesExpression.Edge.Probability;
    const setProbability = function (newVal) {
      this._causesExpression.Edge.Probability = newVal;
      this.#dispatchMutated();
    }.bind(this);
    const changeProbCmd = new Command(
      () => setProbability(newProbability),
      () => setProbability(prevProbability)
    );
    this.undoRedoManager.execute(changeProbCmd);
  }

  changeCauseId(newCauseId) {
    const setCauseId = function (causeId) {
      const oldId = this._causesExpression.Edge.CauseId;
      this._causesExpression.Edge.CauseId = causeId;

      this.causesChangeManager.onCauseIdChange(
        oldId,
        this._causesExpression.Edge.CauseId
      );
      this.#dispatchMutated();
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
    const cmd = new Command(
      function () {
        this.#addOperand(newExpr);
      }.bind(this),
      function () {
        this.#removeOperand(newExpr);
      }.bind(this)
    );
    this.undoRedoManager.execute(cmd);
  }

  removeOperand(expr) {
    const cmd = new Command(
      function () {
        this.#removeOperand(expr);
      }.bind(this),
      function () {
        this.#addOperand(expr);
      }.bind(this)
    );
    this.undoRedoManager.execute(cmd);
  }

  #addOperand(newExpr) {
    if (!newExpr) console.error("add empty operand", newExpr);
    this._causesExpression.Operands.push(newExpr);
    // New operand has no cause so cause change will be handled on change type

    const newExprProvider = new CausesExpressionProvider(
      this.undoRedoManager,
      this.causesChangeManager
    );
    // onNewOperandAdded?.(newExprProvider);
    newExprProvider.set(newExpr);
    this.#dispatchMutated();
  }

  #removeOperand(operandExpr) {
    const removeIndex = this._causesExpression.Operands.indexOf(operandExpr);
    this._causesExpression.Operands.splice(removeIndex, 1);

    // const causesToRemove = this.getCauseIdsToRemove(removingExpr);
    // Pass removed causes to update causal-view
    this.causesChangeManager.onCausesExpressionRemove(operandExpr);
    this.#dispatchMutated();
  }
}
