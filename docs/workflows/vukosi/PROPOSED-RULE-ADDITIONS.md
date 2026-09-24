# PROPOSED Vukosi rule additions

**Status: PROPOSED for Lethabo to adopt in a lead-reviewed PR.** This file does not change `RULES.md` and is not an approval. Criterion **T/S**: persistent, checkable rules reduce repeat build and evidence mistakes, helping a real user trust what VIGIL claims.

- **Class maps and clip lists use JSON or text, unless a lead approves an exception.** Rationale: root `*.csv` ignore rules can hide required provenance files. Evidence: `docs/workflows/vukosi/p2a-yamnet-provenance/REVIEW.md` finding C1 and the inherited tracked-CSV note.
- **A release build must never be signed with the debug key.** Rationale: a build labelled release must not inherit a development identity. Evidence: `docs/workflows/vukosi/p1a-rn-scaffold/TASK.md` §5 and `REVIEW.md` signing checks.
- **AndroidX signature-permission allowlists must scope generated names to the app's own package.** Rationale: suffix matching alone would accept a look-alike permission from another package. Evidence: `docs/workflows/vukosi/p1a-rn-scaffold/REVIEW.md` D1 and its re-review.
- **The `duress_pin` event kind no longer exists; use “duress signal”.** Rationale: language must match the current domain contract and not revive a removed event kind. Evidence: `docs/VUKA-2-SPEC.md` §3.
- **A green build after an unexplained first failure is not a pass until the cause is recorded.** Rationale: a rerun cannot prove an intermittent failure is harmless. Evidence: `docs/workflows/vukosi/p1a-rn-scaffold/REVIEW.md` N1.
- **Do not compare release-APK hashes across checkout paths.** Rationale: the reviewed release artifact differed across paths while remaining repeatable within one path. Evidence: `docs/workflows/vukosi/p1a-rn-scaffold/REVIEW.md` re-review hashes.

No measurement, product capability or human acceptance is claimed here.
