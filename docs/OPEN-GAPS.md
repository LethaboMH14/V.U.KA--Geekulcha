# VUKA — Open gap register

Kept current. Published here so no judge, reviewer or teammate has to discover a gap themselves — see `CLAUDE.md` §11 and `docs/00-SPEC.md` §7 for the register this consolidates, and `docs/SDLC-GAP-ANALYSIS.md` for the fuller reasoning behind each. **Closing a gap means editing this file in the same PR that closes it** — see `docs/BUILD-LOG.md`. A gap that closes is marked closed here, never deleted; if what closed it wasn't quite what this row asked for, replace the row rather than removing it (`docs/HANDOVER.md` §10.4 — gender variety and UX ownership are the precedent).

| # | Gap | Owner | Closing gate | Status |
|---|---|---|---|---|
| **G1** | Fusion weights hand-set from a cost matrix, not fitted. `ml/params/fusion_params.json` self-labels *"PROVISIONAL — NOT fit on real data"* | Khutso, Lethabo | G4 · Calibrate (23 Sep) | Open |
| **G2** | The crime forecast loses to a constant baseline — MAE 0.484 vs 0.246 | Khutso, Babatunde | G4 · Calibrate (23 Sep) | Open — **published regardless of outcome, never softened** |
| **G3** | POPIA obligations undischarged — no retention TTL, no subject-access path, no deletion route (`ADR-0006` records the obligation) | Sibusiso, Mutarisi | G3 · Govern (21 Sep) | Open |
| **G4** | Suspicion factors: 1 of 6 implemented (`factor_f1_recurrence`). F2–F6 are documented stubs, not silent absences | Lethabo | Post-hackathon | Open |
| **G5** | No computer-vision model trained by this team — vision is integration of pretrained models (YOLOv8, YAMNet, InsightFace) | Lethabo | Post-hackathon | Open — stated plainly, never claimed otherwise |
| **G6** | Secrets committed to a public repository — a live WeatherAPI key (`vuka/data-pipeline/weather_ingestion.py:7`), a live EskomSePush token (`esp_pipeline.py:51`), and a real person's university email and plaintext password (`acled_ingestion.py:6-7`), all on `Team-Sonar---Vuka-`'s `main` as of 13 Sep 2026 | Sibusiso | **G0 · Clean (16 Sep)** | 🟠 **Partially mitigated — repo made private 13 Sep 2026** (`gh repo view` confirms `isPrivate: true`), stopping new clones/forks. **Rotation of the key, token and password is still outstanding and requires the account holders directly — the password appears to belong to Ndumiso, who is not on this team and may not know it's exposed.** History purge still required once rotated |
| **G7** | A third party's proprietary claims dataset tracked in two public MIT-licensed repos — `Gradhack_Insure_Data.xlsx` (~1.1 MB), `claims_cleaned.csv`, `claims_cleaned.xlsx`, on both `BEACON`'s and `Team-Sonar---Vuka-`'s `main` as of 13 Sep 2026 | Babatunde, Lethabo | **G0 · Clean (16 Sep)** | 🟠 **Partially mitigated — both repos made private 13 Sep 2026**, stopping new access. **History purge of the dataset files still required**; the clean repo (`docs/00-SPEC.md` §1.3, `docs/01-ARCHITECTURE.md`) already re-bases the risk layer on SAPS-only figures, so no further re-basing work is needed here — only removing the dataset from the two predecessors' history |
| **G8** | No independent penetration test | Ipeleng | G5 · Harden (24 Sep) | Open — scheduled before the first paying household, not before the hackathon |
| **G9** | Bias evaluation not run on the face pipeline — the stated answer to the NIST FRVT demographic differentials is itself untested | Ipeleng, Lethabo | G5 · Harden (24 Sep) | Open |
| **G10** | Appliance hardware not fabricated. This is what caps the system's TRL at 4–5, not 6 | Vukosi | Post-hackathon | Open — stated as the honest ceiling, not rounded up |
| **G11** | Fourteen exported wireframe specifications exist and are not committed anywhere a judge can see them. "Progress of solution profile" explicitly names wireframing | Mutarisi, Lethabo | Align (17–19 Sep) | Open — free marks currently left on the table; the work exists, only publishing is missing |
| **G12** | No model provenance/licence register for YOLOv8, YAMNet, InsightFace, EasyOCR. Ultralytics YOLOv8 ships AGPL-3.0 with a separate commercial licence; some InsightFace pretrained weights are non-commercial-research-only — unverified against what this repo actually ships | Lethabo, Babatunde | Before G0 closes publicly (16 Sep) | 🔴 **Open — a second licensing finding in the same submission would read as a pattern, not a mistake, after G7** |
| **G13** | Model cards not written. Template exists in `docs/SDLC.md`; the row that matters — known limitations / demographic performance — has a valid, required answer today: *"not measured"* | Lethabo | Align (17–19 Sep) | Open |
| **G14** | No machine-readable `openapi.yaml`. The contract is frozen and written in prose only; a judge or partner cannot explore it without reading the code | Sibusiso | G3 · Govern (21 Sep) | Open |
| **G15** | No operator training or duty material. The human gate is the system's central safety mechanism, and there is nothing describing what an operator is trained to verify, what evidence is sufficient, or how to co-sign. An untrained human gate is a rubber stamp — functionally the automated decision this system refuses to build | Lethabo, Sibusiso | G3 · Govern (21 Sep) | Open |
| ~~G16~~ | ~~The astra-audit-alignment branch appeared to introduce a third gate calendar that didn't match `docs/HANDOVER.md` §6.~~ **RESOLVED 12 September 2026 (Lethabo).** Re-checked: `docs/TEAM.md`'s gate windows (Clean 13–16, Align 17–19, Govern 17–21, Calibrate 20–23, Harden 22–24) close exactly on `HANDOVER.md` §6's gate dates. The WBS item flagged (1.4, clean-intake evidence, due Sep 14) is evidence-assembly work *inside* the Clean window, finishing two days before the gate itself closes on the 16th — not a competing date. No contradiction; no rewrite needed | Lethabo | — | **Closed — no action required** |
| **G17** | Branch protection on `main` cannot be configured while the repository is private on GitHub's free tier — `gh api repos/.../branches/main/protection` returns `403: Upgrade to GitHub Pro or make this repository public`, confirmed 12 Sep 2026. Both CI jobs pass on a real remote run (PR #2, `secret-scan` and `document-contracts` both `SUCCESS`), but nothing on GitHub currently stops a direct push to `main` or a merge with failing checks — passing CI is advisory only until protection is enforced | Sibusiso | **G0 · Clean (16 Sep)** | 🔴 **Open — a second, concrete reason the repo must go public by G0, not only the one already stated in `docs/HANDOVER.md` §6** |

## Blocked by design, not by neglect

| Item | Blocked until | Gap |
|---|---|---|
| Reliability diagram + ECE | G4 — needs real labelled data | G1 |
| Bias evaluation results | G5 | G9 |
| Independent penetration test | G5 | G8 |
| Hardware validation | Fabrication (post-hackathon) | G10 |
| Member privacy notice, terms, DPA | Pilot, with counsel | — |
| **POPIA Information Officer registration** | Before pilot | a concrete, cheap, statutory step worth diarising now |

## Already closed — kept for the record, not deleted

| Former gap | Closed by | Evidence |
|---|---|---|
| Team was three, no gender variety, UX shared rather than owned | Team grew to seven across four universities | `docs/TEAM.md`, confirmed against the Sonke roster 12 Sep 2026 |
| Repository history contained the predecessors' commits | Repository re-created clean, 4 commits, no predecessor remote | `git remote -v`, `git log` |
| 25 ADRs existed in two colliding, unreconciled numbering series | Ported and renumbered with a provenance table | `docs/adr.md`, ADR-0026 |

## Open question closed on 12 September 2026

`docs/HANDOVER.md` §11 asked whether Ndumiso Skhosana's data-science attribution needed correcting. Confirmed by Lethabo: Ndumiso and Sali are not on the VUKA/Geekulcha team — they belong to the predecessor project. No attribution change needed; the existing wording in `docs/TEAM.md` (founding work under the predecessor project, forward ownership to Khutso and Babatunde) is correct as written.
