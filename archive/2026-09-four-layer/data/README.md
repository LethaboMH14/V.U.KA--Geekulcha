# data/ — ingest, geocode, enrich, forecast, eval

Feeds UMOJA's risk layer. Satisfies F10 (`docs/00-SPEC.md` §3.3) and the forecast-evaluation obligation in G2.

**Empty scaffold.** No code lands here yet — see `docs/HANDOVER.md` Task 4.

## Structure

```
ingest/     Pulls SAPS open crime data — 17 of 18 target towns covered. NOT the
            proprietary claims dataset (that stays out of this repo entirely, see
            docs/OPEN-GAPS.md G7 and docs/00-SPEC.md §1.3)
geocode/    Suburb/precinct resolution — 709 of 764 suburbs geocoded in the source
            analysis (docs/00-SPEC.md §1.3)
enrich/     Joins ingested crime data with contextual signals (hour, load-shedding
            stage, etc.) feeding brain/'s context prior
forecast/   The area-risk model
eval/       Backtest harness. This is where the honest number lives:
```

> ⚠️ **The forecast currently loses to a constant baseline** — MAE 0.484 against 0.246 (N10, G2 in `docs/OPEN-GAPS.md`). This is published, not softened, and stays on the honesty slide regardless of whether it's fixed. See `docs/00-SPEC.md` §7 for the plan (re-base on SAPS severity + near-repeat, report PAI honestly).

## Non-negotiable, before any code lands here

- **No proprietary or third-party data ships in this repository, ever.** SAPS open data only (`docs/HANDOVER.md` §3, rule 4). Describing figures from a prior engagement is fine; redistributing the data is not.
- **A held-out backtest is not optional.** Whatever lands in `forecast/` needs `eval/` to run against real held-out rows before any skill claim is made — see `docs/00-SPEC.md` §5 (654 held-out rows in the predecessor evaluation).
- **PAI (Prediction Accuracy Index) or an equivalent, reported honestly**, not just MAE against a favourable baseline — the naive constant baseline is the one to beat, and if it doesn't, that stays on the record.
