const contextMenu = require("electron-context-menu");
const { ipcMain } = require("electron");

let isNodeEntered = false;

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
        // {
        //   label: "Search Google for “{selection}”",
        //   // Only show it when right-clicking text
        //   visible: parameters.selectionText.trim().length > 0,
        //   click: () => {
        //     shell.openExternal(
        //       `https://google.com/search?q=${encodeURIComponent(
        //         parameters.selectionText
        //       )}`
        //     );
        //   },
        // },
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
            mainWindow.webContents.send("remove-node", {
              x: parameters.x,
              y: parameters.y,
            });
          },
        },
      ],
    });
  },
};
