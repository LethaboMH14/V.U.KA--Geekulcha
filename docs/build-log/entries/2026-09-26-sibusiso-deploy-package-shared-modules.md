## 2026-09-26 | Sibusiso, with Claude Code assistant | Bug fix | The deploy package never shipped shared/, so the Hedera sidecar could not run on Azure | PROPOSED

**Research** — After the stuck anchor batch was finally reset (19:14 UTC, over a temporary single-IP firewall rule, removed straight after), the new logging showed exactly why no root had ever landed on Azure:

```
WARNING:root:vuka: hedera sidecar exit 2: dependencies not installed (run npm ci)
vuka: anchor status retry_pending
```

It repeated once a minute, although the same boot had logged `vuka: sidecar ready` (`npm ci` had succeeded). `anchor/hedera-sidecar/publish.mjs` imports `../../shared/keys.js`, which imports `canonical.js` and `merkle.js`. `scripts/build-deploy-package.py` never included `shared/` at all. Node raises `ERR_MODULE_NOT_FOUND` for a missing source file exactly as for a missing npm package, and `reason.mjs` (earlier today) mapped both to "dependencies not installed". So the sidecar has been unable to start a single submission on Azure since the first deploy. A full local checkout always has `shared/`, which is why every local run and the manual manifest publications worked.

The new behaviour also proved itself here. Before today's `cli.mjs` fix, this failure exited 1 (read as "maybe submitted") and parked the batch permanently; it now exits 2 and is retried every 60 s.

**Real data / references** — App Service `default_docker.log`, 19:14–19:17 UTC. The deploy zip's file list (no `shared/` entries).

**Business reasoning** — The public ledger's "live-verified" state depends on a real root reaching Hedera from Azure.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **Packager.** It now ships `shared/`'s top-level `.js` modules and `shared/package.json` (`"type": "module"`, without which Node would load them as CommonJS). It never ships `shared/test/`, `shared/scripts/` or `vitest.config.js`. `shared/keys.js`, `canonical.js`, `merkle.js` and `package.json` are required members.
- **Error message.** `reason.mjs` now names what is missing: `dependency not installed: <package>` or `sidecar file missing: <file name>`, with only the file name and never a full path.

Evidence (FACT):
- **Packaging test.** `scripts/tests/test_build_deploy_package.py::test_every_file_the_hedera_sidecar_imports_is_packaged` follows every relative import from `cli.mjs` recursively across the real repository files (static, dynamic and `new URL(...)`) and requires every file reached to be packaged. It found `shared/keys.js`, `canonical.js`, `merkle.js` and `package.json`. Removing the `shared/` rule was confirmed to fail it.
- **Sidecar tests (12/12).** A new one checks a missing source file is reported as such and names only the file.
- **Runtime proof.** The package built from the commit, extracted to a clean folder, runs the sidecar's `--sim-stub` path (which loads `publish.mjs` → `shared/keys.js` without the SDK). The result is recorded in the commit.

Decision: None accepted.

Needs/blockers: none new. After deploy, the retrying batch should submit on its next attempt.

Business handoff: Not applicable.

Next: deploy; confirm the first real `0x01` root on the mirror and `/v1/anchor/latest` 200.
