// file-operations.js
const fs = require("fs").promises;
const { dialog } = require("electron");

const causalModelFilesFilters = [
  { name: "Causal model", extensions: ["cm"] },
  { name: "JSON", extensions: ["json"] },
];
class FileOperations {
  static async save(path, data) {
    return fs.writeFile(path, JSON.stringify(data));
  }

  // Saves data in a path selected by user
  static async saveAs(data) {
    const saveDialogRes = await dialog.showSaveDialog({
      properties: [],
      filters: causalModelFilesFilters,
    });
    if (!saveDialogRes.canceled) {
      await FileOperations.save(saveDialogRes.filePath, data);
    }
    return saveDialogRes;
  }

  static async open() {
    const openDialogRes = await dialog.showOpenDialog({
      filters: causalModelFilesFilters,
      properties: [],
    });
    if (!openDialogRes.canceled) {
      const data = await fs.readFile(openDialogRes.filePaths[0], "utf8");
      return { data: JSON.parse(data), openDialogRes };
    }
    return { data: null, openDialogRes };
  }
}

module.exports = {
  FileOperations: FileOperations,
};
