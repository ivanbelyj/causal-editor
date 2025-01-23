import { DataValidator } from "../data/validation/data-validator";

export class ProjectData {
  constructor({
    causalModels,
    version,
    defaultMainModel,
    blockConventions,
    blockCausesConventions,
    blockResolvingMap
  }) {
    this.causalModels = causalModels;
    this.version = version;
    this.defaultMainModel = defaultMainModel;
    this.blockConventions = blockConventions;
    this.blockCausesConventions = blockCausesConventions;
    this.blockResolvingMap = blockResolvingMap;
  }

  static createProjectData(args) {
    console.log("create project data from", args);

    let {
      causalModels,
      version,
      defaultMainModel
    } = args ?? {};
    causalModels ??= [];
    defaultMainModel ??= causalModels.length > 0 ? causalModels[0].name : null;
    version ??= DataValidator.getLatestVersion();
    return new ProjectData({
      ...args,
      causalModels,
      version,
      defaultMainModel
    });
  }

  static fromJson(json) {
    return new ProjectData(JSON.parse(json));
  }

  getCausalModel(name) {
    return this.causalModels.find((x) => x.name === name);
  }
}
