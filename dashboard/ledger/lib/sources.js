// dashboard/ledger/lib/sources.js — network clients for the public ledger
// dashboard (CONTRACT.md). Two sources, both public and unauthenticated:
//
//   1. the ANCHOR server's public surface (docs/DASHBOARD-INTEGRATION.md on
//      feat/lethabo-guardian-delivery): GET /v1/anchor/latest,
//      GET /v1/anchor/proof/{head}, WS /ws/panel;
//   2. the Hedera mirror node REST API: /api/v1/topics/{id}/messages[/{seq}].
//
// Nothing here verifies anything; lib/pipeline.js does that with shared/*.js.
// Every rejection is an Error whose message is a plain sentence. Timeouts 8 s.

import { bytesToHex } from "../../../shared/merkle.js";

export const DEFAULT_SERVER = "https://vuka-anchor-server.azurewebsites.net";
export const MIRRORS = { testnet: "https://testnet.mirrornode.hedera.com" };

const TIMEOUT_MS = 8000;
const HEAD_RE = /^[0-9a-f]{64}$/;
const TOPIC_RE = /^\d+\.\d+\.\d+$/;

function decodeBase64(text) {
  if (typeof text !== "string") return null;
  try {
    const binary = globalThis.atob(text);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

/**
 * Decode one mirror-node topic message (JSON from /messages or /messages/{seq})
 * into the contract's Msg shape. The 33-byte typed messages of spec §10 are
 * 0x01 ‖ Merkle root and 0x02 ‖ SHA-256(key manifest); anything else is 'other'.
 * @returns {{sequence_number:number, consensus_timestamp:string, running_hash:string,
 *            topic_id:string|null, bytes:Uint8Array, type:1|2|null, payloadHex:string,
 *            kind:'root'|'manifest'|'other'}}
 */
export function parseMirrorMessage(json) {
  if (json === null || typeof json !== "object") {
    throw new Error("The mirror node returned a message that is not a JSON object.");
  }
  const bytes = decodeBase64(json.message);
  if (bytes === null) throw new Error("The mirror node returned a message body that is not base64.");
  const typed = bytes.length === 33 && (bytes[0] === 0x01 || bytes[0] === 0x02);
  const type = typed ? bytes[0] : null;
  return {
    sequence_number: json.sequence_number,
    consensus_timestamp: json.consensus_timestamp,
    running_hash: json.running_hash,
    topic_id: typeof json.topic_id === "string" ? json.topic_id : null,
    bytes,
    type,
    payloadHex: typed ? bytesToHex(bytes.subarray(1)) : "",
    kind: type === 0x01 ? "root" : type === 0x02 ? "manifest" : "other",
  };
}

async function getJson(url, what) {
  const fetchFn = globalThis.fetch;
  if (typeof fetchFn !== "function") throw new Error("This browser cannot make network requests.");
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  let response;
  try {
    response = await fetchFn(url, {
      headers: { accept: "application/json" },
      signal: controller?.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`The ${what} did not answer within ${TIMEOUT_MS / 1000} seconds.`);
    }
    throw new Error(`Could not reach the ${what}.`);
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (response.status === 404) return { notFound: true, body: null };
  if (!response.ok) throw new Error(`The ${what} answered with HTTP ${response.status}.`);
  try {
    return { notFound: false, body: await response.json() };
  } catch {
    throw new Error(`The ${what} returned a response that is not JSON.`);
  }
}

function assertTopic(topicId) {
  if (typeof topicId !== "string" || !TOPIC_RE.test(topicId)) {
    throw new Error("The topic id must look like 0.0.12345.");
  }
}

/**
 * @param {{server?: string, network?: string}} [options]
 */
export function createSources({ server = DEFAULT_SERVER, network = "testnet" } = {}) {
  const base = String(server).replace(/\/+$/, "");
  const mirror = MIRRORS[network];
  if (!mirror) throw new Error(`There is no mirror node configured for the ${network} network.`);

  return {
    server: base,
    network,

    /** GET /v1/anchor/latest → {receipt, key_manifest}, or null when nothing is confirmed yet (404). */
    async latest() {
      const { notFound, body } = await getJson(`${base}/v1/anchor/latest`, "anchor server");
      if (notFound) return null;
      if (!body || typeof body.receipt !== "object" || body.receipt === null) {
        throw new Error("The anchor server returned a latest-anchor response without a receipt.");
      }
      return { receipt: body.receipt, key_manifest: body.key_manifest ?? null };
    },

    /**
     * GET /v1/anchor/proof/{head} → {path, receipt}, or null when no confirmed
     * batch contains the head (404). The server names the audit path `proof`;
     * it is returned here as `path` ([{side:'L'|'R', hash}], leaf → root, §6).
     */
    async proof(headHex) {
      if (typeof headHex !== "string" || !HEAD_RE.test(headHex)) {
        throw new Error("The chain head must be 64 lowercase hex characters.");
      }
      const { notFound, body } = await getJson(`${base}/v1/anchor/proof/${headHex}`, "anchor server");
      if (notFound) return null;
      const path = Array.isArray(body?.proof) ? body.proof : Array.isArray(body?.path) ? body.path : null;
      if (path === null) throw new Error("The anchor server returned a proof response without an audit path.");
      return { path, receipt: body.receipt ?? null };
    },

    /**
     * WS /ws/panel. onRow receives each parsed JSON row
     * ({subject, chain_index, event_hash, received_at[, kind, simulated]}).
     * onState receives 'open' | 'closed' | 'error'. Returns close().
     */
    panel(onRow, onState = () => {}) {
      const WS = globalThis.WebSocket;
      if (typeof WS !== "function") {
        onState("error");
        return () => {};
      }
      let socket;
      try {
        socket = new WS(`${base.replace(/^http/, "ws")}/ws/panel`);
      } catch {
        onState("error");
        return () => {};
      }
      // After close() nothing from this socket reaches the page: its late
      // close/error events must not overwrite the state of a newer connection.
      let closedByUs = false;
      let failed = false;
      socket.onopen = () => { if (!closedByUs) onState("open"); };
      socket.onerror = () => { if (!closedByUs) { failed = true; onState("error"); } };
      socket.onclose = () => { if (!closedByUs && !failed) onState("closed"); };
      socket.onmessage = (event) => {
        if (closedByUs) return;
        let row;
        try {
          row = JSON.parse(event.data);
        } catch {
          return; // not JSON: ignore the frame rather than render it
        }
        if (row !== null && typeof row === "object" && !Array.isArray(row)) onRow(row);
      };
      return () => {
        if (closedByUs) return;
        closedByUs = true;
        try {
          socket.close();
        } catch {
          /* already closed */
        }
      };
    },

    /** Mirror GET /api/v1/topics/{id}/messages?limit=&order= → Msg[]. */
    async topicMessages(topicId, { limit = 25, order = "desc" } = {}) {
      assertTopic(topicId);
      const safeLimit = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 25));
      const safeOrder = order === "asc" ? "asc" : "desc";
      const url = `${mirror}/api/v1/topics/${topicId}/messages?limit=${safeLimit}&order=${safeOrder}`;
      const { notFound, body } = await getJson(url, "Hedera mirror node");
      if (notFound) throw new Error(`The mirror node does not know topic ${topicId}.`);
      if (!Array.isArray(body?.messages)) throw new Error("The mirror node returned no message list.");
      return body.messages.map(parseMirrorMessage);
    },

    /** Mirror GET /api/v1/topics/{id}/messages/{seq} → Msg, or null (404). */
    async message(topicId, sequence) {
      assertTopic(topicId);
      if (!Number.isSafeInteger(Number(sequence)) || Number(sequence) < 1) {
        throw new Error("The sequence number must be a positive whole number.");
      }
      const url = `${mirror}/api/v1/topics/${topicId}/messages/${Number(sequence)}`;
      const { notFound, body } = await getJson(url, "Hedera mirror node");
      if (notFound) return null;
      return parseMirrorMessage(body);
    },
  };
}
