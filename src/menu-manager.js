const { nativeTheme, shell, ipcMain, Menu } = require("electron");

const isMac = process.platform === "darwin";

export class MenuManager {
  // Information about app components in layout
  componentMenuItems;

  constructor(filesManager, window) {
    this.filesManager = filesManager;
    this.window = window;

    // ipcMain.on("components-registered", this.onComponentsRegistered.bind(this));
    ipcMain.on("send-components-data", this.onSendComponentsData.bind(this));
  }

  //   onComponentsRegistered(event, data) {

  //     console.log("registered components: ", data);
  //     this.render();
  //   }

  // Receive layout components data from the renderer process and render the menu
  onSendComponentsData(event, data) {
    this.componentsData = data;
    this.render();
  }

  sendMessage(messageName, data) {
    this.window.webContents.send(messageName, data);
  }

  sendOpenFile(causalModelFacts) {
    this.sendMessage("open-causal-model", causalModelFacts);
    this.sendMessage("reset");
  }

  // When toggled golden-layout component via menu
  sendSetComponentActive(id, isActive) {
    // The component will be set in the renderer process
    this.sendMessage("set-component-active", {
      id,
      isActive,
    });
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

  createComponentToggleItem(componentData) {
    return {
      label: componentData.componentType,
      type: "checkbox",
      checked: componentData.isActive,
      id: componentData.id,
      click: function (menuItem, browserWindow, event) {
        console.log("click on toggle component", menuItem, event);
        this.sendSetComponentActive(menuItem.id, menuItem.checked);
      }.bind(this),
    };
  }

  createMenuTemplate() {
    const componentMenuItems = this.componentsData
      ? this.componentsData.map(this.createComponentToggleItem, this)
      : [];
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
            click: function () {
              this.sendOpenFile(this.filesManager.openNewFileData());
            }.bind(this),
          },
          {
            label: "Open",
            accelerator: "CmdOrCtrl+O",
            click: async function () {
              const data = await this.filesManager.openFileData();
              if (data) this.sendOpenFile(data);
            }.bind(this),
          },
          {
            label: "Save",
            accelerator: "CmdOrCtrl+S",
            click: function () {
              this.filesManager.initiateSaveAction("save");
            }.bind(this),
          },
          {
            label: "Save as...",
            accelerator: "CmdOrCtrl+Shift+S",
            click: function () {
              this.filesManager.initiateSaveAction("save-as");
            }.bind(this),
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
