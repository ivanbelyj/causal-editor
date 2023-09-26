import { Command } from "./command";

export class ChangePropertyCommand extends Command {
  constructor(setPropertyFunc, newValue, oldValue) {
    super(
      () => setPropertyFunc(newValue),
      () => setPropertyFunc(oldValue)
    );
    this.setPropertyFunc = setPropertyFunc;
    this.newValue = newValue;
    this.oldValue = oldValue;
  }

  // Todo: not merge, but separate into words?
  mergedWith(command) {
    return new ChangePropertyCommand(
      this.setPropertyFunc,
      command.newValue,
      this.oldValue
    );
  }
}
