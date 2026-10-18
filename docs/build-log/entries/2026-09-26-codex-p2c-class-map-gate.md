## 2026-09-26 | Codex assistant | GPT-5 | P3.V2 P2c class-map provenance gate | implemented locally; review pending

This work serves C3 (progress of solution profile). Trust answer: the fetcher rejects a remapped detector class map and refuses installation until exact class-map bytes match a registered digest; no real model/runtime result is claimed.

**Research** — Read the task and repository operating instructions, `scripts/fetch_models.py`, its offline unittest suite, the model licence register, and the P2a/P2b implementation record. Confirmed the existing register is a six-column pipe table and the model parser specifically selects M1 / YAMNet TFLite.

**Real data / references** — **FACT (task/review-specified values, not measured against a live map):** expected indices are Screaming 11, Shout 6, Yell 9, Glass 435, Shatter 437 and Breaking 464. **FACT (local code inspection):** P2b's custom HTTPS opener and scheme/size guards were already present and were not changed. **NOT MEASURED:** no real class map or digest was sourced, and no model/runtime check was run. The new M7 register row is marked PENDING, not an observed hash.

**Business reasoning** — Requiring both a fixed reviewed class mapping and registered bytes lowers the risk of silently attributing the wrong sound class to an alert; it avoids downstream rework and unsupported sensing claims.

**Competitor reference** — Not applicable; this is a local model-provenance gate and makes no competitor comparison.

**Changed:** added fixed detector-index validation, strict separate M7 class-map digest lookup, pre-install SHA-256 comparison and NOT RUN behavior for an absent/invalid digest; added offline tests and a visibly pending class-map row; appended P2c evidence to the implementation record and one Vukosi running-log line.

**Evidence:** test-first run was red (25 methods, 3 failures and 3 errors); after correcting stale test-fixture mutations, strict duplicate-row and PROPOSED-digest red checks failed as expected; the targeted FACT-tag check then passed 1/1 and final `py -3.12 -m unittest discover -s scripts/tests -v` passed 25/25. `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` passed with their human-review caveats; `node --test "test/**/*.test.mjs"` passed 23/23; `C:\Users\khoza\Desktop\Geekulture\.tools\gitleaks.exe dir --redact --config .gitleaks.toml .` scanned ~3.10 MB with no leaks; `git diff --check` exited 0. Diff inspection confirmed the P2b opener/source-reader path is unchanged. Live model/runtime test is NOT RUN; no model, class map, audio, network call or dependency was used.

**Decision:** none. The six expected indices are enforced as the task/review requirement, not independently validated against a real class-map source. No model or source URL selected.

**Needs/blockers:** Vukosi/Khutso to provide a verified class-map source and observed digest for review; until the register is updated through its owner, M7 stays PENDING and installation is NOT RUN. Lethabo owns the model licence register; approval/review is pending.

**Business handoff:** `docs/workflows/vukosi/p2a-yamnet-provenance/IMPLEMENTATION.md`, P2c section.

**Next:** owner/reviewer to validate the specified indices against an authorised class-map source and record its digest; only then can the live model/runtime check be considered.
