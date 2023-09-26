import { CausalView } from "./causal-view/causal-view.js";

import { CausesComponent } from "./components/causes-component/causes-component.js";
import { NodeValueComponent } from "./components/node-value-component.js";
import { WeightsComponent } from "./components/weights-component/weights-component.js";
import { factsCollection } from "./test-data.js";
import { GoldenLayout, LayoutManager } from "golden-layout";
import * as d3 from "d3";
import { UndoRedoManager } from "./undo-redo/undo-redo-manager.js";
import { CausalFactProvider } from "./components/providers/causal-fact-provider.js";
import { CausesChangeManager } from "./components/causes-change-manager.js";

const defaultConfig = {
  root: {
    type: "row",
    content: [
      {
        type: "component",
        componentType: "Causal View",
        // id: createId(),
      },
      {
        type: "column",
        width: 25,
        content: [
          {
            type: "component",
            componentType: "Node Value",
            // id: createId(),
            height: 22,
          },
          {
            type: "component",
            componentType: "Causes",
            // id: createId(),
          },
          {
            type: "component",
            componentType: "Weights",
            // id: createId(),
            height: 30,
          },
        ],
      },
    ],
  },
};

// Todo: refactor class?

const defaultComponentTypesAndFactories = {
  "Causal View": function (container) {
    this.undoRedoManager = new UndoRedoManager(this.api);
    // this.causesChangeManager = new CausesChangeManager(this.causalView);

    this.causalView = new CausalView(
      container.element,
      this.api,
      this.undoRedoManager
      // this.causesChangeManager
    );

    this.causesChangeManager = this.causalView.causesChangeManager;

    d3.select(container.element).classed("causal-view", true);
    const causalModelFacts = JSON.parse(factsCollection);
    // Todo: fix init with causalModelFacts
    this.causalView.init([]);

    // For tracking changes in external code to update causal-view
    // this.causesChangeManager = new CausesChangeManager(this.causalView);
    // this.causalView.selectionManager.addEventListener(
    //   "singleNodeSelected",
    //   (event) => {
    //     const causalModelFact = event.data.node.data;
    //     this.causesChangeManager.reset(causalModelFact);
    //   }
    // );

    // this.causalView.selectionManager.addEventListener(
    //   "singleNodeNotSelected",
    //   () => this.causesChangeManager.reset(null)
    // );
  },

  "Node Value": function (container) {
    const nodeValueComponent = new NodeValueComponent(
      container.element,
      this.causalView,
      this.api,
      this.undoRedoManager
    );
    nodeValueComponent.init();
  },

  Causes: function (container) {
    const causesComponent = new CausesComponent(
      container.element,
      this.causalView,
      this.api,
      this.undoRedoManager,
      this.causesChangeManager
    );
    causesComponent.init();
  },

  Weights: function (container) {
    const weightsComponent = new WeightsComponent(
      container.element,
      this.causalView,
      this.api,
      this.undoRedoManager,
      this.causesChangeManager
    );
    weightsComponent.init();
  },
};

export class AppLayoutManager {
  componentTypesAndItems;
  constructor(layoutSelector, api) {
    this.layoutContainer = d3
      .select(layoutSelector)
      .attr("class", "layout-container");
    this.api = api;

    this.componentTypesAndItems = new Map();
  }

  // When check the according item in the menu in the main process
  onSetComponentActive(event, { componentType, isActive }) {
    const locationSelectors =
      // LayoutManager.afterFocusedItemIfPossibleLocationSelectors;
      [
        { typeId: 3 /* FirstRowOrColumn */, index: 1 },
        // { typeId: 0 /* FocusedItem */, index: 1 },
        // { typeId: 2 /* FirstStack */, index: undefined },
        { typeId: 7 /* Root */, index: undefined },
      ];
    console.log();
    if (isActive) {
      this.layout.addComponentAtLocation(
        componentType,
        null,
        componentType,
        locationSelectors
      );

      if (!this.componentTypesAndItems.has(componentType))
        this.componentTypesAndItems.set(componentType, null);
    } else {
      const compItemToClose = this.componentTypesAndItems.get(componentType);
      compItemToClose?.close();
      this.componentTypesAndItems.delete(componentType);
    }
  }

  initLayout(config) {
    if (!config) config = defaultConfig;

    // Create layout
    const layout = new GoldenLayout(this.layoutContainer.node());
    this.layout = layout;

    layout.layoutConfig.header.popout = false;
    layout.resizeWithContainerAutomatically = true;
    layout.on("focus", function () {
      layout.clearComponentFocus();
    });

    layout.on("itemCreated", this.onItemCreatedOrDestroyed.bind(this, true));
    layout.on("itemDestroyed", this.onItemCreatedOrDestroyed.bind(this, false));

    this.registerComponents(defaultComponentTypesAndFactories);
    this.loadConfig(config);

    this.api.onSetComponentActive(this.onSetComponentActive.bind(this));

    // d3.selectAll(".lm_stack").attr("tabindex", 0);
  }

  onItemCreatedOrDestroyed(isCreated, event) {
    const componentType = event.target.componentType;
    if (!componentType) return; // It is not a component

    if (isCreated) this.componentTypesAndItems.set(componentType, event.target);
    else this.componentTypesAndItems.delete(componentType);

    this.api.sendComponentActive({
      componentType,
      isActive: isCreated,
    });
  }

  static getComponentTypesFromLayoutConfig(config) {
    let res = [];
    for (const prop in config) {
      if (prop == "componentType") {
        res.push(config.componentType);
      } else if (typeof config[prop] == "object") {
        const innerTypes = AppLayoutManager.getComponentTypesFromLayoutConfig(
          config[prop]
        );
        if (innerTypes.length > 0) res = [...res, ...innerTypes];
      }
    }
    return res;
  }

  loadConfig(config) {
    const loadedFromConfig =
      AppLayoutManager.getComponentTypesFromLayoutConfig(config);
    for (const componentType of loadedFromConfig) {
      this.api.sendComponentActive({ componentType, isActive: true });
    }
    this.layout.loadLayout(config);
  }

  // - Should be called once
  // - Every factory function will be bound to this AppLayoutManager
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
