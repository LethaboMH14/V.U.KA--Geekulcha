import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { canonicalize } from "../canonical.js";
import { rawToDer } from "../der.js";
import { normaliseExport, verifyExport } from "../verify.js";

const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const b64 = (bytes) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return globalThis.btoa(binary);
};
const concat = (a, b) => {
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
};
const digestHex = async (bytes) => hex(new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes)));
const noEventHash = (entry) => Object.fromEntries(Object.entries(entry).filter(([key]) => key !== "event_hash"));

async function keyPair() {
  return globalThis.crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
}

async function publicKeyBase64(pair) {
  return b64(new Uint8Array(await globalThis.crypto.subtle.exportKey("spki", pair.publicKey)));
}

async function signedStatement(entry, subjectId) {
  const d = entry.details;
  return canonicalize({
    domain: "vuka.event.v2",
    subject_id: subjectId,
    actor_id: entry.actor_id,
    target_type: entry.target_type,
    target_id: entry.target_id,
    action: entry.action,
    source_ts: entry.ts,
    signer_key_id: d.signer_key_id,
    counter: d.counter,
    event_id: d.event_id,
    commitment: d.commitment,
  });
}

async function fixture() {
  const subjectId = "subject-sim-001";
  const device = await keyPair();
  const guardian = await keyPair();
  const pairs = { device, guardian };
  const entries = [];
  const payloads = {};
  const salts = {};
  const definitions = [
    { signer: "device", keyId: "device-key-1", actor: "subject-sim-001", action: "registration", pubkey: await publicKeyBase64(device), kind: "registration" },
    { signer: "guardian", keyId: "guardian-key-1", actor: "guardian-sim-001", action: "registration", pubkey: await publicKeyBase64(guardian), kind: "guardian_accept" },
    { signer: "device", keyId: "device-key-1", actor: "subject-sim-001", action: "device_event", kind: "journey_armed" },
    { signer: "device", keyId: "device-key-1", actor: "subject-sim-001", action: "device_event", kind: "checkin_opened" },
    { signer: "server", keyId: "server-key-1", actor: "server-sim", action: "server_event", kind: "guardian_alerted" },
  ];

  for (let i = 0; i < definitions.length; i += 1) {
    const item = definitions[i];
    const eventId = `event-sim-${i}`;
    const payload = { kind: item.kind, event_index: i };
    const salt = Uint8Array.from({ length: 16 }, (_, n) => (i * 17 + n + 1) & 0xff);
    const commitment = await digestHex(concat(salt, canonicalize(payload)));
    payloads[eventId] = payload;
    salts[eventId] = b64(salt);
    const entry = {
      action: item.action,
      actor_id: item.actor,
      target_type: "subject",
      target_id: subjectId,
      details: {
        v: 2,
        signer: item.signer,
        signer_key_id: item.keyId,
        counter: i + 1,
        event_id: eventId,
        commitment,
        ...(item.pubkey ? { signer_pubkey: item.pubkey } : {}),
        chain_index: i,
      },
      ts: `2026-09-24T10:0${i}:00+02:00`,
      prev_hash: i === 0 ? "0".repeat(64) : entries[i - 1].event_hash,
      event_hash: "0".repeat(64),
    };
    if (item.signer !== "server") {
      const sigRaw = new Uint8Array(await globalThis.crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" }, pairs[item.signer].privateKey, await signedStatement(entry, subjectId),
      ));
      entry.details.sig = b64(rawToDer(sigRaw.subarray(0, 32), sigRaw.subarray(32)));
    } else {
      entry.details.sig = "not-checked-by-design";
    }
    entry.event_hash = await digestHex(canonicalize(noEventHash(entry)));
    entries.push(entry);
  }
  return { subject_id: subjectId, entries, payloads, salts };
}

async function rehashAndRelink(exportObj, startIndex = 0) {
  const entries = exportObj.entries;
  for (let i = startIndex; i < entries.length; i += 1) {
    entries[i].prev_hash = i === 0 ? "0".repeat(64) : entries[i - 1].event_hash;
    entries[i].event_hash = await digestHex(canonicalize(noEventHash(entries[i])));
  }
}

describe("verifyExport", () => {
  it("accepts a valid five-entry chain and reports the server signature limitation", async () => {
    const result = await verifyExport(await fixture());
    expect(result.ok).toBe(true);
    expect(result.entries_checked).toBe(5);
    expect(result.server_signature_not_checked).toEqual([4]);
    expect(result.not_checked).toEqual(["anchor receipts", "Merkle proofs", "key revocation", "server signatures"]);
    expect(result.assurance).toBe("internal_consistency_only");
  });

  it("refuses a key registered by an unverified server entry", async () => {
    const exportObj = await fixture();
    const extra = await keyPair();
    exportObj.entries[4].details.signer_pubkey = await publicKeyBase64(extra);
    await rehashAndRelink(exportObj, 4);
    const result = await verifyExport(exportObj);
    expect(result.ok).toBe(false);
    expect(result.first_broken_index).toBe(4);
    expect(result.reason).toBe("server_key_registration");
  });

  it.each([
    ["payload", async (exportObj) => { exportObj.payloads["event-sim-2"].kind = "tampered"; }, 2, "commitment_mismatch"],
    ["outer field", async (exportObj) => { exportObj.entries[2].action = "tampered"; }, 2, "event_hash_mismatch"],
    ["previous hash", async (exportObj) => { exportObj.entries[2].prev_hash = "f".repeat(64); }, 2, "prev_hash_mismatch"],
    ["signature bytes", async (exportObj) => {
      exportObj.entries[2].details.sig = b64(rawToDer(new Uint8Array(32).fill(1), new Uint8Array(32).fill(2)));
      await rehashAndRelink(exportObj, 2);
    }, 2, "signature_invalid"],
  ])("T04 catches changed %s at the first broken index", async (_name, mutate, index, reason) => {
    const exportObj = await fixture();
    await mutate(exportObj);
    const result = await verifyExport(exportObj);
    expect([result.first_broken_index, result.reason]).toEqual([index, reason]);
  });

  it.each([
    ["action", (entry) => { entry.action = "rewritten"; }, "signature_invalid"],
    ["actor_id", (entry) => { entry.actor_id = "other-actor"; }, "actor_mismatch"],
    ["target_type", (entry) => { entry.target_type = "journey"; }, "signature_invalid"],
    ["target_id", (entry) => { entry.target_id = "journey-sim-01"; }, "signature_invalid"],
    ["ts", (entry) => { entry.ts = "2026-09-24T11:00:00+02:00"; }, "signature_invalid"],
    ["commitment", async (entry, exportObj) => {
      const salt = new Uint8Array(16).fill(0xa5);
      exportObj.salts[entry.details.event_id] = b64(salt);
      entry.details.commitment = await digestHex(concat(salt, canonicalize(exportObj.payloads[entry.details.event_id])));
    }, "signature_invalid"],
  ])("T21 binds %s", async (_name, mutate, reason) => {
    const exportObj = await fixture();
    const entry = exportObj.entries[2];
    await mutate(entry, exportObj);
    await rehashAndRelink(exportObj, 2);
    const result = await verifyExport(exportObj);
    expect([result.first_broken_index, result.reason]).toEqual([2, reason]);
  });

  it.each([
    ["non-zero genesis previous hash", async (exportObj) => { exportObj.entries[0].prev_hash = "1".repeat(64); }, "prev_hash_mismatch"],
    ["chain index gap", async (exportObj) => { exportObj.entries[2].details.chain_index = 9; await rehashAndRelink(exportObj, 2); }, "bad_shape"],
    ["unknown signer key", async (exportObj) => { exportObj.entries[2].details.signer_key_id = "unregistered"; await rehashAndRelink(exportObj, 2); }, "unknown_signer_key"],
    ["short salt", async (exportObj) => { exportObj.salts["event-sim-2"] = b64(new Uint8Array(15)); }, "salt_length"],
    ["payload without salt", async (exportObj) => { delete exportObj.salts["event-sim-2"]; }, "payload_salt_mismatch"],
    ["float in payload", async (exportObj) => { exportObj.payloads["event-sim-2"].score = 1.5; }, "canonical_error"],
    ["duplicate counter", async (exportObj) => { exportObj.entries[4].details.signer_key_id = "device-key-1"; exportObj.entries[4].details.counter = 3; await rehashAndRelink(exportObj, 4); }, "counter_replay"],
    ["malformed DER", async (exportObj) => { exportObj.entries[2].details.sig = b64(new Uint8Array([0x30, 0x00])); await rehashAndRelink(exportObj, 2); }, "bad_der"],
    ["conflicting key registration", async (exportObj) => {
      const other = await keyPair();
      exportObj.entries[3].details.signer_pubkey = await publicKeyBase64(other);
      await rehashAndRelink(exportObj, 3);
    }, "key_conflict"],
  ])("rejects %s with its specified reason", async (_name, mutate, reason) => {
    const exportObj = await fixture();
    await mutate(exportObj);
    const result = await verifyExport(exportObj);
    expect(result.reason).toBe(reason);
  });

  it("allows payload and salt deletion while preserving chain verification", async () => {
    const exportObj = await fixture();
    for (const eventId of ["event-sim-2", "event-sim-3"]) {
      delete exportObj.payloads[eventId];
      delete exportObj.salts[eventId];
    }
    const result = await verifyExport(exportObj);
    expect(result.ok).toBe(true);
    expect(result.payload_removed).toEqual([2, 3]);
  });

  it("normalises array and map forms identically and rejects duplicate array IDs", async () => {
    const mapped = await fixture();
    const arrayForm = {
      ...mapped,
      payloads: Object.entries(mapped.payloads).map(([event_id, payload]) => ({ event_id, payload })),
      salts: Object.entries(mapped.salts).map(([event_id, salt]) => ({ event_id, salt })),
    };
    expect(await verifyExport(arrayForm)).toEqual(await verifyExport(mapped));
    expect(() => normaliseExport({ ...arrayForm, payloads: [...arrayForm.payloads, arrayForm.payloads[0]] })).toThrow(/duplicate event_id/);
  });

  it("returns empty_export for no entries and converts invalid top-level input to a result", async () => {
    expect((await verifyExport({ subject_id: "x", entries: [], payloads: {}, salts: {} })).reason).toBe("empty_export");
    expect((await verifyExport(null)).ok).toBe(false);
  });
});

describe("verify-export CLI", () => {
  it("prints a valid result and exits successfully", async () => {
    const exportObj = await fixture();
    const directory = await mkdtemp(join(tmpdir(), "vuka-verify-"));
    const file = join(directory, "export.json");
    const cli = fileURLToPath(new URL("../scripts/verify-export.mjs", import.meta.url));
    try {
      await writeFile(file, JSON.stringify(exportObj), "utf8");
      const { spawn } = await import("node:child_process");
      const outcome = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [cli, file], { stdio: ["ignore", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";
        child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
        child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
        child.on("error", reject);
        child.on("close", (code) => resolve({ code, stdout, stderr }));
      });
      expect(outcome.code, outcome.stderr).toBe(0);
      expect(JSON.parse(outcome.stdout).ok).toBe(true);
      expect(outcome.stdout).toContain('"ok":true');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
