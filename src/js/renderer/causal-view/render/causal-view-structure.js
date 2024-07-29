import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";
import { DragAndDropManager } from "./drag-and-drop-manager.js";
import { EdgeRenderer } from "./edge-renderer.js";
import { EventManager } from "./event-manager.js";
import { GraphManager } from "./graph-manager.js";
import { NodeRenderer } from "./node-renderer.js";
import { ZoomManager } from "./zoom-manager.js";

export class CausalViewStructure extends EventTarget {
  // Добавляем новые свойства для хранения ссылок на классы
  edgeRenderer;
  eventManager;
  graphManager;
  nodeRenderer;
  zoomManager;

  constructor(undoRedoManager) {
    super();
    this.undoRedoManager = undoRedoManager;
  }

  init(svgParent, nodesData, selectionManager) {
    this.selectionManager = selectionManager;

    this.edgeRenderer = new EdgeRenderer(svgParent, nodesData);
    this.eventManager = new EventManager();
    this.graphManager = new GraphManager();
    this.nodeRenderer = new NodeRenderer(svgParent, this.eventManager);
    this.zoomManager = new ZoomManager(svgParent, svgParent);

    // Todo: initialize
  }

  render() {
    this.nodeRenderer.renderNodes();
    this.edgeRenderer.renderEdges();
  }

  updateNodes() {
    this.nodeRenderer.updateNodes();
  }

  updateEdges() {
    this.edgeRenderer.updateEdges();
  }

  addEventListener(eventName, listener) {
    this.eventManager.addEventListener(eventName, listener);
  }

  removeEventListener(eventName, listenerToRemove) {
    this.eventManager.removeEventListener(eventName, listenerToRemove);
  }

  resetZoom() {
    this.zoomManager.resetZoom();
  }

  setGraph(graphData) {
    this.graphManager.setGraph(graphData);
  }

  addNodeWithData(nodeData) {
    this.graphManager.addNodeWithData(nodeData);
  }

  removeNode(nodeId) {
    this.graphManager.removeNode(nodeId);
  }

  addLink(sourceId, targetId) {
    this.graphManager.addLink(sourceId, targetId);
  }

  removeLink(sourceId, targetId) {
    this.graphManager.removeLink(sourceId, targetId);
  }
}
