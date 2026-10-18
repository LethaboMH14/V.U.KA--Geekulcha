# VIGIL distress signals: inventory, legal positions, user comfort, gaps and ideas

**As of 18 Oct 2026.** This is research only: nothing in the repo was edited, committed or pushed. **Serves:** S (Security and Ethics), T (Technical Implementation) and U (Usability), and B through the insurer and bank channel. It is the evidence base for Wits E-Hub insight (3): "strengthen the signs of distress, lawfully, and in a way people are comfortable having on their phone".

**Would a real user trust and use this today?**
- **What earns trust.** The privacy design is honest. Audio never leaves the phone, a PIN is needed to pause, and the copy says "discreet, not invisible".
- **What limits use.**
  - The everyday false-check rate has never been measured in the field, and the lab proxy suggests frequent prompts.
  - The only scream catch-rate measured is low: 6.5 %, n = 108 clips, FSD50K.
  - Several legal positions predate the always-on design and the UAE North hosting.

---

## 0 · Where the code lives (this frames every status below)

- **`main` holds the React Native VIGIL app** (`app/src`, `app/android`, package `com.teamsonar.vuka`, version 0.0.16). `FACT`: `docs/NEW-CHAT-HANDOVER.md:28` and `docs/build-log/entries/2026-09-27-lethabo-vigil-0.0.16.md`.
- **The ANCHOR server is not on `main`.** `git ls-files server` lists only `server/README.md` and `.gitkeep` files (`FACT`, checked 18 Oct). The server logic below was read from these branches:
  - `origin/sibusiso/server-key-rotation-server` (last commit 14 Oct);
  - `origin/feature/integrate`.
- **A second, native Kotlin app** (`za.co.vuka.app`) lives on `origin/feature/integrate`.
  - Its `DetectionEngine.kt` is a port of ruleset v2 at the V4 level only: "Not ported: the CEM-1 record-only level (PROPOSED) and motion corroboration" (`FACT`).
  - PR #114 (power-button help) targets this app, not `main`.
- **Open PRs on signals:**
  - **#124** `sibusiso/detect-sensitivity` (base `main`): Lethabo requested changes on 14 Oct and again on 16 Oct. Reasons: failing security gates, a broad `.gitleaks` allowlist, and "uncalibrated" thresholds with "lack of real-world calibration evidence".
  - **#114** `lethabo/native-guardian-watch-and-sos`: a draft with no reviews, and "Not run on a device".

---

## (a) Trigger inventory

**Status key.** **built** = on `main` (app) or on the current server branch. **branch** = only on an unmerged branch or PR. **specified** = spec or ADR text only. **parked** = designed, not built. Every threshold is `UNCALIBRATED` (`app/src/brain/detect/ruleset.ts:4`).

**Shared audio pipeline** (`FACT`, code inspection):
- Capture is 16 kHz mono float. YAMNet windows are 15 600 samples (0.975 s), with a 7 800-sample hop (50 % overlap) and no gate.
- AGC, noise suppression and echo cancellation are off. The source is `UNPROCESSED` where the phone supports it, otherwise `VOICE_RECOGNITION` (`AudioPipeline.kt:96-122`).
- Audio sits in a **3 s in-memory ring buffer**, zeroed on stop. Each window copy is zeroed after inference (`AudioPipeline.kt:66,93,161,171`). Nothing is written to storage.
- The model must match sha256 `10c95ea3…17de` at load, and classes are resolved by label (`YamnetClassifier.kt:18,55-68`).
- Scores leave native code as integer basis points (`YamnetClassifier.kt:105`).
- Decisions are made in pure JS (`app/src/brain/detect/engine.ts`).

| # | Trigger | Mechanism | Thresholds and parameters | Where decided | What leaves the phone | Retention | Status | Measured (method, n) |
|---|---|---|---|---|---|---|---|---|
| 1 | **Screaming** (YAMNet 11) | Per-class bar; the highest qualifying class wins (ADR-0045); voice confirmation over 2 windows | `main` v2: prompt 4500 bp, record 2250, `separation: 2` (about 1.5 s). PR #124 v3: 3000 / 1500, `separation: 1` (one short call, about 0.5 s) | On device | `signal_detected` pv1: class, index, `score_bp`, `threshold_bp`, `window_ms`, model hash, app version, motion corroboration. **No location in code** (`detection.ts:155`). Also `evidence_observed` pv2 | Payload 90 days *specified* (§13); no 90-day job found on the server branch | built (v2); v3 = branch | FSD50K eval, ruleset v2: check-in opens for **6.5 % (V4) / 10.2 % (CEM-1), n = 108**. 27 clips are shorter than 3 windows, so they can never confirm (`docs/eval/cem1-measurements.md:8-17`). **v3 recall not measured** |
| 2 | **Shout / Yell** (6, 9) | Same as #1 | v2: 6000 / 3000. v3: 3500 / 1750 | On device | Same as #1 | Same as #1 | built (v2); v3 = branch | **Not measured.** ESC-50 has no shouts (`docs/eval/voice-v3-false-alarms.md` on the branch) |
| 3 | **Glass / Shatter / Breaking** (435, 437, 464) | Impulse: one window confirms | 3500 / 3000 / 4000; record level is half | On device | Same as #1 | Same as #1 | built | ESC-50 held out (folds 4–5, ruleset v1): **11/16 (68.8 %)**. FSD50K V4: Glass **46.0 % (n = 139)**, Shatter **72.9 % (n = 70)**. ESC-50, all 40 glass clips (v2/v3): 82.5 % V4 |
| 4 | **Gun-like** (421, 422, 423) | Impulse, and the score must beat the excluded neighbours: Explosion, Artillery, Cap gun, Fireworks, Firecracker | 3500 each; record 1750 | On device | Same as #1 | Same as #1 | built (ADR-0039 is Proposed) | FSD50K V4: **54.6 % (n = 108)**, 57.4 % with CEM-1. On ESC-50, the neighbour rule cut false "Gunshot" records from 9 to 1 (`docs/EVIDENCE.md:64`) |
| 5 | **CEM-1 graded evidence** (record level, plus "lift" to a check-in) | Below-V4 sounds become record-only evidence (T0). A record-level sound lifts to a check-in only when all of these hold: P ≥ 5 db; not (K ≥ 50 % and P < 12 db); the prompt slot is free; no prompt in the last 30 s. The decision waits 1 s for context | Decibans with a 120 s half-life; bands faint < 5, some 5–11, strong 12–19, very strong 20–29, overwhelming ≥ 30 (`cem/index.ts:15-21,84-90`; `grader.ts:35-40,77`) | On device. Lifts only for `sim_` subjects, and **every member subject is `sim_subj_…`** (`device.ts:468`) | `evidence_observed` pv2: `tally_db`, `band`, `k_pct`, up to 8 reason names with db, candidate class and score, `context on/off`, `ruleset_digest`. Guardians get the band and up to 3 reasons (`why`) | Encrypted private payload; deletion removes it | built in the app; ADR-0047 **Proposed** | False check-ins on ESC-50 (prompts/h): folds 4–5 **V4 7.3 → CEM-1 16.5** (9.2 of them lifts); folds 1–3 1.8 → 7.3. Counts are 1–9 prompts per 0.54 h split |
| 6 | **Context sounds** (17 labels) | Per-window scores ≥ 3000 bp, paired to a trigger: within ±1 s for context, ±10 s for distress sounds | Weights: media −6, crowd −5, children −4, laughter −4, siren 0, distress vocal (crying, whimper, groan, gasp) +3, capped at +6 (`cem/index.ts:35-45`; `classes.ts:55-73`) | On device | Only inside `evidence_observed` reasons, next to a trigger | As #5 | built (PROPOSED); a label mismatch turns context off, never V4 | Not measured on its own |
| 7 | **Catalogued but not observable on the phone**: Smash/crash 463, Skidding/Tire squeal 306/307, Car alarm 304 | Weights exist in `REASONS` (`cem/index.ts:32,36-37`), but no class mapping exists in `classes.ts` or `tracker.ts` | +3 / +3 / +2 | n/a | nothing | n/a | specified only | Transition scenarios A05, A11, A12 and A14 are "Not run (no phone sensor …)" (`docs/eval/cem1-transitions.md:42`) |
| 8 | **Motion** (impact / shake / snatch) | 50 Hz accelerometer reduced to 200 ms frames (peak, std, zero-crossings). Rules look back over [−10 s, 0] from a sound, and count only when the phone was stationary or walking just before. **Never opens a check-in** (H3) | Impact: peak ≥ 3000 mg. Snatch: 1800–2999 mg after 2 s still (std < 60 mg). Shake: 3 frames with std ≥ 500 mg and ≥ 4 crossings. Liu snatch (4079 mg) logged with weight 0 (`ruleset.ts:115-129`; `motion.ts`) | On device | `corroboration[]` items: pattern, `peak_mg`, `duration_ms`, `offset_ms`, rule version. CEM-1 points: impact +4, snatch +5, shake +3 | As #1 | built (ADR-0039 Proposed) | **Not measured.** M8, and T29 (30 min screen off), have no recorded run |
| 9 | **PIN behaviour** (`pin_retry`, `pin_slow`) | Retry: a wrong PIN before the accepted one. Slow: entry time > the member's own median + 3·MAD, after ≥ 8 entries | +2 each. MAD floor 50 ms; the baseline is the last 20 entry times, **stored on the phone** (`device.ts:201-218`) | On device | `evidence_observed` `decision: pin`: fixed shape, weights 0 or 2, for both PINs | As #5 | built (CEM-1 PROPOSED) | Not measured. It rarely fires in a demo because it needs 8 entries |
| 10 | **Emergency / hold-for-help** (manual) | One tap: a `signal_detected` with `sense: "manual"`, then the same check-in, plus the dialer opened with 10111 (`tel:`; the member presses call). Taps within 3 s count once | ADR-0049 amendment: 1 tap, where the original design had a 2 s hold | Device raises it; server deadlines | `signal_detected` `{kind, pv, journey_id, sense, app_version}` (`device.ts:839-840`) | As #1 | built; ADR-0049 Proposed | ADR-0049 records "Verified: in journey-e2e, a duress PIN at a hold-for-help check-in marks the incident duress". Pocket-tap rate **not measured** |
| 11 | **Quick Settings tile** | Tap opens the app, then a manual check-in | Labelled "VIGIL" (`AndroidManifest.xml:50`; ADR-0049 says "VUKA") | Device | As #10 | As #1 | built | Not measured |
| 12 | **Power-button help** (draft) | 4 screen on/off toggles within 3 s, 30 s cooldown, only while a journey is active, then the manual help path (`PowerPresses.kt`). Four because Android SOS uses five | 4 presses / 3 s / 30 s | Device | As #10 | As #1 | **branch only** (PR #114 draft, native Kotlin app, **not on RN `main`**) | 6 unit tests (`PressCounterTest`); "Not run on a device or emulator" |
| 13 | **Wrong PIN at a check-in** | Attempts 1–3 show the identical "Try again". Each is recorded as `checkin_wrong_pin` (check-in id and attempt only, no PIN material). The **first** one alerts guardians with trigger `wrong_pin`: a heads-up, never duress, never the bank. From the 3rd, the outcome is fixed as `no_answer`; from the 4th, the phone shows "Checked in" | T47; ADR-0041(7) | Device records; server alerts | `checkin_wrong_pin` pv1 | Chain | app on `main`; server alert on branches (`feat/lethabo-guardian-delivery`, `sibusiso/server-key-rotation-server`); PROPOSED | 5 server tests REPORTED in `2026-09-27-sibusiso-wrong-pin-heads-up.md` |
| 14 | **Duress PIN** (at any prompt) | Second PIN, 4–8 digits, must differ from the normal PIN; Argon2id-hashed on the phone (`PinModule.kt:23,57-61,75-78`). Gives a pixel-identical outcome (V5). The server opens an incident, alerts guardians and sends the bank signal **immediately** | n/a | PIN verified on device; consequences decided by the server | `checkin_result` (`duress_pin`) or `pin_authorised` (`mode: duress`), inside the committed payload | Chain, anchored immediately (coalesced per 60 s) | built (accepted ADR-0036 / 0041) | **Recall under stress not measured** (CEM-0 gap 4). **Known defect:** "A duress PIN at 'Welcome back' (sign-in) unlocks without raising the silent alert" (`2026-09-27-lethabo-vigil-0.0.16.md`) |
| 15 | **`no_answer`** (including the G34 fallback) | Server deadline = receipt of `opened` + window + 10 s grace. Fallback = receipt of `signal_detected` + window + 30 s, if `opened` never arrives | Window 60 s (`device.ts:50`), so about 70 s, or about 90 s on the fallback. Bank signal 3 min after the guardian alert unless a guardian sends `stand_down` (S1) | Server | Server-signed event | Chain | built on the server branch; accepted spec | M7 (false `no_answer` rate) **not measured** |
| 16 | **`contact_lost`** | Heartbeats stop for 90 s while an incident is open. After all-normal check-ins it alerts guardians but never sends the bank signal (G33) | 90 s (`contact.py:17`) | Server | Heartbeat: `speed_bucket` + timestamp only, every 30 s (`device.ts:808-812`; `screens.tsx:149-153`) | Heartbeats are not chain entries (V9) | **Off by default**: `VUKA_CONTACT_LOST_ENABLED=0` ("the app sends no heartbeats yet", `contact.py:43-46`, written before the app sent them). The Azure setting is unknown | M5 (heartbeat continuity) **not measured** |
| 17 | **Always-on listening** (the arming condition, not a trigger) | Starts by itself after set-up and retries every 30 s. Stops only on a PIN-gated pause; a duress PIN at pause looks normal but raises the full alarm | ADR-0046 | Device | Journey id plus heartbeats | n/a | **built in the app** (`screens.tsx:264-273`), but ADR-0046 is **Proposed** and says "Until then V1 as written stays the accepted rule" | Battery (M4) **not measured**. The service holds a partial wake lock without a timeout (`SensingService.kt:64`) |
| 18 | **Location window** (data, not a trigger) | After **any** check-in opens, a fix every 30 s for 30 min, after either PIN alike. The server keeps a fix only while a guardian alert is open, and purges 24 h after close | `location.ts:24-25`; `locations.py:25` | Server keep/drop | Integer lat/lon × 10⁷, accuracy, fix age, timestamp | 24 h after the incident closes | built (app and server branch); ADR-0048 Proposed. No `sim_` gate in code (all subjects are `sim_`) | Battery not measured |
| 19 | **Parked or not built** | **Trigger words** (parked: a second model and a RICA/POPIA question, ADR-0039). **Bluetooth drop at speed** (parked). **Surge** (dropped: fires while driving). **Fast path**, 25 db before `no_answer` (PROPOSED; ADR-0039(10) says "No early guardian alert in this build"). **Bank-partner signals** J01–J08 (PROPOSED, H8). High-crime precinct (parked). Night and month-end (held at 0: no source) | — | — | — | — | parked or specified | — |

**Measurement summary.** Every row is a lab proxy, not a field rate.
- **`FACT`:** ESC-50 held out, ruleset v1: glass 11/16; 7.3 false records/h; 5.5 false prompts/h (`docs/EVIDENCE.md:55-68`).
- **`FACT`:** FSD50K eval, ruleset v2 (26 Sep): the scream, glass, shatter and gunshot catch rates above (`docs/eval/cem1-measurements.md`).
- **`FACT` (branch):** v3 on 784 non-glass ESC-50 clips (1.09 h): V4 prompts go from 4.6 to 6.4 per hour, and with CEM-1 from 11.9 to 13.8 per hour. 2 clips changed, a cough and a laugh, which now reach "Screaming".
- **Not measured** (`docs/EVIDENCE.md:81`): shout/yell recall; v3 short-call recall; any field false alarm (M2); latency (M3); battery (M4); continuity (M5); delivery (M6); false `no_answer` (M7); motion (M8); duress-PIN recall; pocket-press rates.

**`ESTIMATE`, daily check-ins if the lab proxy held in daily life** (unknown, and probably not): 16 h active × 4.6–16.5 prompts/h ≈ **74–264 check-ins a day**. ADR-0046 itself estimates "on the order of 90 PIN checks a day" (`adr.md:589`).

---

## (b) Legal positions already in the repo (exact lines)

**RICA** (team position, never counsel's)
- `docs/RICA-POSITION.md:5`: "**Status: team position, not legal advice.** … **This paper therefore contains no verbatim statutory quotes.**" It was written for a "household acoustic sensor" (line 13), and says "no audio-path code exists in this repository yet" (line 5). Both are now stale.
- `:42`: "**Never attach an audio clip as evidence.** Attaching recorded audio to any record would create a RICA interception question over the *acquisition* *and* a POPIA question over the *content*".
- `:43`: "**Audio never persists.** The ring buffer is an architecture constraint (ASR-6, E3) — any change requires a fresh ADR, not a configuration."
- `:51`: "The ring buffer means nothing *persists*; it does not mean nothing is *acquired*. … The working position: the appliance is an **event-classification sensor**, not an interception device".
- `docs/STAGED-DURESS-DEFENCE.md:111`: "Interception needs a *communication* whose contents are made available to someone other than the parties. On-device classification of ambient sound, with nothing stored or transmitted, very likely falls outside it. This is our reading, not an opinion — counsel question stands".
- `docs/security/COMPLIANCE-GOVERNANCE.md:36`: "It was written for the four-layer design, but its two bright lines carry over unchanged to VIGIL".
- ADR-0039 rejected "trigger-word detection (a second model, and a RICA/POPIA question; parked)" (`docs/adr.md:492`).

**POPIA**
- **Lawful basis.** `docs/VUKA-2-SPEC.md:365`: "**Lawful basis:** the user's consent (s11(1)(a)) for their own journey data; the guardian's own consent, with the s18 notice at acceptance (G6), for guardian data." `COMPLIANCE-GOVERNANCE.md:19` (PO-1) quotes s11(1)(a): "the data subject … consents to the processing".
- **Residuals after consent is withdrawn.** PO-3 (`:21`) leaves this to counsel as Q-C2.
- **Special personal information and biometrics.**
  - `docs/security/POPIA-ONE-PAGER.md:23`: "The team position is therefore that this VIGIL flow does not process biometric information as voice recognition. … on the specified design, the special biometric-information restrictions (ss26–33) are not triggered. This is a position, not legal advice."
  - `STAGED-DURESS-DEFENCE.md:112`: "s1 defines "biometrics" to include "voice recognition" … YAMNet classifies *what sound* occurred and identifies nobody. Each 0.975 s classification window is still personal information while it exists in memory".
  - **But** ADR-0047 (`adr.md:627`) calls the guardian `why` "derived from special personal information about the member (a sign of possible duress)". ADR-0048 (`adr.md:663`) says "Location is special to the member."
- **Consent and notice.** G6 (s18 notice to guardians); PO-4 (`COMPLIANCE-GOVERNANCE.md:22`). `docs/PRIVACY-POLICY.md` is **PROPOSED** and its contact route is "UNDEFINED". The Information Officer is "**prepared, not submitted**" (`docs/POPIA-IO-REGISTRATION.md:4`).
- **s72 cross-border.**
  - PO-11 (`COMPLIANCE-GOVERNANCE.md:29`): s72(1) "may not transfer to a foreign third party unless adequate protection, or "(b) the data subject consents to the transfer"". The control reads: "Azure **South Africa North** if the student subscription allows; otherwise record the s72 basis."
  - Spec §13 (`VUKA-2-SPEC.md:367`): "South Africa North if the student subscription allows; otherwise the s72 basis is documented".
  - `FACT`: South Africa North was blocked by the subscription's region policy, and the server and database were provisioned in **UAE North** (`docs/SIBUSISO-HANDOVER.md:109`, and `:301` "App Service … (UAE North …)").
  - No s72 basis for UAE North is documented anywhere (grep, 18 Oct). The notice still says "Planned region: Azure South Africa North" (`PRIVACY-POLICY.md:18`).
  - Q-C4 asks only about FCM.

**Cybercrimes Act**
- `STAGED-DURESS-DEFENCE.md:22,110`: ss 8–9 were read from the Gazette (No. 44651). Staging is "cyber forgery and cyber uttering" (s9), and a payout is "cyber fraud" (s8).
- `COMPLIANCE-GOVERNANCE.md:40-47`: the s54 reporting duty does not apply today because it is "[Commencement date of section 54: To be proclaimed]", and VUKA is neither an ECSP nor a financial institution (⚑ Q-C5). Line 47: "A partner bank *is* a financial institution and will carry its own s54 duty once proclaimed. VUKA's risk signal is not that bank's report and must not be sold as one."

**ECTA**
- `STAGED-DURESS-DEFENCE.md:109`: "ECTA 25 of 2002, s15(3) … Say **"built to maximise the ECTA s15 reliability factors"**, never "court-admissible"".
- `docs/SA-ANCHOR-SCALE-SECURITY-BUSINESS.md:101`: "**Permitted wording:** "Designed to maximise the ECTA section 15 reliability factors.""
- `docs/reviews/ANCHOR-BLOCKCHAIN-METHODOLOGY-REVIEW.md:54`: "ANCHOR has no RFC 3161 token and no affidavit/certificate template" (s15(4)).

**Play policy and Android**
- `COMPLIANCE-GOVERNANCE.md:61`: the stalkerware reading is an `ASSUMPTION`; Q-C6 is open before any Play listing.
- Spec §11 (`VUKA-2-SPEC.md:326`): "The microphone privacy indicator can't be hidden (Android 12+) | Copy says **"discreet"**, never "invisible"".

---

## (c) User comfort design already present

- **Microphone honesty.** "Discreet, not invisible: Android shows a microphone dot while VIGIL is active." (`app/src/ui/screens.tsx:838`; `onboarding.tsx:331`). Spec §17: "Not "invisible"".
- **Pause with PIN.** The "Deactivate" control has the hint "Asks for your PIN". When paused, the screen says "You deactivated VIGIL with your PIN. Nothing is heard until you activate it again." (`screens.tsx:779`). A duress PIN at pause looks normal and raises the alarm (ADR-0046(3), G35).
- **Always-on stated with its costs** (ADR-0046, Proposed):
  - the false-check estimate (`adr.md:589`);
  - "Battery … **not measured**" (`:590`);
  - "audio stays in a 3 s ring buffer on the phone and is never stored or sent (D7). … the exposure is duration" (`:591`).
  - The welcome screen says "It listens on this phone while VIGIL is active — never when you have deactivated it." (`onboarding.tsx:299`).
- **What the member sees.**
  - A neutral ongoing notification, "VIGIL active" (`SensingService.kt:47`), and a check-in titled "Check-in" (`CheckinNotice.kt:36`).
  - A live meter labelled "Model score 0–100 against the sound's own threshold … Not a probability." (`components.tsx:528`).
  - The countdown reads "Answer when you can", then "Time's up. You can still answer" (`screens.tsx:1370-1371`).
  - Normal and duress PIN screens are identical (V5). Wrong PINs get "Try again", with no lockout.
  - No guardian acknowledgement is shown during an incident (V8). My Record shows only the pre-incident head (ADR-0041).
  - The location note reads "After a check-in, this phone sends its location until HH:MM. Your guardians see it only if they were alerted." (`screens.tsx:816`).
  - The Emergency caption reads "Opens your dialer with 10111 ready. Press call there." (`help.tsx:113`).
- **Minimisation built in.**
  - Location permission is optional (ADR-0048(5)).
  - Heartbeats carry a speed bucket only.
  - The registration payload never holds IMEI, serial, Android ID or phone number (ADR-0039(5)).
  - The guardian `why` carries words only, never a number, audio or the PIN mode (ADR-0047(6)).
  - The test-feed clip is deleted after reading (`DetectionModule.kt:159-160`).
- **Guardian behaviour.** "Don't call or text them. Call 10111." (G4). The wrong-PIN heads-up also says not to call.

---

## (d) Gaps

**Unmeasured**
- Scream recall at v3; shout/yell recall at any version; field false alarms (M2). The FSD50K scream set and its harness already exist but were not run for v3, even though `voice-v3-false-alarms.md` says FSD50K is needed.
- Battery (M4) with a permanent partial wake lock plus 2-thread inference; continuity on budget phones (M5); latency (M3); delivery (M6); false `no_answer` (M7); motion (M8, T29).
- Duress-PIN recall under stress (CEM-0 gap 4); pocket-tap and power-press false triggers; demographic and accent performance of YAMNet (`MODEL-CARDS.md:32`).
- The FSD50K results (26 Sep) were never promoted into `docs/EVIDENCE.md`, which `2026-09-25-lethabo-vigil-detection.md` calls "the only source for detection claims". The handover says "screams and gunshots haven't been measured" (`NEW-CHAT-HANDOVER.md:46`).

**Legally uncertain**
- **RICA.** The position paper covers a household appliance. It does not cover an always-on personal phone that processes **bystanders'** speech in memory (the meeting, taxi or home conversations of non-members). Q1 (transient acquisition) has no counsel answer.
- **s72.** Data is hosted in UAE North with no documented basis, and the privacy notice is wrong about the region.
- **Special personal information** (ss26–33). The one-pager and ADR-0047 contradict each other.
  - The PIN-timing baseline (`pin_slow`) is a behavioural characterisation stored on the phone.
  - `ASSUMPTION`, for counsel: whether it falls under POPIA s1 "biometrics" ("behavioural characterisation") is unexamined in the repo.
- **s71 automated decisions.** The bank signal fires automatically on a duress PIN or `no_answer` (+3 min). The repo relies on "the bank decides" (ADR-0037) and has no s71 analysis.
- **Responsible party and IO.** Not registered. `scripts/build_financial_model.py:61` names "PILOT CORE (Pty) Ltd (Reg. 2026/122060/07)" (`REPORTED`, not checked against CIPC), so Q-C1 can now be answered, but the notice still says "no registered legal entity".
- **Dataset licences.** ESC-50 is CC BY-NC 3.0 (`EVIDENCE.md:57`), and a company is now using it. Per-clip FSD50K licences have not been checked (`ASSUMPTION`).
- **Platform rules.** PR #114 adds `RECEIVE_BOOT_COMPLETED` (guardian standby), against C-20 / spec §11.
- **Governance.** PR #124 changes detection thresholds, which ADR-0036(8) puts under the two-operator signature rule (`adr.md:433`).

**What would make a user uncomfortable**
- Frequent check-ins (see the `ESTIMATE` in (a)). An unanswered false check alerts guardians in about 70 s and, without a stand-down, sends the (simulated) bank signal 3 min later.
- A one-tap Emergency button and a tile that can be pocket-pressed (the ADR-0049 amendment names this cost).
- Continuous microphone use plus an unmeasured battery drain. A lock-screen notification that names "VIGIL".
- The service is `START_NOT_STICKY` (`SensingService.kt:81`): if Android kills it, listening stops with no alert to the member.
- Location sent for 30 min after every false check.
- Guardians see reasons such as "crying or gasping".
- Bystanders are not told.
- The onboarding line "Your guardians only hear from VIGIL if you don't answer, or if you use your duress PIN" (`onboarding.tsx:301`) is now incomplete, because a wrong PIN also alerts them.

**Doc and code conflicts**
- **Always-on vs the honesty ledger.** The spec says "Not "always on"… journey mode" (`VUKA-2-SPEC.md:480`; `MASTER-CONTEXT.md` §6) and the notice says "it is not always-on" (`PRIVACY-POLICY.md:33`). The app says "Listening on this phone, all the time" (`screens.tsx:776`).
- **Location on `signal_detected`.** The spec (V9, §18) and notice (`PRIVACY-POLICY.md:27`) say location is attached only to `signal_detected`, and the in-app text says "A detection can carry where the phone was" (`account.tsx:63`). The code never attaches it (`detection.ts:155`).
- **Storing bands.** ADR-0039 rejected "storing bands or odds", and CEM-0 says "The tally is never written into the chain" (`COERCION-SCENARIOS.md:12`). Yet `evidence_observed` pv2 stores `tally_db`, `band` and `k_pct` (`contracts/payloads/evidence_observed.v2.json:16-18` on the server branch).
- **Ring buffer.** The notice says "The current spec does not define ring-buffer behavior". The code does define it (3 s, zeroed).
- **YAMNet model card** (`MODEL-CARDS.md:30-34`) still describes a four-layer "fusion engine"/"watch_candidate" role.
- **Naming.** The tile and notification say "VIGIL", while the ADRs say "VUKA".

---

## (e) Ranked ideas: stronger, lawful, comfortable signals

These are consistent with "machines notice, people decide" (ADR-0034(4)) and with no generative AI (ADR-0038). All are `PROPOSED`. Each must pass the four gates in `MASTER-CONTEXT.md` §10.

1. **Measure before adding.**
   - Run the existing FSD50K harness for v2 vs v3 on scream and shout.
   - Record a consented corpus of short calls ("Help!", "Nceda!", "Help my!", "Thusa!") across South African languages and accents.
   - Run the M2 venue false-alarm curve (taxi rank, TV, sport) and M4/M5 on a budget phone.
   - Publish to `EVIDENCE.md` with n and exact Poisson intervals.

   This unblocks the SLA (insight 4) and any insurer conversation. It costs no new data collection from members. [T, S]
2. **"Check on me" timer check-in** (dead-man timer).
   - The member sets an arrival time. If the journey isn't ended with a PIN by then, the normal check-in opens; `no_answer` then follows the existing path.
   - It covers freezing and whispered threats (O01, O02), which no sound rule catches. Measured scream catch is 6.5 %.
   - It needs only a new `sense` value (as ADR-0049 did). No audio, member-initiated, easy to consent to. [U, S]
3. **A scream-specific confirmation rule**: a single window at a higher bar, alongside PR #124's `separation: 1`. Tune on the even FSD50K ids and validate on the odd ids. It directly targets the 27/108 short clips that can never confirm. [T]
4. **Content-free tamper and "last-gasp" device-state signals**, only while armed or an incident is open:
   - shutdown broadcast;
   - airplane mode switched on;
   - SIM removed;
   - battery % and network type in the heartbeat (CEM-0 gap 7).

   They separate an attacker's power-off from a dead zone. They feed `contact_lost` and guardian context, and never act alone. `contact_lost` should also be enabled once heartbeat continuity (M5) is measured. Needs an ADR and a pv bump. [S, T]
5. **Map the already-weighted YAMNet classes:**
   - Smash/crash (463);
   - Skidding/Tire squeal (306/307) and Car alarm (304), as supporting only;
   - Fireworks/Firecracker (426/427) as negative context for gun-like sounds, replacing the calendar rule (CEM-0 gap 18);
   - Children shouting (10) as negative context.

   Same model, no new data leaves the phone. [T]
6. **The phone's own media playback as negative context.** A scream from the member's own video is the commonest everyday false alarm, and Android's playback state is content-free. Down-weighting lifts needs no ADR change. Muting V4 would need a new ADR, because ADR-0047 keeps "never quieter than V4". [U]
7. **Motion upgrades:**
   - a symmetric look-back of −10 s to +10 s, so a grab after a scream counts (CEM-0 gap 9);
   - a "phone thrown" pattern: a free-fall dip, then impact.

   Motion still never opens a check-in alone (H3). Measure M8 first. [T]
8. **Consented false-alarm labelling.** After every check-in, for both PINs identically (V5), offer an optional neutral question: "What was it? TV / sport / kids / skip". Answers given after a duress PIN are ignored on the server. Answers stay in the member's private payload. This is the field-calibration dataset insurers will ask for. [B, T]
9. **Bank-partner E3 signals for the Nedbank/insurer B2B track:**
   - new beneficiary, large transfer, ATM use at an odd hour, or a limit increase during an open incident (CEM-0 J reasons);
   - they raise the E-level and the tally only;
   - the bank decides (H8);
   - gated by G36–G38.

   Decide whether partner evidence may alert guardians (CEM-0 gap 13). [B, S]
10. **Duress-PIN recall support.** Opt-in practice check-ins, plus a measured recall rate with consenting pilot users (O04, O05). [U]
11. **Covert manual triggers.**
    - Port the power-press pattern to the RN `main` app and measure its pocket false-trigger rate.
    - Consider a Bluetooth or watch button using `sense: "manual"`.
    - Restore a hold, or a two-step press, for the on-screen button if pocket taps prove common. [U]
12. **Keep parked:**
    - on-device keyword spotting (non-generative). It needs counsel on RICA Q1 for speech-content decoding and a new ADR superseding ADR-0038(2).
    - an opt-in e-hailing route-deviation flag, computed on the phone, with only an "off route" flag sent. [S]

**Lawful-and-comfort fixes that should come with any new signal:**
- Rewrite the notice: always-on, UAE North plus its s72 basis, context sounds, tallies, PIN timing, the guardian `why`, and wrong-PIN alerts.
- Refresh the RICA paper for an always-on personal phone and bystanders, then take Q1 to counsel.
- Register the IO for PILOT CORE.
- Reconcile ADR-0047 with the special-PI position.
- Fix the duress-at-sign-in defect.
- Record two-operator sign-off on threshold changes.
- Add a "listening stopped" notice.
- Put the server code on `main`, or name the deploy branch as the source of record.

## KEY FACTS
- [FACT] On main, voice prompt thresholds are Shout 6000, Yell 6000, Screaming 4500 bp. Voice confirmation needs separation 2 (about 1.5 s of sound). Glass is 3500, Shatter 3000, Breaking 4000, and each gun-like class 3500. Record thresholds are half the prompt thresholds. The ruleset is labelled UNCALIBRATED. — app/src/brain/detect/ruleset.ts:73-111 (2026-10-18)
- [FACT] Open PR #124 (ruleset v3) lowers the voice bars to Shout and Yell 3500 and Screaming 3000 (record 1750/1750/1500). Voice confirmation becomes separation 1, so a single short call of about 0.5 s confirms. Lethabo requested changes on 14 Oct and 16 Oct. — git diff origin/main...origin/sibusiso/detect-sensitivity -- app/src/brain/detect/ruleset.ts; gh api repos/LethaboMH14/V.U.KA--Geekulcha/pulls/124/reviews (2026-10-16)
- [FACT] FSD50K eval, ruleset v2, share of clips that open a check-in (V4 / CEM-1): Screaming 6.5% / 10.2% (n=108); Glass 46.0% / 52.5% (n=139); Gunshot 54.6% / 57.4% (n=108); Shatter 72.9% / 75.7% (n=70). 27 of the 108 scream clips are shorter than three windows and can never confirm. — docs/eval/cem1-measurements.md:8-17 (2026-09-26)
- [FACT] ESC-50 held-out folds 4-5 (ruleset v1): glass recall 11/16 (68.8%); false records 4 in 0.544 h (7.3/h, 392 clips); false prompts 5.5/h in a host-harness replay. — docs/EVIDENCE.md:55-68 (2026-09-25)
- [FACT] False check-ins per hour of ESC-50 negatives: folds 4-5 V4 7.3 and CEM-1 16.5 (of which 9.2 are lifts); folds 1-3 V4 1.8 and CEM-1 7.3. Counts are 1-9 prompts per 0.54 h split, and this is a stress proxy, not a field rate. — docs/eval/cem1-measurements.md:19-24 (2026-09-26)
- [FACT] On 784 non-glass ESC-50 clips (1.09 h), moving from v2 to v3 raises V4 prompts from 4.6 to 6.4 per hour and CEM-1 prompts from 11.9 to 13.8 per hour. Two clips changed: a cough and a laugh now reach Screaming. Short-call recall is not measured. — origin/sibusiso/detect-sensitivity:docs/eval/voice-v3-false-alarms.md (2026-10-14)
- [FACT] These have never been measured: shout/yell recall, field false alarms (M2), latency (M3), battery (M4), heartbeat continuity (M5), delivery (M6), false no_answer (M7), motion firings (M8), and duress-PIN recall under stress. — docs/EVIDENCE.md:67-68,81; docs/COERCION-SCENARIOS.md:563 (2026-10-18)
- [ESTIMATE] If the ESC-50 proxy rates held in daily life (unknown), a 16-hour active day would produce about 74-264 check-ins. Assumptions: 4.6-16.5 prompts/h × 16 h. ADR-0046 itself says 'on the order of 90 PIN checks a day'. — docs/eval/cem1-measurements.md; voice-v3-false-alarms.md (branch); docs/adr.md:589 (2026-10-18)
- [FACT] Raw audio is held in a 3-second in-memory ring buffer, zeroed on stop; each window copy is zeroed after inference; AGC, noise suppression and echo cancellation are disabled; nothing is written to storage. — app/android/app/src/main/java/com/teamsonar/vuka/detect/AudioPipeline.kt:33-35,66,93,118-122,161,171 (2026-10-18)
- [FACT] The YAMNet model is hash-checked at load (sha256 10c95ea3…17de) and its classes are resolved by label; it is licensed Apache-2.0. — YamnetClassifier.kt:18,55-68; docs/MODEL-LICENCES.md:13 (2026-10-18)
- [FACT] Motion rules: impact peak >= 3000 mg; snatch 1800-2999 mg after 2 s still; shake 3 frames with std >= 500 mg and >= 4 crossings. They look back 10 s and count only when the phone was stationary or walking. Motion never opens a check-in. — app/src/brain/detect/ruleset.ts:115-129; app/src/brain/detect/motion.ts:67-118 (2026-10-18)
- [FACT] CEM-1 lifts a record-level sound to a check-in only if P >= 5 db, it is not the case that K >= 50% with P < 12 db, the prompt slot is free, and there was no prompt in the last 30 s. Lifts apply only to sim_ subjects, and every member subject id is sim_subj_…. — app/src/brain/cem/grader.ts:35-40,77,139-147; app/src/api/device.ts:468 (2026-10-18)
- [FACT] Smash/crash, tyre squeal/skid and car alarm have CEM weights, but no YAMNet mapping on the phone, so they can never fire. — app/src/brain/cem/index.ts:32,36-37; app/src/brain/detect/classes.ts (CONTEXT list); docs/eval/cem1-transitions.md:42 (2026-10-18)
- [FACT] pin_slow fires when an entry is slower than the member's median + 3·MAD (MAD floor 50 ms), after at least 8 entries; the last 20 entry times are stored on the phone. pin_retry and pin_slow are worth +2 each. — app/src/api/device.ts:201-218,905-910; app/src/brain/cem/index.ts:48-49 (2026-10-18)
- [FACT] The Emergency button raises signal_detected with sense 'manual' and opens the dialer with 10111 (the member presses call); taps within 3 s count once. The Quick Settings tile is labelled 'VIGIL'. — app/src/api/device.ts:839-840; app/src/ui/help.tsx:28-34,92-117; app/android/app/src/main/AndroidManifest.xml:50 (2026-10-18)
- [FACT] Power-button help (4 screen toggles within 3 s, 30 s cooldown, only while a journey is active) exists only in draft PR #114. That PR targets the native Kotlin app on feature/integrate, not the React Native main app. It was not run on a device. — origin/lethabo/native-guardian-watch-and-sos:app/src/main/java/za/co/vuka/app/panic/PowerPresses.kt; gh api pulls/114 (base=feature/integrate, draft=true) (2026-09-27)
- [FACT] Wrong PINs 1-3 at a check-in are recorded as checkin_wrong_pin, with no PIN material. On the server, the first one alerts guardians as a 'wrong_pin' heads-up: never duress, never a bank signal. — app/src/api/device.ts:886-895; origin/sibusiso/server-key-rotation-server:server/incidents.py:57 (2026-10-14)
- [REPORTED] A duress PIN at 'Welcome back' (sign-in) unlocks without raising the silent alert. This is a known, unfixed defect. — docs/build-log/entries/2026-09-27-lethabo-vigil-0.0.16.md (2026-09-27)
- [FACT] contact_lost is off by default on the server (VUKA_CONTACT_LOST_ENABLED defaults to '0'). Whether it is enabled on the Azure deployment is unknown. — origin/sibusiso/server-key-rotation-server:server/contact.py:42-46; .env.example:38 (2026-10-14)
- [FACT] The app sends a heartbeat every 30 s while listening, carrying only a speed bucket and a timestamp. — app/src/ui/screens.tsx:149-156; app/src/api/device.ts:808-812 (2026-10-18)
- [FACT] The code never attaches location to signal_detected. Location is sent only in the ADR-0048 window: every 30 s for 30 min after any check-in. The server keeps a fix only while a guardian alert is open and purges it 24 h after the incident closes. — app/src/sensors/detection.ts:155; app/src/sensors/location.ts:24-25; origin/sibusiso/server-key-rotation-server:server/locations.py:25,46-61 (2026-10-18)
- [FACT] No 90-day payload retention job exists on the latest server branch. A 72-hour deletion purge and a 24-hour location purge do exist. — git grep on origin/sibusiso/server-key-rotation-server -- server (deletion.py:10, locations.py:25) (2026-10-18)
- [FACT] The ANCHOR server code is not on main; only server/README.md and .gitkeep files are tracked there. — git ls-files server (2026-10-18)
- [FACT] Always-on listening (ADR-0046) is implemented in the app, but the ADR is still Proposed and says that until it is accepted 'V1 as written stays the accepted rule'. — app/src/ui/screens.tsx:264-273; docs/adr.md:579 (2026-10-18)
- [FACT] The ANCHOR server and database were provisioned in Azure UAE North because South Africa North was blocked by the subscription's region policy. No s72 basis is documented, and the privacy notice still says South Africa North. — docs/SIBUSISO-HANDOVER.md:109,301; docs/PRIVACY-POLICY.md:18; docs/security/COMPLIANCE-GOVERNANCE.md:29 (2026-10-18)
- [FACT] The team's RICA position is that on-device classification with nothing stored or transmitted 'very likely falls outside' interception. It is not legal advice, and counsel question Q1 (transient acquisition) is still open. — docs/STAGED-DURESS-DEFENCE.md:111; docs/RICA-POSITION.md:5,51,68 (2026-10-18)
- [FACT] The POPIA one-pager says the special biometric-information restrictions (ss26-33) are not triggered. ADR-0047 calls the guardian 'why' 'derived from special personal information about the member'. — docs/security/POPIA-ONE-PAGER.md:23; docs/adr.md:627 (2026-10-18)
- [FACT] The Information Officer registration is prepared, not submitted. — docs/POPIA-IO-REGISTRATION.md:4,78-80 (2026-10-18)
- [REPORTED] The company is PILOT CORE (Pty) Ltd, Reg. 2026/122060/07, with Sibusiso Khumalo and Lethabo Hoaeane as directors (50/50). — scripts/build_financial_model.py:61 (not checked against CIPC) (2026-10-18)
- [FACT] The Cybercrimes Act s54 reporting duty is recorded as not yet proclaimed, and VUKA as neither an ECSP nor a financial institution. Staging an event is cyber forgery, uttering or fraud under ss8-9, read from the Gazette. — docs/security/COMPLIANCE-GOVERNANCE.md:40-47; docs/STAGED-DURESS-DEFENCE.md:22,110 (2026-10-18)
- [FACT] The repo's permitted ECTA wording is 'built to maximise the ECTA s15 reliability factors', never 'court-admissible'. — docs/STAGED-DURESS-DEFENCE.md:109; docs/SA-ANCHOR-SCALE-SECURITY-BUSINESS.md:99-101 (2026-10-18)
- [FACT] The member-facing copy states 'Discreet, not invisible: Android shows a microphone dot while VIGIL is active'. The live meter is labelled 'Not a probability'. — app/src/ui/screens.tsx:838; app/src/ui/onboarding.tsx:331; app/src/ui/components.tsx:528 (2026-10-18)
- [FACT] The evidence_observed pv2 schema stores tally_db, band and k_pct in the committed private payload. — origin/sibusiso/server-key-rotation-server:contracts/payloads/evidence_observed.v2.json:16-18 (2026-10-14)
- [FACT] Guardians see an alert's 'why': the band plus up to 3 positive reason names, decrypted on the server from the member's evidence payload. — origin/sibusiso/server-key-rotation-server:server/guardian_alerts.py:30-66 (2026-10-14)
- [FACT] Trigger-word detection is parked: it needs a second model and a RICA/POPIA answer. ADR-0038 allows YAMNet as the only shipped model. — docs/adr.md:451,492; docs/COERCION-SCENARIOS.md:94 (2026-10-18)
- [FACT] ESC-50, the dataset behind the published glass and false-alarm figures, is licensed CC BY-NC 3.0. — docs/EVIDENCE.md:57 (2026-10-18)

## CONFLICTS/GAPS
- Always-on vs the honesty ledger: spec §17 (VUKA-2-SPEC.md:480), MASTER-CONTEXT §6 and PRIVACY-POLICY.md:33 say 'not always-on / journey mode', but the app copy says 'Listening on this phone, all the time' (screens.tsx:776) and ADR-0046 is still only Proposed.
- Location on signal_detected: the spec (V9, §18), PRIVACY-POLICY.md:27 and the in-app text (account.tsx:63, 'A detection can carry where the phone was') say a detection carries location. The code never attaches it (detection.ts:155); location travels only in the ADR-0048 window.
- Hosting: the privacy notice says Azure South Africa North, but the server runs in UAE North (SIBUSISO-HANDOVER.md:109), and no s72 basis is documented anywhere.
- Special personal information: the POPIA one-pager says ss26-33 are not triggered; ADR-0047 calls the guardian 'why' derived from special personal information. The pin_slow keystroke-timing baseline has not been assessed against the POPIA s1 'biometrics' definition, which includes 'behavioural characterisation' (ASSUMPTION, for counsel).
- ADR-0039 rejected 'storing bands or odds', and CEM-0 §1 says the tally is never written into the chain, yet evidence_observed pv2 stores tally_db, band and k_pct.
- The RICA position paper was written for a household appliance and says no audio code exists. It does not cover an always-on personal phone that processes bystanders' conversations in memory; counsel Q1 is unanswered.
- The FSD50K catch rates (scream 6.5%, n=108; gunshot 54.6%, n=108) are in docs/eval but not in EVIDENCE.md, and NEW-CHAT-HANDOVER.md:46 says screams and gunshots are unmeasured.
- PR #124's v3 eval says scream recall needs FSD50K, but the FSD50K harness already exists and was not run for v3. Short-call and shout recall remain unmeasured.
- PR #124 changes detection thresholds, which ADR-0036(8) puts under the two-operator signature rule. No such sign-off is recorded, and the PR is CHANGES_REQUESTED.
- Two app codebases: power-button help (PR #114) exists only in the native Kotlin app on feature/integrate, whose detection engine lacks CEM-1 and motion. The published demo (0.0.16) is the React Native app on main.
- The ANCHOR server (incidents, wrong_pin, contact_lost, locations, why) is not on main; the branch Azure actually runs is recorded only in a build-log line ('feat/lethabo-guardian-delivery … which is what Azure runs').
- contact_lost is disabled by default on the server (the flag was written before the app sent heartbeats); the Azure setting is unknown.
- The 90-day payload retention (spec P2, §13) has no implementation on the latest server branch, and the in-app rights text says deletion is 'not in this app yet'.
- Known defect: a duress PIN at 'Welcome back' sign-in raises no silent alert, which violates V6.
- PR #114 adds RECEIVE_BOOT_COMPLETED for guardian standby, against C-20 and spec §11.
- The onboarding copy says guardians hear only on no answer or a duress PIN (onboarding.tsx:301); the wrong-PIN heads-up now also alerts them.
- The service is START_NOT_STICKY with a permanent partial wake lock. If Android kills it, listening stops without telling the member, and battery cost is unmeasured.
- The YAMNet model card still describes the retired four-layer fusion/watch_candidate role; the tile and notification say 'VIGIL', while ADR-0046/0049 say 'VUKA'.
- ESC-50 (CC BY-NC 3.0) is used for evaluation by what is now a company; per-clip FSD50K licences are unchecked.
- CEM-0's 19 'What we forgot' items are still open, including: the duress-PIN recall measure, guardian delivery state, symmetric motion window, silence and whispers, any single guardian's stand_down closing everything, and no cancel path for an accidental duress PIN.

## RECS
- 1. Measure before adding signals. Run the existing FSD50K harness for v2 vs v3 on Screaming and Shout, with held-out ids and exact intervals. Record a consented short-call corpus in SA languages and accents. Run M2 venue false alarms, and M4/M5 on a budget phone. Promote the results into EVIDENCE.md with n. Serves T, S, and the insight-4 SLA.
- 2. Add an opt-in 'check on me' timer check-in: a new signal_detected sense value that reuses the existing check-in and no_answer path. It covers freezing and whispered threats without audio, and is member-initiated. It needs a contract ADR like ADR-0049.
- 3. Test a scream-specific single-window rule at a higher bar, alongside PR #124's separation 1. Tune on the even FSD50K ids, validate on the odd ids, and record two-operator sign-off under ADR-0036(8) before it ships.
- 4. Add content-free tamper and last-gasp signals while armed or in an open incident: shutdown, airplane mode on, SIM removed, and battery/network state in the heartbeat. They feed contact_lost and guardian context, never a consequence alone. Enable contact_lost once M5 is measured.
- 5. Map the already-weighted YAMNet classes (Smash/crash 463, Skidding/Tire squeal 306/307, Car alarm 304) as supporting evidence, and Fireworks/Firecracker 426/427 plus Children shouting 10 as negative context. Same model, no new data leaves the phone.
- 6. Use the phone's own media playback state as negative context to cut false alarms from the member's own videos. Changing V4 itself needs a new ADR.
- 7. Extend motion to a symmetric −10 s to +10 s window and add a 'phone thrown' (free-fall then impact) pattern. It stays corroboration only (H3); measure M8 first.
- 8. Add optional, consented false-alarm labelling after every check-in, identical for both PINs (V5). Ignore answers given after a duress PIN on the server. This builds the field-calibration dataset insurers will ask for.
- 9. For the Nedbank and insurer B2B track, specify bank-partner E3 signals during an open incident (CEM-0 J reasons, H8): they raise the E-level only, and the bank decides. Close gates G36-G38 first, and decide whether partner evidence may alert guardians.
- 10. Fix the legal paperwork before launch. Register the IO for PILOT CORE (Pty) Ltd. Document the s72 basis for UAE North, or move region. Rewrite the privacy notice: always-on, hosting, context sounds, evidence tallies, PIN timing, the guardian 'why', wrong-PIN alerts. Refresh the RICA paper for an always-on personal phone and bystanders, and send Q1, s71 and the PIN-timing biometrics question to counsel.
- 11. Fix comfort and trust defects. Raise the silent alert on a duress PIN at sign-in. Notify the member when listening stops unexpectedly. Reconsider the one-tap Emergency button, or measure its pocket-tap rate. Correct the onboarding line about when guardians hear. Reconcile the 'always on' copy with the honesty ledger, e.g. 'listens while active until you pause it with your PIN; a reboot stops it'.
- 12. Resolve the code-of-record split. Merge or designate the ANCHOR server branch, and decide whether the React Native app (main) or the native Kotlin app (feature/integrate) carries power-button help, CEM-1 and motion. Keep trigger-word spotting and route deviation parked until counsel and a new ADR.