## 2026-09-24 | Codex assistant for Sibusiso | PostgreSQL-backed CI gate | PENDING CI

**Research** — PR #51 at `fc5fed4` passed all GitHub checks, but the `tests` job had no `VUKA_TEST_DATABASE_URL`; its two real PostgreSQL tests therefore skipped. Those tests cover row-locked chain appends, encrypted private payloads and the outbox lease/retry path. GitHub Actions supports a PostgreSQL service on a Linux runner with a mapped localhost port and health check (GitHub Docs, "Creating PostgreSQL service containers"). The official PostgreSQL image supports `POSTGRES_HOST_AUTH_METHOD=trust` for an ephemeral test-only service without a committed password.

**Real data / references** — The local PostgreSQL 17 run passed 131 Python tests with no skip. PR #51's `fc5fed4` checks all passed, but that CI result did not exercise the database tests. The new service uses synthetic `sim_` fixtures only and has no production data or credentials.

**Business reasoning** — A green PR that skips the actual transaction and encryption paths is weak evidence for P3.A3. Running the real database in CI makes future regressions visible before a security review or deployment decision.

**Competitor reference** — Not applicable.

**Changed** — `.github/workflows/checks.yml` adds an ephemeral PostgreSQL 17 service to the existing `tests` job and sets only `VUKA_TEST_DATABASE_URL` for that job. `team/sibusiso.md` now records the pushed-but-unmerged state.

**Evidence — commands and actual output:**
```
python -c "import yaml; d=yaml.safe_load(open('.github/workflows/checks.yml',encoding='utf-8')); print('postgres_service', d['jobs']['tests']['services']['postgres']['image']); print('test_url_set', bool(d['jobs']['tests']['env']['VUKA_TEST_DATABASE_URL']))"
postgres_service postgres:17
test_url_set True

git diff --check
exit 0

$env:VUKA_TEST_DATABASE_URL = 'postgresql://vuka_test@127.0.0.1:55433/postgres'
python -m pytest anchor/tests server/tests -q -rs
131 passed in 15.25s
```

**Decision** — Require the PostgreSQL integration tests in the normal PR tests job. This does not approve P3.A3 or a deployment.

**Needs / blockers** — The new GitHub job must run after push; no CI success is claimed in this entry. Both-lead/security review and accepted per-kind payload contracts remain necessary. The temporary trust-auth CI database must remain isolated to the ephemeral runner and synthetic fixtures.

**Business handoff** — Reviewers should check the job log for the actual PostgreSQL test count and no skipped database tests before treating CI as evidence.

**Next** — Push, inspect the new CI job, fix any database test failure, then retain the gate for later escalation and batch work.
