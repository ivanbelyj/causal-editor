const { ipcMain, BrowserWindow } = require("electron");
const { FileOperations } = require("./file-operations.js");
const path = require("path");

class FilesManager {
  action;
  currentFilePath;

  constructor() {
    ipcMain.on(
      "send-nodes",
      async function (event, data) {
        const nodes = this.nodesToCausalModelFacts(data);

        if (this.action == "save" && !this.currentFilePath) {
          this.action = "save-as"; // The first save is similar to save-as
        }

        switch (this.action) {
          case "save-as":
            const saveRes = await FileOperations.saveAs(nodes);
            if (!saveRes.canceled) {
              this.currentFilePath = saveRes.filePath;
            }
            break;
          case "open":
            const { openDialogRes, data } = await FileOperations.open();
            if (!openDialogRes.canceled) {
              this.currentFilePath = openDialogRes.filePaths[0];
              // Todo: set data to causal model
            }
            break;
          case "save":
            await FileOperations.save(this.currentFilePath, nodes);
            break;
          case "new":
          // Todo: reset current causal model and app
        }

        if (this.action != "new" && this.currentFilePath)
          this.setTitleFromFullPath(this.currentFilePath);
      }.bind(this)
    );
  }

  setTitleFromFullPath(fullPath) {
    const pathBase = path.parse(fullPath).base;
    BrowserWindow.getFocusedWindow().setTitle(`${pathBase} - Causal Editor`);
  }

  initiateAction(actionName) {
    this.action = actionName;
    BrowserWindow.getFocusedWindow().webContents.send("get-nodes-request");
  }

  nodesToCausalModelFacts(nodes) {
    return nodes.map((d) => d.data);
  }
}

module.exports = {
  FilesManager,
};
