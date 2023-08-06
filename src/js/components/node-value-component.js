export class NodeValueComponent {
  causalView = null;
  init(causalView) {
    this.causalView = causalView;

    $(".node-value-component").append(this.toDOMElement());

    document.getElementById("update-btn").onclick = function (...data) {
      this.onUpdateButtonClick(causalView, ...data);
    }.bind(this);
    causalView.structure.addEventListener(
      "nodeClicked",
      function (event) {
        return this.onNodeClicked(event);
      }.bind(this)
    );
  }

  toDOMElement() {
    return $(`
    <div class="component">
      <div class="input-item">
        <label class="input-item__label">Id</label>
        <input class="text-input input-item__input" type="text"
          placeholder="Id" id="node-id-input" readonly />
      </div>
      <div class="input-item">
        <label class="input-item__label">Title</label>
        <input class="text-input input-item__input" type="text"
          placeholder="Title" id="node-title-input" />
      </div>
      <div class="input-item">
        <label class="input-item__label">Node Value</label>
        <textarea class="textarea input-item__input"
          placeholder="Node Value" id="node-value-input"></textarea>
      </div>
      <button class="button" id="update-btn">Update</button>
    </div>`);
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
