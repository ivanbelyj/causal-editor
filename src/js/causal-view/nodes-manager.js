import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";
import { ScreenUtils } from "./screen-utils.js";
import { Command } from "../undo-redo/command.js";

// Class that allows to create or remove nodes in causal view
export class NodesManager {
  constructor(causalViewStructure) {
    this.structure = causalViewStructure;
  }

  getCreateNodeCommand(x, y, fact) {
    fact = fact ?? this.createCausalModelFact();
    return new Command(
      this.createNode.bind(this, x, y, fact),
      this.removeNode.bind(this, x, y, fact)
    );
  }

  getRemoveNodeCommand(x, y, fact) {
    fact =
      fact ??
      this.structure.getNodeById(this.getNodeIdByPosWithOffset(x, y)).data;
    console.log("this fact will be created on redo", fact);
    return new Command(
      this.removeNode.bind(this, x, y, fact),
      this.createNode.bind(this, x, y, fact)
    );
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

  removeNode(x, y, fact) {
    const id = fact?.Id ?? this.getNodeIdByPosWithOffset(x, y);
    this.structure.removeNode(id);
    this.structure.render();
  }

  getNodeIdByPosWithOffset(x, y) {
    const nodeElement = ScreenUtils.nodeElementFromPoint(
      { x: x + 10, y: y + 10 }, // Todo: get center of node
      "node"
    );
    console.log("remove", nodeElement);
    const nodeData = d3.select(nodeElement).data()[0];
    return nodeData.data.Id;
  }
}
