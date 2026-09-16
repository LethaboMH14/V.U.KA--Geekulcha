# Production readiness (C3, C4; security operations I)

**Not ready for deployment.** No application code exists here. Controls below are specified, not operating. Paths in the security table are proposed implementation locations, not evidence. Credential/data remediation was completed and forensically verified 13 Sep (`docs/OPEN-GAPS.md` G6/G7; verification record `09-credential-remediation-verification.md`); production remains blocked by privacy routes, hardware measurements, response contracts and independent assurance.

## 1. Deployment topology

| Environment | Proposed exact service selection | Switch and verification |
|---|---|---|
| Local rehearsal | Laptop Docker Compose: FastAPI/WebSockets, PostgreSQL, filesystem proof store and outbox worker; Android on same LAN; synthetic fixtures only | `DEMO_MODE=sim_local`, endpoint chosen before rehearsal; airplane-mode WAN test; local LAN works without tunnel |
| Staging | Azure Container Apps API/worker, Azure Database for PostgreSQL Flexible Server, Blob Storage, Key Vault, Service Bus, Azure Monitor/Application Insights; South Africa North subject to actual availability | `sim_staging`; synthetic tenants; choose local profile if cloud fails, clear sessions and reset fixture IDs |
| Production | Same Azure services with private DB/storage endpoints, managed identity, controlled ingress, redundant replicas, tested PostgreSQL recovery and backup retention | Separate subscription/keys/data; no automatic demo-to-production switch; two-lead and legal release gate |

These configuration names are specifications, not implemented commands. Laptop plus optional authenticated tunnel supports remote viewing when WAN is available. Tunnel failure must not break the local LAN path. No real incident is rerouted into simulation. Pin runtime versions and images at implementation after support/security review; none are invented as tested versions here.

## 2. Cloud and data-cost model

[Azure for Students](https://azure.microsoft.com/en-us/free/students) supplies a US$100 credit usable within 12 months on most products, subject to eligibility. Do not assume regional quota or free production services. Use the [Azure calculator](https://azure.microsoft.com/en-us/pricing/calculator/) with actual subscription region, exchange rate, tax, retention and observed workload before procurement.

ASSUMPTION monthly rand envelope, excluding VAT, student credit, devices, LTE, support and response labour; not Azure quotes:

| Component | 100 homes | 1,000 homes | 10,000 homes |
|---|---:|---:|---:|
| API + worker compute | R600 | R1,800 | R8,000 |
| PostgreSQL | R700 | R1,600 | R6,000 |
| Blob + backups | R80 | R300 | R1,600 |
| Key Vault | R20 | R50 | R200 |
| Service Bus | R100 | R300 | R1,200 |
| Monitor/logs | R150 | R500 | R2,500 |
| Network/egress | R50 | R200 | R1,000 |
| Total by addition | **R1,700** | **R4,750** | **R20,500** |
| Per home = total/homes | R17 | R4.75 | R2.05 |

First real invoice is usage charges less remaining eligible credit, plus applicable tax; these totals are scenarios, not a predicted bill. Free tiers end per meter or credit/eligibility limits, not at a particular household count. Capture calculator exports and Azure meter estimates before stating exact tier boundaries. At 100 homes, R17 exceeds the supplied R12 allocation by R5/home even before excluded items. No economy-of-scale conclusion without load tests.

ASSUMPTION event-rate worksheet: 100 events/home/day × 2 KB × 30 days × 2 transport overhead = 12,000 KB/month = 12 MB (decimal). At an assumed R100/GB, event data alone costs 12/1,000 × R100 = R1.20/month. LTE plan minimums, heartbeats, reconnects, proofs and software/model updates are additional. Actual event rates were not supplied: Vukosi must capture a representative traffic trace and carrier quote; no “actual cost” can yet be claimed.

## 3. Edge and power

Load-shedding stage does not determine an individual home's outage length. Check the local schedule, battery charge and measured load. ASSUMPTION 15 W appliance + 5 W router, 80% usable battery and 85% conversion efficiency: required nominal Wh = 20 W × outage hours / (0.8 × 0.85). Two hours = 58.8235… Wh; four = 117.6470… Wh; six = 176.4705… Wh. These are sizing examples, not tested runtime. Budget phone sensing separately.

| Stage scenario | Behaviour target | Household loss |
|---|---|---|
| 2 | Use schedule and charge level; UPS sustains local queue and router where measured adequate | Remote delivery stops if last-mile network fails |
| 4 | More frequent recharge constraints; reduce noncritical processing first | Vision availability may fall; explicitly report input loss |
| 6 | Plan for incomplete recharge; graceful shutdown before corruption | Camera and appliance sensing eventually cease; independent phone capability only if powered |

LTE failover needs explicit data budget and an available tower. Wi-Fi does not imply internet. One day offline: retain bounded encrypted queue and display last contact; one week: payload retention may expire, leave explicit gap receipts; one month: no indefinite payload retention or pretend continuity, require recovery check and key/config reconciliation. Capacity and lawful retention jointly bound queues. Raw audio stays only in the three-second memory ring; never spool audio to disk during outage. Theft protection requires encryption and key revocation; it does not recover lost unuploaded evidence.

## 4. Security coverage

Taxonomy: [OWASP web 2021](https://cheatsheetseries.owasp.org/IndexTopTen.html), as explicitly requested, and [API 2023](https://api-security.owasp.org/editions/2023/en/0x00-header/). These versions are an audit baseline, not a claim to cover every current risk. Every application path below is **absent/proposed**. Repository scanning is separately configured in SECURITY.md.

| ID / risk | Proposed control and location | Verification to earn “built” |
|---|---|---|
| A01 Access control | Tenant/object checks `server/authz.py` | Cross-tenant deny matrix |
| A02 Crypto failure | AEAD payloads, managed keys `server/crypto.py` | Wrong-key, nonce and rotation tests |
| A03 Injection | Parameterised DB, schema validation `server/db.py` | Injection corpus and query review |
| A04 Insecure design | Human gate and two distinct approvals `server/governance.py` | Bypass and duplicate-signer tests |
| A05 Misconfiguration | Deny debug, least privilege `infra/` | Deployment policy scan |
| A06 Outdated dependencies | Pinned deps/SBOM `requirements.lock` | Vulnerability and update review |
| A07 Authentication | MFA/session expiry `server/auth.py` | Replay, logout, recovery tests |
| A08 Integrity | Signed updates/model hashes `edge/update.py` | Reject modified/rolled-back package |
| A09 Logging/monitoring | Redacted audit/outbox `server/audit.py` | Prove tamper alert without payload leaks |
| A10 SSRF | Egress allowlist `server/egress.py` | Deny metadata/private address fetch |
| API1 Object authority | Scope every object `server/authz.py` | Enumerated-ID cross-tenant denial |
| API2 Authentication | Device/session credentials `server/auth.py` | Revoke device and reject replay |
| API3 Property authority | Explicit writable fields `server/schemas.py` | Cannot mass-assign review or role |
| API4 Resource exhaustion | Rate/size/queue caps `server/limits.py` | Load and oversized-payload tests |
| API5 Function authority | Role + action checks `server/authz.py` | Member cannot call operator routes |
| API6 Sensitive-flow abuse | Approval/rights-request abuse limits `server/workflows.py` | Bulk attack blocked without denying lawful rights |
| API7 SSRF | Same egress enforcement `server/egress.py` | Redirect/DNS-rebinding tests |
| API8 Misconfiguration | Explicit CORS/TLS/errors `infra/` | Untrusted origin, debug-error probes |
| API9 Inventory | Versioned routes/retirement `contracts/openapi.yaml` | Deployed routes match inventory |
| API10 Unsafe upstream use | Validate responses/timeouts `server/integrations.py` | Malformed/hostile upstream fixtures |

| Beyond the lists: attack | Proposed control | Verification |
|---|---|---|
| Dependency/model compromise | SBOM, provenance, licence and pinned digest review | Rebuild and compare digest; reject unsigned update |
| Operator whitelists accomplice | Distinct scoped two-of-two signatures; log attempts | Same operator twice fails |
| Vendor rewrites evidence | Independent public proof and export | Modify export; verify failure outside vendor |
| Appliance theft | Disk encryption, scoped device identity, revocation | Remove disk and revoke device in exercise |
| Camera blinding | Occlusion/heartbeat fault, no adverse inference about people | Covered-camera test |
| Enclosure tamper | Tamper event and sealed maintenance process | Open enclosure test; no injury mechanism |
| Radio jamming | Offline queue, explicit freshness | RF loss exercise in lawful test environment |
| Power cut | UPS plus clean shutdown | Cut mains, restore and verify chain |
| Duress credential exposed | No observable special UI/traffic behaviour claimed until measured | Blinded UI, timing, packet and notification comparison |
| Operator coerced | Separation of approval, safe escalation, restricted credentials | Tabletop coercion; one person cannot override two-signature rule |

No test here establishes physical safety under coercion. If duress equivalence fails, exclude that mode from real-world use and describe the limitation.

## 5. Data protection

Engineering mapping for qualified legal review, based on the [POPIA Act](https://www.justice.gov.za/legislation/acts/2013-004.pdf). The responsible party must approve actual purpose, lawful basis and processor contracts; this document cannot discharge the obligations.

| Sections | Application and release evidence |
|---|---|
| 8 | Named responsible party; accountable decision record |
| 9–12 | Lawfulness, minimal collection, specific basis and source for each data class |
| 13–14 | Purpose and enforceable retention/deletion including backups |
| 15 | No reuse for unrelated marketing, policing or model training without lawful compatibility analysis |
| 16 | Quality, contested matches and corrections; uncertainty preserved |
| 17–18 | Processing inventory, accessible notices and camera signage |
| 19–21 | Security safeguards and written operator arrangements, tested controls |
| 22 | Compromise assessment and notification process |
| 23–25 | Subject access/correction and manner of access; verify identity proportionately |
| 26–33 | Special-information restrictions; review biometrics/criminal-behaviour processing |
| 34–35 | Children's information; no blanket household-consent shortcut |
| 55–56 | Information officer registration, responsibilities and deputies |
| 57–59 | Assess prior-authorisation triggers before matching identifiers or covered processing |
| 69 | Separate direct-marketing rules and opt-outs |
| 71 | Assess automated-decision restrictions; human gate must be meaningful |
| 72 | Cross-border safeguards for every processor/subprocessor and support-access region |

ASSUMPTION draft retention schedule: raw audio three seconds RAM (supplied design); raw camera frames processing memory only; nonincident embeddings 24 hours; unverified candidates 7 days; verified incident payloads 30 days pending documented purpose/hold; account/contact data contract duration plus 30 days; security logs 90 days; backup expiry 30 days. These durations require legal/operational approval, are not statutory defaults and are not implemented. Identity-check documents should be minimised and removed once no longer required. Proof metadata also needs a purpose review; “forever because hash” is not a retention policy.

Proposed rights route: S11 request → generic receipt → proportionate identity check → scoped search → redact third parties → secure delivery or reasoned refusal → appeal to information officer. Deletion: check documented hold → obtain two distinct approvals → delete payload, indexes, caches and links → tombstone action → enforce backup expiry/reapply tombstone after restore → receipt explaining residue. Retaining a hash is not automatically lawful anonymisation. Use hiding commitments with random secret input before public anchoring; review linkability and key disposal before use. A legal challenge cannot be guaranteed to fail.

Section 22 requires notification as soon as reasonably possible after discovery of qualifying unauthorised access/acquisition, subject to statutory qualifications, to the Regulator and affected subjects where identifiable; no invented universal 72-hour rule. Record containment, affected classes and recommended protective action. The Regulator directs security-compromise reports through its eServices portal ([official guidance](https://inforegulator.org.za/popia/)). Information officer registration and current procedures must be checked before launch. South African hosting alone does not settle cross-border support, telemetry or subprocessors.

## 6. Reliability and runbooks

| Failed layer | Required lower-layer behaviour |
|---|---|
| Public anchor | Local signed chain continues; proof pending, retry without changing event |
| Cloud/UMOJA | KHAYA and VIGIL queue within lawful bounds; no delivery claim |
| KHAYA | Phone remains independent only for functions actually implemented and powered |
| VIGIL | Appliance may still operate; household view shows phone last contact |
| Operator service | No automated consequential substitute; queue/handover and limitation |

Degradation ladder: full acknowledgement → connected but unacknowledged → locally recorded/queued → partial sensing → powered down. Stale uses last successful contact; blank means no data has ever been obtained, not a healthy empty state.

ASSUMPTION recovery objectives: cloud RPO 15 minutes, RTO 4 hours; not achieved. Backup encrypted DB, proof bundles, signed chain heads and deletion tombstones separately from keys. Restore into isolation, reapply deletions, recompute hashes, verify signatures and Merkle paths against independently held public proofs, then reconcile outbox IDs before accepting writes. Unanchored tail can remain uncertain; never fill gaps. Monitor queue age, last device contact, failed human/approval checks, proof confirmation age, disk/UPS status and restore drills without logging sensitive payloads.

Five incident runbooks: (1) API outage—Sibusiso checks health/DB, freezes duplicate response requests, switches rehearsal to local only, restores and reconciles IDs; (2) edge offline—Vukosi checks power/contact age, notifies through agreed safe channel, restores without overwriting queue; (3) key compromise—Ipeleng isolates identity, revokes/rotates under two-person control, preserves evidence and evaluates s22; (4) timestamp backlog—Sibusiso preserves batches, tries vetted alternate calendars, shows pending, verifies before confirmation; (5) privacy request/deletion failure—Ipeleng pauses affected export/processing, preserves request receipt, fixes scoped deletion and verifies backup handling. Each incident gets timeline, owner, impact, recovery proof and review entry.

## 7. Forty edge cases

“Now” in every row means this clean checkout. S = specified in this pack, not built.

| # | Group / event | Now | Required behaviour | Status |
|---:|---|---|---|---|
| 1 | Phone killed by Android | Absent | Restart policy and visible last contact | S |
| 2 | Phone battery dies | Absent | No remote receipt; independent edge only | S |
| 3 | Phone stolen | Absent | Revoke device without exposing records | S |
| 4 | SIM replaced | Absent | Reauthenticate device, do not trust number alone | S |
| 5 | Permission withdrawn | Absent | Explain specific lost function | S |
| 6 | Edge storage full | Absent | Bounded queue and explicit gap event | S |
| 7 | Appliance stolen | Absent | Encryption/revocation; lost tail disclosed | S |
| 8 | Camera blinded | Absent | Fault status, no person accusation | S |
| 9 | UPS exhausted | Absent | Safe shutdown and dirty-start check | S |
| 10 | Sensor clock wrong | Absent | Separate local and server time | S |
| 11 | Wi-Fi works, WAN fails | Absent | Local operation, unsent status | S |
| 12 | LTE tower fails | Absent | No promised failover; queue | S |
| 13 | Duplicate deliveries | Absent | Idempotent event/action identities | S |
| 14 | Reordered messages | Absent | Sequence validation, hold gaps | S |
| 15 | Month offline | Absent | Retention-bounded loss report and recovery check | S |
| 16 | Member dies | Absent | Verified estate request, no informal transfer | S |
| 17 | Household moves | Absent | Unpair, erase scoped data, new-site consent | S |
| 18 | Child repeats triggers | Absent | Review burden; no punishment automation | S |
| 19 | Consent disagreement | Absent | Pause disputed collection; human resolution | S |
| 20 | Operator shift ends | Absent | Explicit unresolved handover | S |
| 21 | Embedding collision | Absent | Preserve uncertainty; challenge/correct | S |
| 22 | Wrong tenant ID | Absent | Reject before reading payload | S |
| 23 | Retention during export | Absent | Snapshot scoped package or explicit expiry | S |
| 24 | Restore deleted payload | Absent | Reapply tombstones before service | S |
| 25 | Missing proof file | Absent | Show unverifiable, never green | S |
| 26 | Camera into neighbour window | Absent | Reposition/mask and cease unlawful capture | S |
| 27 | Court demands unheld audio | Absent | Explain verified nonretention; legal review | S |
| 28 | Provider liquidation | Absent | Contracted export/deletion and handover plan | S |
| 29 | Police informal access demand | Absent | Refer to lawful-process review | S |
| 30 | Minor requests file | Absent | Proportionate lawful assistance | S |
| 31 | Coerced operator | Absent | Restricted authority and safe escalation | S |
| 32 | Same signer approves twice | Absent | Distinct principal check | S |
| 33 | Vendor edits past log | Absent | Independent proof detects mismatch | S |
| 34 | Jamming during incident | Absent | Record contact loss without guilt inference | S |
| 35 | Malicious update | Absent | Reject bad signature and rollback | S |
| 36 | Pet carries device away | Absent | Device fault, never identity finding | S |
| 37 | Projector shows subject data | Absent | Synthetic-only presentation dataset | S |
| 38 | Bitcoin fees spike | Absent | Pending proofs; no per-user fee guarantee | S |
| 39 | OpenTimestamps outage | Absent | Queue and vetted alternate calendars | S |
| 40 | Judge changes phone clock mid-demo | Absent | Keep ordering separate, disclose clock change | S |

## 8. Concurrency and authority

Two operators: optimistic version check plus time-bounded review lease; first valid atomic commit wins, loser reloads; audit both attempts. Approval signatures bind action digest, tenant, entity, expected version, expiry and nonce; no self-approval using a second session. Transactional outbox couples state and event, and responders deduplicate requests.

A member in two households has two memberships with scoped permissions, not a merged surveillance graph. Six phones share household state but have distinct device keys and consent; revoking one does not erase everyone. An estate with 200 homes has tenant-scoped queues and explicit delegated roles; load/capacity remains untested. A person seen on three streets is not automatically linked across graphs: lawful purpose and scoped human process are prerequisites. Uncertainty wins over an automatic union. No last-write-wins rule for consent, deletion or privileged approvals.

§11 check: complete requested OWASP matrices and forty cases; costs and objectives labelled assumptions; no absent application path claimed as implemented; legal uncertainties retained. Proceed to WBS. Human acceptance pending.
