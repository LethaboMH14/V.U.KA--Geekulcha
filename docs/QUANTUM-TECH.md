# Quantum Tech — 5 bonus points strategy

> The organisers announced: *"We have added Quantum Tech as part of the criteria (5 bonus points) and your team needs to explain / implement the technologies."* — Tiyani Nghonyama, Lead Facilitator, 15 Sep 2026. `FACT`
>
> This document is `PROPOSED` — Sibusiso must verify the cryptographic claims (he owns `anchor/`, the evidence chain, and the blockchain-track section of the architecture). Team decision is required before any claim is made on the Sonke workspace or in the demo. Until Sibusiso and both leads sign off, this is analysis, not positioning.

---

## Summary — the 1-paragraph Sonke-ready claim

> VUKA's evidence chain is built on **hash-chain and Merkle-tree primitives** — the same cryptographic structures that underpin NIST-approved post-quantum hash-based signature schemes (LMS/XMSS, SPHINCS+). The architecture decouples the anchoring layer from the signing layer: the SHA-256 hash chain proves what happened and when, and migrating the Ed25519 operator-signature layer to a post-quantum scheme is a signature-layer upgrade that preserves the entire anchored history. A broken classical signature cannot erase a confirmed hash-chain entry — the Merkle path to the public anchor verifies independently of the signer's key. The migration path is designed; it has not been implemented.

---

## The cryptographic primitives VUKA actually uses

| Primitive | Where | Quantum resistance |
|---|---|---|
| SHA-256 | Evidence chain hash links; OpenTimestamps Merkle-tree leaves; Bitcoin anchoring verification | Grover's algorithm reduces brute-force from 2^256 to 2^128 — still 128-bit classical-equivalent security. Considered quantum-safe at this bit level by NIST. |
| Merkle trees | OpenTimestamps aggregation; evidence-chain verifier (root hash → leaf proof) | Merkle-tree integrity is hash-only — no discrete-logarithm or factoring problem. Same structure as SPHINCS+, LMS, XMSS. Quantum computers do not break hash-then-Merkle-tree verification faster than classical computers. |
| Ed25519 | Operator signatures in `server/src/auth/governance.py` (`signature`, `co_signature`) | **NOT quantum-resistant.** Ed25519 is an elliptic-curve signature; Shor's algorithm breaks it on a sufficiently capable quantum computer. `FACT` |
| HMAC / HKDF | Authentication tokens, session keys | Underlying hash (SHA-256) is quantum-safe at reduced bit level; the HMAC construction itself is not believed broken by quantum attacks. `ESTIMATE` |

---

## The architecture argument — why the chain survives a signature break

VUKA's design separates two concerns that most systems couple:

1. **The anchored hash chain** (integrity + time). Every event — sighting, review, whitelist, refusal — is a SHA-256-linked entry. Periodically, the root of a Merkle tree spanning N consecutive entries is committed to Bitcoin via OpenTimestamps. Once confirmed, **no party — including VUKA, including the operator, including a quantum computer — can modify a past entry without breaking the hash chain and invalidating the Merkle proof.**

2. **The operator signatures** (actor identity). Ed25519 signatures prove who performed an action. If Ed25519 were broken, a forged operator identity could insert a fraudulent entry — but it could not delete or modify an existing anchored one. And the forgery would itself be recorded in the chain: the migrated signature scheme would verify against the new algorithm, while the pre-migration entries would be verifiable by timestamp (signed before the break) OR by replacing their signatures with a PQ scheme in a chain-fork.

This is the architectural decoupling argument. The chain's integrity is the fortress; the signature layer is the gate. If the gate is breached, the fortress still stands — and the breach is visible.

---

## What we claim

| Claim | Extent | Tag |
|---|---|---|
| VUKA's evidence chain uses SHA-256 hash links and Merkle-tree anchoring — the same primitives as NIST-approved post-quantum schemes | The primitives are shared. The implementation is classical. | `FACT` |
| SHA-256 at Grover-reduced 128-bit security is sufficient for evidence-chain integrity against quantum adversaries | Current cryptographic consensus. A quantum computer capable of 2^128 operations is decades away and physically impractical. | `ESTIMATE` |
| Migrating Ed25519 to a PQ signature scheme preserves the entire anchored history | The chain and the verifier do not depend on which algorithm produced a signature — they depend on the hash-chain integrity. Migration is a signature-layer upgrade. | `ARGUED` |
| A broken Ed25519 signature cannot erase a confirmed anchored entry | The Merkle path proves integrity independently of the signer. A forged entry would be a new chain-link, not a modification of an old one. | `ARGUED` |

---

## What we do NOT claim

| Claim | Why we refuse it |
|---|---|
| "VUKA is quantum-resistant" | Ed25519 is breakable by Shor's algorithm. The signing layer is NOT quantum-resistant. Claiming "resistant" for a system whose operator signatures are classical is dishonest. |
| "Post-quantum ready" | No PQ signature has been implemented. The migration path is designed, not built. "Ready" implies done. |
| "VUKA uses quantum computing" | False. VUKA uses no quantum hardware, no quantum algorithms, no quantum key distribution. |
| "SHA-256 is fully quantum-proof" | Grover's algorithm provides a quadratic speedup — from 2^256 to 2^128. At 128-bit security, it is practically safe but not theoretically optimal. NIST's post-quantum project targets 128-bit classical-equivalent security; SHA-256 at Grover meets this. |
| Any comparison to quantum-accelerated AI or quantum sensing | Not applicable. Our quantum argument is cryptographic only. |

---

## Sibusiso's verification checklist

These claims are architectural and Sibusiso owns the architecture of the anchor, the hash chain, and the blockchain-track positioning. Each must be checked before the claim is made on Sonke.

| # | Check | Owner |
|---|---|---|
| 1 | Verify SHA-256 at Grover-reduced 128-bit security is the current NIST/BSI/ANSSI consensus for hash-based post-quantum security. Cite the reference (NIST SP 800-208, RFC 8391, or equivalent) | Sibusiso |
| 2 | Verify the Ed25519 → PQ migration path is architecturally sound: does the evidence-chain verifier (`anchor/verifier.py`, not yet built) depend on the specific signature algorithm, or only on the hash-chain integrity? A verifier that only checks hash links is immune to signature breaks. A verifier that also validates signatures needs a migration-compatible design. | Sibusiso |
| 3 | Determine whether to implement a PQ signature demonstration (e.g., SPHINCS+ or Dilithium in a Python or JS library) as a 5-minute demo segment. The organisers said "explain / implement" — implementation, even a demo, counts more than explanation. | Sibusiso + Lethabo |
| 4 | Review what `docs/ANCHOR-RATIONALE.md` says about the public anchor and whether the post-quantum argument strengthens or weakens the existing blockchain-track position (it strengthens it — the same Merkle-tree argument applies). | Sibusiso |
| 5 | Confirm with the team: is 5 bonus points worth claiming this, given the organisers explicitly warned against overclaiming ("AI is not impressive")? The quantum argument is honest — it rests on real architectural properties — but the optics of claiming a quantum bonus for a Raspberry Pi security camera warrant a team call. | Both leads |

---

## Implementation option — the 5-minute demo

If the team decides to implement (stronger than explain), the cheapest honest demo:

1. Add `cryptography` or `pyspx` (SPHINCS+ Python binding) to the server requirements.
2. In a 2-minute demo segment: show an Ed25519 signature, then show a SPHINCS+ signature, and demonstrate that the evidence-chain verifier accepts both — because the verifier checks hash integrity, not the signature algorithm.
3. The demo proves "migration does not change the chain" — exactly the architectural claim.

This requires Sibusiso to build a minimal `anchor/verifier.py` that demonstrates hash-chain verification without signature-dependency. It is 30 minutes of work with a suitable library. It is also a strong differentiator: no team in the room will demonstrate PQ migration on their evidence chain.

---

## Decision gate

- [ ] Sibusiso verifies checks 1–4.
- [ ] Both leads approve the quantum positioning.
- [ ] Team decides: explanation-only, or implementation demo?
- [ ] If proceeding: Sonke overview updated with the quantum paragraph; BLOCKCHAIN-ATTACK-REHEARSAL.md extended with the post-quantum section.
- [ ] If not proceeding: this document stays as `PROPOSED` analysis; 5 bonus points are not claimed.

*Written 15 Sep 2026. Owned by Lethabo (architecture, positioning). Sibusiso (anchor, chain, blockchain track) to verify the cryptographic claims before any public positioning.*