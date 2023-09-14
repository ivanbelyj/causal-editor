import { CausalView } from "./causal-view/causal-view.js";
import { CausesComponent } from "./components/causes-component/causes-component.js";
import { NodeValueComponent } from "./components/node-value-component.js";
import { WeightsComponent } from "./components/weight-component/weights-component.js";
import { factsCollection } from "./test-data.js";
import { GoldenLayout } from "golden-layout";
import * as d3 from "d3";

const defaultConfig = {
  root: {
    type: "row",
    content: [
      {
        type: "component",
        componentType: "Causal View",
      },
      {
        type: "column",
        width: 25,
        content: [
          {
            type: "component",
            componentType: "Node Value",
            height: 22,
          },
          {
            type: "component",
            componentType: "Causes",
          },
          {
            type: "component",
            componentType: "Weights",
            height: 30,
          },
        ],
      },
    ],
  },
};

export const initLayout = () => {
  const layoutContainer = d3
    .select("body")
    .append("div")
    .attr("class", "layout-container");

  const layout = new GoldenLayout(layoutContainer.node());
  layout.resizeWithContainerAutomatically = true;

  const api = window.api;
  let causalView;
  layout.registerComponentFactoryFunction("Causal View", (container) => {
    causalView = new CausalView(container.element, api);
    d3.select(container.element).attr("class", "causal-view");
    const causalModelFacts = JSON.parse(factsCollection);
    causalView.init([]);
  });

  layout.registerComponentFactoryFunction("Node Value", (container) => {
    const nodeValueComponent = new NodeValueComponent(
      container.element,
      causalView,
      api
    );
    nodeValueComponent.init();
  });

  layout.registerComponentFactoryFunction("Causes", (container) => {
    const causesComponent = new CausesComponent(
      container.element,
      causalView,
      api
    );
    causesComponent.init();
  });

  layout.registerComponentFactoryFunction("Weights", (container) => {
    const weightsComponent = new WeightsComponent(
      container.element,
      causalView,
      api
    );
    weightsComponent.init();
  });

  layout.loadLayout(defaultConfig);
};
