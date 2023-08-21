import { CausalViewStructure } from "./causal-view-structure.js";
import { factsCollection } from "../test-data.js";
import { CausalViewSelectionManager } from "./causal-view-selection-manager.js";

import * as d3 from "d3"; // "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { NodesManager } from "./nodes-manager.js";

// A component representing causal model
export class CausalView {
  structure = null;
  selectionManager = null;

  init(api) {
    this.structure = new CausalViewStructure();
    this.structure.addEventListener("nodeEnter", () => api.sendNodeEnter());
    this.structure.addEventListener("nodeLeave", () => api.sendNodeLeave());

    this.nodesManager = new NodesManager(this.structure);
    api.onCreateNode(this.onCreateNode.bind(this));
    api.onRemoveNode(this.onRemoveNode.bind(this));
    api.onGetNodesRequest(
      function () {
        api.sendNodes(this.nodes());
      }.bind(this)
    );

    const causalViewElement = d3.select(".causal-view");
    causalViewElement.on("mouseenter", () => api.sendCausalViewEnter());
    causalViewElement.on("mouseleave", () => api.sendCausalViewLeave());

    const causalModelNodes = JSON.parse(factsCollection);

    this.structure.init(causalViewElement, causalModelNodes);

    this.selectionManager = new CausalViewSelectionManager(this.structure);
  }

  nodes() {
    return this.structure.getNodes();
  }

  onCreateNode(event, data) {
    this.nodesManager.createNode(data.x, data.y);
  }

  onRemoveNode(event, data) {
    this.nodesManager.removeNode(data.x, data.y);
  }
}
