# appliance/ — KHAYA

**The property.** Edge appliance, vision and acoustics. Satisfies F5, F6, F16 (`docs/00-SPEC.md` §3.2).

**Current status — FACT for this branch, pending review.** WBS 3.2 adds a minimal synthetic edge producer in `agent.py`. It is a local contract and offline-replay exercise, not the real sensor appliance. Vision, audio, hardware and signed heartbeat work remain separate porting or measurement tasks.

**Transport boundary — FACT.** This producer emits the reusable `EventEnvelope`
only. The current `POST /v1/sightings` contract accepts `SightingEvent`, which is
the envelope plus a required `Sighting` payload. This WBS does not construct that
payload and must not be presented as live server-ingest capability. Payload
construction and consumer confirmation are a tracked cross-layer follow-up.

## Structure

```
vision/     YOLOv8 person/animal/vehicle/weapon detection — classifies, not just motion (F5)
audio/      Two-stage acoustic cascade. Stage 1: cheap always-on gate. Stage 2: YAMNet,
            which can OVERRULE stage 1 (F6) — e.g. a glass-break candidate dismissed by
            stage 2 as speech
agent.py    WBS 3.2 synthetic producer and local JSONL queue. The real local
            decision loop, siren/floodlight control and heartbeat signing remain
            future work with the vision/ and audio/ ports (Task 4)
```

## Non-negotiable, before any code lands here

- **Embeddings, never images.** Enforced here, in the vision layer, not upstream in policy — a policy change elsewhere must not be able to weaken this (E2, D7).
- **Raw audio never persisted.** Three-second ring buffer only (E3).
- **Signed heartbeat.** If the appliance is destroyed, the missing heartbeat is itself timestamped evidence via `anchor/` (F16) — destroying the evidence becomes the evidence.
- **Deterrent actions require a human-visible cancel window.** No autonomous gate unlock, no countermeasure that injures, no dispatch announced before it has occurred (E9, `docs/AI-AUTONOMY.md`).
- Tamper (case switch + accelerometer) → immediate signed event, not a silent log line.

## WBS 3.2 boundary — FACT scope limits

The producer uses deterministic synthetic events and a local file queue. It does
not measure sensor accuracy, physical tamper detection, power consumption,
battery runtime, mains-loss recovery, network recovery duration, or delivery to
a live consumer. Sudden power loss, disk corruption, concurrent writers and a
full disk are not tested. All fixtures and identifiers in this slice are
explicitly `sim_`.

## Budgets this directory is measured against

Person-detection throughput ≥ 8 FPS (N3); false alerts ≤ 1 per camera-week (N9, currently in evaluation — see `docs/OPEN-GAPS.md`); appliance runtime 48–72 h on battery (N6, currently design-only, hardware not fabricated — G10).
