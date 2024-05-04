import { ipcMain, dialog } from "electron";

export class UnsavedChangesHelper {
  #isUnsavedChanges;

  constructor({
    window,
    saveProjectCallback,
    getCurrentFilePathCallback,
    appTitleManager,
  }) {
    this.window = window;
    this.appTitleManager = appTitleManager;
    this.saveProject = saveProjectCallback;
    this.getCurrentFilePath = getCurrentFilePathCallback;

    ipcMain.on(
      "send-is-unsaved-changes",
      (event, { isUnsavedChangesInCurrentFile }) => {
        this.setIsUnsavedChanges(isUnsavedChangesInCurrentFile);
      }
    );
  }

  setIsUnsavedChanges(isUnsavedChangesInCurrentFile) {
    this.appTitleManager.isUnsavedChanges = isUnsavedChangesInCurrentFile;
    this.#isUnsavedChanges = isUnsavedChangesInCurrentFile;
  }

  async confirmUnsavedChanges(onConfirmed, onCancelled) {
    // If there are no unsaved changes, confirmation is not required
    if (!this.#isUnsavedChanges) {
      await onConfirmed?.();
      return;
    }

    const fileNameToDisplay = this.getCurrentFilePath();
    const { response } = await dialog.showMessageBox(this.window, {
      type: "warning",
      buttons: ["Yes", "No", "Cancel"],
      message: `Do you want to save the changes you made ${
        fileNameToDisplay ? "to " + fileNameToDisplay : ""
      }?`,
      detail: "Your changes will be lost if you don't save them.",
    });

    if (response === 0) {
      await this.saveProject();
    }
    if (response === 2) {
      await onCancelled?.();
    } else {
      await onConfirmed?.();
    }
  }
}
