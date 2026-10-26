# 9 · AFRETEC E-Hub Tech Showcase, Wed 28 Oct 2026: prep plan

> **Status:** `PROPOSED`, 26 Oct 2026. Written by the Claude Code assistant acting for Sibusiso. Replaces the FNB App of the Year preparation, which Sibusiso dropped on 26 Oct.
> **Tags:** `FACT` · `ESTIMATE` · `ASSUMPTION` · `PROPOSED` · `REPORTED`, as in `docs/MASTER-CONTEXT.md` §7.

---

## 1 · What we know about the event

| Item | Value | Tag / source |
|---|---|---|
| Name | AFRETEC E-Hub Tech Showcase | `FACT`: Sibusiso's calendar entry, created 23 Oct |
| When | Wed 28 Oct 2026, from 15:00 SAST | `FACT`: same |
| Ends | 17:00 | `ASSUMPTION`: the calendar entry itself says the end time is not from the invitation |
| Where | Wits E-Hub | `FACT`: same |
| Audience | "AFRETEC conference delegates" | `FACT`: same |
| What AFRETEC is | A pan-African network of six universities; Wits takes part, and the E-Hub hosts its student-entrepreneurship work | `REPORTED`: Wits AFRETEC pages via search extract, 26 Oct |
| Format, time per team, judging | **Unknown.** A table where delegates walk up is the likeliest reading of "tech showcase" | `ASSUMPTION`: ask the E-Hub |
| Clash | Sibusiso's calendar also has an all-day MTN Hackathon showcase on 28 Oct | `FACT`: calendar. Who covers which is the founders' call |

**Ask the E-Hub before Tuesday evening:** the format (table or stage), the minutes per team, whether there is a screen and power at the table, whether anything is judged, and the end time.

## 2 · Which pitch and which deck

The delegates are university leaders, researchers and their partners (`ASSUMPTION`). They will look for **technical rigour, honest measurement, scalability across Africa and community impact**. That is the judges' pitch (`05-TWO-PITCHES.md` §4), not the investor pitch.

- **Deck:** the judges' deck, Canva `DAHZIXLh5mk`, once its staged corrections are approved and committed (`07-EHUB-ALIGNMENT-AUDIT.md` §6). **Do not show it before that:** the saved version still has Canva's generated text without the claim tags.
- **Investor deck** (`DAHY_VcrKis`): keep it ready for anyone who asks about the business; show it only after its staged edits are committed.

## 3 · What to show, ranked by what will actually work on Wednesday

| # | Demo | Works without our server? | Notes |
|---|---|---|---|
| 1 | **The real VIGIL UI on a laptop, in its SIMULATED preview** (`scripts/screens/showcase.cjs`) | **Yes**, fully offline once built | Shows Active → a check-in → "Checked in" (the same screen after the normal and the duress PIN) → the guardian view with "Don't call or text. Call 10111." **Say aloud:** "This is the app's real code running in its simulated preview. Nothing is signed or sent." Test PINs: normal 1357, duress 2468 |
| 2 | **The VUKA Ledger** (GitHub Pages: `https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/`) | Partly | The home page reads the public Hedera **testnet** mirror in the browser, so it shows live topic data if the venue network reaches it. Verifying a record needs our server for the Merkle path (`06` §0), so **don't verify a record live**. Open it on Tuesday from a normal network; if the topic has been cleared by a testnet reset (G31) or the mirror is down, say so rather than hide it |
| 3 | **The judges' deck on a loop** (second screen or tablet) | Yes | After approval only |
| 4 | **VIGIL on a real Android phone, end to end** | **No** | Needs a server the company controls (D9). Attempt it only if a server is up and the `WAR-ROOM-PITCH-5MIN.md` demo checklist passes on Tuesday. Otherwise don't. A failed live demo costs more than a labelled simulation |

## 4 · The two-minute walkthrough (`PROPOSED`)

Based on `05-TWO-PITCHES.md` §4, corrected for what the app actually does (`07` §2, point 3). About 250 words.

> **[Opener, 20 s]** Imagine a woman in a car with two men, her phone in their hands. Every safety app asks her to press a button. She can't.
>
> **[What it does]** VUKA listens on her phone from the moment she activates it until she switches it off, and Android shows the microphone dot the whole time. A sound like breaking glass never raises an alarm on its own: it opens a quiet check-in. Normal PIN, nothing is sent. Duress PIN, the screen looks exactly the same *[show it]*, and the people she chose are told: "Don't call or text them. Call 10111." If she can't answer, they're told too.
>
> **[What's real]** This is the app's real code in its simulated preview; nothing is sent from here. No audio is stored: a three-second buffer is judged on the phone and thrown away. Location is optional, shared with her guardians only after a check-in.
>
> **[Measured, honestly]** On public test clips a check-in opens for 46% of glass and 55% of gunshots, but only 6.5% of screams. That's our weakest point, and we publish it.
>
> **[Scale]** Every person has their own signed record, and the public fingerprint costs at most about R570 a month for the whole network, however many members.
>
> **[Ask]** We're looking for a university partner to run an ethics-cleared field evaluation of the detection, and for researchers in gender-based violence to review the design.

Figures: 46.0% (n = 139), 54.6% (n = 108), 6.5% (n = 108) are `FACT` from `docs/eval/cem1-measurements.md`. R570 is an `ESTIMATE` from `scripts/economics_vigil_anchor.py`. The ask is `PROPOSED`: the founders decide it.

## 5 · Questions this audience is likely to ask

| Question | Honest answer |
|---|---|
| Does it work outside South Africa? | It's built for South African law (POPIA, RICA, ECTA) and the guardian alert names 10111. Other countries' rules haven't been researched. Android only for now |
| How accurate is it? | The numbers above, with n, on public test sets. The field false-alarm rate is not measured |
| Is it running now? | The code is on our main branch. Our student cloud account was disabled, so there's no company server yet; we're moving to one in South Africa. Today's demo is the simulated preview |
| Is it open source? | The repository is public under the MIT licence (`FACT`, `LICENSE`). How the contributors' IP sits with the company is with counsel (D10) |
| Who are your partners? | Nobody has signed. No organisation has endorsed us, and we haven't approached SAPS yet |
| Why a blockchain? | Only so a stranger can check *when* a record existed without trusting us. Only a fingerprint goes on Hedera testnet, never names, places or event details |
| Is it AI? | One small on-device sound classifier. No generative AI. The machine never decides; a person answers every check-in |
| What if her phone is switched off? | If it's off before anything is detected, nothing escalates. We say so |

**Never say:** proof of duress; invisible; court-admissible; prevents crime; "in partnership with" anyone; any accuracy figure without its n; that the demo is live on a phone when it is the simulated preview.

## 6 · Checklist for Tuesday 27 Oct (`PROPOSED` owners)

- [ ] Sibusiso: approve or amend the two Canva previews, so they can be committed.
- [ ] Ask the E-Hub the questions in §1.
- [ ] On the presenter's laptop: build and run the simulated preview (`scripts/screens/README.md`, "Showcase"). Run it once with the network off.
- [ ] Open the Ledger home page from a normal network; note what the live strip shows.
- [ ] Decide whether to attempt the phone demo (§3, row 4). Default: no.
- [ ] Rehearse §4 against a timer, twice, and the §5 answers once.
- [ ] Do not hand out `docs/submission/SONKE-FIELDS.md` text: it says the server is live (`07` §3, item 1).
- [ ] Afterwards: a short build-log entry with what was shown and any contacts agreed. **No names or contact details without the person's written consent** (the repository is public).
