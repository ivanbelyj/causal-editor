import { Command } from "./command";

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
    this.redoStack = [];

    const lastInUndo =
      this.undoStack?.length > 0 && this.undoStack[this.undoStack.length - 1];
    let cmdToPush = command;
    if (
      lastInUndo &&
      command.mergeGroup &&
      command.mergeGroup === lastInUndo.mergeGroup
    ) {
      cmdToPush = UndoRedoManager.mergeSelectionCommands([
        this.undoStack.pop(),
        command,
      ]); // Replace with a merged command
    }

    this.undoStack.push(cmdToPush);

    console.log("after command execute", this.undoStack, this.redoStack);
  }

  static mergeSelectionCommands(commands) {
    if (!commands || commands.lenght === 0)
      console.error("Cannot merge commands: ", commands);
    return new Command(
      commands[commands.length - 1].execute,
      commands[0].undo,
      commands[0].mergeGroup
    );
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
