## 2026-09-24 | Lethabo (co-lead), via Claude Code assistant | Interactive UI prototype added as the design reference | PROPOSED — for Mutarisi and Vukosi

**Research** — The screens were planned with a structured prompt, reviewed twice for duress leaks, spec accuracy, contrast and scope, then built in Figma Make (slices A and B). The rest was built in code: slices C (onboarding, Settings, guardian lifecycle) and D (`/verify`, `/panel`, `/stage`). A design-standards pass followed: double-bezel hero cards, button-in-button trailing icons, ink-tinted single-source shadows, spring motion, grain and focus rings.

**Real data / references** — The accessibility audit was run in the browser on every route. Before the fixes:
- secondary text measured 2.9–3.8:1 on Ivory and 3.6:1 on Midnight;
- input borders were below 3:1;
- phone screens had no `main` or `h1`;
- web targets were 40 px.

After: text is 4.9:1 or better (`#636870`, `#8b93a1`), input borders are 3:1 or better, landmarks and headings exist, and targets are at least 44 px. The white-on-ink-gradient buttons are about 11:1, measured by hand because the scanner can't read gradients. Normal and duress PIN render identical Journey check markup (checked in the DOM).

**Business reasoning** — A clickable, spec-faithful prototype lets judges, insurers and the team see exactly what VIGIL does before the Android build lands. It is also the demo fallback (`/stage?present`).

**Competitor reference** — Not applicable.

Changed: `prototype/` (new): a Vite + React + Tailwind + Phosphor app, with `README.md` giving routes, rules and how to run it. No product code, contract or spec changed.

Evidence: `npx tsc --noEmit -p .` and `npx vite build` pass in `prototype/`. Root `node scripts/check-docs.mjs` and `node --test "test/**/*.test.mjs"` were run before commit.

Decision: none. The prototype is a reference, not the shipped app.

Needs/blockers: Mutarisi and Vukosi confirm it as the reference for `app/src/ui/`. A TalkBack pass on a real phone (T17) is still needed.

Business handoff: Babatunde can use `/stage?present` and the screens for the deck and the store-style images, labelled mock-ups.

Next: port the screens into `app/` against contract v2 (#51).
