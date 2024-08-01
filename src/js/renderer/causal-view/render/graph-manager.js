import * as d3 from "d3";
import * as d3dag from "d3-dag";
import { CausalModelUtils } from "../causal-model-utils.js";

export class GraphManager {
  mutGraph;
  stratify;

  constructor() {
    this.#setStratify();
  }

  #setStratify() {
    this.stratify = d3dag
      .graphStratify()
      .id(({ fact }) => fact.id)
      .parentIds(
        function ({ fact }) {
          return CausalModelUtils.getCausesIdsUnique(fact);
        }.bind(this)
      );
  }

  // Sets directed acyclic graph by causal model facts
  resetGraph(nodesData) {
    this.mutGraph = this.stratify(nodesData);
  }

  addNodeWithData(nodeData) {
    const newNode = this.mutGraph.node(nodeData);

    newNode.ux = nodeData.x;
    newNode.uy = nodeData.y;
    return newNode;
  }

  removeNode(nodeId) {
    const nodeToRemove = this.getNodeById(nodeId);
    if (!nodeToRemove) {
      console.error("Node to remove is not found. ", nodeToRemove);
      return;
    }
    nodeToRemove.delete();
  }

  addLink(sourceId, targetId) {
    const [source, target] = [sourceId, targetId].map(this.getNodeById, this);

    this.mutGraph.link(source, target);
  }

  getLinkBySourceAndTargetIds(sourceId, targetId) {
    return Array.from(this.mutGraph.links()).find(
      (link) =>
        link.source.data.fact.id === sourceId &&
        link.target.data.fact.id === targetId
    );
  }

  removeLink(sourceId, targetId) {
    this.getLinkBySourceAndTargetIds(sourceId, targetId).delete();
  }

  getNodes() {
    return Array.from(this.mutGraph.nodes());
  }

  getNodesData() {
    return this.getNodes().map((node) => node.data);
  }

  getNodeFacts() {
    return this.getNodes().map((node) => node.data.fact);
  }

  getNodeById(nodeId) {
    return this.getNodes().find((node) => node.data.fact.id === nodeId);
  }

  getNodeDataById(nodeId) {
    return this.getNodeById(nodeId).data;
  }
}
