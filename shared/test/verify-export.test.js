// T04/T05 verify-min suite — the canned 8-entry sim_subject export and its
// negative vectors, run against the canonical verifier (main's #69 verify.js
// with the #79 pins additions). The oracle (TEST-SPECS T04): every altered copy
// fails at its first changed or dependent entry and the verifier REPORTS that
// index; the unaltered export passes. T05: server signatures verify only
// against the PINNED key-manifest key — a substituted key is rejected. The
// review adversarial cases (SEC-A key re-registration, SEC-B actor binding) are
// re-signed and re-hashed so only the rule under test can catch the forgery.
import { describe, expect, it } from "vitest";
import { verifyExport, chainHeadHex } from "../verify.js";
import { buildSimSubjectExport, signAndHashEntry, b64 } from "./fixtures.js";

async function freshFixture() {
  const fx = await buildSimSubjectExport();
  const pins = {
    server_ed25519_public_key: fx.keys.serverSpkiB64,
    network: "testnet",
    topic_id: "0.0.10687280",
    topic_epoch: 1,
  };
  return { ...fx, pins };
}

describe("T04 — verifyExport on the canned 8-entry export", () => {
  it("the unaltered export passes end to end", async () => {
    const { subjectExport, pins } = await freshFixture();
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(true);
    expect(result.first_broken_index).toBeNull();
    expect(result.entries_checked).toBe(8);
    expect(result.server_signature_not_checked).toEqual([]);
    expect(result.not_checked).toEqual(["anchor receipts", "Merkle proofs", "key revocation"]);
  });

  it("without pins the verifier stays anchor-agnostic: server entries are recorded, not checked", async () => {
    const { subjectExport } = await freshFixture();
    const result = await verifyExport(subjectExport);
    expect(result.ok).toBe(true);
    expect(result.server_signature_not_checked).toEqual([4, 5, 6, 7]);
    expect(result.not_checked).toContain("server signatures");
    expect(result.assurance).toBe("internal_consistency_only");
  });

  it("chainHeadHex returns the last event_hash", async () => {
    const { subjectExport } = await freshFixture();
    expect(chainHeadHex(subjectExport)).toBe(subjectExport.entries[7].event_hash);
  });

  it("fails at index 3 when that entry's ts is altered", async () => {
    const { subjectExport, pins } = await freshFixture();
    subjectExport.entries[3].ts = "2026-09-25T09:11:11+02:00";
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(3);
    expect(result.reason).toBe("event_hash_mismatch");
  });

  it("fails at index 3 when that entry's committed payload is altered", async () => {
    const { subjectExport, pins, eventIds } = await freshFixture();
    subjectExport.payloads[eventIds[3]].result = "ok";
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(3);
    expect(result.reason).toBe("commitment_mismatch");
  });

  it("fails at index 3 when the prev link is broken", async () => {
    const { subjectExport, pins } = await freshFixture();
    subjectExport.entries[3].prev_hash = "a".repeat(64);
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(3);
    expect(result.reason).toBe("prev_hash_mismatch");
  });

  it("rejects a substituted device key: re-signed genesis passes, the dependent entry fails", async () => {
    const { subjectExport, pins, keys } = await freshFixture();
    // Attacker swaps the registered device key and re-signs genesis consistently.
    const foreign = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const foreignSpki = b64(new Uint8Array(await crypto.subtle.exportKey("spki", foreign.publicKey)));
    subjectExport.entries[0].details.signer_pubkey = foreignSpki;
    await signAndHashEntry(subjectExport.entries[0], subjectExport.subject_id, keys, { devicePrivateKey: foreign.privateKey });
    // The attacker re-links and re-hashes every descendant so prev links stay
    // consistent — but entries 1-3 still carry the ORIGINAL device signatures.
    for (const i of [1, 2, 3]) {
      subjectExport.entries[i].prev_hash = subjectExport.entries[i - 1].event_hash;
      await signAndHashEntry(subjectExport.entries[i], subjectExport.subject_id, keys);
    }
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(1);
    expect(result.reason).toMatch(/signature/);
  });

  it("fails at index 5 when a counter is exactly repeated (§4/§7)", async () => {
    const { subjectExport, pins, keys } = await freshFixture();
    subjectExport.entries[5].details.counter = 1; // server counter 1 already used at index 4
    await signAndHashEntry(subjectExport.entries[5], subjectExport.subject_id, keys);
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(5);
    expect(result.reason).toBe("counter_replay");
  });
});

describe("review fixes — key re-registration (SEC-A) and actor binding (SEC-B)", () => {
  it("rejects a mid-chain entry that re-registers a device key with the attacker's key (SEC-A)", async () => {
    const { subjectExport, pins } = await freshFixture();
    // The compromised-server attack from the review: a forged later entry
    // carries the victim's signer_key_id but the attacker's pubkey, and is
    // signed with the attacker's key. Hashes recomputed so ONLY the
    // key-conflict rule can catch it.
    const attacker = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const attackerSpki = b64(new Uint8Array(await crypto.subtle.exportKey("spki", attacker.publicKey)));
    const forged = subjectExport.entries[2];
    forged.details.signer_pubkey = attackerSpki;
    await signAndHashEntry(forged, subjectExport.subject_id, { device: attacker });
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(2);
    expect(result.reason).toBe("key_conflict");
  });

  it("accepts an identical re-registration (same key, same actor) without conflict", async () => {
    const { subjectExport, pins, keys } = await freshFixture();
    const repeat = subjectExport.entries[3];
    repeat.details.signer_pubkey = subjectExport.entries[0].details.signer_pubkey;
    await signAndHashEntry(repeat, subjectExport.subject_id, keys);
    // Re-link and re-hash the descendants so only the conflict rule is exercised.
    for (let i = 4; i < subjectExport.entries.length; i++) {
      subjectExport.entries[i].prev_hash = subjectExport.entries[i - 1].event_hash;
      await signAndHashEntry(subjectExport.entries[i], subjectExport.subject_id, keys);
    }
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(true);
  });

  it("binds actor_id to the registered key: a validly-signed entry claiming another actor fails (SEC-B)", async () => {
    const { subjectExport, pins, keys } = await freshFixture();
    // Entry 1 keeps the genuine device signature path but claims the
    // guardian's actor id. Re-signed and re-hashed (and descendants re-linked)
    // so ONLY the actor binding can catch the forgery (T21 style).
    const forged = subjectExport.entries[1];
    forged.actor_id = "sim_guardian_01";
    await signAndHashEntry(forged, subjectExport.subject_id, keys);
    for (const i of [2, 3]) {
      subjectExport.entries[i].prev_hash = subjectExport.entries[i - 1].event_hash;
      await signAndHashEntry(subjectExport.entries[i], subjectExport.subject_id, keys);
    }
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(1);
    expect(result.reason).toBe("actor_mismatch");
  });

  it("a pass carries assurance 'internal_consistency_only' — no 'verified' before the mirror checks", async () => {
    const { subjectExport, pins } = await freshFixture();
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(true);
    expect(result.assurance).toBe("internal_consistency_only");
  });
});

describe("T05 — the server key comes from the pinned manifest only", () => {
  it("rejects server entries re-signed with a substituted Ed25519 key", async () => {
    const { subjectExport, pins, keys } = await freshFixture();
    const attacker = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
    for (const i of [4, 5, 6, 7]) {
      await signAndHashEntry(subjectExport.entries[i], subjectExport.subject_id, keys, { serverPrivateKey: attacker.privateKey });
    }
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(4); // first server-signed entry
    expect(result.reason).toBe("server_signature_invalid");
  });

  it("rejects every server entry when the verifier pins a different manifest key", async () => {
    const { subjectExport } = await freshFixture();
    const other = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
    const otherSpki = b64(new Uint8Array(await crypto.subtle.exportKey("spki", other.publicKey)));
    const result = await verifyExport(subjectExport, {
      server_ed25519_public_key: otherSpki,
      network: "testnet",
      topic_id: "0.0.10687280",
      topic_epoch: 1,
    });
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(4);
    expect(result.reason).toBe("server_signature_invalid");
  });

  it("fails the export when a receipt names a different topic than the pins", async () => {
    const { subjectExport, pins } = await freshFixture();
    subjectExport.receipts = [
      { topic_id: "0.0.99999999", sequence_number: 1, consensus_timestamp: "2026-09-25T09:06:00.000Z", running_hash: "aa", topic_epoch: 1 },
    ];
    const result = await verifyExport(subjectExport, pins);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBeNull();
    expect(result.reason).toBe("receipt_topic_mismatch");
  });
});