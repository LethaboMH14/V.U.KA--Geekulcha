# PR #43 review — `docs/vigil-anchor-pivot` (assistant review)

**Reviewer:** Cline assistant (VS Code agent), acting at the terminal operator's request — no team member is named in this review, and it is therefore **not** anyone's approval.

**Date:** 23 September 2026

**Reviewed head:** `origin/docs/vigil-anchor-pivot` @ `f997873`

**Base:** `origin/main`

**Verdict:** ACCEPT WITH CONDITIONS — advisory draft. It binds only when a named reviewer posts the same verdict on the GitHub pull request.

## Scope

Full-tree review of the pivot PR: archive the four-layer material (VIGIL · UMOJA · KHAYA · ANCHOR) and rebuild the repository around VIGIL (Android journey check, staged duress defence) plus ANCHOR (per-person hash chain, Hedera anchoring, verifiable export). Focus for this review: does the pivot hold together as documents, does it keep the repo's honesty and provenance rules, and is it mergeable.

## Method and evidence (all run this session)

- GitHub PR metadata, the review-thread UI and CI status were unreachable this session (`gh` unavailable/unauthenticated; REST API returns 404 on the private repo). The review is based entirely on fetched git objects — `git fetch origin pull/43/head` and `git fetch origin main docs/vigil-anchor-pivot`. Nothing in this review claims to have read the PR description, the GitHub reviews or any CI run.
- `git diff --name-only origin/main origin/docs/vigil-anchor-pivot` → 160 files differ.
- `git log --oneline origin/main ^origin/docs/vigil-anchor-pivot` → empty: the PR branch contains every commit on `origin/main`; it is not behind.
- `git merge-tree $(git merge-base origin/main origin/docs/vigil-anchor-pivot) origin/main origin/docs/vigil-anchor-pivot` → zero conflict markers, zero "changed in both" entries.
- `git diff --stat pr-43 origin/docs/vigil-anchor-pivot` → empty: the branch was force-pushed from the earlier fetched head `4ae5ebe` to `f997873`, and the trees are byte-identical — the superseded team-ownership commit's content is included in the current head. Nothing was lost by the force-push.
- Head commit chain: `c81f2f5` (pivot: ADR-0034…0038, spec, work orders) → `370d466` (PR #43 review response: blockers B1–B7, should-fix S1–S10, amendments A1–A3, nit N1) → `11d5761` (onboarding: session prompt, start-here) → `f997873` (archive move + team ownership).
- Read on the head tree: `docs/VUKA-2-SPEC.md`, `docs/STAGED-DURESS-DEFENCE.md`, `docs/SA-ANCHOR-SCALE-SECURITY-BUSINESS.md`, `docs/ECONOMICS-VIGIL-ANCHOR.md`, `docs/RICA-POSITION.md`, `docs/POPIA-IO-REGISTRATION.md`, `README.md`, `docs/EVIDENCE.md`, `docs/AGENT-PIPELINE.md`, `docs/build-log/TEMPLATE.md`, the review-response build-log entry in `370d466`, and the archived `docs/CONTRACT-APPROVAL-RECORD.md`.

## What the PR gets right

1. **The pivot itself is sound.** Four layers (appliance hardware, camera/face/plate infrastructure, an entity graph, an anchor chain, plus an Android app) was never scoped for a seven-person hackathon team. Reducing to VIGIL + ANCHOR concentrates the deliverable on what is buildable and demoable; the decision is recorded in ADR-0034 rather than done by silent rewrite.
2. **Archive, not deletion.** The four-layer code, docs, team histories, wireframes and submission archives are preserved under `archive/2026-09-four-layer/` at their original relative paths. Lineage is maintained and cross-linked (e.g. `docs/EVIDENCE.md` points at `archive/2026-09-four-layer/docs/EVIDENCE-four-layer.md` for the predecessor measurements).
3. **Review response is real and specific.** Commit `370d466` answers every finding in Sibusiso's two reviews item by item (context-bound signed statements, mirror-node byte comparison, outcome arbitration, server-owned deadline authority, PIN authorisations, coalesced anchoring with a bounded ceiling, typed 33-byte ledger messages, testnet epochs, minimal-deliverable sequencing, APK fallback, `math.ceil` break-even of 10,901 members at R20) and lands the answers as spec revision 2 plus ADR-0034/0035/0036.
4. **Economics are reproducible.** The numbers in `docs/ECONOMICS-VIGIL-ANCHOR.md` are emitted by `scripts/economics_vigil_anchor.py`; a disagreeing figure defers to the script.
5. **Honest about unknowns.** The RICA paper records that the statute text was not readable this session and contains no verbatim quotes (every characterisation ⚑ pending counsel); the POPIA IO paper leaves D-IO-1 to the leads; the SA anchor proof pack labels third-party figures as company claims. This matches the repo's honesty-ledger rule.
6. **Mergeability is verified, not assumed.** See the merge-base/merge-tree commands above: strictly ahead of main, zero conflicts.

## Conditions to satisfy before merge (none re-opens the pivot)

1. **Post the verdict by a named person.** This file cannot bind anyone. Per CODEOWNERS both leads review the pivot paths; at least one must post accept (or changes-requested) on the GitHub PR itself. The PR's own cycle — Sibusiso's B1–B7/S1–S10 findings and Lethabo's `370d466` response — still needs its recorded second-lead acceptance.
2. **Give the front page back its honesty block.** The old README's "What currently fails" section (forecast loses to baseline, hand-set fusion weights, uncalibrated thresholds, bias evaluation not run) is the strongest credibility signal this repo had for judges. It survives only in the archive and a one-line link from `docs/EVIDENCE.md`. Restore a short honesty paragraph in the new README that links to `archive/2026-09-four-layer/docs/EVIDENCE-four-layer.md` and states the equivalent open gaps for VIGIL + ANCHOR.
3. **Record where VUKA-2 contract approval lives.** The four-layer contract approval record (both leads signed, 15–16 Sep) is archived and the new `docs/` tree has no replacement approval record. The spec is marked PROPOSED — binds on second-lead acceptance in the build-log entry; make sure the spec header or `docs/CHECKLIST.md` carries that state durably, so the approval trail is not only in a chat thread.
4. **CI must pass on the PR before merge.** `document-contracts` and the secret scan could not be executed against the PR head from this session; verify both run green on GitHub.
5. **Process note for the next pivot.** 160 files and +4,517/−1,067 lines in one PR is larger than any single review can cover line-by-line. Future restructures should split into archive-move, new-docs, and team/governance PRs so each gets a real read.

## What this review is not

- Not a person's approval and not a GitHub review — nothing here merges the PR or closes its review cycle.
- Not a security sign-off: the security-critical documents (staged duress, RICA, POPIA IO) still await the security owner's own review per CODEOWNERS.
- Not based on the PR description, the GitHub review thread, or CI logs — those were unreachable; if the PR was updated after `f997873`, re-run the evidence commands above.
