# brain/ — shared fusion

Pure functions. No I/O, no clock, no platform calls, no exceptions. Satisfies F2 (`docs/00-SPEC.md` §3.1).

**Empty scaffold.** No code lands here yet — see `docs/HANDOVER.md` Task 4. This directory and `app/src/brain/fusion/` are ported **together**, from the same golden fixture, so a web/native discrepancy is caught by a shared test rather than discovered live.

## Why this directory is separate from `app/` and `server/`

Both VIGIL (on-device) and UMOJA (server-side risk) need the identical fusion math to agree. Putting it in one pure-function module with no side effects means **one golden fixture is the referee for both** — `docs/HANDOVER.md` §6.

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
