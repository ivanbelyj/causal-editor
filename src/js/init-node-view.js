import { currentSelectedNodeId } from "./causal-view/init-causal-view.js";

function onNodeClicked(event) {
  const nodeData = event.data.i.data;

  const nodeValue = nodeData["NodeValue"];
  document.getElementById("node-id-input").value = currentSelectedNodeId;
  document.getElementById("node-title-input").value =
    nodeData["NodeTitle"] || nodeValue;
  document.getElementById("node-value-input").value = nodeValue;
}

export function initNodeView(causalView) {
  document.getElementById("update-btn").onclick = (...data) => {
    onUpdateButtonClick(causalView, ...data);
  };
  causalView.addEventListener("nodeClicked", (event) => onNodeClicked(event));
}

function onUpdateButtonClick(causalView) {
  if (!currentSelectedNodeId) return;
  const nodeTitleInput = document.getElementById("node-title-input").value;
  const nodeValueInput = document.getElementById("node-value-input").value;
  causalView.updateNodeTitleAndValueById(
    currentSelectedNodeId,
    nodeTitleInput,
    nodeValueInput
  );
}
