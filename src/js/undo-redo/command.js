export class Command {
  // Commands that have the same merge group will be merged into MacroCommand
  constructor(execute, undo, mergeGroup, debugData) {
    this.execute = execute;
    this.undo = undo;
    this.mergeGroup = mergeGroup ?? null;
    this.debugData = debugData;
  }

  // static merged(commands) {
  //   if (!commands || commands.lenght === 0)
  //     console.error("Cannot merge commands: ", commands);
  //   // return new Command(
  //   //   commands.forEach.bind(this, (x) => x.execute()),
  //   //   commands.forEach.bind(this, (x) => x.undo()),
  //   //   commands[0].mergeGroup, // mergeGroup is the same for all array
  //   //   commands.map((x) => x.debugData)
  //   // );
  //   return new Command(
  //     commands[commands.length - 1].execute,
  //     commands[0].undo,
  //     commands[0].mergeGroup
  //   );
  // }
}
