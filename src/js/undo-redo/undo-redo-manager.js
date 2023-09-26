import { ChangePropertyHandler } from "./command-handlers/change-property-handler";
import { SelectionCommandsHandler } from "./command-handlers/selection-commands-handler";

const isShowLogMessages = false;
export class UndoRedoManager {
  constructor(api) {
    this.api = api;
    api.onUndo(this.undo.bind(this));
    api.onRedo(this.redo.bind(this));

    this.api.onReset(this.reset.bind(this));

    this.reset();

    this.commandHandlers = [
      new SelectionCommandsHandler(this),
      new ChangePropertyHandler(this),
    ];
  }

  reset() {
    // console.log("reset undoRedoManager");
    this.undoStack = [];
    this.redoStack = [];
  }

  getCommandHandler(command) {
    const handlers = this.commandHandlers.filter((handler) =>
      handler.shouldHandle(command)
    );
    if (handlers.length > 1)
      console.error("Multiple command handlers are not implemented");
    else if (handlers.length === 1) return handlers[0];
    else return null;
  }

  execute(command) {
    const cmdHandler = this.getCommandHandler(command);

    // if (isShowLogMessages)
    //   console.log("before command execute", this.undoStack, this.redoStack);
    command.execute();

    const cmdToPush =
      cmdHandler?.getCommandToPushToUndoStack(command) ?? command;
    // If command shouldn't be ignored
    if (cmdToPush) {
      this.undoStack.push(cmdToPush);

      // Some commands don't clear redoStack
      if (!cmdHandler || cmdHandler.shouldClearRedoStack(cmdToPush)) {
        this.redoStack = [];
      }
    }

    if (isShowLogMessages)
      console.log(
        "executed command",
        !cmdToPush ? "(ignored)" : "",
        command,
        "undoStack",
        this.undoStack,
        "redoStack",
        this.redoStack
      );
  }

  static #peek(stack) {
    return stack?.length > 0 && stack[stack.length - 1];
  }

  peekUndo() {
    return UndoRedoManager.#peek(this.undoStack);
  }

  peekRedo() {
    return UndoRedoManager.#peek(this.redoStack);
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
