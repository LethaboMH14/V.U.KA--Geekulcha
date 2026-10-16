## 2026-09-23 | Codex assistant at Vukosi's request | Codex / GPT-6 (runtime variant unavailable) | P3.V6 / P7a review fixes | implementation complete; checks recorded in IMPLEMENTATION.md

**Research** — Read the P7a `REVIEW.md` read-only from the workflow checkout and re-read P7a TASK.md §4–§8 read-only there. Confirmed starting worktree HEAD `cab484ec730085093a63855303eec15697500bef`. Criterion T/B: a real reader needs consistent run windows and an auditable list of missed clip IDs to judge reported counts.

**Real data / references** — None. Tests use synthetic `sim_` JSON and the P7a review's reproduction. No model, audio, dataset, real result, or new CSV was added. No measurement was performed.

**Business reasoning** — Rejecting alarms outside the armed duration and exposing missed IDs reduces the risk that a computed metric hides input errors or untraceable omissions.

**Competitor reference** — Not applicable; report-tool validation only.

Changed: M2 rejects alarm times above their run's `armed_seconds` while allowing equality; M1 emits below-threshold IDs in original order; audio-reference suffix blocking includes the six additional suffixes specified in review. Added offline regression tests. M3 percentile behaviour is unchanged.

Evidence: Test-first red and green output plus repository check outputs are appended to `docs/workflows/vukosi/p7a-measurement-instrument/IMPLEMENTATION.md`. All fixtures remain synthetic. No threshold recommendation or measurement.

Decision: No human decision or approval claimed. The reviewer explicitly reserved the M3 percentile question for Vukosi; this fix leaves it unchanged.

Needs/blockers: None for these three fixes. Device/model/data measurement remains outside scope.

Business handoff: Not applicable; host-side report validation only.

Next: reviewer can verify the new local commit; no date commitment.
