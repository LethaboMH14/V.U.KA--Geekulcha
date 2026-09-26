import pinAuthorisedSchema from "../contracts/payloads/pin_authorised.v1.json" with { type: "json" };
// Dependency-free validator for the proposed §4b payload schemas.
// Validation keywords outside this explicit subset fail closed. Static JSON
// imports keep this module usable in both Node tests and browser bundles.
import checkinOpenedSchema from "../contracts/payloads/checkin_opened.v1.json" with { type: "json" };
import checkinResultSchema from "../contracts/payloads/checkin_result.v1.json" with { type: "json" };
import journeyEndedSchema from "../contracts/payloads/journey_ended.v1.json" with { type: "json" };
import guardianAckSchema from "../contracts/payloads/guardian_ack.v1.json" with { type: "json" };
import evidenceObservedV1Schema from "../contracts/payloads/evidence_observed.v1.json" with { type: "json" };
import evidenceObservedV2Schema from "../contracts/payloads/evidence_observed.v2.json" with { type: "json" };
import { canonicalize, canonicalizeJson } from "./canonical.js";

const DIALECT = "https://json-schema.org/draft/2020-12/schema";
const VALIDATION_KEYWORDS = new Set([
  "type",
  "const",
  "enum",
  "pattern",
  "minLength",
  "maxLength",
  "minimum",
  "maximum",
  "maxItems",
  "items",
  "required",
  "additionalProperties",
  "properties",
]);
// Standard annotation keys are permitted as inert documentation metadata.
const ANNOTATION_KEYWORDS = new Set(["$schema", "$id", "title", "description", "examples"]);
const SUPPORTED_KEYWORDS = new Set([...VALIDATION_KEYWORDS, ...ANNOTATION_KEYWORDS]);
const SCHEMAS = Object.freeze({
  checkin_opened: checkinOpenedSchema,
  checkin_result: checkinResultSchema,
  journey_ended: journeyEndedSchema,
  guardian_ack: guardianAckSchema,
  pin_authorised: pinAuthorisedSchema,
  // Keyed by pv, as anchor/payloads.py does (ADR-0047, PROPOSED).
  evidence_observed: Object.freeze({ 1: evidenceObservedV1Schema, 2: evidenceObservedV2Schema }),
});
const TYPES = new Set(["object", "string", "integer", "array", "null"]);

export class PayloadError extends Error {
  constructor(reason) {
    super(reason);
    this.name = "PayloadError";
    this.reason = reason;
  }
}

function fail(reason, path) {
  throw new PayloadError(`${reason} at ${path}`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameJsonValue(left, right) {
  if (typeof left !== typeof right) return false;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length &&
      left.every((value, index) => sameJsonValue(value, right[index]));
  }
  if (isObject(left) || isObject(right)) {
    if (!isObject(left) || !isObject(right)) return false;
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return leftKeys.length === rightKeys.length && leftKeys.every((key) =>
      Object.hasOwn(right, key) && sameJsonValue(left[key], right[key]));
  }
  return Object.is(left, right);
}

function assertSupportedSchema(schema, path = "$schema") {
  if (!isObject(schema)) throw new PayloadError(`schema at ${path} must be an object`);
  const unsupported = Object.keys(schema).filter((key) => !SUPPORTED_KEYWORDS.has(key)).sort();
  if (unsupported.length) {
    throw new PayloadError(`unsupported schema keyword ${unsupported[0]} at ${path}`);
  }
  if (Object.hasOwn(schema, "$schema") && schema.$schema !== DIALECT) {
    throw new PayloadError(`unsupported schema dialect at ${path}`);
  }
  if (Object.hasOwn(schema, "additionalProperties") && schema.additionalProperties !== false) {
    throw new PayloadError(`unsupported additionalProperties value at ${path}`);
  }
  if (Object.hasOwn(schema, "properties")) {
    if (!isObject(schema.properties)) throw new PayloadError(`properties at ${path} must be an object`);
    for (const [name, child] of Object.entries(schema.properties)) {
      assertSupportedSchema(child, `${path}.properties.${name}`);
    }
  }
  if (Object.hasOwn(schema, "required") &&
      (!Array.isArray(schema.required) || schema.required.some((name) => typeof name !== "string"))) {
    throw new PayloadError(`required at ${path} must be an array of strings`);
  }
  if (Object.hasOwn(schema, "maxItems") && (!Number.isSafeInteger(schema.maxItems) || schema.maxItems < 0)) {
    throw new PayloadError(`unsupported maxItems value at ${path}`);
  }
  if (Object.hasOwn(schema, "items")) assertSupportedSchema(schema.items, `${path}.items`);
  for (const keyword of ["minLength", "maxLength", "minimum", "maximum"]) {
    if (Object.hasOwn(schema, keyword) &&
        (!Number.isSafeInteger(schema[keyword]) ||
          (keyword !== "minimum" && keyword !== "maximum" && schema[keyword] < 0))) {
      throw new PayloadError(`unsupported ${keyword} value at ${path}`);
    }
  }
  if (Object.hasOwn(schema, "pattern")) {
    if (typeof schema.pattern !== "string") throw new PayloadError(`pattern at ${path} must be a string`);
    try {
      new RegExp(schema.pattern);
    } catch {
      throw new PayloadError(`invalid pattern at ${path}`);
    }
  }
  if (Object.hasOwn(schema, "enum") && !Array.isArray(schema.enum)) {
    throw new PayloadError(`enum at ${path} must be an array`);
  }
  if (Object.hasOwn(schema, "type")) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (types.length === 0 || !types.every((t) => typeof t === "string" && TYPES.has(t))) {
      throw new PayloadError(`unsupported type keyword value at ${path}`);
    }
  }
}

function validateAgainstSchema(payload, schema, path = "$payload") {
  assertSupportedSchema(schema);

  if (Object.hasOwn(schema, "type")) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const checks = {
      object: (v) => isObject(v),
      string: (v) => typeof v === "string",
      integer: (v) => typeof v === "number" && Number.isSafeInteger(v),
      array: (v) => Array.isArray(v),
      null: (v) => v === null,
    };
    if (!types.some((t) => checks[t](payload))) fail(`must be ${types.join(" or ")}`, path);
  }

  if (Object.hasOwn(schema, "const") && !sameJsonValue(payload, schema.const)) {
    fail(`must equal ${JSON.stringify(schema.const)}`, path);
  }
  if (Object.hasOwn(schema, "enum") && !schema.enum.some((candidate) => sameJsonValue(payload, candidate))) {
    fail("is not an allowed value", path);
  }
  if (Object.hasOwn(schema, "pattern") && typeof payload === "string" &&
      !new RegExp(schema.pattern).test(payload)) {
    fail("does not match the required pattern", path);
  }
  // JSON Schema length is in Unicode code points, not UTF-16 code units.
  const codePointLength = typeof payload === "string" ? [...payload].length : null;
  if (Object.hasOwn(schema, "minLength") && codePointLength !== null && codePointLength < schema.minLength) {
    fail(`must contain at least ${schema.minLength} code points`, path);
  }
  if (Object.hasOwn(schema, "maxLength") && codePointLength !== null && codePointLength > schema.maxLength) {
    fail(`must contain at most ${schema.maxLength} code points`, path);
  }
  if (Object.hasOwn(schema, "minimum") && typeof payload === "number" && payload < schema.minimum) {
    fail(`must be at least ${schema.minimum}`, path);
  }
  if (Object.hasOwn(schema, "maximum") && typeof payload === "number" && payload > schema.maximum) {
    fail(`must be at most ${schema.maximum}`, path);
  }
  if (Object.hasOwn(schema, "maxItems") && Array.isArray(payload) && payload.length > schema.maxItems) {
    fail(`must contain at most ${schema.maxItems} items`, path);
  }
  if (Object.hasOwn(schema, "items") && Array.isArray(payload)) {
    payload.forEach((item, i) => validateAgainstSchema(item, schema.items, `${path}[${i}]`));
  }

  if (Object.hasOwn(schema, "required")) {
    if (!isObject(payload)) fail("must be an object to satisfy required fields", path);
    for (const name of schema.required) {
      if (!Object.hasOwn(payload, name)) fail(`is missing required property ${JSON.stringify(name)}`, path);
    }
  }
  if (Object.hasOwn(schema, "properties")) {
    if (!isObject(payload)) fail("must be an object to satisfy properties", path);
    for (const [name, value] of Object.entries(payload)) {
      if (!Object.hasOwn(schema.properties, name)) {
        if (schema.additionalProperties === false) fail(`contains unsupported property ${JSON.stringify(name)}`, path);
        continue;
      }
      validateAgainstSchema(value, schema.properties[name], `${path}.${name}`);
    }
  }
  if (schema.additionalProperties === false && !Object.hasOwn(schema, "properties")) {
    if (!isObject(payload)) fail("must be an object for additionalProperties check", path);
    fail("additionalProperties false requires properties", path);
  }
}

function loadSchema(kind, pv = 1) {
  if (!Object.hasOwn(SCHEMAS, kind)) {
    throw new PayloadError(`unsupported payload kind ${JSON.stringify(kind)}`);
  }
  let schema = SCHEMAS[kind];
  if (!Object.hasOwn(schema, "$schema")) {
    // A pv-keyed family: pick the version the payload names.
    if (!Number.isSafeInteger(pv) || !Object.hasOwn(schema, String(pv))) {
      throw new PayloadError(`unsupported pv ${JSON.stringify(pv)} for payload kind ${JSON.stringify(kind)}`);
    }
    schema = schema[String(pv)];
  }
  assertSupportedSchema(schema);
  return schema;
}

/** Validate one parsed payload; reject unknown schema keywords before checking it. */
export function validatePayload(kind, payload) {
  try {
    canonicalize(payload);
  } catch (error) {
    throw new PayloadError(`invalid canonical payload: ${error.message}`);
  }
  validateAgainstSchema(payload, loadSchema(kind, isObject(payload) ? payload.pv : undefined));
  return payload;
}

/** Validate raw JSON text so duplicate keys and floats are rejected pre-parse. */
export function validatePayloadJson(kind, jsonText) {
  if (typeof jsonText !== "string") throw new PayloadError("payload JSON must be text");
  let payload;
  try {
    canonicalizeJson(jsonText);
    payload = JSON.parse(jsonText);
  } catch (error) {
    throw new PayloadError(`invalid canonical payload JSON: ${error.message}`);
  }
  return validatePayload(kind, payload);
}

// Exported for focused fail-closed tests; product callers should use validatePayload.
export function validateSchema(payload, schema) {
  canonicalize(payload);
  validateAgainstSchema(payload, schema);
  return payload;
}
