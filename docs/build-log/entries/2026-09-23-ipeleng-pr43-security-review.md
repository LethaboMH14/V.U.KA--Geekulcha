## 2026-09-23 | Ipeleng Constance Modise (security and privacy), via Cline assistant at her request | model identifier not independently recorded | PR #43 security review + POPIA slide summary | review posted on PR #43 via authenticated gh; files committed on docs/ipeleng-pr43-review

**Research** — all six in-scope documents read at PR head `f997873` via `git show` (`docs/VUKA-2-SPEC.md` §4/§7/§8/§9/§13, `docs/adr.md` ADR-0036/0037, `docs/STAGED-DURESS-DEFENCE.md`), then re-verified against the one-commit delta to `0c6d202` (ADR-0034–0038 Proposed → Accepted by Sibusiso; `actor_id` added to the §4 device-signed statement; `docs/ADR-ACCEPTANCE-RECORD.md` created; §8/§9/§13 text unchanged). A final whitespace-only archive commit (`7ddbf40`) was read before posting and left every finding untouched. The PR thread, now reachable via authenticated `gh` v2.101.0, was read before posting: Sibusiso's independent review point 4 flags the same coercion gap and leaves it to Ipeleng — finding B1 is that call.

**Real data / references** — every finding cites spec/ADR sections and test IDs as read at head; the POPIA summary's claims trace to `archive/2026-09-four-layer/docs/POPIA-POSITION.md` (moved to the archive on the pivot), `docs/POPIA-IO-REGISTRATION.md` and spec §13. No new external facts introduced.

**Business reasoning** — the review closes the acceptance record's **Pending** line for Ipeleng's security review (a gate before contract v2 and §9 governance work are called frozen), and the POPIA one-pager is the item Babatunde's insurer pitch is explicitly waiting on (his PR #43 comment).

**Competitor reference** — not applicable — review and privacy-summary work; no competitor surface touched. The POPIA summary's camera/face position is inherited from ADR-0031 (that product parked and archived).

Changed: wrote `docs/reviews/IPELENG-PR43-REVIEW.md` — the security owner's review of PR #43's security-critical sections, walked as six abuse cases (coerced guardian approval across two forced normal-PIN sessions; replay of a signed check-in; server suppressing escalation pre-anchor; compromised phone fabricating a bank hold; lone-guardian scenario; retention after member departure). Verdict: **approve with conditions** — blockers B1 (notify remaining guardians of adds and scheduled removals by name; qualify ADR-0036(5)'s never-disarm claim to the single-session case; §17 line for the multi-session replacement path; T24 extension), B2 (§17 line: a compromised server can suppress or fabricate escalation), B3 (§17 line: possession of the unlocked phone forces a `no_answer` escalation including the bank signal); should-fixes S1–S4 (bank-signal provenance with contract v2; ≥2-guardian onboarding guidance; privacy-policy residual/lifecycle text; extend the 24 h post-recovery freeze to bulk export). Also wrote `docs/POPIA-SLIDE-SUMMARY-DRAFT.md` (one-page privacy summary for Babatunde's pitch) and committed `docs/reviews/ASSISTANT-PR43-REVIEW.md` (the assistant record the review's method note cites). Posted the review on GitHub PR #43 with `gh pr review 43 --approve --body-file` under Ipeleng's authenticated session.

Evidence: `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` exit 0 on this branch; byte checks confirm UTF-8 no BOM and exactly one trailing newline on all files; the posted review is visible on PR #43.

Decision: PR #43 verdict APPROVE WITH CONDITIONS recorded on GitHub by Ipeleng (B1–B3 to land before the §8/§9 agreement closes Thursday); no ADR touched.

Needs/blockers: Lethabo appends the review's conditions to `docs/ADR-ACCEPTANCE-RECORD.md` as an append-only row (closes the Pending line); the §8/§9 meeting works the agenda in the review's Appendix — Lethabo's invite says 11:00 while spec §14 records 12:00, one of the two needs fixing; Babatunde receives the one-pager before Friday.

Business handoff: Babatunde's pitch material — every claim in the one-pager traces to a named source.

Next: merge `docs/ipeleng-pr43-review` into `docs/vigil-anchor-pivot`; agree B1 mechanics at the Thursday meeting; S1–S4 owners and test IDs recorded (or "not measured" honestly).
