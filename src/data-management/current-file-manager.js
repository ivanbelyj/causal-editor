const { ipcMain } = require("electron");
const { FileUtils } = require("./file-utils.js");

// Responsible for saving and opening files
export class CurrentFileManager {
  appTitleManager;

  #currentFilePath;

  // Previous saved path
  get currentFilePath() {
    return this.#currentFilePath;
  }
  set currentFilePath(val) {
    this.#currentFilePath = val;
    this.appTitleManager.fullPath = val;
    this.appTitleManager.isUnsavedChanges = false;
  }

  constructor(appTitleManager, processDataBeforeSaveCallback, window) {
    this.appTitleManager = appTitleManager;
    this.processDataBeforeSaveCallback = processDataBeforeSaveCallback;
    this.window = window;
  }

  async handleDataToSave(saveType, dataToSave, isPrevPathSave, title) {
    const processedDataToSave =
      this.processDataBeforeSaveCallback?.(dataToSave);

    // Todo: don't pass mapDataBeforeSaveCallback via this?
    const mappedDataToSave =
      this.mapDataBeforeSaveCallback?.(processedDataToSave ?? dataToSave) ??
      processedDataToSave ??
      dataToSave;

    if (
      (isPrevPathSave && saveType == "save" && !this.currentFilePath) ||
      !isPrevPathSave
    ) {
      saveType = "save-as"; // The first save is similar to save-as
    }

    switch (saveType) {
      case "save-as":
        const saveRes = await FileUtils.saveByPathFromDialog(
          mappedDataToSave,
          this.fileFilters ?? null, // Todo: don't pass via this?
          title
        );
        if (!saveRes.canceled && isPrevPathSave) {
          this.currentFilePath = saveRes.filePath;
        }
        break;
      case "save":
        await FileUtils.save(this.currentFilePath, mappedDataToSave);
        break;
    }

    if (isPrevPathSave) {
      this.window.webContents.send("on-saved-to-current-file");
    }
  }

  async openFileData(fileFilters, isPrevPathSave, title) {
    const { openDialogRes, data } = await FileUtils.openByDialog(
      fileFilters,
      title
    );
    if (!openDialogRes.canceled) {
      this.currentFilePath = isPrevPathSave ? openDialogRes.filePaths[0] : null;
      return data;
    }
    return null;
  }

  // Initiates saving the project to a file.
  // Data to save will be received from "data-to-save" ipc channel
  // isPrevPathSave - if true, data will be saved by the previous saved path
  async saveData(
    saveType,
    fileFilters,
    title,
    isPrevPathSave,
    mapDataBeforeSaveCallback
  ) {
    this.fileFilters = fileFilters;
    this.mapDataBeforeSaveCallback = mapDataBeforeSaveCallback;

    return new Promise((resolve, reject) => {
      // Generate a unique Id for this request
      const dataToSaveId = Math.random().toString();

      // Listen for the response just once
      ipcMain.once(
        `data-to-save-${dataToSaveId}`,
        async (event, { dataToSave, title }) => {
          await this.handleDataToSave(
            saveType,
            dataToSave,
            isPrevPathSave,
            title
          );
          resolve();
        }
      );

      // Send the request
      this.window.webContents.send("save-data", {
        dataToSaveId,
        title,
      });
    });
  }
}
