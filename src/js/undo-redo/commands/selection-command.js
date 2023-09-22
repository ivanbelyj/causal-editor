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
    // Some selection commands should be ignored
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
}
