import { betterAjvErrors } from "@apideck/better-ajv-errors";
import {
  projectSchema as projectSchemaV0,
  factsSchema as factsSchemaV0,
  defsSchema as defsSchemaV0,
} from "./schemas/schema-v0";

import {
  projectSchema as projectSchemaV1,
  factsSchema as factsSchemaV1,
  defsSchema as defsSchemaV1,
} from "./schemas/schema-v1";

import {
  projectSchema as projectSchemaV2,
  factsSchema as factsSchemaV2,
  defsSchema as defsSchemaV2,
} from "./schemas/schema-v2";

import Ajv from "ajv";
import VersionUtils from "../version-utils";

export class DataValidator {
  static schemasByVersion = new Map([
    [
      0,
      {
        projectSchema: projectSchemaV0,
        causalModelSchema: factsSchemaV0,
        defsSchema: defsSchemaV0,
      },
    ],
    [
      1,
      {
        projectSchema: projectSchemaV1,
        causalModelSchema: factsSchemaV1,
        defsSchema: defsSchemaV1,
      },
    ],
    [
      2,
      {
        projectSchema: projectSchemaV2,
        causalModelSchema: factsSchemaV2,
        defsSchema: defsSchemaV2,
      },
    ],
  ]);

  static validateProjectData(projectData) {
    return DataValidator.#validateDataCore({
      data: projectData,
      getSchema: (schemas) => schemas.projectSchema,
    });
  }

  static validateCausalModel(causalModel) {
    return DataValidator.#validateDataCore({
      data: causalModel,
      getSchema: (schemas) => schemas.causalModelSchema,
    });
  }

  static getLatestVersion() {
    // Get the last entry in the map, which represents the latest version
    const latestVersionEntry = Array.from(
      DataValidator.schemasByVersion.entries()
    ).pop();
    return latestVersionEntry ? latestVersionEntry[0] : null;
  }

  static #validateDataCore({ data, getSchema }) {
    const schemas = DataValidator.#getSchemasForData(data);
    if (schemas == null) {
      return null;
    }
    const schema = getSchema(schemas);
    return DataValidator.#getAjvErrors({
      schema,
      defsSchema: schemas.defsSchema,
      data,
    });
  }

  static #getAjvErrors({ schema, defsSchema, data }) {
    const validate = DataValidator.#createSchema({ schema, defsSchema });
    validate(data);

    return betterAjvErrors({
      schema: schema,
      data,
      errors: validate.errors,
    });
  }

  static #createSchema({ schema, defsSchema }) {
    const ajv = new Ajv({
      allErrors: true,
      schemas: [schema, defsSchema],
    });
    return ajv.compile(schema);
  }

  static #getSchemasForData(data) {
    const version = VersionUtils.getVersion(data);
    return DataValidator.schemasByVersion.get(version);
  }
}
