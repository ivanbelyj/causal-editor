import { CausalView } from "./causal-view.js";
import { CausalViewSelectionManager } from "./selection/selection-manager.js";

import * as d3 from "d3";
import { NodesCreateRemoveManager } from "./nodes-create-remove-manager.js";
import { CausesChangeManager } from "../components/causes-change-manager.js";
import { CausalViewDataManager } from "./causal-view-data-manager.js";
import { DeclaredBlockDialog } from "../elements/declared-block-dialog.js";
import { DeclareBlockHelper } from "./declare-block-helper.js";
import { CausalViewDataUtils } from "./causal-view-data-utils.js";

const eventBus = require("js-event-bus")();

/**
 * A component managing causal view
 */
export class CausalViewManager {
  structure = null;
  selectionManager = null;

  constructor(selector, api, undoRedoManager, dataManager) {
    this.undoRedoManager = undoRedoManager;
    this.causesChangeManager = new CausesChangeManager(this);
    this.api = api;

    this.#initNodesApiCallbacks();

    this.causalViewDataManager = new CausalViewDataManager();
    this.causalViewDataManager.init({
      api,
      causalViewManager: this,
    });

    this.declareBlockHelper = new DeclareBlockHelper();

    this.#initEnterLeaveView(selector);

    this.dataManager = dataManager;
    this.dataManager.setCurrentCausalViewDataManager(this.causalViewDataManager);
  }

  init(nodesData) {
    this.#initCausalView(nodesData);

    this.nodesCreateRemoveManager = new NodesCreateRemoveManager(
      this.structure,
      this.causesChangeManager
    );

    this.#initDialogs();

    eventBus.on("causalModelSelected", this.onCausalModelSelected.bind(this));
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

  onCausalModelSelected({ causalModelName }) {
    const selectedCausalModel =
      this.dataManager.projectData.getCausalModel(causalModelName);
    const causalViewData =
      CausalViewManager.#toCausalViewData(selectedCausalModel);

    this.reset(causalViewData);
  }

  static #toCausalViewData(causalModel) {
    return CausalViewDataUtils.factsAndNodesDataToCausalViewData(
      causalModel.facts,
      causalModel.nodesData
    );
  }

  onDeclareBlockClicked({
    blockNodePosX,
    blockNodePosY,
    declaredBlockId,
    blockConvention,
  }) {
    const nodeData = {
      block: this.declareBlockHelper.createBlock({
        declaredBlockId,
        blockConvention,
      }),
    };

    this.undoRedoManager.execute(
      this.nodesCreateRemoveManager.getCreateNodeCommand(
        blockNodePosX,
        blockNodePosY,
        nodeData
      )
    );
  }

  #initNodesApiCallbacks() {
    this.api.onCreateNode((event, data) => {
      this.undoRedoManager.execute(
        this.nodesCreateRemoveManager.getCreateNodeCommand(data.x, data.y)
      );
    });
    this.api.onDeclareBlock((event, data) => {
      this.declaredBlockDialog.show({
        blockNodePosX: data.x,
        blockNodePosY: data.y,
      });
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
