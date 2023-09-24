import { ChangePropertyCommand } from "../commands/change-property-command";
import { CommandsHandler } from "./commands-handler";
export class ChangePropertyHandler extends CommandsHandler {
  shouldHandle(cmd) {
    return ChangePropertyHandler.isChangePropertyCommand(cmd);
  }

  shouldClearRedoStack(cmd) {
    return ChangePropertyHandler.isChangePropertyCommand(cmd);
  }

  static isChangePropertyCommand(cmd) {
    return cmd instanceof ChangePropertyCommand;
  }

  getCommandToPushToUndoStack(executedCommand) {
    if (!ChangePropertyHandler.isChangePropertyCommand(executedCommand))
      return null;

    let cmdToPush = executedCommand;
    if (
      ChangePropertyHandler.shouldMergePropertyChangeCommands(
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

  static shouldMergePropertyChangeCommands(cmd1, cmd2) {
    return (
      cmd1 &&
      cmd2 &&
      ChangePropertyHandler.isChangePropertyCommand(cmd1) &&
      ChangePropertyHandler.isChangePropertyCommand(cmd2)
    );
  }
}
