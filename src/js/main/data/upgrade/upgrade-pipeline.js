import { DataValidator } from "../../data/validation/data-validator";
import VersionUtils from "../version-utils";
import { UpgradeToV1 } from "./v1/upgrade-to-v1";
import { UpgradeToV2 } from "./v2/upgrade-to-v2";

export class UpgradePipeline {
  constructor() {
    // In the current implementation, the keys of this map are not utilized
    // during the upgrade process; only the order of handlers is significant
    this.upgradeHandlers = new Map([
      [0, new UpgradeToV1()],
      [1, new UpgradeToV2()],
    ]);
  }

  upgradeProjectData(projectData) {
    return this.#runPipeline(projectData, (data, handler) =>
      handler.upgradeProjectData(data)
    );
  }

  upgradeCausalModel(causalModel) {
    return this.#runPipeline(causalModel, (data, handler) =>
      handler.upgradeCausalModel(data)
    );
  }

  shouldUpgrade(data) {
    return this.#isNotLatest(VersionUtils.getVersion(data));
  }

  /**
   * Upgrading data through a chain of upgrade handlers.
   * @param {any} data Upgraded data
   * @param {function(any, any): any} processDataCallback Callback that takes two arguments (data and upgrade handler) and returns processed data
   * @returns Upgraded data
   */
  #runPipeline(data, processDataCallback) {
    const version = VersionUtils.getVersion(data);
    for (const entry of this.#getUpgradeHandlers(version)) {
      data = processDataCallback(data, entry[1]);
      data = this.#incrementVersion(data);
    }
    return data;
  }

  #incrementVersion(data) {
    const { version: oldVersion, ...rest } = data;
    const res = { version: (oldVersion ?? 0) + 1, ...rest };
    return res;
  }

  #getUpgradeHandlers(version) {
    return Array.from(this.upgradeHandlers.entries()).slice(version);
  }

  #isNotLatest(version) {
    return DataValidator.getLatestVersion() > version;
  }
}
