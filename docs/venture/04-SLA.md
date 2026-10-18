# 4 · Service levels: what partners will hold us to, and how VUKA gets there

> **E-Hub insight 4 (15 Oct 2026):** *"We need to get VUKA to the best SLA score possible."*
> **Reading taken:** an SLA (service-level agreement) is the promise a bank or insurer writes into its contract with us: how often the alert path is up, how fast an alert goes out and arrives, how fresh the public record is, and how quickly we respond when something breaks. The **score** is the share of those promises that are **measured and met** in a month; unmeasured counts as missed. §1 records the other readings checked.
> **Status:** targets `PROPOSED`. The outside-in probe is **written and unit-tested** (`scripts/sla/`), but it doesn't run until this PR is on `main`. **No live baseline exists**, and the server of record is currently not under the company's control (§4.1). Owner: Sibusiso (server, operations). Serves T, S, B.

---

## 1 · Why this matters, and why now

A bank or insurer that switches VUKA on for its customers is putting its name on a safety promise. Its vendor-risk team will ask for availability and response targets in writing before a pilot, and its regulators expect it to manage IT suppliers ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md) §7). Today **no SLA, availability target or measured uptime exists anywhere in the repository** (spec, gaps, economics and README searched, 18 Oct).

**Other readings checked.** No source found treats "SLA score" as a named metric in YouthX, the Easies or Caplia, but their criteria couldn't be researched this session (§7), so this stays open. Of Caplia's 327/700 *investor-readiness* score (5 Oct), the five gaps the handover says the repo can't fill include no service level (`docs/SIBUSISO-HANDOVER.md`); Caplia's full gap list isn't recorded; raising it is covered in [`05-TWO-PITCHES.md`](05-TWO-PITCHES.md). If the E-Hub feedback meant something else, correct it here.

## 2 · What we would be promising: the indicators

A safety alert pipeline is judged on whether the alarm gets through. Measure in **one-minute time slices** (good minutes ÷ total minutes), so a failure at 3 a.m. for one member counts as much as one at peak. OpenSLO recommends exactly this for "a system for reporting incidents or calling for help" (`FACT`, §7).

| # | Indicator (SLI) | Definition | In the contract? |
|---|---|---|---|
| **S1** | Alert-path availability | The server accepts signed events **and** the worker that runs deadlines, alerts and anchoring has ticked in the last 60 s | Yes |
| **S2a** | Alert **dispatch** | From server receipt of a duress signal, `no_answer` or `contact_lost` to the push or SMS provider accepting the alert | Yes: we control it |
| **S2b** | Alert **delivery** | From server receipt to the guardian's phone acknowledging it | **Reported, not contracted**: push and carrier delivery are outside our control. Microsoft does the same: its SMS SLA excludes carriers, and its push SLA covers the send API only (`FACT`, §7) |
| **S3** | Escalation timeliness | `no_answer` written within its deadline: the check-in window (20 s or 60 s) + 10 s grace, from server receipt of `opened` | Yes |
| **S4** | Bank-signal time | Duress signal to the partner's acknowledgement of the risk signal | Yes |
| **S5** | Anchor freshness | Age of the newest root on Hedera; immediate roots after PIN-gated outcomes (coalesced to one per 60 s, spec §10) and an hourly root | Reported in the pilot, contracted at scale |
| **S6** | Durability | Receipted events lost (target zero); recovery time | Yes |
| **S7** | Verification availability | The public verify page answers and shows the newest root | Reported |
| **S8** | Incident response | P1 incident to a human acknowledgement | Yes |
| **S9** | Security-incident notice | Suspected security incident to notice to the partner | Yes |

## 3 · Proposed targets by phase (`PROPOSED`)

| SLI | Pilot (one partner, ≤ 5,000 members) | Scale (several partners) |
|---|---|---|
| S1 alert path, monthly | **99.5%** (216 min of budget in 30 days); `/healthz` p95 **≤ 1.5 s** | **99.9%** (43 min) |
| S2a dispatch | p95 **≤ 5 s**, p99 ≤ 15 s | p95 **≤ 2 s** |
| S2b delivery (reported) | p95 **≤ 30 s** on synthetic canary alerts, n ≥ 2,000 a month; **every** unacknowledged alert re-sent by SMS at 60 s | p95 **≤ 15 s**; duress sent by push **and** SMS at once; voice call at 120 s |
| S3 `no_answer` | written by deadline + 10 s, p99 | same |
| S4 bank signal | p95 **≤ 60 s** | p95 **≤ 30 s** |
| S5 anchor freshness | immediate root **≤ 120 s** p95; newest root **≤ 65 min** old | immediate **≤ 90 s** |
| S6 durability | RPO **0** for a process or machine failure; RPO **≤ 5 min** for a zone loss (`ASSUMPTION`: restore point without high availability); RTO **4 h** | RPO **0** (zone-redundant HA, `REPORTED` zero data loss); RTO **1 h** |
| S7 verify page | **99.5%** | **99.9%** |
| S8 P1 response | acknowledge **≤ 1 h**, 07:00–22:00 SAST every day; automated paging outside those hours, best effort | 24/7, **≤ 15 min**, with a staffed rota |
| S9 security notice | **≤ 4 h** from detection | **≤ 2 h** |

**Why these numbers:**
- **They come from the platform, not from ambition.** Microsoft's published SLAs multiply to about **99.85%** for the pilot stack below (App Service 99.95% × PostgreSQL without HA 99.9%, `ESTIMATE`, assuming independent failures). That leaves about 150 minutes a month for our own faults under a 99.5% promise. Two caveats:
  - An SLA buys service credits, not uptime.
  - The PostgreSQL SLA excludes "limitations or performance characteristics inherent to the Burstable" tier (`FACT`).

  So for a burstable database, 99.85% is a credit-backed target, not a floor. The scale stack (zone-redundant App Service and PostgreSQL General Purpose, 99.99% each) gives about 99.98%.
- **S9 follows the partner's clock.** Since 1 Sep 2026, a bank or insurer must give its regulators an initial notice of a material IT or cyber incident within 24 hours of classifying it (Joint Communication 5 of 2026; `REPORTED`, Reserve Bank page via search extract). Our notice must arrive well inside that window.
- **S8 is honest about two founders.** A 24/7 pager can't be promised without a rota.
- **Service credits:** none in the pilot, or one 10% credit if S1 falls below 99.5%. At scale, mirror Microsoft's structure (10% / 25% / 100%), capped at the monthly fee, on contracted rows only.

**The score.** SLOs met ÷ SLOs promised, per month; **unmeasured counts as missed**. `scripts/sla/probe.mjs` scores each run this way. `scripts/sla/aggregate.mjs` scores a window of runs against the §3 pilot targets the probe can see (S1 availability and latency, S5, S7). So the score can't be raised by measuring less. S2–S4, S6, S8 and S9 aren't in it yet (§5).

## 4 · Where we are, honestly, and what has to change

### 4.1 The stack as last recorded

| Part | State | Tag / source |
|---|---|---|
| Server of record | The last deployment (`431f887`): Azure App Service **Basic B1**, one instance, Always On, **UAE North**, on an **Azure for Students** subscription, with a `/healthz` health check and auto-heal. Since **15 Oct** the apps' discovery file (uploaded by the `Sibusiso-K` account) points to a presenter-PC tunnel, with the note **"Azure subscription disabled"** | `FACT` for the set-up (`docs/SIBUSISO-HANDOVER.md`); health check and auto-heal per `docs/NEW-CHAT-HANDOVER.md` (as of 27 Sep); `FACT` for the upload (Releases API); `REPORTED` for the note |
| Database | PostgreSQL Flexible Server **B1ms** (burstable), no HA; public access with an `AllowAzureServices` firewall rule | `FACT`, same |
| Anchoring | Hedera **testnet** via a Node sidecar in the same container | `FACT` |
| Guardian alerts | Push code exists on the server, but **guardians must keep the app open**, and the push token was refreshed by hand every hour. Whether the published APK includes Firebase isn't recorded (`ASSUMPTION`: no) | `FACT` (`docs/NEW-CHAT-HANDOVER.md`), except where tagged |
| SMS | Not configured; open gap G25 | `FACT` |
| Verify site | GitHub Pages, reading the public Hedera mirror, and the server for Merkle paths | `FACT` |
| Monitoring | Platform health check only. `/healthz` checks the database, **not the worker** | `FACT` |
| Code | The last deployed server is on PR #99's branch, not on `main` | `FACT` |

### 4.2 What the hosting allows (`FACT` unless tagged)

- **Credit-funded Azure has no contractual SLA.** Microsoft's SLA excludes "purchases made using Microsoft subscription credits" and free tiers, and service credits are "your sole and exclusive remedy" (SLA for Microsoft Online Services, 1 Oct 2026 edition). So on Azure for Students, VUKA has **no SLA under it at all** (`ESTIMATE`, from that exclusion).
- **Azure for Students** gives $100 of credit for 12 months, is "expressly for the support of education or teaching, noncommercial research, or efforts to design, develop, test, and demonstrate software applications for these purposes", and when the credit runs out or expires "Azure disables your services and subscription" (Microsoft docs). A paid pilot run by PILOT CORE sits outside that purpose (`ASSUMPTION`: our reading, not counsel's).
- **The region is locked.** The subscription's policy allows only Italy North, UAE North, India South Central, Spain Central and Austria East (`docs/SIBUSISO-HANDOVER.md`). Azure South Africa North (Johannesburg) has three availability zones (`REPORTED`, Microsoft news, Oct 2021).
- **On a single instance, health checks don't save you fast.** An unhealthy single instance isn't removed and is replaced only after **one hour** of failed pings, at most once an hour and three times a day (Microsoft docs). A worker heartbeat needs a watchdog beside it.
- **Hedera's public mirror is "for testing and development"**; production should use commercial mirror providers, and the public mainnet mirror is throttled at 50 requests per second per IP. Testnet resets clear topics, with 2–4 weeks' notice (Hedera docs). Hedera states 3–5 s finality (`REPORTED`, vendor claim).
- **GitHub Pages has no uptime guarantee**, and its terms bar using it to run an online business or commercial SaaS. Scheduled GitHub Actions runs can be delayed or dropped at busy times, and in a public repository they **switch off after 60 days without activity** (GitHub docs).

### 4.3 Incidents on record

1. **26 Sep, worker outage.** The server signing key was missing on Azure, and one unsignable deadline stopped every worker effect: about 11,000 failures, **no alerts and no anchors**, while the API kept answering. Fixed in `5629d27` (`docs/SIBUSISO-HANDOVER.md`).
2. **26 Sep, 19:34–19:47 UTC: the worker was silent for 13 minutes**, cause unknown; a restart fixed it (same source).
3. **24 Sep, GitHub Actions billing:** every CI job failed on a spending limit (same source). The hourly probe runs on GitHub Actions.
4. **By 15 Oct, the server of record was lost** (§4.1). The apps were pointed at a presenter-PC tunnel by the `Sibusiso-K` account; the cause isn't recorded in the repo yet.

**What they teach:** both worker incidents would have passed today's `/healthz`; the hourly probe sees a stalled worker only indirectly, through anchor freshness, about one to two hours after it stalls; and the hosting itself can disappear when a credit runs out. **Fix the account first, then the heartbeat.**

### 4.4 The changes, in order of value per rand

| # | Change | Moves | Owner |
|---|---|---|---|
| 1 | **A pay-as-you-go subscription owned by PILOT CORE, in South Africa North,** with the same small sizes (App Service Basic, PostgreSQL burstable). About **R470 a month** (`ESTIMATE`, US list prices at R16.21/USD; South Africa North prices and VAT not retrieved). Gives a contractual floor, removes the UAE cross-border question for primary data, and fits a 99.5% pilot promise | S1, S6, the law | both founders (cost) |
| 2 | **Worker heartbeat in `/healthz`** (503 when the last tick is older than 60 s) plus an in-process watchdog | S1, S3 | Sibusiso |
| 3 | **A one-minute external probe** (Azure Monitor availability test or an independent uptime service) for S1. Keep the hourly GitHub probe as a second vantage point | S1 | Sibusiso |
| 4 | **Merge the last deployed server onto `main`** and deploy only from `main` | all | both |
| 5 | **Real push:** a service-account flow instead of an hourly hand-refreshed token; the app registers its token; delivery receipts per alert | S2 | Lethabo (app), Sibusiso (server) |
| 6 | **SMS fallback** through a South African gateway with delivery reports, for duress and `no_answer` alerts unacknowledged after 60 s (R0.18–R0.29 per SMS, `FACT`, `docs/MARKET-DATA.md`). Never from the member's phone | S2 | Sibusiso |
| 7 | **Synthetic canary alerts** every 15 minutes from a test member to a test guardian device: about 2,880 samples a month, enough for an honest p95 at pilot volumes | S2b | Sibusiso |
| 8 | **Separate the worker** from the web process | S1, S3 | Sibusiso |
| 9 | **Inside-out SLIs** computed monthly from the outbox and incident timestamps already stored | S2a, S3, S4 | Sibusiso |
| 10 | **Hedera mainnet**, a funded operator with a balance alarm, and reads from at least two mirror providers | S5, S7 | Sibusiso |
| 11 | **Status page and paging:** the probe pages a founder on breach (burn-rate alerts); a public status page, hosted apart from the API it reports on | S8 | Sibusiso |
| 12 | **Restore drill** each month, with the time recorded | S6 | both |
| 13 | **At scale:** App Service Premium v3 × 2, zone-redundant (99.99%), and PostgreSQL General Purpose with zone-redundant HA (99.99%; not available on burstable). About **R7,860–R8,360 a month before VAT**, plus a staffed rota. That is an `ESTIMATE` on conflicting third-party P1v3 prices (`REPORTED`) and a recalled PostgreSQL General Purpose price (`ASSUMPTION`), at R16.21/USD. Move the verify page to Azure Static Web Apps Standard (99.95%), keeping GitHub Pages as a mirror | S1, S6, S7 | both |

## 5 · Measuring it: what this PR builds

**Written and unit-tested** (`FACT`: `node --test test/sla-probe.test.mjs`, 10/10, 18 Oct 2026); it runs once this PR is on `main`:
- `scripts/sla/probe.mjs`: one outside-in sample, no credentials. It checks `/healthz` n times (healthy only when it answers `ok` **and** the database is reachable; p50 and p95 latency), the age of the newest `0x01` root on the Hedera topic from the public mirror (S5), and that the verify page answers 200 (S7). An unreachable API counts as **breached**; an unreachable mirror or verify page counts as **not measured**. Both count as **not met**.
- `scripts/sla/aggregate.mjs`: many runs into one window, every figure with its n, plus the window's score against the §3 pilot targets.
- `.github/workflows/sla-probe.yml`: hourly from GitHub's network, keeping each run's JSON for 90 days. Scheduled runs start only from the default branch, so **it begins once this PR is merged**.

**No live baseline yet.** From this session's cloud container the probe reached nothing (DNS blocked by the network policy): 0 of 4 met, 3 not measured. That's a limit of where it ran. Given §4.1, the first runs on `main` will most likely report the API as breached until the server is restored. That is the correct reading.

**What the probe can't see:** S2–S4, S6, S8 and S9 happen inside the server or the team; they need changes 2, 7 and 9. An hourly probe also misses outages shorter than an hour; S1 needs changes 2 and 3 before its figure means much. When the server moves, pass its address with `--api`.

## 6 · Decisions needed

1. **Both founders:** the company-owned subscription in South Africa North (change 1). It also answers D9 in the README.
2. **Both founders:** accept or change the pilot targets in §3, especially S8's hours and S9's window.
3. **Sibusiso:** changes 2, 3 and 9 first; they cost little but time.
4. **Lethabo:** the app side of change 5.

## 7 · Sources and method

**Read directly (`FACT`):**
- **Microsoft:** the *Service Level Agreement for Microsoft Online Services*, worldwide English, 1 Oct 2026 edition (https://www.microsoft.com/licensing/docs/view/Service-Level-Agreements-SLA-for-Online-Services), covering App Service, PostgreSQL Flexible Server, Notification Hubs, Communication Services, Static Web Apps and the general limitations.
- **Microsoft docs** at `MicrosoftDocs/azure-docs` commit `2ec7ec2`: `education-hub/about-azure-for-students.md`, `education-hub/azure-dev-tools-teaching/azure-students-program.md`, `cost-management-billing/manage/azurestudents-subscription-disabled.md`, `app-service/monitor-instances-health-check.md` and `app-service/configure-zone-redundancy.md`.
- **Hedera docs** at `hashgraph/hedera-docs` commit `0b8e9b9`: `networks/testnet/index.mdx`, `networks/mainnet/index.mdx`, `reference/rest-api/index.mdx`, `native/tutorials/consensus/batch-anchor-verify.mdx` and `networks/fees.mdx`.
- **GitHub docs** at `github/docs` commit `dae83f7`: GitHub Pages limits; Actions schedule delays and the 60-day disabling of scheduled workflows.
- **OpenSLO** glossary and its low-traffic example, at commit `e025975`.

**Seen through search extracts (`REPORTED`):**
- Microsoft Learn reliability pages on App Service zone redundancy and PostgreSQL zone-redundant HA.
- Microsoft news on South Africa North's availability zones (Oct 2021).
- Third-party Azure price pages.
- Joint Communication 5 of 2026 (Reserve Bank page).

**Not retrieved:**
- the PostgreSQL General Purpose price used in §4.4 (recalled);
- South Africa North prices (query: `https://prices.azure.com/api/retail/prices?$filter=armRegionName eq 'southafricanorth'`).
- The SLAs of Firebase Cloud Messaging, SMS gateways and Brevo. Our recollection, unchecked: FCM has no SLA, and delivery is best effort.
- Hedera's mainnet incident history.
- The criteria of YouthX, the Easies and Caplia (the shared search budget ran out).

**Conflict to resolve:** `docs/MARKET-DATA.md` tags "PostgreSQL B2ms, ZA North, $126/month" as `FACT`. That is close to a General Purpose 2-vCore price; re-check the SKU before the model uses it.
