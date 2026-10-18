## 2026-09-25 | Sibusiso, with Claude Code assistant | Implementation | /ws/panel and /ws/member | PROPOSED

**Research** — Contract `/ws/panel` (public, opaque; kinds only for `sim_` subjects), `/ws/member` (bearerAuth; "never receives operator-room events"), `/ws/ops` (deprecated, not built). Spec V5/V8 (the phone must not reveal duress or a guardian acknowledgement during an incident), ADR-0041 T30 hold.

**Real data / references** — The scheduler and outbox workers are separate processes, so an in-process pub/sub would miss server-authored entries; only the database sees every append.

**Business reasoning** — The panel is the live "anyone can watch the chain grow" demo; the member stream lets the phone update its record without polling HTTP. Neither may become a way to follow a person or to tell a coercer that duress was entered.

**Competitor reference** — Not applicable.

Decisions (**PROPOSED**, for Lethabo and Ipeleng):
- Both streams poll `chain_entries` by `(received_at, subject_id, chain_index)`, compared as `timestamptz` and `COLLATE "C"` (text comparison of ISO strings and locale collation both mis-order).
- Panel: subject ids replaced by a per-process salted hash; `kind` added only for `sim_` subjects, labelled `simulated`.
- Member: authenticated by the §7 signed-request headers on the handshake instead of `bearerAuth`, because no bearer issuer exists and the client is the Android app. Device keys only. Messages are opaque (no kind) and cut at the pre-incident head while the T30 hold applies.
- New dependency `websockets==17.1`: uvicorn cannot serve WebSockets without it. `pip-audit` clean.

Changed: `server/streams.py` (new), `server/main.py` (routes), `contracts/openapi.yaml` (flags; `/ws/member` security and description), `test/openapi-contract.test.mjs` (WebSocket routes count as their GET upgrade), `server/requirements.txt`.

Evidence (FACT, real PostgreSQL): `server/tests/test_streams.py` 5/5 (panel opaque with sim kind; non-sim kind hidden; member handshake refused unsigned or with a bad signature; member messages opaque; member withholds entries after the pre-incident head). A real uvicorn process served `/ws/member` and refused an unsigned handshake. Mutations: kind for every subject, member hold removed — each broke a test.

Decision: None accepted.

Needs/blockers: polling at 1 s is a demo choice; `/ws/member` with a browser client would need a different auth (browsers cannot set handshake headers).

Business handoff: Not applicable.

Next: guardian lifecycle.
