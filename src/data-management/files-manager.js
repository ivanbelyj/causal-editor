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

  constructor(processDataBeforeSaveCallback) {
    // this.processDataBeforeSaveCallback = processDataBeforeSaveCallback;

    ipcMain.on("send-data-to-save", async (event, dataToSave) => {
      const processedDataToSave = processDataBeforeSaveCallback?.(dataToSave);
      // console.log("process callback", processDataBeforeSaveCallback);
      // console.log("processed data to save", processedDataToSave);
      const mappedDataToSave =
        this.mapDataBeforeSaveCallback?.(processedDataToSave ?? dataToSave) ??
        processedDataToSave ??
        dataToSave;

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
    mapDataBeforeSaveCallback
  ) {
    this.action = actionName;
    this.fileFilters = fileFilters;
    this.isPrevPathSave = isPrevPathSave;
    this.mapDataBeforeSaveCallback = mapDataBeforeSaveCallback;

    BrowserWindow.getFocusedWindow().webContents.send(
      "get-data-to-save-request"
    );
  }
}

module.exports = {
  FilesManager,
};
