## 2026-09-27 | Sibusiso, with Claude Code assistant | Deploy | sim_bank runs on Azure, so bank risk signals are delivered instead of refused | PROPOSED

**Research** — In the team's first full VIGIL end-to-end run on Azure (02:33–02:39 UTC), everything was accepted:
- 7 signed events, a journey, the guardian invite and accept, heartbeats and location pings;
- roots #12–#15 landed on Hedera.

But from 02:37:28 the worker logged `ERROR:root:bank_signal bank:68ab7504-… failed` with `ConnectionRefusedError` every minute. `VUKA_SIM_BANK_URL` is unset on Azure, so the worker sends to its default `http://127.0.0.1:8001`, and nothing listened there: `sim_bank` was never packaged or started.

**Real data / references** — App Service `default_docker.log`, 27 Sep 02:37–02:39 UTC. `server/run_workers.py` `_default_bank_sender`. `scripts/build-deploy-package.py` had no `sim_bank/` rule.

**Business reasoning** — "During duress VUKA tells the bank to hold transfers" is part of the demo story. It must actually reach the (simulated) bank and come back as a signed `bank_signal_sent` entry with a `hold_ref`, not fail silently.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **Packager.** It ships `sim_bank/*.py`, never `sim_bank/tests/`. `sim_bank/__init__.py` and `main.py` are required members.
- **Startup.** `startup.sh` runs `sim_bank.main:app` on `127.0.0.1:8001`, in the background, before the workers.
  - It is loopback only, so it can't be reached from outside the container.
  - It is skipped with `VUKA_SKIP_SIM_BANK=1`, or when `VUKA_SIM_BANK_URL` points elsewhere.
- **Still simulated.** `sim_bank` stays SIMULATED: every receipt says `sim: true`, it verifies ANCHOR's Ed25519 signature against the pinned manifest key, and its holds live in memory, so a restart forgets them.

Evidence (FACT):
- **Test.** `scripts/tests/test_build_deploy_package.py::test_sim_bank_is_packaged_and_started_where_the_worker_sends` checks two things: the modules are packaged and the tests are not, and `startup.sh` starts it on exactly the host and port `run_workers.py` defaults to.
- **Runtime and suite.** The deploy package itself was booted locally, and the full-suite result is in the commit.

Decision: None accepted.

Needs/blockers: none.

Business handoff: after deploy, the pending 02:37 bank signal should be delivered on its next retry, and the member's record gains a server-signed `bank_signal_sent` entry.

Next: deploy; confirm `POST /sim_bank/v1/risk-signal` 200 in the log and that the `bank_signal … failed` errors stop.
