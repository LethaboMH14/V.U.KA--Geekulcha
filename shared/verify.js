// Minimal v2 subject-export verifier (docs/VUKA-2-SPEC.md §§4–5, §4a/ADR-0042,
// §14 verify-min). No mirror read, Merkle-proof or revocation checks.
//
// What `ok: true` means, and what it does not: the chain is internally
// consistent (links, hashes, commitments, counters) and every device or
// guardian entry is signed by a key the chain itself registers. It does NOT
// prove the record came from VUKA — anyone can build a self-consistent chain
// with their own keys. Hence `assurance`.
//
// `verifyExport(exportObj, pins?)`: when pins are provided (as the verify page
// does, from contracts/keys/verify-pins.json + manifest.json), the server-signed
// entries are ALSO signature-checked against the PINNED Ed25519 key (T05 — the
// server key can never come from the export itself) and any receipts in the
// export must name pins.topic_id / pins.topic_epoch; `not_checked` then drops
// "server signatures". Without pins the verifier stays anchor-agnostic (the
// cross-language scripts and tests without a manifest).
//
// Key-registry hardening (red-team review SEC-A/SEC-B): a signer_key_id is
// registered ONCE — a later registration with a different key or actor is
// `key_conflict`, never a silent overwrite — and every entry resolved from a
// registered key must claim that key's registered actor_id (`actor_mismatch`).

import { canonicalize } from "./canonical.js";
import { derToRaw } from "./der.js";
import { importSpkiVerifyKey } from "./keys.js";

const ZERO_HASH = "0".repeat(64);
const HASH_RE = /^[0-9a-f]{64}$/;
const SIGNERS = new Set(["device", "guardian", "server"]);
const TARGET_TYPES = new Set(["journey", "subject"]);
const NOT_CHECKED = Object.freeze([
  "anchor receipts",
  "Merkle proofs",
  "key revocation",
  "server signatures",
]);
const encoder = new TextEncoder();

/** Raised by {@link normaliseExport} when an export has an invalid container shape. */
export class ExportError extends Error {
  constructor(message) {
    super(message);
    this.name = "ExportError";
  }
}

function isRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function decodeBase64(value, label) {
  if (typeof value !== "string" || value.length === 0 || value.length % 4 !== 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new ExportError(`${label} must be canonical base64`);
  }
  let binary;
  try {
    binary = globalThis.atob(value);
  } catch {
    throw new ExportError(`${label} must be canonical base64`);
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  // atob accepts some non-canonical encodings; require one stable representation.
  let encoded = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    encoded += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  if (globalThis.btoa(encoded) !== value) throw new ExportError(`${label} must be canonical base64`);
  return bytes;
}

function normaliseCollection(value, property, label) {
  const result = new Map();
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isRecord(item) || typeof item.event_id !== "string" ||
          !Object.hasOwn(item, property)) {
        throw new ExportError(`${label} array items need event_id and ${property}`);
      }
      if (result.has(item.event_id)) throw new ExportError(`duplicate event_id in ${label}`);
      result.set(item.event_id, item[property]);
    }
    return result;
  }
  if (!isRecord(value)) throw new ExportError(`${label} must be an object map or an array`);
  for (const eventId of Object.keys(value)) result.set(eventId, value[eventId]);
  return result;
}

/**
 * Convert supported payload/salt object-map or array encodings into Maps.
 * Duplicate event IDs in array form are rejected rather than overwritten.
 * @param {unknown} obj
 * @returns {{ subject_id: unknown, entries: unknown, payloads: Map<string, unknown>, salts: Map<string, unknown>, source: object }}
 */
export function normaliseExport(obj) {
  if (!isRecord(obj)) throw new ExportError("export must be an object");
  if (typeof obj.subject_id !== "string" || obj.subject_id.length === 0) {
    throw new ExportError("subject_id must be a non-empty string");
  }
  const payloads = normaliseCollection(obj.payloads, "payload", "payloads");
  const salts = normaliseCollection(obj.salts, "salt", "salts");
  return { subject_id: obj.subject_id, entries: obj.entries, payloads, salts };
}

function result(ok, checked, index, reason, detail, payloadRemoved, serverIndexes) {
  return {
    ok,
    entries_checked: checked,
    first_broken_index: index,
    reason,
    detail,
    payload_removed: payloadRemoved,
    server_signature_not_checked: serverIndexes,
    not_checked: [...NOT_CHECKED],
    assurance: "internal_consistency_only",
  };
}

function failure(checked, index, reason, detail, payloadRemoved, serverIndexes) {
  return result(false, checked, index, reason, detail, payloadRemoved, serverIndexes);
}

async function sha256(bytes) {
  return new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
}

function hex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function concat(left, right) {
  const bytes = new Uint8Array(left.length + right.length);
  bytes.set(left);
  bytes.set(right, left.length);
  return bytes;
}

function withoutEventHash(entry) {
  const copy = {};
  for (const key of Object.keys(entry)) if (key !== "event_hash") copy[key] = entry[key];
  return copy;
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function shapeError(entry, index) {
  const outer = ["action", "actor_id", "target_type", "target_id", "details", "ts", "prev_hash", "event_hash"];
  if (!isRecord(entry) || outer.some((key) => !hasOwn(entry, key)) ||
      !isRecord(entry.details) || !TARGET_TYPES.has(entry.target_type) ||
      entry.details.v !== 2 || entry.details.chain_index !== index ||
      typeof entry.prev_hash !== "string" || !HASH_RE.test(entry.prev_hash) ||
      typeof entry.event_hash !== "string" || !HASH_RE.test(entry.event_hash) ||
      !SIGNERS.has(entry.details.signer)) {
    return "Entry shape or required v2 field is invalid.";
  }
  return null;
}

function statementFor(entry, subjectId) {
  const details = entry.details;
  return {
    domain: "vuka.event.v2",
    subject_id: subjectId,
    actor_id: entry.actor_id,
    target_type: entry.target_type,
    target_id: entry.target_id,
    action: entry.action,
    source_ts: entry.ts,
    signer_key_id: details.signer_key_id,
    counter: details.counter,
    event_id: details.event_id,
    commitment: details.commitment,
  };
}

/**
 * Verify a format-v2 subject export in chain order.
 * @param {unknown} exportObj
 * @param {{ server_ed25519_public_key?: string, network?: string, topic_id?: string,
 *          topic_epoch?: number } | null} [pins] pinned values; when provided the
 *        server signatures are checked against the pinned key and receipts are
 *        checked against the pinned topic (T05).
 * @returns {Promise<{ ok: boolean, entries_checked: number, first_broken_index: number|null, reason: string|null, detail: string|null, payload_removed: number[], server_signature_not_checked: number[], not_checked: string[], assurance: string }>}
 */
export async function verifyExport(exportObj, pins = null) {
  let serverKey = null;
  if (pins !== null && pins !== undefined) {
    if (
      typeof pins !== "object" || Array.isArray(pins) ||
      typeof pins.server_ed25519_public_key !== "string" || pins.server_ed25519_public_key.length === 0
    ) {
      return failure(0, null, "bad_pins", "pins.server_ed25519_public_key is required when pins are provided (the pinned key manifest).", [], []);
    }
    try {
      serverKey = await importSpkiVerifyKey(pins.server_ed25519_public_key, "Ed25519");
    } catch (error) {
      return failure(0, null, "bad_pins", `The pinned server key is not a usable Ed25519 SPKI: ${error instanceof Error ? error.message : "invalid"}`, [], []);
    }
  }
  const out = await runChecks(exportObj, pins, serverKey);
  if (serverKey !== null) {
    // With pins every server entry was signature-checked: nothing unchecked remains (T05).
    out.server_signature_not_checked = [];
    out.not_checked = out.not_checked.filter((item) => item !== "server signatures");
  }
  return out;
}

async function runChecks(exportObj, pins, serverKey) {
  let normalized;
  try {
    normalized = normaliseExport(exportObj);
  } catch (error) {
    return failure(0, null, "bad_shape", error instanceof Error ? error.message : "Export shape is invalid.", [], []);
  }
  const entries = normalized.entries;
  if (!Array.isArray(entries)) return failure(0, null, "bad_shape", "entries must be an array.", [], []);
  if (entries.length === 0) return failure(0, null, "empty_export", "The export contains no entries.", [], []);

  // Receipts, when the export carries them, must name the pinned topic/epoch
  // (mirror half of the anchor check; the mirror read itself stays out of scope).
  if (pins !== null && Array.isArray(exportObj.receipts)) {
    for (const receipt of exportObj.receipts) {
      if (!isRecord(receipt)) {
        return failure(0, null, "bad_shape", "Each entry of export.receipts must be an object.", [], []);
      }
      if (pins.topic_id !== undefined && receipt.topic_id !== pins.topic_id) {
        return failure(0, null, "receipt_topic_mismatch", `A receipt names topic ${JSON.stringify(receipt.topic_id ?? null)}; the pinned topic is ${JSON.stringify(pins.topic_id)}.`, [], []);
      }
      if (pins.topic_epoch !== undefined && receipt.topic_epoch !== pins.topic_epoch) {
        return failure(0, null, "receipt_topic_mismatch", `A receipt names topic_epoch ${JSON.stringify(receipt.topic_epoch ?? null)}; the pinned epoch is ${JSON.stringify(pins.topic_epoch)}.`, [], []);
      }
    }
  }

  const payloadRemoved = [];
  const serverIndexes = [];
  const keys = new Map();
  const counters = new Map();

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const badShape = shapeError(entry, i);
    if (badShape) return failure(i, i, "bad_shape", badShape, payloadRemoved, serverIndexes);

    if (i === 0 ? entry.prev_hash !== ZERO_HASH : entry.prev_hash !== entries[i - 1]?.event_hash) {
      return failure(i, i, "prev_hash_mismatch", "The previous hash does not link to the preceding entry.", payloadRemoved, serverIndexes);
    }

    let canonicalEntry;
    try {
      canonicalEntry = canonicalize(withoutEventHash(entry));
    } catch (error) {
      return failure(i, i, "canonical_error", `Entry cannot be canonicalised: ${error.message}`, payloadRemoved, serverIndexes);
    }
    if (hex(await sha256(canonicalEntry)) !== entry.event_hash) {
      return failure(i, i, "event_hash_mismatch", "The event hash does not match the canonical entry.", payloadRemoved, serverIndexes);
    }

    const eventId = entry.details.event_id;
    const hasPayload = normalized.payloads.has(eventId);
    const hasSalt = normalized.salts.has(eventId);
    if (hasPayload !== hasSalt) {
      return failure(i, i, "payload_salt_mismatch", "A payload and its salt must be present or absent together.", payloadRemoved, serverIndexes);
    }
    if (!hasPayload) {
      payloadRemoved.push(i);
    } else {
      let salt;
      try {
        salt = decodeBase64(normalized.salts.get(eventId), "salt");
      } catch (error) {
        return failure(i, i, "salt_length", error instanceof Error ? error.message : "Salt is invalid.", payloadRemoved, serverIndexes);
      }
      if (salt.length !== 16) {
        return failure(i, i, "salt_length", "Commitment salts must contain exactly 16 bytes.", payloadRemoved, serverIndexes);
      }
      let payloadBytes;
      try {
        payloadBytes = canonicalize(normalized.payloads.get(eventId));
      } catch (error) {
        return failure(i, i, "canonical_error", `Payload cannot be canonicalised: ${error.message}`, payloadRemoved, serverIndexes);
      }
      if (typeof entry.details.commitment !== "string" ||
          hex(await sha256(concat(salt, payloadBytes))) !== entry.details.commitment) {
        return failure(i, i, "commitment_mismatch", "The payload commitment does not match its payload and salt.", payloadRemoved, serverIndexes);
      }
    }

    const details = entry.details;
    // A key may be registered only by an entry that is itself verified with
    // that key. Server entries are not signature-checked here, so they must
    // never register one (ADR-0042: no server keys in the registry).
    if (details.signer === "server" && hasOwn(details, "signer_pubkey")) {
      return failure(i, i, "server_key_registration", "A server-signed entry cannot register a signer key.", payloadRemoved, serverIndexes);
    }
    if (hasOwn(details, "signer_pubkey")) {
      const keyId = details.signer_key_id;
      const existing = keys.get(keyId);
      if (existing && (existing.pubkey !== details.signer_pubkey || existing.actor_id !== entry.actor_id)) {
        return failure(i, i, "key_conflict", "A signer key ID was registered with a different key or actor.", payloadRemoved, serverIndexes);
      }
      let publicKey;
      try {
        if (typeof keyId !== "string" || keyId.length === 0) throw new Error("signer_key_id is missing");
        const spki = decodeBase64(details.signer_pubkey, "signer_pubkey");
        publicKey = await globalThis.crypto.subtle.importKey(
          "spki", spki, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"],
        );
      } catch (error) {
        return failure(i, i, "signature_invalid", `The registered P-256 public key is invalid: ${error.message}`, payloadRemoved, serverIndexes);
      }
      if (!existing) keys.set(keyId, { pubkey: details.signer_pubkey, actor_id: entry.actor_id, key: publicKey });
    }

    if (details.signer === "server") {
      if (serverKey === null) {
        serverIndexes.push(i);
      } else {
        // T05: the server key comes from the pinned manifest, never the export.
        let statementBytes;
        try {
          statementBytes = canonicalize(statementFor(entry, normalized.subject_id));
        } catch (error) {
          return failure(i, i, "canonical_error", `Signed statement cannot be canonicalised: ${error.message}`, payloadRemoved, serverIndexes);
        }
        let sigBytes;
        try {
          sigBytes = decodeBase64(details.sig, "signature");
        } catch (error) {
          return failure(i, i, "server_signature_invalid", error instanceof Error ? error.message : "The server signature is invalid.", payloadRemoved, serverIndexes);
        }
        const serverSigOk = await globalThis.crypto.subtle.verify("Ed25519", serverKey, sigBytes, statementBytes);
        if (!serverSigOk) {
          return failure(i, i, "server_signature_invalid", "The server signature does not verify against the pinned key-manifest key.", payloadRemoved, serverIndexes);
        }
      }
    } else {
      const keyId = details.signer_key_id;
      const registered = keys.get(keyId);
      if (!registered) return failure(i, i, "unknown_signer_key", "The signer key ID has not been registered in the chain.", payloadRemoved, serverIndexes);
      if (entry.actor_id !== registered.actor_id) {
        return failure(i, i, "actor_mismatch", "The entry actor does not match the actor registered for this key.", payloadRemoved, serverIndexes);
      }
      let statementBytes;
      let signature;
      try {
        statementBytes = canonicalize(statementFor(entry, normalized.subject_id));
      } catch (error) {
        return failure(i, i, "canonical_error", `Signed statement cannot be canonicalised: ${error.message}`, payloadRemoved, serverIndexes);
      }
      try {
        signature = derToRaw(decodeBase64(details.sig, "signature"));
      } catch (error) {
        return failure(i, i, "bad_der", `The DER signature is invalid: ${error.message}`, payloadRemoved, serverIndexes);
      }
      let valid = false;
      try {
        valid = await globalThis.crypto.subtle.verify(
          { name: "ECDSA", hash: "SHA-256" }, registered.key, signature, statementBytes,
        );
      } catch {
        valid = false;
      }
      if (!valid) return failure(i, i, "signature_invalid", "The signature does not verify for the signed event statement.", payloadRemoved, serverIndexes);
    }

    if (typeof details.signer_key_id !== "string" || details.signer_key_id.length === 0 ||
        !Number.isSafeInteger(details.counter)) {
      return failure(i, i, "bad_shape", "signer_key_id and a safe integer counter are required.", payloadRemoved, serverIndexes);
    }
    const counterKey = details.signer_key_id;
    let seenCounters = counters.get(counterKey);
    if (!seenCounters) {
      seenCounters = new Set();
      counters.set(counterKey, seenCounters);
    }
    if (seenCounters.has(details.counter)) {
      return failure(i, i, "counter_replay", "This signer key has already used the counter value.", payloadRemoved, serverIndexes);
    }
    seenCounters.add(details.counter);
  }

  return result(true, entries.length, null, null, null, payloadRemoved, serverIndexes);
}

/** Head of the chain = the last entry's event_hash (what a 0x01 root message must commit to). */
export function chainHeadHex(exportObj) {
  const entries = exportObj?.entries;
  if (!Array.isArray(entries) || entries.length === 0) return null;
  return entries[entries.length - 1].event_hash;
}
