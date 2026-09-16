# 9. Credential and password remediation — independent verification record (WBS 1.1)

**Status: verification record written 16 Sep 2026. The remediation itself is done and forensically verified (see `docs/OPEN-GAPS.md` G6/G7, closed 13 Sep). What this leaf adds is Ipeleng's independent review of the holder confirmations — prepared here, not yet performed by her: the chat confirmations were not accessible from this session environment. The WBS leaf closes when she confirms the §4 review. No credential value was viewed, entered, transcribed or recorded at any point.**

## 1 · What was exposed (redacted form)

Four exposures — not the three originally listed — across both predecessor repositories (`BEACON`, `Team-Sonar---Vuka-`, both made private 13 Sep, `docs/OPEN-GAPS.md` G18):

| # | Credential type | Where it lived (as already published in G6) | Remediation |
|---|---|---|---|
| 1 | WeatherAPI key | `weather_ingestion.py`, both repos | Rotated by holder, 13 Sep |
| 2 | EskomSePush token | `esp_pipeline.py`, both repos (different paths per repo) | Rotated by holder, 13 Sep |
| 3 | A real person's university email and plaintext password | `acled_ingestion.py:6-7`, `Team-Sonar---Vuka-` only | Password changed by holder, 13 Sep |
| 4 | Roboflow API key (previously undocumented) | `vision/.env`, `BEACON` — found only during the verification pass | Rotated by holder, 13 Sep |

This table restates `docs/OPEN-GAPS.md` G6's disclosure level and adds nothing: no values, no account identifiers, no new location detail. `docs/HANDOVER.md` §3 rule 3 (never publish the location of an unrotated credential; do not "helpfully" restore withheld detail) governs this record too.

## 2 · Holder confirmations — the receipts

Per G6: all four credentials were rotated by their account holders on 13 Sep, "confirmed in chat, values never entered or reproduced by this session". Those chat messages are the receipts this leaf's acceptance criterion points at ("redacted issuer receipts reviewed; never values"). **They are not in this repository and were not reachable from the 16 Sep session environment.** No chat export, screenshot or transcript has been committed. Reviewing them is the one remaining action on WBS 1.1, and it must be Ipeleng's, in the chat platform, live.

## 3 · Forensic corroboration (independent of the chat)

The rotation claim does not rest on the chat alone. Recorded 13 Sep (G6) and accepted here as the technical baseline:

- Both predecessor repositories purged on **every branch** via `git filter-repo --replace-text`, force-pushed.
- Independently re-verified against **fresh clones from GitHub**: `gitleaks git --log-opts="--all"` reports zero leaks on both; the GitHub API confirms the redacted placeholders are what is actually live.
- Both repos made private the same day as a stopgap and kept private as the intended final state (G18).
- This repository's own hygiene, checked 16 Sep: `.gitignore` covers `.env` and `.env.*`; the `checks.yml` workflow runs the secret-scan gate on push and pull_request, green on this branch's commits; no secret values committed here.

Corroboration logic: a credential still live in predecessor history could not survive a fresh-clone full-history gitleaks scan plus an API-confirmed redacted tree. What the scan cannot show is whether the *old* credentials were invalidated at the issuer — that is exactly what the holder confirmations add.

## 4 · Reviewer statement and what remains

- Reviewed 16 Sep by Ipeleng's agent (Cline, VS Code session), from the repository record only: G6/G7/G18, `docs/HANDOVER.md` §3/§6/§10, `AGENTS.md` rule 5, `docs/EVIDENCE.md`, `.gitignore`, `.github/workflows/checks.yml`, and this branch's CI results. Sufficient to prepare this verification and unblock `1.4`'s evidence assembly. **Not sufficient to close 1.1** — the criterion requires her eyes on the receipts.
- **Remaining for Ipeleng:** in the team chat, locate the four holder confirmations of 13 Sep and check each states (a) which credential was rotated, (b) that the old credential was invalidated or replaced, (c) the date — with any value, key or password redacted before anything is committed. Then tick the row in `docs/audit/05-team-operating-system.md` and add one running-log line. If a confirmation cannot be produced, G6's closure must be reopened for that credential.
- "Never values" is a standing rule, not a one-off: receipts are reviewed redacted; values are never transcribed into this repo, a ticket, or a message.

## 5 · Downstream

- **1.4 (Khutso, clean-intake gate evidence)** depends on 1.1–1.3: this record gives her the verification pointer now; the §4 confirmation completes the 1.1 input.
- `docs/audit/04-production-readiness.md`'s "blocked by credential/data remediation" opener was swept 16 Sep — remediation closed 13 Sep; that document's other blockers stand.
- `docs/HANDOVER.md` §10.4's publication freeze on `09-VUKA-SSDLC.md` §5: rotation and purge are evidenced, scanning is live — the §4 confirmation completes the condition, but the publication decision stays with the leads, not this record.

## 6 · Provenance and verification log

- **Retrieved 16 Sep 2026, this session:** `docs/OPEN-GAPS.md` G6/G7/G18; `docs/HANDOVER.md` §3/§6/§10; `AGENTS.md` rule 5; `docs/EVIDENCE.md`; `SECURITY.md`; `.gitignore`; `.github/workflows/checks.yml`; `gh pr checks` (secret-scan and document-contracts green on this branch). Sibusiso's 13 Sep verification is cited from the repo record, not re-run — no predecessor repository was cloned, fetched or added as a remote for this verification (HANDOVER rule 1).
- **Not independently verified this session ⚑:** the holder chat confirmations (§2) — inaccessible from this environment; Ipeleng's live review is the standing caveat on this record. No local gitleaks re-run against the predecessor repos.
- **This record is not legal advice** and creates no compliance claim. The honesty ledger (`docs/00-SPEC.md` §5) applies: a remediation someone else verified is not an independent review, and this document keeps the two labelled apart.