# Build Log Entry — 2026-09-25 — Ipeleng Constance Modise (Security)

## Summary
Returned to security lane after Lethabo's coverage (24 Sep). Posted security reviews on 5 open PRs, updated team file with AI tool declaration and availability, confirmed all assigned P3 deliverables merged. SSDLC pack preparation in progress for Sat 11:00 internal deadline.

## Work Done

### 1. Security Reviews Posted (5 PRs)

| PR | Title | Review Focus | Status |
|----|-------|--------------|--------|
| #78 | Security programme docs (COMPLIANCE-GOVERNANCE, PENTEST-PLAN, SSDLC) | Verified ACCEPTED status records; tracked B1–B3/S1–S4 open conditions; SSDLC submission readiness checklist | Posted |
| #51 | Contract v2 (feat/sibusiso-contract-v2) | B1–B3 blocker conditions + S1–S4 should-fix items from PR #43 review | Posted |
| #89 | Slice 3 — escalation, PIN authority, anchoring | Duress indistinguishability (S3/T15/T16), PIN-authority binding (P3.L8 decisions), clock-skew exemption, anchoring timing, replay/idempotency | Posted |
| #88 | VIGIL events — Keystore signer + canonical form | DER→raw conversion, canonical request signing, key management, event payloads, offline queue | Posted |
| #87 | Evidence scorecard (CI → Pages) | No secrets, honest labels (FACT/ESTIMATE/ASSUMPTION/PROPOSED), scorecard content, access controls | Posted |

### 2. Team File Updated
- AI tool/model declared: **Cline (Claude Sonnet 4)**
- Availability: **Full weekend (Fri 25 Sep – Sun 27 Sep) / Africa/Johannesburg**
- Claimed files: 10 security/shared files
- Current task updated to SSDLC pack preparation

### 3. P3 Deliverables Confirmed Merged
- **P3.S2** (canonical/DER/Merkle vs vectors): PR #74 merged — vitest 54/54, vectors byte-for-byte
- **P3.S3** (THREAT-MODEL + TEST-SPECS T04–T52): PR #75 merged — accepted with conditions (UNDEFINED values wait on contract v2; coverage stays "not written" until execution)
- **P3.L8** (PIN-authority rules): PR #76 merged — documented with self-review, Lethabo's checkpoint decisions recorded
- **P3.S7** (verify-min): PRs #79 (key manifest + shared verifier) + #80 (dashboard page) merged — SEC-A/SEC-B fixed (key_conflict, actor_mismatch), 94/94 tests pass

## Research
- **Primary sources consulted**: `docs/STAGED-DURESS-DEFENCE.md` (owner), `docs/VUKA-2-SPEC.md` §3, §7, §8, §10, §15, §17, `docs/ADR-ACCEPTANCE-RECORD.md` (B1–B3, S1–S4), `docs/security/THREAT-MODEL.md` (63 threat rows, 55 mapped), `docs/security/PENTEST-PLAN.md` (64 PT cases)
- **Cross-references**: PR #43 security review conditions, PR #76 Lethabo's P3.L8 decisions, PR #75 threat-map check (63 rows, 8 observations in §9)

## Real Data / References
- 5 security reviews posted with checklists tied to spec sections and test IDs
- 4 merged PRs delivering P3.S2, P3.S3, P3.L8, P3.S7
- 70 SSDLC controls tracked (15 Done / 29 In build / 25 Planned / 1 Not doing)
- 64 pentest cases scheduled across S1–S7 (first run Thu 22:00)
- 7 counsel questions (Q-C1–Q-C7) preserved as open in COMPLIANCE-GOVERNANCE.md

## Business Reasoning
The security lane must verify every critical boundary before the SSDLC submission (Sat 11:00 internal). The staged-duress defence requires that no attacker-observable difference exists between normal and duress paths — this spans timing, network, UI, anchor, and panel layers. By posting reviews with explicit checklists on all 5 in-flight PRs that touch these boundaries, the security lane creates a verifiable record that each boundary is being checked, not assumed. The conditions from PR #43 (B1–B3, S1–S4) are not resolved by time passing; they require explicit evidence in contract v2 and follow-ups. Tracking them in reviews ensures they don't slip.

## Blockers / Open Items
1. **B1–B3/S1–S4 from PR #43** — require contract v2 (PR #51) and follow-up PRs to close
2. **PENTEST-RESULTS.md** — not started; first run Thu 22:00 (S1: PT-50, PT-51)
3. **Tooling evidence** — SAST, SCA, ZAP, MobSF need run dates or "not run" recorded
4. **Signed APK sha256** — pending D1 (Thu 22:00) for deployment evidence
5. **Lethabo review of SSDLC** — pending per P3.S9 (required before submission)

## Next Steps
1. Monitor PR #51 for contract v2 updates addressing B1–B3/S1–S4
2. Review PR #89/88 follow-ups as Sibusiso/Vukosi push fixes
3. Coordinate with Sibusiso on PENTEST-PLAN S1–S7 execution (Thu–Sat)
4. Ensure `docs/security/THREAT-MODEL.md` and `TEST-SPECS.md` are referenced in SSDLC §14 evidence table
5. Prepare `docs/build-log/entries/` for each condition closure
6. Final SSDLC pack review with Lethabo before Sat 11:00

## Acceptance Evidence
- 5 PR review comments with checklists (linked above)
- team/ipeleng.md updated with declaration and current status
- 4 merged PRs delivering assigned P3 work
- This build-log entry