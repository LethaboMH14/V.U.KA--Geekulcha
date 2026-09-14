# app/ — VIGIL

**The person.** Android, on-device, offline-first. Satisfies F1–F4, F9 (`docs/00-SPEC.md` §3.1).

**Empty scaffold.** No code lands here yet — this directory exists so the port (`docs/HANDOVER.md` Task 4) has somewhere to go without a directory-creation merge collision. The working system this ports from exists in the predecessor codebase; see `docs/HANDOVER.md` §1 and §4.

## Structure

```
android/
  service/          Kotlin foreground service — background audio, motion, PIN sensing
  modules/           Native bridges: AudioSensor, MotionSensor, PinSensor
  assets/models/     Shipped LiteRT (TFLite) models, INT8-quantised, ≤ 20 MB total (N4)
src/
  sensors/           Sensor read paths feeding the fusion brain
  brain/             Fusion, state machine — pure functions, no I/O. Golden-fixture-shared with brain/ (root)
  evidence/          Ring buffer, hash chain, encrypted local store
  api/               Client for UMOJA's frozen contract (shared/contract.ts)
  ui/                Screens — 12 priority wireframes land here (G11 in docs/OPEN-GAPS.md)
```

## Non-negotiable, before any code lands here

- **TypeScript strict** (`docs/HANDOVER.md` §7, `RULES.md`).
- `src/brain/` is a **pure function** — no I/O, no clock, no platform calls. One golden fixture is the referee for both this and `server/`'s equivalent (`docs/00-SPEC.md` §3.1 fusion formula).
- The duress credential (F3): real PIN and duress PIN unlock **identically** — same animation, same latency, same subsequent UI state, no observable network/UI/timing difference. This is the founding abuse case; a test must assert the absence of a difference, not just the presence of the duress path.
- Model manifest with sha256 for every shipped model. Verify by loading the interpreter and reading `get_input_details()` — a recorded-metadata mismatch caught a real bug in July (`docs/HANDOVER.md` §6, `RULES.md`).
- No code path may set `flagged`. Machine ceiling is `watch_candidate` (E1, `docs/00-SPEC.md` §4.3).

## Budgets this directory is measured against

Per-inference latency ≤ 50 ms on a 2 GB device (N5); vision throughput ≥ 8 FPS (N3); shipped model budget ≤ 20 MB (N4). See `docs/00-SPEC.md` §2.2.
