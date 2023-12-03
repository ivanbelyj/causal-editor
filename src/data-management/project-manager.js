import { dialog, ipcMain, app } from "electron";
import { AppTitleManager } from "./app-title-manager";
import { CurrentFileManager } from "./current-file-manager";
import { ProjectData } from "./project-data";
import { FormattingUtils } from "./formatting-utils";

// Todo: change filters older in release
const projectFileFilters = [
  { name: "JSON", extensions: ["json"] },
  { name: "Causal Model Project", extensions: ["cmprj"] },
];

const causalModelFactsFileFilters = [
  { name: "JSON", extensions: ["json"] },
  { name: "Causal Model Facts", extensions: ["cm"] },
];

export class ProjectManager {
  #isUnsavedChanges;

  constructor(window) {
    this.window = window;

    this.appTitleManager = new AppTitleManager(window);

    // Adding $type: "variant" is necessary for implementation nodes
    // for correct deserialization in Causal Model library
    this.filesManager = new CurrentFileManager(
      this.appTitleManager,
      ProjectManager.processProjectDataBeforeSave,
      window
    );

    ipcMain.on(
      "send-is-unsaved-changes",
      (event, { isUnsavedChangesInCurrentFile }) => {
        this.appTitleManager.isUnsavedChanges = isUnsavedChangesInCurrentFile;
        this.#isUnsavedChanges = isUnsavedChangesInCurrentFile;
      }
    );

    window.on("close", async (event) => {
      event.preventDefault();
      await this.confirmUnsavedChanges(() => {
        app.exit();
      });
    });
  }

  async confirmUnsavedChanges(onConfirmed, onCancelled) {
    // If there are no unsaved changes, confirmation is not required
    if (!this.#isUnsavedChanges) {
      await onConfirmed?.();
      return;
    }

    const fileNameToDisplay = this.filesManager.currentFilePath;
    const { response } = await dialog.showMessageBox(this.window, {
      type: "warning",
      buttons: ["Yes", "No", "Cancel"],
      message: `Do you want to save the changes you made ${
        fileNameToDisplay ? "to " + fileNameToDisplay : ""
      }?`,
      detail: "Your changes will be lost if you don't save them.",
    });

    if (response === 0) {
      await this.saveProject();
      // onSavedCallback?.();
    }
    if (response === 2) {
      // Promise.resolve().then(onCancelled);
      await onCancelled?.();
    } else {
      await onConfirmed?.();
    }
  }

  async createNewProject() {
    await this.confirmUnsavedChanges(async () => {
      this.filesManager.currentFilePath = null;
      this.#sendOpenData(ProjectData.createEmptyProjectData());
    });
  }

  async saveProject() {
    await this.filesManager.saveData("save", projectFileFilters, true);
  }

  async saveProjectAs() {
    await this.filesManager.saveData("save-as", projectFileFilters, true);
  }

  async exportCausalModelFacts() {
    this.filesManager.saveData(
      "save",
      causalModelFactsFileFilters,
      false,
      (projectData) => projectData.facts
    );
  }

  #sendMessage(messageName, data) {
    this.window.webContents.send(messageName, data);
  }

  #sendOpenData(projectData) {
    // this.appTitleManager.reset();
    this.#sendMessage("open-data", projectData);
    this.#sendMessage("reset");
  }

  async openProject() {
    await this.confirmUnsavedChanges(async () => {
      const projectData = await this.filesManager.openFileData(
        projectFileFilters,
        true
      );
      if (projectData) this.#sendOpenData(projectData);
    });
  }

  async importCausalModelFacts() {
    await this.confirmUnsavedChanges(async () => {
      const openedData = await this.filesManager.openFileData(
        causalModelFactsFileFilters,
        false
      );

      if (openedData) {
        const projectData = ProjectData.fromCausalModelFacts(openedData);
        this.#sendOpenData(projectData);
      }
    });
  }

  static processProjectDataBeforeSave(projectData) {
    projectData.facts.forEach((fact) => {
      FormattingUtils.addFactVariantProperty(fact);
      FormattingUtils.moveUpTypePropertiesRecursively(fact);
    });
  }
}
