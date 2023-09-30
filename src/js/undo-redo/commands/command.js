export class Command {
  #isSafeForData;

  get isSafeForData() {
    return this.#isSafeForData;
  }

  // isSafeForData is actual for commands that don't modify
  // the state of causal model project and should be ignored in some cases
  constructor(executeCallback, undoCallback, isSafeForData) {
    this.executeCallback = executeCallback;
    this.undoCallback = undoCallback;
    this.#isSafeForData = isSafeForData;
  }

  execute() {
    this.executeCallback();
  }

  undo() {
    this.undoCallback();
  }
}
