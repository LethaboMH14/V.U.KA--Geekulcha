# Team start instructions

The repository is ready for assigned work. The intake gate is approved with evidence in `docs/security/intake-gate.json`; repository checks still run on every change. Product readiness remains bounded by `docs/OPEN-GAPS.md`.

## Before editing

1. Read `RULES.md`, `AGENTS.md`, `docs/HANDOVER.md` and your `team/<name>.md` file.
2. Enter your actual availability, AI tool/model and current task in your personal file. Do not infer these fields for another person.
3. Claim files in your personal file and check `docs/OVERLAPS.md` before changing a shared contract.
4. Update from `main` (PR #2 merged as `fa72f32`), then branch using `RULES.md`: `feat/<owner>-<wbs-id>`, `fix/<owner>-<topic>` or `docs/<topic>`. Keep built, designed, simulated and proposed claims distinct.
5. Install the per-clone hook using `SECURITY.md` and run the checks there. Confirm repository write access and Figma access before claiming an implementation task. Access and availability have not been verified for every teammate.

## Current first work item

| Person | Role | Start with | First reviewer |
|---|---|---|---|
| Lethabo Hoaeane | Co-lead; architecture, product, UX/Figma | G12 model provenance/licence register | Sibusiso |
| Sibusiso Khumalo | Co-lead; backend, ledger, CI, demo orchestration | G14 machine-readable API contract | Lethabo |
| Mutarisi Chibaya | Frontend / integration | WBS 2.3: member/setup wireframes; implementation waits for the approved API contract | Lethabo |
| Vukosi Khoza | Edge, device and hardware | Sensor contract and measured hardware/BOM evidence | Sibusiso |
| Khutso Mothopa | System analyst; requirements, WBS, traceability and verification mapping | WBS 2.1: map requirements to journeys; coordinate later evidence reproduction | Sibusiso |
| Ipeleng Constance Modise | Security, privacy and red team | Privacy/data-flow review and abuse cases | Lethabo |
| Babatunde Adelusi | Business, pitch and validation | Validate buyer assumptions and audit pitch claims | Lethabo |

Dates and hours remain planning assumptions until each owner confirms them. A task is done only with evidence, reviewer acceptance, updated personal notes and a `docs/BUILD-LOG.md` entry.

Branch protection remains unresolved (G17). Until enforced, follow the manual review requirements in `RULES.md`: both leads, plus a nonauthor domain reviewer for lead-authored changes. A merge event or passing CI does not establish that these reviews occurred. The application has not been ported yet; repository readiness is not deployment readiness.
