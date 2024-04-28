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
    // console.log("reset data provider with ", value);
  }

  _getFrozenOrNull(obj) {
    return obj ? Object.freeze({ ...obj }) : null;
  }

  get() {
    return this._getFrozenOrNull(this._data);
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

  // Todo: property changed and fact property changed
  _dispatchPropertyChanged(propertyName, newValue) {
    const event = new Event("property-changed");
    event.propertyName = propertyName;
    event.newValue = newValue;
    this.dispatchEvent(event);
  }
}
