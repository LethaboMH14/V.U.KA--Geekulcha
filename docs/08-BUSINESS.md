# VUKA — Business Case & Go-to-Market

**Team Sonar · Geekulcha Annual Hackathon 2026**
⚑ = estimate to verify before final submission. Everything unmarked is from our own dataset or computed from first principles.

---

## 1 · The market, from the data we hold

| Measure | Value | Source |
|---|---|---|
| Incidents analysed | 15,712 | Our cleaned claim dataset |
| Theft exposure | **R1.09bn** (contents R406.6m + vehicle R686.3m) | Same |
| Every 1% prevented | **≈ R10.9m** off the loss ratio | Derived |
| Hijackings / armed robberies | 680 / 272 | Same |
| Peak concentration | 00:00 hour = 1,296 incidents, ≈3× the 05:00 trough | Same |
| Precincts with official statistics | 678, all nine provinces | SAPS quarterly release |
| Private security officers vs police | ~2.7m registered vs ~180k ⚑ | PSiRA / SAPS — **verify** |

**The strategic read:** South Africa already spends billions on private security. VUKA does not create a new behaviour or a new budget line — it makes an existing spend *targeted*, and adds a record that makes the spend *provable*.

---

## 2 · Revenue streams

### 2.1 Consumer

| Product | Price ⚑ | Contents |
|---|---|---|
| **VIGIL** | **Free** | Duress detection, Guardians, safest route. *The layer that saves lives is never behind a paywall* |
| **VIGIL+** | R99 / month | Guardian network, full history, priority relay |
| **KHAYA bundle** | R299 / month | Appliance included, or R3,999 upfront + R149/month |

**Unit economics, KHAYA at R299/month:**

| Line | Amount |
|---|---|
| Hardware amortised (R3,000 ÷ 24 months) | R125 |
| Cloud + anchor, per household | R12 |
| Support and operations | R25 |
| **Gross margin** | **R137/month ≈ 46%** |

Margin improves with volume on both sides: BOM falls, and **the anchoring cost never rises.**

### 2.2 B2B — the volume business

| Customer | Price ⚑ | Justification |
|---|---|---|
| Security company licence | **R35 / subscriber / month** | A 5,000-subscriber operator = R175,000/month, resold at their own margin |
| Patrol optimiser (SaaS) | **R12,000 / month per control room** | Pays for itself on fuel alone — target −30% at ≥80% coverage of top risk hex-hours |
| Estate / body corporate | **R5,500 / month per estate** | Shared cameras, two-signature governance, community risk view. One committee decision covers 200+ homes |

### 2.3 Insurer

| Line | Price ⚑ | Justification |
|---|---|---|
| Verified-installation fee | **R40 / active member / month** | Funded by loss-ratio improvement. Theft alone is R1.09bn across 14,380 claims — **1% prevented ≈ R10.9m, which funds ~22,700 member-months** |
| Claims verification | **R15 per anchored record** used in a claim | Disputed claim → evidenced claim. Cheaper than assessor hours |

### 2.4 ANCHOR as a service — the blockchain revenue line

| Line | Customer | Why they pay |
|---|---|---|
| **Coerced-transfer dispute record** | Retail banks | A duress signal timestamped *before* the transaction is evidence that **does not currently exist at any price** |
| Chain-of-custody API | Third-party security operators | Their own response times become provable — which protects them from false accusations of slowness |
| Anchored claim records | Assessors, loss adjusters | Settlement in days rather than weeks |

**Because anchoring is batched, every additional writer is close to pure margin.** The cost does not scale with usage.

### 2.5 Public sector

Risk-layer data licence to municipalities and provincial community-safety units ⚑, built entirely on official open data — no POPIA exposure in the data product.

**No enforcement product. Ever.** We sell insight and accountability, not policing.

### 2.6 What we refuse to sell

| Refused | Why |
|---|---|
| **Street-level risk as an underwriting input** | Technically trivial and it is **redlining** — it would price up exactly the communities that most need cover. **We removed this from our own business case** |
| Personal data, biometric templates, footage | Not to anyone, at any price |
| Tokens | A loyalty ledger does not need a blockchain, and we will not pretend otherwise |

---

## 3 · Cost structure

### Hardware — the KHAYA appliance

| Component | Prototype ⚑ | At 1,000 units ⚑ |
|---|---|---|
| ARM SoC with NPU | R2,200 | R1,700 |
| LiFePO4 pack + BMS (48–72 h) | R1,100 | R850 |
| Enclosure, tamper switch, PoE, assembly | R600 | R450 |
| **BOM** | **R3,900** | **R3,000** |

### Running costs

| Line | Amount ⚑ |
|---|---|
| Cloud at ~1,000 homes (relay, DB, short clips) | R10,000–15,000 / month |
| Marginal cloud per household | ~R12 / month |
| **Anchoring — entire network, any size** | **~R1.30 / month** |

> **The line to say out loud on stage:**
> *"Our blockchain costs one rand thirty a month. For the whole network. Because we batch every household into one hourly root, it is a **fixed** cost — at a hundred homes or a hundred thousand it is the same number. A chain that gets cheaper per user as you grow is what 'commercially viable' actually means."*
>
> Three rivals in that bucket will be explaining gas fees.

### People — pilot phase, three founders

Founder stipends R25,000–35,000 / month each ⚑. First support hire at ~500 households.

### Compliance and assurance — non-negotiable, and it is a moat

| Line | Cost ⚑ |
|---|---|
| POPIA legal review + Information Officer registration | R40,000 once |
| Independent security assessment (OWASP Top 10 / API Top 10) | R60,000 — **potentially sponsored; CompTIA is an event partner** |
| Penetration test before first paying household | included above |
| PSiRA implications review | we integrate with armed response, we do not dispatch |

### Model and data

Labelled acoustic dataset collection — mostly team time. GPU compute for fine-tuning R8,000–15,000 for the pilot ⚑. Geocoding cached and checked in, effectively zero ongoing.

### What we deliberately do not spend on

Video storage at scale (we store vectors and labels, not footage) · facial-recognition licensing (open models, human-gated) · armed vehicles (our partners' business, not ours).

---

## 4 · Go-to-market

### The strategic call: sell **through** security companies, not against them

They already hold the customer relationship, the monthly billing rail, and armed vehicles on the road. Competing means buying households one at a time. **Partnering means one integration reaches thousands, and CAC collapses.** VUKA makes their fuel cheaper and their response times provable — we make them better rather than replacing them.

### Channel sequence

| Phase | Channel | Motion |
|---|---|---|
| **1 · Prove** | GKSS chapters, Geekulcha network, our own street | 20–50 honest installations. Field-test false-alarm rates. Publish them |
| **2 · Partner** | One mid-size security company | Integration pilot. Prove the fuel saving and the provable-response-time argument with their own data |
| **3 · Bundle** | One short-term insurer | Premium discount as the acquisition mechanism, loss-ratio improvement as the payback. *The insurer's discount acquires the customer — we pay no marketing rand* |
| **4 · Govern** | Estates and body corporates | The two-signature control is written for their governance structure: security manager + chairperson, neither able to disable cameras alone |
| **5 · Anchor** | A bank's fraud and disputes team | Sold into fraud, not marketing. A verifiable duress record predating a transaction is unavailable today at any price |
| **6 · Public** | CPSI, provincial safety departments | Risk layer on official open data |
| **7 · Continental** | Kenya via Reboot Republic (Kisumu) | Load-shedding, thin bandwidth and high property crime are not uniquely South African. Swap the dataset; the architecture ports |

### Why they adopt — per party, in their own interest

| Party | What they get | Why they say yes |
|---|---|---|
| Member | Something that notices when they cannot reach a phone | Nothing else does this |
| Security company | −30% fuel target, **and proof they were fast** when a customer says otherwise | They currently have no defence against that accusation either |
| Insurer | Disputed claims become evidenced claims; fraud down, settlement faster | Every 1% of theft prevented ≈ R10.9m |
| Estate | Nobody can disable the cameras alone | Their governance requires exactly this and nothing offers it |
| Bank | Evidence in a coerced-transfer dispute | The record does not exist today |
| Government | Safety tech that can be **checked** rather than trusted | POPIA answered in architecture, not a policy PDF |

**Every adoption is self-interested. Nobody is being asked to do us a favour.**

---

## 5 · Unfair advantage

| # | Advantage | Why a competitor cannot simply copy it |
|---|---|---|
| **1** | **An anchored history compounds and cannot be backdated** | From the hour we begin publishing, our verifiable record grows. A later entrant starts at zero and can never catch up on record length — you cannot retroactively insert entries into a public chain. Features are copyable. Provable history is not |
| **2** | **~33,600 lines shipped before this hackathon existed** | 440 tests, 25 ADRs, 6,800 lines of architecture docs, measured 318 ms p95 — all committed in July, all public, all timestamped. Nobody compresses that into a weekend |
| **3** | **We defend against our own operators** | The whitelist blind spot is a category-level gap across all of private security. Two signatures plus a public anchor. We are first through it |
| **4** | **Credibility cannot be retro-fitted** | A written list of claims we refuse to make. We publish the numbers that embarrass us — our forecast loses to a constant and we say so. A rival can adopt the practice; they cannot produce six weeks of it dated before they needed it |
| **5** | **Built for here, not ported to here** | Offline-first, load-shedding-native, 2 GB Android, works when the tower is down. The constraint was the starting point — which also makes it portable to every market with the same constraints |
| **6** | **We lived the problem** | Family and friends of this team have been through the coerced-transfer robbery. That is not a market-research finding |

---

## 6 · Metrics — how we will know

### Technical (published in the repo)

| Metric | Target | Current |
|---|---|---|
| Detection → alert, p95 | ≤ 2,000 ms | **318 ms** ✅ |
| Anchor liveness (hours with a published root) | 100% | — |
| Dual-signature compliance on destructive actions | 100% | — |
| False alerts per camera-week | ≤ 1 | in evaluation |
| Forecast skill vs naive baseline | beat it | ⚠️ **FAILS — MAE 0.484 vs 0.246. Published** |

### User outcomes

- **Duress detections with zero user interaction** — the core claim, measured
- Median time from detection to a human decision
- Cancel-window usage — how often people stop a false escalation *(a health signal, not a failure)*
- **Alarm-arming rate** — do people keep it armed? The metric every alarm company quietly fails
- Subject-access requests fulfilled inside the POPIA window

### Commercial

Disputes resolved using an anchored record · claims settlement time (weeks → days) · fuel per risk-hour covered · monthly churn · homes per estate · control rooms live · **CAC by channel** — expected to be dramatically lower through security partners.

---

## 7 · Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Judged on blockchain depth** in a bucket of blockchain-literate teams | Our chain is minimal *by design*, and minimalism is what makes it commercially viable. R1.30/month, no wallet, no personal data. We frame the discipline as the achievement |
| POPIA blocks public-sector adoption | **G3 is in the current build cycle.** Retention TTL, subject-access, deletion route — and the anchor makes our posture stronger than most commercial systems |
| Hardware supply and cost | Software-first: VIGIL needs no hardware at all. KHAYA is phase 2 |
| Security company sees us as a competitor | We sell *through* them and improve their unit economics. We never dispatch |
| Insider misuse of the platform | The two-signature control is the product answer, and it is also our best pitch line |
| Small team (three) | Scope is sequenced, not parallelised. Contracts frozen before implementation so the three workstreams do not block each other |
| Our own overclaiming | The honesty ledger, and an open-gap register published in the spec |
