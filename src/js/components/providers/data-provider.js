export class DataProvider extends EventTarget {
  #data;
  constructor(undoRedoManager, causesChangeManager) {
    super();
    this.undoRedoManager = undoRedoManager;
    this.causesChangeManager = causesChangeManager;
  }
  get _data() {
    return this.#data;
  }

  set _data(value) {
    this.#data = value;
  }

  get() {
    return this._data ? Object.freeze({ ...this._data }) : null;
  }

  set(newData) {
    this._data = newData;
    this._dispatchReset();
  }

  _dispatchReset() {
    this.dispatchEvent(new Event("reset"));
  }
  _dispatchMutated() {
    this.dispatchEvent(new Event("mutated"));
  }
}
