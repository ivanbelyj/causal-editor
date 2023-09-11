import { CausalView } from "./causal-view/causal-view.js";
import { CausesComponent } from "./components/causes-component/causes-component.js";
import { NodeValueComponent } from "./components/node-value-component.js";
import { WeightsComponent } from "./components/weight-component/weights-component.js";
import { factsCollection } from "./test-data.js";

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
              height: 22,
            },
            {
              type: "component",
              componentName: "Causes",
              // componentState: { label: "Hello world" },
            },
            {
              type: "component",
              componentName: "Weights",
              height: 30,
            },
          ],
        },
      ],
    },
  ],
};

export const initLayout = () => {
  const layout = new GoldenLayout(defaultConfig);
  registerComponent(layout, "Causes", "causes-component");
  registerComponent(layout, "Causal View", "causal-view");
  registerComponent(layout, "Node Value", "node-value-component");
  registerComponent(layout, "Weights", "weights-component");

  layout.on("initialised", () => {
    const api = window.api;
    const causalView = new CausalView(".causal-view", api);
    const causalModelFacts = JSON.parse(factsCollection);
    causalView.init([]);

    const nodeValueComponent = new NodeValueComponent(
      ".node-value-component",
      causalView,
      api
    );
    nodeValueComponent.init();

    const causesComponent = new CausesComponent(
      ".causes-component",
      causalView,
      api
    );
    causesComponent.init();

    const weightsComponent = new WeightsComponent(
      ".weights-component",
      causalView,
      api
    );
    weightsComponent.init();
  });
  layout.on("itemCreated", function (item) {});
  layout.init();
};

function registerComponent(layout, componentName, componentClass) {
  layout.registerComponent(componentName, function (container, componentState) {
    const parentDiv = $("<div>").addClass(componentClass);
    container.getElement().append(parentDiv);
  });
}
