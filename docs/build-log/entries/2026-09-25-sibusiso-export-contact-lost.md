## 2026-09-25 | Sibusiso, with Claude Code assistant | Implementation | P3.A5 export + T30 hold; contact_lost clock and heartbeat route | PROPOSED

**Research** — Codex stopped on two questions before its usage limit: (1) `SubjectExport.salts` was an array of base64 strings, but the accepted verifier `shared/verify.js` refuses that and reads `{event_id, salt}` items (the same for `payloads`); (2) what starts the 90 s `contact_lost` clock when an incident opens before any heartbeat, and whether contact is per journey or per subject. Claude answered both as second lead and built them.

**Real data / references** — Spec §8 (contact_lost, G33, G35), §9 pre-incident hold, ADR-0041 T30; `shared/verify.js` `normaliseCollection`; `contracts/openapi.yaml` `SubjectExport` and `/v1/journeys/{id}/heartbeat`.

**Business reasoning** — The export is the member's own checkable record, so it must be readable by the team's own verifier and must not tell a coercer anything during the hold. `contact_lost` is the only alarm that needs no action from a phone that has been taken, so its clock must start even if no heartbeat ever arrived.

**Competitor reference** — Not applicable.

Decisions (all **PROPOSED**, added to the list for Lethabo on PR #82):
- Export salts/payloads use the verifier's `{event_id, salt}` / `{event_id, payload}` item shape (contract changed to match the accepted consumer, with a contract regression assertion).
- The export ends at the entry **before the authorising `pin_authorised`**, so a normal and a duress export authorisation return the same prefix even with no prior incident. The pre-incident hold (open, or 6 h after the incident's last PIN entry, whichever ends later) caps it further. The export authorisation is not consumed (single use applies to `end_journey` only, ADR-0044). `proofs`/`receipts` carry at most one item, for the returned head, only if it is in a confirmed anchor batch.
- Contact is subject-wide: any authenticated heartbeat, or any accepted device event, from the subject counts. The clock runs from the later of incident open and last contact, fires once per incident, and only while the subject has a journey that has not ended. G33 enforced: `contact_lost` after all-normal-PIN check-ins alerts guardians but never schedules the bank signal.
- New route `POST /v1/journeys/{id}/heartbeat` (flag now `true`): device-signed, body exactly `{speed_bucket, ts}`, stores only the last contact time, never location.

Changed: `server/export_view.py`, `server/contact.py` (new); `server/main.py` (export and heartbeat routes), `server/db.py`, `server/incidents.py`, `server/event_effects.py`, `server/scheduler.py`; `contracts/openapi.yaml`; `test/openapi-contract.test.mjs`; tests `server/tests/test_export_hold.py` (5) and `test_contact_lost.py` (6).

Evidence (FACT): see the commit's verification run below for suite counts. Export mutations, each restored: hold removed (1 test fails); authorising event included (2); 6 h hold set to 0 (2); wrong salt, caught by the real `shared/verify.js` cross-check (2); expiry ignored (2). Contact mutations: G33 bank skip removed (1); active-journey condition removed (3, a coarse mutation that also changes the query's precedence); 90 s → 60 s (2); heartbeat not recorded (1); once-per-incident removed (1).

Decision: None accepted.

Needs/blockers: the scheduler, outbox workers and anchor coordinator are not started by `startup.sh` yet, so a deployed server records deadlines but nothing fires; a process model (App Service WebJob or a second worker) is needed. No real FCM adapter. Azure deploy still blocked on permissions.

Business handoff: Not applicable.

Next: PR stacked on #85; Lethabo decides the PROPOSED rules; then run the workers in the deployment.
