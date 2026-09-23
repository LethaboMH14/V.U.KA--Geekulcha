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
- AI tool / model: **FACT (owner request, 23 Sep):** Codex/GPT for implementation; Claude Code for reasoning and independent review. Specific selected models are recorded per run; recommendations are in `docs/VUKOSI-VIGIL-WORKFLOW.md`. No Claude run is claimed by this entry.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: Work order issued 23 Sep 2026 (see the Work order section below); release APK gate Thu 24 Sep 22:00. PR #42 (KHAYA BOM) parked with KHAYA.
- Claimed files / contract versions: `appliance/agent.py`, `appliance/tests/`, `appliance/README.md`; consumes `contracts/events.schema.json` v0.1.0 without changing it.
- Last updated: 23 September 2026 — work order issued by Lethabo (co-lead) via Claude Code assistant.

## Workflow preparation declaration — 23 September 2026

**PROPOSED:** prepare the execution workflow for P3.V1–P3.V6 and P3.L4, not product implementation or acceptance of the issued deadlines. Intended files: this file, `docs/OVERLAPS.md`, `docs/VUKOSI-VIGIL-WORKFLOW.md`, `docs/reviews/VUKOSI-PR43-READINESS.md`, `docs/VUKOSI-CLAUDE-PROMPT.md`, and a new `docs/build-log/entries/2026-09-23-codex-vukosi-vigil-workflow.md`.

Criteria: T, U, S (and historical C1/C3 coordination). Trust answer: the implementation and independent review use the same pinned spec, explicit prerequisites and real-device evidence. Four gates: no input-authenticity claim from signatures; budget-phone tests remain required; no new economic claim; no private audio, keys or personal data published.

Acceptance: live PR disposition and actionable findings with references; every Vukosi work-order item mapped to its deadline, owner dependency, check and handoff; Claude reasoning/review and GPT execution separated in files; no feature, contract or approval changed. Blockers: PR #43 remains open at inspected head `0c6d202`; P3.L8 and security review remain pending; physical phone access, capacity, predecessor access and the full Android toolchain are unconfirmed. Workflow is a local draft pending Claude and human review, not a remote coordination update.

## Review and first-packet declaration — 23 September 2026

**PROPOSED (Claude Code assistant, `claude-opus-5-5`, at Vukosi's request):** independent review plus the first implementation packet. The review is documentation-only. New: `docs/reviews/VUKOSI-WORKFLOW-CLAUDE-REVIEW.md`, `docs/workflows/vukosi/p2a-yamnet-provenance/TASK.md`, and a new `docs/build-log/entries/2026-09-23-claude-vukosi-review-first-packet.md`. Refined: `docs/VUKOSI-VIGIL-WORKFLOW.md`, this file and `docs/OVERLAPS.md`. **Packet P2a (P3.V2) paths, for the executor only:** `scripts/fetch_models.py`, `scripts/tests/test_fetch_models.py`, `docs/workflows/vukosi/p2a-yamnet-provenance/IMPLEMENTATION.md`, a new build-log entry, and a running-log line here. Downloads go to the gitignored `app/android/app/src/main/assets/models/` and are never committed. No contract, `shared/`, `.gitignore`, `docs/MODEL-LICENCES.md`, `docs/EVIDENCE.md`, CI or other owner's file. Criterion T/S. The older `appliance/` claim above is parked with KHAYA (review R4). Its replacement is Vukosi's to confirm.

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
5. **Signer module** (V7) — P-256 key in Android Keystore, StrongBox when `FEATURE_STRONGBOX_KEYSTORE` is present. Export the key-attestation chain at registration. Expose native `SecureRandom` salts and nonces to JS. Sign the bytes handed over from `shared/canonical.js` and return DER (Ipeleng's `shared/der.js` converts it). `shared/` sits outside `app/`, so add it to Metro's `watchFolders` in RN 0.74.
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

Replaced on 23 Sep 2026 by the work order above. The four-layer sequenced work, declarations and self-reviews are kept in [this file's history](../archive/2026-09-four-layer/team/vukosi-history.md).

## Interfaces

See your work order's **Depends on → hands off to** line. Shared files are claimed in `docs/OVERLAPS.md`; never silently change a shared contract.

## Needs and blockers

- **PROPOSED — predecessor-file access:** Vukosi and Lethabo to provide an authorised path and recorded confirmation that the individually reviewed predecessor files may be read for the port; no old history or wholesale checkout is authorised.
- **PROPOSED — release signing and publication:** Lethabo to name the release-signing custodian and approve a publication route for the APK; evidence is a named person and protected secret location, with no credential values in chat or the repository.
- **PROPOSED — YAMNet source of record:** Vukosi to designate an authorised model source whose observed SHA-256 matches `docs/MODEL-LICENCES.md`; evidence closes P2a review finding C2 without changing the register to fit a download.
- **PROPOSED — inference runtime:** Vukosi to approve installation of `ai_edge_litert`; evidence is the recorded approval and an environment check before installation. P2a live checks remain NOT RUN meanwhile.
- **PROPOSED — contract v2 gaps C5–C8:** Sibusiso to close the PR #51 contract gaps; evidence is the reviewed contract-v2 change and passing contract tests.
- **PROPOSED — offline queue skew:** Sibusiso and Ipeleng to decide the accepted clock-skew rule for offline-queued events; evidence is a recorded cross-layer/security decision and matching tests.
- **PROPOSED — reboot re-arm:** Lethabo to decide the V10 reboot re-arm trigger; evidence is the approved spec decision and an acceptance test.
- **PROPOSED — measurement phones:** the leads to provide one budget 2–3 GB Android phone and a second phone for M3/M4/M5; leads confirm who brings what by Thu 24 Sep 10:00. Evidence is the named devices available for the documented procedures.
- Add new blockers here with the person's name and the evidence needed.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every work-order item has its acceptance checks ticked with evidence, reviewer acceptance, the relevant checks passing, an honest built/specified/simulated status, this file and a `docs/build-log/entries/` file updated, and its `docs/CHECKLIST.md` P3 row ticked. Blocked tasks stay blocked; no approval is inferred from elapsed time.

## Outside-role work

None assigned for the build weekend. Agree any extra contribution with the leads before starting.

## Running log

- 2026-09-23 — Codex assistant at Vukosi's request: pulled the existing clean hardware branch (already up to date), inspected the pivot and related PRs, and prepared a separate local workflow branch based on PR #43 head `0c6d202`. Recorded the owner's GPT-implementation / Claude-reasoning-and-review preference. No product work, availability commitment, work-order acceptance, GitHub review, approval or merge is asserted. See `docs/VUKOSI-VIGIL-WORKFLOW.md` and `docs/reviews/VUKOSI-PR43-READINESS.md`.

- 2026-09-23 — Claude Code assistant (`claude-opus-5-5`) at Vukosi's request: independent review of the Codex workflow draft. R1–R3 confirmed and R1 widened to offline-queued events. New findings C1–C4: `*.csv` gitignored, no source of record for the YAMNet digest, asset-path mismatch, stale toolchain line. Prepared packet P2a (P3.V2 provenance gate). Not implemented. No GitHub action, approval, work-order acceptance or availability asserted. See `docs/reviews/VUKOSI-WORKFLOW-CLAUDE-REVIEW.md`.


- 2026-09-23 — Codex assistant at Vukosi's request: P7a review follow-up against prior HEAD `cab484ec730085093a63855303eec15697500bef`. Addressed only F1 (reject out-of-window M2 alarms; endpoint is allowed), F2 (report below-threshold clip IDs in input order) and F3 (broaden audio suffix rejection). Criterion T/B; trust answer: reject inconsistent run data and make missed IDs auditable without exposing audio. Tests are offline synthetic `sim_` inputs; no measurement, threshold policy, M3 percentile behaviour, real data, or audio changed. Evidence and exact check results are appended to P7a IMPLEMENTATION.md. No other task files changed.
- 2026-09-23 — Codex assistant at Vukosi's request: declared P3.V6/P7a measurement-report instrument. Criterion T/B; trust answer: results must preserve denominators, method and configuration so a reader can inspect how counts were formed. Allowed edits: `scripts/eval_yamnet.py`, `scripts/tests/test_eval_yamnet.py`, `docs/workflows/vukosi/p7a-measurement-instrument/IMPLEMENTATION.md`, this running-log line, and one assistant build-log entry. TASK.md read-only from `C:\Users\khoza\Desktop\Geekulture-vukosi-workflow`; implementation worktree branched from supplied `ccd2f8a0939679304465935ebc62cb6ab4645a09`. Tests use only inline `sim_` data. No measurement, model, audio, dataset, real result, threshold recommendation, or CSV will be created. Acceptance evidence: hand-oracle red/green unit tests and repository checks. Blockers: real model/runtime, licensed or consenting data acquisition, and device runs remain outside P7a; security remediation gate remains in force for product feature work. No contract or another owner's file changed.
- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
- 2026-09-15 — Protocol correction: the WBS/path declaration for 3.2 was recorded in this file after implementation began, rather than before the first edit as RULES/AGENTS require. The paths are now explicit (`appliance/agent.py`, `appliance/tests/`, `appliance/README.md`, `team/vukosi.md`, `docs/BUILD-LOG.md`); no shared contract was edited. This correction is assistant-authored and included in PR #24.
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Vukosi is asserted; owner acknowledgement pending.
