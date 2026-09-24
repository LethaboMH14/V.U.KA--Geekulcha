// Key-manifest bootstrap (spec §10) — the helpers the verify page and the
// anchor server both need to speak the same manifest language.
//
// Serialization pin (this closes the "remains to be specified" note in
// contracts/keys/README.md): the manifest bytes that get hashed are the
// CANONICAL JSON bytes of the manifest object, exactly as spec §5 defines
// them (shared/canonical.js). The first message for each key epoch is then
// exactly 33 bytes: 0x02 || SHA-256(canonical manifest bytes), published
// before the first 0x01 root message. A key change starts a new topic_epoch
// and republishes 0x02.
import { canonicalize } from "./canonical.js";
import { bytesToHex, hexToBytes } from "./merkle.js";

export { bytesToHex, hexToBytes };

/** SHA-256 over exactly the given bytes. */
export async function sha256(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(digest);
}

/** Canonical JSON bytes of a manifest object (the hashed representation). */
export function canonicalManifestBytes(manifestObject) {
  return canonicalize(manifestObject);
}

/** 0x02 || SHA-256(manifestBytes) — 33 bytes; input must be the canonical bytes. */
export async function manifestMessage(manifestBytes) {
  const digest = await sha256(manifestBytes);
  const message = new Uint8Array(33);
  message[0] = 0x02;
  message.set(digest, 1);
  return message;
}

/**
 * Decode an anchor topic message: { type: 0x01, root } (32-byte Merkle root)
 * or { type: 0x02, manifest_digest } (manifest fingerprint). Rejects anything
 * that is not exactly 33 bytes with a known leading type byte.
 */
export function decodeAnchorMessage(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length !== 33) {
    throw new TypeError("anchor message must be exactly 33 bytes");
  }
  if (bytes[0] === 0x01) return { type: 0x01, root: bytes.slice(1) };
  if (bytes[0] === 0x02) return { type: 0x02, manifest_digest: bytes.slice(1) };
  throw new TypeError(`unknown anchor message type byte 0x${bytes[0].toString(16)}`);
}

/**
 * Import a base64 SPKI public key for verification. algorithm is "Ed25519"
 * (server key, raw 64-byte signatures) or { name: "ECDSA", namedCurve: "P-256" }
 * (device/guardian keys, DER-encoded ECDSA signatures — see shared/der.js).
 */
export async function importSpkiVerifyKey(spkiBase64, algorithm) {
  if (typeof spkiBase64 !== "string" || spkiBase64.length === 0) {
    throw new TypeError("expected a non-empty base64 SPKI string");
  }
  const der = Uint8Array.from(atob(spkiBase64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("spki", der, algorithm, false, ["verify"]);
}

/** Manifest shape check mirroring the contract-v2 KeyManifest schema. */
export function validateManifest(manifestObject) {
  if (manifestObject === null || typeof manifestObject !== "object" || Array.isArray(manifestObject)) {
    throw new TypeError("manifest must be a JSON object");
  }
  const allowed = ["server_ed25519_public_key", "ml_dsa_65_public_key"];
  for (const key of Object.keys(manifestObject)) {
    if (!allowed.includes(key)) throw new TypeError(`unexpected manifest field: ${key}`);
  }
  if (typeof manifestObject.server_ed25519_public_key !== "string" || manifestObject.server_ed25519_public_key.length === 0) {
    throw new TypeError("server_ed25519_public_key is required base64 SPKI");
  }
  if (manifestObject.ml_dsa_65_public_key !== undefined && typeof manifestObject.ml_dsa_65_public_key !== "string") {
    throw new TypeError("ml_dsa_65_public_key must be a base64 string when present");
  }
  return true;
}