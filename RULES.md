# Repository rules

**Read `docs/MASTER-CONTEXT.md` first — theme, judging criteria, the showcase, the honesty ledger. It is one page and it does not change shape.**

## A finding stated in a comment is not enforced until it's a rule

If a PR review comment, a chat, or any thread states something that should never happen again — a naming decision, a process fix, a claim that turned out false — **it does not stay a comment.** It goes into this file, `AGENTS.md`, or the relevant standing doc in the same PR or the next one. A comment thread gets archived and the next session — any person, any tool, any model tier — repeats the mistake because nothing it reads told it otherwise. This is not optional housekeeping; it is the only reason a shared repo works better than a shared chat log.

## Every task: research, real data, business reasoning

Every `docs/build-log/entries/` file (see below) states what you actually checked before doing the work, the real data or competitor precedent it's grounded in, and one sentence on how it moves money — or "not applicable" with why, said deliberately, not defaulted past. See `docs/build-log/TEMPLATE.md`. This applies to research, docs and business work exactly as much as it already applies to UI work under `AGENTS.md`'s quality contract.

## Model routing

Route work by how expensive it is to be wrong and how checkable the answer is, not by habit — see `docs/AGENT-ROUTING.md`: bounded execution → your tool's cheap/fast model; checking that output against evidence and the rules → your tool's strongest model; merging to `main` → the repo gate below, never a model alone.

## Criteria recall

Before any iteration, any new concept, and any artefact that reaches a judge: re-read `docs/MASTER-CONTEXT.md`. State which criterion the work serves (C1 team / C2 innovation / C3 progress / C4 user journey) and how it answers **"Would a real user trust and use this?"** If it serves none, say so and justify the work anyway — or drop it.

## Claim tagging — mandatory in every artefact

Tag every figure, capability statement and date: `FACT` (verified, with the command or source) · `ESTIMATE` (calculated from stated assumptions) · `ASSUMPTION` (believed, not checked, with who would check it) · `PROPOSED` (designed, not built). Anything simulated keeps its `sim_` prefix in code and is named aloud.

## Scope and truth

This clean repository is the coordination system for seven people and every AI tool. Read BRIEF.md and docs/EVIDENCE.md. Mark each deliverable built, specified, simulated or blocked. A historical test count is not a current result. Measured figures include method, configuration and sample size. Estimates include assumptions and verification owner. Consumer copy starts with household need and actual limitations.

Never import the old repositories' history, add their remotes, merge/cherry-pick their commits, or copy a working tree wholesale. Port individually reviewed files only after the remediation gate in SECURITY.md is signed. Do not commit credentials, real .env files, keys, third-party claims data, face images/embeddings, raw audio, personal incident data or private organiser screenshots. Public SAPS sources require provenance/licence review. Use synthetic fixtures labelled `sim_`.

## Engineering principles

Machines stop at `watch_candidate`. The only authorised transition to `flagged` is an authenticated human verification with operator identity, reason, tenant and audit event. A text search is useful but insufficient: test every transition and bypass path. Whitelisted entities accumulate no suspicion. Whitelisting, disarm, threshold changes and deletion require two distinct authorised principals signing the same scoped action. No generative model determines anything about a person. No autonomous dispatch from soft evidence, remote gate unlock, injurious countermeasure or responder bounty.

No personal data on a public chain. Verify commitments and deletion/linkability design before using real data. Preserve explicit uncertainty, stale state and unconfirmed timestamps. No hidden-mode safety promise without observable-behaviour tests. Keep contracts versioned; retries idempotent; tenant authority explicit.

## Code and review

Use focused modules, explicit types/schemas and errors; UTC internally and labelled SAST in schedules. Format with the chosen stack's committed formatter, pin dependencies and record model licences/digests. Do not select or upgrade a stack silently. Test security boundaries, failure recovery and user-visible outcomes; do not inflate counts with implementation-mirroring tests. Documentation-only changes run document checks and secret scans.

Branches: `docs/<topic>`, `feat/<owner>-<wbs-id>`, `fix/<owner>-<topic>`, `hotfix/<incident>`. Main stays releasable. Commits: `type(scope): concrete change`, with WBS ID and evidence in body when relevant. PRs use the template, stay small and link acceptance evidence, status changes and rollback. Both leads review every PR; authors do not approve their own changes. For a lead-authored PR the other lead approves, the author records self-review, and a nonauthor domain reviewer approves. Security/contract changes need Ipeleng or relevant contract owner plus both leads' recorded review. Do not merge while required checks or remediation gate fail.

Lethabo is first reviewer for Mutarisi, Ipeleng and Babatunde; Sibusiso for Vukosi and Khutso. Both remain final reviewers. GitHub branch protection must require the CI jobs and nonauthor approvals; a written rule is not proof that remote settings are enabled.

Weekend hotfix: prefer rollback or disable the broken demo path. A minimal patch gets synchronous second-person review, security scan and focused verification before merge; leads record the exception scope and follow-up as a new `docs/build-log/entries/` file. No “deadline” exception for secrets, privacy or human-authority boundaries; if review is unavailable, use the verified fallback.

## Coordination

Before editing shared files, declare the WBS task and affected paths in your team file. Check docs/OVERLAPS.md. Contract changes require a proposed diff and both leads' decision. Update your file, add a new file in `docs/build-log/entries/` (never edit `docs/BUILD-LOG.md` — it's frozen; see `docs/build-log/README.md`) and a business handoff for each meaningful change. Record blockers with owner and needed evidence, not secrets. A correction is always a new build-log entry file; never rewrite another person's history. Tools/models are declared by the actual person; agents must not fabricate human activity or approvals. `.github/CODEOWNERS` auto-requests your reviewer on matching paths — being requested is not the same as being reviewed; read the diff.
