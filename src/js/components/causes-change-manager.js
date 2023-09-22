import { CausalModelUtils } from "../causal-view/causal-model-utils.js";

// When some node edges (causes) are added/changed/removed in external code,
// they must be updated in causal-view because d3 tracks only flat data,
// not nested and mutating

export class CausesChangeManager {
  constructor(causalView) {
    this.causalView = causalView;
  }

  reset(causalModelFact) {
    this.causalModelFact = causalModelFact;
  }

  // Next methods must be called when adding/changing/removing/ cause ids
  // in external code to update causal-view

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
        // Link already exists in causal-view
      }
    }
    this.causalView.structure.render();
  }

  onCausesExpressionAdd(exprToAdd) {
    const causesToAdd = this.getCauseIdsToRemove(
      CausalModelUtils.findCauseIds(exprToAdd)
    );

    // Pass added causes to update causal-view
    this.onCausesAdd(causesToAdd);
  }

  // onCausesRemoved is used by onCausesExpressionRemove
  // but also can be used by external code when removing weight edges
  // (they have no expressions structure)
  onCausesRemoved(removedCauseIds) {
    // Removed cause ids are ids from removed edges
    for (const removedId of this.getCauseIdsToRemove(removedCauseIds)) {
      if (false) {
        // Are there some not removed edges that use this link?
      } else
        this.causalView.structure.removeLink(
          removedId,
          this.causalModelFact.Id
        );
    }
    this.causalView.structure.render();
  }

  onCauseIdChange(oldId, newId) {
    if (oldId) this.onCausesRemoved([oldId]);
    if (newId) this.onCausesAdd([newId]);
  }

  onCausesExpressionRemove(expr) {
    const causesToRemove = this.getCauseIdsToRemove(
      CausalModelUtils.findCauseIds(expr)
    );

    // Pass removed causes to update causal-view
    this.onCausesRemoved(causesToRemove);
  }

  // onCausesExpressionAdd(expr) {
  //   const causesToAdd = this.getCauseIdsToRemove(
  //     CausalModelUtils.findCauseIds(expr)
  //   );
  //   this.onCausesAdd(causesToAdd);
  // }

  // // getCauseIdsToAdd and getCauseIdsToRemove can be replaced by one method,
  // // but there are some comments and local variables naming convenient to understand
  // getCauseIdsToAdd(newIds) {
  //   const existingCauseIds = CausalModelUtils.getCausesIdsUnique(
  //     this.causalModelFact
  //   );
  //   return CausesChangeManager.complement(newIds, existingCauseIds);
  // }

  // - Some edges on causal-view can mean several causes at once
  //   so the edge should be removed only if it's used by removed cause only
  // - It is assumed that removeIds are already removed
  getCauseIdsToRemove(removedIds) {
    // There are no removed ids in the causal model fact
    const causeIdsNotToRemove = CausalModelUtils.getCausesIdsUnique(
      this.causalModelFact
    );

    // But some cause ids from causeIdsNotToRemove
    // could be also in removed edges

    // const res = removedIds.filter((x) => x && !causeIdsNotToRemove.includes(x));
    return CausalModelUtils.arrayComplement(removedIds, causeIdsNotToRemove);
  }
}
