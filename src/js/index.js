import { initLayout } from "./init-layout.js";
import * as d3 from "d3";

(() => {
  initLayout();

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  updateTheme(mediaQuery.matches);

  mediaQuery.addEventListener("change", (e) => {
    console.log("Theme is changed: ", e.matches);
    updateTheme(e.matches);
  });

  // const api = window.api;
  // api.receiveSwitchTheme((event, theme) => {
  //   console.log("Theme is switched to", theme);
  //   const link = d3.select("#goldenlayout-theme-link");
  //   if (theme === "dark" || theme === "light" || theme === "system") {
  //     const isDarkMode = console.log();
  //     // link.attr("href", `src/css/goldenlayout-${theme}-theme.css`);
  //   }
  // });
})();

function updateTheme(isDarkMode) {
  const goldenLayoutlink = d3.select("#goldenlayout-theme-link");
  goldenLayoutlink.attr(
    "href",
    `src/css/goldenlayout-${isDarkMode ? "dark" : "light"}-theme.css`
  );

  const link = d3.select("#theme-link");
  link.attr("href", `src/css/${isDarkMode ? "dark" : "light"}.css`);
}
