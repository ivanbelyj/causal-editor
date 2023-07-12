import { CausalView } from "./causal-view/causal-view.js";
import { factsCollection } from "./test-data.js";

(() => {
  initGoldenLayout();
  // initCausalView();
})();

function initGoldenLayout() {
  const goldenLayoutConfig = {
    content: [
      {
        type: "row",
        content: [
          {
            type: "component",
            componentName: "testComponent",
            componentState: { label: "A" },
          },
          {
            type: "column",
            content: [
              {
                type: "component",
                componentName: "testComponent",
                componentState: { label: "B" },
              },
              {
                type: "component",
                componentName: "testComponent",
                componentState: { label: "C" },
              },
            ],
          },
        ],
      },
    ],
  };
  const myLayout = new GoldenLayout(goldenLayoutConfig);
  myLayout.registerComponent(
    "testComponent",
    function (container, componentState) {
      container.getElement().html("<h2>" + componentState.label + "</h2>");
    }
  );
  myLayout.init();
}

let currentSelectedNodeId;

function initCausalView() {
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

function testUpdateFirstNode(causalView) {
  const firstNode = causalView.causalModelNodes[0];
  causalView.updateNodeTitleAndValueById(
    firstNode.Id,
    "New node title",
    "Updated node value"
  );
}
