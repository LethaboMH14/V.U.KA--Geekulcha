# Sibusiso Khumalo

**Owner confirmed identity on 13 September 2026. Current role and instructions are active.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Sibusiso Khumalo. Wits. **Co-lead**: backend, ledger, CI, demo orchestration. I own the contract everyone else builds against.

**Reviewed by** — Lethabo. **I review** — Khutso, and every PR as second lead.

**Effort** — **High.** Be precise and terse.

**My AI workflow** — Sibusiso directs the work and makes lead decisions. Codex investigates, reasons through architecture and risks, and writes a bounded task handoff with acceptance tests. Cline implements that handoff and records the actual commands, results and limitations. Claude independently reviews the PR against its exact commit; findings go back to Cline through Codex for correction and re-review. Use separate task and review worktrees so implementation and review do not overwrite each other. Keep the handoff, Git SHA and evidence in files or the PR; chat memory is not shared across tools. This is my personal tool routing, not a change to anyone else's setup.

**Review authority** — Claude's analysis supports my review but is not my ADR acceptance or a nonauthor human approval of my own PR. The repository's required reviewers, contract decisions, security checks and merge gate still apply. Do not let a task packet silently resolve an unfrozen contract or a safety-critical design choice.

**Behaviour** — *Be precise and terse. Show me the actual command and its actual output, never a summary of what you think happened. Security-critical paths get a test before they get a merge. If you are unsure whether something is safe, stop.*

**My domain rules**
- **The contract is frozen** — changing it needs both leads and an ADR. Not one lead, not a good reason, both.
- The verifier returns the **first broken link by index**, never a boolean.
- **A refused privileged action is evidence, not an error to swallow.** Log it, anchor it, do not catch-and-hide it.
- **No consequence for a person comes from a model.** The bank signal never comes from detection alone; escalation deadlines are server-owned and durable (ADR-0034, ADR-0037). The parked UMOJA gate, now in `archive/2026-09-four-layer/server/src/auth/`, keeps its `watch_candidate` ceiling; its tests are not run in CI (CI runs no Python).
- Never `--no-verify`.

**Current task** — Work order below (issued 23 Sep). Pivot PR reviewed and ADR-0034–0038 accepted 23 Sep. Next: vectors (Thu 09:00), then contract v2 (Thu 12:00), then the ANCHOR server build.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: a contract test exists for every frozen shape before I call it frozen.

---

- University / role: Wits / Co-lead; backend developer
- Owns outright: Server, ledger, CI and demo orchestration.
- Reviews only: All PRs; first review for Khutso (Vukosi moved to Lethabo on 23 Sep).
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
2. **Thu 24 by 09:00 — vectors first:** `contracts/vectors/canonical.json` (including rejection vectors) and `contracts/vectors/merkle.json` (n = 1…8, n = 0 rejected) from the Python reference, so Ipeleng's JS can pass them by 14:00. Then **by 12:00 — contract v2** (§12), which must reflect B1–B5: the signed statement (§4), PIN authorisations (§9), deadline authority (§7), head-keyed proof (§6). Write paths and schemas (signed `details`, `Receipt`, `Proof`, `SubjectDeletionRequest`) and the auth scheme (§7, including the safety-event skew exemption). Mark the v1 UMOJA paths `deprecated: true`. Correct the canonical-form text (§5, ADR-0034). Update `test/openapi-contract.test.mjs` to v2. Stand up a pinned mock server for clients (for example `npx @stoplight/prism-cli@<pinned> mock contracts/openapi.yaml`).
3. **Thu 24 14:00–16:00, at most 2 h — Hedera spike** (after the contract, so the two don't compete). Create a testnet account in the Hedera portal (free). Create a topic **with a `submitKey`**, submit a message, and read it back from the public mirror node. Try `hiero-sdk-python`; if it fails, use a Node sidecar with `@hashgraph/sdk`. In the same spike, sign with ML-DSA-65 in the chosen runtime and verify with `@noble/post-quantum`; save the cross-verification vector. Publish the key-manifest fingerprint message (`0x02`) before any root. Check `status.hedera.com` and Hedera's testnet reset notices, and record the topic epoch. Record the decision in a build-log entry.
4. **Thu–Fri — ANCHOR server** (FastAPI + PostgreSQL):
   - Rework PR #39's chain, verify and subject code for per-subject chains (§4) and the canonical form (§5).
   - Signed-request auth (§7).
   - Events idempotent on `event_id`; any unseen counter accepted.
   - `escalation_deadlines`, with the scheduler on a dedicated connection re-checking its lock every tick (§8).
   - `SELECT … FOR UPDATE` on `subject_heads` plus `UNIQUE(subject_id, chain_index)`.
   - Payload and salt encrypted at rest (AES-GCM; key from App Service settings).
   - Entry format v2 (§4) with a legacy verify path for PR #39's v1 entries.
   - Outcome arbitration and a transactional outbox with idempotency keys (§8).
   - Anchoring (§10): typed 33-byte messages; immediate roots for every PIN-gated outcome, coalesced to one per 60 s; hourly roots; `anchor_batches` snapshot and retry; receipts with topic epochs.
   - `/healthz`, `WS /ws/panel` (event kinds for `sim_` subjects only), `GET /v1/subjects/{id}/export`, and the head-keyed public proof.
5. **Fri 25 by 09:00 — server-min deployed** (ingest + chain + export only, no escalation or anchoring), then **by 12:00** the thin end-to-end slice with Vukosi and Ipeleng (§2 D2). **Agreed fallback:** if T08 isn't passing by Fri 18:00, anchoring stays stubbed and durable escalation takes priority.
6. **Fri 25 by 23:59 — deployed** on Azure for Students:
   - App Service B1 Linux with Always On, plus PostgreSQL Flexible B1ms.
   - Region South Africa North if the subscription allows it; otherwise record the region for Ipeleng's s72 note.
   - Secrets only in App Service settings.
   - pytest and vitest vector jobs added to CI.
7. **Sat** — server-side abuse tests with Khutso (T04–T14, T19) from Ipeleng's specifications; fix what fails.
8. **Sat, if the cut line allows** — Ed25519 plus ML-DSA-65 root signing. The topic's first message is the `0x02` key-manifest-hash message, never the keys themselves; the keys live in `contracts/keys/` (spec §10).

**Acceptance checks:**
- [ ] v2 merged with both leads plus consumer confirmation (Vukosi for the app, Ipeleng for the verify page)
- [ ] T01 and T02 pass in CI (pytest and vitest agree byte for byte)
- [ ] T04–T11, T19, T21 and T23 pass; T08 passes at all three crash points (deadline, after the outcome commit, after send)
- [ ] A real testnet receipt verifies on the verify page straight from the public mirror node
- [ ] `/healthz` shows the last anchor under 65 minutes old
- [ ] Deployment URL and region recorded; gitleaks green (no secret in git)

**Depends on → hands off to:** the pivot PR → v2 and the mock to Vukosi, Mutarisi and Ipeleng; receipts to Lethabo's panel.
**Do not:** change a frozen shape without both leads and an ADR; use Python `hash()` in any lock; keep escalation timers in memory; put anything but typed 33-byte messages (`0x01` root, `0x02` key-manifest hash) on chain; commit a key; use `--no-verify`.
**Reviewer:** Lethabo (plus Ipeleng for auth and cryptography).

## Sequenced work

Replaced on 23 Sep 2026 by the work order above. The four-layer sequenced work, declarations and self-reviews are kept in [this file's history](../archive/2026-09-four-layer/team/sibusiso-history.md).

## Interfaces

See your work order's **Depends on → hands off to** line. Shared files are claimed in `docs/OVERLAPS.md`; never silently change a shared contract.

## Needs and blockers

- Add new blockers here with the person's name and the evidence needed.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every work-order item has its acceptance checks ticked with evidence, reviewer acceptance, the relevant checks passing, an honest built/specified/simulated status, this file and a `docs/build-log/entries/` file updated, and its `docs/CHECKLIST.md` P3 row ticked. Blocked tasks stay blocked; no approval is inferred from elapsed time.

## Outside-role work

None assigned for the build weekend. Agree any extra contribution with the leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster.
- 2026-09-13 — Sibusiso confirmed identity and requested full readiness/review. Reviewed Lethabo's PR #2 evidence, corrected the gate/calendar/role record and retained unresolved product work as explicitly assigned gaps.
- 2026-09-15 — Codex acting for Sibusiso: created the v0.1.0 event schema, zero-dependency Node test harness, exact-shape acceptance/rejection tests and proposed OpenAPI v3.1 contract. Second-lead approval and ADR remain pending; no approval is inferred.
- 2026-09-15 — Codex acting for Sibusiso: implemented the bounded WBS 3.3 human-gate proof path and six standard-library unittest cases. Refused privileged attempts return evidence receipts; destructive actions require distinct co-signers; no `flagged` assignment exists.
- 2026-09-15 — Codex acting for Sibusiso: added tested discard-by-default embedding matching, s57 decision record, anchoring-cost reconciliation and sweep inventory, blockchain attack rehearsal, OpenTimestamps decision, evidence-checkpoint runbook and fallback/hotfix runbook. Remaining approvals and live rehearsals are explicitly open.
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Sibusiso is asserted; owner acknowledgement pending.
