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

  // Edges are identified by source and target ids
  static sourceAndTargetIdsToEdgeId(source, target) {
    // encodeURIComponents for spaces, hope id doesn't have a `--` in it
    return encodeURIComponent(`id-${source}--${target}`);
  }

  static getNodeIdClassByNodeId(nodeId) {
    return `.id-${nodeId}`;
  }
}
