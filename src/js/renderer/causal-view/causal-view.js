import { CausalViewStructure } from "./causal-view-structure.js";
import { CausalViewSelectionManager } from "./selection/selection-manager.js";

import * as d3 from "d3";
import { NodesCreateRemoveManager } from "./nodes-create-remove-manager.js";
import { CausesChangeManager } from "../components/causes-change-manager.js";
import { CausalViewDataManager } from "./causal-view-data-manager.js";

/**
 * A component managing causal view
 */
export class CausalView {
  structure = null;
  selectionManager = null;

  constructor(selector, api, undoRedoManager) {
    this.undoRedoManager = undoRedoManager;
    this.causesChangeManager = new CausesChangeManager(this);
    this.api = api;

    this.#initCreateRemoveNodes();

    this.causalViewDataManager = new CausalViewDataManager();
    this.causalViewDataManager.init({
      api,
      causalView: this,
    });

    this.#initEnterLeaveView(selector);
  }

  init(nodesData) {
    this.#initCausalViewStructure(nodesData);

    this.nodesCreateRemoveManager = new NodesCreateRemoveManager(
      this.structure,
      this.causesChangeManager
    );
  }

  reset(nodesData) {
    this.structure.reset(nodesData);
    this.structure.setInitialZoom();
  }

  #initCreateRemoveNodes() {
    this.api.onCreateNode((event, data) => {
      this.undoRedoManager.execute(
        this.nodesCreateRemoveManager.getCreateNodeCommand(data.x, data.y)
      );
    });
    this.api.onRemoveNode((event, data) => {
      this.undoRedoManager.execute(
        this.nodesCreateRemoveManager.getRemoveNodeCommand(data.x, data.y)
      );
    });
  }

  #initEnterLeaveView(selector) {
    const causalView = (this.component = d3.select(selector));
    causalView.on("mouseenter", () => api.sendCausalViewEnter());
    causalView.on("mouseleave", () => api.sendCausalViewLeave());
  }

  #initCausalViewStructure(nodesData) {
    this.structure = new CausalViewStructure(this.undoRedoManager);
    this.#initEnterLeaveNode();

    this.#initSelection();

    this.structure.init(this.component, nodesData, this.selectionManager);
  }

  #initEnterLeaveNode() {
    this.structure.addEventListener("nodeEnter", () =>
      this.api.sendNodeEnter()
    );
    this.structure.addEventListener("nodeLeave", () =>
      this.api.sendNodeLeave()
    );
  }

  #initSelection() {
    this.selectionManager = new CausalViewSelectionManager(
      this.api,
      this.undoRedoManager
    );

    this.selectionManager.init(this.structure);

    this.api.onReset((event, data) => {
      this.selectionManager.reset();
    });
  }
}
