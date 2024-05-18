import { NodeValueComponent } from "../../components/node-value-component.js";
export function createNodeValue(container) {
  const nodeValueComponent = new NodeValueComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager
  );
  nodeValueComponent.init();
}
