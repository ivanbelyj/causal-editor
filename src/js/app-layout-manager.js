import { CausalView } from "./causal-view/causal-view.js";

import { CausesComponent } from "./components/causes-component/causes-component.js";
import { NodeValueComponent } from "./components/node-value-component.js";
import { WeightsComponent } from "./components/weight-component/weights-component.js";
import { factsCollection } from "./test-data.js";
import { GoldenLayout } from "golden-layout";
import * as d3 from "d3";
import { ComponentsDataManager } from "./components-data-manager.js";

function createId() {
  return crypto.randomUUID();
}

const defaultConfig = {
  root: {
    type: "row",
    content: [
      {
        type: "component",
        componentType: "Causal View",
        id: createId(),
      },
      {
        type: "column",
        width: 25,
        content: [
          {
            type: "component",
            componentType: "Node Value",
            id: createId(),
            height: 22,
          },
          {
            type: "component",
            componentType: "Causes",
            id: createId(),
          },
          {
            type: "component",
            componentType: "Weights",
            id: createId(),
            height: 30,
          },
        ],
      },
    ],
  },
};

const defaultComponentTypesAndFactories = {
  "Causal View": function (container) {
    this.causalView = new CausalView(container.element, this.api);
    d3.select(container.element).classed("causal-view", true);
    const causalModelFacts = JSON.parse(factsCollection);
    this.causalView.init([]);
  },

  "Node Value": function (container) {
    const nodeValueComponent = new NodeValueComponent(
      container.element,
      this.causalView,
      this.api
    );
    nodeValueComponent.init();
  },

  Causes: function (container) {
    const causesComponent = new CausesComponent(
      container.element,
      this.causalView,
      this.api
    );
    causesComponent.init();
  },

  Weights: function (container) {
    const weightsComponent = new WeightsComponent(
      container.element,
      this.causalView,
      this.api
    );
    weightsComponent.init();
  },
};

export class AppLayoutManager {
  constructor(layoutSelector, api) {
    this.layoutContainer = d3
      .select(layoutSelector)
      .attr("class", "layout-container");
    this.api = api;

    this.componentsDataManager = new ComponentsDataManager(api);
  }

  // When check the according item in the menu in the main process
  onSetComponentActive(event, data) {
    const componentData = this.componentsDataManager.getComponentDataById(
      data.id
    );

    if (!componentData) return;

    if (data.isActive) {
      this.layout.addComponentAtLocation(componentData.componentType, null);
    } else {
      this.componentsDataManager
        .getComponentDataById(data.id)
        .componentItem?.close();
    }
  }

  initLayout(config) {
    if (!config) config = defaultConfig;

    this.idsAndComponentItems = new Map();

    // Create layout
    const layout = (this.layout = new GoldenLayout(
      this.layoutContainer.node()
    ));
    layout.layoutConfig.header.popout = false;
    layout.resizeWithContainerAutomatically = true;
    layout.on("focus", function () {
      layout.clearComponentFocus();
    });

    // layout.on("itemCreated", this.onItemCreatedOrDestroyed.bind(this, true));
    // layout.on("itemDestroyed", this.onItemCreatedOrDestroyed.bind(this, false));

    this.registerComponents(defaultComponentTypesAndFactories);
    this.loadConfig(config);

    this.api.onSetComponentActive(this.onSetComponentActive.bind(this));
  }

  onItemCreatedOrDestroyed(isCreated, event) {
    console.log(
      isCreated ? "created " : "destroyed ",
      event.target.id,
      event.target.title
    );
    this.componentsDataManager.setComponentDataById(
      event.target.id,
      isCreated,
      isCreated ? this.event.target : null
    );
    // const componentData = this.getComponentDataById(event.target.id);
    // if (!componentData) return;

    // if (isCreated) this.idsAndComponentItems.set(event.target.id, event.target);
    // else this.idsAndComponentItems.delete(event.target.id);

    // componentData.isActive = isCreated;
    // this.api.sendComponentsData(this.componentsData);
  }

  loadConfig(config) {
    this.layout.loadLayout(config);
    this.componentsDataManager.setComponentsDataFromLayoutConfig(config);
  }

  // setComponentsData(componentsData) {
  //   this.componentsData = componentsData;
  //   console.log("loaded components data: ", this.componentsData);

  //   this.api.sendComponentsData(componentsData);
  // }

  // * Should be called once
  // * Every factory function will be bound to this ComponentManager
  registerComponents(componentTypesAndFactories) {
    for (const [componentType, factoryFunc] of Object.entries(
      componentTypesAndFactories
    )) {
      this.layout.registerComponentFactoryFunction(
        componentType,
        factoryFunc.bind(this)
      );
    }
    // this.api.sendComponentsRegistered(Object.keys(componentTypesAndFactories));
  }
}
