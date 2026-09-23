## 2026-09-23 | Lethabo (co-lead), via Claude Code assistant | PR #43 review follow-ups (Ipeleng's security review + a Claude pre-merge review) | PROPOSED — partial, remaining items listed below

**Research** — Read Ipeleng's posted security review (`docs/reviews/IPELENG-PR43-REVIEW.md`, PR #45, APPROVE WITH CONDITIONS on PR #43 at `7ddbf40`) and a Claude pre-merge review's C-item list, both supplied as a task packet. Cross-checked every finding against the live `docs/VUKA-2-SPEC.md`, `docs/STAGED-DURESS-DEFENCE.md`, `docs/OPEN-GAPS.md`, `docs/CHECKLIST.md` and the affected team files before editing.

**Real data / references** — None new. This is a specification and process correction against an already-posted review.

**Business reasoning** — Closes Ipeleng's B1–B3 blockers before the Thu 24 Sep §8/§9 agreement, records her should-fix items with owners, and fixes several drift points (stale current-task lines, an inaccurate CI claim, an overclaim in the public README) that would otherwise mislead a judge or a builder.

**Competitor reference** — Not applicable.

Changed:
- `docs/ADR-ACCEPTANCE-RECORD.md` — appended the review record (verdict, blockers, should-fix, what this PR addresses). Note: coordinator flagged that `main` already carries commit `847225e` (Sibusiso) closing the same Pending line; left as instructed for reconciliation at rebase.
- `docs/VUKA-2-SPEC.md` — §9 table (guardian add/remove notification naming the other party; recovery row covers bulk export and the duress-PIN-on-new-device case); ADR-0036(5) qualified to the single-session case with the multi-session risk recorded; T24 extended; four new §17 lines (server suppression, unlocked-phone authority, lone guardian, multi-session replacement); `bank_signal_sent` trigger field (§3, S1); `pin_authorised` signed fields corrected — `expires_at` is server-computed, not device-signed (§9); an OPEN note in §8 on the normal-PIN/`contact_lost` conflict, tracked as G33.
- `docs/OPEN-GAPS.md` — G29 reopened as "record pending" (organiser confirmation not yet stored); new gap G33 (normal-PIN/`contact_lost` conflict).
- `docs/CHECKLIST.md` — new rows P3.L9 (commit the organiser's confirmation) and P3.B10 (rewrite Sonke overview/Lean Canvas); P3.S3 widened T04–T19 → T04–T24.
- `docs/STAGED-DURESS-DEFENCE.md` — §8 heading corrected (two legal hooks already read from primary text); the "3-second buffer" line corrected to the spec's actual 0.975 s classification windows with no audio stored.
- `README.md` — "32-byte fingerprint" corrected to "typed 33-byte message"; the "without trusting VUKA or the claimant" line narrowed to the integrity/timing claim the anchor actually supports (spec §17).
- `RULES.md`, `AGENTS.md`, `SECURITY.md` — the archived UMOJA gate path corrected and its CI-green claim removed (CI runs no Python); "32-byte roots" corrected to "typed 33-byte messages"; the intake gate described as approved (`docs/security/intake-gate.json`, 2026-09-13) instead of blocked.
- `team/sibusiso.md` — UMOJA gate path and CI claim; "32-byte roots" → typed 33-byte messages; topic-first-message wording corrected (key-manifest hash, not the keys); current-task line refreshed.
- `team/mutarisi.md` — guardian setup screen recommends two guardians (S2); call-button wording corrected to `stand_down` or incident closure only (C7), removing "or a normal PIN".
- `team/ipeleng.md` — T01–T20 widened to T01–T24; current-task line refreshed.
- `team/khutso.md` — T01–T20 widened to T01–T24 with owners named for T16/T21–T24.
- `team/lethabo.md` — current-task line refreshed.
- `team/START-HERE.md` — noted `test/openapi-contract.test.mjs` checks the archived v1 contract until P3.A1.

Evidence: `node scripts/check-docs.mjs` and `node --test "test/**/*.test.mjs"` — results below.

Decision: Clarifies and extends the accepted spec/ADRs per Ipeleng's recorded conditions; no ADR text was edited.

Needs/blockers: **Not completed in this pass** — C2's remaining "32-byte" occurrences outside the four named files, C4 (`duress_pin` as an event-kind search), C6 (recovery-row duress-column wording double-check with Ipeleng), C9 (SONKE-OVERVIEW.md/LEAN-CANVAS.md stale banners + check-docs regex), C11 (spec line 3 status sentence), C15 (`docs/OVERLAPS.md` claim rows), C16's `RULES.md`/`AGENTS.md` gate-language sweep beyond the lines found, C19/C20 (spec §4/§6 clarifications), C21 (`team/vukosi.md`, `team/babatunde.md`). Left for a follow-up PR; listed in the summary file.

Business handoff: None. No figures changed beyond correcting stale byte counts.

Next: Sibusiso confirms the contract-v2 implications (S1, C5, C19, C20). Ipeleng confirms B1–B3 wording and writes the privacy policy (S3). The remaining C-items above need a follow-up pass.
