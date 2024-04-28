const fs = require("fs").promises;
const { dialog } = require("electron");
const path = require("path");
const os = require("os");

const defaultFileFilters = [{ name: "JSON", extensions: ["json"] }];

// Utils for saving files in the app
class FileUtils {
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

  // Saves data by a path selected by the user via dialog
  static async saveByPathFromDialog(data, fileFilters, title) {
    const saveDialogRes = await dialog.showSaveDialog({
      properties: [],
      filters: fileFilters ?? defaultFileFilters,
      title,
    });
    if (!saveDialogRes.canceled) {
      await FileUtils.save(saveDialogRes.filePath, data);
    }
    return saveDialogRes;
  }

  static async openByDialog(fileFilters, title) {
    const openDialogRes = await dialog.showOpenDialog({
      title,
      filters: fileFilters ?? defaultFileFilters,
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
  FileUtils: FileUtils,
};
