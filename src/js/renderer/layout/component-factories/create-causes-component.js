import { CausesComponent } from "../../components/causes-component/causes-component.js";

export function createCausesComponent(container) {
  const causesComponent = new CausesComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager,
    this.causesChangeManager
  );
  causesComponent.init();
}
