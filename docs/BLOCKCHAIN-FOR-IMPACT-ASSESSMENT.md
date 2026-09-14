# Blockchain for Impact assessment

Status: repository assessment prepared 14 September 2026; **human review pending**. This document distinguishes the intended architecture from capability present in this clean checkout.

## Verdict

VUKA has a strong conceptual fit for **Blockchain for Impact** because the public ledger is intended to solve a specific accountability problem: a household member, affected person, auditor or regulator should be able to check when VUKA committed to a safety decision without trusting VUKA, its operator, an insurer, a bank or a security provider to preserve its own database history.

The category fit is not yet demonstrated. This checkout contains specifications, governance controls and repository checks, but no runnable ANCHOR implementation or operating safety application. Until the proof path runs against a public chain and can be checked independently, describe it as **specified**, not built.

## Where the category fit is strong

| Impact need | Proposed blockchain function | Why it matters |
|---|---|---|
| A provider may become a party to a dispute | Publish an hourly commitment outside provider infrastructure | The provider cannot quietly create a different history after a dispute begins without conflicting with the earlier public commitment |
| A coerced person may have only their word against an authenticated institutional log | Give the person an export containing the record, Merkle path and timestamp proof | A third party can check that the commitment predates the later dispute |
| Operators exercise consequential authority | Sign decisions and include the responsible actor in the private evidence chain | Accountability attaches to a recorded human action rather than an unexplained machine result |
| An insider tests or bypasses a control | Record successful and refused consequential actions | A rejected one-person attempt to whitelist, disarm, retune or delete remains visible for later review |
| Personal safety data is sensitive | Keep payloads private and place only a 32-byte Merkle root on the public chain | Public verification does not require publishing names, images, locations, audio or incident details |
| The service or company may cease to exist | Use public verification tools and a durable public anchor | A proof can remain checkable without cooperation from VUKA |

The intended sequence is:

1. Create a synthetic or consented safety event.
2. Require accountable human verification before a consequential state change.
3. Serialize and sign the decision in a canonical format.
4. Append it to a private SHA-256 previous-hash chain.
5. Batch hourly entries into a Merkle tree.
6. Submit the root through OpenTimestamps for commitment to Bitcoin.
7. Export a record with its Merkle path and timestamp proof.
8. Let an independent verifier check the package without calling VUKA.

This is a load-bearing use of blockchain in the coerced-transfer and disputed-record journeys. Removing the external anchor returns the affected person to relying on a record controlled by another interested party.

## Boundaries that keep the use responsible

- Blockchain does not detect danger, verify coercion or decide what happens to a person.
- A timestamp proves that a commitment existed by a time. It does not prove truth, identity, motive, event time, guilt, fairness or court admissibility.
- No personal payload belongs on the public chain. A hash can still be personal information when it is linkable, so the linkability and legal basis require review.
- Tokens, wallets, rewards, NFTs and per-member transactions do not solve the identified accountability problem and are outside the minimum scope.
- A permissioned chain controlled by parties to the dispute would not provide the intended independent precedence proof.
- The accurate claim is **tamper-evident, independently checkable precedence**, not “tamper-proof truth” or “immutable evidence”.

## Current evidence and shortfalls

| Capability or evidence | Current checkout status | Required demonstration |
|---|---|---|
| Canonical private evidence chain | Specified; historical implementation is not reproduced here | Append multiple entries, detect a changed field and broken pointer, and identify the first break |
| Per-operator Ed25519 signatures | Specified | Verify valid signatures; reject altered entries, wrong signers and revoked-key use after the recorded revocation boundary |
| Hourly Merkle batching | Specified | Produce one root from multiple records and verify an inclusion proof for each record |
| OpenTimestamps publication | Specified | Submit a real root and preserve the `.ots` proof; distinguish submitted, pending upgrade and Bitcoin-confirmed states |
| Independent verifier | Specified | Verify an exported package from a separate checkout with no VUKA API or database access |
| Two-person consequential controls | Governance contract specified; minimal governance test exists | Refuse a single signer, require two distinct authorised signers and record the refused attempt |
| Subject access and deletion | Specified; privacy routes absent | Export the subject's record, delete the private payload, document remaining hashes and show what still verifies |
| Anchor outage and retry | Specified | Queue a failed submission, retry idempotently and expose the anchoring gap without inventing a confirmed time |
| Impact validation | Not evidenced | Obtain consent-safe feedback from affected users and organisations that handle disputes |
| Economic validation | Model only | Record actual proof sizes, batches, operational effort and cost; do not present the R1.30 assumption as a quote |

## Minimum category proof

The smallest credible Blockchain for Impact demonstration is one synthetic end-to-end dispute flow:

`sim_duress event → human verification → signed private record → Merkle inclusion → real public timestamp → independent verification → tamper failure`

Acceptance evidence:

- At least two records form the batch, so the Merkle path is meaningful.
- The public submission uses a real OpenTimestamps calendar. The presentation labels a proof **submitted**, **pending** or **Bitcoin-confirmed** according to its actual state.
- A standalone verifier accepts the untouched export and rejects a modified event, modified Merkle path, wrong root and invalid signature.
- The verifier states only what it establishes: content commitment, inclusion and external precedence.
- The demo uses `sim_` identifiers and no personal incident data or production credentials.
- The same demonstration shows the affected person's access path and explains what deletion removes and retains.

## Impact measures

Measure the blockchain component as an accountability mechanism, not by transaction or token volume:

| Measure | Initial target or rule | Evidence method |
|---|---|---|
| Scheduled batches submitted | 100%; every miss visible | Batch and retry log with no hidden gaps |
| Tamper detection | 100% of defined mutation cases | Automated negative tests against exported packages |
| Independent verification | Reproducible outside VUKA | Fresh-checkout command, inputs and result |
| On-chain disclosure | One root only; no personal payload | Inspect submission and exported proof |
| Time to proof availability | Measure submission and confirmation separately | UTC timestamps plus confirmation status |
| Subject record access | Measure completion and comprehension | Consent-safe walkthrough; no invented participants |
| Dispute usefulness | Validate with intended users or partners | Recorded, consent-safe feedback and resulting product changes |
| Operational cost | Measure actual service effort and dependencies | Dated cost record, assumptions and sample size |

No crime-reduction, dispute-resolution or deployment-impact claim should be made until the relevant outcome has been observed with an appropriate method.

## Priority actions and ownership interfaces

1. **Sibusiso:** propose the versioned proof/export contract and implement the smallest ANCHOR path only after the security intake gate permits feature work.
2. **Ipeleng:** review key custody, revocation, public-hash linkability, payload deletion and the legal questions that remain unresolved.
3. **Khutso:** map every category claim to reproducible evidence and keep specified, simulated and built statuses aligned.
4. **Babatunde:** validate whether households, banks, insurers, regulators or security providers understand and value independent precedence; keep price and impact statements conditional on evidence.
5. **Lethabo:** review whether the disputed-record journey is the primary product story, approve or revise the user-facing explanation, and ensure the demo makes independent verification understandable without blockchain jargon.
6. **Both leads:** decide the proof/export contract through the overlap protocol. Their review must not be inferred from this assessment or from elapsed time.

## Pitch language

Recommended, subject to Lethabo and both-lead review:

> VUKA uses a public blockchain narrowly: to make the safety system's accountability independently checkable. Sensitive records remain private. An hourly public commitment helps an affected person show that a record existed before a dispute began, even if the provider later becomes part of that dispute.

Avoid: “blockchain proves the incident,” “immutable truth,” “tamper-proof evidence,” “court-admissible,” or any suggestion that Bitcoin receives personal safety data.

## Lethabo review flag

**Review requested; no approval recorded.** As architecture, product and UX co-lead, Lethabo should confirm or revise:

- the disputed-record journey as the primary Blockchain for Impact story;
- the boundary between safety-system value and blockchain-specific value;
- the plain-language precedence explanation and forbidden claims;
- the subject-access and deletion experience;
- what the final demonstration labels built, simulated, specified, submitted, pending and confirmed.

Record the decision through the repository review process and append the result to `BUILD-LOG.md`. This assessment does not change a locked contract or authorise feature intake.
