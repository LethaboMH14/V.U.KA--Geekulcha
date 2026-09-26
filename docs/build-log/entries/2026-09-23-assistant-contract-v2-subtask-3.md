## 2026-09-23 | Codex assistant (GPT-6) | Sub-task 3 — contract v2 schema | drafted and committed locally

**Research** — Read the workflow README and contract-v2 packet, including Sub-task 3's out-of-scope list; repository AGENTS.md and RULES.md; VUKA-2-SPEC.md §§4–10, 12–15; the current OpenAPI v1 file and both contract tests; the PIN-authority builder; and the current ADR acceptance record. Kept the implementation to contract shapes and static tests. Did not add endpoint handlers, signature verification, PIN verification or a mock server.

**Real data / references** — The repository contains 13 existing path keys and 11 named v1 schema components listed in the packet. `docs/ADR-ACCEPTANCE-RECORD.md` still marks Ipeleng's security review pending, despite the local packet's statement that it was approved; this contract must not be described as frozen until the repository record is updated by the authorized reviewer(s).

**Business reasoning** — A retained, reviewable v2 contract gives the phone, server and verification-page owners a shared interface to build against while making the approval state and unresolved manifest serialization explicit.

**Competitor reference** — Not applicable; this is the VIGIL + ANCHOR interface contract.

Changed: OpenAPI info version is 2.0.0; all existing v1 path keys and named schema components remain. The eight specified UMOJA operations are marked deprecated. Added the §12 VIGIL/ANCHOR path surface and the requested v2 schemas, including action-scoped `PinAuthorisation` and `BankSignal.triggering_outcome`. The subject deletion route uses `SubjectDeletionRequest`; the old `DeletionRequest` component remains unchanged for operator deletion. Added `contracts/keys/README.md` documenting the public-key manifest fields and exact 33-byte `0x02` message without real key material. The exact manifest bytes to hash remain unspecified in §10 and are explicitly called out rather than guessed.

Evidence:
- `node --test` — exit 0; **18 tests passed, 0 failed** (includes the security hook integration test and contract tests).
- `node --test test/openapi-contract.test.mjs test/events-contract.test.mjs` — exit 0; **17 tests passed, 0 failed**.
- `node scripts/check-docs.mjs` — exit 0: `Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.`
- `git diff --check` — exit 0; Git emitted only its line-ending advisory for `contracts/openapi.yaml` (LF will be replaced by CRLF on a future checkout).
- Python/PyYAML parse and preservation check — `paths: 33`, `schemas: 25`; `all old path keys retained: True`; `all old schema components unchanged: True`; original/new path counts `13 33`; original/new schema counts `17 25`.

Decision: no ADR accepted. OpenAPI v2 is a draft contract, not frozen; the ADR acceptance record still requires Ipeleng's recorded security review.

Needs/blockers: Ipeleng to record the contract review; both leads to complete the required final review before the v2 surface is called frozen. The team must pin exact key-manifest serialization bytes before publishing any `0x02` fingerprint.

Business handoff: implementers may use the named schemas and paths as the proposed interface after review. No server capability is claimed as built.

Next: Sibusiso to review the contract diff and resolve any API-shape decisions with the relevant owners; no server integration is authorized by this task.
