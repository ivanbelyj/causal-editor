// Schema v0 is generated for deprecated version of causal model data
// and was used for development purposes only.
// It's not fully correct even for v0 and will not be used later

const probabilityNestSchema = {
  type: "object",
  properties: {
    CausesExpression: {
      type: "object",
      properties: {
        $type: { type: "string" },
        Operands: {
          type: "array",
          items: {
            type: "object",
            properties: {
              $type: { type: "string" },
              Edge: {
                type: "object",
                properties: {
                  Probability: { type: "number" },
                  CauseId: { type: "string" },
                },
                required: ["Probability", "CauseId"],
              },
            },
            required: ["$type", "Edge"],
          },
        },
      },
      required: ["$type", "Operands"],
    },
  },
  required: ["CausesExpression"],
};

const weightNestSchema = {
  type: "object",
  properties: {
    Weights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          Weight: { type: "number" },
          CauseId: { type: "string" },
        },
        required: ["Weight", "CauseId"],
      },
    },
  },
  required: ["Weights"],
};

const factSchema = {
  type: "object",
  properties: {
    Id: { type: "string" },
    ProbabilityNest: probabilityNestSchema,
    NodeValue: { type: "string" },
  },
  required: ["Id", "ProbabilityNest", "NodeValue"],
};

const variantSchema = {
  type: "object",
  properties: {
    Id: { type: "string" },
    ProbabilityNest: probabilityNestSchema,
    NodeValue: { type: "string" },
    AbstractFactId: { type: "string" },
    WeightNest: weightNestSchema,
  },
  required: [
    "Id",
    "ProbabilityNest",
    "NodeValue",
    "AbstractFactId",
    "WeightNest",
  ],
};

export const projectSchema = {
  type: "object",
  properties: {
    facts: {
      type: "array",
      items: {
        anyOf: [factSchema, variantSchema],
      },
    },
    nodesData: {
      type: "array",
      items: {
        type: "object",
        properties: {
          factId: { type: "string" },
          x: { type: "number" },
          y: { type: "number" },
          color: { type: "string" },
        },
        required: ["factId", "x", "y", "color"],
      },
    },
  },
  required: ["facts", "nodesData"],
};

export const factsSchema = {
  type: "array",
  items: {
    anyOf: [factSchema, variantSchema],
  },
};
