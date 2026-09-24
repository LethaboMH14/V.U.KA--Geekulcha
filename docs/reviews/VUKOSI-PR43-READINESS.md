# Vukosi: pivot and dependency review

**FACT — review snapshot, 23 September 2026.** Assistant review requested by Vukosi; not a GitHub approval, acceptance of his work-order dates, or independent human security sign-off. Criteria T/U/S. Reviewed pivot head `0c6d202e811618011bab5047f7eb18d3ea910af2` against `origin/main` (`0cdd372`); findings below are specification/readiness findings, not claims of deployed vulnerabilities. Refresh PR heads before acting.

## PR disposition

| PR | Evidence and effect on Vukosi |
|---|---|
| [43](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43) | **FACT:** open; remote secret-scan/document-contracts successful; Sibusiso approved ADRs at `3855a3d`, with implementation conditions. Later `0c6d202` includes `actor_id` in the signed statement/T21 and adds the ADR acceptance record. Ipeleng's security review remains pending. GitHub's APPROVED rollup is not proof all repository-specific requirements are met. |
| [42](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/42) | **FACT:** closed unmerged by Lethabo because KHAYA is parked. No reviews. Hardware branch and its partial evidence remain available. Do not spend the event window finishing old WBS 4.2/4.4/6.2 unless leads reassign them. The closure comment says the BOM is archived, but those BOM/power files are not present in the inspected pivot archive: the branch is the verified preservation location. |
| [39](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/39) | **FACT:** open at `ee0966cc426babf973fc61d8059c8aff8766854c`, no reviews; retained for Sibusiso's v2 rework. Inspected chain, verifier, subject export, handler and representative tests. Null genesis, float-accepting canonicalisation, global-chain filtering and `sim_bearer_` placeholder auth are legacy boundaries, not the VIGIL integration target. Do not wire the phone to this as a production-ready consumer. Its reported 25-test result was not rerun here. |
| [44](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/44) | **FACT:** open; two-file diff records Sibusiso's Codex → Cline → Claude preference. No new blocker found in that limited diff. It is not your tool assignment. Merge after #43 and preserve the new role text when resolving its team-file overlap. |
| [24](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/24) | **FACT:** merged; reviewed its review history. Preserve the successful discipline: schema authority, deterministic fixtures, acknowledge before removal, stop visibly on corruption, state untested boundaries. It remains a synthetic envelope-only appliance producer, not an Android queue or v2 client. |
| [33](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/33), [34](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/34) | **FACT:** merged historical contract sign-off/consumer coordination, inspected bodies and current archived disposition. The old SightingEvent payload follow-up is parked by #43, not a new VIGIL task. |
| [6](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/6), [12](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/12), [23](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/23), [26](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/26), [37](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/37) | **FACT:** merged historical prerequisites/process context. Current contracts/rules and #24's reviews were inspected; these old PRs were not each re-audited line by line. Their existence does not freeze contract v2. |

Scope: all open PRs in the repository (#39/#43/#44), the owner's closed #42 and merged #24, plus directly relevant contract/process lineage. PR-list inventory covered #1–#44. No claim that unrelated historical PRs received full code audits. No GitHub comments/reviews were submitted.

## Actionable findings

### R1 — P1: event retry and request replay rules need an explicit boundary

**FACT:** `docs/VUKA-2-SPEC.md:181–184` signs requests with a nonce that is never accepted twice, while retries send the same signed bytes; §4 promises the original receipt on an identical retry. **Inference:** after the server accepts an event but its response is lost, a byte-for-byte request retry can be rejected by nonce/counter enforcement before reaching event idempotency. A queued ordinary event can also outlive the request-skew allowance. The spec does not explicitly distinguish immutable event bytes from a fresh transport-auth envelope or define duplicate-lookup precedence.

**PROPOSED resolution:** Sibusiso + Ipeleng + leads freeze the request/event distinction and precedence before P3.V3 transport code. Add tests: accepted event/lost response/retry returns original receipt with one effect; changed content under reused ID rejects; delayed queue replay has a defined outcome. Do not invent a bypass or silently re-sign event content.

### R2 — P1: a normal PIN must not unlock calling the victim

**FACT:** `team/mutarisi.md:67` unlocks the call button after `stand_down` **or a normal PIN**. VIGIL spec G4 (`docs/VUKA-2-SPEC.md:49`) permits `stand_down` or incident closure, and §8 says a normal PIN never closes an incident because it can be coerced. The role file's own domain rule at line 20 is stricter too.

**PROPOSED resolution:** Lethabo/Ipeleng reconcile the UI work order to the accepted authority rule before wiring Vukosi's check-in result into guardian UI. Add a negative test: a normal PIN alone does not enable calling while the incident remains open. No governance change is made by this review.

### R3 — P2: reboot re-arm notification has no specified trigger

**FACT:** V10 (`docs/VUKA-2-SPEC.md:43`) promises a notification after reboot while the work order and manifest forbid the boot receiver/permission. No alternative trigger is specified. **Inference:** an implementer may either reintroduce the forbidden receiver or promise an automatic notification they cannot demonstrate.

**PROPOSED resolution:** Lethabo chooses explicit re-arm on next user launch, or approves a separately specified permitted mechanism. Preserve the no-auto-arming rule. Test a real reboot; do not claim a notification from a code path that never executes.

### R4 — P2: live coordination still directs agents to parked interfaces

**FACT:** at reviewed head `team/vukosi.md:38` claims `appliance/` and envelope v0.1.0; `docs/OVERLAPS.md` is still a four-layer register. Vukosi bootstraps `app/`, while Mutarisi also adds app dependencies. Checklist P3.S2 says Thu 12:00, while the spec and Ipeleng's work order say Thu 14:00 for `shared/`.

**PROPOSED resolution:** coordinated follow-up for active app/package/lockfile/CI/shared-module ownership and one shared-module deadline. Use 14:00 as the conservative workflow dependency pending confirmation, not a new commitment. This workflow adds only its own documentation claim; it does not reassign anyone's work.

### R5 — P2: archive preserves files, not current test reproducibility

**FACT:** `python -m unittest discover -s archive/2026-09-four-layer/appliance/tests -v` fails importing `appliance`. The archived test also resolves its schema relative to the old layout. RULES still promises parked governance tests stay green, but their module is moved and not run by the current contract-only test command. This is a preservation/run-instructions gap, not a reason to resume KHAYA feature development.

**PROPOSED resolution:** preserve a documented reproducible historical checkout/command, or add a minimal archive harness with approved path handling. Do not quote the prior seven passing tests as a result at this pivot head. Owner: Sibusiso/Khutso, with Vukosi's producer input.

## Existing conditions, not new findings

- **FACT:** `actor_id` omission raised in Sibusiso's approval is corrected in the inspected head, including T21. Do not keep reporting it as unresolved.
- **FACT:** P3.L8 (PIN mechanism), Ipeleng's security review, v2 schemas/mock/vectors and shared JS implementation are still prerequisites. The spec is not a built app; `app/` contains documentation and placeholders, not an RN project.
- **FACT:** APK backup owner is Mutarisi. Thursday failure uses a honestly labelled USB debug build until a real release cold-install succeeds; no fake QR acceptance.
- **FACT:** incoming reviews moved M3 to detection-on-phone → guardian-display, not provider acceptance. Measure clock alignment error; report server interval separately.
- **FACT:** model register has a digest, but no reproducible download/conversion recipe tied to that exact blob in the examined register. Fetch provenance and interpreter shape are readiness checks, not assumed complete. Do not update the digest merely to make another artifact pass.
- **FACT:** private keys/signing secrets and raw audio must not enter the repo or chat. Public Keystore fixtures must be synthetic and stripped of unnecessary attestation/device identifiers before publication.
- **FACT:** Babatunde's later price discussion differs from the R20 spec snapshot. Do not put a price claim in the sensing workflow; economics owner reconciles it.

## Verification actually performed

- `git pull --ff-only` on the original hardware branch: already up to date; fetch discovered the pivot and personal-workflow branches. `origin/main` remains `0cdd372`.
- `node scripts/check-docs.mjs`: passed at PR #43 snapshot.
- `node scripts/check-intake.mjs`: passed structural evidence-reference/approval checks; not a new human attestation. Some old evidence locators still name now-archived G6/G7; human verification must follow their lineage.
- `npm test`: could not run because npm was absent from this shell's PATH.
- `node --test "test/**/*.test.mjs"`: the exact package-script test payload passed **10/10**. These are v1 contract tests, not T01–T24 or Android tests.
- Archived producer test: failed as described in R5. No device, power, latency, battery or classifier measurement was performed.
- `Get-Command node,java,adb,claude`: Node and JDK 17 resolved; adb and claude did not resolve. This is PATH evidence only, not an installation audit. No package/tool installation performed.

**Recommendation:** use the pivot to plan the bounded phone work; do not call the full protocol frozen or release-ready. Resolve R1/R2 and recorded security conditions with their human owners before dependent implementation. Record your capacity/device blockers, not a fabricated acceptance. This review is a local draft pending Claude and human review.
