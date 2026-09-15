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

## D2 — Evidence-integrity response shape  ·  **OPEN — correction required in the `server/` port**

| | |
|---|---|
| **Contract** | `contracts/openapi.yaml` → `GET /v1/evidence/integrity` returns `IntegrityResult`: **required** `is_intact`, `first_broken_index` (`[integer, 'null']`, `minimum: 0`), `detail` (`string`); `additionalProperties: false`. |
| **Predecessor** | `BEACON/server/src/db/evidence_integrity.py` returns a dataclass with `is_intact`, `total_events`, `broken_at_id`, `broken_at_seq`, `detail`. `BEACON/server/src/api/entities.py:403-404` serialises `broken_at_id` and `broken_at_seq`. |
| **Divergence** | Field names differ: the contract wants `first_broken_index`; the predecessor emits `broken_at_seq`. The predecessor also emits `total_events` and `broken_at_id`, which `additionalProperties: false` forbids. |
| **Correction** | In the port: map `broken_at_seq` → **`first_broken_index`**; drop or re-home `total_events` and `broken_at_id` (or amend the contract — a decision, not an assumption). Resolve **1-based vs 0-based**: the contract says `minimum: 0` (suggesting 0-based), the predecessor enumerates `start=1` (1-based). Pick one and assert it in the contract test. |
| **Evidence** | `contracts/openapi.yaml` `IntegrityResult`; `BEACON/server/src/db/evidence_integrity.py:27-33`; `BEACON/server/src/api/entities.py:392-404`. `FACT` |

---

## D3 — Sighting / event ingest shape  ·  **OPEN — blocks the `server/` port and the contract freeze**

| | |
|---|---|
| **Contract** | `contracts/openapi.yaml` → `POST /v1/sightings` accepts `Sighting` (or an array of it). `Sighting` is a 7-field envelope: `version`, `event_id`, `tenant`, `source_time`, `received_time`, `sim_`, `freshness`; `additionalProperties: false`. `contracts/events.schema.json` is the same shape. |
| **Predecessor** | `BEACON/server/src/api/sightings.py` `SightingCreate` accepts the domain payload: `camera_id`, `hex_id`, `kind`, `modality`, `confidence`, `bbox`, `embedding_ref`, `embedding`, `plate_text`, `plate_quality`, `clip_ref`. |
| **Divergence** | The contract's `Sighting` carries **none** of the domain fields the system consumes. `brain/fusion.py` reads `camera_id`, `hex_id` and a timestamp from each sighting; `scorer.py` reads `kind`, `modality`, `confidence`. Against the contract as written, `POST /v1/sightings` cannot accept a sighting the fusion can use. |
| **Why it matters** | This is a **material contract defect**, not a naming nit. The server cannot implement ingest to the contract and run fusion against the result. It also means the contract cannot be called frozen (`P2.16`) until resolved — the freeze is `◐` pending both-lead approval precisely for this kind of finding. |
| **Correction (options — a decision, not an assumption)** | (a) **Extend the contract's `Sighting`** to carry the domain fields (`camera_id`, `hex_id`, `kind`, `modality`, `confidence`, `plate_text`, `embedding_ref`, …) alongside the envelope fields; or (b) **nest a domain schema** — e.g. `Sighting { envelope…, detail: SightingDetail }` — keeping the transport envelope minimal and versioned; or (c) keep the 7-field envelope as the *cross-boundary* event and add a separate ingest schema. The envelope-vs-payload split that (b)/(c) imply is the cleaner architecture, but the choice belongs in the contract and an ADR, and it must be taken **before** `Sighting` is called frozen. |
| **Consequence if unaddressed** | The ported `server/` and the ported `app/` would agree with each other but both disagree with the frozen contract — the divergence re-enters at a different layer. |
| **Evidence** | `contracts/openapi.yaml` `Sighting` + `POST /v1/sightings`; `contracts/events.schema.json`; `brain/fusion.py:64-79` (reads `camera_id`, `hex_id`, `ts`); `BEACON/server/src/api/sightings.py:48-68`; `BEACON/server/src/suspicion/scorer.py` (reads `kind`, `modality`). `FACT` |

---

## Adding to this register

When a port step reads a predecessor file and finds a mismatch with the contract, add a row here before porting the file. Keep each entry to: the contract, the predecessor, the divergence, the correction, the evidence. If the correction changes a frozen interface, it needs an ADR, not just this row.

*Opened 15 Sep 2026. D1 closed by ADR-0029. D2 and D3 are corrections for the `server/` port — D3 is the material one and touches `P2.16`.*