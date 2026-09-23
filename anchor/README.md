# anchor/ — ANCHOR

The record layer:
- per-person hash chains (entry format v2);
- signed statements that bind subject, target, action and source time;
- RFC 6962 Merkle batches;
- anchoring to the Hedera Consensus Service with typed 33-byte messages, plus an OpenTimestamps second anchor;
- stranger-verifiable exports.

It is specified in `docs/VUKA-2-SPEC.md` §4–§6 and §10, and ADR-0035.

**Status:** being built from 24 Sep 2026 (owner: Sibusiso). PR #39's chain, verify and subject code is the starting point, reworked to format v2. The canonical form is `json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)`, with no floats; the golden vectors live in `contracts/vectors/`.
