import { DataValidator } from "../../validation/data-validator";
import VersionUtils from "../../version-utils";
import { UpgradeToV1 } from "./upgrade-to-v1";

export class UpgradePipeline {
  constructor() {
    this.upgradeHandlers = [new UpgradeToV1()];
  }

  upgradeProjectData(projectData) {
    for (const handler of this.upgradeHandlers) {
      projectData = handler.upgradeProjectData(projectData);
    }
    return projectData;
  }

  upgradeCausalModel(causalModel) {
    for (const handler of this.upgradeHandlers) {
      causalModel = handler.upgradeCausalModel(causalModel);
    }
    return causalModel;
  }

  shouldUpgradeProjectData(projectData) {
    return this.#isNotLatest(VersionUtils.getVersion(projectData));
  }

  #isNotLatest(version) {
    DataValidator.getLatestVersion() > version;
  }
}
