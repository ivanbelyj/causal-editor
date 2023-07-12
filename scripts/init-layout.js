import { initCausalView } from "./init-causal-view.js";

const defaultConfig = {
  content: [
    {
      type: "row",
      content: [
        {
          type: "component",
          componentName: "causalView",
          // componentState: { label: "A" },
        },
        {
          type: "column",
          content: [
            {
              type: "component",
              componentName: "testComponent",
              componentState: { label: "B" },
            },
            {
              type: "component",
              componentName: "testComponent",
              componentState: { label: "C" },
            },
          ],
        },
      ],
    },
  ],
};

export const initLayout = () => {
  const myLayout = new GoldenLayout(defaultConfig);
  myLayout.registerComponent(
    "testComponent",
    function (container, componentState) {
      container.getElement().html("<h2>" + componentState.label + "</h2>");
    }
  );
  myLayout.registerComponent("causalView", causalViewComponent);
  myLayout.init();
};

const causalViewComponent = function (container, componentState) {
  const parentDiv = $("<div>").addClass("causal-view");
  $("label");
  container.getElement().append(parentDiv);
  container.on("open", () => {
    initCausalView();
  });
};
