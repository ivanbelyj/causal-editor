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

  reset(causalModelFact) {
    this.causalModelFact = causalModelFact;
  }

  // It's ok that some of the passed causes already exist in the causal-view,
  // unlike onCausesRemove.
  // They will be ignored
  onCausesAdd(causeIdsToAdd) {
    for (const addedCauseId of causeIdsToAdd) {
      if (
        !this.causalView.structure.getLinkBySourceAndTargetIds(
          addedCauseId,
          this.causalModelFact.Id
        )
      )
        this.causalView.structure.addLink(
          addedCauseId,
          this.causalModelFact.Id
        );
      else {
        // The link already exists in the causal-view
      }
    }
    this.causalView.structure.render();
  }

  onCausesExpressionAdd(exprToAdd) {
    // Pass added causes to update causal-view
    this.onCausesAdd(CausalModelUtils.findCauseIds(exprToAdd));
  }

  // !!! It is assumed that removeCauseIds are already removed from causalModelFact
  onCausesRemoved(removedCauseIds) {
    for (const removedId of this.getCauseIdsToRemove(removedCauseIds)) {
      this.causalView.structure.removeLink(removedId, this.causalModelFact.Id);
    }
    this.causalView.structure.render();
  }

  onCauseIdChanged(oldId, newId) {
    if (oldId) this.onCausesRemoved([oldId]);
    if (newId) this.onCausesAdd([newId]);
  }

  onCausesExpressionRemoved(expr) {
    // Pass removed causes to update causal-view
    this.onCausesRemoved(CausalModelUtils.findCauseIds(expr));
  }

  // - Some edges on causal-view can mean several causes at once
  //   so the edge should be removed only if it's used by removed causes only
  // !!! It is assumed that removeIds are already removed from causalModelFact
  getCauseIdsToRemove(removedCauseIds) {
    // There are no removed cause ids in the causal model fact
    const causeIdsNotToRemove = CausalModelUtils.getCausesIdsUnique(
      this.causalModelFact
    );

    // But some cause ids from causeIdsNotToRemove
    // could be also in removed edges

    return CausalModelUtils.arrayComplement(
      removedCauseIds,
      causeIdsNotToRemove
    );
  }
}
