import { FilesManager } from "./files-manager";
import { ProjectData } from "./project-data";

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
  constructor(window) {
    this.window = window;

    // Adding $type: "variant" is necessary for implementation nodes
    // for correct deserialization in Causal Model library
    this.filesManager = new FilesManager(
      ProjectManager.addVariantPropertyToFacts
    );
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

    if (openedData) {
      const projectData = ProjectData.fromCausalModelFacts(openedData);
      this.#sendOpenData(projectData);
    }
  }

  static addVariantPropertyToFacts(projectData) {
    const processedFacts = projectData.facts.map((fact) => {
      return Object.assign(
        fact.AbstractFactId ? { $type: "variant" } : {},
        fact
      );
    });
    return new ProjectData(processedFacts, projectData.nodesData);
  }
}
