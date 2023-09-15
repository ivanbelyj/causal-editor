import { initLayout } from "./init-layout.js";
import * as d3 from "d3";

// import * as n1 from "golden-layout/dist/css/themes/goldenlayout-light-theme.css";
// import * as n2 from "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";

(() => {
  initLayout();

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  initTheme();
  updateTheme(mediaQuery.matches);

  mediaQuery.addEventListener("change", (e) => {
    updateTheme(e.matches);
  });
})();

function initTheme() {
  d3.select("head")
    .append("link")
    .attr("rel", "stylesheet")
    .attr("id", "goldenlayout-theme-link");
  // styleLink = document.createElement("link");
  // styleLink.setAttribute("rel", "stylesheet");
  // styleLink.setAttribute("href", "styles.css");
  // document.head.appendChild(styleLink);
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

// function updateTheme(isDarkMode) {
//   const goldenLayoutLink = d3.select("#goldenlayout-theme-link");
//   goldenLayoutLink.attr(
//     "href",
//     `src/css/golden-layout/goldenlayout-${
//       isDarkMode ? "dark" : "light"
//     }-theme.css`
//   );

//   const link = d3.select("#theme-link");
//   link.attr("href", `src/css/${isDarkMode ? "dark" : "light"}.css`);
// }
