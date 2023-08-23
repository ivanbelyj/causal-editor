export class CausalModelUtils {
  static findCauseIds(obj) {
    let edgeProps = new Set();
    for (let prop in obj) {
      if (prop === "Edge") {
        if (
          obj[prop].hasOwnProperty("CauseId") &&
          !edgeProps.has(obj[prop]["CauseId"])
        )
          edgeProps.add(obj[prop]["CauseId"]);
      }
      if (typeof obj[prop] === "object") {
        const nestedEdgeProps = CausalModelUtils.findCauseIds(obj[prop]);
        // for (const nestedEdgeProp in nestedEdgeProps) {
        //   if (!edgeProps.has(nestedEdgeProp)) edgeProps.add(nestedEdgeProp);
        // }
        edgeProps = new Set(Array.from(edgeProps).concat(nestedEdgeProps));
      }
    }
    return [...edgeProps];
  }

  static getWeightsEdgesIds(causalModelFact) {
    const weightEdges = causalModelFact.WeightNest?.Weights;
    if (!weightEdges) return [];
    const idsSet = new Set();
    for (const weightEdge of weightEdges) {
      const id = weightEdge.CauseId;
      if (!idsSet.has(id)) {
        idsSet.add(id);
      }
    }
    return [...idsSet];
  }

  static getCausesIdsUnique(causalModelFact) {
    return [
      ...new Set(
        CausalModelUtils.findCauseIds(
          causalModelFact.ProbabilityNest.CausesExpression
          // There are no removed expr in root causesExpression
        ).concat(CausalModelUtils.getWeightsEdgesIds(causalModelFact))
        // And there are no removed weight edges
      ),
    ];
  }

  // Edges are identified by source and target ids
  static sourceAndTargetIdsToEdgeId(source, target) {
    // encodeURIComponents for spaces, hope id doesn't have a `--` in it
    return encodeURIComponent(`id-${source}--${target}`);
  }

  static getNodeIdClassByNodeId(nodeId) {
    return `.id-${nodeId}`;
  }

  // Pascal case due to the causal model format
  static createFactorExpression() {
    return {
      $type: "factor",
      Edge: {
        Probability: 1,
        CauseId: null,
      },
    };
  }

  static createNewFactWithFactor() {
    return {
      Id: null,
      ProbabilityNest: {
        CausesExpression: {
          $type: "factor",
          Edge: {
            Probability: 1,
            CauseId: null,
          },
        },
      },
      NodeValue: "New Fact",
    };
  }
}
