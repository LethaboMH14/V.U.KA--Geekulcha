# VUKA — Architecture Decision Records (append-only)

> How the plan changes without chaos. Never edit an accepted ADR — supersede it with a new one.
> Format: `ADR-NNNN: Title | Status | Context | Decision | Consequences`.

## Provenance

This repository's history is clean and does not import either predecessor's commits (see `docs/HANDOVER.md` §3).
Its architecture decisions are not new, however — they were made in two predecessor repositories in July 2026,
each numbering its own ADRs from 0001. **Both series collided on meaning** (BEACON's ADR-0002 is the human gate;
Team-Sonar-Vuka's ADR-0002 is the TFLite runtime choice), and every citation across this repository's docs
(`00-SPEC.md`, `01-ARCHITECTURE.md`, `AI-AUTONOMY.md`, `ANCHOR-RATIONALE.md`, `SDLC.md`, `TECH-STACK.md`,
`USER-JOURNEY.md`, `PLAIN-WORDS.md`) already uses the BEACON numbers. Renumbering BEACON would have broken all of
them, so this file resolves the collision the other way: **BEACON keeps ADR-0001–0007 unchanged; Team-Sonar-Vuka's
ADR-0001–0018 are renumbered ADR-0008–0025** here. Every internal cross-reference inside the ported text (e.g.
"ADR-0003 is not superseded") has been rewritten to the new number. No ADR's substantive text — context, decision,
or consequences — was altered beyond that renumbering.

New ADRs for work done inside this repository start at **ADR-0026**. `CLAUDE.md` §12 previously reserved
ADR-0020–0025 for a different set of decisions (naming, anchor, governance, deletion, autonomy, TRL); that range
collided with this renumbering and is superseded — see ADR-0026 below.

| New ID | Source repo | Original ID | Title | Date |
|---|---|---|---|---|
| ADR-0001 | BEACON | ADR-0001 | Project name, stack, and repo | 2026-07-24 |
| ADR-0002 | BEACON | ADR-0002 | Suspicion engine is human-gated (soft evidence never auto-dispatches) | 2026-07-24 |
| ADR-0003 | BEACON | ADR-0003 | Rename ILISO → BEACON; Discovery-alignment naming rationale | 2026-07-24 |
| ADR-0004 | BEACON | ADR-0004 | Cloud provider selection — Azure for Students, per-workstream service map | 2026-07-24 |
| ADR-0005 | BEACON | ADR-0005 | Canonical suspicion-scoring engine — `server/src/suspicion/scorer.py` | 2026-07-25 |
| ADR-0006 | BEACON | ADR-0006 | Face-embedding entity resolution, and the two honesty limits that come with it | 2026-07-25 |
| ADR-0007 | BEACON | ADR-0007 | Plate text is read locally by a purpose-built recogniser, and refused unless per-character confidence clears a floor | 2026-07-25 |
| ADR-0008 | Team-Sonar-Vuka | ADR-0001 | Android-first, iOS as reduced compliant subset | 2026-07-17 |
| ADR-0009 | Team-Sonar-Vuka | ADR-0002 | LiteRT (TFLite), INT8, as on-device runtime | 2026-07-17 |
| ADR-0010 | Team-Sonar-Vuka | ADR-0003 | React Native (bare) + native Kotlin modules | 2026-07-17 |
| ADR-0011 | Team-Sonar-Vuka | ADR-0004 | FastAPI + WebSocket + PostgreSQL backend | 2026-07-17 |
| ADR-0012 | Team-Sonar-Vuka | ADR-0005 | Two-track fusion — calibrated log-odds + conflict gate (NOT naïve Dempster-Shafer) | 2026-07-17 |
| ADR-0013 | Team-Sonar-Vuka | ADR-0006 | Per-level expected-cost thresholds + hysteresis + context prior | 2026-07-17 |
| ADR-0014 | Team-Sonar-Vuka | ADR-0007 | Honesty ledger adopted (prohibited claims) | 2026-07-17 |
| ADR-0015 | Team-Sonar-Vuka | ADR-0008 | Demo topology is a public tunnel to the laptop, not LAN-only | 2026-07-18 |
| ADR-0016 | Team-Sonar-Vuka | ADR-0009 | P0 client is a web app; bare React Native deferred to P2 | 2026-07-18 |
| ADR-0017 | Team-Sonar-Vuka | ADR-0010 | GitHub + Notion only; fluid ownership; no Linear | 2026-07-18 |
| ADR-0018 | Team-Sonar-Vuka | ADR-0011 | Ops dashboard ships as a static WS feed at P0; D5 stack (Vite+React+MapLibre) lands P1 | 2026-07-18 |
| ADR-0019 | Team-Sonar-Vuka | ADR-0012 | D5 stack delivered — ops-dashboard/app (Vite+React+Tailwind v4+MapLibre) | 2026-07-18 |
| ADR-0020 | Team-Sonar-Vuka | ADR-0013 | Node-health + business view added to ops-dashboard/app (docs/01 §3, docs/05 UC-9) | 2026-07-18 |
| ADR-0021 | Team-Sonar-Vuka | ADR-0014 | Sbu joins as second active builder — branch/PR workflow reactivated | 2026-07-19 |
| ADR-0022 | Team-Sonar-Vuka | ADR-0015 | Azure as primary cloud services provider for P2 | 2026-07-20 |
| ADR-0023 | Team-Sonar-Vuka | ADR-0016 | Guardian scenario UI + meta.scenario convention + contract drift fix | 2026-07-19 |
| ADR-0024 | Team-Sonar-Vuka | ADR-0017 | "Discovery Safety Revamp" design handoff — ported into existing repo, not a new stack | 2026-07-21 |
| ADR-0025 | Team-Sonar-Vuka | ADR-0018 | Second, larger "Discovery Safety Revamp" bundle — extend ADR-0024's port scope, reject its Dempster-Shafer copy and unbacked "score breakdown" UI | 2026-07-21 |

---

## ADR-0001: Project name, stack, and repo | Status: Accepted | 2026-07-24
**Source:** ported from BEACON, original ADR-0001
**Context.** Theme 3 ("Biometric community security network") is a new build, distinct from VUKA. We need a name, a stack the five of us can move on immediately, and a repo. Deadline pressure: showable by 12:00 today, virtual pitch over Teams.

**Decision.**
- Name: **ILISO** (isiXhosa, "the eye"; *iliso lomphakathi* — the community's eye). Working name — run a trademark/company collision check before anything public-facing beyond the hackathon (there are SA firms with "Iliso" in the name, e.g. consulting/engineering). Alternates if vetoed: **QAPHELA** (isiZulu, "be alert"), **MASIBONE** ("let us see").
- Stack: Python vision agent (Ultralytics YOLOv8 + InsightFace + EasyOCR) → FastAPI+WS → React/Vite/MapLibre dashboard. SQLite day-0 → Postgres+pgvector+H3. OR-Tools routing. Ports VUKA's fusion brain, server patterns, dashboard skeleton and Discovery light theme.
- Repo: new public GitHub repo `iliso` (LethaboMH14). VUKA repo untouched; ILISO cites it as lineage (ISIPHEPHELO realized).

**Consequences.** Reuse buys us ~days. Public repo ⇒ VUKA secret discipline applies from commit one. Renaming later is one find-replace while the name is only in docs — decide by G1.

---

---

## ADR-0002: Suspicion engine is human-gated (soft evidence never auto-dispatches) | Status: Accepted | 2026-07-24
**Source:** ported from BEACON, original ADR-0002
**Context.** Our unique IP is the Sighting Graph: repeat appearances of a plate/face across cameras at crime-correlated places/times build a suspicion score, with trajectory prediction to pre-arm downstream cameras. The failure mode of every comparable system (Flock ALPR false stops from 0/O confusion; face-rec demographic false-positive gaps up to ~100× in NIST FRVT) is automated action against an innocent person.

**Decision.** Two-gate ladder, enforced in `brain/`, not in policy:
1. Machine may raise an entity only to **watch candidate** (suspicion score is capped below alert level regardless of evidence mass — same cap-not-demote pattern as VUKA's conflict gate).
2. Only a **human verification** (security ops or community watch captain, seeing the evidence) promotes candidate → **Flagged**. Only Flagged entities pre-arm cameras or route patrols.
3. Recurrence factors count only for entities absent from the street **whitelist** (residents/regulars, learned + member-managed).
4. Plate matching uses a confusion-aware comparator (0↔O, 1↔I, 8↔B edit distance) and reports match quality — never silently exact-matches.
5. Every score shown is calibrated; every alert carries a cancel window.

**Consequences.** We give up "fully automatic" headlines and gain the pitch's strongest slide: the system is engineered so the worst outcome — armed response to a wrong match — cannot happen by design. Latency cost of the human gate is acceptable because the property-crime track (93.6% of claims) is prevention/recovery, not seconds-critical.

---

---

## ADR-0003: Rename ILISO → BEACON; Discovery-alignment naming rationale | Status: Accepted | 2026-07-24 | Supersedes the naming portion of ADR-0001
**Source:** ported from BEACON, original ADR-0003
**Context.** Team decision: the platform name should be English and align with Discovery's brand voice, core purpose ("make people healthier and enhance and protect their lives") and Adrian Gore's Four Principles (disciplined optimism, focused urgency, declared goals, the Pareto Tail). ILISO (isiXhosa, "the eye") read as surveillance-first and needed translation in the pitch.

**Decision.** Platform = **BEACON**, tagline *"the light that stays on."* Rationale: a beacon warns early (focused urgency), is light rather than a watching eye (disciplined optimism — protection framed as hope, not surveillance), is by definition a public visible commitment (declared goals), and concentrates light exactly where the dark is (the Pareto Tail — mirrors the law of crime concentration our whole design exploits). Load-shedding resonance: the light that stays on when the streetlights don't. Candidates considered: FORESIGHT (too cold/analytics), LIGHTHOUSE (name collision with Google's dev tool), SENTINEL (militaristic, overused). Repo: `beacon` under LethaboMH14 (user-created). Full alignment mapping: docs/05 §1b.

**Consequences.** All docs renamed in this commit; ADR-0001 and the genesis BUILD-LOG entry retain "ILISO" as historical record (append-only protocol). "Vitality Protect" stays as pitch framing for the member programme, explicitly not a Discovery trademark claim. Trademark/collision check still required before any public use beyond the hackathon ("beacon" is common in tech and security — e.g. BLE beacons; acceptable for a hackathon, revisit for production).

---

---

## ADR-0004: Cloud provider selection — Azure for Students, per-workstream service map | Status: Accepted | 2026-07-24
**Source:** ported from BEACON, original ADR-0004
**Context.** CLAUDE.md D3 commits to PostgreSQL + pgvector + H3 as the upgrade path from SQLite but names no cloud provider. The team needs one deploy target for the demo-day cloud fallback (docs/01 §6: "no cloud dependency to fail mid-pitch" — the demo itself runs on localhost + tunnel; cloud is the pre-recorded-video/live-backup safety net, not the critical path). Nobody on the team has a company card or existing cloud spend; student-tier free credit is the real constraint, not raw feature comparison.

**Decision.** **Azure for Students**, one provider, one shared resource group. Reasoning, compared directly against AWS and GCP for *this* team's situation:
- **No credit card required to activate** (verified via GitHub Student Developer Pack / academic email) — AWS Educate and GCP's free trial both still ask for a card, which is a real activation blocker mid-hackathon, not a hypothetical one.
- **$100/year credit, renews each academic year** — enough for a burstable Postgres instance + a small container app running for the ~2-week build window; AWS/GCP free-tier equivalents expire in 90 days or meter more aggressively on the always-on WebSocket connection BEACON needs.
- **Consistency with VUKA** (the sibling Gradhack project, same authors) already locked Azure as its primary (VUKA ADR-0015) — reusing the same provider means one set of learned quirks, one place credentials live, and a coherent story if a judge asks about infra across both submissions.
- Rejected AWS: broader service catalog doesn't matter at this scale, and the card requirement + steeper IAM setup cost more hackathon time than it buys.
- Rejected GCP: Cloud Run + Cloud SQL would work fine technically, but the $300 trial needs a card and the credit is a one-time 90-day pool, not an annual student allowance — wrong shape for a team that may keep iterating past the hackathon.

**Per-workstream service map** (one person's subscription hosts the shared resource group — see Consequences):

| Workstream | Owner | Azure service | Why this one, not an alternative |
|---|---|---|---|
| `server/` API + WS (docs/01 §2.2) | Sbu | **Azure Container Apps** | Native WebSocket support + scale-to-zero (cost control on a student credit); App Service works too but Container Apps' scale-to-zero matters more when the credit is finite |
| Postgres + pgvector + H3 (CLAUDE.md D3) | Sbu | **Azure Database for PostgreSQL – Flexible Server**, Burstable B1ms tier | pgvector ships as a supported extension; Burstable tier is the cheapest SKU that still gives predictable perf for the demo |
| Evidence clips / encrypted escalation media (docs/01 §2.1 privacy-at-source) | Sbu | **Azure Blob Storage** | Cheapest durable object store; SAS tokens give the short-lived signed-URL pattern the evidence chain needs |
| Secrets (DB creds, WeatherAPI/EskomSePush keys) | Sbu, shared read by all | **Azure Key Vault** | Free tier; avoids `.env` files with real keys ever touching a laptop that isn't the deploy target |
| `ml/` vision fine-tune training (Sali) | Sali | **Local/Colab GPU for training; Azure Blob Storage for model registry only** | Azure ML Compute GPU quota is not guaranteed to provision same-day on a fresh student subscription — don't gate training on it. Cloud is just where trained `.tflite`/`.pt` weights get versioned and pulled from, not where training happens |
| Ops dashboard hosting (Connie/Ipeleng) | Connie | **Azure Static Web Apps** | Free tier, GitHub-Actions-native CI/CD on push, matches the Vite/React build with zero extra config |
| `data/` claims ingest pipeline (Ndu) | Ndu | **Azure Functions** (timer-triggered) + **Azure Blob Storage** for raw/processed claims | Serverless matches the pipeline's actual shape (batch ingest → geocode → enrich → forecast, not a long-running service); avoids paying for an always-on VM for a job that runs a few times a day |
| RAG/LLM layer for the Vehicle-Specific Risk Routing idea (docs/01 §5 roadmap note, Ndu's idea) | Ndu | **Flagged risk, not yet resolved** | Azure OpenAI Service requires a separate access-request approval that is not guaranteed to clear during the hackathon window — do not build the RAG layer assuming it will. Fallback if it doesn't clear in time: call a model API directly (e.g. Anthropic/OpenAI with a personal key) and treat it as a `sim_`-labelled/manual-key integration in the pitch, not a "we deployed this on Azure" claim |

**Consequences.** One person's Azure for Students subscription hosts the shared resource group for anything that needs to be live for the demo (recommend Sbu's, since he owns `server/` and the deploy is server-centric) — everyone else gets Contributor/Reader access via Azure AD B2B guest invite, which is free and doesn't draw on their own $100 credit. Anyone who wants to experiment independently (e.g. Sali testing Azure ML Compute) can still activate their own student subscription for that alone — it just isn't the demo-day target. This is a G3-optional flex (docs/01 §6): the actual demo runs on localhost + cloudflared tunnel regardless, so a cloud outage on pitch day degrades gracefully to the already-proven local topology, not a hard failure.

---

---

## ADR-0005: Canonical suspicion-scoring engine — `server/src/suspicion/scorer.py` | Status: Accepted | 2026-07-25
**Source:** ported from BEACON, original ADR-0005
**Context.** Two independent scoring implementations exist with no import relationship: `brain/fusion.py` (PR #7, in-memory `Entity` dataclass, F1+F6 only, standalone) and `server/src/suspicion/scorer.py` (PR #10, all six F1–F6 factors, reads real `Sighting`/`Claim` DB rows, wired into the live `/v1/entities` API and the hash-chained evidence log). A pitch whose ethics story rests on "one auditable score, human-gated" cannot ship with two scorers that could disagree on the same entity.

**Decision.** `server/src/suspicion/scorer.py` is canonical — it's the one actually reachable from the frozen API contract (docs/01 §5) and the one the evidence chain / human-verify gate is built against. `brain/fusion.py` is retained as a reference prototype (its F1 window logic and human-gate discipline are sound and match) but must not be wired into `server/` or the dashboard; no new factor work should land there. If `brain/`'s author wants F2–F5 parity or a different modelling approach, extend `scorer.py` directly rather than completing the parallel file.

**Consequences.** No code deleted (PR #7's author's call whether to remove or keep `brain/` as a design note). Any future PR wiring entity scoring into an endpoint must import from `server/src/suspicion/scorer.py`, not `brain/fusion.py`.

---

---

## ADR-0006: Face-embedding entity resolution, and the two honesty limits that come with it | Status: Accepted | 2026-07-25
**Source:** ported from BEACON, original ADR-0006
**Context.** `Entity.embedding_ref` and `Sighting.embedding_ref` have existed since migration 001, described as "reference to embedding storage". No such storage was ever built. Consequently `POST /v1/sightings` ran entity resolution only when `plate_text` was present, and a face sighting stored `entity_id=NULL` — recorded, but carrying no identity, no suspicion score, and no ability to match a returning person. BEACON's central claim is recognising a *returning* threat; for people it was not doing that. This is also an API contract change (docs/01 §5), which requires an ADR.

**Decision.**
1. Add a `face_embeddings` table (migration 004) storing L2-normalised 512-d InsightFace `buffalo_l` vectors, several views per entity (capped at 10), which is the store the existing `embedding_ref` columns point at.
2. `POST /v1/sightings` accepts an optional `embedding: list[float]`. When `modality == "face"` and the embedding is valid, resolve by **cosine similarity, max over an entity's stored views** (not a centroid — averaging poses blurs the discriminating detail).
3. **Plate outranks face.** When a sighting somehow carries both, the plate decides. An OCR'd plate is a far stronger identifier than an uncalibrated face similarity, and must not be overridden by one.
4. Add a syntactic plausibility gate on OCR plate strings at the request boundary. Forced by measurement, not theory: on real 1080p footage the plate service returned `` ```markdown ``, `1234567890`, `BUSINESS`, `CASE 2000` (news chyron text) among 8 "plates". Ungated, each became an Entity with a suspicion score, and the confusion-aware matcher would merge `1` and `6` into one vehicle.
5. Add `GET /v1/sightings` exposing `bbox` / `plate_text` / `plate_quality` / `modality` — written on POST since 001 with no route to read them back.

**Consequences.**
- `MATCH_THRESHOLD = 0.40` is an **uncalibrated default**, not a measurement. Binding constraints, recorded here so they survive personnel change: (a) no false-match or accuracy rate may be quoted for face matching anywhere — pitch, UI, or docs; (b) a match means "this camera has seen this face before", never identification of a named person, because no identity database exists to name anyone from; (c) a match is a lead for human verification, consistent with ADR-0002's human gate. Lifting these requires a real ROC/DET curve on representative SA footage.
- The plate gate is a **plausibility filter, not a verifier**. `CASE 2000` passes because it is plate-shaped; nothing syntactic can reject plate-shaped background text. Asserted in a test so the limitation can't regress into an unearned claim.
- A wrong plate match names a car; a wrong face match accuses a person. The face threshold is deliberately set on the strict side of the usual range for that asymmetry.
- Storing biometric descriptors raises a POPIA obligation that this repo does not yet discharge: no retention policy, no subject-access path, no deletion route. Required before anything resembling production.
- Rejected: running face detection as a fourth microservice alongside the two Roboflow-backed ones. It is a local model with no credential to manage, and a demo that needs four servers running has four ways to fail on stage. It runs in-process in the analyzer script.

---

---

## ADR-0007: Plate text is read locally by a purpose-built recogniser, and refused unless per-character confidence clears a floor | Status: Accepted | 2026-07-25
**Source:** ported from BEACON, original ADR-0007
**Context.** ADR-0006 added a *syntactic* plausibility gate on OCR plate strings and recorded its limit explicitly: "nothing syntactic can reject plate-shaped background text". That limit then bit. On the 1080p SA hijacking clip the Roboflow workflow's LLM-backed OCR stage returned, for eight detected plates: ` ```markdown `, `1234567890`, `1000000000000`, `CASE 2000`, `BUSINESS`, `1`, `6`, `0000`. `CASE 2000` — read off a news chyron — passed the syntactic gate and created a vehicle Entity that does not exist.

Two faults there are structural, not tuning: the model emitted its own markdown fencing instead of a reading, and it read words off background text. Both are what an open-vocabulary model does when asked a closed-vocabulary question. Neither is fixable by prompt or threshold, and neither is a resolution problem.

Generative super-resolution was considered as a fix and **rejected**: PULSE-style upscalers invent plausible characters, the invention is unfalsifiable from the output, and a hallucinated registration is exactly the wrong-person failure ADR-0002 exists to prevent. No generative model may sit between a camera and a plate string in this system.

**Decision.**
1. **Detection stays remote, reading moves local.** The Roboflow workflow is still the plate *detector*; `vision/plate_ocr.py` reads the crop with `fast-plate-ocr` (`cct-s-v2-global`, ~5 MB ONNX, CPU). A purpose-built recogniser *cannot* emit markdown fencing or a chyron word, because its output alphabet is plate characters and nothing else. This is a structural fix, not a guard on top of a bad output.
2. **A quality gate that refuses rather than guesses.** A read becomes a `plate_text` only if the crop clears `MIN_CROP_W/H` (40×12 px) and the **weakest character** in the read scores ≥ `MIN_CHAR_PROB = 0.50`. Confidence is taken over `char_probs[:len(text)]` only: the model returns ten slots, and the trailing padding slots score ~0.89 precisely because the model is confident they are padding — a `min()` over all ten reads a blank plate as a confident one.
3. **Refusals are recorded, not discarded.** The sighting is still POSTed with its bbox; only the text is withheld, alongside `ocr_reason`, `ocr_raw_local`, `ocr_raw_workflow` and `ocr_min_char_prob` in the detection track. The previous pipeline stored `None` and lost the evidence of its own failure. The Live AI Camera renders these as "plate detected · unreadable" rather than hiding them, so the UI cannot imply OCR succeeds more often than it does.
4. The syntactic gate from ADR-0006 stays. It is now the second line, not the only one.

**Consequences.**
- Measured on the same eight crops, the local model returned empty for four and plate-shaped junk for the other four: `W444`, `00314247`, `444411`, `1W4114`. That junk is **more** dangerous than the workflow's, because `plate_text.py` cannot reject `00314247` — it has the exact shape of a real registration. What saves it is per-character confidence, which the LLM stage never exposed: all four scored a weakest character of 0.156–0.287. **Swapping the model is what made the gate possible; the gate is what does the real work.**
- Expected end state on this footage: **8 plates detected, 0 accepted.** `CASE 2000` no longer creates a fake vehicle. Fewer reads is the correct outcome, not a regression.
- **Honesty limit, binding:** this sample contains no *correctly*-read plates, because at 10–17 px character height none of these plates are legible to anything, human included. `MIN_CHAR_PROB` is therefore validated as a **junk suppressor (4 of 4 rejected)** and **not** as a true-positive filter — nothing measured here shows what a correct read scores. **No read rate, precision or accuracy figure for plate OCR may be quoted anywhere** — pitch, UI or docs — until it is measured on footage containing plates a human can read. The threshold is provisional until then.
- Resolution remains the binding constraint on plate reading, and no software stage changes that. The honest statement is "we detect plates reliably and read them only when the pixels support it", never "we do ANPR".
- Multi-frame voting across sightings of the same vehicle is the next improvement and is deliberately sequenced *after* this one: voting cancels noise, not bias, so voting over a biased recogniser would have produced a confident wrong plate.
- `fast-plate-ocr` must be installed with `--no-deps` (see `vision/requirements.txt`): it pulls `opencv-python-headless`, which collides with `opencv-python` and fails mid-install on Windows.
- CI gained a `vision-tests` job. `vision/tests` existed and was never run by CI; the gate logic is pure and testable without ONNX, so there is no excuse for it being unguarded.

---

## ADR-0008: Android-first, iOS as reduced compliant subset
**Source:** ported from Team-Sonar-Vuka, original ADR-0001
**Status:** Accepted (2026-07-17)
**Context:** iOS forbids background audio, fake-shutdown, persistent stealth sensing — the core of UMKHUSELI. SA budget-phone market is Android-dominant.
**Decision:** Build Android-first with full capability; ship iOS later with only Apple-permitted features (duress PIN, Guardian, manual panic, crash).
**Consequences:** Feature set is tiered by platform (not one app, two builds). Framed as compliance + reaching the underserved majority, not a weakness.

---

## ADR-0009: LiteRT (TFLite), INT8, as on-device runtime
**Source:** ported from Team-Sonar-Vuka, original ADR-0002
**Status:** Accepted (2026-07-17)
**Context:** Need a mature, accelerated Android on-device runtime with a rich pretrained-model ecosystem while data-starved.
**Decision:** LiteRT/TFLite, models INT8-quantized. ONNX only if a shared iOS format later demands it.
**Consequences:** TensorFlow-centric tooling; smallest footprint; hardware delegates; most transfer models available pre-converted.

---

## ADR-0010: React Native (bare) + native Kotlin modules
**Source:** ported from Team-Sonar-Vuka, original ADR-0003
**Status:** Accepted (2026-07-17)
**Context:** Need fast UI iteration for the demo plus native access to background service, sensors, audio.
**Decision:** Bare React Native (not Expo) with thin, typed Kotlin native modules for sensors/foreground-service/stealth.
**Consequences:** Small typed JS↔native bridge; UI velocity retained; OS-level features reachable.

---

## ADR-0011: FastAPI + WebSocket + PostgreSQL backend
**Source:** ported from Team-Sonar-Vuka, original ADR-0004
**Status:** Accepted (2026-07-17)
**Context:** Realtime relay to Guardian + ops; team Python fluency; clean upgrade path.
**Decision:** FastAPI + WS hub, PostgreSQL (+PostGIS later); SQLite acceptable for P0.
**Consequences:** Simple realtime fan-out; standard, hostable on Azure at P2.

---

## ADR-0012: Two-track fusion — calibrated log-odds + conflict gate (NOT naïve Dempster-Shafer)
**Source:** ported from Team-Sonar-Vuka, original ADR-0005
**Status:** Accepted (2026-07-17)
**Context:** Naïve Dempster's rule misbehaves under high conflict (Zadeh's paradox); our worst cases are high-conflict. Judges include a Head of Data Science.
**Decision:** Hard triggers bypass ML; soft track fuses calibrated modality probabilities in log-odds (logistic-regression weights correct partial dependence); a conflict coefficient K routes high-disagreement evidence to verification. Keep D-S only as narrative; if ever coded, use Yager's rule.
**Consequences:** Defensible math, conflict-aware, cheap, unit-testable (docs/03 §6 golden fixture).

---

## ADR-0013: Per-level expected-cost thresholds + hysteresis + context prior
**Source:** ported from Team-Sonar-Vuka, original ADR-0006
**Status:** Accepted (2026-07-17)
**Context:** A single "score > 81" is arbitrary; alert fatigue kills safety systems; load-shedding is the SA edge.
**Decision:** Escalate by Bayes-risk thresholds θ = C_FA/(C_FA+C_miss) with a different cost matrix per L0–L3; add hysteresis (θ_up>θ_down); shift the prior by load-shedding stage, area risk cell, and hour.
**Consequences:** Cheap actions on weak evidence, expensive actions on strong; cried-wolf engineered out; SA angle expressed as math.

---

## ADR-0014: Honesty ledger adopted (prohibited claims)
**Source:** ported from Team-Sonar-Vuka, original ADR-0007
**Status:** Accepted (2026-07-17)
**Context:** Credibility with this panel is the moat; the original submission over-claimed.
**Decision:** The list in docs/06 §6 is prohibited in code, comments, UI copy, and pitch. Under-claim when unsure; replace false precision with "assumption + range + what we'd validate".
**Consequences:** Stronger under hostile questioning; some flashy-sounding claims removed by design.

---

## ADR-0015: Demo topology is a public tunnel to the laptop, not LAN-only
**Source:** ported from Team-Sonar-Vuka, original ADR-0008
**Status:** Accepted (2026-07-18)
**Context:** docs/01 §4 specified the P0/P1 demo as phones plus one laptop on localhost/LAN. The actual pitch is a *virtual* one: the user phone is on camera, the **Guardian is at a different physical location**, and the ops dashboard is a shared laptop screen. A `192.168.x.x` address cannot reach a Guardian in another suburb. Separately, the client page is served over HTTPS, and browsers hard-block `ws://` from an `https://` origin — `wss://` is required regardless of who is where.
**Decision:** Keep the server on the demo laptop and expose it through a **Cloudflare Tunnel**, giving a public `https://` + `wss://` origin. No cloud hosting; the laptop on the shared screen remains literally the server. Supersedes the LAN-only wording in docs/01 §4 for P0/P1.
**Consequences:** The demo needs internet for *transport*, which does not weaken the offline thesis — that thesis is about the **phone deciding locally**, and we prove it on camera by putting the user phone in airplane mode mid-demo, watching it still reach L3 and queue the alert, then flush on reconnect. Tunnel URL is ephemeral; treat it as config (`.env`), never committed. Fallback if the tunnel dies at pitch time: the recorded video (P1 gate).

---

## ADR-0016: P0 client is a web app; bare React Native deferred to P2
**Source:** ported from Team-Sonar-Vuka, original ADR-0009
**Status:** Accepted (2026-07-18)
**Context:** D3/ADR-0010 specify bare React Native with Kotlin native modules. The build machine has no JDK, no Android SDK and no adb, the P0 gate is five days out, and one builder is active. Standing up the RN toolchain would consume most of that window before any VUKA logic ran. A working browser demo (`prototype/umkhuseli_demo.html`) already exists and runs on a real phone.
**Decision:** P0/P1 ship a **web client served to phone browsers** — real phones, real network, real server, real duress PIN, real Guardian alert. The brain (`fusion`, `statemachine`, `evidence`) is pure TypeScript with no platform calls, so it is the *same code* under RN later. ADR-0010 is **not superseded** — bare RN remains the P2 target, when real sensors and TFLite need it.
**Consequences:** Sensors are simulated at P0 and must be `sim_`-named in code and named as simulated in the pitch (CLAUDE.md §4 P8). What is genuinely real at P0: the fusion math, the state machine, the evidence chain, the wire contract, the end-to-end latency. What is not: on-device inference, background/stealth behaviour, true always-on sensing — all of which are OS-level and honestly out of reach in a browser. Say so plainly rather than implying otherwise.

---

## ADR-0017: GitHub + Notion only; fluid ownership; no Linear
**Source:** ported from Team-Sonar-Vuka, original ADR-0010
**Status:** Accepted (2026-07-18)
**Context:** CLAUDE.md §5/§7 and docs/08 assume Linear task IDs and two fixed builder lanes. In practice the team runs its board in **Notion**, tracks code in **GitHub**, and has five people with fluid roles: Lethabo (planning + build), Sbu (build, availability-dependent), Connie (UI/frontend), Salimata (Discovery research), Ndumiso (business case). Members hand work off rather than owning fixed folders.
**Decision:** Drop Linear. PRs reference the **Notion task** they close. Ownership is **fluid** — anyone may pick up any area, including finishing work another member started. The two-reviewer rule for `brain/`, `evidence/` and `server/incidents` is **deferred while a single builder is active** and resumes the moment a second builder is available; solo work still lands on a `<name>/<thing>` branch with green tests, so the audit trail survives.
**Consequences:** CLAUDE.md §5/§7 and docs/08 §5 updated to match. Losing peer review while solo is a real risk, absorbed by the required unit tests on fusion, state machine, evidence and contract — those are the gate when a human reviewer is not available.

---

## ADR-0018: Ops dashboard ships as a static WS feed at P0; D5 stack (Vite+React+MapLibre) lands P1
**Source:** ported from Team-Sonar-Vuka, original ADR-0011
**Status:** Accepted (2026-07-18)
**Context:** D5 specifies React + Vite + Tailwind + MapLibre/Deck.gl. Standing that toolchain up (scaffold, build pipeline, map tiles) is real time a solo builder doesn't have before the P0 gate, and the P0 milestone only requires an "ops live feed, end-to-end" (docs/08 §1) — it does not require the final stack. The same reasoning already applied to the client (ADR-0016).
**Decision:** `ops-dashboard/index.html` is a single static page: no build step, subscribes to the WS hub, backfills existing incidents via `GET /v1/incidents` on load. It proves the live-feed contract end-to-end on real infrastructure. D5 is **not superseded** — the Vite/React/MapLibre dashboard remains the P1 target, once there's a map and multiple operators to build a real UI around.
**Consequences:** The page says so on its own face ("Interim P0 view... See ADR-0018") so nobody mistakes it for the final ops UI in front of judges (CLAUDE.md §4 P8). `GET /v1/incidents` (list/backfill) is now part of the contract surface and is covered by a contract test.

---

## ADR-0019: D5 stack delivered — ops-dashboard/app (Vite+React+Tailwind v4+MapLibre)
**Source:** ported from Team-Sonar-Vuka, original ADR-0012
**Status:** Accepted (2026-07-18)
**Context:** ADR-0018 deferred the D5 stack to P1, once there was a map and multiple operators to build a real UI around. We are now in the P1 window; the user asked for incident detail, a real map, and a risk heatmap with a load-shedding toggle to make the operator side pitch-ready.
**Decision:** `ops-dashboard/app/` is a Vite + React 19 + TypeScript app (Tailwind v4 via `@tailwindcss/vite`, no `tailwind.config.js` needed for this setup). It ports `app/web/vuka-client.js` to `src/lib/vukaClient.ts` against a local copy of `shared/contract.ts` (`src/lib/contract.ts` — kept byte-identical; the Vite dev server's `fs.allow` boundary is this app's own root, so a path alias into `shared/` was rejected in favour of a synced copy). Three panels: `Queue` (live incident list, same data as the old static page), `MapView` (MapLibre GL, markers colored by `SEV_COLOR`, click-to-select synced with the queue), `DetailPanel` (full incident + timeline + evidence + Guardian action buttons via WS, mirrors D10's "tamper-evident, not court-admissible" wording in the UI itself). No `/v1/risk` endpoint exists yet (`server/main.py` TODO), so the heatmap is `src/lib/simRisk.ts` — a deterministic client-side grid, explicitly labeled "SIMULATED" on the map overlay itself (CLAUDE.md §4 P8), with a load-shedding stage slider (0-4) that shifts cell scores to sell the context-prior story without inventing a calibrated number (P3).
**Consequences:** `ops-dashboard/index.html` renamed to `ops-dashboard/p0.html` (git history preserved via `git mv`) and now links to `./app/` and says so on its own face, same pattern ADR-0018 used. The old page is kept, not deleted — cheap fallback if the build tooling breaks mid-pitch. Bundle is ~1.2 MB unminified-gzip 337 kB, almost entirely MapLibre GL; not code-split, acceptable for a dashboard (no APK-size budget applies here, only the phone app has the 60 MB budget). Verified live against the real FastAPI server: WS incident.new/update/resolved all land in the queue and on the map in real time; PATCH-driven Resolve and the risk-stage slider both confirmed working in-browser.

---

## ADR-0020: Node-health + business view added to ops-dashboard/app (docs/01 §3, docs/05 UC-9)
**Source:** ported from Team-Sonar-Vuka, original ADR-0013
**Status:** Accepted (2026-07-18)
**Context:** docs/01 §3 and docs/05 UC-9 name node-health and a business view as ops-dashboard responsibilities, but ADR-0019 shipped only the queue/map/detail/risk-heatmap slice. UC-9 specifies node-health as "(sim/roadmap)" and business view as "recovery rate, claims impact".
**Decision:** Two new tab-switched panels alongside the existing Ops view (`Header.tsx` tab nav, `App.tsx` conditional render). **Node Health** (`components/NodeHealth.tsx` + `lib/simNodes.ts`) renders `sim_meshNodes()` — six deterministically-generated ISIPHEPHELO mesh nodes (battery, signal, status, last-heartbeat) — behind a visible "ROADMAP — SIMULATED" banner, since no solar LoRa hardware exists (CLAUDE.md §4 P8, docs/08 §7 risk register). **Business View** (`components/BusinessView.tsx` + `lib/businessMetrics.ts`) splits into two honesty tiers: `computeBusinessMetrics()` is real, live-computed from the actual incident set already in `App.tsx` state (total/active/resolved/recovery rate — no simulation needed, this is genuine data); `estimateIllustrativeClaimsImpact()` is a separately-labeled, explicitly-stated assumption (`ASSUMED_AVG_CLAIM_ZAR = R45,000`) multiplied by resolved-incident count, framed in the UI copy itself as "not real Discovery data" per the honesty ledger's "state assumption + range, don't invent precision" rule (docs/06 §6).
**Consequences:** All five docs/01 §3 ops-dashboard responsibilities are now delivered. `simNodes.ts` reuses the `hashStr`/deterministic-hash pattern established in `simRisk.ts` (extended to string keys) so node data is stable across re-renders. `simNodes.test.ts` and `businessMetrics.test.ts` added, 21 vitest tests passing app-wide. Verified live in-browser: tab switching, node list rendering with correct status badges, and business KPIs recomputing against live incident state all confirmed.

---

## ADR-0021: Sbu joins as second active builder — branch/PR workflow reactivated
**Source:** ported from Team-Sonar-Vuka, original ADR-0014
**Status:** Accepted (2026-07-19)
**Context:** ADR-0017 deferred the two-reviewer rule for `brain/`, `evidence/`, `server/incidents` and the contract "while a single builder is active" and said it "resumes the moment a second builder is available." Sbu is now actively building alongside Lethabo.
**Decision:** Two-reviewer rule is back on for the paths named above. Workflow: branch per person per thing (`lethabo/<thing>`, `sbu/<thing>`), push, open a PR into `main`, the other builder reviews before merge. No direct commits to `main`. Split of focus (fluid, not fixed, per ADR-0017): Lethabo continues UI/UX + Guardian-screen design work (currently iterating in Claude Design); Sbu takes the "serious backend" — fusion/statemachine accuracy and calibration, decision-confidence correctness, and the sensor→fusion→server logic/flow.
**Consequences:** CLAUDE.md §7 updated (division-of-labour table + new branch/PR workflow paragraph). Local `main` was 6 commits ahead of `origin/main` (never pushed, per earlier solo-builder instruction to keep work local) — pushing now needed so Sbu can pull; `lethabo/guardian-redesign` created as Lethabo's current working branch. Losing the informal solo-review gap trade-off (ADR-0017's "unit tests are the gate when no reviewer is available") goes away now that a real reviewer exists — PRs on `brain/`/`evidence/`/`server/incidents`/contract changes must wait for Sbu's (or Lethabo's) sign-off, not just green CI.

**Restoration note (2026-07-19, Sbu; updated 2026-07-20 on merge):** this entry's content was lost from `docs/adr.md` on `main` during the merge of PR #8 (`lethabo/guardian-scenario-ui`), which introduced an unrelated decision under the same "ADR-0021" number and out of chronological order. Restored here verbatim from commit `b947292`; the unrelated decision was first renumbered **ADR-0022**, but by the time this restoration merged, `main` had independently accepted a real, unrelated ADR-0022 ("Azure as primary cloud services provider for P2", commit `814cf58`) — so the Guardian UI decision is renumbered again, to **ADR-0023** below, with every code/doc reference to it updated accordingly. Per CLAUDE.md §9, history is never edited — this is a restoration of what merging should have preserved, not a new decision.

---

## ADR-0022: Azure as primary cloud services provider for P2
**Source:** ported from Team-Sonar-Vuka, original ADR-0015
**Status:** Accepted (2026-07-20)
**Context:** P2 (Sandton 48h, Aug 6–7) requires real STT for isiZulu/isiXhosa/Afrikaans, a managed Postgres instance for the phrase corpus and incidents, and a container host for the FastAPI server. Three providers were considered: AWS, GCP, Azure. Key constraints: (1) SA language coverage — zu-ZA, xh-ZA, af-ZA are first-class locales in Azure Speech Studio and available via REST/SDK without a preview waitlist; GCP and AWS either don't list them or put them behind a preview flag as of 2026-07. (2) Postgres at P2 is a direct migration of the in-memory store (docs/01 §6 ERD) — no exotic extensions needed, any managed Postgres works. (3) Container hosting must support zero-downtime redeploy during the 48h build window. (4) Team has existing Azure credits from the Discovery partnership exploration.
**Decision:** (a) **STT — Azure AI Speech** (`zu-ZA`, `xh-ZA`, `af-ZA`, `en-ZA`). Replaces `_SIM_PHRASES` in-memory matching at P2; the `POST /v1/incidents/{id}/cue` endpoint accepts `source: "azure_speech"` already (contract.ts `CueReq`). (b) **Database — Azure Database for PostgreSQL Flexible Server**. Schema in `server/src/db/schema.sql`; trigram GIN index on `phrases.phrase` ready for P2 query path. (c) **Container host — Azure Container Apps**. FastAPI image via `server/Dockerfile` (to be added at P2); scales to zero between pitches, restarts in < 10 s. (d) **No Azure services at P0/P1** — all three layers remain in-memory/localhost until the P2 sprint; this ADR records the P2 target only. Simulated components keep their `sim_` prefix and are explicitly labelled in demo mode (CLAUDE.md §4 P8).
**Consequences:** `server/src/db/schema.sql` and `seed_phrases.sql` (on `lethabo/phrases-schema-cloud`) are the migration artefacts. A `server/.env.example` entry for `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` must be added before the P2 sprint. The phrase-matching path (`_match_phrases`) must be wrapped in a feature-flag that falls back to the in-memory sim corpus when `AZURE_SPEECH_KEY` is unset, so P0/P1 demos still work on localhost without cloud credentials.

---

## ADR-0023: Guardian scenario UI + meta.scenario convention + contract drift fix
**Source:** ported from Team-Sonar-Vuka, original ADR-0016
**Status:** Accepted (2026-07-19) — merged as PR #8; originally drafted as "ADR-0021", renumbered to ADR-0022 on first restoration, renumbered again to ADR-0023 to resolve a second collision with the real ADR-0022 (Azure) — see ADR-0021's note above
**Context:** Three things discovered together while implementing the Claude Design "Discovery Safety Revamp" screens A+B in `app/web/guardian.html`:
1. **Scenario-gated Guardian response** (design brief §3): the design's core safety insight — a Guardian should never be routed to an active armed scene. The UI must gate "I'm on my way" behind a `safe` flag derived from the incident's scenario classification. No live classifier exists yet; the design prototype drove it from a manual `scenario` prop.
2. **`meta.scenario` convention**: the only current way to seed a scenario into an incident is through `meta` (the untyped `Record<string,unknown>` already on `CreateIncidentReq`). Today `app/web/user.html` lets the demo operator select it via a dropdown before firing the duress PIN — clearly labelled `sim_scenario` in the UI.
3. **`IncidentDetail` missing from `shared/contract.ts`**: `ops-dashboard/app/src/lib/contract.ts` (the Vite app's synced copy) had `IncidentDetail` defined and in production use since ADR-0019, but `shared/contract.ts` — the canonical frozen source — was missing it entirely despite that file's own header claiming byte-identical parity. This was silent drift; no test caught it.
**Decision:** (a) Guardian response block is scenario-gated: `SCENARIOS[meta.scenario].safe === false` → show "Do not go there yourself" + "Guide SAPS to her · 10111", suppress "I'm on my way" entirely. Absence of `meta.scenario` maps to `unknown` which is treated as **not safe** — unclassified is cautious, not safe, until real evidence says otherwise. (b) `meta.scenario` stays an untyped convention (not a new typed field) until a real classifier feeds the contract — adding a typed field would imply the server validates and produces it, which it doesn't yet. A typed `IncidentScenario` enum should be added to the contract when the cue-word/audio classifier (design brief §5) lands and starts setting it server-side. (c) `IncidentDetail` synced back into `shared/contract.ts` with a comment flagging the `meta.scenario` convention. (d) `guardian.action: "freeze"` stays in the wire contract (`ClientToServer`) — `DetailPanel.tsx` and the Ops console can send it. It is **removed from the Guardian mobile UI** (`guardian.html`) which now explicitly states "Only her duress PIN or Discovery Ops can freeze the account — Guardians can't" (design brief §9, confirmed by the Claude Design prototype's own footer note).
**Consequences:** Guardian screen correctly routes safe vs dangerous scenarios end-to-end in the demo. `shared/contract.ts` is now the single source of truth for `IncidentDetail` as the file claims. The `meta.scenario` convention must be documented in `docs/01 §5` (open item for Sbu review). **Sbu's nitpick review (answered in PR #8, all three; see docs/DESIGN-BRIEF-guardian-response-and-incident-intelligence.md §12 for the fuller reasoning):** (1) untyped `meta.scenario` is right for now — a typed field with nothing validating/producing it server-side would overstate what's enforced. (2) The `getIncident` race is real and visible; needs a pending/loading state. (3) UI-level `freeze` suppression alone is not enforcement — it must pair with a server-side gate. That gate already exists and is merged (`server/main.py`'s `/ws` handler rejects `guardian.action: "freeze"` unless the connection authenticated at connect-time with `role=ops`); it didn't need its own ADR since it enforces this decision's intent without touching the frozen contract.

---

## ADR-0024: "Discovery Safety Revamp" design handoff — ported into existing repo, not a new stack
**Source:** ported from Team-Sonar-Vuka, original ADR-0017
**Status:** Accepted (2026-07-21)
**Context:** A second Claude Design/Lovable handoff bundle (`design_handoff_guardian_safety/`) arrived with an `IMPLEMENTATION_PLAN.md` whose header explicitly targets a different, non-existent-in-this-repo codebase: `safe-haven-hub-main` on **TanStack Start + React 19 + Tailwind 4 + shadcn/Radix + TanStack Router + React Query**. A full-machine search found no such project locally — it's a separate Lovable-generated scaffold, not part of this repo. Meanwhile its scenario taxonomy (`stranded`/`gbv`/`hijack`/`shooting`, `safe`-flag-gated Guardian response) is near-identical to what ADR-0023 already shipped in `app/web/guardian.html`, and its Ops Console / Live Feed redesign targets `ops-dashboard/`, which already exists here as Vite + React 19 + Tailwind 4 + MapLibre (ADR-0019) — close to, but not the same as, the plan's assumed stack (no router, no shadcn/Radix, no React Query yet).
**Decision:** Do not adopt TanStack Start/Router or spin up a second project inside this repo — that would fragment the demo (two guardian implementations, two design systems) days before the P0 gate (Jul 23) and isn't a locked-decision change worth an architecture fork this close to the deadline. Instead, port what Phase 1 ("Foundation") actually delivers into the existing trees: (a) the design's OKLCH token set as CSS custom properties in `ops-dashboard/app/src/index.css`, for future Ops screens to consume; (b) the scenario-engine's naive-Bayes fusion (evidence vector → per-scenario log-odds → softmax) verbatim-ported from the `.dc.html` prototype (`scenCfg`/`W`/`priors`/`evidence`, lines ~1809-1886) into `ops-dashboard/app/src/lib/scenarioEngine.ts`, with unit tests; (c) three shared display primitives (`SeverityBadge`, `MonoLabel`, `ElapsedTimer`) in `ops-dashboard/app/src/components/`, matching this repo's existing flat `components/`/`lib/` convention (not the plan's nested `member/guardian/ops/shared` tree, which presumes routing this repo doesn't have). No new dependencies added (no shadcn, Radix, React Query, react-leaflet) — existing Tailwind + MapLibre stack is kept. Route scaffolding, the Member App, and the Guardian App rebuild are descoped from this port entirely: Guardian's scenario-gated response already ships via ADR-0023 in `app/web/guardian.html`, and a from-scratch Member App is P2+ (React Native, ADR-0010) work, not something to duplicate in a browser prototype two days before P0.
**Consequences:** `scenarioEngine.ts`'s softmax output ("87% hijack") is a demo scoring function over a hand-set evidence vector, **not** a calibrated posterior — per the honesty ledger (D3/D11, `docs/06 §6`) and the precedent already set in `ops-dashboard/app/src/lib/threatDisplay.ts`, it must never be surfaced as a real probability; any UI that consumes it labels it provisional/demo, same as `sim_` prefixed modules elsewhere. If a real TanStack Start `safe-haven-hub-main` project turns out to be a project the user wants pursued in parallel, that's a separate repo/initiative outside `CLAUDE.md`'s scope, not an amendment to this build.

---

## ADR-0025: Second, larger "Discovery Safety Revamp" bundle — extend ADR-0024's port scope, reject its Dempster-Shafer copy and unbacked "score breakdown" UI
**Source:** ported from Team-Sonar-Vuka, original ADR-0018
**Status:** Accepted (2026-07-21)
**Context:** A newer, much larger handoff (`Lovable redesign with discovery vibe.zip`, `design_handoff_guardian_safety/`, `.dc.html` at 236,934 bytes vs the ~46KB one ADR-0024 ported from) arrived with the same `IMPLEMENTATION_PLAN.md` shape but far more surface: full Member App, richer Guardian screens, an Incident Console `ThreatGauge` + `ScoreBreakdown` ("Why 'Possible hijack · 87%'" — label, ±points, reason, bar; "EXPLAINABLE" badge), and still targets the same non-existent `safe-haven-hub-main` (TanStack Start) stack. Two honesty problems found on read: (1) `Discovery Safety Revamp.dc.html:1316` labels the gauge **"Dempster-Shafer · 5-signal fusion"** verbatim — the exact framing ADR-0012/D6 rejected by name for this project. (2) The prototype's `ScoreBreakdown` fabricates per-signal point contributions (e.g. "+34 raised voice", "-12 stationary") for its explainability badge; `server/scenario_posterior.py` / `server/main.py`'s real `/v1/incidents/{id}/fusion` endpoint (the only live, non-simulated scoring path) exposes `threatScore` (a real fused float, `_fuse_evidence`) and `scenarioPosterior`/`scenarioLabel`, but **no per-signal breakdown at all** — there is nothing honest to render in a "+34/-12" style panel without inventing numbers, which D3 forbids outright.
**Decision:** Extend ADR-0024's precedent rather than reopen it: still no TanStack Start/Router, no new project, no shadcn/Radix/React Query — port visual/UX ideas into the existing `ops-dashboard/app/` and `app/web/`. Concretely for this slice: (a) add a `ThreatGauge` component to `ops-dashboard/app/src/components/` — the prototype's conic-ring visual treatment, but wired to the **real** `/v1/incidents/{id}/fusion` `threatScore` (already a genuine logistic-fused float, not a demo number), never `scenarioEngine.ts`'s softmax. (b) Do **not** port `ScoreBreakdown`/the "+points per reason" explainability list — there is no real per-signal data behind it; building it would mean fabricating precision the server doesn't have, which is exactly what D3/D11 exist to prevent. If per-signal attribution becomes real (P2, `docs/03`'s calibrated log-odds fusion with named modality weights), a breakdown UI can be built then, from real weights. (c) Any copy ported from this bundle that says "Dempster-Shafer" is corrected to the project's real framing ("log-odds fusion" / `scenarioLabel`'s own wording) before it reaches any screen — no exceptions, this is the same rule ADR-0012 already locked. (d) Member App, TanStack routes, recharts, react-leaflet, and the full Live Feed triage rebuild stay descoped for the same P0-timeline reason ADR-0024 gave.
**Consequences:** `ThreatGauge` becomes the first UI element in this port that shows a genuinely calibrated-in-spirit number (real fused score) using the new bundle's visual language, alongside `ScenarioModelPanel`'s existing real posterior bars — both now honest by construction. The prototype's most visually impressive panel (`ScoreBreakdown`) is deliberately left unbuilt rather than built dishonestly; this is logged here so a future session doesn't "finish the port" by adding it without re-deriving why it was skipped.

---

## ADR-0026: ADR numbering collision resolved — BEACON 0001–0007 kept, Team-Sonar-Vuka renumbered 0008–0025
**Status:** Accepted (2026-09-12)
**Context:** Porting the 25 architecture decisions from two predecessor repositories (BEACON, 7 ADRs; Team-Sonar-Vuka, 18 ADRs) into this clean repository surfaced that both series independently number from 0001 and collide on meaning — BEACON's ADR-0002 is the human-verification gate; Team-Sonar-Vuka's ADR-0002 is the choice of LiteRT/TFLite as the on-device runtime. Every existing document in this repository (`docs/00-SPEC.md`, `docs/01-ARCHITECTURE.md`, `docs/AI-AUTONOMY.md`, `docs/ANCHOR-RATIONALE.md`, `docs/ANCHOR-RATIONALE-ADDENDUM.md`, `docs/SDLC.md`, `docs/TECH-STACK.md`, `docs/USER-JOURNEY.md`, `docs/PLAIN-WORDS.md`) cites ADR numbers using the BEACON series (ADR-0002 = human gate, ADR-0005 = Dempster-Shafer rejected, ADR-0006 = face embeddings/POPIA, ADR-0007 = plate-text local recognition). Separately, `CLAUDE.md` §12 (written before this port) reserved ADR-0020 through ADR-0025 for six decisions not yet recorded as ADRs: naming (VUKA/VIGIL/UMOJA/KHAYA/ANCHOR), the public-anchor choice, two-of-two signatures, deletion semantics, the autonomy boundary, and the TRL statement. That range is now occupied by ported Team-Sonar-Vuka decisions.
**Decision:** BEACON's ADR-0001–0007 keep their original numbers unchanged — renumbering them would break every citation in this repository's existing documentation. Team-Sonar-Vuka's ADR-0001–0018 are renumbered ADR-0008–0025 on port, in original chronological order, with every internal cross-reference between them rewritten to match (for example, the original ADR-0009's "ADR-0003 is not superseded" becomes ADR-0016's "ADR-0010 is not superseded"). No ADR's substantive text was altered by the renumbering. `docs/adr.md` opens with a provenance table mapping every new ID to its source repository, original ID, title and date. `CLAUDE.md` §12's ADR-0020–0025 plan is superseded by this renumbering; the six decisions it named should be written up as new ADRs starting at ADR-0027 onward, once each is actually made or reconfirmed for this repository, rather than reusing numbers this renumbering has taken.
**Consequences:** All 25 ported ADRs are traceable to source and date via the provenance table; no citation in any existing repository document needed to change, because every one already used the BEACON numbering. New architecture decisions made from this point in this repository start at **ADR-0027**. Per the standing rule, this file is append-only — an ADR is never edited, only superseded by a later one.

---

## ADR-0027: Technology Readiness Level settled at 4, with two subsystems argued at 5 and the ceiling named
**Status:** Accepted (2026-09-15)
**Context:** The repository carried three contradictory TRL positions. `docs/00-SPEC.md` §6 stated "Assessed TRL: 5" with an evidence table. `docs/01-ARCHITECTURE.md` §11.1 stated "We state TRL 5" and cited "ADR-0025" for it — a stale citation: the port renumbering gave ADR-0025 to Team-Sonar-Vuka's Discovery Safety Revamp bundle (ADR-0026), and no ported ADR records a TRL position at all. `docs/EVIDENCE.md` stated "TRL 4 is the target… Do not publish TRL 5 as locally verified." The submission template requests TRL 3, and a question logged for the mentors (ceiling or floor) remains unanswered. Verified definitions (per `docs/PLAN.md` §A2): TRL 3 proof-of-concept · TRL 4 technology validated in a laboratory · TRL 5 component validated in a relevant environment · TRL 6 demonstrated in a relevant environment · TRL 7 operational environment. All system-level verification evidence is historical: it was produced in the predecessor repositories (`BEACON`, `Team-Sonar---Vuka-`, both private, lineage preserved) and has not been reproduced in this clean repository, which holds specification, contracts, tests and coordination, not yet application code.
**Decision:** **System TRL is 4** — validated in a laboratory environment, in the predecessor codebase, running end to end on real hardware with a measured latency path (318 ms p95, n = 10, budget 2 000 ms — `FACT`, historical, not reproduced here) and a contract-tested interface. **Two subsystems are argued at 5**, not verified at 5: (a) the append-only evidence chain with public anchoring — its relevant environment is the public internet with an independent verifier, demonstrated in the predecessor over a public tunnel (ADR-0015 ported); (b) the on-device sensing path — the acoustic model ships in an predecessor Android app build (`yamnet.tflite`, sha256 `10c95ea3…c317de`, verified identical in both predecessors, 15 Sep 2026) and runs on the target device class, CPU, offline. Both subsystem arguments are `ARGUED` until the port reproduces them here. **Four reasons we are not at 6** (published, unchanged from `docs/01-ARCHITECTURE.md` §11.1): appliance hardware not fabricated (G10); fusion weights not fitted on real data (G1); no independent penetration test (G8); bias evaluation not run (G9). The ceiling is named: G10 — the appliance is specified and costed, not built, and no fabricated-hardware demonstration in a relevant environment exists. Consumer-facing copy states "TRL 4, met and verified" with "in the predecessor codebase" attached; internal records carry the reproduction caveat. Supersedes the TRL-5 positions carried in `docs/00-SPEC.md` §6 and `docs/01-ARCHITECTURE.md` §11.1, which are swept in the same change; no ADR previously recorded a TRL position in this repository, so nothing ADR-numbered is superseded.
**Consequences:** One TRL position exists in the repository; `grep -rn "TRL"` resolves to 4 + the two subsystem arguments + the four reasons not at 6 + this ADR. Claiming 4 rather than 5 at a room that asked teams to build to 4 is the honest read of the template, and publishing four specific reasons not at 6 is stronger evidence of readiness than a bare higher number. The claim is debt-backed: reproduction in this repository (WBS Task 4 port; Khutso's evidence reproduction, 3.5, due 19 Sep) must re-establish the latency, test and evidence-chain results before any local-verification wording is used; until then all TRL evidence keeps its historical tag. If the mentors answer that the template's TRL 3 is a floor, nothing changes; if it is a ceiling, this ADR is the record of exceeding it with evidence. A later ADR is required to move the number; this one names the four gates that must close first.

## ADR-0028: No self-hosted OpenTimestamps calendar — multi-calendar submission + scheduled `ots upgrade` instead
**Status:** Accepted (2026-09-15)
**Owner:** Sibusiso Khumalo (`docs/CHECKLIST.md` P2.15)
**Context:** `docs/ANCHOR-RATIONALE.md`'s third rehearsed attack anticipates a judge pointing out that OpenTimestamps — the project's primary anchor chain (`docs/00-SPEC.md` §4, "Chain") — depends on two or three volunteer, donation-funded calendar servers, at least one of which has been documented as slow under load. The rehearsed answer as drafted (14 Sep) was: *"self-host a calendar, and run `ots upgrade` promptly... do not claim the mitigation unless it is built."* That framing conflates two different things. **Running a calendar server** means operating aggregation infrastructure that other OpenTimestamps clients would also depend on — a standing public service with its own uptime commitment, not something this team can stand up and trust-build before a hackathon demo. **Running `ots upgrade`** is an ordinary client-side operation: once a submitted timestamp's calendar has aggregated it into a confirmed Bitcoin transaction, `ots upgrade` fetches the Merkle path and embeds it locally, after which the timestamp is **fully self-verifying against the Bitcoin blockchain alone — the calendar is no longer needed for verification at all.** `anchor/` is genuinely new work not yet started (`docs/HANDOVER.md` Task 5; `anchor/README.md` is still a file list, no code), so this decision is made before any calendar dependency actually exists in the codebase.
**Decision:** (a) **No self-hosted calendar server.** It solves a problem the team doesn't have — submission-time and verification-time calendar dependency — more expensively than the alternative below, and it is not on the critical path to any showcase (`SC.1`, `SC.3`). (b) **Submit every hourly root to multiple public OpenTimestamps calendars** (the OTS client's default already does this — `anchor/publish.py` must confirm and, if needed, explicitly configure the calendar list rather than assume the default). (c) **`anchor/publish.py` schedules a prompt, periodic `ots upgrade` pass** — checked alongside the next hourly anchor cycle — so every root becomes a complete, self-verifying proof as soon as its Bitcoin confirmation lands (typically within a few blocks), not left pending indefinitely. (d) `docs/ANCHOR-RATIONALE.md`'s attack-3 answer is corrected to state (b) and (c) as the actual mitigation, dropping the "self-host a calendar" framing entirely — it was never the load-bearing part of the answer.
**Consequences:** The honest answer to attack 3 no longer depends on infrastructure nobody has committed to building or operating. It depends only on (b) and (c), which are ordinary `anchor/publish.py` logic to be built as part of Task 5 — no separate infra decision, hosting cost, or uptime commitment required. If Task 5 has not landed by demo day, the honest fallback (per the honesty ledger, `RULES.md`) is to state plainly which roots are complete/self-verifying and which are still pending calendar aggregation — never to claim the upgrade mitigation is live if `ots upgrade` has not actually run. This ADR does not authorise skipping multi-calendar submission or the upgrade schedule when `anchor/publish.py` is written — both are now the frozen design for that file, changeable only by both leads plus a superseding ADR, per `docs/OVERLAPS.md`.

## ADR-0029: One fusion and one entity-resolution implementation — the server consumes `brain/`, never a second copy
**Status:** Accepted (2026-09-15)
**Context:** The predecessor repository (`BEACON`) carried **two divergent fusion implementations** and **two copies of the plate-matching logic**, and the divergence was invisible to any single test. Evidence, from the read-only predecessor checkout (`git grep`, 15 Sep 2026): `brain/fusion.py` used calibrated log-odds (F1 log-odds `2.2`, threshold `2.0`) and the state name `watch_candidate` — but it was imported **only by its own tests**; nothing in `server/` called it. The server instead used `server/src/suspicion/scorer.py`, which used **additive weights** (F1 `0.40`, threshold `0.40`) and the state name **`candidate`** — and that file was imported by `server/src/api/sightings.py`, `server/src/api/entities.py` and `server/scripts/demo_reset.py`. The server database default carried the comment `# observed, candidate, flagged` (`server/src/db/models.py:52`), and every server contract test asserted `"candidate"`. Separately, `server/src/suspicion/entity_resolution.py` opened with the comment *"ported from brain/entity_resolution.py"* — a second copy of the confusion-aware plate matcher. The consequence: the same sighting could compute one score on the on-device path (`brain/`) and a different score, with a different state name, on the server path (`scorer.py`). This repository's `brain/README.md` already states the requirement that this drift violates: VIGIL (on-device) and UMOJA (server) *"need the identical fusion math to agree… one golden fixture is the referee for both."* The frozen contract (`contracts/openapi.yaml`, `contracts/events.schema.json`) uses `watch_candidate`; it never uses `candidate`. `FACT`
**Decision:** (a) **`brain/fusion.py` is the single source of fusion math.** The server imports it and calls `recompute()`; there is no server-side scorer. `server/src/suspicion/scorer.py` is **not ported**. (b) **`brain/entity_resolution.py` is the single source of plate matching.** `server/src/suspicion/entity_resolution.py` is **not ported** — the server imports the `brain/` module. (c) **The state vocabulary is the frozen contract's:** `observed`, `watch_candidate`, `flagged`, `dismissed`, `whitelisted`. The string `candidate` is not a valid state anywhere — not in code, the database, the API, the tests, or the docs. (d) **F2–F5 are implemented inside `brain/fusion.py`'s calibrated log-odds model** with weights self-labelled `PROVISIONAL — NOT fit on real data` (G1, `docs/OPEN-GAPS.md`), not adopted from `scorer.py`'s additive model. The predecessor's F2–F5 *logic* is a reference for the rewrite; its *model and weights* are not. (e) **The server translates database rows into `brain` `Entity` objects, calls `recompute()`, and persists the returned state.** No fusion arithmetic lives in `server/`. (f) A **golden fixture** shared by `brain/` and `app/src/brain/fusion/` remains the referee (per `brain/README.md`).
**Consequences:** The predecessor drift cannot recur — one module, one fixture, one state vocabulary, so on-device and server results agree by construction rather than by coincidence. The port of `server/` (Task 4) is **more than a file copy**: `scorer.py` and the server's duplicate `entity_resolution.py` are deliberately not ported, and the server scoring path is rewritten to delegate to `brain/`. Any ported server test that asserts state `"candidate"` is corrective work, not a passing test, and must be rewritten against the frozen vocabulary. F2–F5 remain open (`G4` · Calibrate, 23 Sep) — this ADR fixes where they are implemented, not that they are calibrated. A later decision to fuse a non-corroborating factor or to add a fourth runtime must come through this ADR's rule: the math goes in `brain/`, never in a second implementation.

---

## ADR-0030: `Sighting` in the contract is the domain event, not the transport envelope — resolves D3, decides D2
**Status:** Accepted (2026-09-15)
**Owner:** Sibusiso Khumalo (contract owner) — accepting Lethabo's D3 recommendation (`docs/PORT-DIVERGENCES.md`)
**Context:** `contracts/openapi.yaml`'s schema named `Sighting` was the bare 7-field wire envelope (`version`, `event_id`, `tenant`, `source_time`, `received_time`, `sim_`, `freshness`, `additionalProperties: false`) — no domain fields. This was wrong on two independent counts, both `FACT`, verified against this repository's own files: (1) `brain/fusion.py`'s `factor_f1_recurrence` reads `s["camera_id"]` from each sighting — the contract's `Sighting` cannot carry what fusion consumes, so `POST /v1/sightings` could not accept a sighting the fusion could use. (2) `docs/01-ARCHITECTURE.md:1431,2581` already defines `Sighting` as *"one detection event: (entity, camera, hex, ts, modality, confidence)"* — the domain object, not the envelope. The contract's own naming contradicted this repository's own architecture document, not just the predecessor. Separately, `docs/PORT-DIVERGENCES.md` D2 found the contract's `IntegrityResult.first_broken_index` has no documented index base, while the predecessor's equivalent (`broken_at_seq`) enumerates from 1.
**Decision — D3:** `contracts/openapi.yaml`'s schemas renamed and restructured: (a) **`EventEnvelope`** — the original 7-field shape, unchanged in content, renamed from `Sighting`. Stays generic and reusable across future event types, not just sightings — this is why it does not gain a `payload` field itself. (b) **`Sighting`** — new schema, the domain payload per `docs/01-ARCHITECTURE.md` §2581: required `camera_id`, `hex_id`, `ts`, `modality`, `confidence`; optional `entity_id`, `kind`, `bbox`, `plate_text`, `plate_quality`, `embedding_ref` (predecessor's field set, `BEACON/server/src/api/sightings.py`). (c) **`SightingEvent`** — `allOf: [EventEnvelope, { payload: Sighting }]`, composing the two. `POST /v1/sightings`'s request body now references `SightingEvent` (or an array of it), not the old `Sighting`. This is Lethabo's proposal in `docs/PORT-DIVERGENCES.md` D3, accepted as written — considered and correctly rejected the two alternatives he named: cramming domain fields into the envelope (collapses transport/domain, breaks `sim_`/`freshness`'s generic meaning across event types) and reshaping the payload down to the envelope's 7 fields (drops the fields fusion needs, equivalent to deleting the sighting). **`contracts/events.schema.json` needed no change** — it was already titled "VUKA event envelope" and never claimed to be `Sighting`; the naming collision existed only in `openapi.yaml`.
**Decision — D2:** `first_broken_index` is **0-based**, matching the schema's existing `minimum: 0` (the predecessor's 1-based `broken_at_seq` does not set the contract's convention). Documented directly on `IntegrityResult` in the contract. The field-name mapping (`broken_at_seq` → `first_broken_index`, dropping `total_events`/`broken_at_id` which `additionalProperties: false` forbids) remains a port-time task — no server-side evidence-integrity endpoint exists in this repository yet to apply it to.
**Consequences:** `server/`'s eventual `POST /v1/sightings` handler can accept a sighting the fusion can actually run against — the contract no longer forces a choice between being usable and being frozen. `test/openapi-contract.test.mjs` gains a test asserting the corrected shape (`EventEnvelope`/`Sighting`/`SightingEvent` all present, `Sighting` carries `camera_id`, `POST /v1/sightings` references `SightingEvent`). `docs/PORT-DIVERGENCES.md` D2 and D3 marked resolved. This does not itself unblock `P2.16`'s "frozen" status — that still needs Lethabo's sign-off per `docs/OVERLAPS.md`, since he is the other party to any frozen-contract change; this ADR is the proposal his D3 finding asked for, not a unilateral freeze.

---

## ADR-0031: Discard-by-default is the architecture's answer to the POPIA s27 gap
**Status:** Proposed (2026-09-16) — binds only on both-lead acceptance; implementation acceptance test in flight (Sibusiso, PR #32)
**Owner:** Ipeleng Constance Modise (security/legal owner) — adopting Sibusiso Khumalo's proposed boundary (`docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md`)
**Context:** `docs/CHECKLIST.md` `P2.2` asked whether any POPIA lawful basis exists for transient face-embedding comparison of non-consenting passers-by, and whether discard-by-default removes the problem. `docs/POPIA-POSITION.md` (same PR) answers with verbatim statutory text — a first for this repo, quoted from a full-text copy of the Act as enacted (Accessible Law's `popia.co.za` reformatting; SAFLII 403, gov.za Act PDF encrypted; all quotes ⚑ pending counsel verification against the Gazette, paper §10): s11(1) grants a legitimate-interest ground for ordinary personal information (s11(1)(f)); **s27(1) grants none for special personal information** — its six grounds are consent; necessity for a right/obligation in law; international public law; historical/statistical/research (public interest + consent-impossibility safeguards); deliberately made public; and the ss28–33 authorisations. Walked against a non-consenting passer-by at a gate running UMOJA, grounds (a)–(e) fit none of the scenarios: no consent, no litigation against the passer-by, no public-interest research purpose, no deliberate publication, no applicable ss28–33 limb except **s33(1)** — which conditions biometric processing on the information being "obtained ... in accordance with the law", a limb that is either an independent ground (lawfully-operated gate cameras) or circular (lawful *processing* presupposes the ground being sought). The paper refuses to build on the optimistic reading and routes it to counsel (Q2). A face embedding is biometric information of the person it can single out regardless of storage format, so "vectors not images" is a minimisation technique, not a lawful basis (`docs/PLAN.md` §C2, now quoted rather than asserted).
**Decision:** (1) **Discard-by-default of any embedding that does not match an enrolled, consenting resident** — the four-step boundary in `docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md` verbatim: transient sensor result received in memory; comparison only against the consented enrolment set for the stated tenant and purpose; retention of a match result and its consent reference only on a valid match; immediate discard of every non-match with no persisted embedding, raw image or recoverable derivative. (2) **This is an architecture constraint, not a configuration** — the persistence boundary cannot be opted out of by a setting; any future exception requires a fresh ADR, Information Officer and privacy review, and the s57 prior-authorisation analysis (`docs/POPIA-S57-DECISION-RECORD.md`, still open). (3) **Person-versus-animal classification is not special-PI processing** — it does not identify a natural person and may run freely; s26 is engaged the moment a pipeline extracts a matchable human face embedding. (4) **Consent enrolment is the sole lawful basis for retained match data** (s27(1) ground (a)): what survives the comparison is a decision anchored to a consent reference, never the biometrics of anyone who did not consent.
**Consequences:** `P2.3` (Sibusiso) must produce the acceptance test — a non-match leaves no embedding across the persistence boundary, with a consented-match test and a biometric-free audit record; until then the boundary is specified, not running. `docs/01-ARCHITECTURE.md`'s §9.2 "vectors not images" compliance claim is superseded by this ADR and `docs/POPIA-POSITION.md` — Lethabo to re-point it at the next architecture sweep (deliberately not edited in the same pass). The partner contract's data clause (PSiRA paper §6, clause 3) must name the same provider of record and extend the discard rule to the partner's side. Counsel questions Q1–Q5 in `docs/POPIA-POSITION.md` govern; the pilot face gate stays blocked at G-gate until Q1–Q2 are answered. This ADR is not legal advice and creates no compliance claim — the honesty ledger applies.

---

## ADR-0032: The recorded direction of travel of the draft Code of Conduct for Gated Access Areas is our proposed internal design floor
**Status:** Proposed (2026-09-16) — binds only on both-lead acceptance
**Owner:** Ipeleng Constance Modise (security/legal owner) — from `docs/GATED-ACCESS-CODE-REVIEW.md` (P2.6)
**Context:** `docs/CHECKLIST.md` `P2.6` / `docs/OPEN-GAPS.md` G21 record team research that the Information Regulator published a draft Code of Conduct for Gated Access Areas on 30 Apr 2026 (comments closed 14 May 2026) covering CCTV, ID/biometric scanning and facial recognition at gated premises, applying to owners **and their technology service providers**, with a direction of travel of 7–30 day retention with auto-overwrite, minimisation, and FRT singled out for extra justification. Estates are the named launch channel (`docs/PLAN.md` §C3: "build to it now; submit comment when it reopens"). `docs/POPIA-POSITION.md` §9 already recorded the consequence: the draft's bound is stricter than discard-on-non-match because it bounds retention of *matches* too. **Verification finding of the P2.6 session:** the draft could not be found in any reachable source — the Regulator's site search returns zero results for "Gated Access Areas" and "access control", its codes-of-conduct page lists no 2026 entries (nearest artefact: the Residential Communities Council proposed code, received 08 Sep 2023 under the s61(1)(b) route), a web search for the exact title returns nothing, and the Gazette is unreachable from this environment. Every characterisation of the draft is therefore ⚑ and unverified; the verified statutory machinery (s60 scope levers and automated-decision measures; s61 Gazette process, ≤13 weeks; s73(1)(c) making breach of an issued code "interference") confirms a *draft* binds nobody today.
**Decision:** (1) The recorded direction of travel is adopted as the **internal design floor** — an ADR *Proposed* until both leads accept it: **gate-domain retained data** — defined here as personal information collected for operating the gated-access function itself (gate-adjacent camera footage, ID/biometric scans, embeddings with no linked incident, access-event records), *not* case-linked evidence created after a reported incident, which stays governed by the §6.5 case-linked rows — is kept **no longer than 30 days with auto-overwrite**. **The 30-day figure is a team-chosen conservative internal default, not an independently compelled legal bound**: the recorded draft (7–30 days, ⚑ unverified) could not be obtained, and s14 requires retention no longer than necessary without fixing any number. Reconciliation of the longer retention classes: the §6.5 rows that exceed the bound — case-linked embeddings (case lifetime + 90 days) and sightings (12 months) — remain named, reviewable parameters pending counsel Q2 in `docs/GATED-ACCESS-CODE-REVIEW.md` (does the code's scope reach detection/decision records, or only gate capture?); if Q2 puts them in scope they are reduced to the floor or justified by a fresh ADR before any G-gate opens; if not, they stand unchanged. (2) Discard-by-default (ADR-0031) stands unchanged beneath this floor. (3) A written **FRT justification dossier** — why facial recognition, why not a less-intrusive mechanism, demographic-differential exposure — is required before any pilot face gate unblocks at G-gate. (4) The **final issued text supersedes this floor**; any divergence re-opens the decision via a fresh ADR, never a configuration change. (5) The partner contract's data clause (PSiRA paper §6 clause 3) carries both the discard rule and this retention floor to the provider-of-record's side. **Why the direction is safe under either outcome:** if the draft exists as recorded, the team is ahead of the rule for its exact launch channel; if it does not, nothing is loosened — each element has a separate anchor: s14 (retention no longer than necessary, though it fixes no number), the discard direction of ADR-0031 (itself *Proposed* pending both leads), ADR-0002 (accepted) and the honesty ledger. What is deliberately **not** claimed: that the 30-day bound, the gate-domain scope, or the exception list are compelled by law — they are internal choices recorded for review and become binding only on both-lead acceptance. Building to the stricter bound cannot put the architecture on the wrong side of the final rule; building to the looser status quo could.
**Consequences:** G3's retention-TTL implementation (`docs/01-ARCHITECTURE.md` §6.5, open as E8/G3) must encode the proposed 30-day auto-overwrite bound for gate-domain data classes once this ADR is accepted, and make each retention value a named parameter — the G3 gate now carries this floor plus ADR-0031's discard boundary. Retrieval of the Gazette notice and draft text is counsel question Q1 in `docs/GATED-ACCESS-CODE-REVIEW.md`; until it is answered, no statement in this repository may assert the draft's contents as fact — the ⚑ convention governs. Comment submission when the window reopens is logged against G21. This ADR is an internal design decision, not legal advice, and creates no compliance claim — the honesty ledger applies.


---

## ADR-0034: VUKA is VIGIL + ANCHOR — KHAYA and UMOJA are parked, the entity state machine retires with UMOJA
**Status:** Accepted (2026-09-23) by Sibusiso as second lead, on PR #43 at `3855a3d` (record: `docs/ADR-ACCEPTANCE-RECORD.md`). Previously: Proposed (2026-09-23) — decided by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde; binds on Sibusiso's second-lead acceptance in the PR that adds it
**Owner:** Lethabo Hoaeane
**Context:** The four-layer design (VIGIL, UMOJA, KHAYA, ANCHOR) could not be built, measured and deployed by the 27 Sep submission. KHAYA needs fabricated hardware (G10). UMOJA needs camera fleets, face embeddings of non-consenting passers-by (POPIA s27, G20), a monitoring service PSiRA regulates (G19), and a forecast that loses to a constant baseline (G2). The published judging criteria reward work that is usable tomorrow (Usability & Design 10, Technical Implementation 15) and a sound business case (15). The organisers warned about AI overuse and solutions detached from reality. The coerced-transfer problem — the victim performs the transaction and the bank's record says she authorised it — needs only the person layer and the record layer. Also found on 23 Sep: `anchor/README.md` and the `anchor/chain.py` docstring (PR #39) state `json.dumps(entry, sort_keys=True)` with default separators, while the implementation (`anchor/chain.py:65`) hashes compact separators; PR #39 also uses `prev_hash = null` at genesis and accepts floats. `contracts/openapi.yaml` does not state the formula.
**Decision:** (1) VUKA is **VIGIL** (Android duress detection during a user-started journey, discreet check-in, guardian alerts) plus **ANCHOR** (per-person signed hash chains, public anchoring, stranger-verifiable export). (2) **KHAYA and UMOJA are parked** as a later product — documents and code stay as lineage, marked parked, not deleted. (3) The **entity state machine** (`observed → watch_candidate → flagged/dismissed/whitelisted`) and `server/src/auth/governance.py`'s human gate retire with UMOJA; their tests stay green and untouched. (4) The principle survives in a new form: **machines notice, people decide** — no consequence for a person (a bank hold, an alert outcome, a claim) is decided by a model. (5) The specification is `docs/VUKA-2-SPEC.md`. (6) **Canonical form fixed** as the implementation already hashes it — `json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)` — with no floats in hashed objects and a 64-zero genesis `prev_hash` (entry format v2, VUKA-2-SPEC §4–§5). The stale docstring and `anchor/README.md` are corrected; contract v2 states the formula for the first time; format-v1 entries (PR #39) are verified by a legacy path and never produced again. (7) **Superseded or parked by this ADR, each kept in the log as history:** ADR-0002's entity state machine and human gate (parked with UMOJA; its code and tests stay green), ADR-0029 (single fusion source — parked with UMOJA; `brain/` stays), ADR-0030's `Sighting`/`SightingEvent` surface (parked; its paths are deprecated in contract v2), ADR-0031 (discard-by-default embeddings — parked: VIGIL + ANCHOR processes no faces or embeddings), and the gate-domain retention floor of ADR-0032 (parked with KHAYA/UMOJA; ADR-0032's principle that retention is a named, minimal parameter carries into VUKA-2-SPEC §13). **Rejected alternatives:** keep four layers and cut depth everywhere (nothing would work end to end); keep UMOJA without faces (still PSiRA monitoring, still no buyer); drop ANCHOR and ship VIGIL alone (loses the track and the precedence argument).
**Consequences:** Contract v2 (Sibusiso) replaces the UMOJA surface; v1 paths are marked deprecated. The showcase becomes "your own duress record, verified by a stranger" (the Musa fixture retires). G1, G2, G4, G9, G10, G19, G20, G21 and G23 are parked with their layers; new gaps G24–G30 are opened. Vukosi moves to VIGIL sensing and measurement, reporting to Lethabo. The 318 ms p95 (n = 10) historical figure measured the retired relay and is never quoted for VIGIL.

---

## ADR-0035: Hedera Consensus Service is the primary anchor, every check-in outcome is anchored immediately, OpenTimestamps is the second anchor
**Status:** Accepted (2026-09-23) by Sibusiso as second lead, on PR #43 at `3855a3d` (record: `docs/ADR-ACCEPTANCE-RECORD.md`). Previously: Proposed (2026-09-23) — binds on second-lead acceptance. Supersedes the OpenTimestamps-primary choice (CLAUDE.md D8) and extends ADR-0028, which stands for the OpenTimestamps half
**Owner:** Sibusiso Khumalo (implementation); decision by Lethabo
**Context:** Precedence is the whole claim: a signal must be publicly timestamped **before** a transfer that may follow within minutes. OpenTimestamps gives a calendar receipt in about a second, but its Bitcoin attestation takes an hour or more. The Hedera Consensus Service reaches finality in seconds. Its fee rose 8× to $0.0008 per message in January 2026 — hourly roots cost ≈ R9.34/month (22 Sep 2026 rate), still a fixed network cost rather than per member. Hedera is governed by a council of up to 39 members, and its fees are paid in HBAR. Anchoring *only* duress outcomes immediately would publish a message seconds after every duress — a timing tell visible to anyone.
**Decision:** (1) **HCS topic created with a `submitKey`** held server-side, so nobody else can post roots to it. (2) **Every PIN-gated outcome** — check-in results and every PIN-authorised action, normal or duress, plus the server outcomes `no_answer`, `contact_lost`, `answered_late`, `incident_closed`, `recovery_performed` and `key_revoked` — triggers an immediate root, **coalesced to at most one per 60 s window**; everything else is batched hourly. The public topic therefore reveals only that some PIN-gated event happened in a given minute, never which kind, and precedence over a transfer minutes later still holds. Immediate roots are capped at 1 440/day ≈ R560/month worst case, independent of member count. (3) Receipts store topic id, sequence number, consensus timestamp and running hash; the verify page matches all four against the public mirror node. (4) **OpenTimestamps** stamps the day's roots daily with multi-calendar submission and scheduled `ots upgrade` (ADR-0028). (5) **Typed 33-byte messages only:** `0x01 ‖ root` and `0x02 ‖ SHA-256(key manifest)`. The key manifest (Ed25519, plus ML-DSA-65 if built) lives in `contracts/keys/` and the API; its fingerprint message is published before the first batch, and any key change starts a new key epoch with a new `0x02` message. No key material or personal data goes on the ledger. The verify page pins network, topic id and key-manifest fingerprint, decodes each mirror message and requires its bytes to equal the root it recomputed from the export. (6) **Testnet** for the demo, labelled; mainnet needs an HBAR-funded account, a purchase only the account owner makes. **Testnet resets periodically:** receipts record a topic epoch (network, topic, reset generation); `status.hedera.com` and Hedera's reset notices are checked before Friday; after a reset, re-anchoring is a later publication under a new epoch, never presented as the original; the verify page shows live-verified, archived (stored mirror response, labelled "archived — not independent") or unavailable; the demo recording is the last fallback. (7) Wording: "we pay a network fee in HBAR; we issue no token"; Hedera is a permissioned-consensus ledger, not "a public blockchain" without qualification (P2.12, P2.13). **Rejected alternatives:** OpenTimestamps only (cannot show precedence over a transfer minutes later); Hedera only (no second, independent anchor); constant-rate padding every 5 minutes (≈ R112/month; deferred — anchoring every check-in already removes the duress timing tell).
**Consequences:** `anchor/publish.py` gains an HCS client (a Thursday spike picks Python or a Node sidecar) and an `anchor_batches` table (snapshot, retry the same root until confirmed, nothing submitted for an empty window). ML-DSA signing sits on the cut line; its scope is stated as authorship of our roots, not Hedera's consensus. Anchoring is a bounded fixed cost of about R570/month at most (`scripts/economics_vigil_anchor.py`).

---

## ADR-0036: Governance under coercion — guardians-only escalation, PIN-gated changes, duress no-ops and a decoy guardian; the two-signature rule narrows
**Status:** Accepted (2026-09-23) by Sibusiso as second lead, on PR #43 at `3855a3d` (record: `docs/ADR-ACCEPTANCE-RECORD.md`). Previously: Proposed (2026-09-23) — binds on second-lead acceptance. Narrows the two-signature scope recorded in `RULES.md` and CLAUDE.md D10
**Owner:** Ipeleng Constance Modise (tests), Lethabo Hoaeane (decision)
**Context:** With UMOJA parked, whitelisting and camera disarm no longer exist. The new insider and coercion threats are an attacker holding the victim's unlocked phone, an abuser posing as a guardian, and a coerced recovery or deletion. Private-security dispatch would bring PSiRA back and is not needed for this build.
**Decision:** (1) **Escalation goes to guardians only** — people the user chose. (2) **PIN authority is explicit:** the PIN is verified on the device (Argon2id, Keystore-wrapped), which signs a `pin_authorised` statement bound to one action and target, expiring 120 s after server receipt; the server accepts a PIN-gated action only with such an authorisation — device possession or a device signature alone is never PIN authority. (3) A **duress PIN at any prompt** raises the full alarm (guardian alert plus immediate bank signal) and shows a normal-looking outcome. (4) Under duress: removals and deletions **look done but do nothing**; additions create a **decoy guardian** whose acceptance succeeds but who never receives alerts, and the real guardians are told a guardian was added under duress. (5) Guardian **removal is silent** (intimate-partner-abuse safety), **takes effect 24 h after it is scheduled** (the removed guardian keeps receiving alerts until then), is **deferred during an open incident**, and **the last guardian cannot be removed** until a replacement has been accepted — so a coerced removal under a forced normal PIN can never disarm the next emergency. The cost, stated: someone removing an abusive guardian keeps that guardian on alerts for up to 24 h. (5a) **Incidents** open on `signal_detected`, `duress_pin`, `no_answer` or `contact_lost` and close only on a guardian `stand_down`, or automatically 6 h after the last signal with heartbeats present and guardians notified — a normal PIN alone never closes one. (6) Subject evidence deletion: PIN + 72 h cooling-off + blocked during an open incident + guardians notified; the chain stays verifiable (payload and salt removed only). (7) Recovery: 10-word code shown once; notifies guardians; blocked during an open incident; rate-limited; **revokes the old device key** at the server receipt time of recovery (later events signed by it are rejected; the revocation is a chain entry); 24 h freeze on guardian changes and deletion afterwards; if the endpoint is cut, **no code is shown**. Guardian enrolment exists only through a fresh PIN authorisation; accepting binds the guardian key and notification token, and later token updates are signed by the guardian key. (8) The **two-signature rule** (two distinct operators) now covers only operator-initiated deletion, detection-threshold changes and signing-key rotation. **Rejected alternatives:** notify guardians of removals (defeats silent removal of an abusive guardian); immediate silent removal (a forced normal PIN could strip every guardian before the next emergency — raised in Sibusiso's PR #43 review); make duress additions fail (tells the attacker, when the attacker is the invitee); remove the two-signature rule entirely (one operator could delete or loosen thresholds alone).
**Consequences:** Tests T12, T13, T16 and T24 in `docs/VUKA-2-SPEC.md` §15. `RULES.md` engineering principles are amended in the same PR. `docs/STAGED-DURESS-DEFENCE.md` scenarios S7 and S8 depend on this.

---

## ADR-0037: The bank protective-hold signal — never from detection alone, the bank decides, nothing visible to the attacker
**Status:** Accepted (2026-09-23) by Sibusiso as second lead, on PR #43 at `3855a3d` (record: `docs/ADR-ACCEPTANCE-RECORD.md`). Previously: Proposed (2026-09-23) — binds on second-lead acceptance
**Owner:** Lethabo Hoaeane; `sim_bank` built by Khutso Mothopa
**Context:** Making banking difficult under duress is the strongest anti-fraud layer (a staged event blocks its own payout). But VUKA cannot block a banking app — Android sandboxes apps, and Play restricts the Accessibility API to accessibility tools. And a visible decline can endanger the victim (the US FTC's 2010 emergency-PIN report — secondary source pending a primary read).
**Decision:** (1) VUKA sends a **signed risk signal to a bank that has integrated**; the bank's own systems decide what to do. (2) **Triggers:** never detection alone; immediately on `duress_pin`; on `no_answer` or `contact_lost` only after guardians were alerted and none sent `stand_down` within 3 minutes. (3) The bank uses **friction criminals already expect** — new-beneficiary holds, lower limits, "payment scheduled" (precedent: Capitec Feature Lock's mandatory 4-hour delay). (4) Nothing names the duress during the event. The release instruction ("visit a branch with your ID or call the number on the back of your card") is shown **only after safety**. (5) Any decoy withdrawal is the bank's risk decision, never VUKA's. (6) The demo uses `sim_bank`, labelled SIMULATED on screen and aloud. **Rejected alternatives:** blocking banking apps through Accessibility (Play policy; the route banking trojans abuse); "contact your nearest branch because duress was entered" shown during the event (could provoke the attacker); triggering holds on high-confidence detection alone (a machine deciding a money consequence).
**Consequences:** Test T11. No real bank integration is claimed; the partner API is `PROPOSED`.

---

## ADR-0038: No generative model, RAG or agent framework in the product — YAMNet is the only model shipped
**Status:** Accepted (2026-09-23) by Sibusiso as second lead, on PR #43 at `3855a3d` (record: `docs/ADR-ACCEPTANCE-RECORD.md`). Previously: Proposed (2026-09-23) — binds on second-lead acceptance. Restates CLAUDE.md D12 for the two-layer product
**Owner:** Lethabo Hoaeane
**Context:** The organisers named AI overuse as their worry. Nothing in VIGIL or ANCHOR needs generated text. RAG, LangGraph and CrewAI were raised as possible additions on 23 Sep and considered.
**Decision:** (1) **No LLM, RAG, LangGraph, CrewAI or any agent framework** in the product — not on the phone, not in the server, not on the verify page. (2) The only model shipped is **on-device YAMNet** (AudioSet classes mapped by label: Screaming, Shout, Yell, Glass, Shatter, Breaking), outputting a label and a basis-point score. (3) Thresholds are labelled **uncalibrated** until `docs/VUKA-2-SPEC.md` §16 publishes recall and false-alarm rates with n. (4) AI tools may be used by the team to *build*; that is disclosed, not hidden. **Rejected alternatives:** an LLM "explainer" of verification results (a new risk surface and judging question for no user benefit — deterministic copy does the job); an agent pipeline in the backend (decoration that conflicts with D12 and the organisers' warning).
**Consequences:** The answer to "where is the AI?" is one small, offline, explainable, measured model, plus a record that contains no AI at all.

---

## ADR-0040: PIN-authority rules agreed as one written surface — the discard boundary, the incident lifecycle and the removal rules restated for the Thu 12:00 check
**Status:** Proposed (2026-09-24) — drafted by Ipeleng for the P3.L8 checkpoint; binds when Lethabo (co-lead) agrees it at the Thursday 12:00 check. **Numbered ADR-0039 when drafted, renumbered to ADR-0040 before acceptance: Lethabo had already claimed ADR-0039 for detection detail and a saved, uncalibrated evidence assessment (`docs/adr.md`, branch `docs/adr-0039-event-detail`)**
**Owner:** Ipeleng Constance Modise (draft), Lethabo Hoaeane (agreement)
**Context:** ADR-0036's acceptance carried the condition that the PIN-verification mechanism (B5) is a pre-condition for implementing `docs/VUKA-2-SPEC.md` §9, tracked as P3.L8 (Lethabo + Ipeleng, due Thu 24 Sep 12:00). The rules already exist in the spec (§8, §9) but are spread across two sections and an ADR; the Thursday check needs one page the team can agree line by line, and Vukosi needs the discard boundary stated without reading the whole spec.
**Decision:** (1) The rules are agreed **as written in `docs/PIN-AUTHORITY-RULES.md`**, which restates and does not change §8, §9 or ADR-0036. (2) The one-sentence rule: a normal PIN is authority to do things; a duress PIN is authority to pretend things happened while raising the alarm; neither a normal PIN nor a coercer holding the phone can close an incident, delete evidence immediately, or leave the user with zero guardians. (3) Under duress, every destructive or trust-changing action (remove guardian, delete evidence, recover to a new device) is a **hard no-op dressed as success**; guardian addition creates a decoy and notifies the real guardians. (4) Incidents close only on guardian `stand_down` or automatic 6 h closure — never on a normal PIN. (5) Guardian removal stays silent, scheduled, effective after 24 h, deferred during an open incident, and refused for the last guardian. (6) Any future change to these rules goes through a fresh ADR, never a config change — the contract-freeze discipline applies.
**Consequences:** Tests T12, T13, T16 and T24 are the executable form of this agreement. Vukosi and Mutarisi build the settings surfaces against `docs/PIN-AUTHORITY-RULES.md` from the moment this ADR is accepted. If the Thursday check amends a rule, the spec section and this page change in the same PR that records the acceptance.
## ADR-0039: Detection and response details live in the committed payload; the evidence assessment is saved, uncalibrated and reproducible; third-party access is designed, not built
**Status:** Proposed (2026-09-24). Binds on acceptance by Sibusiso (contract v2) and Ipeleng (security). On acceptance, it extends ADR-0038(2)'s class list.
**Owner:** Lethabo Hoaeane (decision). Sibusiso Khumalo (contract and server). Ipeleng Constance Modise (security and privacy). Vukosi Khoza (sensing).
**Context:** On 23 Sep, Lethabo asked for the evidence chain to record detection, time, device, the kind of sound and motion, cancellations, guardian behaviour, and a coercion "confidence" that depends on its cause. Anomaly flags come later. The coercion scenario catalogue (`docs/COERCION-SCENARIOS.md`, CEM-0, 133 scenarios) supplies the model. The plan went through three review rounds: an independent critic, then two rounds with a different model family. Three questions stayed open. They are recorded below as gates.
**Decision:**
(1) **Everything is private.** Every new field lives in the salted, committed, deletable payload. Public `action` classes and the 33-byte on-chain messages are unchanged.
(2) **Payloads are versioned.** Each payload carries an integer `pv`. Contract v2 freezes the envelope `payload:{kind, pv, …}`, and per-kind schemas live in `contracts/payloads/`.
(3) **Sound.** The existing six classes, plus "Gunshot, gunfire" (421), "Machine gun" (422) and "Fusillade" (423), all mapped by label. Excluded: 420 and 424–427. One class per window: the argmax, with ties going to the lowest index. Rendered as "gun-like sound (uncalibrated)". Applies from D2 onward.
(4) **Motion** is a stretch detector: accelerometer rules only, no model (`impact`, `shake`, `snatch`; `surge` is parked). It is recorded only as corroboration, looking back over [−10 s, 0] and only while stationary or walking. It never opens a check-in.
(5) **Device fields** are app version, model hash, Android API level and device model. Never IMEI, serial, Android ID or phone number.
(6) **Guardian facts.**
- `guardian_alert_opened` requires an explicit tap and never raises the E-level.
- "No acknowledgement recorded by <time>" is derived at read time, together with the delivery state.
- Acknowledgements are self-reported.
(7) **Cancellations** use the existing kinds.
(8) **A saved `evidence_assessment`** (server-signed, pv 1) is written once per incident transition, in the same head transaction.
- It cites the entry IDs it used, a `ruleset_digest` and server-receipt `basis_time`, and carries `calibrated:false` plus a fixed statement.
- It **never** holds a band, a probability, a likelihood or a verdict.
- Decay freezes when the check-in is shown.
- Conflict is shown to member and guardian as a display flag only, and is not stored.
- **Third parties (banks, insurers) see the tier, the E-level and the reasons in plain words, never the numeric total.** The total is kept for replay and calibration only (decision of 24 Sep, 00:50).
(9) **Access for insurers and banks is designed but not built this weekend.** It stays unbuilt until three gates close:
- G-A: verifiable selective disclosure (Sibusiso, Ipeleng).
- G-B: an independently checked safe-release condition (Lethabo, Ipeleng).
- G-C: a reviewed partner-use rule — human review only, no automated eligibility or pricing, no adverse inference from a low or missing tally, and a way to contest (Babatunde, Ipeleng).
(10) **No early guardian alert** in this build.
**Rejected alternatives:**
- a fused "coercion %" (uncalibrated, and it could be turned against a victim);
- storing bands or odds;
- motion alone opening a check-in (false alarms from phone drops and driving);
- trigger-word detection (a second model, and a RICA/POPIA question; parked);
- building third-party grants before the gates close.
**Consequences:** `docs/VUKA-2-SPEC.md` §18. Tests T25–T29, T54 and T56 (T53 and T55 are designed only). Measurement M8. Contract v2 carries `pv`, `evidence_assessment` and `/alerts/{id}/opened`, with the grant routes marked `x-status: designed`. Gaps G36–G38.

---

## ADR-0041: The P3.L8 checkpoint decisions: member-ended closure, a fallback deadline, a PIN-gated journey end, the pre-incident hold and the wrong-PIN rule
**Status:** Accepted (2026-09-24). Decided by Lethabo (co-lead, acting as security lead while Ipeleng is away); accepted by Sibusiso (second lead), with no conditions, in his PR #67 review. **Partly supersedes** ADR-0036 and ADR-0040(4) on one point: incidents close only on `stand_down` or the 6 h close.
**Owner:** Lethabo Hoaeane
**Context:** ADR-0040 restated the PIN-authority rules and left eight points open (`docs/PIN-AUTHORITY-RULES.md` §8). Three of them are gaps the coercion catalogue exposed (PR #50):
- **G33:** a false alarm answered normally never closes, so a later dead zone reaches the bank signal (E06, E10, E11).
- **G34:** a check-in that is never shown escalates nothing (I01).
- **G35:** an attacker can end the journey and silence `contact_lost` (F06).

Two are threat-model items: TM-C9, export showing `duress_pin`, and TM-C10, unlimited PIN guessing. The other three are the recovery freeze, the undefined "6 h identical-record hold", and what a duress no-op shows after its deadline. Lethabo decided all eight on 24 Sep 2026.
**Decision:** The binding text is `docs/VUKA-2-SPEC.md` §8 and §9, with tests T30, T47 and T50–T52 in §15.
1. **Member-ended closure (G33).** Ending the journey with a normal PIN closes an incident only when:
   - every check-in outcome in it is `normal_pin`;
   - no guardian alert has been sent in it;
   - it holds no duress signal.

   Otherwise it closes only on `stand_down` or the 6 h close. `incident_closed` records `reason: member_ended`.
2. **No bank signal on an all-normal `contact_lost` (G33 backstop).** `contact_lost` after all-normal outcomes alerts guardians and never sends the bank signal.
3. **Fallback deadline (G34).** `no_answer` fires at the receipt of `signal_detected` plus the window plus 30 s, unless `opened` arrives first.
4. **PIN-gated journey end (G35).** `journey_ended` needs a fresh `end_journey` authorisation. A duress end looks exactly like a normal end on the phone, and the service stops. Server-side it is a duress signal: guardians are alerted and the S1 bank signal is sent.
5. **Recovery freeze confirmed.** For 24 h after recovery to a new device, guardian changes, deletion and bulk export are frozen.
6. **The pre-incident hold (T30 and the 6 h hold).** While an incident is open, and for 6 h after its last PIN entry, the member's own device reads only up to the head before the incident's first event. That covers My Record and export, identically for both PINs. Export always needs a fresh `export` authorisation.
7. **Wrong PINs (T47).** Attempts 1–3 each show the identical "Try again".
   - From the third wrong attempt, the outcome is fixed as `no_answer` at the deadline.
   - Any later entry shows "Checked in".
   - A duress PIN still counts as a duress signal.
   - No lockout is ever shown.
8. **A duress no-op keeps showing success** indefinitely after its promised delay.

**Rejected alternatives:**
- Keeping the rule that nothing but `stand_down` or 6 h closes an incident. False alarms would keep reaching the bank signal.
- Only removing the bank signal from `contact_lost`. The incident would stay open, and guardians would still be called on every dead zone.
- A one-tap journey end. An attacker could silence `contact_lost`.
- A visible lockout after wrong PINs. It tells the coercer the PIN was wrong, and lets them wait it out.
- Blocking export entirely during an incident. A refusal is itself a tell.
- A "still processing" state after a no-op's deadline. A returning coercer could read it as failure.

**Consequences:**
- Closes the rule side of G33, G34 and G35. Each gap closes when its test passes (T50, T51, T52).
- New residual, stated in §17: a coercer who forces out the **real** PIN can end a false-alarm incident. The member's defence is the duress PIN, which looks identical.
- The contract gains action `end_journey` and the `incident_closed.reason` field. Both are for Sibusiso in contract v2 (#51).
- Vukosi builds the check-in attempt counter and the identical journey-end path; Mutarisi builds the screens.
- The coercion catalogue (`scripts/coercion_scenarios.py`, rule H4) is re-run under these rules as a follow-up.

---

## ADR-0042: The device and guardian key registry (spec §4a), accepted with three security amendments
**Status:** Accepted (2026-09-24). Proposed by Sibusiso (#64, merged as PROPOSED). Accepted by Lethabo, as co-lead and after a security review while she covers the security lane for Ipeleng. Sibusiso confirms the amendments on the PR that records this.
**Owner:** Sibusiso Khumalo (§4a), Lethabo Hoaeane (security amendments)
**Context:** §4 required a registered key per `signer_key_id` but never said where registration lives, or how "the" key for a subject is resolved. P3.A3 slice 2 (real request authentication) can't be built without it. §4a proposed a `signer_keys` table and resolution rules. Its security review found three places where the table could become a trusted authority it should not be.
**Decision:** §4a is accepted, as amended:
1. **The verifier rebuilds the registry from the chain, never from `signer_keys`.**
   - Registration, guardian-accept and recovery entries carry `signer_pubkey`.
   - `key_revoked` entries carry `revoked_key_id` and are exported.
   - An entry is valid if it was received before its key's revocation.
2. **No server keys in `signer_keys`.** `signer_role` is `device` or `guardian` only. Server keys come from the pinned manifest in `contracts/keys/`.
3. **One non-revoked key per device and per guardian**, not "per role": a subject can have several guardians.

**Rejected alternatives:**
- Verifying against the server's `signer_keys`. A stranger would have to trust our database, which defeats "verify without trusting us".
- A `server` role row. A database write could then mint a server key.
- A "most recent key wins" rule. Already rejected in §4a: a stale key would silently lose authority.

**Consequences:**
- P3.A3 slice 2 is unblocked.
- Contract v2 (#51) adds `revoked_key_id` to plain `details` on `key_revoked` entries, and drops `server` from `signer_role`.
- `shared/verify.js` (verify-min, P3.S7) already builds keys from the chain. Revocation checking is added once `key_revoked` entries exist in an export.

---

## ADR-0045: Detection picks one class per window from the classes that clear their own thresholds (clarifies ADR-0039(3))
**Status:** Proposed (2026-09-25). Decided by Lethabo (co-lead, owner of ADR-0039). Binds when Sibusiso accepts it with ADR-0039 (the payload is unchanged).
**Owner:** Lethabo Hoaeane (decision), Sibusiso Khumalo (contract), Vukosi Khoza (sensing)
**Context:** ADR-0039(3) says "one class per window: the argmax, with ties going to the lowest index". Read literally, the argmax is taken first and only that class's threshold is checked. A loud class below its own bar then hides a quieter class that clears its own. Example: Shout at 7000 bp against a bar of 8000, and Screaming at 6500 against 6000; nothing is recorded. An adversarial review of the detection plan found this masking.
**Decision:**
1. **Each target class is judged against its own threshold first.** A gun-like class must also beat its excluded neighbours (420 and 424–427), measured in the same window.
2. **Among the classes that qualify, the highest score wins**, with ties going to the lowest YAMNet index. There is still exactly one class per window, and `signal_detected` pv1 is unchanged.
3. When no class qualifies, the reason record names the closest miss and states its threshold comparison truthfully.
**Rejected alternative:** the literal argmax. It is simplest, but it misses a clearing class whenever a louder one fails its bar.
**Consequences:** `app/src/brain/detect/engine.ts` and its tests (PR #86). The ESC-50 figures in `docs/EVIDENCE.md` were produced under this rule.

## ADR-0046: VIGIL is always on: it listens from set-up until the member pauses it with a PIN (supersedes V1's member-started journey)
**Status:** Proposed (2026-09-25). Decided by Lethabo (co-lead). It binds when Sibusiso (contract) and Ipeleng (privacy) accept it, recorded in `docs/ADR-ACCEPTANCE-RECORD.md`. Until then V1 as written stays the accepted rule.
**Owner:** Lethabo Hoaeane (decision), Sibusiso Khumalo (contract), Ipeleng Modise (privacy), Vukosi Khoza (sensing)
**Context:** V1 has the member start a journey before VIGIL listens. The product position is "you don't have to ask". A member who is attacked on the way home did not necessarily start a journey first, and the start button is itself an ask.
**Decision:**
1. **Listening starts by itself once set-up finishes,** and again whenever the app is opened while not paused. It needs the microphone and notification permissions (V1's refusal-and-explain rule still applies). It retries every 30 s while the server can't be reached. It never starts without a server-issued session id, because a check-in that can't reach a guardian would be a false promise.
2. **The contract is unchanged.** One listening session is one journey on the server: `POST /v1/journeys` issues the id, heartbeats go every 30 s (V9), and every event targets it.
3. **Pausing listening is the PIN-gated journey end** (G35, ADR-0041): `pin_authorised` for `end_journey`, then `journey_ended`. A duress PIN looks exactly like a normal pause on the phone and raises the full alarm on the server. Only a pause stops listening.
4. **The persistent notification stays neutral (V2):** "VUKA active" replaces "VUKA journey active". The check-in notification reads "Check-in".
5. **The live meter** shows, per audio window, the target sound closest to its own threshold. It shows the model score (0–100) against that threshold, labelled "not a probability". No percentage confidence is shown anywhere (D14, ADR-0039).
**Costs, stated before anyone asks:**
- **False checks.** On the held-out ESC-50 folds (a lab proxy, not street audio), the engine gave about 5.5 prompts and 7.3 false records per hour of replayed clips (`docs/EVIDENCE.md`). Always on for a 16-hour day would be on the order of 90 PIN checks a day, until the thresholds are tuned on real-world audio. That is **not measured in the field**.
- **Battery.** Continuous YAMNet inference plus the microphone service is **not measured**. Android also shows the microphone indicator whenever VIGIL listens.
- **Privacy.** Nothing changes on storage: audio stays in a 3 s ring buffer on the phone and is never stored or sent (D7). The member hears nothing different; the exposure is duration.
- **A long session.** A session can last days. Heartbeats every 30 s keep the `contact_lost` clock (§8) meaningful for that long.
**Rejected alternatives:**
- keep the member-started journey (V1), which is the ask we set out to remove;
- always on, but only asking for the PIN above a stricter threshold. That was offered, and the co-lead chose full alerts.
**Consequences:**
- the app's home becomes "Listening" and "Pause listening";
- the spec's V1 and the "journey" wording in member-facing copy need a follow-up edit once this is accepted;
- the false-check rate becomes the top measurement priority (M1–M3, Vukosi's P3.V6 instrument).

## ADR-0047: graded check-ins on the phone (CEM-1): V4 unchanged, below-threshold evidence can lift, and every decision says why
**Status:** Proposed (2026-09-26). Decided by Lethabo (co-lead). Active only for simulation subjects (`sim_`, the whole public demo) until Sibusiso (contract) and Ipeleng (privacy) accept it in `docs/ADR-ACCEPTANCE-RECORD.md` and two leads sign off the ruleset digest (D10). Extends V4 and ADR-0039; does not supersede either.
**Owner:** Lethabo Hoaeane (decision), Sibusiso Khumalo (contract, server), Ipeleng Modise (privacy), Vukosi Khoza (measurement)
**Context:** Under V4 every confirmed detection above its class threshold opens a check-in, and nothing below the threshold is recorded at all. A real attack is often quieter than the threshold, and a single sound says less than two different ones together. The team's own coercion evidence model (CEM-0, `docs/COERCION-SCENARIOS.md`) already scores reasons in integer decibans; it had never run on the phone.
**Decision:**
1. **CEM-1 on the phone** (`app/src/brain/cem/`, pure). It ports CEM-0 for the reasons the phone can observe (sounds, sound context, motion), with the same exact integer decay and bands. It reproduces the 32 phone-observable catalogue scenarios exactly (`golden.json`, generated from `scripts/coercion_scenarios.py`). It adds two PROPOSED reasons: `pin_retry` (+2, a wrong PIN before the accepted one) and `pin_slow` (+2, slower than the member's own median + 3·MAD, after at least 8 entries). The tally is an uncalibrated sum of reasons, never a probability (ADR-0039).
2. **Two thresholds per class.** The V4 prompt thresholds are unchanged, and every detection that prompts under V4 still prompts: K never suppresses it. A new record threshold (half the prompt threshold, **UNCALIBRATED**) produces record-only evidence (T0).
3. **Lift.** A record-level detection opens a check-in only when:
   - the positive evidence is P ≥ 5 db;
   - it is not true that K ≥ 50 % and P < 12 db;
   - the one prompt slot is free;
   - there has been no prompt in the last 30 s.

   The lift has its own cooldown and never touches V4's. The decision waits until the audio has run 1 s past the candidate, so context such as TV in the next windows is heard. V4 decisions never wait. Pausing settles anything pending as record-only.
4. **`signal_detected` only when the phone commits.** It is sent for a check-in, and for a V4-level record exactly as before. A record-only detection sends only `evidence_observed`, so it never starts a server deadline, incident or alert.
5. **`evidence_observed` pv 2** (`contracts/payloads/evidence_observed.v2.json`, rules in `server/evidence.py`). There is one shape per decision:
   - **`record`:** candidate facts, and no signal.
   - **`prompt`:** names exactly its own `signal_event_id`. It is sent after the signal and never gates the check-in.
   - **`pin`:** follows every accepted check-in answer for both PINs, in one fixed shape: `[pin_retry, pin_slow]` with weights 0 or 2 and no aggregate fields. It goes in the same flush as the answer, and the answer never waits on the network (V5).

   Every record carries `ruleset_digest` (CI-checked), `context: on|off` and weight-0 `observations` (the Liu et al. 2018 snatch rule, 40 m/s², logged for Experiment 2 only).
6. **Guardians see why, in words.** The alerts route returns `why` = the band plus up to 3 reason names. It is read only from the evidence bound to that alert's signal, from the encrypted payload, so deleting the member's data removes it.
7. **Countdown.** The check-in shows "Answer when you can" until the server has acknowledged `checkin_opened`. It then counts down using a bound that can never overstate the server's time: min(created-at + 70 s, signal created-at + 90 s) − 5 s. At zero it says "Time's up. You can still answer". It is the same for both PINs and never shows reasons.
8. **Context sounds are optional.** A label mismatch turns them off, and the record says `context: off`. It never disables V4.

**Costs, stated before anyone asks:**
- **More check-ins.** The transition list (`docs/eval/cem1-transitions.md`) shows that with the record threshold at half the prompt threshold, most single quieter sounds lift: a scream (7 db), glass (5) or a gunshot (8) alone reaches P ≥ 5. Only a lone shout (4) and conflicting context (the gym case) stay record-only. In effect CEM-1 roughly halves the prompt bar for screams, glass and gun-like sounds until the step-d measurements replace the record thresholds. The false-check rate at these thresholds is **not measured**. V4 already gave about 5.5 prompts per hour on replayed ESC-50 clips (ADR-0046, a lab proxy).
- **Novel scheme.** No published graded duress scheme exists to copy (research R1). The weights are CEM-0's plus two provisional PIN weights.
- **Pre-existing V4 behaviour kept, not fixed.** A V4-level detection recorded while a check-in is open (or in the cooldown) still sends `signal_detected`. The server gives it its own no-answer fallback (+90 s), so it can alert guardians even after the member answered the first check-in normally. This ADR keeps V4 exactly as it is and flags this for a separate decision.
- **Pin baseline.** `pin_slow` needs 8 accepted entries on this phone, so it rarely fires in a short demo.

**Rejected alternatives:**
- a single fused tally that can make V4 quieter;
- K suppressing V4-level detections;
- sending `signal_detected` for record-only detections, which creates server deadlines for check-ins the phone never shows;
- a variable-length PIN evidence event (length leaks);
- a server-supplied countdown deadline (a contract change the send-time bound makes unnecessary).

**Consequences:**
- The public demo build runs CEM-1 (every subject is `sim_`).
- The record thresholds and the venue false-alarm curve (step d) are now the top measurement priority.
- The concurrency and timing rules (one prompt slot, V4 first, pause settles as record-only, the ±1 s context wait) are pinned by tests (`grader.test.ts`).
