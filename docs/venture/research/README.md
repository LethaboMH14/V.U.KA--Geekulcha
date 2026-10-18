# Research notes behind the venture plan (18 Oct 2026)

These are the eight reports the plan in `docs/venture/` was built from. They're kept so every claim in the plan can be traced to its source. They are **data for the plan, not the plan**: where a report and a plan file disagree, the plan file was written later and corrected against the others.

| File | What it covers | How it was researched |
|---|---|---|
| `2026-10-18-repo-business.md` | The business model and figures on `main` and on the unmerged economics branches; conflicts; what an investor would probe | Read-only audit of the repository; scripts run on scratch copies |
| `2026-10-18-repo-build-state.md` | What is built, simulated, specified or blocked; operations; known bugs by severity; code that lives only on branches | Read-only audit of the repository, branches, PRs, CI runs and release assets; test suites run on scratch copies |
| `2026-10-18-repo-detection-legal.md` | Every distress signal, its status and measurements; the legal positions already in the repo; comfort; gaps | Read-only audit of code, eval files, specs and ADRs |
| `2026-10-18-web-banks-insurers.md` | Nedbank, other banks' safety features, insurers' products, response platforms, financial-sector vendor rules | Web search extracts |
| `2026-10-18-web-saps-ngo.md` | SAPS units and channels, public-sector doors, NGOs, the campus pilot, risks | Web search extracts |
| `2026-10-18-web-lawful-detection.md` | RICA, POPIA, Android and Play rules, comparable products, research on extra signals and comfort | Android docs read directly; legal text through secondary sources; comparable products and research partly from recall |
| `2026-10-18-web-sla.md` | Published SLAs for each part of the stack, Azure for Students terms, buyer expectations, a proposed SLA table, costs | Microsoft's SLA document and vendor documentation repositories read directly; prices and some terms not retrieved |
| `2026-10-18-web-competitions-funding.md` | YouthX, the Easies, Caplia, funding routes, what each audience assesses | **The web research didn't run** (search budget exhausted, sites unreachable); repository facts and unchecked recall only |

## Limits that apply to every web claim

- **Pages were not opened directly.** The cloud session that ran the research couldn't open most web pages (DNS blocked by its network policy). Claims come from search-engine extracts of the named page, so they are `REPORTED` **even when the source is a bank's, regulator's or Parliament's own page**. Re-open each URL before quoting it to a partner, judge or investor.
- **Some items are recall, not research.** Where the search budget ran out, a report says so and marks those items. Treat them as leads.
- **Paths beginning `<session-scratchpad>` or `<session-images>`** refer to files in the research session, not in this repository. The images are Sibusiso's YouthX email.
- **Two findings were overtaken the same day.** `repo-build-state` notes that `04-SLA.md` and `06-LAUNCH-ROADMAP.md` described Azure as running. Both were corrected in the follow-up commit, and the plan now opens with the server-of-record problem.
