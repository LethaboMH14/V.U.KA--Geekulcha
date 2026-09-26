## FACT 2026-09-26 | Assistant (tool/model not recorded) | P3.U2 / P3.U3 UI parity follow-up | Implemented; human review pending

**Criterion and trust** — U (Usability and Design). `ASSUMPTION`: the three-tab navigation, home action order and guardian alert hierarchy help people find the next action quickly; this needs human/device review. `FACT`: guardian standby distinguishes checking, current and unknown status, and the 10111 instruction leads the alert. This aims to answer “Would a real user trust and use this?” by showing state and limits plainly.

**Review gates** — Fraud red-team: `FACT`, no detection or escalation behavior changed; the alert still uses the existing 10111, handling and stand-down actions. Build for use: `FACT`, reference buttons are 54 dp and the nav pill is 64 dp in the XML; `PROPOSED`, a budget-phone dark/bright-light check remains due. Economic integrity: `FACT`, no economic figures or claims were added. Privacy by design: `FACT`, no new data destination was added; the existing real-device record route still requires the PIN.

**Research** — Read the required master context, product rules, evidence, security and VIGIL spec; inspected the current screens, guardian logic, components, theme and latest build entries. Compared the requested Android layouts with the live app: `item_nav_tab.xml`, `activity_main.xml`, `fragment_home.xml`, `fragment_guardian_standby.xml`, `fragment_guardian_alert.xml`, and `fragment_guardian_acknowledged.xml` on `origin/feature/ui`.

**Real data / references** — `FACT`: the Android reference files are present on `origin/feature/ui` (`git ls-tree -r --name-only origin/feature/ui -- app/src/main/res/layout`). `FACT`: TypeScript and Jest command result recorded below. The XML acknowledged screen is explicitly a simulated example; the live acknowledgement view uses only actions returned successfully by the existing call path.

**Business reasoning** — `ASSUMPTION`: clear navigation and an urgent guardian instruction reduce confusion at the moment of use, supporting trust in the service; adoption and impact were not measured.

**Competitor reference** — Not applicable; this is a parity port against the team's own Android layout reference.

Changed:
- `app/src/ui/screens.tsx`, `app/src/ui/icons.ts`: three-tab member navigation on home and settings only, with the Record route passing through the real-device PIN destination; home copy now describes listening during a journey, and the active home content follows the Android action order.
- `app/src/ui/guardian.tsx`: alert instruction first, then who/why and location; acknowledgement actions shown as response status; standby distinguishes checking, current and unknown status.
- `app/src/ui/navigation.ts`, `app/src/ui/__tests__/navigation.test.ts`: pure record destination helper and tests for simulated and real devices.

**Evidence** — `FACT`: from `app`, `npx tsc --noEmit -p . && npx jest` passed; 13 suites, 216 tests. `FACT`: visual check on a real budget phone, TalkBack, and day/night lighting was not run.

**Decision** — None. This does not accept or close P3.U2/P3.U3; checklist and owner files remain unchanged pending the work order's human review and device evidence.

**Needs/blockers** — `PROPOSED`: Mutarisi/Lethabo to review against the design and record disposition. `PROPOSED`: device operator to perform a budget-phone pass in dark and bright light, including text sizing and TalkBack.

**Business handoff** — Not applicable; no capability or business model changed.

**Next** — Human reviewer to inspect the committed UI and device evidence before acceptance.
