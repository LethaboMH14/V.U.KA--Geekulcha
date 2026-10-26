# 8 · Demo video: plan for 90 seconds, not a recording

> **Status:** `PROPOSED`, 25 Oct 2026. **No video has been recorded.** This file plans one. It does not claim that any footage exists.
> **Why it is blocked:** the video must show a real Android phone, a running server and a real sound. As of 25 Oct the repository records no company-controlled server (`06-LAUNCH-ROADMAP.md` §0), and the detection thresholds are uncalibrated (`docs/eval/cem1-measurements.md`). Recording it today would show a demo on a presenter's machine, which is the state the video must not hide.
> **Length:** 90 seconds at most (`PROPOSED`): short enough to loop on a showcase screen. No event currently requires a video.

---

## 1 · Rules for the video

- Every simulated element is labelled **SIMULATED** on screen and named aloud. The bank is `sim_bank`. The ledger is **Hedera testnet**.
- Do not show a real person's name, phone number, guardian's number, location or face. Use test accounts only.
- Do not show the 10111 number being dialled. Show the alert copy, and say "test-dialled" only if it was.
- Do not use "always on", "invisible", "proof of duress", "court-admissible" or "prevents crime" in voice or on screen (`MASTER-CONTEXT` §6).
- A failed take is not edited into a success. If a step fails, the video does not show it as working; re-record the step or cut it and say so in the description.
- Caption the device, the Android version, the date and the server address for every shot taken on the phone.
- No stock footage, no stock phone mock-ups, no music that implies danger.

---

## 2 · Preconditions (all must hold before filming)

| # | Precondition | Status on 25 Oct |
|---|---|---|
| P1 | A real Android phone that a budget user would own (2–3 GB RAM class, Android 7+; `minSdk` 24) | **Not available to this session** |
| P2 | A second phone as the guardian, with the guardian app open (push is not configured, so the guardian app must be open; `04` §4.1) | Not available |
| P3 | A server the team controls, reachable from both phones (D9) | **Not in place** (`06` §0) |
| P4 | Anchoring to Hedera testnet working, with the verify page reading the public mirror | Not verified today |
| P5 | The duress PIN gap fixed at sign-in and sign-out, **or** the video shows only the sign-in path that works and says the gap is open (D6) | Open |
| P6 | Listening model decided (D7), so the voice-over describes it correctly | Open |

If P1–P3 fail, the video is not recorded. A narrated screen capture of the simulated preview is a different artefact; if used, it is labelled as such and not called a demo.

---

## 3 · Script (target 88 seconds, with a 2-second margin)

| Time | On screen | Voice-over (draft; check against `MASTER-CONTEXT` §6) |
|---|---|---|
| 0:00–0:06 | Title: "VUKA: notices distress without a button, and leaves a record a stranger can check." Caption: "Testnet · simulated bank · sim_" | "When you can't press a button, VUKA listens for distress and asks you a quiet question." |
| 0:06–0:18 | Real phone: member taps **Activate** (the last button). Visible notification: "VIGIL is listening" | "You turn it on. A notification stays on screen the whole time." |
| 0:18–0:32 | A glass break played from a speaker next to the phone. Phone shows **Journey check** over the lock screen | "A sound never raises an alarm on its own. It asks first." Caption: "Thresholds uncalibrated. Screams are often missed." |
| 0:32–0:44 | **Normal PIN** entered. Screen: "Checked in". Cut to the guardian phone: **nothing arrives** | "Your normal PIN: nothing is sent to anyone." |
| 0:44–0:58 | **Duress PIN** entered on a second run. Screen: the same "Checked in". Guardian phone: alert arrives | "The duress PIN looks exactly the same. Your guardian is told: 'Don't call or text them. Call 10111.'" Caption: "Guardian app open required; push not yet configured." |
| 0:58–1:12 | Verify page: the member's record dropped on it. Every hash and signature checks, and the Hedera root is read from the public mirror | "A stranger checks the record in their own browser. We are not asked to be trusted." Caption: "Testnet. Shows when the record existed. Does not show what happened." |
| 1:12–1:24 | End card: "What it can't do: prove she was forced. What is not measured: field accuracy, battery, uptime." | "It proves when a signal existed. It can't prove what happened." |
| 1:24–1:30 | Logo, "Android only for now", contact | — |

Count the spoken words before filming; at 150 wpm, 90 seconds holds about 225 words.

---

## 4 · Shot list (what must be filmed, and how)

1. Phone screen recording of each step (not a photo of the screen).
2. A fixed camera on the phone and the guardian phone together, for the "nothing arrives" and "arrives" shots.
3. The verify page on a laptop, with the browser address bar visible.
4. Caption cards are added in editing, not filmed.
5. Keep every raw take. The description of the video links the raw takes if they are published.

---

## 5 · Acceptance (what "done" means for this video)

- [ ] Recorded on a real Android phone, with the device and Android version in the caption.
- [ ] Server address and date in the description.
- [ ] Every "SIMULATED" and "testnet" caption present.
- [ ] No "always on", "invisible" or "proof of duress" in the voice-over or captions.
- [ ] Runs 90 seconds or less.
- [ ] Reviewed by both founders, and by the GBV reviewer for the guardian alert copy (D12) before public release.
- [ ] Logged in `docs/build-log/entries/` with the raw takes' location.

Until every box is ticked, the video is not presented as the demo.

---

## 6 · What is needed from you

1. A real Android phone and a second one (or a borrowed one) for the shots.
2. A server decision (D9) so the verify page reads a live root.
3. The 46-second video in `docs/submission/SONKE-FIELDS.md`: where is that file? It is not in the repository (`docs/venture/07-EHUB-ALIGNMENT-AUDIT.md` §3 item 10).
