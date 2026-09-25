import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const expected = {
  checkin_opened: ["kind", "pv", "checkin_id", "journey_id", "signal_event_id", "window_s"],
  checkin_result: ["kind", "pv", "checkin_id", "result", "attempt"],
  journey_ended: ["kind", "pv", "journey_id"],
};
const supportedKeywords = new Set([
  "$schema", "$id", "title", "description", "examples",
  "type", "const", "enum", "pattern", "minLength", "maxLength", "minimum",
  "required", "additionalProperties", "properties",
]);

function schemaFor(kind) {
  return JSON.parse(readFileSync(new URL(`contracts/payloads/${kind}.v1.json`, root), "utf8"));
}

function assertSupportedKeywords(schema, path = "$schema") {
  for (const [keyword, value] of Object.entries(schema)) {
    assert.ok(supportedKeywords.has(keyword), `unsupported keyword ${keyword} at ${path}`);
    if (keyword === "properties") {
      for (const [name, child] of Object.entries(value)) {
        assertSupportedKeywords(child, `${path}.properties.${name}`);
      }
    }
  }
}

for (const [kind, required] of Object.entries(expected)) {
  test(`${kind} schema matches the proposed §4b field table`, () => {
    const schema = schemaFor(kind);
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(schema.additionalProperties, false);
    assert.equal(schema.properties.kind.const, kind);
    assert.equal(schema.properties.pv.const, 1);
    assert.deepEqual(schema.required, required);
    assertSupportedKeywords(schema);

    if (Object.hasOwn(schema.properties, "journey_id")) {
      assert.equal(schema.properties.journey_id.maxLength, 128);
    }
    if (kind === "journey_ended") {
      assert.deepEqual(Object.keys(schema.properties).sort(), ["journey_id", "kind", "pv"]);
    }

    const spec = readFileSync(new URL("docs/VUKA-2-SPEC.md", root), "utf8");
    const sectionStart = spec.indexOf("### 4b · Per-kind payloads");
    assert.notEqual(sectionStart, -1, "§4b heading must exist");
    const sectionEnd = spec.indexOf("\n---", sectionStart);
    const section = spec.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);
    for (const field of Object.keys(schema.properties)) {
      assert.ok(section.includes(`\`${field}\``), `§4b does not name ${kind}.${field}`);
    }
  });
}
