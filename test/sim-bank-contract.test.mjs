import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign, verify } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const document = (await readFile(new URL("../contracts/openapi.yaml", import.meta.url), "utf8")).replace(/\r\n/g, "\n");

// ---- Contract text checks: these read the real OpenAPI document. ----
function block(name, next) {
  const start = document.indexOf(`    ${name}:`);
  assert.ok(start >= 0, `${name} is missing`);
  return document.slice(start, document.indexOf(`    ${next}:`, start));
}
function pathBlock(path) {
  const start = document.indexOf(`  ${path}:`);
  assert.ok(start >= 0, `${path} is missing`);
  const rest = document.slice(start + 1);
  const end = rest.search(/\n  (?:\/|[a-z])[^\n]*:\n/);
  return end < 0 ? rest : rest.slice(0, end);
}

test("BankSignal carries its idempotency key inside the signed body", () => {
  const signal = block("BankSignal", "BankRelease");
  assert.match(signal, /required: \[subject_id, triggering_outcome, idempotency_key\]/);
  assert.match(signal, /idempotency_key: \{ type: string, minLength: 1, maxLength: 128/);
  assert.match(signal, /additionalProperties: false/);
});

test("release names exactly one hold with hold_ref and uses its own body schema", () => {
  const release = block("BankRelease", "IntegrityResult");
  assert.match(release, /required: \[subject_id, hold_ref, idempotency_key\]/);
  assert.match(release, /hold_ref: \{ type: string, minLength: 1/);
  assert.match(release, /additionalProperties: false/);
  assert.match(pathBlock("/sim_bank/v1/release"), /schemas\/BankRelease/);
  assert.match(pathBlock("/sim_bank/v1/risk-signal"), /schemas\/BankSignal/);
  assert.match(pathBlock("/sim_bank/v1/release"), /'404': \{ \$ref: '#\/components\/responses\/NotFound' \}/);
  assert.match(block("Receipt", "SimBankReceipt"), /hold_ref: \{ type: string, minLength: 1/);
});

test("the contract states the header/body binding and the error codes", () => {
  for (const path of ["/sim_bank/v1/risk-signal", "/sim_bank/v1/release"]) {
    const operation = pathBlock(path);
    assert.match(operation, /idempotency_key_mismatch/);
    assert.match(operation, /idempotency_conflict|Same key and same body/);
  }
  assert.match(pathBlock("/sim_bank/v1/release"), /unknown_hold/);
  assert.match(pathBlock("/sim_bank/v1/release"), /hold_already_released/);
});

// ---- Executable model of the contract (no server exists yet: x-vuka-implemented is false). ----
// This is a MODEL of the rules the contract states, used to pin the behaviour Khutso listed.
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
const bodyHash = (raw) => createHash("sha256").update(raw).digest("hex");
function signedBytes({ method, path, ts, raw, nonce }) {
  return Buffer.from(canonical({ method, path, ts, body_sha256: bodyHash(raw), nonce }));
}

class BankModel {
  constructor(pinnedPublicKey, state) {
    this.pinned = pinnedPublicKey;
    this.state = state ?? { receipts: {}, holds: {}, seq: 0 };
  }
  // A "worker crash" is: serialise state, build a fresh model from it, retry.
  snapshot() {
    return JSON.stringify(this.state);
  }
  handle({ method = "POST", path, ts = 1, nonce = "n", headerKey, raw, signature }) {
    if (!verify(null, signedBytes({ method, path, ts, raw, nonce }), this.pinned, Buffer.from(signature, "base64"))) {
      return { status: 401, code: "unauthorized" };
    }
    const body = JSON.parse(raw);
    if (headerKey !== body.idempotency_key) return { status: 400, code: "idempotency_key_mismatch" };
    const memoKey = `${path}|${body.idempotency_key}`;
    const seen = this.state.receipts[memoKey];
    if (seen) {
      return seen.bodyHash === bodyHash(raw)
        ? { status: 202, receipt: seen.receipt }
        : { status: 409, code: "idempotency_conflict" };
    }
    let receipt;
    if (path === "/sim_bank/v1/risk-signal") {
      const hold_ref = `hold_${++this.state.seq}`;
      this.state.holds[hold_ref] = { subject_id: body.subject_id, released: false };
      receipt = { receipt_id: `r_${this.state.seq}`, state: "accepted", sim: true, hold_ref };
    } else {
      const hold = this.state.holds[body.hold_ref];
      if (!hold || hold.subject_id !== body.subject_id) return { status: 404, code: "unknown_hold" };
      if (hold.released) return { status: 409, code: "hold_already_released" };
      hold.released = true;
      receipt = { receipt_id: `r_${++this.state.seq}`, state: "accepted", sim: true };
    }
    this.state.receipts[memoKey] = { bodyHash: bodyHash(raw), receipt };
    return { status: 202, receipt };
  }
}

const server = generateKeyPairSync("ed25519");
const other = generateKeyPairSync("ed25519");
const RISK = "/sim_bank/v1/risk-signal";
const RELEASE = "/sim_bank/v1/release";

function request(path, body, { key = server.privateKey, header } = {}) {
  const raw = JSON.stringify(body);
  const signature = sign(null, signedBytes({ method: "POST", path, ts: 1, raw, nonce: "n" }), key).toString("base64");
  return { path, raw, signature, headerKey: header ?? body.idempotency_key };
}
const risk = (k, subject = "sim_a") => ({ subject_id: subject, triggering_outcome: "duress_signal", idempotency_key: k });
const rel = (k, hold_ref, subject = "sim_a") => ({ subject_id: subject, hold_ref, idempotency_key: k });

test("model: a request signed by a key other than the pinned one is refused", () => {
  const bank = new BankModel(server.publicKey);
  assert.equal(bank.handle(request(RISK, risk("k1"), { key: other.privateKey })).status, 401);
  assert.deepEqual(bank.state.holds, {});
});

test("model: a changed Idempotency-Key header is rejected; the signed body key is what counts", () => {
  const bank = new BankModel(server.publicKey);
  const bad = bank.handle(request(RISK, risk("k1"), { header: "k-other" }));
  assert.equal(bad.status, 400);
  assert.equal(bad.code, "idempotency_key_mismatch");
  assert.deepEqual(bank.state.holds, {});
});

test("model: the same key with a changed body is 409, not a second hold", () => {
  const bank = new BankModel(server.publicKey);
  assert.equal(bank.handle(request(RISK, risk("k1"))).status, 202);
  const changed = bank.handle(request(RISK, { ...risk("k1"), triggering_outcome: "no_answer" }));
  assert.equal(changed.status, 409);
  assert.equal(Object.keys(bank.state.holds).length, 1);
});

test("model: a repeated signal with the same key returns the original receipt and opens one hold", () => {
  const bank = new BankModel(server.publicKey);
  const first = bank.handle(request(RISK, risk("k1")));
  const again = bank.handle(request(RISK, risk("k1")));
  assert.deepEqual(again, first);
  assert.equal(Object.keys(bank.state.holds).length, 1);
});

test("model: releasing one of two holds leaves the other active", () => {
  const bank = new BankModel(server.publicKey);
  const a = bank.handle(request(RISK, risk("k1"))).receipt.hold_ref;
  const b = bank.handle(request(RISK, risk("k2"))).receipt.hold_ref;
  assert.notEqual(a, b);
  assert.equal(bank.handle(request(RELEASE, rel("k3", a))).status, 202);
  assert.equal(bank.state.holds[a].released, true);
  assert.equal(bank.state.holds[b].released, false);
  const twice = bank.handle(request(RELEASE, rel("k4", a)));
  assert.equal(twice.status, 409);
  assert.equal(twice.code, "hold_already_released");
});

test("model: release of an unknown hold, or another subject's hold, is 404", () => {
  const bank = new BankModel(server.publicKey);
  const a = bank.handle(request(RISK, risk("k1"))).receipt.hold_ref;
  assert.equal(bank.handle(request(RELEASE, rel("k2", "hold_nope"))).status, 404);
  const cross = bank.handle(request(RELEASE, rel("k3", a, "sim_b")));
  assert.equal(cross.status, 404);
  assert.equal(cross.code, "unknown_hold");
  assert.equal(bank.state.holds[a].released, false);
});

test("model: a retry after a worker crash returns the original receipt and opens no second hold", () => {
  const before = new BankModel(server.publicKey);
  const first = before.handle(request(RISK, risk("k1")));
  const after = new BankModel(server.publicKey, JSON.parse(before.snapshot()));
  const retry = after.handle(request(RISK, risk("k1")));
  assert.deepEqual(retry, first);
  assert.equal(Object.keys(after.state.holds).length, 1);
  const relFirst = after.handle(request(RELEASE, rel("k2", first.receipt.hold_ref)));
  const revived = new BankModel(server.publicKey, JSON.parse(after.snapshot()));
  assert.deepEqual(revived.handle(request(RELEASE, rel("k2", first.receipt.hold_ref))), relFirst);
});
