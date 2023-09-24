const contextMenu = require("electron-context-menu");
const { ipcMain } = require("electron");

let isNodeEntered = false;

// Todo: move into class?

ipcMain.on("node-enter", () => {
  isNodeEntered = true;
});
ipcMain.on("node-leave", () => {
  isNodeEntered = false;
});

let isCausalViewEntered = false;

ipcMain.on("causal-view-enter", () => {
  isCausalViewEntered = true;
});
ipcMain.on("causal-view-leave", () => {
  isCausalViewEntered = false;
});

module.exports = {
  setContextMenu: (mainWindow) => {
    contextMenu({
      showSearchWithGoogle: false,
      showLearnSpelling: true,
      showSelectAll: false,
      showCopyImage: false,
      prepend: (defaultActions, parameters, browserWindow) => [
        {
          label: "Create Node",
          visible: isCausalViewEntered,
          click: (event) => {
            mainWindow.webContents.send("create-node", {
              x: parameters.x,
              y: parameters.y,
            });
          },
        },
        {
          label: "Remove Node",
          visible: isNodeEntered,
          click: () => {
            isNodeEntered = false; // entered node is removed
            mainWindow.webContents.send("remove-node", {
              x: parameters.x,
              y: parameters.y,
            });
          },
        },
        {
          label: "Select All",
          visible: isCausalViewEntered,
          click: (event) => {
            mainWindow.webContents.send("select-all");
          },
        },
      ],
    });
  },
};
