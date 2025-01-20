export class AppEventManager {
    init() {
        this.preventDefaultSelectAll();
    }

    preventDefaultSelectAll() {
        document.addEventListener("keydown", function (e) {
            if (e.ctrlKey && e.code === "KeyA" && !this.isTextInputInFocus()) {
                e.preventDefault();
            }
        }.bind(this));
    }

    isTextInputInFocus() {
        var activeElement = document.activeElement;
        var isTextInput =
            activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA";

        if (
            activeElement.tagName === "INPUT" &&
            activeElement.getAttribute("type") !== "text"
        ) {
            isTextInput = false;
        }

        return isTextInput;
    }

    // function isTextField(activeElement) {
    //   console.log("", activeElement);
    //   // const activeElement = document.activeElement;
    //   const isTextField =
    //     activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA";
    //   console.log("is text field", isTextField);
    //   return isTextField;
    // }
}
