# dashboard/ — ANCHOR panel and verify page

- `/panel` — the live event stream for the demo. It shows opaque hashes, chain index and Hedera receipts linked to HashScan, and event kinds **only** for `sim_` subjects, labelled SIMULATED.
- `/verify` — a stranger drops an exported record, and the browser recomputes every hash, link, signature and Merkle path, then checks the root against the public Hedera mirror node. It shows live-verified, archived or unavailable.

It is specified in `docs/VUKA-2-SPEC.md` §6, §10 and §12. Owners: Mutarisi (layout), Ipeleng (cryptography), Lethabo (UX).
