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

### Addendum, 26 Sep 04:55: VIGIL records why it acted (CEM-1 step a, PROPOSED, ADR-0047 to follow)

Changed:
- **CEM-1 on the phone** (`app/src/brain/cem/`, pure). This is the team's CEM-0 coercion evidence model (docs/COERCION-SCENARIOS.md), ported for the reasons the phone can observe: sounds and motion. It uses integer decibans, the same exact integer decay (120 s half-life), bands and K.
  - A golden oracle (`scripts/eval/cem_golden.py` → `__tests__/golden.json`) exports the 32 phone-observable catalogue scenarios. The TS engine reproduces every pos, neg, total, K and band exactly.
- **Engine confirmations feed the tally.** This includes confirmations the engine drops as duplicates, so 3 scream windows in 10 s count as `scream_sustained`. Each 10 s episode is one reason.
- **`evidence_observed` pv1** is signed and queued just before every `signal_detected`. It carries the band, integer reasons, K and `ruleset_digest` (the SHA-256 of the canonical ruleset; CI fails if it is stale).
  - The prompt rule is still `v4`: **no behaviour change**, and every detection that prompted still prompts.
- **Server (PR #99 branch, 407ad67):**
  - the schema is `contracts/payloads/evidence_observed.v1.json`;
  - the server accepts the event with no incident, deadline or outbox row;
  - it links the event to the next detection by id only;
  - the guardian alert gains `why` = the band plus up to 3 reason names, read from the encrypted payload, so deletion removes it.
- **Guardian screen:** "VIGIL noticed breaking glass and the phone hit hard: some signs." Words only. The consent text now says so, and says that no recording is kept.

Evidence:
- `npx jest`: 106/106 (CEM golden 32/32, tracker on the real `step()` stream, payload refusals, the why line).
- **Server:**
  - pytest: 267 passed. `test_outbox_postgres` needs an empty database; it fails on the live demo DB with or without this change.
  - `node --test` contract files: all pass.
- `journey-e2e.mjs`: 32/32 against the live server + workers. The guardian's alert carried `why` = {some, [glass_or_breaking, impact]}.

Not done: step b (the graded prompt rule, the countdown, context classes, snatch/PIN reasons), the transition list, location and map, and the experiments. The tally is uncalibrated: a sum of reasons, never a probability.

### Addendum, 26 Sep: graded check-ins (CEM-1 step b, ADR-0047 PROPOSED)

Changed:
- **Engine (`brain/detect`):** a record threshold per class (half the V4 prompt threshold, UNCALIBRATED), evaluated only when nothing clears V4. It has its own dedupe, so it can never displace or delay a V4 detection. The ruleset version is now 2.
- **Context classes:**
  - there are 17 of them (music/TV/radio, crowd, children, laughter, sirens, distress sounds), with indices read from the shipped model's label list;
  - native `contextBp` is optional, and a mismatch turns context off, never V4;
  - context is paired with each trigger (nearest hit per reason within ±1 s, distress ±10 s).
- **Grader (`brain/cem/grader.ts`, pure):** V4 is unchanged. Record-level detections lift to a check-in when P ≥ 5 and it is not true that K ≥ 50 % and P < 12. Other rules:
  - there is one prompt slot, reserved synchronously;
  - the lift has its own 30 s cooldown;
  - it waits 1 s for context;
  - a pause settles anything pending as record-only;
  - it applies only to `sim_` subjects.
- **Phone:**
  - `signal_detected` is sent only when the phone commits;
  - `evidence_observed` pv 2 is either record, prompt (bound to its signal) or pin;
  - PIN evidence has a fixed shape for both PINs and goes in the same flush as the answer, which never waits on the network;
  - a PIN-timing baseline stays on the phone (only "slower than usual" leaves it);
  - the Liu 2018 snatch rule is logged at weight 0.
- **Check-in countdown:** "Answer when you can" until the server has the check-in, then a bound that never overstates the server's deadline, then "Time's up. You can still answer".
- **Server (PR #99 branch):**
  - the `evidence_observed.v2.json` schema, plus per-decision rules (`server/evidence.py`);
  - pv dispatch and nullable types in the payload validator;
  - exact prompt-to-signal binding, so `why` only ever comes from bound evidence;
  - PIN evidence needs its check-in.
- **Transition list:** `docs/eval/cem1-transitions.md`, generated by a test. No T1 → T0, and 16 lifts at record level. It shows that half thresholds make most single quieter screams, glass and gunshots lift (stated in ADR-0047 as a cost).
- ADR-0047 appended.

Evidence:
- `npx jest`: all pass. This includes the CEM golden 32/32, the transition list (56), grader races, pv2 refusals and PIN parity (same canonical length for all four value pairs, identical bodies for both PINs).
- Server pytest: see the PR comment (the pv2 evidence tests are 8/8).

Not done: the measured record thresholds and the venue false-alarm curve (step d); location and map (step c); a real-phone run.

### Addendum, 26 Sep 08:05: review fixes for graded check-ins (0.0.10)

Two independent post-build reviews of step (b) found these, and all are fixed:
- **A prompt that can't be carried out now frees the slot.** Before, a failed signal write kept the prompt slot for the rest of the session, so later V4 detections were recorded with no check-in (quieter than V4).
- **A detection during an open check-in is covered by it (CEM-1 only).** Before, it sent `signal_detected`, and a normal answer was followed by a no-answer alarm 90 s later. ADR-0047 decision 4 is updated, and G39 now covers only the cooldown after a closed check-in.
- **Pausing during a lift records only.** Before, it could send a signal with no check-in.
- **Each record-level candidate waits for its own 1 s,** plus a 2 s timer fallback.
- **The countdown now ticks.** Every audio window re-rendered the screen and reset its timer. It also uses a monotonic clock now, and only the two tracked receipt kinds are kept, capped at 16.
- **Server:**
  - `why` comes only from the detection that raised that alert;
  - exact pv2 evidence replaces an older pv1 guess.

Evidence: jest 204/204; server evidence + alerts tests 15/15; the transition list is unchanged (no T1 → T0).

### Addendum, 26 Sep: phone fixes and step c (location + guardian map, ADR-0048 PROPOSED)

Changed:
- **Phone fixes:**
  - the "Checked in" screen now returns home; its timer used to restart on every audio window (seen on a phone);
  - the app looks up a moved demo server by itself;
  - Android 14+ full-screen check-ins: the Listening screen asks once and opens the system switch.
- **Location:**
  - a native `VigilLocation` module (LocationManager, no Play Services, integers only);
  - a 30-minute location window after any check-in (same for both PINs), kept alive with the screen locked by a headless task;
  - `POST /v1/journeys/{id}/location` on the server (PR #99 branch, 1960195): kept only while guardians are alerted, the same 202 either way, purged 24 h after close and on deletion;
  - the listening service adds the location type only when the permission was given.
- **Guardian:**
  - an alert map (MapLibre GL 4.7.1 bundled, OpenFreeMap tiles) and "Open in Maps";
  - a new alert pops up as a high-priority notification, even with the app in the background (standby keeps polling);
  - notification permission is asked at consent;
  - the consent says where, for how long, and names OpenFreeMap.

Evidence:
- jest 208/208, including the location window: start, the 30 s cadence, the 30-minute end, pause and no-fix.
- Server test_locations 5/5, and alerts + evidence + locations 20 passed.
- The map was checked in a browser with a sample fix: tiles, pin, accuracy circle, trail and "last seen" note.

Not done: a real-phone run of location and standby; battery; ADR-0048 acceptance (Ipeleng, Sibusiso).

### Addendum, 26 Sep: Mutarisi's additions ported into the live app; the app follows a server move (0.0.13)

Changed:
- **Member and guardian on one phone.** The guardian slot holds the guarded member's record, so the member's own record is never overwritten. Alerts pop up on any screen.
- **Hold for help** (ADR-0049, PROPOSED): a 2 s hold, or the "VUKA" Quick Settings tile, opens the same check-in a sound opens (`signal_detected` with `sense: "manual"`). It takes the one prompt slot.
- **Themes:** Ivory, Silver and Midnight, from the prototype's tokens. The glass washes and edges are tokens now, and the theme is read once at start-up from a native constant.
- **Following the demo server to a different server** (for the planned move to Azure):
  - the member registers again there;
  - events queued for the old chain are parked on the phone (kept, never sent);
  - My record starts from the new chain.
- **Not ported, on purpose:** accounts (Google/email/password, SMS code). They would put personal data on a server, against keys-on-device and `sim_` subjects.

Evidence:
- jest 214/214.
- journey-e2e: a duress PIN at a hold-for-help check-in raises the alarm on the real server.
- Device tests cover both roles on one phone and the tunnel / Azure / adoption cases of a server move.

### Addendum, 26 Sep afternoon: Mutarisi's sign-up flow, a checked release, and the demo run-sheet (0.0.14). Claude Code assistant, at Lethabo's request

**Research:**
- Read `c41ee8c` (the sign-up port) and `0f96a69` (the CEM-1 measurements). Neither had a build-log line.
- Downloaded and inspected the published `vigil-demo` assets. Nothing on the release was changed from this session.

**Real data / references** (FACT, measured in this session):
- `VIGIL.apk` sha256 is `b1df8cef…a44e7` (matches GitHub's digest). It is `com.teamsonar.vuka` 0.0.13, versionCode 13, signed by `CN=Team SONAR VUKA` (cert SHA-256 `ddfbf916…e62d`, the upload key held only on Lethabo's machine).
- Its JS bundle has hold-for-help, the themes and "Be someone's guardian", but **not** the 8-step sign-up.
- `VIGIL-download-qr.png` decodes (OpenCV) to `…/releases/download/vigil-demo/VIGIL.apk`, and `VIGIL-release-page-qr.png` to `…/releases/tag/vigil-demo`.
- `server.json` points at a laptop quick tunnel (updated 10:46Z).
- CEM-1 figures: see `docs/eval/cem1-measurements.md`. The scream catch rate is 6.5% under V4 and 10.2% under CEM-1 (n = 108, FSD50K eval).

**Business reasoning:** judges install from the QR, and a sign-up that looks like a real product's (while holding no account data server-side) makes the demo credible without widening what we store.

**Correction to the addendum above:** "accounts not ported, on purpose" no longer holds. `c41ee8c` ports Mutarisi's flow:
- welcome;
- account (Google / email / phone);
- number;
- code (SIMULATED: any 6 digits);
- name and surname;
- permissions;
- both PINs;
- invite guardians.

The contact detail and surname are kept in the phone's profile only. They are never sent and never enter the record, and backup and device transfer are excluded (T42). Identity is still the key made on the phone.

Changed in this session:
- **Permissions step:** a permission refused with "Don't ask again" (microphone or notifications) left the member stuck on the step. The row now offers **Open settings**, with a line explaining why.
- **Three sign-up bugs found by an independent AI review of the flow** (code reading; no UI test covers onboarding):
  - Android's system Back closed the app on any of the 14 steps. It now walks the steps like the on-screen Back.
  - A phone number typed and then skipped was still saved, and Back went to the code step. Choosing a method or skipping now clears it.
  - The contact detail was saved only on Done, so it was lost if the app was killed first. It is now saved right after registration.
- **Wording:** two lines claimed what isn't built. "One account per number" is not enforced, and "With Google we use your name and email" is not live. Both are replaced with what is true.
- **Version:** 0.0.14 (versionCode 14), so the next APK installs over 0.0.13.
- **Scripts:**
  - `app/scripts/publish-server.mjs` refuses non-https addresses and anything whose `/healthz` isn't 200, then replaces `server.json` via `gh`;
  - `app/scripts/publish-apk.mjs` prints the sha256 and replaces `VIGIL.apk` under the same name, so the link and QR stay valid. Neither script touches the signing key.
- **`app/README.md`:** a run-sheet covering the server on port 8000, the tunnel, `server.json`, the emulator test build and publishing.

Evidence:
- `npx tsc --noEmit` is clean; `npx jest` gives 214/214.
- Script refusal paths were run: http rejected (exit 2), non-200 health rejected (exit 1), missing APK rejected (exit 2), and a `--dry-run` digest of the published APK matches GitHub's.

Not done (blocked):
- **No APK was built here.** This cloud session has no Android SDK (`dl.google.com` is denied by the environment's network policy), and only the team key can produce an update installable over 0.0.13.
- **Azure's `/healthz` wasn't checked.** The host is denied by the same policy.
- **Not run on a device:** the sign-up flow on the emulator or a phone.

### Addendum, 26 Sep afternoon: Mutarisi's newest `feature/ui` commits ported (35e2e9c, 7ae1dd0, f14196f). Claude Code assistant, three parallel sub-agents, each reviewed before commit

**Research:**
- Read his build-log entries on `feature/ui` (`2026-09-26-assistant-*`) and the Kotlin fragments they name.
- Searched every branch for Codex work on the QR or download link. There is none. Codex's last pushed commits are from 24 Sep (server, docs). The release QR codes came from `b3f3d23`.

**Real data / references:** not applicable (UI flow and copy; no figures).

**Business reasoning:** one coherent app for the demo instead of two diverging ones. The member and the guardian see the design the team agreed.

Ported:
- **Guardian alert** (`3b6de6d`):
  - Call 10111 is recorded once per alert; a second press only reopens the dialer.
  - Stand down is confirmed ("Are they safe?"), and before calling it adds "10111 won't be called from this alert".
  - The status line never claims a call happened.
  - A failed write shows a neutral retry.
  - Calling the member stays locked until stand-down (G4).
  - Signed answers and payloads are unchanged.
- **Settings profile** (`3696dbd`):
  - An initials circle and Edit profile for name, surname, number and email, kept on this phone.
  - **Differs from his build: no PIN gate.** The only contract action a `pin_authorised` could carry is `export`, which would put a false export in the member's record. His notes list the gate as an assistant choice awaiting a human.
- **Sign-up** (this commit):
  - A terms-and-privacy checkbox gates the three routes. Both documents show as plainly labelled drafts; no terms exist in the repo.
  - The phone number is optional on the Google and email routes.
  - The code step offers text message or email, and asks inline for a missing contact (SIMULATED).
  - Every Back target shares one map with Android Back.

Not ported, needs a team decision:
- the one-tap Emergency button replacing hold-for-help (his own notes flag the stray-tap risk);
- Activate/Deactivate, which conflicts with always-on listening (ADR-0046);
- returning-member sign-in, forgot password and the recovery contact (no accounts server; identity is the phone's key);
- the session-grouped on-phone record (My record shows only the server's held export, T30);
- a `TERMS_ACCEPTED` record entry.

Evidence: `npx tsc --noEmit` is clean; `npx jest` gives 220/220. The sign-up transitions were walked with a throwaway renderer test (3 routes, forward and back). Not run on a device or emulator.

### Addendum, 26 Sep late afternoon: everything else of Mutarisi's ported, adopted by Lethabo (0.0.14). Claude Code assistant, parallel sub-agents, each result reviewed and tested before commit

**Research:**
- A feature-by-feature audit of `origin/feature/ui` (`bd26289`..`012f997`) against `app/src`.
- A read-only review of the Firebase work on #95, #96 and #99, and on both apps.

**Real data / references:** not applicable (UI and flow only; no figures).

**Business reasoning:** one app carrying the whole team's design for the demo.

Lethabo decided to adopt the four items held back earlier. Ported:
- **Home** (`c541fb9`):
  - One layout, with Activate / Deactivate. Deactivate reuses the pause PIN screen unchanged.
  - The listening wave.
  - One-tap "Emergency · call 10111" in place of the 2 s hold. It raises the same manual check-in and opens the dialer (`tel:`). ADR-0049 is amended, with the stray-tap cost recorded (`22c0f43`).
- **Guardian** (`c541fb9`):
  - the "Turn on alerts?" pop-up;
  - the notifications-off notice;
  - the "Response recorded" timeline;
  - "Location unavailable";
  - a shared styled `Dialog`.
- **My record** (`d10c199`): sessions and a view-only detail page over the same server-held export (T30 unchanged).
- **Accounts** (`358a726` and the screen wiring):
  - sign-out and returning-member sign-in;
  - an email password (salted SHA-256) and forgot password (SIMULATED code);
  - the recovery contact;
  - Documents and your rights, with the Terms and Privacy notice marked as drafts. All of it is local only.
- **Last items:** see the commit that wires them.

Known gaps, stated rather than hidden:
- **Duress PIN at two new prompts (V6).** A duress PIN at sign-in, or at sign-out while listening is already paused, raises no alarm. The locked `pin_authorised` action list has nothing that fits. Sign-out while listening does alarm, through the pause path. This needs a contract action (Sibusiso) and Ipeleng's review.
- **Password hashing.** It is one salted SHA-256, weaker than his 50,000-round hash. It is local only.
- **Not ported:** the "Terms accepted" and "Password reset" record entries (nothing from these screens enters the record).
- **Push notifications (Firebase review).**
  - The FCM sender on #95 is never started. `run_workers.py` on #99 uses `SimulatedGuardianNotifier`.
  - `FCM_ACCESS_TOKEN` is a static token with no refresh (`server/src/notify/fcm.py:63-69`).
  - One `FcmError` stalls the whole incident's delivery (`guardian_worker.py:21-22`).
  - Neither app has a Firebase client. The RN app enrols with the placeholder token `sim_poll_while_open`.
  - The three channel names differ: `vuka_guardian_alerts`, `guardian_alerts` and `alerts`.
  - No Firebase secrets are committed; `google-services.json` is gitignored.

Evidence: `npx tsc --noEmit` is clean and `npx jest` gives 241/241 at `358a726`, plus new tests for grouping, emergency presses, the guardian timeline and accounts. Not run on a device or emulator.

### Addendum, 26 Sep evening: Firebase in VIGIL (guardian push and real Google sign-in), off until `google-services.json` is added. Claude Code assistant, two parallel sub-agents, reviewed before commit

**Research:**
- The server side on #99 (`8cb8459`): `PUT /v1/guardians/{id}/token`, the `vuka_guardian_alerts` channel, and the `RoutingGuardianNotifier`, where `sim_` tokens keep in-app delivery.
- The `@react-native-google-signin` v11 sources, which need `webClientId` to request an ID token.

**Real data / references:**
- Libraries pinned for RN 0.74.5: `@react-native-firebase/*` 21.14.0 (Firebase BoM 33.12, compileSdk 34) and `@react-native-google-signin/google-signin` 11.0.1.
- Signing fingerprints (public), read from the published APK and `debug.keystore`, are in `app/README.md`.

**Business reasoning:** a guardian who has closed the app still gets the alert; a real Google account makes sign-up credible.

Changed:
- **Build:**
  - the google-services plugin is applied only when `app/android/app/google-services.json` exists (gitignored);
  - Jest mocks model "not configured" (`f693d2e`);
  - the README has the console steps (`1b4bc46`).
- **Push** (`src/api/push.ts`):
  - A guardian phone registers its FCM token with `PUT /v1/guardians/{guardian_id}/token` and body `{"fcm_token"}`, signed with the guardian key. It is sent once per token and again on refresh, and saved only after the server accepts it.
  - The high-importance channel `vuka_guardian_alerts` is created at start-up (`GuardianPushChannel.kt`), and the manifest sets it as FCM's default.
  - A foreground message shows the in-app notice and polls at once. A background handler is registered in `index.js`.
  - A notification tap opens guardian standby, never over a check-in or PIN screen.
  - Polling stays on in every case, and without Firebase nothing changes (`sim_poll_while_open`).
- **Google sign-in** (`src/api/google.ts`, `GoogleConfigModule.kt`):
  - "Continue with Google" and "Sign in with Google" use a real Google account through Firebase Authentication.
  - `webClientId` comes from the `default_web_client_id` resource, looked up by name so the build compiles without the file.
  - A Google account is stored with `verified: true`, prefilling the name.
  - Without Firebase, both routes stay SIMULATED with their tags.
- **Privacy copy:** with Google, Google and Firebase Authentication receive the sign-in, and the team's Firebase project keeps email, name and account ID. VIGIL's server never receives the email, and it never enters the record.

Evidence:
- `npx tsc --noEmit` is clean; `npx jest` gives 255/255, with 12 new tests across push, Google and device.
- **Not verified:**
  - Kotlin, the manifest and Gradle are unbuilt, because this container has no Android SDK.
  - There has been no real token, push or Google sign-in on a device.
  - No Firebase project has this app registered yet.

Needs:
- Lethabo or Sibusiso register `com.teamsonar.vuka` in the team's Firebase project, add the fingerprints and enable Google sign-in, then download `google-services.json`.
- `FCM_ACCESS_TOKEN` expires after about 1 hour, so it must be refreshed on the server before a demo.
- Declining notifications on Android 13+ still registers the token, but pushes won't show; polling still delivers.
