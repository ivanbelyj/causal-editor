// Commands handler are used to handle actions from undo-redo manager
export class CommandsHandler {
  constructor(undoRedoManager) {
    this.undoRedoManager = undoRedoManager;
  }

  shouldHandle() {
    return false;
  }

  getCommandToPushToUndoStack(command) {
    return command;
  }

  // shouldClearRedoStack() {
  //   return true;
  // }
}
