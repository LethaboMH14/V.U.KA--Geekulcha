import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const document = await readFile(new URL("../contracts/openapi.yaml", import.meta.url), "utf8");
const architecture = await readFile(new URL("../docs/01-ARCHITECTURE.md", import.meta.url), "utf8");
const sdlc = await readFile(new URL("../docs/SDLC.md", import.meta.url), "utf8");
const team = await readFile(new URL("../docs/TEAM.md", import.meta.url), "utf8");

const requiredPaths = [
  "/v1/sightings:",
  "/v1/entities/{id}:",
  "/v1/entities/{id}/verify:",
  "/v1/risk:",
  "/v1/hotspots:",
  "/v1/safest-route:",
  "/v1/routes/patrol:",
  "/v1/evidence/integrity:",
  "/v1/anchor/latest:",
  "/v1/subjects/{id}/record:",
  "/v1/subjects/{id}/data:",
  "/ws/ops:",
  "/ws/member:"
];

test("OpenAPI contract declares only the documented service paths", () => {
  assert.match(document, /^openapi: 3\.1\.0$/m);
  for (const path of requiredPaths) assert.match(document, new RegExp(`^  ${path.replace(/[{}]/g, "\\$&")}$`, "m"));
});

test("OpenAPI contract marks F14 and F15 as the showcase paths", () => {
  assert.match(document, /F14 showcase path/);
  assert.match(document, /F15 showcase path/);
  assert.match(document, /Subject access with an independently checkable proof package/);
  assert.match(document, /Delete private subject payload while retaining the required proof residue/);
});

test("OpenAPI contract preserves governance and receipt requirements", () => {
  assert.match(document, /two distinct authorised signatures/);
  assert.match(document, /Idempotency-Key/);
  assert.match(document, /page_size/);
  assert.match(document, /state: \{ type: string, enum: \[accepted, queued, pending, confirmed, refused\] \}/);
  assert.match(document, /first_broken_index/);
  assert.match(document, /Member streams never receive operator-room events/);
});

test("OpenAPI contract exposes no flagged or flag action setter", () => {
  assert.doesNotMatch(document, /action: flag\b/);
  const actionLine = document.match(/action: \{ type: string, enum: \[[^\n]+\] \}/)?.[0] ?? "";
  assert.doesNotMatch(actionLine, /\bflag(?:ged)?\b/);
  assert.match(actionLine, /verify_concern, dismiss, whitelist/);
});

test("live docs point to contracts/ as the frozen contract home", () => {
  for (const content of [architecture, sdlc, team]) assert.doesNotMatch(content, /shared\/contract\.ts/);
});

test("Sighting is the domain event, not the transport envelope (ADR-0030, D3)", () => {
  assert.match(document, /^    EventEnvelope:$/m);
  assert.match(document, /^    Sighting:$/m);
  assert.match(document, /^    SightingEvent:$/m);
  const sightingBlock = document.slice(document.indexOf("    Sighting:"), document.indexOf("    SightingEvent:"));
  assert.match(sightingBlock, /camera_id/);
  assert.match(sightingBlock, /hex_id/);
  assert.match(sightingBlock, /modality/);
  assert.match(sightingBlock, /confidence/);
  assert.doesNotMatch(sightingBlock, /event_id/);
  assert.match(document, /\$ref: '#\/components\/schemas\/SightingEvent'/);
  assert.doesNotMatch(document, /\$ref: '#\/components\/schemas\/Sighting'\n/);
});

test("IntegrityResult documents a 0-based first_broken_index (ADR-0030, D2)", () => {
  assert.match(document, /first_broken_index is 0-based/);
});
