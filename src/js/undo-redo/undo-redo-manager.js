export class UndoRedoManager {
  constructor(api) {
    this.api = api;
    api.onUndo(this.undo.bind(this));
    api.onRedo(this.redo.bind(this));

    this.api.onReset(this.reset.bind(this));

    this.reset();
  }

  reset() {
    console.log("reset undoRedoManager");
    this.undoStack = [];
    this.redoStack = [];
  }

  execute(command) {
    console.log("before command execute", this.undoStack, this.redoStack);
    command.execute();
    this.undoStack.push(command);
    console.log("after command execute", this.undoStack, this.redoStack);
  }

  undo() {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop();
      this.redoStack.push(command);
      command.undo();
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop();
      this.undoStack.push(command);
      command.execute();
    }
  }
}
