import { Command } from "./command";

export class CommandUtils {
  static executeChangeStateCommand(
    undoRedoManager,
    setStateFunc,
    newState,
    prevState
  ) {
    undoRedoManager.execute(
      new Command(
        () => setStateFunc(newState),
        () => setStateFunc(prevState)
      )
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
