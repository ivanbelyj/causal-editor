export class Command {
  constructor(execute, undo) {
    this.execute = execute;
    this.undo = undo;
  }
}
