# 10 · Judges' pitch script: VUKA Judges Pitch (about 2 minutes)

> **Status:** `PROPOSED`, 27 Oct 2026; slide 10 reframed 28 Oct. Written by the Claude Code assistant for Sibusiso Khumalo, from the saved judges' deck (Canva `DAHZIXLh5mk`, 10 slides, read 27 Oct), `05-TWO-PITCHES.md` §4 and `09-AFRETEC-SHOWCASE.md` §4. Every slide's Canva presenter notes now carry its spoken line, tags and answers (28 Oct). Nothing here has been said to anyone.
> **Criteria:** B (business case), T (feasibility and scale), S (ethics and honesty). I (impact on users) for the Thandi story. Community impact is not a letter in the published set (`07` §5).
> **Tags:** `FACT` · `ESTIMATE` · `ASSUMPTION` · `PROPOSED` · `REPORTED`, as in `docs/MASTER-CONTEXT.md` §7.

---

## 1 · Before anyone gives this

| Item | Effect on this script |
|---|---|
| **D12** guardian alert wording (GBV review) | Slide 3 says the wording is still to be reviewed. Slide 3 on screen quotes the alert copy; do not read the quote aloud until D12 is decided |
| **D7** listening model | Slide 4 says "from the moment she switches it on, until she switches it off", which is what the app does. The Home screen says "all the time". If asked, say that wording is under review |
| **D6** duress PIN at sign-in and sign-out | The script says "at check-in". The gap at sign-in and sign-out is open. If asked, say so |
| **D9** company-owned server | No phone demo on the day. Show the simulated preview only, labelled SIMULATED aloud (`09` §3, row 1) |
| **Slot length** | Two minutes is assumed. The format is unknown until the E-Hub answers (`09` §1). If shorter, cut slide 8 to one line. If longer, use the questions in `05` §6 and `09` §5 |
| **Presenters** (`05` §7, proposed) | Lethabo leads the story and the demo; Sibusiso answers the record and the money |

---

## 2 · The script

Spoken lines are plain. Stage notes give the tag, the source, and what to do if asked.

### Slide 1 · Title · 0:00

**Say:** "VUKA notices distress when you can't press a button, and leaves a record a stranger can check."

*Stage:* The name VUKA by PILOTCORE. "Draft for judges. Testnet and simulated bank, as stated." is on the slide.

### Slide 2 · The problem · 0:12

**Say:** "Imagine Thandi, an illustrative composite. Two men make her move money from her own phone. Her bank sees her phone and her PIN, so on paper it looks willing. South Africa recorded 17,061 kidnappings in 2023/24, up 264% since 2014/15. Digital banking crime cost R2.4 billion in 2025."

*Stage:* 17,061 and 264%: `FACT` (SAPS via ISS Africa, as recorded in `docs/EVIDENCE.md`). R2.4 billion: `FACT`, gross losses (SABRIC 2025). Thandi: illustrative composite. Do not add a 110,074 incident figure: `EVIDENCE.md` marks it secondary (⚑).

### Slide 3 · One evening · 0:26

**Say:** "VIGIL listens from the moment she switches it on, until she switches it off. Breaking glass doesn't raise an alarm by itself; it opens a quiet check-in. Her normal PIN sends nothing. At check-in, her duress PIN shows the same screen, and her guardians are alerted. That alert's wording is still under GBV review; none has agreed yet."

*Stage:* "Identical" is shown on screen in the simulated preview: one run, `FACT` for that run only. Design claims, not field results. Alert wording: `PROPOSED`, D12. If asked whether duress works at sign-in, say the gap is open (D6).

### Slide 4 · Lawful and comfortable · 0:42

**Say:** "No audio is stored. A three-second buffer is judged on the phone and discarded; only a label and a score leave it. Location is optional. Android only for now."

*Stage:* The buffer is read from `AudioPipeline.kt` (`ASSUMPTION` that it behaves that way on a device until a device run). "Lawful basis with counsel": `ASSUMPTION`, counsel reviewing (`05` §6).

### Slide 5 · What runs today · 0:55

**Say:** "The app and the anchor server are on main, and records are anchored on Hedera testnet. It ran end to end on Android in September, on a demo build. We have no company-owned server yet, so I'm showing the simulated preview."

*Stage:* Code on `main` and the testnet anchoring: `FACT`, repository. The September run: `REPORTED`, team handover record. No company server since 15 October: `FACT`, `docs/venture/06-LAUNCH-ROADMAP.md` §0. Do not read a topic number or a root number aloud (the root #7 and #8 conflict is open).

### Slide 6 · Measured, not claimed · 1:08

**Say:** "On public test sets, a check-in opens for 46.0% of glass (n = 139) and 54.6% of gunshots (n = 108), but only 6.5% of screams (n = 108). That's our weakest point, and our next three months of work."

*Stage:* All four figures: `FACT`, `docs/eval/cem1-measurements.md`, as recorded and not re-run today. Thresholds are uncalibrated, and field rates are not measured. The false-alarm stress test (1.8 to 7.3 per hour) is on the slide, and is not a field rate. Always give the n with the figure.

### Slide 7 · Scalable · 1:22

**Say:** "Every person has their own signed record. Public anchoring costs at most about R570 a month for the whole network, however many members there are."

*Stage:* R570: `ESTIMATE` (`scripts/economics_vigil_anchor.py`, hourly anchoring plus immediate roots capped at one a minute). It is the anchoring cost only, not the whole business.

### Slide 8 · Service levels · 1:30

**Say:** "Our service levels are proposed targets, with no measured baseline yet. Anything we don't measure counts as missed."

*Stage:* All targets `PROPOSED` (`docs/venture/04-SLA.md` §3). Do not say 99.5% as a promise (D9).

### Slide 9 · Community · 1:38

**Say:** "No organisation has endorsed us, and we haven't contacted SAPS. Our order: a CPSI debrief, the Wits Gender Equity Office, GBV design reviews, then SAPS."

*Stage:* `PROPOSED` (`docs/venture/02-SAPS-AND-NGOS.md`). The CPSI debrief is requested, not confirmed. Do not name any organisation as a partner or as endorsing us.

### Slide 10 · What we don't claim, and the ask · 1:50

**Say:** "We don't claim proof of duress, invisibility, court admissibility, or crime prevention. We ask for an observe-only pilot with a bank or insurer, an introduction to SAPS through CPSI, and partners to trial wearable triggers like rings and earrings, measured before we claim anything. Long term, our backend runs inside a bank's or insurer's own app."

*Stage:* Reframed 28 Oct (Sibusiso): VUKA is a safety, security and claims tool for banks and insurers, not a GBV-support product. The slide now asks for a bank or insurer pilot, a SAPS introduction through CPSI, and a wearable trial, with the long-term aim of running inside a partner's app. Every ask is `PROPOSED`; no bank, insurer or SAPS contact has been made. The not-claimed list is from `docs/MASTER-CONTEXT.md` §6.
- **Banks and insurers:** offers N1, N3 and I1 (`01` §5, `11`). **Long term (N2):** white label or deep link first, SDK later. Hard parts (`01` §5): microphone review inside a bank app, duress parity, no PIN logging in partner analytics, member mapping without banking data, one codebase first (D5).
- **SAPS:** data reaches police only by the member's own export or a logged lawful order (design rule, `PROPOSED`). Never say SAPS uses or buys VUKA.
- **Wearables (rings, earrings):** `PROPOSED`, not built, not measured. Start with a discreet manual trigger (a tap pattern), which needs no machine learning. Sensor detection only after an ethics-cleared trial that collects labelled data and publishes accuracy with n. Health data is likely special personal information under POPIA (`ASSUMPTION`; counsel). `STAGED-DURESS-DEFENCE.md` §7 rejected wearable signal correlation as an uncalibrated ML claim, so this needs a founders' decision record first.

**Total:** 357 spoken words, about 2 minutes 23 seconds at 150 words a minute (`ESTIMATE`; not timed aloud). For a tighter slot, cut the slide 8 line (18 words), the R2.4 billion sentence on slide 2 (8 words) and the long-term sentence on slide 10 (12 words): about 319 words, about 2 minutes 8 seconds.

---

## 3 · What I left out of `05` §4, and why

- **"Passed fourteen of fourteen steps on a rerun."** Not checked today, and the server it ran against is not running. Dropped.
- **"Against our cloud server."** The cloud account was disabled on 15 Oct. Replaced with the September demo-build line and the simulated preview.
- **"We're taking it to GBV organisations and a campus pilot next."** No organisation has agreed. Replaced with slide 9's honest order.
- **The demo line.** Replaced with the simulated preview. The phone demo needs D9.

## 4 · Words not to use in this script

Proof of duress · invisible · always on · court-admissible · prevents crime · "in partnership with" anyone · an accuracy figure without its n · "live" (for anything not running today) · endorsed, backed or partnered by an organisation that has not said so in writing (`02` §4).

## 5 · Review gates (`docs/MASTER-CONTEXT.md` §10), for this script

1. **Fraud red-team.** Pass. The script says what the record can't show, and says no absence of a record is evidence.
2. **Build for use.** Pass for a laptop with the simulated preview. Not passed for a phone, which needs D9.
3. **Economic integrity.** Pass for the figures spoken: R570 is labelled `ESTIMATE` with its script. No break-even or ask figure is spoken (D1, D2 open).
4. **Privacy by design.** Open. The alert wording (D12) and the listening wording (D7) are not settled. The location line is consistent with the app's copy as rendered on 26 Oct.

**Would a real user trust and use this?** A judge is more likely to trust a pitch that gives the weak number (6.5% for screams), the missing server, and the missing endorsements, than one that claims more. That is the basis of this script.

## 6 · Corrections to other files (not edited here)

- **`05-TWO-PITCHES.md` §4:** the three lines in §3 above need replacing before the file is used again.
- **`05-TWO-PITCHES.md` §3 and the funder deck cover:** "demonstrated at the Wits E-Hub" is written in the past tense before the showcase has happened. Change it to "to be demonstrated" or remove it.
- **Funder deck (saved):** "Tamper-proof by design" still needs its staged change to "Tamper-evident". The deck is not shown until that is committed.
