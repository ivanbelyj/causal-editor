// A component responsible for handle layout components data
export class ComponentsDataManager {
  constructor(api) {
    this.api = api;
    this.activeComponentTypes = new Set();
  }

  static getComponentTypesFromLayoutConfig(config) {
    let res = [];
    for (const prop in config) {
      if (prop == "id") {
        res.push(config.componentType);
      } else if (typeof config[prop] == "object") {
        const innerTypes =
          ComponentsDataManager.getComponentTypesFromLayoutConfig(config[prop]);
        if (innerTypes.length > 0) res = [...res, ...innerTypes];
      }
    }
    return res;
  }

  setComponentActive(componentType, isActive) {
    if (isActive) {
      this.activeComponentTypes.add(componentType);
    } else {
      this.activeComponentTypes.delete(componentType);
    }

    // Todo:
    // this.api.sendComponentsData(this.componentsData);
  }

  setActiveComponentTypes(componentTypes) {
    this.api.sendComponentsData(componentTypes);
  }

  setComponentsDataFromLayoutConfig(config) {
    const componentsData =
      ComponentsDataManager.getComponentTypesFromLayoutConfig(config);
    this.setActiveComponentTypes(componentsData);
  }
}
