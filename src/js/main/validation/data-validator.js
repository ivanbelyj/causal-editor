import { dialog } from "electron";
import { betterAjvErrors } from "@apideck/better-ajv-errors";
import {
  projectSchema as projectSchemaV0,
  factsSchema,
  defsSchema as defsSchemaV0,
} from "./schemas/schema-v0";

import {
  projectSchema as projectSchemaV1,
  defsSchema as defsSchemaV1,
} from "./schemas/schema-v1";

import Ajv from "ajv";
import VersionUtils from "../version-utils";

export class DataValidator {
  static schemasByVersion = new Map([
    [
      0,
      {
        projectSchema: projectSchemaV0,
        causalModelSchema: factsSchema,
        defsSchema: defsSchemaV0,
      },
    ],
    [
      1,
      {
        projectSchema: projectSchemaV1,
        causalModelSchema: factsSchema,
        defsSchema: defsSchemaV1,
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
