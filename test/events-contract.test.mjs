import assert from "node:assert/strict";
import test from "node:test";
import schema from "../contracts/events.schema.json" with { type: "json" };

const requiredKeys = [...schema.required].sort();

function validateEvent(value) {
  assert.equal(typeof value, "object");
  assert.notEqual(value, null);
  assert.deepEqual(Object.keys(value).sort(), requiredKeys);
  assert.equal(value.version, "0.1.0");
  assert.equal(typeof value.event_id, "string");
  assert.ok(value.event_id.length > 0);
  assert.equal(typeof value.tenant, "string");
  assert.ok(value.tenant.length > 0);
  assert.match(value.source_time, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/);
  assert.match(value.received_time, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/);
  assert.equal(typeof value.sim_, "boolean");
  assert.ok(["fresh", "stale", "unknown"].includes(value.freshness));
}

const validEvent = {
  version: "0.1.0",
  event_id: "sim_event_001",
  tenant: "sim_tenant_001",
  source_time: "2026-09-15T10:00:00Z",
  received_time: "2026-09-15T10:00:01Z",
  sim_: true,
  freshness: "fresh"
};

test("v0.1.0 accepts exactly the frozen event shape", () => {
  validateEvent(validEvent);
});

test("v0.1.0 rejects malformed or privileged state fields", () => {
  const malformed = { ...validEvent, flagged: true };
  assert.throws(() => validateEvent(malformed), /deep-equal|Expected values/);
});

test("v0.1.0 rejects a missing frozen field", () => {
  const malformed = { ...validEvent };
  delete malformed.freshness;
  assert.throws(() => validateEvent(malformed), /deep-equal|Expected values/);
});
