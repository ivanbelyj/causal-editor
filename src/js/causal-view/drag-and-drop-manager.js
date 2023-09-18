import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils";
import { Command } from "../undo-redo/command";

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
    const selectionManager = this.selectionManager;
    const undoRedoManager = this.undoRedoManager;
    const dragAndDropManager = this;

    let posDataBeforeDrag;
    function dragStarted(event, d) {
      const draggedNodeId = d.data.Id;

      const idsToDrag = selectionManager.getNodesIdsToDrag(draggedNodeId);

      posDataBeforeDrag = dragAndDropManager.nodeIdsToPosData(idsToDrag);

      d3.select(this).attr("cursor", "grabbing");
      // console.log("drag started", [...d3.select(this).data()]);
    }

    function dragged(event, d) {
      const draggedNodeId = d.data.Id;

      const idsToDrag = selectionManager.getNodesIdsToDrag(draggedNodeId);

      idsToDrag.forEach((id) => {
        d3.select(`.${CausalModelUtils.getNodeIdClassNameByNodeId(id)}`)
          .attr("transform", (d) => {
            return `translate(${(d.x += event.dx)}, ${(d.y += event.dy)})`;
          })
          .raise();
      });
      // console.log("dragging", idsToDrag);

      structure.updateEdges();
    }

    function dragEnded(event, d) {
      const draggedNodeId = d.data.Id;

      const idsToDrag = selectionManager.getNodesIdsToDrag(draggedNodeId);

      const posDataAfterDrag = dragAndDropManager.nodeIdsToPosData(idsToDrag);

      console.log(
        "drag and drop. from ",
        posDataBeforeDrag,
        "to",
        posDataAfterDrag
      );
      d3.select(this).attr("cursor", "grab");
      undoRedoManager.execute(
        dragAndDropManager.getDragCommand(posDataBeforeDrag, posDataAfterDrag)
      );
      // console.log("drag ended", [...d3.select(this).data()]);
    }
  }

  nodeIdsToPosData(nodeIds) {
    return nodeIds.map(
      function (nodeId) {
        const nodeData = this.causalViewStructure.getNodeById(nodeId);
        return { nodeId, x: nodeData.ux, y: nodeData.uy };
      }.bind(this)
    );
    // return nodesData.map((nodeData) => ({
    //   id: nodeData.data.Id,
    //   x: nodeData.ux,
    //   y: nodeData.uy,
    // }));
  }

  getDragCommand(nodesDataBeforeDrag, nodesDataAfterDrag) {
    return new Command(
      this.setPosByPosData.bind(this, nodesDataAfterDrag),
      this.setPosByPosData.bind(this, nodesDataBeforeDrag)
    );
  }

  setPosByPosData(posData) {
    posData.forEach(({ nodeId, x, y }) => {
      const nodeSelection = d3.select(
        `.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`
      );
      // Todo: set to node data
      console.log("set pos by pos data. node selection:", nodeSelection);
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
