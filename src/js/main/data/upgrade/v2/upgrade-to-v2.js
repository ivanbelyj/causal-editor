import { ProjectData } from "../../project-data";

export class UpgradeToV2 {
  upgradeProjectData(projectData) {
    projectData = this.#upgradeCore(projectData);

    return projectData;

    // Now additional project data are ignored on upgrade
  }

  upgradeCausalModel(causalModel) {
    causalModel = this.#upgradeCore(causalModel);
    return causalModel;
  }

  #upgradeCore(data) {
    const mainModelName = "main";
    const mainCausalModel = {
      name: data.name ?? mainModelName,
      facts: data.facts,
    };

    data = {
      causalModels: [mainCausalModel],
      defaultMainModel: mainModelName,
      version: data.version,
    };

    return data;
  }
}
