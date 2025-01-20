// In the context of causal-view causal-view-data is called "nodes data",
// but "nodes data" can also mean some data about nodes (color, size, etc.)
// that is separated from the causal model fact
export class CausalViewDataUtils {
  static factsAndNodesDataToCausalViewData(facts, nodesData) {
    return facts.map((fact) => {
      const nodeData = nodesData?.find(
        (nodeData) => nodeData.factId === fact.id
      );
      return { fact, ...(nodeData ?? {}) };
    });
  }

  static causalViewDataToModelNodesData(causalViewData) {
    const facts = [];
    const blocks = [];
    const nodesData = [];
    for (const datum of causalViewData) {
      let nodeId;
      if (datum.fact) {
        facts.push(datum.fact);
        nodeId = datum.fact.id;
      } else if (datum.block) {
        blocks.push(datum.block)
        nodeId = datum.block.id;
      }

      const nodeData = { nodeId, ...datum };
      delete nodeData.fact;
      delete nodeData.block;
      nodesData.push(nodeData);
    }
    return { facts, blocks, nodesData };
  }
}
