## 2026-09-25 | Sibusiso, with Claude Code assistant | Implementation | DELETE /v1/subjects/{id}/data (F15) | PROPOSED

**Research** — Same transport gap as end_journey/export/guardian_ack: the contract's `SubjectDeletionRequest` body is a bare `PinAuthorisationStatement`, which cannot become the chain-anchored `pin_authorised` entry \u00a73's table requires for "any PIN-gated action". Adding "delete" to `pin_authorised.v1.json`'s action enum broke one existing rejection vector (which had used `action: "delete"` specifically to prove an unlisted action is refused) and one existing #89 test asserting the same; both updated to use `"add_guardian"` instead, preserving the property they actually test.

**Real data / references** — Spec \u00a713 (retention, 90 days, payload+salt deletable, coarse metadata survives), \u00a79's action table ("Delete evidence: 72h cooling-off, then removed; guardians notified" / duress: "Looks done, does nothing"), \u00a73 (`deletion_tombstone`, hourly).

**Business reasoning** — A demo that cannot show the F15 "delete my evidence" path, or that would silently break under duress, undercuts the whole privacy story. Reusing `require_authorisation(consume=True)` and the existing pin_authorised duress-signal path means duress delete gets the incident alarm for free, matching \u00a79's "looks done, does nothing" exactly.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**, eleventh item for Lethabo on #82): the fresh `action=delete` authorisation travels through `POST /v1/events`, same pattern as the prior PROPOSED transport decisions; `DELETE /v1/subjects/{id}/data` is now bodyless. The 24h post-recovery freeze (built earlier today) also blocks deletion. Purge is scoped to payloads that existed at request time, so a payload created by a later event is not swept up by an old deletion request.

Changed: `server/deletion.py` (new), `server/main.py` (route), `server/pin_records.py` + `server/event_effects.py` (add "delete" to the allowed pin_authorised actions), `contracts/payloads/pin_authorised.v1.json` (enum), `contracts/openapi.yaml` (flag + description), `contracts/vectors/payloads.json` (regenerated, deterministic).

Evidence (FACT, real PostgreSQL): `server/tests/test_deletion.py` 8/8 (needs authorisation, normal schedules a 72h purge and a guardian notice, duress is a true no-op but still alarms via the existing pin_authorised path, refused while frozen, single-use, purge respects the request-time boundary in both directions, export still works after a purge). Full suite after the enum change: 244 pytest / 0 skipped (up from 235), 50 node, 137 vitest. 4 mutation checks (duress no-op removed, freeze check removed, purge scoping removed \u2014 in both directions once a precise boundary test existed) each broke a test.

Decision: None accepted.

Needs/blockers: no scheduled process runs `due_purges()`/`purge_payloads()` yet (same startup.sh gap); guardian notification is recorded, not delivered (same gap as guardian_alert/recovery).

Business handoff: Not applicable.

Next: guardian invite/accept/removal lifecycle, sim_bank service and WebSockets go to Codex as separate packets.
