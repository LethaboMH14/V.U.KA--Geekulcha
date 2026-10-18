## 2026-09-25 | Sibusiso, with Codex and Claude Code assistants | Implementation | P3.A3 slice 3 items 1, 1b and guardian delivery | PROPOSED

**Research** — Codex implemented the escalation wiring on `feat/sibusiso-slice3-escalation` and hit its usage limit before committing it. Claude re-ran every suite against a fresh local PostgreSQL cluster, ran mutation checks, and committed the work. The earlier blocker entry (`2026-09-25-sibusiso-slice3-window-blocker.md`) is superseded by the decisions below, not edited.

**Real data / references** — Spec §3, §4b, §8, §9, S1; ADR-0041, ADR-0044. Four decisions Sibusiso gave during implementation, each posted to Lethabo on PR #82 and each **PROPOSED** until she accepts:
1. No-`opened` fallback deadline assumes the maximum window: receipt + 60 s + 30 s (`server/escalation.py`, `NO_OPENED_ASSUMED_WINDOW_S`).
2. `checkin_result` with no stored `checkin_opened` fails closed: retryable 409 `checkin_unknown`, nothing synthesised.
3. One open incident per subject, across journeys (`server/incidents.py`, partial unique index).
4. `pin_authorised` travels through `POST /v1/events` with the §9 statement inside the committed payload (`contracts/payloads/pin_authorised.v1.json`, new spec §4b.1); `POST /v1/pin-authorisations` stays unimplemented and is described as superseded. Only `end_journey` and `export` are accepted.
Also PROPOSED: guardian delivery behind a `GuardianNotifier` interface with a simulated, `sim_`-only adapter; the S1 three-minute bank timer starts at the earliest recorded delivery, never at enqueue; zero guardians or no successful delivery records an `escalation_gaps` row and sends no timed bank signal (a fifth decision for Lethabo). Duress sends the bank signal immediately regardless.

**Business reasoning** — A duress or unanswered check-in must reach guardians and, where S1 requires, the simulated bank exactly once, surviving restarts. Every rule not in the accepted spec sits behind one named function or constant so a lead decision can replace it without touching the rest.

**Competitor reference** — Not applicable.

Changed: `server/escalation.py`, `incidents.py`, `event_effects.py`, `pin_records.py`, `guardian_notifier.py`, `guardian_worker.py`, `bank_worker.py`, `scheduler.py`, `server_signing.py`; `server/db.py` and `server/main.py` wiring; `anchor/payloads.py`, `shared/payloads.js`, the payload vectors and generator; the pin_authorised schema; spec §4b.1; one OpenAPI description. Tests: `server/tests/test_slice3_events.py`, `test_guardian_delivery.py`, `test_escalation_deadlines.py`.

Evidence (FACT, run by Claude on this working tree, PostgreSQL 17 loopback cluster, no skips): pytest `anchor/tests server/tests scripts/tests` 202 passed; root `node --test` 50/50; shared vitest 136/136; vector generator deterministic (same SHA-256 on two runs). Mutation checks, each restored: removing single-use consumption (1 test fails); starting the bank timer at delivery instead of delivery + 3 min (2 fail); making the one-open-incident index non-unique (1 fails); assumed window 60 → 20 (2 fail); removing the end_journey exact-target check (4 fail).

Decision: None accepted. Five PROPOSED rules await Lethabo on PR #82.

Needs/blockers: `contact_lost` and the export (P3.A5) were not wired by Codex; they need the heartbeat clock rule and the export salt-format fix, handled in the next entry. The scheduler and workers are not yet started by `startup.sh`. No real FCM adapter; guardian delivery is simulated.

Business handoff: Not applicable.

Next: contact_lost and export on this branch; then a PR stacked on #85.
