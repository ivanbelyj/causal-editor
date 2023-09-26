export class ProjectData {
  facts;
  nodesData;

  constructor(facts, nodesData) {
    this.facts = facts;
    this.nodesData = nodesData;
  }

  static fromCausalModelFacts(causalModelFacts) {
    return new ProjectData(causalModelFacts);
  }

  static createEmptyProjectData() {
    return new ProjectData([]);
  }
}
