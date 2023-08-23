// file-operations.js
const fs = require("fs").promises;
const { dialog } = require("electron");
const path = require("path");
const os = require("os");

const causalModelFilesFilters = [
  { name: "JSON", extensions: ["json"] },
  { name: "Causal model", extensions: ["cm"] },
];
class FileOperations {
  static async save(filePath, data) {
    const isJson = path.extname(filePath) == ".json";
    const stringToSave =
      JSON.stringify(
        data,
        null,
        isJson ? " " : ""
        // .json is saved formatted to stay readable,
        // .cm is minimal for using as a final exported causal model
      ) + (isJson ? os.EOL : "");
    return fs.writeFile(filePath, stringToSave);
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
