export const defaultLayoutConfig = {
  root: {
    type: "row",
    content: [
      {
        type: "column",
        width: 15,
        content: [
          {
            type: "component", // For debug purposes
            componentType: "Project View",
            // id: createId(),
            height: 22,
          },
        ],
      },
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
            componentType: "Node",
            // id: createId(),
            height: 40,// 22,
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
