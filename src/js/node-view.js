export class NodeView {
  causalView = null;
  init(causalView) {
    this.causalView = causalView;
    const nodeView = this;
    document.getElementById("update-btn").onclick = (...data) => {
      nodeView.onUpdateButtonClick(causalView, ...data);
    };
    causalView.structure.addEventListener("nodeClicked", (event) =>
      nodeView.onNodeClicked(event)
    );
  }

  onNodeClicked(event) {
    const nodeData = event.data.i.data;

    const nodeValue = nodeData["NodeValue"];
    document.getElementById("node-id-input").value =
      this.causalView.selection.currentSelectedNodeId;
    document.getElementById("node-title-input").value =
      nodeData["NodeTitle"] || nodeValue;
    document.getElementById("node-value-input").value = nodeValue;
  }

  onUpdateButtonClick(causalView) {
    const currentSelectedNodeId = causalView.selection.currentSelectedNodeId;
    if (!currentSelectedNodeId) return;
    const nodeTitleInput = document.getElementById("node-title-input").value;
    const nodeValueInput = document.getElementById("node-value-input").value;
    causalView.structure.updateNodeTitleById(
      currentSelectedNodeId,
      nodeTitleInput,
      nodeValueInput
    );
  }
}
