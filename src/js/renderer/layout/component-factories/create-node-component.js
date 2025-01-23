import { DeclaredBlockComponent } from "../../components/declared-block-component.js";
import { NodeValueComponent } from "../../components/node-value-component.js";
export function createNodeComponent(container) {
  const nodeValueComponent = new NodeValueComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager
  );
  nodeValueComponent.init();

  const declaredBlockComponent = new DeclaredBlockComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager,
    this.dataManager
  );
  declaredBlockComponent.init();
}
