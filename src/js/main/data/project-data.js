import { DataValidator } from "../data/validation/data-validator";

export class ProjectData {
  static createProjectData(facts, nodesData, restKeyValues) {
    return { facts, nodesData, ...restKeyValues };
  }

  static fromCausalModelFacts(causalModelFacts) {
    return ProjectData.createProjectData(causalModelFacts, [], {
      version: DataValidator.getLatestVersion(),
    });
  }

  static createEmptyProjectData() {
    return ProjectData.fromCausalModelFacts([]);
  }
}
