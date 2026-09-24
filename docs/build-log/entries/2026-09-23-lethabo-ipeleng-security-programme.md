## 2026-09-23 | Lethabo (co-lead), via her coding assistant | P3.S3, P3.S5 — security programme for Ipeleng | PROPOSED — for Ipeleng to accept and own; Lethabo reviews

**Research** — Read `docs/VUKA-2-SPEC.md` (all, including tests T01–T24), ADR-0034 to ADR-0038, `docs/ADR-ACCEPTANCE-RECORD.md`, `docs/STAGED-DURESS-DEFENCE.md`, `docs/MASTER-CONTEXT.md`, `RULES.md`, `AGENTS.md`, `team/ipeleng.md`, `team/START-HERE.md`, `docs/CHECKLIST.md`, `docs/RICA-POSITION.md`, `docs/POPIA-IO-REGISTRATION.md`, `docs/OPEN-GAPS.md`, `SECURITY.md`, `.github/workflows/checks.yml`, `.githooks/pre-commit`, `.gitleaks.toml` and both check scripts, plus Ipeleng's PR #43 review on branch `docs/ipeleng-pr43-review`. Primary or official sources read on 23 Sep: NIST SP 800-218 (PDF text), OWASP MASVS (v2.1.0 release page), OWASP ASVS 5.0.0 (PDF text), OWASP API Security Top 10 2023, the ZAP baseline docs, POPIA ss11, 18, 19, 22 and 72 (Accessible Law copy, ⚑), Cybercrimes Act s1 and s54 (cybercrimesact.co.za, ⚑), the Information Regulator's 7 Apr 2025 portal statement, Android 14 foreground-service types, and Google Play's malware (stalkerware) policy. Not found: a literal MASTG description; POPIA ss10, 14, 20, 21, 23, 24 and the Financial Sector Regulation Act were not fetched — marked NOT FETCHED.

**Real data / references** — `FACT`, checked 23 Sep: product directories hold only READMEs and `.gitkeep`; `node --test` passes 10/10 locally but `checks.yml` does not run it; `gh api …/branches/main/protection` returns 403 (repository private, free tier; G17); semgrep 1.164.0 is installed locally, and bandit, detekt, eslint and Docker are not. No scanner was run on product code, because none exists.

**Business reasoning** — A bank or insurer partner will ask for a secure lifecycle and a threat model before integrating the risk signal; a checkable one, with honest statuses, is what lets a judge answer "are you buying?" on criterion S.

**Competitor reference** — Not applicable.

Changed: new files only.
- `docs/security/SSDLC.md` — roles and RACI for all seven, gates mapped to spec §14, per-stack coding rules, supply chain, secrets, SAST/DAST/mobile commands, release gates RG1–RG3, incident response and POPIA breach runbook, change control, PR #43 conditions B1–B3 and S1–S4 as tracked rows, and the Sonke evidence table. 79 controls: 14 Done, 30 In build, 31 Planned, 4 Not doing.
- `docs/security/THREAT-MODEL.md` — STRIDE per component and trust boundary, 10 coercion threats, OWASP API Top 10 mapping, new tests T30–T49.
- `docs/security/PENTEST-PLAN.md` — scope, rules of engagement, 64 internal test cases with pass criteria and owners, Fri–Sat schedule; states that it is not an independent test (G8).
- `docs/security/COMPLIANCE-GOVERNANCE.md` — POPIA obligations to controls, RICA, Cybercrimes Act s54 (does not apply today, three reasons), the Regulator portal, Play policy, governance controls, seven counsel questions.
These supersede the paths `docs/SSDLC-GKHACK26.md` and `docs/THREAT-MODEL-VIGIL-ANCHOR.md` named in `team/ipeleng.md`.

Evidence: `node scripts/check-docs.mjs` passed; `node scripts/check-intake.mjs` passed; `node --test "test/**/*.test.mjs"`: 10 passed, 0 failed. Counts computed with `grep` over the new files. No security scanner was run: there is no product code yet.

Decision: none. The largest gap found — export during an open incident can show `duress_pin` to a coercer holding the phone (THREAT-MODEL TM-C9, test T30) — needs a spec change and both leads.

Needs/blockers: Ipeleng accepts or amends the programme; Lethabo and Sibusiso decide the export rule (T30) and the wrong-PIN rule (T47) at the Thu §8/§9 meeting; Sibusiso adds `node --test` to CI; the leads designate the Information Officer (D-IO-1).

Business handoff: not applicable yet — the SSDLC summary goes to Babatunde's deck after Ipeleng accepts it.

Next: Ipeleng — test specifications for T04–T24 and T30–T49 by Thu 24 Sep 20:00; SSDLC to Sonke by Sat 26 Sep 12:30 (internal 11:00).
