## 2026-09-23 | Codex assistant at Vukosi's request | Codex / GPT-6 (variant unavailable) | P3.V2 / P2a | PROPOSED, local tests pass; live checks not run

**Research** — Read `docs/MASTER-CONTEXT.md`, `AGENTS.md`, `RULES.md`, `team/vukosi.md`, the uncommitted P2a TASK.md read-only in the workflow checkout, `docs/VUKA-2-SPEC.md`, `docs/MODEL-LICENCES.md` M1, `docs/EVIDENCE.md` and operating/security instructions. Checked the supplied BASE_SHA and existing repo checks. Criterion T/S: exact-model provenance and label mapping matter to whether a real user could trust the detector; this is no accuracy claim.

**Real data / references** — M1 register sha256 `10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de` is an existing documented value, not independently measured here. Unit inputs are `sim_` synthetic. Real model digest, size, class-map digest/commit and input tensor are not measured.

**Business reasoning** — A reproducible provenance gate lowers the risk of pitching or shipping a detector with the wrong model or mislabeled classes; no commercial outcome is measured.

**Competitor reference** — Not applicable; host-side model provenance work only.

Changed: `scripts/fetch_models.py` verifies the M1 digest before installing a caller-supplied model, resolves six classes by exact name, and exposes interpreter-shape and basis-point checks. `scripts/tests/test_fetch_models.py` covers U1–U19 offline. `docs/workflows/vukosi/p2a-yamnet-provenance/IMPLEMENTATION.md` records evidence and limitations; one running-log line in `team/vukosi.md` declares scope. No event, audio, Android or production access change.

Evidence: Initial offline unittest failed red (`ModuleNotFoundError`); after implementation, 16 methods covering U1–U19 passed. `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `node --test "test/**/*.test.mjs"` (10/10), `git check-ignore` and Gitleaks passed. R2 failed because the base already tracks `research/results/anchor-scale-scenarios.csv`. L1–L3 NOT RUN; see IMPLEMENTATION.md for commands and outputs. No real model test or measurement.

Decision: No new human decision or approval claimed. Source selection and interpreter installation remain with Vukosi; reviewer approval pending.

Needs/blockers: Vukosi to designate/authorise the model source and approve any `ai_edge_litert` installation; Lethabo/reviewer to evaluate inherited R2 and this local commit. No authorisation inferred from the predecessor path.

Business handoff: Not applicable; host tooling only, no changed capability offered to a user.

Next: Vukosi, resolve source and install decision for L1–L3; proposed 2026-09-24 per the issued work-order date, not a new commitment. Review before merge.
