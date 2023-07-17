import { CausalView } from "./causal-view.js";
import { factsCollection } from "../test-data.js";

export let currentSelectedNodeId;

export function initCausalView() {
  const causalModelNodes = JSON.parse(factsCollection);
  const causalView = new CausalView(causalModelNodes);

  causalView.addEventListener("nodeClicked", (event) => {
    const prevSelectedNodeId = currentSelectedNodeId;
    const nodeData = event.data.i.data;
    currentSelectedNodeId = nodeData["Id"];

    causalView.selectNode(currentSelectedNodeId);
    if (prevSelectedNodeId) causalView.deselectNode(prevSelectedNodeId);
  });

  const parentSelection = d3.select(".causal-view");
  causalView.render(parentSelection);

  return causalView;
}
