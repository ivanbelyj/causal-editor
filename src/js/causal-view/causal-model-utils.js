export class CausalModelUtils {
  static findCauseIds(obj) {
    let edgeProps = new Set();
    for (let prop in obj) {
      if (prop === "Edge") {
        if (
          obj[prop].hasOwnProperty("CauseId") &&
          obj[prop].CauseId &&
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

  // static traverseInnerExpressions(obj, func) {
  //   for (let prop in obj) {
  //     if (
  //       ["Operands", "Edge"].find(
  //         (exprProp) => obj[prop] && obj[prop].hasOwnProperty(exprProp)
  //       )
  //     )
  //       func(obj[prop]);

  //     if (typeof obj[prop] === "object") {
  //       CausalModelUtils.traverseInnerExpressions(obj[prop], func);
  //     }
  //   }
  // }

  static getWeightsEdgesIds(causalModelFact) {
    const weightEdges = causalModelFact.WeightNest?.Weights;
    if (!weightEdges) return [];
    const idsSet = new Set();
    for (const weightEdge of weightEdges) {
      const id = weightEdge.CauseId;
      if (!idsSet.has(id) && id) {
        idsSet.add(id);
      }
    }
    return [...idsSet];
  }

  static getCausesIdsUnique(causalModelFact) {
    const idsAll = [
      ...CausalModelUtils.findCauseIds(
        causalModelFact.ProbabilityNest.CausesExpression
      ),
      ...CausalModelUtils.getWeightsEdgesIds(causalModelFact),
    ];
    if (causalModelFact.AbstractFactId)
      idsAll.push(causalModelFact.AbstractFactId);
    return [...new Set(idsAll)];
  }

  // Edges are identified by source and target ids
  static sourceAndTargetIdsToEdgeId(source, target) {
    // encodeURIComponents for spaces, hope id doesn't have a `--` in it
    return encodeURIComponent(`edge-${source}--${target}`);
  }

  static getNodeIdClassNameByNodeId(nodeId) {
    return `node-${nodeId}`;
  }

  // Pascal case due to the causal model format
  static createFactorExpression() {
    return {
      $type: "factor",
      Edge: {
        Probability: 1,
      },
    };
  }

  static lastCreatedFactNumber = 0;
  static createNewFactWithFactor() {
    return {
      Id: null,
      ProbabilityNest: {
        CausesExpression: {
          $type: "factor",
          Edge: {
            Probability: 1,
          },
        },
      },
      NodeValue: `New Fact ${++CausalModelUtils.lastCreatedFactNumber}`,
    };
  }

  static arrayComplement(minuend, subtrahend) {
    return minuend.filter((x) => x && !subtrahend.includes(x));
  }

  static causesExpressionComplement(minuendExpr, subtrahendExpr) {
    const minCausesIds = CausalModelUtils.findCauseIds(minuendExpr);
    const subCausesIds = CausalModelUtils.findCauseIds(subtrahendExpr);
    return CausalModelUtils.arrayComplement(minCausesIds, subCausesIds);
  }

  static factComplement(minuendFact, subtrahendFact) {
    const minCausesIds = CausalModelUtils.getCausesIdsUnique(minuendFact);
    const subCausesIds = CausalModelUtils.getCausesIdsUnique(subtrahendFact);
    return CausalModelUtils.arrayComplement(minCausesIds, subCausesIds);
  }
}
