import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";
import { ScreenUtils } from "./screen-utils.js";
import { Command } from "../undo-redo/commands/command.js";

// Class that allows to create or remove nodes in causal view
export class NodesCreateRemoveManager {
  constructor(causalViewStructure, causesChangeManager) {
    this.structure = causalViewStructure;
    this.causesChangeManager = causesChangeManager;
  }

  getCreateNodeCommand(x, y, fact) {
    console.log("causesChangeManager: ", this.causesChangeManager);
    fact = fact ?? this.createCausalModelFact();
    return new Command(
      () =>
        this.createNodeByMousePos(
          fact,
          x,
          y
          // this.structure.nodeWidth,
          // this.structure.nodeHeight
        ),
      () => this.#removeNodeById(fact.Id)
    );
  }

  #removeNodeById(id) {
    this.structure.removeNode(id);
    this.structure.render();
  }

  getRemoveNodeCommand(x, y, factId) {
    factId = factId ?? this.getNodeIdByPos(x, y);
    const node = this.structure.getNodeById(factId);
    return new Command(
      () => this.#removeNodeById(factId),
      () =>
        this.createNodeWithNodeData(
          node.data,
          { x: node.ux, y: node.uy }
          // this.structure.nodeWidth,
          // this.structure.nodeHeight
        )
    );
  }

  createCausalModelFact() {
    const newFact = CausalModelUtils.createNewFactWithFactor();
    newFact.Id = crypto.randomUUID();
    return newFact;
  }

  // Todo: handle causes changing after remove
  createNodeWithNodeData(fact, nodeData) {
    this.structure.addNode(fact, nodeData);

    this.causesChangeManager.onCausesAdd(
      fact,
      CausalModelUtils.getCausesIdsUnique(fact)
    );

    this.structure.render();

    function getOffset(size) {
      return size ? size / 2 : 0;
    }
  }

  createNodeByMousePos(fact, x, y, nodeWidth, nodeHeight) {
    const causalViewElement = ScreenUtils.elementWithClassFrom(
      { x, y },
      "causal-view"
    );
    if (!causalViewElement) {
      console.error("trying to create a node outside the causal-view");
      return;
    }

    this.createNodeWithNodeData(
      fact,
      ScreenUtils.screenPointToSvg({
        x: x,
        y: y,
      })
    );
  }

  getNodeIdByPos(x, y) {
    const nodeElement = ScreenUtils.nodeElementFromPoint({ x, y }, "node");
    const nodeData = d3.select(nodeElement).data()[0];
    return nodeData.data.Id;
  }
}
