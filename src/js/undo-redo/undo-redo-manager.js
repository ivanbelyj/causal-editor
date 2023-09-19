import { Command } from "./commands/command";
import { SelectionCommand } from "./commands/selection-command";

const isShowLogMessages = true;
export class UndoRedoManager {
  constructor(api) {
    this.api = api;
    api.onUndo(this.undo.bind(this));
    api.onRedo(this.redo.bind(this));

    this.api.onReset(this.reset.bind(this));

    this.reset();
  }

  reset() {
    // console.log("reset undoRedoManager");
    this.undoStack = [];
    this.redoStack = [];
  }

  execute(command) {
    // if (isShowLogMessages)
    //   console.log("before command execute", this.undoStack, this.redoStack);
    command.execute();
    this.redoStack = [];

    const cmdToPush = this.getCommandToPushToUndoStack(command);
    // If command shouldn't be ignored
    if (cmdToPush) this.undoStack.push(cmdToPush);

    if (isShowLogMessages)
      console.log(
        "executed command",
        !cmdToPush ? "(ignored by undo)" : "",
        command,
        "undoStack",
        this.undoStack,
        "redoStack",
        this.redoStack
      );
  }

  static peek(stack) {
    return stack?.length > 0 && stack[stack.length - 1];
  }

  getCommandToPushToUndoStack(executedCommand) {
    if (
      executedCommand instanceof SelectionCommand &&
      !executedCommand.shouldPush()
    )
      return null;

    const undoStackHead = UndoRedoManager.peek(this.undoStack);
    let cmdToPush = executedCommand;
    if (
      UndoRedoManager.shouldMergeSelectoinCommands(
        undoStackHead,
        executedCommand
      )
    ) {
      // Replace with a merged command
      cmdToPush = this.undoStack.pop().mergedWith(executedCommand);
    }
    return cmdToPush;
  }

  static shouldMergeSelectoinCommands(cmd1, cmd2) {
    return (
      cmd1 &&
      cmd2 &&
      cmd1 instanceof SelectionCommand &&
      cmd2 instanceof SelectionCommand &&
      cmd1.shouldMerge() &&
      cmd2.shouldMerge()
    );
  }

  undo() {
    try {
      if (this.undoStack.length > 0) {
        const command = this.undoStack.pop();
        if (isShowLogMessages) console.log("undo", command);

        this.redoStack.push(command);
        command.undo();
      }
    } catch (err) {
      console.error("catched error", err);
    }
  }

  redo() {
    try {
      if (this.redoStack.length > 0) {
        const command = this.redoStack.pop();
        if (isShowLogMessages) console.log("redo", command);

        this.undoStack.push(command);
        command.execute();
      }
    } catch (err) {
      console.error("catched error", err);
    }
  }
}
