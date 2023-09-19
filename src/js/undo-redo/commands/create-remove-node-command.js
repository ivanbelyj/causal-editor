import { Command } from "./command";

export class CreateRemoveNodeCommand extends Command {
  // manager and nodeData
  constructor(nodesCreateRemoveManager, isCreate, { x, y, fact }) {
    const createFunc = nodesCreateRemoveManager.createNode.bind(
      nodesCreateRemoveManager,
      x,
      y,
      fact
    );
    const removeFunc = nodesCreateRemoveManager.removeNode.bind(
      nodesCreateRemoveManager,
      x,
      y,
      fact
    );
    super(
      isCreate ? createFunc : removeFunc,
      isCreate ? removeFunc : createFunc
    );
  }
}
