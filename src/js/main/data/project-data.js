import { DataValidator } from "../data/validation/data-validator";

export class ProjectData {
  static createProjectData(args) {
    let { facts, nodesData, version } = args ?? {};
    if (!facts) facts = [];
    if (!nodesData) nodesData = [];
    if (!version) version = DataValidator.getLatestVersion();
    return { facts, nodesData, version };
  }
}
