# Vukosi Khoza

**Proposed planning package; owner has not confirmed availability or started these tasks.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Vukosi Khoza. Wits. **VIGIL sensing, signing and measurement** — the phone that notices, and the instruments that prove how well it notices. KHAYA hardware is parked (ADR-0034); nothing I built is deleted.

**Reviewed by** — Lethabo (from 23 Sep), then both leads.

**Effort** — **Medium-high.** Never let me state a number I have not measured.

**Behaviour** — *Never let me state a number I have not measured. If I need an instrument to make a claim, build the instrument first. "Unknown" is a fine answer; an estimate dressed as a measurement is not.*

**My domain rules**
- **Never state a detection rate, latency or battery figure I have not measured**, with method, configuration and n.
- **Build the instrument before the claim** — `scripts/eval_yamnet.py` and the latency log come first; the number comes after.
- **Classes by label, input shape asserted, model by sha256** — never trust recorded metadata (this caught a real bug: the predecessor mapped the wrong YAMNet classes).
- **No JavaScript randomness for anything cryptographic** — salts and nonces come from native `SecureRandom`.
- **No permission the judge build does not need** — no CAMERA, SEND_SMS, background location or boot receiver.
- The absence of a heartbeat is itself evidence — the server's `contact_lost`, never a silent gap.

**Current task** — Work order below (issued 23 Sep). First: port the predecessor app file by file into `app/` and get a signed release APK cold-installed from a QR code by **Thu 22:00**.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: every figure I report has a measurement method attached, or it is explicitly labelled unmeasured.

---

- University / role: Wits / IoT developer — VIGIL sensing and measurement from 23 Sep
- Owns outright: VIGIL on-device sensing, signing, queue, Android build and measurement (KHAYA sensors, edge runtime and hardware parked 23 Sep, ADR-0034).
- Reviews only: Sensor, signer and device-contract assumptions.
- Lead / escalation: Lethabo, then both leads.
- AI tool / model: Codex / GPT-5 (assistant-run in this session; owner confirmation pending).
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: Work order issued 23 Sep 2026 (see the Work order section below); release APK gate Thu 24 Sep 22:00. PR #42 (KHAYA BOM) parked with KHAYA.
- Claimed files / contract versions: `appliance/agent.py`, `appliance/tests/`, `appliance/README.md`; consumes `contracts/events.schema.json` v0.1.0 without changing it.
- Last updated: 23 September 2026 — work order issued by Lethabo (co-lead) via Claude Code assistant.

## Merge-gate follow-up declaration — 2026-09-16

Criterion: **C3 (progress of solution profile)**. Trust answer: the follow-up makes the boundary and future acceptance test independently checkable without claiming that payload integration is already built.

Intended shared-file edits: `docs/OVERLAPS.md` (coordination claim), `docs/CHECKLIST.md` (P2.16 follow-up reference), and `docs/BUILD-LOG.md` (append-only evidence). No contract file or production access is in scope.

Ownership is **PROPOSED**, pending acknowledgement: Vukosi owns future synthetic `SightingEvent` payload emission; Sibusiso owns server-consumer confirmation; Khutso maintains the checklist/evidence record. This session records the follow-up only and does not implement payload emission or mark the consumer gate complete.

## Work order — VIGIL + ANCHOR build (issued 23 Sep 2026)

> Issued by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde. Decisions: ADR-0034 to ADR-0038. Spec: `docs/VUKA-2-SPEC.md` (section numbers below refer to it). **Owner acknowledgement pending** — accept it in your running log, or raise a blocker here. All times SAST. Criterion letters per `docs/MASTER-CONTEXT.md` §2 (I · T · U · S · B · Q). Before you start anything: pass the four review gates in `docs/MASTER-CONTEXT.md` §10.

**Outcome you own:** a signed release APK a judge can install from a QR code. It arms a journey, hears a scream or breaking glass on the device, signs every event with a hardware-backed key and delivers it. And the numbers that say how well it does all that.
**Serves:** T, U, S.
**Files you own or may touch:** `app/` (native: `android/`, Kotlin modules, the sensing service), `scripts/fetch_models.py`, `scripts/eval_yamnet.py`, the Android job in `.github/workflows/checks.yml`; measurement rows go to `docs/EVIDENCE.md` through Khutso.

**Do this, in order:**
1. **Thu 24 morning** — create a fresh React Native 0.74.5 project in `app/` (record the exact init command in the PR). Port the predecessor's files **one at a time**, noting in the PR what changed in each (RULES.md forbids copying trees wholesale): `SensingService.kt`, `AudioModule.kt`, `PinModule.kt`, and `MotionModule.kt` as stretch. Fix the four known defects: the 10-minute wakelock cap (rely on the foreground service), cleartext traffic, the `CAMERA` permission, and the boot receiver.
2. **YAMNet** — `scripts/fetch_models.py` downloads `yamnet.tflite` into `app/android/app/src/main/assets/models/` (gitignored) and checks its sha256 against `docs/MODEL-LICENCES.md`. Map classes **by label** from `yamnet_class_map.csv` (Screaming 11, Shout 6, Yell 9, Glass 435, Shatter 437, Breaking 464) with a unit test. Assert the input from `get_input_details()` (15 600 float32 samples, 16 kHz mono). Report scores as integer basis points.
3. **Journey arming** (V1, V2, V10) — build the foreground-service type from the permissions actually granted; refuse to arm without microphone and notification permission, and explain why; show a persistent neutral notification.
4. **Check-in plumbing** (V4) — use a full-screen intent when `canUseFullScreenIntent()` allows, else a heads-up notification; post a signed `opened` only after it is shown.
5. **Signer module** (V7) — P-256 key in Android Keystore, StrongBox when `FEATURE_STRONGBOX_KEYSTORE` is present. Export the key-attestation chain at registration. Expose native `SecureRandom` salts and nonces to JS. Sign the bytes handed over from `shared/canonical.js` and return DER (Ipeleng's `shared/der.js` converts it).
6. **Queue** (V8, V9) — one ordered, encrypted local queue with retry and backoff. Heartbeat every 30 s with a speed bucket only.
7. **Thu 22:00 — GATE D1** (backup owner: Mutarisi; if it fails, the demo uses a USB-installed debug build until Friday's fix, and we say so). Build a signed release APK with the release keystore from an environment variable (never committed) and R8 keep rules (`-keep class org.tensorflow.** { *; }`). Upload it to GitHub Releases, **cold-install it from the QR on a clean phone**, then run T17 (deny each permission in turn). Record it in a build-log entry with a screenshot or video. Also hand Ipeleng the **T03 fixture**: a real Keystore DER signature and public key from the phone.
8. **Android CI** — add an `assembleRelease` job (CI-signed or unsigned) to `.github/workflows/checks.yml`.
9. **Fri 25 by 12:00** — thin end-to-end slice with Sibusiso and Ipeleng (§2 D2).
10. **Sat by 18:00 — measurements M1–M5 and M7** (§16):
    - `scripts/eval_yamnet.py` on FSD50K "Screaming" and ESC-50 "glass_breaking". Commit clip-ID lists and licences, never audio.
    - False alarms per hour on 30 minutes of consenting ambient recordings.
    - Latency with n ≥ 30.
    - Battery per armed hour.
    - Heartbeat continuity on a Tecno/Itel/Xiaomi-class phone.
    - False `no_answer` rate on a 30-minute passenger-held drive.

    Give Khutso the method, configuration and n for each.

**Acceptance checks:**
- [ ] T17, T18 and T20 pass
- [ ] Release APK cold-installs from the QR (screenshot or video in the PR)
- [ ] Class mapping by label has a unit test; input shape is asserted; sha256 is checked
- [ ] The merged manifest has no `CAMERA`, `SEND_SMS`, `ACCESS_BACKGROUND_LOCATION` or `RECEIVE_BOOT_COMPLETED` (grep output in the PR)
- [ ] M1–M5 and M7 in `docs/EVIDENCE.md` with n, or "not measured" with the reason

**Depends on → hands off to:** contract v2 mock (Sibusiso) and `shared/` (Ipeleng) → native modules to Mutarisi; numbers to Khutso, then Babatunde.
**Do not:** copy predecessor trees wholesale; commit the model, a keystore or any audio; use `Math.random`; claim accuracy; add a permission the judge build doesn't need.
**Reviewer:** Lethabo.

## Sequenced work

**Superseded 23 September 2026 by the work order above** — kept for history; do not execute these rows. All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 16 | 3.2 | 6 | Port minimal synthetic edge producer | 1.4,3.1 | Only sim_ fixtures; consumer validates sequence and offline replay |
| Sep 17 | 4.2 | 4 | Measure load and obtain BOM quotes | none | Wattage/runtime procedure and quote dates recorded; missing kit explicit |
| Sep 19 | 4.4 | 4 | Exercise power/offline recovery | 3.2,4.2 | Mains/WAN loss observed; no fabricated continuity or receipt |
| Sep 22 | 6.2 | 3 | Pack and test venue power/network kit | 4.4 | Inventory, charged kit and local connectivity test recorded |

## Interfaces

- Inputs: Event schema from Sibusiso; capture constraints from Ipeleng.
- Outputs: Measured load/BOM to Babatunde; edge event format to backend.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

2026-09-15 — Codex assistant, at the user's request, implemented WBS 3.2 on `feat/vukosi-3.2-edge-producer`. This records assistant work, not unverified human activity. Added a schema-shaped synthetic producer, JSONL queue/replay, fixtures and focused tests. No sensor, hardware, power, tamper, or live-consumer capability is claimed.

## Role self-review — 2026-09-15

- Current task matches the assignment: WBS 3.2 is the first implementation slice, followed by BOM/power measurement (4.2), offline/power recovery (4.4), and venue kit (6.2).
- This session used Codex / GPT-5. The human owner's preferred tool/model is not independently confirmed.
- Availability remains **unconfirmed**; no hours or dates are treated as accepted commitments.
- The implementation scope matches reality for this checkout: `appliance/` has no real sensors, fabricated appliance, power instrument, or live server consumer. The queue demonstrates synthetic file replay only.
- The contract is consumed exactly as merged. The repository's `docs/CONTRACT-APPROVAL-RECORD.md` still says approval is pending; Sibusiso/Lethabo must reconcile that record before the contract is described as fully frozen.

## Needs and blockers

- Physical phones: at least two Android phones (user + guardian) and one budget 2–3 GB phone for M4/M5 → leads confirm who brings what by Thu 24 Sep 10:00.
- No appliance → Lethabo procurement decision.
- no UPS measurement → borrow test equipment through team.
- event envelope v0.1.0 is merged in `contracts/events.schema.json`, with Lethabo's PR #6 approval and Sibusiso's implementation instruction; the approval record still requires reconciliation before calling the contract fully frozen. Build against the exact fields and rejection rules. `test/events-contract.test.mjs` is the pattern mirrored by the producer tests. No live server consumer exists yet — validate against the schema directly until one does.
- Consumer confirmation remains a separate cross-layer blocker: current `POST /v1/sightings` accepts `SightingEvent` (the envelope plus required `Sighting` payload), while WBS 3.2 intentionally emits the envelope only. Sibusiso/Khutso must track and resolve payload construction; this producer must not be described as live-ingest ready.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Spare cables/power-bank kit.
- camera field-of-view consent checklist.
- hardware disposal and handover instructions.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
- 2026-09-15 — Protocol correction: the WBS/path declaration for 3.2 was recorded in this file after implementation began, rather than before the first edit as RULES/AGENTS require. The paths are now explicit (`appliance/agent.py`, `appliance/tests/`, `appliance/README.md`, `team/vukosi.md`, `docs/BUILD-LOG.md`); no shared contract was edited. This correction is assistant-authored and included in PR #24.
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Vukosi is asserted; owner acknowledgement pending.
