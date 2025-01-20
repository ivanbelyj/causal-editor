const causesExpressionSchema = {
  type: "object",
  properties: {
    $type: { type: "string" },
    operands: {
      type: "array",
      oneOf: [
        {
          type: "object",
          properties: {
            $type: { type: "string" },
            edge: {
              type: "object",
              properties: {
                Probability: { type: "number" },
                causeId: { type: "string" },
              },
              required: ["probability", "causeId"],
            },
          },
          required: ["$type", "edge"],
        },
        {
          $ref: "#/definitions/causesExpression",
        },
      ],
    },
  },
  required: ["$type"],
};

const weightsSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      weight: { type: "number" },
      causeId: { type: "string" },
    },
    required: ["weight", "causeId"],
  },
};

const factSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    abstractFactId: { type: "string" },
    factValue: { type: "string" },
  },
  required: ["id", "factValue"],
};

export const projectSchema = {
  type: "object",
  properties: {
    causalModels: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          facts: {
            type: "array",
            items: {
              anyOf: [factSchema],
            },
          },
        },
      },
    },
    blockConventions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          consequences: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
    },
    blockCausesConventions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          causes: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
    },
    blockResolvingMap: {
      type: "object",
      properties: {
        modelNamesByConventionName: {
          type: "object",
        },
        modelNamesByDeclaredBlockId: {
          type: "object",
        },
      },
    },
    defaultMainModel: {
      type: "string",
    },
    // nodesData: {
    //   type: "array",
    //   items: {
    //     type: "object",
    //     properties: {
    //       factId: { type: "string" },
    //       x: { type: "number" },
    //       y: { type: "number" },
    //       color: { type: "string" },
    //     },
    //     required: ["factId", "x", "y", "color"],
    //   },
    // },
  },
  required: ["causalModels"],
};

export const factsSchema = {
  type: "array",
  items: {
    anyOf: [factSchema],
  },
};

export const defsSchema = {
  $id: "schema-v1",
  definitions: {
    causesExpression: causesExpressionSchema,
  },
};
