/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { ipcRenderer, contextBridge, ipcMain } = require("electron");

contextBridge.exposeInMainWorld("api", {
  sendNodeEnter: () => send("node-enter"),
  sendNodeLeave: () => send("node-leave"),
  sendCausalViewEnter: () => send("causal-view-enter"),
  sendCausalViewLeave: () => send("causal-view-leave"),

  // When components are checked from the renderer process
  sendComponentActive: (componentData) =>
    send("send-component-active", componentData),

  sendIsUnsavedChanges: (data) => send("send-is-unsaved-changes", data),

  onCreateNode: (func) => on("create-node", func),
  onDeclareBlock: (func) => on("declare-block", func),
  onRemoveNode: (func) => on("remove-node", func),
  onOpenData: (func) => on("open-data", func),
  onReset: (func) => on("reset", func),

  // When a component is checked in the menu
  onSetComponentActive: (func) => on("set-component-active", func),

  onUndo: (func) => on("undo", func),
  onRedo: (func) => on("redo", func),

  onSelectAll: (func) => on("select-all", func),

  onSaveData: (func) => on("save-data", func),

  // Called to handle saving in undo-redo-manager
  onSavedToCurrentFile: (func) => on("on-saved-to-current-file", func),
});

function invoke(channelName, data) {
  ipcRenderer.invoke(channelName, data);
}

function send(channelName, data) {
  ipcRenderer.send(channelName, data);
}

function on(channelName, func) {
  ipcRenderer.on(channelName, (event, ...args) => func(event, ...args));
}
