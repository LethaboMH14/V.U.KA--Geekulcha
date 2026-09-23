// shared/merkle.js — RFC 6962 trees and audit paths, spec §6.
//
//   leaf = SHA-256(0x00 ‖ raw 32-byte chain head)
//   node = SHA-256(0x01 ‖ left ‖ right)
//   split at the largest power of two strictly less than n (n = 2…8 → 1, 2, 2,
//   4, 4, 4, 4), with no duplication of odd leaves.
//
// Leaves are the raw 32-byte heads of subject chains, ordered by raw head
// bytes ascending (§6); the module refuses unsorted or duplicate input so a
// server bug can never produce a root the Python side disagrees with.
// An empty tree (n = 0) is never anchored and is a rejection vector (§6).
//
// Proof encoding: an ordered list of [{"side": "L"|"R", "hash": hex}] from
// the leaf to the root, where side is the side the SIBLING hash sits on.
//
// SHA-256 comes from WebCrypto (crypto.subtle), available in the browser and
// in Node. Every function is async. Zero dependencies.

/** Raised for any leaf list, path or head this module refuses. */
export class MerkleError extends Error {
  constructor(message) {
    super(message);
    this.name = "MerkleError";
  }
}

const HEAD_LENGTH = 32;

async function sha256(bytes) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(digest);
}

function assertHead(bytes, name) {
  if (!(bytes instanceof Uint8Array)) throw new MerkleError(`${name} must be a Uint8Array`);
  if (bytes.length !== HEAD_LENGTH) {
    throw new MerkleError(`${name} must be a raw 32-byte hash, got ${bytes.length} bytes`);
  }
}

function compareBytes(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

function assertLeafList(leaves) {
  if (!Array.isArray(leaves) || leaves.length === 0) {
    throw new MerkleError("an empty tree is never anchored (n = 0 is a rejection vector)");
  }
  leaves.forEach((leaf, i) => assertHead(leaf, `leaves[${i}]`));
  for (let i = 1; i < leaves.length; i++) {
    if (compareBytes(leaves[i - 1], leaves[i]) >= 0) {
      throw new MerkleError("leaves must be ordered by raw head bytes ascending, without duplicates");
    }
  }
}

function concat(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Largest power of two strictly less than n (spec §6). */
export function splitPoint(n) {
  if (!Number.isInteger(n) || n < 2) {
    throw new MerkleError("splitPoint is defined for n ≥ 2");
  }
  let k = 1;
  while (k * 2 < n) k *= 2;
  return k;
}

/** leaf = SHA-256(0x00 ‖ head). */
export async function leafHash(head) {
  assertHead(head, "head");
  return sha256(concat(new Uint8Array([0x00]), head));
}

/** node = SHA-256(0x01 ‖ left ‖ right). */
export async function nodeHash(left, right) {
  assertHead(left, "left");
  assertHead(right, "right");
  return sha256(concat(new Uint8Array([0x01]), left, right));
}

/**
 * The RFC 6962 Merkle tree head over ordered raw heads.
 * @param {Uint8Array[]} leaves ordered raw 32-byte chain heads
 * @returns {Promise<Uint8Array>} 32-byte root
 */
export async function merkleRoot(leaves) {
  assertLeafList(leaves);
  return subtreeRoot(leaves, 0, leaves.length);
}

async function subtreeRoot(leaves, lo, hi) {
  const n = hi - lo;
  if (n === 1) return leafHash(leaves[lo]);
  const k = splitPoint(n);
  return nodeHash(
    await subtreeRoot(leaves, lo, lo + k),
    await subtreeRoot(leaves, lo + k, hi),
  );
}
/**
 * The audit path for leaves[index], ordered from the leaf to the root.
 * `side` is the side the sibling hash sits on.
 * @param {Uint8Array[]} leaves ordered raw 32-byte chain heads
 * @param {number} index
 * @returns {Promise<Array<{side: "L"|"R", hash: string}>>}
 */
export async function auditPath(leaves, index) {
  assertLeafList(leaves);
  if (!Number.isInteger(index) || index < 0 || index >= leaves.length) {
    throw new MerkleError(`index ${index} out of range for ${leaves.length} leaves`);
  }
  return pathToRoot(leaves, 0, leaves.length, index);
}

async function pathToRoot(leaves, lo, hi, index) {
  const n = hi - lo;
  if (n === 1) return [];
  const k = splitPoint(n);
  if (index - lo < k) {
    const sibling = await subtreeRoot(leaves, lo + k, hi);
    const deeper = await pathToRoot(leaves, lo, lo + k, index);
    return [...deeper, { side: "R", hash: bytesToHex(sibling) }];
  }
  const sibling = await subtreeRoot(leaves, lo, lo + k);
  const deeper = await pathToRoot(leaves, lo + k, hi, index);
  return [...deeper, { side: "L", hash: bytesToHex(sibling) }];
}

/**
 * Recomputes the tree head from one leaf (a raw head) and its audit path.
 * Walks the path leaf → root, joining each sibling on its recorded side.
 * @param {Uint8Array} head raw 32-byte chain head
 * @param {Array<{side: "L"|"R", hash: string}>} path
 * @returns {Promise<Uint8Array>} 32-byte recomputed root
 */
export async function recomputeRoot(head, path) {
  assertHead(head, "head");
  if (!Array.isArray(path)) throw new MerkleError("path must be an array of {side, hash}");
  let current = await leafHash(head);
  for (const step of path) {
    if (!step || (step.side !== "L" && step.side !== "R")) {
      throw new MerkleError('each path step needs side "L" or "R"');
    }
    const sibling = hexToBytes(step.hash);
    assertHead(sibling, "path hash");
    current =
      step.side === "R"
        ? await nodeHash(current, sibling)
        : await nodeHash(sibling, current);
  }
  return current;
}

/** Bytes → lowercase hex (the encoding used in receipts and vectors). */
export function bytesToHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Lowercase (or mixed-case) hex → bytes. */
export function hexToBytes(hex) {
  if (typeof hex !== "string" || hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) {
    throw new MerkleError("not a hex string");
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}