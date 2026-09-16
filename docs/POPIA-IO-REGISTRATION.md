# POPIA Information Officer registration — prepared path (P2.5)

**Task:** `docs/CHECKLIST.md` `P2.5` — "Register the Information Officer — free, online, under 30 minutes. No excuse before any pilot."
**Honest status: prepared, not submitted.** This document records the verified routes, the decisions the leads must make, and the exact inputs the submission needs. The registration itself is a legal act by the responsible party and has not been performed — no confirmation reference exists yet (§7 is empty on purpose). Companion to `docs/POPIA-POSITION.md` (§9 flagged this task) and `docs/PSIRA-POSITION.md` (§8).

---

## 1 · Why this is the cheapest statutory gate left

POPIA s55 (Accessible Law copy, ⚑ pending Gazette verification):

> "Officers must take up their duties in terms of this Act only after the responsible party has registered them with the Regulator."

The Regulator's own site states it as a condition of acting, not a suggestion: "Information Officers must assume their duties only after the responsible party has registered them with the Regulator. Private and public bodies must register their Information Officers on the Regulator's Information Officer Portal." (`inforegulator.org.za`, retrieved 16 Sep 2026.)

And the consequence of *not* registering, already recorded in `docs/POPIA-POSITION.md` §9: the Regulator holds **the head of the organisation liable for all POPIA matters** where no Information Officer is registered. Unregistered, every POPIA obligation lands on the head personally. Registered, s55 allocates the duties and s56 allows delegation to a deputy. The checklist call — "no excuse before any pilot" — is correct.

---

## 2 · Who must be registered as VUKA's Information Officer

POPIA s1 defines "head" of a **private body** as (substance; **not verbatim-verified** — see §8) the chief executive officer or equivalent officer, or any other person who normally acts in that capacity, or a person duly appointed by the board or other governing body to be in charge. The Regulator's Guidance Note on Information Officers and Deputy Information Officers (01 Apr 2021) governs registration around this definition.

**For VUKA this is a leads' decision, not a researcher's.** VUKA is a hackathon team operating as a private body; "chief executive officer or equivalent" maps to whichever of the two leads (or a person they appoint) is the team's head for POPIA purposes. This document deliberately does not name the IO — registering a name without the leads' designation would fabricate an appointment. **Open decision D-IO-1:** leads designate the head (or an appointed head) to be registered as IO.

Two constraints the designation should respect:

- `docs/PSIRA-POSITION.md` §8 already fixed the structure: **VUKA registers its own IO regardless of the PSiRA partner variant**; the partner is separately accountable for its own processing. The IO designation must not be deferred to the partner.
- The IO cannot be a placeholder mailbox or a tool. s55 duties are personal to the office (§5 below).

---

## 3 · Route A (primary) — the eServices Portal

**Verified reachable 16 Sep 2026.** `eservices.inforegulator.org.za` — the portal's own landing page: *"Welcome to the Information Regulator's eServices Portal — Here, you will find all the tools and resources necessary for POPIA and PAIA compliance. Verify compliance status, **register Information Officers**, and submit PAIA annual reports with ease on the Regulator's user-friendly platform, promoting transparency and accountability."* The portal's news feed carries "Registration of Information Officers" dated 01/05/2024 — the service is live, not announced.

**Procedure:** create an account (Register link on the portal landing page) → log in → complete the Information Officer registration for the responsible party. **Free.**

**Honest limitation:** the account-creation and IO-registration forms are client-side rendered; the field list could **not** be enumerated by static fetch this session (`/Identity/Account/Register` returns 404 to a non-browser agent). The form fields are therefore not quoted in this document. Whoever submits from a browser records the actual field list in §7 — that closes the gap with real evidence instead of a guessed inventory.

---

## 4 · Route B (fallback) — manual form by email

The Regulator's legacy `information-officers` page (`inforegulator.org.za/information-officers/`, retrieved 16 Sep 2026) still states: *"Registration Portal under construction. Guidance Note on Information Officers and Deputy Information Officers, 01 Apr 2021 … Form for manual registration: Application form for Registration of Information Officers. Submit completed form to `Registration.IO@inforegulator.org.za`."*

So the two channels coexist: the eServices Portal (primary, self-service) and the emailed manual form (fallback, processed by the Regulator). The manual route is the one to use if the portal rejects the organisation details (e.g. no CIPC number — see §6). The Guidance Note PDF link was not retrievable this session (URL guess 404; the note itself is referenced verbatim on the page above).

## 5 · What registering actually commits the IO to

Not a rubber stamp. s55(1) responsibilities (Accessible Law copy, ⚑): *(a)* encouraging the body's compliance with the conditions for lawful processing; *(b)* dealing with requests made to the body under the Act; *(c)* working with the Regulator in relation to investigations in relation to the body; *(d)* otherwise ensuring the body's compliance; *(e)* as may be prescribed.

Consequences the team already owes:

- **Requests route (F14):** the IO is the statutory receiver of the subject-access path `docs/audit/04-production-readiness.md` sketches — S11 request → receipt → identity check → scoped search → redaction → delivery or reasoned refusal. The IO owns that route's lawful operation.
- **Regulator inquiry:** `docs/OPERATOR-DUTY.md`'s escalation row ("Regulator inquiry — notify Ipeleng and the service owner") should name the registered IO once designation is made; under s55(c) the IO is the Regulator's working counterpart.
- **PAIA annual reports:** the same portal takes PAIA annual report submissions (window opens 01 Apr, closes 30 Jun each year — the portal states no extensions). The IO inherits that calendar obligation too.
- **PAIA manual (s51):** a separate obligation of the head of a private body — not part of IO registration, but the natural next document once the IO exists. Not started here; recorded so it does not get lost.

One verification item for counsel: the Accessible Law copy renders s55(1)(c)'s investigations chapter as "Chapter 6", while the Act's enforcement provisions sit in Chapter 10 — likely the Bill's old numbering surviving in the convenience copy. Added to the ⚑ list (§8).

---

## 6 · What the leads must supply before anyone can press Submit

| # | Input | Why | Owner |
|---|---|---|---|
| 1 | **Head designation** (D-IO-1) — the named person to register as IO | s1 "head" definition; the Regulator registers the responsible party's designated officer, not a volunteer | Both leads |
| 2 | **Organisation legal identity** — VUKA's registered name/number, or the decision to register as an unincorporated body/club with whatever identifier the form accepts | No CIPC number, registration date or registered address exists anywhere in this repo (searched 16 Sep). If the portal requires a CIPC number, Route B is the fallback and the answer may shape the team's legal form | Both leads |
| 3 | **Contact email** — organisational, monitored (e.g. a VUKA address), not a personal inbox | The Regulator corresponds with the IO on it; it appears on the registration record | Both leads |
| 4 | **Deputy IO designation (optional, s56)** — recommended: the second lead as deputy | Keeps the office filled if the head is unavailable | Both leads |
| 5 | **Submission record** — date, channel, confirmation reference, portal field list | §7 of this document; the checklist row closes on this evidence | Designated IO |

Items 1–4 are a single leads' conversation. Item 2 is the only one that can surprise — and it gates the *form*, not the decision.

---

## 7 · Submission record

*(empty — nothing submitted as of 16 Sep 2026; fill at submission: date, channel used, account/reference, field list, any portal rejection and its text)*

---

## 8 · Provenance and verification log

- **Retrieved 16 Sep 2026, this session:** `inforegulator.org.za` (homepage + `/information-officers/`) — Regulator wording quoted in §1, §4 including the manual-registration email address; `eservices.inforegulator.org.za` — portal wording quoted in §3; `popia.co.za` (Accessible Law) s55 — duties quoted in §1, §5. All statutory quotes from the Accessible Law convenience copy stay **⚑** until counsel verifies against the Gazette (same standing caveat as `docs/POPIA-POSITION.md` §10).
- **Not verbatim-verified this session:** the s1 "head" definition — §2 states its substance; both the live and Wayback-archived Accessible Law s1 pages rendered with the alphabetical d→p span truncated in this environment, so the exact wording was not captured. Verify against the Gazette before quoting it to a third party.
- **Unreachable/failed this session:** Guidance Note PDF (guessed URL 404 — the note is referenced on the information-officers page itself); the eServices registration form's field list (client-side rendered; §3 records the honest limitation).
- **This document is not legal advice** and creates no compliance claim. The honesty ledger (`docs/00-SPEC.md` §5) applies: preparing a registration path is not being registered.
- **Authored:** 16 Sep 2026 — Ipeleng (via Cline assistant), for `docs/CHECKLIST.md` `P2.5`. Co-located on PR #30 (`docs/ipeleng-psira-position`; PR #28 merged with the P2.1 commits only) with the two position papers it depends on. Reviewed by: pending Lethabo, then both leads.
