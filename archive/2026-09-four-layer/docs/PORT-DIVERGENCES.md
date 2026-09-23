# Port divergences — predecessor code vs this repository's frozen contract

> **What this is.** During the Task 4 port (`docs/HANDOVER.md`), predecessor files are read individually before being copied. Where the predecessor's shape, name or model **differs from this repository's frozen contract** (`contracts/events.schema.json`, `contracts/openapi.yaml`), the difference is recorded here with the correction required — so the port does not silently import the predecessor's assumptions.
>
> **Method.** Read the predecessor file → compare against the contract → log the divergence and its correction → apply the correction in the port. A divergence is closed when the ported code and a test both match the contract. Owner: Lethabo (architecture). Reviewed by Sibusiso for the server surface.
>
> Predecessors inspected read-only 15 Sep 2026: `LethaboMH14/BEACON`, `LethaboMH14/Team-Sonar---Vuka-`.

---

## D1 — Fusion model and state vocabulary  ·  **CLOSED (ADR-0029)**

| | |
|---|---|
| **Divergence** | `BEACON` carried two fusion implementations. `brain/fusion.py` used calibrated log-odds (F1 `2.2`, threshold `2.0`) and state `watch_candidate`; it was imported only by its own tests. `server/src/suspicion/scorer.py` used additive weights (F1 `0.40`, threshold `0.40`) and state `candidate`; it was imported by `api/sightings.py`, `api/entities.py` and `demo_reset.py`. The server DB default comment read `# observed, candidate, flagged`. |
| **Why it matters** | The same sighting scored differently on the device and the server, with different state names — a cross-layer divergence no single test could catch. The contract uses `watch_candidate`; `candidate` is not a valid state. |
| **Correction** | **ADR-0029.** `brain/` is the single fusion source; the server consumes it (`scorer.py` is not ported, and the server's duplicate `entity_resolution.py` is not ported). State vocabulary is the contract's: `observed` / `watch_candidate` / `flagged` / `dismissed` / `whitelisted`. |
| **Evidence** | `git grep` over `BEACON/`, 15 Sep 2026 — all `FACT`. |

---

## D2 — Evidence-integrity response shape  ·  **DECIDED — 0-based index, ADR-0030 §D2. Field mapping still applies at port time**

| | |
|---|---|
| **Contract** | `contracts/openapi.yaml` → `GET /v1/evidence/integrity` returns `IntegrityResult`: **required** `is_intact`, `first_broken_index` (`[integer, 'null']`, `minimum: 0`), `detail` (`string`); `additionalProperties: false`. |
| **Predecessor** | `BEACON/server/src/db/evidence_integrity.py` returns a dataclass with `is_intact`, `total_events`, `broken_at_id`, `broken_at_seq`, `detail`. `BEACON/server/src/api/entities.py:403-404` serialises `broken_at_id` and `broken_at_seq`. |
| **Divergence** | Field names differ: the contract wants `first_broken_index`; the predecessor emits `broken_at_seq`. The predecessor also emits `total_events` and `broken_at_id`, which `additionalProperties: false` forbids. |
| **Correction** | In the port: map `broken_at_seq` → **`first_broken_index`**; drop or re-home `total_events` and `broken_at_id` (or amend the contract — a decision, not an assumption). Resolve **1-based vs 0-based**: the contract says `minimum: 0` (suggesting 0-based), the predecessor enumerates `start=1` (1-based). Pick one and assert it in the contract test. |
| **Evidence** | `contracts/openapi.yaml` `IntegrityResult`; `BEACON/server/src/db/evidence_integrity.py:27-33`; `BEACON/server/src/api/entities.py:392-404`. `FACT` |

---

## D3 — Sighting / event ingest shape  ·  **CLOSED — ADR-0030 (15 Sep)**

| | |
|---|---|
| **Contract** | `contracts/openapi.yaml` → `POST /v1/sightings` accepts `Sighting` (or an array of it). `Sighting` is a 7-field envelope: `version`, `event_id`, `tenant`, `source_time`, `received_time`, `sim_`, `freshness`; `additionalProperties: false`. `contracts/events.schema.json` is the same shape. |
| **Predecessor** | `BEACON/server/src/api/sightings.py` `SightingCreate` accepts the domain payload: `camera_id`, `hex_id`, `kind`, `modality`, `confidence`, `bbox`, `embedding_ref`, `embedding`, `plate_text`, `plate_quality`, `clip_ref`. |
| **Contract vs this repo's own architecture** | The contract also contradicts this repository's own documents. `docs/01-ARCHITECTURE.md:2581` defines **`Sighting` = "One detection event: (entity, camera, hex, ts, modality, confidence)"** — the domain object. `docs/01-ARCHITECTURE.md:1431` says the same: *"One detection event: entity, camera, hex cell, timestamp, modality, calibrated confidence."* `docs/00-SPEC.md:222` describes `POST /v1/sightings` as *"single or batch ingest; signature required."* So the contract's 7-field envelope is named `Sighting`, while the architecture names the detection event `Sighting`. The contract is the odd one out — against both the predecessor **and** the architecture. |
| **Divergence** | The contract's `Sighting` carries **none** of the domain fields the system consumes. `brain/fusion.py` reads `camera_id`, `hex_id` and a timestamp from each sighting; `scorer.py` reads `kind`, `modality`, `confidence`. Against the contract as written, `POST /v1/sightings` cannot accept a sighting the fusion can use. |
| **Why it matters** | This is a **material contract defect**, not a naming nit. The server cannot implement ingest to the contract and run fusion against the result. It also means the contract cannot be called frozen (`P2.16`) until resolved — the freeze is `◐` pending both-lead approval precisely for this kind of finding. |
| **Recommendation (proposed for Sibusiso's decision)** | Align the contract to the architecture, which is the reverse of the usual direction. **`Sighting` should mean the detection event** — `entity`/`camera_id`, `hex_id`, `ts` (`source_time`), `modality`, `confidence`, plus the optional `kind`, `bbox`, `plate_text`, `plate_quality`, `embedding_ref` — per `01-ARCHITECTURE.md` §2581. The **7-field object in `events.schema.json` is the transport envelope** crossing edge/service/evidence boundaries and should be named as such (e.g. `EventEnvelope` or `SightingEvent`), wrapping the sighting payload rather than being it. This keeps the versioned wire envelope separate from the domain payload, matches both the architecture and the predecessor's field set, and lets `sim_`/`freshness`/`tenant` attach to every event type, not just sightings. |
| **Rejected alternatives** | (a) *Extend the contract's `Sighting` with domain fields and keep the envelope fields on the same object* — collapses transport and domain into one schema; the envelope's `sim_`/`freshness` then have no consistent meaning across event types. (b) *Leave the contract and reshape the predecessor payload to the 7 fields* — loses `camera_id`/`hex_id`/`confidence`, so fusion cannot run; equivalent to deleting the sighting. Both rejected for the same reason: they make the wire shape carry domain meaning the architecture puts elsewhere. |
| **Consequence if unaddressed** | The ported `server/` and the ported `app/` would agree with each other but both disagree with the frozen contract — the divergence re-enters at a different layer. |
| **Evidence** | `contracts/openapi.yaml` `Sighting` + `POST /v1/sightings`; `contracts/events.schema.json`; `docs/01-ARCHITECTURE.md:1431,2581`; `docs/00-SPEC.md:222`; `brain/fusion.py:64-79` (reads `camera_id`, `hex_id`, `ts`); `BEACON/server/src/api/sightings.py:48-68`; `BEACON/server/src/suspicion/scorer.py` (reads `kind`, `modality`). `FACT` |

---

## D4 — Proprietary claims-data dependency  ·  **OPEN — port must not re-introduce the purged dataset**

| | |
|---|---|
| **This repository's rule** | `RULES.md`: *"Do not commit … third-party claims data."* Gap **G7** (closed 13 Sep 2026) removed `Gradhack_Insure_Data.xlsx`, `claims_cleaned.csv` and `claims_cleaned.xlsx` from every branch of both predecessors. |
| **Predecessor** | The removed dataset is a **hard dependency** of code that would otherwise be ported: `server/src/db/models.py:176` defines a `Claim` model (table `claims`, `claim_date`, `hex_id`); `server/scripts/load_claims.py` reads `Gradhack_Insure_Data.xlsx` (`pd.read_excel`); `server/src/risk/forecast.py` and `server/src/suspicion/scorer.py:177` (factor F3, crime correlation) query `Claim`; `server/alembic/versions/001_initial_schema.py` creates the `claims` table; several `server/tests/` seed `Claim` rows; `hotspot_pipeline/` (`build_hotspots.py`, `clean_claims_data.py`, `integrate_saps.py`, `build_saps_only.py`) and `data_prep/` (`clean_claims_data.py`, `predictive_model.py`) build hotspots/forecasts from it. |
| **Divergence** | Porting these files — or the `Claim` model and its schema — re-introduces a dependency on the third-party dataset that was deliberately purged. The clean repo is meant to re-base the risk layer on public SAPS data (`docs/00-SPEC.md` §1.3, §7). |
| **Correction** | The port **does not carry** the `claims` table, `load_claims.py`, or any path that reads `Claim`. `scorer.py` is already excluded (ADR-0029); F3 (crime correlation) and the `risk/` forecast are re-based on public SAPS data — the relevant predecessor sources are `saps_ingestion.py`, `inspect_saps.py` and `hotspot_pipeline/build_saps_only.py`, which use public SAPS figures and must pass a **provenance/licence review** (`RULES.md`) before being ported. Until re-based, F3 stays a documented stub (as `brain/fusion.py` already has it) and the forecast keeps its published "loses to a constant baseline" caveat (G2). |
| **Why it matters** | This is a **security/compliance** port guard, not a naming nit. A ported `Claim` model with an empty table is harmless; a ported loader pointed at the purged dataset, or a test that seeds proprietary rows, is the G7 exposure returning through the code path. The distinction the port must preserve: **public SAPS aggregates are allowed; the third-party claim records are not.** |
| **Evidence** | `git grep` over both read-only predecessor checkouts, 15 Sep 2026: `Gradhack_Insure_Data` / `claims_cleaned` / `.xlsx` matches in `BEACON` (28 files incl. `server/`, `hotspot_pipeline/`, `data_prep/`) and `Team-Sonar---Vuka-` (`vuka/data-pipeline/`). `BEACON/server/src/db/models.py:176-198`; `BEACON/server/scripts/load_claims.py:2,21,36-37`; `BEACON/server/src/suspicion/scorer.py:177`. `FACT` |

---

## Adding to this register

When a port step reads a predecessor file and finds a mismatch with the contract, add a row here before porting the file. Keep each entry to: the contract, the predecessor, the divergence, the correction, the evidence. If the correction changes a frozen interface, it needs an ADR, not just this row.

*Opened 15 Sep 2026. D1 closed by ADR-0029. D3 closed the same day by ADR-0030, which accepted Lethabo's recommendation exactly as proposed: `contracts/openapi.yaml`'s bare 7-field schema renamed `EventEnvelope`, a new `Sighting` schema added for the domain payload per `01-ARCHITECTURE.md` §2581, composed as `SightingEvent` (envelope + payload) for `POST /v1/sightings`, then corrected same-ADR when Lethabo's own PR #23 review found the naive two-branch-`additionalProperties: false` version was unsatisfiable (`unevaluatedProperties: false` fixes it — see ADR-0030). `contracts/events.schema.json` needed no change — it was already correctly envelope-only and never claimed to be `Sighting`. D2's index-base question is decided (0-based, matching the contract's existing `minimum: 0`) in the same ADR; the field-name mapping (`broken_at_seq` → `first_broken_index`) still applies whenever `server/`'s evidence-integrity endpoint is actually ported, since no such endpoint exists in this repository yet. D4 is a security/compliance guard: the purged proprietary claims dataset is a hard dependency of predecessor risk/suspicion code and must not be re-introduced by the port.*
