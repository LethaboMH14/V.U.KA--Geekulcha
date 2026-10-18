## 2026-09-26 | Claude Code assistant (at Vukosi's request) | claude-sonnet-5 | P3.S3 threat-model follow-up, criterion S | status: PROPOSED (rows and tests unaccepted by the owner)

**Research** — Read `docs/security/THREAT-MODEL.md` and `docs/security/TEST-SPECS.md` at `origin/main` `c1d427c`, `scripts/check-threat-map.mjs` (the checker requires a spec reference in the Control or Spec column and a test ID in the Test column for every threat row), and the app source on PR #88 at head `83bc2480ebacb90173d0106312a1d98536189a6a`: `app/src/api/device.ts` (lines 247–251, 271, 412, 540–553 for server discovery; 368, 380, 394 for PIN-gated actions) and `PinModule.kt`. The reasoning behind the two findings is in the security posture review (PR #101, APP-V1 and APP-V2).

**Real data / references** — All app facts are read from code at the pinned head and tagged `FACT` there. Nothing here is a measurement. The proposed delay schedule (30 s, 60 s, 120 s, 15 min cap) and the six-digit minimum are `PROPOSED` values, not calibrated. Test IDs T57 and T58 were the next free IDs on `main` (T56 highest); they must be renumbered if another change takes them first.

**Business reasoning** — The threat model is part of the SSDLC submission judges read; two weaknesses found in the real app were not in it, and adding them with tests shows the security process works on the running product, not only on the spec.

**Competitor reference** — Not applicable.

Changed: `docs/security/THREAT-MODEL.md` (new rows PH-12 and TM-C11, tests T57 and T58 in §6, gaps 6 and 7, a corrected limitation line); `docs/security/TEST-SPECS.md` (specifications T57 and T58, coverage rows, skipped-IDs note); this entry. No code, contract or configuration changed.

Evidence: run results are in the PR description. The rows are `PROPOSED`; the model's header status (`ACCEPTED`, 24 Sep 2026) applies to the earlier content only.

Decision: none. No approval is recorded or implied. Ipeleng (owner of the model) and Lethabo (app owner) must accept, edit or reject the rows and the delay schedule.

Needs/blockers: Ipeleng to review PH-12, TM-C11, T57 and T58 and the delay schedule; Lethabo to decide the signing scheme for `server.json` and whether the PIN limit belongs in the native module; the failed-attempt record kind is a contract-owner decision.

Business handoff: not applicable.

Next: Vukosi writes T57 and T58 once the owners accept the design; re-check the rows against the app at the release candidate.
