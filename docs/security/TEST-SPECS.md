# VUKA security test specifications

> **Owner:** Ipeleng; Lethabo covering the security lane from 24 Sep 2026. **Status:** `PROPOSED` — reviewed and accepted **with conditions** by Ipeleng (owner) on 24 Sep 2026: T04–T52 each carry fixture, oracle, prerequisites and a negative control; the T24 and T37 oracles satisfy PR #43 condition B1. Conditions: (1) every `UNDEFINED — needs contract v2 (#51)` value waits on the contract and is not invented by a writer; (2) no test is recorded as run or passed from this document — the coverage table stays `not written` until each runner executes.
> **Serves:** S, T.
> An oracle here is the pass criterion. A test that can't run yet is recorded as not run, never as passed.

These specifications serve criterion **S** (security and ethics) and **T** (technical implementation). They support “Would a real user trust and use this?” by making safety and integrity claims checkable before anyone relies on them. `PROPOSED`: fixtures are synthetic and use `sim_` subjects only. Time-dependent cases use a controlled clock. This document specifies tests; it does not claim they have run.

**Figure tags:** Contract limits and dates quoted from the cited requirements are `FACT` about the written contract, not test results. Test fixtures and runner choices are `PROPOSED`. No product measurements are claimed.

Review gates (`PROPOSED`): fraud red-team — include coercion and staged-event controls; build for use — check the member and guardian outcomes; economic integrity — no product or cost claim changes; privacy by design — use synthetic subjects and expose no extra data.

Each test has exactly the seven fields below. “Runner” names the planned runner. The coverage table records implementation tests as `not written`.

## T04 — Altered export

- **Proves:** Altering payload, outer metadata, a chain link or signature is detected at the first broken index (spec §15, A5).
- **Layer and writer:** Verify page; Ipeleng writes. Runner: vitest.
- **Fixture:** `sim_subject_export` with an implemented, valid export containing genesis and two later entries; retain the original export.
- **Steps:** 1. Verify the original. 2. In separate copies, alter payload, outer metadata, `prev_hash` and signature. 3. Verify each copy.
- **Oracle:** Original verifies. Each altered copy fails at its first changed or dependent entry. Exact index depends on the fixture and must be reported by the verifier.
- **Prerequisites:** Implemented export (spec §15 Needs).
- **Negative control:** Verify the unaltered export; it passes.

## T05 — Pinned server key

- **Proves:** A forged server-authored chain with a substituted key is rejected against the pinned key manifest (spec §15, §§4, 10).
- **Layer and writer:** Verify page; Ipeleng writes. Runner: vitest.
- **Fixture:** `sim_subject_keys` export signed with the pinned server key, plus a substituted server key and the unchanged pinned manifest.
- **Steps:** 1. Verify the pinned-key export. 2. Replace its server key with the substituted key. 3. Verify again.
- **Oracle:** The pinned-key export verifies; the substituted-key export is rejected. An HTTP status is not part of this verifier contract.
- **Prerequisites:** Key bootstrap (spec §15 Needs).
- **Negative control:** Verify a valid chain against the pinned key manifest.

## T06 — Retry, idempotency and replay

- **Proves:** An identical retry returns its original receipt; changed content for a reused `event_id` returns 409; unseen counters are accepted and an exact replay appends nothing (spec §15, §§4, 7).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_retry`, registered signing key, unused `event_id`, nonce and counter; controlled response drop after the first append.
- **Steps:** 1. Submit an event and drop its response. 2. Retry the same signed bytes and nonce. 3. Reuse its `event_id` with changed content. 4. Submit an unseen out-of-order counter. 5. Replay the original request.
- **Oracle:** Retry returns the original `event_hash`, `chain_index` and `received_at`; there is one original entry. Changed content returns HTTP 409. The unseen counter is accepted. Replay creates no second entry. Each accepted event has one chain entry for its event `kind` / coarse `action`; no duplicate outbox effects are specified.
- **Prerequisites:** None (spec §15 Needs).
- **Negative control:** A distinct event with a fresh nonce, event ID and unseen counter is accepted once.

## T07 — Force-stop after check-in opens

- **Proves:** Force-stopping after `opened` still produces `no_answer` and a guardian alert within window + grace + 5 s (spec §15, §8).
- **Layer and writer:** Server escalation; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_force_stop`, armed journey, delivered `signal_detected` and `checkin_opened`, one guardian receiver, persistent server and controlled clock; use an allowed 20 s or 60 s check-in window.
- **Steps:** 1. Confirm `opened` is received. 2. Force-stop the app. 3. Advance the clock through the opened-receipt deadline, its 10 s grace and the 5 s allowance. 4. Inspect chain and guardian receiver.
- **Oracle:** One terminal `no_answer` and one effective visible guardian alert; no repeated alert after worker retry. The chain includes the server `no_answer` and `guardian_alerted` kinds. The phone's screen and request shape match the normal path for any duress response used as a parity control.
- **Prerequisites:** Real app, persistent server, guardian receiver (spec §15 Needs).
- **Negative control:** Submit a normal PIN before the deadline; the terminal result is `normal_pin`, with no `no_answer` alert.

## T08 — Restart recovery and one visible alert

- **Proves:** Restarts at the deadline, after outcome commit and after send still produce exactly one visible alert each time (spec §15, §8).
- **Layer and writer:** Server/outbox; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_restart`, real PostgreSQL, one guardian receiver, durable outbox and controlled crash points.
- **Steps:** 1. Restart between `opened` and deadline. 2. Restart after outcome commit but before send. 3. Restart after send but before marking done. 4. Inspect chain, outbox and receiver after each.
- **Oracle:** Each scenario has one terminal outcome, one `guardian_alert` outbox effect and exactly one visible alert; chain has one corresponding server `no_answer` and one `guardian_alerted` kind. Retry has no second visible effect.
- **Prerequisites:** Real PostgreSQL and controlled crash points (spec §15 Needs).
- **Negative control:** Let the same scenario finish without a crash; it also produces one visible alert.

## T09 — Late normal and duress PIN

- **Proves:** A late normal PIN never retracts the alert; a late duress PIN is a duress signal and alerts guardians and the bank once (spec §15, §§3, 8; ADR-0041).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_late_pin`, open check-in already terminal as `no_answer`, guardian receiver, `sim_bank`, controlled clock; normal and duress PIN-authorisation fixtures.
- **Steps:** 1. Submit a late normal result. 2. Reset to the same starting state and submit a late duress result. 3. Inspect chain, guardians, bank and phone.
- **Oracle:** Normal case appends `checkin_result` and `answered_late`; existing alert remains. Duress case appends late `checkin_result` and `answered_late`, alerts guardians with “duress PIN entered”, and sends one immediate bank signal. Phone's screen and request shape match the normal path.
- **Prerequisites:** Controlled clock (spec §15 Needs); `sim_bank` for the bank assertion.
- **Negative control:** Late normal PIN produces no additional bank signal and does not retract the alert.

## T10 — Dead zone after closure

- **Proves:** After incident closure, a dead zone produces no `contact_lost` (spec §15, §8).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_closed`, closed incident with `incident_closed`, active journey state as defined by the fixture, heartbeats stopped; controlled clock.
- **Steps:** 1. Confirm incident closure. 2. Advance beyond the 90 s heartbeat interval. 3. Inspect chain and outbox.
- **Oracle:** No `contact_lost`, no new guardian alert and no bank signal; chain remains unchanged after closure.
- **Prerequisites:** Controlled clock (spec §15 Needs).
- **Negative control:** Stop heartbeats for 90 s while the incident is open; `contact_lost` is appended and guardians are alerted.

## T11 — Bank-signal triggers

- **Proves:** Detection alone does not send a bank signal; duress sends immediately; `no_answer` waits 3 minutes with no `stand_down`; restart does not duplicate the effect (spec §15, S1, §8; ADR-0037).
- **Layer and writer:** Server and `sim_bank`; Khutso writes the bank receiver case with Sibusiso on server effects. Runner: pytest.
- **Fixture:** `sim_subject_bank`, `sim_bank`, one guardian, controlled clock and independent normal, duress, `no_answer` and `stand_down` cases.
- **Steps:** 1. Submit detection alone. 2. Submit a duress signal. 3. Submit `no_answer`, then test both no `stand_down` and `stand_down` within 3 minutes. 4. Restart after queueing each eligible signal.
- **Oracle:** Detection creates no bank effect. Duress queues/sends one immediate bank effect. `no_answer` sends one only after 3 minutes if no guardian sent `stand_down`; the in-window `stand_down` case sends none. Restart/retry creates no duplicate hold. Chain entries use `bank_signal_sent` only for eligible cases.
- **Prerequisites:** `sim_bank` and controlled time (spec §15 Needs).
- **Negative control:** Detection with no duress or terminal outcome sends no bank signal.

## T12 — PIN-authorised guardian changes

- **Proves:** A guardian change without PIN authorisation is rejected; duress removal is a no-op; duress addition creates a decoy and notifies real guardians (spec §15, S2, §9; ADR-0036).
- **Layer and writer:** Server/governance; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_guardian`, two real guardians, one target guardian, separate fresh `remove_guardian` and `create_invite` authorisations with normal or duress mode.
- **Steps:** 1. Attempt a change without authorisation. 2. Try removal with duress authorisation. 3. Try addition with duress authorisation and accept the decoy invite. 4. Inspect chain, guardian set, outbox and phone.
- **Oracle:** Unauthorised change is rejected; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. Duress removal changes no guardian state; duress addition accepts a decoy that never receives alerts and tells real guardians it was added under duress. Chain has `pin_authorised` with `mode: duress` and the applicable `decoy_added`; one guardian notification per specified recipient. For both duress actions, the phone's screen and request shape match the normal path.
- **Prerequisites:** PIN-authorisation fixture (spec §15 Needs).
- **Negative control:** A fresh normal authorisation performs the permitted add or schedules the permitted removal.

## T13 — Recovery during an incident

- **Proves:** Recovery is blocked during an open incident; successful recovery notifies guardians and revokes the old key (spec §15, §9; ADR-0036).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_recovery`, old active device key, valid recovery code fixture, guardian receiver; one open-incident state and one closed-incident state.
- **Steps:** 1. Attempt recovery during the open incident. 2. In a reset fixture with no open incident, recover to a new device. 3. Submit an event with the old key after recovery.
- **Oracle:** Open-incident recovery is rejected; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. Successful recovery appends `recovery_performed` and `key_revoked`, notifies guardians once, and rejects later old-key events. The duress no-op path, if exercised, has a phone screen and request shape matching the normal path.
- **Prerequisites:** Recovery endpoint, or record as cut (spec §15 Needs).
- **Negative control:** Valid recovery with no open incident and an unused valid recovery code succeeds.

## T14 — Invite-code brute force

- **Proves:** Invite-code attempts are rate-limited per subject, device and IP (spec §15, G1).
- **Layer and writer:** Server/delivery; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_invite`, one unused 6-digit invite, one subject/device/IP and five wrong-code attempts; changed device and IP fixtures; controlled clock.
- **Steps:** 1. Submit five wrong codes. 2. Submit a sixth from the same subject/device/IP. 3. Repeat from a new device and IP while retaining the subject.
- **Oracle:** The sixth attempt is refused; attempts are rate-limited per subject, device and IP. Exact response status, error code and rate-limit interval are **UNDEFINED — needs contract v2 (#51)**.
- **Prerequisites:** Observable rejection (spec §15 Needs).
- **Negative control:** A valid unused invite code, within the allowed attempt budget and its 10-minute validity, is accepted once.

## T15 — Normal/duress check-in parity

- **Proves:** Normal and duress check-ins have identical pixels and request shape, response delay within ±50 ms; haptic parity is observed manually (spec §15, V5).
- **Layer and writer:** UI: Mutarisi; app/request: Vukosi. Runner: T15 harness plus manual observation.
- **Fixture:** `sim_subject_parity`, same device/build, identical check-in state and two PIN-authorisation fixtures differing only by mode; at least 30 paired timing observations (PENTEST-PLAN PT-25).
- **Steps:** 1. Capture normal and duress screens. 2. Compare pixels and request shapes. 3. Measure response delay over at least 30 pairs with the T15 harness. 4. Compare haptics manually.
- **Oracle:** Pixel diff is identical; request shapes match; response delay difference is within ±50 ms over at least 30 pairs; manual observation cannot distinguish the haptic.
- **Prerequisites:** Screenshot diff and timing harness (spec §15 Needs).
- **Negative control:** Compare two normal-PIN runs; the harness detects no parity difference.

## T16 — Duress PIN at settings

- **Proves:** A duress PIN at the settings prompt raises the guardian alert and bank signal (spec §15, V6; ADR-0036).
- **Layer and writer:** Device/app: Vukosi; server and bank effect: Sibusiso with Khutso for `sim_bank`. Runner: pytest plus manual observation.
- **Fixture:** `sim_subject_settings`, one guardian, `sim_bank`, settings prompt and fresh `pin_authorised` fixture for the exact settings action and target with `mode: duress`.
- **Steps:** 1. Enter the duress PIN. 2. Inspect device, chain, guardian receiver and bank receiver.
- **Oracle:** Chain has `pin_authorised` with `mode: duress`; guardians receive one alert; one immediate bank signal is sent. Phone's screen and request shape match the normal path.
- **Prerequisites:** PIN-authorisation fixture (spec §15 Needs).
- **Negative control:** Same action and target with a normal PIN causes no duress alert or immediate duress bank signal.

## T17 — Permission denial

- **Proves:** Denying each permission in turn causes no crash, gives a clear explanation and creates no false `no_answer` (spec §15, V1, V2, V4, §11).
- **Layer and writer:** Android app; Vukosi writes. Runner: manual observation.
- **Fixture:** `sim_subject_permissions`, named Android version/API level, clean app install and all judge-build permissions granted before each separate denial run.
- **Steps:** 1. Deny one permission. 2. Attempt to arm or show the check-in as relevant. 3. Repeat separately for each permission. 4. Inspect app, chain and guardian receiver.
- **Oracle:** No crash; app explains the denied permission in plain words; journey does not arm without microphone and notification permission; `opened` exists only if the check-in was shown; no false `no_answer` is created.
- **Prerequisites:** Real device (spec §15 Needs); record Android version and API level.
- **Negative control:** With microphone and notification permission granted, explicit foreground arming succeeds.

## T18 — Native salts

- **Proves:** Salts come from native CSPRNG, are 16 bytes, and are distinct across 1,000 events (spec §15, V7).
- **Layer and writer:** Android/native; Vukosi writes. Runner: manual observation and code inspection.
- **Fixture:** `sim_subject_salts`, instrumented native signer and 1,000 generated event fixtures.
- **Steps:** 1. Inspect salt generation path. 2. Generate 1,000 salts. 3. Check byte lengths and uniqueness.
- **Oracle:** Native `SecureRandom` supplies each salt; each is 16 bytes; all 1,000 values are distinct. No chain or outbox effect is required by this test.
- **Prerequisites:** None (spec §15 Needs).
- **Negative control:** A deliberately JS-generated fixture fails the native-source inspection.

## T19 — Public proof, panel and export boundary

- **Proves:** Public proof and panel reveal no chain segment or event kinds for non-`sim_` subjects; export requires subject authentication (spec §15, A6, §6).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_public` and `sim_subject_redacted`, both synthetic `sim_` identifiers; configure the latter's test-harness visibility classification as non-simulated. Include one anchored head and authenticated/unauthenticated export requests.
- **Steps:** 1. Request public proof for an anchored head. 2. Inspect panel output for the non-sim subject. 3. Request export authenticated as the subject and without subject auth.
- **Oracle:** Proof returns only audit path and receipt, never a chain segment. Panel contains opaque hashes but no event kinds for the non-sim subject. Subject-authenticated export returns the chain; unauthenticated export is rejected. Its HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**.
- **Prerequisites:** `sim_` and non-sim fixtures (spec §15 Needs).
- **Negative control:** A public proof request does not gain chain-segment data even when the caller knows the head hash.

## T20 — Cold install from release QR

- **Proves:** A clean phone can cold-install the GitHub Release QR; APK digest and OS are recorded without repository access (spec §15, D1).
- **Layer and writer:** Android release; Vukosi writes. Runner: manual observation.
- **Fixture:** `sim_subject_install`, clean phone, public release asset and QR, recorded OS version and APK digest.
- **Steps:** 1. Scan the release QR on the clean phone. 2. Install without repository access. 3. Record APK digest and OS.
- **Oracle:** Install completes; digest and OS are recorded. No chain entries or outbox effects are created by installation.
- **Prerequisites:** Public release asset (spec §15 Needs).
- **Negative control:** A mismatched digest is not recorded as the release APK digest.

## T21 — Signed event context

- **Proves:** Changing `action`, `actor_id`, `target_type`, `target_id`, `ts` or `commitment` invalidates the device signature (spec §15, §4).
- **Layer and writer:** Verify page; Ipeleng writes. Runner: vitest.
- **Fixture:** `sim_subject_signature`, valid device-signed entry and public key, plus one copy for each single-field mutation.
- **Steps:** 1. Verify the original. 2. Mutate each listed field in a separate copy. 3. Verify each copy.
- **Oracle:** Original verifies. Every mutation fails signature verification; no altered entry is accepted into a verified chain.
- **Prerequisites:** Negative vectors (spec §15 Needs).
- **Negative control:** Unchanged event context verifies against its signer key.

## T22 — Receipt and batch substitution

- **Proves:** A correct export paired with another batch's receipt, topic or key is rejected (spec §15, §6).
- **Layer and writer:** Verify page; Ipeleng writes. Runner: vitest.
- **Fixture:** `sim_subject_batches`, two distinct batches, their valid exports/receipts, and a pinned topic and key manifest.
- **Steps:** 1. Verify each correct export/receipt pair. 2. Cross-pair the receipt. 3. Change topic and key references separately. 4. Verify each mutation.
- **Oracle:** Correct pairs verify; each substituted pair is rejected because the decoded mirror bytes/root or pinned network, topic or manifest do not match. No HTTP status is part of the local verifier oracle.
- **Prerequisites:** Two real batches (spec §15 Needs).
- **Negative control:** Verify a correct export with its own batch receipt, pinned topic and key.

## T23 — Normal result races timeout

- **Proves:** A normal result racing the `no_answer` deadline yields exactly one terminal outcome (spec §15, §8).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_race`, one check-in, one allowed window, controlled clock and two concurrent scheduler/result actions.
- **Steps:** 1. Place a normal result and timeout at the same controlled deadline. 2. Run both orderings. 3. Inspect locked outcome, chain and outbox.
- **Oracle:** Exactly one `checkins.outcome` is stored: `normal_pin` or `no_answer`. No second terminal outcome or duplicated alert effect is appended; first terminal outcome wins.
- **Prerequisites:** Controlled clock (spec §15 Needs).
- **Negative control:** Submit the normal result comfortably before deadline; only `normal_pin` wins.

## T24 — Guardian removal timing and replacement

- **Proves:** Removal takes effect only after 24 h; the last guardian cannot be removed before a replacement is accepted; remaining guardians are notified of additions/removals, naming the other party (spec §15, §9, ADR-0036).
- **Layer and writer:** Server/governance; Sibusiso writes. Runner: pytest, with manual observation if the two-session path is not automatable.
- **Fixture:** `sim_subject_guardian_timing`, two real guardians, target guardian, accepted replacement fixture, fresh action-bound normal PIN authorisations and controlled clock.
- **Steps:** 1. Schedule removal. 2. Check at 23 h and 24 h. 3. Attempt to remove the last guardian before replacement acceptance. 4. Accept replacement and exercise the two-session add/remove sequence. 5. Inspect guardian notifications.
- **Oracle:** Removed guardian still receives alerts before 24 h and is removed only after 24 h. Last-guardian removal before an accepted replacement is refused; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. Remaining guardians are notified once per add/scheduled removal and the notice names the other party. Chain includes `guardian_added`, `guardian_removal_scheduled` and, after expiry, `guardian_removed` as applicable.
- **Prerequisites:** Controlled clock (spec §15 Needs).
- **Negative control:** Attempt removal before 24 h; target remains an active guardian.

## T30 — Member export during incident

- **Proves:** During an open incident and for 6 h after its last PIN entry, member-device export and My Record stop at the pre-incident head, match byte-for-byte for normal and duress authorisation, and the prefix verifies; export requires fresh authorisation (spec §15, §9, ADR-0041).
- **Layer and writer:** Server/export; Sibusiso writes. Runner: pytest plus manual observation for phone display.
- **Fixture:** `sim_subject_export_hold`, recorded pre-incident head, open incident with a duress event, fresh `export` authorisations in normal and duress modes, controlled clock.
- **Steps:** 1. Request export and My Record with normal authorisation. 2. Repeat with duress authorisation. 3. Compare bytes and verify prefix. 4. Advance to 6 h after the last PIN entry and repeat. 5. Try without fresh authorisation.
- **Oracle:** During the open incident and through the 6 h hold, both modes expose the pre-incident prefix only; normal and duress responses are byte-identical and the prefix verifies. Missing fresh authorisation is rejected; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. Duress phone screen and request shape match the normal path. No new guardian or bank effect is caused by export.
- **Prerequisites:** Implemented export and PIN-authorisation fixture (spec §15 Needs); controlled clock.
- **Negative control:** After incident closure and expiry of the hold, fresh normal `export` authorisation returns genesis through current head.

## T31 — Server response parity

- **Proves:** Normal and duress check-in responses have identical status, headers and body length except ids, with timing difference within ±50 ms over n ≥ 30 (THREAT-MODEL §6; SSDLC C-41).
- **Layer and writer:** Server and app harness; Sibusiso and Vukosi write. Runner: pytest and T15 harness.
- **Fixture:** `sim_subject_response_parity`, matched normal/duress requests, same environment and controlled request sequence; n ≥ 30 paired observations.
- **Steps:** 1. Send paired normal and duress `checkin_result` requests. 2. Capture status, headers, body length and timing. 3. Compare each pair and aggregate timing.
- **Oracle:** Status, headers and body length match except ids; timing difference is within ±50 ms over n ≥ 30. No specific HTTP status is set by this test.
- **Prerequisites:** Paired request harness and running server.
- **Negative control:** Two normal requests establish the harness baseline and show no fabricated difference.

## T32 — Verify-page network boundary

- **Proves:** Verify-page network log contacts only the pinned mirror host and own origin; CSP header is present (THREAT-MODEL §6, C-50, C-51).
- **Layer and writer:** Verify page; Ipeleng writes. Runner: manual observation.
- **Fixture:** `sim_subject_verify_network` export, browser network log, pinned mirror host, own origin and response headers.
- **Steps:** 1. Open verify page. 2. Verify export. 3. Inspect all network requests and CSP response header.
- **Oracle:** Requests go only to own origin and pinned mirror host; export is not uploaded; CSP header is present.
- **Prerequisites:** Verify page, mirror fixture and network log.
- **Negative control:** Offline verification that requires no mirror request contacts no third-party host.

## T33 — Export strings rendered as text

- **Proves:** An XSS payload in every export string field is rendered as text and does not run (THREAT-MODEL §6, C-52).
- **Layer and writer:** Verify page; Ipeleng writes. Runner: vitest.
- **Fixture:** `sim_subject_xss` export with `<img src=x onerror=…>` in every string field and a script-execution sentinel.
- **Steps:** 1. Load the export. 2. Inspect rendered fields. 3. Check the sentinel and browser console.
- **Oracle:** Payloads appear as text; no script runs; no injected request or chain/outbox effect occurs.
- **Prerequisites:** Verify-page renderer and XSS fixture.
- **Negative control:** Render a benign string; it displays as text without execution.

## T34 — Guardian token signature

- **Proves:** An unsigned token update or one signed by another key is rejected and token remains unchanged (THREAT-MODEL §6, G5).
- **Layer and writer:** Guardian delivery; Khutso writes. Runner: pytest.
- **Fixture:** `sim_subject_token`, registered guardian key and current token, plus unsigned and other-guardian-key requests.
- **Steps:** 1. Submit unsigned token update. 2. Submit update signed by another key. 3. Inspect token and chain.
- **Oracle:** Both requests return HTTP 401 or 403; token stays unchanged; no token-update chain entry is accepted.
- **Prerequisites:** Guardian token endpoint and signing fixtures.
- **Negative control:** Correct guardian signs a token update; it is accepted and bound to that guardian.

## T35 — Revoked device key

- **Proves:** Events from a revoked key received after recovery are rejected, including skew-exempt kinds, and a revocation entry exists (THREAT-MODEL §6, §9).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_revoked`, old and replacement keys, completed recovery and controlled receipt clock.
- **Steps:** 1. Complete recovery. 2. Submit an ordinary event and each applicable skew-exempt kind with the old key after revocation. 3. Inspect chain.
- **Oracle:** Later old-key events are rejected; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. Chain has one `key_revoked` event at recovery receipt time and `recovery_performed`; no rejected event is appended.
- **Prerequisites:** Recovery endpoint or recorded cut; controlled receipt time.
- **Negative control:** Submit a valid event with the replacement active key.

## T36 — PIN authorisation scope and expiry

- **Proves:** Reusing `pin_authorised` for another action/target or after 120 s is rejected (THREAT-MODEL §6, §9; ADR-0036).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_pin_scope`, fresh authorisation for one action/target and controlled server receipt clock.
- **Steps:** 1. Apply authorisation to a different action. 2. Apply it to a different target. 3. Advance to after receipt + 120 s and retry the original action.
- **Oracle:** All three requests are rejected; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. No gated action or corresponding chain entry occurs.
- **Prerequisites:** PIN-authorisation fixture and controlled clock.
- **Negative control:** Use the fresh authorisation for its exact action and target before expiry; action follows its defined mode.

## T37 — Two-session guardian notifications

- **Proves:** Remaining guardians are notified of each addition and scheduled removal, naming the other party (THREAT-MODEL §4 TM-C4; SSDLC §13 B1).
- **Layer and writer:** Server and security verification; Ipeleng writes with Sibusiso. Runner: pytest.
- **Fixture:** `sim_subject_guardian_notice`, two real guardians and an attacker-controlled accepted invite; two controlled sessions with action-bound normal authorisations.
- **Steps:** 1. Add attacker guardian in session one. 2. Schedule removal of the last real guardian in session two after accepted replacement. 3. Inspect messages, outbox and guardian set.
- **Oracle:** Each addition and scheduled removal creates one notice to each remaining guardian; each notice names the other party. Chain has applicable `guardian_added` and `guardian_removal_scheduled`; removal remains delayed 24 h. Exact notification copy beyond naming the other party is **UNDEFINED — needs a decision**.
- **Prerequisites:** PIN authority and guardian notifications; controlled clock if expiry is exercised.
- **Negative control:** A rejected add creates no add notice and no `guardian_added` entry.

## T38 — Bank signal trigger provenance

- **Proves:** The bank-signal payload identifies its triggering outcome (THREAT-MODEL §5 BK-4; spec §3, S1; SSDLC C-38).
- **Layer and writer:** Server/contract; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_bank_provenance`, `sim_bank`, and separate duress, `no_answer` and `contact_lost` trigger cases.
- **Steps:** 1. Trigger each permitted bank signal. 2. Inspect `bank_signal_sent` payload and the request received by `sim_bank`.
- **Oracle:** Spec §3 requires the trigger value `duress_signal`, `no_answer` or `contact_lost`. SSDLC §13 condition S1 says the trigger is recorded but does not settle its exact spelling. The contract value is **UNDEFINED — needs contract v2 (#51)** until the request schema defines it. Exactly one signal is sent per eligible incident; the payload carries its trigger.
- **Prerequisites:** `sim_bank` and contract v2 trigger field.
- **Negative control:** Detection alone creates no bank signal.

## T39 — Export freeze after recovery

- **Proves:** Export within 24 h of recovery is refused (THREAT-MODEL §6 TM-C8; SSDLC C-43).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_recovery_freeze`, successful recovery, controlled clock and fresh export authorisation.
- **Steps:** 1. Request export before 24 h elapses. 2. Advance to the end of the 24 h freeze. 3. Retry with fresh export authorisation.
- **Oracle:** Export before freeze expiry is refused; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. After expiry, the applicable export response follows the incident hold and authorisation rules. No export entry or outbox effect is specified.
- **Prerequisites:** Recovery and export endpoints; PIN-authorisation fixture; controlled clock.
- **Negative control:** With no active recovery freeze and no incident hold, fresh normal export authorisation returns the permitted record.

## T40 — `sim_bank` signature and idempotency

- **Proves:** Bad or missing signatures are rejected and repeated `Idempotency-Key` creates one hold (THREAT-MODEL §6, BK-1/BK-2; S1).
- **Layer and writer:** `sim_bank`; Khutso writes. Runner: pytest.
- **Fixture:** `sim_subject_sim_bank`, valid signed signal, bad-signature copy, unsigned copy and one repeated idempotency key.
- **Steps:** 1. Submit bad signature. 2. Submit no signature. 3. Submit a valid signed signal twice with the same key. 4. Inspect simulated hold count.
- **Oracle:** Bad and missing signatures are rejected; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. Repeated valid request creates one hold only. All screen labels identify `SIMULATED`; no real-bank effect occurs.
- **Prerequisites:** `sim_bank` signature verifier and `Idempotency-Key` handling.
- **Negative control:** Validly signed request with a fresh idempotency key creates one simulated hold.

## T41 — Release APK manifest and storage

- **Proves:** Release APK has only the launcher exported, the §11 permission list, no audio file after a 10-minute armed journey, and a recorded model digest (THREAT-MODEL §6; spec §11).
- **Layer and writer:** Android; Vukosi writes. Runner: manual observation.
- **Fixture:** `sim_subject_apk`, signed release APK, named phone/OS, 10-minute armed journey, manifest and model digest fixture.
- **Steps:** 1. Inspect manifest and permissions. 2. Arm for 10 minutes. 3. Inspect app storage and model digest. 4. Record OS and APK digest.
- **Oracle:** Only launcher is exported. Permissions are `RECORD_AUDIO`, `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MICROPHONE`, `FOREGROUND_SERVICE_LOCATION`, `USE_FULL_SCREEN_INTENT`, `INTERNET`; `CAMERA`, `SEND_SMS`, `ACCESS_BACKGROUND_LOCATION`, `RECEIVE_BOOT_COMPLETED` are absent. No audio file exists. Model digest matches the recorded manifest.
- **Prerequisites:** Release APK and phone.
- **Negative control:** Inspect a known-invalid APK with an extra exported component; it does not satisfy the oracle.

## T42 — Backup and readable storage

- **Proves:** After an `adb backup` attempt and file inspection, keys and queue are not extractable in readable form (THREAT-MODEL §6; V8/C-15).
- **Layer and writer:** Android; Vukosi writes. Runner: manual observation.
- **Fixture:** `sim_subject_storage`, test phone with armed journey, queued synthetic events, and backup/file-inspection tools.
- **Steps:** 1. Attempt backup. 2. Inspect app files and backup output. 3. Check whether keys or queue contents are readable.
- **Oracle:** Keys and queue are not extractable in readable form. No raw audio file exists. The queue may remain locally encrypted; no server chain or outbox effect is required.
- **Prerequisites:** App storage implementation and test phone.
- **Negative control:** An intentionally plaintext synthetic fixture is readable and confirms the inspection can detect plaintext.

## T43 — HCS submit key

- **Proves:** A message submitted without the `submitKey` is rejected by the testnet network (THREAT-MODEL §6, HD-1; spec §10).
- **Layer and writer:** Server/anchor; Sibusiso writes. Runner: manual observation.
- **Fixture:** `sim_subject_anchor`, Hedera testnet topic with `submitKey`, one valid typed 33-byte message and an account without the key.
- **Steps:** 1. Submit with the authorised key. 2. Submit the same typed message without it. 3. Inspect network result and topic.
- **Oracle:** Authorised submission is accepted; submission without `submitKey` is rejected by testnet. Only 33-byte typed messages are submitted; no personal data is added.
- **Prerequisites:** Testnet topic and `submitKey` (spec §10; THREAT-MODEL §6).
- **Negative control:** Submit with the authorised `submitKey`; network accepts it.

## T44 — Public endpoint burst

- **Proves:** A burst of 200 public-endpoint requests is rate-limited with HTTP 429 and service stays up (THREAT-MODEL §6, C-37).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_rate_limit`, own staging service, public endpoint set, and one 200-request burst.
- **Steps:** 1. Send the 200-request burst. 2. Record rate-limit responses. 3. Request `/healthz` after the burst.
- **Oracle:** Requests beyond the configured limit receive HTTP 429; `/healthz` still answers. Exact threshold and number of 429 responses are **UNDEFINED — needs a decision**.
- **Prerequisites:** Rate limits on public endpoints and own staging service.
- **Negative control:** A request below the configured limit receives its ordinary response.

## T45 — Dependency scan

- **Proves:** SCA finds no unwaived critical or high vulnerability (THREAT-MODEL §6 CI-3; SSDLC C-71).
- **Layer and writer:** Repository/dependencies; Sibusiso writes. Runner: manual observation.
- **Fixture:** Scan committed lockfiles and dependency manifests without application data; this repository-only test has no subject fixture.
- **Steps:** 1. Run the dependency scanner over committed lockfiles. 2. Record tool, version and output. 3. Check each critical/high result against a recorded waiver.
- **Oracle:** No unwaived critical or high result. No chain entry or outbox effect.
- **Prerequisites:** Lockfiles and SCA tool (SSDLC §6).
- **Negative control:** A disposable vulnerable package fixture is detected by the same scanner; it is not added to this repository.

## T46 — Sensitive data in logs

- **Proves:** Server logs and release logcat contain no PIN, salt, payload, token or location (THREAT-MODEL §6, C-38).
- **Layer and writer:** Server logs: Khutso; device logcat: Vukosi. Runner: manual observation.
- **Fixture:** `sim_subject_log`, complete synthetic scenario, captured server logs and release logcat.
- **Steps:** 1. Run a normal scenario and a duress scenario. 2. Capture logs. 3. Search for each prohibited value from the synthetic fixtures.
- **Oracle:** No PIN, salt, payload, token or location appears in either log. Duress phone screen and request shape match the normal path. Chain entries and outbox effects follow their test-specific contract and are not inferred from logs.
- **Prerequisites:** Server and release build; synthetic scenario.
- **Negative control:** Search for a harmless known log marker to confirm the log capture is complete.

## T47 — Wrong PIN at check-in

- **Proves:** Attempts 1–3 show identical “Try again”; the third fixes `no_answer` at deadline; later normal PIN shows “Checked in”; late duress is a duress signal (spec §15, §8, ADR-0041; THREAT-MODEL §6 TM-C10).
- **Layer and writer:** Android; Vukosi writes. Runner: T15 harness with controlled clock.
- **Fixture:** `sim_subject_wrong_pin`, check-in and allowed window, one check-in counter, controlled clock, normal and duress late-entry fixtures.
- **Steps:** 1. Submit wrong attempts one through three and compare screen/timing. 2. Advance to deadline. 3. Submit late normal PIN in one reset case. 4. Submit late duress PIN in another. 5. Inspect chain, guardian and bank effects.
- **Oracle:** Attempts 1–3 show identical neutral “Try again”. At the deadline outcome is `no_answer`. A later normal PIN shows “Checked in” and does not stop the alert. A later duress PIN is recorded as a late duress signal and sends the bank signal once unless already sent. Duress phone screen and request shape match the normal path.
- **Prerequisites:** Controlled clock and T15 harness (spec §15 Needs).
- **Negative control:** A correct normal PIN before the third wrong attempt produces `normal_pin`, not `no_answer`.
- **Open — how the server learns a PIN came after the limit.** A normal PIN entered after three wrong attempts must never become the terminal `normal_pin`. But if it's sent before the deadline, the server can't tell it apart from a genuine answer. **Proposed:** the `checkin_result` payload carries `attempt` (a 1-based integer inside the commitment), and the server treats `normal_pin` with `attempt ≥ 4` as late: appended, never terminal, and no retraction. This keeps the request shape identical (the value is committed and travels over TLS). **UNDEFINED — needs contract v2 (#51).**

## T48 — Two-operator controls

- **Proves:** One operator cannot complete operator deletion, threshold change or signing-key rotation; the attempt is chained (THREAT-MODEL §6, ADR-0036(8)).
- **Layer and writer:** Server/operator governance; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_operator`, one authenticated operator identity and each of the three operator actions.
- **Steps:** 1. Attempt each action with one operator signature. 2. Inspect action state and chain.
- **Oracle:** Each action is rejected; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. No deletion, threshold change or rotation occurs; the attempt is chained as the defined refusal evidence. The action/kind name for that refusal entry is **UNDEFINED — needs a decision**.
- **Prerequisites:** Operator action endpoints and two-signature implementation.
- **Negative control:** Two distinct authorised operators sign the same full action context; it can proceed under its contract.

## T49 — Cross-subject object authorisation

- **Proves:** Subject A's key cannot export, read or delete subject B's record (THREAT-MODEL §6, API1; A5).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_a` and `sim_subject_b`, each with a key and record; requests from A's key to B's export, record and delete paths.
- **Steps:** 1. Call each B endpoint using A's key. 2. Compare responses with B's not-found response. 3. Inspect B's chain and data.
- **Oracle:** Each cross-subject request returns **HTTP 404 with a body byte-identical to the response for a subject that doesn't exist**, so the status and body never reveal that B exists (corrected 24 Sep from THREAT-MODEL's earlier "403, same body as not-found", which leaks existence through the status); B's record, payloads, salts and chain are unchanged; no outbox effect occurs.
- **Prerequisites:** Subject endpoints and two subject fixtures.
- **Negative control:** B's own key requests B's permitted record successfully.

## T50 — Member-ended closure

- **Proves:** An all-normal, never-escalated, duress-free incident closes on normal PIN journey end; alerted or duress incidents stay open; all-normal `contact_lost` alerts guardians but sends no bank signal (spec §15, §8; ADR-0041).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_member_end`, one journey, controlled clock, one guardian and `sim_bank`; reset cases for all-normal/no-alert, alert already sent, duress signal, and all-normal contact loss.
- **Steps:** 1. Detect, answer with normal PIN, then end journey with normal `end_journey` authorisation. 2. Repeat with an alert already sent and with a duress signal. 3. Repeat all-normal case with heartbeat loss for 90 s.
- **Oracle:** First case appends `incident_closed` with `reason: member_ended`; later dead zone adds no `contact_lost`. Alerted and duress cases stay open. All-normal `contact_lost` appends `contact_lost`, alerts guardians once and sends no bank signal. For the duress control, phone screen and request shape match the normal path.
- **Prerequisites:** Controlled clock and `sim_bank` (spec §15 Needs); fresh end-journey PIN-authorisation fixture.
- **Negative control:** Add a guardian alert before journey end; normal journey end does not close the incident.

## T51 — Fallback deadline when check-in never opens

- **Proves:** Without `opened`, fallback `no_answer` fires at signal receipt + window + 30 s; earlier `opened` cancels fallback; one terminal outcome results (spec §15, §8; ADR-0041).
- **Layer and writer:** Server; Sibusiso writes. Runner: pytest.
- **Fixture:** `sim_subject_fallback`, one signal, server receipt clock, allowed 20 s or 60 s window, guardian receiver, `sim_bank`; reset case with timely `opened`.
- **Steps:** 1. Do not send `opened` and advance to receipt + window + 30 s. 2. Inspect chain, guardian and bank effects. 3. Reset, send `opened` before fallback, then advance through its ordinary deadline.
- **Oracle:** No-open case has one `no_answer` terminal outcome, one guardian alert and the S1 bank signal only after the 3-minute no-stand-down interval. Timely-open case cancels fallback and has exactly one outcome under the opened deadline. No duplicate outbox effect.
- **Prerequisites:** Controlled clock (spec §15 Needs).
- **Negative control:** `opened` before fallback due time prevents `no_answer_fallback` from firing.

## T52 — PIN-gated journey end

- **Proves:** `journey_ended` without fresh `end_journey` authorisation is rejected; duress-authorised end alerts guardians and sends one bank signal while matching the normal end on screen and request shape (spec §15, §§8–9; ADR-0041).
- **Layer and writer:** Server: Sibusiso; Android: Vukosi. Runner: pytest plus T15 harness.
- **Fixture:** `sim_subject_end_journey`, active journey, guardian receiver, `sim_bank`, fresh normal and duress authorisations bound to `end_journey` and that journey id.
- **Steps:** 1. Submit `journey_ended` without authorisation. 2. Submit with normal authorisation. 3. Reset and submit with duress authorisation. 4. Compare phone screen/request shape and inspect chain/outbox.
- **Oracle:** Missing authorisation is rejected; exact HTTP status/error code is **UNDEFINED — needs contract v2 (#51)**. Normal authorisation ends journey. Duress authorisation ends the service while recording a duress signal, alerts guardians and sends one immediate bank signal. Phone screen and request shape match the normal path.
- **Prerequisites:** PIN-authorisation fixture and T15 harness (spec §15 Needs).
- **Negative control:** Fresh normal `end_journey` authorisation ends the journey without a duress alert or bank signal.

**T50–T52 bind: ADR-0041 was accepted by Sibusiso on 24 Sep 2026 (PR #67).**

## Coverage

`not written` means the implementation test has not been written; this document is a proposed specification.

| Test | Writer | Runner | Status |
|---|---|---|---|
| T04 | Ipeleng | vitest | not written |
| T05 | Ipeleng | vitest | not written |
| T06 | Sibusiso | pytest | not written |
| T07 | Sibusiso | pytest | not written |
| T08 | Sibusiso | pytest | not written |
| T09 | Sibusiso | pytest | not written |
| T10 | Sibusiso | pytest | not written |
| T11 | Khutso, Sibusiso | pytest | not written |
| T12 | Sibusiso | pytest | not written |
| T13 | Sibusiso | pytest | not written |
| T14 | Sibusiso | pytest | not written |
| T15 | Mutarisi, Vukosi | T15 harness, manual observation | not written |
| T16 | Vukosi, Sibusiso, Khutso | pytest, manual observation | not written |
| T17 | Vukosi | manual observation | not written |
| T18 | Vukosi | manual observation | not written |
| T19 | Sibusiso | pytest | not written |
| T20 | Vukosi | manual observation | not written |
| T21 | Ipeleng | vitest | not written |
| T22 | Ipeleng | vitest | not written |
| T23 | Sibusiso | pytest | not written |
| T24 | Sibusiso | pytest, manual observation | not written |
| T30 | Sibusiso | pytest, manual observation | not written |
| T31 | Sibusiso, Vukosi | pytest, T15 harness | not written |
| T32 | Ipeleng | manual observation | not written |
| T33 | Ipeleng | vitest | not written |
| T34 | Khutso | pytest | not written |
| T35 | Sibusiso | pytest | not written |
| T36 | Sibusiso | pytest | not written |
| T37 | Ipeleng, Sibusiso | pytest | not written |
| T38 | Sibusiso | pytest | not written |
| T39 | Sibusiso | pytest | not written |
| T40 | Khutso | pytest | not written |
| T41 | Vukosi | manual observation | not written |
| T42 | Vukosi | manual observation | not written |
| T43 | Sibusiso | manual observation | not written |
| T44 | Sibusiso | pytest | not written |
| T45 | Sibusiso | manual observation | not written |
| T46 | Khutso, Vukosi | manual observation | not written |
| T47 | Vukosi | T15 harness | not written |
| T48 | Sibusiso | pytest | not written |
| T49 | Sibusiso | pytest | not written |
| T50 | Sibusiso | pytest | not written |
| T51 | Sibusiso | pytest | not written |
| T52 | Sibusiso, Vukosi | pytest, T15 harness | not written |

## Undefined items

Grouped by the owner who must resolve the contract gap:

- **Sibusiso — contract v2 (#51):** T12 unauthorised-change HTTP status/error; T13 open-incident recovery status/error; T14 rate-limit status/error/interval; T19 unauthenticated export status/error; T24 last-guardian refusal status/error; T30 unauthorised export status/error; T35 revoked-key rejection status/error; T36 PIN-authorisation rejection status/error; T38 trigger value conflict (`duress_signal` in spec §3 versus `duress_pin` in SSDLC C-38); T39 recovery-freeze refusal status/error; T40 `sim_bank` signature rejection status/error; T52 missing-authorisation status/error.
- **Sibusiso and Vukosi — contract v2 (#51):** T47 `attempt` in the `checkin_result` payload (proposed above).
- **Decision owner:** T37 exact notification copy beyond the required named other party; T44 public-endpoint rate-limit threshold and count of 429 responses; T48 refusal chain action/kind.

**UNDEFINED count: 17 items.** Some tests have multiple unresolved values in one item. T04's broken index is fixture-dependent and is reported by the verifier; it is not an undefined contract value.

## Skipped IDs

T25–T29 are skipped because no definition for those IDs appears in spec §15 or THREAT-MODEL §6. No ID from T04–T24 or T30–T52 is otherwise skipped.
