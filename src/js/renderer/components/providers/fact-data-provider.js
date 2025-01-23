import { Command } from "../../undo-redo/commands/command";
import { CommandUtils } from "../../undo-redo/commands/command-utils";
import { MacroCommand } from "../../undo-redo/commands/macro-command";
import { NodeDataProvider } from "./node-data-provider";

export class FactDataProvider extends NodeDataProvider {
    constructor(undoRedoManager, causesChangeManager) {
        super(undoRedoManager, causesChangeManager);
    }

    get #causalFact() {
        return this._data?.fact;
    }

    getInnerToMutate() {
        return this.#causalFact;
    }

    getInner() {
        return this.getFact();
    }

    getFact() {
        return this._getFrozenOrNull(this.#causalFact);
    }

    #getWeights(causalFact) {
        return causalFact?.weights;
    }

    #setInitialWeights(causalFact) {
        causalFact.weights = [];
    }

    addNewWeightEdge() {
        // const newEdge = this.#createDefaultWeightEdge(false);
        // const cmd = new Command(
        //   () => this.#addWeightEdge(newEdge),
        //   () => this.#removeWeightEdge(newEdge)
        // );
        const causalFact = this.#causalFact;

        CommandUtils.executeUndoRedoActionCommand(
            this.undoRedoManager,
            this.#addWeightEdge.bind(this, causalFact),
            this.#removeWeightEdge.bind(this, causalFact),
            this.#createDefaultWeightEdge(null)
        );
    }

    #createDefaultWeightEdge(abstractFactId) {
        return {
            weight: 1,
            causeId: abstractFactId ?? null,
        };
    }

    #addWeightEdge(causalFact, newWeight) {
        if (!this.#getWeights(causalFact)) {
            this.#setInitialWeights(causalFact);
        }
        const weights = this.#getWeights(causalFact);

        weights.push(newWeight);

        if (newWeight.causeId)
            this.causesChangeManager.onCausesAdd(causalFact, [newWeight.causeId]);

        this._dispatchMutated();
    }

    #removeWeightEdge(causalFact, weightEdge) {
        const weights = this.#getWeights(causalFact);
        const removeIndex = weights.indexOf(weightEdge);
        if (removeIndex != -1) {
            const edgeToRemove = weights[removeIndex];
            weights.splice(removeIndex, 1);
            if (edgeToRemove.causeId) {
                this.causesChangeManager.onCausesRemoved(causalFact, [
                    edgeToRemove.causeId,
                ]);
            } else {
                // There is no removed causes
            }

            if (weights.length === 0) {
                causalFact.weights = undefined;
            }

            this._dispatchMutated();
        } else {
            console.error("trying to remove weight edge that doesn't exist");
        }
    }

    removeEdge(weightEdge) {
        const causalFact = this.#causalFact;
        CommandUtils.executeUndoRedoActionCommand(
            this.undoRedoManager,
            this.#removeWeightEdge.bind(this, causalFact),
            this.#addWeightEdge.bind(this, causalFact),
            weightEdge
        );
    }

    changeAbstractFactId(newAbstrId) {
        const oldAbstrId = this.#causalFact.abstractFactId;
        const causalFact = this.#causalFact;

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
        const oldAbstrId = causalFact.abstractFactId;
        causalFact.abstractFactId = newId;

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
            weightEdge.weight = weight;
            this._dispatchMutated();
        };
        const oldWeight = weightEdge.weight;

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
        const causalFact = this.#causalFact;
        const setWeightEdge = (newCauseId) => {
            // const actualWeightEdge = this.#getActualWeightEdge(weightEdge);
            const oldCauseId = weightEdge.causeId;
            weightEdge.causeId = newCauseId;
            this.causesChangeManager.onCauseIdChanged(
                causalFact,
                oldCauseId,
                newCauseId
            );
            this._dispatchMutated();
        };
        const oldCauseId = weightEdge.causeId;

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
