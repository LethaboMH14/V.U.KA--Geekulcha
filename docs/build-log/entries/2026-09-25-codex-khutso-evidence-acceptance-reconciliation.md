## 2026-09-25 | Codex assistant, acting for Khutso Mothopa | P3.K1/P3.K2 | audit confirmed; SAPS restoration proposed

**Research** — Compared `origin/main` with PRs #47 and #54, their base branches and Sibusiso's reviews, the P3.K1 audit and later correction records, the current P3 checklist and Khutso work order. PR #54 merged into `docs/khutso-p3-k1-evidence-recheck` after that branch's PR #47 had merged to `main`; its SAPS row was therefore absent from `main`. Attempted the official SAPS annual and four quarterly PDF links again on 25 Sep; the site returned timeouts/502 in this session, so no fresh visual read is claimed. Khutso explicitly stated in this task that he had personally checked every P3.K1 row and confirmed the existing audit dispositions, leaving unresolved claims flagged. The official government Cybercrimes Act PDF and the FTC's original report PDF were newly accessible and read for the limited claims now cited in `docs/EVIDENCE.md`.

**Real data / references** — PR #54 records Khutso's visual confirmation of SAPS FY2024/25's 1,515,383 from the annual report printed p.112 and FY2025/26's 1,452,038 from four printed p.10 quarterly national rows: 346,182 + 361,560 + 385,936 + 358,360. The supplied screenshot is printed p.130, a Q4 quarterly/provincial summary, not the annual-total source. `docs/EVIDENCE.md` holds the official PDF links and scope. PR #47's final head `110853a4` received Sibusiso's approval; PR #54's final head `ba249a0a` also received Sibusiso's approval, but the latter did not reach `main`.

**Business reasoning** — A period-correct, reproducible crime baseline and honest residual flags prevent the pitch from making a claim that a reviewer, bank or insurer can disprove. This serves T, S and B; a real user can trust a record that says what was checked and what remains uncertain.

**Competitor reference** — GuardMe, iTOO and vehicle-tracker prices remain dated comparators, not evidence of equivalent VUKA capability. The GuardMe and tracker price sources remain flagged where secondary or not current.

### P3.K1 row-by-row confirmation

Each tick means Khutso confirmed that the existing audit's **disposition** for this row matches his personal check. It does not mean every subclaim was proved by a primary source. The original detailed audit and later corrections remain the source for the exact scope and links. The SAPS full-year row belongs to P3.K2 and is recorded separately above.

| Checked | 23 Sep evidence row | Confirmed disposition / remaining limit |
|---|---|---|
| [x] | Digital banking crime, SA | R2.4bn retained; detailed incident/app-share figures remain secondary ⚑. |
| [x] | The same, one year earlier | 2024 figure retained as historical, not current. |
| [x] | Kidnappings | ISS/SAPS-derived wording retained; express-kidnapping description attributed to ISS. |
| [x] | Latest quarter | Government-reported SAPS quarter retained; not a VUKA outcome. |
| [x] | Bank fraud attempts rising | BioCatch vendor-survey scope retained. |
| [x] | Banking Ombud fraud complaints | Jan–May and card-fraud scope retained. |
| [x] | Absa fraud losses H1 2026 | Secondary report only; primary interim disclosure still missing ⚑. |
| [x] | Short-term claims and fraud | ICB page could not be opened; warning narrowly stated, unsupported denominator removed ⚑. |
| [x] | Santam | Official policyholder/share figures retained; FY2025 GWP withheld pending primary result. |
| [x] | Express kidnapping already insured | iTOO comparator retained with starting-price scope. |
| [x] | In-app panic button | GuardMe historical press price retained, not asserted as current ⚑. |
| [x] | Vehicle trackers | Aggregator range retained only as a comparator ⚑. |
| [x] | Smartphone excise | Export-price duty rule clarified; +80% sales figure remains secondary ⚑. |
| [x] | UK APP-fraud reimbursement | Primary PSR scope and UK-only caveat retained after later correction. |
| [x] | “South Africa is expected to follow” | Removed; no South African authority source found. |
| [x] | Crime displacement | Author-paper Table 1 figures and causality caveat retained; not a VUKA forecast. |
| [x] | Adoption reference | Historical Bass parameter reference only; not a VUKA forecast. |
| [x] | YAMNet class indices | Class-map mismatch with predecessor recorded. |
| [x] | Android foreground-service rule | Official Android restriction retained, with narrow-exception caveat. |
| [x] | Android microphone indicator | Official platform constraint retained; no invisibility claim. |
| [x] | Google Play restrictions | Accessibility, SMS and persistent-notification limits retained. |
| [x] | Hedera fee and mirror node | Fee/API facts retained; unproved finality timing removed. |
| [x] | USD/ZAR and anchoring estimate | Dated rate and script-based estimate retained, not a current quote. |
| [x] | OpenTimestamps | Service fact retained; unrecorded timing observation removed. |
| [x] | NIST FIPS 204 | Publication/effective dates and primary size table corrected. |
| [x] | ECTA s15(3) | Official Act-text factors retained; no admissibility guarantee. |
| [x] | RICA s1 | Official Act-text definition retained; no legal conclusion inferred. |
| [x] | Cybercrimes Act ss8–9 | Originally secondary ⚑; official government PDF located and cited in this correction for the limited section-name claim. No legal conclusion inferred. |
| [x] | FTC emergency ATM PIN report | Originally inaccessible ⚑; official FTC PDF opened and cited in this correction. Its historical caution is not a VUKA test result. |
| [x] | Capitec Feature Lock | Dated official comparator retained. |

**Changed** — Restored the P3.K2 SAPS row and page/table citations to `docs/EVIDENCE.md`; replaced the stale “Khutso confirmation pending” statement with his explicit confirmation; ticked P3.K1 for the completed row audit while preserving the remaining source flags; replaced the Cybercrimes and FTC flags with directly read official sources; left P3.K2 unticked pending review of the current-main restoration; reconciled `team/khutso.md` and `docs/OVERLAPS.md`. No old build-log entry was rewritten.

**Evidence** — PR #47 and #54 review/merge records; Khutso's explicit confirmation in this task; the table above. On this branch, `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `git diff --check` and `.tools/gitleaks.exe dir --redact --no-banner .` exited 0; Gitleaks reported no leaks. The arithmetic `346182+361560+385936+358360` evaluated to 1,452,038. These checks do not substitute for factual/reviewer acceptance. The SAPS PDF host failed on today's re-open attempt; the restored figures rely on the recorded 24 Sep visual read and PR #54 final-head review, not a fabricated fresh read.

**Decision** — None. The correction does not change a product or legal contract. It distinguishes a completed source-review task from unresolved source gaps, and a completed visual source read from a missing merge to `main`.

**Needs/blockers** — Sibusiso should verify the P3.K2 restoration on this current-main branch, then both leads review under `RULES.md`. P3.K2 is not accepted on `main` until that review and merge. The ⚑ rows need primary sources or must remain qualified; Ipeleng owns the legal/security primary reads. P3.K3 has separate acceptance and test-coverage gaps.

**Business handoff** — Babatunde and Lethabo may use the restored SAPS baseline only with its fiscal-year/table scope and after the current-main review. Do not upgrade any flagged P3.K1 subclaim in a slide.

**Next** — Sibusiso reviews this restoration PR; after required approvals and merge, Khutso or his assistant verifies `main` contains the SAPS row, then ticks P3.K2 with the merge and review evidence.
