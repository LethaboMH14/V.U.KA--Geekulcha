## 2026-09-23 | Codex assistant, acting at Khutso Mothopa's request | Codex / GPT-5 | P3.K1 workflow setup | IN PROGRESS — no evidence row verified

**Research** — Read the post-pivot `docs/MASTER-CONTEXT.md`, `BRIEF.md`, `RULES.md`, `docs/EVIDENCE.md`, `SECURITY.md`, `docs/VUKA-2-SPEC.md`, Khutso's work order, `docs/OVERLAPS.md`, `docs/AGENT-ROUTING.md`, the five newest build-log entries, `docs/SESSION-PROMPT.md` and `team/START-HERE.md`. Inspected Git branch, remote, hook, tool, authentication and `docs/security/intake-gate.json` state before changing workflow metadata.

**Real data / references** — `FACT`: `git pull --ff-only` reported “Already up to date” at `847225e57d7c36e85ca8acb5448629cf81a8e03f`. `FACT`: the repository installer reported Gitleaks 8.24.3 and installed the hook. `FACT`: GitHub CLI 2.101.0 reported an active keyring login for `KhutsoMothopa`. `FACT`: `docs/security/intake-gate.json` says `approved` and `node scripts/check-intake.mjs` passes, while `SECURITY.md` still says `blocked`; this entry does not decide which standing record is stale. No product, market or measurement figure was added or re-verified.

**Business reasoning** — A reproducible evidence-first workflow reduces the risk that an unsupported claim reaches the judges, protecting the credibility needed for a buyer or household to trust VIGIL + ANCHOR.

**Competitor reference** — Not applicable; this change configures repository coordination and evidence governance.

Changed: configured the supplied GitHub repository as `origin`, set `main` to track `origin/main`, installed the pinned secret-scanning hook, installed and authenticated GitHub CLI, created `docs/khutso-p3-k1-evidence-recheck`, bounded P3.K1 in `team/khutso.md`, and registered the shared evidence claim in `docs/OVERLAPS.md`.

Evidence: `node scripts/check-docs.mjs` passed; `node scripts/check-intake.mjs` passed with its human-authenticity caveat; `python scripts/economics_vigil_anchor.py` printed break-even 10,901 at R20; `.tools/gitleaks.exe dir --redact --config .gitleaks.toml .` found no leaks; `.tools/gitleaks.exe git --redact --config .gitleaks.toml --log-opts="--all"` scanned 122 commits and found no leaks; `git diff --check` passed. No source in `docs/EVIDENCE.md` has been marked re-verified, no acceptance checkbox is ticked and no reviewer action is claimed.

Decision: none. This implements the existing work order and repository workflow without changing a contract, ADR, claim value or product capability.

Needs/blockers: P3.K1 has no known setup blocker. Before P3.K4/P3.K5 implementation, Sibusiso and Ipeleng must reconcile `SECURITY.md`'s “blocked” statement with the `approved` intake JSON and passing intake check, then correct the stale standing record. This entry does not manufacture or revoke an approval.

Business handoff: `docs/EVIDENCE.md` remains the evidence ceiling consumed by Babatunde and Lethabo; no new claim is ready for handoff.

Next: Khutso/Codex reopens every source in the 23 September evidence section, records pass/fail/flag evidence row by row, and submits the resulting PR to Sibusiso first.
