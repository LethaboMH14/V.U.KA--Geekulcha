## 2026-09-19 | Codex assistant | GPT-5 | WBS dependency rebaseline proposal | proposed

This proposal serves C3 (progress of solution profile). Trust answer: it places physical evidence before dependent hardware claims and keeps the published feature-freeze/event boundary visible, rather than disguising missed assumptions as completed work.

**Research** — Read the current Master Context, brief, repo rules, evidence/security guidance, team operating-system/WBS, Vukosi's role file, overlaps, agent routing, and latest build-log entries in the prescribed order. Checked `docs/HANDOVER.md` §6 and the canonical WBS dependency calendar. Checked draft PR #42 status, required CI results, and requested reviewers.

**Real data / references** — **FACT (repository baseline):** `docs/audit/05-team-operating-system.md` labels hours/dates as assumptions and says human schedule acceptance is pending. Its WBS lists 4.2 due 2026-09-17; 5.2 due 2026-09-18 depending on 4.2; 4.4 due 2026-09-19 depending on 3.2/4.2; 5.3 due 2026-09-19 depending on 2.5/5.1/5.2; 4.5 due 2026-09-20 depending on 3.5/4.3/4.4; and 6.2 due 2026-09-22 depending on 4.4. `docs/HANDOVER.md` records feature freeze 2026-09-24 and event dates 2026-09-25–27; `docs/MASTER-CONTEXT.md` records the final 15:00 SAST deadline on 2026-09-27. These establish what the repo's plan says, not independently reverified event notices. **FACT:** WBS 4.2 evidence on the current branch is partial; PR #42 is draft, both lead review requests are pending, and GitHub `document-contracts`/`secret-scan` passed. Availability and statuses for other owners were not verified.

**Business reasoning** — A short conditional sequence protects the evidence needed for the demo while giving the leads an explicit point to cut untestable appliance claims before they consume final rehearsal time.

**Competitor reference** — Not applicable: this is internal schedule coordination and makes no competitor claim.

Changed: appended this proposal to `docs/VUKOSI-WBS-4.2-HANDOFF.md` and declared the scoped paths/status in `team/vukosi.md`. Did not edit Khutso's canonical WBS/calendar or the fixed handover gates. No other person's task was marked done or assigned a commitment.

Evidence: `git diff --cached --check` passed; `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` passed; `.tools/gitleaks.exe dir --redact --config .gitleaks.toml .` found no leaks; the local Markdown-link check passed for 5 files. No application code changed, so the appliance unit suite was not rerun for this documentation-only schedule proposal; the prior WBS 4.2 entry records 7/7. No measurement, quote, meeting, owner confirmation, or approval is inferred. Remote CI for this new commit is pending at entry creation.

Decision: none. Proposed recovery dates remain conditional and pending both leads' approval and Vukosi's availability confirmation; fixed event/freeze dates are not changed.

Needs/blockers: Vukosi — confirm capacity and physical hardware/analyzer/quote readiness; Lethabo and Sibusiso — approve scope and any changed dependency dates; Babatunde — confirm status and dates for 5.2/5.3; Khutso — record any approved shared-calendar change.

Business handoff: `docs/VUKOSI-WBS-4.2-HANDOFF.md`, “Dependent-work rebaseline proposal”.

Next: leads choose between the conditional Sep20–23 recovery path and explicit hardware-scope cut/blocked status; owners confirm their own prerequisites; Khutso records approved dates in the canonical schedule. No owner responses are assumed.
