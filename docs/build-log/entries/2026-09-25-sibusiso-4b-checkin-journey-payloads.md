## 2026-09-25 | Sibusiso, with Claude Code assistant | spec proposal | §4b per-kind payloads | PROPOSED — both leads' agreement pending

**Research** — Codex, building P3.A3 slice 3, asked for the per-kind payload fields for `checkin_id`, the check-in window, the PIN result and journey end, and whether an accepted schema or PR existed. Searched `contracts/payloads/` on `main` and on `feat/sibusiso-contract-v2`: it exists on neither, and no PR defines it. Read `docs/VUKA-2-SPEC.md` §3 (event-kind table), §4, §7 (window limited to 20 s or 60 s), §8 (check-in arbitration, G34 fallback deadline, T47 wrong-PIN rule, G35 PIN-gated journey end), §9 (a fresh authorisation for "that exact action and target") and §18 (the `signal_detected` payload table, which is the model followed here). Confirmed `pin_authorised` is its own chain event submitted via `POST /v1/pin-authorisations`.

**Real data / references** — No production data or measurement. Schema examples use `sim_` ids and synthetic UUIDs. Tool check on 25 Sep: the three schema files are valid JSON Schema draft 2020-12 (`jsonschema` 4.26.0 `check_schema`), every example validates and passes the repository's `anchor.canonical.canonical()` (so no floats, non-ASCII keys or unsafe integers), and 14 hostile inputs are rejected: `window_s` of 30 or `"20"`, an uppercase UUID, a missing `signal_event_id`, an unknown field, `pv` 2, a device-authored `no_answer`, the wrong enum spelling `duress_signal`, `attempt` of 0, 1.5 or missing, `mode` leaking into `journey_ended`, and an empty or missing `journey_id`.

**Business reasoning** — Without agreed fields the server would invent them, and two implementations (phone and server) could disagree on the bytes that get committed and anchored. Fixing them before the wiring means a stranger's verifier and the server hash the same payload. It also settles the one link the spec left implicit: how an `opened` finds the `signal_detected` whose fallback deadline it cancels.

**Competitor reference** — Not applicable.

Changed:
- `docs/VUKA-2-SPEC.md` §4b (new, `PROPOSED`): field tables for `checkin_opened`, `checkin_result` and `journey_ended`, the reason for each field, and three open points for the leads.
- `contracts/payloads/checkin_opened.v1.json`, `checkin_result.v1.json`, `journey_ended.v1.json` (new): the proposed schemas, each `additionalProperties: false`, with examples.
- Two design choices worth review: `signal_event_id` is a required field on `checkin_opened` (nothing in the spec linked an `opened` to its signal), and `journey_ended` deliberately carries no `mode` and no authorisation reference so a duress end and a normal end have the same shape (T52, T15 harness).

Evidence: `node scripts/check-docs.mjs` and `git diff --check` pass on this branch. The schema checks above were run with the canonicaliser imported read-only from the `feat/sibusiso-contract-v2` worktree, because `anchor/canonical.py` is not on `main` until PR #51 merges. No code, server behaviour, ADR acceptance or merge is changed or inferred.

Decision: None. This is a proposal. It binds only when both leads agree it and it is recorded in `docs/ADR-ACCEPTANCE-RECORD.md` with a new ADR.

Needs/blockers: Lethabo's agreement and, since it governs what the phone signs, Ipeleng's or Lethabo's security review. Three open points are listed in §4b: `attempt` is device-asserted and unverifiable by the server, whether an `end_journey` authorisation is single-use, and a single length cap for all ids.

Business handoff: Not applicable; no user-facing or cost claim changes.

Next: leads review this PR. On agreement, Sibusiso records it in `docs/ADR-ACCEPTANCE-RECORD.md` and hands Codex the event-to-escalation wiring for slice 3, plus a contract test for each schema and golden vectors, which are due at acceptance rather than at proposal.
