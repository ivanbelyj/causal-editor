const { ipcMain, BrowserWindow } = require("electron");
const { FileUtils } = require("./file-utils.js");
const path = require("path");

const appDefaultTitle = "Causal Editor";

// Responsible for saving and opening files
class FilesManager {
  action;
  #currentFilePath;

  // Previous saved path
  get currentFilePath() {
    return this.#currentFilePath;
  }
  set currentFilePath(val) {
    this.#currentFilePath = val;
    this.setTitleFromFullPath(this.#currentFilePath);
  }

  constructor() {
    ipcMain.on("send-data-to-save", async (event, dataToSave) => {
      const mappedDataToSave =
        this.savedDataMapFunc?.(dataToSave) ?? dataToSave;

      if (
        (this.isPrevPathSave &&
          this.action == "save" &&
          !this.currentFilePath) ||
        !this.isPrevPathSave
      ) {
        this.action = "save-as"; // The first save is similar to save-as
      }

      switch (this.action) {
        case "save-as":
          const saveRes = await FileUtils.saveByPathFromDialog(
            mappedDataToSave,
            this.fileFilters ?? null
          );
          if (!saveRes.canceled) {
            this.currentFilePath = this.isPrevPathSave
              ? saveRes.filePath
              : this.currentFilePath;
          }
          break;
        case "save":
          await FileUtils.save(this.currentFilePath, mappedDataToSave);
          break;
      }
    });
  }

  async openFileData(fileFilters, isPrevPathSave) {
    const { openDialogRes, data } = await FileUtils.openByDialog(fileFilters);
    if (!openDialogRes.canceled) {
      this.currentFilePath = isPrevPathSave ? openDialogRes.filePaths[0] : null;
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

  // Initiates project saving to file
  // isPrevPathSave - if true, data will be saved by the previous saved path
  initiateSaveAction(
    actionName,
    fileFilters,
    isPrevPathSave,
    savedDataMapFunc
  ) {
    this.action = actionName;
    this.fileFilters = fileFilters;
    this.isPrevPathSave = isPrevPathSave;
    this.savedDataMapFunc = savedDataMapFunc;

    BrowserWindow.getFocusedWindow().webContents.send(
      "get-data-to-save-request"
    );
  }
}

module.exports = {
  FilesManager,
};
