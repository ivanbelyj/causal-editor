import { FilesManager } from "./files-manager";
import { ProjectData } from "./project-data";

const projectFileFilters = [
  { name: "Causal Model Project", extensions: ["cmprj"] },
  { name: "JSON", extensions: ["json"] },
];

const causalModelFactsFileFilters = [
  { name: "JSON", extensions: ["json"] },
  { name: "Causal Model Facts", extensions: ["cm"] },
];

export class ProjectManager {
  constructor(window) {
    this.filesManager = new FilesManager();
    this.window = window;
  }
  createNewProject() {
    this.filesManager.currentFilePath = null;
    this.#sendOpenData(ProjectData.createEmptyProjectData());
  }

  saveProject() {
    this.filesManager.initiateSaveAction("save", projectFileFilters, true);
  }

  saveProjectAs() {
    this.filesManager.initiateSaveAction("save-as", projectFileFilters, true);
  }

  exportCausalModelFacts() {
    this.filesManager.initiateSaveAction(
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
    this.#sendMessage("open-data", projectData);
    this.#sendMessage("reset");
  }

  async openProjectAsync() {
    const projectData = await this.filesManager.openFileData(
      projectFileFilters,
      true
    );
    if (projectData) this.#sendOpenData(projectData);
  }

  async importCausalModelFactsAsync() {
    const openedData = await this.filesManager.openFileData(
      causalModelFactsFileFilters,
      false
    );
    console.log("openedData", openedData);

    if (openedData) {
      const projectData = ProjectData.fromCausalModelFacts(openedData);
      console.log("projectData", projectData);
      console.log("projectData.facts", projectData.facts);
      this.#sendOpenData(projectData);
    }
  }
}
