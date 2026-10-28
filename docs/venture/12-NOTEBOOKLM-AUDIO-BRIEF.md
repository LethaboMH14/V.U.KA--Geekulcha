# 12 · NotebookLM audio brief: the build, the problems, and the fixes

> **Status:** `PROPOSED`, 28 Oct 2026. Written by the Claude Code assistant for Sibusiso Khumalo. A prompt and source list for a NotebookLM Audio Overview. Nothing has been generated or shared.
> **Why the sources are chosen carefully:** NotebookLM's hosts repeat what the sources say. Files with known wrong claims are listed in §4 and must not be uploaded.
> **Before sharing the audio:** listen to all of it. AI hosts can still round a number, drop an n, or use a forbidden word. Check it against §2's rules.

---

## 1 · How to use it

1. Create a new notebook in NotebookLM.
2. Add the sources (§3): either upload the single source pack (`VUKA-source-pack-2026-10-28.md`, built from the files below), or add each raw link in §3 as a website source.
3. Open **Audio Overview → Customize**, and paste the prompt from §2. If the box won't take it all, paste the short version in §2.1.
4. If your NotebookLM offers formats and lengths, choose **Deep Dive** and the longer length.
5. Generate it, listen to all of it, and check it against the rules before anyone else hears it.

---

## 2 · The prompt

```text
Make a deep-dive audio overview of VUKA by PILOTCORE for university delegates, competition judges, and staff at banks and insurers. Cover what has been built, the problems it will run into, and how the team plans to solve them. Use only the uploaded sources. If a number is not in the sources, say "not measured" instead of estimating.

Structure:
1. The problem. A forced transfer looks like a willing one: the victim's own phone, face and PIN. Use 17,061 kidnappings in 2023/24 (SAPS via ISS Africa) and R2.4 billion lost to digital banking crime in 2025 (SABRIC). Mention "Thandi" only as an illustrative composite, not a real person.
2. The build. VIGIL, the Android app, listens from the moment the member activates it until they deactivate it. A sound such as breaking glass never raises an alarm by itself: it opens a quiet PIN check-in. The normal PIN sends nothing. At a check-in, the duress PIN shows the same screen and alerts the guardians the member chose. No audio is stored: a three-second buffer is judged on the phone and discarded. ANCHOR keeps a signed record for each person and puts a fingerprint on Hedera testnet, so a stranger can check when a record existed and that it has not changed. Say that the bank side is SIMULATED and that the ledger is testnet.
3. What is real today. The code is on the main branch. It ran end to end on Android in September on a demo build, as reported by the team. There has been no company-owned server since 15 October. Nobody has signed, endorsed or partnered with VUKA. The showcase demo is a simulated preview.
4. Problems and fixes, one at a time: staged distress, and the seven defence layers, including that VUKA does not detect staging; no server of record, and the plan for a company server in South Africa; weak scream detection (6.5%, n = 108) and false check-ins in a stress test, and the plan to measure a scream-specific rule and field recordings; the duress PIN gaps at sign-in and sign-out, and the specified fix; guardian alerts that arrive only while the app runs, and real push plus SMS fallback; listening that can stop silently; the unsigned server-discovery file; nothing escalating if the phone is off before anything is detected; the argument from a bank executive that duress PINs backfire; and the vendor checks banks will run (penetration test, POPIA, data residency).
5. Getting money back. How a covert signal during the incident and a record made at the time could help banks, insurers and the ombud. Explain the observe-only pilot. Say clearly that any improvement in recovery is not measured.
6. Close with the open decisions and what the team is asking for: feedback, a GBV reviewer, and introductions.

Rules: give every detection figure with its n, and say it was measured on public test sets, not in the field. Never say "proof of duress", "invisible", "always on", "court-admissible", "prevents crime", "in partnership with", or "live" about anything not running today. Say "tamper-evident", "discreet", "it proves when, not what", and "a missing record is never evidence against anyone". Treat the September hackathon event details in the sources as history. Keep the tone candid and curious, not salesy.
```

### 2.1 · Short version (if the box is too small)

```text
Explain VUKA by PILOTCORE to delegates and bank and insurer staff: the build (VIGIL app, ANCHOR record on Hedera testnet), what is real (no company server since 15 Oct, bank side SIMULATED, nobody signed), the problems (staged distress, scream detection 6.5% with n = 108, duress PIN gaps, alerts only while the app runs) and the fixes. Use only the sources; say "not measured" when unsure. Never say proof of duress, invisible, always on, court-admissible, prevents crime, in partnership, or live.
```

---

## 3 · Sources to add

All pinned to commit `f33bc0d07a9984f77eb0179520afcb4ee0661a4c`, so they don't change under the notebook. Base for each raw link: `https://raw.githubusercontent.com/LethaboMH14/V.U.KA--Geekulcha/f33bc0d07a9984f77eb0179520afcb4ee0661a4c/` followed by the path.

| # | Path | Why it's in |
|---:|---|---|
| 1 | `docs/venture/11-HARD-QUESTIONS.md` | Staged distress, getting money back, banks and insurers |
| 2 | `docs/venture/10-JUDGES-PITCH-SCRIPT.md` | The current two-minute story and its corrections |
| 3 | `docs/venture/09-AFRETEC-SHOWCASE.md` | What to show and the honest Q&A |
| 4 | `docs/STAGED-DURESS-DEFENCE.md` | The seven defence layers and the scenarios |
| 5 | `docs/venture/06-LAUNCH-ROADMAP.md` | The server state, the safety blockers in order, the phases |
| 6 | `docs/venture/research/2026-10-18-repo-build-state.md` | What is built, branch-only or missing, with code references |
| 7 | `docs/eval/cem1-measurements.md` | The detection measurements, with n |
| 8 | `docs/venture/01-B2B-ENTERPRISE.md` | Offers to banks and insurers, the pilot, the vendor gate |
| 9 | `docs/venture/07-EHUB-ALIGNMENT-AUDIT.md` | Conflicts found across the artefacts |
| 10 | `docs/EVIDENCE.md` | The verified figures and their sources |
| 11 | `docs/MASTER-CONTEXT.md` | The honesty ledger. Its §1–2 describe the September hackathon, which is history |
| 12 | `docs/venture/03-DISTRESS-SIGNALS.md` | Lawful and comfortable listening; the listening model (D7) |
| 13 | `docs/venture/04-SLA.md` | Service-level targets, all proposed, no baseline |
| 14 | `docs/venture/02-SAPS-AND-NGOS.md` | The SAPS and NGO route; nobody contacted yet |

**Optional web sources** (cited in the files above; not re-opened by the assistant on 28 Oct, so NotebookLM reads them as they are now):
- ISS Africa, 3 Dec 2024, kidnappings: https://issafrica.org/iss-today/south-africa-s-armed-robbery-problem-drives-kidnapping
- SABRIC, hijackers forcing banking-app transfers: https://www.sabric.co.za/hijackers-force-banking-app-transfers-in-rising-crime-trend/
- UK PSR, reimbursement requirement: https://www.psr.org.uk/publications/policy-statements/ps247-faster-payments-app-scams-reimbursement-requirement-confirming-the-maximum-level-of-reimbursement/
- Business Report, 18 Mar 2025, the ombud case (`REPORTED`; re-open before quoting): https://businessreport.co.za/business/2025-03-18-kidnapped-for-cash-the-growing-crisis-of-express-kidnappings-and-bank-liability-in-south-africa

---

## 4 · Do not upload

| File | Why |
|---|---|
| `docs/submission/SONKE-FIELDS.md` and the September submission PDF | Says the server is live and root #8 is LIVE-VERIFIED. Wrong (`07` §3, item 1) |
| `docs/WAR-ROOM-PITCH-5MIN.md` | Says the build doesn't share location. Wrong per the app (`07` §2, point 3) |
| `docs/venture/05-TWO-PITCHES.md` | §4 has three lines that no longer hold, listed in `10` §3 |
| `docs/SIBUSISO-HANDOVER.md` | The September state (Azure live), superseded since 15 Oct |
| The `vigil-demo` release notes | Describe 0.0.15 and an Azure server; the asset is 0.0.16 and the server is a presenter-PC tunnel |
| The old 0.0.15 explainer video | "ALWAYS ON", a "LIVE-VERIFIED" badge, and a secondary 110,074 figure |

---

## 5 · Review gates (`docs/MASTER-CONTEXT.md` §10)

1. **Fraud red-team:** the prompt requires the hosts to say VUKA doesn't detect staging.
2. **Build for use:** the prompt says what runs today, and what doesn't.
3. **Economic integrity:** the prompt forbids estimating; the sources carry tagged figures only.
4. **Privacy by design:** the sources are public repository files; no personal data beyond what the repository already holds.

Criteria **S**, **T**, **B**.
