## 2026-09-25 | Sibusiso, with Claude Code assistant | Implementation | POST /v1/journeys (PROPOSED) | unblocks #88 |

**Research** — Reviewing #88 (Lethabo's app signer + event client) found a real integration gap: the client submits `signal_detected` as a journey-targeted event, but no route exists to create a journey and bind it to a subject, so `journey_subjects` has no rows and every journey event is refused. `POST /v1/journeys` was already declared in `contracts/openapi.yaml` (bodyless, device-signed) but unimplemented; `server/db.py` already had an internal `bind_journey()` helper with no route calling it.

**Real data / references** — Spec §7 (journey-to-subject ownership check), §3 table (`journey_armed`/`journey_ended` are separate `device_event` kinds, unchanged by this route), V1 (explicit user action arms a journey), V9 (heartbeats are not chain entries). `contracts/openapi.yaml`'s `POST /v1/journeys` operation and `AcceptedReceipt`/`Receipt` schemas.

**Business reasoning** — Without this route the app's Keystore signer (#88) and the slice-3 server (#89) cannot be joined end to end: there is no way to obtain a `journey_id` a journey-targeted event can reference. This is bookkeeping, not a chain-signed statement, so it does not itself append to the chain; `journey_armed` remains a separate device-signed event the app can submit afterward through `POST /v1/events`, unchanged.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**, added to the list for Lethabo on PR #82): `journey_id` is **server-issued** (a UUID), not device-generated, because at journey-creation time there is no chain-signed statement to derive one from. The route requires the normal §7 signed-request headers, a `device`-role key (guardian keys refused with the same `not_found` shape export/heartbeat use), consumes the request nonce, and returns a new `JourneyReceipt` (`Receipt` plus `journey_id`) rather than the plain `AcceptedReceipt`.

Changed: `server/main.py` (`POST /v1/journeys`); `contracts/openapi.yaml` (flag flipped to `true`, `JourneyReceipt` schema, `journey_id` added as an optional `Receipt` field so the `allOf` validates under `additionalProperties: false`); `server/tests/test_journey_start.py` (new, 4 tests).

Evidence (FACT, real PostgreSQL, this working tree): `server/tests/test_journey_start.py` 5/5 (added a guardian-key regression test); a created journey accepts a `signal_detected` event targeting it and schedules its G34 fallback. Mutation checks, each restored: a fixed instead of fresh `journey_id` (1 test fails); the `bind_journey` call removed (2 fail). `test/openapi-contract.test.mjs` 21/21, including the route-flag consistency check.

Decision: None accepted; server-issued `journey_id` joins the other PROPOSED items on #82/#89.

Needs/blockers: `journey_armed` still has no payload schema (unchanged, out of scope here).

Business handoff: Not applicable.

Next: tell Lethabo on #88 that journey_id is now issuable; push to #89.
