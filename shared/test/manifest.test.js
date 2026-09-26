// Key-manifest bootstrap tests (spec §10) — the manifest file, its pinned
// fingerprint and the 33-byte 0x02 topic message. The fingerprint recipe is
// the one this PR pins: canonical JSON bytes per spec §5.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { canonicalizeJson } from "../canonical.js";
import {
  bytesToHex,
  canonicalManifestBytes,
  decodeAnchorMessage,
  hexToBytes,
  manifestMessage,
  importSpkiVerifyKey,
  sha256,
  validateManifest,
} from "../keys.js";

const keysDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "contracts", "keys");
const manifestText = readFileSync(join(keysDir, "manifest.json"), "utf8");
const pinsText = readFileSync(join(keysDir, "verify-pins.json"), "utf8");

describe("key-manifest bootstrap (§10)", () => {
  const manifest = JSON.parse(manifestText);
  const pins = JSON.parse(pinsText);

  it("manifest.json matches the contract-v2 KeyManifest shape", async () => {
    expect(validateManifest(manifest)).toBe(true);
    // The pinned key must import as an Ed25519 SPKI verify key.
    const key = await importSpkiVerifyKey(manifest.server_ed25519_public_key, "Ed25519");
    expect(key.type).toBe("public");
    expect(key.usages).toContain("verify");
  });

  it("verify-pins.json pins testnet, the spike topic and epoch 1", () => {
    expect(pins.network).toBe("testnet");
    expect(pins.topic_id).toMatch(/^0\.0\.\d+$/);
    expect(pins.topic_epoch).toBe(1);
    expect(typeof pins.manifest_fingerprint_hex).toBe("string");
  });

  it("manifest fingerprint is SHA-256 of the canonical JSON bytes (the pinned serialization)", async () => {
    const bytes = canonicalizeJson(manifestText); // strict parse: no duplicate keys, canonical-safe values
    expect(bytesToHex(bytes)).toBe(bytesToHex(canonicalManifestBytes(manifest)));
    const digest = await sha256(bytes);
    expect(bytesToHex(digest)).toBe(pins.manifest_fingerprint_hex.toLowerCase());
  });

  it("the epoch's first topic message is 0x02 ‖ fingerprint (33 bytes)", async () => {
    const message = await manifestMessage(canonicalManifestBytes(manifest));
    expect(message).toHaveLength(33);
    expect(message[0]).toBe(0x02);
    expect(bytesToHex(message)).toBe(`02${pins.manifest_fingerprint_hex.toLowerCase()}`);
  });

  it("decodeAnchorMessage round-trips 0x01 and 0x02 and rejects anything else", () => {
    const digest = hexToBytes(pins.manifest_fingerprint_hex);
    expect(decodeAnchorMessage(new Uint8Array([0x02, ...digest]))).toEqual({ type: 0x02, manifest_digest: digest });
    const root = new Uint8Array(32).fill(7);
    expect(decodeAnchorMessage(new Uint8Array([0x01, ...root]))).toEqual({ type: 0x01, root });
    expect(() => decodeAnchorMessage(new Uint8Array(32))).toThrow(TypeError);
    expect(() => decodeAnchorMessage(new Uint8Array(34))).toThrow(TypeError);
    expect(() => decodeAnchorMessage(new Uint8Array([0x03, ...new Uint8Array(32)]))).toThrow(TypeError);
  });
});