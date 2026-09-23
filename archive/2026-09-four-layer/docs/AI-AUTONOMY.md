# Where AI Fits — and the Autonomy Line You Must Not Cross

---

## 0. The reframe, in one line

That conversation defines AI autonomy as *"takes physical action without waiting for human permission"* and calls the result a **"self-defending shield."**

Carry that sentence into a CPSI room and you will be ejected, not scored. CPSI's entire wariness about this technology class is *precisely* systems that act on people without accountability. "Doesn't wait for permission" is the accusation, not the feature.

The position your repo already takes is more sophisticated and far more defensible:

> ## Total autonomy in perception. Zero autonomy in consequence.

The AI should be maximally independent at **deciding what it is looking at** — offline, on-device, in milliseconds, no cloud, no human, through load-shedding. It should have **no autonomy whatsoever at deciding what happens to a person.**

That is exactly where ADR-0002 draws the line: the machine's ceiling is `watch_candidate`, and only a human can set `flagged`. You wrote that in July. Don't let a chatbot talk you out of the best decision in your architecture.

---

## 1. What that conversation described that you already built

Three of its four sections are your existing product. Claim them — they're real.

| Their framing | Your reality | Verdict |
|---|---|---|
| **"Autonomous brain — local edge computing"** | Kotlin `SensingService` foreground service, PARTIAL wakelock, `BootReceiver`, YAMNet TFLite in app assets. Runs with no internet, through load-shedding, screen off | ✅ Shipped in July |
| **"Multi-modal cognitive reasoning / threat score"** | Calibrated log-odds fusion, conflict coefficient K, context prior over load-shedding stage / area risk / hour | ✅ Shipped, 13 tests |
| **"Predictive smart-patrol routing"** | OR-Tools team-orienteering, 12-minute Koper dwell, risk-weighted coverage under a fuel budget | ✅ Shipped |
| **"Active defence countermeasures"** | — | 🔴 **Do not build. See §2** |

**The thunder-versus-intruder scenario it describes is literally your conflict gate plus context prior working as designed.** A loud bang at 14:00 on a stormy Saturday with no fence movement: the acoustic channel fires, the motion channel contradicts it, K goes high, the escalation is suppressed. Same bang at 02:00 on a clear night with a silhouette: channels agree, K stays low, the context prior lifts the posterior, L2 fires. That's your `fuse()` function. You don't need to add anything — you need to *narrate* it.

### Two corrections before you repeat any of it

**"Dials the threat score to 99%."** No. Your D10 honesty ledger forbids uncalibrated precision, and your own `fusion_params.json` self-labels:

> `"status": "PROVISIONAL — NOT fit on real data. Do not present as tuned/validated."`

A 99% figure would be a fabrication by your own standard. Say "crosses the L2 threshold," not a percentage you haven't earned.

**"YOLOv10."** You use YOLOv8. Don't claim a model you don't run — that's the class of README overclaim that's already a liability for you.

---

## 2. 🔴 The three things you must not build

This isn't caution. Each one breaks a document you wrote, and two of them would injure people.

### Blinding spotlights aimed at the eyes

Deliberately blinding a person is **assault**, and severity doesn't drop because they're trespassing. South African private defence (*noodweer*) requires the defensive act be **necessary** and **proportionate** to an **imminent** unlawful attack. Property alone rarely justifies bodily harm — and an automated device cannot assess imminence or proportionality at all. It cannot tell a burglar from a lost child or a paramedic.

For context on how seriously this class of harm is treated: deliberately blinding weapons are prohibited under **Protocol IV to the Convention on Certain Conventional Weapons** — a treaty that exists because permanent blindness is considered disproportionate even in armed conflict. You do not want your product on that side of an analogy.

### Automated pepper-spray canisters

This is a **mantrap** — an automated device that injures whoever triggers it. Broadly unlawful, and for an obvious reason: it cannot distinguish an intruder from a firefighter, a paramedic, a neighbour's child fetching a ball, or your own family member coming home. Gas someone with asthma and the charge isn't assault, it's culpable homicide.

And look at your own detection confidence. Your Home Guard log:

```
21:14 · glass-break candidate · confidence 0.71
       second-stage check: speech · dismissed
```

**Your own system had a 0.71-confidence glass-break that was wrong.** Wire a chemical irritant to that and you have gassed an innocent person, autonomously, with no human in the loop, and you've anchored the record of doing it to a public blockchain forever.

### The speaker announcing a dispatch that hasn't happened

*"SAPS and armed response have been dispatched via blockchain ID 492"* — if that dispatch hasn't occurred, your system is stating a falsehood to a person. And announcing it to a genuinely armed intruder invites escalation rather than retreat.

Your engineering principle 4, verbatim:

> *"Deterrence over confrontation — never engineer a violent encounter over a TV."*

### All three also break ADR-0002 and create a liability you cannot carry

ADR-0002: soft evidence may never trigger a consequence without a human. These are the purest possible violation — a machine independently causing physical harm on probabilistic inference.

Beyond the law: building these turns you from a software team into a **manufacturer of weapons-adjacent hardware** with product liability. No insurer underwrites automated chemical deployment against members of the public. And you'd be pitching autonomous chemical irritant deployment to a **government innovation body**.

### ✅ What IS defensible — deterrence that cannot injure

The mechanism works. Criminals leave when they know they've been seen. Choose the version that harms nobody if the detection is wrong:

| ❌ Don't | ✅ Do |
|---|---|
| High-intensity light aimed at eyes to blind | **Flood the yard with light.** Illuminate the area, don't target a person |
| Automated pepper spray | **Siren.** You already build this |
| Fake dispatch announcement | **"You are being recorded."** True regardless of what happens next |
| Machine fires the countermeasure | **Human confirms, with a visible cancel window.** Your Home Guard already does this |

Same deterrent effect, zero harm on a false positive, and it survives every ADR you've written.

---

## 3. The autonomy you should actually be claiming — and it's novel

Here's what nobody in that hackathon will say, and it's true of your code:

> ## The system is autonomously sceptical of itself.

Every autonomous behaviour in your build is aimed at **restraining the system**, not at acting on people. That's a genuinely unusual design position, and it's the strongest AI story you have.

| Autonomous behaviour | What it does with no human involved | Where it lives |
|---|---|---|
| **Rejects its own detections** | YAMNet stage 2 catches speech masquerading as glass-break and dismisses it. The system overrules itself | `member/audio/`, `server/src/audio/yamnet.py` |
| **Suppresses on internal disagreement** | Conflict coefficient K rises when independent channels contradict each other, and routes to verification instead of escalating | `brain/fusion.py`, `app/src/brain/fusion/` |
| **Learns who belongs** | Residents, domestic workers and delivery regulars become known to a street without anyone registering them | whitelist-before-watchlist, principle 5 |
| **Forgets you** | `score_now = base × 0.5^(days/7)`. Suspicion decays on its own | `server/src/api/entities.py` |
| **Degrades without lying** | Camera queues locally when the server is gone. Dashboard shows stale-marked data, never blank | principle 10 |
| **Audits its own error rate** | `fa_budget.py` turns a decision log into false-escalations-per-user-week and checks it against a declared budget | `ml/eval/` |

**The decay function is the best single line in this list.** Say it out loud:

> Most surveillance systems require a human to clear you. Ours forgets you automatically, at a documented half-life of seven days. Nobody has to decide to forgive you.

That's autonomy pointed at protecting the subject rather than acting against them. It is the opposite of everything a judge expects from this product category, and it's already in your code.

---

## 4. Three AI additions genuinely worth building

Ranked by value per day of work.

### ① Fit the fusion weights — the highest-value ML work available to you

Your `fusion_params.json` says PROVISIONAL. Three of five gauntlet judges independently docked you for "calibrated" being aspirational. Your `calibration.py` (reliability diagrams, ECE) and `fa_budget.py` exist and have never been run against anything real.

**The highest-value ML task in nine days isn't a new model. It's making one word true.** Construct whatever labelled set you honestly can — recorded glass-breaks, played gunshot audio, staged approaches, ambient nights — run the calibration harness, and report the reliability diagram. Even a small honest set converts "calibrated (provisional)" into "calibrated on n=N held-out samples, ECE = x."

**And it makes the harnesses you already built into evidence rather than scaffolding.** No other team will show a reliability diagram.

### ② VLM behaviour detection — your "jumping the wall" idea, done honestly

You were right earlier that YOLO is the wrong tool for this. YOLO detects **objects** — person, weapon, plate. It cannot detect **behaviour** — climbing, loitering, casing a property, trying door handles.

A small vision-language model can, and runs locally: **Moondream2, Florence-2, SmolVLM, Qwen2-VL 2B**. All run on modest hardware.

**The architecture that keeps it honest:**

```
YOLOv8  always-on, cheap, ≥8 FPS       → is there a person?
   ↓ only on a trigger frame
small VLM, local                        → "is this person climbing the wall?"
   ↓ output is a FACTOR, not a verdict
brain/fusion.py                         → enters as F-new, low weight, LABELLED UNCALIBRATED
   ↓
human verify gate                       → unchanged. Machine ceiling stays watch_candidate
```

Three rules, and the first is non-negotiable:

1. **A VLM output is a language output. It is not calibrated and cannot be.** It enters fusion as a low-weight factor with an explicit uncertainty label — never as a probability you quote.
2. **ADR-0007's principle applies directly.** You banned generative models between a camera and a plate string because *"the invention is unfalsifiable from the output."* A VLM describing a person's intent is the same risk class. It may propose; it may never determine.
3. It fills your F2–F6 stubs with a real factor instead of a documented placeholder.

This is a strong, current, defensible addition — and the discipline around it is more impressive than the capability.

### ③ Explain the decision to the person it was about

You already have `Assistant.tsx` with a real LLM behind it. The valuable use isn't chat — it's **explaining a fusion decision in plain language to its subject.**

Remember Musa. He requests his record and gets:

```
16:04  proposed as watch candidate    factors: F1 recurrence
16:22  DISMISSED by operator #A41
17:00  anchored · root 7f3a…c19
```

Accurate, and unreadable to a delivery driver. The LLM reads the factor list and the chain entry and produces: *"Cameras on this street saw your vehicle four times over eleven days. That pattern triggered a review. A person looked at it on the 14th at 16:22, recognised a delivery route, and cleared you. You are now on the street's known list, so this won't happen again."*

That's explainability in service of the person, backed by an anchored record so the explanation can't drift from the facts. **It's the AI half of your subject-access story, and it costs a prompt and an endpoint.**

---

## 5. Two more errors to strip before they reach a slide

**"Crime logs uploaded to the blockchain by thousands of homes."** No. Volume, privacy and permanence all fail. Aggregate off-chain; anchor hashes. 32 bytes an hour is the whole footprint.

**"Where a break-in is mathematically forecasted."** Careful — your forecast currently has **MAE 0.484 against 0.246 for a constant.** It loses to "always predict 1." Until that's fixed, the honest phrasing is "risk-ranked from SAPS quarterly data and near-repeat patterns," not "mathematically forecasted."

The synergy table at the end of that conversation also reintroduces two things you've already refused: the automated gate key (ADR-0002) and neighbour reward tokens (pays people to erode D9). Leave them refused.

---

## 6. The slide

**Title: Autonomy where it's safe. A human where it counts.**

```
AUTONOMOUS — no human, no cloud, milliseconds
  ✓ Perception        on-device vision + acoustics, offline, through load-shedding
  ✓ Fusion            calibrated log-odds across physically independent channels
  ✓ Self-rejection    second-stage check overrules the first
  ✓ Conflict gate     internal disagreement suppresses escalation
  ✓ Whitelist         learns who belongs, unprompted
  ✓ Decay             forgets you at a 7-day half-life
  ✓ Self-audit        watches its own false-alarm rate against a declared budget

────────────── THE LINE (ADR-0002, July 2026) ──────────────
      machine ceiling: watch_candidate. Only a human can flag.

NEVER AUTONOMOUS — a person decides, with a visible cancel window
  ✗ Accusing anyone
  ✗ Dispatching armed response
  ✗ Arming a suburb-wide cordon
  ✗ Any physical consequence

DESIGNED AND REFUSED
  ✗ Blinding light · automated gas — assault, and a machine cannot judge proportionality
  ✗ Autonomous gate unlock — ADR-0002
  ✗ First-responder bounty — principle 4: never engineer a violent encounter
```

**The closing line:**

> Our AI is fully autonomous at working out what it is seeing, and has no autonomy at all over what happens to a person. We could have built the automated countermeasures — we designed them and rejected them, because a machine cannot assess proportionality and our own architecture decision from July forbids it.
>
> The most autonomous thing this system does is **forget you.** Seven-day half-life, no human required. Most surveillance systems need someone to decide to clear you. Ours decides on its own to stop watching.

In a room co-hosted by a government innovation body, that closing beats any countermeasure you could ship.
