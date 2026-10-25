# 7 · E-Hub alignment audit: what matches, what contradicts, what is missing

> **Status:** `PROPOSED`, 25 Oct 2026. Written by the Claude Code assistant acting for Sibusiso Khumalo (second lead), from the repository on `main` at `origin/main` (7e4648d) and the Canva investor deck `DAHY_VcrKis` as read on 25 Oct. Nothing here is decided; both founders review it.
> **Scope:** the six E-Hub feedback points (`docs/venture/README.md` §2) checked against every artefact that reaches a partner, judge or investor: the 3-minute and 5-minute pitch files, the Canva investor deck, the demo video (none exists yet), the app, the dashboard, and the Sonke submission fields.
> **Tags:** `FACT` (checked by a command or a file read, named), `ESTIMATE`, `ASSUMPTION`, `PROPOSED`, `REPORTED` (from a search extract or a third party, not re-checked first-hand).

---

## 0 · Summary

- **The B2B direction (point 1) is the best-supported point.** The investor deck, the 3-minute pitch and `01-B2B-ENTERPRISE.md` all say "partner pays per member". Nothing yet shows an integration surface, a named bank or insurer team, or a signed letter of intent.
- **Points 2 (SAPS and NGOs) and 4 (SLA) are missing from every pitch artefact.** The plans exist (`02`, `04`), but no deck slide, pitch line or judges' slide carries them. The investor deck has no SLA slide and no SAPS/NGO slide.
- **Point 3 (lawful, comfortable distress signals) is partly answered.** "No audio stored" and "label and score only" are consistent everywhere. "Listening only after Activate" is consistent in the pitches but **contradicted** by the Sonke fields ("Always on after set-up"). The listening model is an open decision (D7).
- **Point 5 (two pitches) is half done.** The investor deck exists. The judges' deck did not exist before today (see §6 for the draft outline).
- **Point 6 (launch) is missing from the decks.** `06-LAUNCH-ROADMAP.md` has dated phases, but the investor deck's only launch content is a "90 days / 5,000 members / three partners" line.
- **The most urgent conflict is in the Sonke submission fields, not the pitches:** they say the server is live on Azure and that root #8 is LIVE-VERIFIED. The repository says there has been no company-controlled server since 15 Oct (`06-LAUNCH-ROADMAP.md` §0, `04-SLA.md` §4.1). That text must not go to the FNB submission (due 26 Oct 23:59 SAST, per your message) until it is corrected.

---

## 1 · Figures re-checked on 25 Oct (`FACT` unless tagged)

| Figure | Where it is used | Check | Result |
|---|---|---|---|
| Break-even at R20 | investor deck slide 8 (placeholder); `05` §5; `MASTER-CONTEXT` §8 | `python3 -I scripts/economics_vigil_anchor.py` on `main` | **10,973** members, with 5 stipends (`FACT`, script output). **`05-TWO-PITCHES.md` §5 says `main` prints 10,901. That is stale.** `main` prints 10,973. The two-founder case (4,670) is a scratch copy and is not on `main` (D1 is still open) |
| Product-only break-even | `MASTER-CONTEXT` §8 | same script | 469 members (`FACT`) |
| Contribution per member | investor deck slide 7 | same script | R14.28 per member per month after R5.72 variable cost (`ESTIMATE`) |
| Anchoring ceiling | all pitches | same script | R569.47 a month at most, whatever the member count (`ESTIMATE`) |
| Actuary test | investor deck, `01` §4 | same script | R240 per member per year, 12 × R20 (`ESTIMATE`) |
| Bank per-case break-even | `01` §6 | same script | 10,446 cases a month at R15 (`ESTIMATE`, `PROPOSED` price) |
| Kidnappings 17,061 (2023/24) | all pitches | `docs/EVIDENCE.md` | `FACT` per `MASTER-CONTEXT` §8. Not re-opened today |
| R2.4bn digital banking crime (2025) | all pitches | `docs/EVIDENCE.md` | `FACT` per `MASTER-CONTEXT` §8. Not re-opened today |
| Detection numbers | 3-minute pitch, `05` §6 | `docs/eval/cem1-measurements.md` | Glass 46.0% (n = 139), gunshot 54.6% (n = 108), shatter 72.9% (n = 70), scream 6.5% (n = 108) (`FACT`, as recorded there; not re-run today) |
| Topic and root | 5-minute pitch; Sonke fields | pitch: "message 7"; Sonke: "root #8" | **Conflict.** Two different root numbers for the same topic (`0.0.10687280`). Not resolved from the repository |

---

## 2 · The six points against each artefact

Legend: ✅ matches · ⚠️ partial · ❌ contradicts · ⬜ missing.

### Point 1 · B2B enterprise, integrate with insurers and Nedbank

| Artefact | Status | Notes |
|---|---|---|
| Investor deck (`DAHY_VcrKis`) | ⚠️ | Slide 7 "The B2B model": per-member licence, integration fee "(proposed)". No named team, no integration surface, no "what the partner's systems do" |
| 3-minute pitch (`docs/WAR-ROOM-PITCH.md`) | ✅ | Beat 6: insurer R20 per member; bank per case; the claim-verification logic (Part 2) |
| 5-minute pitch (`docs/WAR-ROOM-PITCH-5MIN.md`) | ✅ | Beats 6A–6B, 8. Beat 8 asks for "one insurer, five thousand members, twelve months" |
| App | ⬜ | Copy is member-first. The only partner-facing text is the share flow ("Share with a bank or insurer", `app/src/ui/account.tsx`). No partner or enterprise onboarding surface |
| Dashboard | ✅ | "For banks and insurers" nav link and section (`dashboard/index.html` line 36, 254) describe the file-based verify flow. It does not describe an integration |
| Sonke fields | ⚠️ | "Insurers get a way to tell a recorded coercion from a story" (`Impact`). No integration described |

**Missing:** a one-page integration description (webhook `BankSignal` for N1, claim-verification flow for I1, what the partner must build), a named first team (`D3`, still open), and a signed letter of intent. None of these is in any artefact.

### Point 2 · SAPS and aligned South African NGOs

| Artefact | Status | Notes |
|---|---|---|
| Investor deck | ⬜ | No slide, no line |
| 3-minute pitch | ⬜ | Not mentioned |
| 5-minute pitch | ⬜ | Not mentioned |
| Judges' pitch (`05` §4) | ⚠️ | "We're taking it to GBV organisations and a campus pilot next." No SAPS line, no named organisation |
| App | ✅ | Guardian alert copy names 10111 (spec G4). `D12` says the wording needs a GBV reviewer first |
| Dashboard | ⬜ | Not mentioned |
| Plan (`02`) | ✅ | Order of approach, ranked map, owners and dates. **Status: no organisation contacted, none has endorsed** (`02` header) |

**Missing:** a slide that says exactly where we are on this (CPSI debrief requested or not; no GBV reviewer yet; no SAPS contact). **Rule:** "no endorsed by / backed by / in partnership with" until the organisation says so in writing (`02` §4).

### Point 3 · Lawful, comfortable distress signals

| Artefact | Status | Notes |
|---|---|---|
| 3-minute pitch | ✅ | Beat 4: "a sound never alerts anyone … the person answers, or the silence does." Says Android only |
| 5-minute pitch | ✅ | Beat 4D and Part 2 "Everyday noise vs real distress": listening only after Activate; each sound class has its own bar; uncalibrated; scream weakness stated. Measured numbers quoted |
| Investor deck | ⚠️ | Slide 5 (product) "Clear on what it can't do" and "No audio is recorded or uploaded". Says "Listening" on the phone. **No listening-model sentence**, no lawful-basis sentence |
| Sonke fields | ❌ | "**Always on after set-up:** the phone listens with an on-device sound model". That contradicts the pitches ("listening only after Activate") and `03` / D7 (listening model still open). Also "Hold for help (2 s) or the Quick Settings tile" is not in the pitches |
| App | ⚠️ | The account screen says listening starts and pauses with a user action; the detail depends on the listening model in `03` §6 |
| Plan (`03`) | ✅ | Full analysis; **D7 still open** (listening until paused, ADR-0046, versus journey mode as default) |

**Contradictions to resolve:**
1. "Always on" (Sonke) versus "listening only after Activate" (5-minute pitch). Pick one after D7 is decided. Until then, use "listens while you have Journey mode on" and say that D7 is open.
2. **Location.** The 5-minute pitch Part 2 (Privacy) says "This build doesn't share location. Don't claim it." The app's guardian screen shows a map when the alert has a location (`app/src/ui/guardian.tsx` lines 690–695; `app/src/ui/map.tsx`), and `app/src/ui/account.tsx` describes location "sent for 30 minutes after a check-in (PROPOSED, ADR-0048)". The Sonke fields say "a map of the phone's location during the alert". **Conflict, not resolved from the repository.** Check on a device before any privacy line about location goes out.

**Missing:** a sentence on the lawful basis (RICA party exception, counsel reviewing; `05` §6), and a sentence on comfort (the member can see listening, can stop it, and the detection is on the phone). Both need counsel's wording, not ours.

### Point 4 · Best SLA score

| Artefact | Status | Notes |
|---|---|---|
| Investor deck | ❌ | Slide 6 "Where we are, honestly" says "Moving the server to a company-owned account". Correct and honest. No SLA slide or number |
| 3-minute pitch | ⬜ | Not mentioned |
| 5-minute pitch | ⬜ | Not mentioned. Part 2 has no uptime answer |
| Judges' pitch (`05` §6) | ✅ | "What's your uptime?": not measured yet, probe and targets in `04`, server move stated |
| Sonke fields | ❌ | "Live today: server on Azure" (see §3, item 1) |
| Plan (`04`) | ✅ | Indicators S1–S9, pilot and scale targets, "unmeasured counts as missed". **All targets `PROPOSED`; no baseline** |
| Probe (`scripts/sla/`) | ✅ | Written and unit-tested; `node --test test/sla-probe.test.mjs` 10/10 (per `04` §5, 18 Oct, not re-run today). Does not run until on `main` (it is on `main` now; scheduled runs begin from the default branch) |

**Missing:** an SLA slide for the judges and investors (targets, the score method, "not measured yet", and the company-owned server as the precondition). **Do not** put the S1 99.5% as a promise until D9 is decided (`04` §3 and §4.2: credit-funded Azure has no contractual SLA).

### Point 5 · Two pitches (investors and judges)

| Artefact | Status | Notes |
|---|---|---|
| Investor pitch (3 min) | ⚠️ | `05` §3 is a script with placeholders: "[the number from the canonical model, D1]" and "[the re-sized ask, D2]". The Canva investor deck has the same placeholders (slide 8 break-even, slide 9 ask) |
| Judges' pitch (2 min) | ⚠️ | `05` §4 is a script. **No judges' deck existed before today.** Draft outline in §6 of this file |
| War-room 3-min and 5-min files | ✅ | They are the spoken scripts for the Wits War Room (a different event). Keep them for that event |

**Conflict:** the investor deck's "Break-even member count" placeholder can now take **10,973** (`FACT`, script output on `main`), with the caveat that it assumes five stipends (D1). Put both the five-stipend and two-founder numbers on the slide only if D1 is decided; otherwise say which model.

### Point 6 · Launch the build soon and develop it more

| Artefact | Status | Notes |
|---|---|---|
| Investor deck | ⚠️ | Slide 8 "Go-to-market": "90 days, observe-only, about 300 staff or volunteers; up to 5,000 members over 12 months; three partners and 50,000 members". No dated plan, no blocker list |
| 3-minute pitch | ⬜ | Not mentioned |
| 5-minute pitch | ✅ | Beat 8 and Part 2 "MVP": demo checklist with its status ☐ on each line |
| Judges' pitch | ⬜ | Not mentioned |
| Plan (`06`) | ✅ | Phases 0–3 with dates; blockers S1–S2 in order. **Phase 0 is the company-owned server, and nothing else launches until it is back** |

**Missing:** a launch slide that shows the next 90 days from `06` §5 with what is blocked (the server, D5, D6, real push, Play blockers) and what is not.

---

## 3 · Conflicts to resolve before anything reaches a judge or partner

Ordered by how much harm they could do.

1. **Sonke fields say the server is live.** "Live today: server on Azure; root #8 LIVE-VERIFIED on Hedera testnet." Contradicts `06` §0 and `04` §4.1 (the last recorded server was lost on 15 Oct; the apps point at a presenter's PC). **Replace with the state as recorded in `06` §0 before any use.**
2. **Duress wording and listening model.** "Always on" (Sonke) versus "listening only after Activate" (pitches) versus D7 (open). Also the duress PIN gap at sign-in and sign-out (D6, `06` §4): the Sonke fields say "Duress PIN: the same 'Checked in' screen, and guardians are alerted", which is **not true today at sign-in or at a paused sign-out** (`06` §2 item 2). Say the gap or wait for the fix.
3. **Location.** The app shows and sends location in places; the 5-minute pitch says the build doesn't share it. Resolve on a device.
4. **"Tamper-proof by design"** (investor deck slide 5). `MASTER-CONTEXT` §6 and the removed-lines table in `WAR-ROOM-PITCH-5MIN.md` say: "tamper-evident", "can't be backdated or quietly edited without detection", never "impossible to fake" or "tamper-proof".
5. **Root number:** 7 (5-minute pitch) versus 8 (Sonke). Check the mirror node before any slide shows a number.
6. **Break-even:** `05` §5 says `main` prints 10,901; it prints 10,973. Fix `05` §5 in a later PR (this file does not change it).
7. **Sonke "1.1% of a 1-million-customer base, about 4.1 months after switch-on".** The script does print "~4.1 mo" for a reference channel, tagged `ASSUMPTION` (channel) and `FACT` (parameters). The Sonke field drops the `ASSUMPTION` tag. Re-tag.
8. **Post-quantum claims** (Sonke: "28 Python and 171 JavaScript tests"). Not checked today. Re-run or drop before use.
9. **"Leaked keys from earlier repositories rotated and history purged"** (Sonke). Not checked today; the repository's own record should say when and how. Check or drop.
10. **"46 s demo video, uploaded with this submission"** (Sonke). No demo video exists in the repository (§4). Confirm where it is before anything cites it.

---

## 4 · What exists for each artefact (demo, app, dashboard)

| Artefact | Exists in repo? | Notes |
|---|---|---|
| **Demo video** | **No** (`git grep` for demo video finds only plans and the Sonke fields) | `docs/venture/08-DEMO-VIDEO-PLAN.md` (new, this PR) plans it. Needs a real Android phone and a live server |
| **Real app screenshots** | **Not found** in this sandbox (checked `/tmp/claude-0/…/scratchpad/shots/` and a filesystem search for `app-13-home.png`, `dash-home.png`, `app-17-settings.png`) | The files are in a different session's scratchpad, or were not kept. **Re-supply them, or I rebuild them** (the browser shim, the clean crop of check-in screens). Do not use the left-half renderings |
| **Dashboard home** | ✅ | `dashboard/index.html` |
| **Dashboard ledger** | ✅ | `dashboard/ledger/` (needs a network that can reach Azure and Hedera to show live data; the sandbox cannot) |
| **App onboarding copy** | Member-first | No enterprise surface; partner copy is only the share flow |
| **SSDLC** | ✅ (23 Sep, `PROPOSED` until Ipeleng accepts) | `docs/security/SSDLC.md`. The FNB rules are not in the repository; the 26 Oct deadline and "10 slides, demo login and link, 90 s video, SSDLC, Lean Business Canvas" come from your message |
| **Lean Business Canvas** | **Stale** | `docs/LEAN-CANVAS.md` says "STALE, do not quote" and describes the retired four-layer design. Needs rewriting under the venture plan before the FNB submission |
| **Sonke submission PDF** | ✅ (`docs/submission/VUKA-GKHack26-submission.pdf`, 16 slides, the hackathon version) | Not the FNB deck. Its claims carry the conflicts in §3 |

---

## 5 · The four review gates (`MASTER-CONTEXT` §10), applied to this audit

1. **Fraud red-team.** The judges' deck and investor deck must not say that a record proves duress, and must say that the absence of a record is never evidence. Gate passed for the drafts in this PR. The Sonke fields fail it on the "always on" and "live server" lines (§3).
2. **Build for use.** The demo video must be recorded on a budget Android phone with a real server (§4). The app's listening model is unresolved (D7). **Not passed** until the video is recorded on a phone.
3. **Economic integrity.** Every figure in §1 traces to `scripts/economics_vigil_anchor.py` or `docs/EVIDENCE.md`. The 10,901 figure in `05` is stale. Gate passed for the figures listed; fails for the Sonke 4.1-month line until re-tagged.
4. **Privacy by design.** The location conflict (§3 item 3) and the "Call 10111" wording (D12, needs a GBV review) are open. **Not passed** for the guardian alert copy and location.

**Criterion letter and "would a real user trust and use this?":** the venture plan says the hackathon weights (I, T, U, S, B, Q) no longer decide anything (`README.md` §4). For the judges' deck, the nearest mapping is **B** (business case), **T** (feasibility and scalability), **S** (ethics and community safety) and **I** (innovation, as impact on users). **Community impact is not a letter in that set**; I propose it as a new row, pending the award rubric, which is not known (YouthX, the Easies and Caplia were not researched, `05` §2). The trust question for a judge is answered by the honesty slide (measured numbers, the server, what the record cannot show), not by a claim.

---

## 6 · Judges' deck: draft outline (10 slides)

Built in Canva as a separate design from the investor deck, once you approve this outline. Every figure carries its tag.

| # | Slide | Content (tagged) | Criteria |
|---|---|---|---|
| 1 | Title | VUKA: notices duress without a button, and proves when. PILOTCORE. "Draft for judges. Testnet and simulated bank, as stated." | — |
| 2 | Problem and community | A forced transfer looks like a willing one. 17,061 kidnappings in 2023/24, up 264%, 44% during a hijacking (`FACT`, SAPS via ISS Africa, as recorded in `docs/EVIDENCE.md`). R2.4bn lost to digital banking crime in 2025 (`FACT`, SABRIC, as recorded). One formal ombud case: R4,962.38 and about 61 days (`REPORTED`) | B, S |
| 3 | One person's evening | "Imagine Thandi" (**illustrative composite, not a case**). A journey starts; a scream or glass opens a quiet Journey check; normal PIN: nothing sent; duress PIN: same screen, guardians alerted with "Don't call or text them. Call 10111." (spec G4, copy to be reviewed by a GBV organisation, D12, `PROPOSED`) | I, U |
| 4 | Lawful and comfortable on the phone | No audio is stored. A 3-second buffer is classified on the phone and discarded; only a label and a score leave it (`FACT` for the design, as in `AudioPipeline.kt` per the 5-min pitch; not re-read today). Android only; not iOS (`FACT`, ADR-0008). Listening model: **open (D7)**. Lawful basis: counsel reviewing (`ASSUMPTION`) | S |
| 5 | Technical feasibility (what runs today) | VIGIL app on `main`. ANCHOR server on `main` (#131). Hedera testnet, topic `0.0.10687280` (`FACT`). Ran end to end on Android in September, on a demo build (`REPORTED`, the handover record). **Not running on a company-owned server since 15 Oct (`FACT`, `06` §0)** | T |
| 6 | Measured, not claimed | Glass 46.0% (n = 139), gunshot 54.6% (n = 108), shatter 72.9% (n = 70), scream 6.5% (n = 108). False check-ins on everyday sounds: 1.8 per hour (folds 1–3) and 7.3 per hour (folds 4–5), a dense stress test, **not a field rate** (`FACT`, `docs/eval/cem1-measurements.md`). Thresholds uncalibrated | T, S |
| 7 | Scalability | Each member has a signed chain. Anchoring: at most R569.47 a month for the whole network, whatever the count (`ESTIMATE`, script). At scale, a staffed rota and a zone-redundant stack: about R7,860–R8,360 a month before VAT (`ESTIMATE`, `04` §4.4 item 13) | T, B |
| 8 | SLA targets (proposed) | S1 alert path 99.5% a month (pilot), S2a dispatch p95 ≤ 5 s, S3 `no_answer` by deadline + 10 s, S5 newest root ≤ 65 min, S8 acknowledgement ≤ 1 h, 07:00–22:00. **All `PROPOSED`. Not measured yet. Unmeasured counts as missed** (`04` §3, §5) | T, B |
| 9 | SAPS and NGO route | Where we are, honestly: no organisation has endorsed VUKA, and no SAPS contact has been made. Order: CPSI debrief (requested, not yet confirmed), Wits Campus Protection and Gender Equity Office, GBV design reviews 1–24 Nov (TEARS, Sonke, Rape Crisis: none agreed), SAPS at station level Q1 2027 (`PROPOSED`, `02` §2). Crisis lines appear on the help screen only | S, community |
| 10 | What we are not claiming, and what we ask | Not measured: field accuracy, battery, field false-alarm rate, uptime. Not done: an independent penetration test (G8). Not claimed: proof of duress, "invisible", "always on", court-admissible, prevents crime. **Ask:** feedback on the design and the honesty limits, a GBV reviewer, an introduction to CPSI or the Gender Equity Office | S, B |

**Before the deck is shown:** slide 3 needs a real screenshot or none (not a stock phone); slide 5 needs the company server or the sentence stays as written; slide 9 is current only until someone is contacted.

---

## 7 · Investor deck: proposed changes (needs your approval before any Canva edit)

Edits to `DAHY_VcrKis` are not made yet. Each is a Canva transaction that needs a preview and your approval before commit.

1. **Replace the two stock phone mock-ups** (slides 1 and 5) with real screenshots. **Blocked:** no screenshots in this sandbox (§4).
2. **Slide 5 "Tamper-proof by design"** → "Tamper-evident: a record can't be backdated or quietly edited without detection." (`MASTER-CONTEXT` §6.)
3. **Slide 8 break-even placeholder** → **10,973 members at R20 (`ESTIMATE`, five stipends, `scripts/economics_vigil_anchor.py` on main)**, with "two-founder model under review (D1)". Your call on whether to show the two-founder number.
4. **Slide 9 ask placeholder** stays **"[Ask amount: founders to confirm]"**. The number is yours (D2). I will not fill it.
5. **Add an SLA slide** (from §6 slide 8 of the judges' deck, with investor framing: what a bank or insurer's vendor-risk team will ask).
6. **Add a SAPS and NGO slide** (from §6 slide 9). Investor framing: what it does to pilot risk and what it doesn't claim.
7. **Add a lawful-and-comfortable slide** (from §6 slide 4), once D7 is decided.
8. **Replace the launch line on slide 8** with the dated 90-day plan from `06` §5, with what is blocked shown as blocked.
9. **Contact email on slide 10** (`ksibusiso023@gmail.com`) is yours to keep or change. Flagged, not changed.

---

## 8 · Blocked, and who unblocks it

| Blocker | Who | Unblocks |
|---|---|---|
| Real app screenshots not in this sandbox | You (re-supply) or me (rebuild, with the shim fixed) | Investor slides 1 and 5; judges slide 3 |
| No company-owned server since 15 Oct (D9) | Both founders | Demo video, slide 5 (judges), live SLA numbers, any "live" claim |
| Listening model (D7) | Both founders | Lawful and comfort slide; the "always on" line |
| Duress PIN gap at sign-in and sign-out (D6) | Both founders (contract change) | Any claim that a duress PIN always raises an alert |
| Location: app vs pitch (§3 item 3) | Lethabo (app) and you (pitch) on a device | Privacy line |
| FNB App of the Year rules (26 Oct 23:59) | You: the rules are not in the repository | FNB submission scope |
| Judges' rubric (YouthX, the Easies) | You: ask the organisers | Judges deck weights |
| SAPS, CPSI, NGO contact | Both founders, after the plan is agreed | Slide 9 becomes true only then |

Nothing in this file was sent to anyone. No organisation was contacted. No contract, merge or deployment was touched.
