export const defaultLayoutConfig = {
  root: {
    type: "row",
    content: [
      {
        type: "component",
        componentType: "Causal View",
        // id: createId(),
      },
      {
        type: "column",
        width: 25,
        content: [
          {
            type: "component",
            componentType: "Node Value",
            // id: createId(),
            height: 22,
          },
          {
            type: "component",
            componentType: "Causes",
            // id: createId(),
          },
          {
            type: "component",
            componentType: "Weights",
            // id: createId(),
            height: 30,
          },
        ],
      },
    ],
  },
};
