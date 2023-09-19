export class Command {
  // Commands that have the same merge group will be merged into MacroCommand
  constructor(executeCallback, undoCallback) {
    // this.executeCallback = executeCallback;
    // this.undoCallback = undoCallback;
    this.execute = executeCallback;
    this.undo = undoCallback;
  }

  // execute() {
  //   this.executeCallback();
  // }

  // undo() {
  //   this.undoCallback();
  // }
}
