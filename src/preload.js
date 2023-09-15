/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
  sendNodeEnter: () => send("node-enter"),
  sendNodeLeave: () => send("node-leave"),
  sendCausalViewEnter: () => send("causal-view-enter"),
  sendCausalViewLeave: () => send("causal-view-leave"),
  sendNodes: (nodes) => send("send-nodes", nodes),
  onGetNodesRequest: (func) => on("get-nodes-request", func),
  onCreateNode: (func) => on("create-node", func),
  onRemoveNode: (func) => on("remove-node", func),
  onOpenCausalModel: (func) => on("open-causal-model", func),
  onReset: (func) => on("reset", func),
  onSetComponentChecked: (func) => on("set-component-checked", func),
});

function send(channelName, data) {
  ipcRenderer.send(channelName, data);
}

function on(channelName, func) {
  ipcRenderer.on(channelName, (event, ...args) => func(event, ...args));
}
