# 1 · VUKA as an enterprise product for insurers and banks

> **E-Hub insight 1 (15 Oct 2026):** *"Look to turning VUKA into a B2B enterprise business model to sell to insurers and Nedbank. Collaborate with them and integrate VIGIL and VUKA into their systems."*
> **Status:** `PROPOSED`. Nothing here is built beyond what §2 marks `FACT`. **No bank or insurer has agreed to anything**; the YouthX top 50 is an award stage, not a commercial relationship with Nedbank, and is never presented as one. Serves B, T, S.

---

## 1 · What actually changes

VUKA was already partner-funded on paper: *"A partner pays about R20 per member per month"* (`docs/ECONOMICS-VIGIL-ANCHOR.md` §1). The E-Hub feedback moves it one level deeper:

| | Before (hackathon) | After (this plan) |
|---|---|---|
| Where VUKA sits | A separate app the partner switches on for its customers | **Inside the partner's systems**: their app, their fraud engine, their claims process |
| What the partner buys | A benefit to offer customers | A capability: fewer unverifiable coercion claims, an earlier warning before a coerced transfer, a record their investigators can check |
| Who we talk to | "A bank or insurer" | Named teams inside one institution (§3) |
| What has to exist | A demo | An integration surface, a pilot contract, an SLA ([`04-SLA.md`](04-SLA.md)) and the vendor paperwork (§7) |

## 2 · What already exists to build on (`FACT` unless tagged)

- **The bank protective-hold signal** (ADR-0037, accepted 23 Sep). On a duress signal, or on `no_answer` with no guardian stand-down within 3 minutes, VUKA sends a signed risk signal and **the bank decides** what to do. It is never sent from detection alone. Only `sim_bank` exists (SIMULATED); "no real bank integration is claimed; the partner API is PROPOSED" (`docs/adr.md`; open gap G30).
- **Evidence levels.** Banks and insurers see a tier, an E-level and reasons, never a score (`docs/VUKA-2-SPEC.md`).
- **Third-party access is designed, not built** (ADR-0039). It is gated by G36 (selective disclosure), G37 (safe release) and G38 (partner-use rule: human review only, no automated pricing, no adverse inference from a missing record) in `docs/OPEN-GAPS.md`.
- **An access-model proposal** on the unmerged branch `docs/babatunde-war-room-and-access-model`: public-read, permissioned-write anchoring, an optional read-node inside a bank's perimeter, per-case access on the member's consent (`PROPOSED`).
- **Five unpriced revenue hypotheses** in `docs/SA-ANCHOR-SCALE-SECURITY-BUSINESS.md` §8, including an insurer claim-proof API and a bank coerced-transfer evidence fee.
- **Price anchors** already in the market: FNB GuardMe R19.90/month (press report, Apr 2022, re-check), iTOO [My]Cylution express-kidnapping cover from R22.50/month (`docs/EVIDENCE.md`).

## 3 · Who inside the institution buys

`ASSUMPTION` until a conversation confirms it; each meeting should replace a row's guess with a name and a date.

| Team | What they own | What VUKA gives them | First question they'll ask |
|---|---|---|---|
| **Fraud and financial crime** (bank) | Coerced transfers, disputes, the fraud engine | A signed, early risk signal during an open incident, before or during the transfer (offer B) | "How many false signals per thousand customers?" (not measured: [`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md)) |
| **Digital channels** (bank app) | The app customers use | VIGIL inside their app (offer A) | "What does it do to battery and app-store review?" |
| **Claims and special investigations** (insurer) | Kidnap, hijack and theft-of-funds claims | A record made at the time that their investigator can check without trusting us (offer C) | "Does a missing record count against a claimant?" — never (`docs/MASTER-CONTEXT.md` §6) |
| **Product** (insurer) | Value-added benefits on policies | A safety benefit to bundle | "What does it cost per policy, and does it lower claims?" (the actuary test: the insurer must save ≥ 12 × price per member per year) |
| **Enterprise development / CSI** | Youth and SME programmes (Nedbank runs YouthX through this route, per its call for entries, `REPORTED`) | A door to the right business owner, not a buyer | "Who should you meet?" |

## 4 · Three integration offers

Each offer is a separate product decision. **D3** in the README picks which to lead with.

### Offer A — VIGIL inside the partner's app (SDK or white-label)

- **What:** the partner's app hosts the check-in and the duress PIN; VUKA's server runs deadlines, guardian alerts and the record. The member sees the partner's brand.
- **Why a partner wants it:** no second app to download; adoption inside an existing customer base. A 1% take-up of a 1-million-customer app is 10,000 members (`ESTIMATE`, `docs/ECONOMICS-VIGIL-ANCHOR.md` §5).
- **Hard parts, stated:**
  - An always-listening microphone inside a bank's app is a new review for the bank's app-store listing and for customer comfort (insight 3).
  - VUKA has two app codebases today (React Native on `main`, native Kotlin on `feature/integrate`); an SDK needs one ([`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md), D5).
  - Duress parity (V5) must hold inside someone else's app: identical pixels, timing and request shape for both PINs. The partner's own analytics must not log which PIN was used.
- **Smallest first step:** a white-label build of VIGIL with the partner's name and colours, before any SDK.

### Offer B — the risk signal into the bank's fraud engine (ADR-0037, made real)

- **What:** replace `sim_bank` with the partner's endpoint. On a duress signal (or `no_answer` without stand-down), VUKA sends a signed message naming the member's partner reference and the trigger (`duress_signal`, `no_answer` or `contact_lost`); the bank's own rules decide whether to hold, step up or watch.
- **Why a partner wants it:** the bank hears during the incident, not on Monday.
- **Hard parts:** the bank must map our member to its customer without VUKA holding banking data; nothing about the signal may be observable by the coercer holding the phone (S3); the bank's response is its own decision, never ours (machines notice, people decide). Under the Cybercrimes Act the bank has its own reporting duty once s54 commences; **our signal is not that report** (`docs/security/COMPLIANCE-GOVERNANCE.md`).
- **Smallest first step:** a written interface specification for the bank's fraud team, from the existing `BankSignal` contract on the server branch.

### Offer C — ANCHOR verification for claims and disputes

- **What:** with the member's consent, an investigator receives an incident package and checks it on the public verify page or through an API: every hash, signature and anchor, without trusting VUKA. **It proves when a signal existed and that it hasn't changed, not what happened.**
- **Why a partner wants it:** cheaper, faster checks on genuine claims; staged events are harder to fake (`docs/STAGED-DURESS-DEFENCE.md`).
- **Hard parts:** gates G36–G38 must close first. A per-case fee alone can't fund the company: at R15 per case the war-room model needs **10,446 cases a month** to cover fixed costs (`ESTIMATE`, branch script).
- **Smallest first step:** the existing public verify page, demonstrated on a `sim_` record to a claims team.

## 5 · How the money works in an enterprise deal

| Line | Today | Proposed |
|---|---|---|
| Per member per month | R20, `ASSUMPTION` (decided 26 Sep on an unmerged branch; not validated with any buyer) | Keep as the opening number; test it in the first conversation |
| Integration or platform fee | none | **Add one** (`PROPOSED`, unpriced): enterprise integrations carry a set-up fee that pays for the engineering in §4 |
| Per verification | R15 per case, `PROPOSED` | Price separately; present as a secondary line, never the model |

**Bank first or insurer first (D3).** *Bank first* (Nedbank, through the YouthX door) suits offers A and B, and the bank feels the coerced transfer directly. *Insurer first* suits offer C, and the actuary test gives a clean value story. The war-room branch treated the insurer as the volume payer and the bank as a later phase. Recommendation: **open both conversations, and build for whichever signs a pilot letter first.** Building both before a signature would be the mistake.

## 6 · The first pilot (proposed shape)

- **One partner, up to 5,000 consenting members, 12 months**, matching the financial model's pilot assumption (`scripts/build_financial_model.py`, `ASSUMPTION`).
- **Measured, not promised:** false check-ins per member per week (M2), alert delivery time (S2 in `04-SLA.md`), stand-down rates, member retention after 30 and 90 days, and for an insurer, claims touched and investigation time.
- **Contract terms we bring:** the pilot SLA targets (`04-SLA.md` §3), the honesty ledger as a schedule, the partner-use rule (G38), and an exit that deletes the partner's members' payloads.

## 7 · Before any partner integration: the vendor gate

A bank or insurer will check these before a pilot. Today's state:

| Item | State | Owner |
|---|---|---|
| Independent penetration test | **Not done** (G8, "before the first paying partner") | both founders (supplier choice) |
| POPIA Information Officer registration | Prepared, not submitted (`docs/POPIA-IO-REGISTRATION.md`) | Lethabo or Sibusiso, as the company decides |
| Operator agreement (POPIA s20–s21) and data-processing terms | Not drafted | counsel |
| Cross-border basis (POPIA s72): data is in Azure **UAE North** | **Undocumented**; the privacy notice still says South Africa North | Sibusiso (move region, or document the basis) |
| SLA with measured uptime | Targets proposed, probe built, no baseline ([`04-SLA.md`](04-SLA.md)) | Sibusiso |
| Running code on `main` | Not yet (D4) | both |
| Financial-sector supplier requirements (cyber resilience, outsourcing, incident notification) | Research pending: exact standards and dates follow in a commit on this PR | Sibusiso |

## 8 · What we say, and don't

- **Say:** "We are preparing a pilot proposal for insurers and banks." "The bank signal is built against a simulated bank today."
- **Don't say:** "partnering with Nedbank", "in talks with" before a meeting has happened and is recorded, any partner logo without written permission, or "integrated with" any real bank.
