import * as d3 from 'd3';

export class AppThemeManager {
    init() {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", (e) => {
            this.updateTheme(e.matches);
        });

        this.initTheme();
        this.updateTheme(mediaQuery.matches);
    }

    initTheme() {
        d3.select("head")
            .append("link")
            .attr("rel", "stylesheet")
            .attr("id", "goldenlayout-theme-link");
        d3.select("head")
            .append("link")
            .attr("rel", "stylesheet")
            .attr("id", "theme-link");
    }

    updateTheme(isDarkMode) {
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
}
