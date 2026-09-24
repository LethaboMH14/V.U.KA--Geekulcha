// T01/T02 vector harness — contracts/vectors/ is Sibusiso's P3.S1 drop
// (due Thu 24 Sep 09:00). Until the files land these suites report a skip
// with the reason, so a green run is never confused with a green check.
// When the files exist, every positive vector must match byte for byte and
// every rejection vector must fail in both languages (spec §5 rule 6, §6).
//
// Expected shapes (keep in sync with shared/README.md):
//   canonical.json = { "positive":   [{ "name", "json" | "value", "canonical_hex" }],
//                      "rejection":  [{ "name", "json" | "value" }] }
//   merkle.json    = { "roots":      [{ "name", "leaves_hex": [hex…], "root_hex" }],
//                      "rejections": [{ "name", "leaves_hex": [hex…] }] }
// If the real files use different keys, update this harness in the same PR —
// it fails loudly with that instruction rather than guessing.
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CanonicalisationError,
  canonicalJson,
  canonicalizeJson,
} from "../canonical.js";
import {
  MerkleError,
  bytesToHex,
  hexToBytes,
  merkleRoot,
} from "../merkle.js";

const vectorsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "contracts", "vectors");
const canonicalPath = join(vectorsDir, "canonical.json");
const merklePath = join(vectorsDir, "merkle.json");

const hasCanonical = existsSync(canonicalPath);
const hasMerkle = existsSync(merklePath);

// Runs the entry through the right entry point and returns canonical hex,
// or throws — a rejection is anything that throws.
const canonicalHexOf = (entry) => {
  if (typeof entry.json === "string") return bytesToHex(canonicalizeJson(entry.json));
  // canonicalJson(value) returns canonical JSON text, not bytes (unlike
  // canonicalizeJson, which returns Uint8Array directly) — encode to UTF-8
  // to get the same bytes §5 defines. This path was never exercised before
  // (T01 always skipped until now), so the bug was latent, not introduced here.
  return bytesToHex(new TextEncoder().encode(canonicalJson(entry.value)));
};

describe.skipIf(!hasCanonical)(
  "T01 — contracts/vectors/canonical.json (skipped until Sibusiso's P3.S1 drop, due Thu 24 Sep 09:00)",
  () => {
  // Read lazily: the describe factory runs even when the suite is skipped.
  const read = () => JSON.parse(readFileSync(canonicalPath, "utf8"));

  it("matches every golden vector byte for byte", () => {
    const vectors = read();
    // Sibusiso's actual drop uses golden[i] = {input, bytes}, not the
    // positive[i] = {json|value, canonical_hex} shape sketched above —
    // reconciled here per this file's own instruction.
    const positive = vectors.positive ?? vectors.golden;
    expect(Array.isArray(positive), "canonical.json needs a positive/golden array").toBe(true);
    for (const vector of positive) {
      const name = vector.name ?? "(unnamed)";
      const entry = vector.value !== undefined || typeof vector.json === "string"
        ? vector
        : { value: vector.input };
      const actual = canonicalHexOf(entry);
      const expected = (vector.canonical_hex ?? vector.bytes).toLowerCase();
      expect(actual, `golden vector ${name}`).toBe(expected);
    }
  });

  it("fails every rejection vector", () => {
    const vectors = read();
    // Sibusiso's drop uses "rejections" (plural); each entry carries a real
    // "json" field (added alongside the Python input_repr for readability).
    const rejections = vectors.rejection ?? vectors.rejections;
    expect(Array.isArray(rejections), "canonical.json needs a rejection array").toBe(true);
    for (const vector of rejections) {
      const name = vector.name ?? "(unnamed rejection)";
      if (typeof vector.json === "string") {
        expect(() => canonicalizeJson(vector.json), `rejection vector ${name}`).toThrow();
      } else {
        expect(
          vector.value === undefined,
          `rejection vector ${name} needs a "json" or a "value" field`,
        ).toBe(false);
        expect(() => canonicalJson(vector.value), `rejection vector ${name}`).toThrow();
      }
    }
  });
});

describe.skipIf(!hasMerkle)(
  "T02 — contracts/vectors/merkle.json (skipped until Sibusiso's P3.S1 drop, due Thu 24 Sep 09:00)",
  () => {
  const read = () => JSON.parse(readFileSync(merklePath, "utf8"));

  it("recomputes every tree root for n = 1…8", async () => {
    const vectors = read();
    // Sibusiso's actual drop is a flat "vectors" array with {n, heads_hex,
    // root_hex, rejection?} per entry, not separate roots/rejections arrays
    // — reconciled here per this file's own instruction.
    const roots = vectors.roots ?? vectors.positive
      ?? vectors.vectors?.filter((v) => !v.rejection);
    expect(Array.isArray(roots), "merkle.json needs a roots/positive array").toBe(true);
    for (const vector of roots) {
      const leavesHex = vector.leaves_hex ?? vector.heads_hex;
      const leaves = leavesHex.map(hexToBytes);
      const name = vector.name ?? `(n=${leaves.length})`;
      expect(bytesToHex(await merkleRoot(leaves)), `merkle vector ${name}`).toBe(
        vector.root_hex.toLowerCase(),
      );
    }
  });

  it("rejects n = 0 and every other listed rejection", async () => {
    const vectors = read();
    const rejections = vectors.rejections
      ?? vectors.vectors?.filter((v) => v.rejection);
    expect(Array.isArray(rejections), "merkle.json needs a rejections array").toBe(true);
    for (const vector of rejections) {
      // The n=0 rejection vector uses "heads" (already empty, no _hex suffix
      // needed) rather than "heads_hex" like the positive vectors.
      const leavesHex = vector.leaves_hex ?? vector.heads_hex ?? vector.heads;
      const leaves = leavesHex.map(hexToBytes);
      await expect(merkleRoot(leaves), `merkle rejection ${vector.name ?? ""}`).rejects.toThrow(
        MerkleError,
      );
    }
  });
});