// Temporary cross-language check: prints merkle roots for n = 1…8 over
// deterministic 32-byte leaves so it can be diffed against Python hashlib.
// Not part of the test suite.
import { merkleRoot, bytesToHex } from "../merkle.js";

async function sha256(bytes) {
  return new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
}

const leaf = async (i) => {
  // Mirrors the Python side: leaf_i = SHA-256(utf8("head-" + i))
  return sha256(new TextEncoder().encode(`head-${i}`));
};

const out = {};
for (let n = 1; n <= 8; n++) {
  const leaves = [];
  for (let i = 0; i < n; i++) leaves.push(await leaf(i));
  leaves.sort((a, b) => (bytesToHex(a) < bytesToHex(b) ? -1 : 1));
  out[`n${n}`] = bytesToHex(await merkleRoot(leaves));
}
console.log(JSON.stringify(out, null, 2));