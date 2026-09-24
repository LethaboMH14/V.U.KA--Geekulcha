// Minimal v2 subject-export verifier (docs/VUKA-2-SPEC.md §§4–5, §4a/ADR-0042).
// No mirror, Merkle receipt, revocation or server-signature verification.
//
// What `ok: true` means, and what it does not: the chain is internally
// consistent (links, hashes, commitments, counters) and every device or
// guardian entry is signed by a key the chain itself registers. It does NOT
// prove the record came from VUKA — anyone can build a self-consistent chain
// with their own keys. That binding needs the pinned anchor and key-manifest
// checks (§6, §10), which verify-min does not run. Hence `assurance`.

import { canonicalize } from "./canonical.js";
import { derToRaw } from "./der.js";

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
 * @returns {Promise<{ ok: boolean, entries_checked: number, first_broken_index: number|null, reason: string|null, detail: string|null, payload_removed: number[], server_signature_not_checked: number[], not_checked: string[] }>}
 */
export async function verifyExport(exportObj) {
  let normalized;
  try {
    normalized = normaliseExport(exportObj);
  } catch (error) {
    return failure(0, null, "bad_shape", error instanceof Error ? error.message : "Export shape is invalid.", [], []);
  }
  const entries = normalized.entries;
  if (!Array.isArray(entries)) return failure(0, null, "bad_shape", "entries must be an array.", [], []);
  if (entries.length === 0) return failure(0, null, "empty_export", "The export contains no entries.", [], []);

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
      serverIndexes.push(i);
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
