# Build log — one file per entry, not one shared file

## Why this changed

`docs/BUILD-LOG.md` was a single append-only file everyone wrote the last line of. On 16 September, five PRs landed inside about twenty-five minutes and **four of them hit a real git conflict on that exact file** — every PR ends its diff at the same line, so any two PRs that touch it concurrently collide, even though the actual content never disagreed. The fixes were mechanical every time (keep both entries, stack them) but they cost real review time and forced every PR through a rebase before merge. The same thing was starting to happen to `team/*.md` files when two PRs touched the same person's file.

**The fix is structural, not a rule asking people to be careful.** An entry is now its own file. Two people writing two different files can never conflict — git doesn't care that they landed the same minute.

## The convention

Every meaningful change gets **one new file**, never an edit to an existing one (except a same-day correction to your own not-yet-merged entry):

```
docs/build-log/entries/YYYY-MM-DD-<author>-<slug>.md
```

- `YYYY-MM-DD` — the date you're recording, so the directory sorts chronologically by filename.
- `<author>` — your name, lowercase, matching your `team/<name>.md` file.
- `<slug>` — three or four words, hyphenated, naming the work. `p2-16-consumer-gate`, `khaya-model-licence-sweep`, `popia-position-paper`.

Example: `docs/build-log/entries/2026-09-17-babatunde-unit-economics-engine.md`

**Never edit another person's entry file.** A correction is always a **new file**, same rule the old single-file convention already had — this just makes it structurally impossible to violate by accident during a merge.

## Reading the log

- **Last N entries, across everyone:** `ls -t docs/build-log/entries/ | head -N` (newest first by filesystem time) or sort the directory listing by filename — the date prefix makes it chronological either way.
- **One person's history:** `ls docs/build-log/entries/ | grep -- -<name>-`
- **One day:** `ls docs/build-log/entries/2026-09-17-*`
- **Everything, oldest first:** `cat docs/build-log/entries/*.md` in filename order.

`docs/SESSION-PROMPT.md`'s "read the last 5" step means the 5 most recent files in this directory, not lines in a file.

## The entry template — now also required: research, business, real data

Copy `docs/build-log/TEMPLATE.md`. The format kept everything the old single-file version required, and adds four fields that used to be optional and often got skipped:

- **Research** — what you actually read or checked before doing this (a source, a spec section, an existing pattern in the repo). "None — pure refactor" is a fine, honest answer when it's true.
- **Real data / references** — the actual numbers, competitor product, or precedent you grounded this in, with where it came from. Not required for pure process/coordination entries, but if you're stating a fact, this is where its source lives.
- **Business reasoning** — one sentence on how this makes the product more sellable, cheaper to run, lower-risk, or otherwise worth money — or "not applicable" with why (a pure security fix, a typo correction). This is the same discipline `templates/BUSINESS-HANDOFF.md` already asks for on capability changes; this field asks it of every entry, not just the ones that changed a capability.
- **Competitor reference** — if the work touches something a competitor (Vumacam, Flock, Fidelity ADT, ShotSpotter, WhatsApp, or one from `docs/COMPETITORS.md`) also does or refuses to do, say which and how VUKA compares. "Not applicable" is correct for most entries — use it deliberately, not as a default you never look at.

See `docs/AGENT-ROUTING.md` for who should be doing the research pass versus the execution pass versus the review pass — this is not one person's job every time.

## What did NOT move

- `docs/CHECKLIST.md` stays a single shared table. It's a different kind of shared file — row-level edits to a table auto-merge cleanly almost every time (git's line-based merge handles two different rows fine), which the append-only log fundamentally cannot do. Keep editing it in place.
- `team/<name>.md` files stay one per person, as before. The remaining conflict risk there is two of *your own* PRs open at once touching your own file — avoid that by merging or rebasing your first PR before opening a second, not by restructuring further.
- `docs/BUILD-LOG.md` itself is **frozen as of 16 September 2026** — the historical record up to that point, kept exactly as written, nothing removed. See the banner at its top.

## check-docs.mjs

`node scripts/check-docs.mjs` now also confirms `docs/build-log/` exists and contains at least the frozen-date entry, so the convention can't silently stop being followed without a visible failure.
