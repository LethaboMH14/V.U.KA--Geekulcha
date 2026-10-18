# ANCHOR — blockchain methodology review (for Sibusiso)

> **Author:** Babatunde Adelusi (business/economics), via an assistant research pass, 25 Sep 2026.
> **Reviewer / owner of the affected surface:** Sibusiso Khumalo (backend, ledger, contract). **Decisions that change an accepted ADR need both leads.**
> **Status:** `PROPOSED` — a review and a set of recommendations. **This document changes nothing.** It does not alter `docs/VUKA-2-SPEC.md`, `docs/adr.md`, `contracts/`, or any code. Every recommendation is tagged and says whether it needs an ADR.
> **Scope:** the ANCHOR anchoring and verification methodology (spec §6, §10; ADR-0035), assessed against how distributed-ledger timestamping is actually used, the relevant standards, and what insurers and banks will demand.
> **Read with:** `docs/ANCHOR-RATIONALE.md`, `docs/adr.md` ADR-0035, `docs/VUKA-2-SPEC.md` §6 and §10, `docs/STAGED-DURESS-DEFENCE.md`.

---

## 1 · Verdict in one paragraph

**The core logic is sound and it is a legitimate use of a ledger.** Anchoring a signed, per-subject hash chain to a public, append-only log to give *precedence a stranger can check* is the one use of DLT that survives the "you don't need a blockchain" critique — the verifier (insurer, bank, court) is a party who must **not** have to trust our server. "The anchor proves when, not what" is the correct, honest framing, and it matches how the field now describes provenance (C2PA: integrity and signer, not truth). **But it is not yet "impactful-use-ready" for an insurer or bank**, for four concrete reasons: (a) the design leans on a **single, permissioned ledger (Hedera)** as the root of trust; (b) it has **no signed tree heads and no consistency proofs**, so a verifier cannot detect omission or equivocation; (c) it has **no legal-presumption timestamp layer** (RFC 3161 / eIDAS) and no human certification artefact; and (d) the **verifier's independence from a single mirror node is not specified**. Each is fixable, and the fixes are cheap relative to the backend already built.

---

## 2 · What ANCHOR does today (as specified)

Stated precisely, from the spec and ADR-0035, so the review argues against the real design and not a straw man:

- **Per-subject signed hash chain** (entry format v2, spec §4). Canonical form is deterministic JSON — `json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)`, no floats, 64-zero genesis `prev_hash` (ADR-0034(6)).
- **Signatures:** device P-256 (Android Keystore), server Ed25519; **ML-DSA-65 on the cut line**. Signatures bind subject, target, action and source time.
- **Merkle tree** over the batch, inclusion (audit) proofs, vectors n = 1…8, n = 0 rejected (spec §6).
- **Anchoring (spec §10 / ADR-0035):** every PIN-gated outcome triggers an immediate root, **coalesced to at most one per 60 s**; everything else batched hourly. Messages are **33 bytes**: `0x01 ‖ 32-byte root`, and `0x02 ‖ SHA-256(key manifest)` published **before the first batch**. Topic has a server-held `submitKey`. Receipts store topic id, sequence number, consensus timestamp and running hash.
- **Second anchor:** OpenTimestamps → Bitcoin, daily, multi-calendar submission + scheduled `ots upgrade` (ADR-0028).
- **Verification:** a stranger recomputes hashes, checks prev-links and signatures, checks the Merkle path, and requires the Hedera mirror message bytes (`0x01`) to **equal the root recomputed from the export**; pins network, topic and key-manifest fingerprint; shows live-verified / archived / unavailable.
- **Posture:** no personal data on chain; testnet labelled; a malicious/compromised server can suppress or fabricate escalation (spec §17) — independent witnesses are the guardian's own-key ack and the bank's own systems.
- **Cost:** bounded fixed cost, ceiling ≈ R569.47/month (`scripts/economics_vigil_anchor.py`; spec §10).

**Assessment:** this is a disciplined, minimal on-chain footprint. It is **closer to the standards than our docs say** — it already resembles a Certificate-Transparency-style Merkle log plus a signed event, which is exactly what IETF SCITT now standardises. That is a strength to lean on.

---

## 3 · Does the methodology make sense? Findings and gaps (ranked)

Each finding: what, why it matters to an insurer/bank, source, and severity.

### G1 — Single, permissioned anchor as the root of trust (HIGH)

**What.** ADR-0035 makes Hedera the **primary** anchor and OpenTimestamps/Bitcoin the *second*. Hedera's consensus nodes are run by a Governing Council of **up to 39** permissioned members; Hedera describes itself as "a public network with permissioned nodes run by the Hedera Council". In March 2023 Hedera **halted access to most services** during the precompile-exploit remediation.
**Why it matters.** A sophisticated buyer's counsel will say "that is a consortium ledger, not a neutral protocol", and the two flagship enterprise DLT consortia in *insurance and shipping* — **B3i (insolvent July 2022)** and **TradeLens (discontinued 29 Nov 2022)** — died on **consortium governance and adoption**, not cryptography. A single anchor you can be asked to pause is a legitimacy problem.
**Sources.** Hedera council (≤39) https://hederacouncil.org/about; consensus-about https://hedera.com/consensus-service; March 2023 pause https://hedera.com/blog/analysis-remediation-of-the-precompile-attack-on-the-hedera-network/ (2023-03); B3i https://www.insurancejournal.com/news/international/2022/07/29/677926.htm (29 Jul 2022); TradeLens https://maersk.com/news/articles/2022/11/29/maersk-and-ibm-to-discontinue-tradelens (29 Nov 2022).
**Severity: HIGH** (goes to the trust claim and to procurement).

### G2 — No signed tree heads and no consistency proofs (HIGH)

**What.** The spec publishes a 32-byte Merkle **root** and verifies an **inclusion** proof. It does not require (i) a **signed tree head / checkpoint** (the root signed by the server key, so the tree head is attributable, not merely posted by the `submitKey` account) or (ii) a **consistency proof** that a later tree is a superset of an earlier one — the RFC 6962 mechanism that makes **omission and equivocation detectable**.
**Why it matters.** A root alone proves *some* set of leaves existed. It does **not** prove nothing was dropped, and it does not stop a server from showing two different histories to two different verifiers (split-view). Without consistency proofs, the "verify a stranger can check" claim is weaker than it reads.
**Sources.** RFC 6962 (consistency vs audit proofs) https://www.rfc-editor.org/rfc/rfc6962.html (June 2013); RFC 9162 (CT v2); IETF SCITT receipts RFC 9943 https://www.rfc-editor.org/rfc/rfc9943.html (June 2026); C2SP cosignatures https://c2sp.org/tlog-cosignature.
**Severity: HIGH** (this is the single cheapest fix with the largest credibility gain).

### G3 — No legal-presumption timestamp layer and no certification artefact (HIGH)

**What.** Hedera gives integrity and a consensus time; Bitcoin gives a coarse, hard-to-rewrite time. Neither gives a **legal presumption** of the accuracy of the time. In the EU, only a **qualified electronic timestamp** (eIDAS Art. 41) carries that presumption; the incumbent regulator-grade mechanism is an **RFC 3161** token from a TSA/QTSP. For South Africa, ECTA s15(3) makes the court weigh *how* the record was generated, *how* its integrity was maintained and *how* the originator was identified — and s15(4) admits an ordinary-course-of-business record on production with a **certification**. ANCHOR has no RFC 3161 token and no affidavit/certificate template.
**Why it matters.** For an EU-facing bank/insurer, "admissible but rebuttable" is materially weaker than "presumed accurate". For SA, the absence of a certification template means the insurer's investigator still lacks the human artefact the statute anticipates.
**Sources.** eIDAS Reg (EU) 910/2014 Art. 41 https://eur-lex.europa.eu/eli/reg/2014/910/oj/eng (23 Jul 2014); RFC 3161 https://www.rfc-editor.org/rfc/rfc3161.txt (Aug 2001); ETSI EN 319 421/422; ECTA 25 of 2002 s15 https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf.
**Severity: HIGH** (this is the difference between "we can prove integrity" and "a regulator accepts our date").

### G4 — Verifier independence from a single mirror is under-specified (HIGH)

**What.** The spec matches receipts against "the public mirror node". Hedera's default public mirror is **Hedera-operated and labelled non-production (50 RPS/IP)**; production mirrors are third-party. The trust-minimised path — **State Proofs** (verify a transaction against signed record files locally) — was historically **alpha**, and Hedera is migrating **Record Streams → Block Streams** during 2026, with legacy data stopping on old buckets.
**Why it matters.** If the verify page silently trusts one mirror's JSON, the whole "don't trust us" claim collapses to "don't trust us, trust this one Hedera endpoint we picked". A bank will ask this in the first technical call.
**Sources.** Hedera mirror nodes https://docs.hedera.com/operators/mirror-node; REST API / state proof https://docs.hedera.com/reference/rest-api; Block Streams migration https://hedera.com/blog/block-streams-replace-the-record-stream-by-default-starting-september-2026-action-required-by-mirror-node-operators.
**Severity: HIGH** (directly attacks the differentiator).

### G5 — Key manifest is the right primitive but not hardened (MEDIUM)

**What.** `0x02 ‖ SHA-256(key manifest)` before the first batch is correct in principle. The spec does not state that the manifest is itself **signed**, how it is **rotated/revoked**, how a verifier checks a **revocation/status**, or how the scheme stays **crypto-agile**. ML-DSA-65 signatures are ~3.3 KB — they cannot go in a 33-byte HCS message and must live in the off-chain bundle (the design implies this but does not say it).
**Why it matters.** "A signature proves a key was used" is already in our honesty ledger; the manifest is what turns that into "used by an authorised actor at that time". eIDAS long-term validation and NIST IR 8547 (RSA/ECDSA/ECDH **deprecated for new use 2030, disallowed 2035**) make rotation a scheduled obligation, not an incident.
**Sources.** NIST FIPS 204 https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.204.pdf (13 Aug 2024); NIST IR 8547 timeline; NSA CNSA 2.0 (30 May 2025); W3C VC 2.0 + Bitstring Status List https://www.w3.org/TR/vc-data-model-2.0 (15 May 2025).
**Severity: MEDIUM.**

### G6 — Testnet durability and demo-vs-mainnet separation (MEDIUM)

**What.** Testnet is "production-equivalent" but **resets periodically**, wiping accounts, topics and state (2024 resets were repeatedly *skipped*, so cadence is unpredictable); mirror data is retained ~2 weeks after a reset.
**Why it matters.** Testnet anchors are **not durable**. The demo is honestly labelled, but the docs should state plainly that no testnet receipt is evidence, and that only mainnet anchoring produces a durable proof.
**Source.** Hedera testnet https://docs.hedera.com/networks/testnet.
**Severity: MEDIUM** (honesty/completeness, not architecture).

### G7 — Linkability and erasure of the public anchor (MEDIUM)

**What.** The chain is **per subject**, and roots are published. "No personal data on chain" is necessary but not sufficient: the EU data-protection board's final blockchain guidelines warn that even hashes/references can be personal data when linkable, and push personal data off-chain with a documented erasure story. Our erasure mechanism ("delete payload and salt, keep the hash") is the right shape but is not written as a linkability assessment or DPIA.
**Why it matters.** A SA or EU insurer's compliance team will ask how a data subject right is discharged when something is public forever.
**Sources.** EDPB Guidelines 02/2025 on blockchain and personal data, final v2 https://www.edpb.europa.eu/documents/guideline/guidelines-022025-on-processing-of-personal-data-through-blockchain_en (7 Jul 2026); POPIA (Act 4 of 2013).
**Severity: MEDIUM.**

### G8 — Correction semantics for a wrong-but-anchored record (MEDIUM)

**What.** An anchor cannot be un-published. The design allows off-chain deletion but does not define how a record later shown to be **wrong** (a false detection, a mistaken outcome) is represented. Auditors and regulators specifically flag "correction/revocation handling" as the weak spot of blockchain audit trails.
**Why it matters.** An insurer's investigator needs a defined, visible "this was corrected, here is the correcting entry" path — otherwise immutability is a liability, not an asset.
**Source.** Frontiers, "Auditing in the blockchain: a literature review" https://www.frontiersin.org/journals/blockchain/articles/10.3389/fbloc.2025.1549729/full (2025); NISTIR 8202 on permanence as a weakness https://nvlpubs.nist.gov/nistpubs/ir/2018/nist.ir.8202.pdf (Oct 2018).
**Severity: MEDIUM.**

### G9 — Buyer-facing artefacts missing (MEDIUM)

**What.** Insurers/banks accept a record when they are given, in addition to the cryptographic proof: a **documented methodology**, a **reproducible verification procedure**, a **human certification/affidavit**, a stated **verification policy** (including what the verifier must *not* rely on), and a named **independent monitor/auditor**. Our export is technical only.
**Why it matters.** This is the difference between a demo and an audit-grade deliverable, and it is mostly writing, not engineering.
**Sources.** FRE 902(13)–(14) https://www.law.cornell.edu/rules/fre/rule_902 (2017); ECTA s15; IAIS Application Paper on AI supervision https://www.iais.org/uploads/2025/07/Application-Paper-on-the-supervision-of-artificial-intelligence.pdf (2 Jul 2025); EIOPA blockchain/smart-contracts discussion paper https://www.eiopa.europa.eu/discussion-paper-blockchain-and-smart-contracts-insurance-eiopa-invites-comments-2021-04-29_en (29 Apr 2021).
**Severity: MEDIUM.**

### G10 — "Do you need a blockchain?" must be answerable on the slide (LOW, but assumed)

**What.** NIST's own "Rethinking DLT" preprint and the Federal Reserve Bank of St. Louis argue most use cases do not need a blockchain; a 2024 Birmingham study found blockchain decision schemes are often biased. Our answer must be the **stranger verifier**: the insurer/bank must not have to trust our server.
**Why it matters.** It is the first question a blockchain-literate judge or a sceptical CTO asks.
**Sources.** NIST "Rethinking DLT" preprint https://csrc.nist.gov/CSRC/media/Projects/enhanced-distributed-ledger-technology/documents/preprint-rethinking-dlt.pdf; Wüst & Gervais, IACR ePrint 2017/375; FRB St. Louis Review (2018); University of Birmingham (2024).
**Severity: LOW** (ANCHOR-RATIONALE already answers it; keep it answerable, and keep anchoring **ledger-agnostic**).

---

## 4 · Recommendations — how to build on the existing solution

Ranked by value-to-effort. None of these is a rewrite; they are additions to the anchoring/export/verify path.

### R1 — Publish **signed tree heads (checkpoints)**, not just roots (needs an ADR note)

Sign every published root with the server key (Ed25519 now, hybrid later) and carry the signature in the receipt/bundle, so the tree head is attributable independently of the `submitKey` topic. **Effort: low. Impact: high.**
*This is a small extension of ADR-0035(2)–(3); record it as an ADR addendum or a short superseding ADR.*

### R2 — Add **consistency proofs** and a signed checkpoint history (needs an ADR note)

For each new root, publish/store a consistency proof from the previous root, and have the verifier check it. This is the RFC 6962 / SCITT receipt mechanism and is what makes **omission and equivocation detectable**. **Effort: medium. Impact: high.**
*Extends spec §6; needs an ADR note because it changes the proof surface.*

### R3 — Adopt a **portable proof bundle** modelled on the Sigstore bundle + a SCITT Transparent Statement (proposed)

Define one export file (JSON or COSE) that a third party can verify **offline**. Proposed contents:
1. **Statement** — the event record, canonical bytes, type tag, subject pseudonym, sequence number.
2. **Chain** — previous-event hash, subject id, device id; enough to replay the per-subject chain.
3. **Signatures** — device P-256 and server Ed25519 over the statement; optional ML-DSA-65 (algorithm IDs carried); signer keys/certs.
4. **Key manifest** — the `0x02` manifest (SHA-256), its own HCS bytes and consensus time, published **before** the batch, plus revocation/status.
5. **Batch inclusion proof** — log index, tree size, leaf hash, audit path, the **signed 60 s checkpoint**, the **hourly root** it rolls into, and a **consistency proof** from the previous root.
6. **Hedera evidence** — topic id, sequence number, consensus timestamp, transaction id, message bytes, running hash, and (ideally) a **State Proof** package.
7. **Bitcoin evidence** — the `.ots` proof, target Bitcoin block height/header, and confirmation depth at export.
8. **Optional RFC 3161 token** — a timestamp token over the root (see R4).
9. **Verification instructions** — algorithms, canonicalisation rules, expected topic, expected keys, and a plain-language methodology + affidavit template (R6).
**Effort: medium. Impact: high.** *Docs + a schema; needs Sbu; if it changes `contracts/`, it needs both leads + an ADR.*

### R4 — Make **Bitcoin/OTS the durable anchor** and add an **RFC 3161 timestamp per root** (needs an ADR — supersedes ADR-0035's primary/secondary order)

Keep Hedera for **fast ordering and precise consensus time** (its genuine advantage: ~3–5 s absolute finality at ~$0.0008/msg). Add:
- **daily Merkle root → OpenTimestamps → Bitcoin** as the trust-minimised, cross-jurisdictional anchor (verifiable offline against Bitcoin; court-tested precedents exist — Hangzhou 2018, Marseille 20 Mar 2025); require confirmation depth before calling a proof "anchored"; do not claim minute-accurate Bitcoin time.
- an **RFC 3161 timestamp token** (qualified where available) over each hourly/daily root, for legal presumption.
This is the **single most important change** for insurer/bank acceptance: it removes the single-ledger trust concentration *and* buys legal weight. **Effort: low-medium (OTS client + a TSA client). Impact: high.**
**This changes accepted ADR-0035 (primary/secondary) → a superseding ADR + both leads.**

### R5 — Specify **verifier independence** in the verify page (docs + small code)

The verifier must be able to check against **≥2 independent mirrors** and/or a **State Proof**, must not trust any ANCHOR-operated service for the accept/reject decision, and must pin the Block Streams format after the 2026 migration. **Effort: low-medium. Impact: high.**

### R6 — Ship the human/legal artefacts (docs)

A one-page **methodology**, a reproducibility **script/runbook**, an **affidavit/certificate template** (ECTA s15(4); FRE 902(13)–(14) certification), and a **verification policy** listing what the verifier must not rely on (below). **Effort: low. Impact: high** (unlocks the insurer's investigator).

### R7 — Harden the key manifest (needs a spec note)

Sign the manifest; publish `0x02` before the epoch; support rotation and a revocation/status list; declare **crypto-agility** (Ed25519 now; Ed25519+ML-DSA-65 hybrid later as a manifest/epoch change); keep PQC signatures **off-chain** in the bundle. **Effort: low. Impact: medium.**

### R8 — Define **correction/exception semantics** (docs + spec)

A correcting entry appended to the chain, surfaced in the export ("corrects entry #N: reason"), while the original stays. Off-chain payload deletion remains the erasure mechanism; the correcting entry is visible. **Effort: low. Impact: medium.**

### R9 — Write the **linkability/erasure** and DPIA note (docs; Ipeleng)

State that only 32-byte roots and a manifest hash are on-ledger, assess linkability of the per-subject chain, and document erasure-by-key-destruction. **Effort: low. Impact: medium.** (Security/privacy owner: Ipeleng, covering: Lethabo.)

### R10 — Keep anchoring **ledger-agnostic** (principle; no cost)

Design the proof bundle so Hedera/OTS/TSA are *interchangeable anchor backends*. If a buyer later insists on a permissioned ledger or requires a different chain, the export format does not change. **Effort: none if R3 is adopted. Impact: medium** (procurement flexibility).

---

## 5 · Proposed portable proof bundle and verifier checks (detail)

**Verifier order (proposed).** (1) canonicalise and recompute the leaf hash; (2) verify every signature against the key manifest, and check the manifest's `0x02` anchor **precedes** the batch; (3) walk the per-subject prev-link chain; (4) recompute the Merkle path to the 60 s root; (5) confirm the root via the **signed checkpoint** and **consistency proof**; (6) fetch the HCS message bytes and require **byte-equality** with the recomputed root, validated with a **State Proof** / ≥2 independent mirrors — not one mirror's JSON; (7) verify the OTS path to a Bitcoin header at sufficient **confirmation depth**; (8) verify the RFC 3161 token if present.

**What the verifier must NOT rely on** (write this into the buyer's verification policy):
- any online service operated by ANCHOR for the accept/reject decision;
- the **truth** of the event contents (the anchor proves when, not what);
- a wall-clock claim from the device;
- a single mirror node / explorer's JSON without a state proof or record/signature file;
- a public-ledger timestamp as a substitute for **consent/authorisation**;
- the assumption that the hash algorithm is unbroken forever (support proof extension / crypto-agility).

*(Bundle fields and check order are our synthesis of RFC 6962, RFC 9943 SCITT, the Sigstore bundle, RFC 3161 and OpenTimestamps — flagged `ASSUMPTION` as a single normative source does not define them for this use.)*

**Standards to map onto (for the buyer's lawyers):** RFC 6962/9162 (Merkle logs, consistency proofs); IETF **SCITT RFC 9943** (signed statement → transparency service → receipt) — our HCS+OTS+TSA is the "transparency service"; **Sigstore bundle** (portable proof + offline verification); **OpenTimestamps** + the IETF time-anchor draft; **RFC 3161/ETSI EN 319 421/422** (qualified time); **W3C VC 2.0 / Data Integrity** (signed envelope + status list); **C2PA** (the "integrity and signer, not truth" framing the insurer already understands).

---

## 6 · What the buyers will actually test (insurers / banks)

Across the admissibility and audit sources, acceptance keeps coming back to six things — and only the first is "the blockchain":

1. **Integrity** of the record as produced. *(We have this.)*
2. **Attribution** — who was authorised to produce it. *(G5/R7.)*
3. **Independent time**, ideally with legal presumption. *(G3/R4.)*
4. **A reproducible verification procedure** a third party can run without us. *(R5/R6.)*
5. **Omission/equivocation detection.** *(G2/R2.)*
6. **A human certification** where the rules require one. *(R6.)*

A Merkle root alone answers only (1). Recommendations R2–R6 close (2)–(6).

---

## 7 · Proposed ADR outline (not filed — for Lethabo and Sbu)

If the team accepts R1–R4, the cleanest vehicle is a **superseding ADR** (the repo's rule: never edit an accepted ADR). Outline only:

> **ADR-00XX (proposed): multi-anchor ANCHOR — Bitcoin/OTS and an RFC 3161 timestamp join HCS; signed checkpoints and consistency proofs become part of the proof surface.**
> **Supersedes/extends:** ADR-0035 (primary/secondary order), ADR-0028 (OTS stands), spec §6 and §10.
> **Decision:** (1) HCS remains the fast ordering layer; (2) the durable, trust-minimised anchor is the daily OpenTimestamps→Bitcoin root; (3) each hourly/daily root carries a signed checkpoint and an RFC 3161 token; (4) exports include consistency proofs; (5) the proof bundle follows the Sigstore/SCITT shape; (6) the verifier checks ≥2 independent anchors and never trusts one host.
> **Consequences:** `anchor/publish.py` gains a TSA client and checkpoint signing; `anchor_batches` stores consistency proofs; the verify page checks multiple anchors; contract-v2 proof schema gains fields.
> **Acceptance:** both leads.

---

## 8 · Decisions requested from Sbu (and, where noted, both leads)

1. **R1 + R2 (signed checkpoints, consistency proofs)** — accept as a spec extension? *(Sbu; ADR note.)*
2. **R4 (Bitcoin durable anchor + RFC 3161)** — do we reorder the anchors and add the TSA? *(Sbu + both leads; superseding ADR.)*
3. **R3/R5 (proof bundle + verifier independence)** — adopt the Sigstore/SCITT bundle shape and multi-mirror checks? *(Sbu; contract change → both leads.)*
4. **R6 (buyer artefacts)** — who writes the methodology/affidavit? *(Babatunde drafts; Lethabo owns the final copy.)*
5. **R7/R8/R9** — key-manifest hardening, correction semantics, linkability note *(Sbu; Ipeleng for R9).*
6. **R10** — confirm the anchoring backend stays interchangeable *(Sbu; principle).*

---

## 9 · What this review does NOT change

- No change to `docs/VUKA-2-SPEC.md`, `docs/adr.md`, `contracts/`, `shared/`, `server/` or `anchor/` in this PR.
- No claim of deployment; ANCHOR is not deployed (slice 1 only). No "court-admissible" claim; the ECTA s15 framing is "built to maximise the statutory reliability factors".
- No new economic figure; cost references are the existing script output and the cited Hedera fee page.

---

## 10 · Sources (primary where possible)

- RFC 6962 (Certificate Transparency) — https://www.rfc-editor.org/rfc/rfc6962.html (June 2013); RFC 9162 (CT v2).
- IETF SCITT RFC 9943 (signed statements + receipts) — https://www.rfc-editor.org/rfc/rfc9943.html (June 2026); SCITT time-anchor draft — https://www.ietf.org/archive/id/draft-fassbender-scitt-time-anchor-05.html (26 Aug 2026).
- RFC 3161 (TSP) — https://www.rfc-editor.org/rfc/rfc3161.txt (Aug 2001); ETSI EN 319 421 / 319 422 (eIDAS timestamp profiles).
- eIDAS Reg (EU) 910/2014 Art. 41 — https://eur-lex.europa.eu/eli/reg/2014/910/oj/eng (23 Jul 2014).
- Sigstore bundle — https://docs.sigstore.dev/about/bundle/ (14 Jan 2025); Rekor GA — https://blog.sigstore.dev/sigstore-ga-ddd6ba67894d (25 Oct 2022).
- OpenTimestamps — https://opentimestamps.org/.
- C2PA Content Credentials 2.4 — https://spec.c2pa.org/specifications/specifications/2.4/specs/ContentCredentials.html.
- W3C VC 2.0 + Data Integrity — https://www.w3.org/TR/vc-data-model-2.0 (15 May 2025).
- NISTIR 8202 — https://nvlpubs.nist.gov/nistpubs/ir/2018/nist.ir.8202.pdf (Oct 2018); NIST "Rethinking DLT" preprint; NIST FIPS 204 — https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.204.pdf (13 Aug 2024); NIST IR 8547 (2030/2035); NSA CNSA 2.0 (30 May 2025).
- EDPB Guidelines 02/2025 on blockchain and personal data (final v2) — https://www.edpb.europa.eu/documents/guideline/guidelines-022025-on-processing-of-personal-data-through-blockchain_en (7 Jul 2026).
- ECTA 25 of 2002 s15 — https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf; *Ndlovu v Minister of Correctional Services* [2006] 4 All SA 165 (W).
- FRE 902(13)–(14) — https://www.law.cornell.edu/rules/fre/rule_902 (2017).
- France, Tribunal judiciaire de Marseille (20 Mar 2025) — reported https://www.santarelli.com/en/blockchain-evidential-value (Nov 2025) and EUIPO case-law note.
- Estonia KSI (permissioned Merkle, production since 2012; lost eIDAS qualified status 12 Jun 2025) — Estonian central bank publication (Dec 2021); https://guardtime.com/platform.
- Hedera — consensus service https://hedera.com/consensus-service; council (≤39) https://hederacouncil.org/about; testnet resets https://docs.hedera.com/networks/testnet; mirror nodes / state proof https://docs.hedera.com/operators/mirror-node, https://docs.hedera.com/reference/rest-api; Jan-2026 fee update https://hedera.com/blog/price-update-to-consensussubmitmessage-in-consensus-service-january-2026/ (24 Jul 2025); March-2023 precompile pause https://hedera.com/blog/analysis-remediation-of-the-precompile-attack-on-the-hedera-network/.
- B3i insolvency — https://www.insurancejournal.com/news/international/2022/07/29/677926.htm (29 Jul 2022); TradeLens discontinuation — https://maersk.com/news/articles/2022/11/29/maersk-and-ibm-to-discontinue-tradelens (29 Nov 2022).
- EIOPA blockchain/smart contracts discussion paper — https://www.eiopa.europa.eu/discussion-paper-blockchain-and-smart-contracts-insurance-eiopa-invites-comments-2021-04-29_en (29 Apr 2021); IAIS AI Application Paper — https://www.iais.org/uploads/2025/07/Application-Paper-on-the-supervision-of-artificial-intelligence.pdf (2 Jul 2025); ASIC INFO 219; SARB Project Khokha (2018) / Khokha 2 (2022).

*Items the research could not verify against a primary source are flagged in the research record; the strongest of these (the Marseille judgment text, the AXA "fizzy" discontinuation) are cited only as reported.*
