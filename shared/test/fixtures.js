// Canned 8-entry sim_subject export for T04/T05 (verify-min vitest).
//
// Builds a complete, valid SubjectExport (contract v2 shape: subject_id,
// entries, payloads, salts) for sim subject "sim_subject_verifymin": genesis
// device registration, three device events (the third a duress check-in) and
// four server events, ending in bank_signal_sent. Payloads/salts are maps
// keyed by event_id. Keys are generated per run (WebCrypto); nothing private
// is ever written to the repo. Tests mutate the returned object in place or
// re-sign entries with the helpers below to produce the negative vectors.
import { canonicalize } from "../canonical.js";
import { rawToDer } from "../der.js";

export const SUBJECT_ID = "sim_subject_verifymin";

function b64(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export { b64 };

function eventId(n) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

function rfc3339(baseMs, offsetSeconds) {
  return new Date(baseMs + offsetSeconds * 1000).toISOString().replace("Z", "+02:00");
}

const BASE_MS = Date.parse("2026-09-25T09:05:00+02:00");

/** Generate the two signing keypairs: device P-256 (DER ECDSA) and server Ed25519 (raw). */
async function generateKeys() {
  const device = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const server = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
  const deviceSpki = new Uint8Array(await crypto.subtle.exportKey("spki", device.publicKey));
  const serverSpki = new Uint8Array(await crypto.subtle.exportKey("spki", server.publicKey));
  return { device, server, deviceSpkiB64: b64(deviceSpki), serverSpkiB64: b64(serverSpki) };
}

/** Sign the §4 statement bytes with the device key; DER-encoded, base64. */
export async function signDeviceStatement(statementBytes, devicePrivateKey) {
  const raw = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, devicePrivateKey, statementBytes));
  return b64(rawToDer(raw.subarray(0, 32), raw.subarray(32, 64)));
}

/** Sign the §4 statement bytes with an Ed25519 key; raw 64-byte, base64. */
export async function signEd25519Statement(statementBytes, privateKey) {
  return b64(new Uint8Array(await crypto.subtle.sign("Ed25519", privateKey, statementBytes)));
}

// The canned journey: genesis registration → duress check-in → server triage → bank signal.
const EVENTS = [
  { actor: "device_verifymin_01", target: SUBJECT_ID, targetType: "subject", action: "registration", signer: "device", counter: 1, payload: { kind: "registration", role: "device", key_id: "device_verifymin_01" } },
  { actor: "device_verifymin_01", target: "sim_journey_01", targetType: "journey", action: "journey_armed", signer: "device", counter: 2, payload: { kind: "journey_armed", journey_id: "sim_journey_01" } },
  { actor: "device_verifymin_01", target: "sim_journey_01", targetType: "journey", action: "signal_detected", signer: "device", counter: 3, payload: { kind: "signal_detected", trigger: "alarm_button" } },
  { actor: "device_verifymin_01", target: "sim_journey_01", targetType: "journey", action: "checkin_result", signer: "device", counter: 4, payload: { kind: "checkin_result", result: "duress_pin" } },
  { actor: "anchor", target: "sim_journey_01", targetType: "journey", action: "guardian_alerted", signer: "server", counter: 1, payload: { kind: "guardian_alerted", guardian_id: "sim_guardian_01" } },
  { actor: "anchor", target: "sim_journey_01", targetType: "journey", action: "no_answer", signer: "server", counter: 2, payload: { kind: "no_answer", attempts: 2 } },
  { actor: "anchor", target: "sim_journey_01", targetType: "journey", action: "incident_closed", signer: "server", counter: 3, payload: { kind: "incident_closed", resolution: "confirmed_duress" } },
  { actor: "anchor", target: "sim_journey_01", targetType: "journey", action: "bank_signal_sent", signer: "server", counter: 4, payload: { kind: "bank_signal_sent", trigger: "duress_signal" } },
];

const ZERO_HASH = "0".repeat(64);

/**
 * Build the complete canned export. Returns
 * { subjectExport, eventIds, keys: { deviceSpkiB64, serverSpkiB64, devicePrivateKey, serverPrivateKey } }.
 */
export async function buildSimSubjectExport() {
  const keys = await generateKeys();
  const eventIds = EVENTS.map((_, i) => eventId(i));
  const entries = [];
  const payloads = {};
  const salts = {};

  for (let i = 0; i < EVENTS.length; i++) {
    const spec = EVENTS[i];
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const payload = { ...spec.payload };
    const commitment = bytesToHexLocal(await sha256Local(concat(saltBytes, canonicalize(payload))));
    const saltB64 = b64(saltBytes);
    const isGenesis = i === 0;
    const entry = {
      action: spec.action,
      actor_id: spec.actor,
      target_type: spec.targetType,
      target_id: spec.target,
      details: {
        v: 2,
        signer: spec.signer,
        signer_key_id: spec.signer === "server" ? "anchor-server-1" : spec.actor,
        counter: spec.counter,
        event_id: eventIds[i],
        commitment,
        sig: "",
        received_at: rfc3339(BASE_MS, i * 2 + 1),
        chain_index: i,
      },
      ts: rfc3339(BASE_MS, i * 2),
      prev_hash: null, // linked in the second pass, once the prior event_hash is final
      event_hash: "",
    };
    if (isGenesis) entry.details.signer_pubkey = keys.deviceSpkiB64;
    payloads[eventIds[i]] = payload;
    salts[eventIds[i]] = saltB64;
    entries.push(entry);
  }

  // Link then sign then hash, in order: prev_hash is hashed into event_hash
  // (§4), so each entry links to its predecessor's FINAL event_hash first.
  for (let i = 0; i < EVENTS.length; i++) {
    entries[i].prev_hash = i === 0 ? ZERO_HASH : entries[i - 1].event_hash;
    await signAndHashEntry(entries[i], SUBJECT_ID, keys);
  }

  return {
    subjectExport: { subject_id: SUBJECT_ID, entries, payloads, salts },
    eventIds,
    keys,
  };
}

/** Sign one entry in place (device or server role) and recompute its event_hash. */
export async function signAndHashEntry(entry, subjectId, keys, { serverPrivateKey, devicePrivateKey } = {}) {
  const statement = canonicalize({
    domain: "vuka.event.v2",
    subject_id: subjectId,
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
    entry.details.signer === "server"
      ? await signEd25519Statement(statement, serverPrivateKey ?? keys.server.privateKey)
      : await signDeviceStatement(statement, devicePrivateKey ?? keys.device.privateKey);
  const { event_hash, ...rest } = entry;
  entry.event_hash = bytesToHexLocal(await sha256Local(canonicalize(rest)));
  return entry;
}

function sha256Local(bytes) {
  return crypto.subtle.digest("SHA-256", bytes).then((h) => new Uint8Array(h));
}

function bytesToHexLocal(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function concat(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}