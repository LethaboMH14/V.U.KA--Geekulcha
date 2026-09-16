# 09 · Economics engine — P1.10 / P1.11

> Computed by `scripts/economics_engine.py` — run it yourself: `python3 scripts/economics_engine.py`.
> Code does the arithmetic, never the model. Every input below is tagged and sourced.

## Gross margin — `FACT`

| Line | Value | Source |
|---|---:|---|
| KHAYA price | R299.00/month | `docs/EVIDENCE.md:73` |
| Hardware (amortised) | R125.00/month | R3,000 target BOM ÷ 24 months, `docs/EVIDENCE.md:75` |
| Cloud + anchor | R12.00/month | `docs/EVIDENCE.md:75` |
| Support/ops | R25.00/month | `docs/EVIDENCE.md:75` |
| **Gross margin** | **R137.00/month (45.82%)** | computed, matches `docs/EVIDENCE.md:75`'s stated 46% (rounded) |

## P1.10 — VAT treatment at pilot scale — `FACT` (rule) + computed crossover

VAT registration is compulsory only above **R2.3m annual turnover**, effective **1 April 2026**. At pilot scale this is a **disclosure**, not a cost line in the unit economics.

| Subscribers | Annual revenue | Treatment | Output VAT/yr |
|---:|---:|---|---:|
| 50 | R179,400 | Disclosure only — below threshold | — |
| 200 | R717,600 | Disclosure only — below threshold | — |
| 643 | R2,307,084 | **Crosses R2.3m** — compulsory registration | R300,924 |

**Crossover point: ~641 KHAYA subscribers/year at R299/month.** Below that, VAT does not enter the pricing model at all — stating it as a live cost today would overstate the burden at the scale VUKA is actually pitching for the 90-day pilot (20–50 installations, per `CLAUDE.md` §4 channel sequence phase 1).

## Channel cost — `ASSUMPTION`, formula only

`docs/08-BUSINESS.md` §4 commits to selling **through** security companies rather than direct. No named partner has agreed a commission rate — `docs/COMPETITORS.md` confirms zero competitor pricing exists, and that gap is explicitly Babatunde's own job (P1.13). The engine carries a placeholder 20% commission rate, clearly labelled `ASSUMPTION`, so the formula exists before the number does:

| | 200 subscribers, R717,600/yr revenue |
|---|---:|
| Direct channel cost | R0 |
| Security-company channel cost (ASSUMPTION, 20%, no partner agreed) | R143,520 |

**This number must not be quoted in a pitch.** It exists to prove the formula is wired, not to state a real cost. Replace the 20% the moment a real partner agreement exists.

## P1.11 — CAC / LTV / churn / payback / burn / runway — `ASSUMPTION`, no real inputs exist

The organisers' stated worry is solutions that "move off from the sense of reality." Fabricating a CAC or a churn number here would be exactly that failure, dressed as business rigor. None of the following can be computed today, honestly:

| Metric | Formula | Status |
|---|---|---|
| CAC | real marketing/channel spend ÷ subscribers acquired | **NOT YET MEASURED** — no spend has occurred |
| Monthly churn | cancellations ÷ active subscribers, per month | **NOT YET MEASURED** — no live cohort exists |
| LTV | gross margin ÷ churn rate | **cannot compute** — churn unmeasured |
| LTV:CAC | LTV ÷ CAC | **cannot compute** — both terms unmeasured |
| Payback period | CAC ÷ gross margin | **cannot compute** — CAC unmeasured |
| Monthly burn | actual spend ledger | **NOT YET MEASURED** — no spend ledger exists |
| Runway | cash balance ÷ burn | **NOT YET MEASURED** — no cash balance recorded |

**The engine (`scripts/economics_engine.py`) is built and correct.** The moment a real pilot produces spend and cohort data, these seven lines compute themselves — nobody needs to re-derive the formulas under deadline pressure. Until then, "not measured" is the complete and correct answer, per `CLAUDE.md` §5 principle 8 and the project's own honesty ledger (D14).

## What this deliberately does not do

- Does not name a real buyer or claim outreach happened (that is P1.12, requires actual contact — not done here).
- Does not invent a competitor price to benchmark against (P1.13, Babatunde's job, zero real figures exist per `docs/COMPETITORS.md`).
- Does not present the 20% channel commission as a negotiated rate — it is a labelled placeholder.

## Reproduce

```bash
python3 scripts/economics_engine.py
```

No dependencies beyond the Python 3 standard library.
