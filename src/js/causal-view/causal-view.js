import { CausalViewStructure } from "./causal-view-structure.js";
import { factsCollection } from "../test-data.js";
import { CausalViewSelection } from "./causal-view-selection.js";

export class CausalView {
  structure = null;
  selection = null;

  init() {
    const causalModelNodes = JSON.parse(factsCollection);
    this.structure = new CausalViewStructure(causalModelNodes);

    const api = window.api;

    // causalView.addEventListener("nodeClicked", (event) =>
    //   builder.onNodeClicked(event)
    // );
    this.structure.addEventListener("nodeEnter", () => api.sendNodeEnter());
    this.structure.addEventListener("nodeLeave", () => api.sendNodeLeave());

    api.receiveCreateNode(this.onCreateNode);
    api.receiveRemoveNode(this.onRemoveNode);

    const causalViewElement = d3.select(".causal-view");
    causalViewElement.on("mouseenter", () => api.sendCausalViewEnter());
    causalViewElement.on("mouseleave", () => api.sendCausalViewLeave());
    this.structure.render(causalViewElement);

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

    console.log("clicked on causal-view. create node");
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
