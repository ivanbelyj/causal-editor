import "../../../third-party/context-js/context";

export class AppContextMenuManager {
    init() {
        console.log("init")
        context.init({
            fadeSpeed: 100,
            filter: function (obj) { },
            above: "auto",
            preventDoubleContext: true,
            compress: true
        });
    }
}