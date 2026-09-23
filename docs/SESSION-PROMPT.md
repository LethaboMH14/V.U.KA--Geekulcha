# SESSION PROMPT — one prompt, seven people, one word different

> Copy the block below. **Change one word, the name.** Paste it into Claude Code, Codex, Cline, Cursor or whatever you use.
>
> Everything person-specific is pulled from `team/<yourname>.md` **in the repo**: your role, reviewer, effort level, behaviour, domain rules and your **work order**. It stays current when your task changes, and nobody has to re-edit a prompt.

---

## The prompt

```text
I am KHUTSO.        ← change this one word to your name

Read these in order before doing anything:
  1. docs/MASTER-CONTEXT.md     — the event, the published criteria (I/T/U/S/B/Q),
                                  the showcase, the honesty ledger, the four review gates
  2. RULES.md and AGENTS.md     — standing rules for every person and tool
  3. BRIEF.md                   — the one-page orientation
  4. team/KHUTSO.md             — MY operating spec and MY WORK ORDER: steps,
                                  commands, acceptance checks, deadlines, reviewer
  5. docs/VUKA-2-SPEC.md        — the sections my work order cites
  6. docs/OVERLAPS.md           — shared files; claim before touching
  7. docs/build-log/entries/, last 5 files — what just changed (sorted by filename)

Then: git pull. Tell me what changed since I last worked, which work-order step
is next, and what blocks it, before you propose anything.

For the rest of this session, team/KHUTSO.md is your operating spec. Follow its
effort level, behaviour, domain rules and work order. If anything I ask
conflicts with it, with RULES.md or with docs/VUKA-2-SPEC.md, say so and stop.
```

That is the whole prompt. Replace `KHUTSO` in **both** places, line 1 and item 4. The filename is lowercase, `team/khutso.md`; use lowercase if your tool is strict.

---

## Why it's built this way

The prompt is a *pointer*, and your file in the repo is the truth. When your task changes, the work order changes, and your prompt is correct again for every tool you use. A teammate can read exactly what your agent has been told, because it's in the repo.

---

## Standing rules your agent will read

These live in `RULES.md`, `docs/MASTER-CONTEXT.md` and the ADRs, so every tool reads the same copy. Summarised:

- **Machines notice; people decide.** No model decides a consequence for a person. A bank signal is **never** sent from detection alone (ADR-0037).
- **The anchor proves when, not what.** Never write "proof of duress", "invisible" or "court-admissible". Say "discreet" and "proves when".
- **The duress path is identical** to the normal one in pixels, haptics, request shape and timing. A duress PIN at any prompt raises the alarm.
- **Guardian changes and deletion need PIN authorisation.** Under duress they are convincing no-ops. Removals take effect after 24 h, and nobody is ever left with zero guardians (ADR-0036).
- **Signatures bind their full context** (subject, target, action, source time). Verification compares ledger bytes with the recomputed root.
- **No LLM, RAG or agent framework in the product.** YAMNet on the phone is the only model (ADR-0038).
- **Raw audio is never stored. No personal data on chain.** Only 33-byte typed messages go to the ledger.
- **Never commit a secret. Never use `--no-verify`. Never import predecessor history.** Port predecessor files one at a time.
- **Tag every claim** `FACT` / `ESTIMATE` / `ASSUMPTION` / `PROPOSED`. Anything simulated is `sim_` in code, SIMULATED on screen, and named aloud. Testnet is called testnet.
- **Before any work:** pass the four review gates (MASTER-CONTEXT §10) and name the criterion letter it serves.
- **Record the actual command and its actual result.** "Not measured" is fine. Inventing a result is not.
- **Never fabricate** a measurement, a review, a test pass, or another person's approval. An assurance needs a record.

---

## Finishing a session

**Done means all five:**

1. Evidence recorded in `docs/EVIDENCE.md` (numbers with method, configuration and n)
2. Your reviewer has accepted it
3. `team/<you>.md` updated: work-order checkboxes ticked, plus a running-log line
4. A new file in `docs/build-log/entries/` (never edit the frozen `docs/BUILD-LOG.md`), following `docs/build-log/TEMPLATE.md`
5. Your `docs/CHECKLIST.md` P3 row ticked, with its criterion letter

**Escalation:**

| Situation | Go to |
|---|---|
| Blocked on a person | Log it in your file **with their name** |
| Contract change | **Both leads** + an ADR in `docs/adr.md` |
| Any legal or privacy doubt, or anything about a real person's data | **Stop. Go to Ipeleng.** |
| A secret reaches a commit | **Stop. Tell Sibusiso and Ipeleng.** |
| A milestone will slip | Tell Lethabo; cut from the top of `docs/VUKA-2-SPEC.md` §14's cut line, never the safety features |

---

## Workflow, end to end

```text
git pull
  → read MASTER-CONTEXT + your work order
  → claim shared files in docs/OVERLAPS.md
  → git checkout -b <type>/<you>-<thing>      (docs/…, feat/…, fix/… per RULES.md)
  → work
  → node scripts/check-docs.mjs && node scripts/check-intake.mjs
  → update team/<you>.md · new docs/build-log/entries/ file · docs/CHECKLIST.md P3
  → git push -u origin <branch>
  → open a PR; CODEOWNERS requests your reviewer
  → reviewer accepts → merge → git checkout main && git pull
```

Nothing goes straight to `main`. A PR for everything, including docs.
