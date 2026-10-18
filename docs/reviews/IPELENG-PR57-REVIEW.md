# IPELENG — PR #57 SECURITY REVIEW — ADR-0039: detection detail and the saved evidence assessment

**Reviewer:** Ipeleng Constance Modise (security & privacy). Posted on PR #57 as an approving review; this file is the durable copy.

**Drafted:** 24 September 2026 with the Cline assistant (VS Code agent) at her request; every finding and the acceptance itself are hers to confirm, edit or overrule.

**Question asked:** does ADR-0039's detection detail and saved evidence assessment hold the privacy line (nothing new public, nothing newly identifying), keep the assessment uncalibrated and non-judgmental in schema as well as in prose, and gate third-party access so that nothing can be built or released before the three gates close?

**Scope:** ADR-0039 as added to `docs/adr.md`; spec §18 and the V3 pointer in `docs/VUKA-2-SPEC.md`; G36–G38 in `docs/OPEN-GAPS.md`; the build-log entry `docs/build-log/entries/2026-09-24-lethabo-adr-0039.md`. For interaction effects only: ADR-0040/0041 status text, the acceptance record's ADR-0040–0042 rows, `docs/COERCION-SCENARIOS.md` (tally inputs) and the test-ID space of `docs/VUKA-2-SPEC.md` §15. Out of scope: contract v2 (#51), §16's M8 execution, the PIN-AUTHORITY-RULES page (self-reviewed separately), the coercion catalogue itself, and anything built after D1/D2.

**Method:** earlier rounds read at `804f5ea` and `7374bcc`; this review was re-done at the current head `893766a` (main merged in; §18's tests renumbered T30–T33 → T53–T56) — the full PR diff vs the merge-base with main (4 files, +138/−1), then the touched files read in full at that head. Class indices checked against TensorFlow's `yamnet_class_map.csv`. The renumbering grepped across §18, the ADR Consequences line and the build log. `guardian_alert_opened`'s tally treatment checked against `docs/COERCION-SCENARIOS.md`. The acceptance record checked for an existing ADR-0039 row (none — correct while Proposed). PR state via the GitHub API: MERGEABLE; Sibusiso APPROVED at `7374bcc` with a re-look ask outstanding on the renumbering.

**Verdict: APPROVE — this review is the recorded security acceptance.** ADR-0039's status line binds on acceptance by Sibusiso (contract v2) and Ipeleng (security); Lethabo's PR comment notes the security acceptance cannot be the author's own. No blocking finding: nothing in the ADR or §18 is unsafe as written. Conditions A–C are record-keeping and one-line text fixes, all landable in the acceptance PR.

---

## Findings

| # | Severity | Where | The problem |
|---|---|---|---|
| **A** | Must-do at acceptance | `docs/ADR-ACCEPTANCE-RECORD.md`; `docs/adr.md`; spec V3 pointer | The acceptance is not yet recorded anywhere: no ADR-0039 row exists in the acceptance record, the ADR Status line still says *Proposed*, and the V3 pointer reads "*(ADR-0039, Proposed, …)*". On this review ADR-0039 binds, so the record must be written: a **new** row (append-only rule; cite Sibusiso's review at `7374bcc` and this review at `893766a`), the status line flipped, the V3 pointer updated. |
| **B** | Should-fix | `docs/adr.md` (file order) | ADR-0039 sits **after** ADR-0040 in the file (…0038, 0040, 0039, 0041, 0042) because it landed later; numbering and file order now disagree and the next reader will trip. Fix in the acceptance PR: either move the ADR-0039 block to between ADR-0038 and ADR-0040, or add a one-line note under the document heading: "ADRs are numbered in decision order; where an ADR merges after a higher-numbered one, the file keeps merge order (ADR-0039 sits after ADR-0040)." |
| **C** | Should-fix | ADR-0040 status line | ADR-0040's status cites "(`docs/adr.md`, branch `docs/adr-0039-event-detail`)"; the branch dies when this PR merges and the citation goes stale. Replace with "(`docs/adr.md`, PR #57 at `<merge hash>`)" — the way ADR-0036–0038 cite "on PR #43 at `3855a3d`". One line; rides with A. |

**Suggested status-line wording for A** (house format, per ADR-0036–0038):
`**Status:** Accepted (2026-09-24) by Sibusiso (contract v2, PR #57 at 7374bcc) and Ipeleng (security, PR #57 at 893766a) (record: docs/ADR-ACCEPTANCE-RECORD.md). Previously: Proposed (2026-09-24) — binds on acceptance by Sibusiso (contract v2) and Ipeleng (security). On acceptance, it extends ADR-0038(2)'s class list.`

## Verified (checked, not assumed)

- **Privacy — holds.** Every new field is in the salted, committed, deletable payload; every payload carries integer `pv`; per-kind schemas live in `contracts/payloads/<kind>.v<pv>.json`, with `additionalProperties: false` for pv 1. Public `action` classes and the 33-byte on-chain messages untouched — nothing new is public. Registration carries `app_version`, `model_sha256`, `android_api`, `device_model` and never IMEI, serial, Android ID or phone number. `location` is optional (present only when a fix exists), integer-only with bounded ranges. No new identifier class anywhere.
- **Uncalibrated and non-judgmental — holds.** `calibrated:false` plus the fixed statement ("Uncalibrated design tally. Not a probability or a finding about any person. A low total is not evidence that no coercion occurred."); the forbidden-field list names `probability`, `likelihood`, `verdict`, `not_coerced`, `genuine` and any band. The assessment cites entry IDs, `ruleset_digest` and server-receipt `basis_time`; is written once per incident transition in the same `subject_heads` transaction; retries return the existing entry (idempotent, T56); exact replay is T54.
- **Third-party visibility — tier, E-level, reasons; never `total_points`.** Matches the 24 Sep 00:50 decision and Babatunde's rule. Member: full assessment after closure, behind a fresh normal PIN. Guardians: the reasons. Demo panel: everything, `sim_` subjects only.
- **`guardian_alert_opened` — tap-gated, E-level-neutral, not a tally input.** Re-checked against `docs/COERCION-SCENARIOS.md`: guardian acknowledgements are not tally inputs, so the `opened` tap cannot inflate the design tally; "no acknowledgement recorded by <time>" is derived at read time with the delivery state. Confirming this deliberately; no change needed.
- **Motion — corroboration only.** Accelerometer rules `impact`/`shake`/`snatch` (`surge` parked); `offset_ms` ∈ [−10000, 0], look-back only; only while stationary or walking; never opens a check-in.
- **Class indices — correct against `yamnet_class_map.csv` (TensorFlow master).** Shout 6, Yell 9, Screaming 11; gun-like 421 (Gunshot, gunfire), 422 (Machine gun), 423 (Fusillade) kept, mapped by label; 420 (Explosion) and 424–427 (Artillery fire, Cap gun, Fireworks, Firecracker) excluded — deliberate and correct, not an off-by-one. One class per window, argmax with lowest-index tie-break; displayed "gun-like sound (uncalibrated)".
- **Renumbering — clean.** §18's T30–T33 became T53–T56 (built: T54 verifier replay, T56 one-per-transition under racing/retries; designed-only: T53, T55); consistent across §18, the ADR Consequences line and the build log; no added text still says T30–T33; main's T30–T33 (threat-model tests) and ADR-0041's T50–T52 are untouched; T25–T29 unchanged and were free.
- **Gates — real.** G36 (selective disclosure — Sibusiso, Ipeleng), G37 (independently checked safe release — Lethabo, Ipeleng), G38 (partner-use rule: human review only, no automated eligibility or pricing, no adverse inference from a low or missing tally, contestable — Babatunde, Ipeleng) are recorded in OPEN-GAPS with "Before any grant is built", and the grant routes go to contract v2 marked `x-status: designed`.
- **Acceptance record — append-only respected.** This PR touches neither the acceptance record nor any prior ADR row; the ADR-0040 "Pending" row left as written on main follows the same rule. The PR correctly adds no acceptance-record row while the ADR is Proposed (finding A handles the acceptance).

## Commendations

- The saved assessment being **reproducible from cited entries**, with conflict shown as a display flag and never stored, is the right answer to "what did the server decide and why" — replay beats narrative for a hostile judge or a regulator.
- Making the tap-gated `opened` event **E-level-neutral** keeps guardian acknowledgement from becoming a tally input — a subtle coercion-resistance win that would have been easy to miss.
- Motion as look-back-only corroboration kills the "phone dropped while driving" false-alarm class without a second model; parking `surge` is honest scoping.
- The third-party gates (G36–G38) land with named owners **before** any grant is built — the sequencing is the security property.
- AI use disclosed (`Co-authored-by: Claude Opus 5.5`) per ADR-0038(4).

## Conditions tracker (carried from the PR #43 review)

- **B1** — untouched by this PR; still open on the executable side as the T37 oracle in the 24 Sep 16:00–20:00 test-spec block.
- **S3** — privacy-policy text: still open, owner Ipeleng, separately scheduled. Out of scope here; not blocked by this review.

## What this review is not

Not Lethabo's acceptance (he wrote the ADR; that is why this review exists), not Sibusiso's contract review (the `signal_detected.v1` schema and golden vector stay his), not Vukosi's sensing review of the class list and motion rules (T25/T26), not legal advice, and not the §16 measurement — M8 still owes numbers with n. The spec remains authoritative wherever this review and the spec disagree.