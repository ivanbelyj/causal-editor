import { GoldenLayout } from "golden-layout";
import * as d3 from "d3";

import { createCausalView } from "./component-factories/create-causal-view.js";
import { createCausesComponent } from "./component-factories/create-causes-component.js";
import { createWeightsComponent } from "./component-factories/create-weights-component.js";
import { defaultLayoutConfig } from "./default-layout-config.js";
import LayoutConfigUtils from "./layout-config-utils.js";
import { createProjectView } from "./component-factories/create-project-view.js";
import { createNodeComponent } from "./component-factories/create-node-component.js";

const defaultComponentTypesAndFactories = {
  "Causal View": createCausalView,
  "Node": createNodeComponent,
  Causes: createCausesComponent,
  Weights: createWeightsComponent,
  "Project View": createProjectView,
};

export class LayoutManager {
  constructor(layoutSelector, api, dataManager) {
    this.layoutContainer = d3
      .select(layoutSelector)
      .attr("class", "layout-container");
    this.api = api;

    this.componentTypesAndItems = new Map();

    this.dataManager = dataManager;
  }

  initLayout(config) {
    if (!config) config = defaultLayoutConfig;

    this.#initGoldenLayout();

    this.#registerComponents(defaultComponentTypesAndFactories);
    this.#loadConfig(config);

    this.api.onSetComponentActive(this.#onSetComponentActive.bind(this));

    // d3.selectAll(".lm_stack").attr("tabindex", 0);
  }

  #initGoldenLayout() {
    const layout = new GoldenLayout(this.layoutContainer.node());
    this.layout = layout;

    layout.layoutConfig.header.popout = false;
    layout.resizeWithContainerAutomatically = true;
    layout.on("focus", function () {
      layout.clearComponentFocus();
    });

    layout.on("itemCreated", this.#onItemCreatedOrDestroyed.bind(this, true));
    layout.on(
      "itemDestroyed",
      this.#onItemCreatedOrDestroyed.bind(this, false)
    );
  }

  /**
   * When check the according item in the menu in the main process
   */
  #onSetComponentActive(event, { componentType, isActive }) {
    const locationSelectors =
      // LayoutManager.afterFocusedItemIfPossibleLocationSelectors;
      [
        { typeId: 3 /* FirstRowOrColumn */, index: 1 },
        // { typeId: 0 /* FocusedItem */, index: 1 },
        // { typeId: 2 /* FirstStack */, index: undefined },
        { typeId: 7 /* Root */, index: undefined },
      ];
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

  #onItemCreatedOrDestroyed(isCreated, event) {
    const componentType = event.target.componentType;
    if (!componentType) return; // It is not a component

    if (isCreated) this.componentTypesAndItems.set(componentType, event.target);
    else this.componentTypesAndItems.delete(componentType);

    this.api.sendComponentActive({
      componentType,
      isActive: isCreated,
    });
  }

  #loadConfig(config) {
    const loadedFromConfig =
      LayoutConfigUtils.getComponentTypesFromLayoutConfig(config);
    for (const componentType in defaultComponentTypesAndFactories) {
      this.api.sendComponentActive({
        componentType,
        isActive: loadedFromConfig.includes(componentType),
      });
    }
    this.layout.loadLayout(config);
  }

  /**
   * - Should be called once
   * - Every factory function will be bound to this LayoutManager
   */
  #registerComponents(componentTypesAndFactories) {
    for (const [componentType, factoryFunc] of Object.entries(
      componentTypesAndFactories
    )) {
      this.layout.registerComponentFactoryFunction(
        componentType,
        factoryFunc.bind(this)
      );
    }
  }
}
