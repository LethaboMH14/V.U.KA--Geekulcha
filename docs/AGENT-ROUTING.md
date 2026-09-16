# Agent routing — which tier does which stage of a task

Three stages, three different jobs. Using the same expensive setup for all three wastes cost on stage 1 and risks under-checking stage 2. Using a cheap pass for stage 2 defeats the point of having a review stage at all.

```
EXECUTE  →  REVIEW  →  REPO GATE
(cheap,      (stronger,   (the repository itself:
 bounded)     checking)    PR, comment, recheck,
                           request-changes, merge)
```

**This is a principle, not a brand of model.** Seven people are on seven different tools — Claude Code, Cline, Codex/GPT-5.6, opencode/GLM among them (`docs/PLAN.md`). Route by what your own tool actually offers; nobody needs to switch tools to follow this, and nobody's personal tooling setup belongs in this file.

## Stage 1 — Execute

**What goes here:** a bounded, well-specified task where the shape of "done" is already clear — write the first draft of a position paper section once the research is gathered, implement a function against an already-frozen contract, run a defined check and report the result, format/sweep a known stale figure across files, draft a `docs/build-log/entries/` file from a description of what happened.

**What does NOT go here:** anything that requires judgement about what "correct" even means — architecture decisions, legal/compliance interpretation, contract design, anything touching the human-gate / two-signature / `flagged` state machine, anything that will reach a judge without a review pass first.

**Rule of thumb:** if you could hand this task to a competent junior with the spec already written and trust them to execute it correctly, it's stage 1 — use whichever of your tool's models is cheapest and fastest for that.

## Stage 2 — Review

**What goes here:** checking stage 1's output against the standing rules — does the claim have real evidence, is the figure tagged `FACT`/`ESTIMATE`/`ASSUMPTION`/`PROPOSED` correctly, does it contradict something else in the repo, does it overclaim, does it touch a frozen contract without the required sign-off, is the research/business-reasoning/competitor-reference actually there and actually true (not just present as a section header). Use your tool's strongest available model for this pass — the whole point of having a review stage is that it can catch what stage 1 missed.

**Escalate to a human (Ipeleng, or both leads) instead of a stronger model when:** the question is a legal interpretation, a genuinely ambiguous architecture trade-off, or anything the reviewing model itself is uncertain about after one pass. A second AI pass does not resolve genuine ambiguity — say so and route to a person.

## Stage 3 — Repo gate

**Not a model tier — the actual repository review cycle.** PR opened → CODEOWNERS auto-requests the right reviewers (`.github/CODEOWNERS`) → checks run (`secret-scan`, `document-contracts`) → a **person** (or a person directing an AI review, same as stage 2 but now with merge authority) comments, requests changes, or approves → merge.

This is the only stage that can change `main`. Nothing merges because a model said it looked fine — see `RULES.md`'s existing "both leads review every PR; authors do not approve their own changes."

## Why this specific split

**Tier by how expensive it is to be wrong, and whether the answer is checkable.** A stage-1 task with a clear spec is checkable by a stage-2 pass, so stage 1 can be cheap. A stage-2 review that's wrong ships a bad claim to a judge or breaks a frozen contract — that's expensive, so it needs the stronger pass. The repo gate is where a wrong call becomes genuinely hard to reverse (once merged, someone has to notice and revert), so that's where a human stays in the loop regardless of how good the models get.

## What this looked like in practice, 16 September

Five PRs merged in one sweep needed real conflict resolution (see `docs/build-log/README.md`) and, before that, several rounds of review that oscillated between approve and changes-requested — not because the content kept changing, but because CI status couldn't be confirmed from the reviewing session at the time. **That specific failure mode is a stage-2 problem, not a stage-1 one** — the review stage needs to actually be able to verify what it's checking (see "Comment → rule" below), or it produces exactly this kind of stall.

## Comment → rule, every time

**If a PR review comment states something that should never happen again, it doesn't stay a comment.** It goes into `RULES.md`, `AGENTS.md`, or the relevant standing doc in the same PR or the next one — or it gets forgotten the moment the thread is archived, and the next session (any tier, any tool) repeats the mistake. This applies to every stage: a stage-1 model that got corrected in review, a stage-2 reviewer that found a real gap, a human lead who made a judgement call in a comment thread. State it once, in the standing docs, and it's enforced for everyone from then on — not just the person who happened to read that thread.
