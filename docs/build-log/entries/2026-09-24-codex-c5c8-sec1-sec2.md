## 2026-09-24 | Codex assistant, acting at Sibusiso's request | Codex | P3.A1 C5–C8 + SEC-1/SEC-2 | implemented locally, unpushed

**Research** — Read `sibusiso-workflow/tasks/contract-c5c8-sec1-sec2/01-task.md`, `docs/VUKA-2-SPEC.md` §§4, 4a, 7 and 9, `contracts/openapi.yaml`, `anchor/pin_authority.py`, `anchor/tests/test_pin_authority.py`, `test/openapi-contract.test.mjs`, and the latest five dated build-log entries. Rechecked PR #51's live head before editing. The local worktree had one pre-existing unrelated untracked Hedera note; it was left untouched.

**Real data / references** — No production data or security measurement. Contract examples and tests use `sim_` identifiers and synthetic signature bytes. PR #51's accepted task reference is [Sibusiso's C5–C8/SEC-1/SEC-2 comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/51#issuecomment-5814777869); the request-auth and PIN rules come from `docs/VUKA-2-SPEC.md` §§4 and 7–9.

**Business reasoning** — A client can now describe a device-submittable request and distinguish HTTP-request authentication from event signing, reducing the chance of accepting fabricated or ambiguously authorized evidence; the guardian-token contract also excludes subject/device-key updates.

**Competitor reference** — Not applicable; this is an ANCHOR contract/security-boundary change, not a market comparison.

Changed:
- `contracts/openapi.yaml`: added `EventSubmission` with client-supplied fields, payload and a constrained 16-byte base64 salt; applied it to subject registration, event ingest and check-in event paths. Added four required `X-Vuka-*` header schemes and their signed-request statement/order, replaced bearer authentication on subject record/export/deletion with signed-request auth, split `PinAuthorisationStatement` from the server record and exposed the server-derived record on receipts, and removed subject PIN authority from guardian-token updates (guardian signer role required).
- `anchor/pin_authority.py`: separated the six-field device statement from its server record, canonicalizes only `{action, target_id, mode, nonce}`, validates signature/key-id shape, and derives the record expiry from server receipt time. The module still does not verify ECDSA or PINs.
- `anchor/tests/test_pin_authority.py` and `test/openapi-contract.test.mjs`: added tests for signature-scope canonical bytes, server-only expiry, input shapes, transport fields, header requirements and guardian-only token-update contract.
- `team/sibusiso.md`: recorded the active task and shared-file claim.

Evidence (commands and actual results):
- `git pull` → failed: `ssh: connect to host github.com port 22: Permission denied`; this worktree's configured remote uses SSH. `gh pr view 51 --repo LethaboMH14/V.U.KA--Geekulcha --json headRefOid,updatedAt,state` → `{"headRefOid":"95b28ed87afa85e6927ec39b761372611d6b8742","state":"OPEN","updatedAt":"2026-09-24T13:11:15Z"}`. `git rev-parse HEAD` → `95b28ed87afa85e6927ec39b761372611d6b8742`; the checked GitHub PR head therefore matched local HEAD.
- `pytest anchor/tests/` → `97 passed in 0.86s`.
- `npm test` → `23` tests, `23` passed, `0` failed.
- `node scripts/check-docs.mjs` → `Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.`
- `node scripts/check-intake.mjs` → `Intake gate has evidence references and approval records; reviewers must verify their authenticity.`
- `git diff --check` → exit `0`, no whitespace errors; Git printed line-ending normalization warnings for the two Python files and `contracts/openapi.yaml` (LF will be replaced by CRLF on a later Git write).
- One-off PyYAML/jsonschema validation of the OpenAPI components → `EventSubmission valid device shape: accepted; server fields: rejected`; `Pin statement: accepted without expiry; expiry added only by record`; `X-Vuka signed-request security: all four named routes require all four headers`; `Contract schema validation: PASS`. The temporary checker was removed after the run.

Decision: Sibusiso accepted the proposed C5–C8/SEC-1/SEC-2 dispositions on PR #51; this implements those requested contract changes. No ADR acceptance or contract freeze is inferred; required co-lead/security/consumer review remains pending.

Needs/blockers: No ANCHOR server implementation is in this task. Runtime verification of the request signature, commitment-mismatch HTTP 400, PIN-gated action refusal without a valid statement, encryption at rest, and rejection of subject-signed guardian-token updates remain unimplemented/unverified; this PR changes their contract descriptions and helper shape only. Kind-specific payload files under `contracts/payloads/` are not present in this branch, so the envelope names the required `{kind}.v{pv}` schema convention but kind-specific validation remains a follow-up before claiming all event payloads are fully typed.

Business handoff: Babatunde should describe the evidence/request and guardian-token controls as specified, not deployed or runtime-tested.

Next: Sibusiso to review this local diff; then push only after his separate authorization. Lethabo and the security/contract reviewers to re-review PR #51 before any contract freeze.
