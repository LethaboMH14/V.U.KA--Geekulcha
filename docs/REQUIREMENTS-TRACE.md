# VUKA-2 requirements trace

## Purpose and reading rules

This matrix traces every requirement in `docs/VUKA-2-SPEC.md` §2 to an accountable owner, §15 tests that directly exercise a stated clause, and the current evidence status. The test column states the clause each test covers; a test of a neighboring workflow is not credited. `specified` means the requirement exists in the accepted specification, not that implementation or acceptance passed. `partial` means some implementation exists but acceptance is not recorded. `test gap` means one or more defining clauses have no direct §15 oracle; a row may have a test for a narrower related clause. A dash means no directly applicable §15 test was identified.

The work order requested T01–T20, but the accepted specification now defines T01–T24 plus T30, T47 and T50–T52 (ADR-0041). This trace uses later tests only where their literal oracle exercises a §2 clause. The range mismatch is a documentation gap; test numbering is not a continuous T01–T52 suite.

## VIGIL — phone

| Requirement | Owner | Direct §15 test and scope | Status | Evidence / gap |
|---|---|---|---|---|
| V1 — foreground explicit arming; microphone and notification permissions required | Vukosi | T17 — permission denial and explanation only | specified; test gap | T17 does not check explicit foreground user action or successful arming with both permissions. P3.V1/V4 remain open. |
| V2 — granted foreground-service types and persistent neutral notification | Vukosi | — | specified; test gap | T17 covers denial behavior, not the actual service-type selection or persistent neutral notification. P3.V1/V3 remain open. |
| V3 — YAMNet window, input shape, label mapping and uncalibrated thresholds | Vukosi | — (no dedicated §15 test) | specified; test gap | P3.V2 exists, but §15 has no direct Txx for the classifier contract. |
| V4 — above-threshold event followed by check-in | Vukosi; Sibusiso | — | specified; test gap | T15 covers normal/duress parity; T17 covers permission denial. Neither proves threshold → `signal_detected` → visible check-in → `opened`. |
| V5 — normal and duress check-in remain observationally indistinguishable | Vukosi; Ipeleng | T15 | specified; acceptance pending | T15 is specified; no result artifact is recorded. |
| V6 — duress PIN at any prompt raises a signed signal while the prompt looks normal | Vukosi; Sibusiso | T16 — settings prompt; T09/T47 — late check-in duress; T52 — journey end | specified; acceptance pending | Guardian change, deletion and recovery prompts, plus signature evidence across prompts, still lack complete direct coverage. |
| V7 — Keystore P-256 signing, native salts/nonces and shared canonicalisation | Vukosi; Ipeleng; Sibusiso | T01 — canonical bytes; T03 — phone signature verification; T18 — native salt generation | partial; acceptance pending | Shared canonical/DER code is on `main`; contract vectors remain on PR #51. Native nonce source and all event signing still need direct evidence. |
| V8 — ordered encrypted queue, truthful delivery state and duress-safe phone timeline | Vukosi; Sibusiso | T30 — member My Record pre-incident prefix only | specified; test gap | T30 narrows what My Record exposes during an incident, but does not prove encrypted local ordering, truthful receipt-state display or suppression of guardian acknowledgements; T06–T09/T23 cover different server behavior. |
| V9 — 30-second speed-bucket heartbeat, no location, not a chain entry | Vukosi; Sibusiso | — (no dedicated §15 test) | specified; test gap | M5 is a measurement, not a §15 requirement test; P3.V6 remains open. |
| V10 — no boot receiver; reboot offers re-arm | Vukosi | — (no dedicated §15 test) | specified; test gap | P3.V1/V5 remain open; no reboot acceptance artifact is recorded. |

## Guardian

| Requirement | Owner | Direct §15 test and scope | Status | Evidence / gap |
|---|---|---|---|---|
| G1 — one-time invite code/QR, expiry, attempts, rate limits and fresh PIN authorisation | Mutarisi; Sibusiso | T12 — PIN-gated guardian change; T14 — brute-force limits | specified; acceptance pending | Single use, 10-minute expiry, five-attempt limit and QR acceptance need direct evidence; T24 addresses later guardian removal, not invite validity. |
| G2 — Google code-scanner module without camera permission | Mutarisi | — (no dedicated §15 test) | specified; test gap | P3.U1/U2 remain open; no dedicated scanner test exists in §15. |
| G3 — visible high-priority FCM alert with SMS fallback when available | Khutso (delivery); Mutarisi (receiver) | T07/T08 — visible guardian alert after timeout/restarts | specified; acceptance pending | FCM priority and SMS fallback have no direct §15 test; P3.K4/P3.U5 remain open. |
| G4 — guardian wording and call restriction until stand-down/closure | Mutarisi; Khutso | — (no dedicated §15 test) | specified; test gap | P3.U3/U5 remain open; no direct Txx exists. |
| G5 — signed guardian acknowledgements and signed notification-token updates | Mutarisi; Sibusiso | — | specified; test gap | T12/T24 cover guardian membership changes, not guardian-key signatures on acknowledgements or token updates. P3.U3/U5 remain open. |
| G6 — POPIA s18 notice on guardian acceptance | Mutarisi; Ipeleng | — (no dedicated §15 test) | specified; test gap | P3.S6/U2 remain open; no direct §15 test exists. |

## ANCHOR — server

| Requirement | Owner | Direct §15 test and scope | Status | Evidence / gap |
|---|---|---|---|---|
| A1 — one hash chain per subject with random 128-bit subject IDs | Sibusiso | — | specified; test gap | T01/T02 exercise canonical/Merkle algorithms and T06 retry behavior, not subject isolation or ID entropy. Contract v2 remains on PR #51. |
| A2 — entry format, canonical form, Merkle, auth and time | Sibusiso; Ipeleng | T01/T02 — canonical/Merkle; T05/T21 — key/signature integrity; T06 — retry/replay | partial; acceptance pending | Shared JS modules are on `main`; Python contract v2 and vectors remain on PR #51. Full field, auth and clock rules need acceptance evidence. |
| A3 — durable server-owned escalation, exactly once in effect | Sibusiso | T07–T10, T23; T47/T50–T52 — specified fallback, closure and duress-end paths | specified; acceptance pending | T51 covers a detection without `opened`; T50 covers member-ended closure/contact loss; T47 covers wrong-PIN deadline; T52 covers end-journey duress. None is recorded as passed; P3.A3/A6 remain open. |
| A4 — anchoring per §10 | Sibusiso | — | specified; test gap | T22 rejects mismatched receipts/topics/keys; it does not prove submit, mirror read-back, cadence or alarm behavior. P3.A2 is a spike only. |
| A5 — authenticated unpaginated genesis-to-head export with payloads, salts, proofs and receipts | Sibusiso; Ipeleng | T04 — tamper detection; T19 — subject auth; T30 — PIN-gated, pre-incident prefix during hold | specified; contract clarification needed | §2's unconditional genesis-to-head wording conflicts with accepted §9/ADR-0041's member-device prefix during an open incident and six-hour hold. Do not claim both. Sibusiso, Ipeleng and both leads must clarify the contract; completeness, order and all export fields still need direct evidence. |
| A6 — public proof reveals no personal data or chain segment | Sibusiso; Ipeleng | T19 — public proof/panel restrictions; T22 — receipt binding | specified; acceptance pending | T04 concerns an authenticated export, not public proof. P3.A5/S7 remain open. |
| A7 — `/healthz` operational state and missed-anchor alarm | Sibusiso | — (no dedicated §15 test) | specified; test gap | P3.A3/A6 remain open; §15 contains no direct health/alarm test. |

## Safety and security

| Requirement | Owner | Direct §15 test and scope | Status | Evidence / gap |
|---|---|---|---|---|
| S1 — bank signal only on defined duress outcomes and with triggering outcome recorded | Sibusiso; Khutso (`sim_bank`) | T11 — send/no-send timing; T16 — settings duress; T47/T50/T52 — late duress, all-normal contact loss and duress journey end | specified; acceptance pending | Trigger label in `bank_signal_sent` payload is not explicitly asserted by these oracles; PR #51's schema patch requires subject_id and triggering_outcome and marks the receipt sim: true; no service-level hold/release/idempotency oracle is evidenced, so P3.K5 remains open. |
| S2 — PIN-authorised guardian changes, duress no-ops/decoys and safe removals | Sibusiso; Ipeleng | T12, T13, T24 | specified; acceptance pending | T30/T52 cover export and journey-end PIN gates, not the guardian-change/deletion clauses defining S2. P3.S3 and P3.A3 remain open. |
| S3 — no observable duress disclosure | Ipeleng; Vukosi; Mutarisi | T15, T19; T30/T47/T52 — specified phone-response parity in additional paths | specified; acceptance pending | T30 requires byte-identical held exports and T47/T52 use the T15 harness; no pixel/timing, panel or production evidence is recorded. P3.S3/U3/S7 remain open. |
| S4 — no LLM, RAG or agent framework in the product | Ipeleng; all implementation owners | — (no dedicated §15 test) | specified; test gap | ADR-0038/spec prohibition exists; no repository-wide acceptance check is recorded in §15. |

## Privacy

| Requirement | Owner | Direct §15 test and scope | Status | Evidence / gap |
|---|---|---|---|---|
| P1 — payload/salt separation, encryption at rest and verifiable deletion | Sibusiso; Ipeleng | — (no dedicated §15 test) | specified; test gap | P3.S6/A5 remain open; §15 has no direct storage/deletion test. |
| P2 — 90-day retention, dispute hold and post-deletion public fields | Sibusiso; Ipeleng | — (no dedicated §15 test) | specified; test gap | P3.S6/A5 remain open; retention semantics need a dedicated acceptance test. |

## Demo and deployment

| Requirement | Owner | Direct §15 test and scope | Status | Evidence / gap |
|---|---|---|---|---|
| D1 — signed release APK, GitHub Release QR and clean-phone cold install | Vukosi; Mutarisi (backup) | T20 | specified; acceptance pending | P3.V4/V5 remain open; no release asset and clean-phone record is recorded. |
| D2 — thin APK → server → export → verify slice | Vukosi; Sibusiso; Ipeleng | — (no dedicated §15 test) | specified; test gap | P3.L4 remains open and blocked on server-min/verify-min; no direct Txx exists. |
| D3 — panel/verify page with SIMULATED labelling | Mutarisi; Ipeleng; Sibusiso | T19 — public panel disclosure; T22 — receipt mismatch rejection | specified; acceptance pending | Neither test verifies visible and spoken SIMULATED labelling. P3.U4/S7/A5 remain open. |

## Critique and next decisions

The matrix covers all 32 §2 requirements. Seventeen rows still lack a §15 oracle for their complete defining behavior: V2, V3, V4, V8, V9, V10, G2, G4, G5, G6, A1, A4, A7, S4, P1, P2 and D2. T30 partially covers V8 but does not close its queue/delivery clauses. The other 15 rows have a test for at least one clause; their evidence/gap cells identify clauses that still need verification. V1 is one example: T17 checks permission refusal, not explicit arming. No row is labelled passed. The work order's T01–T20 range is stale against the accepted test catalogue. PR #70 clarified the A5 wording on main; the pre-incident hold remains specified, while implementation and acceptance evidence remain open. Sibusiso and both leads must accept owner assignments and gap disposition before P3.K3 is marked complete.
