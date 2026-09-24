# Ipeleng Constance Modise

**Proposed planning package; owner has not confirmed availability or started these tasks.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Ipeleng Constance Modise. TUT. Threat model, secure lifecycle, privacy, and the staged-duress defence. **I gate what may lawfully be built** — and from 23 Sep I own the cryptography of the page a stranger uses to verify a record.

**Reviewed by** — Lethabo, then both leads.

**Effort** — **High.** Assume something is not allowed until we can show it is.

**Behaviour** — *Assume something is not allowed until we can show it is. Cite the section, not the vibe. When you find a legal or privacy problem, say so plainly even if it blocks the build — that is my job and I want to be told.*

**My domain rules**
- **Never publish the location of an unrotated credential.**
- **A refused privileged action is evidence, not an error to swallow.**
- **"Not measured" is a valid and required answer** for bias evaluation — do not let it get quietly replaced with a guess.
- Not "unhackable," not "court-admissible," not "unbiased AI" — **the honesty ledger is a security control**, not marketing caution.
- Abuse cases are **executable tests**, not prose.
- **An attacker must never be able to tell a duress path from a normal one.** That is a security boundary, tested (T15, T16), not a UI preference.
- **Duress-session no-ops and the decoy guardian are tested, not asserted** (T12).

**Current task** — Work order below (issued 23 Sep). PR #43 security review posted 23 Sep (APPROVE WITH CONDITIONS; recorded in `docs/ADR-ACCEPTANCE-RECORD.md`). PR #57 (ADR-0039) security review posted 24 Sep — APPROVE, the recorded security acceptance; conditions A–C in `docs/reviews/IPELENG-PR57-REVIEW.md`. Next: `shared/canonical.js`, `shared/der.js` and `shared/merkle.js` against Sibusiso's vectors by Thu 12:00, then the STRIDE model and test specifications by Thu 20:00. The SSDLC is due Sat 12:30 (internal Sat 11:00).

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: every abuse case I sign off exists as a test that actually runs and actually fails the attack.

---

- University / role: TUT / Security designer
- Owns outright: Threat model, secure lifecycle, OWASP mapping, physical security.
- Reviews only: Every privacy/security boundary and sensitive release.
- Lead / escalation: Lethabo, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: Work order issued 23 Sep 2026 (see the Work order section below); SSDLC due Sat 26 Sep 12:30 (internal 11:00). P2.3/P2.6 parked with UMOJA/KHAYA.
- Claimed files / contract versions: none; reserve before editing.
- Last updated: 24 September 2026 — PR #57 (ADR-0039) security review posted: APPROVE, the recorded security acceptance (conditions A–C in `docs/reviews/IPELENG-PR57-REVIEW.md`).

## Work order — VIGIL + ANCHOR build (issued 23 Sep 2026)

> Issued by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde. Decisions: ADR-0034 to ADR-0038. Spec: `docs/VUKA-2-SPEC.md` (section numbers below refer to it). **Owner acknowledgement pending** — accept it in your running log, or raise a blocker here. All times SAST. Criterion letters per `docs/MASTER-CONTEXT.md` §2 (I · T · U · S · B · Q). Before you start anything: pass the four review gates in `docs/MASTER-CONTEXT.md` §10.

**Outcome you own:** the design holds against a faked duress event, a coercer holding the phone and a hostile judge. And a stranger can verify a record in their browser.
**Serves:** S, I, T.
**Files you own or may touch:** `docs/STAGED-DURESS-DEFENCE.md` (you own it), `docs/THREAT-MODEL-VIGIL-ANCHOR.md` (new), `docs/SSDLC-GKHACK26.md` (new; the Saturday submission), `docs/PRIVACY-POLICY.md` (new), `shared/canonical.js`, `shared/der.js`, `shared/merkle.js`, `shared/verify.js`, the verify-page logic in `dashboard/`, and the abuse-test specifications.

**Do this, in order:**
1. **Wed 23–Thu 24** — review and take ownership of `docs/STAGED-DURESS-DEFENCE.md`. Do the three primary reads (the FTC 2010 emergency-PIN report; Cybercrimes Act ss8–9 from the Gazette or lawlibrary; POPIA s1 "biometrics") and replace each ⚑ with the primary quote.
2. **Thu 24 by 12:00** — agree PIN authority, incident closure and the removal rules with Lethabo (§8, §9); they fix the oracles for T12, T13, T16, T23 and T24. **Then by 14:00** (Sibusiso's vectors land at 09:00) — `shared/canonical.js` (§5: surrogate pairs, ASCII keys, no floats, safe integers), `shared/der.js` (DER → raw r‖s) and `shared/merkle.js` (§6), with vitest tests against Sibusiso's vectors (T01, T02). Vukosi's app and the verify page both import these.
3. **Thu 24** — `docs/THREAT-MODEL-VIGIL-ANCHOR.md` (STRIDE):
   - Assets.
   - Trust boundaries: phone, server, guardian phone, Hedera, `sim_bank`.
   - Threats per boundary, with mitigations mapped to spec IDs and tests.
4. **Thu 24 by 20:00** — write the **specification** (fixture, oracle, prerequisites) for each of T04–T24 and T30–T49, starting from the "Needs" column in §15. Sibusiso and Khutso write the server-side tests and Vukosi the device-side ones; you review each.
5. **Fri 25 by 10:00 — verify-min** for the Fri 12:00 slice: hashes, prev links and device signatures from an export, with no mirror yet. Then **Fri–Sat by 18:00 — full verify-page cryptography:**
   - Recompute event hashes (WebCrypto SHA-256 over canonical bytes).
   - Check prev links and the first broken index.
   - Verify signatures against the keys inside the chain: P-256 via WebCrypto after DER → raw; Ed25519, and ML-DSA if built, for server entries and roots.
   - Check the Merkle audit path.
   - **Decode the mirror message and require its bytes (type `0x01`) to equal the root recomputed from the export**; check topic, sequence, consensus timestamp and running hash; accept only the pinned network, topic and key-manifest fingerprint (T22).
   - Show one of three states: live-verified, archived ("archived — not independent") or unavailable.
   - T03, T04, T05, T21 and T22 must pass.
6. **Sat 11:00** (internal; programme deadline 12:30) — `docs/SSDLC-GKHACK26.md`, submitted on Sonke:
   - Requirements and the threat model.
   - Secure design decisions (ADR-0034–0038) and secure coding rules (RULES.md).
   - Tests T01–T24 and T30–T49 with status.
   - Deployment and incident response (the weekend fast path and rollback).
   - Privacy.
7. **Sat by 18:00** — `docs/PRIVACY-POLICY.md` (the source for the required data-privacy-policies slide):
   - Lawful basis.
   - What is collected and never collected.
   - Retention: 90 days, what remains after deletion and why.
   - Named operators: hosting and region, Google/Firebase, the SMS gateway, Hedera.
   - Rights: access = export; the deletion rules; objection.
   - The guardian s18 notice text.
   - Information Officer: registration still pending — say so.

**Acceptance checks:**
- [ ] Each ⚑ in the defence doc replaced by a primary quote, or kept with the reason
- [ ] T01–T05 pass
- [ ] Every STRIDE threat maps to a spec ID and a test
- [ ] SSDLC submitted on Sonke before 12:30 Sat (receipt noted)
- [ ] Privacy policy reviewed by Lethabo
- [ ] Every abuse test specified and reviewed

**Deadlines:** PIN-authority rules Thu 12:00; `shared/` Thu 14:00; STRIDE and test specifications Thu 20:00; verify-min Fri 10:00; SSDLC Sat 11:00; verify page and privacy policy Sat 18:00.
**Depends on → hands off to:** the vectors and export shape (Sibusiso) → `shared/` to Vukosi and Mutarisi; the SSDLC and privacy policy to Babatunde's deck.
**Do not:** say "court-admissible", "unhackable" or "unbiased"; mark a legal point settled without a primary source; soften "the anchor proves when, not what".
**Reviewer:** Lethabo.

## Security programme — SSDLC, threat model, pentest, compliance (issued 23 Sep 2026)

> Issued by Lethabo (co-lead). It adds to the work order above; it does not replace it. **Owner acknowledgement pending** — accept it in your running log or raise a blocker. All times SAST. Serves **S** and **T**.
> **Your four files** (new, `PROPOSED` until you accept them): `docs/security/SSDLC.md`, `docs/security/THREAT-MODEL.md`, `docs/security/PENTEST-PLAN.md`, `docs/security/COMPLIANCE-GOVERNANCE.md`. They replace the paths `docs/SSDLC-GKHACK26.md` and `docs/THREAT-MODEL-VIGIL-ANCHOR.md` named above. You own them from acceptance; change anything you disagree with and say why in the running log.
> **Quality bar for everything below:** every control has a test or a file as evidence; every status is true today; "not run" and "not measured" are complete answers; no "unhackable", "court-admissible", "pentested" or "secure".

### Day by day

**Thu 24 Sep**

| Time | Target | Quality bar |
|---|---|---|
| 08:00–08:45 | Read the four security files and spec §3–§10. Accept or amend in your running log | One line per file: accepted / amended (what) |
| 09:00–11:00 | `shared/canonical.js`, `shared/der.js`, `shared/merkle.js` against Sibusiso's 09:00 vectors (P3.S2) | T01 and T02 green in vitest, including every rejection vector |
| 11:00–11:30 | §8/§9 meeting with Lethabo (P3.L8); the agreement is due at 12:00. Agenda: B1–B3 text; **export during an open incident (T30)**; **wrong-PIN and attempt-limit rule (T47)**; S4 export freeze | Each item decided, owner named, recorded in a build-log entry |
| 11:30–14:00 | Finish `shared/`; hand the import paths to Vukosi and Mutarisi | Vitest green in CI or locally with the command recorded |
| 14:00–16:00 | Own the threat model: check every STRIDE row against the spec as it now stands | Every row has a spec ID and a test ID; no orphan threats |
| 16:00–20:00 | Test specifications (fixture, oracle, prerequisites) for T04–T24 and T30–T49 (P3.S3) | Each has an oracle a machine can check, or is marked "recorded observation" with why |
| 20:00–22:00 | Send each spec to its writer (table below); review Vukosi's manifest before the APK build | Writers acknowledge |
| 22:00–23:00 | Pentest slot S1: PT-50, PT-51 on the release APK | Results recorded pass / fail / not run |

**Fri 25 Sep**

| Time | Target | Quality bar |
|---|---|---|
| 07:00–10:00 | **Verify-min** (P3.S7): hashes, prev links, device signatures from an export | T03, T04 green; first broken index reported |
| 10:00–12:00 | Slot S2: PT-10–PT-15, PT-44 | Recorded |
| 12:00 | Thin slice (RG1) with Vukosi and Sibusiso | RG1 pass/fail recorded by Lethabo |
| 12:30–14:00 | Slot S3: API auth, replay, BOLA, public proof (PT-01–PT-07, PT-09, PT-32, PT-34, PT-38, PT-39) | Recorded; fails raised as PRs to Sibusiso |
| 14:00–16:00 | Arrive at the venue with ID and an item to donate (or virtual check-in from 15:30); hackathon starts 16:00 | — |
| 16:00–21:00 | Full verify page: Ed25519 roots, Merkle path, mirror decode, pinned topic and manifest, three states (T05, T21, T22) | T05 and T21 green; T22 once two real batches exist |
| 21:00–23:59 | Slot S4: PIN authority and guardian governance (PT-08, PT-16–PT-22, PT-33, PT-35–PT-37, PT-40, PT-46, PT-47) — what the full server supports by then | Recorded; "not run — <missing prerequisite>" for the rest |

**Sat 26 Sep**

| Time | Target | Quality bar |
|---|---|---|
| 06:00–07:00 | Finish slot S4 | Recorded |
| 07:00–10:00 | Slot S5 with Vukosi and Mutarisi: parity, Android storage and IPC, dependencies (PT-23–PT-28, PT-30, PT-31, PT-48, PT-49, PT-52–PT-56); ask Sibusiso for the SAST/SCA run | `docs/security/PENTEST-RESULTS.md` started |
| 10:00–10:30 | Fill every test status in SSDLC §14; re-count controls by status | Every T and PT row says pass / fail / not run |
| 10:30–11:00 | Lethabo reviews the SSDLC. **Internal deadline 11:00** | Review recorded in the PR |
| 11:00–12:00 | DevLabs (every team represented; go only if you are our representative) | — |
| 12:00–12:30 | **Submit the SSDLC on Sonke** (window closes 12:30). Screenshot the receipt; note it in your running log | Receipt time recorded |
| 12:30–14:00 | Slot S6: anchoring and verify page (PT-29, PT-41–PT-43, PT-45, PT-57–PT-64), ZAP baseline | Recorded |
| 14:00–17:00 | War Room: answer security and privacy questions with the panel | Only claims the repo supports |
| 17:00–18:00 | Privacy policy (`docs/PRIVACY-POLICY.md`, P3.S6) with the PR #43 S3 text; verify page final | Lethabo reviews by 18:00 |
| 18:00–20:00 | Slot S7: re-test every fail; close `PENTEST-RESULTS.md` | No case left without a status |
| 20:00–21:00 | Give Babatunde the honesty-slide lines (G8, G26, G27, G32, B2, B3) and the privacy-slide source | He confirms receipt |

**Sun 27 Sep**

| Time | Target | Quality bar |
|---|---|---|
| 07:00–08:30 | RG3 security checklist with Lethabo (`SSDLC.md` §11) on the commit to be submitted | Every RG3 line true, or the claim is removed |
| 08:30 | Final gate | — |
| 09:00 | Final submission (Babatunde, Lethabo) | Nothing merges after this |
| 10:00–15:30 | On hand for security questions in the pitch and demo | — |

### Tests you write versus review

| You write | You review (writer) |
|---|---|
| T01, T02 (vitest side); T03, T04, T05, T21, T22 (verify page); T32, T33 (verify-page network and XSS); T37 with Sibusiso; the recorded observations for B2 and B3 | Server: T06–T14, T19, T23, T24, T30, T31, T35, T36, T38, T39, T43, T44, T45, T48, T49 (Sibusiso). Delivery and `sim_bank`: T11, T34, T40, T46 server half (Khutso). Device: T15, T16, T17, T18, T20, T41, T42, T46 device half, T47 (Vukosi); T15 pixels and V8 chips (Mutarisi) |

### Who you ping, for what, when

| Person | For | By |
|---|---|---|
| **Sibusiso** | Vectors (Thu 09:00); contract v2 with B1 signed statement and S1 trigger field (Thu 12:00); add `node --test` and SAST/SCA jobs to CI; staging URL for S3 and ZAP (Fri 12:00); HCS topic id, `submitKey` test T43 and key manifest (Thu 16:00) | Thu 09:00 |
| **Lethabo** | §8/§9 meeting (Thu 12:00); B1–B3 spec text; T30 and T47 decisions; SSDLC review (Sat 10:30); privacy policy review (Sat 17:00–18:00) | Thu 12:00 |
| **Vukosi** | T03 Keystore signature and key fixture (Thu); release APK for PT-50/51 (Thu 22:00); T15 timing harness; debug build for PT-53 (Sat 07:00) | Thu 14:00 |
| **Mutarisi** | Pixel-identical outcome screens (PT-23); no guardian ack during an incident (PT-28); verify-page layout using `textContent` only | Fri 12:00 |
| **Khutso** | `sim_bank` signature and `Idempotency-Key` (T40); guardian token signing (T34); evidence rows and `docs/REQUIREMENTS-TRACE.md` linking tests; the build-log incident template | Fri 12:00 |
| **Babatunde** | SSDLC summary for the deck; honesty-slide lines; privacy-slide source | Sat 20:00 |

### Done means

- The four security files accepted by you and reviewed by Lethabo, in a merged PR.
- Every T01–T24 and T30–T49 has a written specification; every one you write runs.
- `docs/security/PENTEST-RESULTS.md` has a pass / fail / not run for all 64 PT cases, with command, commit and tester.
- SSDLC submitted on Sonke before 12:30 Sat, receipt noted in your running log.
- B1–B3 closed in the spec, S1–S4 each closed or carried with an owner.
- A build-log entry and ticked `docs/CHECKLIST.md` rows.

### Sonke SSDLC submission checklist (Sat, before 12:30)

- [ ] Control counts re-computed from `SSDLC.md` (Done / In build / Planned / Not doing)
- [ ] Every test status filled: pass / fail / not run
- [ ] Threat model attached or linked; coercion threats included
- [ ] Tool runs listed with date, or "not run"
- [ ] Release gates RG1 and RG2 results
- [ ] Incident response and POPIA runbook
- 2026-09-24 — Ipeleng (via Cline assistant): self-reviewed her draft `docs/PIN-AUTHORITY-RULES.md` + ADR-0040 before the 11:00 §8/§9 checkpoint (P3.L8). Wrote `docs/reviews/IPELENG-P3L8-PIN-AUTHORITY-REVIEW.md` — verdict: ready for the checkpoint, amend before acceptance; no blocking findings. 3 should-fix text edits (A: §2 shows `expires_at` inside the device-signed statement — spec §9 as corrected in PR #48 says the server records it; B: §3's removal/add rows omit the B1 remaining-guardian notification naming the other party; C: §3's recovery duress cell contradicts the amended §9 row — new-device recovery is recovery-code-gated, not a duress-PIN no-op). 5 notes (6 h auto-close wording; T24/T37 extension in §7; PR #50 provenance row; mode-blind constraint for T47; ADR-0036(5a) shorthand). Proposed positions on all 8 §8 rows; nothing decided — Lethabo's agreement at the checkpoint is the decision. B1 closes with the acceptance PR (T37 oracle in today's 16:00–20:00 block); S3 still open. Next: acceptance PR applies A–C + the decisions; T30/T47 oracles from them.
- [ ] Privacy section (lawful basis, retention, operators, IO not registered — said plainly)
- [ ] Honest limits: no independent pentest (G8), attestation unverified (G32), detection uncalibrated (G27), no branch protection (G17)
- [ ] No secret, real location, phone number or private organiser screenshot in the upload
- [ ] Receipt screenshot saved; time in your running log

### Tracked conditions from your PR #43 review

| ID | Condition | Owner | Due | Test / evidence | State |
|---|---|---|---|---|---|
| B1 | Remaining guardians notified of additions and scheduled removals, naming the other party; ADR-0036(5) qualified; §17 line; T24 extended | Lethabo (spec), you (test) | Thu, §8/§9 meeting | T24, T37 | Spec text merged in #48 (`98987a5`); open until confirmed at P3.L8 and T24 runs |
| B2 | §17: a compromised server can suppress or fabricate escalation; independent witnesses named | Lethabo | Thu | §17 text; recorded observation | Spec text merged in #48; open until the recorded observation exists |
| B3 | §17: unlocked phone forces `no_answer` escalation and bank signal; `signal_detected` carries location | Lethabo | Thu | §17 text; recorded observation | Spec text merged in #48; open until the recorded observation exists |
| S1 | `bank_signal_sent` records its trigger | Sibusiso | contract v2 | T38 | Spec text merged in #48; open until contract v2 (#51) carries it |
| S2 | Onboarding recommends ≥ 2 guardians; §17 lone-guardian line | Vukosi, Mutarisi | before Sat 18:00 | copy review | Spec text merged in #48; open until the app copy exists |
| S3 | Privacy-policy text: residuals, cooling-off, hash permanence, guardian departure, bank as recipient | you | Sat 18:00 | `docs/PRIVACY-POLICY.md` | Open |
| S4 | 24 h post-recovery freeze covers bulk export | Lethabo | with §9 | T39 | Spec text merged in #48; open until confirmed at P3.L8 |

## Sequenced work

Replaced on 23 Sep 2026 by the work order above. The four-layer sequenced work, declarations and self-reviews are kept in [this file's history](../archive/2026-09-four-layer/team/ipeleng-history.md).

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
- 2026-09-15 — Ipeleng (via Cline assistant): completed security review of PR #10 (Sibusiso, WBS 3.3 human-gate). Wrote `docs/reviews/IPELENG-PR10-REVIEW.md` — APPROVE with findings; 2 blocking (D: OPERATOR-DUTY contradicts governance state machine; H: wrong comparison operator in `retain_consented_match`). Finding F (POPIA s57 gap) removed from blocking list — it is Ipeleng's own P2.1/P2.2 task. Next: Sibusiso resolves D and H; Ipeleng starts P2.1 PSiRA position paper.
- 2026-09-15 — Ipeleng (via Cline assistant): wrote `docs/PSIRA-POSITION.md` (`P2.1`, PR #28). Position: the obligation attaches to *rendering*, not revenue or scale — the Phase-1 pilot already triggers it; registration required in the electronic-monitoring category plus install/servicing; flag-gate reviewers assumed to need individual registration until counsel says otherwise; partner-of-record structure with three variants (fallback: VUKA self-registers for the pilot); six minimum contract clauses; counsel questions Q1–Q8. Primary sources unreachable this session (SAFLII 403, psira.co.za down, gov.za 404) — no verbatim statutory quotes; all wording flagged ⚑ (paper §9). Not legal advice; live monitoring blocked at G-gate until counsel reports. Next: `P2.2` POPIA paper + ADR.
- 2026-09-16 — Ipeleng (via Cline assistant): wrote `docs/POPIA-POSITION.md` (`P2.2`, PR #28) and ADR-0031 in `docs/adr.md`. Position: s11(1)(f) gives ordinary PI a legitimate-interest ground and s27(1) gives special PI none — verified against the Act's full text this session (Accessible Law's popia.co.za copy; SAFLII still 403, gov.za Act PDF encrypted/unparseable); a non-consenting passer-by fits no s27(1) ground (a)–(e); s33(1)'s "obtained in accordance with the law" limb either rescues the transient computation or is circular — refused to build on the optimistic reading, routed to counsel (Q2). Discard-by-default adopted as an architecture constraint (ADR-0031); consent enrolment is the sole retained lawful basis. All quotes ⚑ (paper §10). Not legal advice; the pilot face gate stays blocked at G-gate until counsel answers Q1–Q2. Next: `P2.5` Information Officer registration.
- 2026-09-16 — Ipeleng (via Cline assistant): prepared `docs/POPIA-IO-REGISTRATION.md` (`P2.5`, PR #30). Path verified this session: the eServices Portal (`eservices.inforegulator.org.za`) is the primary route and its IO-registration service is live (announced 01/05/2024); the Regulator's legacy page still offers the manual fallback — completed "Application form for Registration of Information Officers" emailed to `Registration.IO@inforegulator.org.za` under the 01 Apr 2021 Guidance Note. s55 duties quoted from the Accessible Law copy (⚑; its s55(1)(c) "Chapter 6" numbering flagged against Chapter 10 for the Gazette check); the s1 "head" definition stated in substance only (source page truncated, ⚑). Registration is free and quick, but submission needs the leads' designation of the head (D-IO-1) and VUKA's organisation legal identity — no CIPC number exists anywhere in this repo — so the honest status is **prepared, not submitted** and the checklist row is ◐. Next: `P2.6` draft Gated Access Areas Code.
- 2026-09-16 — Ipeleng (via Cline assistant): wrote the WBS 1.1 credential-remediation verification record, `docs/audit/09-credential-remediation-verification.md`. Position: the 13 Sep remediation is real and forensically corroborated (G6 closed — purge re-verified on fresh clones, gitleaks zero leaks, GitHub API shows redacted placeholders; this repo's CI secret-scan green), but the leaf's acceptance criterion — redacted issuer receipts reviewed — is hers, and the holder confirmations exist only in chat, inaccessible to the agent. So the record lays out the redacted evidence chain and deliberately does not tick the leaf; §4 lists what each confirmation must state (credential, old-credential invalidation, date) and reopens G6 for any credential whose confirmation cannot be produced. Redaction rule held throughout: no value, account identifier or new location detail. Next: Ipeleng reviews the chat confirmations (closes 1.1, unblocks 1.4); `P2.6` Gated Access Areas Code.
- 2026-09-16 — Ipeleng (via Cline assistant): wrote `docs/GATED-ACCESS-CODE-REVIEW.md` (`P2.6`, PR #30) and ADR-0032 in `docs/adr.md`. Position: the team's record (`docs/PLAN.md` §C3, G21) says a draft Code of Conduct for Gated Access Areas was published 30 Apr 2026 — but this session could not corroborate it anywhere reachable (Regulator site search zero hits ×2; codes-of-conduct page lists no 2026 entries, nearest artefact the RCC proposed code received 08 Sep 2023; web search nothing; Gazette unreachable), so every characterisation of the draft stays ⚑ and counsel Q1 seeks the Gazette notice via the s61(2) route. The verified spine (s60 scope levers reaching owners and their technology service providers; s61's ≤13-week process; s73(1)(c) making breach of an issued code "interference"; s14 minimalism) anchors a gap analysis: the T0 never-persisted ring buffer beats any retention bound, non-incident embeddings (30d) and location (7d) sit at/inside it, case-linked embeddings (case+90) and 12-month sightings exceed it if the scope reaches decision records (Q2 — kept as named parameters). ADR-0032 proposes the recorded direction of travel as the internal design floor (status *Proposed* — binds on both-lead acceptance; ≤30-day auto-overwrite for gate-domain data; discard-by-default stands; FRT justification dossier before any pilot face gate; final text supersedes via fresh ADR) — safe under either outcome since each element has a separate anchor (s14's minimality, ADR-0031's discard direction, accepted ADR-0002, the honesty ledger), while the 30-day bound, gate-domain scope and exceptions are team-chosen defaults pending both-lead acceptance of ADR-0032. No compliance claim; not legal advice. Next: holder confirmations (closes 1.1); `P2.7` RICA position.
- 2026-09-16 — Ipeleng (via Cline assistant): wrote `docs/RICA-POSITION.md` (`P2.7`, PR #30). Position: RICA's full text could not be read this session (official justice.gov.za PDF reachable but arrives as an encrypted binary — the POPIA paper's gov.za precedent; SAFLII/lawlibrary/polity 403; gov.za hosts only the Bill), so no verbatim quotes — every statutory characterisation ⚑ and five counsel questions logged (Q1 transient acquisition, Q2 interception-equipment certificate, Q3 no TSP/CRI duties, Q4 AmaBhungane orientation, Q5 text retrieval for the counsel pack). What carries the deliverable is verified architecture: raw audio never persists (3-second ring buffer, no code path to disk — ASR-6), YAMNet emits labels not audio, and the T2 evidence chain carries labels/decisions/hashes only — so the two bright lines (**audio never persists**; **never attach an audio clip as evidence**) are specified architecture constraints (recorded design, not yet implemented code), not claims. ShotSpotter precedent (Cape Town 2016, Lavender Hill 2022) left as recorded research ⚑, not re-verified. No ADR — the design does not change. Next: holder confirmations (closes 1.1); `4.3` abuse cases as executable tests.
- 2026-09-16 — Ipeleng (via Cline assistant): retracted the false findings in the 15 Sep review per Lethabo's PR #27 request-changes (grep evidence against `origin/main`; Sibusiso concurred on D and H). Verdict corrected to APPROVE with notes; real gap filed as R (`retain_consented_match` not wired into ingest — Sibusiso's P2.3). Next: P2.5 IO registration (blocked on leads' designation + org identity), counsel items P2.6/P2.7/P2.4.
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Ipeleng is asserted; owner acknowledgement pending.
- 2026-09-24 — Lethabo (co-lead), via Claude Code assistant: **Lethabo is covering the security lane while Ipeleng is away, and hands it back when she returns.** Security reviews go to Lethabo in the meantime: request her on any PR that touches security, privacy, PIN authority or the contract. Nothing Ipeleng wrote is changed or asserted as hers. First action: the P3.L8 checkpoint decisions (ADR-0041, `docs/PIN-AUTHORITY-RULES.md` §8). Next: verify-min (P3.S7), the test specifications, the threat model and the SSDLC pack.
- 2026-09-24 — Lethabo (covering the security lane): security reviews posted to unblock Sibusiso. §4a accepted with three amendments (ADR-0042). #62 CI gates approved. The #47 intake question answered with a full-history gitleaks scan (no leaks). #51 reviewed: SEC-1 to SEC-6.
- 2026-09-24 — Ipeleng (via Cline assistant): posted the PR #57 security review of ADR-0039 (`docs/adr.md`; spec §18 + the V3 pointer; OPEN-GAPS G36–G38; the build-log entry) — verdict **APPROVE**, recorded as her security acceptance per the ADR's status line (Lethabo had held it Proposed because the security acceptance must not be the author's own; Sibusiso approved at `7374bcc`). Reviewed at head `893766a` (after main was merged in; §18's T30–T33 renumbered to T53–T56). Verified, not assumed: every new field stays in the salted committed payload with integer `pv`, public action classes and on-chain messages untouched; registration carries no IMEI/serial/Android ID/phone number; `location` is optional, integer-only, present only with a fix; `evidence_assessment` is `calibrated:false` with the fixed statement and a forbidden-field list, cites entry IDs + `ruleset_digest` + server `basis_time`, written once per transition in the same head transaction and replayable (T54); third parties get tier/E-level/reasons and never `total_points` (the 24 Sep 00:50 decision; member's own view behind a fresh normal PIN after closure; demo panel `sim_` only); `guardian_alert_opened` needs an explicit tap, never raises the E-level and is not a tally input per `docs/COERCION-SCENARIOS.md` (earlier-session F4 — confirmed, no change needed); motion stays corroboration-only, `offset_ms` ∈ [−10 s, 0], stationary/walking only, never opens a check-in; YAMNet indices re-verified against TensorFlow's `yamnet_class_map.csv` (gun-like 421–423 kept; 420 Explosion and 424–427 Artillery fire/Cap gun/Fireworks/Firecracker excluded — deliberate); G36–G38 gate all grants as designed-not-built with named owners; the T53–T56 renumbering is consistent across §18, the ADR consequences and the build log with no residual collision (main keeps T30–T33, ADR-0041 keeps T50–T52). Conditions of the acceptance: **A** — record it (new acceptance-record row citing both reviews; flip ADR-0039's status line and the V3 pointer to Accepted), **B** (should-fix) — ADR-0039 sits after ADR-0040 in `adr.md`'s file order; move it between 0038 and 0040 or note that file order is merge order, **C** (should-fix) — ADR-0040's status line cites branch `docs/adr-0039-event-detail`, which dies at merge; cite PR #57 + merge hash instead. Full record prepared as `docs/reviews/IPELENG-PR57-REVIEW.md` (untracked; rides her next PR per the #43→#45 pattern). Not legal advice; M8 still owes measured numbers with n; the golden vector stays Sibusiso's. Next: PR #57 follow-through with Lethabo; STRIDE model + test specifications due Thu 20:00; SSDLC Sat 12:30 (internal 11:00).
