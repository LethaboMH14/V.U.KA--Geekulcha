# SESSION PROMPT — one prompt, seven people, one word different

> Copy the block below. **Change one word — the name.** Paste it into Claude Code, Codex, Cline, Cursor, whatever you drive.
>
> Everything person-specific — your role, your reviewer, your effort level, how you want to be worked with, your domain rules, your current task — is pulled from `team/<yourname>.md` **in the repo**. That means it stays current when your task changes, and nobody has to re-edit a prompt.

---

## The prompt

```text
I am KHUTSO.        ← change this one word to your name

Read these in order before doing anything:
  1. docs/MASTER-CONTEXT.md     — theme, criteria, showcase, honesty ledger
  2. RULES.md and AGENTS.md     — standing rules for every person and tool
  3. BRIEF.md                   — the one-page orientation and the hard limits
  4. team/KHUTSO.md             — MY operating spec: role, reviewer, effort,
                                  behaviour, my domain rules, my current task
  5. docs/OVERLAPS.md           — shared files; claim before touching
  6. docs/build-log/entries/, last 5 files — what just changed (sorted by
                                  filename; docs/build-log/README.md explains)

Then: git pull. Tell me what changed since I last worked, and what my current
task is, before you propose anything.

For the rest of this session, team/KHUTSO.md is your operating spec — follow the
effort level, behaviour and domain rules it sets for me. If anything I ask
conflicts with it, or with RULES.md, say so and stop.
```

That is the whole prompt. Seven people, one prompt, one word different.

*(Replace `KHUTSO` in **both** places — line 1 and line 4. The filename is lowercase: `team/khutso.md`. Either case works on GitHub; use lowercase if your tool is strict.)*

---

## Why it's built this way

**The old way** was a long personal prompt per person, pasted from a chat. It went stale the moment a task changed, and nobody's prompt matched anybody else's rules.

**This way**, the prompt is a *pointer*. Your file in the repo is the truth. When your task changes, you edit one line in `team/<you>.md` — and your prompt is correct again, automatically, for every tool you use.

It also means a teammate can read exactly what your agent has been told, because it's in the repo. No hidden instructions, no divergence, no "well *my* tool said."

---

## What your file gives the agent

Each `team/<name>.md` opens with an **`## Agent operating spec`** block holding seven fields:

| Field | What it does |
|---|---|
| **I am** | Name, role, university, which layer of VUKA you own |
| **Reviewed by / I review** | The named human, both directions |
| **Effort** | How hard to think before acting, and whether to plan first |
| **Behaviour** | How *you* want to be worked with — the part that makes the agent feel right for you |
| **My domain rules** | Your role's non-negotiables, on top of the global rules |
| **Current task** | The one line that keeps the prompt self-refreshing. **Update it when it changes** |
| **Done means** | The definition of done, plus anything extra for your role |

---

## Standing rules your agent will read

These live in `RULES.md` so every tool reads the same copy, rather than seven prompts drifting apart. Summarised here so you know what your agent is operating under:

- **Make it more CHECKABLE, not more CAPABLE.** If a change trades one for the other, the agent must say so and offer the alternative.
- **No code path may set `flagged`.** The machine's ceiling is `watch_candidate`.
- **Two signatures** for whitelist / disarm / threshold change / delete.
- **Embeddings, never images. Raw audio never stored. No personal data on chain.**
- **No generative model** in any decision about a person.
- **Never commit a secret. Never `--no-verify`. Never import predecessor history.**
- **Tag every claim** `FACT` / `ESTIMATE` / `ASSUMPTION` / `PROPOSED`.
- **Never say:** identifies criminals · court-admissible · unbiased AI · unhackable · prevents crime · any uncalibrated precision figure.
- **Before any work:** name the judging criterion it serves (C1–C4) and how it answers *"Would a real user trust and use this?"*
- **Record the actual command and its actual result.** "Not run" is fine. Inventing a result is not.
- **Never fabricate** a measurement, a review, a test pass, or another person's approval.

---

## Finishing a session

**Done means all five:**

1. Evidence recorded in `docs/EVIDENCE.md`
2. Your reviewer has accepted it
3. `team/<you>.md` updated — including **Current task**
4. A new file in `docs/build-log/entries/` (never edit the frozen `docs/BUILD-LOG.md`): **what, why, how, when, research, real data, business reasoning** — `docs/build-log/TEMPLATE.md`
5. `docs/CHECKLIST.md` row ticked, with its criterion tag

**Escalation:**

| Situation | Go to |
|---|---|
| Blocked on a person | Log it in your file **with their name** |
| Contract change | **Both leads** + an ADR in `docs/adr.md` |
| Any legal or privacy doubt | **Stop. Go to Ipeleng.** |
| Anything about a real person's data | **Stop. Go to Ipeleng.** |

---

## Workflow, end to end

```text
git pull
  → read MASTER-CONTEXT + your team file
  → claim shared files in docs/OVERLAPS.md
  → git checkout -b <yourname>/<thing>
  → work
  → node scripts/check-docs.mjs && node scripts/check-intake.mjs
  → update team/<you>.md · new docs/build-log/entries/ file · docs/CHECKLIST.md
  → git push -u origin <yourname>/<thing>
  → open PR, request your reviewer
  → reviewer accepts → merge → git checkout main && git pull
```

Nothing goes straight to `main`. A PR for everything, including docs.
