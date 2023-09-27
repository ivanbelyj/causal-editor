import { CausalModelUtils } from "../causal-view/causal-model-utils.js";

// When some node edges (causes) are added/changed/removed in external code,
// they must be updated in causal-view manually because d3 tracks only flat data,
// not nested and mutating.
// Provided methods must be called when adding/changing/removing cause ids
// in external code to update causal-view
export class CausesChangeManager {
  constructor(causalView) {
    this.causalView = causalView;
  }

  // reset(causalModelFact) {
  //   this.causalModelFact = causalModelFact;
  // }

  // It's ok that some of the passed causes already exist in the causal-view,
  // unlike onCausesRemove.
  // They will be ignored
  onCausesAdd(causalFact, causeIdsToAdd) {
    if (!causalFact) throw new Error("causal fact can't be ", causalFact);
    for (const addedCauseId of causeIdsToAdd) {
      if (!addedCauseId)
        throw new Error("addedCauseId cannot be ", addedCauseId);

      const curLink = this.causalView.structure.getLinkBySourceAndTargetIds(
        addedCauseId,
        causalFact.Id
      );

      // console.log(
      //   "curLink",
      //   curLink,
      //   "from",
      //   addedCauseId,
      //   "to",
      //   causalFact.Id
      // );
      if (!curLink) {
        console.log("add");
        this.causalView.structure.addLink(addedCauseId, causalFact.Id);
      } else {
        // The link already exists in the causal-view
      }
    }
    this.causalView.structure.render();
  }

  onCausesExpressionAdd(causalFact, exprToAdd) {
    // Pass added causes to update causal-view
    this.onCausesAdd(causalFact, CausalModelUtils.findCauseIds(exprToAdd));
  }

  // !!! It is assumed that removeCauseIds are already removed from causalFact
  onCausesRemoved(causalFact, removedCauseIds) {
    if (!causalFact) throw new Error("causal fact can't be ", causalFact);
    for (const removedId of this.getCauseIdsToRemove(
      causalFact,
      removedCauseIds
    )) {
      this.causalView.structure.removeLink(removedId, causalFact.Id);
    }
    this.causalView.structure.render();
  }

  onCauseIdChanged(causalFact, oldId, newId) {
    if (oldId) this.onCausesRemoved(causalFact, [oldId]);
    if (newId) this.onCausesAdd(causalFact, [newId]);
  }

  onCausesExpressionRemoved(causalFact, expr) {
    // Pass removed causes to update causal-view
    this.onCausesRemoved(causalFact, CausalModelUtils.findCauseIds(expr));
  }

  // - Some edges on causal-view can mean several causes at once
  //   so the edge should be removed only if it's used by removed causes only
  // !!! It is assumed that removeIds are already removed from causalFact
  getCauseIdsToRemove(causalFact, removedCauseIds) {
    // There are no removed cause ids in the causal model fact
    const causeIdsNotToRemove = CausalModelUtils.getCausesIdsUnique(causalFact);

    // But some cause ids from causeIdsNotToRemove
    // could be also in removed edges

    return CausalModelUtils.arrayComplement(
      removedCauseIds,
      causeIdsNotToRemove
    );
  }
}
