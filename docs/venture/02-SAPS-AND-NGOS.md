# 2 · SAPS and South African NGOs: who to approach, in what order, and for what

> **E-Hub insight 2 (15 Oct 2026):** *"We might need to approach SAPS, and get backing from South African NGOs that align to VUKA."*
> **Status:** `PROPOSED`. **No organisation has been contacted for this plan, and none has endorsed VUKA.**
> **About the sources:** the web research ran on 18 Oct 2026 from a cloud session that couldn't open pages directly. Every web claim below comes from a search extract of the named page, so it is tagged `REPORTED`, even when the source is official. A person must open the SAPS and Parliament documents before any figure here reaches a pitch, and must open and test-dial any phone number before it reaches the app.
> Serves B and S, and community impact for the judges' pitch.

---

## 1 · What VUKA can honestly offer, and what it can't

Every conversation starts here. Over-promising to police or to survivors' organisations does lasting damage.

| VUKA is designed to | VUKA does not |
|---|---|
| Notice possible duress on the member's phone and ask a discreet check-in | Dispatch police, security or anyone else (no autonomous dispatch, `RULES.md`; escalation goes to guardians only, ADR-0036) |
| Alert the guardians the member chose, who are told **"Don't call or text them. Call 10111."** (spec G4) | Make police arrive faster. Its intended value is that **guardians learn sooner**, which is not yet measured |
| Keep a signed record whose timing a stranger can check (**when, not what**), anchored on Hedera **testnet** today | Prove that duress happened, or identify an attacker |
| Let the member export their own record | Push anything to SAPS, or hand member data to police without the member's own export or a logged lawful order |

**State today, printed under the table:**
- App and server code are both on `main` (server since 18 Oct, #131).
- There has been **no company server since 15 Oct** ([`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §0).
- Guardians receive alerts only while their own app is open (no push yet).
- Anchoring runs on Hedera testnet.
- **The absence of a VUKA record is never evidence against anyone.**

**Don't hand this table out at meetings until D9 and real push have shipped.**

**Why "Call 10111" deserves a second look** (`REPORTED`, parliamentary reply CW502, 8 Jul 2026, https://static.pmg.org.za/RCW502-2026-07-08.pdf):
- **Response time:** the reply gives 10111's national average response time to "Alpha" complaints as **28:30**, as at 30 Apr 2026. Quote it as given until someone reads the PDF.
- **Calls not responded to:** **2,008,711 emergency calls** were recorded as "not responded to" in 2025/26. A separate 7,403,552 were "not handled or dispatched". Check what each term means in the PDF.
- **Danger from police:** sometimes the danger is a police officer. About 95–97 SAPS members were accused of rape or sexual violence in 2024/25, a figure reported to the Gauteng Legislature; whether it covers Gauteng or the whole country is unconfirmed (EWN, 22 Feb 2026). A Hawks officer was arrested on 22 Sep 2026 on charges of alleged kidnapping and extortion.

**Proposed change to spec G4** (`PROPOSED`; both founders decide, after a GBV organisation reviews it):
- Keep **"Call 10111" as the single lead action** on the guardian's alert.
- Under it, add a separate, clearly labelled block: **"Support and advice lines (they do not send help)"**. It would list the GBV Command Centre (0800 428 428), the TEARS Foundation's USSD line (`*134*7355#`), and Campus Protection when the member is on campus.
- During a kidnapping in progress, a guardian must never be steered to a counselling line instead of emergency response.
- Before any number ships, a person opens the official page and test-dials it.

## 2 · Order of approach

The research keeps SAPS last and puts the warm doors first: **CPSI debrief → Wits → GBV organisations' design reviews → the local SAPS station (Q1 2027)**, with industry bodies alongside the bank track.

1. **CPSI now, for a debrief only.** The Centre for Public Service Innovation co-hosted the Geekulcha hackathon (`FACT`, `docs/MASTER-CONTEXT.md` §1), and its mandate includes replicating innovations across the public sector. It is the only warm government door.
   - Ask which SAPS or Civilian Secretariat innovation contact to approach, when, and with what evidence.
   - Its innovation awards required a year of running in the public sector under the 2014 rules (`REPORTED`). VUKA is probably not eligible yet (`ASSUMPTION`); ask for the current rules at the debrief.
2. **Wits, as the first pilot community, alongside what it already runs.**
   - Wits already has the **mySOS** panic button, routed to Campus Protection Services. UCT has used **Kwanele** since 2023, and Gauteng runs an **e-Panic Button** (all `REPORTED`; their current status should be checked).
   - VUKA should complement these by covering coercion where a button can't be pressed, never replace them.
   - Wits students protested over how GBV was handled in Nov 2025 (`REPORTED`). So a pilot goes through the Gender Equity Office and student bodies, is survivor-led, and is **never marketed on the back of those protests**.
3. **GBV organisations, for design reviews, between 1 and 24 Nov 2026.** That is before the **16 Days of Activism (25 Nov–10 Dec)**, when their staff are busiest. Ask for review, not endorsement, and offer something in return for staff time.
4. **SAPS later, at police-station level first.**
   - **Precedents** (`REPORTED`): Namola signed with Brooklyn SAPS (2017), and Claremont police publicly welcomed UCT's Kwanele (a "thumbs-up", community newspaper). Industry bodies already hold MoUs with SAPS: BACSA since 2018, SABRIC since 2001.
   - **Timing** (`REPORTED`): the National Commissioner was acting as of Apr 2026, and the Police Minister post was reported as acting. Neither is confirmed for Oct 2026, and no source was found for the Minister. Local government elections are on **4 Nov 2026**. The Madlanga Commission's final report is due **16 Nov 2026**.
   - A national approach before Q1 2027 is likely to stall (`ASSUMPTION`).
5. **Industry bodies alongside the bank track** ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md) §5): SABRIC and BACSA.

## 3 · Ranked stakeholder map

All `REPORTED` unless tagged. One specific ask each.

| Rank | Who | Why | The ask | Not yet |
|---|---|---|---|---|
| 1 | **CPSI** | Hackathon co-host (`FACT`); public-sector innovation mandate | A 30-minute debrief: which SAPS or Secretariat contact, when, and what evidence | Endorsement; an awards entry |
| 2 | **Wits**: Campus Protection Services, the Gender Equity Office, the E-Hub | The community that saw VUKA live (15 Oct); mySOS already in place; a route to TIA seed funding (Wits–TIA news, Aug 2026) | **Campus Protection:** should the guardian alert carry the campus number as well as 10111? **The Gender Equity Office:** review the duress path and the "abuser is a guardian" case. **The E-Hub:** a protocol and ethics route for a consenting closed beta | A wide roll-out; any data feed to Campus Protection |
| 3 | **TEARS Foundation** | GBV specialist; a data-free directory with MoyaApp (Nov 2025); writes about technology used against women | A design review of the duress wording and the guardian alert; permission to list its USSD line under "support and advice lines" | Survivor testers before a safeguarding protocol exists |
| 4 | **Sonke Gender Justice** | Part of the GenG coalition that launched the zero-rated GenG Engage app, designed with users (4 Apr 2025); works with men and boys | A review of how VUKA could be misused when the abuser is a guardian | Co-branding |
| 5 | **Rape Crisis Cape Town Trust** | Survivor-centred practice; ran an app-based information portal before (Mxit, 2013) | A review of the consent wording and the help screen | A Western Cape pilot |
| 6 | **ISS Africa** | The source of VUKA's headline kidnapping figure (`FACT`, `docs/EVIDENCE.md`); runs the Violence Prevention Forum | A critical read of the honesty ledger and the kidnapping figures (ransom versus robbery-linked) | A quote for marketing |
| 7 | **Kwanele** (peer, possible competitor) | Deployed at UCT (2023) and worked with the NPA; was pursuing a SAPS MoU in 2024 (signature not confirmed; 2025–26 status unknown) | A call to learn; whether the two apps could work together on a campus | Competing for the same campus |
| 8 | **SABRIC, BACSA** | Written agreements with SAPS; express kidnapping and banking crime | **SABRIC:** could a timestamped duress signal support a customer's fraud dispute? (Not proof of duress; the absence of a VUKA record is never evidence against a customer.) **BACSA:** what its Eyes and Ears network expects of members | A dispatch feed (VUKA does not dispatch) |
| 9 | **Civilian Secretariat for Police Service**; the Safer Spaces portal | The policy door; trains Community Policing Forums | A knowledge-sharing entry; guidance on what SAPS may lawfully accept from a private app | An MoU |
| 10 | **The SAPS station and Community Policing Forum at the pilot site** (Q1 2027) | The Namola–Brooklyn and Kwanele–Claremont precedents | Feedback on the guardian instruction, and on what an investigator needs from a record the member exports, shown with a `sim_` record only | Any data flow |
| 11 | LifeLine SA, POWA, Women for Change, Action Society | Review, referral or amplification. Action Society has an adversarial history with SAPS: a critical reader, not a public partner | One specific review each | Public endorsement |
| 12 | Gauteng e-Gov (e-Panic Button), Higher Health, the National Council on GBVF | Scale, after the beta. GBVF was classified a national disaster under s23 of the Disaster Management Act on 21 Nov 2025, and the Council was appointed on 31 Jul 2026 | Interoperability and procurement conversations | — |
| 13 | **SAPS provincial and national**: the Gauteng kidnapping and extortion unit (set up Mar 2026), Crime Intelligence's anti-kidnapping team, Visible Policing / 10111 | Only after the Madlanga report, with beta evidence, introduced through CPSI, the Secretariat or BACSA | Feedback on the guardian instruction and the record format | Integration with 10111 or command centres |

**Referral destinations, not partners:** the GBV Command Centre and the 66 Thuthuzela Care Centres. The Command Centre was relaunched in Dec 2024, and its geolocation feature is reportedly waiting on Information Regulator approval: a sign of how closely the Regulator watches location data in GBV services.

**Moved down:** Missing Children South Africa focuses on missing persons and children, a weak fit for adult express kidnapping. Ask it only for first-hour guidance for families.

## 4 · Risks, and the rules that answer them

- **Sharing data with police.**
  - SAPS itself was found in breach of POPIA over leaked details of the Krugersdorp rape victims, with an enforcement notice in Apr 2023 (`REPORTED`).
  - Information about alleged criminal behaviour is special personal information (POPIA s26). The Regulator's guidance note says processing it on behalf of third parties needs **prior authorisation** under s57 (`REPORTED`, guidance note, Mar 2021).
  - **Rule:** data reaches police only by the member's own export or a logged lawful order. VUKA pushes nothing to SAPS.
  - Whether an exported record counts as "criminal behaviour" information is a question for a privacy lawyer. That is a human gate.
- **What an export reveals.** Today a shared export also shows an earlier, closed incident's duress result to whoever receives it (build-state audit, item c10). Until export contents are scoped, show police and banks **only a `sim_` record**, never a real or realistic one.
- **When the abuser is a guardian, or police.** ADR-0036 specifies:
  - guardian removal that is silent to the removed guardian and takes effect after 24 hours;
  - a decoy guardian under duress.

  This is on `main` since 18 Oct (#131) but not deployed, and the remaining guardians are told who was removed. GBV organisations should review this scenario first.
- **Mandatory reporting.** Since 14 Apr 2023, Domestic Violence Act s2B has required any adult who knows of or suspects domestic violence against a child, a person with a disability or an older person to report it (`REPORTED`). Guardian onboarding may need to say so. Activists warn that this can override women's autonomy, so it needs legal review before any wording ships.
- **Endorsement and contact conditions.**
  - No "endorsed by", "backed by" or "in partnership with" until the organisation says so in writing.
  - No testing with survivors without the organisation's own safeguarding protocol and informed consent.
  - `sim_` labels on anything that isn't a real alert path.
  - **Crisis lines are for the help screen only.** Never call or message them for outreach; use organisation-level routes ([`research/2026-10-18-web-saps-ngo.md`](research/2026-10-18-web-saps-ngo.md) §3).
- **Overlap with incumbents.** mySOS, Kwanele (2023 source), Gauteng's e-Panic Button, Namola (2017 source) and MySAPS (2019 source) all exist or have existed; check each one's current state. VUKA's one distinctive point: **it notices possible duress when no button can be pressed**. Any wider comparison is an `ASSUMPTION` until checked. Never copy claims about legal admissibility made elsewhere.

## 5 · What to bring to each meeting

- The two-minute judges' pitch ([`05-TWO-PITCHES.md`](05-TWO-PITCHES.md)), told as community impact.
- A phone with VIGIL in **SIMULATED** mode, and the public verify page once the server is back ([`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §0).
- The table in §1, with its "state today" lines, once D9 and real push have shipped.
- One specific ask from §3.
- **Afterwards,** a short record in `docs/build-log/entries/`: the organisation, the date and what was agreed. **The repository is public:** no individual's name or attributed quote without that person's written consent, and no contact details.

## 6 · Owners and timing (proposed)

| By | What | Owner |
|---|---|---|
| 31 Oct 2026 | CPSI debrief requested; introductions to Wits Campus Protection, the Gender Equity Office and the E-Hub | Sibusiso (CPSI), Lethabo (Wits) |
| 1–24 Nov 2026 | Design reviews with two of TEARS, Sonke and Rape Crisis; ISS critical read; Kwanele peer call | Lethabo (GBV), Sibusiso (ISS) |
| Dec 2026 | Closed-beta protocol and ethics process agreed with Wits. **The beta starts only after this** ([`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §5). SABRIC and BACSA alongside the bank track | both |
| Q1 2027 | Civilian Secretariat; the local station and Community Policing Forum at the pilot site; formal CPSI introduction request, with beta results | Sibusiso |
| Q2 2027 onward | SAPS provincial, through formal channels; Gauteng e-Gov; the National Council on GBVF | both |

## 7 · Sources

All `REPORTED`, via search extracts, 18 Oct 2026. Full URLs are in [`research/2026-10-18-web-saps-ngo.md`](research/2026-10-18-web-saps-ngo.md).

| Topic | Sources |
|---|---|
| 10111 figures | Parliamentary reply CW502 |
| SAPS members accused | EWN, 22 Feb 2026 |
| Hawks arrest | Briefly |
| Leadership and the Madlanga timetable | IOL 23 Apr and 9 Jul 2026; Briefly |
| Gauteng unit | EWN, 7 Mar 2026; SAnews node 80044 |
| BACSA | PMG NW2355; Engineering News, 29 Sep 2025 |
| SABRIC MoU | SAnews node 34731 |
| Namola and Brooklyn SAPS | ITWeb |
| Claremont and Kwanele | Nova News |
| Kwanele MoU status | Wits Vuvuzela, 23 May 2024 |
| Kwanele at UCT | UCT News, 2 Nov 2023 |
| mySOS | wits.ac.za/mywits/mysos |
| Wits protests | Wits news, 13 Nov 2025; TimesLive, 14 Nov 2025 |
| Wits and TIA | Wits news, Aug 2026 |
| Gauteng e-Panic Button | Gauteng government, 2 Dec 2024 |
| TEARS and MoyaApp | Bizcommunity |
| GenG Engage | genderjustice.org.za |
| Rape Crisis portal | IOL (Mxit) |
| GBV Command Centre, National Council, national-disaster classification | SAnews nodes 72527 and 83277; EWN, 21 Nov 2025 |
| Thuthuzela Care Centres | NPA node 2389 |
| SAPS and the Information Regulator | Werksmans |
| Prior authorisation (s57) | Information Regulator guidance note on special personal information |
| Domestic Violence Act s2B, and activists' concerns | acts.co.za; GroundUp |
| CPSI | Treasury AENE 2025, Vote 11a; SAnews node 22345 (2014 rules) |

**Kidnapping figures:** keep quoting **17,061 (2023/24)** (`FACT`, `docs/EVIDENCE.md`). Quarterly figures for 2025/26 and 2026/27 have been reported, but the sources conflict on Q1 2026/27 (4,638 against 4,251). They stay out of pitches until someone reads the SAPS PDFs.
