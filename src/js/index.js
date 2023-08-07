import { initLayout } from "./init-layout.js";
import * as d3 from "d3";

(() => {
  initLayout();

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  updateTheme(mediaQuery.matches);

  mediaQuery.addEventListener("change", (e) => {
    updateTheme(e.matches);
  });
})();

function updateTheme(isDarkMode) {
  const goldenLayoutlink = d3.select("#goldenlayout-theme-link");
  goldenLayoutlink.attr(
    "href",
    `src/css/golden-layout/goldenlayout-${
      isDarkMode ? "dark" : "light"
    }-theme.css`
  );

  const link = d3.select("#theme-link");
  link.attr("href", `src/css/${isDarkMode ? "dark" : "light"}.css`);
}
