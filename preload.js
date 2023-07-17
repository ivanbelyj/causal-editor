/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { ipcRenderer } = require("electron");
window.addEventListener("DOMContentLoaded", () => {
  const nodes = document.getElementsByClassName("node");
  for (const node of nodes) {
    node.addEventListener("mouseenter", () => {
      ipcRenderer.send("node-enter");
    });
    node.addEventListener("mouseleave", () => {
      ipcRenderer.send("node-leave");
    });
  }
});

ipcRenderer.on("create-node", (event, data) => {
  if (elementWithClassFrom(data, "causal-view"))
    console.log("clicked on causal-view");
});

function elementWithClassFrom(pos, className) {
  const elems = getElementsByPos(pos);
  for (const elem of elems) {
    for (const curClassName of elem.classList) {
      if (curClassName == className) {
        return elem;
      }
    }
  }
  return null;
}
function getElementsByPos(pos) {
  return document.elementsFromPoint(pos.x, pos.y);
}

// document.elementsFromPoint ignores <g> because it is used only for
// grouping, not displaying, so there is a hack, depending on node structure
function nodeElementFromPoint(pos) {
  const elems = getElementsByPos(pos);
  for (const elem of elems) {
    if (elem.tagName == "rect") {
      if (elem.parentNode.classList.contains("node")) {
        return elem.parentNode;
      }
    }
  }
  return null;
}

ipcRenderer.on("remove-node", (event, data) => {
  if (nodeElementFromPoint(data, "node")) console.log("remove node");
});
