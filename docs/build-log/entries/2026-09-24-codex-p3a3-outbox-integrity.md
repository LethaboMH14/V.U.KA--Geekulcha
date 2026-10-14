## 2026-09-24 | Codex assistant for Sibusiso | P3.A3 outbox primitive and P3.A5 integrity walk | PARTIAL

**Research** — Read `docs/VUKA-2-SPEC.md` §8's transactional-outbox and first-terminal-outcome rules, §10's anchor-batch rules, and the P3.A5 export task packet. The packet requires event-to-escalation wiring, but the per-kind payload schema for `checkin_result`, `journey_ended` and related events has not been accepted. This change adds generic internals only and does not infer those payload fields. The P3.A5 verifier must report the first broken chain entry by 0-based index, never collapse the result to a boolean.

**Real data / references** — A local PostgreSQL 17 instance on `127.0.0.1:55433` exercised the committed outbox transaction, restart/new-connection claim, expired-lease retry and stale-lease acknowledgement rejection with synthetic `sim_` identifiers. No guardian, bank or anchor receiver was contacted. The v2 verifier was tested against entries hashed by the current server's `_with_server_fields()` function, not the archived v1 dataclass.

**Business reasoning** — A committed idempotency key and finite lease preserve a pending effect after a process crash. Receiver-side deduplication is still necessary for exactly one visible alert after a crash between send and acknowledgement; this code does not claim that outcome yet. Structural chain verification can be used by the eventual PIN-gated export without releasing any subject data now.

**Competitor reference** — Not applicable.

**Changed** — `server/outbox.py` and `server/db.py` add a PostgreSQL outbox table, atomic enqueue helper, due-row claim with `FOR UPDATE SKIP LOCKED`, lease token and acknowledgement guard. `anchor/verify.py` returns the first malformed or broken v2 entry index; tests cover tampering, links, indexes and empty genesis. Documentation is updated to distinguish these primitives from a working escalation or export endpoint.

**Evidence — commands and actual output:**
```
$env:VUKA_TEST_DATABASE_URL = 'postgresql://vuka_test@127.0.0.1:55433/postgres'
python -m pytest server/tests/test_outbox_postgres.py -q -v
collected 2 items
server\\tests\\test_outbox_postgres.py .. [100%]
2 passed in 5.68s

python -m pytest anchor/tests server/tests -q -rs
131 passed in 15.25s

git diff --check
exit 0 (Git warned only that Windows will convert LF in server/db.py to CRLF on a later checkout)
```

**Decision** — Generic outbox storage and structural verifier only. No per-kind event shape, escalation state machine, receiver integration, PIN verifier or public proof was invented. No ADR accepted.

**Needs / blockers** — Accepted per-kind payload contract, server event/outcome appends in the same transaction as effect enqueue, guardian/`sim_bank` receiver deduplication, incident deadlines and T08 crash-window tests. P3.A5 still needs fresh PIN-authorisation verification, pre-incident hold, actual anchored batch receipts and public proof integration. Security review before deployment.

**Business handoff** — Lethabo, Ipeleng and Khutso should treat this as tested internal infrastructure, not completion of P3.A3/P3.A5. The outbox's `reference_id` is an opaque internal pointer; private payloads and contact data must stay in protected storage, never in the public proof or Hedera message.

**Next** — Once both leads accept the per-kind payload contract, wire a locked check-in outcome transaction to the outbox, append the server outcome and exercise the T08 crash matrix. Then connect anchor batching and PIN-gated export/proof.
