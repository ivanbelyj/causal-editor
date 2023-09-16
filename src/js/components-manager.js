import { CausalView } from "./causal-view/causal-view.js";

import { CausesComponent } from "./components/causes-component/causes-component.js";
import { NodeValueComponent } from "./components/node-value-component.js";
import { WeightsComponent } from "./components/weight-component/weights-component.js";
import { factsCollection } from "./test-data.js";
import { GoldenLayout, LayoutConfig, LayoutManager } from "golden-layout";
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
CausalView;
export class ComponentsManager {
  constructor(layoutSelector, api) {
    this.layoutContainer = d3
      .select(layoutSelector)
      .attr("class", "layout-container");
    this.api = api;
  }

  static getComponentTypesFromConfig(config) {
    let res = [];
    for (const prop in config) {
      if (prop == "componentType") {
        res.push(config[prop]);
      } else if (typeof config[prop] == "object") {
        const innerTypes = ComponentsManager.getComponentTypesFromConfig(
          config[prop]
        );
        if (innerTypes.length > 0) res = [...res, ...innerTypes];
      }
    }
    return res;
  }

  onSetComponentChecked(event, data) {
    console.log("toggle component: ", event);
    console.log("toggle. data", data);
  }

  initLayout(config) {
    if (!config) config = defaultConfig;

    // Create layout
    const layout = (this.layout = new GoldenLayout(
      this.layoutContainer.node()
    ));
    layout.resizeWithContainerAutomatically = true;

    this.registerComponents();
    this.loadConfig(config);

    // Add event listeners
    const api = this.api;
    api.onSetComponentChecked(this.onSetComponentChecked.bind(this));
  }

  loadConfig(config) {
    this.layout.loadLayout(config);
    const loadedComponentNames =
      ComponentsManager.getComponentTypesFromConfig(config);

    console.log("components are set. ", loadedComponentNames);
    this.api.sendComponentsChecked(loadedComponentNames);
  }

  registerComponents() {
    const layout = this.layout;

    layout.registerComponentFactoryFunction(
      "Causal View",
      function (container) {
        this.causalView = new CausalView(container.element, api);
        d3.select(container.element).attr("class", "causal-view");
        const causalModelFacts = JSON.parse(factsCollection);
        this.causalView.init([]);
      }.bind(this)
    );

    layout.registerComponentFactoryFunction("Node Value", (container) => {
      const nodeValueComponent = new NodeValueComponent(
        container.element,
        this.causalView,
        api
      );
      nodeValueComponent.init();
    });

    layout.registerComponentFactoryFunction("Causes", (container) => {
      const causesComponent = new CausesComponent(
        container.element,
        this.causalView,
        api
      );
      causesComponent.init();
    });

    layout.registerComponentFactoryFunction("Weights", (container) => {
      const weightsComponent = new WeightsComponent(
        container.element,
        this.causalView,
        api
      );
      weightsComponent.init();
    });
  }
}
