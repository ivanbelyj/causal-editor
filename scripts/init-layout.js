import { initCausalView } from "./init-causal-view.js";

const defaultConfig = {
  content: [
    {
      type: "row",
      content: [
        {
          type: "component",
          componentName: "Causal View",
        },
        {
          type: "column",
          content: [
            {
              type: "component",
              componentName: "Node Value",
            },
            {
              type: "component",
              componentName: "Test Component",
              componentState: { label: "C" },
            },
          ],
        },
      ],
    },
  ],
};

export const initLayout = () => {
  const layout = new GoldenLayout(defaultConfig);
  layout.registerComponent(
    "Test Component",
    function (container, componentState) {
      container.getElement().html("<h2>" + componentState.label + "</h2>");
    }
  );
  layout.registerComponent("Causal View", causalViewComponent);
  layout.registerComponent("Node Value", nodeValueComponent);
  layout.on("initialised", () => {
    initCausalView();
  });
  layout.init();
};

const causalViewComponent = function (container, componentState) {
  const parentDiv = $("<div>").addClass("causal-view");
  $("label");
  container.getElement().append(parentDiv);
};

const nodeValueComponent = function (container, componentState) {
  const element = $(`
    <div class="component">
      <div class="text-input text-input_readonly">
        <label>Id</label>
        <input type="text" placeholder="Id" id="node-id-input" readonly />
      </div>
      <div class="text-input">
        <label>Title</label>
        <input type="text" placeholder="Title" id="node-title-input" />
      </div>
      <div class="text-input">
        <label>Node Value</label>
        <input type="text" placeholder="Node Value" id="node-value-input" />
      </div>
      <button id="update-btn">Update</button>
    </div>`);
  container.getElement().append(element);
};
