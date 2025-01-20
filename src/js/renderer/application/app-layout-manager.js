import * as d3 from 'd3';
import { LayoutManager } from '../layout/layout-manager';

export class AppLayoutManager {
    init(dataManager) {
        const layoutContainer = d3.select("body").append("div");
        const componentsManager = new LayoutManager(
            layoutContainer.node(),
            window.api,
            dataManager
        );
        componentsManager.initLayout();
    }
}
