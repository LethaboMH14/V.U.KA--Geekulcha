## 2026-10-18 | Sibusiso, with Claude Code assistant | Venture plan: research folded in, corrections (server of record, duress at sign-out, Play blockers) | PROPOSED

**Research** — Eight research reports, kept in `docs/venture/research/`:
- Three read-only repository audits: the business model, the build state, and the signals and legal positions.
- Five web passes: banks and insurers, SAPS and NGOs, lawful detection, service levels, and competitions and funding.

The first run was cut off by a user interrupt at 13:11 UTC and resumed at 13:38; all eight finished. Each correction below was checked against the file, branch or release asset it cites before it went into a plan file.

**Real data / references** —
- **The 15 Oct server note.** The `server.json` asset on the `vigil-demo` release points to a presenter-PC tunnel, with the note "Azure subscription disabled". That is the asset's own note (`REPORTED`); the audit read it through the Releases API.
- **Duress at sign-out.** `app/src/api/device.ts` `signOut` with no journey ignores which PIN was used. `app/src/api/__tests__/device.test.ts` asserts that sign-in records nothing.
- **Microsoft SLA**, 1 Oct 2026 edition (read directly): App Service 99.95% (99.99% zone-redundant); PostgreSQL 99.9% without HA (99.99% zone-redundant); credit-funded purchases excluded.
- **Azure for Students terms** (Microsoft docs, read directly): non-commercial use only, disabled when the credit runs out.
- **Android developer docs** (read directly): target API 36 required from 31 Aug 2026; the `dataSync` service capped at 6 h in 24 on Android 15; `USE_FULL_SCREEN_INTENT` limited to calling and alarm apps.
- **Web claims** on Nedbank, Discovery Bank's Panic Code, Capitec, Valor, AURA, iTOO/Hollard, Joint Standards 1/2023 and 2/2024, Joint Communication 5 of 2026, POPIA s57 and s71, 10111 response times, and the Madlanga timetable. All are `REPORTED`, seen through search extracts only.
- **Not researched:** YouthX, Easies and Caplia criteria (search budget exhausted, sites unreachable).

**Business reasoning** — A partner or investor would find the lost server of record, the Play blockers and the duress gaps in the first week of due diligence. Stating them first, with a fix for each, is what keeps the B2B plan credible.

**Competitor reference** — New in `01-B2B-ENTERPRISE.md`:
- Discovery Bank's Panic Code (in-house; a R1,000–R2,000 misuse fee);
- Capitec's CIO arguing against duress PINs;
- Valor (a voice panic app claiming bank fraud-desk alerts);
- AURA as the response layer behind FNB GuardMe, OUTsurance, Momentum and Discovery 911.

VUKA is positioned as the trigger and the verifiable record that feed them, not as a competing response network. All `REPORTED`.

Changed:
- `docs/venture/README.md`: new §0 on the server of record; decisions D9 (a company-owned server in South Africa North) and D10 (accounts, shareholders' agreement, IP and licence, B-BBEE) added; D3, D4, D6 and D7 updated; §6 on research method and limits.
- `01-B2B-ENTERPRISE.md`: the market, competitors, the offers to Nedbank and insurers, a two-phase observe-only pilot, and the financial-sector vendor gate.
- `02-SAPS-AND-NGOS.md`: a ranked map with one ask each; CPSI first; Wits alongside mySOS; GBV reviews before the 16 Days of Activism; SAPS at station level after the Madlanga report; qualifiers on "Call 10111"; risks (POPIA s26/s57, Domestic Violence Act s2B).
- `03-DISTRESS-SIGNALS.md`: RICA s4 party backstop, POPIA s57 and s71, the Android and Play rules, the timer as the first new signal; D7 now recommends journey mode as the default.
- `04-SLA.md`: published SLAs; no contractual SLA on credit-funded Azure; S2 split into dispatch (contracted) and delivery (reported); S9 security notice; incident 4; costs as `ESTIMATE`.
- `05-TWO-PITCHES.md`: what is and isn't known about each competition; the Caplia gaps that are paperwork; new Q&A; funding routes tagged `ASSUMPTION`.
- `06-LAUNCH-ROADMAP.md`: §0 server of record; duress at sign-in **and** sign-out; `main` CI red since 25 Sep; the trial merge of #99; Play blockers; company housekeeping.
- `PILOTCORE-WEBSITE-BRIEF.md`: company-owned accounts; hosting terms.
- `docs/venture/research/`: the eight reports, with scratchpad paths replaced.

Evidence:
- `node --test "test/**/*.test.mjs"`: 50/50.
- `git diff --check`: clean.
- `node scripts/check-docs.mjs`: all new links resolve. It fails only on the existing file name `2026-09-27-lethabo-vigil-0.0.16.md`, as it does on `main`.
- The research files were scanned for key-shaped strings and personal contact details; setting names only.

Decision: none. D1–D10 are for both founders.

Needs/blockers:
- **Sibusiso:** check the Azure subscription and credit; record the 15 Oct event; confirm the payload-key backup.
- **Both founders:** D9 first.
- **A person:** re-open each `REPORTED` URL before external use.
- **Competition criteria:** ask the organisers.

Business handoff: the pitch Q&A in `05-TWO-PITCHES.md` §6 now answers the Discovery, Capitec and "who else" questions. Neither pitch is ready to give until D1, D2 and D9 are settled.

Next: Sibusiso — D9 and the server-of-record write-up, this week.
