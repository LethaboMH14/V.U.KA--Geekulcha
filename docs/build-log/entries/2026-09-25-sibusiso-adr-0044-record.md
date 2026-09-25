## 2026-09-25 | Sibusiso, with Claude Code assistant | ADR record | ADR-0044 / spec §4b | PROPOSED — acceptance pending

**Research** — Lethabo recorded three decisions on #82 (24 Sep) and asked for them to be written into a new ADR and `docs/ADR-ACCEPTANCE-RECORD.md`, with contract tests and golden vectors, and for §4b to stay `PROPOSED` until Ipeleng's and Khutso's reviews exist. Checked which ADR numbers are claimed: main runs to ADR-0042, and open PR #78 claims ADR-0043, so ADR-0044 is the next free number. Read the ADR-0042 block and the acceptance-record table for the exact format, and the record's append-only rule.

**Real data / references** — Lethabo's decision comment on #82: `attempt` device-asserted and a §17 residual; `end_journey` authorisation single-use and consumed atomically with the first accepted `journey_ended`; one shared identifier cap across all payload kinds, recommended 128 characters. Re-ran the schema checks on 25 Sep: the three schemas are valid draft-2020-12, examples are canonical-safe under the repo's `canonical()`, a 128-character `journey_id` is accepted and 129 is rejected in both kinds that carry it, and the earlier hostile inputs still reject.

**Business reasoning** — Recording the decisions as an ADR with a "Pending" acceptance row means the leads and the two reviewers see exactly what was decided, by whom, and what is still missing, so §4b cannot be mistaken for accepted. It also unblocks nothing prematurely: the wiring waits for acceptance.

**Competitor reference** — Not applicable.

Changed:
- `docs/adr.md`: ADR-0044 (`Proposed`), with the six decisions, rejected alternatives and consequences.
- `docs/ADR-ACCEPTANCE-RECORD.md`: a new dated section with a **Pending** row. No past row is edited.
- `docs/VUKA-2-SPEC.md`: §4b status note and the open points replaced by Lethabo's three decisions; the 1–128 character cap on `journey_id` in §4b and in §18's `signal_detected` table; the single-use rule in §8's G35 bullet; the `attempt` residual in §17. Each edit is marked `PROPOSED` and cites ADR-0044.
- `contracts/payloads/checkin_opened.v1.json`, `journey_ended.v1.json`: `maxLength: 128` on `journey_id`; `checkin_result.v1.json` reformatted for consistency only.

Evidence: `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs` and `git diff --check` pass on this branch. The schema checks above were run with the canonicaliser imported read-only from the `feat/sibusiso-contract-v2` worktree.

Decision: None. This records decisions Lethabo already made and states what is still missing. ADR-0044 is not accepted.

Needs/blockers: Ipeleng's security review, Khutso's review, then Lethabo's acceptance. The number ADR-0044 may need renumbering if another ADR merges first. The 128 figure is Lethabo's recommendation; confirm it at acceptance.

Business handoff: Not applicable.

Next: Ipeleng and Khutso review #82. On acceptance Sibusiso closes the record row (a new closing entry, not an edit), and Codex builds the contract tests, golden vectors and the slice-3 wiring.
