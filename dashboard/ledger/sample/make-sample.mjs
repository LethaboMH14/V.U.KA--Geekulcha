// dashboard/ledger/sample/make-sample.mjs — TEST FIXTURE generator.
//
//   node dashboard/ledger/sample/make-sample.mjs
//
// Writes a SAMPLE data set used only by dashboard/ledger/test/. The dashboard
// UI never loads it (product owner, 26 Sep 2026: "nothing is mock, all live").
//
//   export.json   a valid format-v2 sim_ subject export (spec §4), signed with
//                 device, guardian and server keys generated here in memory;
//   batch.json    the export's head plus 5 random heads, ordered by raw bytes
//                 ascending (§6), the RFC 6962 root, the head's audit path and
//                 a made-up 0x01 ledger message + receipt;
//   manifest.json a SAMPLE key manifest holding the generated server key;
//   pins.json     pins naming the real pinned topic, flagged sample, with the
//                 SAMPLE manifest's fingerprint.
//
// Every file carries "sample": true. No private key is ever written to disk:
// the keypairs live only for the lifetime of this process.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

import { canonicalize } from "../../../shared/canonical.js";
import { sha256 } from "../../../shared/keys.js";
import { auditPath, bytesToHex, hexToBytes, merkleRoot } from "../../../shared/merkle.js";
import { b64, signDeviceStatement, signEd25519Statement } from "../../../shared/test/fixtures.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const REAL_PINS = JSON.parse(readFileSync(join(HERE, "../../../contracts/keys/verify-pins.json"), "utf8"));

const SUBJECT_ID = "sim_subject_ledger_sample";
const JOURNEY_ID = "sim_journey_ledger_01";
const DEVICE = { actor: "sim_device_ledger_01", keyId: "sim_device_key_01" };
const GUARDIAN = { actor: "sim_guardian_ledger_01", keyId: "sim_guardian_key_01" };
const SERVER = { actor: "anchor", keyId: "anchor-server-1" };
const BASE_MS = Date.parse("2026-09-25T21:40:00+02:00");
const ZERO_HASH = "0".repeat(64);

// Spec §3: the public `action` is the coarse class; `kind` lives in the payload.
const EVENTS = [
  { who: DEVICE, signer: "device", action: "registration", targetType: "subject", target: SUBJECT_ID, register: "device",
    payload: { kind: "registration", role: "device", key_id: DEVICE.keyId } },
  { who: GUARDIAN, signer: "guardian", action: "registration", targetType: "subject", target: SUBJECT_ID, register: "guardian",
    payload: { kind: "registration", role: "guardian", key_id: GUARDIAN.keyId } },
  { who: DEVICE, signer: "device", action: "device_event", targetType: "journey", target: JOURNEY_ID,
    payload: { kind: "journey_armed", journey_id: JOURNEY_ID } },
  { who: DEVICE, signer: "device", action: "device_event", targetType: "journey", target: JOURNEY_ID,
    payload: { kind: "signal_detected", trigger: "alarm_button", score_bp: 9100 } },
  { who: DEVICE, signer: "device", action: "device_event", targetType: "journey", target: JOURNEY_ID,
    payload: { kind: "checkin_opened" } },
  { who: DEVICE, signer: "device", action: "device_event", targetType: "journey", target: JOURNEY_ID,
    payload: { kind: "checkin_result", result: "duress_pin" } },
  { who: SERVER, signer: "server", action: "server_event", targetType: "journey", target: JOURNEY_ID,
    payload: { kind: "guardian_alerted", guardian_id: GUARDIAN.actor } },
  { who: GUARDIAN, signer: "guardian", action: "guardian_event", targetType: "journey", target: JOURNEY_ID,
    payload: { kind: "guardian_ack" } },
  { who: DEVICE, signer: "device", action: "device_event", targetType: "journey", target: JOURNEY_ID,
    payload: { kind: "journey_ended" } },
];

function rfc3339(offsetSeconds) {
  // +02:00 (SAST) with seconds, as spec §5 requires for hashed times.
  const d = new Date(BASE_MS + offsetSeconds * 1000 + 2 * 3600 * 1000);
  return d.toISOString().replace(/\.\d{3}Z$/, "+02:00");
}

function eventId(n) {
  return `5a3b1e00-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

function concat(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

async function generateKeys() {
  const p256 = { name: "ECDSA", namedCurve: "P-256" };
  const device = await crypto.subtle.generateKey(p256, false, ["sign", "verify"]);
  const guardian = await crypto.subtle.generateKey(p256, false, ["sign", "verify"]);
  const server = await crypto.subtle.generateKey("Ed25519", false, ["sign", "verify"]);
  const spki = async (key) => b64(new Uint8Array(await crypto.subtle.exportKey("spki", key.publicKey)));
  return {
    device, guardian, server,
    deviceSpki: await spki(device), guardianSpki: await spki(guardian), serverSpki: await spki(server),
  };
}

async function buildExport(keys) {
  const entries = [];
  const payloads = {};
  const salts = {};
  const counters = new Map();
  for (let i = 0; i < EVENTS.length; i += 1) {
    const spec = EVENTS[i];
    const counter = (counters.get(spec.who.keyId) ?? 0) + 1;
    counters.set(spec.who.keyId, counter);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const commitment = bytesToHex(await sha256(concat(salt, canonicalize(spec.payload))));
    const id = eventId(i);
    const entry = {
      action: spec.action,
      actor_id: spec.who.actor,
      target_type: spec.targetType,
      target_id: spec.target,
      details: {
        v: 2,
        signer: spec.signer,
        signer_key_id: spec.who.keyId,
        counter,
        event_id: id,
        commitment,
        sig: "",
        received_at: rfc3339(i * 90 + 1),
        chain_index: i,
      },
      ts: rfc3339(i * 90),
      prev_hash: i === 0 ? ZERO_HASH : entries[i - 1].event_hash,
      event_hash: "",
    };
    if (spec.register === "device") entry.details.signer_pubkey = keys.deviceSpki;
    if (spec.register === "guardian") entry.details.signer_pubkey = keys.guardianSpki;

    const statement = canonicalize({
      domain: "vuka.event.v2",
      subject_id: SUBJECT_ID,
      actor_id: entry.actor_id,
      target_type: entry.target_type,
      target_id: entry.target_id,
      action: entry.action,
      source_ts: entry.ts,
      signer_key_id: entry.details.signer_key_id,
      counter: entry.details.counter,
      event_id: entry.details.event_id,
      commitment: entry.details.commitment,
    });
    entry.details.sig =
      spec.signer === "server" ? await signEd25519Statement(statement, keys.server.privateKey)
      : spec.signer === "guardian" ? await signDeviceStatement(statement, keys.guardian.privateKey)
      : await signDeviceStatement(statement, keys.device.privateKey);
    const { event_hash: _omit, ...rest } = entry;
    entry.event_hash = bytesToHex(await sha256(canonicalize(rest)));

    entries.push(entry);
    payloads[id] = spec.payload;
    salts[id] = b64(salt);
  }
  return {
    sample: true,
    note: "SAMPLE test fixture generated by dashboard/ledger/sample/make-sample.mjs. Not a real record.",
    subject_id: SUBJECT_ID,
    entries,
    payloads,
    salts,
  };
}

async function buildBatch(head) {
  const heads = [head];
  while (heads.length < 6) {
    const h = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
    if (!heads.includes(h)) heads.push(h);
  }
  heads.sort(); // lowercase hex order == raw byte order (§6)
  const raw = heads.map(hexToBytes);
  const index = heads.indexOf(head);
  const root = bytesToHex(await merkleRoot(raw));
  const path = await auditPath(raw, index);
  const lastReceived = Date.parse(EVENTS.length ? rfc3339((EVENTS.length - 1) * 90 + 1) : 0);
  const consensus_timestamp = `${Math.floor(lastReceived / 1000) + 37}.${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;
  const running_hash = b64(crypto.getRandomValues(new Uint8Array(48))); // made up (mirror form: base64 SHA-384)
  const sequence_number = 900000 + Math.floor(Math.random() * 1000);
  const message = {
    sample: true,
    topic_id: REAL_PINS.topic_id,
    sequence_number,
    consensus_timestamp,
    running_hash,
    bytesHex: `01${root}`,
    type: 1,
    payloadHex: root,
  };
  const receipt = {
    sample: true,
    topic_id: REAL_PINS.topic_id,
    sequence_number,
    consensus_timestamp,
    running_hash,
    topic_epoch: REAL_PINS.topic_epoch,
  };
  return {
    sample: true,
    note: "SAMPLE batch: 5 random heads, a made-up message and receipt. Never on Hedera.",
    leaves: heads, index, head, root, path, message, receipt,
  };
}

async function main() {
  const keys = await generateKeys();
  const exportObj = await buildExport(keys);
  const head = exportObj.entries[exportObj.entries.length - 1].event_hash;
  const batch = await buildBatch(head);
  const manifest = { sample: true, server_ed25519_public_key: keys.serverSpki };
  const pins = {
    sample: true,
    note: "SAMPLE pins for tests: the real pinned topic, but the fingerprint of sample/manifest.json (a generated server key).",
    network: REAL_PINS.network,
    topic_id: REAL_PINS.topic_id,
    topic_epoch: REAL_PINS.topic_epoch,
    manifest_fingerprint_hex: bytesToHex(await sha256(canonicalize(manifest))),
    manifest_serialization: REAL_PINS.manifest_serialization,
  };
  const write = (name, value) => writeFile(join(HERE, name), `${JSON.stringify(value, null, 2)}\n`);
  await write("export.json", exportObj);
  await write("batch.json", batch);
  await write("manifest.json", manifest);
  await write("pins.json", pins);
  console.log(`SAMPLE written to ${HERE}: ${exportObj.entries.length} entries, head ${head}, root ${batch.root}`);
}

await main();
