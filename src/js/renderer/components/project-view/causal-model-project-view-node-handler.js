import { causalModelsNodeId } from "./js-tree-data-utils";

const eventBus = require("js-event-bus")();

/**
 * Causal model node in the Project view.
 * Project view contains nodes. Each one can react differently to user's interactions
 */
export class CausalModelProjectViewNodeHandler {
  // isCausalModelSelected
  shouldHandleSelect(instance, node) {
    const parent = instance.get_parent($(`#${node.id}`));
    return parent === causalModelsNodeId;
  }

  // handleCausalModelSelected
  handleSelected(causalModelName) {
    eventBus.emit("causalModelSelected", null, { causalModelName });
  }
}
