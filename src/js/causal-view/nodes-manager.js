import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";
import { ScreenUtils } from "./screen-utils.js";

// Class that allows to create or remove nodes in causal view
export class NodesManager {
  constructor(causalViewStructure) {
    this.structure = causalViewStructure;
  }

  createNode(x, y) {
    const causalViewElement = ScreenUtils.elementWithClassFrom(
      { x, y },
      "causal-view"
    );
    if (!causalViewElement) return;

    const newFact = this.createCausalModelFact();

    this.structure.addNode(newFact, ScreenUtils.screenPointToSvg({ x, y }));
    this.structure.render();
  }

  createCausalModelFact() {
    const newFact = CausalModelUtils.createNewFactWithFactor();
    newFact.Id = crypto.randomUUID();
    return newFact;
  }

  removeNode(x, y) {
    const nodeElement = ScreenUtils.nodeElementFromPoint({ x, y }, "node");
    const node = d3.select(nodeElement).data()[0];
    this.structure.removeNode(node.data.Id);
    this.structure.render();
  }
}
