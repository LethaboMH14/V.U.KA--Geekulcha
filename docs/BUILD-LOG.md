# Shared build log

Append-only factual record. Mandatory at every meaningful code, document, interface, configuration, test-evidence or status change; also every blocker, handoff and decision. Fix mistakes with a new correction entry. Do not store secrets, personal incident data or fabricated human actions. If multiple people append concurrently, retain all entries during merge.

## Entry format

```text
Date/time with timezone | actual author | tool/model | WBS/task | status
Changed: files and user-visible or operational effect
Evidence: command/result or review link; distinguish not run
Decision: ID and approval state, or none
Needs/blockers: named owner and evidence required
Business handoff: path or not applicable with reason
Next: owner, task, proposed date
```

## 2026-09-12 | Codex assistant | model identifier not independently recorded | audit-pack | authored, human review pending

Changed: README, eight audit documents, seven planning packages, standing rules, brief, overlap register, security configuration and document checker. Created from the supplied prompt pack against clean base `464d0c4e8af12897f27619620742aaa69c9332ca`; no old history imported.

Evidence: initial checkout contained only README and MIT LICENSE. External tax/privacy/platform sources linked in the audit. Final executable verification is recorded in the appended verification entry, not implied here.

Decision: proposals only; no human approvals. Historical build evidence remains unverified.

Needs/blockers: account owners and Ipeleng supply revocation evidence; Lethabo supplies data-remediation record and original documents; both leads accept proposed assignments. No feature port authorised by evidence yet.

Business handoff: docs/audit/06-business-translation.md and templates/BUSINESS-HANDOFF.md.

Next: both leads review pack and security gate before feature work.

## 2026-09-12 | Codex assistant | model identifier not independently recorded | audit-pack verification | local checks passed

Changed: added executable document/intake checks, checksum-pinned Gitleaks installer and real pre-commit integration tests. Local clone uses `.githooks` and a readable local Git exclude file. No application feature code was imported.

Evidence: `node scripts/check-docs.mjs` passed all eight word budgets, local Markdown links, seven packages, thirty-five WBS leaves, fifteen calendar days, twelve wireframe specs, six Mermaid blocks, both OWASP matrices, forty edge cases, twenty objections and red-team counts. This validates structure, not factual completeness. `node scripts/test-security.mjs` passed actual isolated Git commits: clean content accepted; synthetic leak rejected; clean unstaged replacement did not hide a staged leak; clean replacement accepted; blocked feature intake rejected; missing scanner rejected. Gitleaks 8.24.3 full-worktree and existing-history scans found no leaks. The first worktree scan detected a vendor README's example credential inside the ignored downloaded tool directory; that unnecessary vendor README was removed and the installer now extracts only the executable. An inaccessible global ignore file initially made Gitleaks abort; local fixture/clone Git configuration now uses the readable local exclude file.

Decision: local tooling verified, remote CI and branch protection not verified. Remediation JSON remains blocked; no approvals fabricated.

Needs/blockers: original credentials/data remediation, absent application/evidence/documents, both-lead review and remote gate setup remain with named owners in EVIDENCE and SECURITY.

Business handoff: no new household capability; this change makes intake and documentation errors easier to detect before feature work.

Next: review and publish the approved branch through the documented workflow; no push, merge or visibility change performed during authoring.

## 2026-09-12 | Claude Sonnet 5 | claude-sonnet-5 | Task 1 — coordination scaffolding | authored, both-leads review pending

Changed: merged `origin/docs/astra-audit-alignment` (PR #1, Sibusiso) into a new branch `docs/task1-coordination-scaffolding` off `main`, keeping RULES.md, AGENTS.md, team/*.md, the security stack (`.gitleaks.toml`, `.githooks/pre-commit`, `.github/workflows/checks.yml`, `scripts/check-*.mjs`, `scripts/test-security.mjs`), and `docs/audit/**`. Restored `docs/HANDOVER.md` (survived the merge unmodified) and rewrote README.md to keep every honesty-critical section the branch had dropped — the four-layer table, "How much AI is in this", "What currently fails", "Claims we refuse to make", TRL, and "How to check this rather than believe it" — while folding in the branch's more cautious framing (R299 modelled not quoted, predecessor figures stated as supplied not reproduced). Moved `BUILD-LOG.md` to `docs/BUILD-LOG.md` per `docs/HANDOVER.md` §7 and fixed the four references to it (`AGENTS.md`, `RULES.md`, `scripts/check-docs.mjs`). Replaced `BRIEF.md`'s competing gate calendar with `docs/HANDOVER.md` §6's gates so exactly one calendar exists between those two files (`docs/audit/05-team-operating-system.md`'s finer-grained WBS still has a 2-day mismatch on the clean-intake date — flagged as G16, not resolved unilaterally). Ported all 25 architecture decision records from both predecessor repositories' `origin/main` into `docs/adr.md`: BEACON's ADR-0001–0007 kept unchanged (every existing citation in this repository's docs already uses that numbering), Team-Sonar-Vuka's ADR-0001–0018 renumbered ADR-0008–0025 with every internal cross-reference rewritten to match, and a provenance table at the top mapping every new ID to source, original ID, title and date. Recorded the renumbering itself as ADR-0026, which supersedes `CLAUDE.md` §12's original ADR-0020–0025 plan. Created `docs/OPEN-GAPS.md` consolidating the G1–G10 register from `CLAUDE.md` §11 / `docs/00-SPEC.md` §7 with the five still-open items from `docs/SDLC-GAP-ANALYSIS.md` §4 (wireframes, model licence register, model cards, OpenAPI spec, operator training) as G11–G15, plus G16 for the gate-calendar mismatch, with owners mapped to the current seven-person roster. Updated `docs/EVIDENCE.md` with the exact re-derivation commands and results for the three "clone and count" figures in README: 25 ADRs confirmed exactly; commits corrected from 207 to 224 (BEACON 90 + Vuka 134 on `origin/main`); "440 tests" found to have no reproducing command (510 test-function definitions found instead, a different measure, stated as such rather than left unreproducible). Closed `docs/HANDOVER.md` §11 open question 1 (Ndumiso Skhosana attribution) — confirmed resolved by Lethabo in chat on 12 September 2026, no wording change needed, marked resolved rather than deleted.

Evidence: `git remote -v` on the working branch shows only `origin` — no predecessor remote added, no history imported, consistent with `docs/HANDOVER.md` §3 rule 1. ADR citation check — `grep -rhoE "ADR-[0-9]{4}" docs/00-SPEC.md docs/01-ARCHITECTURE.md docs/AI-AUTONOMY.md docs/ANCHOR-RATIONALE.md docs/ANCHOR-RATIONALE-ADDENDUM.md docs/SDLC.md docs/TECH-STACK.md docs/USER-JOURNEY.md docs/PLAIN-WORDS.md | sort -u` against the IDs defined in `docs/adr.md` — every citation resolves, none dangling. `docs/adr.md` contains exactly 25 numbered entries (`grep -c "^## ADR-" docs/adr.md` → 25) plus ADR-0026 recording the renumbering. Commit and ADR counts re-run against both predecessors' `origin/main` with commands recorded in `docs/EVIDENCE.md`. `node scripts/check-docs.mjs` and `node scripts/test-security.mjs` not yet re-run against the moved `docs/BUILD-LOG.md` path in this session — **next owner must confirm both pass before merge.**

Decision: none authorised by this entry. This lands on a branch for both-leads review per `RULES.md` — no direct commit to `main`.

Needs/blockers: both leads' review before merge. `node scripts/check-docs.mjs` re-run against the moved BUILD-LOG path. G16 (gate-calendar mismatch between `BRIEF.md`/`docs/HANDOVER.md` and `docs/audit/05-team-operating-system.md`) needs Sibusiso and Lethabo to reconcile — not resolved by this entry, only flagged. R1–R4 (credential rotation, password change, history purge) remain the actual blocker before any application code lands, per `docs/HANDOVER.md` §3 rule 2 — this entry is documentation and coordination scaffolding only, no application code.

Business handoff: not applicable — this is repository coordination infrastructure, no household-facing capability changed.

Next: open a PR from `docs/task1-coordination-scaffolding` against `main`, referencing and effectively superseding PR #1. Both leads review. Task 2 (secret scanning as hook + CI) is functionally delivered by this branch already (ported from the audit-alignment branch) — verify it actually blocks a planted secret before treating G6 as closed.

## 2026-09-12 | Claude Sonnet 5 | claude-sonnet-5 | G16 resolution | authored, Lethabo (lead) directed the recheck

Changed: `docs/OPEN-GAPS.md` — G16 (flagged gate-calendar mismatch) re-examined at Lethabo's direction and closed, not by picking one calendar over the other but by re-checking both: `docs/TEAM.md`'s gate windows (Clean 13–16, Align 17–19, Govern 17–21, Calibrate 20–23, Harden 22–24) close exactly on `docs/HANDOVER.md` §6's gate dates. The WBS item originally flagged (1.4, clean-intake evidence, due Sep 14) is evidence-assembly work inside the Clean window, finishing before the gate itself closes on the 16th — not a competing date. The original G16 flag was a misread of one WBS line in isolation against the milestone date; corrected rather than defended.

Evidence: `grep -n "Clean\|Align\|Govern\|Calibrate\|Harden" docs/TEAM.md` — all five windows quoted and cross-checked against `docs/HANDOVER.md` §6 line by line.

Decision: G16 closed by Lethabo (lead) in chat, 12 September 2026.

Needs/blockers: none remaining from this item.

Business handoff: not applicable.

Next: request Sibusiso's review on PR #2 given he authored the WBS and PR #1 which #2 supersedes.
