# Business translation (C2, C4)

For Babatunde's Sep 17 alignment pass. “Design” below means specified; no application capability is claimed built in this checkout. Every historical number must travel with [its evidence status](../EVIDENCE.md).

## 1. Translation table

| Technical fact/design | Meaning for user | Meaning for buyer | Pitch sentence |
|---|---|---|---|
| Human gate | A person checks a consequential action | Accountable review procedure | “A model can ask for review; a person must decide.” |
| Two distinct approvals | One operator cannot silently disable safeguards | Insider-risk separation | “Sensitive changes need two accountable people.” |
| Hourly Merkle batch | Record can later be checked outside provider | Dispute evidence independent of provider database | “We aim to make our actions separately checkable.” |
| R1.30/month supplied anchor model | No proposed per-member blockchain wallet fee | Batching may keep timestamp cost small; not full service cost | “The anchor cost is modelled, and the service costs are separate.” |
| Embeddings leave camera, not images | Less raw imagery transferred; still sensitive | Reduced exposure, not anonymous surveillance | “We minimise what leaves the camera, and still treat it as sensitive.” |
| Three-second audio ring | Raw audio is not meant to become an archive | Less stored audio to protect or disclose | “The design keeps raw audio only briefly in memory.” |
| Offline-first | Some local functions can continue | Venue/cloud failure need not erase local record | “Offline does not mean delivered; we show that difference.” |
| Lazy suspicion decay | Old uncertainty should not become a permanent mark | Less manual stale-state maintenance | “An old concern should not follow someone forever.” |
| Conflict coefficient | Disagreeing inputs remain uncertain | Fewer false-confidence claims | “When signals disagree, we keep the disagreement visible.” |
| Payload deletion, hash residue | Rights request can remove held content if lawful | Reduced retention risk; linkability review still needed | “Deleting content must be real, including copies and backups.” |
| Permissioned-only chain rejected | Provider is not sole judge of its own history | More credible multi-party disputes | “The parties in a dispute should not alone control its proof.” |
| Refused soft-evidence auto-dispatch | No automatic response based only on suspicion | Liability and escalation remain human | “We refuse to turn uncertain input into automatic dispatch.” |
| Refused remote gate unlock | System cannot casually grant physical entry | Smaller physical attack surface | “This service does not remotely open your gate.” |
| Refused injurious countermeasure | No automated injury mechanism | Avoids a dangerous product function | “The design does not include machinery intended to injure.” |
| Refused responder bounty | No reward for escalating suspicion | Less incentive to manufacture incidents | “No one earns a bounty by treating you as a threat.” |
| No generative determination | No invented narrative as authority | Auditable rule/decision boundary | “Generated text does not decide what happens to a person.” |
| Forecast loses to baseline | No justified predictive safety promise | Exclude a weak capability from offer | “Our forecast loses to a simple baseline, so it does not earn a product claim.” |
| Scoped subject portal | Nonmember can ask what is held | Legitimate service must handle outsiders' rights | “You do not need to pay us to ask about your information.” |

Lazy decay and conflict-coefficient implementation details were not supplied; do not claim their performance or a specific formula.

## 2. Standing format and worked examples

Use [templates/BUSINESS-HANDOFF.md](../../templates/BUSINESS-HANDOFF.md). Engineers fill status, evidence, user change, payer hypothesis, actual cost, risk and pitch sentence. Babatunde rejects any handoff missing status or evidence; Khutso checks claim lineage. Accepted copy enters the deck only after both leads' review. A later capability regression invalidates the old sentence and gets a correction entry.

Examples are **illustrative specified handoffs, not completed engineering work**:

- **VIGIL / sim_example_vigil:** proposed offline status screen. Newly possible: nothing implemented here; the design lets a member distinguish local recording from delivery. Buyer hypothesis: household/partner reducing confusion. Build hours/spend unknown. De-risks false receipt language; delivery itself remains unbuilt. Pitch: “Our proposed screen says when an alert has not reached the service.” Evidence: journey S04, pending implementation. Needed: Babatunde retain “proposed”.
- **KHAYA / sim_example_khaya:** specified three-second memory ring. Newly possible: no new built function here. Buyer hypothesis: household valuing nonretention. Cost unknown; BOM remains modelled. De-risks raw-audio accumulation if implemented; crash/swap handling untested. Pitch: “Raw audio is designed to disappear from memory after three seconds.” Evidence: production plan, hardware test pending.
- **ANCHOR / sim_example_anchor:** proposed independently verifiable export. Newly possible: no runnable verifier here. Buyer hypothesis: insurer/provider needing a checkable action history. Cost unknown; supplied timestamp model is not a quote. De-risks unilateral history rewriting after anchoring; does not prove truth of input. Pitch: “Our goal is a record you can check without taking our word for it.” Evidence: dispute flow and future proof test.

## 3. Value map

| Layer | Value created | Captured by | Evidence status |
|---|---|---|---|
| VIGIL | A route toward help without a free hand | Member and response partner | Founding case supplied; user validation and coercion-safe behaviour unproven |
| UMOJA | Human review with explicit limits | Operators, household, people observed | Prior controls reported; clean code/review burden unverified |
| KHAYA | Local sensing with reduced raw-data retention | Household, estate | Appliance not fabricated; runtime and affordability unverified |
| ANCHOR | Externally checkable commitments | Member, insurer, provider in dispute | Protocol basis exists; VUKA export/verification absent here |

## 4. Twenty commercial objections

| # | Question | Honest answer | Evidence | One-line version |
|---:|---|---|---|---|
| 1 | Is this surveillance? | Yes, proposed sensing affects bystanders; minimisation, lawful basis and rights are essential and unbuilt. | Data map/gaps | “Our legitimacy claim must survive a nonmember's challenge.” |
| 2 | Are you building a private police force? | No autonomous enforcement is designed; a lawful contracted human response remains unresolved. | Refused features; no response contract | “Sensing must not grant authority over people.” |
| 3 | What stops data sales? | Proposed purpose/contract limits, minimisation and governance; no technical guarantee against every future owner. | Rules; legal review pending | “We need enforceable limits, not a slogan.” |
| 4 | Why trust students? | Trust reproducible evidence and independent review, not credentials alone. | Clean checkout shows limits | “Check what we can demonstrate.” |
| 5 | What if you lose interest? | No funded continuity plan yet; export, service handover and deletion must be contracted. | Funding/exit gaps | “Continuity is a launch condition.” |
| 6 | Does it reduce crime? | We have no causal outcome evidence. | Retrospective data only | “We have not demonstrated crime reduction.” |
| 7 | Who pays R299? | No validated paying cohort in supplied evidence. | Model only | “Price is a hypothesis.” |
| 8 | Who installs it? | Proposed local partner; no installer agreement evidenced. | WBS/BOM work | “Installation must be measured and staffed.” |
| 9 | Who answers an alert? | A response arrangement must name responsibility; not established here. | No signed contract | “No receipt means no confirmed response.” |
| 10 | What if AI is wrong? | Human review limits consequence; wrong input still creates burden and risk. | Governance design; bias gap | “Human review is necessary, not proof of harmlessness.” |
| 11 | Why blockchain? | Independent temporal commitment helps disputes between interested parties. | OpenTimestamps basis | “The provider should not solely vouch for its own history.” |
| 12 | Is the data on Bitcoin? | Design publishes only a commitment; linkability still needs review. | Evidence/privacy notes | “No personal payload belongs on a public chain.” |
| 13 | What if timestamping stops? | Proofs remain pending; queue and later verify. | Runbook specified | “Pending is never relabelled confirmed.” |
| 14 | Can the record prove coercion? | Not by itself; it proves limited facts about recorded actions/commitments. | Dispute limitations | “A timestamp cannot read intent.” |
| 15 | Are you POPIA compliant? | Obligations and routes are not discharged. | Open privacy gaps | “No real-data pilot before the privacy gate.” |
| 16 | Can a stranger ask for a file? | A nonmember has a proposed rights route with proportionate identity checks. | S11/S12 specified | “Membership is not a prerequisite for rights.” |
| 17 | Does it work without power? | Only while independently powered components and connectivity remain available. | No hardware measurements | “We need measured runtime, not a stage-number promise.” |
| 18 | Is the margin real? | R137 is a supplied gross model before material missing costs/tax basis. | Economics arithmetic | “Cash financing and gross margin are different.” |
| 19 | Can you scale to an estate? | Concurrency and cost architecture is specified, not load-tested. | Production plan | “Scale is a test to pass.” |
| 20 | Why not a panic button? | Coercion motivates hands-free initiation; its safe operation is unproven. | Founding scenario | “The question is what happens when asking is unsafe.” |

## 5. Presentation spine

Argument order: (1) asking may be unsafe → (2) sensing must not create unaccountable power → (3) human gates and separate records answer that risk → (4) show a household/operator/subject flow → (5) expose what is actually built and what fails → (6) explain price/cost assumptions → (7) name seven owners and the next evidence gate. Proof sits respectively in the founding scenario, governance rules, future denial/proof tests, journey screens, evidence ledger, economics worksheet and WBS. The scenario is not user research; the screens are not working code.

**60-second version, rehearsal target:** “When someone is forced to unlock a phone, another button is not enough. VUKA is designed around help that can start without a free hand, while a person remains responsible for consequences. Sensitive changes need two approvals, and the household should be able to check what the system did outside the provider's database. Today this clean repository holds our design, evidence gaps and delivery plan; it is not a service to rely on tonight. The proposed R299 household price is a model. Seven named owners are working toward a tested flow and a lawful pilot, and we will show the limits alongside the proof.”

**Five-minute version, ASSUMPTION timings:** 0:00–0:40 founding scenario; 0:40–1:20 authority boundary; 1:20–2:50 household, operator and subject flow with persistent simulation/specification labels; 2:50–3:30 one externally checked proof if available, otherwise an explicit specification; 3:30–4:10 price and missing costs; 4:10–4:40 seven owners and current evidence; 4:40–5:00 ask for a supervised validation partner. Do not fill a missing demonstration with historical test counts.

**Twenty-minute version including questions, ASSUMPTION timings:** same five-minute core; minutes 5–8 walk through disputed record and deletion limits; 8–10 show power/offline failure and actual test evidence if obtained; 10–12 explain unit cash model and validation gates; 12–20 audience questions using the objection book. This is a speaking plan, not a rehearsed time measurement. Never add unsupported claims just because time is longer.

## 6. Stop saying / say instead

Forbidden assurance themes are guilt identification, guaranteed legal admissibility, bias-free AI, invulnerability and guaranteed prevention. Say “candidate for human review”, “record with independently testable properties”, “bias evaluation not yet run”, “tested controls with open gaps”, and “no demonstrated prevention outcome”, respectively. Do not use a prohibited slogan even with impressive test counts.

| Internal phrase | Audience version |
|---|---|
| Log-odds sensor fusion | “Several uncertain signals may ask a person to look.” |
| Ed25519/Merkle root | “A changed record can fail an independent check.” |
| Embeddings | “A derived representation that remains sensitive.” |
| Lazy decay | “Old concerns should fade under a defined rule.” |
| Conflict coefficient | “Disagreement stays visible.” |
| TRL 5 | “TRL 4 target, with evidence status shown.” |
| Immutable truth | “A time-bounded commitment, not proof of truth.” |
| Fixed cost at any size | “Timestamp batching is small; service cost still scales.” |

§11 check: eighteen translation rows, twenty objections, three status-labelled examples, same seven-person reality and honest failures. Proceed to adversarial review. Human business review pending.
