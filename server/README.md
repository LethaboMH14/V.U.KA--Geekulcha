# server/ — ANCHOR server

A FastAPI + PostgreSQL service providing:
- signed-request auth (device and guardian keys, §7);
- per-subject signed hash chain appends, encrypted payload storage;
- PIN-authority-gated actions (end journey, export, delete, add/remove guardian);
- a durable, server-owned escalation state machine with a transactional outbox
  (`server/escalation.py`, `server/incidents.py`, `server/contact.py`);
- guardian invite/accept/decoy/removal (`server/guardians.py`) and delivery
  (SIMULATED by default; a real FCM adapter exists but is not wired in here);
- Merkle batching and Hedera anchoring (`server/anchoring.py`), plus public
  proof/manifest reads;
- the subject export, with the ADR-0041 pre-incident hold;
- two live streams (`/ws/panel` public, `/ws/member` authenticated).

It is specified in `docs/VUKA-2-SPEC.md`. Everything not explicitly stated in
the spec is flagged `PROPOSED` in the code and in `docs/adr.md` — check there
before assuming a behaviour is final.

**Status (26 Sep 2026):** 17 of 30 declared contract routes implemented and
tested against real PostgreSQL. Live on Azure at
`https://vuka-anchor-server.azurewebsites.net`. `x-vuka-implemented` in
`contracts/openapi.yaml` is the source of truth for exactly which routes are
real; `test/openapi-contract.test.mjs` fails CI if the flags and the actual
registered routes ever disagree. The four-layer server scaffold and the
UMOJA human-gate module are archived in `archive/2026-09-four-layer/server/`.

## Run it locally

You need Python 3.13, a local PostgreSQL instance, and `sim_bank` running
separately if you want to exercise the S1 bank-signal path end to end
(`sim_bank/main.py` — see its own module docstring; it's a second small
FastAPI service, not part of this one).

```bash
python -m venv .venv
source .venv/bin/activate            # .venv\Scripts\activate on Windows
pip install -r requirements.txt      # repo-root requirements.txt; pulls in server/requirements.txt

cp .env.example .env
# edit .env: set DATABASE_URL to a real local PostgreSQL, and generate
# VUKA_PAYLOAD_KEY_B64 with the one-liner in .env.example
set -a; source .env; set +a          # or export each var yourself
```

**Two or three processes, not one.** The API server and the background
worker are separate; sim_bank is a third only if you want a real bank-signal
delivery (S1) rather than just the API and worker running alone:

```bash
# Terminal 1 — the API
uvicorn server.main:app --reload

# Terminal 2 — escalation deadlines, contact_lost, guardian alert delivery,
# bank_signal delivery to sim_bank, and one Hedera anchor-batch tick per
# second. This is the ONE process that drives every background effect;
# nothing else runs any of them.
python -m server.run_workers

# Terminal 3 — sim_bank, only needed if you want a duress/no_answer/
# contact_lost incident to actually reach a bank and get a hold_ref back
uvicorn sim_bank.main:app --port 8001
```

If you only run terminal 1, `/healthz` will look fine and events will append
correctly, but **no guardian alert, escalation timeout, bank signal, or
anchor batch will ever fire** — `run_workers.py` is what actually drives the
outbox and the deadline scheduler. This is the single most common "why isn't
anything happening" surprise when running this locally. If you skip terminal
3, bank_signal rows just fail to connect and retry every second (correct
at-least-once behaviour, not a crash) until sim_bank is up.

Hedera anchoring in terminal 2 runs unconditionally, but stays honest about
what it can prove: with no `HEDERA_OPERATOR_ID`/`HEDERA_OPERATOR_KEY`/
`HEDERA_SUBMIT_KEY` configured (see `.env.example`) and `anchor/hedera-sidecar`'s
`npm ci` not run, batches are created from real chain heads but never
confirm, so `/v1/anchor/latest` keeps returning 404 — that's the same "not
built yet" state this file described before, now narrowed to exactly "needs
real testnet credentials," not "needs a worker." Configure those three
variables and run `npm ci --ignore-scripts` in `anchor/hedera-sidecar` (see
its own README) to anchor for real.

The schema is created automatically on first connect
(`PostgresDatabase.initialize()`); there is no separate migration step.

### A note for anyone deploying this to Azure App Service

A **custom startup command** (`bash startup.sh`) is *not* run through Oryx's
own venv-activation wrapper — only Oryx's own generated default startup
command gets that. Bare `python` in a custom startup script resolves to the
system interpreter, which has none of `requirements.txt` installed, and the
container exits immediately with no application log output at all (exit
code 3). `startup.sh` already works around this by preferring
`antenv/bin/python` when it exists; if you ever rewrite `startup.sh`, keep
that check or reintroduce this exact failure.

## Running the real test suite

```bash
# needs VUKA_TEST_DATABASE_URL pointed at a real (throwaway) PostgreSQL database
pytest anchor/tests server/tests scripts/tests sim_bank/tests
node --test "test/**/*.test.mjs"
cd shared && npm test
```

Nothing here is mocked at the database layer — every test that touches
storage runs against a real PostgreSQL instance. `server/tests/sim_postgres.py`
creates an isolated schema per test and drops it afterward.

## Connecting a dashboard

See `docs/DASHBOARD-INTEGRATION.md`. Short version: `/v1/anchor/latest`,
`/v1/anchor/proof/{head}`, and `/ws/panel` are the public, no-auth surface
built for this. Everything else needs a signed request and is not meant for
a generic browser dashboard.

## What is real vs. simulated

- **Real:** the signed hash chain, encryption at rest, PIN-authority gating,
  the escalation state machine, Merkle batching, all schema validation, and
  (since 26 Sep) all three outbox effects — guardian alerts, bank signals,
  and anchor batches — driven by the single `run_workers.py` process above.
- **Simulated, by design:** `sim_bank` (a standalone process, in-memory
  holds — a restart forgets them); guardian FCM delivery (an adapter exists
  in `server/src/notify/`, but `run_workers.py` uses the SIMULATED notifier);
  Hedera anchoring only confirms against real testnet, never mainnet, and
  needs real operator/submit keys to confirm at all (see above).
- **Not built yet:** real FCM wiring end to end (the SIMULATED notifier is
  what actually runs); anything that starts `run_workers.py` or `sim_bank`
  on the live Azure deployment — today Azure only runs the API
  (`startup.sh`), so a duress incident hit against
  `https://vuka-anchor-server.azurewebsites.net` will sit in the outbox
  until someone runs `run_workers.py` pointed at the same `DATABASE_URL`,
  locally or otherwise.

Do not present this as a finished, production-ready service to anyone
outside the team without reading the `PROPOSED` flags first.
