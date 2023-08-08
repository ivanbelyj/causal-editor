import { CausalView } from "./causal-view/causal-view.js";
import { CausesComponent } from "./components/causes-component.js";
import { NodeValueComponent } from "./components/node-value-component.js";

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
              height: 55,
            },
            {
              type: "component",
              componentName: "Causes",
              // componentState: { label: "Hello world" },
            },
          ],
        },
      ],
    },
  ],
};

export const initLayout = () => {
  const layout = new GoldenLayout(defaultConfig);
  layout.registerComponent("Causes", causesComponent);
  layout.registerComponent("Causal View", causalViewComponent);
  layout.registerComponent("Node Value", nodeValueComponent);
  layout.on("initialised", () => {
    const causalView = new CausalView();
    causalView.init();

    const nodeValueComponent = new NodeValueComponent();
    nodeValueComponent.init(causalView);

    const causalModelFact = {
      Id: "F3DC5993-C431-4C97-9A7C-1EBED7FFF18C",
      ProbabilityNest: {
        CausesExpression: {
          $type: "and",
          Operands: [
            {
              $type: "factor",
              Edge: {
                Probability: 1,
                CauseId: "62560E8F-FDC8-4F15-8EF2-5CE6BADCB7BE",
              },
            },
            {
              $type: "or",
              Operands: [
                {
                  $type: "factor",
                  Edge: {
                    Probability: 0.2,
                    CauseId: "62560E8F-FDC8-4F15-8EF2-5CE6BADCB7BE",
                  },
                },
                {
                  $type: "factor",
                  Edge: {
                    Probability: 0.1,
                    CauseId: "CB3A0E9E-8DDE-436A-9540-3E91F34CAF6D",
                  },
                },
              ],
            },
          ],
        },
      },
      NodeValue: "Biological war",
    };

    const causesComponent = new CausesComponent(
      ".causes-component",
      causalModelFact
    );
    causesComponent.init();
  });
  layout.on("itemCreated", function (item) {});
  layout.init();
};

function causesComponent(container, componentState) {
  const className = "causes-component";
  const parentDiv = $("<div>").addClass(className);
  container.getElement().append(parentDiv);
}

function causalViewComponent(container, componentState) {
  const parentDiv = $("<div>").addClass("causal-view");
  container.getElement().append(parentDiv);
}

function nodeValueComponent(container, componentState) {
  const parentDiv = $("<div>").addClass("node-value-component");
  container.getElement().append(parentDiv);
}
