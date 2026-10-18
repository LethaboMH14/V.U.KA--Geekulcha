## 2026-09-27 | Lethabo (co-lead), via Claude Code assistant | Account service (sign-up codes) ported onto the branch Azure runs | PROPOSED — for Sibusiso to deploy

**Research** — The native app's sign-up asks `POST /v1/account/otp` for an email code. Azure answered 404 at 02:50 SAST on 27 Sep: the account service (`server/accounts.py`, `server/notify.py`, Mutarisi, `feature/integrate` @ f9bdb29) was never on `feat/lethabo-guardian-delivery`, the branch Azure deploys. Deploying `feature/integrate` whole would roll back Sibusiso's 26 Sep fixes (worker isolation, key rotation, `shared/` packaging, export heads).

**Real data / references** — `server/notify.py` sends email through Brevo's HTTPS API when `VUKA_BREVO_API_KEY` and `VUKA_EMAIL_FROM` are set (SMTP and Twilio optional); with nothing set the API answers 503 `delivery_unavailable`, and the app says so.

**Business reasoning** — Sign-up is the first thing a judge or pilot user does; today it cannot finish on the live server.

**Competitor reference** — Not applicable.

Changed: `server/accounts.py`, `server/notify.py`, `server/tests/test_accounts.py`, `server/tests/test_notify.py` taken unchanged from `feature/integrate`; `server/main.py` registers the account routes (3 lines, as on `feature/integrate`); `server/db.py` adds the accounts schema to initialisation. Nothing else from `feature/integrate` (the advisory-lock key stays 864205).

Evidence: `VUKA_TEST_DATABASE_URL=… python -m pytest -q server/tests` → 175 passed, 2 failed. `test_outbox_postgres` fails the same way on the unchanged branch (known, environmental). `test_the_scheduler_isolates_a_subject_it_cannot_sign_for` passes alone (twice); in the full run it lost the scheduler advisory lock to the local demo workers running on the same database.

Decision: none. Mutarisi's account API is PROPOSED (its storage of email, phone and names needs Ipeleng's POPIA review).

Needs/blockers: Sibusiso merges and deploys; someone with Azure access sets `VUKA_BREVO_API_KEY` and `VUKA_EMAIL_FROM` (a Brevo account and verified sender). Until then Azure answers 503 `delivery_unavailable` instead of 404.

Business handoff: not applicable — no pricing change.

Next: deploy, set the two settings, sign up on a phone, confirm the email arrives.
