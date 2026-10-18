# PILOTCORE website — brief for Lethabo

> **Asked by Sibusiso, 18 Oct 2026:** Lethabo starts building the website for **PILOTCORE**, the company the two founders own and that VUKA is produced by. This page is the starting brief, not a design. Lethabo owns product, UX and brand, so every choice below is hers to change. Status: `PROPOSED`.

---

## 1 · Why the site is needed now

Funders, award reviewers, and the banks and insurers we want to work with ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)) will all check who is behind VUKA (`ASSUMPTION`). Only the E-Hub showcase and the YouthX and Easies entries are recorded contacts so far. Today the only public pages are the VUKA Ledger verify site and this repository, which describe a hackathon team of seven. A bank's vendor check, an investor's first look and an NGO's due diligence all start with a company website.

**The one job:** a visitor understands within a minute that PILOTCORE is a real South African company, that VUKA is its product, what is built versus planned, and how to get in touch about a pilot.

## 2 · Facts the site may state, and their sources

| Fact | Source | Tag |
|---|---|---|
| Registered name **PILOT CORE (Pty) Ltd**, registration **2026/122060/07** | `scripts/build_financial_model.py` (founders' own record). **Copy the exact name and number from the CIPC certificate**, not from this page. The brand is written "PILOTCORE" and the registered name "PILOT CORE"; decide how the site shows both | `REPORTED` (founders' script) until checked against the certificate |
| Founders and directors: Sibusiso Khumalo, Lethabo Hoaeane | the same record | `REPORTED` (founders' script) until checked against the CIPC certificate |
| VUKA reached the **Nedbank YouthX Awards 2026 top 50** | YouthX email to Sibusiso (shared 18 Oct 2026; not yet in the repo. Commit a redacted copy) | `FACT` (email); not on a public list yet, so say "selected for the top 50" and don't use Nedbank or YouthX logos without written permission |
| VUKA was **demonstrated at the Wits E-Hub Tech & AI Day**, 15 Oct 2026 | Sibusiso | `FACT` (founders') |
| VUKA was built at the **Geekulcha Annual Hackathon 2026** (CPSI, Telkom) | `docs/MASTER-CONTEXT.md` §1 | `FACT` |
| The public verify page and the Hedera **testnet** anchor | Pages deployed 14 Oct; **live verification is blocked until a company server is back** (D9, [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §0) | `FACT` that it's deployed. Link it from the site only after a recorded LIVE-VERIFIED run on the company server; always say "testnet" |

Anything not in this table (traction, users, partners, accuracy, market size) stays off the site until it is in `docs/EVIDENCE.md` with a source.

## 3 · Pages (proposed)

1. **Home.** What PILOTCORE does, in one line: *safety technology whose record a stranger can check, built in South Africa.* One paragraph on VUKA, and one call to action: *"Talk to us about a pilot."*
2. **VUKA.** VIGIL (notices) and ANCHOR (proves when), using the README's wording. Add an honest status box: pilot-ready build in progress, Hedera testnet, bank integration simulated, detection accuracy not yet measured in the field. Link to the public verify page.
3. **For partners** (banks, insurers, response companies). The three offer types (bank risk signal, VIGIL inside the partner's app, ANCHOR verification) from [`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md) §5, each marked as a proposal, plus a pilot enquiry route.
4. **Trust and privacy.** What VUKA never does: no audio recorded or uploaded; only a 33-byte fingerprint on the public ledger, never names, locations or event details; and a duress path designed to look normal. Include the list of claims we refuse to make (`docs/MASTER-CONTEXT.md` §6). This page is the differentiator; most safety companies don't publish one.
5. **Company.** The two founders, the recognition from §2, and the registered details in the footer.
6. **Contact.** A partner email address on the company's own domain. Avoid a form at first: a form collects personal information and needs its own privacy notice and storage (POPIA). If one is added later, it needs a short purpose statement, a retention period and a named Information Officer.
7. **Website privacy notice.** Covers the site only (no tracking, no cookies beyond what hosting needs). The VUKA app's notice is a separate document (`docs/PRIVACY-POLICY.md`, still a draft for counsel).

## 4 · Rules that carry over from VUKA

- **Words we never use:** the whole "Never say" column of `docs/MASTER-CONTEXT.md` §6:
  - "proof of duress";
  - "invisible" and "the attacker sees nothing";
  - "always on" and "works offline";
  - "court-admissible";
  - "unhackable", "unbiased AI" and "prevents crime";
  - any detection accuracy without its method and n;
  - "a VUKA record is required for a claim";
  - "we push criminals toward physical crime";
  - "POPIA-compliant" (our reading until counsel confirms it).
- **Words to use instead:** "discreet"; "journey mode; detection works offline, delivery needs data"; "proves when, not what"; "the absence of a record is never evidence against anyone"; "built to maximise the ECTA s15 reliability factors".
- **No borrowed credibility.** Show no partner, bank, insurer or SAPS logo unless that organisation has agreed in writing. "In conversation with" is also a claim; hold it until a meeting has happened and is recorded.
- **Simulated is labelled.** Screenshots of `sim_bank` or test journeys carry the word SIMULATED.
- **No personal data in demos.** Use only `sim_` subjects. No real names, phone numbers or locations.

## 5 · Build suggestions (Lethabo decides)

- **Where it lives.** A separate repository for the company site, kept apart from this product repository, so company pages don't go through VUKA's review rules and a site edit can't touch the app. Create it under a **company-owned** GitHub organisation, and hold the domain, hosting and email in the company's name too. Today every VUKA account sits on a personal one (D10 in [`README.md`](README.md)).
- **Hosting.** GitHub Pages works and the ledger already uses it (`.github/workflows/ledger-pages.yml`). Its terms bar using it to run an online business or commercial software service, and it carries no uptime guarantee ([`04-SLA.md`](04-SLA.md) §4.2). A brochure site is a grey area. Azure Static Web Apps **Standard**, on the company subscription from D9, is the cleaner choice: it carries a 99.95% SLA (`FACT`, Microsoft SLA, 1 Oct 2026) for about US$9 a month (`ASSUMPTION`). The Free plan carries no SLA.
- **Domain.** Check `pilotcore.co.za` (or a close variant) with a ZA Central Registry–accredited registrar. A company domain also gives the partner email address that bank procurement expects.
- **Stack.** Plain static HTML and CSS is enough, and it loads on a budget 2–3 GB Android phone on bad signal (gate 2 in `docs/MASTER-CONTEXT.md` §10). The ledger's vendored Inter fonts and colour tokens (`dashboard/ledger/`) can make the company and product look like one family.
- **Accessibility.** WCAG 2.2 AA contrast, real headings, alt text, and readable without JavaScript.
- **No third-party trackers or analytics** unless a cookie choice is added first.

## 6 · Suggested timing

| Milestone | Proposed date |
|---|---|
| Domain and partner email chosen | end of October 2026 |
| First version live (Home, VUKA, Company, Contact, privacy notice) | before **21 Nov 2026**, when YouthX winners are announced (`REPORTED`, Hype Magazine coverage of the call for entries, https://hypemagazine.co.za/?p=119155) |
| "For partners" and "Trust and privacy" pages | with the first insurer or bank conversation (`01-B2B-ENTERPRISE.md` §6) |

## 7 · Done means

- [ ] The registered name and number match the CIPC certificate.
- [ ] Every claim on the site traces to §2 of this brief or to `docs/EVIDENCE.md`.
- [ ] Sibusiso has reviewed the copy against `docs/MASTER-CONTEXT.md` §6.
- [ ] It works on a budget Android phone over a slow connection.
- [ ] The privacy notice is published, and no tracker loads.
