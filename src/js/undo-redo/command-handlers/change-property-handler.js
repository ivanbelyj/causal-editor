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
      const prevCmd = this.undoRedoManager.undoStack.pop();
      // Replace with a merged command
      cmdToPush = prevCmd.mergedWith(executedCommand);
      console.log("commands are merged", prevCmd, executedCommand);
    } else {
      console.log("commands was not merged");
    }
    return cmdToPush;
  }

  static shouldMergePropertyChangeCommands(cmd1, cmd2) {
    return (
      cmd1 &&
      cmd2 &&
      ChangePropertyHandler.isChangePropertyCommand(cmd1) &&
      ChangePropertyHandler.isChangePropertyCommand(cmd2) &&
      cmd1.propertyId === cmd2.propertyId
      // Only commands applied to the same property can be merged
    );
  }
}
