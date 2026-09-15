# brain/ — shared fusion

Pure functions. No I/O, no clock, no platform calls, no exceptions. Satisfies F2 (`docs/00-SPEC.md` §3.1).

**Port landed 15 Sep 2026.** `fusion.py` (Entity, recompute, human_verify, F1 recurrence, F6 modal corroboration) and `entity_resolution.py` (confusion-aware Levenshtein, plate matching) ported from the BEACON predecessor per `docs/HANDOVER.md` Task 4. Ported with sanitization: `verify_concern` naming aligned to the v0.1.0 frozen contract; BEACON docstrings updated to VUKA references. 20 pytest tests pass (Python 3.11, pytest 8.0). `FACT`

F2-F5 are TODO stubs — the escalation ladder needs claims-peak histogram, near-repeat kernel, dwell baseline and road-graph data before those factors can be implemented. `OPEN-GAPS.md` G4.

## Why this directory is separate from `app/` and `server/`

## Why this directory is separate from `app/` and `server/`

Both VIGIL (on-device) and UMOJA (server-side risk) need the identical fusion math to agree. Putting it in one pure-function module with no side effects means **one golden fixture is the referee for both** — `docs/HANDOVER.md` §6.

> ⚠️ **ADR-0029 — the server consumes this module; it does not implement its own.** The predecessor (`BEACON`) drifted: `brain/fusion.py` (log-odds, `watch_candidate`) was orphaned while the server used a divergent `server/src/suspicion/scorer.py` (additive weights, state `candidate`), and `server/src/suspicion/entity_resolution.py` was a second copy of `brain/entity_resolution.py`. Porting `server/` **must not** copy `scorer.py` or the server's `entity_resolution.py`. The server imports `brain/fusion.py`, calls `recompute()`, and persists the result. The state vocabulary is the frozen contract's — `observed`, `watch_candidate`, `flagged`, `dismissed`, `whitelisted`; `candidate` is not a valid state anywhere.

## The fusion, formally (`docs/00-SPEC.md` §3.1)

```
prior      = base + β_stage·stage + β_cell·cellRisk + β_hour·hourRisk
posterior  = σ( prior + Σᵢ wᵢ · logit(pᵢ) )
K          = 1 − exp( − mean over opposing pairs of min(|llrᵢ|,|llrⱼ|) )
```

Escalation requires `posterior ≥ θ_up[level]` **and** `K ≤ conflictK`. High conflict routes to verification, never gets averaged away — disagreement is information (D4 in the wider architecture).

## Non-negotiable, before any code lands here

- **No I/O.** Not a database call, not a clock read, not a platform API. This is what makes one fixture valid for two runtimes.
- **A raw softmax entering fusion is a correctness bug, not a style issue** (E6). Every probability shown to a human is either calibrated or explicitly labelled a target.
- ⚠️ **The weights `wᵢ` and the β coefficients are currently hand-set from a documented cost matrix, not fitted on data** — this is G1 in `docs/OPEN-GAPS.md`, gated at G4 · Calibrate (23 Sep). The parameter file must self-label `PROVISIONAL — NOT fit on real data` until that closes.
- Only physically independent senses are fused (mic, IMU, Bluetooth radio, camera) — stacking two models reading the same signal and multiplying their error rates is a discredited claim in this project's own honesty ledger.
