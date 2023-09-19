import { CausalModelUtils } from "./causal-model-utils.js";

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

  onCausesAdd(addedCauseIds) {
    for (const addedCauseId of addedCauseIds) {
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

  // onCausesRemove is used by onCausesExpressionRemove
  // but also can be used by external code when removing weight edges
  // (they have no expressions structure)
  onCausesRemove(removedCauseIds) {
    // Removed cause ids are ids from removed edges
    for (const removedId of this.getCauseIdsToRemove(removedCauseIds)) {
      if (false) {
        // Are there some not removed edges that use this link?
      }
      // Todo: fix bug with undo
      else
        this.causalView.structure.removeLink(
          removedId,
          this.causalModelFact.Id
        );
    }
    this.causalView.structure.render();
  }

  onCauseIdChange(oldId, newId) {
    if (oldId) this.onCausesRemove([oldId]);
    if (newId) this.onCausesAdd([newId]);
  }

  onCausesExpressionRemove(expr) {
    const causesToRemove = this.getCauseIdsToRemove(
      CausalModelUtils.findCauseIds(expr)
    );

    // Pass removed causes to update causal-view
    this.onCausesRemove(causesToRemove);
  }

  // Some edges on causal-view can mean several causes at once
  // so the edge should be removed only if it's used by removed cause only
  getCauseIdsToRemove(removedIds) {
    // There are no removed ids in causal model fact
    const causeIdsNotToRemove = CausalModelUtils.getCausesIdsUnique(
      this.causalModelFact
    );

    // But some cause ids from causeIdsNotToRemove
    // could be also in removed edges

    const res = removedIds.filter((x) => x && !causeIdsNotToRemove.includes(x));
    return res;
  }
}
