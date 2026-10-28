# 13 · SLA roadmap on one page: from no baseline to the Scale tier

> **Status:** `PROPOSED`, 28 Oct 2026. Written by the Claude Code assistant for Sibusiso Khumalo, from `04-SLA.md` (targets, stack, changes) and `06-LAUNCH-ROADMAP.md` (phases). No target here has been accepted by a partner or by both founders. Tags: `FACT` · `ESTIMATE` · `ASSUMPTION` · `PROPOSED` · `REPORTED`. Criteria **T**, **B**.

**The score** is the share of promised service levels that are measured and met in a month. **Unmeasured counts as missed** (`04` §3).

**Today:** no server of record the company controls (`FACT`, `06` §0), no measured uptime, no SMS path (G25), push unreliable. The score today is **not measured, which counts as missed**.

## The path

| # | Step | What it unlocks | Owner | When (`PROPOSED`) |
|---|---|---|---|---|
| 1 | **A company-owned server in South Africa North.** About R470 a month (`ESTIMATE`). Credit-funded Azure has no contractual SLA (`04` §4.2) | A contractual floor; everything below counts only after this (D9) | Both founders | Phase 0, by end Nov 2026 |
| 2 | **Make failure visible:** worker heartbeat in `/healthz`, a watchdog, a one-minute external probe, paging | S1 means something. The 26 Sep outages would have passed today's `/healthz` (`04` §4.3) | Sibusiso | Phase 0 |
| 3 | **Make alerts arrive:** real push, SMS fallback at 60 s, worker split from the web process | S2a dispatch (contracted). S2b delivery is reported, not contracted | Lethabo (app), Sibusiso (server) | Phase 0 |
| 4 | **Measure every indicator:** canary alerts every 15 min, inside-out SLIs from stored timestamps, monthly restore drill. The probe covers only S1, S5, S7 today | A baseline. Target: pilot targets met for **30 consecutive days** by the probe | Sibusiso | Phase 2, Feb to Apr 2027 |
| 5 | **Pass the buyer's checks:** independent penetration test (G8), ISO 27001 or SOC 2 or equivalent, POPIA operator agreement, Information Officer registration, a settled data region, a business continuity plan | The vendor gate (`01` §7) | Both founders, counsel | Phase 2 |
| 6 | **The Scale stack:** zone-redundant App Service and PostgreSQL, Hedera mainnet with two mirror providers, a staffed 24/7 rota. About R7,860–R8,360 a month before VAT (`ESTIMATE`) | The Scale column below | Both founders | After several partners; no date |

## The two tiers (`PROPOSED`, `04` §3)

| Indicator | Pilot (one partner, up to 5,000 members) | Scale (several partners) |
|---|---|---|
| S1 alert path, monthly | 99.5% (216 min budget) | 99.9% (43 min) |
| S2a dispatch | p95 ≤ 5 s | p95 ≤ 2 s |
| S4 bank signal | p95 ≤ 60 s | p95 ≤ 30 s |
| S6 durability | RPO 0 (process failure), RTO 4 h | RPO 0, RTO 1 h |
| S8 human response | ≤ 1 h, 07:00–22:00 | 24/7, ≤ 15 min |
| S9 security notice | ≤ 4 h | ≤ 2 h |

## Why 99.9% is the ceiling

Microsoft's published SLAs multiply to about 99.85% for the pilot stack and about 99.98% for the Scale stack (`ESTIMATE`, independent failures assumed). That leaves about 150 minutes a month for our own faults at pilot, and about 35 minutes at Scale (derived from `04` §3). **Anything above 99.9% is a number we can't back.** An SLA buys service credits, not uptime.

## What we don't promise yet

99.5% or 99.9% · any alert-delivery time · 24/7 response without a rota · an uptime figure of any kind. Say: **"not measured yet; unmeasured counts as missed."**

## Decisions needed

1. **Both founders:** the company-owned server (D9). It gates everything above.
2. **Both founders:** accept or change the pilot targets, especially S8's hours and S9's window.
3. **Both founders:** who carries the on-call rota.
