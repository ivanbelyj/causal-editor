export class Command {
  constructor(executeCallback, undoCallback) {
    this.executeCallback = executeCallback;
    this.undoCallback = undoCallback;
  }

  execute() {
    this.executeCallback();
  }

  undo() {
    this.undoCallback();
  }
}
