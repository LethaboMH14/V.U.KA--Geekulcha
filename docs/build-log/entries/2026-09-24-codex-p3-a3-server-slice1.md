## 2026-09-24 | Codex assistant at Sibusiso's request | P3.A3 slice 1 | local implementation, not deployed

**Research** — Read the P3.A3 slice 1 task packet; repository rules and VUKA context; `docs/VUKA-2-SPEC.md` §§4–9 and 12; `contracts/openapi.yaml`; and the existing `anchor/canonical.py` and `anchor/pin_authority.py`. Confirmed that the contract has no independent `subject_id` in `EvidenceEntryV2` and the request has no authenticated subject context in this slice.

**Real data / references** — `git status --short --branch` showed `feat/sibusiso-contract-v2` at `f9d57f6` with one pre-existing unrelated untracked Hedera-spike note, which was left untouched. `python --version` returned `Python 3.13.14`; local package inspection found FastAPI 0.115.6 and psycopg2 2.9.10. Those package versions do not prove the Azure runtime is configured.

**Business reasoning** — A subject-scoped, ordered export gives the verify-page owner a local interface to build against and prevents retries or concurrent appends from silently changing chain positions. The honest boundary matters to a real user: this slice is not safe to expose until real request authentication and journey-to-subject binding exist.

**Competitor reference** — Not applicable; this is internal server infrastructure, not a competitor comparison.

Changed: added `server/main.py` and `server/db.py` for the FastAPI event append and subject export paths, with PostgreSQL `chain_entries` persistence, canonical event hashing, `event_id` idempotency, a head-row `SELECT … FOR UPDATE`, and unique subject/index constraints. Added `server/tests/` for append/export, retry conflict, concurrent append, shape rejection and the scope boundary. Reused `anchor/canonical.py`; no canonicaliser or PIN-authority implementation was duplicated. The append-only slice does not execute PIN-gated effects, so it does not interpret the private PIN statement. Updated the current-task line in `team/sibusiso.md` and added this append-only record. `server/README.md`, contracts, and checklist were not changed.

Evidence:
- `pytest server/tests/` — exit 0; **8 passed**. The concurrent test uses a thread-safe in-memory adapter and checks the production SQL includes `FOR UPDATE` plus both requested uniqueness constraints. No live PostgreSQL service or migration was exercised.
- `node scripts/check-docs.mjs` — exit 0: `Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.`
- `git diff --check` — exit 0; no whitespace errors. Git printed only LF-to-CRLF checkout advisories for the new Python files. `git diff --cached --check` is run after staging so new files are included.

Decision: no ADR accepted and no human approval inferred. `verify_request()` currently always returns `True`; it is a clearly marked development stub, **not real authentication**. Do not deploy or expose this app as authenticated. Export authentication uses the same stub. No PIN verification, signature verification, key registry/revocation, encryption-at-rest, escalation/outbox, or Hedera anchoring is implemented.

Needs/blockers: a later contract/auth task must bind journey-target events to their owning subject. Until then, this slice returns a 400 invalid-request response for `target_type: journey` instead of assigning it to a guessed chain. A registered subject genesis entry must already exist; subject creation is outside this slice. A PostgreSQL-backed integration test remains to be run in a configured test environment.

Business handoff: clients can exercise the append receipt and full-chain export for subject-target events with synthetic `sim_` test data. This does not establish a production security or safety capability.

Next: slice 2 must replace the auth stub and resolve subject binding before the API can be exposed; later slices own the explicitly excluded durable escalation, outbox and anchoring work.
