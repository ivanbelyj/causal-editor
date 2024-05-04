import { DataValidator } from "../validation/data-validator";
import VersionUtils from "../version-utils";

export class ProjectData {
  facts;
  nodesData;
  version;

  constructor(facts, nodesData, version) {
    this.facts = facts;
    this.nodesData = nodesData;
    this.version = version;
  }

  static fromCausalModelFacts(causalModelFacts) {
    return new ProjectData(
      causalModelFacts,
      [],
      DataValidator.getLatestVersion()
    );
  }

  static createEmptyProjectData() {
    return ProjectData.fromCausalModelFacts([]);
  }
}
