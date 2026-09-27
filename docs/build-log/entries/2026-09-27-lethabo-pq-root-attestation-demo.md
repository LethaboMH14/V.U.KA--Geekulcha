## 2026-09-27 | Lethabo (co-lead), via Claude Code assistant | Post-quantum demonstration: hybrid ML-DSA-65 + Ed25519 root attestation, ML-KEM-768 interop | PROPOSED — for Sibusiso and Ipeleng

**Research** — A read-only cross-inspection of the first diff found six issues (mirror identity outside the boundary, bool/int and base64 differences between languages, no signer test, an overclaimed implicit-rejection comment and threat wording); all fixed in the same PR. Quantum bonus criterion (Q, 5 points: outlined, then implemented and integrated). pyca/cryptography 50.0.0, already pinned in `server/requirements.txt`, ships `mldsa` (44/65/87) and `mlkem` (768/1024); no SLH-DSA. `@noble/post-quantum` 0.7.1 ships all three; its README says it "has not been independently audited yet". The manifest already reserves `ml_dsa_65_public_key` (`shared/keys.js`, `contracts/openapi.yaml`); checklist P3.Q1 is open. The plan was reviewed adversarially twice before building (findings applied: bind epoch, message type and exact mirror bytes; fixed context; no ad hoc KEM combiner; demonstration wording).

**Real data / references** — Hedera testnet topic 0.0.10687280, message #8 (`contracts/vectors/hedera-mirror-0.0.10687280-seq8.json`, fetched from the public mirror node on 27 Sep): 33 bytes, `01fba0ff6c…`. FIPS 203, 204, 205.

**Business reasoning** — A record meant to be checked years later, in a dispute or a court, must not become forgeable when quantum computers arrive; hybrid signatures keep today's guarantees and add a post-quantum one.

**Competitor reference** — Not applicable.

Changed: `anchor/pq.py` (statement v1, verifier that checks the mirror record's topic, sequence and time), `server/pq_attest.py` (signer; not called by the anchoring worker) + `server/tests/test_pq_attest.py`, `shared/pq.js` (browser/Node verifier), `scripts/gen-pq-vectors.py`, `shared/scripts/gen-pq-js-vectors.mjs`, `contracts/vectors/pq.json`, `pq-js.json`, the mirror fixture, `anchor/tests/test_pq.py`, `shared/test/pq.test.js`, `docs/QUANTUM-TECH.md` (27 Sep section), `shared/package.json` (+ `@noble/post-quantum` 0.7.1 exact).

Evidence: `python -m pytest anchor/tests/test_pq.py server/tests/test_pq_attest.py` (cryptography 50.0.0) → 28 passed; `npx vitest run` in `shared/` → 171 passed (9 files); `python -m pytest anchor/tests` (existing suite, cryptography 46) → 160 passed, 1 skipped. pyca and noble derive byte-identical ML-DSA-65 and ML-KEM-768 public keys from the same seeds; each verifies the other's signatures and decapsulates the other's ciphertexts; negatives (altered seq/epoch/time/topic, mirror bytes or mirror record for another message, booleans for integers, malformed base64, wrong context, swapped keys, truncated signature, one signature alone, manifest message type, extra fields) fail.

Decision: none. TEST keys only; nothing pinned, nothing deployed. Wiring into root issuance and pinning are the production steps (estimates in `docs/QUANTUM-TECH.md`).

Needs/blockers: Sibusiso (manifest, anchoring worker) and Ipeleng (cryptography review) before any production use.

Business handoff: the deck may say "a post-quantum hybrid attestation is implemented and tested as a demonstration on a real anchored root"; never "quantum-resistant" or "post-quantum ready".

Next: key ceremony and pinning after the event.
