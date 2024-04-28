import { Command } from "./command";

export class ChangePropertyCommand extends Command {
  // propertyId is required to distinguish different properties change
  constructor(setPropertyFunc, newValue, oldValue, propertyId) {
    super(
      () => setPropertyFunc(newValue),
      () => setPropertyFunc(oldValue)
    );
    this.setPropertyFunc = setPropertyFunc;
    this.newValue = newValue;
    this.oldValue = oldValue;
    this.propertyId = propertyId;
  }

  // Todo: not merge, but separate into words?
  mergedWith(command) {
    return new ChangePropertyCommand(
      this.setPropertyFunc,
      command.newValue,
      this.oldValue,
      this.propertyId
    );
  }
}
