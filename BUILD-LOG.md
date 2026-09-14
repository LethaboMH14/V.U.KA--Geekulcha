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

## 2026-09-14 SAST | Codex assistant acting at Sibusiso's request | GPT-6 | Blockchain for Impact category assessment | authored, Lethabo review pending

Changed: added `docs/BLOCKCHAIN-FOR-IMPACT-ASSESSMENT.md`, linked it from README and added a review flag to Lethabo's team file. The assessment separates the load-bearing dispute/precedence use case from capabilities absent in this clean checkout, defines the minimum public-anchor demonstration, lists impact measures and records responsible claim boundaries. No human activity or approval is asserted.

Evidence: repository inspection found the ANCHOR design in `docs/01-ARCHITECTURE.md`, the disputed-record journey in `docs/USER-JOURNEY.md`, the OpenTimestamps cost and proof limits in `docs/EVIDENCE.md`, and the clean-checkout limitation in `BRIEF.md`. Document and secret checks are recorded after this entry when run.

Decision: none. Recommended pitch language and the proposed primary journey require Lethabo and both-lead review through the existing overlap protocol.

Needs/blockers: Lethabo reviews the product story, subject experience and status labels; Sibusiso and Ipeleng settle the proof/export and privacy boundaries; the security intake gate remains authoritative and blocked. A real public timestamp, independent verifier and user/partner validation remain absent.

Business handoff: the new assessment supplies bounded pitch language, forbidden claims, evidence status and impact measures for Babatunde; it does not create a new delivered capability.

Next: Lethabo records review findings; both leads decide any proof/export contract change; implementation waits for the authorised intake gate.

## 2026-09-14 16:12 SAST | Codex assistant acting at Sibusiso's request | GPT-6 | Blockchain for Impact assessment verification | partial; pre-existing document failures retained

Changed: no capability change. Recorded verification of the assessment commit before publication.

Evidence: `node scripts/check-intake.mjs` passed with “documentation/repository tooling only”; `.tools/gitleaks.exe dir --redact --config .gitleaks.toml .` scanned approximately 656.52 KB and found no leaks; `git diff --check` passed. `node scripts/check-docs.mjs` failed on pre-existing latency statements in `docs/00-SPEC.md`, `docs/01-ARCHITECTURE.md`, `docs/08-BUSINESS.md`, both ANCHOR rationale documents, `docs/PLAIN-WORDS.md`, `docs/TEAM.md`, `docs/TECH-STACK.md` and `docs/USER-JOURNEY.md` because sample size is absent from the same line. The new assessment was not listed as a failure.

Decision: no bypass. Keep the assessment scoped; correct existing claim-lineage failures separately if they prevent the required repository workflow.

Needs/blockers: Lethabo review remains pending. Existing document-contract failures need their evidence owner to add an actual sample size or state that it was not supplied; no value may be invented.

Business handoff: not applicable; verification only.

Next: commit through the configured hook; if the hook blocks, make only evidence-honest claim-lineage corrections required to restore it.
