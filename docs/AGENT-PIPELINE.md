# Agent pipeline — how the flow actually works, and what real tools improve it

Researched 16 September 2026, ahead of writing this. Every recommendation below is checkable against a real, named source — no invented tool names.

## What we already have, that turns out to match established practice

Before changing anything: the shape we independently built — `team/<name>.md` per person, an append-only decision log, a "read this first" master-context file, a session-start prompt that re-reads current state — is **not a workaround, it's the standard pattern.** A real open-source Claude Code skill built for exactly this ("role zones, append-only decision journal, cold-start budget hook, git-based KPI, for projects run by several parallel Claude Code sessions") independently converged on the same shape — see `multi-agent-coordination-skill` ([brattri3](https://github.com/brattri3/multi-agent-coordination-skill), mirrored at [DimaMuhannad](https://github.com/DimaMuhannad/multi-agent-coordination-skill)). Worth reading for refinements, not because ours is wrong.

## The three concrete gaps, and what real, named tools close them

### 1 · Who reviews what — was memory, now GitHub-native

**Gap:** RULES.md says "Lethabo is first reviewer for Mutarisi, Ipeleng and Babatunde; Sibusiso for Vukosi and Khutso" — but nothing *enforced* it. Every PR needed a human or an agent to remember and manually request the right reviewer.

**Fix, landed in this PR:** `.github/CODEOWNERS`. GitHub-native — a CODEOWNERS file maps path patterns to reviewers and auto-requests them the moment a PR touches a matching path ([GitHub Docs](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team); [Arnica's setup guide](https://www.arnica.io/blog/what-every-developer-should-know-about-github-codeowners)). No plugin, no third-party trust decision — it's a text file GitHub itself reads.

**The real caveat, from the same research, worth stating because it will otherwise bite us silently:** *"CODEOWNERS fails silently. A wrong pattern order, a team with no members, or an owner without write access produces no error dialog — the review request simply never fires, and the PR merges without the eyes you intended"* ([devtoolhub.com](https://devtoolhub.com/github-codeowners-permissions-best-practices/)). **Action for whoever picks this up next:** open one throwaway PR touching a path from each owner's section and confirm the review request actually appears before trusting it in a real PR. Untested automation is worse than no automation, because it looks covered.

**Also from research, not yet done — needs a decision, not code:** *"To make reviews mandatory before merging, you must set up branch protection rules... Require a pull request before merging and Require review from Code Owners"* ([same source](https://www.arnica.io/blog/what-every-developer-should-know-about-github-codeowners)). This is `G17` in `docs/OPEN-GAPS.md` — already tracked, blocked on the repo being public (confirmed `G0` reason). CODEOWNERS *suggests* reviewers today; it does not yet *require* them being satisfied before merge.

### 2 · Auto-detect work and ping the right person — real, official, not yet installed

**Gap:** the ask was for something to notice when a PR needs attention and tell the right person, instead of everyone polling.

**What's real:** Anthropic ships an official **Claude Code GitHub Action** (`claude-code-action`, [GitHub Marketplace](https://github.com/marketplace/actions/claude-code-action-official), [official docs](https://code.claude.com/docs/en/github-actions)). It *"intelligently detects when to activate based on your workflow context — whether responding to `@claude` mentions, issue assignments, or executing automation tasks."* Setup is `/install-github-app` from Claude Code in the terminal, which walks through the GitHub App install and required secrets.

**Not installed by this PR** — it needs the repo owner's GitHub OAuth to authorise the app, which is an account-level decision only Lethabo (or whoever holds admin on the repo) can make interactively. **Recommendation:** run `/install-github-app` once, then `@claude` in a PR comment can trigger a bounded stage-1 task (see `docs/AGENT-ROUTING.md`) directly from GitHub — closing the "someone has to notice and start a session" gap without a new bespoke tool.

### 3 · The build-log conflict — structural, not a discipline problem

Covered fully in `docs/build-log/README.md`. Summary: one shared append-only file guarantees collision the moment two PRs are concurrent, regardless of how careful anyone is. Fixed by making each entry its own file.

## Skill marketplaces — researched, named, deliberately not installed

Several real, active third-party Claude Code skill/plugin marketplaces exist: [wshobson/agents](https://github.com/wshobson/agents) (multi-harness, works across Claude Code/Codex/Cursor/OpenCode/Copilot), [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) (380+ skills across engineering/product/compliance/research), [aiskillstore/marketplace](https://github.com/aiskillstore/marketplace) (claims security-audited, one-click install), [mhattingpete/claude-skills-marketplace](https://github.com/mhattingpete/claude-skills-marketplace) (git automation, testing, code review specifically).

**Not installed here, on purpose — same standard the project already applied to `affaan-m/ECC`:** these are third-party code that would execute in every session. "Security-audited" on a marketplace's own README is a claim, not a verification any of us has done. **If the team wants to adopt one:** pick the specific skill (not the whole marketplace), read its `SKILL.md` and any hook scripts it installs, and land that decision as its own entry with the actual review recorded — the same discipline this PR is asking for everything else.

## The quality bar, for whoever picks up work next

This is the plain answer to "what does good look like here":

1. **State the criterion** (C1–C4) and answer "would a real user trust and use this?" before starting — `RULES.md` already requires this; it's restated here because it's the actual filter for whether work is worth doing at all.
2. **Research first, with a real source named.** Not "it's probably true" — a section, a filed number, a competitor's actual product. `docs/build-log/TEMPLATE.md`'s Research field is where this lives now, for every entry, not just the ones that felt like they needed it.
3. **Business reasoning, one sentence, every time.** Not every entry changes revenue — "not applicable, pure security patch" is a complete and correct answer. The discipline is asking the question, not always having a dollar figure.
4. **Route to the right tier.** A bounded task doesn't need a strong model; a judgement call doesn't get a cheap one. `docs/AGENT-ROUTING.md`.
5. **A finding that matters becomes a rule, not a comment.** Say it once in the standing docs and it holds for the next session, any tool, any person — that's the whole point of a shared repo over a shared chat history.
6. **CODEOWNERS gets you requested, not excused.** Being auto-requested as a reviewer doesn't mean the review is real — read the diff.

## What did not get solved today, named so it isn't lost

- Branch protection enforcing CODEOWNERS (`G17`, blocked on repo visibility).
- The GitHub App install for `@claude` automation (needs an interactive OAuth step from the repo owner).
- Any third-party skill marketplace adoption (deliberately deferred pending an actual read of what it installs).
