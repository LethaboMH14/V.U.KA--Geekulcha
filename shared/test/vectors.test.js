// T01/T02 vector harness — contracts/vectors/ is Sibusiso's P3.S1 drop
// (canonical.json + merkle.json, landed 24 Sep 2026 on
// feat/sibusiso-contract-v2). Until the files exist in a checkout these suites
// report a skip with the reason, so a green run is never confused with a green
// check. When the files exist, every positive vector must match byte for byte,
// every rejection vector must fail in both languages (spec §5 rule 6, §6), and
// every recorded audit path must recompute the same root.
//
// Shapes as actually delivered (keep this harness in sync with them):
//   canonical.json = { "golden":     [{ "name", "input": <object>, "bytes": hex,
//                                      "sha256": hex }],
//                      "rejections": [{ "name", "json": <JSON text>, "error" }] }
//   merkle.json    = { "vectors":    [ { "n": 1…8, "heads_hex": [hex…],
//                                      "root_hex": hex,
//                                      "entries": [{ "index", "head_hex",
//                                                    "proof": [{ "side": "L"|"R",
//                                                                "hash": hex }] }] },
//                                    { "n": 0, "heads": [], "rejection": true,
//                                      "error": "…" } ] }
// If the files' shapes change, update this harness in the same PR — it fails
// loudly with that instruction rather than guessing.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CanonicalisationError,
  canonicalJson,
  canonicalize,
  canonicalizeJson,
} from "../canonical.js";
import {
  MerkleError,
  auditPath,
  bytesToHex,
  hexToBytes,
  merkleRoot,
  recomputeRoot,
} from "../merkle.js";

const vectorsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "contracts", "vectors");
const canonicalPath = join(vectorsDir, "canonical.json");
const merklePath = join(vectorsDir, "merkle.json");

const hasCanonical = existsSync(canonicalPath);
const hasMerkle = existsSync(merklePath);

describe.skipIf(!hasCanonical)(
  "T01 — contracts/vectors/canonical.json",
  () => {
  // Read lazily: the describe factory runs even when the suite is skipped.
  const read = () => JSON.parse(readFileSync(canonicalPath, "utf8"));

  it("matches every golden vector byte for byte", () => {
    const vectors = read();
    const golden = vectors.golden;
    expect(Array.isArray(golden), "canonical.json needs a golden array").toBe(true);
    for (const vector of golden) {
      const name = vector.name ?? "(unnamed)";
      // `input` is the vector's value; canonicalize() gives the exact UTF-8
      // bytes (canonicalJson gives the text), and it refuses whatever the
      // canonical form refuses, so a malformed golden vector is caught here.
      const bytes = canonicalize(vector.input);
      expect(bytesToHex(bytes), `golden vector ${name} bytes`).toBe(vector.bytes.toLowerCase());
      // Cross-check the vector's own digest — a mismatch indicts the vector,
      // not the implementation.
      expect(createHash("sha256").update(bytes).digest("hex"), `golden vector ${name} sha256`).toBe(
        vector.sha256.toLowerCase(),
      );
    }
  });

  it("fails every rejection vector", () => {
    const vectors = read();
    const rejections = vectors.rejections;
    expect(Array.isArray(rejections), "canonical.json needs a rejections array").toBe(true);
    for (const vector of rejections) {
      const name = vector.name ?? "(unnamed rejection)";
      if (typeof vector.json === "string") {
        // The string entry point. A duplicate key must be refused by the
        // parser itself — JSON.parse keeps the last duplicate silently — and
        // a float in text form (0.5, 1e2) and ±2^53 likewise.
        expect(() => canonicalizeJson(vector.json), `rejection vector ${name}`).toThrow(
          CanonicalisationError,
        );
      } else {
        expect(
          vector.value === undefined,
          `rejection vector ${name} needs a "json" or a "value" field`,
        ).toBe(false);
        expect(() => canonicalJson(vector.value), `rejection vector ${name}`).toThrow(
          CanonicalisationError,
        );
      }
    }
  });
});

describe.skipIf(!hasMerkle)(
  "T02 — contracts/vectors/merkle.json",
  () => {
  const read = () => JSON.parse(readFileSync(merklePath, "utf8"));

  it("recomputes every tree root for n = 1…8", async () => {
    const vectors = read();
    const positives = vectors.vectors.filter((v) => v.rejection !== true);
    expect(
      positives.length,
      "merkle.json needs positive vectors for n = 1…8",
    ).toBeGreaterThanOrEqual(8);
    for (const vector of positives) {
      const leaves = vector.heads_hex.map(hexToBytes);
      const name = vector.name ?? `(n=${leaves.length})`;
      expect(bytesToHex(await merkleRoot(leaves)), `merkle vector ${name}`).toBe(
        vector.root_hex.toLowerCase(),
      );
    }
  });

  it("verifies every recorded audit path against the same root", async () => {
    const vectors = read();
    for (const vector of vectors.vectors) {
      if (vector.rejection === true) continue;
      const leaves = vector.heads_hex.map(hexToBytes);
      const name = vector.name ?? `(n=${leaves.length})`;
      expect(Array.isArray(vector.entries), `merkle vector ${name} entries`).toBe(true);
      for (const entry of vector.entries) {
        // The path this module produces must equal the recorded proof —
        // sides and hashes, leaf → root, siblings on the recorded side.
        const produced = await auditPath(leaves, entry.index);
        expect(produced, `audit path ${name}[${entry.index}]`).toEqual(
          entry.proof.map((step) => ({ side: step.side, hash: step.hash.toLowerCase() })),
        );
        // And the recorded proof alone must recompute the recorded root.
        const recomputed = bytesToHex(await recomputeRoot(leaves[entry.index], entry.proof));
        expect(recomputed, `recomputed root ${name}[${entry.index}]`).toBe(
          vector.root_hex.toLowerCase(),
        );
      }
    }
  });

  it("rejects n = 0 and every other listed rejection", async () => {
    const vectors = read();
    const rejections = vectors.vectors.filter((v) => v.rejection === true);
    expect(rejections.length, "merkle.json needs its n = 0 rejection").toBeGreaterThanOrEqual(1);
    for (const vector of rejections) {
      const leaves = Array.isArray(vector.heads_hex) ? vector.heads_hex.map(hexToBytes) : [];
      await expect(merkleRoot(leaves), `merkle rejection ${vector.error ?? ""}`).rejects.toThrow(
        MerkleError,
      );
    }
  });
});