// Post-quantum root attestation v1 (PROPOSED demonstration) — JS side.
// Cross-implementation evidence with anchor/tests/test_pq.py: noble and pyca derive
// the same public keys from the same seeds, verify each other's signatures and
// decapsulate each other's ML-KEM ciphertexts. Keys are TEST-ONLY (public labels).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, test } from "vitest";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";
import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";
import { CONTEXT, statementBytes, verifyRootAttestation } from "../pq.js";

const root = new URL("../../", import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), "utf8"));
const PY = read("contracts/vectors/pq.json");
const JS = read("contracts/vectors/pq-js.json");
const MIRROR = read("contracts/vectors/hedera-mirror-0.0.10687280-seq8.json");
const MESSAGE = Uint8Array.from(Buffer.from(MIRROR.message, "base64"));
const fromHex = (h) => Uint8Array.from(Buffer.from(h, "hex"));
const keys = { ed25519Public: fromHex(PY.ed25519_public_hex), mlDsa65Public: fromHex(PY.ml_dsa_65_public_hex), mirrorMessage: MESSAGE };
const clone = (o) => JSON.parse(JSON.stringify(o));
function seed(label, n) {
  let out = Buffer.alloc(0);
  for (let i = 0; out.length < n; i++) out = Buffer.concat([out, createHash("sha256").update(`${label}/${i}`).digest()]);
  return new Uint8Array(out.subarray(0, n));
}

describe("PQ root attestation v1 (demonstration)", () => {
  test("binds the real Hedera testnet root #8 message", () => {
    expect(PY.attestation.statement.message_hex).toBe(Buffer.from(MESSAGE).toString("hex"));
    expect(PY.attestation.statement.seq).toBe(8);
  });

  test("noble derives the same public keys as pyca from the same seeds", () => {
    expect(Buffer.from(ml_dsa65.keygen(seed(PY.labels.ml_dsa_65, 32)).publicKey).toString("hex")).toBe(PY.ml_dsa_65_public_hex);
    expect(Buffer.from(ml_kem768.keygen(seed(PY.labels.ml_kem_768, 64)).publicKey).toString("hex")).toBe(PY.ml_kem_768_public_hex);
  });

  test("the pyca-signed attestation verifies in JS", async () => {
    expect(await verifyRootAttestation(PY.attestation, keys)).toBeNull();
  });

  test("the noble-signed attestation verifies in JS", async () => {
    expect(await verifyRootAttestation(JS.attestation, keys)).toBeNull();
  });

  test("a pyca ML-KEM-768 ciphertext decapsulates in noble to the same secret", () => {
    const kem = ml_kem768.keygen(seed(PY.labels.ml_kem_768, 64));
    const enc = PY.ml_kem_768_py_encapsulation;
    const ss = ml_kem768.decapsulate(fromHex(enc.ciphertext_hex), kem.secretKey);
    expect(createHash("sha256").update(ss).digest("hex")).toBe(enc.ss_sha256);
    const bad = fromHex(enc.ciphertext_hex);
    bad[0] ^= 1;
    expect(createHash("sha256").update(ml_kem768.decapsulate(bad, kem.secretKey)).digest("hex")).not.toBe(enc.ss_sha256);
  });

  test.each([["seq", 7], ["topic_epoch", 2], ["consensus_timestamp", "1790454709.667629105"], ["topic", "0.0.1"]])("altered %s fails", async (field, value) => {
    const att = clone(PY.attestation);
    att.statement[field] = value;
    expect(await verifyRootAttestation(att, keys)).not.toBeNull();
  });

  test("mirror-bytes mismatch fails", async () => {
    const other = new Uint8Array(33);
    other[0] = 1;
    expect(await verifyRootAttestation(PY.attestation, { ...keys, mirrorMessage: other })).toBe("message bytes differ from the mirror node's message");
  });

  test("wrong context, swapped key and truncated signature fail", async () => {
    const dsa = ml_dsa65.keygen(seed(PY.labels.ml_dsa_65, 32));
    const att = clone(PY.attestation);
    att.sig_ml_dsa_65 = Buffer.from(ml_dsa65.sign(statementBytes(att.statement), dsa.secretKey, { context: new TextEncoder().encode("another-context") })).toString("base64");
    expect(await verifyRootAttestation(att, keys)).toBe("ML-DSA-65 signature does not verify");
    const other = ml_dsa65.keygen(new Uint8Array(32)).publicKey;
    expect(await verifyRootAttestation(PY.attestation, { ...keys, mlDsa65Public: other })).toBe("ML-DSA-65 signature does not verify");
    const cut = clone(PY.attestation);
    cut.sig_ml_dsa_65 = Buffer.from(Buffer.from(cut.sig_ml_dsa_65, "base64").subarray(0, 3308)).toString("base64");
    expect(await verifyRootAttestation(cut, keys)).toBe("ML-DSA-65 signature does not verify");
    expect(CONTEXT.length).toBe(24);
  });

  test("each signature alone is not enough", async () => {
    const noPq = clone(PY.attestation);
    noPq.sig_ml_dsa_65 = Buffer.alloc(3309).toString("base64");
    expect(await verifyRootAttestation(noPq, keys)).toBe("ML-DSA-65 signature does not verify");
    const noEd = clone(PY.attestation);
    noEd.sig_ed25519 = Buffer.alloc(64).toString("base64");
    expect(await verifyRootAttestation(noEd, keys)).toBe("Ed25519 signature does not verify");
  });

  test("a manifest-type message and extra fields are refused", async () => {
    const t2 = clone(PY.attestation);
    t2.statement.message_type = 2;
    expect(await verifyRootAttestation(t2, keys)).toMatch(/^statement:/);
    const extra = clone(PY.attestation);
    extra.statement.note = "x";
    expect(await verifyRootAttestation(extra, keys)).toMatch(/^statement:/);
  });
});
