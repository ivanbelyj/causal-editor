const { nativeTheme, shell, ipcMain, Menu, dialog } = require("electron");

export default class MenuActionHelper {
  constructor(window, projectManager) {
    this.window = window;
    this.projectManager = projectManager;
  }

  sendMessage(messageName, data) {
    this.window.webContents.send(messageName, data);
  }

  selectAllHandler() {
    this.window.webContents.send("select-all");
  }

  undoHandler(menuItem, focusedWin) {
    this.window.webContents.send("undo");
  }

  redoHandler(menuItem, focusedWin) {
    this.window.webContents.send("redo");
  }

  switchTheme(theme) {
    nativeTheme.themeSource = theme;
  }

  createNewProject() {
    this.projectManager.createNewProject();
  }

  openProject() {
    this.projectManager.openProject();
  }

  saveProject() {
    this.projectManager.saveProject();
  }

  saveProjectAs() {
    this.projectManager.saveProjectAs();
  }

  importCausalModelFacts() {
    this.projectManager.importCausalModelFacts();
  }

  exportCausalModelFacts() {
    this.projectManager.exportCausalModelFacts();
  }

  async openGitHub() {
    await shell.openExternal("https://github.com/ivanbelyj/causal-editor");
  }

  async learnMore() {
    await shell.openExternal("https://github.com/ivanbelyj/CausalModel");
  }
}
