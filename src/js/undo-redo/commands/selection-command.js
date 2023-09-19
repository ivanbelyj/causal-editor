import { Command } from "./command";

export class SelectionCommand extends Command {
  constructor(selectionManager, newSelectedNodeIds, prevSelectedNodeIds) {
    super(
      selectionManager.setSelectedNodeIds.bind(
        selectionManager,
        newSelectedNodeIds
      ),
      selectionManager.setSelectedNodeIds.bind(
        selectionManager,
        prevSelectedNodeIds
      )
    );

    this.newSelectedNodeIds = [...newSelectedNodeIds];
    this.prevSelectedNodeIds = [...prevSelectedNodeIds];

    this.selectionManager = selectionManager;
  }

  shouldMerge() {
    // Merge only if the old selection is a subset
    return SelectionCommand.isSubsetOrEqual(
      this.newSelectedNodeIds,
      this.prevSelectedNodeIds
    );
  }

  shouldPush() {
    // Some SelectionCommand-s should be ignored
    return (
      this.newSelectedNodeIds.length > 0 || this.prevSelectedNodeIds.length > 0
    );
  }

  static isSubsetOrEqual(superset, subset) {
    return subset.every((x) => superset.includes(x));
  }

  mergedWith(command) {
    return new SelectionCommand(
      this.selectionManager,
      command.newSelectedNodeIds,
      this.prevSelectedNodeIds
    );
  }

  //   static mergeSelectionCommands(commands) {
  //     if (!commands || commands.lenght === 0)
  //       console.error("Cannot merge commands: ", commands);
  //     return new Command(
  //       commands[commands.length - 1].execute,
  //       commands[0].undo,
  //       commands[0].mergeGroup,
  //       "merged"
  //     );
  //   }
}
