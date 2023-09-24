import { Command } from "./command";

export class CommandUtils {
  static executeChangeStateCommand(
    undoRedoManager,
    setStateFunc,
    newState,
    prevState
  ) {
    undoRedoManager.execute(
      CommandUtils.createChangeStateCommand(setStateFunc, newState, prevState)
    );
  }

  static createChangeStateCommand(setStateFunc, newState, prevState) {
    return new Command(
      () => setStateFunc(newState),
      () => setStateFunc(prevState)
    );
  }

  static executeUndoRedoActionCommand(
    undoRedoManager,
    undoFunc,
    redoFunc,
    ...args
  ) {
    undoRedoManager.execute(
      new Command(
        () => undoFunc(...args),
        () => redoFunc(...args)
      )
    );
  }
}
