// node --test dashboard/ledger/test/
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";

import { createSources, DEFAULT_SERVER, MIRRORS, parseMirrorMessage } from "../lib/sources.js";

const original = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = original;
});

function mockFetch(routes) {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    for (const [match, status, body] of routes) {
      if (String(url).includes(match)) return new Response(JSON.stringify(body), { status });
    }
    return new Response(JSON.stringify({ code: "not_found" }), { status: 404 });
  };
  return calls;
}

const ROOT = "ab".repeat(32);
const b64 = (bytes) => Buffer.from(bytes).toString("base64");

test("message() parses a mirror message into {type, payloadHex, kind}", async () => {
  const calls = mockFetch([["/messages/7", 200, {
    consensus_timestamp: "1790294400.000000001", running_hash: "cnVu", sequence_number: 7, topic_id: "0.0.10687280",
    message: b64([0x01, ...Buffer.from(ROOT, "hex")]),
  }]]);
  const msg = await createSources().message("0.0.10687280", 7);
  assert.equal(calls[0], `${MIRRORS.testnet}/api/v1/topics/0.0.10687280/messages/7`);
  assert.equal(msg.type, 0x01);
  assert.equal(msg.kind, "root");
  assert.equal(msg.payloadHex, ROOT);
  assert.equal(msg.bytes.length, 33);
  assert.equal(msg.sequence_number, 7);
  assert.equal(msg.running_hash, "cnVu");
});

test("topicMessages() decodes manifest and other messages", async () => {
  const calls = mockFetch([["/messages?", 200, { messages: [
    { sequence_number: 2, consensus_timestamp: "1.2", running_hash: "x", message: b64([0x02, ...new Uint8Array(32)]) },
    { sequence_number: 1, consensus_timestamp: "1.1", running_hash: "y", message: b64(new TextEncoder().encode("hello")) },
  ] }]]);
  const msgs = await createSources().topicMessages("0.0.10687280", { limit: 5, order: "desc" });
  assert.match(calls[0], /messages\?limit=5&order=desc$/);
  assert.equal(msgs[0].kind, "manifest");
  assert.equal(msgs[0].type, 0x02);
  assert.equal(msgs[1].kind, "other");
  assert.equal(msgs[1].type, null);
  assert.equal(msgs[1].payloadHex, "");
});

test("parseMirrorMessage: a 33-byte message with an unknown type byte is 'other'", () => {
  const msg = parseMirrorMessage({ sequence_number: 1, message: b64([0x07, ...new Uint8Array(32)]) });
  assert.equal(msg.kind, "other");
  assert.equal(msg.type, null);
});

test("latest() 404 → null; 200 → {receipt, key_manifest}", async () => {
  mockFetch([]);
  assert.equal(await createSources().latest(), null);
  const receipt = { topic_id: "0.0.10687280", sequence_number: 42, consensus_timestamp: "1.1", running_hash: "r", topic_epoch: 1 };
  const calls = mockFetch([["/v1/anchor/latest", 200, { receipt, key_manifest: { server_ed25519_public_key: "k" } }]]);
  const latest = await createSources().latest();
  assert.equal(calls[0], `${DEFAULT_SERVER}/v1/anchor/latest`);
  assert.deepEqual(latest.receipt, receipt);
});

test("proof() maps the server's `proof` to `path`; 404 → null; bad head rejects", async () => {
  const path = [{ side: "R", hash: ROOT }];
  mockFetch([["/v1/anchor/proof/", 200, { proof: path, receipt: { topic_id: "0.0.10687280" } }]]);
  const sources = createSources();
  assert.deepEqual((await sources.proof(ROOT)).path, path);
  mockFetch([]);
  assert.equal(await sources.proof(ROOT), null);
  await assert.rejects(sources.proof("XYZ"), /64 lowercase hex/);
});

test("message() 404 → null; HTTP 500 and network failure reject with sentences", async () => {
  mockFetch([]);
  assert.equal(await createSources().message("0.0.10687280", 9), null);
  mockFetch([["/messages/9", 500, {}]]);
  await assert.rejects(createSources().message("0.0.10687280", 9), /answered with HTTP 500\./);
  globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
  await assert.rejects(createSources().latest(), /Could not reach the anchor server\./);
  await assert.rejects(createSources().message("not-a-topic", 1), /topic id/);
});

test("panel(): after close(), late events from the old socket are ignored", () => {
  const sockets = [];
  const originalWS = globalThis.WebSocket;
  globalThis.WebSocket = class { constructor(url) { this.url = url; sockets.push(this); } close() {} };
  try {
    const states = [];
    const rows = [];
    const close = createSources().panel((r) => rows.push(r), (s) => states.push(s));
    assert.equal(sockets[0].url, "wss://vuka-anchor-server.azurewebsites.net/ws/panel");
    sockets[0].onopen();
    sockets[0].onmessage({ data: JSON.stringify({ subject: "a", chain_index: 1 }) });
    sockets[0].onmessage({ data: "not json" });
    sockets[0].onmessage({ data: "[1,2]" });
    close();
    sockets[0].onmessage({ data: JSON.stringify({ subject: "late" }) });
    sockets[0].onclose();
    sockets[0].onerror();
    assert.deepEqual(states, ["open"]);
    assert.deepEqual(rows, [{ subject: "a", chain_index: 1 }]);
  } finally {
    globalThis.WebSocket = originalWS;
  }
});

test("panel(): an error is not overwritten by the close that follows it", () => {
  const sockets = [];
  const originalWS = globalThis.WebSocket;
  globalThis.WebSocket = class { constructor() { sockets.push(this); } close() {} };
  try {
    const states = [];
    createSources().panel(() => {}, (s) => states.push(s));
    sockets[0].onerror();
    sockets[0].onclose();
    assert.deepEqual(states, ["error"]);
  } finally {
    globalThis.WebSocket = originalWS;
  }
});
