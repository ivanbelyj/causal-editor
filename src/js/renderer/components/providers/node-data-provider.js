import { DataProvider } from "./data-provider";
import { Command } from "../../undo-redo/commands/command";
import { CommandUtils } from "../../undo-redo/commands/command-utils";
import { MacroCommand } from "../../undo-redo/commands/macro-command";
import { ChangePropertyCommand } from "../../undo-redo/commands/change-property-command";

export class NodeDataProvider extends DataProvider {
  constructor(undoRedoManager, causesChangeManager) {
    super(undoRedoManager, causesChangeManager);
  }

  get _causalFact() {
    return this._data?.fact;
  }
  // set _causalFact(value) {
  //   this._data = value;
  // }

  get _nodeData() {
    return this._data;
  }

  getFact() {
    return this._getFrozenOrNull(this._causalFact);
  }

  #getWeights(causalFact) {
    return causalFact?.WeightNest?.Weights;
  }

  #setInitialWeightNest(causalFact) {
    causalFact.WeightNest = {
      Weights: [],
    };
  }

  addNewWeightEdge() {
    // const newEdge = this.#createDefaultWeightEdge(false);
    // const cmd = new Command(
    //   () => this.#addWeightEdge(newEdge),
    //   () => this.#removeWeightEdge(newEdge)
    // );
    const causalFact = this._causalFact;

    CommandUtils.executeUndoRedoActionCommand(
      this.undoRedoManager,
      this.#addWeightEdge.bind(this, causalFact),
      this.#removeWeightEdge.bind(this, causalFact),
      this.#createDefaultWeightEdge(null)
    );
  }

  #createDefaultWeightEdge(abstractFactId) {
    return {
      Weight: 1,
      CauseId: abstractFactId ?? null,
    };
  }

  #addWeightEdge(causalFact, newWeight) {
    if (!this.#getWeights(causalFact)) {
      this.#setInitialWeightNest(causalFact);
    }
    const weights = this.#getWeights(causalFact);

    weights.push(newWeight);

    if (newWeight.CauseId)
      this.causesChangeManager.onCausesAdd(causalFact, [newWeight.CauseId]);

    this._dispatchMutated();
  }

  #removeWeightEdge(causalFact, weightEdge) {
    const weights = this.#getWeights(causalFact);
    const removeIndex = weights.indexOf(weightEdge);
    if (removeIndex != -1) {
      const edgeToRemove = weights[removeIndex];
      weights.splice(removeIndex, 1);
      if (edgeToRemove.CauseId) {
        this.causesChangeManager.onCausesRemoved(causalFact, [
          edgeToRemove.CauseId,
        ]);
      } else {
        // There is no removed causes
      }

      if (weights.length === 0) {
        causalFact.WeightNest = null;
      }

      this._dispatchMutated();
    } else {
      console.error("trying to remove weight edge that doesn't exist");
    }
  }

  removeEdge(weightEdge) {
    const causalFact = this._causalFact;
    CommandUtils.executeUndoRedoActionCommand(
      this.undoRedoManager,
      this.#removeWeightEdge.bind(this, causalFact),
      this.#addWeightEdge.bind(this, causalFact),
      weightEdge
    );
  }

  changeAbstractFactId(newAbstrId) {
    const oldAbstrId = this._causalFact.AbstractFactId;
    const causalFact = this._causalFact;

    let cmdToExecute = new Command(
      () => {
        this.#changeAbstractFactId(causalFact, newAbstrId);
      },
      () => {
        this.#changeAbstractFactId(causalFact, oldAbstrId);
      }
    );

    if (!this.#getWeights(causalFact)?.length && newAbstrId) {
      const defaultWeightEdge = this.#createDefaultWeightEdge(newAbstrId);
      const addRemoveEdgeCmd = new Command(
        () => {
          // Add first weight edge
          this.#addWeightEdge(causalFact, defaultWeightEdge);
        },
        () => {
          // If there was the first weight edge added automatically,
          // remove it also automatically
          this.#removeWeightEdge(causalFact, defaultWeightEdge);
        }
      );
      cmdToExecute = MacroCommand.fromCommands(cmdToExecute, addRemoveEdgeCmd);
    }

    this.undoRedoManager.execute(cmdToExecute);
  }

  #changeAbstractFactId(causalFact, newId) {
    const oldAbstrId = causalFact.AbstractFactId;
    causalFact.AbstractFactId = newId;

    this.causesChangeManager.onCauseIdChanged(causalFact, oldAbstrId, newId);

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

  // Todo: test with undo and non-clear redo stack selection
  changeWeightEdgeCauseId(weightEdge, newCauseId) {
    const causalFact = this._causalFact;
    const setWeightEdge = (newCauseId) => {
      // const actualWeightEdge = this.#getActualWeightEdge(weightEdge);
      const oldCauseId = weightEdge.CauseId;
      weightEdge.CauseId = newCauseId;
      this.causesChangeManager.onCauseIdChanged(
        causalFact,
        oldCauseId,
        newCauseId
      );
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

  changeNonCauseProperty(
    propertyName,
    isFactProp,
    propertyValue,
    causalViewStructureToRender
  ) {
    // this._causalFact can change after selecting another node
    const objToMutate = isFactProp ? this._causalFact : this._nodeData;
    const oldValue = objToMutate[propertyName];
    this.undoRedoManager.execute(
      new ChangePropertyCommand(
        (newVal) => {
          objToMutate[propertyName] = newVal;
          this._dispatchPropertyChanged(propertyName, propertyValue);
          causalViewStructureToRender.render();
        },
        propertyValue,
        oldValue,
        propertyName
      )
    );
  }
}
