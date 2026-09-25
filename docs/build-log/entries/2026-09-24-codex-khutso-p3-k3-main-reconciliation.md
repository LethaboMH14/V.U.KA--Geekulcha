## 2026-09-24 | Codex assistant acting at Khutso Mothopa's request | P3.K3 | review pending

**Research** — Compared PR #63's requirements trace with `origin/main` after Lethabo flagged the conflict. Read VUKA-2 §2, §8, §9 and §15, ADR-0041's new test oracles, the overlap register, and the P3.K3 work order. Merged current `main` into the PR branch without a force push.

**Real data / references** — Accepted VUKA-2 §15 now includes T01–T24, T30, T47 and T50–T52. The 32 §2 requirements are unchanged. Seventeen still lack an oracle for their complete defining behavior; T30 partially covers V8. The source is the current repository specification, not a test execution result.

**Business reasoning** — A current, clause-accurate trace prevents a reviewer or buyer from mistaking proposed tests for functioning protection, supporting the published technical and security criteria and the question, “Would a real user trust and use this?”

**Competitor reference** — Not applicable; this corrects internal traceability.

Changed: `docs/REQUIREMENTS-TRACE.md` links the new tests only to clauses they directly exercise and flags the tension between §2 A5's genesis-to-head export and §9's accepted member-device pre-incident prefix. `team/khutso.md` records the reconciliation. No contract was changed and no requirement was marked passed.

Evidence: Current spec and trace were compared after merging `origin/main`; local and remote checks are recorded in the PR, not pre-claimed here.

Decision: None. Sibusiso, Ipeleng and both leads must settle the A5/§9 scope through the shared-contract process.

Needs/blockers: Sibusiso first review and both leads' review of the final PR head; explicit disposition of the A5 export-scope conflict and of the remaining test gaps.

Business handoff: The trace is a planning and acceptance map, not evidence that VIGIL or ANCHOR works.

Next: Check the final diff and repository gates, push PR #63, and request review. Do not merge or tick P3.K3 before acceptance.
