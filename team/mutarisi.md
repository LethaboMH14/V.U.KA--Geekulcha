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
   - Delivery chips: queued → received only. Never a guardian acknowledgement while an incident is open (spec V8).
   - My Record timeline (from Figma `23:8`) with "Verify independently". Incident events stay hidden until the incident closes (spec V8).
   - Settings: deletion with the 72 h notice; the recovery code shown once, only if the recovery endpoint exists.
3. **Fri–Sat — guardian mode:**
   - Enter the code, with QR through the Google code scanner (no camera permission).
   - Consent and the s18 notice; ready.
   - The alert screen leading with "Don't call or text them. Call 10111."; the call button locked until `stand_down` or a normal PIN.
   - Acknowledge (calls Vukosi's native signer).
4. **Sat — `dashboard/`:** replace the parked camera prototype with `/panel` (crt.sh-style table of opaque hashes, chain index and receipts linked to HashScan; event kinds only for `sim_` subjects, tagged SIMULATED) and `/verify` (drop zone plus the three-state result chip).
5. **Every screen** gets its loading, error, queued, no-network and empty states before its happy path.
6. **Fri 25 by 10:00 — guardian-min receiver** (with Khutso): a debug screen in the APK that shows a raw FCM alert from the server, so the Fri 12:00 slice can prove delivery before the full guardian mode exists.
7. **APK backup owner (D1).** If Vukosi's release APK isn't cold-installing by Thu 22:00, you take over the release build with him on Friday morning. Until then the demo phone runs a USB-installed debug build, and we say so.

**Acceptance checks:**
- [ ] T15 passes (normal vs duress screenshot diff is identical)
- [ ] Every screen has its non-happy states
- [ ] Tested on a real budget phone in dark and bright light (photos in the PR)
- [ ] All targets at least 48 px; contrast checked
- [ ] No string says "invisible", "proof of duress" or a bare "sent"; SIMULATED tags on all sim data

**Deadlines:** guardian-min receiver **Fri 10:00**; Start journey, Journey check and My Record by **Fri 12:00** (end-to-end slice); guardian mode Sat 12:00; panel and verify layout Sat 18:00.
**Depends on → hands off to:** Figma (Lethabo), native modules (Vukosi), contract mock (Sibusiso), verify cryptography (Ipeleng) → screens for Babatunde's deck and Lethabo's demo.
**Do not:** introduce any visible difference between normal and duress; show state by colour alone; add features that aren't in `docs/VUKA-2-SPEC.md`; ship tokens that fail WCAG contrast.
**Reviewer:** Lethabo.

## Sequenced work

Replaced on 23 Sep 2026 by the work order above. The four-layer sequenced work, declarations and self-reviews are kept in [this file's history](../archive/2026-09-four-layer/team/mutarisi-history.md).

## Interfaces

See your work order's **Depends on → hands off to** line. Shared files are claimed in `docs/OVERLAPS.md`; never silently change a shared contract.

## Needs and blockers

- Add new blockers here with the person's name and the evidence needed.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every work-order item has its acceptance checks ticked with evidence, reviewer acceptance, the relevant checks passing, an honest built/specified/simulated status, this file and a `docs/build-log/entries/` file updated, and its `docs/CHECKLIST.md` P3 row ticked. Blocked tasks stay blocked; no approval is inferred from elapsed time.

## Outside-role work

None assigned for the build weekend. Agree any extra contribution with the leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Mutarisi is asserted; owner acknowledgement pending.
