import { DataManager } from "../data/data-manager";
import { AppContextMenuManager } from "./app-context-menu-manager";
import { AppEventManager } from "./app-event-manager";
import { AppLayoutManager } from "./app-layout-manager";
import { AppThemeManager } from "./app-theme-manager";
import MicroModal from "micromodal";

export class Application {
    constructor() {

    }

    init() {
        const contextMenuManager = new AppContextMenuManager();
        contextMenuManager.init();

        const dataManager = new DataManager({ api: window.api });

        const layoutManager = new AppLayoutManager();
        layoutManager.init(dataManager);

        const themeManager = new AppThemeManager();
        themeManager.init();

        const eventManager = new AppEventManager();
        eventManager.init();

        MicroModal.init();
    }
}
