# 4 · Service levels: what partners will hold us to, and how VUKA gets there

> **E-Hub insight 4 (15 Oct 2026):** *"We need to get VUKA to the best SLA score possible."*
> **Reading taken:** an SLA (service-level agreement) is the promise a bank or insurer writes into its contract with us: how often the alert path is up, how fast an alert reaches a guardian, how fresh the public record is, and how quickly we respond when something breaks. The "score" is how many of those promises we actually keep, **measured**, not asserted. §1 records the other readings checked.
> **Status:** targets `PROPOSED`; the outside-in probe is **built** (`scripts/sla/`); no live baseline exists yet (§5). Owner: Sibusiso (server, operations). Serves T, S, B.

---

## 1 · Why this matters, and why now

A bank or insurer that switches VUKA on for its customers is putting its name on a safety promise. Its vendor-risk team will ask for availability and response targets in writing before a pilot, and its regulator expects it to manage material IT suppliers (§3.3). Today **no SLA, availability target or measured uptime exists anywhere in the repository** (spec, gaps, economics and README all searched, 18 Oct). That makes this the gap a buyer will find first.

**Other readings.** Whether "SLA score" is a named metric in any programme VUKA is in (YouthX, the Easies, Caplia) is being checked in the research pass; the result follows in §7. Caplia already gives an *investor-readiness* score, which VUKA scored 327/700 on 5 Oct (`docs/SIBUSISO-HANDOVER.md`). Raising that is covered by [`05-TWO-PITCHES.md`](05-TWO-PITCHES.md) and [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md), not here. If the E-Hub feedback meant something else, this file is the place to correct it.

## 2 · What we would be promising: the service-level indicators

A safety alert pipeline is judged on whether the alarm gets through, not on whether a web page loads. These are the measures (SLIs) that matter, in order:

| # | Indicator (SLI) | Definition | Why a partner cares |
|---|---|---|---|
| **S1** | **Alert-path availability** | Share of minutes in which the server accepts signed events **and** the worker that runs deadlines, alerts and anchoring is ticking | If the worker stops, no `no_answer`, no guardian alert and no bank signal is written, even though the API still answers. This happened on 26 Sep (below) |
| **S2** | **Alert delivery time** | From server receipt of a duress signal, `no_answer` or `contact_lost`, to the guardian's phone acknowledging receipt of the alert | The one number a family member feels |
| **S3** | **Escalation timeliness** | `no_answer` written within its deadline (check-in window 60 s + grace) | A late timeout is a late alarm |
| **S4** | **Bank-signal time** | From a duress signal to the partner bank's acknowledgement of the risk signal | The partner's fraud team needs the hold before the transfer |
| **S5** | **Anchor freshness** | Age of the newest Merkle root on Hedera; immediate roots after PIN-gated outcomes (spec §10: coalesced to one per 60 s) and an hourly root | The record's "when" is only as good as its anchoring |
| **S6** | **Durability** | Acknowledged events lost: target **zero** (RPO 0 for anything the server receipted) | A receipt the server issued must never disappear |
| **S7** | **Verification availability** | The public verify page and the public mirror it reads from answer | A stranger must be able to check a record without us |
| **S8** | **Partner incident response** | Time from a partner-reported (or self-detected) P1 incident to a human acknowledgement, and to a status update | Contracts set this; two founders must promise only what they can staff |

## 3 · Proposed targets by phase

### 3.1 Targets (`PROPOSED`, to be agreed by both founders and then with the first partner)

| SLI | Pilot (one partner, ≤ 5,000 members) | Scale (several partners) |
|---|---|---|
| S1 alert-path availability, monthly | **99.5%** (≈ 3.6 h down a month) | **99.9%** (≈ 43 min) |
| S2 alert delivery, p95 | **≤ 30 s** by push, with SMS fallback started at 60 s | **≤ 15 s**, push + SMS in parallel for duress |
| S3 `no_answer` written | **≤ deadline + 10 s**, p99 | same |
| S4 bank-signal acknowledgement, p95 | **≤ 60 s** | **≤ 30 s** |
| S5 anchor freshness | immediate root **≤ 120 s** p95 after a PIN-gated outcome; newest root **≤ 65 min** old at all times | immediate **≤ 90 s** |
| S6 durability | **0** receipted events lost; RPO 0, RTO **4 h** | RPO 0, RTO **1 h** |
| S7 verify page | **99.5%** | 99.9% |
| S8 P1 response | acknowledge **≤ 1 h**, 07:00–22:00 SAST every day; automated paging outside those hours, stated as best effort | 24/7, ≤ 15 min, with a staffed rota |

**Why these numbers.** They are set from what the current stack can reach after the §4 changes, not from what sounds good. A 99.99% promise from two founders with one region and no rota would be the first broken promise. S8 says out loud that a two-person company cannot staff a 24/7 pager; promising it anyway would be a claim we can't keep.

### 3.2 The SLA "score"

**Score = the number of SLOs met in the period ÷ the number promised.** An SLO that was not measured counts as **not met**. That rule is built into `scripts/sla/probe.mjs` and `aggregate.mjs`. It makes the score impossible to improve by measuring less.

### 3.3 What a partner's contract will also ask for

Insurers and banks in South Africa are regulated on how they manage IT suppliers. Expect their vendor questionnaires to ask for an incident-notification window, a business-continuity plan, data residency, a recent penetration test and evidence of an information-security programme. See §7 for the published standards and their dates. Two of these are already open gaps: **no independent penetration test (G8)** and **POPIA Information Officer registration** (`docs/OPEN-GAPS.md`).

## 4 · Where we are, honestly, and what has to change

### 4.1 The current stack (`FACT` unless tagged)

| Part | Today | Source |
|---|---|---|
| API and worker | One Azure App Service, **Basic B1**, Always On, `/healthz` health check and auto-heal; region **UAE North**, because the Azure for Students subscription blocks South Africa North | `docs/SIBUSISO-HANDOVER.md` (24 and 26 Sep) |
| Database | Azure Database for PostgreSQL Flexible Server, **B1ms** (burstable), single instance | same |
| Anchoring | Hedera Consensus Service **testnet** via a Node sidecar in the same container | same |
| Guardian alerts | Push via FCM exists on the server, but **guardians keep the app open**: the app doesn't yet send a real FCM token, and the FCM access token expires hourly and was refreshed by hand | `docs/SIBUSISO-HANDOVER.md` (26–27 Sep), `docs/NEW-CHAT-HANDOVER.md` |
| SMS | Not configured (no provider); a delivery path with signal but no data is open gap **G25** | `docs/OPEN-GAPS.md` |
| Verify site | GitHub Pages, reading the public Hedera mirror | `docs/NEW-CHAT-HANDOVER.md` |
| Monitoring | None beyond the platform health check, until this PR's hourly probe runs from `main` | this PR |
| Where the code lives | The server that runs on Azure is on `feat/lethabo-guardian-delivery` (PR #99), **not on `main`** | `git ls-tree origin/main server/` shows placeholders only |

### 4.2 Incidents already on record

Real incidents, worth more than any target because a partner will ask what has gone wrong before:

1. **26 Sep, worker outage.** The server signing key was missing on Azure, and one unsignable deadline made the scheduler raise. That stopped every worker effect: about 11,000 failures in the log, and **no alerts and no anchors** while the API kept answering. Fixed in `5629d27`: each subject now runs in isolation (`docs/SIBUSISO-HANDOVER.md`).
2. **26 Sep, 19:34–19:47 UTC, worker silent for 13 minutes.** No log lines at all; an `az webapp restart` fixed it. **The cause is unknown and could recur** (same source).
3. **24 Sep, GitHub Actions billing.** Every CI job failed for a spending-limit reason, not a code reason (same source). This matters for SLA because the hourly probe runs on GitHub Actions.

**What they teach:** `/healthz` reports the database only. Both worker incidents would have shown a healthy `/healthz`. The outside-in probe catches a stalled worker only indirectly, through anchor freshness (S5), and only within about an hour. **The single most valuable SLA change is a worker heartbeat** that `/healthz` reports (§4.3, item 1).

### 4.3 The changes, in order of value per rand

| # | Change | Moves | Owner | Tag |
|---|---|---|---|---|
| 1 | **Worker heartbeat in `/healthz`**: the worker writes its last tick time, and `/healthz` returns 503 if it is older than 60 s. The probe then measures S1 directly | S1 | Sibusiso | `PROPOSED` |
| 2 | **Merge the running server onto `main`** (PR #99 and its base), so what is deployed is what is reviewed | all | both founders | `PROPOSED` |
| 3 | **Real push delivery:** the app registers its FCM token; the server uses a service-account flow instead of a hand-refreshed hourly token; delivery receipts recorded per alert | S2 | Lethabo (app), Sibusiso (server) | `PROPOSED` |
| 4 | **SMS fallback** through a South African SMS gateway for duress and `no_answer` alerts not acknowledged in 60 s (closes part of G25; never from the member's phone, which would leave a trace in the Sent folder) | S2 | Sibusiso | `PROPOSED` |
| 5 | **Paid subscription in South Africa North**: App Service Standard or Premium with at least two instances, PostgreSQL General Purpose with zone-redundant high availability. Also answers POPIA s72 (cross-border transfer to the UAE) | S1, S6 | both founders (cost decision) | `PROPOSED`; prices in §7 |
| 6 | **Separate the worker** from the web process, so a stuck web request can't starve deadlines | S1, S3 | Sibusiso | `PROPOSED` |
| 7 | **Status page and alerting**: the probe pages a founder on breach, and a public status page shows the last 90 days | S8 | Sibusiso | `PROPOSED` |
| 8 | **Inside-out SLIs from the database**: S2–S4 computed from timestamps the outbox and incidents tables already hold; reported monthly | S2–S4 | Sibusiso | `PROPOSED` |
| 9 | **Hedera mainnet** with a funded operator account and a balance alarm (testnet resets, G31) | S5 | Sibusiso | `PROPOSED` |
| 10 | **Runbooks and drills**: restore from backup once a month and record the time (RTO) | S6 | both | `PROPOSED` |

## 5 · Measuring it: what this PR builds

**Built and tested** (`FACT`: `node --test test/sla-probe.test.mjs`, 9/9, 18 Oct 2026):

- `scripts/sla/probe.mjs` — one outside-in sample, no credentials:
  - `/healthz` n times: healthy only when it answers `ok` **and** the database is reachable; p50 and p95 latency.
  - The newest `0x01` root on the Hedera topic, from the public mirror: its age (S5).
  - The verify page answers 200 (S7).
  - Anything it cannot reach is **not measured**, which counts as **not met**.
- `scripts/sla/aggregate.mjs` — many runs into one window, every figure with its n.
- `.github/workflows/sla-probe.yml` — runs the probe hourly from GitHub's network and keeps each run's JSON for 90 days. GitHub runs scheduled workflows only from the default branch, so **it starts once this PR is merged**.

**No live baseline yet.** The probe was run from this session's cloud container on 18 Oct and reached nothing (DNS blocked by the container's network policy): 0 of 4 met, 3 not measured. That is a limit of where it ran, not a measurement of VUKA. The first real figures come from the workflow's first runs on `main`.

**What the probe cannot see:** S2, S3, S4 and S6 happen inside the server. They need change 8 (§4.3). An hourly probe also cannot see an outage shorter than an hour; S1 needs change 1 before its availability figure means much.

## 6 · Decisions needed

1. **Both founders:** accept or change the pilot targets in §3.1, especially S8's support hours.
2. **Both founders:** the paid subscription in South Africa North (change 5) — it is the largest cost line in this plan.
3. **Sibusiso:** build changes 1, 6 and 8 first; they cost nothing but time.
4. **Lethabo:** the app side of change 3 (real FCM tokens).

## 7 · Sources

Repository sources are cited inline. **Pending, as a follow-up commit on this PR:** the providers' published SLAs (Azure App Service and PostgreSQL by tier, FCM, SMS gateways, Hedera), what Azure for Students allows, South Africa North prices, and the financial-sector supplier standards a partner will cite. Each will carry its URL and date.
