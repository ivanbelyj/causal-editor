import { WeightsComponent } from "../../components/weights-component/weights-component.js";

export function createWeightsComponent(container) {
  const weightsComponent = new WeightsComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager,
    this.causesChangeManager
  );
  weightsComponent.init();
}
