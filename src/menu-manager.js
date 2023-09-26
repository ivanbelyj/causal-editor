import { ProjectData } from "./data-management/project-data";

const { nativeTheme, shell, ipcMain, Menu } = require("electron");

const isMac = process.platform === "darwin";

export class MenuManager {
  // Information about app components in the layout
  componentMenuItems;

  constructor(projectManager, window) {
    this.projectManager = projectManager;
    this.window = window;

    ipcMain.on("send-component-active", this.onSendComponentActive.bind(this));

    window.webContents.on("before-input-event", (event, input) => {
      // accelerator not working
      // if (input.control && input.key.toLowerCase() === "a") {
      //   this.selectAllHandler();
      // }
      if (input.control && input.key.toLowerCase() === "z") {
        this.undoHandler();
        event.preventDefault();
      }
      if (input.control && input.key.toLowerCase() === "y") {
        this.redoHandler();
        event.preventDefault();
      }
    });
  }

  // Receive layout components data from the renderer process and render the menu
  onSendComponentActive(event, { componentType, isActive }) {
    if (!this.registeredComponentTypes) {
      this.registeredComponentTypes = new Set();
    }
    if (!this.registeredComponentTypes.has(componentType)) {
      this.registeredComponentTypes.add(componentType);
    }
    if (!this.activeComponentTypes) {
      this.activeComponentTypes = new Set();
    }
    if (isActive) {
      this.activeComponentTypes.add(componentType);
    } else {
      this.activeComponentTypes.delete(componentType);
    }

    this.render();
  }

  sendMessage(messageName, data) {
    this.window.webContents.send(messageName, data);
  }

  render() {
    const menu = (this.menu = Menu.buildFromTemplate(
      this.createMenuTemplate()
    ));
    Menu.setApplicationMenu(menu);
  }

  switchTheme(theme) {
    nativeTheme.themeSource = theme;
  }

  createComponentToggleItem({ componentType, isActive }) {
    return {
      label: componentType,
      type: "checkbox",
      checked: isActive,
      // When toggled golden-layout component via menu
      click: function (menuItem, browserWindow, event) {
        // The component will be set in the renderer process
        this.sendMessage("set-component-active", {
          componentType,
          isActive: menuItem.checked,
        });
      }.bind(this),
    };
  }

  selectAllHandler() {
    this.window.webContents.send("select-all");
  }

  undoHandler(menuItem, focusedWin) {
    // focusedWin.webContents.undo();
    this.window.webContents.send("undo");
  }

  redoHandler(menuItem, focusedWin) {
    // focusedWin.webContents.redo();
    this.window.webContents.send("redo");
  }

  createMenuTemplate() {
    const componentMenuItems = [...(this.registeredComponentTypes ?? [])].map(
      function (componentType) {
        return this.createComponentToggleItem({
          componentType,
          isActive: this.activeComponentTypes.has(componentType),
        });
      }.bind(this)
    );
    return [
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
            accelerator: "CmdOrCtrl+N",
            click: () => {
              this.projectManager.createNewProject();
            },
          },
          {
            label: "Open",
            accelerator: "CmdOrCtrl+O",
            click: async () => {
              await this.projectManager.openProjectAsync();
            },
          },
          {
            label: "Save",
            accelerator: "CmdOrCtrl+S",
            click: () => {
              this.projectManager.saveProject();
            },
          },
          {
            label: "Save as...",
            accelerator: "CmdOrCtrl+Shift+S",
            click: () => {
              this.projectManager.saveProjectAs();
            },
          },
          {
            label: "Import",
            submenu: [
              {
                label: "Causal Model Facts",
                accelerator: "CmdOrCtrl+I",
                click: async () => {
                  await this.projectManager.importCausalModelFactsAsync();
                },
              },
            ],
          },
          {
            label: "Export",
            submenu: [
              {
                label: "Causal Model Facts",
                accelerator: "CmdOrCtrl+E",
                click: async () => {
                  await this.projectManager.exportCausalModelFacts();
                },
              },
            ],
          },

          isMac ? { role: "close" } : { role: "quit" },
        ],
      },
      // { role: 'editMenu' }
      {
        label: "Edit",
        submenu: [
          {
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            click: this.undoHandler.bind(this),
          },
          {
            label: "Redo",
            accelerator: "CmdOrCtrl+Y",
            click: this.redoHandler.bind(this),
          },
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
                {
                  label: "Select All",
                  accelerator: "CmdOrCtrl+A",
                  click: this.selectAllHandler.bind(this),
                },
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
          { role: "zoomIn", accelerator: "CmdOrCtrl+=" },
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
          // { role: "zoom" },
          ...(isMac
            ? [
                { type: "separator" },
                { role: "front" },
                { type: "separator" },
                { role: "window" },
              ]
            : [{ role: "close" }]),
          { type: "separator" },
          //   ...["Causal View", "Node Value", "Causes", "Weights"].map(
          //     createComponentToggleItem
          //   ),
          ...(componentMenuItems ?? []),
        ],
      },
      {
        label: "Theme",
        submenu: [
          {
            label: "System",
            type: "radio",
            click: function () {
              this.switchTheme("system");
            }.bind(this),
          },
          {
            label: "Light",
            type: "radio",
            click: function () {
              this.switchTheme("light");
            }.bind(this),
          },
          {
            label: "Dark",
            type: "radio",
            click: function () {
              this.switchTheme("dark");
            }.bind(this),
          },
        ],
      },
      {
        role: "help",
        submenu: [
          {
            label: "GitHub repository",
            click: async function () {
              await shell.openExternal(
                "https://github.com/ivanbelyj/causal-editor"
              );
            }.bind(this),
          },
        ],
      },
    ];
  }
}
