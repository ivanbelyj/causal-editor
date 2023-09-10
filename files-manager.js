const { ipcMain, BrowserWindow } = require("electron");
const { FileOperations } = require("./file-operations.js");
const path = require("path");

const appDefaultTitle = "Causal Editor";

class FilesManager {
  action;
  _currentFilePath;
  get currentFilePath() {
    return this._currentFilePath;
  }
  set currentFilePath(val) {
    this._currentFilePath = val;
    this.setTitleFromFullPath(this._currentFilePath);
  }

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
          case "save":
            await FileOperations.save(this.currentFilePath, nodes);
            break;
        }
      }.bind(this)
    );
  }

  openNewFileData() {
    this.currentFilePath = null;
    return [];
  }

  async openFileData() {
    const { openDialogRes, data } = await FileOperations.open();
    if (!openDialogRes.canceled) {
      this.currentFilePath = openDialogRes.filePaths[0];
      return data;
    }
    return null;
  }

  setTitleFromFullPath(fullPath) {
    let titleToSet;
    if (fullPath) {
      const pathBase = path.parse(fullPath).base;
      titleToSet = `${pathBase} - ${appDefaultTitle}`;
    } else {
      titleToSet = `${appDefaultTitle}`;
    }

    BrowserWindow.getFocusedWindow().setTitle(titleToSet);
  }

  initiateSaveAction(actionName) {
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
