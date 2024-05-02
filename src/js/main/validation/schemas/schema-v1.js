const causesExpressionSchema = {
  type: "object",
  properties: {
    $type: { type: "string" },
    Operands: {
      type: "array",
      oneOf: [
        {
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
      Weight: { type: "number" },
      CauseId: { type: "string" },
    },
    required: ["Weight", "CauseId"],
  },
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

export const defsSchema = {
  $id: "schema-v1",
  definitions: {
    causesExpression: causesExpressionSchema,
  },
};
