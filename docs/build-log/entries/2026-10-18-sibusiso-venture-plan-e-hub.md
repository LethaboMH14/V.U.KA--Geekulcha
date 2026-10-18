## 2026-10-18 | Sibusiso, with Claude Code assistant | Claude Code | Post-hackathon venture plan (E-Hub insights 1–6), SLA probe, PILOTCORE website brief | PROPOSED

**Research** — What was read before writing:
- The required reading in `AGENTS.md` (`docs/MASTER-CONTEXT.md`, `BRIEF.md`, `RULES.md`, the 5 newest build-log entries).
- `docs/SIBUSISO-HANDOVER.md` and `docs/NEW-CHAT-HANDOVER.md`.
- The economics on `main` and on the unmerged branches `docs/babatunde-war-room-and-access-model`, `docs/babatunde-canvas-and-deck` and `lethabo/war-room-mentor-refinements`.
- `docs/eval/cem1-measurements.md`.
- The detection code (`app/src/brain/`, `app/src/api/device.ts`).
- The PIN-action allow-lists on the server branch `feat/lethabo-guardian-delivery`.
- The open PR list (30 open, including #124 and #114 on signals).

Two read-only repository audits (business model; signals and legal positions) ran in parallel and were checked against the files they cite. A web research pass is still running; its results come as follow-up commits.

**Real data / references** —
- **Break-even, 18 Oct:** `scripts/economics_vigil_anchor.py` (`main`) prints 10,901 at R20. The war-room branch script prints 10,973. The same script with 2 stipends prints 4,670 and with 3 prints 6,771 (scratch copies, `ESTIMATE`).
- **Cash need before the pilot pays:** `scripts/build_financial_model.py` with 2 × R30,000 stipends and no funding gives about R404k (pilot pays May 2027), R804k (Nov 2027) or R1.20m (May 2028) (`ESTIMATE`).
- **Detection:** FSD50K eval, ruleset v2. Screaming 6.5% (n = 108), Glass 46.0% (n = 139), Gunshot 54.6% (n = 108), Shatter 72.9% (n = 70) (`FACT`, `docs/eval/cem1-measurements.md`).
- **YouthX 2026:** entries closed 9 Oct, winners on 21 Nov, ages 18–26 (`REPORTED`, Hype Magazine coverage of the call for entries).

**Business reasoning** — Partners and investors check three things first: who pays and how much, whether the numbers agree, and whether the service is measured. This plan names the conflicts (three models, five stipends for two founders, no SLA) before a buyer finds them.

**Competitor reference** — FNB GuardMe (R19.90/month, press 2022) and iTOO [My]Cylution (from R22.50/month) as price anchors, from `docs/EVIDENCE.md`. Discovery Bank's Panic Code as the in-bank duress precedent, from the war-room branch. Nothing new is claimed about any competitor.

Changed:
- `docs/venture/` (README and plans 01–06): the six E-Hub insights, decisions D1–D8, a 90-day plan.
- `docs/venture/PILOTCORE-WEBSITE-BRIEF.md`.
- `scripts/sla/probe.mjs`, `scripts/sla/aggregate.mjs`, `.github/workflows/sla-probe.yml` (hourly, from `main` only), `test/sla-probe.test.mjs`.
- A dated section in `docs/SIBUSISO-HANDOVER.md`.

Evidence:
- `node --test "test/**/*.test.mjs"`: 50/50 (9 of them new).
- `git diff --check`: clean.
- The live probe from the cloud session gave 0/4 met and 3 not measured, because DNS is blocked by the session's network policy. This is not a measurement of VUKA.
- `node scripts/check-docs.mjs` fails on `main` before and after this change, only on the existing file name `docs/build-log/entries/2026-09-27-lethabo-vigil-0.0.16.md` (dots in the slug). Not changed here; it is Lethabo's entry.

Decision: none. D1–D8 in `docs/venture/README.md` §3 are for both founders.

Needs/blockers:
- Lethabo: evaluate the whole plan; decide D5, D6 (with Sibusiso) and D7; start the website.
- Both founders: D1, D2, D3, D4, D8.
- The web research results (follow-up commits).

Business handoff: `docs/venture/05-TWO-PITCHES.md` holds both pitch scripts. Neither should be given again until D1 and D2 settle the numbers.

Next: Sibusiso merges the server onto `main` (D4) and builds the worker heartbeat (`04-SLA.md` §4.3, item 1). Proposed date: end of October 2026.
