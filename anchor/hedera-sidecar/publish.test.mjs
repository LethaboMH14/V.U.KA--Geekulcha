import assert from "node:assert/strict";
import test from "node:test";
import { pinnedAnchorMessage, readMirror, submitPinnedMessage, verifyMirrorMessage } from "./publish.mjs";

const fingerprint = "c1d90404edd180765e15321d690881933c5a4ffcdecc18f064131b6c5c70a0a2";

test("manifest message matches the committed verify pin byte for byte", async () => {
  const { message, topicId, topicEpoch } = await pinnedAnchorMessage("manifest");
  assert.equal(topicId, "0.0.10687280");
  assert.equal(topicEpoch, 1);
  assert.equal(Buffer.from(message).toString("hex"), `02${fingerprint}`);
});

test("root message is exactly 0x01 followed by 32 root bytes", async () => {
  const { message } = await pinnedAnchorMessage("root", "ab".repeat(32));
  assert.equal(Buffer.from(message).toString("hex"), `01${"ab".repeat(32)}`);
  await assert.rejects(pinnedAnchorMessage("root", "ab".repeat(31)), /32 lowercase hex/);
  await assert.rejects(pinnedAnchorMessage("root", "AB".repeat(32)), /32 lowercase hex/);
  await assert.rejects(pinnedAnchorMessage("manifest", "ab".repeat(32)), /must not include/);
});

test("a changed manifest cannot be published under the old pin", async () => {
  const files = [
    { server_ed25519_public_key: "changed" },
    { network: "testnet", topic_id: "0.0.10687280", topic_epoch: 1,
      manifest_fingerprint_hex: fingerprint },
  ];
  await assert.rejects(pinnedAnchorMessage("manifest", undefined, async () => files.shift()),
    /does not match/);
});

test("mirror read-back requires matching topic, sequence and exact bytes", async () => {
  const { message, topicId } = await pinnedAnchorMessage("manifest");
  const valid = { topic_id: topicId, sequence_number: 7,
    consensus_timestamp: "1790197443.416460104", running_hash: "base64-running-hash",
    message: Buffer.from(message).toString("base64") };
  assert.equal(verifyMirrorMessage(valid, { message, topicId, sequenceNumber: 7 }).message_hex,
    `02${fingerprint}`);
  for (const changed of [
    { topic_id: "0.0.1" }, { sequence_number: 8 },
    { message: Buffer.from(Uint8Array.from([0x01, ...message.slice(1)])).toString("base64") },
    { running_hash: "" },
  ]) {
    assert.throws(() => verifyMirrorMessage({ ...valid, ...changed },
      { message, topicId, sequenceNumber: 7 }), /mirror/);
  }
});

test("mirror lag is retried, but mismatched content is never accepted", async () => {
  const { message, topicId } = await pinnedAnchorMessage("manifest");
  let calls = 0;
  const confirmed = await readMirror({ topicId, sequenceNumber: 9, message, delay: async () => {},
    fetchFn: async () => {
      calls += 1;
      if (calls === 1) return { ok: false, status: 404 };
      return { ok: true, json: async () => ({ topic_id: topicId, sequence_number: 9,
        consensus_timestamp: "1790197443.416460104", running_hash: "running-hash",
        message: Buffer.from(message).toString("base64") }) };
    } });
  assert.equal(calls, 2);
  assert.equal(confirmed.sequence_number, 9);
  await assert.rejects(readMirror({ topicId, sequenceNumber: 9, message, attempts: 1,
    fetchFn: async () => ({ ok: true, json: async () => ({
      topic_id: topicId, sequence_number: 9, consensus_timestamp: "1790197443.416460104",
      running_hash: "running-hash", message: "AQ==",
    }) }) }), /mirror message bytes differ/);
});

test("submission needs separate operator and topic-submit credentials", async () => {
  await assert.rejects(submitPinnedMessage({ kind: "manifest" }, { env: {} }), /credentials are required/);
  await assert.rejects(submitPinnedMessage({ kind: "root", root_hex: "ab".repeat(32) }, {
    env: { HEDERA_OPERATOR_ID: "0.0.99", HEDERA_OPERATOR_KEY: "operator-secret",
      HEDERA_SUBMIT_KEY: "submit-secret" },
  }), /confirmed manifest sequence is required/);
  let signed = false;
  let closed = false;
  class Transaction {
    setTopicId(id) { assert.equal(id, "0.0.10687280"); return this; }
    setMessage(bytes) { assert.equal(bytes.length, 33); return this; }
    freezeWith() { return this; }
    async sign(key) { assert.equal(key, "submit-secret"); signed = true; return this; }
    async execute() { return { getReceipt: async () => ({ topicSequenceNumber: 3 }) }; }
  }
  const sdkLoader = async () => ({
    Client: { forTestnet: () => ({ setOperator: (id, key) => {
      assert.equal(id, "0.0.99"); assert.equal(key, "operator-secret");
    }, close: () => { closed = true; } }) },
    PrivateKey: { fromString: (value) => value },
    TopicMessageSubmitTransaction: Transaction,
  });
  const result = await submitPinnedMessage({ kind: "manifest" }, {
    env: { HEDERA_OPERATOR_ID: "0.0.99", HEDERA_OPERATOR_KEY: "operator-secret",
      HEDERA_SUBMIT_KEY: "submit-secret" }, sdkLoader,
    readBack: async ({ topicId, sequenceNumber, message }) => ({
      topic_id: topicId, sequence_number: sequenceNumber,
      consensus_timestamp: "1790197443.416460104", running_hash: "running-hash",
      message_hex: Buffer.from(message).toString("hex"),
    }),
  });
  assert.equal(signed, true);
  assert.equal(closed, true);
  assert.equal(result.confirmed_by, "public_mirror");
  assert.equal(result.topic_epoch, 1);
});
