# Mutarisi Chibaya

**Proposed planning package; owner has not confirmed availability or started these tasks.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Mutarisi Chibaya. University of Pretoria. The VIGIL and guardian screens — what a stressed person can actually complete, at night, on a budget phone.

**Reviewed by** — Lethabo, then both leads.

**Effort** — **Medium-high.** Show me the screen, not a description of the screen.

**Behaviour** — *Show me the screen, not a description of the screen. Flag anything that would be unreadable on a budget Android or in daylight. If a state is missing — loading, error, stale, empty — tell me before I build the happy path.*

**My domain rules**
- **Duress states are visually identical to normal states** — no observable difference in pixels, haptics, timing or network behaviour. This is the safety property, not a design choice (test T15).
- **Delivery is shown truthfully**: queued → received → acknowledged. Never a generic "sent".
- **The guardian alert leads with "Don't call or text them. Call 10111."**; calling unlocks only after `stand_down`.
- **48 px targets, one primary action per screen, state never by colour alone**, WCAG contrast 4.5:1 for body text.
- **Stale data is greyed and stamped with its age**, never blank and never silently fresh.
- Anything simulated carries a visible `SIMULATED` tag.

**Current task** — Work order below (issued 23 Sep). First: set up the UI foundation in `app/` and build Start journey, Journey check and My Record for the Fri 12:00 end-to-end slice.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: every screen has its loading, error, stale and empty states before I call it done, not just the happy path.

---

- University / role: University of Pretoria / Frontend developer
- Owns outright: VIGIL and guardian interfaces; panel and verify-page layout (operator interfaces parked 23 Sep).
- Reviews only: API usability and screen-copy feasibility.
- Lead / escalation: Lethabo, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: Work order issued 23 Sep 2026 (see the Work order section below); first screens due Fri 25 Sep 12:00.
- Claimed files / contract versions: none; reserve before editing.
- Last updated: 23 September 2026 — work order issued by Lethabo (co-lead) via Claude Code assistant.

## Work order — VIGIL + ANCHOR build (issued 23 Sep 2026)

> Issued by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde. Decisions: ADR-0034 to ADR-0038. Spec: `docs/VUKA-2-SPEC.md` (section numbers below refer to it). **Owner acknowledgement pending** — accept it in your running log, or raise a blocker here. All times SAST. Criterion letters per `docs/MASTER-CONTEXT.md` §2 (I · T · U · S · B · Q). Before you start anything: pass the four review gates in `docs/MASTER-CONTEXT.md` §10.

**Outcome you own:** every screen a user and a guardian touch — calm, legible at night on a budget phone, and identical under duress.
**Serves:** U, S, I.
**Files you own or may touch:** `app/src/ui/` and screen components, `dashboard/` (panel and verify page **layout**; the cryptography is Ipeleng's), Figma frames from Lethabo.

**Do this, in order:**
1. **Thu 24** — UI foundation in `app/`:
   - NativeWind + React Native Reusables (or gluestack-ui) + Reanimated/Moti, at versions that list React Native 0.74 support (check each compatibility table before installing; pin versions).
   - Bundle IBM Plex Sans, IBM Plex Mono and IBM Plex Sans Condensed (SIL OFL).
   - Phosphor icons: confirm the React Native package, or wrap the SVGs with `react-native-svg`.
   - Tokens from Lethabo's Figma.
2. **Thu–Fri — VIGIL screens:**
   - Welcome.
   - Permissions, including the refuse-to-arm explanation.
   - Guardians: invite code and QR, "what they will see", PIN-gated changes.
   - Start journey; Journey active.
   - **Journey check**: normal and duress PIN give the identical outcome, the same haptic and no timing difference.
   - Delivery chips.
   - My Record timeline (from Figma `23:8`) with "Verify independently".
   - Settings: deletion with the 72 h notice; the recovery code shown once, only if the recovery endpoint exists.
3. **Fri–Sat — guardian mode:**
   - Enter the code, with QR through the Google code scanner (no camera permission).
   - Consent and the s18 notice; ready.
   - The alert screen leading with "Don't call or text them. Call 10111."; the call button locked until `stand_down` or a normal PIN.
   - Acknowledge (calls Vukosi's native signer).
4. **Sat — `dashboard/`:** replace the parked camera prototype with `/panel` (crt.sh-style table of opaque hashes, chain index and receipts linked to HashScan; event kinds only for `sim_` subjects, tagged SIMULATED) and `/verify` (drop zone plus the three-state result chip).
5. **Every screen** gets its loading, error, queued, no-network and empty states before its happy path.

**Acceptance checks:**
- [ ] T15 passes (normal vs duress screenshot diff is identical)
- [ ] Every screen has its non-happy states
- [ ] Tested on a real budget phone in dark and bright light (photos in the PR)
- [ ] All targets at least 48 px; contrast checked
- [ ] No string says "invisible", "proof of duress" or a bare "sent"; SIMULATED tags on all sim data

**Deadlines:** Start journey, Journey check and My Record by **Fri 12:00** (end-to-end slice); guardian mode Sat 12:00; panel and verify layout Sat 18:00.
**Depends on → hands off to:** Figma (Lethabo), native modules (Vukosi), contract mock (Sibusiso), verify cryptography (Ipeleng) → screens for Babatunde's deck and Lethabo's demo.
**Do not:** introduce any visible difference between normal and duress; show state by colour alone; add features that aren't in `docs/VUKA-2-SPEC.md`; ship tokens that fail WCAG contrast.
**Reviewer:** Lethabo.

## Sequenced work

**Superseded 23 September 2026 by the work order above** — kept for history; do not execute these rows. All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 16 | 2.3 | 6 | Build or draw member/setup wireframes | 2.2 | S01–S07 checked by Lethabo on narrow viewport |
| Sep 17 | 2.4 | 6 | Build or draw operator/subject wireframes | 2.2 | S08–S12 include stale/error and rights states |
| Sep 18 | 3.4 | 6 | Connect one synthetic end-to-end flow | 2.4,3.3 | Candidate→human review→receipt→record; stale status checked |
| Sep 21 | 6.1 | 4 | Prepare accessible offline visual fallback | 4.5 | Local assets open without internet; sim_ and limitation labels retained |

## Interfaces

- Inputs: Approved screens from Lethabo; API schema from Sibusiso.
- Outputs: Screen state requirements to backend; task walkthrough to Khutso.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

No work by Mutarisi Chibaya is asserted. This package was created by the assistant. No files are reserved and no PR exists.

## Needs and blockers

- Schema churn → both leads freeze contract.
- inaccessible copy → Lethabo language reviewers.
- hardware unavailable → Vukosi provides clearly labelled synthetic fixture.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Projector/contrast checks.
- screenshot inventory for offline fallback.
- keyboard navigation review of subject portal.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Mutarisi is asserted; owner acknowledgement pending.
