# Sibusiso Khumalo

**Owner confirmed identity on 13 September 2026. Current role and instructions are active.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Sibusiso Khumalo. Wits. **Co-lead**: backend, ledger, CI, demo orchestration. I own the contract everyone else builds against.

**Reviewed by** — Lethabo. **I review** — Vukosi, Khutso, and every PR as second lead.

**Effort** — **High.** Be precise and terse.

**Behaviour** — *Be precise and terse. Show me the actual command and its actual output, never a summary of what you think happened. Security-critical paths get a test before they get a merge. If you are unsure whether something is safe, stop.*

**My domain rules**
- **The contract is frozen** — changing it needs both leads and an ADR. Not one lead, not a good reason, both.
- The verifier returns the **first broken link by index**, never a boolean.
- **A refused privileged action is evidence, not an error to swallow.** Log it, anchor it, do not catch-and-hide it.
- **No code path may set `flagged`.** The machine's ceiling is `watch_candidate`, enforced in code and tested, not just documented.
- Never `--no-verify`.

**Current task** — Freeze `contracts/openapi.yaml` (`3.1`), then the human-gate proof path (`3.3`), then **F14 subject access end-to-end** (checklist `SC.1`) — this is the showcase, treat it as the priority it is.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: a contract test exists for every frozen shape before I call it frozen.

---

- University / role: Wits / Co-lead; backend developer
- Owns outright: Server, ledger, CI and demo orchestration.
- Reviews only: All PRs; first review for Vukosi and Khutso.
- Lead / escalation: Both leads for contract changes.
- AI tool / model: Codex / GPT-6 for the 13 September review session; update this line if a different tool is used later.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: 1.3 complete; reviewing PR #2 and clearing team readiness.
- Claimed files / contract versions: none; reserve before editing.
- Last updated: 13 September 2026 during Sibusiso's review session.

## Sequenced work

All hours and dates below are ASSUMPTIONS, subject to availability and gates.

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
