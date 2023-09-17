const { app, BrowserWindow } = require("electron");
const { setContextMenu } = require("./set-context-menu.js");
const { FilesManager } = require("./files-manager.js");
const { MenuManager } = require("./menu-manager.js");

// Creates the browser window
function createWindow(appLocale) {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      // preload: path.join(__dirname, "preload.js"),
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,

      spellcheck: true,
    },
  });

  // mainWindow.loadFile("index.html");
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.openDevTools();
  mainWindow.maximize();

  // Spellcheck settings
  // const possibleLanguages =
  //   mainWindow.webContents.session.availableSpellCheckerLanguages;

  const languages = [appLocale, "en-US"];
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
  setContextMenu(mainWindow);

  const filesManager = new FilesManager();
  const menuManager = new MenuManager(filesManager, mainWindow);
  menuManager.render();

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