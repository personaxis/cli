import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawSchema = JSON.parse(
  readFileSync(resolve(__dirname, "../schema/persona.schema.json"), "utf-8")
) as {
  properties: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
};

// Strip the const constraint on "spec" so the validator accepts any 0.x value.
const schema = {
  ...rawSchema,
  properties: {
    ...rawSchema.properties,
    spec: { type: "string", minLength: 1, description: rawSchema.properties.spec.description },
  },
};

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export const validate = ajv.compile(schema);

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export function validatePersona(data: unknown): ValidationResult {
  const valid = validate(data) as boolean;
  if (valid) return { valid: true, errors: [] };

  const errors = (validate.errors ?? []).map((e) => ({
    field: e.instancePath || e.schemaPath,
    message: e.message ?? "invalid",
  }));

  return { valid: false, errors };
}
