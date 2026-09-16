# South African ANCHOR scalability, security and business proof pack

**Status:** research baseline — sourced facts, explicit model assumptions, and implementation questions.  
**Scope:** VUKA/BEACON ANCHOR only. This document does not claim legal compliance, evidential admissibility, production scale or customer demand.

## Executive finding

VUKA's defensible blockchain use is not alert transport, identity storage, a token or automated dispatch. It is a public timestamp for a Merkle root covering off-chain, signed decision records. The public anchor can remain one root per hour as the network grows, but the total service is not free or fixed-cost: ingestion, signatures, storage, proof generation, verification, monitoring, key custody and customer support scale with event volume.

The South African commercial opportunity is therefore **proof-as-a-service** for parties that already disagree about time and responsibility: households, security companies, estates, insurers, banks and public bodies. The product sells a verifiable chronology, not cryptocurrency.

## 1. South African baseline

### 1.1 Market and safety context

- PSiRA's 2024/25 annual report records **2,921,316 registered security officers and 637,675 active officers as at 31 March 2025**. This is the best current official scale reference found for the private-security operating environment.
- SAPS's official 2025/26 third-quarter publication records, for October–December 2025, **32,833 residential burglaries, 10,918 non-residential burglaries, 7,477 vehicle/motorcycle thefts and 18,068 thefts out of/from vehicles**. These are police-recorded counts, not prevalence estimates.
- Vumacam states that more than **7,000 public-space cameras in Gauteng generate about 12 million licence-plate reads and 55,000 vehicle-of-interest flags per day**. Its FAQ states that the Proof platform managed more than **18,000 public and private cameras by the end of 2024**. These are company claims and are labelled as such.
- NAVIC describes a South African vehicle-intelligence network integrating ANPR data and third-party vehicle-of-interest sources and reports more than **7.5 billion plate reads since 2017**. This is also a company-reported metric, useful as a scale comparator rather than an independently audited fact.
- Fidelity states that its retail security services reach more than **70% of South African retailers** and that it operates major branches across more than 90 points of presence. This demonstrates that a partner-led route can reach national scale without VUKA building an armed-response fleet.

**Implication:** VUKA should not pitch itself as another camera network. Existing players already operate at billions of observations and thousands of cameras. The differentiated product is accountable decision history: who asserted what, when, under which tenant and purpose, and whether an independent party can verify that the record existed before a dispute.

## 2. How ANCHOR works

1. A sensor, operator or partner produces an off-chain event.
2. The event is canonically serialised and hashed.
3. The asserting party signs the event hash with its own key.
4. Signed event hashes are added to an append-only sequence and hourly Merkle tree.
5. Only the 32-byte Merkle root is submitted to OpenTimestamps; no face, plate, audio, location, name or case payload goes on-chain.
6. A subject, insurer, estate or auditor later receives the event, signature, Merkle path and timestamp proof.
7. Verification recomputes the event hash, verifies the signature and Merkle path, and checks the public timestamp independently.

The proof demonstrates **commitment existence and precedence**. It does not prove that a camera classified correctly, an operator told the truth, a device clock was honest, or a legal requirement was satisfied.

## 3. Public-anchor choice

| Question | OpenTimestamps — primary | Hedera HCS — fallback | Private signed log only |
|---|---|---|---|
| Independent public time commitment | Yes, through Bitcoin attestations | Yes, through consensus timestamp/order | No; VUKA remains the time authority |
| Wallet/token | No wallet or token required by VUKA for public calendars | Fees are paid through a Hedera account in HBAR | No token |
| Publication price | Public calendars are free to clients; internal operations still cost money | Official baseline `ConsensusSubmitMessage` price is **$0.0008** from January 2026 | Infrastructure and assurance cost only |
| Immediate final proof | No; submissions may remain pending until upgraded after Bitcoin confirmation | Faster consensus result | Immediate internal signature, but no independent public precedence |
| Dependency after complete proof | Verifiable from Bitcoin data without the original calendar | Hedera network/history and verification tooling | VUKA-controlled infrastructure |
| Best use in VUKA | Long-lived, independently checkable hourly anchor | Operational fallback or faster receipt option | Tier-1 integrity check, never the final independent proof |

At 24 roots/day and 30 days, Hedera's baseline message fee is `720 × $0.0008 = $0.576/month`, excluding account operations, signatures, bytes, integration, monitoring and support. OpenTimestamps' public-calendar fee is approximately zero to the client, not zero total cost of service.

## 4. Reproducible scale model

The accompanying `research/anchor_scale_model.py` uses deliberately visible assumptions:

- 10 signed events per household per day — **scenario assumption, not measured demand**.
- 672 bytes retained per signed event: 512-byte canonical event plus 64-byte signature and 96 bytes of identifiers/metadata — **engineering assumption to replace with measured serialised records**.
- One root per hour, 720 roots per 30-day month.
- Merkle proof size is `ceil(log2(events_in_hour)) × 32 bytes`.

| Scenario | Homes | Events/day | Mean events/hour | Off-chain storage/year | Approx. Merkle path |
|---|---:|---:|---:|---:|---:|
| Honest pilot | 100 | 1,000 | 41.7 | 0.25 GB | 192 B |
| Security partner | 5,000 | 50,000 | 2,083.3 | 12.26 GB | 384 B |
| National network | 100,000 | 1,000,000 | 41,666.7 | 245.28 GB | 512 B |

These results show why the root cost can stay flat while storage and operational work scale linearly. Even the national scenario is not a blockchain-throughput problem: one public root is still submitted per hour. The scale risk sits in off-chain intake, tenant isolation, key verification, backlog recovery and proof-serving capacity.

### Measurements still required before claiming scale

- Real canonical event and signature byte size.
- Ed25519 sign/verify throughput on target server and appliance hardware.
- Merkle construction and proof-generation latency at 42, 2,084 and 41,667 events per batch.
- Database write throughput and storage/index amplification.
- Recovery time after 1, 6 and 24 hours offline.
- OpenTimestamps submission success, time-to-complete-proof and calendar diversity over at least seven days.
- Independent proof verification from a clean machine with no VUKA credentials.

## 5. Security and abuse analysis

| Attack/failure | Why blockchain alone does not solve it | Required VUKA control |
|---|---|---|
| Event omitted before hourly publication | A valid root can commit to an incomplete batch | Monotonic sequence numbers, expected-count reconciliation and omission alarms |
| Two roots published for one hour | Both roots may be valid commitments | Deterministic batch ID and public equivocation monitor |
| Compromised signer key | A valid signature can represent a dishonest actor | Hardware-backed keys where available, key IDs, rotation, revocation and compromise window in every proof |
| Cross-tenant replay | A signed event may be copied into another context | Bind tenant, purpose, event ID and schema version inside the signed bytes |
| Device clock manipulation | Public anchoring proves latest commitment time, not original sensor time | Secure server receipt time, bounded clock-skew checks and both times in evidence |
| Canonicalisation ambiguity | Equivalent-looking JSON can hash differently | Frozen canonical serialisation and cross-language test vectors |
| OpenTimestamps calendar outage | Submission may remain incomplete | Multi-calendar submission, persisted pending queue, retry and scheduled `ots upgrade` |
| Database rollback before anchoring | Recent events can disappear | Durable append log, batch-count reconciliation and alert on sequence gaps |
| Personal-data deletion | Removing payload can make later explanation impossible | Separate deletable payload from permanent event hash; retain lawful minimal metadata only |
| Proof endpoint enumeration | Subject access can become a privacy leak | Strong authentication, tenant/subject authorisation, rate limits and audit records |

A judge-ready security sentence:

> The public anchor makes silent rewriting detectable after publication; signatures attribute assertions; neither mechanism proves the assertion was true, so VUKA also needs omission detection, key governance, tenant isolation and human review.

## 6. South African legal and compliance fit

### ECTA evidence position

Section 15 of South Africa's Electronic Communications and Transactions Act 25 of 2002 says a data message may not be denied admissibility merely because it is electronic and directs courts to consider factors including the reliability of generation, storage or communication and maintenance of integrity. ANCHOR is designed to strengthen those reliability factors.

**Permitted wording:** “Designed to maximise the ECTA section 15 reliability factors.”  
**Prohibited wording without case-specific legal advice:** “Court-admissible,” “legally conclusive” or “guaranteed evidence.”

### POPIA position

The Information Regulator identifies biometric information as special personal information and states that section 19 requires appropriate safeguards for integrity and confidentiality. ANCHOR therefore stores no biometric template, image, plate, location or audio on a public ledger. A hash is not automatically outside POPIA when it remains linkable to a person through data held elsewhere; access controls, retention, deletion and subject rights remain necessary off-chain.

A deletion design must separate:

- the payload, which can be erased when required;
- the event hash and minimal audit fact, whose retention needs a documented purpose and legal basis;
- the public root, which cannot identify a person by itself and cannot be removed from Bitcoin/Hedera.

### PSiRA and partner operations

PSiRA's scale makes registered security companies the realistic distribution and operating channel. ANCHOR does not authorise VUKA to render regulated security services. The partner contract must state who receives alerts, who makes decisions, who dispatches, who is the POPIA responsible party/operator for each dataset, who holds signing keys and who responds to subject-access or breach requests.

### Cybercrimes and incident response

The Cybercrimes Act 19 of 2020 defines data messages and includes preservation-of-evidence mechanisms. ANCHOR's logs must therefore support lawful preservation without turning every record into permanent personal data. Security compromise handling must retain key-compromise time, affected key IDs and proof status so an auditor can distinguish pre-compromise from post-compromise signatures.

## 7. Competitor positioning

| Existing option | Demonstrated strength | Gap VUKA should address, not exaggerate | VUKA differentiation |
|---|---|---|---|
| Vumacam Proof/SafeCity | Large camera and LPR footprint; real-time monitoring ecosystem | Public materials emphasise observation and alerts, not independently verifiable subject-facing decision chronology | Minimal public roots, human-decision proofs and subject-access verification |
| NAVIC | National vehicle-intelligence and ANPR integration | Vehicle intelligence is not the same product as multi-party evidence precedence | Partner with or ingest attestations from ANPR providers rather than rebuilding the network |
| Fidelity and other response companies | Customer base, control rooms, vehicles and regulated operations | Their internal SLA log is controlled by the service provider | Signed dispatch/arrival attestations protect both company and member in disputes |
| Conventional audit database | Fast, cheap and easy to query | Database administrator can rewrite history without an external temporal commitment | Keep the database, add one independent hourly commitment |
| Full on-chain evidence system | Strong public replication | Cost, privacy exposure, deletion conflict and unnecessary throughput | Keep all evidence off-chain; publish only a root |

The comparison must not claim that competitors have no audit controls unless independently verified. The defensible statement is narrower: VUKA offers a proof that can be checked without cooperation from the organisation that owns the operational database.

## 8. How it makes money

All prices below are hypotheses requiring customer interviews and pilots; they are not validated willingness-to-pay.

### A. Security-company accountability licence

- Charge per active subscriber or per control room.
- The partner signs dispatch acknowledgement and on-scene events.
- Value: defend valid SLA performance, resolve complaints faster, reduce manual log reconciliation and differentiate premium response packages.
- Suggested pilot metric: disputes per 1,000 responses, time spent resolving each dispute, and percentage resolved from a complete proof.

### B. Insurer claim-proof API

- Charge per proof bundle used in a claim or through an enterprise integration fee.
- Value: establish that a lock-failure, duress or alarm event was committed before the claim; reduce assessor time and accelerate honest claims.
- Do not claim fraud reduction until a controlled insurer pilot measures it.
- Suggested pilot metric: settlement time, assessor minutes, disputed-claim rate and reversal rate.

### C. Estate/body-corporate governance subscription

- Monthly subscription for dual-signature governance, camera-disable/whitelist audit and independent committee verification.
- Value: trustees and security managers can prove that sensitive changes were approved by the required parties.
- Suggested pilot metric: privileged changes, refused single-signature attempts, investigation time and resident subject-access completion.

### D. Bank coerced-transfer evidence service

- Enterprise API or case fee for a duress event committed before a transaction dispute.
- Value proposition: chronology unavailable from the payment record alone.
- High regulatory and evidential burden: treat as a later partnership experiment, not near-term revenue.

### E. Third-party proof infrastructure

- Offer canonical hashing, signer registration, hourly batching and public verification to other South African security or insurance platforms.
- VUKA never needs their raw personal data: partners can submit signed hashes and retain their own payloads.
- Revenue: platform fee plus proof-verification volume; risk: key governance and support obligations grow materially.

## 9. Commercial proof plan

1. Interview one estate, one PSiRA-registered security operator and one insurer claims manager.
2. Present one real workflow, not “blockchain”: disputed response time, coerced transfer or subject-access history.
3. Measure the current cost of the dispute in staff minutes, elapsed days and customer churn/escalation.
4. Run a 30-day shadow pilot that creates proofs without changing operational decisions.
5. Price below the measured dispute-handling saving.
6. Publish negative results. If proofs are never used or do not shorten disputes, do not invent blockchain value.

### Minimum evidence for a hackathon business claim

- One named customer role interviewed, with date and non-confidential notes.
- One end-to-end proof verified from a clean machine.
- One measured performance table generated from repository code.
- One cost model separating public-anchor fee from total service cost.
- One legal wording review that preserves the distinction between reliability support and legal admissibility.

## 10. Sources and provenance

| Source | Use | Classification |
|---|---|---|
| https://www.parliament.gov.za/storage/app/media/Docs/ann_rep/01dx3n75c5wgq45w2mcbflp5iujomkx72a.pdf | PSiRA 2024/25 registered and active officer counts | Official annual report hosted by Parliament |
| https://www.saps.gov.za/services/downloads/2025/2025-2026_-_3rd_Quarter_WEB.pdf | Q3 2025/26 police-recorded crime counts | Official SAPS publication |
| https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf | ECTA Act 25 of 2002, section 15 | Official government Act PDF |
| https://www.justice.gov.za/legislation/acts/2020-019-Cybercrimes.pdf | Cybercrimes Act 19 of 2020 | Official Department of Justice Act PDF |
| https://inforegulator.org.za/popia/ | POPIA duties, security safeguards and guidance links | Official Information Regulator |
| https://inforegulator.org.za/wp-content/uploads/2020/07/Guidance-Note-Processing-Special-PersonalInformation-20210628-004.pdf | Special-personal-information guidance | Official Information Regulator guidance |
| https://opentimestamps.org/ | Public calendars and operating model | Project primary source |
| https://github.com/opentimestamps/opentimestamps-client | Multi-calendar client and pending/complete proof behaviour | Official client repository |
| https://hedera.com/blog/price-update-to-consensussubmitmessage-in-consensus-service-january-2026 | January 2026 HCS price change | Hedera primary source |
| https://docs.hedera.com/networks/fees | Current published fee table | Hedera documentation |
| https://vumacam.co.za/ and https://vumacam.co.za/faq | Camera/read/platform scale claims | Competitor self-report |
| https://navic.cloud/ | ANPR network and plate-read claims | Competitor self-report |
| https://fidelity-services.com/ and https://fidelity-services.com/about-us/ | Retail reach and operating footprint | Competitor self-report |

## Decision recommendation

Proceed with OpenTimestamps as the primary public anchor and preserve Hedera as a separately priced fallback. Before making a scale or revenue claim, build and run the benchmark, measure proof completion over seven days, verify one proof independently, and complete three South African buyer interviews. Pitch ANCHOR as **accountability infrastructure for disputes**, not as a blockchain feature.
