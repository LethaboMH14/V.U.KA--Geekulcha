# Khutso task-record reconciliation

- **Date:** 2026-09-25
- **Owner:** Codex assistant, acting at Khutso Mothopa's request
- **Research:** Reviewed current PR heads and review decisions for PRs #51, #73, #76, #77, #78 and #82; compared them with the P3 work order, checklist and requirements trace.
- **Real data/references:** origin/main at 107c437; PR #51 head 6a21c51 with schema patch 8fea572; PR #70 A5 wording correction is merged; docs/REQUIREMENTS-TRACE.md lists seventeen rows without complete-behaviour §15 oracles.
- **Business reasoning:** Task records must distinguish merged wording/schema decisions from unproven runtime behaviour. This prevents reviewers and judges from treating green CI or a schema-only patch as acceptance of the real safety path.
- **Changed:** Corrected the P3.K3 status note, recorded the merged PR #70 A5 wording correction, recorded the current PR #51 schema facts and open service/acceptance gaps, and updated Khutso's status timestamp.
- **Evidence:** No checklist row was ticked. No implementation branch owned by another contributor was rewritten. The P3.K3 trace still records its seventeen complete-behaviour gaps and pending acceptance.
- **Decision:** Keep P3.K3 and P3.K5 open pending final-head review disposition, runtime/oracle evidence and reviewer acceptance.
- **Needs/blockers:** Sibusiso review is required for these documentation corrections. PR #51 still needs re-scoping and fresh Khutso/Ipeleng review; PRs #73, #77 and #78 retain their independent safety/evidence blockers.
- **Business handoff:** Reviewers can use the checklist and trace to separate contract/schema facts from service acceptance; no production claim is made.
- **Next:** Run repository checks, critique the diff, then submit this documentation reconciliation for review without merging.
