# VUKA — Implementation handover

**Written 12 September 2026, 21:00 SAST.** For any session — human or AI — picking up implementation from a cold start.

Read this file, then `../README.md`, then `00-SPEC.md`, then `SDLC.md`. That is the order. Do not start writing code before the hard rules in §3.

---

## 1 · Where the project actually is

**The repository contains documentation and the submission pack. It contains no application code yet.**

That is not a gap in the work — it is the port that has not started. A four-layer implementation exists in two predecessor repositories built in July 2026 (approximately 33,600 tracked lines and 224 `origin/main` commits). A source scan finds 510 test-function definitions; the earlier “440 tests” count has not been reproduced by running the suites. It is being moved here **file by file, with review**, because those repositories had contaminated histories. See §3 and `docs/EVIDENCE.md`.

| | |
|---|---|
| Repository | `github.com/LethaboMH14/V.U.KA--Geekulcha` · **private** · branch `main` |
| Must become | **Public, MIT, by 20 September** — not on the 25th |
| Commits | 3. Initial, docs seed, docs correction |
| Event | 25–27 September, BCX HQs Centurion. Awards Fri 15:00, hacking from 16:00, ends Sun 15:00 |
| Today | 12 September — **13 days** |

### What exists here

```
README.md                     Built / Designed, not built / What currently fails
docs/00-SPEC.md               Numbered requirements, frozen contracts, verification map
docs/01-ARCHITECTURE.md       The architecture of record, 106 pp
docs/SDLC.md                  How the work is done
docs/SDLC-GAP-ANALYSIS.md     What is wrong with our own process
docs/TEAM.md                  Seven builders, ownership, the gaps still real
docs/TECH-STACK.md            Every technology and why — including what we refused
docs/USER-JOURNEY.md          Four journeys through one machine
docs/AI-AUTONOMY.md           Where AI sits and where it is forbidden
docs/ANCHOR-RATIONALE.md      Why one blockchain use survived and three were refused
docs/08-BUSINESS.md           Market, unit economics, go-to-market
docs/LEAN-CANVAS.md           Nine blocks
docs/PLAIN-WORDS.md           The system without jargon
submission/archive-2026-08/   Superseded Aug deck, slides, architecture view and generated PDFs — see its README
scripts/                      Document and deck generators
```

### What does not exist here yet

Everything in `00-SPEC.md` §3 and the repo map in §8 below. Principally: `app/` `server/` `appliance/` `anchor/` `brain/` `data/` `dashboard/` `shared/` `ml/` — plus CI, the secret-scanning gate, and the team coordination files in §7 task 1.

**`anchor/` is genuinely new work.** Everything else is a port.

---

## 2 · The thesis — protect this in every decision

> The binding constraint on safety technology in South Africa is not accuracy. It is **legitimacy**. Every design decision must make the system more **checkable**, not more **capable**.

If a change makes the system more capable but less checkable, it is the wrong change. Say so and propose the alternative.

**On AI.** Total autonomy in perception, zero autonomy in consequence. The load-bearing parts of this system — the human gate, the two-signature rule, the hash chain, the public anchor, the audio ring buffer — contain no machine learning at all. They are rules, hardware and mathematics, and they behave identically whether a model is right or wrong. The organisers explicitly asked for *"less AI reliance"*; this is the answer, and it is already true. Lead with it.

---

## 3 · Hard rules. Do not violate these.

### Secrets and history

1. **Never `git remote add` the predecessor repositories. Never import their history.** The clean history here is the most valuable property this repo has. Port code by copying files, reviewing them, and committing fresh.
2. **Never commit a secret.** `.env` is gitignored; `.env.example` is committed with no values. Before the first code commit lands, secret scanning must be live as **both** a pre-commit hook and a CI gate (`gitleaks` or `detect-secrets`).
3. **Never publish the location of a credential that is not yet rotated.** `docs/01-ARCHITECTURE.md` §9.1 discloses the incident and its remediation but deliberately withholds services, files and line numbers. That withholding is intentional — do not "helpfully" restore the detail. Once rotation and purge are complete, the fuller account can be published.
4. **No proprietary data.** The 15,712-record claims dataset was analysed under a prior engagement and is **not redistributed**. The risk layer is re-based on SAPS open data, which covers 17 of 18 target towns. Describing the figures is fine; shipping the data is not.

### Behaviour that is enforced in code, not policy

5. **No code path may set `flagged`.** The machine's ceiling is `watch_candidate`. Only `human_verify()` with an operator ID may escalate. The absence of any other path is the test — a reviewer should be able to grep for it.
6. **Two-of-two signatures** on whitelist, camera disarm, threshold change and record deletion. The motivating vulnerability: a whitelisted entity accumulates *no* suspicion, so one operator acting alone could quietly switch off surveillance of one person. The attempt itself is an anchored event.
7. **Embeddings, never images.** Raw audio lives in a three-second ring buffer and is never persisted. Enforced in the vision layer so a policy change cannot weaken it.
8. **No personal data on chain, ever.** Only a hash of a hash. 32 bytes per hour.
9. **No generative model in any determination path about a person.**
10. **Fuse only physically independent senses.** Mic, IMU, Bluetooth radio, camera. Stacking two models that read the same signal and multiplying their error rates is in our own honesty ledger as a discredited claim.
11. **Calibrated numbers only.** A raw softmax entering fusion is a correctness bug, not a style issue. Anything uncalibrated is labelled a target.
12. **High conflict suppresses escalation.** Disagreement is information; never average it away.

### How we speak about it

13. **The honesty ledger (D14).** Never claim: *"identifies criminals"* · *"court-admissible"* · *"unbiased AI"* · *"unhackable"* · *"prevents crime"* · any uncalibrated precision figure.
14. **`sim_` prefix on every simulated component**, in code and aloud.
15. **Publish the numbers that embarrass us.** It is the only reason anyone should believe the ones that don't.
16. **Docs-or-it-didn't-happen.** A behaviour change requires a docs update and a `BUILD-LOG.md` entry in the same PR.

---

## 4 · Verified numbers. Use these exactly. Never round, never improve.

**Measured**

- Detection → alert render: **318 ms p95**, 273 ms p50, against a 2,000 ms budget. **This is n = 10.** The sample size travels with the number, every time.
- **25 ADRs** · **224 `origin/main` commits** · ~33,600 tracked lines, ~10,300 server-side · **510 test-function definitions found; executed-suite count pending**.

> The ADR count is **25**. Several documents previously said 27; that was corrected on 12 September across six files. Do not reintroduce it.

**Data**

- 15,712 claim records analysed under a prior engagement, **not redistributed**.
- 764 hotspot suburbs → **709 geocoded** · 678 precincts · 9 provinces · 680 hijackings · 1,296 incidents in the 00:00 hour.
- Modelled exposure R1.09bn; ~R10.9m per 1% of incidents prevented.
- SAPS open data covers 17 of 18 target towns.

**Economics — every rand figure is a model, not a quote**

- KHAYA bundle R299/month → hardware amortised R125, cloud and anchor R12, support R25 → **gross margin R137, 46%**.
- Prototype BOM R3,900, modelled R3,000 at 1,000 units. **Estimate.**
- Anchoring: 720 anchors/month, **~R0/month for the entire network** on OpenTimestamps (primary; Hedera ~R9–10 fallback, corrected 17 Sep) — fixed, not per user.

**What currently fails — never soften these**

- **The forecast loses to a constant baseline: MAE 0.484 vs 0.246.**
- Fusion weights hand-set from a cost matrix, not fitted. The parameter file self-labels `PROVISIONAL — NOT fit on real data`.
- Face-match thresholds 0.55 / 0.65 cosine are targets and are **uncalibrated**.
- One of six suspicion factors implemented; five are documented stubs.
- Bias evaluation not run on the face pipeline — our stated answer to the NIST FRVT differentials is itself untested.
- No independent penetration test. No CV model we trained ourselves.
- Appliance hardware not fabricated. **This is what caps TRL.**
- POPIA obligations undischarged: no retention TTL, no subject-access path, no deletion route.

**Technology readiness: state TRL 4, met and verified.** Two subsystems at 5. The organisers asked teams to build to TRL 4 — do not headline 5 at a room that asked for 4.

---

## 5 · The team

Seven builders, four universities. Full roster and evidence in `TEAM.md`.

| | University | Owns |
|---|---|---|
| **Lethabo Hoaeane** *(co-lead)* | UNISA | Architecture, product, UX, the spec, the ADRs, final review |
| **Sibusiso Khumalo** *(co-lead)* | Wits | `server/`, `anchor/`, `contracts/` (frozen 15 Sep, superseded `shared/contract.ts`), CI, demo orchestration |
| **Mutarisi Chibaya** | Pretoria | `dashboard/`, member-facing screens |
| **Vukosi Khoza** | Wits | `appliance/` — sensors, edge runtime, power, tamper |
| **Ipeleng Constance Modise** | TUT | Threat model, OWASP mapping, SSDLC, physical security |
| **Khutso Mothopa** | Wits | Requirements, WBS, traceability, verification mapping |
| **Babatunde Adelusi** | Pretoria | Business case, unit economics, GTM, the presentation |

Lethabo oversees Mutarisi, Ipeleng, Babatunde. Sibusiso oversees Vukosi, Khutso. Both review everything. **Any change to a frozen contract or a locked decision needs both leads and an ADR.**

The team drives **mixed AI coding tools** — Claude Code, Codex, Cline, different models — with no shared memory between them. Therefore **all coordination happens through files in the repository**, never through any one tool's chat history.

---

## 6 · Dates and gates

| Gate | Due | What must exist |
|---|---|---|
| **G0 · Clean** | 16 Sep | Secret scanning live (hook + CI). Credentials rotated and predecessor history purged. Proprietary dataset removed from the old public repos |
| **Align** | 17–19 Sep | Presentation pass begins (Babatunde). **Wireframes for twelve priority screens.** WBS published |
| **G3 · Governed** | 21 Sep | Two-signature enforcement, subject access, deletion route. **Closes the POPIA gap** |
| **G4 · Calibrated** | 23 Sep | Fusion weights fitted on real data. Reliability diagram + ECE published, including if it looks bad. Forecast fixed or formally retired |
| **G5 · Hardened** | 24 Sep | SAST, DAST, dependency scan, abuse-case suite, ingest fuzzing. Appliance tamper and power-loss testing |
| **Freeze** | 24 Sep | Feature freeze. Rehearsal and recorded fallback only |
| **G6 · Demo** | 25–27 Sep | One rehearsed thread end to end, with a recorded fallback |

**Repo public by 20 September.**

---

## 7 · What to build, in order

### Task 1 — Team coordination scaffolding *(do this first; everything else depends on it)*

Create and commit:

- **`RULES.md`** — standing rules for every person and every AI tool: coding standards (TypeScript strict in `app/` and `dashboard/`; Python 3.11+ with type hints, `ruff`, `black`, `pytest` elsewhere), conventional commits, branch naming `<name>/<thing>`, a PR for everything, review assignment per §5, what must never be committed, and the engineering principles in §3.
- **`AGENTS.md`** — how to drive an AI coding tool here: what to read before starting and in what order; how to scope a task; when to ask rather than assume; what a tool may never do without a human; how to record what it did. Must work identically on Claude Code, Codex and Cline.
- **`team/<name>.md`** — one per person. Who they are, what they own, **which AI tool and model they use**, current task, what they changed, what they need from whom, what they are blocked on, decisions affecting others, running log. Reading one person's file should tell you everything needed to work around them without speaking to them.
- **`docs/BUILD-LOG.md`** — append-only, everyone writes, every time. Entry format plus the rule for when an entry is mandatory.
- **`docs/adr.md`** — append-only. Never edit; supersede. Port the 25 existing ADRs.
- **`docs/OPEN-GAPS.md`** — the register from `SDLC-GAP-ANALYSIS.md`, kept current.

### Task 2 — Secret scanning and CI *(before any code lands)*

`gitleaks` or `detect-secrets` as a pre-commit hook **and** a GitHub Actions gate. Add `.github/workflows/ci.yml`, `CODEOWNERS`, a PR template. A failing scan breaks the build.

### Task 3 — Scaffold the repo map

Create the structure in §8 with `.gitkeep` and `README.md` stubs so people can land work without merge collisions on directory creation.

### Task 4 — Port, layer by layer

Order: `contracts/` (frozen 15 Sep — see `shared/README.md`) → `brain/` → `server/` → `app/` → `appliance/` → `data/` → `dashboard/`.

For each file: copy, read it, remove anything that fails §3, confirm no secret, commit with a message that says what it does. **Contract tests first** — they assert exact request and response shapes, not status codes. `brain/` and `app/src/brain/fusion/` are pure functions with no I/O, no clock and no platform calls, so one golden fixture is the referee for both web and native.

### Task 5 — `anchor/` — the new work

| File | Does |
|---|---|
| `chain.py` | Prev-hash chain. Port from `server/src/db` |
| `sign.py` | Ed25519 per-party keypairs |
| `merkle.py` | Hourly batching → one 32-byte root |
| `publish.py` | OpenTimestamps client |
| `verify.py` | Integrity + anchor verification. **Returns the first broken link by index, not a boolean** |
| `subject.py` | Subject access + deletion that removes payload and retains hash |

Canonical entry shape and hashing rule are in `00-SPEC.md` §8 and `01-ARCHITECTURE.md` Appendix B. `sort_keys=True` is not a style choice — canonical serialisation is what lets a stranger reproduce the hash.

### Task 6 — Wireframes *(high value, currently missing)*

Criterion 3 names wireframing explicitly and criterion 4 is flow of use. Twelve priority screens. Fourteen exported screen specifications already exist as a handover artefact — Mutarisi implements against them, Lethabo reviews. Duress states must be **visually identical** to normal states: no observable difference in UI, timing or network behaviour.

---

## 8 · Repo map to create

```
app/            VIGIL — React Native + Kotlin. android/{service,modules,assets/models}, src/{sensors,brain,evidence,api,ui}
appliance/      KHAYA — vision/ audio/ agent.py
server/         UMOJA — src/{api,ws,suspicion,risk,routing,db,auth,middleware,notify}
anchor/         ANCHOR — chain sign merkle publish verify subject
brain/          Shared fusion — pure functions, no I/O
data/           ingest/ geocode/ enrich/ forecast/ eval/
dashboard/      React + Vite + TS strict + MapLibre
shared/         contract.ts — FROZEN, both leads sign off to change
scripts/        latency harness, seeders, demo orchestration
ml/eval/        calibration.py · fa_budget.py · bias_eval.py
.github/        workflows/ci.yml · CODEOWNERS · PR template
team/           one .md per person
```

Frozen API surface and the state-machine table are in `00-SPEC.md` §8. Contract tests assert exact shapes.

---

## 9 · Tooling notes

Gotchas already hit, so nobody loses an hour to them:

- **Deck** regenerates from `scripts/build-deck.cjs` with `pptxgenjs`. `npm install pptxgenjs` in a scratch directory and run it from there — it will not resolve from the project root. It emits `.pptx` only.
- **pptx → pdf and JPGs**: PowerPoint COM from PowerShell. `$deck.SaveAs($dst, 32)` for PDF; `$deck.Export($dir, "JPG", 1920, 1080)` for slides. LibreOffice is not installed.
- **Markdown → PDF**: `scripts/build-docs-pdf.mjs` (needs `marked`) emits print HTML, then headless Chrome `--print-to-pdf --no-pdf-header-footer --virtual-time-budget=90000`. The long budget matters — the architecture doc has 47 mermaid blocks that render client-side.
- **Counting PDF pages** without poppler: `len(re.findall(rb'/Type\s*/Page[^s]', open(f,'rb').read()))`.
- `strings` is unavailable in Git Bash. `pypdf`, `fitz` and `pdfplumber` are all installed.

---

## 10 · Changed on 12 September — do not revert

1. **Credential locations withheld** from `01-ARCHITECTURE.md` §9.1. The disclosure and remediation table stay; the map is gone until rotation and purge are done. Doc is v1.1 with the amendment recorded in its own control table.
2. **Team corrected from three to seven** across `00-SPEC`, `01-ARCHITECTURE`, `SDLC`, `SDLC-GAP-ANALYSIS`, `TECH-STACK`, `LEAN-CANVAS`, `PLAIN-WORDS`, `TEAM.md` and deck slide 22. Roster, RACI and escalation rebuilt. Contract sign-off moved from "all three builders" to "both leads".
3. **ADR count 27 → 25** in six places.
4. **Closed gaps replaced, not deleted.** Gender variety and UX ownership are closed; the gaps that are still real (never built together in one room, mixed AI tooling, UX owned by a co-lead who also owns architecture) took their place. If a gap closes, replace it — never quietly drop it.

---

## 11 · Open questions a human must answer

1. ~~**Ndumiso Skhosana.**~~ **RESOLVED 12 September 2026.** Confirmed by Lethabo: Ndumiso and Sali are not on the VUKA/Geekulcha team — they belong to the predecessor project. The existing attribution (founding work under the predecessor project, forward ownership to Khutso for traceability and Babatunde for figures) is correct as written and needs no change. Neither name appears anywhere else in this repository.
2. **Sunday end time.** The acceptance email says 15:00; the programme PDF says 16:00. Plan against 15:00.
3. **The claims-derived figures.** Currently framed as "analysed under a prior engagement, not redistributed", which keeps R1.09bn and R10.9m-per-1% in the business case. The stricter alternative is SAPS-only, losing both.
4. **R1–R5 status.** Until rotation, password change, history purge and scanning are genuinely done, `09-VUKA-SSDLC.md` §5 must not be published — it describes a remediation as complete.

---

## 12 · Files that live outside this repository

Held in the working folder, deliberately not committed. Do not push them.

`CLAUDE.md` (full version — §0 contains the credential map) · the repo audit · the Sonke form text · the judge notes · the progress update · the Astra audit pack · the Gamma prompts · naming and concept-lock deliberation · the organisers' event brief · the superseded 18-slide deck.

If `CLAUDE.md` is wanted in-repo for AI tooling, commit a **redacted** version with §0 replaced by a pointer to the leads.

---

*VUKA — VIGIL · UMOJA · KHAYA · ANCHOR · Team SONAR · #GKHack26 #BuildForUse*

> **It forgets you. It never forgets what it did.**
