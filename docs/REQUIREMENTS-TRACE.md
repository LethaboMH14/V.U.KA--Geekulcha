# VUKA-2 requirements trace

## Purpose and reading rules

This matrix traces every requirement in `docs/VUKA-2-SPEC.md` §2 to an accountable owner, the closest test ID(s) in §15, and the current evidence status. `specified` means the requirement exists in the accepted specification; it does not mean implementation or acceptance passed. `partial` means some implementation or evidence exists but acceptance is not recorded. `open` means the specification itself identifies an unresolved decision. `cut` means the specification permits the capability to remain stubbed or deferred under an explicit fallback. A dash in the test column is a deliberate test gap, not a passing result.

The work order requested T01–T20, but the current accepted specification defines T01–T24. This trace uses T21–T24 where applicable and records the range mismatch as a documentation gap.

## VIGIL — phone

| Requirement | Owner | Test ID(s) | Status | Evidence / gap |
|---|---|---|---|---|
| V1 — foreground explicit arming; microphone and notification permissions required | Vukosi (app); Sibusiso (server contract) | T17 | specified; acceptance pending | `docs/VUKA-2-SPEC.md` §2/§15; P3.V1/V4 remain open. |
| V2 — granted foreground-service types and persistent neutral notification | Vukosi | T17 | specified; acceptance pending | P3.V1/V3 remain open; no passing device evidence recorded. |
| V3 — YAMNet window, input shape, label mapping and uncalibrated thresholds | Vukosi | — (no dedicated §15 test) | specified; test gap | P3.V2 exists, but §15 has no direct Txx for the classifier contract. |
| V4 — above-threshold event followed by check-in | Vukosi; Sibusiso | T15, T17 | specified; acceptance pending | P3.V1/V4 remain open; T15 covers normal/duress presentation, T17 permission behaviour. |
| V5 — normal and duress check-in remain observationally indistinguishable | Vukosi; Ipeleng | T15 | specified; acceptance pending | T15 is specified; no result artifact is recorded. |
| V6 — duress PIN at settings prompt raises guardian and bank signals | Vukosi; Sibusiso | T16 | specified; acceptance pending | T16 is specified; P3.K4/P3.K5 and server work remain open. |
| V7 — Keystore P-256 signing, native salts/nonces and shared canonicalisation | Vukosi; Ipeleng; Sibusiso | T01, T03, T18 | partial; acceptance pending | Shared canonical/DER code and vectors are present on `main`; phone fixture and negative coverage remain review-gated. |
| V8 — ordered encrypted queue, truthful delivery state and duress-safe phone timeline | Vukosi; Sibusiso | T06, T07, T08, T09, T23 | specified; acceptance pending | App/server acceptance evidence is not recorded; §8 contains an open `contact_lost` decision. |
| V9 — 30-second speed-bucket heartbeat, no location, not a chain entry | Vukosi; Sibusiso | — (no dedicated §15 test) | specified; test gap | M5 is a measurement, not a §15 requirement test; P3.V6 remains open. |
| V10 — no boot receiver; reboot offers re-arm | Vukosi | — (no dedicated §15 test) | specified; test gap | P3.V1/V5 remain open; no reboot acceptance artifact is recorded. |

## Guardian

| Requirement | Owner | Test ID(s) | Status | Evidence / gap |
|---|---|---|---|---|
| G1 — one-time invite code/QR, expiry, attempts, rate limits and fresh PIN authorisation | Mutarisi; Khutso (delivery) | T12, T14, T24 | specified; acceptance pending | T14 covers brute-force limits; T12/T24 cover authorised changes; no passing result is recorded. |
| G2 — Google code-scanner module without camera permission | Mutarisi | — (no dedicated §15 test) | specified; test gap | P3.U1/U2 remain open; no dedicated scanner test exists in §15. |
| G3 — visible high-priority FCM alert with SMS fallback when available | Khutso (delivery); Mutarisi (receiver) | T07, T08 | specified; acceptance pending | P3.K4/P3.U5 remain open; no guardian-device screenshot is recorded. |
| G4 — guardian wording and call restriction until stand-down/closure | Mutarisi; Khutso | — (no dedicated §15 test) | specified; test gap | P3.U3/U5 remain open; no direct Txx exists. |
| G5 — guardian acknowledgement and status semantics | Mutarisi; Sibusiso | T12, T24 | specified; acceptance pending | P3.U3/U5 remain open; no acceptance evidence is recorded. |
| G6 — POPIA s18 notice on guardian acceptance | Mutarisi; Ipeleng | — (no dedicated §15 test) | specified; test gap | P3.S6/U2 remain open; no direct §15 test exists. |

## ANCHOR — server

| Requirement | Owner | Test ID(s) | Status | Evidence / gap |
|---|---|---|---|---|
| A1 — one hash chain per subject with random 128-bit subject IDs | Sibusiso | T01, T02, T06 | partial; acceptance pending | Contract v2 and shared canonical/Merkle work are on `main`; subject-ID acceptance is not recorded. |
| A2 — entry format, canonical form, Merkle, auth and time | Sibusiso; Ipeleng | T01, T02, T03, T05, T06, T21 | partial; acceptance pending | P3.A1 and P3.S2 work is on `main`; both-lead acceptance of the current contract is still required. |
| A3 — durable server-owned escalation, exactly once in effect | Sibusiso | T07, T08, T09, T10, T23 | specified; acceptance pending | P3.A3/A6 remain open; T08 is explicitly fallback-gated. |
| A4 — anchoring per §10 | Sibusiso | T22 | specified; acceptance pending | P3.A2 spike exists; full anchoring and receipt evidence are not recorded. |
| A5 — authenticated export and deletion semantics | Sibusiso; Ipeleng | T04, T19 | specified; acceptance pending | T04/T19 cover export integrity and auth; deletion acceptance remains open. |
| A6 — public proof and panel reveal only permitted information | Sibusiso; Ipeleng | T04, T19, T22 | specified; acceptance pending | P3.A5/S7 remain open; no end-to-end proof artifact is recorded. |
| A7 — `/healthz` operational state and missed-anchor alarm | Sibusiso | — (no dedicated §15 test) | specified; test gap | P3.A3/A6 remain open; §15 contains no direct health/alarm test. |

## Safety and security

| Requirement | Owner | Test ID(s) | Status | Evidence / gap |
|---|---|---|---|---|
| S1 — bank signal only on defined duress outcomes and with triggering outcome recorded | Sibusiso; Khutso (`sim_bank`) | T11, T16 | specified; acceptance pending | P3.K5 and S1 server work remain open; no passing result is recorded. |
| S2 — PIN-authorised guardian changes, duress no-ops/decoys and safe removals | Sibusiso; Ipeleng | T12, T13, T24 | specified; acceptance pending | P3.S3 and P3.A3 remain open. |
| S3 — no observable duress disclosure | Ipeleng; Vukosi; Mutarisi | T15, T19 | specified; acceptance pending | P3.S3/U3/S7 remain open; no pixel/timing or panel evidence is recorded. |
| S4 — no LLM, RAG or agent framework in the product | Ipeleng; all implementation owners | — (no dedicated §15 test) | specified; test gap | ADR-0038/spec prohibition exists; no repository-wide acceptance check is recorded in §15. |

## Privacy

| Requirement | Owner | Test ID(s) | Status | Evidence / gap |
|---|---|---|---|---|
| P1 — payload/salt separation, encryption at rest and verifiable deletion | Sibusiso; Ipeleng | — (no dedicated §15 test) | specified; test gap | P3.S6/A5 remain open; §15 has no direct storage/deletion test. |
| P2 — 90-day retention, dispute hold and post-deletion public fields | Sibusiso; Ipeleng | — (no dedicated §15 test) | specified; test gap | P3.S6/A5 remain open; retention semantics need a dedicated acceptance test. |

## Demo and deployment

| Requirement | Owner | Test ID(s) | Status | Evidence / gap |
|---|---|---|---|---|
| D1 — signed release APK, GitHub Release QR and clean-phone cold install | Vukosi; Mutarisi (backup) | T20 | specified; acceptance pending | P3.V4/V5 remain open; no release asset and clean-phone record is recorded. |
| D2 — thin APK → server → export → verify slice | Vukosi; Sibusiso; Ipeleng | — (no dedicated §15 test) | specified; test gap | P3.L4 remains open and blocked on server-min/verify-min; no direct Txx exists. |
| D3 — panel/verify page with SIMULATED labelling | Mutarisi; Ipeleng; Sibusiso | T19, T22 | specified; acceptance pending | P3.U4/S7/A5 remain open; no final panel/verify artifact is recorded. |

## Critique and next decisions

The matrix covers all 32 §2 requirements. It exposes 11 requirements without a dedicated §15 test: V3, V9, V10, G2, G4, G6, A7, S4, P1, P2 and D2. These are test-design gaps, not passes. The work order's T01–T20 range is stale against the current T01–T24 specification. P3.K3 should not be marked complete until Sibusiso and both leads accept the owner assignments, test gaps and status vocabulary.
