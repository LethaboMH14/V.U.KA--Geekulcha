## 2026-09-25 | Babatunde Adelusi (via OpenCode assistant, DeepSeek V4.1 Flash) | ANCHOR blockchain methodology review (for Sibusiso) | Proposed — review doc in PR

**Research** — Read `docs/adr.md` ADR-0028, ADR-0034, ADR-0035 and ADR-0037; `docs/VUKA-2-SPEC.md` §6 and §10; `docs/ANCHOR-RATIONALE.md`; `docs/STAGED-DURESS-DEFENCE.md`; `docs/EVIDENCE.md`; and the economics script's anchoring inputs. Ran two independent web-research passes on (a) DLT timestamping for evidence, standards and admissibility, and (b) Hedera Consensus Service, enterprise/insurance-bank adoption, alternatives and key management.

**Real data / references** — Key sources: RFC 6962 (Certificate Transparency consistency proofs, June 2013); IETF SCITT RFC 9943 (June 2026) and the SCITT time-anchor draft (26 Aug 2026); RFC 3161 (Aug 2001) and ETSI EN 319 421/422; eIDAS Reg 910/2014 Art. 41; the Sigstore bundle format (14 Jan 2025); OpenTimestamps; EDPB Guidelines 02/2025 on blockchain and personal data (final v2, 7 Jul 2026); ECTA 25 of 2002 s15; FRE 902(13)–(14); Hedera council (≤39), testnet reset policy, mirror-node/State-Proof status, the Jan-2026 fee change and the March-2023 service pause; the B3i insolvency (July 2022) and TradeLens discontinuation (29 Nov 2022).

**Business reasoning** — Insurers and banks will not accept "a hash is on a chain"; they accept integrity **plus attribution plus independent time plus a reproducible verification procedure plus omission detection plus a human certification**. The review finds our design strong on integrity and honest framing, and identifies the four gaps (single permissioned anchor; no signed checkpoints/consistency proofs; no legal-presumption timestamp or certification artefact; verifier independence from one mirror) that stand between "works" and "ready for impactful market use", with cheap, standards-aligned fixes.

**Competitor reference** — The review names the two flagship enterprise DLT failures in adjacent industries (B3i in insurance/reinsurance; TradeLens in shipping) as the precedent to pre-empt: both died on consortium governance and adoption, not cryptography. ANCHOR's one-sided verifier (the insurer/bank verifies without our cooperation) is the structural difference from both.

Changed: `docs/reviews/ANCHOR-BLOCKCHAIN-METHODOLOGY-REVIEW.md` (new); `team/babatunde.md` running log; this build-log entry. No spec, ADR, contract or code changed.

Evidence: two sourced web-research passes (URLs + dates throughout the review); `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` run locally. No claim of deployment; no "court-admissible" claim.

Decision: none. The review is `PROPOSED`. Recommendations R1 and R2 (signed checkpoints; consistency proofs) would extend ADR-0035/spec §6; R4 (Bitcoin/OTS as the durable anchor plus an RFC 3161 timestamp) would **supersede ADR-0035's primary/secondary order** and therefore needs a **superseding ADR accepted by both leads** (outline in §7 of the review). None is applied.

Needs/blockers: Sibusiso's review and decision on R1–R10; Lethabo for any ADR; Ipeleng for the linkability/erasure and DPIA note (R9).

Business handoff: `docs/reviews/ANCHOR-BLOCKCHAIN-METHODOLOGY-REVIEW.md` to Sibusiso; the buyer-facing artefacts (R6) are Babatunde's to draft.

Next: Sibusiso decides; Babatunde drafts the methodology/affidavit artefacts and folds the accepted items into the deck.
