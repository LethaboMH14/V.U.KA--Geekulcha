## 2026-09-25 | Sibusiso, with Claude Code assistant | Implementation | guardian_ack stand-down, public anchor reads | PROPOSED

**Research** — Auditing the real contract flags (30 declared routes, only 5 implemented) found `POST /v1/alerts/{id}/ack` cannot become the `guardian_event` chain kind §3's table requires (`guardian_ack`, hourly-anchored) from a bare `{action, ts}` body — same structural gap as `pin_authorised`. `GET /v1/anchor/proof/{head}` and `GET /v1/anchor/latest` had working internal logic (`server/anchoring.py`) but no HTTP surface, and `anchoring.SCHEMA_SQL` was never in `PostgresDatabase.initialize()`'s module list, so a real deploy would never create `anchor_batches`.

**Real data / references** — Spec §3 (guardian_ack), §8 (stand_down closes the incident; S1/ADR-0037 non-duress-only bank cancel), G4/G5.

**Business reasoning** — `incidents.stand_down()` existed with no caller; a guardian could never actually stand an alert down. The anchor reads are the "prove it to a stranger" surface Babatunde's review (#90) specifically tested.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**, ninth item for Lethabo on #82): `guardian_ack` travels through `POST /v1/events` (new `contracts/payloads/guardian_ack.v1.json`), same pattern as `pin_authorised`; `/v1/alerts/{id}/ack` stays unimplemented, marked superseded. `stand_down` now closes the incident (§8's literal wording — it previously only cancelled the bank timer) and cancels a pending non-duress bank signal; it can never cancel a duress-triggered one. `handling`/`called_10111` are recorded with no further effect.

Changed: `server/event_effects.py` (guardian-signer branch), `server/anchor_reads.py` (new), `server/main.py` (`GET /v1/anchor/latest`, `GET /v1/anchor/proof/{head}`), `server/db.py` (anchoring schema now created on `initialize()`), `contracts/openapi.yaml` (3 flags flipped true), `anchor/payloads.py` + `shared/payloads.js` (guardian_ack registered).

Evidence (FACT, real PostgreSQL): `test_guardian_ack.py` 5/5, `test_anchor_reads.py` 4/4. 6 mutation checks (close_incident call, signer-role check, incident-ownership check, head-format check, receipt-validation call, leaf-membership check — the last needed a second assertion added to catch it) each broke a test.

Decision: None accepted.

Needs/blockers: Lethabo's acceptance of the transport pattern (same open question as pin_authorised). `anchor_batches` still only fills when something runs `BatchCoordinator.tick()` — no process does yet (same startup.sh gap as before).

Business handoff: Not applicable.

Next: guardian invite/accept/removal lifecycle (harder, PROPOSED design going to Codex separately), device recovery, deletion route.
