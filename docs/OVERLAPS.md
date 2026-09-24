# Overlap register (I, C3)

**PROPOSED — 23 Sep, Vukosi workflow preparation:** `team/vukosi.md`, `docs/VUKOSI-VIGIL-WORKFLOW.md`, `docs/VUKOSI-CLAUDE-PROMPT.md`, `docs/reviews/VUKOSI-PR43-READINESS.md` and a new assistant build-log entry are the documentation-only claim. No product paths, contract, other owner's file, checklist status or schedule is changed. VIGIL's future `app/` bootstrap/package/lockfile ownership must be coordinated with Mutarisi; CI with Sibusiso; shared cryptography with Ipeleng. This claim is local until reviewed and published through a PR. The older table below is not a current VIGIL path allocation. **Added the same day (Claude review, packet P2a / P3.V2):** `docs/reviews/VUKOSI-WORKFLOW-CLAUDE-REVIEW.md`, `docs/workflows/vukosi/p2a-yamnet-provenance/` and, for the executor, `scripts/fetch_models.py` and `scripts/tests/test_fetch_models.py` (Vukosi-owned script paths per his work order). `.gitignore`, `docs/MODEL-LICENCES.md` and `docs/EVIDENCE.md` are read, not edited.

Proposed paths, not implemented interfaces. Declare a claim in your team file before editing; a claim is coordination, not a lock enforced by software.

| Shared surface | Owners | Contract to settle |
|---|---|---|
| `contracts/events.schema.json` | Sibusiso, Vukosi, Mutarisi | Event ID, tenant, source time, received time, `sim_`, freshness |
| `contracts/openapi.yaml` | Sibusiso, Mutarisi, Khutso | Roles, errors, pagination, idempotency and receipt states |
| `server/governance.py` | Sibusiso, Ipeleng, Lethabo | Human-only transition and two distinct signers |
| `docs/audit/03-user-journeys.md`, future Figma | Lethabo, Mutarisi, Ipeleng | Copy, accessibility, duress observability |
| Proof/export schema | Sibusiso, Ipeleng, Babatunde | What verification establishes, expiry/deletion caveats |
| Data retention/subject rights | Ipeleng, Khutso, Sibusiso, Mutarisi | Legal basis, payload deletion, request states |
| `shared/*.js` (canonical, DER, Merkle) | Ipeleng, Vukosi, Sibusiso | Must pass `contracts/vectors/`; no Kotlin canonicaliser (spec §5) |
| `contracts/vectors/`, `contracts/keys/` | Sibusiso, Ipeleng | Golden and rejection vectors; the pinned key manifest (spec §5, §10) |
| Server notification module (guardian alerts, FCM/SMS) | Sibusiso, Khutso, Mutarisi | Outbox idempotency keys, delivery states, V8 hiding (spec §8) |
| `sim_bank` | Khutso, Sibusiso | Idempotency-Key, trigger provenance, SIMULATED labels (spec S1, §12) |
| Hardware/BOM economics | Vukosi, Babatunde | Measured load, supplier quote, amortisation versus cash |
| Evidence/README/deck | Khutso, Babatunde, Lethabo | Built versus specified; sample size and claim lineage |
| CI/security settings | Sibusiso, Ipeleng | Required checks and failure behaviour |

Active merge-gate claim (2026-09-16, **PROPOSED**): WBS 3.2's transport-envelope-only boundary and the later `SightingEvent` payload/consumer confirmation are tracked across `docs/CHECKLIST.md` and `docs/BUILD-LOG.md`. Vukosi owns the future producer payload, Sibusiso owns consumer confirmation, and Khutso maintains the evidence/checklist record. Khutso's coordination acknowledgement was recorded by the Codex assistant at Khutso's request; the claim remains proposed, no contract is changed, and no human signature or consumer approval is inferred.

Active evidence claim (2026-09-23, **PROPOSED work in progress**): Khutso owns P3.K1/P3.K2 on branch `docs/khutso-p3-k1-evidence-recheck`. The bounded shared surface is `docs/EVIDENCE.md`; each 23 September source must be reopened and recorded before any claim changes. Babatunde and Lethabo consume the evidence ceiling, and Sibusiso is the first reviewer. `docs/CHECKLIST.md` P3.K1/P3.K2 remain unticked until linkable acceptance evidence exists. No contract or product capability changes in this claim.

Protocol: read active claims → propose versioned interface diff → notify dependent owners in their “needs” field → mark conflicting task blocked → both leads decide with domain input → record decision ID, options, reason, affected versions and migration in `docs/decisions/` → update all consumers and append BUILD-LOG entry. No agent silently wins a contract conflict. If leads disagree, retain existing contract and stop only dependent work. Supersede decisions explicitly so old arguments are not reopened without new evidence.
