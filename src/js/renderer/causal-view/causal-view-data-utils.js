// In the context of causal-view causal-view-data is called "nodes data",
// but "nodes data" can also mean some data about nodes (color, size, etc.)
// that is separated from causal model fact
export class CausalViewDataUtils {
  static factsAndNodesDataToCausalViewData(facts, nodesData) {
    return facts.map((fact) => {
      const nodeData = nodesData?.find(
        (nodeData) => nodeData.factId === fact.Id
      );
      return { fact, ...(nodeData ?? {}) };
    });
  }

  static causalViewDataToFactsAndNodesData(causalViewData) {
    const facts = [];
    const nodesData = [];
    for (const datum of causalViewData) {
      facts.push(datum.fact);

      const nodeData = { factId: datum.fact.Id, ...datum };
      delete nodeData.fact;
      nodesData.push(nodeData);
    }
    return { facts, nodesData };
  }

  //   static nodesDataToFacts(facts) {
  //     return facts.map((fact) => {
  //       fact;
  //     });
  //   }
}
