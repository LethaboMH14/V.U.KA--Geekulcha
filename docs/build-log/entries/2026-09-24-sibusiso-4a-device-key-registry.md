## 2026-09-24 | Sibusiso, with Claude Code assistant | spec review | §4a device-key registry | PROPOSED — Lethabo's agreement pending

**Research** — Read `docs/VUKA-2-SPEC.md` §4 (entry format), §7 (auth order of checks) and §9 (guardian governance, key revocation on recovery) directly. Confirmed §4 already requires a registered key per `signer_key_id` (line 139-140) and a `signer_pubkey` on registration entries (line 141), but never specifies where that registration is persisted, its storage shape, or how the server resolves the active key for a subject at verification time. Searched `contracts/keys/README.md` and `contracts/openapi.yaml` directly — confirmed neither defines a device/guardian key registry; `contracts/keys/` only documents the server's own key manifest (§10).

**Real data / references** — This gap was found while scoping P3.A3 slice 2 (real request auth): Codex correctly refused to guess a registry format and named the gap in `docs/security/SCA-WAIVERS.md` (PR #62) rather than inventing one.

**Business reasoning** — P3.A3 slice 2 (real signed-request auth) and P3.A6 (deployment) cannot proceed without this; deploying the current always-allow auth stub would be unsafe. This is implementation detail inside an already-accepted section, not a new rule, but it still touches the frozen contract and needs both leads per `team/sibusiso.md`'s domain rule.

**Competitor reference** — Not applicable.

Changed: `docs/VUKA-2-SPEC.md` §4a (new, `PROPOSED`) — defines a `signer_keys` table (subject_id, signer_key_id, signer_role, public_key, revoked_at, revoked_reason), reuses §4's existing SPKI/base64 encoding (no new format introduced), names the three enrollment paths already implied by §4/§9 (registration, guardian-accept, recovery), and defines journey-to-subject ownership as a check before authentication succeeds. Deliberately no "most-recent-wins" key resolution — an un-revoked key stays valid until recovery explicitly revokes it.

Evidence: `node scripts/check-docs.mjs` and `git diff --check` both pass. This is a spec addendum only — no code, no ADR acceptance, no merge.

Decision: None. This is a proposal; it binds only when both leads agree it (recorded in `docs/ADR-ACCEPTANCE-RECORD.md` alongside a new ADR), per `team/sibusiso.md`'s "contract is frozen" rule.

Needs/blockers: Lethabo's agreement. Once accepted, P3.A3 slice 2 (`sibusiso-workflow/tasks/anchor-server-slice2/01-task.md`) can start.

Business handoff: Not applicable — this is a contract clarification, not a product or economics decision.

Next: Lethabo reviews this PR; on agreement, Sibusiso records it in `docs/ADR-ACCEPTANCE-RECORD.md` and hands P3.A3 slice 2 to Codex.
