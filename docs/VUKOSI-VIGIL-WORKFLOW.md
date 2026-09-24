# Vukosi's VIGIL execution workflow

**PROPOSED personal workflow, 23 September 2026, at Vukosi's request.** Tool split is **FACT (owner-supplied)**: Claude Code reasons and independently reviews; Codex/GPT implements. This does not accept work-order deadlines or replace contracts/human approval. Criteria T/U/S; benefit: less integration rework and demonstrable limits instead of unsupported safety claims.

Read [the PR review](reviews/VUKOSI-PR43-READINESS.md), [your work order](../team/vukosi.md), [the spec](VUKA-2-SPEC.md), [checklist P3](CHECKLIST.md), [ADR acceptance](ADR-ACCEPTANCE-RECORD.md) and [routing rules](AGENT-ROUTING.md).

## What changed

**FACT (PR #43 snapshot 0c6d202):** VUKA is VIGIL + ANCHOR; KHAYA/UMOJA are parked. You own Android sensing, native signing/randomness, encrypted queue, release build/CI and measurements. Lethabo is first reviewer. Mutarisi owns screens; Ipeleng owns shared cryptography/security; Sibusiso owns the contract/server; Khutso receives measurement evidence and owns delivery work. The synthetic appliance producer is useful experience, not a ready Android implementation.

**FACT:** PR #42 is closed unmerged. Do not finish old WBS 4.2/4.4/6.2 to catch up with superseded dates or add the old SightingEvent payload to VIGIL. Contract v2 is a prerequisite, not something your agent can silently design.

**FACT (repository schedule, not accepted capacity):** final submission is **Sunday 27 September 2026 at 09:00 SAST**, final gate 08:30. The earlier 15:00 target is superseded. The old Sep24 feature-freeze plan is historical; the pivot's milestones govern this proposal. All times below are SAST. No new effort estimate or human commitment is inferred.

## Model routing

| Stage | PROPOSED model choice | Boundary |
|---|---|---|
| Reason, split task, design tests | Claude Code **Opus**, strongest version available in your account; high effort where supported | Produce one bounded packet; humans decide unresolved authority/contracts. |
| Mechanical edits | **GPT-6 Luna**, medium | Already-specified fixture plumbing/docs/narrow edits with an oracle, not ambiguous security design. |
| Normal Android implementation | **GPT-6 Sol**, medium | Default executor for a frozen packet, tests and actual outputs. |
| Difficult native integration | **GPT-6 Sol**, high; **GPT-6 Astra**, high for a reproducible blocker that needs escalation | Lifecycle/Keystore/queue work against accepted interfaces. More reasoning is not permission to decide a contract. |
| Independent review | Claude Code **Opus**, high where supported | Exact SHA, separate checkout, failure paths and evidence; not fabricated human approval. |
| Merge/release | Required human reviewers | Models cannot supply lead signatures or bypass gates. |

These are recommendations, not a record of selected models. If unavailable, use the closest available tier and record its actual name; no automatic purchases or tool installations. Official [OpenAI model selection](https://developers.openai.com/api/docs/guides/model-selection) supports lighter settings for bounded tasks; [coding guidance](https://developers.openai.com/api/docs/guides/code-generation) names GPT-6 Sol for Codex coding. Claude Code supports `/model opus`, `/model` for choices and `/status` for the active model ([official configuration](https://code.claude.com/docs/en/model-config)). Account access was not verified here.

No LLM/agent framework enters VUKA itself (ADR-0038). No background orchestration is installed. Use sequential handoffs; never let both tools edit the same checkout simultaneously.

## Readiness before a feature packet

**PROPOSED — now, before Thursday implementation:**

1. Refresh #43's head/reviews/merge state. ADR acceptance is recorded, but Ipeleng's review/P3.L8 remain pending at this snapshot. Do not merge based only on the APPROVED badge.
2. Record actual availability and phones. Leads confirm a user and guardian phone plus a budget-phone configuration for M4/M5 by **Thu24 10:00** (work-order target). Record actual device, OS/API, RAM and consent, not invented ownership.
3. Verify Node **and npm**, JDK, Android SDK/platform tools, accepted Gradle/SDK versions and a real device. **Corrected 23 Sep (Claude review C4):** only JDK 17 and Python 3.12 resolve. Node, npm, adb and the Android SDK were not found in common locations, apart from a Playwright-bundled Node that is fine for doc checks and is not a project toolchain. Locate installations first; setup is a subsequent task. Pin versions compatible with the mandated **RN 0.74.5**; do not silently upgrade it.
4. Obtain authorised access to individual predecessor files. No old remote/history or tree copy. Record source revision/path, destination and changes per port. Missing files become blockers/specification work, not reconstructed historical evidence.
5. Confirm release-signing custodian and approved publication route. Human supplies secrets through protected local/CI configuration; agents do not read/print values. An unsigned CI artifact is not D1. T20 needs an approved public asset; do not change repository visibility.
6. Coordinate app bootstrap/package/lockfile with Mutarisi, CI with Sibusiso, shared JS with Ipeleng. Claim paths first. One scaffold and canonicaliser, not competing copies.
7. Resolve review R1/R2 and P3.L8 before dependent transport/PIN/UI code. Reboot R3 needs a decision too; no forbidden permission as a workaround. Record decisions in files/PRs.

Missing dependencies block dependent work only. Independent scaffold/model validation/instrument work may proceed within authorised gates; a labelled stub cannot count as delivery or verification.

## Execution packets and deadlines

**FACT:** IDs/deadlines come from the issued work order/spec/checklist. **PROPOSED:** packet sequence below; conditional on kit, capacity and review. Every packet needs independent review and repository gates.

| Packet / task | Finish target | Implementation and evidence | Dependency / handoff |
|---|---|---|---|
| P0 readiness | Before Thu build | Inventory, blockers, claims, first testable packet | Vukosi capacity/kit; Lethabo scope |
| P1 / P3.V1 scaffold and clean port | Thu24 morning; V1 due Thu | RN 0.74.5, exact successful init command, file-by-file SensingService/AudioModule/PinModule. Remove cleartext, CAMERA, boot receiver; investigate wakelock cap without claiming FGS proves continuity. Early build/install smoke test. MotionModule stretch. | Mutarisi gets scaffold; check signing early |
| P2 / P3.V2 model and inference | Thu24 | Fetch/digest gate, class-map-by-label tests, interpreter shape/dtype assertion, PCM handling, integer basis points. Evaluation harness before claims. Reject wrong digest/map/shape. | Approved model source/digest; no weights/audio committed |
| P3a / P3.V3 signer | Thu24; T03 fixture with D1 | P-256 Keystore, honest hardware status, StrongBox where supported with reviewed failure behaviour; SecureRandom, shared canonical bytes to native DER signing. T18 source inspection plus 1,000 synthetic salt checks. | Ipeleng receives real-device signature/public key/exact synthetic signed bytes; no private key/unnecessary device identifiers |
| P3b / P3.V3 queue/heartbeat | Thu24 | Ordered encrypted queue; retain until server receipt; counters/retry persistence; restart, failed ack, corruption, duplicate tests. Heartbeat every30s, speed bucket only, not a chain entry. Delivery labels backed by receipts/guardian acknowledgement. | v2 mock Thu12:00; shared JS conservatively Thu14:00; R1 resolved; no old envelope reuse |
| P4 / P3.V4 arming/check-in/release | **Thu24 22:00 D1** | Foreground user arming, grant-aware service types, neutral notification, version-aware permission tests; full-screen/headsup fallback. `opened` only after agreed shown condition, not notification enqueue. Signed APK/digest, QR download without repo access, cold install/T17/T20, release/R8 inference smoke test, merged-manifest forbidden-permission scan. | Mutarisi UI/backup; Ipeleng PIN/display oracle; Lethabo review |
| P5 / P3.V5 Android CI | Fri25; start once scaffold builds | Pinned release-assembly/test/model-fetch job, existing gates preserved; approved signing strategy, no secrets in logs; unsigned vs signed distinction | Sibusiso coordinates shared workflow |
| P6 / P3.L4 integration | **Fri25 12:00 D2** | Actual APK → server-min → chain → export → verify-min; phone/browser T03, applicable T21 negatives, retry evidence; anchoring labelled stubbed. Capture SHAs/APK digest/config. | server-min Fri09:00; verify/guardian-min Fri10:00; Sibusiso/Ipeleng/Mutarisi/Khutso |
| P7 / P3.V6 measurements | **Sat26 18:00** | M1–M5/M7; failures and unmeasured rows explicit. Supply device evidence for joint T07/T15/T16 when prerequisites exist; not a claim the server suite passed. | Khutso evidence, Babatunde claims, Lethabo review |
| P8 rehearsal/handoff | Before **Sun27 08:30**, submit09:00 | Known-good APK/digest/install instructions, measurement index, limitations/fallback, sensing contribution to under90s video | Lethabo/Babatunde own submission |

Bring a signing/build smoke test into P1; don't discover SDK/signing failures at 21:59. That is sequencing advice, not a new committed deadline.

## Measurement acceptance

All are **NOT MEASURED** here. Durations/counts are **PROPOSED study requirements from the spec**, not completed sample sizes.

| ID | Required evidence |
|---|---|
| M1 recall | FSD50K Screaming / ESC-50 glass_breaking; licence/provenance per clip, IDs only committed; frozen detector/threshold/config, per-class numerator/denominator and failures. Benchmark performance is not field accuracy. Disclose any tuning/evaluation overlap. |
| M2 false alarms | 30min consented ambient conditions; armed duration, defined alarm/count, per-hour estimate and limited-sample caveat. Clarify approved temporary audio handling with Ipeleng: product raw-audio storage prohibited, no audio in git. |
| M3 latency | At least30 attempts; phone detection → guardian **display**; paired IDs, clock-sync offsets/uncertainty, network/config, sanitised timing rows and losses (not silently dropped). Provider-acceptance interval separate. |
| M4 battery | Cheapest actual phone; batterystats, armed duration/charge, screen/network/thermal/workload configuration; measured percentage-points/hour, not extrapolated full-battery runtime dressed as measurement. |
| M5 continuity | Budget-brand phone, screen off30min; expected/observed heartbeats, timestamped gaps, OS/battery settings; distinguish process death/network loss when evidence permits. |
| M7 false no_answer | Passenger-held30min drive; no driver interaction. Agree ground truth/denominator with Ipeleng/Khutso first: no-interaction alone does not define a false-positive oracle. |

**M6 belongs to Khutso**, with your instrumentation support. Spec row ownership controls over the loosely grouped evidence register. Per run record SHA/APK digest, device/OS, permissions, model digest/threshold, clocks, configuration, actual n/duration, command, sanitised raw outputs, exclusions and reviewer. A signature proves key use, not genuine audio. T18 uniqueness is not proof of a CSPRNG. Khutso's evidence record precedes any slide claim.

## File-based handoff cycle

1. **Claude prepares one packet:** inputs/spec/contract SHAs, criterion, scope/non-goals, files, prerequisites, executable oracle/negative tests, commands and handoffs. Missing oracle → build it first.
2. **Vukosi checks real decisions:** capacity/device facts; route authority/contracts/privacy to human owners. A packet is not a code approval.
3. **Codex implements only that packet:** task branch from accepted main (or explicitly agreed stacked base), claims, pinned dependencies, tests, actual outputs, team/build-log update. No broad old-tree port.
4. **Pin review candidate:** staged diff/secret checks, local commit, base/head SHA/artifact digest. Publish PR when authorised, with template/reviewers/rollback. No direct main push or automatic release.
5. **Claude independently reviews exact head in another checkout:** source + tests + failure paths, not executor summary. Findings state severity/file/line/trigger/impact/required evidence. No self-approval or merge.
6. **Codex fixes; Claude rechecks new SHA:** preserve dispositions; old reviews do not cover changed code. Genuine ambiguity goes to humans, not repeated AI votes.
7. **Human gate:** before weekend both leads, Lethabo first. Approved weekend fast path is one lead plus nonauthor domain reviewer; contract/ADR/security/governance still both leads plus required specialist review. Verify current-head CI/reviews, not request list.
8. **Close with evidence:** role file, own P3 row under coordination, new build-log entry, capability business handoff, Khutso evidence integration. Missing device checks stay NOT RUN/blocked. Release/merge retains human authority.

**PROPOSED packet layout:** docs/workflows/vukosi/<packet-id>/TASK.md, IMPLEMENTATION.md, REVIEW.md. Create only the current packet with claims/log/PR; no empty future scaffolding. TASK pins scope/oracle/inputs; IMPLEMENTATION pins actual head/results; REVIEW pins reviewed head/findings/dispositions. Files and PR are shared memory, not private tool memory. No concurrent writing in this workflow checkout.

## Fallbacks and boundaries

- **FACT D1 fallback:** Thu22:00 failure → Mutarisi pairs/takes release lead Friday morning. Label USB debug build; no QR success claim until actual release cold-install. No safety-test waiver.
- **FACT server fallback:** T08 failing Fri18:00 → Sibusiso prioritises durable escalation, anchoring stays stubbed; reflect in demo.
- **FACT cut order:** stretch detectors, daily OTS, ML-DSA, decoy guardian (keep PIN-gated no-op), SMS, recovery (then no recovery code). Coordinated lead choices, not unilateral shortcuts.
- Never cut signed chains/export/verify, durable escalation, identical duress UI, guardian safety copy, PIN-authorised changes/removal delay/never-zero, honest labels. If unverifiable, use the reviewed labelled fallback.
- Missing kit/approval blocks dependent work; never fabricate evidence, expose secrets or change repository visibility.

## Revised task and deadline list (23 Sep, after the Claude review)

Issued targets, all SAST. **None is accepted capacity.** 🔒 marks items blocked on a named fact or decision.

| When | Item | State / blocker |
|---|---|---|
| Thu 24 09:00 | Canonical + Merkle vectors (Sibusiso) | Dependency |
| Thu 24 10:00 | Leads confirm phones (user, guardian, budget) | 🔒 Vukosi/leads: actual devices, OS/API, RAM |
| Thu 24 12:00 | Contract v2 + mock (Sibusiso); P3.L8 PIN rules (Lethabo + Ipeleng) | Dependency. R1 must be decided inside v2 |
| Thu 24 12:00 or 14:00 | `shared/` (Ipeleng) | Conflicting dates (review R4); the workflow assumes 14:00 |
| Thu 24 (morning) | **P2a / P3.V2 provenance gate**: the first ready packet, [TASK](workflows/vukosi/p2a-yamnet-provenance/TASK.md) | Ready. Its live checks need the model source of record (C2) |
| Thu 24 (morning) | P1 / P3.V1 RN 0.74.5 scaffold + clean port | 🔒 toolchain (C4), predecessor-file access, sequencing with Mutarisi (R4) |
| Thu 24 | P3.V3 signer/queue | Signer: after the scaffold. Queue transport: 🔒 R1 + v2 |
| **Thu 24 22:00** | **D1 / P3.V4** signed APK cold-installed from QR + T17 | 🔒 scaffold, signing custodian, publication route, phone. Backup: Mutarisi |
| Fri 25 | P3.V5 Android CI | After the scaffold builds; Sibusiso coordinates |
| **Fri 25 12:00** | **D2 / P3.L4** thin slice (joint) | Needs server-min 09:00, verify-min 10:00, guardian-min 10:00 |
| **Sat 26 18:00** | **P3.V6** M1–M5, M7 | M7 ground truth 🔒 Ipeleng/Khutso; all NOT MEASURED |
| Sun 27 08:30 / **09:00** | Final gate / submission | Lethabo / Babatunde |

Parked: KHAYA WBS 4.2 / 4.4 / 6.2 (ADR-0034, #42 closed).

## Draft location and next step

**Update 23 Sep:** independent review in [VUKOSI-WORKFLOW-CLAUDE-REVIEW.md](reviews/VUKOSI-WORKFLOW-CLAUDE-REVIEW.md). First packet: [p2a-yamnet-provenance/TASK.md](workflows/vukosi/p2a-yamnet-provenance/TASK.md).

**FACT:** original checkout C:/Users/khoza/Desktop/Geekulture remains on the hardware branch. This local draft is C:/Users/khoza/Desktop/Geekulture-vukosi-workflow, branch docs/vukosi-vigil-workflow, based on **open** #43 head0c6d202, not main. Its inherited tracking of someone else's pivot branch was removed to prevent accidental pushes.

No product implementation, model switch, Claude run, automation, public release or GitHub approval performed. This is not shared on GitHub until its own reviewed PR lands. Refresh #43 and reconcile with merged base before publication. Use [the Claude prompt](VUKOSI-CLAUDE-PROMPT.md) next.
