import { app } from "electron";
import { CurrentFileManager } from "../data/current-file-manager";
import { UnsavedChangesHelper } from "./unsaved-changes-helper";
import { AppTitleManager } from "./app-title-manager";
import { DataProcessingHelper } from "./data-processing-helper";
import { ProjectData } from "../data/project-data";

const cmPrjFilter = {
  name: "Causal Model Project",
  extensions: ["cmprj", "json"],
};
const cmFactsFilter = {
  name: "Causal Model Facts",
  extensions: ["cm", "json"],
};
const jsonFilter = { name: "JSON", extensions: ["json"] };

const projectFileFilters = [cmPrjFilter];
const causalModelFactsFileFilters = [cmFactsFilter];

export class DataManager {
  constructor(window) {
    this.window = window;

    const appTitleManager = new AppTitleManager(window);

    this.unsavedChangesHelper = new UnsavedChangesHelper({
      window,
      getCurrentFilePathCallback: () => this.filesManager.currentFilePath,
      saveProjectCallback: this.saveProject.bind(this),
      appTitleManager,
    });

    this.projectDataHelper = new DataProcessingHelper(
      this.unsavedChangesHelper
    );

    this.filesManager = new CurrentFileManager(
      appTitleManager,
      this.projectDataHelper.mutateProjectDataBeforeSave,
      window
    );

    window.on("close", this.onClose.bind(this));
  }

  async onClose(event) {
    event.preventDefault();
    await this.confirmUnsavedChanges(() => {
      app.exit();
    });
  }

  async confirmUnsavedChanges(onConfirmed, onCancelled) {
    await this.unsavedChangesHelper.confirmUnsavedChanges(
      onConfirmed,
      onCancelled
    );
  }

  async createNewProject() {
    await this.confirmUnsavedChanges(async () => {
      this.filesManager.currentFilePath = null;
      this.#sendOpenData(this.projectDataHelper.createEmptyProjectData());
    });
  }

  async saveProject() {
    await this.filesManager.saveData(
      "save",
      projectFileFilters,
      "Save project",
      true
    );
  }

  async saveProjectAs() {
    await this.filesManager.saveData(
      "save-as",
      projectFileFilters,
      "Save project as",
      true
    );
  }

  // TODO: change
  // async exportCausalModelFacts() {
  //   this.filesManager.saveData(
  //     "save",
  //     causalModelFactsFileFilters,
  //     "Export facts",
  //     false,
  //     // TODO:
  //     (projectData) => projectData.facts
  //   );
  // }

  #sendMessage(messageName, data) {
    this.window.webContents.send(messageName, data);
  }

  #sendOpenData(projectData) {
    this.#sendMessage("open-data", projectData);
    this.#sendMessage("reset");
  }

  async openProject() {
    await this.confirmUnsavedChanges(async () => {
      const projectData = await this.filesManager.openFileData(
        projectFileFilters,
        true,
        "Open project"
      );
      if (projectData) {
        this.#sendOpenData(
          await this.projectDataHelper.processOpenedProjectData(projectData)
        );
      }
    });
  }

  // TODO: change
  // async importCausalModelFacts() {
  //   await this.confirmUnsavedChanges(async () => {
  //     const openedData = await this.filesManager.openFileData(
  //       causalModelFactsFileFilters,
  //       false,
  //       "Import facts"
  //     );

  //     if (openedData) {
  //       const projectData =
  //         this.projectDataHelper.processImportedFacts(openedData);
  //       this.#sendOpenData(projectData);
  //     }
  //   });
  // }
}
