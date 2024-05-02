import { dialog } from "electron";
import { FormattingUtils } from "../data/formatting-utils";
import { ProjectData } from "../data/project-data";
import { UpgradePipeline } from "../data/data-upgrade/upgrade-pipeline";
import { DataValidator } from "../validation/data-validator";

/**
 * High level project data processing component
 */
export class ProjectDataHelper {
  constructor() {
    this.upgradePipeline = new UpgradePipeline();
  }

  createEmptyProjectData() {
    return ProjectData.createEmptyProjectData();
  }

  mutateProjectDataBeforeSave(projectData) {
    projectData.facts.forEach((fact) => {
      FormattingUtils.moveUpTypePropertiesRecursively(fact);
    });
  }

  async processOpenedProjectData(projectData) {
    projectData = await this.#upgradedProjectData(projectData);
    this.#validate(projectData);

    return projectData;
  }

  processImportedFacts(openedData) {
    ProjectData.fromCausalModelFacts(openedData);
  }

  async #upgradedProjectData(projectData) {
    if (this.upgradePipeline.shouldUpgradeProjectData(projectData)) {
      await this.#showDataUpgradeDialog();
      projectData = this.upgradePipeline.upgradeProjectData(projectData);
    }
    return projectData;
  }

  #validate(projectData) {
    const res = DataValidator.validateProjectData(projectData);
    if (res === null) {
      ProjectDataHelper.#showUnknownVersionWarning();
    } else if (res?.length) {
      ProjectDataHelper.#showValidationWarning(res);
    }
  }

  //#region Dialog messages

  async #showDataUpgradeDialog() {
    await dialog.showMessageBox({
      type: "question",
      title: "Data upgrade",
      message: "Opened data will be upgraded to the latest version.",
      buttons: ["Yes"],
      defaultId: 0,
    });
  }

  static #showUnknownVersionWarning() {
    dialog.showMessageBox({
      type: "warning",
      title: "Unknown version",
      message:
        "The data version is either unknown or incorrect, preventing validation. " +
        "Please be aware that the data might not be valid, potentially " +
        "leading to unpredictable behavior within the editor.",
      buttons: ["Ok"],
      defaultId: 0,
    });
  }

  static #showValidationWarning(errors) {
    const errorsString = errors.map((error) => `${error.message}`).join("\n");

    dialog.showMessageBox({
      type: "warning",
      title: "Data validation errors",
      message: "Opened data can be incorrect",
      detail:
        "Some data format requirements are not being met. " +
        "This could stem from external interference with the model, " +
        "such as manual file editing, or an error within the editor. Such issues " +
        "may lead to unstable behavior when working with the causal model. Errors:\n" +
        errorsString,
      buttons: ["Ok"],
    });
  }

  //#endregion
}
