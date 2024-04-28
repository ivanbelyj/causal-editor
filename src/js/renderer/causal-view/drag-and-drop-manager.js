import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils";
import { DragNodesCommand } from "../undo-redo/commands/drag-nodes-command";
import { CausalViewStructure } from "./causal-view-structure";

// Distances less than this value will not be considered as a node move
// and won't execute a Command
const dragDistanceThreshold = 1e-3;

// CausalViewStructure's drag and drop manager
export class DragAndDropManager {
  constructor(causalViewStructure, undoRedoManager, selectionManager) {
    this.causalViewStructure = causalViewStructure;
    this.undoRedoManager = undoRedoManager;
    this.selectionManager = selectionManager;
  }

  addNodesDrag(nodesSelection) {
    nodesSelection
      .attr("cursor", "grab")
      .call(
        d3
          .drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

    const structure = this.causalViewStructure;
    const undoRedoManager = this.undoRedoManager;
    const dragAndDropManager = this;

    let posDataBeforeDrag;
    function dragStarted(event, d) {
      posDataBeforeDrag = dragAndDropManager.getNodesToDragPosData(
        d.data.fact.Id
      );

      d3.select(this).attr("cursor", "grabbing");
    }

    function dragged(event, d) {
      const posDataToDrag = dragAndDropManager.getNodesToDragPosData(
        d.data.fact.Id
      );

      // Change positions of nodes that should be dragged
      posDataToDrag.forEach(({ nodeId }) => {
        CausalViewStructure.getNodeSelectionById(nodeId)
          .attr("transform", (d) => {
            return `translate(${(d.x += event.dx)}, ${(d.y += event.dy)})`;
          })
          .raise();
      });

      structure.updateEdges();
    }

    function dragEnded(event, d) {
      const draggedNodeId = d.data.fact.Id;
      const posDataAfterDrag =
        dragAndDropManager.getNodesToDragPosData(draggedNodeId);

      // console.log(
      //   "drag and drop. from ",
      //   posDataBeforeDrag,
      //   "to",
      //   posDataAfterDrag
      // );
      d3.select(this).attr("cursor", "grab");

      const getPointOfDraggedNode = (posData) =>
        posData.find((x) => x.nodeId == draggedNodeId);

      const dragDistance = DragAndDropManager.distance(
        getPointOfDraggedNode(posDataBeforeDrag),
        getPointOfDraggedNode(posDataAfterDrag)
      );

      if (dragDistance >= dragDistanceThreshold)
        undoRedoManager.execute(
          dragAndDropManager.getDragCommand(posDataAfterDrag, posDataBeforeDrag)
        );
    }
  }

  // Pos data contains node id and position of the node
  getNodesToDragData(draggedNodeId) {
    const idsToDrag = this.selectionManager.getNodeIdsToDrag(draggedNodeId);
    return idsToDrag.map(
      this.causalViewStructure.getNodeById,
      this.causalViewStructure
    );
  }

  // Todo: refactor?

  getNodesToDragPosData(draggedNodeId) {
    return this.getNodesToDragData(draggedNodeId).map((nodeData) => ({
      nodeId: nodeData.data.fact.Id,
      x: nodeData.ux,
      y: nodeData.uy,
    }));
  }

  static distance(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  getDragCommand(nodesDataAfterDrag, nodesDataBeforeDrag) {
    return new DragNodesCommand(this, nodesDataAfterDrag, nodesDataBeforeDrag);
  }

  setPosByPosData(posData) {
    posData.forEach(({ nodeId, x, y }) => {
      const nodeSelection = d3.select(
        `.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`
      );
      const nodeDatum = nodeSelection.datum();
      nodeDatum.ux = x;
      nodeDatum.uy = y;
      nodeSelection.attr("transform", (d) => {
        return `translate(${x}, ${y})`;
      });

      this.causalViewStructure.updateEdges();
    });
  }
}
