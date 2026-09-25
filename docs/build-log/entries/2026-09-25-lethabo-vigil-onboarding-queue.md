## 2026-09-25 | Lethabo (co-lead), via Claude Code assistant | VIGIL sign-up, both PINs, the encrypted event queue and My record | PROPOSED — for Mutarisi (screens), Sibusiso (event targets, contract v2) and Ipeleng (PIN storage, duress parity)

**Research** — Spec V5–V8, §3 (event kinds), §8 (T47 wrong PINs, G35 PIN-gated end), §9 (PIN authority), and the server on PR #51 (`/v1/events`, counter and clock-skew rules). The server enforces unique counters, not their order, and checks skew on the request timestamp. So a queued event can be sent late or out of order and still be accepted.

**Real data / references** — The events are the ones the ANCHOR server on PR #51 verifies. The client was proved against it earlier today (`scripts/e2e/anchor-e2e.mjs`, 6/6). This change was not yet run end to end on the emulator when it was pushed; see Next.

**Business reasoning** — This makes the member journey real from first launch: sign-up, both PINs, and every journey, check and PIN signed on the phone and kept until the server confirms receipt. The member can see their own record and its fingerprint (F14's phone side).

**Competitor reference** — None.

Changed:
- **Onboarding** (`app/src/ui/onboarding.tsx`):
  - welcome, first name, the everyday PIN twice, then a second (duress) PIN twice, which must differ;
  - then the genesis `registration` entry;
  - the name stays on the phone, and the registration payload doesn't carry it.
- **PINs** (`PinModule.kt`):
  - an Argon2id hash per PIN (19 MiB, 2 passes, 1 lane, Bouncy Castle `bcprov-jdk15to18`), sealed with an AES-GCM key held in Android Keystore;
  - verification always derives both hashes and compares both in constant time.
- **Event queue** (`QueueModule.kt`, `app/src/api/device.ts`):
  - one AES-GCM-sealed file per signed event, ordered by sequence number, in no-backup storage;
  - an event leaves the queue only on a server receipt, and the receipt is kept;
  - a refused event (4xx) stays queued with its reason shown, and the pass carries on;
  - a network failure stops the pass, and it retries every 30 s.
- **Events** (§3):
  - `journey_armed`, `signal_detected` (from the detector), `checkin_opened`, `checkin_result`, `pin_authorised` (`end_journey`) and `journey_ended`.
- **Duress parity** (V5):
  - screens receive only "done" or "try again";
  - the mode exists only inside the signed payload;
  - `normal_pin`/`duress_pin` and `normal`/`duress` are equal lengths;
  - the local record names entries by kind only.
- **Wrong PINs at a check-in** (T47):
  - three identical "Try again"s, then every entry shows "Checked in".
- **My record** (`app/src/ui/record.tsx`):
  - every received entry with its chain index and hash;
  - the fingerprint is the newest entry's hash;
  - the public anchor is stated as not yet published.
- **Network:**
  - release builds are HTTPS-only (`net_release.xml`);
  - test builds (`-PvigilTestFeed=true`) may use plain HTTP to 10.0.2.2 and localhost only (`net_test.xml`).
- **Metro** now watches `shared/`, so the app bundles the repo's one canonical-JSON implementation.

Evidence:
- `npx jest`: 38/38 pass (6 new device tests);
- `npx tsc --noEmit`: clean;
- the release JS bundle builds;
- `compileReleaseKotlin` passes.

Decision:
- **Journey events target the subject and carry `journey_id` in the payload.** PR #51 has no `POST /v1/journeys`, so a journey-targeted entry has no owner to check against. When that route lands, one constant (`JOURNEY_TARGET`) changes. Sibusiso to confirm in contract v2.
- **Journey and check-in ids are phone-generated**, with `sim_jny_`/`sim_chk_` prefixes.

Needs / blockers:
- Sibusiso: `POST /v1/journeys`, and the escalation that acts on `checkin_result`/`pin_authorised`.
- Guardians remain simulated.

Business handoff: A member can sign up and hold their own record with a fingerprint anyone can recompute. The public anchor proof is not live, and it must not be claimed.

Next:
- run the full flow on the emulator against the local server and record the result here;
- Ipeleng: review PIN storage and parity;
- Mutarisi: review the onboarding screens.

---

## 2026-09-25 (21:30) | addendum: the app now drives the slice-3 escalation (PR #89)

Changed:
- **Journeys:**
  - `POST /v1/journeys` issues the journey id, and every journey event targets it;
  - heartbeats go every 30 s with an activity bucket only (V9);
  - a journey no longer starts when the server can't be reached. The member is told why, because a journey the server doesn't know about can never reach a guardian.
- **§4b payloads:**
  - `checkin_opened` carries a UUID `checkin_id`, the triggering `signal_event_id` and `window_s: 60`. It is recorded when the check is actually on screen, and never before the signal that caused it (the detection is queued first);
  - `checkin_result` carries `attempt` (T47);
  - `pin_authorised` carries the inner DER signature over `{action, target_id, mode, nonce}` and targets the subject, while `journey_ended` targets the journey;
  - both end-journey events are queued before either is sent.
  - `app/src/api/payloads.ts` refuses to queue anything the four schemas forbid.
- **My record:**
  - it opens behind the PIN (an `export` authorisation, §9); a duress PIN there is a duress signal (V6);
  - entries are numbered in the phone's own order, never by chain index, because the server's own entries after a duress PIN would show up as a jump in the numbers.
- **Detection:**
  - after the journey ends, a late detection is still recorded but never opens a check-in;
  - in test builds, a clip played during a journey runs through that journey's engine.
- **Queue:** it sends again when something is queued mid-send, and a refusal reason stays visible until the queue is empty.

Evidence:
- `npx jest`: 47/47 pass;
- `npx tsc --noEmit`: clean;
- `node scripts/e2e/journey-e2e.mjs`: 21/21 against the slice-3 server and scheduler with PostgreSQL, run with `--fast`. The earlier full run was 20/20, including `no_answer` from the scheduler after 75 s.
- Normal and duress `checkin_result` bodies were 646 B each.

Decision:
- the check-in window is 60 s (§7 allows 20 or 60);
- `pin_authorised` targets the subject, since the server checks journey ownership itself.

Needs / blockers (Sibusiso):
1. **`server/server_signing.py`:** `_pinned_public_key()` returns the manifest's 44-byte SPKI, but it is compared with a 32-byte raw key, so the real path always fails. The tests patch it. Load it with `load_der_public_key` and compare raw bytes.
2. **Skew exemption (`server/db.py`):** it matches `entry["action"]` against kinds, but §3 puts only the coarse class in `action` (`device_event`). The exemption never applies to real PIN events. Match on the payload kind instead.
3. **Journey start:** it has no idempotency key, so a lost `POST /v1/journeys` response leaves an orphan journey that never ends, and the `contact_lost` clock counts it. Proposal: accept an `Idempotency-Key`.
4. **Guardian worker:** `guardian_worker.py` has no run loop yet, so queued alerts are not delivered outside tests.
5. **Offline journeys:** they can't be bound after the fact. Worth a contract decision.

Rejected, with reason (review round):
- "Allow a degraded offline journey": its events could never be accepted, so the screen would claim protection that doesn't exist.
- "Hold My record at the pre-incident head": the phone can't see incident state, and its entries read the same for both PINs. The server export already applies the T30 hold.

---

## 2026-09-25 (22:00) | addendum: My record checks the server's copy on the phone

Changed:
- **After the PIN, My record fetches the member's export** (`GET /v1/subjects/{id}/export`, the T30 hold applied by the server). `app/src/api/verifyRecord.ts` then checks it on the phone with the phone's own SHA-256:
  - every link;
  - every event hash, over the canonical entry;
  - every payload commitment;
  - that every receipt this phone kept, up to the export's head, is in the chain at the same index with the same hash.
- **It reports the first broken entry by index.** Signatures and the public anchor are left to the verify page (React Native has no WebCrypto), and the screen says so.
- **Queue numbering fix:** numbers now continue past kept receipts. Before, the numbering restarted when the queue emptied and overwrote the phone's receipts. Found on the emulator: My record showed 2 of 8 entries.

Evidence:
- `npx jest`: 53/53 pass;
- `node scripts/e2e/journey-e2e.mjs --fast`: 23/23;
- on the real export, the phone check and `shared/verify.js` both pass, and a tampered payload fails both at the same entry (index 1).
- **Emulator run:** onboarding, then a journey, then a glass clip through the phone's model. The Journey check opened. A duress PIN showed "Checked in", while the server recorded `duress_pin`, marked the incident duress, and queued a guardian alert and a bank signal. Ending the journey with the normal PIN left the incident open, as §8 requires.

---

## 2026-09-25 (22:20) | addendum: review responses (Khutso's changes-requested and Sibusiso's notes on #88)

Changed:
- **A failed evidence write is never an accepted outcome.** If signing or queuing fails at the Journey check, End journey or the My record PIN, the screen shows the same neutral "Try again" (identical for both PINs). The check stays open, and the journey keeps listening. Before, a failure showed "Checked in" or ended the journey.
- **My record is now only the server's held export (T30),** fetched after the export PIN and checked on the phone before anything is shown:
  - the phone's own receipts are used only to check that export;
  - nothing past the held head is listed;
  - Settings no longer shows a received count;
  - if the export can't be fetched and checked, nothing is listed.
- **Signer:** `ensureKey` is `@Synchronized`, and the counter's reset-with-new-key is documented.
- **`anchor-e2e.mjs`:**
  - it now starts a server-issued journey;
  - its tamper check alters only the payload of a freshly signed event and expects exactly the 400 commitment error.

Evidence:
- `npx jest`: 55/55 pass. That includes both failure paths rejecting, and My record listing only the held export's two entries while the phone holds more receipts, with no PIN mode in the rows.
- `anchor-e2e.mjs`: 7/7.
- `journey-e2e.mjs`: 24/24 in the full run, including `no_answer` from the scheduler.

---

## 2026-09-25 (23:30) | addendum: the prototype's Ivory glass in the real app; always-on listening (ADR-0046, PROPOSED)

Changed:
- **Design:** the design prototype's Ivory theme is ported to React Native, following `vuka-ui-proto/src/index.css` and its components:
  - IBM Plex (the fonts are restored from this branch's history, OFL);
  - an ivory field with three still colour orbs;
  - warm-white glass cards, with the hero card in its tray;
  - deep-ink pill buttons with the arrow orb;
  - the drifting listening line;
  - a flat, plain Check-in keypad.

  On Android the cards are opaque warm white (the prototype's solid fallback), because a translucent card shows its elevation shadow through it. The orbs are still to save battery on an always-on app, so the listening line is the only motion.
- **Always on (ADR-0046, PROPOSED; decided by Lethabo):**
  - VIGIL starts listening by itself once set-up finishes, and retries every 30 s while the server can't be reached;
  - "Pause listening" behind the PIN replaces "End journey";
  - the contract is unchanged: one listening session is one server journey.
- **Live meter:** each audio window reports the target sound closest to its own threshold. It shows the model score (0–100) against that threshold, labelled "not a probability". No percentage is shown anywhere.
- **Guardian preview (G4, G5):**
  - the alert leads with "Don't call or text Lerato. Call 10111.";
  - the acknowledgements are signed;
  - calling Lerato unlocks only after stand-down;
  - a persistent SIMULATED label sits at the top.

  This fixes the Call-Lerato conflict Khutso and Ipeleng raised on #77.
- **Neutral notifications (V2):** "VUKA active" and "Check-in".

Evidence:
- `npx jest`: 55/55 pass; `tsc`: clean.
- **Emulator run (x86_64 test build against #89):** after sign-up, listening started with no button, with the microphone indicator on and a server heartbeat at 23:20. The glass clip, through the phone's model, opened the Check-in. The normal PIN showed "Checked in", and the server recorded `normal_pin`.

Not measured:
- battery use of continuous listening;
- the false-check rate on real street audio (the lab proxy is about 5.5 per hour; see ADR-0046).

---

## 2026-09-26 (00:50) | addendum: guardian mode, member invites, frosted glass, public demo release

Changed:
- **Guardian mode (one app):** "I'm a guardian" → the member's one-time code → a plain-words consent screen (POPIA s18) → the guardian enrols this phone's own key (#96 `POST /v1/guardians/accept`, with key id `gdn_` + SHA-256(SPKI)[:8]).
  - The guardian home fetches its delivered alerts every 5 s while the app is open (`GET /v1/guardians/me/alerts`, PR #99, PROPOSED).
  - The alert leads with G4, "Don't call or text them. Call 10111."
  - It answers with signed `guardian_ack` events (called_10111, handling, stand_down).
- **Members:** "Add a guardian" sits behind the PIN (an `add_guardian` authorisation). It shows the one-time code with its 10-minute countdown and a Share message that carries the download link. A duress PIN gets an identical-looking code for a decoy (#96).
- **Frosted glass:** real background blur (`@react-native-community/blur` 4.4.1, MIT; `npm audit` adds nothing new). Cards get a top sheen, and keys and rows spring down when pressed. The PIN keypad stays flat (V5).
- **Public demo:**
  - GitHub prerelease `vigil-demo` with the APK and QR codes;
  - `server.json` on that release tells installed apps where the demo server is (a team laptop behind a Cloudflare quick tunnel, with `sim_` subjects only);
  - release builds follow it unless the member pinned a server.
- **Fix:** the 30 s retry could start a second listening session while the permission dialogs were open (seen on the emulator as two `POST /v1/journeys`). It is now guarded by a ref.

Evidence:
- `npx jest`: 55/55.
- `journey-e2e.mjs`: 29/29, including the guardian flow. The real guardian received the duress alert, the decoy saw nothing, and stand-down closed the incident.
- **On the emulator, through the public tunnel:** sign-up was received, listening started, the invite code was issued, and a scripted second phone joined as guardian with that code.

Not done: FCM push (#95); a real-phone run; battery.
