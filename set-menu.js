const { Menu, nativeTheme } = require("electron");
const { FilesManager } = require("./files-manager.js");

const filesManager = new FilesManager();

const getInitiateActionCallback = (actionName) => () =>
  filesManager.initiateAction(actionName);

// Todo: export only template
module.exports = {
  setMenu: (mainWindow) => {
    const isMac = process.platform === "darwin";
    const menuTemplate = [
      // { role: 'appMenu' }
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "services" },
                { type: "separator" },
                { role: "hide" },
                { role: "hideOthers" },
                { role: "unhide" },
                { type: "separator" },
                { role: "quit" },
              ],
            },
          ]
        : []),
      // { role: 'fileMenu' }
      {
        label: "File",
        submenu: [
          {
            label: "New",
            accelerator: "CmdOrCtrl+S",
            click: getInitiateActionCallback("new"),
          },
          {
            label: "Open",
            accelerator: "CmdOrCtrl+O",
            click: getInitiateActionCallback("open"),
          },
          {
            label: "Save",
            accelerator: "CmdOrCtrl+S",
            click: getInitiateActionCallback("save"),
          },
          {
            label: "Save as...",
            accelerator: "CmdOrCtrl+Shift+S",
            click: getInitiateActionCallback("save-as"),
          },

          isMac ? { role: "close" } : { role: "quit" },
        ],
      },
      // { role: 'editMenu' }
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          ...(isMac
            ? [
                { role: "pasteAndMatchStyle" },
                { role: "delete" },
                { role: "selectAll" },
                { type: "separator" },
                {
                  label: "Speech",
                  submenu: [
                    { role: "startSpeaking" },
                    { role: "stopSpeaking" },
                  ],
                },
              ]
            : [
                { role: "delete" },
                { type: "separator" },
                { role: "selectAll" },
              ]),
        ],
      },
      // { role: 'viewMenu' }
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
      // { role: 'windowMenu' }
      {
        label: "Window",
        submenu: [
          { role: "minimize" },
          { role: "zoom" },
          ...(isMac
            ? [
                { type: "separator" },
                { role: "front" },
                { type: "separator" },
                { role: "window" },
              ]
            : [{ role: "close" }]),
        ],
      },
      {
        role: "help",
        submenu: [
          {
            label: "Learn More",
            click: async () => {
              const { shell } = require("electron");
              await shell.openExternal("https://electronjs.org");
            },
          },
        ],
      },
      {
        label: "Theme",
        submenu: [
          {
            label: "System",
            type: "radio",
            click: () => {
              switchTheme("system", mainWindow);
            },
          },
          {
            label: "Light",
            type: "radio",
            click: () => {
              switchTheme("light", mainWindow);
            },
          },
          {
            label: "Dark",
            type: "radio",
            click: () => {
              switchTheme("dark", mainWindow);
            },
          },
        ],
      },
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
  },
};

function switchTheme(theme, mainWindow) {
  nativeTheme.themeSource = theme;
}
