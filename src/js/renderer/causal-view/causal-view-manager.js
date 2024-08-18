import { CausalView } from "./causal-view.js";
import { CausalViewSelectionManager } from "./selection/selection-manager.js";

import * as d3 from "d3";
import { NodesCreateRemoveManager } from "./nodes-create-remove-manager.js";
import { CausesChangeManager } from "../components/causes-change-manager.js";
import { CausalViewDataManager } from "./causal-view-data-manager.js";
import { DeclaredBlockDialog } from "../elements/declared-block-dialog.js";

/**
 * A component managing causal view
 */
export class CausalViewManager {
  structure = null;
  selectionManager = null;

  constructor(selector, api, undoRedoManager) {
    this.undoRedoManager = undoRedoManager;
    this.causesChangeManager = new CausesChangeManager(this);
    this.api = api;

    this.#initApiCallbacks();

    this.causalViewDataManager = new CausalViewDataManager();
    this.causalViewDataManager.init({
      api,
      causalView: this,
    });

    this.#initEnterLeaveView(selector);
  }

  init(nodesData) {
    this.#initCausalView(nodesData);

    this.nodesCreateRemoveManager = new NodesCreateRemoveManager(
      this.structure,
      this.causesChangeManager
    );

    this.#initDialogs();
  }

  reset(nodesData) {
    this.structure.reset(nodesData);
    this.structure.setInitialZoom();
  }

  #initDialogs() {
    this.declaredBlockDialog = new DeclaredBlockDialog(
      "declared-block-modal",
      this.onDeclareBlockClicked.bind(this)
    );
    this.declaredBlockDialog.init();
  }

  onDeclareBlockClicked({ declaredBlockId, blockConvention }) {
    // TODO:
    console.log(`${declaredBlockId} ${blockConvention}`);
  }

  #initApiCallbacks() {
    this.api.onCreateNode((event, data) => {
      this.undoRedoManager.execute(
        this.nodesCreateRemoveManager.getCreateNodeCommand(data.x, data.y)
      );
    });
    this.api.onDeclareBlock((event, data) => {
      this.declaredBlockDialog.show();
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

  #initCausalView(nodesData) {
    this.structure = new CausalView(this.undoRedoManager);
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
