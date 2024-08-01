import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";
import { ScreenUtils } from "./screen-utils.js";
import { Command } from "../undo-redo/commands/command.js";

// Class that allows to create or remove nodes in causal view
export class NodesCreateRemoveManager {
  constructor(causalView, causesChangeManager) {
    this.structure = causalView;
    this.causesChangeManager = causesChangeManager;
  }

  getCreateNodeCommand(x, y, nodeData) {
    nodeData = nodeData ?? this.createNodeData();
    return new Command(
      () =>
        this.createNodeByMousePos(
          nodeData,
          x,
          y
          // this.structure.nodeWidth,
          // this.structure.nodeHeight
        ),
      () => this.#removeNodeById(nodeData.fact.id)
    );
  }

  #removeNodeById(id) {
    this.structure.removeNode(id);
    this.structure.render();
  }

  getRemoveNodeCommand(x, y, factId) {
    factId = factId ?? this.getNodeIdByPos(x, y);
    const nodeData = this.structure.getNodeDataById(factId);
    return new Command(
      () => this.#removeNodeById(factId),
      () =>
        this.createNodeWithNodeData(
          nodeData
          // { x: node.ux, y: node.uy }
          // this.structure.nodeWidth,
          // this.structure.nodeHeight
        )
    );
  }

  createNodeData() {
    const newFact = CausalModelUtils.createNewFactWithFactor();
    newFact.id = crypto.randomUUID();
    return { fact: newFact };
  }

  createNodeWithNodeData(nodeData) {
    this.structure.addNodeWithData(nodeData);

    this.causesChangeManager.onCausesAdd(
      nodeData,
      CausalModelUtils.getCausesIdsUnique(nodeData.fact)
    );

    this.structure.render();

    // Todo: handle causes changing after remove
    // this.structure.reset();

    function getOffset(size) {
      return size ? size / 2 : 0;
    }
  }

  // Todo: fix node creating in incorrect position after redo
  createNodeByMousePos(nodeData, x, y) {
    const causalViewElement = ScreenUtils.elementWithClassFrom(
      { x, y },
      "causal-view"
    );
    if (!causalViewElement) {
      console.error("trying to create a node outside the causal-view");
      return;
    }

    const posInCausalView = ScreenUtils.screenPointToSvg({
      x: x,
      y: y,
    });
    nodeData.x = posInCausalView.x;
    nodeData.y = posInCausalView.y;

    this.createNodeWithNodeData(nodeData);
  }

  getNodeIdByPos(x, y) {
    const nodeElement = ScreenUtils.nodeElementFromPoint({ x, y }, "node");
    const nodeData = d3.select(nodeElement).data()[0];
    return nodeData.data.fact.id;
  }
}
