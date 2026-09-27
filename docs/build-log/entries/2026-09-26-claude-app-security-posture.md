## 2026-09-26 | Claude Code assistant (at Vukosi's request) | claude-sonnet-5 | SSDLC §10 mobile review, criterion S | status: PROPOSED (review complete, findings unconfirmed by owners)

**Research** — Read the VIGIL app source on PR #88 at head `83bc2480ebacb90173d0106312a1d98536189a6a`: manifest, `build.gradle`, both network configs, backup rules, `SignerModule.kt`, `PinModule.kt`, `QueueModule.kt`, `app/src/api/device.ts`, `events.ts`, `screens.tsx`; the repo's `docs/security/SSDLC.md` and `THREAT-MODEL.md`; ran `npm audit` from the lockfile; checked the installed 0.0.8 build on two test phones (size, sha256 against the published asset, debuggable flag, permissions, notification title). No dynamic testing, traffic capture, MobSF, DAST or server test was done.

**Real data / references** — Every finding is tagged with the file and line it was read from in `docs/reviews/VUKOSI-APP-SECURITY-POSTURE-2026-09-26.md`. `npm audit`: one high advisory (`image-size`, via Metro, already waiver SCA-W1, expires 2026-10-31). OWASP MASVS categories and Mobile Top 10 names are used for mapping; MITRE ATT&CK for Mobile technique names are for orientation and their identifiers must be verified before submission. Severity is the assistant's judgement, not a scored CVSS.

**Business reasoning** — A judge and a real member both ask whether the app can be trusted in a dangerous moment; naming the server-redirect and PIN-guess weaknesses now, with cheap fixes, lowers the risk of a live-demo or review failure and answers the security criterion with evidence instead of claims.

**Competitor reference** — Not applicable.

Changed: added `docs/reviews/VUKOSI-APP-SECURITY-POSTURE-2026-09-26.md` and this entry. No code, contract or configuration changed.

Evidence: static reading only (Section 1 of the review lists what was and was not done). The document lists 10 findings (2 High or High to Medium, 4 Medium, 3 Low, 1 Info), a MASVS scorecard, eight quick wins and a TTP table.

Decision: none. No approval is recorded or implied. The findings are for Lethabo (app owner), Ipeleng (security) and the leads to confirm.

Needs/blockers: Lethabo and Ipeleng to confirm or dispute APP-V1 to APP-V9 and decide on APP-V5 (neutral notification, `FLAG_SECURE`) and the always-on privacy review; Vukosi to run the T17h capture.

Business handoff: not applicable.

Next: Ipeleng adds APP-V1 and APP-V2 to `THREAT-MODEL.md` with tests; Lethabo triages the quick wins; re-run this review at the release candidate.
