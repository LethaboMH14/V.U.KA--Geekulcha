# dashboard/ — ANCHOR panel and verify page

- `/panel` — the live event stream for the demo. It shows opaque hashes, chain index and Hedera receipts linked to HashScan, and event kinds **only** for `sim_` subjects, labelled SIMULATED.
- `/verify` — a stranger drops an exported record, and the browser recomputes every hash, link, signature and Merkle path, then checks the root against the public Hedera mirror node. It shows live-verified, archived or unavailable.
- `verify-min.html` + `verify-min.js` — the thin slice shipped **before** the mirror is wired (Friday 25 Sep, before 10:00): paste an export, the browser recomputes commitments, event hashes, prev links and signatures via `shared/verify.js`, with the server key pinned strictly from `contracts/keys/manifest.json` + `contracts/keys/verify-pins.json` (T05), and reports the first broken entry index (T04 oracle). All rendering uses `textContent` only — a hostile export can never inject markup. Mirror-node and Merkle-proof checks land with the full `/verify` page on Saturday.

It is specified in `docs/VUKA-2-SPEC.md` §6, §10 and §12. Owners: Mutarisi (layout), Ipeleng (cryptography), Lethabo (UX).
