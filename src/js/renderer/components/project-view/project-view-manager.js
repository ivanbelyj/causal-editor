const eventBus = require("js-event-bus")();

export class ProjectViewManager {
  constructor({ projectView, api, dataManager }) {
    this.projectView = projectView;

    this.api = api;

    eventBus.on("dataOpened", this.emitMainModelSelected.bind(this));
  }

  emitMainModelSelected({ projectData }) {
    this.projectView.setProjectData(projectData);
    const defaultModelName = projectData.defaultMainModel;
    if (defaultModelName) {
      eventBus.emit("causalModelSelected", null, {
        causalModelName: defaultModelName,
      });
    }
  }
}
