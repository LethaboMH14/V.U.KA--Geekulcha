# 3 · Stronger distress signals, lawful and comfortable

> **E-Hub insight 3 (15 Oct 2026):** *"We need to strengthen the signs of distress that trigger VUKA. The technology behind that must be lawful and people must be comfortable with having it on their phone."*
> **Status:** inventory `FACT` (read from the code and the eval files on 18 Oct 2026); everything in §4–§6 is `PROPOSED`. Legal statements are **the team's reading, not legal advice**; counsel questions stay open. Unchanged principles: **machines notice, people decide** (ADR-0034); no generative model, RAG or agent framework (ADR-0038). Serves T, S, U.

---

## 1 · The honest starting point

The signals VUKA has are weaker than the pitch has sometimes sounded, and that is the first thing to fix.

| Signal | Measured (method, n) | Source |
|---|---|---|
| **Screaming** opens a check-in | **6.5%** of clips (FSD50K eval, ruleset v2, **n = 108**). 27 of the 108 are too short to ever confirm under the 1.5 s voice rule | `docs/eval/cem1-measurements.md` |
| Glass | 46.0% (FSD50K, n = 139); ESC-50 held-out 11/16 (68.8%) on ruleset v1 | same; `docs/EVIDENCE.md` |
| Shatter | 72.9% (FSD50K, n = 70) | same |
| Gunshot | 54.6% (FSD50K, n = 108) | same |
| Shout / yell | **Not measured** (ESC-50 has no shouts) | `docs/EVIDENCE.md` |
| False check-ins | 1.8–7.3 per hour of ESC-50 everyday sounds at the prompt level; **a dense lab proxy, not a field rate** | `docs/eval/cem1-measurements.md` |
| Field false alarms, latency, battery, continuity, delivery, false `no_answer`, motion, duress-PIN recall under stress | **Not measured** | `docs/EVIDENCE.md` (M2–M8) |

**What this means:** a real scream is usually missed, and the phone may prompt far more often than people will tolerate. `ESTIMATE`: if the lab rate held in daily life (unknown, probably not), a 16-hour active day would bring roughly 74–264 check-ins; ADR-0046 itself estimates "on the order of 90 PIN checks a day". **The duress PIN, the Emergency button and the Quick Settings tile all work with no sound detected**, which is why the product holds up despite weak audio.

The FSD50K results (26 Sep) are not yet in `docs/EVIDENCE.md`, and `docs/NEW-CHAT-HANDOVER.md` still says screams and gunshots are unmeasured. Promoting them is step 1 below.

## 2 · Every signal VUKA has today (summary)

| Signal | Status |
|---|---|
| Sound: screaming, shout/yell, glass/shatter/breaking, gun-like (with look-alike exclusions) — YAMNet on the phone, 3 s in-memory ring buffer, nothing stored or sent but a label and score | built (`main`), thresholds `UNCALIBRATED` |
| CEM-1 graded evidence: quieter sounds become record-only evidence; context sounds (TV, crowd, children, laughter) count against a prompt | built in the app; ADR-0047 Proposed |
| Motion (impact, snatch, shake) as corroboration only; never opens a check-in alone | built; not measured |
| PIN behaviour (a retry, unusually slow entry) as evidence after a check-in | built; not measured |
| Emergency button and Quick Settings tile (member asks for a check-in) | built; ADR-0049 Proposed |
| Wrong PIN at a check-in: guardian heads-up, never duress | app on `main`; server on a branch |
| Duress PIN at any prompt | built, **except the sign-in screen** (known defect, D6) |
| `no_answer` (~70 s) and `contact_lost` (90 s without heartbeats) | server branch; `contact_lost` is **off by default** |
| Power-button help (4 presses in 3 s) | draft PR #114, native app only, not run on a device |
| Ruleset v3 (lower voice bars, short shouts confirm) | open PR #124, changes requested by Lethabo (14 and 16 Oct); short-call recall not measured |
| Trigger words, Bluetooth drop, route deviation | parked |

## 3 · Lawful: where the legal reading stands

| Question | Team position today | What is open |
|---|---|---|
| **RICA** — is on-device sound classification "interception"? | "Very likely falls outside" interception, because nothing is stored, transmitted or listened to by a person (`docs/STAGED-DURESS-DEFENCE.md`; `docs/RICA-POSITION.md`) | The position paper was written for a household appliance. It does not cover an always-on personal phone that hears **bystanders**. Counsel question Q1 (transient acquisition) is unanswered |
| **POPIA lawful basis** | The member's consent for their own data; the guardian's own consent with a s18 notice | Information Officer registration **prepared, not submitted**; privacy notice is a draft |
| **Special personal information** (s26–s33) | YAMNet identifies *what* sound, not *who*, so it isn't biometric voice recognition (`docs/security/POPIA-ONE-PAGER.md`) | ADR-0047 calls the guardian's "why" derived from special personal information, a contradiction to resolve. Whether the PIN-timing baseline is a "behavioural characterisation" under s1 is unexamined |
| **Cross-border transfer** (s72) | Planned region was South Africa North | The server runs in **UAE North** with no documented s72 basis, and the notice still says South Africa North |
| **Automated decisions** (s71) | "The bank decides" (ADR-0037) | No s71 analysis exists for the automatic bank signal on a duress PIN or `no_answer` |
| **Play Store policy** | The mic indicator is visible ("discreet, not invisible") | The stalkerware-versus-safety-app reading is an `ASSUMPTION` (Q-C6); the web research pass on current Play and Android rules lands as a follow-up commit on this PR |

## 4 · Stronger signals, in order (`PROPOSED`)

Each passes the four gates in `docs/MASTER-CONTEXT.md` §10 before it ships, and none ever decides a consequence on its own.

1. **Measure before adding.** Run the existing FSD50K harness for v2 against v3 (PR #124) on screams and shouts, tuned on even clip ids and validated on odd ones. Record a **consented** corpus of short calls in South African languages and accents ("Help!", "Nceda!", "Thusa!", "Help my!"). Run the venue false-alarm curve (taxi rank, TV, sport) and battery and continuity on a budget 2–3 GB phone. Publish to `docs/EVIDENCE.md` with n. *No new data from members; it unblocks the pitch, the SLA and any insurer.*
2. **"Check on me" timer.** The member sets an arrival time. If the journey isn't ended with a PIN by then, the normal check-in opens and the existing `no_answer` path follows. It covers freezing, whispered threats and silence, which no sound rule catches. Member-started, no audio, easy to consent to. Needs a new `sense` value and an ADR, as ADR-0049 did.
3. **A scream-specific rule:** one window at a higher bar, alongside PR #124's shorter voice confirmation, aimed at the 27 short scream clips that can never confirm today. Detection-threshold changes need **two-operator sign-off** (ADR-0036(8)); record it.
4. **Content-free tamper signals, only while armed or in an open incident:** the phone shutting down, airplane mode switched on, the SIM removed, plus battery level and network type in the heartbeat. They separate an attacker's power-off from a dead zone and feed `contact_lost` and guardian context, never a consequence alone. Then turn `contact_lost` on once heartbeat continuity is measured.
5. **Use YAMNet classes already weighted but never mapped:** smash/crash, tyre squeal and car alarm as supporting evidence; fireworks and children shouting as context *against* a prompt. Same model; nothing new leaves the phone.
6. **The phone's own media playback as context against a prompt.** A scream in the member's own video is the most common everyday false alarm, and "is media playing" is content-free.
7. **Motion upgrades:** look 10 s after a sound as well as before (a grab after a scream), and a "phone thrown" pattern (free fall, then impact). Still corroboration only; measure first.
8. **Optional false-alarm labelling** after every check-in, identical for both PINs: "What was it? TV / sport / kids / skip". Answers after a duress PIN are ignored. This builds the field calibration data insurers will ask for, with consent.
9. **Bank-side signals during an open incident** (offer B in [`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)): a new beneficiary, a large transfer or a limit increase raise the evidence level only; the bank decides. Gated by G36–G38.
10. **Keep parked:** on-device keyword spotting (needs counsel on RICA and a new ADR superseding ADR-0038(2)), and route deviation.

## 5 · Comfortable: fixes that come before any new signal

- **Fix the sign-in duress defect** (D6, [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §4).
- **Tell the member when listening stops unexpectedly.** The Android service is not restarted if the system kills it (`START_NOT_STICKY`), so today listening can stop silently.
- **Correct the onboarding promise.** "Your guardians only hear from VIGIL if you don't answer, or if you use your duress PIN" is incomplete: a wrong PIN at a check-in also sends a heads-up.
- **Measure pocket presses** of the one-tap Emergency button, or restore a hold.
- **Rewrite the privacy notice** for what the app now does: listening until paused, UAE North hosting, context sounds, evidence tallies, PIN timing, the guardian's "why", wrong-PIN alerts.
- **Refresh the RICA paper** for a personal phone and bystanders, and send Q1, s71 and the PIN-timing question to counsel.

## 6 · Decision D7: the default listening model

ADR-0046 (always listening from set-up until paused with a PIN) is built in the app but still **Proposed**, and it conflicts with the honesty ledger's "journey mode, not always on" and with the privacy notice. The app says "Listening on this phone, all the time". Options:

| Option | For | Against |
|---|---|---|
| Accept ADR-0046, and say it plainly: *"listens while active, until you pause it with your PIN; a restart stops it"* | No button to remember before a bad moment | Battery and false check-ins unmeasured; bystander exposure for longer; harder RICA reading |
| Return to **journey mode** as the default, with "check on me" (§4 item 2) | Shorter exposure, fewer prompts, easier consent | The member must remember to start it |
| **Member chooses at set-up**, journey mode suggested | Comfort is the member's call | Two modes to test and explain |

Recommendation: **the member chooses, journey mode suggested**, until battery and false check-ins are measured on a budget phone. Lethabo owns this decision.
