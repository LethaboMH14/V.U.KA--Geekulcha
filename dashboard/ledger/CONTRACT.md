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
// Msg = { sequence_number, consensus_timestamp, running_hash, topic_id: string | null,
//         bytes: Uint8Array, type: 0x01 | 0x02 | null,
//         payloadHex: string /* 32-byte hex after the type byte, or '' */,
//         kind: 'root' | 'manifest' | 'other' }
export function parseMirrorMessage(json) → Msg   // one mirror message object → Msg (also used by the calls above)
```
Every call rejects with an `Error` whose `.message` is a plain sentence. Timeouts are 8 s.
- The server's proof body is `{proof: [...], receipt: {topic_id, sequence_number, consensus_timestamp, running_hash, topic_epoch}}` (`server/anchor_reads.py` on `feat/lethabo-guardian-delivery`); `proof()` returns it as `{path, receipt}`.
- `running_hash` stays exactly as the mirror returns it (base64); the server copies it verbatim into the receipt, so the two compare as strings.
- `Msg.topic_id` is an addition to the original contract: the mirror returns it, and the pipeline checks it against the pinned topic.

## `lib/pipeline.js`
```js
export async function* verifyTrace(exportObj, {
  pins, manifest,            // contracts/keys/verify-pins.json, manifest.json (objects)
  proof = null,              // {path:[{side:'L'|'R', hash}], receipt} from sources.proof or the sample
  ledgerMessage = null,      // Msg from sources.message, or the sample's message
  archived = false,          // TEST-ONLY: true when ledgerMessage came from a stored copy. The UI never passes it.
}) → yields Step, and finally returns Result
export function exportFromShare(textOrObject) → exportObj
//   accepts the raw export JSON, {"format":"vuka-export-v2","export":{…}} or {"vuka_export":{…}},
//   as text or an object; anything else throws an Error with a plain sentence.
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
- `unavailable` means the chain verifies but there is no proof or message. `reason` is then a plain sentence: with no proof (the server's 404), "This record's latest fingerprint hasn't been anchored yet; anchoring runs at least hourly."
- `failed` means any check failed, with `firstBroken`/`reason` set. `firstBroken` is `null` when the failure is not in an entry (manifest, proof, ledger); `reason` is then a plain sentence, and for an entry it is the `shared/verify.js` reason code.
- The chain verdict is `shared/verify.js` `verifyExport` with the pinned manifest key, so server signatures are checked. Before it, the pipeline checks SHA-256(canonical(manifest)) against `pins.manifest_fingerprint_hex` (§6 step 5).
- `proof` may also be the raw server body `{proof, receipt}`.
- The ledger checks are: 33 bytes with type `0x01`; the 32 bytes equal the recomputed root; the receipt topic (and `Msg.topic_id` when present) equals `pins.topic_id`, and `topic_epoch` equals `pins.topic_epoch`; the receipt's `sequence_number`, `consensus_timestamp` and `running_hash` equal the message's (§6 step 4).
- Anything flagged `"sample": true` (pins, manifest, message, receipt or export) can only reach `archived`, never `live-verified`.

## `sample/` (TEST FIXTURE ONLY)
Product-owner direction, 26 Sep 2026: "nothing is mock, all live." The UI never loads `sample/`. It uses only the live server, the live testnet mirror, real VIGIL exports and the real `contracts/keys/` pins and manifest. `sample/` exists only for `dashboard/ledger/test/`.
- `sample/export.json`: a valid v2 `sim_` subject export with 9 entries. These are device registration, guardian registration, `journey_armed`, `signal_detected`, `checkin_opened`, a `checkin_result` with `duress_pin`, a server-signed `guardian_alerted`, a `guardian_ack` from the registered guardian key, and `journey_ended`. The public `action` is the coarse class from §3, and `kind` sits in the payload. The generator makes the keys in memory and never writes a private key.
- `sample/batch.json`: `{ sample: true, leaves: [hex…], index, head, root, path, message: {sample, topic_id, sequence_number, consensus_timestamp, running_hash, bytesHex, type:1, payloadHex}, receipt: {topic_id, sequence_number, consensus_timestamp, running_hash, topic_epoch, sample: true} }`. The export's head is one leaf among 6, and the leaves are ordered by raw bytes. The message values are made up.
- `sample/manifest.json` + `sample/pins.json`: a SAMPLE manifest with the generated server key (it carries `"sample": true`, so it can never pass as the real manifest), and pins that name the real topic, carry `"sample": true` and hold the SAMPLE manifest's fingerprint.
- `sample/make-sample.mjs`: regenerates all four files (`node dashboard/ledger/sample/make-sample.mjs`).
- Tests: `node --test "dashboard/ledger/test/*.test.js"`. On Node 22, a directory argument is not accepted; the glob is needed.

## `terminal.js`
```js
export function createTerminal(rootEl, {
  reducedMotion,
  title = 'vuka-verify — sim export',     // title bar text (optional)
  command = 'vuka verify record.json',    // default prompt line typed before the steps (optional)
}) → {
  clear(),
  async play(stepsAsyncIterable, { speed = 1, command }) → Result,  // renders steps as lines; returns the Result
  line(text, tone = 'info' | 'ok' | 'fail' | 'dim' | 'accent' | 'warn'),
  skip(),   // renders the remaining lines of every queued or active play instantly
}
```
It renders with `textContent` only, and never `innerHTML`, for anything that came from an export.
The page links `terminal.css` and the mono font ("JetBrains Mono", with fallbacks).
- `play()` resolves with the iterable's return value (the Result), or `null` if it returns nothing; it rejects after printing the error if the iterable throws. The verdict banner and the head/root lines are printed from the Result.
- Calling `play()` again skips earlier runs to the end, then starts: every promise resolves with its own Result and lines never interleave. `play()` does not clear; call `clear()` first for a fresh screen.
- `clear()` during a play empties the log; that play keeps consuming its steps silently and still resolves.
- Motion is off when `reducedMotion` is true, when `prefers-reduced-motion: reduce` matches, or when the tab is hidden. `Escape` inside the terminal and its Skip button call `skip()`.
