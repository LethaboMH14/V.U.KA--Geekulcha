# Claude Code: Vukosi workflow setup and independent review

**PROPOSED:** open Claude Code in C:/Users/khoza/Desktop/Geekulture-vukosi-workflow. Select the strongest available Opus with `/model opus`; verify with `/status`, recording the actual model. Paste the following. No Claude run or installation on PATH is claimed.

```text
I am Vukosi Khoza (KhozaVu). Claude Code handles reasoning, task specifications and independent review; Codex/GPT implements. Do not implement the VIGIL product in this session.

Read docs/MASTER-CONTEXT.md first, then AGENTS.md and its required ordered reading, RULES.md, team/vukosi.md, docs/OVERLAPS.md, docs/AGENT-ROUTING.md, latest build-log entries, docs/VUKA-2-SPEC.md, docs/CHECKLIST.md P3 and docs/ADR-ACCEPTANCE-RECORD.md. Read nested instructions before scope edits. Then read:
- docs/VUKOSI-VIGIL-WORKFLOW.md
- docs/reviews/VUKOSI-PR43-READINESS.md
- docs/build-log/entries/2026-09-23-codex-vukosi-vigil-workflow.md

Inspect git status; preserve all draft/uncommitted work. This local docs/vukosi-vigil-workflow branch starts at PR #43 head 0c6d202, NOT merged main. The original separate checkout holds parked WBS4.2 work. No overwrite, reset, automatic stash, force-push, old predecessor remotes/history or bulk tree copy.

Refresh refs and inspect current heads, diffs, reviews, comments and CI of #43, #39, #44 and #42's closure. Report changes since the snapshot; reconcile with merged main before choosing an implementation base. Do not assume PR status stayed unchanged.

Independently review the workflow/findings. Check resolution of request retry vs nonce replay, guardian-call authority, reboot re-arm behaviour, app ownership and shared-module deadline. actor_id was already included in the signed statement/T21 at the snapshot: do not call that fixed issue open. Check P3.L8 and Ipeleng's security review; Sibusiso's ADR acceptance/GitHub APPROVED do not substitute for them. Human architecture/authority/privacy decisions belong to Lethabo/Ipeleng/Sibusiso, not an AI vote.

Set up a lightweight file-based workflow for P3.V1–P3.V6 and joint P3.L4. Preserve issued targets, not invented commitments: Thu24 Sep22:00 signed-release cold-install; Fri25 Sep12:00 thin slice; Sat26 Sep18:00 measurements; Sun27 Sep09:00 submission, all SAST. Old KHAYA WBS4.2/4.4/6.2 are parked. Lethabo first-reviews me. Mutarisi owns screens and is APK backup; Ipeleng shared crypto/security; Sibusiso contract/server; Khutso evidence/delivery.

You may refine LOCAL workflow documentation and create only the first ready implementation packet, after declaring paths in my team file and OVERLAPS. Add a NEW build-log entry. Do not rewrite historical logs, frozen docs/BUILD-LOG.md, contracts, governance or other people's work orders. No product code, install, deployment, GitHub comment/review, push, PR creation, merge or public release unless separately requested.

First packet: criterion/trust answer, spec/contract/base SHAs, objective/non-goals, exact allowed files, inputs/provenance, dependency owners, executable acceptance oracle with negative/failure cases, real or explicitly proposed commands, evidence, rollback and handoff. Build the oracle first. If v2 is missing, choose independent setup/scaffold/test-instrument work; do not invent an API.

Use docs/workflows/vukosi/<packet-id>/TASK.md, IMPLEMENTATION.md and REVIEW.md only as needed. GPT implements TASK and records actual commands/results/head SHA. You independently review that exact SHA in a separate checkout and record severity, file/line, trigger, impact and required evidence. GPT fixes; you re-review new SHA. Never have both tools editing one checkout concurrently. AI review is not human approval.

Suggested execution models, if available: GPT-6 Luna medium for mechanical checkable edits; GPT-6 Sol medium for bounded coding, high for native integration; GPT-6 Astra high for a reproducible blocker warranting escalation. Claude Opus reasons/reviews. Record actual selections. A stronger model never resolves missing authority; no LLM is added to the product.

Ask only for real missing facts that change decisions: available hours, actual phones/OS, authorised predecessor-file access, toolchain locations and signing/publication custodian. Do not invent these or request credential values. Check paths read-only before saying a tool is not installed. No measured n, successful cold-install or calibration is inferred.

Run available documentation/intake/contract checks, preserving failures and limitations. Keep keys/audio/private media/personal identifiers out. Device-only checks stay NOT RUN until executed. End with the revised task/deadline list, outstanding human decisions, first Codex implementation prompt and exact handoff paths. Do not execute the implementation yourself.
```
