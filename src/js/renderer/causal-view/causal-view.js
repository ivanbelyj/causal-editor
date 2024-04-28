import { CausalViewStructure } from "./causal-view-structure.js";
import { factsCollection } from "../test-data.js";
import { CausalViewSelectionManager } from "./causal-view-selection-manager.js";

import * as d3 from "d3";
import { NodesCreateRemoveManager } from "./nodes-create-remove-manager.js";
import { CausesChangeManager } from "../components/causes-change-manager.js";
import { ProjectData } from "../../main/data/project-data.js";
import { CausalViewDataUtils } from "./causal-view-data-utils.js";

// A component representing causal model visual structure
export class CausalView {
  structure = null;
  selectionManager = null;

  constructor(selector, api, undoRedoManager) {
    this.undoRedoManager = undoRedoManager;
    this.causesChangeManager = new CausesChangeManager(this);

    api.onCreateNode((event, data) => {
      undoRedoManager.execute(
        this.nodesCreateRemoveManager.getCreateNodeCommand(data.x, data.y)
      );
    });
    api.onRemoveNode((event, data) => {
      undoRedoManager.execute(
        this.nodesCreateRemoveManager.getRemoveNodeCommand(data.x, data.y)
      );
    });

    api.onSaveData((event, { dataToSaveId, title }) => {
      const { facts, nodesData } =
        CausalViewDataUtils.causalViewDataToFactsAndNodesData(
          this.structure.getNodesData()
        );

      event.sender.send(`data-to-save-${dataToSaveId}`, {
        // ...arg,
        dataToSave: new ProjectData(facts, nodesData),
        title,
      });
    });
    api.onOpenData((event, projectData) => {
      const causalViewData =
        CausalViewDataUtils.factsAndNodesDataToCausalViewData(
          projectData.facts,
          projectData.nodesData
        );
      this.reset(causalViewData);
    });

    api.onReset((event, data) => {
      this.selectionManager.reset();
    });
    this.api = api;

    const causalView = (this.component = d3.select(selector));
    causalView.on("mouseenter", () => api.sendCausalViewEnter());
    causalView.on("mouseleave", () => api.sendCausalViewLeave());
  }

  init(nodesData) {
    this.structure = new CausalViewStructure(this.undoRedoManager);
    this.structure.addEventListener("nodeEnter", () =>
      this.api.sendNodeEnter()
    );
    this.structure.addEventListener("nodeLeave", () =>
      this.api.sendNodeLeave()
    );

    this.nodesCreateRemoveManager = new NodesCreateRemoveManager(
      this.structure,
      this.causesChangeManager
    );
    this.selectionManager = new CausalViewSelectionManager(
      this.api,
      this.undoRedoManager
    );

    this.selectionManager.init(this.structure);
    this.structure.init(this.component, nodesData, this.selectionManager);

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

  reset(nodesData) {
    this.structure.reset(nodesData);
    this.structure.setInitialZoom();
  }

  // Todo: remove?
  nodes() {
    return this.structure.getNodes();
  }
}
