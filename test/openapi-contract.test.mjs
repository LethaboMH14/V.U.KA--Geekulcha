import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const document = await readFile(new URL("../contracts/openapi.yaml", import.meta.url), "utf8");
const serverSource = await readFile(new URL("../server/main.py", import.meta.url), "utf8");
const architecture = await readFile(new URL("../archive/2026-09-four-layer/docs/01-ARCHITECTURE.md", import.meta.url), "utf8");
const sdlc = await readFile(new URL("../archive/2026-09-four-layer/docs/SDLC.md", import.meta.url), "utf8");
const team = await readFile(new URL("../archive/2026-09-four-layer/docs/TEAM.md", import.meta.url), "utf8");
const keyManifestFormat = await readFile(new URL("../contracts/keys/README.md", import.meta.url), "utf8");

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

const v2Operations = [
  ["post", "/v1/subjects"],
  ["post", "/v1/devices/recover"],
  ["post", "/v1/journeys"],
  ["post", "/v1/journeys/{id}/heartbeat"],
  ["post", "/v1/journeys/{id}/end"],
  ["post", "/v1/events"],
  ["post", "/v1/checkins/{id}/opened"],
  ["post", "/v1/checkins/{id}/result"],
  ["post", "/v1/pin-authorisations"],
  ["post", "/v1/guardians/invites"],
  ["post", "/v1/guardians/accept"],
  ["delete", "/v1/guardians/{id}"],
  ["put", "/v1/guardians/{id}/token"],
  ["post", "/v1/alerts/{id}/ack"],
  ["get", "/v1/anchor/proof/{head_hash}"],
  ["get", "/v1/subjects/{id}/export"],
  ["get", "/healthz"],
  ["get", "/ws/panel"],
  ["post", "/sim_bank/v1/risk-signal"],
  ["post", "/sim_bank/v1/release"]
];

function pathBlock(path) {
  const start = document.indexOf(`  ${path}:`);
  assert.notEqual(start, -1, `missing path ${path}`);
  const nextPath = document.indexOf("\n  /", start + 1);
  const components = document.indexOf("\ncomponents:", start + 1);
  const end = nextPath === -1 ? components : components === -1 ? nextPath : Math.min(nextPath, components);
  return document.slice(start, end === -1 ? document.length : end);
}

function parseOperations(source) {
  const methods = new Set(["get", "post", "put", "delete", "patch", "options", "head", "trace"]);
  const operations = [];
  let path;
  let operation;

  function finishOperation() {
    if (operation) operations.push(operation);
    operation = undefined;
  }

  for (const line of source.split(/\r?\n/)) {
    const pathMatch = line.match(/^  (\/[^:]+):$/);
    if (pathMatch) {
      finishOperation();
      path = pathMatch[1];
      continue;
    }
    if (line === "components:") {
      finishOperation();
      path = undefined;
      continue;
    }
    const methodMatch = line.match(/^    ([a-z]+):$/);
    if (methodMatch && methods.has(methodMatch[1])) {
      finishOperation();
      assert.ok(path, `OpenAPI operation ${methodMatch[1]} has no path`);
      operation = { method: methodMatch[1].toUpperCase(), path, flagCount: 0 };
      continue;
    }
    if (operation && /^      x-vuka-implemented:/.test(line)) {
      operation.flagCount += 1;
      const flagMatch = line.match(/^      x-vuka-implemented: (true|false)$/);
      if (flagMatch) operation.implemented = flagMatch[1] === "true";
    }
  }
  finishOperation();
  return operations;
}

function normalisePath(path) {
  return path.replace(/\{[^}/]+\}/g, "{}");
}

test("OpenAPI contract declares only the documented service paths", () => {
  assert.match(document, /^openapi: 3\.1\.0$/m);
  assert.match(document, /^  version: 2\.0\.0$/m);
  for (const path of requiredPaths) assert.match(document, new RegExp(`^  ${path.replace(/[{}]/g, "\\$&")}$`, "m"));
});

test("OpenAPI implementation flags exactly match routes registered by the server", () => {
  const operations = parseOperations(document);
  const operationIdCount = (document.match(/^      operationId: /gm) ?? []).length;
  assert.equal(operations.length, operationIdCount, "expected every declared operation to be parsed");
  for (const operation of operations) {
    const name = `${operation.method} ${operation.path}`;
    assert.equal(operation.flagCount, 1, `${name} must carry exactly one x-vuka-implemented flag`);
    assert.equal(typeof operation.implemented, "boolean", `${name} must set x-vuka-implemented to true or false`);
  }

  const implementedOperations = new Set(
    operations
      .filter(({ implemented }) => implemented)
      .map(({ method, path }) => `${method} ${normalisePath(path)}`)
  );
  const registeredRoutes = new Set(
    [...serverSource.matchAll(/^\s*@app\.(get|post|put|delete)\(\s*["']([^"']+)["']/gm)]
      .map(([, method, path]) => `${method.toUpperCase()} ${normalisePath(path)}`)
  );
  assert.deepEqual(
    [...implementedOperations].sort(),
    [...registeredRoutes].sort(),
    "x-vuka-implemented flags must match server/main.py routes in both directions"
  );

  assert.match(document, /x-vuka-implemented reports route registration only, not that\s+all specified behavior is complete/);
  assert.match(document, /only operations marked\s+x-vuka-implemented: true are served by\s+the ANCHOR server at this head;\s+every other operation is a contract for\s+future work\./);
  const subjectCreation = operations.find(({ method, path }) => method === "POST" && path === "/v1/subjects");
  assert.equal(subjectCreation?.implemented, false, "POST /v1/subjects is not a registered route");
  assert.match(pathBlock("/v1/subjects"), /INCOMPLETE — this dedicated route is not implemented/);
  assert.match(pathBlock("/v1/subjects"), /Genesis registration is\s+currently accepted at POST \/v1\/events with action: registration\./);
});

test("v1 UMOJA paths remain present and are marked deprecated", () => {
  const deprecatedOperations = [
    ["post", "/v1/sightings"],
    ["get", "/v1/entities/{id}"],
    ["post", "/v1/entities/{id}/verify"],
    ["get", "/v1/risk"],
    ["get", "/v1/hotspots"],
    ["get", "/v1/safest-route"],
    ["post", "/v1/routes/patrol"],
    ["get", "/ws/ops"]
  ];
  for (const [method, path] of deprecatedOperations) {
    const block = pathBlock(path);
    const operation = block.match(new RegExp(`(?:^|\\n)    ${method}:[\\s\\S]*?(?=\\n    [a-z]+:|$)`))?.[0] ?? "";
    assert.match(operation, /deprecated: true/, `${method.toUpperCase()} ${path} is not deprecated`);
  }
  assert.equal((document.match(/^      deprecated: true$/gm) ?? []).length, deprecatedOperations.length);
  assert.match(document, /^  \/v1\/evidence\/integrity:$/m);
  assert.match(document, /^  \/ws\/member:$/m);
});

test("v2 operation inventory is present without adding undocumented paths", () => {
  for (const [method, path] of v2Operations) {
    const block = pathBlock(path);
    assert.match(block, new RegExp(`(?:^|\\n)    ${method}:`, "m"), `${method.toUpperCase()} ${path} is missing`);
  }
  const expected = new Set([...requiredPaths.map((path) => path.slice(0, -1)), ...v2Operations.map(([, path]) => path)]);
  const actual = new Set([...document.matchAll(/^  (\/[^:]+):$/gm)].map((match) => match[1]));
  assert.deepEqual(actual, expected);
  for (const path of ["/sim_bank/v1/risk-signal", "/sim_bank/v1/release"]) {
    const block = pathBlock(path);
    assert.match(block, /Idempotency-Key/);
    assert.match(block, /SIMULATED/);
  }
});

test("OpenAPI contract marks F14 and F15 as the showcase paths", () => {
  assert.match(document, /F14 showcase path/);
  assert.match(document, /F15 showcase path/);
  assert.match(document, /Subject access with an independently checkable proof package/);
  assert.match(document, /Request deletion of private subject payload while retaining proof residue/);
});

test("OpenAPI contract preserves governance and receipt requirements", () => {
  assert.match(document, /Idempotency-Key/);
  assert.match(document, /page_size/);
  assert.match(document, /state: \{ type: string, enum: \[accepted, queued, pending, confirmed, refused\] \}/);
  assert.match(document, /first_broken_index/);
  assert.match(document, /Member streams never receive operator-room events/);
});

test("event registration documents the simulation-only refusal", () => {
  const events = pathBlock("/v1/events");
  assert.match(events, /'403':[\s\S]*?code: simulation_only/);
  assert.match(events, /genesis registration target must use the sim_ prefix/);
  assert.match(serverSource, /os\.getenv\("VUKA_SIM_ONLY", "1"\) != "0"/);
});

test("OpenAPI contract exposes no flagged or flag action setter", () => {
  assert.doesNotMatch(document, /action: flag\b/);
  const verify = document.slice(document.indexOf("    VerifyRequest:"), document.indexOf("    DeletionRequest:"));
  const actionLine = verify.match(/action: \{ type: string, enum: \[[^\n]+\] \}/)?.[0] ?? "";
  assert.doesNotMatch(actionLine, /\bflag(?:ged)?\b/);
  assert.match(actionLine, /verify_concern, dismiss, whitelist/);
});

test("live docs point to contracts/ as the frozen contract home", () => {
  for (const content of [architecture, sdlc, team]) assert.doesNotMatch(content, /shared\/contract\.ts/);
});

// NOTE (Lethabo, PR #23 N1): the tests below are text/structure assertions over
// the YAML source, not JSON Schema instance validation -- they can pass against a
// schema that is structurally present but semantically unsatisfiable (this repo has
// no YAML-parsing dependency; adding one, or a Python/jsonschema step, is a bigger
// change than this fix and isn't wired into CI's document-contracts job either way --
// CI currently runs only secret-scan and document-contracts, not npm test at all).
// SightingEvent's actual satisfiability (F1: the allOf/additionalProperties
// interaction) is verified manually and reproducibly instead:
//   python -c "
//     import yaml; from jsonschema import Draft202012Validator
//     doc = yaml.safe_load(open('contracts/openapi.yaml'))
//     # resolve $ref, build SightingEvent, assert a full envelope+payload instance
//     # validates, an extra top-level field is rejected, and a missing payload is
//     # rejected. See docs/BUILD-LOG.md 2026-09-15 'D3 F1' entry for the exact
//     # commands and output this was last confirmed against."
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

test("v1 schema components remain and v2 evidence fixes the genesis hash shape", () => {
  for (const name of ["EventEnvelope", "Sighting", "SightingEvent", "Entity", "VerifyRequest", "DeletionRequest", "Receipt", "EvidenceEntry", "IntegrityResult", "AnchorStatus", "SubjectRecord"]) {
    assert.match(document, new RegExp(`^    ${name}:$`, "m"), `missing preserved schema ${name}`);
  }
  const entry = document.slice(document.indexOf("    EvidenceEntryV2:"), document.indexOf("    PinAuthorisation:"));
  assert.match(entry, /prev_hash: \{ type: string, pattern: '\^\[0-9a-f\]\{64\}\$'/);
  assert.match(entry, /Genesis is exactly 64 zero hex characters; never null/);
  assert.doesNotMatch(entry, /prev_hash: \{ type: \[string, 'null'\] \}/);
});

test("PIN authority separates the signed statement from the server expiry record", () => {
  const statement = document.slice(document.indexOf("    PinAuthorisationStatement:"), document.indexOf("    PinAuthorisation:"));
  assert.match(statement, /required: \[action, target_id, mode, nonce, sig, signer_key_id\]/);
  for (const field of ["action", "target_id", "mode", "nonce", "sig", "signer_key_id"]) {
    assert.match(statement, new RegExp(`^        ${field}:`, "m"));
  }
  assert.doesNotMatch(statement, /^        expires_at:/m);
  assert.match(statement, /canonical of[\s\S]*action, target_id, mode and nonce/);
  assert.match(statement, /additionalProperties: false/);

  const record = document.slice(document.indexOf("    PinAuthorisation:"), document.indexOf("    Proof:"));
  assert.match(record, /required: \[action, target_id, mode, nonce, sig, signer_key_id, expires_at\]/);
  assert.match(record, /expires_at: \{ type: string, format: date-time, readOnly: true \}/);
  assert.match(record, /server receipt time \+ 120 seconds/);
  const receipt = document.slice(document.indexOf("    Receipt:"), document.indexOf("    EvidenceEntry:"));
  assert.match(receipt, /pin_authorisation: \{ \$ref: '#\/components\/schemas\/PinAuthorisation'/);
  assert.match(document, /pin_authorisation: \{ \$ref: '#\/components\/schemas\/PinAuthorisationStatement' \}/);
});

test("EventSubmission carries only device-created fields, payload and a 16-byte salt", () => {
  const submission = document.slice(document.indexOf("    EventSubmission:"), document.indexOf("    EvidenceEntryV2:"));
  assert.match(submission, /required: \[action, actor_id, target_type, target_id, ts, details, payload, salt\]/);
  assert.match(submission, /required: \[v, signer, signer_key_id, counter, event_id, commitment, sig\]/);
  assert.match(submission, /required: \[kind, pv\]/);
  assert.ok(submission.includes("propertyNames: { pattern: '^[\\x00-\\x7F]*$' }"));
  assert.match(submission, /contracts\/payloads\/\{kind\}\.v\{pv\}\.json/);
  assert.match(submission, /additionalProperties: \{ \$ref: '#\/components\/schemas\/CanonicalJsonValue' \}/);
  assert.match(submission, /pattern: '\^\[A-Za-z0-9\+\/\]\{21\}\[AEIMQUYcgkosw048\]==\$'/);
  const properties = submission.slice(submission.indexOf("      properties:"));
  for (const serverField of ["prev_hash:", "event_hash:", "received_at:", "chain_index:"]) {
    assert.doesNotMatch(properties, new RegExp(`^\\s+${serverField}`, "m"));
  }
  for (const path of ["/v1/subjects", "/v1/events", "/v1/checkins/{id}/opened", "/v1/checkins/{id}/result"]) {
    assert.match(pathBlock(path), /\$ref: '#\/components\/schemas\/EventSubmission'/);
  }
  assert.match(pathBlock("/v1/events"), /payload commitment mismatch/);
});

test("§7 device and guardian operations require all four X-Vuka request headers", () => {
  for (const [scheme, header] of [
    ["VukaKeyId", "X-Vuka-Key-Id"],
    ["VukaTimestamp", "X-Vuka-Ts"],
    ["VukaNonce", "X-Vuka-Nonce"],
    ["VukaSignature", "X-Vuka-Signature"]
  ]) {
    assert.match(document, new RegExp(`^    ${scheme}:$`, "m"));
    assert.match(document, new RegExp(`name: ${header}`));
  }
  assert.match(document, /Base64 raw P-256 r\|\|s signature over canonical\(\{method, path, ts, body_sha256, nonce\}\)/);
  assert.match(document, /^    CanonicalJsonValue:$/m);
  assert.match(pathBlock("/v1/events"), /request authentication, event_id idempotency lookup, then nonce, counter/);
  for (const path of ["/v1/subjects", "/v1/events", "/v1/checkins/{id}/opened", "/v1/subjects/{id}/record", "/v1/subjects/{id}/data", "/v1/subjects/{id}/export"]) {
    const block = pathBlock(path);
    assert.match(block, /VukaKeyId: \[\], VukaTimestamp: \[\], VukaNonce: \[\], VukaSignature: \[\]/);
  }
});

test("guardian token updates exclude subject PIN authorization", () => {
  const operation = pathBlock("/v1/guardians/{id}/token");
  assert.match(operation, /Guardian-signed only/);
  assert.match(operation, /x-vuka-required-signer-role: guardian/);
  assert.match(operation, /VukaKeyId: \[\], VukaTimestamp: \[\], VukaNonce: \[\], VukaSignature: \[\]/);
  assert.doesNotMatch(operation, /pin_authorisation/);
  assert.match(operation, /'403': \{ \$ref: '#\/components\/responses\/InsufficientApproval' \}/);
});

test("BankSignal distinguishes the three §9/S1 trigger outcomes", () => {
  const signal = document.slice(document.indexOf("    BankSignal:"), document.indexOf("    IntegrityResult:"));
  assert.match(signal, /required: \[subject_id, triggering_outcome\]/);
  assert.match(signal, /subject_id: \{ type: string, minLength: 1, description: sim_ subject identifier\. \}/);
  assert.match(signal, /triggering_outcome: \{ type: string, enum: \[duress_signal, no_answer, contact_lost\] \}/);
  assert.match(signal, /SIMULATED/);
});

test("sim_bank routes require pinned server signatures and explicitly simulated receipts", () => {
  for (const path of ["/sim_bank/v1/risk-signal", "/sim_bank/v1/release"]) {
    const operation = pathBlock(path);
    assert.match(operation, /security: \[\{ VukaTimestamp: \[\], VukaNonce: \[\], VukaServerSignature: \[\] \}\]/);
    assert.match(operation, /'202': \{ \$ref: '#\/components\/responses\/SimBankAcceptedReceipt' \}/);
    assert.match(operation, /'401': \{ \$ref: '#\/components\/responses\/Unauthorized' \}/);
  }
  assert.match(document, /name: X-Vuka-Server-Signature/);
  assert.match(document, /Base64 Ed25519 signature over canonical\(\{method, path, ts, body_sha256, nonce\}\)/);
  assert.match(document, /server_ed25519_public_key[\s\S]*contracts\/keys\/manifest\.json/);

  const receipt = document.slice(document.indexOf("    Receipt:"), document.indexOf("    EvidenceEntry:"));
  assert.match(receipt, /sim: \{ type: boolean, const: true/);
  const simulatedReceipt = document.slice(document.indexOf("    SimBankReceipt:"), document.indexOf("    EvidenceEntry:"));
  assert.match(simulatedReceipt, /required: \[sim\]/);
  assert.match(simulatedReceipt, /sim: \{ type: boolean, const: true \}/);
});

test("ADR-0041 journey end and export advertise their PIN and pre-incident gates", () => {
  const journeyEnd = pathBlock("/v1/journeys/{id}/end");
  assert.match(journeyEnd, /INCOMPLETE — see ADR-0041 G35, implementation pending/);
  assert.match(journeyEnd, /fresh pin_authorised record/);
  assert.match(journeyEnd, /action end_journey/);
  assert.match(journeyEnd, /pin_authorisation_required/);
  assert.match(journeyEnd, /'403': \{ \$ref: '#\/components\/responses\/InsufficientApproval' \}/);

  const subjectExport = pathBlock("/v1/subjects/{id}/export");
  assert.match(subjectExport, /INCOMPLETE — see ADR-0041 T30, implementation pending/);
  assert.match(subjectExport, /fresh[\s\S]*pin_authorised record for action export/);
  assert.match(subjectExport, /pin_authorisation_required/);
  assert.match(subjectExport, /pre-incident head/);
  assert.match(subjectExport, /6 hours after its last PIN entry/);
  assert.match(subjectExport, /byte-identical visible results/);
});

test("proof, receipt and subject schemas carry the §6, §9 and §10 fields", () => {
  const proof = document.slice(document.indexOf("    Proof:"), document.indexOf("    AnchorReceipt:"));
  assert.match(proof, /side: \{ type: string, enum: \[L, R\] \}/);
  assert.match(proof, /hash: \{ type: string, pattern: '\^\[0-9a-f\]\{64\}\$' \}/);

  const receipt = document.slice(document.indexOf("    AnchorReceipt:"), document.indexOf("    KeyManifest:"));
  for (const field of ["topic_id", "sequence_number", "consensus_timestamp", "running_hash", "topic_epoch"]) {
    assert.match(receipt, new RegExp(`^        ${field}:`, "m"));
  }
  assert.ok(receipt.includes("pattern: '^[0-9]+\\.[0-9]{1,9}$'"));
  assert.ok(!receipt.includes("format: date-time"));

  const manifest = document.slice(document.indexOf("    KeyManifest:"), document.indexOf("    SubjectExport:"));
  assert.match(manifest, /server_ed25519_public_key/);
  assert.match(manifest, /ml_dsa_65_public_key/);
  assert.match(pathBlock("/v1/anchor/latest"), /key_manifest: \{ \$ref: '#\/components\/schemas\/KeyManifest' \}/);

  const exportSchema = document.slice(document.indexOf("    SubjectExport:"), document.indexOf("    SubjectDeletionRequest:"));
  for (const field of ["entries", "payloads", "salts", "proofs", "receipts"]) assert.match(exportSchema, new RegExp(`^        ${field}:`, "m"));
  const deletion = document.slice(document.indexOf("    SubjectDeletionRequest:"), document.indexOf("    BankSignal:"));
  assert.match(deletion, /pin_authorisation: \{ \$ref: '#\/components\/schemas\/PinAuthorisationStatement' \}/);
});

test("key manifest message format is documented without key material", () => {
  assert.match(keyManifestFormat, /0x02/);
  assert.match(keyManifestFormat, /SHA-256\(key manifest bytes\)/);
  assert.match(keyManifestFormat, /33 bytes/);
  assert.match(keyManifestFormat, /Ed25519 \*\*public\*\* key/);
  assert.match(keyManifestFormat, /ML-DSA-65 public key/);
  assert.doesNotMatch(keyManifestFormat, /BEGIN (?:PRIVATE|RSA PRIVATE|EC PRIVATE) KEY/);
});
