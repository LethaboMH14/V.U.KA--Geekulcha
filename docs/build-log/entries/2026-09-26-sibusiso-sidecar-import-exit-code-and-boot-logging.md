## 2026-09-26 | Sibusiso, with Claude Code assistant | Bug fix | Sidecar exits "not submitted" when its dependencies are missing; startup.sh logs every Node/sidecar step | PROPOSED

**Research** — A follow-up to `2026-09-26-sibusiso-anchor-not-submitted-classification.md`, gap 2. `anchor/hedera-sidecar/cli.mjs` imported `./publish.mjs` (which needs the Hedera SDK from `node_modules`) at the top level. While the background `npm ci` hasn't finished on Azure, that import fails before `main().catch(...)` exists. Node then exits with its own code 1, which `anchor/publish.py` has to read as "maybe submitted", and `server/anchoring.py` never resubmits that, so the batch is parked for good.

Separately, none of the App Service boots since the Node install logged anything from the sidecar step, success or failure. There was no way to tell from the log where the background job got to. The 10:40 UTC install was also killed by Azure's startup probe while running, so a half-extracted Node under `/home/vuka` is plausible: `bin/node` present, npm incomplete.

**Real data / references** — App Service boot logs for 10:40, 10:56 and 11:33 UTC (`az webapp log download`). Node's module loader reports `ERR_MODULE_NOT_FOUND` for both a missing file and a missing package.

**Business reasoning** — Anchoring on Azure is the last step before Lethabo moves the phones off the laptop tunnel. Without logs, every failure is a guess.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **`cli.mjs`:** imports `./publish.mjs` dynamically inside `main()`. An import failure reaches the existing handler with nothing submitted, so it exits 2 and reports `dependencies not installed (run npm ci)`. Only the error *code* is used to pick the message, never the SDK's own exception, which may carry credentials.
- **`startup.sh`:** each step of the background job logs a `vuka:` line: start, node already installed, installing, installed, download/checksum failed, extract failed, sidecar deps present, installing sidecar deps, sidecar ready, sidecar install failed, and "no antenv" on non-Azure runs. A `.vuka-install-complete` marker is written only after extraction succeeds; a Node directory without it is wiped and reinstalled.

Evidence (FACT):
- **`anchor/hedera-sidecar/cli.test.mjs` (new):** runs `cli.mjs` alone in a temp directory (no `publish.mjs`, no `node_modules`) and requires exit code 2 plus the "dependencies not installed" message. Mutation-tested: with the old top-level import it exits 1 and fails. All 7 sidecar tests pass.
- **`startup.sh`, local runs (Windows, fake `antenv`):** (a) a complete cached install plus stub node/npm logs "already installed", then "installing sidecar dependencies", then "sidecar ready"; (b) a re-run logs "sidecar dependencies already present"; (c) removing the marker logs "installing pinned Node", replaces the stub with the real Linux binary (ELF header checked), writes the marker, then logs the sidecar step. The Linux `npm` can't run on Windows, so that step's failure message is expected there and proves the failure path logs too.

Decision: None accepted.

Needs/blockers: this must be read on the real container. Redeploy, then grep the App Service log for `vuka:`. The stuck `anchor_batches` row from the 10:03 UTC smoke test still needs Sibusiso's manual reset, after the log shows "sidecar ready".

Business handoff: Not applicable.

Next: redeploy; read the `vuka:` lines; reset the stuck row; confirm a real `0x01` root on the mirror.
