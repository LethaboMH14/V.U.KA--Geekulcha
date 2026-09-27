// Post-quantum root attestation v1 — a PROPOSED demonstration (docs/QUANTUM-TECH.md).
//
// Browser/Node verifier for anchor/pq.py's hybrid attestation: ML-DSA-65
// (FIPS 204, @noble/post-quantum) AND Ed25519 (WebCrypto), both over the
// spec §5 canonical bytes of a statement that binds the exact 33-byte Hedera
// message. Valid only if both signatures verify AND the statement's message
// bytes equal the mirror node's bytes for that sequence number.
//
// The demonstration keys are not in the pinned key manifest, so a valid
// attestation shows the scheme works end to end; it does not by itself prove
// that VUKA's server issued it. @noble/post-quantum states it "has not been
// independently audited yet" (README, 0.7.1).

import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";
import { canonicalize } from "./canonical.js";

export const CONTEXT = new TextEncoder().encode("vuka-root-attestation-v1");
const FIELDS = ["consensus_timestamp", "kind", "message_hex", "message_type", "network", "seq", "topic", "topic_epoch", "v"];

function checkStatement(st) {
  if (st === null || typeof st !== "object" || Array.isArray(st)) throw new TypeError("statement must be an object");
  const keys = Object.keys(st).sort();
  if (keys.length !== FIELDS.length || keys.some((k, i) => k !== FIELDS[i])) throw new TypeError("statement fields are not exactly the v1 fields");
  if (st.v !== 1 || st.kind !== "vuka_root_attestation" || st.message_type !== 1) throw new TypeError("unsupported statement version, kind or message type");
  for (const k of ["v", "message_type", "topic_epoch", "seq"]) if (!Number.isSafeInteger(st[k])) throw new TypeError(`${k} must be an integer`);
  for (const k of ["topic_epoch", "seq"]) if (st[k] < 0) throw new TypeError(`${k} must be a non-negative integer`);
  if (typeof st.network !== "string" || st.network.length === 0) throw new TypeError("network must be a non-empty string");
  if (typeof st.topic !== "string" || !/^\d+\.\d+\.\d+$/.test(st.topic)) throw new TypeError("topic must be shard.realm.num");
  if (typeof st.consensus_timestamp !== "string" || !/^\d+\.\d{9}$/.test(st.consensus_timestamp)) throw new TypeError("consensus_timestamp must be seconds.nanoseconds");
  if (typeof st.message_hex !== "string" || !/^01[0-9a-f]{64}$/.test(st.message_hex)) throw new TypeError("message_hex must be 66 lowercase hex characters starting 01");
}

/** The exact bytes both algorithms sign. */
export function statementBytes(st) {
  checkStatement(st);
  return canonicalize(st);
}

const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;
function b64(text, length) {
  // Strict base64 of exactly `length` bytes — the same rule as anchor/pq.py.
  if (typeof text !== "string" || text.length % 4 !== 0 || !B64.test(text)) throw new TypeError("not strict base64");
  const raw = Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  if (raw.length !== length) throw new TypeError("wrong signature length");
  return raw;
}

/** Message bytes from a Hedera mirror-node record, after checking it is the record the statement names. */
export function mirrorMessage(record, st) {
  if (record === null || typeof record !== "object") throw new TypeError("mirror record must be an object");
  if (record.topic_id !== st.topic || record.sequence_number !== st.seq || record.consensus_timestamp !== st.consensus_timestamp) {
    throw new TypeError("mirror record is not the one the statement names");
  }
  return b64(record.message, 33);
}

/**
 * @returns {Promise<string|null>} null if valid, otherwise the first reason it is not.
 */
export async function verifyRootAttestation(attestation, { ed25519Public, mlDsa65Public, mirrorRecord }) {
  const keys = attestation && typeof attestation === "object" ? Object.keys(attestation).sort().join(",") : "";
  if (keys !== "sig_ed25519,sig_ml_dsa_65,statement") return "attestation fields are not exactly statement, sig_ed25519, sig_ml_dsa_65";
  let signed;
  try {
    signed = statementBytes(attestation.statement);
  } catch (error) {
    return `statement: ${error.message}`;
  }
  let mirrored;
  try {
    mirrored = mirrorMessage(mirrorRecord, attestation.statement);
  } catch (error) {
    return error.message;
  }
  if (attestation.statement.message_hex !== hex(mirrored)) return "message bytes differ from the mirror node's message";
  let sigEd, sigPq;
  try {
    sigEd = b64(attestation.sig_ed25519, 64);
    sigPq = b64(attestation.sig_ml_dsa_65, 3309);
  } catch {
    return "signatures must be strict base64 of the right length";
  }
  let edOk = false;
  try {
    const key = await globalThis.crypto.subtle.importKey("raw", ed25519Public, { name: "Ed25519" }, false, ["verify"]);
    edOk = await globalThis.crypto.subtle.verify("Ed25519", key, sigEd, signed);
  } catch {
    edOk = false;
  }
  if (!edOk) return "Ed25519 signature does not verify";
  let pqOk = false;
  try {
    pqOk = ml_dsa65.verify(sigPq, signed, mlDsa65Public, { context: CONTEXT });
  } catch {
    pqOk = false;
  }
  if (!pqOk) return "ML-DSA-65 signature does not verify";
  return null;
}
