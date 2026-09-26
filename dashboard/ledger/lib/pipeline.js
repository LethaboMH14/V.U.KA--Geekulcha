// dashboard/ledger/lib/pipeline.js — verification as a stream of trace steps
// (CONTRACT.md). The authoritative chain verdict is shared/verify.js
// verifyExport; this module ALSO recomputes each entry's values with
// shared/canonical.js + WebCrypto so the terminal can show the real bytes and
// hashes, then walks head → leaf → audit path → root → ledger message (spec §6
// B2, §10). Every hash, canonical form and Merkle step comes from shared/*.js.

import { canonicalize } from "../../../shared/canonical.js";
import { sha256 } from "../../../shared/keys.js";
import { bytesToHex, hexToBytes, leafHash, nodeHash } from "../../../shared/merkle.js";
import { chainHeadHex, normaliseExport, verifyExport } from "../../../shared/verify.js";

const ZERO_HASH = "0".repeat(64);
const HASH_RE = /^[0-9a-f]{64}$/;

const NOT_ANCHORED =
  "This record's latest fingerprint hasn't been anchored yet; anchoring runs at least hourly.";
const NO_MESSAGE =
  "The ledger message for this anchor could not be read from the public mirror, so the root cannot be compared.";

const COALESCE_NOTE =
  "Duress signal. On the public ledger it is indistinguishable from a normal " +
  "check-in: PIN-gated outcomes are anchored as immediate roots coalesced into at " +
  "most one per 60 s window (spec §10), so the topic shows only that some " +
  "PIN-gated event happened in that minute.";

/**
 * Accept whatever the VIGIL app shares and return the export object:
 * the raw export JSON, {"format":"vuka-export-v2","export":{…}} or
 * {"vuka_export":{…}} — as JSON text or an already-parsed object.
 * Throws an Error with a plain sentence for anything else.
 */
export function exportFromShare(input) {
  let value = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (text.length === 0) throw new Error("Nothing was pasted.");
    try {
      value = JSON.parse(text);
    } catch {
      throw new Error("That is not JSON. Paste the export exactly as the VIGIL app shared it.");
    }
  }
  const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  if (!isObject(value)) throw new Error("That is not a VIGIL export: expected a JSON object.");
  if (value.format !== undefined || value.export !== undefined) {
    if (value.format !== "vuka-export-v2") {
      throw new Error(`This share is in format ${JSON.stringify(value.format ?? null)}; only vuka-export-v2 is supported.`);
    }
    value = value.export;
  } else if (value.vuka_export !== undefined) {
    value = value.vuka_export;
  }
  if (!isObject(value) || typeof value.subject_id !== "string" || !Array.isArray(value.entries)) {
    throw new Error("That is not a VIGIL export: it needs a subject_id and a list of entries.");
  }
  return value;
}

function decodeBase64(text) {
  if (typeof text !== "string") return null;
  try {
    return Uint8Array.from(globalThis.atob(text), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

function concat(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function withoutEventHash(entry) {
  const copy = {};
  for (const key of Object.keys(entry)) if (key !== "event_hash") copy[key] = entry[key];
  return copy;
}

function isDuress(payload) {
  if (payload === null || typeof payload !== "object") return false;
  return (
    (payload.kind === "checkin_result" && payload.result === "duress_pin") ||
    (payload.kind === "pin_authorised" && payload.mode === "duress") ||
    (payload.kind === "answered_late" && payload.result === "duress_pin")
  );
}

function short(hex) {
  return typeof hex === "string" && hex.length > 16 ? `${hex.slice(0, 8)}…${hex.slice(-8)}` : String(hex);
}

function messageBytes(msg) {
  if (msg?.bytes instanceof Uint8Array) return msg.bytes;
  if (typeof msg?.bytesHex === "string") {
    try {
      return hexToBytes(msg.bytesHex);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * @param {unknown} exportObj a format-v2 subject export
 * @param {{pins: object, manifest: object, proof?: {path: Array<{side:'L'|'R', hash:string}>, receipt?: object}|null,
 *          ledgerMessage?: object|null, archived?: boolean}} options
 * @yields {{phase:string, label:string, detail?:string, value?:string, ok:boolean|null, entry?:number, kind?:string}}
 * @returns {Promise<{state:'live-verified'|'archived'|'unavailable'|'failed', head:string|null, root:string|null,
 *          leaf:string|null, entries:number, firstBroken:number|null, reason:string|null, receipt:object|null}>}
 */
export async function* verifyTrace(exportObj, {
  pins = null,
  manifest = null,
  proof = null,
  ledgerMessage = null,
  archived = false,
} = {}) {
  const out = {
    state: "failed",
    head: null,
    root: null,
    leaf: null,
    entries: 0,
    firstBroken: null,
    reason: null,
    receipt: proof?.receipt ?? null,
  };
  const sample = Boolean(
    pins?.sample || manifest?.sample || ledgerMessage?.sample || proof?.receipt?.sample || exportObj?.sample,
  );

  async function* fail(phase, label, reason, { entry, detail } = {}) {
    out.state = "failed";
    out.reason = reason;
    if (entry !== undefined) out.firstBroken = entry;
    yield {
      phase: "verdict",
      label: "Verdict: failed",
      detail: entry !== undefined ? `First broken entry #${entry}: ${reason}` : reason,
      value: "failed",
      ok: false,
    };
    return out;
  }

  // ---- parse ---------------------------------------------------------------
  let normal;
  try {
    normal = normaliseExport(exportObj);
    if (!Array.isArray(normal.entries) || normal.entries.length === 0) {
      throw new Error("The export has no entries.");
    }
  } catch (error) {
    yield { phase: "parse", label: "Read export", detail: error.message, ok: false };
    return yield* fail("parse", "Read export", error.message);
  }
  const entries = normal.entries;
  const simulated = normal.subject_id.startsWith("sim_");
  out.entries = entries.length;
  yield {
    phase: "parse",
    label: `Read export · ${entries.length} entries`,
    detail: simulated
      ? `Simulated subject ${normal.subject_id}; payload kinds are shown.`
      : "Real subject; payloads are hidden and only commitments are shown.",
    value: simulated ? normal.subject_id : "(subject hidden)",
    ok: true,
  };

  // Pinned key manifest (§10): its fingerprint must equal the pinned one, and
  // the server key used below comes only from it (T05), never from the export.
  // When either pinned file is supplied, both must be complete: a missing or
  // key-less manifest, or pins without a fingerprint, must never quietly skip
  // the server-signature check and still reach live-verified.
  let verifyPins = null;
  if (pins || manifest) {
    const complete = pins && typeof pins === "object" && manifest && typeof manifest === "object" &&
      typeof manifest.server_ed25519_public_key === "string" && typeof pins.manifest_fingerprint_hex === "string";
    if (!complete) {
      const why = "The pinned key files are incomplete (manifest key or pinned fingerprint missing), so server signatures cannot be checked.";
      yield { phase: "parse", label: "Check key-manifest fingerprint", detail: why, ok: false };
      return yield* fail("parse", "manifest", why);
    }
    const fingerprint = bytesToHex(await sha256(canonicalize(manifest)));
    const ok = fingerprint === pins.manifest_fingerprint_hex;
    yield {
      phase: "parse",
      label: `Check key-manifest fingerprint${sample ? " (SAMPLE manifest)" : ""}`,
      detail: ok
        ? "SHA-256 of the canonical manifest equals the pinned fingerprint."
        : `Pinned ${short(pins.manifest_fingerprint_hex)}, manifest hashes to ${short(fingerprint)}.`,
      value: fingerprint,
      ok,
    };
    if (!ok) return yield* fail("parse", "manifest", "The key manifest does not match the pinned fingerprint.");
    verifyPins = {
      server_ed25519_public_key: manifest.server_ed25519_public_key,
      network: pins.network,
      topic_id: pins.topic_id,
      topic_epoch: pins.topic_epoch,
    };
  } else {
    yield {
      phase: "parse",
      label: "No pinned key manifest",
      detail: "Server signatures cannot be checked without the pinned manifest.",
      ok: null,
    };
  }

  // Authoritative verdict for the chain (links, hashes, commitments, keys,
  // signatures, counters). The per-entry steps below show the same checks'
  // values; the verdict never rests on the local recomputation alone.
  const verdict = await verifyExport(exportObj, verifyPins);
  if (!verdict.ok && verdict.first_broken_index === null) {
    yield { phase: "parse", label: "Verify export", detail: verdict.detail ?? verdict.reason, ok: false };
    return yield* fail("parse", "export", verdict.reason);
  }

  // ---- per-entry recomputation ----------------------------------------------
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const details = entry?.details ?? {};
    const eventId = details.event_id;
    const hasPayload = normal.payloads.has(eventId);
    const payload = hasPayload ? normal.payloads.get(eventId) : undefined;
    const kind = simulated && payload && typeof payload.kind === "string" ? payload.kind : undefined;
    const duress = simulated && isDuress(payload);
    const tag = (step) => (kind ? { ...step, entry: i, kind } : { ...step, entry: i });
    let brokenHere = false;

    // canonical payload bytes
    let payloadBytes = null;
    if (hasPayload) {
      try {
        payloadBytes = canonicalize(payload);
      } catch (error) {
        brokenHere = true;
        yield tag({ phase: "canonical", label: `Canonicalise payload #${i}`, detail: error.message, ok: false });
      }
    }
    if (!brokenHere) {
      if (!hasPayload) {
        yield tag({ phase: "canonical", label: `Payload #${i}`, detail: "payload removed from export (commitment only)", ok: null });
      } else if (!simulated) {
        yield tag({ phase: "canonical", label: `Payload #${i}`, detail: "payload hidden (commitment only)", ok: null });
      } else {
        yield tag({
          phase: "canonical",
          label: `Canonicalise payload #${i} · ${kind ?? "?"}${duress ? " (duress)" : ""}`,
          detail: duress ? COALESCE_NOTE : `${payloadBytes.length} canonical bytes (spec §5).`,
          value: new TextDecoder().decode(payloadBytes),
          ok: null,
        });
      }
    }

    // commitment = SHA-256(salt ‖ canonical(payload))
    if (!brokenHere && hasPayload) {
      const salt = decodeBase64(normal.salts.get(eventId));
      if (salt === null || salt.length !== 16) {
        brokenHere = true;
        yield tag({ phase: "commitment", label: `Recompute commitment #${i}`, detail: "The salt is not 16 base64 bytes.", ok: false });
      } else {
        const commitment = bytesToHex(await sha256(concat(salt, payloadBytes)));
        const ok = commitment === details.commitment;
        if (!ok) brokenHere = true;
        yield tag({
          phase: "commitment",
          label: `Recompute commitment #${i}`,
          detail: ok
            ? "SHA-256(salt ‖ canonical payload) equals details.commitment."
            : `Entry says ${short(details.commitment)}; payload and salt give ${short(commitment)}.`,
          value: commitment,
          ok,
        });
      }
    }

    // event_hash = SHA-256(canonical(entry without event_hash))
    if (!brokenHere) {
      let eventHash = null;
      try {
        eventHash = bytesToHex(await sha256(canonicalize(withoutEventHash(entry))));
      } catch (error) {
        brokenHere = true;
        yield tag({ phase: "event_hash", label: `Recompute event hash #${i}`, detail: error.message, ok: false });
      }
      if (eventHash !== null) {
        const ok = eventHash === entry.event_hash;
        if (!ok) brokenHere = true;
        yield tag({
          phase: "event_hash",
          label: `Recompute event hash #${i}`,
          detail: ok
            ? "SHA-256 of the canonical entry equals event_hash."
            : `Entry says ${short(entry.event_hash)}; canonical entry hashes to ${short(eventHash)}.`,
          value: eventHash,
          ok,
        });
      }
    }

    // prev link
    if (!brokenHere) {
      const expected = i === 0 ? ZERO_HASH : entries[i - 1]?.event_hash;
      const ok = typeof entry.prev_hash === "string" && entry.prev_hash === expected;
      if (!ok) brokenHere = true;
      yield tag({
        phase: "link",
        label: i === 0 ? "Check genesis link #0" : `Check link #${i} → #${i - 1}`,
        detail: ok
          ? i === 0 ? "prev_hash is 64 zeros (genesis)." : `prev_hash equals the event hash of #${i - 1}.`
          : `prev_hash ${short(entry.prev_hash)} does not equal ${short(expected)}.`,
        value: typeof entry.prev_hash === "string" ? entry.prev_hash : "",
        ok,
      });
    }

    // signature (checked by shared/verify.js; shown here with its outcome)
    const verifyBrokeHere = verdict.first_broken_index === i;
    if (!brokenHere) {
      const signer = typeof details.signer === "string" ? details.signer : "?";
      const serverUnchecked = signer === "server" && verifyPins === null;
      const ok = verifyBrokeHere ? false : serverUnchecked ? null : true;
      const keySource =
        signer === "server"
          ? serverUnchecked
            ? "not checked (no pinned manifest)"
            : sample ? "checked against the SAMPLE manifest key" : "checked against the pinned manifest key"
          : "checked against the key registered in this chain";
      yield tag({
        phase: "signature",
        label: `Check ${signer} signature #${i}`,
        detail: verifyBrokeHere
          ? `${verdict.reason}: ${verdict.detail}`
          : `${signer} key ${details.signer_key_id}, counter ${details.counter}; ${keySource}.`,
        value: typeof details.sig === "string" ? details.sig : "",
        ok,
      });
      if (verifyBrokeHere) brokenHere = true;
    }

    if (brokenHere) {
      const reason = verifyBrokeHere ? verdict.reason : "local_recompute_mismatch";
      return yield* fail("entry", "entry", reason, { entry: i });
    }
  }
  if (!verdict.ok) {
    // verifyExport broke at an index the walk did not reach; stay conservative.
    return yield* fail("parse", "export", verdict.reason, { entry: verdict.first_broken_index });
  }

  // ---- head → leaf → path → root ------------------------------------------
  const head = chainHeadHex(exportObj);
  out.head = head;
  yield {
    phase: "head",
    label: "Chain head",
    detail: `The event hash of the last entry (#${entries.length - 1}) is the leaf the ledger commits to.`,
    value: head,
    ok: HASH_RE.test(head ?? ""),
  };

  // A raw server response names the path `proof`; sources.proof() renames it `path`.
  const path = Array.isArray(proof?.path) ? proof.path : Array.isArray(proof?.proof) ? proof.proof : null;
  if (path === null) {
    out.state = "unavailable";
    out.reason = NOT_ANCHORED;
    yield {
      phase: "verdict",
      label: "Verdict: unavailable",
      detail: `The chain verifies. ${NOT_ANCHORED}`,
      value: "unavailable",
      ok: null,
    };
    return out;
  }

  let current;
  try {
    current = await leafHash(hexToBytes(head));
  } catch (error) {
    return yield* fail("leaf", "leaf", `The head cannot be hashed as a leaf: ${error.message}`);
  }
  out.leaf = bytesToHex(current);
  yield { phase: "leaf", label: "Hash leaf", detail: "leaf = SHA-256(0x00 ‖ head) (RFC 6962).", value: out.leaf, ok: null };

  for (let k = 0; k < path.length; k += 1) {
    const step = path[k];
    let sibling;
    try {
      if (!step || (step.side !== "L" && step.side !== "R")) throw new Error('side must be "L" or "R"');
      sibling = hexToBytes(step.hash);
      current = step.side === "R" ? await nodeHash(current, sibling) : await nodeHash(sibling, current);
    } catch (error) {
      yield { phase: "path", label: `Join sibling ${k + 1}/${path.length}`, detail: error.message, ok: false };
      return yield* fail("path", "path", `Proof step ${k + 1} is malformed: ${error.message}`);
    }
    yield {
      phase: "path",
      label: `Join sibling ${k + 1}/${path.length} (${step.side === "L" ? "left" : "right"})`,
      detail: step.side === "L"
        ? `node = SHA-256(0x01 ‖ ${short(step.hash)} ‖ current)`
        : `node = SHA-256(0x01 ‖ current ‖ ${short(step.hash)})`,
      value: bytesToHex(current),
      ok: null,
    };
  }
  out.root = bytesToHex(current);
  yield { phase: "root", label: "Recomputed root", detail: `${path.length} proof steps from leaf to root.`, value: out.root, ok: null };

  // ---- ledger message ------------------------------------------------------
  if (!ledgerMessage) {
    out.state = "unavailable";
    out.reason = NO_MESSAGE;
    yield {
      phase: "verdict",
      label: "Verdict: unavailable",
      detail: `The proof recomputes a root. ${NO_MESSAGE}`,
      value: "unavailable",
      ok: null,
    };
    return out;
  }

  const bytes = messageBytes(ledgerMessage);
  const typeOk = bytes !== null && bytes.length === 33 && bytes[0] === 0x01;
  yield {
    phase: "ledger",
    label: `Decode ledger message${sample ? " (SAMPLE)" : ""}`,
    detail: typeOk
      ? `33 bytes, type 0x01 (Merkle root), sequence ${ledgerMessage.sequence_number}.`
      : bytes === null
        ? "The message has no bytes."
        : `Expected 33 bytes with type 0x01; got ${bytes.length} bytes, type 0x${(bytes[0] ?? 0).toString(16).padStart(2, "0")}.`,
    value: bytes ? bytesToHex(bytes) : "",
    ok: typeOk,
  };
  if (!typeOk) return yield* fail("ledger", "ledger", "The ledger message is not a 33-byte 0x01 root message.");

  const ledgerRoot = bytesToHex(bytes.subarray(1));
  const rootOk = ledgerRoot === out.root;
  yield {
    phase: "ledger",
    label: "Compare root with ledger bytes",
    detail: rootOk
      ? "The 32 bytes after the type byte equal the recomputed root."
      : `Ledger holds ${short(ledgerRoot)}; the proof recomputes ${short(out.root)}.`,
    value: ledgerRoot,
    ok: rootOk,
  };
  if (!rootOk) return yield* fail("ledger", "ledger", "The recomputed root does not match the ledger message.");

  // Pinned network/topic/epoch (§6 step 5) and the receipt ↔ message binding (§6 step 4).
  // The receipt is required (§6 step 4): without it the consensus timestamp and
  // running hash cannot be bound to the message, so it can never be live.
  const receipt = proof.receipt !== null && typeof proof.receipt === "object" ? proof.receipt : null;
  if (!receipt) {
    yield { phase: "ledger", label: "Check receipt against message", detail: "The proof carries no receipt.", ok: false };
    return yield* fail("ledger", "ledger", "The proof carries no anchor receipt, so the ledger message cannot be bound to it.");
  }
  const topics = [receipt.topic_id, ledgerMessage.topic_id].filter((t) => typeof t === "string");
  const topicOk = Boolean(pins?.topic_id) && typeof receipt.topic_id === "string" &&
    topics.every((t) => t === pins.topic_id) &&
    pins.topic_epoch !== undefined && receipt.topic_epoch === pins.topic_epoch;
  yield {
    phase: "ledger",
    label: "Check pinned topic",
    detail: topicOk
      ? `Topic ${pins.topic_id} on ${pins.network ?? "?"}, epoch ${pins.topic_epoch ?? "?"}, matches the pins.`
      : `Pinned topic ${pins?.topic_id ?? "(none)"}, epoch ${pins?.topic_epoch ?? "(none)"}; the receipt names ` +
        `${String(receipt.topic_id ?? "(none)")}, epoch ${String(receipt.topic_epoch ?? "(none)")}; the message names ${String(ledgerMessage.topic_id ?? "(none)")}.`,
    value: topics[0] ?? "",
    ok: topicOk,
  };
  if (!topicOk) return yield* fail("ledger", "ledger", "The receipt or message is not on the pinned topic and epoch.");

  const fields = ["sequence_number", "consensus_timestamp", "running_hash"];
  const mismatched = fields.filter((f) => ledgerMessage[f] === undefined || ledgerMessage[f] === null || receipt[f] !== ledgerMessage[f]);
  const bindOk = mismatched.length === 0;
  yield {
    phase: "ledger",
    label: "Check receipt against message",
    detail: bindOk
      ? `Sequence ${receipt.sequence_number}, consensus time ${receipt.consensus_timestamp} and running hash agree.`
      : `The receipt and the message disagree on ${mismatched.join(", ")}.`,
    value: String(ledgerMessage.consensus_timestamp ?? ""),
    ok: bindOk,
  };
  if (!bindOk) return yield* fail("ledger", "ledger", `The receipt does not match the message (${mismatched.join(", ")}).`);

  // A SAMPLE or stored copy is never live: it can only be 'archived'.
  const stored = archived || sample;
  out.state = stored ? "archived" : "live-verified";
  yield {
    phase: "verdict",
    label: stored ? "Verdict: archived" : "Verdict: live-verified",
    detail: stored
      ? sample
        ? "SAMPLE data: every check passes, but this is a stored copy made by the sample generator, not a reading of Hedera."
        : "Every check passes against a stored copy of the ledger message (archived — not independent)."
      : "Every check passes against the message read from the public mirror now.",
    value: out.state,
    ok: true,
  };
  return out;
}

/**
 * The "latest anchor" tile: is the server's receipt backed by the mirror's own
 * record on the pinned topic? `message` is sources.message(pins.topic_id, seq):
 * a Msg, or null when the mirror has no message at that sequence (404).
 * Only a 0x01 root at that exact sequence, on the pinned topic, with the same
 * non-empty consensus time and running hash, reads as "ok"; anything missing
 * is "unavailable" and anything contradicting the pins or the mirror "failed".
 * @returns {{state:'ok'|'unavailable'|'failed', label:string, reason:string}}
 */
export function confirmReceipt(receipt, pins, message) {
  const r = receipt !== null && typeof receipt === "object" ? receipt : {};
  if (!pins?.topic_id || pins.topic_epoch === undefined) {
    return { state: "unavailable", label: "Unchecked", reason: "The pins did not load, so the server's receipt was not checked." };
  }
  if (r.topic_id !== pins.topic_id || r.topic_epoch !== pins.topic_epoch) {
    return {
      state: "failed",
      label: "Not pinned topic",
      reason: `The server names topic ${String(r.topic_id ?? "(none)")}, epoch ${String(r.topic_epoch ?? "(none)")}; the pinned topic is ${pins.topic_id}, epoch ${pins.topic_epoch}.`,
    };
  }
  const seq = Number(r.sequence_number);
  const str = (v) => typeof v === "string" && v.length > 0;
  if (!Number.isSafeInteger(seq) || seq < 1 || !str(r.consensus_timestamp) || !str(r.running_hash)) {
    return { state: "failed", label: "Bad receipt", reason: "The server's receipt lacks a valid sequence number, consensus time or running hash." };
  }
  if (!message) {
    return { state: "unavailable", label: "Not on mirror yet", reason: `The mirror has no message #${seq} on the pinned topic yet, so the server's receipt is not confirmed.` };
  }
  const ok = message.kind === "root" &&
    Number(message.sequence_number) === seq &&
    (message.topic_id === null || message.topic_id === undefined || message.topic_id === pins.topic_id) &&
    message.consensus_timestamp === r.consensus_timestamp &&
    message.running_hash === r.running_hash;
  return ok
    ? { state: "ok", label: "On ledger", reason: `The mirror holds a 0x01 root at #${seq} with the same consensus time and running hash.` }
    : { state: "failed", label: "Not on ledger", reason: `The mirror's message #${seq} does not match the server's receipt.` };
}
