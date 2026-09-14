# dashboard/ — operator and member views

React + Vite + TypeScript strict + MapLibre (`docs/HANDOVER.md` §8, `docs/TECH-STACK.md`).

**Empty scaffold.** No code lands here yet — see `docs/HANDOVER.md` Task 4 (ported last, after `shared/`, `brain/`, `server/`, `app/`, `appliance/`, `data/`).

## What lives here

- The **operator** view: entity graph, verification queue (`watch_candidate` → human review), evidence-chain inspector, patrol routing.
- The **member-facing** views: safest-route (distinct from the patrol planner — `docs/00-SPEC.md` §4.1), hotspot map, subject-access portal (F14).
- Twelve of the priority wireframes (`docs/OPEN-GAPS.md` G11) implement against 14 already-exported screen specifications — Mutarisi implements, Lethabo reviews (`docs/TEAM.md`).

## Non-negotiable, before any code lands here

- **TypeScript strict** (`docs/HANDOVER.md` §7, `RULES.md`).
- Consumes `shared/contract.ts` — never redefines request/response shapes locally.
- **The operator socket and the member socket are different rooms** (`/ws/ops` vs `/ws/member`), and the member room must never receive an ops event. This is a contract test on the server side, but the dashboard's own code must not assume otherwise.
- **Duress states are visually identical to normal states.** No observable UI, network or timing difference a coercer could notice (`docs/HANDOVER.md` Task 6).
- Any figure shown to an operator that is not calibrated must be visibly labelled as a target, per the honesty ledger (E6, E7 — `sim_` prefix on anything simulated).
