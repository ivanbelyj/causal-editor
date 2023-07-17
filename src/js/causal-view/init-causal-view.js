import { CausalView } from "./causal-view.js";
import { factsCollection } from "../test-data.js";

export let currentSelectedNodeId;

export function initCausalView() {
  const causalModelNodes = JSON.parse(factsCollection);
  const causalView = new CausalView(causalModelNodes);
  const api = window.api;

  causalView.addEventListener("nodeClicked", (event) =>
    onNodeClicked(causalView, event)
  );
  causalView.addEventListener("nodeEnter", () => api.sendNodeEnter());
  causalView.addEventListener("nodeLeave", () => api.sendNodeLeave());

  api.receiveCreateNode(onCreateNode);
  api.receiveRemoveNode(onRemoveNode);

  const causalViewSelection = d3.select(".causal-view");
  causalViewSelection.on("mouseenter", () => api.sendCausalViewEnter());
  causalViewSelection.on("mouseleave", () => api.sendCausalViewLeave());
  causalView.render(causalViewSelection);

  return causalView;
}

function onNodeClicked(causalView, event) {
  const prevSelectedNodeId = currentSelectedNodeId;
  const nodeData = event.data.i.data;
  currentSelectedNodeId = nodeData["Id"];

  causalView.selectNode(currentSelectedNodeId);
  if (prevSelectedNodeId) causalView.deselectNode(prevSelectedNodeId);
}

function onCreateNode(event, data) {
  const causalViewElement = elementWithClassFrom(data, "causal-view");
  if (!causalViewElement) return;

  console.log("clicked on causal-view. create node");
}

function elementWithClassFrom(pos, className) {
  const elems = getElementsByPos(pos);
  for (const elem of elems) {
    for (const curClassName of elem.classList) {
      if (curClassName == className) {
        return elem;
      }
    }
  }
  return null;
}
function getElementsByPos(pos) {
  return document.elementsFromPoint(pos.x, pos.y);
}

function onRemoveNode(event, data) {
  if (nodeElementFromPoint(data, "node")) console.log("remove node");
}

// document.elementsFromPoint ignores <g> because it is used only for
// grouping, not displaying, so there is a hack, depending on node structure
function nodeElementFromPoint(pos) {
  const elems = getElementsByPos(pos);
  for (const elem of elems) {
    if (elem.tagName == "rect") {
      if (elem.parentNode.classList.contains("node")) {
        return elem.parentNode;
      }
    }
  }
  return null;
}
