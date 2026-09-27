// Writes contracts/vectors/pq-js.json: JS-side test vectors for the PQ demonstration,
// for Python to check (anchor/tests/test_pq.py). TEST-ONLY keys derived from the same
// public labels as scripts/gen-pq-vectors.py; no secret is stored.
// Run from shared/: node scripts/gen-pq-js-vectors.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createHash, webcrypto } from "node:crypto";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";
import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";
import { CONTEXT, statementBytes } from "../pq.js";

const root = new URL("../../", import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), "utf8"));
const py = read("contracts/vectors/pq.json");

function seed(label, n) {
  let out = Buffer.alloc(0);
  for (let i = 0; out.length < n; i++) out = Buffer.concat([out, createHash("sha256").update(`${label}/${i}`).digest()]);
  return new Uint8Array(out.subarray(0, n));
}
const hex = (b) => Buffer.from(b).toString("hex");

const dsa = ml_dsa65.keygen(seed(py.labels.ml_dsa_65, 32));
const edSeed = seed(py.labels.ed25519, 32);
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(edSeed)]);
const edKey = await webcrypto.subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, false, ["sign"]);
const kem = ml_kem768.keygen(seed(py.labels.ml_kem_768, 64));

const statement = py.attestation.statement;
const signed = statementBytes(statement);
const attestation = {
  statement,
  sig_ed25519: Buffer.from(await webcrypto.subtle.sign("Ed25519", edKey, signed)).toString("base64"),
  sig_ml_dsa_65: Buffer.from(ml_dsa65.sign(signed, dsa.secretKey, { context: CONTEXT })).toString("base64"),
};
const enc = ml_kem768.encapsulate(kem.publicKey);
const out = {
  _note: "TEST-ONLY keys derived from the public labels in pq.json. Never use these keys for anything real.",
  ml_dsa_65_public_hex: hex(dsa.publicKey),
  ml_kem_768_public_hex: hex(kem.publicKey),
  attestation,
  ml_kem_768_js_encapsulation: { ciphertext_hex: hex(enc.cipherText), ss_sha256: createHash("sha256").update(enc.sharedSecret).digest("hex") },
};
writeFileSync(new URL("contracts/vectors/pq-js.json", root), JSON.stringify(out, null, 2) + "\n");
console.log("wrote contracts/vectors/pq-js.json");
