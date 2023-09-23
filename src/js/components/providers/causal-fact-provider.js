import { DataProvider } from "./data-provider";
import { Command } from "../../undo-redo/commands/command";
import { CommandUtils } from "../../undo-redo/commands/command-utils";
import { MacroCommand } from "../../undo-redo/commands/macro-command";

export class CausalFactProvider extends DataProvider {
  constructor(undoRedoManager, causesChangeManager) {
    super(undoRedoManager, causesChangeManager);
  }

  get _causalFact() {
    return this._data;
  }
  set _causalFact(value) {
    this._data = value;
  }

  #getWeights() {
    return this._causalFact?.WeightNest?.Weights;
  }

  #setInitialWeightNest() {
    this._causalFact.WeightNest = {
      Weights: [],
    };
  }

  addNewWeightEdge() {
    // const newEdge = this.#createDefaultWeightEdge(false);
    // const cmd = new Command(
    //   () => this.#addWeightEdge(newEdge),
    //   () => this.#removeWeightEdge(newEdge)
    // );

    CommandUtils.executeUndoRedoActionCommand(
      this.undoRedoManager,
      this.#addWeightEdge.bind(this),
      this.#removeWeightEdge.bind(this),
      this.#createDefaultWeightEdge(null)
    );
  }

  #createDefaultWeightEdge(abstractFactId) {
    return {
      Weight: 1,
      CauseId: abstractFactId ?? null,
    };
  }

  #addWeightEdge(newWeight) {
    if (!this.#getWeights()) {
      this.#setInitialWeightNest();
    }
    const weights = this.#getWeights();

    weights.push(newWeight);

    if (newWeight.CauseId)
      this.causesChangeManager.onCausesAdd([newWeight.CauseId]);

    this._dispatchMutated();
  }

  #removeWeightEdge(weightEdge) {
    const weights = this.#getWeights();
    const removeIndex = weights.indexOf(weightEdge);
    if (removeIndex != -1) {
      const edgeToRemove = weights[removeIndex];
      weights.splice(removeIndex, 1);
      if (edgeToRemove.CauseId) {
        console.log("on removed causes: ", edgeToRemove);
        this.causesChangeManager.onCausesRemoved([edgeToRemove.CauseId]);
      } else {
        // There is no removed causes
        console.log("removed weight edge had no causeId. edge:", edgeToRemove);
      }

      if (weights.length === 0) {
        this._causalFact.WeightNest = null;
      }

      this._dispatchMutated();
    } else {
      console.error("trying to remove weight edge that doesn't exist");
    }
  }

  removeEdge(weightEdge) {
    CommandUtils.executeUndoRedoActionCommand(
      this.undoRedoManager,
      this.#removeWeightEdge.bind(this),
      this.#addWeightEdge.bind(this),
      weightEdge
    );
  }

  // Todo: fix bug
  // 1. create abstract fact and a variant (link it by default selecting
  // abstract fact with adding new weight)
  // 2. remove the only weight (or clear cause id)
  // 3. clear abstract fact via select-id-element
  // 4. there is a one redundant link displayed on causal-view

  changeAbstractFactId(newAbstrId) {
    const oldAbstrId = this._causalFact.AbstractFactId;

    let cmdToExecute = new Command(
      () => {
        this.#changeAbstractFactId(newAbstrId);
      },
      () => {
        this.#changeAbstractFactId(oldAbstrId);
      }
    );

    if (!this.#getWeights()?.length && newAbstrId) {
      const defaultWeightEdge = this.#createDefaultWeightEdge(newAbstrId);
      const addRemoveEdgeCmd = new Command(
        () => {
          // Add first weight edge
          this.#addWeightEdge(defaultWeightEdge);
        },
        () => {
          // If there was the first weight edge added automatically,
          // remove it also automatically
          this.#removeWeightEdge(defaultWeightEdge);
        }
      );
      cmdToExecute = MacroCommand.fromCommands(cmdToExecute, addRemoveEdgeCmd);
    }

    this.undoRedoManager.execute(cmdToExecute);
  }

  #changeAbstractFactId(newId) {
    const oldAbstrId = this._causalFact.AbstractFactId;
    this._causalFact.AbstractFactId = newId;
    console.log("before on cause id change", this._causalFact);
    console.log("abstract id must be updated");
    console.log(
      "fact ins causes change manager",
      this.causesChangeManager.causalModelFact,
      "(must be the same)"
    );
    this.causesChangeManager.onCauseIdChanged(oldAbstrId, newId);

    this._dispatchMutated();
  }

  // // Gets frozen weight edge and return actual that can be mutated
  // #getActualWeightEdge(weightEdge) {
  //   return this.#getWeights().find((edge) => edge === weightEdge);
  // }

  changeWeightEdgeWeight(weightEdge, newWeight) {
    const setWeightEdge = (weight) => {
      // const actualWeightEdge = this.#getActualWeightEdge(weightEdge);
      weightEdge.Weight = weight;
      this._dispatchMutated();
    };
    const oldWeight = weightEdge.Weight;

    CommandUtils.executeChangeStateCommand(
      this.undoRedoManager,
      setWeightEdge,
      newWeight,
      oldWeight
    );
    // const cmd = new Command(
    //   () => setWeightEdge(newWeight),
    //   () => setWeightEdge(oldWeight)
    // );
    // this.undoRedoManager.execute(cmd);
  }

  changeWeightEdgeCauseId(weightEdge, newCauseId) {
    const setWeightEdge = (newCauseId) => {
      // const actualWeightEdge = this.#getActualWeightEdge(weightEdge);
      const oldCauseId = weightEdge.CauseId;
      weightEdge.CauseId = newCauseId;
      this.causesChangeManager.onCauseIdChanged(oldCauseId, newCauseId);
      this._dispatchMutated();
    };
    const oldCauseId = weightEdge.CauseId;

    CommandUtils.executeChangeStateCommand(
      this.undoRedoManager,
      setWeightEdge,
      newCauseId,
      oldCauseId
    );
    // const cmd = new Command(
    //   () => setWeightEdge(newCauseId),
    //   () => setWeightEdge(oldCauseId)
    // );
    // this.undoRedoManager.execute(cmd);
  }
}
