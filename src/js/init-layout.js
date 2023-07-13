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
          width: 25,
          content: [
            {
              type: "component",
              componentName: "Node Value",
              height: 45,
            },
            {
              type: "component",
              componentName: "Test Component",
              componentState: { label: "Hello world" },
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
    function (container, componentState) {}
  );
  layout.registerComponent("Causal View", causalViewComponent);
  layout.registerComponent("Node Value", nodeValueComponent);
  layout.on("initialised", () => {
    initCausalView();
  });
  layout.on("itemCreated", function (item) {});
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
        <label class="text-input__label">Id</label>
        <input class="text-input__input" type="text"
          placeholder="Id" id="node-id-input" readonly />
      </div>
      <div class="text-input">
        <label class="text-input__label">Title</label>
        <input class="text-input__input" type="text"
          placeholder="Title" id="node-title-input" />
      </div>
      <div class="text-input">
        <label class="text-input__label">Node Value</label>
        <textarea class="textarea text-input__input"
          placeholder="Node Value" id="node-value-input"></textarea>
      </div>
      <button class="button" id="update-btn">Update</button>
    </div>`);
  container.getElement().append(element);
};
