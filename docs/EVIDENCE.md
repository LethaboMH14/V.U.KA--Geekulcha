# Evidence and provenance

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

## Supplied economic model — no supplier or customer quotes

KHAYA R299/month; hardware R125/month = R3,000/24; cloud and anchor R12; support/operations R25; gross margin R137, reported 46%. Exact division R137/R299 = 45.8193979933…%, so 46% is the supplied rounded presentation value. Prototype BOM R3,900; target R3,000 at 1,000 units is an estimate.

Security licence R35/subscriber/month; patrol optimiser R12,000/control room (billing period unspecified); estate R5,500/month; insurer installation R40/member/month; claim record R15/record. These are alternatives or contracted add-ons, not revenue automatically stacked on the same household.

Anchoring model: 720 batches/month, approximately R1.30/month for the network. This assumes a 30-day month: 24 × 30 = 720. It is not a universal Bitcoin fee quote, nor proof that all infrastructure cost is independent of users. Public OpenTimestamps calendars are free to use ([official service](https://opentimestamps.org/)); operational costs and service guarantees require validation. A confirmed timestamp establishes a commitment's existence by a time, not truth, identity, event time or motive.

## Failures retained without euphemism

The forecast **loses to the constant baseline: MAE 0.484 versus 0.246**. Fusion weights are hand-set, labelled “PROVISIONAL — NOT fit on real data”. Face thresholds 0.55 and 0.65 cosine are uncalibrated targets. One of six suspicion factors is implemented in the prior project; five are documented stubs. Face demographic bias evaluation has not run. No independent penetration test. No self-trained computer-vision model; pretrained integration only. Hardware has not been fabricated. Retention TTL, subject access and deletion routes are absent.

## Claim rules

Use `sim_` for simulated event identifiers and spoken demo labels. Never imply that simulation is deployed capability. No guarantees about guilt, admissibility, fairness, invulnerability or prevention. Public hashes can remain personal information if linkable. Embeddings are sensitive representations, not anonymous data by default.

## Missing evidence register

| Evidence needed | Owner | Proposed due | Acceptance |
|---|---|---|---|
| Credential rotation for three exposures and reused-password change | Ipeleng + account owners | Sep 13 | Redacted issuer revocation evidence; no secret values in repo |
| Dataset removal from old public repositories/history/caches where controlled | Lethabo | Sep 13 | Repository and hosting remediation record; no old remote or data copied |
| Clean file-by-file port permission and scanning | Sibusiso | Sep 14 | Both leads sign remediation gate |
| Historical tests, latency method, ADR-0025 and component names | Sibusiso | Sep 16 | Sanitised scripts/results and reviewer reproduction |
| Sonke roster and organiser criteria | Khutso | Sep 14 | Private-source comparison recorded without publishing personal screenshots |
| Original deck and documents for stale-text correction | Lethabo | Sep 16 | File/slide inventory and checked replacements |
| Household/partner interviews and named pilot area | Babatunde | Sep 18 | Consent-safe notes and actual recruitment capacity |

All proposed dates, hours, capacities, design limits, scores and scenario numbers in this pack are planning assumptions, not measurements. IDs, table row counts, statutory section numbers and dates copied from the brief are not measured product claims.
