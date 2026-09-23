# Overlap register (I, C3)

Proposed paths, not implemented interfaces. Declare a claim in your team file before editing; a claim is coordination, not a lock enforced by software.

| Shared surface | Owners | Contract to settle |
|---|---|---|
| `contracts/events.schema.json` | Sibusiso, Vukosi, Mutarisi | Event ID, tenant, source time, received time, `sim_`, freshness |
| `contracts/openapi.yaml` | Sibusiso, Mutarisi, Khutso | Roles, errors, pagination, idempotency and receipt states |
| `server/governance.py` | Sibusiso, Ipeleng, Lethabo | Human-only transition and two distinct signers |
| `docs/audit/03-user-journeys.md`, future Figma | Lethabo, Mutarisi, Ipeleng | Copy, accessibility, duress observability |
| Proof/export schema | Sibusiso, Ipeleng, Babatunde | What verification establishes, expiry/deletion caveats |
| Data retention/subject rights | Ipeleng, Khutso, Sibusiso, Mutarisi | Legal basis, payload deletion, request states |
| Hardware/BOM economics | Vukosi, Babatunde | Measured load, supplier quote, amortisation versus cash |
| Evidence/README/deck | Khutso, Babatunde, Lethabo | Built versus specified; sample size and claim lineage |
| CI/security settings | Sibusiso, Ipeleng | Required checks and failure behaviour |

Active merge-gate claim (2026-09-16, **PROPOSED**): WBS 3.2's transport-envelope-only boundary and the later `SightingEvent` payload/consumer confirmation are tracked across `docs/CHECKLIST.md` and `docs/BUILD-LOG.md`. Vukosi owns the future producer payload, Sibusiso owns consumer confirmation, and Khutso maintains the evidence/checklist record. Khutso's coordination acknowledgement was recorded by the Codex assistant at Khutso's request; the claim remains proposed, no contract is changed, and no human signature or consumer approval is inferred.

Active evidence claim (2026-09-23, **PROPOSED work in progress**): Khutso owns P3.K1/P3.K2 on branch `docs/khutso-p3-k1-evidence-recheck`. The bounded shared surface is `docs/EVIDENCE.md`; each 23 September source must be reopened and recorded before any claim changes. Babatunde and Lethabo consume the evidence ceiling, and Sibusiso is the first reviewer. `docs/CHECKLIST.md` P3.K1/P3.K2 remain unticked until linkable acceptance evidence exists. No contract or product capability changes in this claim.

Protocol: read active claims → propose versioned interface diff → notify dependent owners in their “needs” field → mark conflicting task blocked → both leads decide with domain input → record decision ID, options, reason, affected versions and migration in `docs/decisions/` → update all consumers and append BUILD-LOG entry. No agent silently wins a contract conflict. If leads disagree, retain existing contract and stop only dependent work. Supersede decisions explicitly so old arguments are not reopened without new evidence.
