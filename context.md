# VUKA — War Room Pitch Context

> **Compliance note (2026-09-26):** this working doc was reconciled with the repository's honesty ledger (`docs/MASTER-CONTEXT.md` §6), `RULES.md`, and the accepted architecture (ADR-0035). Two changes are material: the ledger is **permissioned-write, public-read** (not a closed enterprise ledger), and the record is a **tamper-evident, ECTA-aligned** artefact (never "court-admissible" or "tamper-proof"). A proposed ADR extending ADR-0035 is at `docs/reviews/ANCHOR-ACCESS-MODEL-ADR-PROPOSAL.md`.

## The Mission
SELL, SELL, SELL. This is a sales pitch, not a lecture. The war room is where we prove VUKA is a fundable, defensible, and urgent solution.

## The Product
VUKA is an **evidentiary system**: it detects duress on the device and anchors a **tamper-evident record** of it, so that a victim of express kidnapping or a forced bank transfer holds a **verifiable** — not merely asserted — record that the transfer happened under duress. The record is designed so a bank, an insurer, SAPS or a court can check it **without trusting us**, and it is built to maximise the **ECTA s15** statutory reliability factors. *(Detection is `PROPOSED` — not yet measured, M1–M7; the anchor is `PROPOSED` — slice 1 only, not deployed.)*

## Pitch Format
- We are currently focused on the WAR ROOM PITCH ONLY.
- The 3-minute pitch (with a 60-second demo) and 5-minute pitch (with a 90-second demo) will be developed later.
- The war room pitch should be modular, demo-driven, and defensible in Q&A.
- Target runtime: approximately 3 minutes spoken, expandable to 5 minutes later.

## Judging Criteria (Must Align With)
1 Innovation and Creativity
Has the proposed a new solution or does it improve an existing
one? Is it creatively thought through? Does it have impact
potential on intended users?
15
2
Technical
Implementation
Is the solution developed fit for purpose? Does it work? Are
chosen technologies fit for scale? Is it efficient? 15
3 Usability and Design Does it have an ease of use? Is it appealing to the eye? Does it
have an easy flow? Can it be used tomorrow? 10
4 Security and Ethics Has the team considered imminent risks and mitigation? Are
there policies considered? Is it considerate? 10
5
Business and
Presentation
Does the team have a sound business case with for the solution?
Does it have market potential? As s judge, are you buying? 15
6
BONUS POINTS: Use of
Quantum Tech
Has the team outlined any quantum tech integration (2)? Has the
team implemented and integrate the tech? 5
Every claim must map to these criteria.

## Mentor Feedback (MUST ADDRESS)
1. **Legal Compliance (POPIA):** We handle personal information, and in places special personal information (biometric). We must demonstrate POPIA compliance and register an Information Officer.
2. **Proof:** Every claim about VUKA's capabilities must be backed by clear, demonstrable evidence — user numbers, LOIs, technical tests, or partner commitments.
3. **Blockchain Feasibility:** We must show that using a ledger is legal in South Africa, that we understand the regulatory landscape, and that our architecture is legally sound.
4. **Governance Tokens:** We must state whether we need governance tokens — **we do not** — and why (see below).
5. **Infrastructure Costs:** We must show we have accounted for the ongoing cost of running the anchor in our business model (it is a bounded fixed cost — see below).

## Blockchain Compliance Intel (War Room Critical)

**Key insight (compliant wording):** On our reading, VUKA is **an evidentiary system, not a financial service**. We do not process payments and we do not hold crypto assets, so licensing as a Crypto Asset Service Provider (CASP) under the FAIS Act should not apply. **This is our reading of the definitions — not a regulator's clearance. To be confirmed with counsel.**

**POPIA — special personal information (s26):**
- Biometric information (which is read to include voice and video recordings) is **special personal information** under POPIA s26. A duress **event** is personal information.
- **Nothing personal — and nothing biometric — goes on-chain.** A hash can itself be personal information if it is linkable, so we anchor a **keyed hash of a pseudonymous subject**, never identity.
- **Our architecture:** the duress record lives **off-chain** in an encrypted, access-controlled store. The ledger holds only a 32-byte root plus a key-manifest hash. Deletion of the payload is the erasure mechanism (POPIA's correction and deletion rights, ss 24–25); the fact that an event happened, and its hash, remains verifiable.
- No audio is stored at all — YAMNet emits a label and a score on-device; the raw audio is discarded.

**ECTA (Act 25 of 2002) — reliability, not admissibility-by-hashtag:**
- Data messages are admissible; the weight a court gives them turns on **how the record was generated, how its integrity was maintained, and how the originator was identified** (s15(3)(a)–(c)).
- We log the generation path, keep an unaltered signed chain, and timestamp the event against an independent anchor.
- **We never say "court-admissible" or "tamper-proof."** We say **"tamper-evident"** and **"built to maximise the ECTA s15 reliability factors."** Attestation today is **`stored_unverified`** (gap G32) — recorded, and the limitation is stated.

**Proving duress (SA common law):** *(draft — the formulation and any case citation must be confirmed with counsel before use)*
- The elements to map to: a threat of **imminent or inevitable harm**; a **causal link** between the threat and the transaction; the threat **unlawful or contra bonos mores**; and the victim's **will overborne** so she acts against her free will.
- **What VUKA provides is the timeline**, binding a duress signal to a transfer — illustrative: a signal at 14:02 and a transfer at 14:05. That is a *forensic timeline*, not proof that the duress was real.
- **We do not cite a case name as authority until counsel confirms it.**

**Infrastructure choice (aligned with ADR-0035):**
- **Permissioned write, public read.** Only VUKA's server may publish roots (a Hedera topic held with a server-side `submitKey`); **anyone may read and verify** the anchor from the public mirror node.
- **Two anchors:** Hedera Consensus Service (fast, precise consensus time) **plus** OpenTimestamps → Bitcoin (durable, trust-minimised).
- **Why not a closed private ledger:** a ledger owned by the parties to a dispute proves nothing to *the other side*; the verifier must be able to check **without trusting us**. A closed ledger also puts more personal data into one shared, hard-to-delete store — worse for POPIA.
- **Cost:** anchoring is a bounded **fixed** cost (about **R569.47/month at the ceiling**, any member count) — `ESTIMATE`, spec §10.

**Governance tokens — the answer is no.**
- **No token, no coin, no ICO.** The ledger anchors a hash; there is nothing to trade, and a token would add securities, tax and AML exposure for no product benefit. (Repo: ADR-0034/0035; "no tokens.")

## Access model (who sees what, on what legal basis)
- **Public (anyone):** the **hash** — no identity, no content. This is what makes the record verifiable by a stranger.
- **Victim:** full access to her own record through the app. **The payload key is server-held today** (`VUKA_PAYLOAD_KEY_B64`), because the escalation engine must read the duress outcome; encryption to a victim-held key is a **`PROPOSED` open question**, not built (ADR proposal, item 2).
- **Guardian (alert recipient, not a reader):** receives the **alert** only — incident id, trigger, times. Guardians hold **no copy** of the record; a guardian-held encrypted backup is a **`PROPOSED` open question** with an undefined key/copy lifecycle, not built (ADR proposal, item 3).
- **Bank / insurer:** **`PROPOSED`** — designed as per-case, purpose-limited access on the victim's explicit consent (or legal process). **No endpoint exists**; the only record reader today is the member's own device, with a fresh PIN and the T30 hold.
- **Court / SAPS:** **`PROPOSED`** — production of the record on **legal process** (subpoena / s205 CPA / warrant); no endpoint exists.
- **Regulator:** **`PROPOSED`** — as statutorily mandated; no endpoint exists.
- **Every access is itself recorded as an anchored event:** **`PROPOSED`** — only the member's own export is anchored today; because the chain is **per subject**, anchored access events would be **linkable to that subject** by design.

## Open Questions (To Be Answered Before the Pitch)
- How is the duress signal initially triggered? (The repo's answer: a discreet "Journey check" answered with a normal or a duress PIN, plus on-device detection — not a panic button.)
- Is VUKA an independent app that victims present to banks, or is it integrated directly with banking APIs? (Today: the victim holds the record and authorises per-case disclosure; the bank risk-signal API is `PROPOSED`, ADR-0037.)
- What is our specific proof for each claim we make? (See `pitch-deck-outline.md` "Proof Bank" and `docs/EVIDENCE.md`.)
