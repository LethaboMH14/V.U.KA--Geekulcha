## 2026-09-24 | Codex assistant acting at Khutso Mothopa's request | requirements trace | P3.K3 | drafted; review pending

**Research** — Read `docs/VUKA-2-SPEC.md` §2 and §15, the current P3 owner/checklist rows, `docs/MASTER-CONTEXT.md` §2 and §10, and the current handover notes. Compared the work order's T01–T20 instruction with the accepted specification's current T01–T24 test table.

**Real data / references** — The matrix contains all 32 §2 requirements: V1–V10, G1–G6, A1–A7, S1–S4, P1–P2 and D1–D3. It maps the applicable T01–T24 IDs and marks 11 requirements with no dedicated §15 test. It does not treat a specification line, code presence or a local check as acceptance evidence.

**Business reasoning** — A trace with explicit test gaps and acceptance status lets the team answer what is actually ready for a judge, bank or insurer and prevents unsupported “implemented” claims. This serves T, S and B.

**Competitor reference** — Not applicable; this is requirements governance.

Changed: Added `docs/REQUIREMENTS-TRACE.md` and updated `team/khutso.md` to point to P3.K3. The trace records owners, current test IDs, status vocabulary, evidence pointers and the T01–T20 versus T01–T24 range mismatch. No checklist row was ticked.

Evidence: The matrix was manually reviewed against the requirement and test tables. Repository document, intake, diff and secret checks are to be run before push. Human owner and reviewer acceptance remain pending.

Decision: None. Test-gap closure and owner/status acceptance require Sibusiso and both leads.

Needs/blockers: Sibusiso reviews first; both leads then accept the ownership and status mapping. The 11 missing dedicated tests need owners or an explicit decision to cover them through existing tests.

Business handoff: Use this trace as the source for implementation and verification planning; do not present `specified` or `partial` as passed.

Next: Review the trace on the Khutso PR, resolve test gaps and range wording, then update the checklist only after acceptance evidence exists.
