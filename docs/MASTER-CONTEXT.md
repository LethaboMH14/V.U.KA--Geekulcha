# MASTER CONTEXT — read first, every session, by every person and every tool

> One page. It does not change shape. If you read nothing else before starting work, read this.
>
> Seven people across four universities are driving different AI tools that share no memory with each other. This file is the memory. **Owner: Khutso Mothopa.** Anyone may propose a change; Khutso makes it, in a PR, with a `docs/BUILD-LOG.md` entry.

---

## 1 · The event, and what it actually asks of us

| | |
|---|---|
| Event | **Geekulcha Annual Hackathon 2026** — 25–27 September, Centurion |
| Hosted with | **CPSI** (Centre for Public Service Innovation), powered by **Telkom** |
| Our track | **Blockchain for Impact Use** — *"Putting Blockchain for practical and impactful use — teams are challenged to come up with commercially viable use cases."* |
| Theme | **BUILD FOR USE** |
| Team | **SONAR** — seven members, four universities |
| Finish line | Plan to finish **15:00 Sunday 27 September**, the earlier supplied deadline |

**The theme is a question, and it is the only question:**

> ### "Would a real user trust and use this?"

Every artefact, every slide, every commit is answerable to that sentence.

---

## 2 · The four criteria — and the warning attached to them

Four criteria, **10 points each, 40 total**:

| | Criterion | What it rewards |
|---|---|---|
| **C1** | **Team Composition** | Skills variety, sector background, gender variety |
| **C2** | **Innovation & Creativity** | Is the idea genuinely new, and is the novelty load-bearing |
| **C3** | **Progress of solution profile** | Research, wireframes, game plan — evidence of actual work |
| **C4** | **User Journey Story** | A real person, start to finish, in a flow that makes sense |

> ⚠️ **These are the *selection* criteria — the ones we were assessed on to get in.**
> The workspace currently reads *"Criteria: There are 0 criterions"* for the event itself. The final judging criteria have not been published. **When they publish, Khutso updates this file the same day and re-tags every row in `docs/CHECKLIST.md`.** Until then we serve C1–C4 and hold the assumption visibly. `ASSUMPTION`

**Every piece of work names its criterion.** Every `docs/CHECKLIST.md` row and every `docs/BUILD-LOG.md` entry carries a criterion tag, so at any moment we can see whether we are serving all four or over-serving one.

---

## 3 · What the organisers actually said

They posted three instructions and one worry. The worry is the important part.

> **"Still very worried about the overuse of AI in your solution which tends to move off from the sense of reality and provide an uneasiness to scale afterwards."**

Three instructions:
1. **Sharpen the project overview.**
2. **Put real figures in the Lean Canvas.**
3. **Make the UVP show competitor awareness.**

**What the worry means.** It is not about using AI to build. It is about solutions that are impressive but cannot survive contact with the real world — that look innovative and turn out to be unimplementable, unaffordable, unlawful, or unscalable the moment someone tries.

**Our answer is already true, it is just buried.** From `README.md`:

> *"The load-bearing parts — the human gate, the two-signature rule, the hash chain, the public anchor, the three-second audio ring buffer — contain no machine learning at all."*

We are the team whose central mechanisms are **deliberately not AI**. Say it first, say it plainly, and let the architecture prove it.

---

## 4 · The thesis, in one line

> **The binding constraint on safety technology in South Africa is not accuracy. It is legitimacy.**
>
> Every design decision must make the system more **checkable**, not more **capable**.

If a change trades one for the other, say so out loud and offer the alternative.

---

## 5 · The showcase — the one thing to demonstrate

### `GET /v1/subjects/{id}/record`
### *A person asks for their own file and gets it, with a proof a stranger can verify without our help.*

It is the right showcase because all four criteria land in the same thirty seconds:

- **C4 · User journey** — it is journey J4 (Musa) made concrete, on a real screen.
- **C2 · Innovation** — nobody else in this category offers it.
- **C3 · Progress** — working code, not a diagram.
- **C1 · Team** — it takes backend, frontend, security and evidence to exist at all.

And it is the **direct answer to the AI-overuse worry**, because the thing being demonstrated contains no machine learning whatsoever.

**Second showcase, if time allows:** an operator tries to whitelist an entity alone, is refused — and **the refusal is itself anchored**. Under a minute, and it shows the insider-threat control the entire category leaves undefended.

Everything else in the demo is supporting material for these two moments. **If you are deciding what to cut, cut whatever is not holding them up.**

---

## 6 · The honesty ledger — claims we refuse to make

These are not discouraged. They are **forbidden**, in code, in docs, in slides, and out loud:

| Never say | Because |
|---|---|
| "identifies criminals" | It resolves entities. A match is a lead for a human, never a verdict |
| "court-admissible" | No court has ruled. Say *"built to maximise the ECTA s15 statutory reliability factors"* |
| "unbiased AI" | Bias evaluation **has not been run**. `G9` |
| "unhackable" | No independent penetration test exists. `G8` |
| "prevents crime" | Unmeasured, and probably unmeasurable at our scale |
| any uncalibrated precision figure | Face thresholds 0.55 / 0.65 cosine are **targets**, not calibrated results |

**And two positive obligations:**
- Anything simulated carries the `sim_` prefix — in code **and** named aloud in the room.
- **"Not measured" is a complete and acceptable answer.** It is frequently the answer that wins this particular hackathon.

---

## 7 · Claim tagging — mandatory in every artefact

Every figure, every capability statement, every date:

| Tag | Means |
|---|---|
| `FACT` | Verified, with the command or source that produces it |
| `ESTIMATE` | Calculated from stated assumptions, which are named |
| `ASSUMPTION` | Believed, not checked — and we say who would check it |
| `PROPOSED` | Designed, not built |

This single discipline is what answers *"uneasiness to scale"*, because it lets a judge see that **we know the difference**.

---

## 8 · The figures that are currently right

Superseded numbers still live in old artefacts. These are the current ones. Full provenance in `docs/EVIDENCE.md`.

| Figure | Value | Tag |
|---|---|---|
| Private security officers vs SAPS | **~637,675 active vs 155,231 sworn / 187,681 total ≈ 4:1** | `FACT` — PSiRA 2024/25 Annual Report; SAPS Mar 2025 |
| Private security industry size | **R87bn (2024)** — government segment **R7bn** | `FACT` — Stats SA |
| ADRs | **32** | `FACT` — `git grep -c "^## ADR-" docs/adr.md`. (25 were confirmed from the two predecessor repos in July; 7 more — ADR-0026–0032 — were authored during this hackathon) |
| Tests | **510 test-function definitions** found by `git grep` | `FACT` — *"440 tests" has no reproducing command; do not restate it* |
| Detection → alert render | **318 ms p95, 273 ms p50, n = 10**, budget 2,000 ms | `FACT` — historical, not reproduced in this checkout |
| Crime forecast | **Loses to a constant baseline: MAE 0.484 vs 0.246** | `FACT` — **published regardless, never softened** |
| TRL | **4**, with two subsystems argued at 5 and the ceiling named | `ASSESSED` — ADR-0027 |
| Anchoring cost | **Corrected 17 Sep: ~R0/month on OpenTimestamps (primary), ~R9–10/month Hedera fallback.** See `docs/EVIDENCE.md` | `FACT` (current pricing not independently re-verified at time of use) |

> 🔴 **Dead numbers. If you see these anywhere, they are wrong:** "2.7m security officers vs 180k police" · "27 ADRs" · "440 tests" · bare "TRL 5" · "R1.30/month" without a named system and current price.

---

## 9 · Where everything else lives

| Need | Read |
|---|---|
| The one-page orientation | `../BRIEF.md` |
| Standing rules for every person | `../RULES.md` |
| Instructions for every AI tool | `../AGENTS.md` |
| Your own operating spec | `../team/<yourname>.md` |
| How to start a session | `SESSION-PROMPT.md` |
| The whole plan | `PLAN.md` |
| What we said we'd do, ticked | `CHECKLIST.md` |
| What is true and how we know | `EVIDENCE.md` |
| What is broken, published | `OPEN-GAPS.md` |
| What changed and why | `BUILD-LOG.md` |
| Why blockchain, and where we refuse it | `ANCHOR-RATIONALE.md` |
| Shared files — claim before editing | `OVERLAPS.md` |

---

## 10 · The recall rule

**Before any iteration, any new concept, and any artefact that reaches a judge:**

1. Re-read this file.
2. State which criterion the work serves — **C1 / C2 / C3 / C4**.
3. State how it answers **"Would a real user trust and use this?"**
4. If it serves none, say so and justify the work anyway — or drop it.

> **It forgets you. It never forgets what it did.**
