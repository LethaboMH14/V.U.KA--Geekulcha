## 2026-09-27 | Codex assistant acting at Khutso Mothopa's request | VUKA.apk account-verification audit | PROPOSED

**Research** — Read the repository operating documents, Khutso's system-analyst work order, release metadata and notes, current main, native `feature/integrate` @ `f9bdb29`, its account and delivery code, and its mocked provider tests. Compared the native and React Native release assets so this finding targets `VUKA.apk` only. Applied the MASTER-CONTEXT §10 gates: no invented fraud-prevention claim, no “built” assertion from a branch or mocked test, honest cost/provider status, and no personal contact or secret in the record.

**Real data / references** — Khutso reports that no verification code arrives after QR installation. GitHub release asset metadata lists `VUKA.apk` with SHA-256 `21e47b381b3513f0079944dff3eeaa1d101710527023144cd6f89194ab1d804c` (metadata, not a locally hashed APK). At approximately 01:05 UTC, `Invoke-WebRequest -SkipHttpErrorCheck -TimeoutSec 15` gave Azure `GET /healthz` 200, `OPTIONS /v1/account/otp` 404 and `GET /v1/account` 404 (one read per path; no account creation). Source links and the limits of this evidence are in `docs/reviews/KHUTSO-VUKA-ACCOUNT-VERIFICATION-GATE.md`. Competitor data: not applicable.

**Business reasoning** — A QR install followed by an impossible code step destroys trust before the safety app can be used; an honest release gate and tested provider path are prerequisites to any onboarding or adoption claim. Criteria T/U/S.

**Competitor reference** — Not applicable; this is an internal release and account-authority defect, not a competitor comparison.

Changed: added a scoped, evidence-labelled review and acceptance matrix for Sibusiso/Lethabo. No app, server, provider, release, credential, production setting or human status changed.

Evidence: `node scripts/check-docs.mjs` passed (document contracts); `node scripts/check-intake.mjs` passed (intake-record structure, not reviewer authenticity); `git diff --cached --check` passed; `.tools/gitleaks.exe dir --redact --config .gitleaks.toml .` found no leaks. The pinned scanner and hook were installed with `pwsh -File scripts/install-security.ps1`. Physical-phone, inbox and SMS receipts were **not** run. Khutso's report is attributed to him; independent reproduction is not claimed.

Decision: none. The account contract and release communication remain for the named humans.

Needs/blockers: Sibusiso's bounded server/deployment review, Lethabo's release/product decision, Ipeleng's authority/privacy review, and Mutarisi's client/Google UI review. A live provider send and clean-phone acceptance run are still needed.

Business handoff: the review's requested-disposition table is the release/acceptance handoff. No success claim should be made from this PR alone.

Next: Sibusiso reviews first; Lethabo and Ipeleng resolve the release and security decisions; the implementers return with real route and receipt evidence for Khutso to audit.
