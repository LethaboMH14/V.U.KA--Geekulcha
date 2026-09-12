# VUKA — Master Specification

**Team Sonar · Geekulcha Annual Hackathon 2026 · Blockchain for Impact Use**
Spec version 1.0 · 18 August 2026 · Submission deadline 25 August 2026

> **Method: spec-driven development.** Requirements are numbered, specifications reference the requirement they satisfy, contracts are frozen before implementation, and verification maps back to the requirement. Nothing is built that no requirement asks for; nothing is claimed that no test verifies. This document is the contract between the three of us, and the reference a judge can audit us against.

---

## 0 · Status legend

| Mark | Meaning |
|---|---|
| ✅ **BUILT** | Exists in a repository, has tests, verified by direct audit |
| 🔨 **BUILDING** | Committed for the 25 Aug – 27 Sep window |
| 📋 **SPECIFIED** | Designed and documented, not yet implemented |
| ⚠️ **OPEN GAP** | Known deficiency, disclosed rather than omitted |

---

## 1 · Problem specification

### 1.1 The forcing function

South African banking regulation and practice have made the mobile app effectively mandatory for account access. The consequence is that the authentication factor and the asset now sit in the same object, in the victim's own hand, secured by a biometric that can be compelled by force.

The attack has adapted accordingly: **unlock the device, open the app, transfer, then drive to an ATM for the daily limit.** The victim performs the transaction. Every record the institution holds shows a correctly authenticated, correctly authorised instruction.

### 1.2 Four failures, one shape

| # | Failure | Why existing products don't solve it |
|---|---|---|
| **P1** | **Help requires a free hand.** Panic buttons, apps, speed dials, voice assistants — all require a hand and a moment of privacy. Coercion removes both | Nothing on the market serves the person who *cannot ask* |
| **P2** | **Alarms sense motion, not people.** A PIR mounted high enough to ignore a dog is high enough for a person to crawl under, and cannot distinguish a cat from an intruder regardless | Users disarm them after false alerts, and then own an expensive light switch |
| **P3** | **Nobody watches the watchers.** Camera networks decide who is suspicious with no record a resident can inspect — and adding a vehicle to a "known" list makes it invisible, permanently, with one unwitnessed click | The insider is the unmodelled threat across the entire private-security category |
| **P4** | **Disputes are settled by whoever owns the log.** A coerced transfer, a jammed remote with no forced entry, an argument about response time. The party holding the record has money riding on the outcome | The harmed party is the one who must argue, against a file they cannot see |

### 1.3 Quantified — from 15,712 real claim records we cleaned and analysed

| Measure | Value |
|---|---|
| Total incidents analysed | 15,712 |
| Theft | 14,380 claims ≈ **R1.09bn** (contents R406.6m + vehicle R686.3m) |
| Hijackings | 680 |
| Armed robberies | 272 |
| Peak hour | 00:00 carries **1,296** incidents — roughly **3×** the 05:00 trough |
| Geographic concentration | 764 suburbs above threshold; 709 successfully geocoded |
| Official corroboration | SAPS quarterly statistics, **678 precincts, all nine provinces**, per-crime trend direction |

**Crime here is concentrated in time and in place. Concentration is what makes it targetable.**

---

## 2 · Requirements

Each requirement carries an ID used throughout this document and in test names.

### 2.1 Functional

| ID | Requirement | Priority | Status |
|---|---|---|---|
| **F1** | Detect duress with **zero user interaction** — no button, no hand, no utterance | MUST | ✅ BUILT |
| **F2** | Fuse ≥3 **physically independent** sensing channels into one calibrated posterior | MUST | ✅ BUILT |
| **F3** | Provide a covert duress credential granting apparently-normal access while signalling, with **no observable indicator** | MUST | ✅ BUILT |
| **F4** | Operate with no network, no mains power and the screen off | MUST | ✅ BUILT |
| **F5** | Distinguish a **person** from an animal at a property boundary, not merely detect motion | MUST | ✅ BUILT |
| **F6** | Detect glass-break and gunshot acoustically, with a second stage that can **overrule the first** | MUST | ✅ BUILT |
| **F7** | Learn residents, workers and regular deliveries **before** evaluating anyone as suspicious | MUST | ✅ BUILT |
| **F8** | Escalate only on recurrence by an entity **unknown to the street**: ≥3 sightings, ≥2 cameras, ≤14 days | MUST | ✅ BUILT |
| **F9** | Present every escalation with a **visible, cancellable countdown** | MUST | ✅ BUILT |
| **F10** | Rank area risk from official statistics and route patrols to maximise risk covered per litre | SHOULD | ✅ BUILT |
| **F11** | Record every decision in a hash chain with per-party signatures | MUST | 🔨 BUILDING |
| **F12** | Publish an hourly Merkle root to a **public** chain | MUST | 🔨 BUILDING |
| **F13** | Require **two independent signatures** for whitelist, camera disarm, threshold change, deletion | MUST | 🔨 BUILDING |
| **F14** | Serve any person their complete decision history with cryptographic proof | MUST | 🔨 BUILDING |
| **F15** | Delete a person's data while preserving the record that a decision occurred | MUST | 🔨 BUILDING |
| **F16** | Sign an appliance heartbeat so that its **absence** is timestamped evidence | SHOULD | 🔨 BUILDING |
| **F17** | Explain any decision in plain language to the person it concerned | COULD | 📋 SPECIFIED |
| **F18** | Detect **behaviour** (climbing, loitering) via a local vision-language model as an explicitly uncalibrated fusion factor | COULD | 📋 SPECIFIED |

### 2.2 Non-functional

| ID | Requirement | Target | Measured | Status |
|---|---|---|---|---|
| **N1** | Detection → alert render, p95 | ≤ 2 000 ms | **318 ms** (n = 10) | ✅ |
| **N2** | Detection → alert render, p50 | — | **273 ms** | ✅ |
| **N3** | Vision throughput, person detection | ≥ 8 FPS | meets | ✅ |
| **N4** | Shipped on-device model budget | ≤ 20 MB | meets | ✅ |
| **N5** | Per-inference latency, 2 GB Android device | ≤ 50 ms | meets | ✅ |
| **N6** | Appliance runtime on battery | 48–72 h | design | 🔨 |
| **N7** | On-chain footprint | ≤ 32 B / hour | by design | 🔨 |
| **N8** | Anchoring cost, whole network | < R5 / month | **~R1.30** | 🔨 |
| **N9** | False alerts surfaced per camera-week | ≤ 1 | in evaluation | 🔨 |
| **N10** | Forecast skill vs naive baseline | beat it | **FAILS: MAE 0.484 vs 0.246** | ⚠️ OPEN GAP |

### 2.3 Ethical and legal — non-negotiable

| ID | Requirement | Enforcement | Status |
|---|---|---|---|
| **E1** | **No machine may accuse.** Machine ceiling is `watch_candidate`; only an authenticated human may set `flagged` | In code — no path exists. Verified by test | ✅ ADR-0002 |
| **E2** | **Embeddings, never images.** Enforced in the vision layer, not in policy | Code review gate: persisting a face crop outside the escalation path fails review | ✅ D9 |
| **E3** | **Raw audio never persisted.** 3-second ring buffer only | Architectural | ✅ |
| **E4** | **No personal data on chain, ever** | Only a hash of a hash leaves | 🔨 |
| **E5** | **No generative model between a camera and a determination about a person** | ADR-0007 — the invention is unfalsifiable from the output | ✅ |
| **E6** | **Calibrated numbers only.** Any probability shown to a human is calibrated or labelled as a target | Convention + `ml/eval/calibration.py` | ✅ / ⚠️ weights unfitted |
| **E7** | **Simulated is always explicit.** `sim_` prefix in code AND named aloud | Convention | ✅ D10 |
| **E8** | POPIA: retention TTL, subject-access route, deletion route | Data layer | ⚠️ **OPEN GAP — ADR-0006 records this in our own words** |
| **E9** | No autonomous physical consequence — no gate unlock, no countermeasure that injures, no responder bounty | Refused by design | ✅ |
| **E10** | No street-level risk sold as an underwriting input | Removed from our own business case — it is redlining | ✅ |

---

## 3 · Solution specification

### 3.1 VIGIL — the person ✅ BUILT

Satisfies **F1–F4, F9**.

```
sensors/          AudioSensor · MotionSensor · PinSensor  (Kotlin native bridges)
brain/features/   mel-spectrogram · motion windows
brain/models/     LiteRT wrapper · registry with sha256 · yamnet.tflite in assets
brain/fusion/     pure function — calibrated log-odds + conflict coefficient K
brain/statemachine/  L0–L3 · per-level hysteresis · context prior
evidence/         ring buffer · hash chain · encrypted store
```

**Fusion, formally:**

```
prior      = base + β_stage·stage + β_cell·cellRisk + β_hour·hourRisk
posterior  = σ( prior + Σᵢ wᵢ · logit(pᵢ) )
K          = 1 − exp( − mean over opposing pairs of min(|llrᵢ|,|llrⱼ|) )
```

Escalation requires `posterior ≥ θ_up[level]` **and** `K ≤ conflictK`. High conflict routes to verification rather than escalating — disagreement is treated as information.

> ⚠️ **OPEN GAP.** The weights `wᵢ` and the β coefficients are hand-set from a documented cost matrix, **not fitted on data.** `ml/params/fusion_params.json` self-labels: *"PROVISIONAL — NOT fit on real data. Do not present as tuned/validated."* Fitting them is the highest-value ML task in the current cycle.

**Duress credential (F3).** Real PIN unlocks. Duress PIN unlocks *identically* — same animation, same latency, same subsequent UI state — while queuing a signed duress event. No observable network, UI or timing difference an attacker could inspect. This is the founding abuse case of the product.

### 3.2 KHAYA — the home ✅ BUILT / 🔨 hardware

Satisfies **F5, F6, F16**.

| Concern | Specification |
|---|---|
| Compute | ARM SoC with on-board NPU; INT8-quantised models; sealed enclosure |
| Vision | YOLOv8 — person / animal / vehicle / weapon. **Classifies, not just detects motion** (F5) |
| Acoustic | Two-stage cascade. Stage 1: cheap always-on gate. Stage 2: YAMNet — and stage 2 **overrules stage 1** when it identifies speech (F6) |
| Deterrent | Siren, floodlight, recorded "you are being recorded." **Human confirms, cancel window visible** |
| Power | LiFePO4 48–72 h. Framed correctly: **cutting power is step one of a break-in, so the battery is a countermeasure** |
| Network | Wi-Fi primary, LTE failover on prepaid SIM. Local queue if both fail — decisions are local |
| Tamper | Case switch + accelerometer → immediate signed event |
| **Destruction** | **Signed heartbeat into the chain.** If the box is destroyed, the missing heartbeat is itself timestamped evidence. Destroying the evidence *becomes* the evidence |

**Explicitly refused:** blinding light aimed at eyes, automated chemical irritant, autonomous gate unlock, announcing a dispatch that has not occurred. Each violates **E9**, and two would constitute assault — an automated device cannot assess proportionality or distinguish an intruder from a paramedic.

### 3.3 UMOJA — the street ✅ BUILT

Satisfies **F7, F8, F10, E1**.

```
api/        sightings · entities · alerts · risk · hotspots_geo · safest_route
            vision_jobs · audio_classify · incidents · assistant
suspicion/  entity_resolution · face_resolution · plate_text · scorer
risk/       forecast (3-tier: real risk cell → honest claims fallback → no_data)
routing/    planner (OR-Tools) · safest
db/         models · evidence_integrity
notify/     email
middleware/ rate_limit
auth/       operators
```

**Whitelist-before-watchlist (F7).** `factor_f1_recurrence()` returns `False` immediately for a whitelisted entity — familiarity can never read as suspicion.

> 🔴 **This is also the system's highest-value attack surface, and we found it by auditing our own code.** Because a whitelisted entity accumulates *no* suspicion at all, and a single operator could add one with a single unwitnessed API call, **F13's two-signature requirement exists specifically to close it.** No commercial camera network defends against its own operators.

**Suspicion (F8).** Factor F1 (recurrence) is implemented. F2–F6 are **documented stubs, not silent absences** — the escalation ladder and thresholds are provable now, and adding a factor later is additive rather than a rewrite.

**Lazy decay.** `score_now = base × 0.5^(days/7)`, computed at read time. Solves "no scheduler in a single-process deployment" without altering half-life behaviour. **The system forgets you with no human required to clear you.**

### 3.4 ANCHOR — the record 🔨 BUILDING

Satisfies **F11–F16, E4**.

```
event → canonical JSON → SHA-256 with prev_hash → chain entry
                                ↓
              Ed25519 signature by the asserting party
                                ↓
                    hourly Merkle tree over the batch
                                ↓
                  32-byte root → public chain (OpenTimestamps)
```

| Decision | Choice | Reason |
|---|---|---|
| Chain | **OpenTimestamps → Bitcoin** | Free, no wallet, no token, no account. Chosen for **longevity** — a claim may reach court in ten years, and if the chain you anchored to has died, your proof died with it |
| Alternative | Hedera Consensus Service | ~3–5 s finality if low latency is ever needed; ~$0.0001 per message |
| Cadence | Hourly | 720 anchors/month ≈ **R1.30 for the entire network**. Batched, therefore a **fixed** cost — identical at 100 homes or 100 000 |
| On-chain payload | 32-byte root only | **E4.** No personal data, ever |
| Signatures | Ed25519, one keypair per party | Device, operator, security company. Off-chain, inside the Merkle tree |
| Destructive actions | **2-of-2 multi-signature** | F13. Whitelist, disarm, threshold, delete |
| Deletion | Payload removed, hash retained | **The record that a decision happened is permanent. The data about the person is not.** The chain never held it, so deletion cannot break it |

**What the anchor actually buys — and the distinction matters:**

> Not immutability. We already had that internally. **Precedence** — proof that a record existed before anyone had a reason to falsify it.
>
> A duress signal recorded at **22:41**, published before **23:00**. A transfer at **22:44**. The bank's records show a correctly authorised transaction. The anchored record proves the duress signal existed three minutes earlier *and was public before anyone knew a dispute was coming*. No database can provide that, because the database belongs to the party making the claim.

---

## 4 · Frozen contracts

Changing any of these requires sign-off from both leads and an ADR entry. **This is the spec-driven discipline: contracts freeze before implementation.**

### 4.1 Core API surface (excerpt)

```
POST   /v1/sightings                  single or batch ingest; signature required
GET    /v1/entities/{id}              includes lazy-decayed score at read time
POST   /v1/entities/{id}/verify       {action: flag|dismiss|whitelist}
                                      → writes evidence_chain
                                      → flag/whitelist REQUIRE 2 signatures (F13)
GET    /v1/risk                       per-cell risk, 3-tier honest fallback
GET    /v1/hotspots                   709 geocoded suburbs
GET    /v1/safest-route               member-facing, distinct from patrol planner
POST   /v1/routes/patrol              OR-Tools solve under a fuel budget
GET    /v1/evidence/integrity         full-chain verification result
GET    /v1/anchor/latest              current root, tx reference, record count  🔨
GET    /v1/subjects/{id}/record       complete decision history + proof  (F14) 🔨
DELETE /v1/subjects/{id}/data         payload removed, hash retained  (F15) 🔨
WS     /ws/ops                        operator room
WS     /ws/member                     member room — MUST never receive ops events
```

### 4.2 Evidence chain entry — canonical form

```json
{
  "action": "verify_dismiss",
  "actor_id": "op_A41",
  "target_type": "entity",
  "target_id": "ent_7f3a…",
  "details": { "reason": "recognised delivery route" },
  "ts": "2026-08-18T16:22:04+02:00",
  "prev_hash": "4c1f…"
}
```
`event_hash = SHA256( json.dumps(entry, sort_keys=True) )`. The verifier recomputes every entry and every pointer, returning the **first** broken link.

### 4.3 State machine — the boundary in one table

| State | Who may set it | Enforcement |
|---|---|---|
| `observed` | machine | automatic |
| `watch_candidate` | **machine — this is its ceiling** | automatic |
| `flagged` | **human only, with operator ID** | `human_verify()` only. No other path exists |
| `dismissed` | human only | `human_verify()` |
| `whitelisted` | **human only, TWO signatures** | `human_verify()` + co-signature 🔨 |

---

## 5 · Verification — requirement → test

| Requirement | Verified by | Result |
|---|---|---|
| F2 fusion math | `fusion.test.ts` — 13 cases, golden fixture | ✅ pass |
| F2 conflict gate | `fusion.test.ts` — opposing-sign suppression | ✅ pass |
| F8 recurrence | `test_entity_resolution.py`, `test_suspicion_contract.py` | ✅ pass |
| F9 hysteresis | `statemachine.test.ts` — 19 cases across boundaries | ✅ pass |
| F11 chain integrity | `test_evidence_integrity_contract.py` — mutated field **and** broken pointer must be caught, first break identified | ✅ pass |
| **E1 human gate** | contract tests assert no path sets `flagged` without an operator ID | ✅ pass |
| WS isolation | `test_ws_channel_routing.py` — member socket must never receive ops events | ✅ pass |
| Rate limiting | `test_rate_limit_middleware.py` | ✅ pass |
| N1 latency | `scripts/latency.py`, matched by sighting ID | ✅ 318 ms p95 (n = 10) |
| N10 forecast skill | `data_prep/backtest_results.csv`, 654 held-out rows | ⚠️ **FAILS — published anyway** |
| E6 calibration | `ml/eval/calibration.py` — reliability diagram, ECE | ⚠️ harness exists, **not yet run on real data** |
| F13 dual signature | abuse-case suite: *a single operator must NOT be able to whitelist* | 🔨 to be written |

**Total: 440 test cases.** Contract tests assert exact request/response **shapes**, not status codes.

---

## 6 · Technology Readiness Level

**Assessed TRL: 5.** *(System/subsystem model or prototype demonstrated in a relevant environment.)*

The submission template requests TRL 3. We are stating our actual level with evidence, because understating it would misrepresent the work — and misrepresentation is the one thing our honesty ledger forbids.

| Evidence | Supports |
|---|---|
| Integrated system running end-to-end across three machines over a public tunnel | TRL 5 |
| Latency measured under load in the intended topology, not simulated | TRL 5 |
| Real data through the full pipeline: 15,712 records, 709 geocoded, 678 precincts | TRL 4–5 |
| On-device model shipped in an installable Android build | TRL 5 |
| 440 tests including security-property tests | TRL 4–5 |
| Hardware appliance not yet fabricated | caps at 5, not 6 |
| No field deployment with real households | caps at 5, not 6 |

**Question logged for the mentors:** is the template's TRL 3 a ceiling or a floor? We have asked rather than assumed.

---

## 7 · Open gaps — the register

Disclosed here so that no judge has to discover them.

| # | Gap | Impact | Plan |
|---|---|---|---|
| **G1** | Fusion weights not fitted on data | "Calibrated" is aspirational in form-only terms | Collect an honest labelled set; run the existing harness; publish the reliability diagram |
| **G2** | Forecast loses to a constant (MAE 0.484 vs 0.246) | The predictive claim is not yet earned | Re-base on SAPS severity + near-repeat; report PAI honestly; **stays on the honesty slide either way** |
| **G3** | POPIA obligations undischarged (ADR-0006, our own words) | Blocks public-sector adoption | Retention TTL in the data layer; subject-access endpoint; deletion route. In this cycle |
| **G4** | Suspicion factors: 1 of 6 implemented | Suspicion model is thinner than the design | Documented stubs; VLM behaviour factor is the next one |
| **G5** | No trained CV model of our own | Vision is integration of pretrained models | Stated plainly; fine-tuning is roadmap, not claim |
| **G6** | **Secrets were committed to a public repository** | Real security finding | Rotated, removed, **history purged**, pre-commit scanning added. Full disclosure in the SSDLC document |
| **G7** | Third party's proprietary dataset tracked in a public MIT repo | Licensing exposure | Removed; re-based on public SAPS data |
| **G8** | No independent penetration test | Unverified attack surface | Scheduled before the first paying household |
| **G9** | Bias evaluation not yet run on the face pipeline | Our stated answer to FRVT differentials is untested | Evaluate across demographic groups, report with confidence intervals |

---

## 8 · Build plan — 25 Aug to 27 Sep

| Phase | Window | Deliverable |
|---|---|---|
| **Remediate** | now → 20 Aug | G6, G7 closed. Clean public repo, purged history, secret scanning in CI, READMEs split into *Built* / *Designed* |
| **Submit** | → 24 Aug | Deck with the six mandated sections, Lean Canvas, SSDLC, team profile. **Submit a day early** |
| **Selection** | 30 Aug | — |
| **Anchor** | 1–8 Sep | F11, F12, F16. Merkle batching, Ed25519 signing, public anchor, verifier extended |
| **Govern** | 8–14 Sep | F13, F14, F15. Two-signature gates, subject access, deletion route. **G3 closed** |
| **Calibrate** | 14–20 Sep | G1. Collect labelled data, fit weights, publish reliability diagram + ECE |
| **Harden** | 20–24 Sep | SAST, DAST, dependency scan, abuse-case suite, fuzzing the ingest |
| **Demo** | 25–27 Sep | The one-thread run-of-show, rehearsed; recorded fallback |

---

## 9 · Amendment protocol

Propose via an ADR entry in `docs/adr.md` (append-only). Discuss in the pull request. Mark **Accepted** on merge. Update the frozen-contract section if a locked decision changed. **Never edit history — supersede it.**

**25 ADRs accepted to date.** The security and ethical properties of this system are architectural, dated, and reviewable — which is the only reason to believe they will still be there next month.
