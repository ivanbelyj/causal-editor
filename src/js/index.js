import { AppLayoutManager } from "./app-layout-manager.js";
import * as d3 from "d3";
// import * as glDark from "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
// import * as glLight from "golden-layout/dist/css/themes/goldenlayout-light-theme.css";
// import * as light from "../css/light.css";
// import * as dark from "../css/dark.css";

(() => {
  const layoutContainer = d3.select("body").append("div");
  const componentsManager = new AppLayoutManager(
    layoutContainer.node(),
    window.api
  );
  componentsManager.initLayout();

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (e) => {
    updateTheme(e.matches);
  });

  initTheme();
  updateTheme(mediaQuery.matches);
})();

function initTheme() {
  d3.select("head")
    .append("link")
    .attr("rel", "stylesheet")
    .attr("id", "goldenlayout-theme-link");
  d3.select("head")
    .append("link")
    .attr("rel", "stylesheet")
    .attr("id", "theme-link");
}

function updateTheme(isDarkMode) {
  d3.select("#goldenlayout-theme-link").attr(
    "href",
    `../goldenlayout${isDarkMode ? "Dark" : "Light"}.css`
    // isDarkMode ? glDark : glLight
  );
  d3.select("#theme-link").attr(
    "href",
    `../${isDarkMode ? "dark" : "light"}.css`
    // isDarkMode ? dark : light
  );
}
