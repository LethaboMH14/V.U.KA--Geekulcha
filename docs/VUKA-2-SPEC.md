# VUKA 2 — VIGIL + ANCHOR specification

> **Status:** accepted build specification, issued 23 September 2026 by Lethabo (co-lead) after the 21–22 September pivot meetings with Sibusiso and Babatunde. It binds with ADR-0034 to ADR-0038, which were **accepted on 23 Sep 2026**: Sibusiso as second lead, and Ipeleng's security review approved with conditions (record: `docs/ADR-ACCEPTANCE-RECORD.md`). **Revision 2 (23 Sep, evening)** answers Sibusiso's review and the independent review he posted on PR #43 (blockers B1–B7, should-fix S1–S10); the disposition of each is in that PR.
>
> **Read with:** `docs/MASTER-CONTEXT.md` (what we are judged on) · `docs/STAGED-DURESS-DEFENCE.md` (why the design resists a faked duress event) · `docs/ECONOMICS-VIGIL-ANCHOR.md` (who pays) · your own `team/<name>.md` work order.
>
> **Supersedes in part:** `archive/2026-09-four-layer/docs/00-SPEC.md` and `…/01-ARCHITECTURE.md` for everything about KHAYA, UMOJA, entities, sightings, cameras and the `watch_candidate → flagged` state machine. Those documents are kept as lineage, not deleted.

---

## 1 · The product

**VIGIL** is an Android app. During a **journey the user starts**, it listens on the device for signs of duress: a scream, a shout, breaking glass, or (stretch) a struggle or the car's Bluetooth dropping at speed. When it hears one, it asks a quiet question, *"Journey check"*. The user answers with their normal PIN, their duress PIN (which looks identical), or not at all. The **server**, not the phone, decides what an unanswered question means and alerts the people the user chose: their **guardians**.

**ANCHOR** keeps one hash chain per person:
- every event is signed by the device or guardian that produced it, or by the server for events the server decides;
- every PIN-gated outcome is anchored to the Hedera Consensus Service within about a minute, and everything else hourly;
- a stranger can verify a person's exported record without trusting us.

**Parked, not deleted (ADR-0034):** KHAYA (home appliance), UMOJA (street entity graph, risk layer, patrol), cameras, faces, plates, private-security dispatch.

**The one sentence:** *When you can't ask for help, VIGIL notices. When nobody believes you, ANCHOR proves when.* The anchor proves **when**, not **what**. A valid signature proves that a key was used, not that a microphone heard a real event.

---

## 2 · Requirements

IDs are stable; tests in §15 cite them.

### VIGIL (phone)
- **V1** A journey is armed only by an explicit user action while the app is in the foreground. Arming refuses to start without microphone **and** notification permission and says why in plain words.
- **V2** While armed, a foreground service of the types actually granted (microphone, and location only if granted) runs with a persistent, neutral notification: "VUKA journey active".
- **V3** *(ADR-0039, Proposed, adds gun-like classes and payload fields: see §18)* On-device YAMNet classifies 0.975 s windows (15 600 samples, 16 kHz mono, asserted from `get_input_details()`). Classes are mapped **by label**: Screaming, Shout, Yell, Glass, Shatter, Breaking. Scores are integer basis points 0–10000. Thresholds are labelled **uncalibrated** until §16 measures them.
- **V4** A detection above threshold creates a `signal_detected` event, then shows the check-in:
  - The title is neutral ("Journey check").
  - It is a full-screen intent where `canUseFullScreenIntent()` allows, otherwise a high-priority notification.
  - `opened` is posted **only after** the check-in is confirmed shown.
- **V5** The normal PIN and the duress PIN produce **pixel-identical** screens, the same haptic, the same request shape and the same response delay.
- **V6** **A duress PIN anywhere is an alarm.** Entering it at any PIN prompt (check-in, guardian change, deletion, recovery, settings) emits a signed **duress signal** (§3): a `checkin_result` with `result: duress_pin` at a check-in, or a `pin_authorised` with `mode: duress` at any other prompt. The prompt shows its normal-looking outcome.
- **V7** Every event is signed with a P-256 key in Android Keystore (StrongBox when present). Salts and nonces come from native `SecureRandom`, never from JavaScript. Canonicalisation happens in the shared JS module (§5), and the bytes go to the native signer.
- **V8** Events go into one ordered, encrypted local queue. Delivery state is shown truthfully as queued → received (server receipt). The app never shows a generic "sent". **While an incident is open, the member's phone never shows a guardian acknowledgement, and incident events stay out of the in-app My Record timeline until the incident closes.** Guardians are alerted only after a duress signal or `no_answer`, so an acknowledgement on screen would tell a coercer holding the phone that duress was entered (S3, V5).
- **V9** Heartbeats go every 30 s while armed. They carry a speed bucket only, never location, and are **not** chain entries. Location is attached only to `signal_detected`.
- **V10** There is no boot receiver. After a reboot, a notification offers to re-arm.

### Guardian
- **G1** Guardian mode (same APK) unlocks only with a valid one-time code generated by the VIGIL user. The code is 6 digits plus a QR, single use, valid 10 minutes, 5 attempts, rate-limited per subject, per device and per IP. **Creating an invite needs a fresh PIN authorisation (§9).**
- **G2** The QR code is scanned with the Google code-scanner module, so no camera permission is needed.
- **G3** Every alert reaches the guardian as a **visible** high-priority notification (FCM), with a server-sent SMS fallback when the gateway is available.
- **G4** The alert screen leads with **"Don't call or text them. Call 10111."** Calling the user unlocks only after `stand_down` or incident closure. The SMS carries the same instruction.
- **G5** Acknowledgements (`called_10111 | handling | stand_down`) are signed with the guardian's own Keystore key. Updates to the guardian's notification token must also be signed with that key.
- **G6** On acceptance, the guardian sees and acknowledges a POPIA s18 notice.

### ANCHOR (server)
- **A1** One hash chain per subject; subject ids are random 128-bit values.
- **A2** Entry format per §4, canonical form per §5, Merkle per §6, auth and time per §7.
- **A3** Escalation is server-owned, durable and exactly-once in effect (§8).
- **A4** Anchoring per §10.
- **A5** `GET /v1/subjects/{id}/export` returns genesis → head with payloads, salts, proofs and receipts, unpaginated, to the authenticated subject only. **Exception, the pre-incident hold (§9, ADR-0041):** while an incident is open, and for 6 h after its last PIN entry, the member's own device receives the chain only up to the pre-incident head, identically for a normal and a duress authorisation. Export always needs a fresh `export` PIN authorisation (§9).
- **A6** Public endpoints reveal no personal data. The public proof is keyed by an **anchored chain head** and returns only a Merkle audit path and receipt, never a chain segment (§6).
- **A7** `/healthz` reports the last anchor time, the anchor queue depth, pending deadlines and the outbox backlog. A missed hourly anchor is logged as an alarm.

### Safety and security
- **S1** A bank risk signal is **never** sent from detection alone. It is sent immediately on a duress signal (§3). On `no_answer` or `contact_lost`, it is sent only if guardians were alerted and none sent `stand_down` within 3 minutes (ADR-0037). The `bank_signal_sent` payload records which of `duress_signal`, `no_answer` or `contact_lost` triggered it, so the bank and an insurer's investigator can weigh a timed-out hold differently from an explicit duress PIN — "Sibusiso confirms in contract v2".
- **S2** Guardian changes and deletion follow §9. PIN authorisation is required everywhere; a duress session turns these actions into convincing no-ops; a duress-session addition creates a decoy guardian; removals are delayed and never leave zero guardians.
- **S3** Nothing an attacker can observe reveals that duress was signalled: no visible SMS, no distinctive anchor timing (§10), no panel event, and no difference in the check-in (V5).
- **S4** No LLM, RAG or agent framework anywhere in the product (ADR-0038).

### Privacy
- **P1** Payloads and salts are stored separately and encrypted at rest. Deletion removes only those, and the chain stays verifiable.
- **P2** Payloads are retained for 90 days unless the user places a dispute hold. After deletion, the coarse class, time, actor, journey id, hashes and public keys remain (§13).

### Demo and deployment
- **D1** A signed release APK on GitHub Releases with a QR code, cold-installed on a clean phone by **Thu 24 Sep 22:00**. Backup owner: Mutarisi (§14).
- **D2** A thin end-to-end slice by **Fri 25 Sep 12:00**, built from the minimal deliverables in §14 (anchoring stubbed).
- **D3** The panel and verify page per §6, §10 and §12. Anything simulated is labelled SIMULATED on screen and aloud.

---

## 3 · Event taxonomy and evidence levels

`kind` lives **inside** the committed payload. The public `action` field carries only a coarse class.

| `kind` | Class (`action`) | Signer | When | Anchoring |
|---|---|---|---|---|
| `registration` (device) | `registration` | device key | subject created — chain genesis | hourly |
| `registration` (guardian) | `registration` | guardian key | guardian accepted | hourly |
| `key_revoked` | `server_event` | server | recovery completed (§9) | **immediate** |
| `journey_armed` / `journey_ended` | `device_event` | device | user arms / ends | hourly |
| `signal_detected` | `device_event` | device | detector above threshold (location attached) | hourly |
| `checkin_opened` | `device_event` | device | check-in confirmed on screen | hourly |
| `checkin_result` (`normal_pin` / `duress_pin`) | `device_event` | device | PIN entered | **immediate** |
| `pin_authorised` (`normal` / `duress`) | `device_event` | device | any PIN-gated action (§9) | **immediate** |
| `no_answer` / `contact_lost` / `answered_late` / `incident_closed` | `server_event` | server Ed25519 | §8 | **immediate** |
| `guardian_alerted` | `server_event` | server | outbox delivery (§8) | hourly |
| `guardian_ack` | `guardian_event` | guardian | G5 | hourly |
| `bank_signal_sent` / `bank_signal_ack` | `server_event` | server (ack countersigned by `sim_bank`) | S1 — payload records the triggering outcome (`duress_signal` \| `no_answer` \| `contact_lost`); "Sibusiso confirms in contract v2" | hourly |
| `guardian_added` / `guardian_removal_scheduled` / `guardian_removed` / `decoy_added` | `device_event` / `server_event` | device, then server | §9 | hourly |
| `recovery_performed` | `server_event` | server | §9 | **immediate** |
| `deletion_tombstone` | `server_event` | server | §13 | hourly |

**Duress signal.** There is **no separate `duress_pin` kind**. A *duress signal* is any one of:
- a `checkin_result` with `result: duress_pin`;
- a `pin_authorised` with `mode: duress`;
- an `answered_late` whose late result is `duress_pin` (§8).

Wherever this spec or ADR-0036/0037 says "on `duress_pin`", it means a duress signal. Every duress signal opens an incident, alerts guardians and sends the S1 bank signal immediately, unless that incident has already sent one.

**Evidence levels** are counted in **independent principals**, not signatures. The phone's detection and the user's PIN come from the same device and key, so together they are **one** principal. A server timestamp is not a witness. The levels are used by banks and insurers, never by us, to decide anything about a person.

| Level | Contains | Principals | Good for |
|---|---|---:|---|
| **E0** | device-signed signal | 1 | "something was heard" — never evidence alone |
| **E1** | + the user's check-in result (same device) | 1 | the user's own attributed account |
| **E2** | + a guardian's own-key acknowledgement | 2 | **the minimum for a claim or dispute** — it shows a second person was alerted and responded, not that they witnessed the event |
| **E3** | + an independent institution's record (bank, carrier, SAPS case number) | 3 | strong corroboration |

**Claim-grade** means at least **two independent principals and a public timestamp from before the money moved**. Missing corroboration never proves fraud and never decides a person's eligibility.

---

## 4 · Entry format (format v2)

The frozen `EvidenceEntry` shape is unchanged: `action, actor_id, target_type, target_id, details, ts, prev_hash, event_hash`.

- `event_hash = SHA-256(canonical(entry without event_hash))`, using §5.
- `ts` is the **signer's source time** (RFC 3339). The server's receipt time goes in `details.received_at`, and the chain position in `details.chain_index`. Both are hashed into `event_hash`, but neither is signed by the device.
- `prev_hash` of index 0 (genesis) is 64 zero hex characters. `target_type` is `journey` or `subject`, and `target_id` is the journey or subject id.
- `details` carries these fields:
  ```json
  {"v": 2, "signer": "device|guardian|server", "signer_key_id": "…", "counter": 17, "event_id": "uuid",
   "commitment": "hex(SHA-256(salt ‖ canonical(payload)))", "sig": "base64", "received_at": "…", "chain_index": 42}
  ```
- `payload` holds `kind` and every specific (for example `{"kind":"checkin_result","result":"duress_pin"}`). The salt is 16 bytes from the signer's native CSPRNG.
- **The signed statement binds the full event context** (B1). `sig` is the signature over:
  ```
  canonical({"domain":"vuka.event.v2", "subject_id", "actor_id", "target_type", "target_id", "action",
             "source_ts": ts, "signer_key_id", "counter", "event_id", "commitment"})
  ```
  `subject_id` is the subject the chain belongs to, taken from the authenticated request path (for journey-targeted entries, the journey's subject). For the genesis `registration`, the actor check uses the `signer_pubkey` carried in that entry, because no key is registered before it (Sibusiso confirms in contract v2).
  The verifier rebuilds this statement from the outer fields and `details`. `actor_id` is inside the signature and must also equal the id registered for `signer_key_id`. If `action`, `actor_id`, `target_type`, `target_id`, `ts` or `commitment` changes, the signature fails. Negative vectors cover each field (T21).
- **Registration entries** also carry `signer_pubkey` (SPKI, base64) in **plain** `details`. A public key is not personal information, and it keeps signatures checkable after payloads are deleted. The attestation stays inside the commitment.
- **Idempotency and replay** (§7): an identical retry returns the original receipt. A reused `event_id` with different content is rejected (409). Any unseen `counter` is accepted, and exact repeats are rejected. The `event_id` lookup runs **before** the nonce and counter checks (§7, order of checks), so a retry after a lost response is answered, not rejected as a replay.
- **Legacy format v1** (PR #39: genesis `prev_hash = null`, floats accepted, no signed statement) is verified by a separate legacy path and never produced again. Format v1 and v2 entries never mix in one chain.

> **§4a accepted 24 September 2026 (ADR-0042).** Proposed by Sibusiso; accepted by Lethabo, as co-lead and after a security review, with three security amendments folded into the text below: the verifier rebuilds keys from the chain, no server keys are held in the table, and one key per device or guardian, with the revocation time exported. Sibusiso confirms the amendments on the PR that records this.

### 4a · Device and guardian key registry (ADR-0042)

- **Storage:** a `signer_keys` table, one row per registered key: `subject_id, signer_key_id, signer_role (device|guardian), public_key, revoked_at, revoked_reason`. **Server keys are never stored here.** They come only from the pinned key manifest in `contracts/keys/` (§10), so a database write can never add a server key (ADR-0042). Not a new concept — this is where §4's "the id registered for `signer_key_id`" (line 140) actually lives.
- **Encoding:** `public_key` is stored exactly as transmitted — SPKI, base64 — matching the `signer_pubkey` encoding §4 already specifies for registration entries (line 141). No new encoding is introduced.
- **Enrollment:**
  - The genesis `registration` entry's `signer_pubkey` (plain `details`, §4 line 141) is the subject's first `device` key. The server inserts it into `signer_keys` when it accepts that entry — this is the one case §4 already names where "no key is registered before it" (line 139).
  - A guardian's key is inserted on **guardian-accept** (§9 governance table, "add guardian"): the accept event carries the guardian's `signer_pubkey` the same way registration does.
  - A device key from **recovery** (`POST /v1/devices/recover`, `new_device_key`) inserts a new `signer_keys` row and sets `revoked_at` on the prior device key to the recovery's server receipt time — this is the `key_revoked` behaviour §9 already names, just naming where it's stored.
- **Active-key resolution at verification time:** for a given `signer_key_id`, the request is authenticated only if `signer_keys.revoked_at IS NULL` for that row. A subject has at most one non-revoked **device** key at a time, and each guardian has at most one non-revoked key (a subject can have several guardians, so this is per guardian, not per role) — recovery revokes the old row in the same transaction that inserts the new one (row-locked, matching §8's `SELECT … FOR UPDATE` pattern). There is deliberately no "most recent wins" rule: an un-revoked prior key stays valid until recovery explicitly revokes it, so a stale key never silently loses authority.
- **Journey-to-subject ownership** (§7's auth order of checks, step 1): a request's `signer_key_id` resolves to exactly one `subject_id` via `signer_keys`. For a journey-targeted entry, the journey's own `subject_id` (set at journey creation, `POST /v1/journeys`) must equal the resolved `subject_id` — a key belonging to subject A can never write to subject B's journey or chain, checked before authentication succeeds.
- **Verification never trusts `signer_keys` (ADR-0042).** `signer_keys` is the server's working copy. The record of truth is the chain.
  - A verifier, including a stranger with only the export, rebuilds the registry from the chain itself: registration, guardian-accept and recovery entries carry `signer_pubkey` in plain `details`.
  - Each `key_revoked` entry carries the revoked `signer_key_id` in plain `details` as `revoked_key_id` (contract v2 adds the field), and the export includes these entries.
  - An entry signed by a key verifies if its `details.received_at` is **before** the `received_at` of that key's `key_revoked` entry. An entry received at or after it is rejected (§9 key revocation).
- **Out of scope for 4a:** ML-DSA-65 keys (§10 names them as "if built" — not yet), key rotation outside recovery, and the guardian decoy-key behaviour under duress (§9's decoy guardian never receives a real key registration — it's `signer_keys`-invisible by design, already covered by §9, not repeated here).

---

## 5 · Canonical form

The bytes are UTF-8 of Python `json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)`. PR #39's implementation (`anchor/chain.py:65`) already hashes these compact bytes. `anchor/README.md` now states the compact form, and #39's stale docstring is corrected in its format-v2 rework (#39 is not merged).

Rules:
1. Object keys are ASCII only, sorted by code point, recursively.
2. Non-ASCII string content is escaped as `\uXXXX` in lowercase hex, and characters outside the BMP as UTF-16 surrogate pairs (this matches Python).
3. **No floats anywhere in a hashed or signed object.** Scores are integer basis points, and times are RFC 3339 strings with seconds and an offset.
4. Integers stay within ±(2^53 − 1).
5. There is one JS implementation (`shared/canonical.js`), used by the app and the verify page, and one Python implementation in `anchor/`. **There is no Kotlin canonicaliser.**
6. Golden vectors live in `contracts/vectors/canonical.json`: ASCII, Afrikaans ê/ë, isiZulu text, an emoji, nesting, empty containers and the maximum safe integer. **Rejection vectors** (a float, a non-ASCII key, 2^53, a duplicate key) must fail in both languages. Checked by pytest and vitest.
7. Android Keystore returns ECDSA signatures in **DER**; `shared/der.js` converts them to raw `r‖s` for WebCrypto. One golden vector uses a real signature and public key captured from a phone's Keystore (T03), delivered by Vukosi to Ipeleng.

---

## 6 · Merkle, batches and proofs

- **Tree (RFC 6962):**
  - leaf = `SHA-256(0x00 ‖ raw 32-byte chain head)`;
  - node = `SHA-256(0x01 ‖ left ‖ right)`;
  - split at the largest power of two strictly less than n (for n = 2…8: 1, 2, 2, 4, 4, 4, 4), with no duplication of odd leaves.
- **Leaves:** the heads of subject chains that changed since the last **confirmed** anchor, ordered by raw head bytes ascending.
- **Batches:**
  1. At submission time the server snapshots its leaves into an `anchor_batches` row (`pending → submitted → confirmed | failed`).
  2. A failure retries the **same** batch, with the same root, until it is confirmed.
  3. Heads that change after the snapshot go into the next batch.
  4. **Empty window: nothing is submitted.** An empty tree (n = 0) is never anchored and is covered by a rejection vector.
- **Proof encoding:** an ordered list of `[{"side": "L|R", "hash": "…"}]` from the leaf to the root. `side` is the side the **sibling** hash sits on. Immediate and hourly roots use the same leaf rule. A head already inside a submitted, unconfirmed batch is not re-included, because that batch retries until it is confirmed (Sibusiso confirms with the vectors). Vectors cover n = 1…8, and n = 0 as a rejection.
- **Public proof** (`GET /v1/anchor/proof/{head_hash}`): keyed by an anchored **head**. It returns the audit path and receipt only. Linking an interior event to that head requires the chain segment, which comes only in the subject's authenticated export. The public can't learn anything about later events.
- **Verification binds the ledger message to this export's root** (B2). The verify page:
  1. recomputes the root from the export;
  2. fetches the message from the public mirror node (`GET /api/v1/topics/{topic}/messages/{sequence}`);
  3. **decodes the message bytes**, checks the type byte `0x01`, and requires the 32 bytes to equal the recomputed root;
  4. checks the consensus timestamp and running hash;
  5. accepts only the **pinned** network, topic id and key-manifest fingerprint (§10), which are built into the verify page and committed in `contracts/keys/`.

  A genuine receipt from another batch, or any other topic, is rejected (T22).

---

## 7 · Auth, time and replay

- **Request signing:** devices and guardians sign every request with their Keystore key, over `canonical({method, path, ts, body_sha256, nonce})`.
- **Nonces:** scoped per signer key and retained 24 h. A nonce never creates new state twice.
- **Counters:** scoped per signer key. Any unseen value is accepted; exact repeats are rejected.
- **Retries:** a retry sends the **same** signed bytes. A new signature over the same `event_id` with different content is rejected.
- **Order of checks** for any request that carries an event:
  1. Authenticate the request signature and the key's status (revocation, §9).
  2. **Idempotency lookup by `event_id`.** If an entry with this `event_id` exists with the identical `commitment` and event `sig`, return its **original receipt** and create nothing. If it exists with different content, reject with 409.
  3. Only for an unseen `event_id`: the nonce, counter and clock-skew checks, then the append.

  So a phone whose response was lost always gets its receipt on retry, and a replayed request never creates a second entry (T06). A request without an event, such as a heartbeat, is simply rejected if its nonce was seen before.
- **Clock skew:** more than 120 s is rejected, **except** for `checkin_opened`, `checkin_result` and `pin_authorised`, the kinds that carry every duress signal (§3). Those are accepted and flagged `clock_skew`. The exemption relaxes **only** the skew check. Authentication, key revocation (§9) and action authority still apply in full.
- **Deadline authority** (B4): every deadline is computed from **server receipt time**, never from the device's `ts`.
  - The device-chosen check-in window is limited to the allowed values of 20 s or 60 s.
  - A device timestamp in the future can never extend a deadline.
  - An `opened` that arrives late starts its deadline at receipt, and the lateness is recorded (`opened_late`).
- Public endpoints need no auth.

---

## 8 · Escalation — server-owned, durable, exactly-once in effect

- **Outcome arbitration** (B3). Each check-in has a row in `checkins`, locked with `SELECT … FOR UPDATE` whenever an outcome is decided.
  - The first terminal outcome wins and is written once: `checkins.outcome ∈ {normal_pin, duress_pin, no_answer}`.
  - A result arriving after `no_answer` is still appended as the device-signed `checkin_result`, and the server then appends `answered_late` carrying that result. It **never retracts** the alert.
    - A late **normal** PIN: guardians see "answered late".
    - A late **duress** PIN is a duress signal (§3). Guardians see "duress PIN entered", and the S1 bank signal goes immediately unless this incident already sent one. The phone still shows its normal-looking outcome.
  - A normal response racing the timeout therefore yields exactly one terminal outcome (T23).
- **Transactional outbox.** The same transaction that writes an outcome also writes `outbox` rows: `guardian_alert`, `bank_signal` (with `not_before` = +3 min where S1 requires), and `anchor_request`.
  - Each row carries an idempotency key.
  - A worker delivers at-least-once and marks rows done. Receivers dedupe by that key: an FCM collapse key, and the `sim_bank` `Idempotency-Key` header.
  - A crash after commit resends the effect; a crash after sending but before marking done duplicates nothing visible.
- **Deadlines.**
  - Table `escalation_deadlines(checkin_id, kind, due_at, status)`.
  - `no_answer` is due at the **server receipt time** of `opened`, plus the window, plus 10 s grace.
  - **Fallback deadline (G34, ADR-0041).** When `signal_detected` is received, the server also schedules `no_answer_fallback`, due at that receipt time plus the journey's check-in window plus 30 s. An `opened` arriving before it cancels the fallback, and the normal deadline above applies. If no `opened` ever arrives (notifications revoked, the app killed, the check-in never rendered), the fallback fires as `no_answer`, with the same effects.
  - **Wrong PINs at a check-in (T47, ADR-0041).** Each wrong PIN shows the same neutral "Try again", with identical wording and timing. The counter is per check-in. From the **third** wrong attempt, the outcome is fixed as `no_answer` at the deadline. Any later entry shows the same "Checked in" screen a correct PIN shows, so the check-in never works as a PIN oracle beyond three guesses. That entry is still appended as a device-signed `checkin_result`, and a duress PIN among them is a duress signal handled as a late duress PIN (above). No lockout is ever shown.
  - One scheduler holds the lock on a dedicated connection and re-checks it every tick, polling every second.
- **`contact_lost`:** heartbeats stop for 90 s **while an incident is open** (see below). It never fires after the incident closes.
- **Incidents.**
  - An incident opens on `signal_detected`, a duress signal (§3), `no_answer` or `contact_lost`.
  - It closes on a guardian `stand_down`, or automatically 6 h after the last signal with heartbeats present and guardians notified, or by the member-ended closure below.
  - **A normal PIN at a check-in never closes an incident on its own**, because a coercer can force it.
  - **Member-ended closure (G33, ADR-0041).** Ending the journey with a normal-PIN authorisation (G35 below) closes the incident only when all three hold: every check-in outcome in it is `normal_pin`, no guardian alert has been sent in it, and it holds no duress signal. That is the false-alarm case: a TV scream, answered normally, then the journey ended. Otherwise the incident stays open until `stand_down` or the 6 h close.
  - **`contact_lost` after a normal-PIN outcome (G33, ADR-0041).** If an incident's check-in outcomes are all `normal_pin` and heartbeats stop for 90 s, `contact_lost` alerts guardians and **never sends the bank signal**. The bank signal stays for a duress signal and for `no_answer` (S1).
  - **Ending a journey needs a PIN (G35, ADR-0041).** `journey_ended` is accepted only with a fresh `pin_authorised` for action `end_journey` and the journey's id. A **normal** PIN ends the journey. A **duress** PIN makes the phone behave exactly like a normal end: the same "Journey ended" screen, and the service stops. The server records a duress signal (§3), opens or keeps the incident, alerts guardians and sends the S1 bank signal. It does not wait for heartbeats that will never come.
  - `incident_closed` is a server event, anchored immediately. Its payload carries `reason ∈ {stand_down, auto_6h, member_ended}`.
- **Chain appends:** `SELECT … FOR UPDATE` on `subject_heads(subject_id)`, plus `UNIQUE(subject_id, chain_index)`. No advisory-lock hashing.
- **Tests (T08):** restart the server (a) between `opened` and the deadline, (b) between committing the outcome and sending, and (c) between sending and marking done. Every case must still produce exactly one visible alert.
- **Agreed fallback (Sibusiso):** if T08 isn't passing by **Fri 18:00**, anchoring stays stubbed and durable escalation takes priority.

---

## 9 · PIN authority, guardians and recovery (ADR-0036)

- **PIN authority** (B5): the PIN is verified **on the device**, against an Argon2id hash in Keystore-wrapped storage. The device then signs a `pin_authorised` statement bound to one specific action. The server accepts a PIN-gated action only with a fresh, unexpired authorisation for **that exact action and target**. Device possession or a device signature alone is **never** PIN authority.

  ```
  pin_authorised (device-signed) = {action, target_id, mode: normal|duress, nonce}
  ```

  The device signs `{action, target_id, mode, nonce}` — it cannot know the server's receipt time, so `expires_at` is never part of the signed statement. **The server** records `expires_at = received_at + 120 s` on receipt, alongside the signed fields — "Sibusiso confirms in contract v2". `mode` sits inside the committed payload, so the server sees it and the public never does.

| Action | Normal PIN | Duress PIN | During an open incident |
|---|---|---|---|
| Add guardian (create invite) | Allowed; **existing guardians notified, naming the added guardian** | **Decoy guardian**: the accept succeeds, it never receives alerts, and real guardians are told "a guardian was added under duress" | Allowed; existing guardians notified, naming the added guardian |
| Remove guardian | **Scheduled, silent, effective after 24 h**; the removed guardian keeps receiving alerts until then and is never told. **The remaining guardians are notified, naming the removed guardian.** **The last guardian can't be removed** until a replacement has been accepted | Looks done, does nothing | Deferred until the incident closes |
| Delete evidence | 72 h cooling-off, then removed; guardians notified | Looks done, does nothing | Blocked |
| Recover to a new device | Allowed, rate-limited; guardians notified; the old key is revoked (`key_revoked`); 24 h freeze on guardian changes, deletion and bulk export (`GET /v1/subjects/{id}/export`) — confirmed at P3.L8, ADR-0041 | **Not available on a new device (it holds no PIN hash).** Recovery on a new device is gated by the recovery code, guardian notification, the open-incident block and the 24 h freeze instead — confirmed at P3.L8, ADR-0041 | Blocked |
| End a journey (ADR-0041) | Ends the journey; closes the incident only under the member-ended rule (§8) | Looks exactly like a normal end; full alarm server-side (§8) | Normal: allowed, closes only under §8's rule. Duress: full alarm |
| Export or view My Record on the member's phone (ADR-0041) | Needs a fresh authorisation for action `export`. Returns genesis → head, except during the **pre-incident hold** below | Same response as a normal PIN during the hold | Pre-incident hold applies |

- **Pre-incident hold (T30 and the 6 h hold, ADR-0041).** An incident's *pre-incident head* is the chain head just before its first event. While an incident is open, and for 6 h after the last PIN entry in it (whichever ends later), everything the member's own device can read ends at that head: export and My Record, for a normal or a duress authorisation alike. A chain prefix still verifies, so what a coercer sees is a real, checkable record with nothing new in it. Guardians, and the public proof for `sim_` subjects, are unaffected.
- **A duress no-op keeps showing success (ADR-0041).** After a duress removal's 24 h or a duress deletion's 72 h has passed, the phone keeps showing the action as done, indefinitely. Correcting the lie while a coercer may still hold the phone could endanger the member. The true state is visible to guardians, and on a new device after recovery.
- **Removal trade-off, stated:** someone removing an abusive guardian keeps that guardian on alerts for up to 24 h. In return, a forced removal can't disarm the next emergency **within one forced session**, and nobody is ever left with zero guardians.
- **Multi-session replacement risk (Ipeleng's review, B1).** The never-disarm property holds within one forced session. Across two forced normal-PIN sessions, an attacker's own accepted add (session 1) can become the "replacement" that unlocks the removal the attacker scheduled of the last real guardian (session 2), leaving the attacker as the sole guardian. This qualifies ADR-0036(5) — read that clause as holding for the single-session case only. Notifying the remaining guardians of every addition and every scheduled removal, naming the other party, is the control: a victim's trusted guardians see the attacker's add and the scheduled removal in time to act, even though the removed guardian is still never told (the silence rule that protects a victim removing an abusive guardian is unchanged). Recorded in `docs/ADR-ACCEPTANCE-RECORD.md`.
- **Key revocation:** a key is revoked at the server receipt time of recovery. Events signed by a revoked key and received after revocation are rejected. The revocation is a chain entry.
- **Guardian enrolment authority:** an invite exists only through a fresh PIN authorisation. Accepting it binds the guardian's key and FCM token, and later token updates are signed by the guardian key.
- **Recovery:** a 10-word code is shown once at onboarding. The lookup handle is SHA-256 of the first two words, and the code is verified with Argon2id. **If the recovery endpoint is cut, no code is shown at all.**
- **Two-signature rule (narrowed):** two distinct operators sign operator-initiated deletion, detection-threshold changes and signing-key rotation.

---

## 10 · Anchoring

- **Topic:** a Hedera Consensus Service topic created **with a `submitKey`** held server-side.
- **Typed messages, 33 bytes each** (S3):
  - `0x01 ‖ Merkle root (32 bytes)`;
  - `0x02 ‖ SHA-256(key manifest) (32 bytes)`, where the key manifest lists the server's Ed25519 key, plus the ML-DSA-65 key if built. The manifest itself is committed in `contracts/keys/` and served by the API.

  The manifest message is published **before the first batch** (Thursday spike). A key change, such as adding ML-DSA later, publishes a new `0x02` message, which starts a new key epoch. No personal data and no key material ever go on the ledger — only these 33-byte messages.
- **Immediate anchoring with coalescing** (B6):
  - Every **PIN-gated outcome** triggers an immediate root, normal or duress, at a check-in or at any other prompt: `checkin_result` and `pin_authorised` (which carry every duress signal, §3), plus the server outcomes `no_answer`, `contact_lost`, `answered_late`, `incident_closed`, `recovery_performed` and `key_revoked`.
  - Immediate roots are **coalesced into at most one per 60 s window**. The public topic therefore shows only that *some* PIN-gated event happened in that minute, never which kind.
  - Precedence over a transfer made minutes later still holds.
  - **Hourly:** one root covering everything else that changed.
- **Parity limits, stated:** device-side request shape and response delay are made identical (V5). Server-side work, such as guardian delivery, differs by design and isn't observable on the victim's phone. Anyone who can watch the public topic sees only minute-level activity.
- **Cost** `ESTIMATE`:
  - hourly roots = 720 × $0.0008 ≈ **R9.34/month** at R16.21/USD (22 Sep 2026);
  - immediate roots are capped at 1 440/day ≈ **R560/month worst case**, **however many members there are**;
  - so anchoring is bounded at about **R570/month** — a fixed ceiling, not a per-member cost (`scripts/economics_vigil_anchor.py`).
- **OpenTimestamps:** the day's roots are stamped daily, with multi-calendar submission and a scheduled `ots upgrade` (ADR-0028).
- **Post-quantum** (on the cut line): each root is signed with Ed25519 and ML-DSA-65 (FIPS 204). The signatures are stored off-chain with the receipt and verified in the browser, backed by a cross-verification vector. Scope: this protects the authorship of our roots, not Hedera's consensus. SHA-256 keeps 128-bit security under Grover's algorithm.
- **Testnet resets** (A2, S9): the demo runs on **testnet**, labelled as such, and Hedera resets testnet periodically.
  - Receipts record a **topic epoch** (network, topic id, reset generation).
  - Before Friday, check `status.hedera.com` and Hedera's testnet reset notices.
  - After a reset, re-anchoring creates a **later** publication under a new epoch, never presented as the original.
  - The verify page shows one of three states: **live-verified** (read from the public mirror now), **archived** (a stored mirror response, labelled "archived — not independent") or **unavailable**.
  - The demo recording is the last fallback.

---

## 11 · Android constraints → UX requirements

| Platform fact | Requirement |
|---|---|
| A microphone foreground service cannot start from the background or `BOOT_COMPLETED` (Android 14+) | V1, V10: journey mode only; a reboot disarms |
| `startForeground` with an ungranted type throws `SecurityException` | V2: build the service type from the granted permissions; test each denial |
| With `POST_NOTIFICATIONS` denied, the check-in never appears | V1: refuse to arm; V4: `opened` only after the check-in is shown |
| The microphone privacy indicator can't be hidden (Android 12+) | Copy says **"discreet"**, never "invisible" |
| Background data use needs a persistent notification (Play stalkerware policy) | V2 |
| The Accessibility API is for accessibility tools only | No blocking of banking apps; bank signal via a partner API (ADR-0037) |
| SMS sent by a non-default SMS app lands in the Sent folder | No SMS from the device, ever (S3) |
| Hermes (RN 0.74) has no `crypto.getRandomValues` by default | V7: native `SecureRandom` |
| Keystore ECDSA output is DER; WebCrypto expects raw | §5 rule 7 |
| Play Integrity needs Play Store distribution | The sideloaded demo uses key attestation, labelled `stored_unverified` unless the chain is verified. A signature proves a key was used, not that the input was genuine |
| Budget brands (Tecno, Itel, Xiaomi) kill foreground services | Measure heartbeat continuity (M5) and publish it |

**Judge-build permissions:** `RECORD_AUDIO`, `ACCESS_FINE_LOCATION` (foreground only), `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MICROPHONE`, `FOREGROUND_SERVICE_LOCATION`, `USE_FULL_SCREEN_INTENT`, `INTERNET`. **Not** `CAMERA`, `SEND_SMS`, `ACCESS_BACKGROUND_LOCATION` or `RECEIVE_BOOT_COMPLETED`. T17 names the Android version and API level it tests against.

---

## 12 · Contract v2 (Sibusiso authors it in `contracts/openapi.yaml`; needs both leads + an ADR)

The v1 schemas `EvidenceEntry`, `IntegrityResult`, `AnchorStatus` and `SubjectRecord` are preserved. The v1 UMOJA paths are marked `deprecated: true`, not deleted. `DeletionRequest` is kept for operator deletion. **v2 is not frozen until B1–B5 are reflected in the schemas.**

| Method + path | Auth | Purpose |
|---|---|---|
| `POST /v1/subjects` | device-signed | create subject + genesis registration |
| `POST /v1/devices/recover` | recovery code | §9 |
| `POST /v1/journeys` · `/{id}/heartbeat` · `/{id}/end` | device | V1, V9 |
| `POST /v1/events` | device | signed entry → `{event_hash, chain_index, received_at}` |
| `POST /v1/checkins/{id}/opened` · `/{id}/result` | device | V4, V5, §8 |
| `POST /v1/pin-authorisations` | device | §9: a `pin_authorised` statement scoped to one action |
| `POST /v1/guardians/invites` · `POST /v1/guardians/accept` · `DELETE /v1/guardians/{id}` · `PUT /v1/guardians/{id}/token` | device + PIN authorisation / guardian | G1, G5, §9 |
| `POST /v1/alerts/{id}/ack` | guardian | G5 |
| `GET /v1/anchor/latest` · `GET /v1/anchor/proof/{head_hash}` | public | A6, §6 |
| `GET /v1/subjects/{id}/export` · `GET /v1/subjects/{id}/record` · `DELETE /v1/subjects/{id}/data` (`SubjectDeletionRequest`) | subject | A5, §9, §13 |
| `GET /healthz` | public | A7 |
| `WS /ws/panel` | public | opaque hashes, chain index, receipts; event kinds **only for `sim_` subjects**, labelled |
| `POST /sim_bank/v1/risk-signal` · `/release` | ANCHOR-signed, `Idempotency-Key` | S1, labelled SIMULATED |

`test/openapi-contract.test.mjs` and `scripts/check-docs.mjs` are updated in the same PR as the contract.

---

## 13 · Privacy and retention

- **Lawful basis:** the user's consent (s11(1)(a)) for their own journey data; the guardian's own consent, with the s18 notice at acceptance (G6), for guardian data.
- **Retention:** payloads and salts are kept for 90 days unless the user places a dispute hold. What remains after deletion is the coarse class, time, actor id, journey id, hashes and public keys. The legal reason is the integrity of the evidence chain the user asked us to keep; this is stated in the privacy policy.
- **Operators named in the privacy policy:** hosting and region (South Africa North if the student subscription allows; otherwise the s72 basis is documented), Google (Firebase Cloud Messaging), the SMS gateway, and Hedera (public anchor, hashes only).
- **Never collected:** raw audio (never stored; only labels and scores), camera images, contacts beyond the chosen guardians, banking credentials.
- **Never on chain:** anything but the 33-byte typed messages of §10.

---

## 14 · Scope, milestones, fallbacks and cut line

Minimal deliverables come **before** their consumers (B7). "Min" means the smallest version that unblocks the next person, not the full delivery.

| When (SAST) | Milestone | Owner |
|---|---|---|
| Wed 23 | Pivot PR merged. **Pre-event building confirmed by the organisers (23 Sep)** | Lethabo |
| **Thu 24 09:00** | Canonical and Merkle vectors, including rejection vectors (Python reference) | Sibusiso |
| Thu 24 12:00 | Contract v2 (B1–B5 reflected) + pinned mock server | Sibusiso |
| Thu 24 12:00 | PIN-authority and incident rules agreed (§8, §9) | Lethabo · Ipeleng |
| Thu 24 14:00 | `shared/` canonical, DER and Merkle passing the vectors | Ipeleng |
| Thu 24 14:00–16:00 | Hedera spike: topic with `submitKey`, key-manifest message, mirror read-back | Sibusiso |
| **Thu 24 22:00** | **Signed release APK cold-installed from the QR** (D1) + T17 | Vukosi (backup: Mutarisi) |
| Fri 25 09:00 | **Server-min** deployed: ingest + chain + export (no escalation, no anchoring) | Sibusiso |
| Fri 25 10:00 | **Verify-min:** hashes, links and device signatures (no mirror yet) | Ipeleng |
| Fri 25 10:00 | **Guardian-min receiver:** a debug screen in the APK that shows a raw FCM alert from the server | Mutarisi · Khutso |
| **Fri 25 12:00** | **Thin end-to-end slice** (D2): APK → server-min → export → verify-min | Vukosi · Sibusiso · Ipeleng |
| Fri 25 16:00 | Hackathon starts; repo tagged `pre-hackathon-baseline` | Lethabo |
| Fri 25 18:00 | T08 passing, or anchoring stays stubbed (Sibusiso's fallback) | Sibusiso |
| Fri 25 23:59 | Full server: escalation, outbox, anchoring | Sibusiso |
| Sat 26 11:00 | SSDLC internal deadline (programme deadline 12:30) | Ipeleng |
| Sat 26 12:00 | User conversations (5) + one bank or insurer approach recorded | Babatunde |
| Sat 26 18:00 | Measurements with n (§16); UI complete; full verify page | Vukosi · Mutarisi · Ipeleng |
| Sat 26 night | Lean Canvas on Sonke, with figures | Babatunde |
| Sun 27 08:30 | Final gate | Lethabo |
| **Sun 27 09:00** | **Final submission** | Babatunde · Lethabo |

**If the APK is not cold-installing at Thu 22:00:** Mutarisi takes over the release build on Friday morning with Vukosi. Until then, the demo phone runs a USB-installed debug build, and we say so. The QR download on the slide appears only once a release build installs cold.

**If the organisers had ruled out building before Fri 16:00** *(not needed — pre-event building was confirmed on 23 Sep; kept for the record)*:
- Product work stops at once. Nothing built after the ruling merges before 16:00.
- `pre-hackathon-baseline` then holds only what is already on `main`: specifications, ADRs, contracts and vectors, the governance files, and the lineage anchor library from PR #39. We declare the baseline to the judges.
- Thursday is used for setup only: accounts (Hedera testnet, Azure, Firebase), toolchains, Figma, test phones, and an empty signed-APK pipeline with no product code.
- From Fri 16:00, the "never cut" list below is rebuilt live with the cut line applied. The Friday-noon slice moves to Sat 12:00, and the remaining milestones shift by half a day.

**Cut line, cutting from the top first:**
1. stretch detectors;
2. OpenTimestamps daily job;
3. ML-DSA signing (fall back to the documented outline);
4. decoy guardian (keep the PIN-gated no-op);
5. SMS gateway (push only);
6. recovery endpoint (and then **show no code**).

**Never cut:** per-subject signed chains, export and verify; server-owned durable escalation with the outbox; identical duress UI; "Don't call or text them"; PIN-authorised guardian changes, removal delay and never-zero; honest labels.

---

## 15 · Acceptance tests

Each test is executable or a recorded observation, named in the PR that delivers it. Ipeleng's test specifications (P3.S3) give each one its fixture, oracle and prerequisites. The **Needs** column lists the prerequisites that must exist first.

| ID | Test | Reqs | Needs |
|---|---|---|---|
| T01 | Canonical vectors identical in pytest and vitest; rejection vectors fail in both | §5 | pinned runners and vector files |
| T02 | Merkle vectors n = 1…8 identical; n = 0 rejected | §6 | same |
| T03 | A real Keystore DER signature verifies on the verify page after conversion | §5.7 | a phone-captured signature and key fixture (Vukosi → Ipeleng) |
| T04 | Altered export (payload, outer metadata, chain link, signature, each separately) → verify reports the first broken index | A5 | implemented export |
| T05 | A forged server-authored chain with a substituted key is rejected against the pinned key manifest | §4, §10 | key bootstrap |
| T06 | An identical retry returns the original receipt, including a retry sent after the first response was lost (same nonce); a reused `event_id` with changed content → 409; an unseen out-of-order counter is accepted; a replayed request creates no second entry | §4, §7 | — |
| T07 | Force-stopping the app after `opened` still produces `no_answer` and a guardian alert within window + grace + 5 s | §8 | real app, persistent server, guardian receiver |
| T08 | Restart at the deadline, after the outcome commit, and after send → exactly one visible alert each time | §8 | real PostgreSQL, controlled crash points |
| T09 | A late normal PIN after `no_answer` never retracts the alert; a late **duress** PIN is treated as a duress signal (guardians told, bank signal sent once) while the phone shows the normal outcome | §3, §8 | controlled clock |
| T10 | Once the incident closes, a dead zone produces no `contact_lost` | §8 | controlled clock |
| T11 | Detection alone → no bank signal; duress PIN → immediate; `no_answer` → only after 3 min with no `stand_down`; no duplicate after a restart | S1, §8 | `sim_bank` + controlled time |
| T12 | A guardian change without PIN authorisation is rejected; duress removal is a no-op; duress addition creates a decoy and notifies real guardians | S2, §9 | PIN-authorisation fixture |
| T13 | Recovery is blocked during an open incident; a successful recovery notifies guardians and revokes the old key | §9 | recovery endpoint, or recorded as cut |
| T14 | Invite-code brute force is rate-limited per subject, device and IP | G1 | observable rejection |
| T15 | Normal vs duress check-in: pixels identical, request shape identical, response delay within ±50 ms. Haptic parity is a manual observation | V5 | screenshot diff + timing harness |
| T16 | A duress PIN at the settings prompt raises the guardian alert and the bank signal | V6 | PIN-authorisation fixture |
| T17 | Deny each permission in turn on a named Android version: no crash, a clear explanation, no false `no_answer` | V1, V2, V4 | real device |
| T18 | Salts come from the native CSPRNG (code inspection) and are 16 bytes and distinct across 1 000 events | V7 | — |
| T19 | Public proof and panel show no chain segment and no event kinds for non-`sim_` subjects; export requires subject auth | A6 | `sim_` and non-sim fixtures |
| T20 | Cold install from the GitHub Release QR on a clean phone; APK digest and OS recorded; no repository access needed | D1 | a public release asset |
| **T21** | Changing `action`, `actor_id`, `target_type`, `target_id`, `ts` or `commitment` invalidates the device signature | §4 (B1) | negative vectors |
| **T22** | A correct export paired with another batch's receipt, or with another topic or key, is rejected | §6 (B2) | two real batches |
| **T23** | A normal result racing the `no_answer` deadline yields exactly one terminal outcome | §8 (B3) | controlled clock |
| **T50** | Member-ended closure (G33): a detection, a normal PIN, then `end_journey` with a normal PIN closes the incident with `reason: member_ended`, and a later dead zone produces nothing. The same sequence with a guardian alert already sent, or with any duress signal, leaves it open. `contact_lost` after all-normal outcomes alerts guardians and sends no bank signal | §8 (ADR-0041) | controlled clock, `sim_bank` |
| **T51** | Fallback deadline (G34): `signal_detected` with no `opened` escalates as `no_answer` at receipt + window + 30 s; an `opened` before then cancels the fallback, and exactly one terminal outcome results | §8 (ADR-0041) | controlled clock |
| **T52** | PIN-gated journey end (G35): `journey_ended` without a fresh `end_journey` authorisation is rejected; with a duress authorisation, guardians are alerted and the bank signal is sent once, while the phone's screen and request shape match a normal end (the T15 harness) | §8, §9 (ADR-0041) | PIN-authorisation fixture, T15 harness |
| **T24** | A scheduled removal takes effect only after 24 h; removing the last guardian is refused until a replacement is accepted; remaining guardians are notified of an addition or a scheduled removal, naming the other party; the two-session replacement path (an accepted add later counted as the "replacement" for a scheduled removal) is exercised, or recorded as an observation if not automatable by Thursday | §9 (B1) | controlled clock |

| **T30** | During an open incident, and for 6 h after its last PIN entry, the member-device export and My Record end at the pre-incident head for a normal and a duress authorisation alike (byte-identical responses), and the prefix verifies. Export without a fresh `export` authorisation is rejected | §9 (ADR-0041) | implemented export, PIN-authorisation fixture |
| **T47** | Wrong PINs at a check-in: attempts 1–3 each show the identical "Try again" (T15 harness); after the third, the outcome is `no_answer` at the deadline; a later normal PIN shows "Checked in" and doesn't stop it; a later duress PIN is a duress signal (bank signal once) | §8 (ADR-0041) | controlled clock, T15 harness |

---

## 16 · Measurement plan (build the instrument before the claim)

| ID | Measure | Method | Owner |
|---|---|---|---|
| M1 | Detection recall | `scripts/eval_yamnet.py` on FSD50K "Screaming" and ESC-50 "glass_breaking"; clip lists committed, audio not; licences checked | Vukosi |
| M2 | False alarms per armed hour | 30 min of consenting team-recorded ambient audio (car radio, taxi rank, TV) | Vukosi |
| M3 | Detection → guardian **display** latency | Both phones NTP-synced (checked before each run); detection time logged on the user's phone and notification display time logged on the guardian's; n ≥ 30. The server-side interval (receipt → FCM accepted) is reported separately and never called delivery | Vukosi · Khutso |
| M4 | Battery drain per armed hour | Cheapest available phone, `batterystats` | Vukosi |
| M5 | Heartbeat continuity | Tecno/Itel/Xiaomi-class phone, 30 min, screen off | Vukosi |
| M6 | Delivery | Push vs SMS vs lost, with data off on the guardian phone | Khutso |
| M7 | False `no_answer` rate | 30-minute passenger-held drive, no interaction | Vukosi |

Every result goes into `docs/EVIDENCE.md` with its method, configuration and n. "Not measured" stays the answer until it is measured.

---

## 17 · What we do not claim

- Not "proof of duress". The anchor proves **when**, not what.
- Not "genuine input". A signature proves a key was used. Attestation is stored, not verified (`stored_unverified`), until it is.
- Not "invisible". It is **discreet**: the microphone indicator is visible.
- Not "always on". It is **journey mode**, and a reboot disarms it.
- Not "works offline". Detection works offline; **delivery needs data**.
- **If the phone is switched off before anything is detected, nothing escalates.** This goes on the honesty slide.
- The absence of a VUKA record is **never** evidence against a claimant. Missing corroboration never proves fraud.
- No calibrated detection accuracy until M1/M2 are published, with n.
- Testnet is testnet, and archived receipts are labelled archived. `sim_bank` is simulated. The 318 ms (n = 10) historical figure measured a retired relay and is never quoted for VIGIL.
- No assurance we can't show a record for. "Reviewed" or "verified" needs a linkable record in the repository.
- **A malicious or compromised server can suppress or fabricate escalation.** The chain is server-built, so a compromised ANCHOR could withhold a `guardian_alert` or `bank_signal` outbox effect, or fabricate `no_answer`, `incident_closed` or `key_revoked`. The independent witnesses are the guardian's own-key acknowledgement and the bank's own systems, not the server's own record of itself. Resistance to server suppression is not claimed (Ipeleng's review, B2).
- **Anyone holding the unlocked phone can arm a journey and force a `no_answer` escalation**, no PIN required, including the bank signal after the 3-minute window with no `stand_down`. `signal_detected` carries location, so a false alarm this way can send guardians, and any police they call, toward the owner's own recorded position (Ipeleng's review, B3).
- **A lone guardian sees every alert.** The never-zero rule guarantees at least one guardian, not two. Onboarding recommends at least two guardians who don't live with the user; one guardian is a single point of failure if they are asleep, unreachable, or the threat (Ipeleng's review, S2).
- **A coercer who learns the real PIN can end a false-alarm incident** (ADR-0041). Member-ended closure needs a normal PIN, all-normal check-ins, no guardian alert and no duress signal. A coercer forcing the real PIN out of the member meets those conditions. The member's defence is the duress PIN, which looks identical and raises the full alarm.
- **Residual multi-session replacement risk** (§9, ADR-0036(5), Ipeleng's review B1): across two forced normal-PIN sessions, an attacker's own accepted add can become the "replacement" that unlocks a removal the attacker scheduled, ending with the attacker as the sole guardian. Notifying remaining guardians of adds and scheduled removals is the mitigation; it is not a closure of the risk.

---

## 18 · Detection and response detail, and the evidence assessment (ADR-0039, `PROPOSED`)

Specification only until D1 (Thu 22:00) and D2 (Fri 12:00) pass. Nothing here changes a public field or an on-chain message.

- **`pv`.** Every committed payload carries an integer payload version. Per-kind schemas live in `contracts/payloads/<kind>.v<pv>.json`.
- **`signal_detected` payload (pv 1).** Every **numeric** field is an integer (no floats, §5). The other fields are strings, as typed below. The contract-v2 schema `contracts/payloads/signal_detected.v1.json` and its golden vector are the binding definition. This table is the source it is built from.

  | Field | Type | Required | Values / constraint |
  |---|---|---|---|
  | `kind` | string | yes | `"signal_detected"` |
  | `pv` | integer | yes | `1` |
  | `journey_id` | string | yes | the journey's id, as issued by `POST /v1/journeys` |
  | `sense` | string | yes | enum `"sound"` (pv 1) |
  | `class_label` | string | yes | enum: `"Screaming"`, `"Shout"`, `"Yell"`, `"Glass"`, `"Shatter"`, `"Breaking"`, `"Gunshot, gunfire"`, `"Machine gun"`, `"Fusillade"` |
  | `class_index` | integer | yes | the YAMNet index of `class_label` (11, 6, 9, 435, 437, 464, 421, 422, 423) |
  | `score_bp` | integer | yes | 0–10000 |
  | `threshold_bp` | integer | yes | 0–10000 |
  | `window_ms` | integer | yes | `975` |
  | `model_sha256` | string | yes | 64 lowercase hex characters |
  | `app_version` | string | yes | semantic version, e.g. `"1.0.0"` |
  | `corroboration` | array | yes | 0–4 items; `[]` when none |
  | `corroboration[].sense` | string | yes | enum `"motion"` |
  | `corroboration[].pattern` | string | yes | enum `"impact"`, `"shake"`, `"snatch"` |
  | `corroboration[].peak_mg` | integer | yes | 0–16000 (milli-g) |
  | `corroboration[].duration_ms` | integer | yes | 1–10000 |
  | `corroboration[].offset_ms` | integer | yes | −10000 to 0 (look-back only) |
  | `corroboration[].rule_version` | string | yes | e.g. `"motion-rules.v1"` |
  | `location` | object | no | present only when a fix exists |
  | `location.lat_e7` | integer | yes (in `location`) | latitude × 10⁷, −900000000 to 900000000 |
  | `location.lon_e7` | integer | yes (in `location`) | longitude × 10⁷, −1800000000 to 1800000000 |
  | `location.acc_m` | integer | yes (in `location`) | accuracy in metres, 0 or more |
  | `location.fix_age_ms` | integer | yes (in `location`) | age of the fix in ms, 0 or more |

  No other fields are allowed in pv 1 (`additionalProperties: false`). Adding one is a `pv` bump.
- **Gun-like classes:** 421, 422 and 423, mapped by label. 420 and 424–427 are excluded. Argmax, with ties going to the lowest index. Displayed as "gun-like sound (uncalibrated)".
- **V11 motion (stretch detector).**
  - `impact`, `shake` and `snatch` rules on the accelerometer.
  - Recorded only as look-back corroboration, and only when stationary or walking.
  - It never opens a check-in.
- **Registration payload:** `app_version`, `model_sha256`, `android_api` and `device_model`. Never IMEI, serial, Android ID or phone number.
- **Guardian facts.**
  - `guardian_alert_opened`: `guardian_event`, guardian-signed, hourly anchoring, needs an explicit tap, never raises the E-level. Route: `POST /v1/alerts/{id}/opened`.
  - "No acknowledgement recorded by <time>" is derived at read time.
- **`evidence_assessment`** (`server_event`, pv 1).
  - Fields:

    ```
    {kind, pv, ruleset_digest, cem_version, transition_id, input_head, evaluated_at,
     reasons:[{reason, points, source_entry_ids, basis_time}], total_points, tier, rule,
     e_level, calibrated:false, statement}
    ```

  - It is appended once per incident transition, in the same `subject_heads` transaction, and anchored with that transition. A retry returns the existing entry.
  - `input_head` is the head immediately after the transition.
  - `basis_time` is server receipt time.
  - Decay freezes when the check-in is shown.
  - The fixed statement reads: "Uncalibrated design tally. Not a probability or a finding about any person. A low total is not evidence that no coercion occurred."
  - Forbidden fields: `probability`, `likelihood`, `verdict`, `not_coerced`, `genuine` and any band.
- **Who sees what.**
  - The member sees the full assessment after an incident closes, and only behind a fresh normal PIN.
  - Guardians see the reasons.
  - **Banks and insurers, once access is granted, see the tier, the E-level and the reasons, never `total_points`.**
  - The demo panel shows everything, for `sim_` subjects only.
- **Third-party access grants: designed, not built.** They are blocked by gaps G36–G38.
- **Tests (specified, owned).**
  - T25 (gun classes; Vukosi).
  - T26 (motion look-back; Vukosi).
  - T27 (assessment schema assertions and banned copy; Khutso, Mutarisi).
  - T28 (`opened` tap, no E-level; Sibusiso, Mutarisi).
  - T29 (accelerometer in the foreground service with the screen off, for at least 30 min on a budget phone; Vukosi).
  - T54 (the verifier replays every assessment exactly; Sibusiso).
  - T56 (one assessment per transition under racing and retries; Sibusiso).
  - Designed only: T53 and T55.
- **M8.** Motion pattern firings per armed hour, from a debug pattern log on the M7 drive plus a walk, reported per pattern with n.
