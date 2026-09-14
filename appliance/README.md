# appliance/ — KHAYA

**The property.** Edge appliance, vision and acoustics. Satisfies F5, F6, F16 (`docs/00-SPEC.md` §3.2).

**Empty scaffold.** No code lands here yet — see `docs/HANDOVER.md` Task 4 for port order and `docs/HANDOVER.md` §1 for where the working version currently exists.

## Structure

```
vision/     YOLOv8 person/animal/vehicle/weapon detection — classifies, not just motion (F5)
audio/      Two-stage acoustic cascade. Stage 1: cheap always-on gate. Stage 2: YAMNet,
            which can OVERRULE stage 1 (F6) — e.g. a glass-break candidate dismissed by
            stage 2 as speech
agent.py    Local decision loop, queue, siren/floodlight control, heartbeat signing —
            does not exist yet; lands with the vision/ and audio/ ports (Task 4)
```

## Non-negotiable, before any code lands here

- **Embeddings, never images.** Enforced here, in the vision layer, not upstream in policy — a policy change elsewhere must not be able to weaken this (E2, D7).
- **Raw audio never persisted.** Three-second ring buffer only (E3).
- **Signed heartbeat.** If the appliance is destroyed, the missing heartbeat is itself timestamped evidence via `anchor/` (F16) — destroying the evidence becomes the evidence.
- **Deterrent actions require a human-visible cancel window.** No autonomous gate unlock, no countermeasure that injures, no dispatch announced before it has occurred (E9, `docs/AI-AUTONOMY.md`).
- Tamper (case switch + accelerometer) → immediate signed event, not a silent log line.

## Budgets this directory is measured against

Person-detection throughput ≥ 8 FPS (N3); false alerts ≤ 1 per camera-week (N9, currently in evaluation — see `docs/OPEN-GAPS.md`); appliance runtime 48–72 h on battery (N6, currently design-only, hardware not fabricated — G10).
