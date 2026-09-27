## 2026-09-24 | Codex assistant for Sibusiso | Hedera receipt contract correction and sidecar CI | REVIEW REQUIRED

**Research** — A real sequence-2 Hedera mirror receipt produced `consensus_timestamp: "1790283223.545362104"`. `contracts/openapi.yaml` instead marked `AnchorReceipt.consensus_timestamp` as `format: date-time`, which requires an RFC 3339 value and would reject the real receipt. The shared verifier checks pinned topic and epoch, but its fixture still uses an ISO timestamp; Ipeleng owns that consumer file and should review the changed contract shape. The new sidecar package was not included in repository CI, so its own tests and dependency audit would otherwise be missed.

**Real data / references** — Public mirror topic `0.0.10687280`, message sequence 2, verified in `docs/build-log/entries/2026-09-24-codex-p3a2-typed-manifest.md`. The real timestamp is seconds.nanoseconds, not a UTC date-time string. No new Hedera transaction occurred for this correction.

**Business reasoning** — A contract that rejects the authentic anchor receipt blocks export/proof interoperability. Keeping the isolated Node package under CI prevents a future dependency update from silently dropping its tests or reintroducing high-severity advisories.

**Competitor reference** — Not applicable.

**Changed** — `AnchorReceipt.consensus_timestamp` now declares a Hedera seconds.nanoseconds pattern. A contract test holds that shape. `.github/workflows/checks.yml` runs the sidecar's `npm ci`, tests and high-severity audit. `team/sibusiso.md` claims the shared paths. No endpoint or server behavior changed here. The contract correction is proposed on PR #51 and requires both-lead/domain review before freeze.

**Evidence — commands and actual output:**
```
npm test
tests 34; pass 34; fail 0
npm --prefix shared test
Test Files 7 passed (7); Tests 99 passed (99)
node scripts/check-docs.mjs
Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.
git diff --check
exit 0 (Windows line-ending warning only)
```

**Decision** — Align the contract with the actual Hedera mirror wire format. This assistant does not accept a contract change on behalf of Lethabo, Ipeleng or Sibusiso.

**Needs / blockers** — CI must run on the pushed branch before merge. Ipeleng should update/confirm the shared verifier's receipt fixture and parser expectations. P3.A3/P3.A5 remain partial pending accepted event payload schema, anchored root batch, PIN authority and security review.

**Business handoff** — Reviewers should compare this OpenAPI field to the sequence-2 public mirror response, and check that no consumer assumes RFC 3339 for Hedera consensus time.

**Next** — After review, retain the seconds.nanoseconds shape across exports, public proof and verifier fixtures; then run the live root/receipt acceptance path.
