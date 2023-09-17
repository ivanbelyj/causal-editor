// A component responsible for handle layout components data
export class ComponentsDataManager {
  constructor(api) {
    this.api = api;
  }

  static getComponentsDataFromLayoutConfig(config) {
    let res = [];
    for (const prop in config) {
      if (prop == "id") {
        res.push({
          componentType: config.componentType,
          id: config.id,
          isActive: true, // In config => activated
        });
      } else if (typeof config[prop] == "object") {
        const innerTypes =
          ComponentsDataManager.getComponentsDataFromLayoutConfig(config[prop]);
        if (innerTypes.length > 0) res = [...res, ...innerTypes];
      }
    }
    return res;
  }

  getComponentDataById(id) {
    return this.componentsData?.find((x) => x.id === id);
  }

  // componentItem will be set to componentData if it's defined
  setComponentDataById(id, isActive, componentItem) {
    console.log("set component data by id", id, isActive, componentItem);

    const componentData = this.getComponentDataById(id);
    if (!componentData) return;

    componentData.isActive = isActive;

    if (isActive && componentItem)
      this.componentsData.componentItem = componentItem;

    this.api.sendComponentsData(this.componentsData);
  }

  setComponentsData(componentsData) {
    console.log("set components data: ", this.componentsData);

    this.componentsData = componentsData;

    this.api.sendComponentsData(componentsData);
  }

  setComponentsDataFromLayoutConfig(config) {
    const componentsData =
      ComponentsDataManager.getComponentsDataFromLayoutConfig(config);
    this.setComponentsData(componentsData);
  }
}
