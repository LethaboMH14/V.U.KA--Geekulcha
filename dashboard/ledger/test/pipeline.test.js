// node --test dashboard/ledger/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { exportFromShare, verifyTrace } from "../lib/pipeline.js";
import { createSources } from "../lib/sources.js";
import { buildSimSubjectExport } from "../../../shared/test/fixtures.js";
import { auditPath, bytesToHex, hexToBytes, merkleRoot } from "../../../shared/merkle.js";

const load = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), "utf8"));
const fresh = () => ({
  exportObj: load("../sample/export.json"),
  batch: load("../sample/batch.json"),
  pins: load("../sample/pins.json"),
  manifest: load("../sample/manifest.json"),
});

async function run(exportObj, options) {
  const steps = [];
  const it = verifyTrace(exportObj, options);
  for (;;) {
    const { value, done } = await it.next();
    if (done) return { steps, result: value };
    steps.push(value);
  }
}

function sampleOptions({ batch, pins, manifest }) {
  return { pins, manifest, proof: { path: batch.path, receipt: batch.receipt }, ledgerMessage: batch.message, archived: true };
}

test("SAMPLE verifies to 'archived' with every check ok", async () => {
  const s = fresh();
  const { steps, result } = await run(s.exportObj, sampleOptions(s));
  assert.equal(result.state, "archived");
  assert.equal(result.firstBroken, null);
  assert.equal(result.head, s.batch.head);
  assert.equal(result.root, s.batch.root);
  assert.equal(result.entries, s.exportObj.entries.length);
  assert.ok(steps.every((step) => step.ok !== false), JSON.stringify(steps.find((x) => x.ok === false)));
  for (const phase of ["parse", "canonical", "commitment", "event_hash", "link", "signature", "head", "leaf", "path", "root", "ledger", "verdict"]) {
    assert.ok(steps.some((step) => step.phase === phase), `missing phase ${phase}`);
  }
  assert.equal(steps.filter((step) => step.phase === "path").length, s.batch.path.length);
  // Server signature step is really checked (ok true) against the SAMPLE manifest key.
  assert.ok(steps.some((step) => step.phase === "signature" && step.ok === true && /SAMPLE manifest/.test(step.detail)));
  // Duress check-in is labelled, with the coalescing note (§10).
  const duress = steps.find((step) => step.phase === "canonical" && step.kind === "checkin_result");
  assert.match(duress.label, /duress/);
  assert.match(duress.detail, /60 s window/);
});

test("SAMPLE can never be live-verified, even without archived:true", async () => {
  const s = fresh();
  const { result } = await run(s.exportObj, { ...sampleOptions(s), archived: false });
  assert.equal(result.state, "archived");
});

test("tampered payload → failed at that entry", async () => {
  const s = fresh();
  const id = s.exportObj.entries[5].details.event_id;
  s.exportObj.payloads[id].result = "normal_pin";
  const { steps, result } = await run(s.exportObj, sampleOptions(s));
  assert.equal(result.state, "failed");
  assert.equal(result.firstBroken, 5);
  assert.equal(result.reason, "commitment_mismatch");
  assert.ok(steps.some((step) => step.phase === "commitment" && step.entry === 5 && step.ok === false));
  assert.ok(!steps.some((step) => step.phase === "leaf"));
});

test("tampered proof sibling → root mismatch, failed", async () => {
  const s = fresh();
  const flipped = s.batch.path[0].hash.startsWith("0") ? "1" : "0";
  s.batch.path[0].hash = flipped + s.batch.path[0].hash.slice(1);
  const { steps, result } = await run(s.exportObj, sampleOptions(s));
  assert.equal(result.state, "failed");
  assert.notEqual(result.root, s.batch.root);
  assert.ok(steps.some((step) => step.label === "Compare root with ledger bytes" && step.ok === false));
});

test("wrong message type byte → failed", async () => {
  const s = fresh();
  s.batch.message.bytesHex = `02${s.batch.message.bytesHex.slice(2)}`;
  const { steps, result } = await run(s.exportObj, sampleOptions(s));
  assert.equal(result.state, "failed");
  assert.ok(steps.some((step) => step.phase === "ledger" && step.ok === false && /0x02/.test(step.detail)));
});

test("no proof → 'unavailable' with a plain reason", async () => {
  const s = fresh();
  const { steps, result } = await run(s.exportObj, { pins: s.pins, manifest: s.manifest });
  assert.equal(result.state, "unavailable");
  assert.equal(result.firstBroken, null);
  assert.match(result.reason, /hasn't been anchored yet; anchoring runs at least hourly/);
  assert.ok(steps.every((step) => step.ok !== false));
});

test("receipt on another topic → failed", async () => {
  const s = fresh();
  s.batch.receipt.topic_id = "0.0.1";
  const { result } = await run(s.exportObj, sampleOptions(s));
  assert.equal(result.state, "failed");
});

test("SAMPLE manifest against the REAL pins → failed (fingerprint)", async () => {
  const s = fresh();
  const realPins = load("../../../contracts/keys/verify-pins.json");
  const { result } = await run(s.exportObj, { ...sampleOptions(s), pins: realPins });
  assert.equal(result.state, "failed");
  assert.match(result.reason, /fingerprint/);
});

test("end to end with real pins/manifest, a server-shaped proof and a mirror-shaped message → live-verified", async () => {
  const pins = load("../../../contracts/keys/verify-pins.json");
  const manifest = load("../../../contracts/keys/manifest.json");
  // Device-only chain (no server entries, so the production key is not needed).
  const { subjectExport } = await buildSimSubjectExport();
  subjectExport.entries = subjectExport.entries.slice(0, 4);
  const head = subjectExport.entries[3].event_hash;
  const heads = [head, ...Array.from({ length: 4 }, () => bytesToHex(crypto.getRandomValues(new Uint8Array(32))))].sort();
  const raw = heads.map(hexToBytes);
  const root = bytesToHex(await merkleRoot(raw));
  const path = await auditPath(raw, heads.indexOf(head));
  const receipt = { topic_id: pins.topic_id, sequence_number: 42, consensus_timestamp: "1790294400.000000001", running_hash: "cnVubmluZw==", topic_epoch: pins.topic_epoch };
  const messageBytes = new Uint8Array([0x01, ...hexToBytes(root)]);
  const mirrorJson = {
    consensus_timestamp: receipt.consensus_timestamp, running_hash: receipt.running_hash, sequence_number: 42,
    topic_id: pins.topic_id, message: Buffer.from(messageBytes).toString("base64"),
  };
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/v1/anchor/proof/")) return new Response(JSON.stringify({ proof: path, receipt }), { status: 200 });
    if (u.includes("/messages/42")) return new Response(JSON.stringify(mirrorJson), { status: 200 });
    return new Response("{}", { status: 404 });
  };
  try {
    const sources = createSources();
    const proof = await sources.proof(head);
    const ledgerMessage = await sources.message(proof.receipt.topic_id, proof.receipt.sequence_number);
    const shared = JSON.stringify({ format: "vuka-export-v2", export: subjectExport });
    const { result } = await run(exportFromShare(shared), { pins, manifest, proof, ledgerMessage });
    assert.equal(result.state, "live-verified");
    assert.equal(result.root, root);
    // A raw server proof body ({proof, receipt}) is accepted too.
    const raw2 = await run(subjectExport, { pins, manifest, proof: { proof: path, receipt }, ledgerMessage });
    assert.equal(raw2.result.state, "live-verified");
  } finally {
    globalThis.fetch = original;
  }
});

test("exportFromShare accepts the three share shapes and rejects anything else", () => {
  const e = { subject_id: "sim_x", entries: [], payloads: {}, salts: {} };
  assert.deepEqual(exportFromShare(JSON.stringify(e)), e);
  assert.deepEqual(exportFromShare({ vuka_export: e }), e);
  assert.deepEqual(exportFromShare(JSON.stringify({ format: "vuka-export-v2", export: e })), e);
  assert.throws(() => exportFromShare("not json"), /not JSON/);
  assert.throws(() => exportFromShare(""), /Nothing was pasted/);
  assert.throws(() => exportFromShare("[1]"), /not a VIGIL export/);
  assert.throws(() => exportFromShare({ format: "vuka-export-v1", export: e }), /only vuka-export-v2/);
  assert.throws(() => exportFromShare({ hello: 1 }), /subject_id/);
});
