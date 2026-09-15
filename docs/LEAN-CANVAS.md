# VUKA — Lean Business Canvas, ready to paste

**Figures marked ⚑ are estimates to verify before the deck.** Everything unmarked comes from your own dataset or from costs I've computed. Criterion 2 wants money in it — so there's money in it.

---

## 1 · PROBLEM

```
You cannot open a bank account in South Africa without installing the app. That is
not a convenience any more, it is a requirement — so every one of us now carries
the vault and the key in the same pocket, secured by a face or a finger that can be
taken by force.

Criminals adapted before the banks did. The robbery is no longer the wallet. It is:
unlock the phone, open the app, transfer, then drive to an ATM for the daily limit.
The victim performs the transaction. Every record the bank holds says they
authorised it — their face, their finger, their device — and the victim is the one
who then has to prove otherwise.

FOUR FAILURES, ALL THE SAME SHAPE:

1. HELP REQUIRES A FREE HAND. Panic buttons, apps, speed dials — every one needs a
   hand and a moment of privacy. Coercion removes both. There is no product for the
   person who cannot ask.

2. ALARMS SENSE MOTION, NOT PEOPLE. A PIR sensor mounted high enough that the dog
   doesn't trip it is also high enough for a person to crawl under — and it cannot
   tell a cat from an intruder either way. So people disarm them, and then they own
   an expensive light switch.

3. NOBODY IS WATCHING THE WATCHERS. Camera networks decide who is suspicious with no
   record a resident can inspect. Add a vehicle to a "known" list and it becomes
   invisible to the system — permanently, silently, with one click by one person.
   That is the highest-value insider attack in private security and it is undefended.

4. EVERY DISPUTE IS SETTLED BY WHOEVER OWNS THE LOG. A coerced transfer, a jammed
   remote with no forced entry, an argument about how long armed response took. In
   each case the party holding the record has money riding on the outcome, and the
   person who was harmed has to argue.

THE SCALE, from 15,712 real claim records we cleaned and analysed:
Theft alone: 14,380 claims ≈ R1.09bn (contents R406.6m + vehicle R686.3m).
Hijackings 680. Armed robberies 272. The 00:00 hour carries 1,296 incidents —
roughly 3× the 05:00 trough. Crime here is concentrated in time and place, which
means it is targetable.
```

---

## 2 · SOLUTION

```
VUKA — "wake up." Four layers, one system.

VIGIL — the person (built)
· Three physically independent senses on the phone: sound, motion, vehicle link
· Recognises the SHAPE of a sound, keeps the label, discards the audio
· Phone-to-car pairing breaking while the car moves = a hijack signature, no button
· Covert duress PIN: unlocks completely normally while alerting your people
· Fake-shutdown / stealth mode
· Runs with no signal, no power, screen off — reasoning is on-device
· A visible cancel countdown on every escalation

KHAYA — the home (built)
· Distinguishes a PERSON from an animal instead of merely sensing motion, so pets
  roam free and a crawling intruder is still seen
· Acoustic detection: glass break, gunshot — with a second-stage check that
  overrules the first when it hears speech
· Away mode: anything human in the yard triggers a deterrent siren
· Live feed, adjustable detection zones and heights
· Sealed appliance, 48–72h battery, LTE failover, tamper switch

UMOJA — the street (built)
· Whitelist BEFORE watchlist: residents, domestic workers and regular deliveries
  are learned first, so familiarity is never suspicious
· Recurrence only counts when the entity is unknown to the street: 3+ sightings,
  2+ cameras, inside 14 days
· Faces stored as vectors, never images
· Machine ceiling is "worth a human look." No code path can accuse anyone
· Risk layer: 678 SAPS precincts, 9 provinces, 709 geocoded suburbs
· Patrol routing (OR-Tools) with a 12-minute dwell — the dose that actually
  suppresses crime
· Safest-route: fewest high-risk cells at this hour, not the fastest road

ANCHOR — the record (building)
· Hash chain over every decision, each entry bound to the one before
· Ed25519 signatures — one key per party: device, operator, security company
· Hourly Merkle root published to a public blockchain. 32 bytes. No personal data
· TWO SIGNATURES required to whitelist, disarm a camera, or change a threshold
· Subject-access: any person can retrieve every decision made about them, with proof
· Deletion removes your data; the record that a decision happened survives
· Box heartbeats are signed — so destroying the box makes the gap itself evidence
```

---

## 3 · UNIQUE VALUE PROPOSITION

```
You are not alone. You don't have to ask.

Every safety product ever built requires you to ask for help — press a button, open
an app, make a call. On the night someone is standing over you telling you to unlock
your phone, you cannot ask. VUKA works it out without being asked, and then publishes
what it did somewhere we cannot reach.

Every other safety network asks you to trust it. Ours can be verified.

It forgets you at a seven-day half-life, with nobody required to clear you.
It never forgets what it did.
```

> **Competitor awareness.** Every existing SA safety network — Vumacam's 2,000 cameras, Fidelity ADT's patrol fleet, the WhatsApp group on your street — operates on a *trust-me* model: the evidence is owned by the provider, and nobody can verify it without their cooperation. VUKA publishes a hash chain a stranger can verify without our help. The full mapping — every documented criticism of an incumbent matched to a VUKA mechanism — is at `docs/COMPETITORS.md`.

---

## 4 · UNFAIR ADVANTAGE

```
1. AN ANCHORED HISTORY IS A MOAT THAT COMPOUNDS AND CANNOT BE BACKDATED.
From the hour we start publishing, our verifiable record grows. A competitor
launching later starts at zero and can never catch up on record length, because you
cannot retroactively insert entries into a public chain. Features are copyable.
Provable history is not.

2. SIX WEEKS OF SHIPPED WORK THAT PREDATES THIS HACKATHON.
~33,600 lines, 440 test cases, 25 accepted architecture decision records, ~6,800
lines of architecture documentation, and a measured p95 latency of 318ms against a
2,000ms budget. All committed in July, all in public repos, all timestamped. No team
compresses that into a weekend.

3. WE DEFEND AGAINST OUR OWN OPERATORS. NOBODY ELSE DOES.
Adding a vehicle to the "belongs here" list makes it invisible to our own suspicion
engine. Every camera network in the world leaves that one-click and unlogged. Ours
takes two signatures and publishes them. That is a category-level blind spot and we
are first through it.

4. CREDIBILITY CANNOT BE RETRO-FITTED.
We keep a written list of claims we refuse to make. We publish the numbers that
embarrass us — our own forecast currently loses to a constant baseline and we say so
on the slide. Our parameter file carries a machine-readable warning against our own
future overclaiming: "PROVISIONAL — NOT fit on real data. Do not present as tuned."
A competitor can copy that practice. They cannot produce six weeks of it dated
before they knew they'd need it.

5. BUILT FOR HERE, NOT PORTED TO HERE.
Offline-first, load-shedding-native, works on a 2GB Android phone, runs when the
tower is down. Not a first-world product with a resilience feature bolted on — the
constraint was the starting point. Which also makes it portable to every market with
the same constraints.

6. WE LIVED THE PROBLEM.
Family and friends of this team have been through the coerced-transfer robbery. The
product exists because of it. That is not a market-research finding.
```

---

## 5 · CUSTOMER SEGMENTS

```
CONSUMER
· Individuals who bank on their phone and travel at night — the app-coercion target
· Women driving alone; late-shift commuters
· Single parents, and households where a child is home alone after school
· Suburban homeowners with an alarm they have stopped arming because of false alerts

B2B2C — sell THROUGH, not against
· Private security companies: control rooms and armed-response operators. ~2.7m
  registered security officers versus roughly 180k police ⚑ — they already hold the
  customer relationship, the billing rail and the response capability
· Estates, body corporates and HOAs: one committee decision covers 200+ homes, and
  the two-signature admin control is written for exactly their governance
· Short-term insurers (motor and household): premium discount as the acquisition
  mechanism, loss-ratio improvement as the payback

ANCHOR AS ITS OWN CUSTOMER
· Retail banks: coerced-transfer dispute resolution. A duress record timestamped
  before the transaction is evidence that currently does not exist anywhere
· Claims assessors and loss adjusters: evidenced claims instead of disputed ones

PUBLIC SECTOR
· Municipal and provincial community-safety units: the risk layer, from official
  open data, no POPIA exposure in the data product
· SAPS: a handover record structured to support a case

PAN-AFRICAN
· Any market with load-shedding, thin bandwidth and high property crime. Kenya first
  via Reboot Republic in Kisumu. Swap the crime dataset; the architecture ports
```

---

## 6 · METRICS

```
TECHNICAL — our referee numbers, published in the repo
· Detection → alert render: ≤2.0s p95. CURRENT: 273ms p50, 318ms p95 (measured)
· False alerts surfaced to a member: ≤1 unverified per camera-week
· Vision throughput on the appliance: ≥8 FPS person detection
· Anchor liveness: % of hours with a successfully published Merkle root. Target 100%
· Chain integrity: verifier passes before every evidence export. Target 100%
· Dual-signature compliance: % of destructive admin actions with two signatures.
  Target 100%, and any exception is itself an anchored event

MODEL HONESTY — we report these even when they embarrass us
· Acoustic detector: calibration error (ECE) and reliability diagram on held-out data
· Forecast skill vs a naive baseline (PAI on top-5% cells). CURRENT STATUS: our model
  has MAE 0.484 against 0.246 for a constant baseline — it loses. Published, being
  fixed, and on the honesty slide rather than hidden
· Second-stage rejection rate: how often the system overrules its own first detection

USER OUTCOMES
· Duress detections with no user interaction — the core claim, measured
· Median time from detection to a human decision
· Cancel-window usage: how often people stop a false escalation (a health signal)
· Alarm-arming rate: do people keep it armed? The metric every alarm company fails
· Subject-access requests fulfilled inside the POPIA window

COMMERCIAL
· Disputes resolved using an anchored record — bank and insurer
· Claims settlement time: baseline weeks → target days
· Fuel spend per risk-hour covered (patrol): target −30% at ≥80% coverage
· Monthly churn; homes per estate; security-company control rooms live
· CAC by channel — expected to be dramatically lower through security partners
```

---

## 7 · CHANNELS

```
1. THROUGH SECURITY COMPANIES — the primary channel, and the key strategic call.
They already have the customer, the monthly billing rail, and armed vehicles on the
road. Fighting them means paying to acquire households one at a time. Selling
through them means one integration reaches thousands, and CAC collapses. VUKA makes
their fuel cheaper and their response times provable — we make them better, we don't
replace them.

2. INSURER BUNDLING — the Vitality Drive playbook. The insurer discounts the premium
for an active, verified installation; the discount acquires the customer; the
loss-ratio improvement pays for it. The insurer gets evidenced claims instead of
disputed ones. Nobody pays a marketing rand.

3. ESTATES AND BODY CORPORATES — one committee meeting covers 200+ homes. The
two-signature governance control is written for their exact structure: the security
manager and the chairperson, neither able to disable the estate's cameras alone.

4. DIRECT CONSUMER APP — VIGIL free on Play Store, no hardware. Duress detection,
Guardians, safest route. Free tier is the funnel; it also means the layer that saves
lives is never behind a paywall.

5. BANK PARTNERSHIP — ANCHOR sold into fraud and disputes teams, not marketing. A
timestamped duress record that predates the transaction is evidence they currently
cannot obtain at any price.

6. PUBLIC SECTOR — CPSI and provincial safety departments for the risk layer, built
entirely on official open data.

7. COMMUNITY — GKSS university chapters and Geekulcha's network for early adoption
and honest field testing. Kenya via Reboot Republic.
```

---

## 8 · COST STRUCTURE

```
HARDWARE — the KHAYA appliance
· ARM SoC with NPU: ~R2,200 ⚑
· LiFePO4 pack + BMS (48–72h): ~R1,100 ⚑
· Enclosure, tamper switch, PoE, assembly: ~R600 ⚑
· BOM at prototype volume: ~R3,900 per unit
· At 1,000 units: ~R3,000 ⚑ (recovered over 24 months, or sold upfront)
· Optional solar add-on for long outages and rural/mesh deployment

CLOUD & RUNNING COSTS — small on purpose, because inference is on-device
· Azure/AWS at ~1,000 homes: R10,000–15,000/month ⚑ (relay, database, short clips)
· Marginal cloud cost per household: ~R12/month
· THE BLOCKCHAIN: 24 roots/day × 30 = 720 anchors/month. On Hedera at ~$0.0001 each
  that is about R1.30 PER MONTH — for the entire network, at any size. On
  OpenTimestamps it is free.
  This is the cost line to say out loud: the anchor is BATCHED, so it is a FIXED
  cost, not a per-user one. At 100 homes or 100,000 homes it is the same R1.30. A
  blockchain that gets cheaper per user the more users you have is what
  "commercially viable" actually means.

PEOPLE — pilot phase, 5 founders
· Founder stipends: R25,000–35,000/month each ⚑
· First support hire at ~500 households

COMPLIANCE & ASSURANCE — non-negotiable, and it is a moat
· POPIA legal review and Information Officer registration: ~R40,000 once ⚑
· Independent security assessment against OWASP Top 10 / API Top 10: ~R60,000 ⚑
  (potentially sponsored — CompTIA is an event partner)
· Penetration test before any paid deployment
· PSiRA implications reviewed: we integrate with armed response, we do not dispatch

MODEL & DATA
· Labelled acoustic dataset collection (recorded glass, staged approaches, ambient
  nights) — mostly team time
· GPU compute for fine-tuning: R8,000–15,000 for the pilot phase ⚑
· Geocoding: cached and checked in. Effectively zero ongoing

WHAT WE DELIBERATELY DO NOT SPEND ON
· Video storage at scale — we store vectors and labels, not footage
· Facial-recognition licensing — open models, human-gated
· Armed vehicles — that is our partners' business, not ours
```

---

## 9 · REVENUE STREAMS

```
CONSUMER
· VIGIL — free. The duress layer is never behind a paywall
· VIGIL+ — R99/month ⚑: Guardian network, safest route, full history
· KHAYA home bundle — R299/month ⚑ including the appliance, or R3,999 upfront plus
  R149/month

UNIT ECONOMICS, KHAYA bundle at R299/month:
   hardware amortised (R3,000 ÷ 24)      R125
   cloud + anchor per household           R12
   support and operations                 R25
   ────────────────────────────────────────────
   gross margin                          R137/month  ≈ 46%
   Margin improves with volume: BOM falls, and the anchor cost never rises.

B2B — the volume business
· Security company licence: R35/subscriber/month ⚑. A 5,000-subscriber operator =
  R175,000/month, and they resell at their own margin
· Patrol optimiser as SaaS: R12,000/month per control room ⚑, justified on fuel
  alone — target −30% at ≥80% coverage of top risk hex-hours
· Estate/body corporate licence: R5,500/month per estate ⚑ (shared cameras, the
  two-signature governance layer, community risk view)

INSURER
· Verified-installation fee: R40/active member/month ⚑, paid by the insurer, funded
  by loss-ratio improvement. Their own data: theft alone is R1.09bn across 14,380
  claims — every 1% prevented is roughly R10.9m off the loss ratio, which pays for a
  very large number of R40 fees
· Claims-verification per record: R15 per anchored incident record used in a claim ⚑

ANCHOR AS A SERVICE — the blockchain revenue line
· Bank dispute resolution: per-case fee for a verifiable duress record predating a
  transaction ⚑. This is a record that does not currently exist at any price
· Chain-of-custody API for third-party security operators who want their own
  response times to be provable. Our fixed anchoring cost means every additional
  writer is close to pure margin

PUBLIC SECTOR
· Risk-layer data licence to municipalities and provincial safety units, built on
  official open data ⚑
· No enforcement product, ever. We sell insight and accountability, not policing

WHAT WE REFUSE TO SELL
· Street-level risk scores as an underwriting input. It is technically feasible and
  it is redlining — it would price up exactly the communities that need cover most.
  We removed it from our own business case
· Personal data, biometric templates, or footage. Not to anyone, at any price
· Tokens. A loyalty ledger does not need a blockchain and we will not pretend
  otherwise
```

---

# Before you paste — three things

1. **Verify the ⚑ figures.** The hardware BOM and the SA market numbers are estimates. The PSiRA officer count especially — your own business case already flagged it as needing verification. A judge who catches an invented figure will discount everything else, and your whole position is that you don't invent figures.

2. **The R1.30 anchoring cost is your single best commercial line in that bucket.** Say it slowly: *"Our blockchain costs one rand thirty a month. For the whole network. Because we batch, it is a fixed cost — at a hundred homes or a hundred thousand it is the same number."* Three rivals will be explaining gas fees.

3. **"What we refuse to sell" belongs in the canvas, not just the deck.** Cutting the underwriting line out of your own business case — and saying you cut it — is the strongest possible proof that the ethics are load-bearing rather than decorative.
