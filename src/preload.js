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

  // sendDataToSave: (nodes) => send("send-data-to-save", nodes),

  // When components are checked from the renderer process
  sendComponentActive: (componentData) =>
    send("send-component-active", componentData),

  sendIsUnsavedChanges: (isUnsavedChanges) =>
    send("send-is-unsaved-changes", isUnsavedChanges),

  // onGetDataToSaveRequest: (func) => on("get-data-to-save-request", func),
  onCreateNode: (func) => on("create-node", func),
  onRemoveNode: (func) => on("remove-node", func),
  onOpenData: (func) => on("open-data", func),
  onReset: (func) => on("reset", func),

  // When a component is checked in the menu
  onSetComponentActive: (func) => on("set-component-active", func),

  onUndo: (func) => on("undo", func),
  onRedo: (func) => on("redo", func),

  onSelectAll: (func) => on("select-all", func),

  handleSaveData: (func) => on("save-data", func),
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
