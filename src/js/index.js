import { initLayout } from "./init-layout.js";
import * as d3 from "d3";

(() => {
  initLayout();

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
    `goldenlayout${isDarkMode ? "Dark" : "Light"}.css`
  );
  d3.select("#theme-link").attr("href", `${isDarkMode ? "dark" : "light"}.css`);
}
