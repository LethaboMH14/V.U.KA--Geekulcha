## 2026-09-16 | Khutso (Claude Sonnet 5 session, ClaudeX-Loop execute pass) | claude-sonnet-5 | P1.1-P1.3 figure sweep | closed, review pending

**Research** — Ran `git grep -n "2\.7m\|2,7m\|180k\|180,000"` across tracked `*.md` (P1.1): zero hits repo-wide. Checked `docs/08-BUSINESS.md`, `docs/SONKE-OVERVIEW.md`, `docs/COMPETITORS.md` for stale industry-size figures (P1.2): none found, R87bn/R7bn already correctly present. For P1.3, counted `docs/adr.md` directly (`git grep -c "^## ADR-"`) rather than trusting the checklist's own "27→25" instruction — found it was stale: the true current count is **32**, not 25 or 27, since ADR-0026 through ADR-0032 were authored during this hackathon, after the original "25" figure (confirmed from the two predecessor repos in July) was recorded. Distinguished two legitimately different correct answers depending on context: 25 for predecessor-lineage claims ("six weeks of work that predates this hackathon" — LEAN-CANVAS.md, PLAIN-WORDS.md), 32 for current-repo-state claims (01-ARCHITECTURE.md's traceability row, MASTER-CONTEXT.md's figures table).

**Real data / references** — Actually ran this clean repo's own test suites rather than only citing the predecessor's grep-based 510 figure: `node --test test/events-contract.test.mjs test/openapi-contract.test.mjs` → 10/10 pass; `python3 -m unittest discover -s appliance/tests` → 7/7 pass; `python3 -m pytest brain/tests/` → 20/20 pass (pytest was not installed in this environment; installed it to get a real collected count rather than leaving it unreproduced). Total: **37 tests collected, 37 passing**, in this repo, today — a new fact, not previously recorded anywhere.

**Business reasoning** — Not applicable directly — this is a credibility/accuracy correction, not a revenue change. Indirectly: every stale or self-contradictory number a judge can catch costs trust, and trust is the entire thesis of this product.

**Competitor reference** — Not applicable.

Changed: `docs/00-SPEC.md` (retired "440 test cases," pointed to the 510 predecessor figure and the new 37-test current-repo figure, both with commands). `docs/01-ARCHITECTURE.md` (27→32 ADRs, both occurrences, with the exact grep command). `docs/LEAN-CANVAS.md`, `docs/PLAIN-WORDS.md` (440→510-with-caveat only; left "25 ADRs" untouched since it's correctly describing predecessor lineage, not current-repo state). `docs/EVIDENCE.md` (added the new 37-test collected-count finding with exact commands, clearly distinguished from the 510 predecessor figure). `docs/MASTER-CONTEXT.md` (25→32 ADRs, with a note explaining the split between predecessor-confirmed and hackathon-authored ADRs so the next person doesn't regress this the same way the original "27→25" instruction did). `docs/CHECKLIST.md` (P1.2, P1.3 marked closed with evidence; P1.1 left as Khutso's own already-correct ◐ entry, untouched).

Evidence: `node scripts/check-docs.mjs` — run below, see PR. All test commands above actually executed, not asserted; exact pass counts shown.

Decision: no contract, security or product-capability change. Correction-only. The finding that the original "27→25" checklist instruction was itself stale is worth carrying forward: **a written instruction can go stale exactly like a claim can** — this is now also noted in the CHECKLIST row itself so nobody re-applies the old, wrong direction.

Needs/blockers: none. Genuine second-person review still needed before this is team-accepted (Sibusiso, per CODEOWNERS on docs/CHECKLIST.md/docs/EVIDENCE.md).

Business handoff: not applicable — accuracy correction, no household-facing capability changed.

Next: none required for this leaf. P1.9 (re-tag everything when real judging criteria publish) remains Khutso's next open item.
