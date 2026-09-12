# Wireframes — 12 priority screens

Exported design references, high-fidelity, from the BEACON design handoff (`design/exports/design_handoff_beacon/`, predecessor codebase). Closes **G11** in `docs/OPEN-GAPS.md` — the rubric's "Progress of solution profile" criterion explicitly names wireframing (`docs/SDLC-GAP-ANALYSIS.md` §4.1).

Each `.dc.html` file is a self-contained design reference — open it directly in a browser. It shows intended look, layout, copy and interaction; it is **not production code to copy directly** (per the original handoff's own README). Colours, type, spacing and copy are final per the design system in the source bundle; recreating them pixel-perfectly against this repo's actual stack (`docs/TECH-STACK.md`) is `docs/HANDOVER.md` Task 6, owned by Mutarisi, reviewed by Lethabo.

## ⚠️ Rendering note

These files reference two small runtime helpers from the source bundle — `support.js` (design-tool plumbing that gives the custom `<x-dc>`/`<helmet>`/`<x-import>` tags their behaviour) and `ios-frame.jsx` (the iOS device-bezel used by the five member-facing screens). **Those two files are not included here yet** — they are `.js`/`.jsx`, which trips the same intake-gate check (`scripts/check-intake.mjs`) that Task 3's scaffolding is currently waiting on both leads to clear. Opening these `.dc.html` files directly right now will render the design copy and inline styles, but not the full custom-element behaviour or the iOS frame. They'll be added once the gate closes.

## Index — screen → journey step

| Screen | Journey it serves | Note |
|---|---|---|
| [`Member App Home`](Member%20App%20Home.dc.html) | All four (`docs/USER-JOURNEY.md`) | VIGIL entry point — every journey starts or returns here |
| [`Member Alert Detail`](Member%20Alert%20Detail.dc.html) | **J1 Nomsa**, 19:42:10 — "Her Guardian's phone lights up... she sees a countdown" | The cancel-window screen — the single most safety-critical UI in the system |
| [`Member Live Camera`](Member%20Live%20Camera.dc.html) | **J3 Property**, 15:05 — "Mother's phone alerts, with live feed... she has a visible cancel control" | Member-side view of the KHAYA live feed and escalation confirm/cancel |
| [`Safe Route`](Safe%20Route.dc.html) | **J1 Nomsa** context — preventive, member-facing | Explicitly distinct from the operator-facing patrol planner (`docs/00-SPEC.md` §4.1 — same name appears twice for two different audiences, by design) |
| [`Live AI Camera`](Live%20AI%20Camera.dc.html) | **J3 Property**, 15:05 — "Classified person... floodlight and siren fire as a deterrent" | KHAYA's own console view of a live classification event |
| [`Verify Queue`](Verify%20Queue.dc.html) | **J1 Nomsa**, 19:43:15 / **J4 Musa**, Day 11 16:22 | The human gate itself — where `watch_candidate` waits for a human, and the only place a `flag`/`dismiss`/`whitelist` decision gets made |
| [`Community Operations Centre`](Community%20Operations%20Centre.dc.html) | **J1**, **J4** — general ops shell | The console an operator works from before opening a specific entity |
| [`Investigation Workspace`](Investigation%20Workspace.dc.html) | **J4 Musa**, Day 11 16:22 — "An operator reviews. Recognises a delivery pattern" | Entity history and evidence-chain detail behind a single `watch_candidate` |
| [`Patrol Command`](Patrol%20Command.dc.html) | **J3 Property** context — dispatch/response | OR-Tools patrol planner (`docs/00-SPEC.md` §3.3) — operator side |
| [`Patrol Officer Shift`](Patrol%20Officer%20Shift.dc.html) | **J3 Property**, 15:23 — "Response arrives, scans on site" | The responding officer's own view, not the console dispatching them |
| [`Crime Intelligence`](Crime%20Intelligence.dc.html) | Supports **J1**, **J3** context — area risk | UMOJA's 3-tier honest-fallback risk layer (`docs/00-SPEC.md` §4.1 `GET /v1/risk`), visualised |
| [`Executive Analytics`](Executive%20Analytics.dc.html) | Not journey-specific | Business/impact view — supports `docs/08-BUSINESS.md`, not a step in any of the four member/operator journeys |

## What this is not

Not a claim that these screens are built. They are **designed, not built** (`README.md`'s own status table) — static references a judge or reviewer can open, matching what the rubric asks to see at this stage, nothing more.
