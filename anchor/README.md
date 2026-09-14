# anchor/ — ANCHOR

**The record.** Hash chain, signatures, public anchor. Satisfies F11–F16, E4 (`docs/00-SPEC.md` §3.4).

**This directory is genuinely new work** — unlike `app/`, `server/`, `appliance/`, `brain/`, `data/`, `dashboard/`, nothing here is a port. It is designed in `docs/00-SPEC.md` §3.4 and `docs/ANCHOR-RATIONALE.md`, and built fresh (`docs/HANDOVER.md` Task 5).

## Files to be added (Task 5, `docs/HANDOVER.md` §7)

| File | Does |
|---|---|
| `chain.py` | Prev-hash chain. Ports the hashing/pointer logic from `server/src/db` once that lands |
| `sign.py` | Ed25519 per-party keypairs — one each for device, operator, security company |
| `merkle.py` | Hourly batching → one 32-byte root. **Nothing else goes on chain, ever** (E4) |
| `publish.py` | OpenTimestamps client, chosen over a permissioned chain for longevity — see `docs/ANCHOR-RATIONALE.md` |
| `verify.py` | Integrity + anchor verification. **Returns the first broken link by index, not a boolean** — this is a frozen contract (`docs/00-SPEC.md` §4.2) |
| `subject.py` | Subject access (F14) + deletion that removes the payload and retains the hash (F15) |

## Non-negotiable, before any code lands here

- **Canonical serialisation is not a style choice.** `event_hash = SHA256(json.dumps(entry, sort_keys=True))`. `sort_keys=True` is what lets a stranger reproduce the hash independently — this is the entire point of the anchor.
- **`verify.py` returns the first broken link, not pass/fail.** A boolean tells an operator something is wrong; an index tells them what and where.
- **32 bytes per hour, nothing else.** No personal data reaches the chain under any circumstance (E4).
- **Deletion preserves the hash.** The record that a decision happened is permanent; the data about the person is not. Since the chain never held the payload, deletion cannot break the chain (D8/F15).

## What the anchor actually buys

Not immutability — the evidence chain already has that internally. **Precedence**: proof a record existed *before anyone had a reason to falsify it*. See `docs/ANCHOR-RATIONALE.md` for the full argument and the three uses of blockchain that were considered and refused.

## Budgets this directory is measured against

On-chain footprint ≤ 32 B/hour (N7); anchoring cost for the whole network < R5/month, modelled at ~R1.30 (N8); anchor liveness 100% of hours, enforced in CI once `verify.py` exists (`docs/00-SPEC.md` §2.2).
