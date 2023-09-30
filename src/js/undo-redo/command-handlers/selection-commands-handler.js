import { SelectionCommand } from "../commands/selection-command";
import { CommandsHandler } from "./commands-handler";

export class SelectionCommandsHandler extends CommandsHandler {
  shouldHandle(cmd) {
    return this.#isSelectionCommand(cmd);
  }

  // shouldClearRedoStack(cmd) {
  //   return !this.#isSelectionCommand(cmd);
  // }

  #isSelectionCommand(cmd) {
    return cmd instanceof SelectionCommand;
  }

  getCommandToPushToUndoStack(executedCommand) {
    if (this.#isSelectionCommand() && !executedCommand.shouldPush())
      return null;

    let cmdToPush = executedCommand;
    if (
      SelectionCommandsHandler.shouldMergeSelectionCommands(
        this.undoRedoManager.peekUndo(),
        executedCommand
      )
    ) {
      // Replace with a merged command
      cmdToPush = this.undoRedoManager.undoStack
        .pop()
        .mergedWith(executedCommand);
    }
    return cmdToPush;
  }

  static shouldMergeSelectionCommands(cmd1, cmd2) {
    return (
      cmd1 &&
      cmd2 &&
      cmd1 instanceof SelectionCommand &&
      cmd2 instanceof SelectionCommand &&
      cmd1.shouldMerge() &&
      cmd2.shouldMerge()
    );
  }
}
