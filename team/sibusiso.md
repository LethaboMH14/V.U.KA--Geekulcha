# Sibusiso Khumalo

**Owner confirmed identity on 13 September 2026. Current role and instructions are active.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Sibusiso Khumalo. Wits. **Co-lead**: backend, ledger, CI, demo orchestration. I own the contract everyone else builds against.

**Reviewed by** — Lethabo. **I review** — Khutso, and every PR as second lead.

**Effort** — **High.** Be precise and terse.

**Behaviour** — *Be precise and terse. Show me the actual command and its actual output, never a summary of what you think happened. Security-critical paths get a test before they get a merge. If you are unsure whether something is safe, stop.*

**My domain rules**
- **The contract is frozen** — changing it needs both leads and an ADR. Not one lead, not a good reason, both.
- The verifier returns the **first broken link by index**, never a boolean.
- **A refused privileged action is evidence, not an error to swallow.** Log it, anchor it, do not catch-and-hide it.
- **No consequence for a person comes from a model.** The bank signal never comes from detection alone; escalation deadlines are server-owned and durable (ADR-0034, ADR-0037). The parked UMOJA gate keeps its `watch_candidate` ceiling and its tests stay green.
- Never `--no-verify`.

**Current task** — Work order below (issued 23 Sep). First: review the pivot PR as second lead, then contract v2 by Thu 12:00.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: a contract test exists for every frozen shape before I call it frozen.

---

- University / role: Wits / Co-lead; backend developer
- Owns outright: Server, ledger, CI and demo orchestration.
- Reviews only: All PRs; first review for Vukosi and Khutso.
- Lead / escalation: Both leads for contract changes.
- AI tool / model: Codex / GPT-6 for the 13 September review session; update this line if a different tool is used later.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Claimed files / contract versions: `contracts/events.schema.json` v0.1.0; `contracts/openapi.yaml` v0.1.0 proposed pending both-lead approval; `package.json`; `test/events-contract.test.mjs`.
- Last updated: 23 September 2026 — work order issued by Lethabo (co-lead) via Claude Code assistant.

## Work order — VIGIL + ANCHOR build (issued 23 Sep 2026)

> Issued by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde. Decisions: ADR-0034 to ADR-0038. Spec: `docs/VUKA-2-SPEC.md` (section numbers below refer to it). **Owner acknowledgement pending** — accept it in your running log, or raise a blocker here. All times SAST. Criterion letters per `docs/MASTER-CONTEXT.md` §2 (I · T · U · S · B · Q). Before you start anything: pass the four review gates in `docs/MASTER-CONTEXT.md` §10.

**Outcome you own:** ANCHOR runs in the cloud — per-person signed chains, durable server-owned escalation, Hedera anchoring and export — and the contract everyone builds against.
**Serves:** T, S, I, Q.
**Files you own or may touch:** `contracts/openapi.yaml` (v2), `contracts/vectors/`, `contracts/keys/`, `anchor/`, `server/`, `test/openapi-contract.test.mjs`, `scripts/check-docs.mjs` (v2 update), `.github/workflows/checks.yml` (server jobs), deployment configuration.

**Do this, in order:**
1. **Wed 23** — review the pivot PR as second lead; accept or amend ADR-0034 to ADR-0038. Your acceptance binds them.
2. **Thu 24 by 12:00 — contract v2** (§12). Write paths and schemas (signed `details`, `Receipt`, `Proof`, `SubjectDeletionRequest`) and the auth scheme (§7, including the safety-event skew exemption). Mark the v1 UMOJA paths `deprecated: true`. Correct the canonical-form text (§5, ADR-0034). Commit `contracts/vectors/canonical.json` and `contracts/vectors/merkle.json` (n = 1…8) from the Python reference. Update `test/openapi-contract.test.mjs` to v2. Stand up a pinned mock server for clients (for example `npx @stoplight/prism-cli@<pinned> mock contracts/openapi.yaml`).
3. **Thu 24 morning, at most 2 h — Hedera spike.** Create a testnet account in the Hedera portal (free). Create a topic **with a `submitKey`**, submit a message, and read it back from the public mirror node. Try `hiero-sdk-python`; if it fails, use a Node sidecar with `@hashgraph/sdk`. In the same spike, sign with ML-DSA-65 in the chosen runtime and verify with `@noble/post-quantum`; save the cross-verification vector. Record the decision in a build-log entry.
4. **Thu–Fri — ANCHOR server** (FastAPI + PostgreSQL):
   - Rework PR #39's chain, verify and subject code for per-subject chains (§4) and the canonical form (§5).
   - Signed-request auth (§7).
   - Events idempotent on `event_id`; any unseen counter accepted.
   - `escalation_deadlines`, with the scheduler on a dedicated connection re-checking its lock every tick (§8).
   - `SELECT … FOR UPDATE` on `subject_heads` plus `UNIQUE(subject_id, chain_index)`.
   - Payload and salt encrypted at rest (AES-GCM; key from App Service settings).
   - Anchoring (§10): immediate on every check-in outcome, hourly roots, receipts.
   - `/healthz`, `WS /ws/panel` (event kinds for `sim_` subjects only), and `GET /v1/subjects/{id}/export`.
5. **Fri 25 by 12:00** — thin end-to-end slice with Vukosi and Ipeleng (§2 D2).
6. **Fri 25 by 23:59 — deployed** on Azure for Students:
   - App Service B1 Linux with Always On, plus PostgreSQL Flexible B1ms.
   - Region South Africa North if the subscription allows it; otherwise record the region for Ipeleng's s72 note.
   - Secrets only in App Service settings.
   - pytest and vitest vector jobs added to CI.
7. **Sat** — server-side abuse tests with Khutso (T04–T14, T19) from Ipeleng's specifications; fix what fails.
8. **Sat, if the cut line allows** — Ed25519 plus ML-DSA-65 root signing; publish the public keys in the topic's first message and in `contracts/keys/`.

**Acceptance checks:**
- [ ] v2 merged with both leads plus consumer confirmation (Vukosi for the app, Ipeleng for the verify page)
- [ ] T01 and T02 pass in CI (pytest and vitest agree byte for byte)
- [ ] T04–T11 and T19 pass; T08 (restart between `opened` and the deadline) passes
- [ ] A real testnet receipt verifies on the verify page straight from the public mirror node
- [ ] `/healthz` shows the last anchor under 65 minutes old
- [ ] Deployment URL and region recorded; gitleaks green (no secret in git)

**Depends on → hands off to:** the pivot PR → v2 and the mock to Vukosi, Mutarisi and Ipeleng; receipts to Lethabo's panel.
**Do not:** change a frozen shape without both leads and an ADR; use Python `hash()` in any lock; keep escalation timers in memory; put anything but 32-byte roots on chain; commit a key; use `--no-verify`.
**Reviewer:** Lethabo (plus Ipeleng for auth and cryptography).

## Sequenced work

**Superseded 23 September 2026 by the work order above** — kept for history; do not execute these rows. All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 13 | 1.3 | 4 | Install and exercise local/CI scanning | none | Clean scan passes; synthetic leak and missing-tool checks fail closed |
| Sep 15 | 3.1 | 4 | Freeze event/API/governance contracts | 1.4 | Both leads and consumers approve versioned schemas |
| Sep 17 | 3.3 | 6 | Port and verify human gate and proof path | 1.4,3.1 | Nonauthor reproduces denial, two-signature and tamper checks |
| Sep 20 | 4.5 | 4 | Run integrated evidence checkpoint | 3.5,4.3,4.4 | Both leads record pass or cut scope; tag only tested snapshot |
| Sep 26 | 7.2 | 4 | Rehearse fallback and scoped hotfix procedure | 7.1 | Rollback works; no bypass of authority or review |

## Interfaces

- Inputs: Remediation evidence from Ipeleng/Lethabo; sensor contract from Vukosi.
- Outputs: Versioned API/events and proof export to Mutarisi/Vukosi/Khutso.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

Sibusiso requested and owns this review. Local security-hook tests, clean repository/history scans and PR #2's successful remote checks were reviewed. The intake gate records Sibusiso's approval with those evidence references; this branch contains the resulting corrections.

## Needs and blockers

- Collected predecessor test count remains unverified → owners must run both suites before repeating “440 tests”.
- cloud quota failure → use approved local rehearsal path.
- second-lead contract approval and ADR → Lethabo reviews the proposed event/OpenAPI shapes before they are called frozen.
- PR publication → GitHub CLI reports `gh auth login` is required; branch is pushed and the manual PR URL is available.
- WBS 3.3 runtime → system Python is absent, but bundled Python 3.12.14 is available and was used for the tested governance module; pytest remains unavailable, so tests use standard-library unittest.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Venue network rehearsal.
- independent proof-verifier instructions.
- release archive and rollback inventory.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster.
- 2026-09-13 — Sibusiso confirmed identity and requested full readiness/review. Reviewed Lethabo's PR #2 evidence, corrected the gate/calendar/role record and retained unresolved product work as explicitly assigned gaps.
- 2026-09-15 — Codex acting for Sibusiso: created the v0.1.0 event schema, zero-dependency Node test harness, exact-shape acceptance/rejection tests and proposed OpenAPI v3.1 contract. Second-lead approval and ADR remain pending; no approval is inferred.
- 2026-09-15 — Codex acting for Sibusiso: implemented the bounded WBS 3.3 human-gate proof path and six standard-library unittest cases. Refused privileged attempts return evidence receipts; destructive actions require distinct co-signers; no `flagged` assignment exists.
- 2026-09-15 — Codex acting for Sibusiso: added tested discard-by-default embedding matching, s57 decision record, anchoring-cost reconciliation and sweep inventory, blockchain attack rehearsal, OpenTimestamps decision, evidence-checkpoint runbook and fallback/hotfix runbook. Remaining approvals and live rehearsals are explicitly open.
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Sibusiso is asserted; owner acknowledgement pending.
