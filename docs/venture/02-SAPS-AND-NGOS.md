# 2 · SAPS and South African NGOs: who to approach, in what order, and for what

> **E-Hub insight 2 (15 Oct 2026):** *"We might need to approach SAPS, and get backing from South African NGOs that align to VUKA."*
> **Status:** `PROPOSED`. **No organisation has been contacted for this plan**, and none has endorsed VUKA. Organisation names below are candidates; each row is `ASSUMPTION` until a conversation is recorded with its date. The web research pass that checks each organisation's current programmes and public contact route lands as a follow-up commit on this PR. Serves B, S, and community impact for the judges' pitch.

---

## 1 · What VUKA can honestly offer, and what it can't

Every conversation starts here, because over-promising to police or to survivors' organisations does lasting damage.

| VUKA does | VUKA does not |
|---|---|
| Notices possible duress on the member's phone and asks a discreet check-in | Dispatch police, security or anyone else (no autonomous dispatch, `RULES.md`) |
| Alerts the guardians the member chose, telling them **"Don't call or text them. Call 10111."** | Call 10111 itself, or share anything with SAPS on its own initiative |
| Keeps a signed record whose timing a stranger can check (**when, not what**) | Prove that duress happened, or identify an attacker |
| Lets the member export their own record | Hand member data to police without the member's request or a lawful order |

## 2 · Order of approach (proposed)

1. **Aligned NGOs first.** They bring the people VUKA is for, an honest test of comfort and wording (insight 3), and credibility no deck can buy. They also tell us what *not* to build: for example, how a safety app is misused in an abusive relationship.
2. **A campus pilot community next.** Wits, where VUKA was demonstrated on 15 Oct: student safety services and student organisations. A bounded, consenting group for the closed beta ([`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md)).
3. **SAPS through formal channels, with the NGO and campus evidence in hand.** A police service backs a private app slowly and formally; arriving with users, measured results and a clear data boundary is the only credible way in. The **CPSI** (Centre for Public Service Innovation), which co-hosted the Geekulcha hackathon (`docs/MASTER-CONTEXT.md` §1, `FACT`), is the natural public-sector door.
4. **Industry bodies alongside the bank and insurer track** ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)): SABRIC (banking crime) and Business Against Crime South Africa.

## 3 · Candidate map (`ASSUMPTION` until each row is checked and a contact is recorded)

| Group | Candidates | Why aligned | The ask |
|---|---|---|---|
| Gender-based violence | TEARS Foundation, POWA (People Opposing Women Abuse), Rape Crisis Cape Town Trust, Sonke Gender Justice, the national GBV Command Centre | Coercion often happens where a button can't be pressed; guardians-only escalation and silent guardian removal were designed for intimate-partner abuse (ADR-0036) | A design review of the duress path and the wording; later, referral of willing testers |
| Counselling and crisis lines | LifeLine South Africa | Guardians are told what to do next; a crisis line knows what helps | Review the guardian alert text and the help screen |
| Kidnapping and missing persons | Missing Children South Africa | Express kidnapping is the core harm (17,061 kidnappings in 2023/24, `FACT`, SAPS via ISS Africa) | Advice on what families need in the first hour |
| Civil society safety and accountability | Action Society; the Institute for Security Studies (ISS Africa, already a data source in `docs/EVIDENCE.md`) | Independent voices on crime data and on private safety tech | A critical read of the honesty ledger; data access |
| Campus | Wits campus protection services; student representative bodies; the Wits E-Hub | The first community that saw VUKA live | A consenting closed-beta group, and a protocol both sides sign |
| Public sector | CPSI; the Civilian Secretariat for Police Service | Public-service innovation, and police oversight | An introduction to the right SAPS division, and guidance on what SAPS can and can't take from a private app |
| Police | SAPS divisions dealing with kidnapping, extortion and hijacking; 10111 centres | Guardians are told to call 10111; an investigator may later want the member's exported record | Feedback on the guardian instruction; a view on whether an exported record helps an investigation |
| Industry | SABRIC; Business Against Crime South Africa | Banking crime data; established public–private crime partnerships | Data and introductions for the bank track |

## 4 · Risks, and the rules that answer them

- **Sharing with police.** Member data goes to SAPS only when the member exports and hands it over, or under a lawful order. The record proves timing, so it can help an investigation without VUKA becoming an informant. Any SAPS arrangement is written down first, with a POPIA basis.
- **When the abuser is the guardian, or is police.** Guardian removal is silent and delayed, and duress additions create a decoy (ADR-0036). These protections are a talking point with GBV organisations, and their feedback may change them.
- **Endorsement conditions.** No "endorsed by", "backed by" or "in partnership with" on the website, deck or app until the organisation says so in writing. Hold even "in conversation with" until a meeting has happened and is recorded in the repo.
- **Pilots with vulnerable people.** No testing with survivors without the organisation's own safeguarding protocol, informed consent, and `sim_` labels on anything that isn't a real alert path.

## 5 · What to bring to each meeting

- The two-minute judges' pitch ([`05-TWO-PITCHES.md`](05-TWO-PITCHES.md)), told as community impact.
- A phone with VIGIL in **SIMULATED** mode, and the public verify page.
- The "does / does not" table in §1, printed.
- One specific ask from §3, not a general request for support.
- After the meeting: a short record in `docs/build-log/entries/` (who, when, what they said, what we agreed), with no personal contact details of individuals.

## 6 · Owners and timing (proposed)

| By | What | Owner |
|---|---|---|
| mid Nov 2026 | Two NGO conversations held and recorded; one campus conversation | Lethabo (GBV, campus), Sibusiso (kidnapping, industry) |
| Dec 2026 | Closed-beta protocol agreed with one campus or NGO partner | both |
| Q1 2027 | CPSI introduction requested, with beta results in hand | Sibusiso |
