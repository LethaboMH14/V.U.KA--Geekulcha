## 2026-09-23 | Claude Code assistant at Vukosi's request | Claude Code, `claude-opus-5-5` (Opus 5.5) | P3.V1–P3.V6 / P3.L4 workflow review, packet P2a (P3.V2) | local draft

Criteria T/S. Trust answer: the detector that ships must be the model we evaluated, listening for the classes we name, and every claim must wait for its instrument. No product feature was built.

**Research:** Read MASTER-CONTEXT, AGENTS, RULES, `team/vukosi.md`, OVERLAPS, AGENT-ROUTING, recent build-log entries, `VUKA-2-SPEC.md`, CHECKLIST P3, the ADR acceptance record, the Codex workflow/review/entry, and the relevant lines of `team/mutarisi.md` and `team/ipeleng.md`, `docs/MODEL-LICENCES.md`, `.gitignore`, `.github/workflows/checks.yml` and `scripts/check-docs.mjs`. Refreshed remote refs.

**Real data / references:** **FACT:** `origin/main` is `0cdd372` and #43/#39/#44/#42 heads are unchanged (`git ls-remote origin 'refs/pull/*'`). GitHub reviews, comments and CI are **NOT RUN** (`gh` not logged in; private repo). The YAMNet register digest `10c95ea3…17de` and the expected indices come from `docs/MODEL-LICENCES.md` and `docs/EVIDENCE.md:36`.

**Business reasoning:** Not applicable to revenue. It lowers the risk of a wrong-class detector or an unmeasured figure reaching the pitch.

**Competitor reference:** Not applicable. Development review only.

Changed: new `docs/reviews/VUKOSI-WORKFLOW-CLAUDE-REVIEW.md`. R1 is confirmed and widened: offline-queued ordinary events fail the 120 s skew check. R2, R3, R4 and the security-review gap are confirmed. `actor_id` stays closed. New findings C1–C4. New `docs/workflows/vukosi/p2a-yamnet-provenance/TASK.md`. `docs/VUKOSI-VIGIL-WORKFLOW.md` gets the toolchain correction, the dated task list and pointers. `team/vukosi.md` gets the declaration and a running-log line. `docs/OVERLAPS.md` gets the packet claim. The Codex review and entry, other owners' files, contracts, governance and `docs/BUILD-LOG.md` are untouched.

Evidence: `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` passed before and after the edits. `node --test "test/**/*.test.mjs"` passed 10/10 (v1 contract tests only). The Node used was Playwright's bundled v22.13.1, the only Node found. The float rounding in the packet's `score_to_bp` oracle was checked with `py -3.12`. After the edits, `git diff --check` was clean. Gitleaks 8.24.3 (`dir --redact --config .gitleaks.toml .`, the original checkout's `.tools` binary) found no leaks. All changes are uncommitted. No Android build, download, install, device check or measurement: T03/T17/T18/T20 and M1–M7 are NOT RUN.

Decision: none. Packet P2a is PROPOSED, pending Vukosi's acceptance. AI review is not Lethabo's review.

Needs/blockers: Vukosi: available hours, actual phones/OS, predecessor-file access, toolchain locations, YAMNet source of record. Leads: signing custodian and publication route. Sibusiso + Ipeleng + leads: R1 in contract v2. Lethabo/Ipeleng: R2, P3.L8. Lethabo: R3. Ipeleng: #43 security review, `shared/` deadline. Ipeleng/Khutso: M7 ground truth. Mutarisi/Lethabo: `app/` scaffold sequencing.

Business handoff: not applicable. No capability or economics changed.

Next: Vukosi accepts or edits P2a, commits the workflow branch locally and hands the TASK to Codex. Claude reviews the resulting HEAD in a separate checkout. No push, PR, comment or approval was made.
