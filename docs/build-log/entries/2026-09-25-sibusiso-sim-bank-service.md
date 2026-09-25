## 2026-09-25 | Sibusiso, with Claude Code assistant | Implementation | sim_bank service + first full S1 run; manifest key bug | PROPOSED

**Research** — `server/bank_worker.py` had an HTTP client for the simulated bank but nothing to talk to. The contract (#51) and the in-test model (`test/sim-bank-contract.test.mjs`) define the rules, so this ports them rather than redesigning. While wiring the pinned key, found that `contracts/keys/manifest.json` stores the Ed25519 key as **base64 SPKI DER** (44 bytes, as `shared/keys.js`/`shared/verify.js` require) but `server/server_signing._pinned_public_key()` returned the raw decoded bytes and compared them with a 32-byte raw key. They could never match, so **every server-signed chain entry would have failed on a real deploy.** Every server test patched that function, which hid it.

**Real data / references** — Contract `/sim_bank/v1/risk-signal` and `/release`; spec S1, §7 server signature; `shared/keys.js` (manifest is SPKI).

**Business reasoning** — S1 is the product's bank promise. Until now it had never crossed a real socket.

**Competitor reference** — Not applicable.

Changed:
- `sim_bank/main.py` (new): FastAPI service; Ed25519 verify against the pinned manifest key; 120 s timestamp window and nonce replay refusal; `Idempotency-Key` must equal the signed body key; replay/409; one hold per new key; release of exactly one owned hold; `sim_` subjects only; `sim: true` on every receipt. **In-memory:** a restart forgets holds (a test proves this rather than hiding it).
- `server/server_signing.py`: `_pinned_public_key()` parses SPKI and returns the raw key.
- `.github/workflows/checks.yml`: CI now runs `sim_bank/tests`.

Evidence (FACT): `sim_bank/tests/test_sim_bank.py` 10/10, including a live-socket run of ANCHOR's own `SimBankHTTP` client and signer, and a test loading the **real** manifest key (32 raw bytes, same key in both loaders). `server/tests/test_s1_end_to_end.py`: incident → guardian delivery → +3 min → outbox → live sim_bank socket → real `hold_ref` stored on the incident, against real PostgreSQL. Mutation: removing signature verification or the foreign-hold check each broke a test.

Decision: None accepted. sim_bank is a simulation and says so.

Needs/blockers: a deployment needs sim_bank running as a second process and `SimBankHTTP` pointed at it; no worker process exists yet (Khutso's #89 finding 2).

Business handoff: Not applicable.

Next: WebSocket streams, then guardian lifecycle.
