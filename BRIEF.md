# VUKA — read before each session

**When you can't ask for help, VIGIL notices. When nobody believes you, ANCHOR proves when.** Machines notice; people decide. The anchor proves *when*, not *what*.

**What we build (from 23 Sep, ADR-0034):** VIGIL, an Android app that listens during a journey the user starts, asks a discreet "Journey check" and alerts the guardians the user chose; and ANCHOR, a signed hash chain per person, with every PIN-gated outcome anchored to Hedera within about a minute, verifiable by a stranger. KHAYA and UMOJA are parked, not deleted.

**Event:** Geekulcha, Centurion, Fri 25 Sep 16:00 to Sun 27 Sep 16:00. **Final submission Sun 27 Sep 09:00** (not 15:00). SSDLC due Sat 12:30 (internal 11:00). Lean Canvas on Sonke Sat night. Criteria: Innovation 15 · Technical 15 · Usability & Design 10 · Security & Ethics 10 · Business 15 · Quantum bonus 5. Seven members, four universities; Lethabo and Sibusiso are joint leads.

**Who does what:** Lethabo, product/UX/architecture and final gate. Sibusiso, contract v2, ANCHOR server, anchoring, deployment. Vukosi, VIGIL sensing, signing and measurement (reports to Lethabo). Mutarisi, VIGIL and guardian screens. Khutso, evidence, checklist, guardian delivery, `sim_bank`. Ipeleng, security, privacy, verify-page cryptography, SSDLC. Babatunde, economics, deck, pitch. Your full work order is in `team/<you>.md`.

**Current reality:** the repo has specs, the v1 contract and governance; the anchor chain code is in open PR #39, to be reworked to format v2; there is no VIGIL app yet; the predecessor app is a reference to port file by file. No VIGIL number is measured yet: detection, latency, battery and delivery stay "not measured" until `docs/VUKA-2-SPEC.md` §16 runs. The 318 ms p95 (n = 10) historical figure measured a retired relay and is never quoted for VIGIL.

**Never:** claim "proof of duress", "invisible" or "court-admissible"; send a bank signal from detection alone; let a duress path look different from a normal one; use an LLM, RAG or agent framework in the product; put personal data on chain; let the absence of a record count against anyone. Anything simulated is `sim_` in code, SIMULATED on screen and named aloud; testnet is called testnet.

**Start with** `docs/MASTER-CONTEXT.md`, then RULES.md, AGENTS.md, `docs/VUKA-2-SPEC.md` and your team file. Claim shared paths in `docs/OVERLAPS.md`. After meaningful work: update your team file, tick `docs/CHECKLIST.md` P3, and add a `docs/build-log/entries/` file. Never invent another person's activity or approval.

**Milestones:** Thu 12:00 contract v2 · Thu 22:00 signed APK cold-installed from QR · Fri 12:00 thin end-to-end slice · Fri 23:59 server live · Sat 18:00 measurements and UI · Sun 08:30 final gate · Sun 09:00 submit. If a milestone slips, cut from the top of the cut line in `docs/VUKA-2-SPEC.md` §14, never the safety features.
