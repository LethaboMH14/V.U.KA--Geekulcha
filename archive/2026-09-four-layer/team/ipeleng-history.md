# Ipeleng Constance Modise — history (four-layer plan, to 23 Sep 2026)

Moved out of `team/ipeleng.md` when VUKA pivoted to VIGIL + ANCHOR (ADR-0034). Nothing here was deleted; the running log stays in the live file.

## Sequenced work

**Superseded 23 September 2026 by the work order above** — kept for history; do not execute these rows. All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 13 | 1.1 | 4 | Verify credential/password remediation | none | Redacted issuer receipts reviewed; never values — record at `docs/audit/09` (16 Sep); holder-chat review pending |
| Sep 15 | 4.1 | 4 | Specify lawful data/rights and deletion controls | 2.1 | Data map and open legal questions reviewed; no compliance claim |
| Sep 19 | 4.3 | 5 | Exercise operator, tenant and duress abuse cases | 3.3,4.1 | Actual outcomes plus unresolved tests recorded; failed mode excluded |
| Sep 22 | 6.3 | 4 | Review proposed release for privacy and secrets | 4.3,4.5 | No personal/demo data leaks; remediation unresolved items explicit |
| Sep 27 | 7.5 | 2 | Close temporary demo access and record handover | 7.4 | Revoked temporary identities and export/retention owner recorded |

## Interfaces

- Inputs: Issuer revocation receipts from owners; actual data map from builders.
- Outputs: Abuse cases, remediation evidence and legal-review questions to leads.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

2026-09-15: Ipeleng (via Cline assistant) wrote the P2.1 PSiRA position paper, `docs/PSIRA-POSITION.md` — trigger, registration category, flag-gate reviewer position, partner-of-record contracting structure (three variants + fallback), six minimum contract clauses, counsel questions Q1–Q8, downstream consequences for P2.2–P2.6. Swept the superseded "we do not dispatch" one-liner in `docs/08-BUSINESS.md` and the G19/P2.1 status rows. PR #28; merge and counsel review pending.
2026-09-15: Ipeleng (via Cline assistant) completed the security review of PR #10 (`feat/sibusiso-3.3-human-gate`) and wrote `docs/reviews/IPELENG-PR10-REVIEW.md`. Verdict: APPROVE with findings. Two findings block Sibusiso's merge (D, H); finding F removed as it is Ipeleng's own P2.1/P2.2 task.
2026-09-16: Ipeleng (via Cline assistant) reworked the PR #10 security review after Lethabo's request-changes on PR #27: findings D, H (blocking) and A, B, C, E, J, K retracted with grep/test evidence against `origin/main`; G narrowed; I kept reframed; new finding R filed (`retain_consented_match` has no production caller). Verdict corrected to APPROVE with notes. (Supersedes the 15 Sep entry above.)

2026-09-16: Ipeleng (via Cline assistant) wrote the P2.2 POPIA position paper, `docs/POPIA-POSITION.md` — s26/s27 asymmetry with grounds quoted verbatim from a full-text copy of the Act (Accessible Law; ⚑ pending Gazette verification), ground-by-ground walk against the non-consenting passer-by, "vectors not images" rejected as a lawful basis, s33(1) optimistic-vs-circular analysis, discard-by-default proposed as **ADR-0031** (*Proposed* — binds on both-lead acceptance), responsible-party split aligned with the PSiRA partner-of-record paper, counsel questions Q1–Q5, downstream consequences for P2.3–P2.6. Swept `docs/CHECKLIST.md` P2.2/P2.3, `docs/OPEN-GAPS.md` G20 and this file. PR #28; merge and counsel review pending.

2026-09-16: Ipeleng (via Cline assistant) prepared the P2.5 Information Officer registration path, `docs/POPIA-IO-REGISTRATION.md` — eServices Portal confirmed live as the primary route (IO registration service announced 01/05/2024) with the Regulator's manual `Registration.IO@inforegulator.org.za` form as fallback, s55 duties and the head-liability consequence recorded, s1 "head" definition stated in substance only (source page truncated, ⚑), portal form field list honestly recorded as not enumerable via static fetch. Five-input table for the leads' decision (head designation D-IO-1, organisation legal identity, contact email, deputy, submission record). Nothing submitted — §7 deliberately empty. Swept `docs/CHECKLIST.md` P2.5 and this file. PR #30; leads' designation and submission pending.

2026-09-16: Ipeleng (via Cline assistant) wrote the WBS 1.1 verification record, `docs/audit/09-credential-remediation-verification.md` — redacted summary of the four exposures (WeatherAPI key, EskomSePush token, a university email with plaintext password, an undocumented Roboflow API key; predecessor-repo paths only as already published in OPEN-GAPS G6), the 13 Sep holder confirmations named as the acceptance evidence with the honest limitation that the chat messages are not in this repo and were not accessible from this session, and the 13 Sep forensic corroboration accepted as the technical baseline (every-branch `filter-repo` purge, fresh-clone gitleaks zero-leak re-verification, GitHub API confirmation, this repo's CI secret-scan green). Swept the stale "blocked by credential/data remediation" opener in `docs/audit/04-production-readiness.md`, the 1.1 row in `docs/audit/05-team-operating-system.md`, `docs/PLAN.md`'s 1.1 note, the audit README and this file. Nothing ticked closed — the leaf closes when Ipeleng reviews the holder confirmations live (record §4 lists what each must state). Never values.

2026-09-16: Ipeleng (via Cline assistant) wrote the P2.6 Gated Access Areas Code review, `docs/GATED-ACCESS-CODE-REVIEW.md`, with ADR-0032 — the draft Code's text could not be corroborated on any reachable source and the finding is stated first (every draft characterisation ⚑); the verified s60/s61/s73(1)(c) machinery quoted from the Accessible Law copy anchors a gap analysis of the architecture against the recorded direction of travel; ADR-0032 proposes that direction as the internal design floor (status *Proposed* — binds on both-lead acceptance; ≤30-day auto-overwrite for gate-domain data as a team-chosen conservative default, discard-by-default stands, FRT justification dossier before the pilot face gate) with the final text superseding via fresh ADR. Swept `docs/CHECKLIST.md` P2.6, `docs/OPEN-GAPS.md` G21 and `docs/PLAN.md`'s execution row. PR #30; Lethabo review, then leads; counsel Q1–Q4 pending.

2026-09-16: Ipeleng (via Cline assistant) wrote the P2.7 RICA position, `docs/RICA-POSITION.md` — RICA's full text was not readable this session (official justice.gov.za PDF reachable but binary; the finding is stated first and every statutory characterisation is ⚑); the two bright lines are specified architecture constraints (recorded design, not yet implemented code) — audio never persists (3-second ring buffer, ASR-6) and never attach an audio clip as evidence (labels-not-audio through the T2 evidence chain); the transient-acquisition question (does in-memory gunshot-signature classification "intercept" a communication at all) is counsel Q1, with the design built so the worst answer costs nothing. No ADR — the design does not change. Swept `docs/CHECKLIST.md` P2.7 and this file. PR #30; Lethabo review, then leads; counsel Q1–Q5 pending.

2026-09-16 (review response): Ipeleng (via Cline assistant) addressed all six blocking findings in Lethabo's changes-requested review of PR #30 — ADR-0031/0032 Accepted→*Proposed* (bind on both-lead acceptance); ADR-0032's 30-day bound reframed as a team-chosen conservative default (not independently compelled) with *gate-domain retained data* defined and the case+90/12-month rows explicitly reconciled as named parameters pending counsel Q2; CHECKLIST P2.2 back to ◐ (merge + counsel verification still open); G20 pointer PR #28→PR #30; RICA's "verified build facts" reframed as specified architecture constraints (no audio-path code exists yet — executable negative tests owed with the port); audit/04's stale "No application code exists" replaced with a scoped what-exists/what-is-not-running statement. Housekeeping: BOM + trailing blank line removed from BUILD-LOG, final newlines added to the five new docs. Prior entries above corrected in place where they repeated the Accepted/build-facts framing; no workstream's substance changed.
## Needs and blockers

- No issuer access → account owners.
- legal uncertainty → responsible party obtains counsel.
- absent app → keep controls specified and block pilot.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Audience privacy during projection.
- independent nonmember access walkthrough.
- lost-device rehearsal coordination.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.
