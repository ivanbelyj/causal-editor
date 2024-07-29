import * as d3 from "d3";
import * as d3dag from "d3-dag";

export class GraphManager {
  constructor() {
    this.mutGraph = null;
  }

  setGraph(graphData) {
    const stratify = d3dag.graphStratify()
      .id(({ fact }) => fact.id)
      .parentIds(function ({ fact }) {
        return CausalModelUtils.getCausesIdsUnique(fact);
      });

    this.mutGraph = stratify(graphData);
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
      console.error("Node to remove is not found.");
      return;
    }
    nodeToRemove.delete();
  }

  getNodeById(nodeId) {
    return Array.from(this.mutGraph.nodes()).find((node) => node.data.fact.id === nodeId);
  }

  addLink(sourceId, targetId) {
    const [source, target] = [sourceId, targetId].map(this.getNodeById, this);
    this.mutGraph.link(source, target);
  }

  removeLink(sourceId, targetId) {
    const linkToRemove = Array.from(this.mutGraph.links()).find(
      (link) =>
        link.source.data.fact.id === sourceId &&
        link.target.data.fact.id === targetId
    );
    if (linkToRemove) {
      linkToRemove.delete();
    } else {
      console.error("Link to remove is not found.");
    }
  }

  resetGraph(nodesData) {
    this.mutGraph = d3dag.graphStratify()(nodesData);
  }

  getNodes() {
    return Array.from(this.mutGraph.nodes());
  }

  getLinks() {
    return Array.from(this.mutGraph.links());
  }
}
