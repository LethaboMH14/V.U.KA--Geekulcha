# VUKA — Technology Stack

Every row includes **why this and not the obvious alternative.** A stack list proves you can name tools; a stack list with reasons proves you made decisions.

---

## 1 · On-device / edge — VIGIL & KHAYA

| Layer | Choice | Why this, not the alternative |
|---|---|---|
| Mobile platform | **Android-first (bare React Native + Kotlin native modules)** | Android permits background sensing and a persistent foreground service; iOS does not, at the depth this product needs. And the majority of the market here is on budget Android |
| Native modules | **Kotlin** — `SensingService`, `BootReceiver`, `AudioModule`, `MotionModule`, `PinModule` | A foreground service with a PARTIAL wakelock is the only way to survive doze, screen-off and aggressive battery management. Not achievable from JS |
| On-device runtime | **LiteRT (TensorFlow Lite), INT8 quantised** | Most mature Android runtime with hardware delegates. `tflite-runtime` is unmaintained — we use Google's current `ai-edge-litert` |
| Acoustic model | **YAMNet**, 521-class pretrained event classifier | Pretrained on AudioSet, small enough to ship, and its classes already cover glass-break, gunshot and scream. Training our own from scratch on no labelled SA data would be worse *and* dishonest |
| Acoustic architecture | **Two-stage cascade** — cheap always-on gate, then YAMNet | Keeps average inference cost near zero on a 2 GB device. **And stage 2 can overrule stage 1** — the design that stops speech tripping glass-break |
| Vision | **Ultralytics YOLOv8** | Person / animal / vehicle / weapon in one model, fine-tunable, runs on an NPU. We classify rather than detect motion, which is the whole answer to the PIR problem |
| Face | **InsightFace ArcFace** → embeddings only | We need re-identification, not identification. ArcFace gives a vector; we never store the image. Privacy enforced at the layer that can enforce it |
| Plate | **EasyOCR + a confusion-aware comparison stage** | Plates are a closed vocabulary read by open-vocabulary models. The comparison stage exists because ADR-0007 documents what happens without it |
| Appliance compute | **ARM SoC with on-board NPU**, sealed enclosure | Inference must be local. A cloud round-trip is a single point of failure in a country with load-shedding and cable theft |
| Appliance power | **LiFePO4, 48–72 h** | Framed correctly: cutting power is step one of a break-in, so the battery is a **countermeasure**, not a load-shedding convenience |
| Appliance network | Wi-Fi primary, **LTE failover** on prepaid SIM | Both can be cut. The local queue and the siren still work, because the brain is on the box |

---

## 2 · The decision layer

| Component | Choice | Why this, not the alternative |
|---|---|---|
| Fusion | **Calibrated log-odds Bayesian fusion** | `posterior = σ(prior + Σ wᵢ·logit(pᵢ))`. Linear in log-odds, explainable to an operator, and every factor's contribution is inspectable |
| **Rejected** | ~~Naive Dempster-Shafer~~ | **ADR-0005.** D-S misbehaves under high conflict (Zadeh's paradox) — and our worst cases *are* high-conflict. Choosing the less impressive-sounding method for a stated reason |
| Conflict handling | **Explicit coefficient K** over opposing-sign pairs | Most systems average disagreement away. We treat it as information: high K **suppresses** escalation and routes to verification |
| Escalation | **L0–L3 with per-level hysteresis** (separate θ_up / θ_down) | A single threshold chatters at the boundary. Hysteresis is what makes the state machine stable enough to trust with a siren |
| Context prior | Load-shedding stage, area risk, hour-of-day, sunrise/sunset | The same acoustic evidence means something different at 02:00 during stage 4 than at 14:00 in sunlight. **Honest caveat: the β coefficients are provisional, not fitted** |
| Decay | **Lazy, at read time** — `0.5^(days/7)` | Solves "no scheduler in a single-process deployment" without changing half-life behaviour. Also the ethical feature: nobody has to decide to forgive you |
| Independence rule | Only physically independent channels may be fused | Mic vs IMU vs Bluetooth radio are independent. Stacking several models that read the same signal and multiplying their error rates is the discredited claim in our honesty ledger |

---

## 3 · Data science & ML

| Component | Choice | Why |
|---|---|---|
| Core | **Python 3.11**, pandas, NumPy, scikit-learn, statsmodels | Team fluency; the pipeline is reproducible and auditable rather than clever |
| Geocoding | **Nominatim, cached and checked in** | 709 suburbs resolved. Cached because a demo must not depend on a rate-limited third party, and checked in so the result is reproducible |
| Official data | **SAPS quarterly statistics** — 678 precincts, 9 provinces, per-crime trend | Public domain. No POPIA exposure in the data product, and more credible with a public-sector panel than private data |
| Calibration | **`ml/eval/calibration.py`** — reliability diagrams, ECE | Because "calibrated" is a claim that requires measurement. The harness exists so the requirement is enforced rather than merely documented |
| False alarms | **`ml/eval/fa_budget.py`** — false escalations per user-week | Turns alert fatigue into a number that can be gated in CI instead of asserted by feel |
| Forecast | Per-suburb trend with a **published held-out backtest** | ⚠️ **It currently loses to a constant: MAE 0.484 vs 0.246.** Published in the repo, on the honesty slide, being re-based on SAPS severity plus near-repeat patterns |
| Optimisation | **Google OR-Tools** — team orienteering | Maximise risk-weighted coverage under a fuel budget. **12-minute dwell** from the deterrence literature — 11–15 minutes is the dose that measurably suppresses crime; five does nothing and an hour is waste |
| Spatial | **H3 hexagonal indexing** | Uniform cells, no projection distortion at SA latitudes, and neighbour queries are cheap |
| Planned | Small local **vision-language model** (Moondream2 / SmolVLM class) | YOLO detects *objects*; it cannot detect *behaviour* — climbing, loitering, trying handles. A VLM can, locally. **It enters fusion as an explicitly uncalibrated, low-weight factor, never as a verdict** — ADR-0007's principle applies |

---

## 4 · Backend — UMOJA

| Component | Choice | Why |
|---|---|---|
| Framework | **FastAPI + WebSockets** | Native async, Pydantic validation at the boundary, and WS for sub-second fan-out. **Measured 318 ms p95** (n = 10) end-to-end |
| WS routing | **Room-scoped** — `/ws/ops`, `/ws/member` | A member socket must never receive operator traffic. Enforced and tested, not assumed |
| Database | **SQLite → PostgreSQL + pgvector** | SQLite for offline and local; Postgres with pgvector for embedding similarity search at scale. One migration path, decided on day zero |
| Migrations | **Alembic from the first commit** | Not a single init script. Schema state is never ad-hoc, and the upgrade path to Postgres was designed rather than discovered |
| Validation | **Pydantic at every boundary** | Contract tests assert exact **shapes**, not status codes. A wrong-shaped response is a failure |
| Protection | Rate-limit middleware, operator auth, per-object authorisation | OWASP A01 and API4. Object-level, not route-level — which is where most APIs actually break |
| Degradation | **Local queue, store-and-forward, stale-marked data** | Every layer defines its behaviour when the layer above disappears. The dashboard shows old data labelled old; it never shows blank and it never invents |

---

## 5 · ANCHOR — the ledger

| Component | Choice | Why this, not the alternative |
|---|---|---|
| Chain structure | **SHA-256 prev-hash chain** + standalone verifier | Already built and tested against a mutated field *and* a broken pointer, returning the first break. Tamper-**evident** |
| Signatures | **Ed25519**, one keypair per party | Small, fast, well-audited. Device / operator / security company each sign their own assertions, so a revision is visible as a revision |
| Batching | **Hourly Merkle tree** | One root covers every household. This is the economic design: batching makes the cost **fixed**, not per-user |
| Public chain | **OpenTimestamps → Bitcoin** | Free, no wallet, no token, no account — and chosen for **longevity**. A claim may reach court in ten years; if the chain you anchored to has died, your proof died with it |
| Alternative | **Hedera Consensus Service** | ~3–5 s finality, ~$0.0001/message, purpose-built for tamper-proof event ordering. Our fallback if low latency ever matters |
| **Rejected** | ~~Private / permissioned chain alone~~ | A chain whose validators are the insurer, the security company and us does **not** solve the trust problem *for the member* — the parties in the dispute would be running the nodes. A private layer is fine for throughput; the **anchor must be public** |
| **Rejected** | ~~Alerts on-chain~~ | Our relay is 318 ms (n = 10). The fastest chain is ~2 s. Consensus in the alert path costs lives and buys nothing |
| **Rejected** | ~~Tokens, smart-contract auto-dispatch, gate unlock~~ | The first is decoration; the second and third violate **ADR-0002** — no machine-alone consequence on probabilistic inference |
| On-chain payload | **32-byte root only** | No faces, no voices, no locations. A hash of a hash |
| Governance | **2-of-2 multi-signature** on whitelist / disarm / threshold / delete | Closes the highest-value insider attack — a whitelisted entity accumulates **no** suspicion at all, and one operator could add one alone |
| Deletion | Payload removed, hash retained | *The record that a decision happened is permanent; the data about the person is not.* The chain never held it, so deletion cannot break it |

---

## 6 · Frontend

| Component | Choice | Why |
|---|---|---|
| Framework | **React + Vite + TypeScript (strict)** | Strict mode catches contract drift at compile time between the frontend and the frozen API contract |
| Styling | **Tailwind** with a documented token set | Tokens mean light/dark and accessibility changes happen in one place |
| Maps | **MapLibre GL + deck.gl** for H3 layers; **Leaflet** for the static hot-spot artefact | MapLibre is open, no vendor key, no per-load billing. deck.gl handles H3 hexes at scale |
| Realtime | WebSocket live feed | Same relay as the alert path. One transport, one latency figure to defend |
| Audio | **WebAudio** in-browser detection | Lets the acoustic story be demonstrated live in a browser with no install |
| Screens | 20 built; **14 exported design-handoff specifications** | The rubric names *wireframing* as scored evidence. Ours are committed artefacts, not intentions |

---

## 7 · Context feeds

| Feed | Use |
|---|---|
| **EskomSePush** | Load-shedding stage → context prior. Cached so it works offline |
| **WeatherAPI** | Rain and storms → suppresses thunder false-positives on the acoustic channel |
| **Sunrise / sunset** | Darkness as a real risk factor rather than a clock heuristic |
| **SAPS quarterly statistics** | Area risk baseline, per precinct, per crime type, with trend direction |
| **ACLED** | Unrest and event context |
| SA holidays and paydays | Known demand and risk peaks |

---

## 8 · Security & compliance

| Area | Implementation |
|---|---|
| **Threat model** | OWASP **Top 10** and **API Security Top 10**, plus abuse cases where the operator, the vendor and the state are modelled as adversaries |
| **A08 Data integrity** | The signed, anchored chain **is** the control |
| **A09 Logging & monitoring** | Append-only, signed, publicly anchored log. Logging the operator cannot quietly edit is materially stronger than logging they can |
| A01 Access control | Per-object authorisation; 2-of-2 on destructive actions; room-scoped sockets |
| A02 Cryptography | Vectors not images; 3-second audio ring buffer; TLS; encryption at rest |
| A03 Injection | Parameterised ORM; Pydantic schema validation on every boundary |
| A04 Insecure design | 25 ADRs; documented threat model; **human gate enforced in code** |
| A05/A06 | No default credentials; `.env` only; pinned dependencies; CI; **secret scanning as a pre-commit hook and a CI gate** |
| **POPIA** | Biometrics as vectors only; retention TTL in the data layer; subject-access route; deletion that preserves the hash. ⚠️ **ADR-0006 records this as an open obligation — closing it is in the current cycle** |
| Testing | 440 contract tests · security-property tests (the human gate is a *test*, not a comment) · planned SAST, DAST, dependency scanning, ingest fuzzing, penetration test, bias evaluation |

---

## 9 · Practice & infrastructure

| Area | Choice |
|---|---|
| Method | **Spec-driven** — numbered requirements → frozen contracts → implementation → verification mapped back to the requirement |
| Repository | Public. `.env` gitignored with a committed `.env.example` carrying no values |
| Review | A pull request for **everything** — code, docs, design. CODEOWNERS, PR template |
| Decisions | **25 accepted ADRs**, append-only. Never edited — superseded |
| Discipline | *Docs-or-it-didn't-happen*: a behaviour change requires a documentation update and a build-log entry in the same PR |
| CI | GitHub Actions — tests, lint, dependency scan, secret scan |
| Deployment | Docker; Azure (student subscription); Cloudflare tunnel for cross-machine demos |
| Honesty | `sim_` prefix on every simulated component, in code **and** named aloud. A written ledger of claims we refuse to make |

---

## 10 · What we deliberately did not use

| Not used | Why |
|---|---|
| Cloud vision APIs (Rekognition, Vision AI) | The decision must survive with no internet. Also: sending faces to a third party contradicts our privacy boundary |
| Commercial facial-recognition licensing | Open models, human-gated. The gate is the control, not the vendor |
| Generative models anywhere in the determination path | **ADR-0007** — the invention is unfalsifiable from the output |
| Video storage at scale | We store vectors and labels. Compromising our appliance yields far less than compromising a conventional recorder |
| Tokens, wallets, DeFi primitives | Nothing in this product needs them, and pretending otherwise would be the exact overclaim our ledger forbids |
