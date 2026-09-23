# Evidence — the four-layer plan (archived 23 Sep 2026)

Kept exactly as it stood (ADR-0034). Historical figures here are not claims about VIGIL + ANCHOR.


Audit date: 12 September 2026. Source: user-supplied `26-ASTRA-AUDIT-PROMPT.md`, Block 0. This is a requirements source, not independent validation. Its embedded instruction to wait for separately pasted prompts does not replace the user's request to implement the whole pack.

Observed checkout base: `464d0c4e8af12897f27619620742aaa69c9332ca`, one commit, README and MIT LICENSE only. No previous history imported. Old code, deck, ADRs, Sonke screenshots, email, programme and datasets were not available for inspection. Repository visibility was not independently queried.

## P4 falsification result shown in the 13 September review screenshot

The screenshot reports `delta_r2 = 0.02787082786001449` and `p_value = 0.00018062196419940484`, and says a second implementation reproduced Sibusiso's checked-in result exactly. A search of this repository and the current predecessor working trees did not locate those exact values, the claimed independent program, its input snapshot or a run manifest. The screenshot is therefore a review lead, not repository evidence, until those artifacts are committed.

Even when independently reproduced, equality from two programs using the same copied dataset establishes implementation reproducibility for that calculation. It does not by itself validate the dataset's provenance, the research design, causal interpretation, generalisation, or IP ownership. Any pitch or audit statement must keep those claims separate.

## Supplied historical evidence — not reproduced in this checkout

- Detection to alert: 318 ms p95, 273 ms p50, **n = 10**, budget 2,000 ms.
- 440 tests; 25 ADRs; 207 commits; approximately 33,600 repository lines, approximately 10,300 server-side. These are historical scope counts, not current checkout counts. **Re-verified 12 September 2026 against both predecessors' `origin/main` — see "Re-derived on 12 September 2026" below. The 25-ADR figure holds exactly; the other two do not reproduce as stated.**
- 15,712 claim records **analysed under a prior engagement, not redistributed**. 764 hotspot suburbs, 709 geocoded; 678 precincts; 9 provinces; 680 hijackings; 1,296 incidents in the 00:00 hour. Modelled exposure R1.09bn; roughly R10.9m per 1% prevented is a hypothetical exposure calculation, not an outcome. SAPS public data reportedly covers 17 of 18 target towns; their names and source extracts were not supplied.
- TRL 4 is the target. The brief reports TRL 4 met and two subsystems at TRL 5; subsystem identities are absent from this checkout, and no ADR states them — `CLAUDE.md` §12's originally planned ADR-0025 for a TRL writeup was never authored before the ADR-port renumbering (`docs/adr.md`, ADR-0026); a TRL ADR, if written, is new work starting at ADR-0027. Do not publish TRL 5 as locally verified.

## Re-derived on 12 September 2026 — exact commands, against both predecessors' `origin/main`

The README invites "clone and count." These are the counts, with the command that produced them, so the invitation survives being taken up.

**25 ADRs — CONFIRMED.** Two predecessor series summed, both starting at 0001:
```
git -C <BEACON checkout> show 'origin/main:docs/adr.md' | grep -cE "^#{1,3} ADR-"   # → 7
git -C <Vuka checkout>   show 'origin/main:docs/adr.md' | grep -cE "^#{1,3} ADR-"   # → 18
```
7 + 18 = 25. Ported into `docs/adr.md` with a provenance table; see ADR-0026 for why the numbering isn't a straight concatenation.

**Commits — 207 does NOT reproduce. The true count is 224.**
```
git -C <BEACON checkout> rev-list --count origin/main   # → 90
git -C <Vuka checkout>   rev-list --count origin/main   # → 134
```
90 + 134 = 224, not 207. Note: the local `Vuka Gradhack` working checkout is on a feature branch (`lethabo/design-handoff-phase1-scenario-engine`), not `main` — counting the checked-out branch instead of `origin/main` gives a different, misleading number (129). Always count `origin/main`.

**Tests — "440 tests" has no reproducing command.** A `git grep` over tracked files (not a plain recursive grep — `node_modules` inflates a naive count to roughly 9,800) finds:
```
git -C <BEACON checkout> grep -ohE "^\s*(async )?def test_" -- '*.py'          # → 208
git -C <BEACON checkout> grep -ohE "\b(it|test)\(" -- '*.ts' '*.tsx' '*.js'    # → 34
git -C <Vuka checkout>   grep -ohE "^\s*(async )?def test_" -- '*.py'          # → 167
git -C <Vuka checkout>   grep -ohE "\b(it|test)\(" -- '*.ts' '*.tsx' '*.js'    # → 101
```
208 + 34 + 167 + 101 = **510 test-function definitions**, tracked files only. That is a *different measure* from "440 tests" — a collected pytest/vitest run count, which was not reproduced here because the two predecessor environments were not stood up to actually execute the suites. Until someone runs both suites and records the collected count, do not restate "440 tests" as a checkable figure; state either "510 test-function definitions found by `git grep`, command above" or run the suites and record what they collect.

## Corrected market figures — 14 September 2026

The live public profile states *"~2.7m registered security officers versus roughly 180k police"*. This compares a **cumulative-ever PSiRA registration count** against a **current SAPS headcount** — different measures, off by roughly 4×. Corrected:

| | Figure | Source |
|---|---|---|
| Active private security officers | **~637,675** (as at 31 March 2025) | PSiRA 2024/25 Annual Report |
| SAPS personnel | **155,231 sworn / 187,681 total** (March 2025) | SAPS |
| Ratio | **≈ 4:1** | derived |
| Private security industry revenue | **R87bn (2024)** — guarding R34.8bn · monitoring/surveillance R17.9bn · CIT R14.4bn · armed reaction R14.3bn | Stats SA |
| Industry revenue by buyer | Business R66.3bn / households R11.6bn / **government R7bn** | Stats SA |

`FACT`, cited. **Replace "2.7m vs 180k" everywhere it appears** — canvas, deck, public profile, docs — with the 4:1 figure and this citation. The corrected number does not need inflating to be a strong market statement; it survives being checked, which the old one did not.

## Anchoring cost — the R1.30/month figure does not survive

The existing R1.30/month figure (below, "Anchoring model") reconstructs as 720 batches/month × $0.0001 × ~R18/USD = R1.296 — a match too exact to be coincidence. That is **Hedera's pre-2026 `ConsensusSubmitMessage` price**.

**Hedera repriced this operation from $0.0001 to $0.0008 in January 2026** — an 8× increase, the first price change since 2019, in effect eight months before this event. Recomputed at the current price: 720 × $0.0008 = $0.576/month ≈ **R9–10/month** at ~R16.24/USD. `FACT`, current pricing not yet independently re-verified against Hedera's published fee schedule at time of use — re-check before quoting.

If **OpenTimestamps is the primary anchor**, as the architecture states, the honest end-user figure is **~R0** — the calendar operators absorb cost via donations, with the caveats already recorded below about service guarantees.

**The number must match a named system at a current price before it reaches a slide.** The *structural* claim — batched, so cost is fixed per network rather than per user, identical at 100 homes or 100,000 — is unaffected by which digit is correct, and remains the strongest commercial-viability point for the blockchain track. See `docs/ANCHOR-RATIONALE.md` for the full blockchain-track argument.

## Supplied economic model — no supplier or customer quotes

KHAYA R299/month; hardware R125/month = R3,000/24; cloud and anchor R12; support/operations R25; gross margin R137, reported 46%. Exact division R137/R299 = 45.8193979933…%, so 46% is the supplied rounded presentation value. Prototype BOM R3,900; target R3,000 at 1,000 units is an estimate.

Security licence R35/subscriber/month; patrol optimiser R12,000/control room (billing period unspecified); estate R5,500/month; insurer installation R40/member/month; claim record R15/record. These are alternatives or contracted add-ons, not revenue automatically stacked on the same household.

Anchoring model: 720 batches/month, approximately R1.30/month for the network. This assumes a 30-day month: 24 × 30 = 720. It is not a universal Bitcoin fee quote, nor proof that all infrastructure cost is independent of users. Public OpenTimestamps calendars are free to use ([official service](https://opentimestamps.org/)); operational costs and service guarantees require validation. A confirmed timestamp establishes a commitment's existence by a time, not truth, identity, event time or motive.

## Failures retained without euphemism

The forecast **loses to the constant baseline: MAE 0.484 versus 0.246**. Fusion weights are hand-set, labelled “PROVISIONAL — NOT fit on real data”. Face thresholds 0.55 and 0.65 cosine are uncalibrated targets. One of six suspicion factors is implemented in the prior project; five are documented stubs. Face demographic bias evaluation has not run. No independent penetration test. No self-trained computer-vision model; pretrained integration only. Hardware has not been fabricated. Retention TTL, subject access and deletion routes are absent.
