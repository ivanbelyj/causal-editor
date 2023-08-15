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
}
