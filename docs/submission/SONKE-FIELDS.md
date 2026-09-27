# VUKA — Sonke submission fields (paste-ready)

Upload with these fields: **VUKA-GKHack26-submission.pdf** (16 slides) and the **demo video** (46 s MP4).

---

## Project name
VUKA — you don't have to ask

## One-line summary
An Android safety app that notices duress without a button, alerts a guardian silently, and keeps a record anyone can check on a public ledger (Hedera).

## Team (Team SONAR — 7 members, 4 universities)
- Lethabo Hoaeane (UNISA) — Co-lead: architecture, product, UX
- Sibusiso Khumalo (Wits) — Co-lead: backend, ledger, CI, Azure deployment
- Babatunde Adelusi (University of Pretoria) — Business case, economics, pitch
- Mutarisi Chibaya (University of Pretoria) — Android app and guardian screens
- Khutso Mothopa (Wits) — Requirements, evidence, traceability
- Vukosi Khoza (Wits) — On-device sensing, signing, measurement
- Ipeleng Constance Modise (TUT) — Threat model, secure lifecycle, privacy

## Problem statement
A coerced transfer authenticates exactly like a voluntary one, and no party holds a verifiable record of the coercion. The victim is forced to unlock her phone and authorise the payment; the bank's record shows an approved transfer; insurers verify coercion after the fact, and the ombud has held that a victim who surrendered credentials under duress had no grounds to hold the bank liable (NFO via FAnews, 19 Sep 2024). Every safety tool needs a free hand — a panic button to press or a duress code to type. The pressure is rising: ASISA members detected 16,520 fraud and dishonesty cases in 2024, up from 8,931 in 2022; ombud banking formal cases rose 25.4% to 743 a month in 2025 (NFO); one formal ombud case costs R4,962.38 (OBS 2024); kidnappings reached 17,061 in 2023/24, 44% during a hijacking (SAPS via ISS). South Africa has no mandatory reimbursement. We do not invent the size of the coerced-transfer problem: no one publishes it, and a pilot must measure it.

## Solution and features
VUKA notices duress without a button — and proves when it happened.
- Always on after set-up: the phone listens with an on-device sound model; audio never leaves the phone.
- A scream, shout, breaking glass or gunshot opens a quiet Journey check over the lock screen. A sound alone never alerts anyone.
- Normal PIN: no alert. Duress PIN: the same "Checked in" screen, and guardians are alerted silently. Wrong PIN: guardians get a heads-up (never treated as duress). No answer: guardians are alerted after the window.
- Hold for help (2 s) or the Quick Settings tile opens the same check-in without any sound.
- The guardian sees who and why in words, a map of the phone's location during the alert, and one button to call 10111. The member sees "Guardian added" when an invite is accepted.
- Every event is signed on the phone, chained on the server, and a 33-byte Merkle root is anchored on Hedera (testnet). Anyone can paste a record into the public ledger and check it in their own browser — no need to trust us.
- Live today: server on Azure; root #8 LIVE-VERIFIED on Hedera testnet; wrong-PIN heads-up tested live (5/5); the server sends real sign-up email codes (VIGIL's code step is still simulated). Push notifications are not configured in this build. Android only for now, not iOS.

## Security considerations
- Threat model with coercion-specific threats (an attacker holding the unlocked phone, watching the PIN, forcing the normal PIN, staged fraud, a compromised server); 79 tracked security controls on a public scorecard.
- The duress PIN shows the same screen as the normal PIN; a sound only asks, the machine never decides what happens to a person.
- Signed events (P-256 in Android Keystore), signed server entries (Ed25519), single-use nonces with a ±120 s window, TLS 1.3, payloads encrypted at rest (AES-256-GCM), only 33-byte roots on chain.
- Secret scanning on every commit and in CI (Gitleaks); Semgrep, OSV-Scanner and dependency audits in CI; leaked keys from earlier repositories rotated and history purged.
- Privacy (POPIA): no audio kept; location only while a guardian alert is open; deletion removes the payload and keeps the hash; consent is the basis; Information Officer registration prepared, not submitted.
- Post-quantum: a hybrid ML-DSA-65 + Ed25519 root attestation is implemented and tested as a demonstration on a real anchored root (28 Python and 171 JavaScript tests); not yet pinned in production.
- Limits we state: no independent penetration test yet; detection thresholds uncalibrated; Hedera testnet, not mainnet.

## Impact
The person under threat gets help without a free hand, and a record made at the time instead of her word against a payment. Her guardian is told silently, with the reason in words. Insurers get a way to tell a recorded coercion from a story; banks can settle disputes on evidence instead of escalating them (~R4,962 and ~61 days per ombud case). A pilot measures false check-ins per armed hour, missed events, guardian response time, claims-handling time with and without a record, and fraud leakage before any saving is claimed.

## Go-to-market strategy
- Who pays: the member pays nothing. A partner insurer pays about R20 per member per month (ASSUMPTION), priced between FNB GuardMe (R19.90) and iTOO [My]Cylution (from R22.50); a bank pays about R15 per dispute case (PROPOSED).
- Phase 1 — pilot: one insurer, 5,000 members, 12 months; one bank to cost a dispute. Success test: the insurer saves at least R240 per member per year.
- Phase 2 — switch-on: the partner turns VUKA on inside its own app. On a reference adoption curve, break-even (10,973 members at R20, ESTIMATE) is about 1.1% of a 1-million-customer base, around 4.1 months after switch-on (reference, not a forecast).
- Phase 3 — scale: more insurers and banks; ledger fees stay fixed (estimated ≤ R569.47/month at any member count).
- First-year funding ask: R1,884,583 (team R1.8m, product and ledger R80,918, one-off R3,665; ESTIMATE).

## Links
- Code: https://github.com/LethaboMH14/V.U.KA--Geekulcha
- Public ledger (verify a record): https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/ledger/
- Android app (VIGIL 0.0.15): https://github.com/LethaboMH14/V.U.KA--Geekulcha/releases/download/vigil-demo/VIGIL.apk
- Demo video: uploaded with this submission (46 s)
