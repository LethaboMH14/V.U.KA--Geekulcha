# KICKOFF — what the team is told on day one

> This is the message Lethabo posts to the team group. It is kept here so anyone who joins late, or loses the chat, has the same starting point everyone else got.
>
> Posted: 14 September 2026. Thirteen days to the event.

---

**Hello — I'm Lethabo, project lead on this build. Sbu (Sibusiso) is co-lead with me.** Between us: I own architecture, product and UX; Sbu owns the backend, the ledger, CI and demo orchestration. We both review everything, and any change to a frozen contract or a locked decision needs both of us plus a written decision record.

**What we're building, in two sentences.** VUKA is a community-safety network with one property no competitor has: it can be *verified* rather than trusted. A phone that works out you're in trouble when you can't reach it, a home that tells a person from a dog, a street that remembers who belongs there — and a record of every decision we make about a person that nobody, including us, can quietly rewrite.

**Why.** You can't open a bank account in South Africa without the app, so the vault and the key now sit in the same pocket, secured by a face that can be taken by force. The robbery adapted: unlock, transfer, drive to an ATM for the daily limit. The victim performs the transaction, and every record the bank holds says they authorised it. And every safety product ever built requires you to *ask* for help — a button, an app, a call. All of it needs a free hand and a moment of privacy. **Coercion removes both.**

**How we solve it.** Four layers:

- **VIGIL** — the person. Detects duress on the phone itself, with no button pressed.
- **KHAYA** — the property. Sees a *person* instead of sensing motion.
- **UMOJA** — the street. Learns who belongs before it ever treats anyone as unknown, and the machine's highest possible verdict is *"worth a human look."*
- **ANCHOR** — the record. Every decision hash-chained, and a 32-byte fingerprint published to a public blockchain every hour, so the record of us deciding **not** to accuse someone is the one thing we can never delete.

---

## How the repo works

Everything coordinates **through files in the repo, never through any one AI tool's chat** — we drive different tools and they share no memory with each other.

| Step | Do this |
|---|---|
| **1** | `git pull` — always, first |
| **2** | Read `docs/MASTER-CONTEXT.md`. Every session. It is one page |
| **3** | Open **your own file** — `team/<yourname>.md`. It holds your role, your reviewer, your effort level, your rules and your current task |
| **4** | Claim any shared file in `docs/OVERLAPS.md` **before** you touch it |
| **5** | Branch: `<yourname>/<thing>`. Never commit to `main` |
| **6** | Work. Then: `docs/BUILD-LOG.md` entry — **what, why, how, when** |
| **7** | Tick your row in `docs/CHECKLIST.md` |
| **8** | Run `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` |
| **9** | Open a PR — **for everything, including docs** — and request your reviewer |

**To start a session with your AI tool:** open `docs/SESSION-PROMPT.md`, copy the prompt, change one word to your name, paste. That's it. Everything else it needs, it pulls from the repo.

---

## Your roles, your reviewer, your first task

| | Owns | Reviewed by | First task |
|---|---|---|---|
| **Lethabo** | Architecture, product, UX, ADRs, final submission | Sbu | Model licence register · TRL decision · competitor block |
| **Sbu** | Backend, ledger, CI, contracts, demo | Lethabo | Subject access working end-to-end · freeze the contract |
| **Khutso** | Evidence, traceability — **the team's memory** | Sbu | Master context · checklist · fix the TRL wording |
| **Ipeleng** | Security, privacy, red team | Lethabo | PSiRA and POPIA position papers · abuse cases |
| **Mutarisi** | Member and operator screens | Lethabo | The 12 screens · the subject-access screen |
| **Vukosi** | Edge device, hardware, power | Sbu | **Real** BOM quotes · measured power and offline recovery |
| **Tunde** | Business case, economics, the pitch | Lethabo | Unit economics · validate a real buyer · audit every claim |

Full detail — research, workflow, execution dates, your rules — is in **your own file**, `team/<yourname>.md`. The whole plan is in `docs/PLAN.md`.

---

## What I want from each of you

**Evidence, not assertions.**

- If you measured it, say **how** and with what **sample size**.
- If you didn't measure it, say **"not measured."** That is a complete and acceptable answer here — and on this particular hackathon, it is often the answer that wins.
- Mark everything `FACT`, `ESTIMATE`, `ASSUMPTION` or `PROPOSED`.
- **Never fabricate** a number, a test result, or another person's approval. Not once, not to fill a gap, not because it's 2am.

---

## What we're aiming at

The theme is **BUILD FOR USE**, and the test is one question:

> ### "Would a real user trust and use this?"

The organisers have said plainly that they're worried about solutions that are impressive but can't survive contact with reality. **Our whole architecture is already the answer to that** — the parts that carry the weight contain no machine learning at all. We win by being the team that can be **checked**, not the team that claims the most.

Our track is **Blockchain for Impact Use**, and the brief asks for *commercially viable* use cases. Ours is: the anchor is batched, so it costs the same for the whole network at 100 homes as at 100,000. A blockchain line item that doesn't grow per user is the difference between a use case and a demo.

---

## The one thing to focus on

> **A person asks for their own record and gets it, with a proof a stranger can verify without our help.**

That's the demo. Everything else supports it. If you're deciding what to cut, cut whatever isn't holding that moment up.

---

**Effort level: this is the highest bar we've worked to. Production quality, not demo quality.**

Thirteen days. Let's go.

— Lethabo
