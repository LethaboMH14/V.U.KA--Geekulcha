# Ledger dashboard: module contract

Internal contract between the pieces of `dashboard/ledger/` (vanilla ES modules, no build step, served as static files next to `shared/` and `contracts/`). Every cryptographic step reuses `shared/*.js`. Nothing here re-implements hashing, canonical form or Merkle maths.

## Files and owners
- `lib/sources.js`: network clients (server + Hedera mirror).
- `lib/pipeline.js`: verification as a stream of trace steps.
- `sample/`: the SAMPLE data set and the script that makes it.
- `terminal.js`: the terminal component.
- `index.html`, `ledger.css`, `app.js`: the page, views and diagrams.

## `lib/sources.js`
```js
export const DEFAULT_SERVER = "https://vuka-anchor-server.azurewebsites.net";
export const MIRRORS = { testnet: "https://testnet.mirrornode.hedera.com" };
export function createSources({ server = DEFAULT_SERVER, network = "testnet" } = {}) → {
  server, network,
  latest(): Promise<{receipt, key_manifest} | null>,        // GET /v1/anchor/latest (404 → null)
  proof(headHex): Promise<{path, receipt} | null>,          // GET /v1/anchor/proof/{head} (404 → null)
  panel(onRow, onState): () => void,                        // WS /ws/panel; onState('open'|'closed'|'error'); returns close()
  topicMessages(topicId, {limit=25, order='desc'}): Promise<Array<Msg>>, // mirror /api/v1/topics/{id}/messages
  message(topicId, sequence): Promise<Msg | null>,          // mirror /api/v1/topics/{id}/messages/{seq}
}
// Msg = { sequence_number, consensus_timestamp, running_hash, bytes: Uint8Array,
//         type: 0x01 | 0x02 | null, payloadHex: string /* 32-byte hex after the type byte, or '' */,
//         kind: 'root' | 'manifest' | 'other' }
```
Every call rejects with an `Error` whose `.message` is a plain sentence. Timeouts are 8 s.

## `lib/pipeline.js`
```js
export async function* verifyTrace(exportObj, {
  pins, manifest,            // contracts/keys/verify-pins.json, manifest.json (objects)
  proof = null,              // {path:[{side:'L'|'R', hash}], receipt} from sources.proof or the sample
  ledgerMessage = null,      // Msg from sources.message, or the sample's message
  archived = false,          // true when ledgerMessage came from a stored copy (the sample)
}) → yields Step, and finally returns Result
// Step = { phase, label, detail?, value?, ok: true|false|null, entry?: number, kind?: string }
//   phase ∈ 'parse' | 'canonical' | 'commitment' | 'event_hash' | 'link' | 'signature'
//           | 'head' | 'leaf' | 'path' | 'root' | 'ledger' | 'verdict'
//   label: short present-tense line ("Recompute event hash #3")
//   value: the hex or text produced (full length; the UI shortens it)
//   ok: true = check passed, false = failed, null = information only
// Result = { state: 'live-verified' | 'archived' | 'unavailable' | 'failed',
//            head, root, leaf, entries, firstBroken: number | null, reason: string | null,
//            receipt: object | null }
```
Rules:
- Payload `kind` and contents are shown only for `sim_` subjects. Otherwise the step says "payload hidden (commitment only)".
- For a duress `checkin_result` in a `sim_` export, the step labels it and notes that the public ledger cannot tell it apart (§10 coalescing).
- `live-verified` needs: the chain verifies, the proof recomputes the root from the head, the ledger message is type `0x01` with the same 32 bytes, and the topic equals the pinned `topic_id`.
- `archived` is the same, except that the message is a stored copy.
- `unavailable` means the chain verifies but there is no proof or message.
- `failed` means any check failed, with `firstBroken`/`reason` set.

## `sample/`
- `sample/export.json`: a valid v2 `sim_` subject export: registration, journey armed, signal_detected, checkin_opened, a `checkin_result` with `duress_pin`, a guardian_ack from a registered guardian key, and journey_ended. It is signed with keys the generator makes.
- `sample/batch.json`: `{ sample: true, leaves: [hex…], index, head, root, path, message: {sequence_number, consensus_timestamp, running_hash, bytesHex, type:1, payloadHex}, receipt: {topic_id, sequence_number, consensus_timestamp, running_hash, topic_epoch, sample: true} }`, with the export's head as one leaf among 6.
- `sample/make-sample.mjs`: regenerates both files (`node dashboard/ledger/sample/make-sample.mjs`).
- Everything from `sample/` is labelled **SAMPLE** in the UI and is never presented as on Hedera.

## `terminal.js`
```js
export function createTerminal(rootEl, { reducedMotion }) → {
  clear(),
  async play(stepsAsyncIterable, { speed = 1 }) → Result,  // renders steps as lines; returns the Result
  line(text, tone = 'info' | 'ok' | 'fail' | 'dim' | 'accent'),
}
```
It renders with `textContent` only, and never `innerHTML`, for anything that came from an export.
