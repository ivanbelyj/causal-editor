export default class LayoutConfigUtils {
  static getComponentTypesFromLayoutConfig(config) {
    let res = [];
    for (const prop in config) {
      if (prop == "componentType") {
        res.push(config.componentType);
      } else if (typeof config[prop] == "object") {
        const innerTypes = LayoutConfigUtils.getComponentTypesFromLayoutConfig(
          config[prop]
        );
        if (innerTypes.length > 0) res = [...res, ...innerTypes];
      }
    }
    return res;
  }
}
