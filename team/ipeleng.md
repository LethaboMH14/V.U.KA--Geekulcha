# Ipeleng Constance Modise

**Proposed planning package; owner has not confirmed availability or started these tasks.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Ipeleng Constance Modise. TUT. Threat model, secure lifecycle, OWASP mapping, physical security. **I gate what may lawfully be built at all** — the heaviest research load on the team this cycle (PSiRA, POPIA, RICA, the draft Gated Access Areas Code).

**Reviewed by** — Lethabo, then both leads.

**Effort** — **High.** Assume something is not allowed until we can show it is.

**Behaviour** — *Assume something is not allowed until we can show it is. Cite the section, not the vibe. When you find a legal or privacy problem, say so plainly even if it blocks the build — that is my job and I want to be told.*

**My domain rules**
- **Never publish the location of an unrotated credential.**
- **A refused privileged action is evidence, not an error to swallow.**
- **"Not measured" is a valid and required answer** for bias evaluation — do not let it get quietly replaced with a guess.
- Not "unhackable," not "court-admissible," not "unbiased AI" — **the honesty ledger is a security control**, not marketing caution.
- Abuse cases are **executable tests**, not prose.

**Current task** — **RICA position written 16 Sep** (`P2.7`, due Sep 19) — `docs/RICA-POSITION.md`: the ring buffer already answers the interception question as far as it can be answered without the statute — RICA's full text was **not readable** this session (official justice.gov.za PDF reachable but binary-unparseable; SAFLII/lawlibrary/polity 403; gov.za hosts only the Bill), so the paper contains no verbatim quotes and every statutory characterisation is ⚑ pending counsel (five questions, led by Q1: does transient in-memory gunshot-signature classification "intercept" a "communication" at all). The two bright lines are **verified build facts**, not positions: **audio never persists** (3-second ring buffer, no code path to disk — ASR-6) and **never attach an audio clip as evidence** (the T2 evidence chain carries labels, decisions and hashes only). No ADR — the design does not change. Alongside, the **Gated Access Areas Code review** stands (`P2.6`, ADR-0032) and the IO registration stays **prepared, not submitted** (`P2.5` — leads' gate). Her full legal stack is now authored: P2.1 PSiRA, P2.2 POPIA+ADR-0031, P2.5 IO, P2.6 GACA+ADR-0032, P2.7 RICA — remaining for all of them: Lethabo review → leads → counsel; plus the WBS 1.1 holder-confirmation review (closes `1.1`, unblocks `1.4`). Next: holder confirmations, then `4.3` operator/tenant/duress abuse cases as executable tests.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: every abuse case I sign off exists as a test that actually runs and actually fails the attack.

---

- University / role: TUT / Security designer
- Owns outright: Threat model, secure lifecycle, OWASP mapping, physical security.
- Reviews only: Every privacy/security boundary and sensitive release.
- Lead / escalation: Lethabo, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: 1.1, proposed, not started.
- Claimed files / contract versions: none; reserve before editing.
- Last updated: 12 September 2026 by Codex assistant as a planning assignment.

## Sequenced work

All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 13 | 1.1 | 4 | Verify credential/password remediation | none | Redacted issuer receipts reviewed; never values — record at `docs/audit/09` (16 Sep); holder-chat review pending |
| Sep 15 | 4.1 | 4 | Specify lawful data/rights and deletion controls | 2.1 | Data map and open legal questions reviewed; no compliance claim |
| Sep 19 | 4.3 | 5 | Exercise operator, tenant and duress abuse cases | 3.3,4.1 | Actual outcomes plus unresolved tests recorded; failed mode excluded |
| Sep 22 | 6.3 | 4 | Review proposed release for privacy and secrets | 4.3,4.5 | No personal/demo data leaks; remediation unresolved items explicit |
| Sep 27 | 7.5 | 2 | Close temporary demo access and record handover | 7.4 | Revoked temporary identities and export/retention owner recorded |

## Interfaces

- Inputs: Issuer revocation receipts from owners; actual data map from builders.
- Outputs: Abuse cases, remediation evidence and legal-review questions to leads.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

2026-09-15: Ipeleng (via Cline assistant) wrote the P2.1 PSiRA position paper, `docs/PSIRA-POSITION.md` — trigger, registration category, flag-gate reviewer position, partner-of-record contracting structure (three variants + fallback), six minimum contract clauses, counsel questions Q1–Q8, downstream consequences for P2.2–P2.6. Swept the superseded "we do not dispatch" one-liner in `docs/08-BUSINESS.md` and the G19/P2.1 status rows. PR #28; merge and counsel review pending.

2026-09-16: Ipeleng (via Cline assistant) wrote the P2.2 POPIA position paper, `docs/POPIA-POSITION.md` — s26/s27 asymmetry with grounds quoted verbatim from a full-text copy of the Act (Accessible Law; ⚑ pending Gazette verification), ground-by-ground walk against the non-consenting passer-by, "vectors not images" rejected as a lawful basis, s33(1) optimistic-vs-circular analysis, discard-by-default adopted as **ADR-0031**, responsible-party split aligned with the PSiRA partner-of-record paper, counsel questions Q1–Q5, downstream consequences for P2.3–P2.6. Swept `docs/CHECKLIST.md` P2.2/P2.3, `docs/OPEN-GAPS.md` G20 and this file. PR #28; merge and counsel review pending.

2026-09-16: Ipeleng (via Cline assistant) prepared the P2.5 Information Officer registration path, `docs/POPIA-IO-REGISTRATION.md` — eServices Portal confirmed live as the primary route (IO registration service announced 01/05/2024) with the Regulator's manual `Registration.IO@inforegulator.org.za` form as fallback, s55 duties and the head-liability consequence recorded, s1 "head" definition stated in substance only (source page truncated, ⚑), portal form field list honestly recorded as not enumerable via static fetch. Five-input table for the leads' decision (head designation D-IO-1, organisation legal identity, contact email, deputy, submission record). Nothing submitted — §7 deliberately empty. Swept `docs/CHECKLIST.md` P2.5 and this file. PR #30; leads' designation and submission pending.

2026-09-16: Ipeleng (via Cline assistant) wrote the WBS 1.1 verification record, `docs/audit/09-credential-remediation-verification.md` — redacted summary of the four exposures (WeatherAPI key, EskomSePush token, a university email with plaintext password, an undocumented Roboflow API key; predecessor-repo paths only as already published in OPEN-GAPS G6), the 13 Sep holder confirmations named as the acceptance evidence with the honest limitation that the chat messages are not in this repo and were not accessible from this session, and the 13 Sep forensic corroboration accepted as the technical baseline (every-branch `filter-repo` purge, fresh-clone gitleaks zero-leak re-verification, GitHub API confirmation, this repo's CI secret-scan green). Swept the stale "blocked by credential/data remediation" opener in `docs/audit/04-production-readiness.md`, the 1.1 row in `docs/audit/05-team-operating-system.md`, `docs/PLAN.md`'s 1.1 note, the audit README and this file. Nothing ticked closed — the leaf closes when Ipeleng reviews the holder confirmations live (record §4 lists what each must state). Never values.

2026-09-16: Ipeleng (via Cline assistant) wrote the P2.6 Gated Access Areas Code review, `docs/GATED-ACCESS-CODE-REVIEW.md`, with ADR-0032 — the draft Code's text could not be corroborated on any reachable source and the finding is stated first (every draft characterisation ⚑); the verified s60/s61/s73(1)(c) machinery quoted from the Accessible Law copy anchors a gap analysis of the architecture against the recorded direction of travel; ADR-0032 adopts that direction as a binding design floor (≤30-day auto-overwrite for gate-domain data, discard-by-default stands, FRT justification dossier before the pilot face gate) with the final text superseding via fresh ADR. Swept `docs/CHECKLIST.md` P2.6, `docs/OPEN-GAPS.md` G21 and `docs/PLAN.md`'s execution row. PR #30; Lethabo review, then leads; counsel Q1–Q4 pending.

2026-09-16: Ipeleng (via Cline assistant) wrote the P2.7 RICA position, `docs/RICA-POSITION.md` — RICA's full text was not readable this session (official justice.gov.za PDF reachable but binary; the finding is stated first and every statutory characterisation is ⚑); the two bright lines are verified build facts — audio never persists (3-second ring buffer, ASR-6) and never attach an audio clip as evidence (labels-not-audio through the T2 evidence chain); the transient-acquisition question (does in-memory gunshot-signature classification "intercept" a communication at all) is counsel Q1, with the design built so the worst answer costs nothing. No ADR — the design does not change. Swept `docs/CHECKLIST.md` P2.7 and this file. PR #30; Lethabo review, then leads; counsel Q1–Q5 pending.

## Needs and blockers

- No issuer access → account owners.
- legal uncertainty → responsible party obtains counsel.
- absent app → keep controls specified and block pilot.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Audience privacy during projection.
- independent nonmember access walkthrough.
- lost-device rehearsal coordination.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
- 2026-09-15 — Ipeleng (via Cline assistant): wrote `docs/PSIRA-POSITION.md` (`P2.1`, PR #28). Position: the obligation attaches to *rendering*, not revenue or scale — the Phase-1 pilot already triggers it; registration required in the electronic-monitoring category plus install/servicing; flag-gate reviewers assumed to need individual registration until counsel says otherwise; partner-of-record structure with three variants (fallback: VUKA self-registers for the pilot); six minimum contract clauses; counsel questions Q1–Q8. Primary sources unreachable this session (SAFLII 403, psira.co.za down, gov.za 404) — no verbatim statutory quotes; all wording flagged ⚑ (paper §9). Not legal advice; live monitoring blocked at G-gate until counsel reports. Next: `P2.2` POPIA paper + ADR.
- 2026-09-16 — Ipeleng (via Cline assistant): wrote `docs/POPIA-POSITION.md` (`P2.2`, PR #28) and ADR-0031 in `docs/adr.md`. Position: s11(1)(f) gives ordinary PI a legitimate-interest ground and s27(1) gives special PI none — verified against the Act's full text this session (Accessible Law's popia.co.za copy; SAFLII still 403, gov.za Act PDF encrypted/unparseable); a non-consenting passer-by fits no s27(1) ground (a)–(e); s33(1)'s "obtained in accordance with the law" limb either rescues the transient computation or is circular — refused to build on the optimistic reading, routed to counsel (Q2). Discard-by-default adopted as an architecture constraint (ADR-0031); consent enrolment is the sole retained lawful basis. All quotes ⚑ (paper §10). Not legal advice; the pilot face gate stays blocked at G-gate until counsel answers Q1–Q2. Next: `P2.5` Information Officer registration.
- 2026-09-16 — Ipeleng (via Cline assistant): prepared `docs/POPIA-IO-REGISTRATION.md` (`P2.5`, PR #30). Path verified this session: the eServices Portal (`eservices.inforegulator.org.za`) is the primary route and its IO-registration service is live (announced 01/05/2024); the Regulator's legacy page still offers the manual fallback — completed "Application form for Registration of Information Officers" emailed to `Registration.IO@inforegulator.org.za` under the 01 Apr 2021 Guidance Note. s55 duties quoted from the Accessible Law copy (⚑; its s55(1)(c) "Chapter 6" numbering flagged against Chapter 10 for the Gazette check); the s1 "head" definition stated in substance only (source page truncated, ⚑). Registration is free and quick, but submission needs the leads' designation of the head (D-IO-1) and VUKA's organisation legal identity — no CIPC number exists anywhere in this repo — so the honest status is **prepared, not submitted** and the checklist row is ◐. Next: `P2.6` draft Gated Access Areas Code.
- 2026-09-16 — Ipeleng (via Cline assistant): wrote the WBS 1.1 credential-remediation verification record, `docs/audit/09-credential-remediation-verification.md`. Position: the 13 Sep remediation is real and forensically corroborated (G6 closed — purge re-verified on fresh clones, gitleaks zero leaks, GitHub API shows redacted placeholders; this repo's CI secret-scan green), but the leaf's acceptance criterion — redacted issuer receipts reviewed — is hers, and the holder confirmations exist only in chat, inaccessible to the agent. So the record lays out the redacted evidence chain and deliberately does not tick the leaf; §4 lists what each confirmation must state (credential, old-credential invalidation, date) and reopens G6 for any credential whose confirmation cannot be produced. Redaction rule held throughout: no value, account identifier or new location detail. Next: Ipeleng reviews the chat confirmations (closes 1.1, unblocks 1.4); `P2.6` Gated Access Areas Code.
- 2026-09-16 — Ipeleng (via Cline assistant): wrote `docs/GATED-ACCESS-CODE-REVIEW.md` (`P2.6`, PR #30) and ADR-0032 in `docs/adr.md`. Position: the team's record (`docs/PLAN.md` §C3, G21) says a draft Code of Conduct for Gated Access Areas was published 30 Apr 2026 — but this session could not corroborate it anywhere reachable (Regulator site search zero hits ×2; codes-of-conduct page lists no 2026 entries, nearest artefact the RCC proposed code received 08 Sep 2023; web search nothing; Gazette unreachable), so every characterisation of the draft stays ⚑ and counsel Q1 seeks the Gazette notice via the s61(2) route. The verified spine (s60 scope levers reaching owners and their technology service providers; s61's ≤13-week process; s73(1)(c) making breach of an issued code "interference"; s14 minimalism) anchors a gap analysis: the T0 never-persisted ring buffer beats any retention bound, non-incident embeddings (30d) and location (7d) sit at/inside it, case-linked embeddings (case+90) and 12-month sightings exceed it if the scope reaches decision records (Q2 — kept as named parameters). ADR-0032 adopts the recorded direction of travel as a binding design floor (≤30-day auto-overwrite for gate-domain data; discard-by-default stands; FRT justification dossier before any pilot face gate; final text supersedes via fresh ADR) — safe under either outcome since every element is independently compelled or already accepted. No compliance claim; not legal advice. Next: holder confirmations (closes 1.1); `P2.7` RICA position.
- 2026-09-16 — Ipeleng (via Cline assistant): wrote `docs/RICA-POSITION.md` (`P2.7`, PR #30). Position: RICA's full text could not be read this session (official justice.gov.za PDF reachable but arrives as an encrypted binary — the POPIA paper's gov.za precedent; SAFLII/lawlibrary/polity 403; gov.za hosts only the Bill), so no verbatim quotes — every statutory characterisation ⚑ and five counsel questions logged (Q1 transient acquisition, Q2 interception-equipment certificate, Q3 no TSP/CRI duties, Q4 AmaBhungane orientation, Q5 text retrieval for the counsel pack). What carries the deliverable is verified architecture: raw audio never persists (3-second ring buffer, no code path to disk — ASR-6), YAMNet emits labels not audio, and the T2 evidence chain carries labels/decisions/hashes only — so the two bright lines (**audio never persists**; **never attach an audio clip as evidence**) are build facts, not claims. ShotSpotter precedent (Cape Town 2016, Lavender Hill 2022) left as recorded research ⚑, not re-verified. No ADR — the design does not change. Next: holder confirmations (closes 1.1); `4.3` abuse cases as executable tests.
