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

Protocol: read active claims → propose versioned interface diff → notify dependent owners in their “needs” field → mark conflicting task blocked → both leads decide with domain input → record decision ID, options, reason, affected versions and migration in `docs/decisions/` → update all consumers and append BUILD-LOG entry. No agent silently wins a contract conflict. If leads disagree, retain existing contract and stop only dependent work. Supersede decisions explicitly so old arguments are not reopened without new evidence.
