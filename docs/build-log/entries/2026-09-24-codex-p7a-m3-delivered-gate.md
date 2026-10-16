## 2026-09-24 | Codex assistant for Vukosi Khoza | Codex / GPT-5 | P3.V6 / P7a M3 delivered gate | complete locally, confirmation pending

**Research** — Read the master context, repository rules, Vukosi work order, routing guidance, P7a task, P7a review and current M3 implementation/tests. The review identified percentiles from sparse delivered samples as misleading even when total attempts reached 30.

**Real data / references** — No real data and no measurement. **FACT:** the red offline suite ran 42 tests with 37 passing and five targeted M3 errors; the green suite ran 42 tests with all passing. Hand-computed acceptance values remain median 15.5, nearest-rank p95 29, min 1 and max 30 for 30 delivered values.

**Business reasoning** — Requiring a credible delivered sample before displaying latency percentiles reduces the risk of presenting fragile evidence to users, judges or prospective partners.

**Competitor reference** — Not applicable; this is an internal measurement-integrity control, not a competitor feature comparison.

Changed: M3 always reports `delivered` and suppresses all percentile keys until at least 30 attempts were delivered. Lost attempts remain in `n` and the denominator. Tests cover 27/30, 30/30, 30/40 and 29/30 delivery cases.

Evidence: full offline Python suite PASS (42/42); docs PASS; intake PASS; contract tests PASS (10/10); Gitleaks PASS; `git diff --check` PASS. The inherited `research/results/anchor-scale-scenarios.csv` is unchanged. Device checks NOT RUN; there is no live check for this packet.

Decision: **PROPOSED** — Vukosi's recommendation pending Khutso's confirmation. This is not a measurement or human approval.

Needs/blockers: Khutso to confirm the M3 reporting rule before any real result is published; evidence required is a recorded human confirmation. Real measurement remains blocked on its separately governed model, runtime, licensed/consented inputs and device procedure.

Business handoff: not applicable; no customer-facing capability or economic figure changed.

Next: Vukosi and Khutso review the proposed delivered-sample gate. No date invented. No push, PR, comment, merge or release performed.
