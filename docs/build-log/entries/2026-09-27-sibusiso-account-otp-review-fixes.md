## 2026-09-27 | Sibusiso, with Claude Code assistant | Bug fix | The four #116 account-code risks fixed before the account service goes on Azure | PROPOSED

**Research** — Khutso's #116 review of `VUKA.apk` sign-up found four code risks in the account service (from `feature/integrate`). #115 ports that service to the deploy branch unchanged, so all four were confirmed in #115's code:
1. `notify.send_code()` ran before `INSERT INTO account_otps`, inside the open transaction.
2. The rate limit counted per subject only, and without a lock. Azure runs `VUKA_SIM_ONLY=1`, where anyone can register a fresh `sim_` subject and get a new allowance.
3. `VUKA_DEV_OTP_LOG=1` printed the code and recipient anywhere.
4. The provider's own `message` text was returned to the client.

**Real data / references** — #116 and #115. Azure at 01:35 UTC: `/healthz` 200, `/v1/account/otp` 404. App-setting *names* on Azure: no email or SMS provider is configured yet.

**Business reasoning** — Sign-up codes must work for the demo, but not by lending our sender to anyone who wants to flood an inbox. A code that arrives must always verify.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **Stored before sent.** A code is committed before the provider call, and no transaction is held open during that call. If the send fails as "unavailable", the row is deleted, since nothing went out. If it fails as "failed", the row is marked consumed: it may have gone out, so it still counts against the limits, but it can never verify.
- **Recipient and global caps.** On top of 5 per subject, there are now 3 codes per recipient per 15 minutes (whichever subject asks, via an HMAC lookup) and 100 per hour server-wide. A new advisory lock, `OTP_ISSUE_LOCK` 864206, serialises the counts so concurrent requests cannot all pass them.
- **Dev log refused on Azure.** `VUKA_DEV_OTP_LOG` is ignored on Azure App Service (`WEBSITE_SITE_NAME` set). It raises "unavailable" and logs no code or recipient.
- **No provider text.** `DeliveryFailed` carries a fixed phrase plus the HTTP status only. The API returns a fixed message and logs that phrase.

Evidence (FACT):
- **New tests** in `server/tests/test_accounts.py`, `test_notify.py` and `test_advisory_locks.py`:
  - a code is committed before the send (checked from a separate connection);
  - the per-recipient cap holds across subjects;
  - the server-wide cap;
  - a failed send never verifies and still counts;
  - no provider text or status in the response;
  - no code is left behind without a provider;
  - the dev log is refused on App Service;
  - all lock keys are distinct.
- **Mutation check.** Run against #115's original code, 6 of those tests fail. All pass with the fixes.

Decision: None accepted.

Needs/blockers: real delivery still needs `VUKA_BREVO_API_KEY` and `VUKA_EMAIL_FROM` (a Brevo-verified sender) set as Azure app settings by someone with the key, never in the repo or chat. Until then the API answers 503 `delivery_unavailable`, not 404. The account contract and POPIA notice still need Lethabo and Ipeleng.

Business handoff: after the settings are set, run one real code to a consenting team inbox and record the receipt (Khutso's acceptance matrix in #116).

Next: merge #115 into the deploy branch, deploy, confirm the routes answer on Azure.
