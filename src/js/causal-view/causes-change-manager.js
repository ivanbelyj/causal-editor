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
    // this.rootCausesExpression = causalModelFact.CausesExpression;
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
    console.log("tracked removing: ", removedCauseIds);
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
    if (oldId) this.onCausesRemove([oldId]);
    // this.causalView.structure.removeLink(oldId, this.causalModelFact.Id);
    if (newId) this.onCausesAdd([newId]);
    // this.causalView.structure.addLink(newId, this.causalModelFact.Id);
    // if (oldId || newId) this.causalView.structure.render();
  }

  onCausesExpressionRemove(expr) {
    const causesToRemove = this.getCauseIdsToRemove(
      CausalModelUtils.findCauseIds(expr)
    );

    // Pass removed causes to update causal-view
    this.onCausesRemove(causesToRemove);
    // Todo: fix bug.
    // 1. select "Biological war" node in example model
    // 2. remove CB3A0E9E-8DDE-436A-9540-3E91F34CAF6D (in OR expr)
    // 3. remove 62560E8F-FDC8-4F15-8EF2-5CE6BADCB7BE (in OR expr)
    // 4. remove 62560E8F-FDC8-4F15-8EF2-5CE6BADCB7BE (in root AND expr)
    // 5. TypeError: Cannot read properties of undefined (reading 'delete')
    // Or delete factor and OR (root items) instead of it all
  }

  // Some edges on causal-view can mean several causes at once
  // so the edge should be removed only if it's used by removed cause only
  getCauseIdsToRemove(removedIds) {
    // There are no removed ids in causal model fact
    const causeIdsNotToRemove = CausalModelUtils.getCausesIdsUnique(
      this.causalModelFact
    );
    console.log("cause ids that must NOT be removed", causeIdsNotToRemove);

    // But some cause ids from causeIdsNotToRemove
    // could be also in removed edges

    const res = removedIds.filter((x) => x && !causeIdsNotToRemove.includes(x));
    console.log("but will be removed only", res);
    return res;
  }
}
