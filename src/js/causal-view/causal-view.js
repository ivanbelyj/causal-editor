import { CausalViewStructure } from "./causal-view-structure.js";
import { factsCollection } from "../test-data.js";
import { CausalViewSelectionManager } from "./causal-view-selection-manager.js";

import * as d3 from "d3";
import { NodesManager } from "./nodes-manager.js";

// A component representing causal model
export class CausalView {
  structure = null;
  selectionManager = null;

  constructor(selector, api, undoRedoManager) {
    this.undoRedoManager = undoRedoManager;

    api.onCreateNode(
      function (event, data) {
        undoRedoManager.execute(
          this.nodesManager.getCreateNodeCommand(data.x, data.y)
        );
      }.bind(this)
    );
    api.onRemoveNode(
      function (event, data) {
        undoRedoManager.execute(
          this.nodesManager.getRemoveNodeCommand(data.x, data.y)
        );
      }.bind(this)
    );
    api.onGetNodesRequest(
      function () {
        api.sendNodes(this.nodes());
      }.bind(this)
    );
    api.onOpenCausalModel(
      function (event, data) {
        // console.log("open data", data);
        this.reset(data);
      }.bind(this)
    );

    api.onReset(
      function (event, data) {
        this.selectionManager.reset();
      }.bind(this)
    );
    this.api = api;

    const causalView = (this.component = d3.select(selector));
    causalView.on("mouseenter", () => api.sendCausalViewEnter());
    causalView.on("mouseleave", () => api.sendCausalViewLeave());
  }

  init(causalModelFacts) {
    this.structure = new CausalViewStructure();
    this.structure.addEventListener("nodeEnter", () =>
      this.api.sendNodeEnter()
    );
    this.structure.addEventListener("nodeLeave", () =>
      this.api.sendNodeLeave()
    );

    this.nodesManager = new NodesManager(this.structure, this.undoRedoManager);
    this.selectionManager = new CausalViewSelectionManager(
      this.undoRedoManager
    );

    this.selectionManager.init(this.structure);
    this.structure.init(
      this.component,
      causalModelFacts,
      this.selectionManager
    );

    // Test of reset
    setTimeout(
      function () {
        // console.log("reset with deleted!");
        // const facts = JSON.parse(factsCollection);
        // facts.splice(0, 6);
        // this.reset(facts);
      }.bind(this),
      500
    );
  }

  reset(causalModelFacts) {
    this.structure.reset(causalModelFacts);
    this.structure.setInitialZoom();
  }

  nodes() {
    return this.structure.getNodes();
  }
}
