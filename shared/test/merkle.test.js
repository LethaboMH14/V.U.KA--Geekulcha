// T02 (JS side) — shared/merkle.js against docs/VUKA-2-SPEC.md §6 (RFC 6962).
// An independent straight-from-the-definition reference (recursive, slices)
// cross-checks every root and path, so a split-point or concat bug in the
// module cannot pass. Sibusiso's vector file is the binding check once it
// lands (see vectors.test.js).
import { describe, expect, it } from "vitest";
import {
  MerkleError,
  auditPath,
  bytesToHex,
  hexToBytes,
  leafHash,
  merkleRoot,
  nodeHash,
  recomputeRoot,
  splitPoint,
} from "../merkle.js";

async function sha256(bytes) {
  return new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
}

const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

const head = async (i) => sha256(new TextEncoder().encode(`vuka-chain-head-${i}`));

// Independent RFC 6962 MTH over already-ordered leaf hashes (not the module's
// index-window recursion — deliberately written differently).
const referenceRoot = async (leaves) => {
  if (leaves.length === 1) return sha256(concat([0x00], leaves[0]));
  let k = 1;
  while (k * 2 < leaves.length) k *= 2;
  return sha256(
    concat([0x01], await referenceRoot(leaves.slice(0, k)), await referenceRoot(leaves.slice(k))),
  );
};

const heads = async (n) => {
  const list = [];
  for (let i = 0; i < n; i++) list.push(await head(i));
  return list.sort((a, b) => bytesToHex(a) < bytesToHex(b) ? -1 : 1);
};

describe("splitPoint — largest power of two strictly less than n (§6)", () => {
  it("matches the §6 table for n = 2…8", () => {
    expect([2, 3, 4, 5, 6, 7, 8].map(splitPoint)).toEqual([1, 2, 2, 4, 4, 4, 4]);
  });
});

describe("merkleRoot", () => {
  it("equals the independent RFC 6962 reference for n = 1…8", async () => {
    for (let n = 1; n <= 8; n++) {
      const leaves = await heads(n);
      expect(bytesToHex(await merkleRoot(leaves))).toBe(
        bytesToHex(await referenceRoot(leaves)),
      );
    }
  });

  it("for n = 1 the root is the leaf hash", async () => {
    const leaves = await heads(1);
    expect(bytesToHex(await merkleRoot(leaves))).toBe(bytesToHex(await leafHash(leaves[0])));
  });

  it("rejects n = 0, unsorted leaves, duplicates and wrong leaf sizes", async () => {
    await expect(merkleRoot([])).rejects.toThrow(MerkleError);
    const unsorted = [await head(1), await head(0)];
    await expect(merkleRoot(unsorted)).rejects.toThrow(MerkleError);
    const dup = [await head(0), await head(0)];
    await expect(merkleRoot(dup)).rejects.toThrow(MerkleError);
    await expect(merkleRoot([new Uint8Array(31)])).rejects.toThrow(MerkleError);
    await expect(merkleRoot("not-an-array")).rejects.toThrow(MerkleError);
  });

  it("distinguishes the leaf and node domain separators", async () => {
    const [a, b] = await heads(2);
    expect(bytesToHex(await leafHash(a))).not.toBe(bytesToHex(await nodeHash(a, a)));
    expect(bytesToHex(await nodeHash(a, b))).not.toBe(
      bytesToHex(await sha256(concat(a, b))),
    );
  });
});
describe("audit paths — every index of every n = 1…8 verifies", () => {
  it("recomputes the exact root from leaf to root", async () => {
    for (let n = 1; n <= 8; n++) {
      const leaves = await heads(n);
      const root = bytesToHex(await merkleRoot(leaves));
      for (let i = 0; i < n; i++) {
        const path = await auditPath(leaves, i);
        const recomputed = bytesToHex(await recomputeRoot(leaves[i], path));
        expect(recomputed, `n=${n} index=${i}`).toBe(root);
      }
    }
  });

  it("has the position-dependent RFC 6962 path length", async () => {
    // Path length depends on the leaf's position, not just n: for n = 3 the
    // leaf alone in the right subtree has a one-step path. This counts the
    // recursion directly.
    const expectedLength = (n, i) => {
      if (n === 1) return 0;
      let k = 1;
      while (k * 2 < n) k *= 2;
      return 1 + (i < k ? expectedLength(k, i) : expectedLength(n - k, i - k));
    };
    for (let n = 1; n <= 8; n++) {
      const leaves = await heads(n);
      for (let i = 0; i < n; i++) {
        expect((await auditPath(leaves, i)).length, `n=${n} index=${i}`).toBe(
          expectedLength(n, i),
        );
      }
    }
  });

  it("orders steps leaf-first with the sibling side recorded", async () => {
    const leaves = await heads(4);
    const path = await auditPath(leaves, 0);
    expect(path).toEqual([
      { side: "R", hash: bytesToHex(await leafHash(leaves[1])) },
      { side: "R", hash: bytesToHex(await merkleRoot(leaves.slice(2))) },
    ]);
  });

  it("catches tampering: a flipped bit, a wrong side or a wrong head fails", async () => {
    const leaves = await heads(8);
    const root = bytesToHex(await merkleRoot(leaves));
    for (let i = 0; i < 8; i++) {
      const path = await auditPath(leaves, i);
      const flipped = path.map((s, j) =>
        j === path.length - 1
          ? { ...s, hash: s.hash.slice(0, -1) + (s.hash.endsWith("0") ? "1" : "0") }
          : s,
      );
      expect(bytesToHex(await recomputeRoot(leaves[i], flipped)), `n=8 i=${i}`).not.toBe(root);
      if (path.length > 0) {
        const wrongSide = [{ ...path[0], side: path[0].side === "L" ? "R" : "L" }, ...path.slice(1)];
        expect(bytesToHex(await recomputeRoot(leaves[i], wrongSide))).not.toBe(root);
      }
    }
    const otherIndex = await auditPath(leaves, 6);
    expect(bytesToHex(await recomputeRoot(leaves[0], otherIndex))).not.toBe(root);
  });

  it("rejects out-of-range indexes and malformed steps", async () => {
    const leaves = await heads(4);
    await expect(auditPath(leaves, 4)).rejects.toThrow(MerkleError);
    await expect(auditPath(leaves, -1)).rejects.toThrow(MerkleError);
    await expect(recomputeRoot(leaves[0], [{ side: "X", hash: "00" }])).rejects.toThrow(MerkleError);
  });
});

describe("hex helpers", () => {
  it("round-trip", () => {
    const bytes = new Uint8Array([0x00, 0x01, 0xfe, 0xff]);
    expect(bytesToHex(bytes)).toBe("0001feff");
    expect(bytesToHex(hexToBytes("0001feff"))).toBe("0001feff");
    expect(() => hexToBytes("abc")).toThrow(MerkleError);
    expect(() => hexToBytes("zz")).toThrow(MerkleError);
  });
});