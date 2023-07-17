const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const { setMenu } = require("./set-menu.js");
const { setContextMenu } = require("./set-context-menu.js");

// Creates the browser window
function createWindow(appLocale) {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      spellcheck: true,
    },
  });

  mainWindow.loadFile("index.html");

  // mainWindow.webContents.openDevTools();

  // Spellcheck settings
  // const possibleLanguages =
  //   mainWindow.webContents.session.availableSpellCheckerLanguages;

  const languages = [appLocale, "en-US"];
  console.log(languages);

  mainWindow.webContents.session.setSpellCheckerLanguages(languages);

  return mainWindow;
}

let mainWindow;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const appLocale = app.getLocale();
  mainWindow = createWindow(appLocale);
  setMenu(mainWindow);
  setContextMenu(mainWindow);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
