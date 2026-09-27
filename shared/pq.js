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
  for (const k of ["topic_epoch", "seq"]) if (!Number.isSafeInteger(st[k]) || st[k] < 0) throw new TypeError(`${k} must be a non-negative integer`);
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
const b64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

/**
 * @returns {Promise<string|null>} null if valid, otherwise the first reason it is not.
 */
export async function verifyRootAttestation(attestation, { ed25519Public, mlDsa65Public, mirrorMessage }) {
  const keys = attestation && typeof attestation === "object" ? Object.keys(attestation).sort().join(",") : "";
  if (keys !== "sig_ed25519,sig_ml_dsa_65,statement") return "attestation fields are not exactly statement, sig_ed25519, sig_ml_dsa_65";
  let signed;
  try {
    signed = statementBytes(attestation.statement);
  } catch (error) {
    return `statement: ${error.message}`;
  }
  if (attestation.statement.message_hex !== hex(mirrorMessage)) return "message bytes differ from the mirror node's message";
  let sigEd, sigPq;
  try {
    sigEd = b64(attestation.sig_ed25519);
    sigPq = b64(attestation.sig_ml_dsa_65);
  } catch {
    return "signatures must be base64";
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
