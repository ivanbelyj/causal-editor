import { BlockCausesComponent } from "../../components/block-causes-component.js";
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

  const blockCausesComponent = new BlockCausesComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager,
    this.causesChangeManager,
    this.dataManager
  );
  blockCausesComponent.init();
}
