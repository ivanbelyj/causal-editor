import { ProjectData } from "../../main/data/project-data";
import { CausalViewDataUtils } from "./causal-view-data-utils";

/**
 * Responsible for providing data to the causal view and for background manipulations
 * (such as saving and opening data)
 */
export class CausalViewDataManager {
  init({ api, causalViewManager }) {
    this.causalViewManager = causalViewManager;
    // this.#initSaveData(api);
    // this.#initOpenData(api);
  }

  // #initSaveData(api) {
  //   api.onSaveData((event, { dataToSaveId, title }) => {
  //     const { facts, nodesData } = this.#getFactsAndNodesData();

  //     event.sender.send(`data-to-save-${dataToSaveId}`, {
  //       dataToSave: ProjectData.createProjectData({
  //         ...(this.projectData ?? {}),
  //         facts,
  //         nodesData,
  //       }),
  //       title,
  //     });
  //   });
  // }

  getModelNodesData() {
    console.log("dkjfdkfj", this.causalViewManager.structure.getNodesData())
    return CausalViewDataUtils.causalViewDataToModelNodesData(
      this.causalViewManager.structure.getNodesData()
    );
  }

  // #initOpenData(api) {
  //   api.onOpenData((event, projectData) => {
  //     console.log("opened project data: ", projectData);
  //     const causalViewData =
  //       CausalViewDataManager.#toCausalViewData(projectData);
  //     this.causalViewManager.reset(causalViewData);
  //   });
  // }

  // static #toCausalViewData(projectData) {
  //   return CausalViewDataUtils.factsAndNodesDataToCausalViewData(
  //     projectData.facts,
  //     projectData.nodesData
  //   );
  // }

  getCausalViewData() {
    return this.causalViewManager.structure.getNodesData();
  }
}
