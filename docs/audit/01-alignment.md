# 1. Scorecard

ASSUMPTION: these are reviewer estimates from the brief and initial checkout, not organiser predictions. No originals or working demo were available.

| Criterion | /10 | Why below full marks | Cheapest improvement |
|---|---:|---|---|
| C1 Team composition | 6 | Supplied roster contradicts described submission; sector experience unproven | Replace team copy; attach role evidence |
| C2 Innovation and creativity | 6 | Checkable consequences are distinctive; household demand is unvalidated | Show refusal and independent verification in one flow |
| C3 Progress | 3 | Empty code repository cannot substantiate historical build claims | Evidence manifest, screens and reproducible local demo |
| C4 User journey | 2 | No inspected screens or user test | Five flows and twelve screen specs, then observed task completion |

Total: 6 + 6 + 3 + 2 = **17/40**. This scores evidence available now; a historical submission with its supporting artefacts may score differently. Seven members do not automatically earn ten marks.

# 2. Team correction (C1)

VUKA has seven members across four universities. Software delivery spans Mutarisi's frontend and Vukosi's appliance work; Sibusiso owns backend delivery, CI and the record; Lethabo owns architecture, product and UI/UX with Mutarisi. Khutso connects requirements to verification. Ipeleng owns security design. Babatunde owns business development and presentation. The brief reports gender variety; do not infer anyone's gender from names. Professional safety-sector experience and user access are still unverified gaps.

| Replacement team slide: “Seven people, one accountable service” | University | Responsibility a household can understand |
|---|---|---|
| Lethabo Hoaeane, co-lead | UNISA | Makes the whole experience understandable and reviews the design |
| Sibusiso Khumalo, co-lead | Wits | Keeps the service and its record working |
| Babatunde Adelusi | University of Pretoria | Makes the offer sustainable and explains it |
| Mutarisi Chibaya | University of Pretoria | Builds the screens people use |
| Khutso Mothopa | Wits | Checks that promises have evidence |
| Vukosi Khoza | Wits | Makes the household equipment work |
| Ipeleng Constance Modise | TUT | Tests how the system could be abused |

Why this team can ship: Each handoff has an owner: household equipment to service, service to screen, screen to a human decision, and that decision to a record someone else can check. Two leads review shared contracts, while business and security work have named owners. Delivery still depends on available hours, a safe code port, household feedback and real hardware tests; the roster alone does not remove those gaps.

The brief identifies stale copy in `CLAUDE.md` §9, `04-VUKA-Team-Capabilities.md`, deck slide 22, judge notes and progress update; it also identifies both old READMEs as needing a Built/Designed split. None is in this checkout. These are reported locations, not an exhaustive search result. Lethabo must inventory the separate working folder and search singular/three-member variants before Sep 16. This checkout's replacement README and team files are current. Do not claim unseen files were fixed.

# 3. Positioning (C2, C3)

VUKA is designed to help a household when reaching for a phone is unsafe. People remain responsible for consequential decisions, sensitive changes need two approvals, and the system keeps a record that can be checked outside the service provider. Machine learning can raise something for review; it cannot decide what happens to a person. The clean implementation is still being assembled and validated.

Opening, target 30 seconds (ASSUMPTION; rehearse timing): “When someone is forced to unlock their phone, help cannot depend on a secret moment to press another button. We are designing VUKA around that moment. A person checks consequential decisions. Sensitive changes need two approvals. A separate record lets a household challenge what the service did. Models can be wrong; they must never become the authority.”

| Component | ML? | When wrong or unavailable |
|---|---|---|
| Human gate | No | Refuse unauthorised transition; log attempt |
| Two-signature approvals | No | Refuse duplicate, expired or wrong-scope signatures |
| Hash chain, signatures, Merkle batching | No | Corruption blocks verified status |
| Public timestamp | No | Display pending until proof confirms |
| Three-second audio buffer | No | Capture fault means acoustic input unavailable |
| Offline queue and alert display | No | Show last contact and unsent status |
| Suspicion decay, whitelist guard, conflict rule | No, specified rules | Conflicting/insufficient inputs stay uncertain |
| Face/vision embeddings | Yes | Wrong match is never guilt; review and challenge route required |
| Acoustic classifier | Yes, proposed integration | Missing/incorrect cue lowers confidence; no automatic consequence |
| Forecast | Yes | It loses to baseline; exclude from live decision/demo claim |
| Fusion | Hand-set rule combining inputs | Provisional weights; do not present as calibrated probability |

Governance is a design commitment with reported prior implementation, not proven by this empty application tree.

# 4. Consumer-first offer (C4, C2)

The proposed household buys a help-and-accountability service, modelled at R299/month for KHAYA. Week one should include consent explanation, installation with camera boundaries checked, a supported phone setup, a clearly labelled practice alert, and an understandable record. Those are acceptance targets, not an available product. The household must know who receives alerts, when they are staffed, what power loss removes, and how to leave. A security company or estate is the proposed distribution and support channel; an insurer may fund verified installation. No automatic response promise or double-billed bundle is implied.

# 5. TRL resolution (C3)

Proposed slide now: **“Target: TRL 4. The prior project reports laboratory verification; we are reproducing that evidence in the clean repository. Appliance fabrication and field validation remain outstanding.”**

Conditional replacement only after evidence review: “TRL 4 met and verified in the attached laboratory test record. Two named subsystems have separate TRL 5 evidence. Fabricated appliance hardware and system-level field validation remain outstanding.” The brief does not name the two subsystems, so neither can be responsibly named here. Sibusiso must supply ADR-0025, exact configuration, environment, results and independent rerun. Hardware fabrication alone does not establish TRL 6.

# 6. Ten unanswered questions, ranked (C2–C4)

| Rank | Question | Why it hurts | Honest spoken answer |
|---:|---|---|---|
| 1 | Can I rely on this tonight? | Safety consequence | “No. This is a prototype plan, not an operating response service.” |
| 2 | Is the exposed access revoked? | Continuing compromise | “We need issuer revocation evidence before porting features.” |
| 3 | Can the person filmed get their file deleted? | Core legitimacy | “That route is not built; it blocks a real-data pilot.” |
| 4 | Show the clean repo doing it. | Reproducibility | “Only planning and repository controls are here so far.” |
| 5 | Which household asked for this? | Demand | “We do not yet have interview evidence in this pack.” |
| 6 | Who responds and accepts liability? | Operational reality | “No signed response arrangement is evidenced; we cannot promise dispatch.” |
| 7 | Does the phone reveal duress? | Coercion risk | “Observable equivalence is a test target, not a demonstrated property.” |
| 8 | Does the face model treat people fairly? | Harm | “The demographic evaluation has not run and thresholds are uncalibrated.” |
| 9 | What survives a long power cut? | Feasibility | “We must measure load and runtime; the appliance is not fabricated.” |
| 10 | Why should I pay R299? | Viability | “It is a model; interviews and paid pilot retention must validate it.” |

§11 check: scores labelled assumptions; seven members; no locally verified TRL claim; no historical latency repetition; forecast failure retained; unseen-file limitation explicit. Proceed to economics. Human acceptance pending.
