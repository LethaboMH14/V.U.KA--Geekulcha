# VUKA — Team & Capabilities

**Team SONAR · Geekulcha Annual Hackathon 2026 · Blockchain for Impact Use · Sector: Safety**

Criterion 1 scores **variety of skills (software, backend, enterprise architecture, UI/UX), sector background of the chosen challenge, and/or gender variety.** It is worth 10 of the 40 available points — a quarter of the total, and the only criterion that is decided before a line of code is written.

Seven builders across four universities.

---

## 1 · The seven

| | University | Role on Sonke | Owns |
|---|---|---|---|
| **Lethabo Hoaeane** | University of South Africa | Profiler | Co-lead. Architecture, product, UX. The specification, the ADRs, final review |
| **Sibusiso Khumalo** | University of the Witwatersrand | Backend Developer | Co-lead. UMOJA service, ANCHOR implementation, CI, demo orchestration |
| **Babatunde Adelusi** | University of Pretoria | Business Developer | Business case, unit economics, go-to-market, the presentation |
| **Mutarisi Chibaya** | University of Pretoria | Frontend Developer | Operator dashboard and the member-facing screens |
| **Khutso Mothopa** | University of the Witwatersrand | System Analyst | Requirements, work breakdown structure, traceability, verification mapping |
| **Vukosi Khoza** | University of the Witwatersrand | IoT Developer | KHAYA appliance — sensors, edge runtime, power budget, tamper response |
| **Ipeleng Constance Modise** | Tshwane University of Technology | Security Designer | OWASP coverage, threat model, secure development lifecycle, physical security |

**Management model.** Lethabo and Sibusiso are joint leads and both carry their own build tasks. Lethabo oversees Mutarisi, Ipeleng and Babatunde; Sibusiso oversees Vukosi and Khutso. Both review everything. Any change to a frozen contract or a locked decision goes to both, and is recorded as an ADR rather than settled in conversation.

---

## 2 · Evidence — what already exists, and who built it

The codebase VUKA is being ported from was built in July 2026 by the founding group, for a different programme, before this hackathon existed. That work is verifiable in the commit history and it is the reason this is a port rather than a start.

### Architecture, mobile and ML integration — Lethabo Hoaeane

| Evidence | Where |
|---|---|
| Kotlin native Android: foreground sensing service, partial wakelock, boot receiver, sensor bridge modules | `app/android/.../service/`, `.../modules/` |
| On-device LiteRT/TFLite integration with a sha256-registered model manifest — **and a real registry error caught by loading the interpreter rather than trusting recorded metadata** | `app/android/.../assets/models/`, build log |
| Calibrated log-odds fusion with an explicit conflict coefficient, written as a pure function so web and native share one referee fixture | `app/src/brain/fusion/` — 13 test cases |
| L0–L3 state machine with per-level hysteresis | `app/src/brain/statemachine/` — 19 test cases |
| **25 architecture decision records**, append-only; the build log; the amendment protocol | `docs/adr.md`, `docs/BUILD-LOG.md` |

### Backend, systems and security engineering — Sibusiso Khumalo

| Evidence | Where |
|---|---|
| FastAPI + WebSockets with room-scoped routing; Alembic migrations from day zero (11 tables); rate-limit middleware; operator authentication | `server/src/` — ~10,300 lines |
| SHA-256 prev-hash evidence chain with a standalone integrity verifier exposed as an endpoint | `server/src/db/evidence_integrity.py` |
| Lazy suspicion decay computed at read time — `0.5^(days/7)` — which solves "no scheduler in a single-process deployment" without altering half-life behaviour | `server/src/api/entities.py` |
| Contract tests asserting exact request and response **shapes**, not status codes; WebSocket auth and channel-isolation tests | `server/tests/` |
| Latency harness matched by sighting ID so a concurrent probe cannot corrupt the result — **p50 273 ms, p95 318 ms measured, n = 10** | `scripts/latency.py` |

### Data science and risk modelling — founding work, now team-owned

This work exists and is verifiable. It was produced under the predecessor project. Ownership going forward sits with Khutso Mothopa for traceability and Babatunde Adelusi for the commercial figures, under Lethabo's review.

| Evidence | Where |
|---|---|
| 15,712 records cleaned with three audit flags → 764 hotspot suburbs → **709 geocoded** via cached Nominatim. Analysed under a prior engagement; **not redistributed** | `hotspot_pipeline/` |
| Official SAPS quarterly statistics joined at station level — **678 precincts, all nine provinces**, per-crime trend direction. This is the public data the risk layer is re-based on | `hotspot_pipeline/integrate_saps.py` |
| Multi-source context ingestion into a unified signal table: SAPS, load-reduction schedules, weather, sunrise/sunset | `data-pipeline/` |
| **A published held-out backtest** — 654 rows, predicted versus actual — with a docstring that opens by attacking its own premise and gives the reader three ways to falsify it. **It loses to a constant baseline: MAE 0.484 against 0.246** | `data_prep/predictive_model.py` |
| Calibration harness (reliability diagrams, ECE) and a false-alarm budget, as executable code | `ml/eval/` |

---

## 3 · Skills coverage against Criterion 1

| Skill the criterion names | Covered by | Depth |
|---|---|---|
| **Software development** | All seven | ~33,600 lines shipped, 440 test cases, 207 commits |
| **Backend** | Sibusiso | FastAPI, WebSockets, PostgreSQL + pgvector, migrations, auth, rate limiting |
| **Enterprise architecture** | Lethabo, Khutso | 25 ADRs, frozen contracts, amendment protocol, spec-driven method, documented threat model, requirement-to-test traceability |
| **UI / UX** | Mutarisi, Lethabo | 20 React screens built; 14 exported design-handoff screen specifications; design tokens; Figma |
| **Mobile / embedded** | Lethabo | Kotlin native, foreground service, on-device INT8 inference on a 2 GB device |
| **IoT / hardware** | Vukosi | Edge appliance, sensor integration, power budget, tamper response |
| **Security engineering / design** | Ipeleng, Sibusiso | Hash chains, Ed25519, OWASP Top 10 and API Top 10 mapping, human-gate enforcement in code, physical threat model |
| **Systems analysis** | Khutso | Requirements decomposition, work breakdown structure, verification mapping |
| **Business development** | Babatunde | Unit economics, channel strategy, the commercial case the challenge asks for |
| **Sector background — safety, insurance, security** | Founding group, Ipeleng | Real insurance claim records analysed; official SAPS statistics integrated; a declared security-design specialism in the team |
| **Gender variety** | Present in the team | Criterion 1 names it explicitly |

### The gaps that are still real

The previous version of this document named two gaps — no gender variety, and UI/UX shared rather than owned. Both are now closed. They are replaced here rather than deleted, because a team profile that quietly drops its stated gaps is worth less than one that keeps a current list.

| Gap | Why it matters | What we are doing |
|---|---|---|
| **We have never built together in one room** | Seven people across four universities, coordinating remotely until 25 September. Integration risk concentrates on the first evening | Everything coordinates through files in the repository — a per-person file, a shared append-only build log, frozen contracts — so no handover depends on anyone being reachable |
| **Mixed AI tooling across the team** | Claude Code, Codex, Cline, different models. No tool's memory is shared, and conventions drift | `RULES.md` and `AGENTS.md` in the repository bind every person and every tool to the same standards, review gates and recording discipline, whichever tool they drive |
| **UX is owned by a co-lead who also owns architecture** | Better than shared, but still a single point of failure under load | Mutarisi owns implementation of the screens against the 14 existing specifications; Lethabo reviews rather than draws |

**Why we state these rather than omitting them.** Criterion 1 is scored by people reading a team profile. A profile claiming total coverage reads worse than one that names what is still thin and shows the mitigation — and it is consistent with the honesty discipline that runs through the rest of this submission.

---

## 4 · How seven people ship this — spec-driven, sequenced not parallelised

Seven builders across four universities cannot work the way one co-located team can. The method is the mitigation.

| Principle | Why it works here |
|---|---|
| **Contracts freeze before implementation** | `shared/contract.ts` and the frozen API surface mean nobody blocks waiting for someone else's decision. Each person builds against a signed contract, not a moving target |
| **Sequenced phases, not concurrent sprints** | Govern → Calibrate → Harden → Demo. One thing at a time, the whole team on it, done before the next begins |
| **A pull request for everything** — code, docs, design | Review on every change means no single point of knowledge, which is the real risk when seven people meet in person for the first time on the 25th |
| **Documentation in the same PR as behaviour** | *Docs-or-it-didn't-happen.* The written record is the handover |
| **Tests are the specification** | 440 contract tests asserting shapes. A regression is caught by a machine, not by whoever remembers |
| **ADRs are append-only, never edited** | Any of the seven can reconstruct why a decision was made without asking the other six |
| **One file per person, one shared build log** | Reading someone's file tells you everything you need to work around them without speaking to them — which matters across four campuses and four time commitments |

### Delivery plan, 13 → 27 September

Gate status is stated as at 12 September and is not claimed complete until it is.

| Phase | Dates | The whole team is on | Leads |
|---|---|---|---|
| **Clean** | 13–16 Sep | Clean public repository, credential rotation and history purge in the predecessors, secret scanning as a pre-commit hook **and** a CI gate, READMEs split *Built* / *Designed, not built* | Sibusiso, Ipeleng |
| **Align** | 17–19 Sep | Presentation and full alignment pass begins. Wireframes for the twelve priority screens. Work breakdown structure published | Babatunde, Lethabo, Khutso |
| **Govern** | 17–21 Sep | Two-signature enforcement, subject access, deletion route. **This closes the POPIA gap** | Sibusiso, Mutarisi |
| **Calibrate** | 20–23 Sep | Fit fusion weights on real data; publish the reliability diagram and ECE, including if it looks bad. Fix or formally retire the forecast | Khutso, Lethabo |
| **Harden** | 22–24 Sep | SAST, DAST, dependency scan, abuse-case suite, ingest fuzzing. Physical tamper and power-loss testing on the appliance | Ipeleng, Vukosi |
| **Freeze** | 24 Sep | Feature freeze. Rehearsal and recorded fallback only | Both leads |
| **Demo** | 25–27 Sep | One rehearsed thread, end to end, at BCX HQs | All |

---

## 5 · Capability claim, in one paragraph

> This team has already built and shipped the system it is proposing. Not a prototype and not a mockup — approximately **33,600 lines of application code**, **440 test cases**, **25 accepted architecture decision records**, **207 commits**, a working Android build with on-device inference, a data pipeline over 15,712 records joined to official SAPS statistics across 678 precincts and all nine provinces, and an end-to-end latency of **318 ms at p95 against a 2,000 ms budget — measured over ten runs, with the harness in the repository.**
>
> All of it was committed in July 2026, before this hackathon existed. The commit history is the capability statement. What remains is the ledger layer, which is specified, contracted and scheduled — and which extends a hash chain that already exists and already passes its integrity tests.
>
> Since selection, the founding group has grown to seven across four universities, adding dedicated frontend, IoT, systems analysis, security design and business development. The codebase is the evidence of what we can build. The team we now have is the evidence of what we can finish.

---

*VUKA — VIGIL · UMOJA · KHAYA · ANCHOR · Team SONAR · #GKHack26 #BuildForUse*
