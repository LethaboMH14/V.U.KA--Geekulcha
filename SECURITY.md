# Security setup and clean intake

The application intake gate is **blocked** in [docs/security/intake-gate.json](docs/security/intake-gate.json). Account owners must revoke the three exposed credentials, change the reused password and provide redacted issuer evidence. Lethabo must verify removal of the proprietary dataset in old public repositories/history and controlled published copies; a new clean repo does not revoke old access or erase external copies. Both old READMEs need Built/Designed separation. No old repository remote/history may enter this checkout.

Do not paste credentials into a chat, issue, PR or this repository. Evidence references must point to an access-controlled review receipt or a sanitised report, not a secret. Both leads verify evidence and record their actual approvals before marking the JSON approved. A script cannot authenticate a human approval; branch reviews are necessary.

## Local setup

Requires Git and Node.js 20 or newer. On Windows run from the repository:

```powershell
pwsh -File scripts/install-security.ps1
node scripts/check-docs.mjs
node scripts/check-intake.mjs
node scripts/test-security.mjs
.tools/gitleaks.exe dir --redact --config .gitleaks.toml .
.tools/gitleaks.exe git --redact --config .gitleaks.toml --log-opts="--all"
```

Installer pins Gitleaks 8.24.3 and the official release SHA-256; it installs only in ignored `.tools` and sets this clone's `core.hooksPath`. Review version updates deliberately. The pre-commit hook scans **staged content**, redacts findings and refuses to continue when Gitleaks is missing. It also checks staged feature intake. Install in every clone; hooks are not automatically enabled by cloning. Never use `--no-verify` to bypass a failure.

Linux/macOS: install the verified Gitleaks release for your platform, put it on PATH, run `git config --local core.hooksPath .githooks`, ensure the hook is executable and run the same Node checks plus `gitleaks dir` / `gitleaks git`. The CI workflow demonstrates checksum verification for Linux x64.

## CI and GitHub enforcement

`.github/workflows/checks.yml` defines `secret-scan` (full fetched history and worktree) and `document-contracts` (document and intake checks). No secrets are required by these jobs. The checkout action is commit-pinned with read-only permissions and no persisted credential.

The workflow now has an evidenced green remote run: both `secret-scan` and `document-contracts` completed with conclusion `SUCCESS` on PR #2 (checked 12 September 2026, `gh pr view 2 --json statusCheckRollup`). **Branch protection requiring these checks cannot yet be configured** — `gh api repos/.../branches/main/protection` returns `403: Upgrade to GitHub Pro or make this repository public to enable this feature` (checked the same date, repository confirmed private via `gh repo view --json isPrivate` → `true`). This is a real, structural reason the repository must go public before G0 closes, not only the reason already stated in `docs/HANDOVER.md` (§6 — public by 20 September). Until either the repository is public or a Pro plan is applied, passing CI is advisory only: nothing on GitHub currently stops a direct push to `main` or a merge with failing checks. Sibusiso must still inspect the run (now done — see above) and set branch protection **the moment the repository goes public or gains Pro**, requiring both jobs and the nonauthor-approval rule in `RULES.md`. No CODEOWNERS GitHub handles are invented for members whose handles were not supplied. Verify both-lead review manually until protection is enforced. Restrict workflow/config edits to reviewed PRs. Scanning configuration alone is not an enforced remote gate until branch protection requires it.

## Verification and limits

Use an isolated throwaway repository to check: clean staged text passes, a noncredential synthetic fixture matching the test rule fails, a staged secret with a clean unstaged replacement still fails, and absence of the scanner blocks the hook. Exercise feature intake with an application file and blocked gate. Keep synthetic leaks out of this real history.

Gitleaks detects credential patterns; it does not establish absence of proprietary datasets, all possible secrets, malicious code or legal violations. Review provenance and staged diff. Avoid broad allowlists; false positives require narrow reviewed explanations. The intake path/extension check is a guardrail, not a sandbox or proof that arbitrary renamed files are safe.

If exposure is found: stop publishing, notify the account owner through an authorised private route, revoke first, assess affected data, preserve a redacted incident record and follow the production plan's notification review. Do not merely remove the latest line and call the credential safe.
