import { CausalView } from "./causal-view/causal-view.js";
import { characterFacts } from "./test-data.js";

function onUpdateButtonClick() {}

(() => {
  const causalModelNodes = JSON.parse(characterFacts);
  const causalView = new CausalView(".causal-view", causalModelNodes);

  tests(causalView);

  document.getElementById("update-btn").onclick = onUpdateButtonClick;
})();

function tests(causalView) {
  const firstNode = causalView.causalModelNodes[0];
  firstNode.NodeValue = "Updated node value";
  causalView.updateNodeById(firstNode);
}
