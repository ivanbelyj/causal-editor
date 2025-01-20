import * as d3 from "d3";
import "../../../../third-party/jstree/themes/default/style.css";
import "../../../../third-party/jstree/themes/default-dark/style.css";
import "jstree";
import { JsTreeDataUtils } from "./js-tree-data-utils";
import { CausalModelProjectViewNodeHandler } from "./causal-model-project-view-node-handler";
import ProjectViewContextMenuManager from "./project-view-context-menu-manager";

const projectViewId = "#project-view";

export class ProjectView {
  constructor(selector) {
    this.component = d3.select(selector);
  }

  init() {
    this.#initJsTree();
    this.nodeHandlers = [new CausalModelProjectViewNodeHandler()];
    this.contextMenuManager = new ProjectViewContextMenuManager();
    this.contextMenuManager.init(projectViewId);
  }

  setProjectData(projectData) {
    const jsTreeData = JsTreeDataUtils.projectDataToJsTreeData(projectData);
    this.#reset(jsTreeData);
  }

  onJsTreeChanged(e, data) {
    const selectedNodesText = [];
    for (let i = 0; i < data.selected.length; i++) {
      const node = data.instance.get_node(data.selected[i]);

      this.#handleNodeSelect(data, node);

      selectedNodesText.push(node.text);
    }
    console.log("Selected: " + selectedNodesText.join(", "));
  }

  #handleNodeSelect(data, node) {
    for (const nodeHandler of this.nodeHandlers) {
      if (nodeHandler.shouldHandleSelect(data.instance, node)) {
        nodeHandler.handleSelected(node.id);
      }
    }
  }

  #initJsTree() {
    this.component.append("div").attr("id", "project-view");

    $.jstree.defaults.core.themes.name = "default-dark";

    $(() => {
      const onJsTreeChanged = this.onJsTreeChanged.bind(this);
      $(projectViewId).on("changed.jstree", onJsTreeChanged);

      $(projectViewId).jstree({
        core: {
          data: [],
          animation: 0,
          themes: {
            theme: "default-dark",
            icons: false,
          },
        },
      });
    });
  }

  #reset(treeData) {
    let instance = $(projectViewId).jstree(true);
    // set new data
    instance.settings.core.data = treeData;
    //important to refresh the tree, must set the second parameter to true
    instance.refresh(false, true);
  }
}
