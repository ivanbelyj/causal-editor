import { ProjectData } from "../../main/data/project-data";
import { CausalViewDataManager } from "../causal-view/causal-view-data-manager";

const eventBus = require("js-event-bus")();

/** Manages project data, that will be passed to the main process */
export class DataManager extends EventTarget {
  api;
  currentCausalViewDataManager;
  projectData;

  constructor({ api }) {
    super();

    this.api = api;

    this.#initSaveData(api);
    this.#initOpenData(api);
  }

  get blockConventions() {
    console.log("get block conventions. project data: ", this.projectData);
    return this.projectData.blockConventions ?? [];
  }

  get blockCausesConventions() {
    return this.projectData.blockCausesConventions ?? [];
  }

  get blockCausesConventions() {
    return this.projectData.blockCausesConventions ?? [];
  }

  /**
   * Current CausalViewDataManager is used for getting data
   * of the currently editing causal view
   * @param {CausalViewDataManager} causalViewDataManager
   */
  setCurrentCausalViewDataManager(causalViewDataManager) {
    this.currentCausalViewDataManager = causalViewDataManager;
  }

  #initSaveData(api) {
    api.onSaveData((event, { dataToSaveId, title }) => {
      event.sender.send(`data-to-save-${dataToSaveId}`, {
        dataToSave: this.#getProjectData(),
        title,
      });
    });
  }

  #getProjectData() {
    return ProjectData.createProjectData({
      ...(this.projectData ?? {}),
      causalModels: this.#getCausalModels(),
    });
  }

  #getCausalModels() {
    const { facts, blocks, nodesData } =
      this.currentCausalViewDataManager.getModelNodesData();

    const currentCausalModel = {
      facts,
      declaredBlocks: blocks,
      nodesData,
      name: "name"  // TODO:
    };

    return [
      ...this.projectData.causalModels.filter(
        (x) => x.name != currentCausalModel.name
      ),
      currentCausalModel,
    ];
  }

  #initOpenData(api) {
    api.onOpenData((event, projectData) => {
      console.log("opened project data: ", projectData);

      this.projectData = new ProjectData(projectData);

      //   const causalViewData = RendererDataManager.#toCausalViewData(projectData);
      //   this.causalViewManager.reset(causalViewData);

      eventBus.emit("dataOpened", null, { projectData: this.projectData });

      // const dataOpened = new Event("dataOpened");
      // dataOpened.projectData = this.projectData;
      // this.dispatchEvent(dataOpened);
    });
  }

  // static #toCausalViewData(projectData) {
  //   return CausalViewDataUtils.factsAndNodesDataToCausalViewData(
  //     projectData.facts,
  //     projectData.nodesData
  //   );
  // }
}
