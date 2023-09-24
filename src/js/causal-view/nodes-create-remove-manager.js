import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";
import { ScreenUtils } from "./screen-utils.js";
import { Command } from "../undo-redo/commands/command.js";
import { CreateRemoveNodeCommand } from "../undo-redo/commands/create-remove-node-command.js";

// Class that allows to create or remove nodes in causal view
export class NodesCreateRemoveManager {
  constructor(causalViewStructure) {
    this.structure = causalViewStructure;
  }

  getCreateNodeCommand(x, y, fact) {
    fact = fact ?? this.createCausalModelFact();
    return new CreateRemoveNodeCommand(this, true, { x, y, fact });
  }

  getRemoveNodeCommand(x, y, fact) {
    fact =
      fact ??
      this.structure.getNodeById(this.getNodeIdByPosWithOffset(x, y)).data;
    return new CreateRemoveNodeCommand(this, false, { x, y, fact });
  }

  createCausalModelFact() {
    const newFact = CausalModelUtils.createNewFactWithFactor();
    newFact.Id = crypto.randomUUID();
    return newFact;
  }

  createNode(x, y, fact) {
    const causalViewElement = ScreenUtils.elementWithClassFrom(
      { x, y },
      "causal-view"
    );
    if (!causalViewElement) return;

    // if (!fact) fact = this.createCausalModelFact();

    this.structure.addNode(fact, ScreenUtils.screenPointToSvg({ x, y }));
    this.structure.render();
  }

  // Todo: fix bug
  // 1. create a new node in saved CM and do nothing with it
  // 2. remove the new node
  // 3. Error - Cannot read properties of undefined (reading 'data')
  // This bug appears not in every saved CM

  // 1. Open test1.json
  // 2. remove node Colony
  // 3. The same error

  removeNode(x, y, fact) {
    const id = fact?.Id ?? this.getNodeIdByPosWithOffset(x, y);
    this.structure.removeNode(id);
    this.structure.render();
  }

  getNodeIdByPosWithOffset(x, y) {
    const nodeElement = ScreenUtils.nodeElementFromPoint(
      { x: x + 10, y: y + 10 }, // Todo: get center of the node
      "node"
    );
    const nodeData = d3.select(nodeElement).data()[0];
    return nodeData.data.Id;
  }
}
