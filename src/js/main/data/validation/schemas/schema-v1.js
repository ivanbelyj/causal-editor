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
    facts: {
      type: "array",
      items: {
        anyOf: [factSchema],
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
    anyOf: [factSchema],
  },
};

export const defsSchema = {
  $id: "schema-v1",
  definitions: {
    causesExpression: causesExpressionSchema,
  },
};
