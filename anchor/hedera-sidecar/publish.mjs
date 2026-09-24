import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { manifestMessage, canonicalManifestBytes, bytesToHex, decodeAnchorMessage, validateManifest } from "../../shared/keys.js";

const manifestPath = fileURLToPath(new URL("../../contracts/keys/manifest.json", import.meta.url));
const pinsPath = fileURLToPath(new URL("../../contracts/keys/verify-pins.json", import.meta.url));
const HEX_32 = /^[0-9a-f]{64}$/;

export async function pinnedAnchorMessage(kind, rootHex, loadJson = async (path) => JSON.parse(await readFile(path, "utf8"))) {
  const [manifest, pins] = await Promise.all([loadJson(manifestPath), loadJson(pinsPath)]);
  validateManifest(manifest);
  if (pins.network !== "testnet" || !/^\d+\.\d+\.\d+$/.test(pins.topic_id) ||
      !Number.isSafeInteger(pins.topic_epoch) || pins.topic_epoch < 1 ||
      !HEX_32.test(pins.manifest_fingerprint_hex)) {
    throw new Error("invalid pinned topic or manifest fingerprint");
  }
  const manifestBytes = await manifestMessage(canonicalManifestBytes(manifest));
  if (bytesToHex(manifestBytes.slice(1)) !== pins.manifest_fingerprint_hex) {
    throw new Error("manifest does not match the pinned fingerprint");
  }
  let message;
  if (kind === "manifest") {
    if (rootHex !== undefined) throw new Error("manifest message must not include a root");
    message = manifestBytes;
  } else if (kind === "root") {
    if (typeof rootHex !== "string" || !HEX_32.test(rootHex)) {
      throw new Error("root must be 32 lowercase hex bytes");
    }
    message = Uint8Array.from([0x01, ...Buffer.from(rootHex, "hex")]);
  } else {
    throw new Error("unknown anchor message kind");
  }
  decodeAnchorMessage(message);
  return { message, topicId: pins.topic_id, topicEpoch: pins.topic_epoch, network: pins.network };
}

export function verifyMirrorMessage(mirror, { message, topicId, sequenceNumber }) {
  if (mirror?.topic_id !== topicId || String(mirror.sequence_number) !== String(sequenceNumber) ||
      typeof mirror.consensus_timestamp !== "string" ||
      !/^\d+\.\d{1,9}$/.test(mirror.consensus_timestamp) ||
      typeof mirror.running_hash !== "string" || mirror.running_hash.length === 0 ||
      typeof mirror.message !== "string") {
    throw new Error("mirror receipt does not bind to the submitted topic and sequence");
  }
  const decoded = Buffer.from(mirror.message, "base64");
  if (decoded.toString("base64") !== mirror.message || !decoded.equals(Buffer.from(message))) {
    throw new Error("mirror message bytes differ from the submitted message");
  }
  decodeAnchorMessage(new Uint8Array(decoded));
  return {
    topic_id: topicId,
    sequence_number: Number(sequenceNumber),
    consensus_timestamp: mirror.consensus_timestamp,
    running_hash: mirror.running_hash,
    message_hex: Buffer.from(message).toString("hex"),
  };
}

export async function readMirror({ topicId, sequenceNumber, message, fetchFn = fetch, attempts = 5, delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
  if (!Number.isSafeInteger(Number(sequenceNumber)) || Number(sequenceNumber) < 1) {
    throw new Error("Hedera receipt has no valid topic sequence number");
  }
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages/${sequenceNumber}`;
  for (let i = 0; i < attempts; i += 1) {
    const response = await fetchFn(url, { signal: AbortSignal.timeout(10000) });
    if (response.ok) {
      return verifyMirrorMessage(await response.json(), { topicId, sequenceNumber, message });
    }
    if (response.status !== 404 && response.status !== 429 && response.status < 500) {
      throw new Error(`mirror read failed with HTTP ${response.status}`);
    }
    if (i < attempts - 1) await delay(1000 * (i + 1));
  }
  throw new Error("mirror read-back unavailable; submission state must be reconciled before retry");
}

export async function submitPinnedMessage(request, {
  env = process.env,
  sdkLoader = () => import("@hiero-ledger/sdk"),
  readBack = readMirror,
} = {}) {
  const { message, topicId, topicEpoch } = await pinnedAnchorMessage(request?.kind, request?.root_hex);
  const { HEDERA_OPERATOR_ID: operatorId, HEDERA_OPERATOR_KEY: operatorKey,
    HEDERA_SUBMIT_KEY: submitKey, HEDERA_MANIFEST_SEQUENCE: manifestSequence } = env;
  if (!operatorId || !operatorKey || !submitKey) {
    throw new Error("Hedera operator and topic submit credentials are required");
  }
  if (request.kind === "root") {
    if (!/^[1-9][0-9]*$/.test(manifestSequence ?? "")) {
      throw new Error("confirmed manifest sequence is required before root publication");
    }
    const manifest = await pinnedAnchorMessage("manifest");
    await readBack({ topicId, sequenceNumber: Number(manifestSequence), message: manifest.message });
  }
  const { Client, PrivateKey, TopicMessageSubmitTransaction } = await sdkLoader();
  const client = Client.forTestnet();
  try {
    client.setOperator(operatorId, PrivateKey.fromString(operatorKey));
    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(topicId).setMessage(message).freezeWith(client);
    await transaction.sign(PrivateKey.fromString(submitKey));
    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    const sequenceNumber = Number(receipt.topicSequenceNumber?.toString());
    const mirror = await readBack({ topicId, sequenceNumber, message });
    return { kind: request.kind, topic_epoch: topicEpoch, ...mirror, confirmed_by: "public_mirror" };
  } finally {
    await client.close();
  }
}
