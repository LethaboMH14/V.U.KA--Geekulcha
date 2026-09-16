# anchor/ — ANCHOR

**The record.** Hash chain, signatures, public anchor. Satisfies F11–F16, E4 (`docs/00-SPEC.md` §3.4).

**This directory is genuinely new work** — unlike `app/`, `server/`, `appliance/`, `brain/`, `data/`, `dashboard/`, nothing here is a port. It is designed in `docs/00-SPEC.md` §3.4 and `docs/ANCHOR-RATIONALE.md`, and built fresh (`docs/HANDOVER.md` Task 5).

## Files (Task 5, `docs/HANDOVER.md` §7)

| File | Does | Status |
|---|---|---|
| `chain.py` | Prev-hash chain: builds and appends `EvidenceEntry` objects, canonical `event_hash` per the frozen formula | ✅ **built, tested** — `anchor/tests/test_chain.py` |
| `verify.py` | Integrity verification. **Returns the first broken link by index, not a boolean** — frozen contract (`docs/00-SPEC.md` §4.2, `contracts/openapi.yaml` `IntegrityResult`) | ✅ **built, tested** — `anchor/tests/test_verify.py`, including a "reports only the FIRST of two breaks" case |
| `subject.py` | Subject access (F14): assembles a `SubjectRecord` for one subject from the chain | ✅ **built, tested** — `anchor/tests/test_subject.py`. Deletion (F15) not yet implemented |
| `sign.py` | Ed25519 per-party keypairs — one each for device, operator, security company | 🔨 not started |
| `merkle.py` | Hourly batching → one 32-byte root. **Nothing else goes on chain, ever** (E4) | 🔨 not started |
| `publish.py` | OpenTimestamps client. **Must submit to multiple public calendars and schedule a prompt `ots upgrade` pass (ADR-0028) — no self-hosted calendar** | 🔨 not started — **this is what actually anchors anything publicly; until it exists, nothing in this directory is a real anchor, only a tested hash chain** |

**Honesty boundary, stated plainly because this is the showcase (SC.1, `docs/MASTER-CONTEXT.md`):** `chain.py` and `verify.py` are real, tested, cryptographic logic — not simulated. But with no `publish.py`, there is nothing to verify *against a public calendar with no cooperation from us* yet. `subject.py`'s `proof.anchor` field says exactly this (`state: "not_submitted"`, a `sim_`-prefixed note) rather than implying a live anchor exists. Do not present the current output as a completed showcase in a demo — it is real progress toward one.

## Non-negotiable, before any code lands here

- **No self-hosted OpenTimestamps calendar (ADR-0028).** `publish.py` submits every root to multiple public calendars and runs `ots upgrade` promptly once a Bitcoin confirmation lands, so the proof becomes self-verifying without ongoing calendar dependency. Do not claim this mitigation live in any deck/demo until it is actually implemented and running.

- **Canonical serialisation is not a style choice.** `event_hash = SHA256(json.dumps(entry, sort_keys=True))`. `sort_keys=True` is what lets a stranger reproduce the hash independently — this is the entire point of the anchor.
- **`verify.py` returns the first broken link, not pass/fail.** A boolean tells an operator something is wrong; an index tells them what and where.
- **32 bytes per hour, nothing else.** No personal data reaches the chain under any circumstance (E4).
- **Deletion preserves the hash.** The record that a decision happened is permanent; the data about the person is not. Since the chain never held the payload, deletion cannot break the chain (D8/F15).

## What the anchor actually buys

Not immutability — the evidence chain already has that internally. **Precedence**: proof a record existed *before anyone had a reason to falsify it*. See `docs/ANCHOR-RATIONALE.md` for the full argument and the three uses of blockchain that were considered and refused.

## Budgets this directory is measured against

On-chain footprint ≤ 32 B/hour (N7); anchoring cost for the whole network < R5/month, modelled at **~R0** on OpenTimestamps (primary, public calendar) — Hedera fallback ~R9–10/month at current pricing (N8, corrected 17 Sep, see `docs/EVIDENCE.md`); anchor liveness 100% of hours, enforced in CI once `verify.py` exists (`docs/00-SPEC.md` §2.2).
