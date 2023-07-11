import { CausalView } from "./causal-view/causal-view.js";
import { factsCollection } from "./test-data.js";

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

let currentSelectedNodeId;

(() => {
  const causalModelNodes = JSON.parse(factsCollection);
  const causalView = new CausalView(".causal-view", causalModelNodes);
  causalView.addEventListener("nodeClicked", (event) => {
    const nodeData = event.data.i.data;
    currentSelectedNodeId = nodeData["Id"];
    const nodeValue = nodeData["NodeValue"];
    document.getElementById("node-id-input").value = currentSelectedNodeId;
    document.getElementById("node-title-input").value =
      nodeData["NodeTitle"] || nodeValue;
    document.getElementById("node-value-input").value = nodeValue;
  });

  document.getElementById("update-btn").onclick = (...data) => {
    onUpdateButtonClick(causalView, ...data);
  };
})();

function testUpdateFirstNode(causalView) {
  const firstNode = causalView.causalModelNodes[0];
  causalView.updateNodeTitleAndValueById(
    firstNode.Id,
    "New node title",
    "Updated node value"
  );
}
