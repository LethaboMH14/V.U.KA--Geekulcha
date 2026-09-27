## 2026-09-26 | Sibusiso, with Claude Code assistant | Fix | deploy package missing anchor.* imports and payload schemas | before first live deploy

**Research** — Preparing the first real Azure deploy, checked what the package builder actually bundles against what the server imports today. `should_package()` still matched the original three-route scope (`anchor/canonical.py` only); the server now also imports `anchor.merkle`, `anchor.payloads`, `anchor.pin_authority`, `anchor.publish`, `anchor.verify` at module load (several are lazy, inside route handlers, so this would have failed on first request, not at boot), and reads `contracts/payloads/*.json` and `contracts/keys/manifest.json` from disk.

**Real data / references** — `grep` of every `from anchor.` import across `server/*.py` (excluding tests); `anchor/payloads.py`'s `_SCHEMA_DIR`; `server/server_signing.py` and `server/anchoring.py`'s manifest/pin-file reads.

**Business reasoning** — A deploy that boots but 500s on the first `/v1/events` call is worse than no deploy: it looks live and isn't.

**Competitor reference** — Not applicable.

Changed: `scripts/build-deploy-package.py` (`should_package` now takes all of `anchor/*.py` except `hedera-sidecar/` and tests, and `contracts/payloads/*.json`; `REQUIRED_MEMBERS` lists the five newly-needed anchor modules and the key manifest so a stale package fails closed instead of silently shipping incomplete).

Evidence (FACT): new test `test_every_anchor_module_and_payload_schema_the_server_imports_is_included` proves a real anchor module and a payload schema are now included, and the sidecar/tests exclusions still hold. `scripts/tests` 5/5, plus 21 server tests spot-checked. `check-docs`, `git diff --check` clean.

Decision: None accepted; packaging-tooling fix, not a product decision.

Needs/blockers: none. Proceeding to build the real deploy package from this commit.

Business handoff: Not applicable.

Next: Azure Part B (this session, `az` CLI).
