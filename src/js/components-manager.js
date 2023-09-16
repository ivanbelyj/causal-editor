import { CausalView } from "./causal-view/causal-view.js";

import { CausesComponent } from "./components/causes-component/causes-component.js";
import { NodeValueComponent } from "./components/node-value-component.js";
import { WeightsComponent } from "./components/weight-component/weights-component.js";
import { factsCollection } from "./test-data.js";
import { GoldenLayout } from "golden-layout";
import * as d3 from "d3";

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

export class ComponentsManager {
  constructor(layoutSelector, api) {
    this.layoutContainer = d3
      .select(layoutSelector)
      .attr("class", "layout-container");
    this.api = api;
  }

  static getComponentsDataFromConfig(config) {
    let res = [];
    for (const prop in config) {
      if (prop == "id") {
        res.push({
          componentType: config.componentType,
          id: config.id,
          isActive: true, // In config => activated
        });
      } else if (typeof config[prop] == "object") {
        const innerTypes = ComponentsManager.getComponentsDataFromConfig(
          config[prop]
        );
        if (innerTypes.length > 0) res = [...res, ...innerTypes];
      }
    }
    return res;
  }

  getComponentDataById(id) {
    return this.componentsData.find((x) => x.id === id);
  }

  onSetComponentActive(event, data) {
    const componentData = this.getComponentDataById(data.id);

    console.log("ids and component items", this.idsAndComponentItems);
    console.log("set component active: ", componentData);
    console.log("set component active. event", event);
    console.log("data", data);

    if (!componentData) return;

    if (data.isActive) {
      // Todo: ?

      const newItemConfig = {
        componentType: "component",
        id: createId(),
        parent: this.layout.rootItem.contentItems[0],
      };
      // this.layout.rootItem.contentItems[0].addChild(newItemConfig);

      this.layout.addComponentAtLocation(
        // newItemConfig,
        // null,
        componentData.componentType,
        null
        // LayoutManager.defaultLocationSelectors
      );
    } else {
      this.idsAndComponentItems.get(data.id).close();
    }
  }

  idsAndComponentItems;

  initLayout(config) {
    if (!config) config = defaultConfig;

    this.idsAndComponentItems = new Map();

    // Create layout
    const layout = (this.layout = new GoldenLayout(
      this.layoutContainer.node()
    ));
    layout.layoutConfig.header.popout = false;
    layout.resizeWithContainerAutomatically = true;
    layout.on(
      "itemCreated",
      function (event) {
        console.log("created item");
        this.idsAndComponentItems.set(event.target.id, event.target);
      }.bind(this)
    );
    layout.on(
      "itemDestroyed",
      function (event) {
        console.log("destr. comp data", this.componentsData);
        // Todo: ?
        const componentData = this.getComponentDataById(event.target.id);
        if (!componentData) return;

        componentData.isActive = false;
        console.log("destr. component data", componentData);
        console.log("destroyed item", event.target);
        this.api.sendComponentsData(this.componentsData);
      }.bind(this)
    );
    layout.on("focus", function () {
      layout.clearComponentFocus();
    });

    this.registerComponents(defaultComponentTypesAndFactories);
    this.loadConfig(config);

    this.api.onSetComponentActive(this.onSetComponentActive.bind(this));
  }

  loadConfig(config) {
    this.layout.loadLayout(config);
    const loadedComponentsData =
      ComponentsManager.getComponentsDataFromConfig(config);
    this.componentsData = loadedComponentsData;
    console.log("loaded from config: ", this.componentsData);

    this.api.sendComponentsData(loadedComponentsData);
  }

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
