import { CausalView } from "./causal-view/causal-view.js";
import { factsCollection } from "./test-data.js";

function onUpdateButtonClick() {
  const idInput = document.getElementById("id-input").value;
  const nodeValueInput = document.getElementById("node-value-input").value;
  alert(`${idInput} ${nodeValueInput}`);
}

let currentSelectedNodeId;

(() => {
  const causalModelNodes = JSON.parse(factsCollection);
  const causalView = new CausalView(".causal-view", causalModelNodes);
  causalView.addEventListener("nodeClicked", (event) => {
    currentSelectedNodeId = event.data.i.data["Id"];
    document.getElementById("id-input").value = currentSelectedNodeId;
    console.log("Node is clicked! " + currentSelectedNodeId);
  });

  document.getElementById("update-btn").onclick = onUpdateButtonClick;
})();

function testUpdateFirstNode(causalView) {
  const firstNode = causalView.causalModelNodes[0];
  causalView.updateNodeTitleAndValueById(
    firstNode.Id,
    "New node title",
    "Updated node value"
  );
}
