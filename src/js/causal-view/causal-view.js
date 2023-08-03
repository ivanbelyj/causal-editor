import { CausalViewStructure } from "./causal-view-structure.js";
import { factsCollection } from "../test-data.js";
import { CausalViewSelection } from "./causal-view-selection.js";

import * as d3 from "d3"; // "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Pascal case because of causal model format
const newNodeTemplate = {
  Id: null,
  ProbabilityNest: {
    CausesExpression: {
      $type: "factor",
      Edge: {
        Probability: 1,
      },
    },
  },
  NodeValue: "New Fact",
};

export class CausalView {
  structure = null;
  selection = null;

  init() {
    const api = window.api;

    this.structure = new CausalViewStructure();
    // causalView.addEventListener("nodeClicked", (event) =>
    //   builder.onNodeClicked(event)
    // );
    this.structure.addEventListener("nodeEnter", () => api.sendNodeEnter());
    this.structure.addEventListener("nodeLeave", () => api.sendNodeLeave());

    api.receiveCreateNode(this.onCreateNode.bind(this));
    api.receiveRemoveNode(this.onRemoveNode.bind(this));

    const causalViewElement = d3.select(".causal-view");
    causalViewElement.on("mouseenter", () => api.sendCausalViewEnter());
    causalViewElement.on("mouseleave", () => api.sendCausalViewLeave());

    const causalModelNodes = JSON.parse(factsCollection);

    this.structure.init(causalViewElement, causalModelNodes);
    // this.structure.render();

    // Todo: независимость от вызова render
    this.selection = new CausalViewSelection(this.structure);
  }

  // onNodeClicked(event) {
  //   const prevSelectedNodeId = currentSelectedNodeId;
  //   const nodeData = event.data.i.data;
  //   currentSelectedNodeId = nodeData["Id"];

  //   this._causalView.selectNode(currentSelectedNodeId);
  //   if (prevSelectedNodeId) this._causalView.deselectNode(prevSelectedNodeId);
  // }

  onCreateNode(event, data) {
    const causalViewElement = CausalView.elementWithClassFrom(
      data,
      "causal-view"
    );
    if (!causalViewElement) return;

    const newNode = this.createNode();
    console.log(newNode);
    this.structure.render();

    console.log("clicked on causal-view. create node");
  }

  createNode() {
    const newNode = Object.assign({}, newNodeTemplate);
    newNode.Id = crypto.randomUUID();
    return newNode;
  }

  onRemoveNode(event, data) {
    if (CausalView.nodeElementFromPoint(data, "node"))
      console.log("remove node");
  }

  static elementWithClassFrom(pos, className) {
    const elems = CausalView.getElementsByPos(pos);
    for (const elem of elems) {
      for (const curClassName of elem.classList) {
        if (curClassName == className) {
          return elem;
        }
      }
    }
    return null;
  }
  static getElementsByPos(pos) {
    return document.elementsFromPoint(pos.x, pos.y);
  }

  // document.elementsFromPoint ignores <g> because it is used only for
  // grouping, not displaying, so there is a hack, depending on node structure
  static nodeElementFromPoint(pos) {
    const elems = CausalView.getElementsByPos(pos);
    for (const elem of elems) {
      if (elem.tagName == "rect") {
        if (elem.parentNode.classList.contains("node")) {
          return elem.parentNode;
        }
      }
    }
    return null;
  }
}
