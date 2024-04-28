import MenuTemplateUtils from "./menu-template-utils.js";

const isMac = process.platform === "darwin";

export default class MenuTemplateBuilder {
  static createMenuTemplate(
    registeredComponentTypes,
    activeComponentTypes,
    menuActionHelper
  ) {
    const componentMenuItems = MenuTemplateUtils.createComponentMenuItems({
      menuActionHelper,
      activeComponentTypes,
      registeredComponentTypes,
    });
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
            click: async () => await menuActionHelper.createNewProject(),
          },
          {
            label: "Open",
            accelerator: "CmdOrCtrl+O",
            click: async () => await menuActionHelper.openProject(),
          },
          {
            label: "Save project",
            accelerator: "CmdOrCtrl+S",
            click: async () => await menuActionHelper.saveProject(),
          },
          {
            label: "Save project as...",
            accelerator: "CmdOrCtrl+Shift+S",
            click: async () => await menuActionHelper.saveProjectAs(),
          },
          {
            label: "Import",
            submenu: [
              {
                label: "Causal Model Facts",
                accelerator: "CmdOrCtrl+I",
                click: async () =>
                  await menuActionHelper.importCausalModelFacts(),
              },
            ],
          },
          {
            label: "Export",
            submenu: [
              {
                label: "Causal Model Facts",
                accelerator: "CmdOrCtrl+E",
                click: async () =>
                  await menuActionHelper.exportCausalModelFacts(),
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
            click: () => menuActionHelper.undoHandler(),
          },
          {
            label: "Redo",
            accelerator: "CmdOrCtrl+Y",
            click: () => menuActionHelper.redoHandler(),
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
                  click: () => menuActionHelper.selectAllHandler(),
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
            click: () => menuActionHelper.switchTheme("system"),
          },
          {
            label: "Light",
            type: "radio",
            click: () => menuActionHelper.switchTheme("light"),
          },
          {
            label: "Dark",
            type: "radio",
            click: () => menuActionHelper.switchTheme("dark"),
          },
        ],
      },
      {
        role: "help",
        submenu: [
          {
            label: "See repository on GitHub",
            click: () => menuActionHelper.openGitHub(),
          },
          {
            label: "Learn more about causal models",
            click: () => menuActionHelper.learnMore(),
          },
        ],
      },
    ];
  }
}
