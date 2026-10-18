# Insight 2 evidence base: SAPS, public bodies, NGOs and a campus pilot

**As of:** 18 Oct 2026 · **Status:** research only. Nothing in the repo was edited and no organisation was contacted. **Serves:** B and S (as in `docs/venture/02-SAPS-AND-NGOS.md`), plus the judges' community-impact question.

**"Would a real user trust and use this?"** Users trust a safety app when the people they already trust have checked its wording and data handling. Here that means GBV organisations and campus safety staff. A police logo alone does not earn that trust. This report sets the order of approach on that basis.

**Method and limits (read first).** I could not open any page directly:
- WebFetch failed with DNS `ENOTFOUND` on every domain I tried (saps.gov.za, sanews.gov.za, pmg.org.za, issafrica.org, businesstech.co.za).
- `curl` got a 403 from the egress proxy.

So every web claim below comes from search-engine extracts of the named URL. Tagging follows from that:
- **`REPORTED`**: any web claim I could not open myself, even when the source is official (SAPS, Parliament, Treasury, the Presidency).
- **`FACT`**: only where the repo already holds a verified FACT; I cite the repo line.
- **`ESTIMATE`**: my own arithmetic.
- **`ASSUMPTION` / `PROPOSED`**: as the house rules define them.

Contact routes are organisation-level only. Crisis lines are listed so VUKA's help screen can point to them. **They must never be used for partnership outreach** (`PROPOSED` rule).

---

## 0 · Bottom line

1. **Go to a SAPS police station before SAPS national office, and do it later than the NGO and campus work.** Private safety tech has reached SAPS in three ways, and none needed a national deal with a small startup:
   - a single police station's agreement (Namola with Brooklyn SAPS, 5 Feb 2017);
   - industry bodies that already hold a written agreement (an MoU) with SAPS: BACSA since 15 Aug 2018, SABRIC since 2001, renewed 2015;
   - a SAPS-branded app built by a vendor (MySAPS by Vodacom, Oct 2019).

   SAPS leadership is also unsettled:
   - The National Commissioner has been on precautionary suspension since Apr 2026 (acting: Dimpane), and the Police Minister post is held on an acting basis (Cachalia).
   - The Madlanga Commission's final report is due **16 Nov 2026**.
   - Local government elections are on **4 Nov 2026**.

   A national SAPS approach before Q1 2027 is badly timed (`REPORTED` facts; the conclusion is an `ASSUMPTION`).
2. **CPSI is the only warm government door, and it is open now.** It co-hosted the hackathon (`FACT`, `docs/MASTER-CONTEXT.md:16`), and its mandate includes replicating innovations across the public sector. A debrief now costs little. The formal ask for an introduction should wait for beta evidence.
3. **The campus pilot is not on empty ground.**
   - Wits already runs the **mySOS** panic button, routed to Campus Protection Services.
   - UCT runs **Kwanele**.
   - Gauteng runs the **e-Panic Button**.

   VUKA must be positioned as covering coercion where a button can't be pressed, and as complementing what Campus Protection already runs. It should not replace it.
4. **The guardian instruction "Call 10111" needs two qualifiers, each backed by public evidence:**
   - **10111 is slow and overloaded.** Parliament heard that Alpha-priority calls averaged 28:30 to respond (as at 30 Apr 2026), and that 2,008,711 emergency calls went unanswered in 2025/26 (`REPORTED`).
   - **Sometimes the abuser is police.** About 95–97 SAPS members were accused of rape or sexual violence in 2024/25, and a Hawks officer was arrested for kidnapping and extortion on 22 Sep 2026 (`REPORTED`).

   VUKA must never imply faster police response. It should also offer non-police routes, and on campus the Campus Protection number.
5. **Ask GBV NGOs for a design review first, and get there before the 16 Days of Activism (25 Nov–10 Dec)** while their staff have capacity. Ask for endorsement later, if at all, in writing and on the NGO's terms.

---

## 1 · SAPS

### 1.1 Units and programmes

| Unit / programme | What the sources say | Source (date) | Tag | Fit with VUKA |
|---|---|---|---|---|
| Crime Intelligence **National Anti-Kidnapping Task Team** | Set up Nov 2021 after a rise in ransom kidnappings. A 2025 briefing (Maj-Gen Feroz Khan) cited 437 arrests, 68 convictions and 182 firearms over four years. It was Crime Intelligence Team of the Year at the 8th SAPS Excellence Awards. SAPS said in Apr 2026 that it had arrested more than 170 ransom kidnappers over two years. | sabcnews.com/sabcnews/?p=728023 (attribution of the 2025 figures is uncertain); [Daily Maverick 2 Feb 2023](https://www.dailymaverick.co.za/article/2023-02-02-anti-kidnapping-units-tireless-work-earns-national-award); [Daily Maverick 19 Apr 2026](https://www.dailymaverick.co.za/article/2026-04-19-express-kidnappings-skyrocket-steven-gruzd-murder-raises-alarm-over-increase-in-abductions.md) | `REPORTED` | Its focus is **ransom** kidnapping, which is under 5% of kidnappings (`FACT`, `docs/EVIDENCE.md:15`). VUKA's core harm is robbery-linked and express kidnapping. The team is secretive and not a door for a startup. |
| **Gauteng specialised unit** for kidnapping, extortion and infrastructure crime | Set up early Mar 2026; the Police Ministry says it is operational. | [SAnews node 80044](https://www.sanews.gov.za/index.ph%70/node/80044); [EWN 7 Mar 2026](https://www.ewn.co.za/2026/03/07/lesufi-welcomes-establishment-of-two-saps-units-aimed-at-tacking-high-priority-crime-threats) | `REPORTED` | Gauteng has more than half of national kidnappings. This is the provincial counterpart for later. |
| **FCS units** (Family Violence, Child Protection and Sexual Offences) | 176 units under the Detective Service. SAPS told Parliament that every station has a GBV desk, but a Gauteng report counts only 134. About 1,161 victim-friendly rooms. R50m GBVF budget for 2024/25. | [PMG NW604](https://pmg.org.za/committee-question/29721/); [Durban Local 3 Dec 2024](https://durbanlocal.co.za/news/2024-12-03-saps-urged-to-establish-gbv-desks-at-all-police-stations/) | `REPORTED` | This is where a member's **own exported record** would land in a GBV case. |
| **DPCI (Hawks)** | A joint Hawks–SAPS kidnapping task team was reported in 2018. A Hawks cyber-crime officer was arrested on 22 Sep 2026 on kidnapping and extortion charges. | [PressReader / Sunday Times 29 Apr 2018](https://www.pressreader.com/south-africa/sunday-times-1107/20180429/281543701539326); [Briefly](https://briefly.co.za/south-africa/254164-hawks-officer-arrested-alleged-kidnappings-extortion-gqeberha-south-africans-frustrated/) | `REPORTED` | Mainly relevant as a risk (§5). |
| **10111** (Visible Policing) | 19 centres, open 24/7. National average response times as at 30 Apr 2026: **Alpha 28:30**, Bravo 25:45, Charlie 24:34. In 2025/26, **2,008,711 emergency calls were not responded to** and 7,403,552 were not handled or dispatched. | [PMG reply CW502, 8 Jul 2026](https://static.pmg.org.za/RCW502-2026-07-08.pdf); [PMG Q40584](https://pmg.org.za/committee-question/40584/) | `REPORTED` | Guardians are told to call 10111. VUKA's honest value is that **guardians learn sooner**, not that police arrive faster. |

Gap: I found no SAPS unit dedicated to hijacking. On hijacking, the repo holds two FACTs: 44% of kidnappings happened during a hijacking (2023/24), and carjacking fell 18.2% in Apr–Jun 2026 (`docs/EVIDENCE.md:15-16`).

### 1.2 SAPS's own digital channels

- **MySAPS app** (SAPS with Vodacom, launched Oct 2019). It offers anonymous tip-offs with a reference number, a police-station finder, emergency messages and photo, audio and video capture. Feature phones can use USSD `*134*10111#`. A case must still be opened at a police station. Sources: [BusinessTech](https://businesstech.co.za/news/lifestyle/349001/south-african-police-service-and-vodacom-launch-new-crime-fighting-app/), [News24 25 Oct 2019](https://www.news24.com/southafrica/news/first-for-africa-saps-launches-app-to-turn-tide-against-crime-20191025). `REPORTED`; current features are not confirmed.
- **Crime Stop, 08600 10111.** An anonymous tip line that cannot trace callers. Source: [Vuk'uzenzele](https://www.vukuzenzele.gov.za/report-crime-through-crime-stop-hotline). `REPORTED`.
- **AMBER Alert with Facebook** (Jan 2020). Covers children under 18; a senior SAPS officer must authorise each alert. Source: [TimesLive 30 Jan 2020](https://www.timeslive.co.za/news/south-africa/2020-01-30-facebook-app-will-partner-police-and-public-to-help-find-missing-children/). `REPORTED`; current status unknown.
- **What this means for VUKA:** point members to MySAPS or Crime Stop for tip-offs rather than building a parallel channel. MySAPS also shows that SAPS will put its brand on vendor-built tech (`ASSUMPTION` about how far that extends).

### 1.3 How SAPS partners with private tech

- **BACSA** (Business Against Crime South Africa):
  - MoU with SAPS signed **15 Aug 2018** ([PMG NW2355](https://pmg.org.za/committee-question/30227/)).
  - Its **Eyes and Ears (E2)** network links more than 470 vetted private security companies and more than 18,000 number-plate (ANPR) cameras to SAPS command centres. It reported 2,581 arrests in the year to Aug 2025 ([Engineering News 29 Sep 2025](https://www.engineeringnews.co.za/article/bacsas-eyes-and-ears-initiative-drives-2-581-arrests-over-the-past-year-2025-09-29)).
  - Its extortion programme had 437 screened participants in late 2025 ([ProtectionWeb, Dec 2025](https://www.protectionweb.co.za/industry/business-against-crime-south-africa-a-unified-front-against-extortion/)).
  - The minister said in Dec 2025 that SAPS wants to "breathe life into the partnership" ([ProtectionWeb](https://www.protectionweb.co.za/civil-security/police-minister-urges-stronger-police-business-alliance-in-battle-against-crime/)).
  - All `REPORTED`.
- **SABRIC:** MoU with SAPS first agreed in 2001 and renewed in 2015, covering bank-related crime and intelligence sharing ([SAnews node 34731](https://www.sanews.gov.za/node/34731)). `REPORTED`.
- **Police-station precedents:**
  - Namola and Brooklyn SAPS signed an agreement on 5 Feb 2017 ([ITWeb](https://www.itweb.co.za/article/namola-partners-with-brooklyn-police/VKA3WwqdDYWqrydZ)).
  - Claremont police gave UCT's Kwanele app a "thumbs-up" ([Nova News](https://novanews.co.za/peoplespost/?p=47977)).
  - Kwanele was working toward an MoU with SAPS in 2024; I found no evidence it was signed ([Wits Vuvuzela 23 May 2024](https://witsvuvuzela.com/2024/05/23/gbv-panic-button-an-app-that-saves-lives/)).
  - All `REPORTED`.
- **Policy signal:** in the July 2025 budget vote, SAPS said it would "integrate SAPS systems with private sector technologies" ([IOL 4 Jul 2025](https://iol.co.za/news/politics/2025-07-04-saps-budget-2025-mchunu-targets-gbv-corruption-and-high-crime-zones-with-r120-billion-plan/)). `REPORTED`.

### 1.4 Leadership context

- **National Commissioner:** Masemola was placed on precautionary suspension in Apr 2026, and Dimpane is acting ([IOL 23 Apr 2026](https://iol.co.za/news/south-africa/2026-04-23-saps-in-crisis-ramaphosa-suspends-masemola-appoints-dimpane-as-acting-police-commissioner-amid-mounting-scandals/)).
- **Police Minister:** Cachalia is acting.
- **Madlanga Commission:** the deadline for evidence was 2 Oct 2026, and the final report is due **16 Nov 2026** ([IOL 9 Jul 2026](https://iol.co.za/saturday-star/news/2026-07-09-the-madlanga-commission-isnt-done-yet-ramaphosa-has-now-extended-its-deadline/)). Public hearings are paused until **9 Nov**, after the **4 Nov** local government elections ([Briefly](https://briefly.co.za/south-africa/254771-madlanga-commission-pauses-public-hearings-9-november-local-government-elections/)).
- All `REPORTED`. I found nothing from October 2026 confirming that the acting posts are unchanged.

### 1.5 Kidnapping statistics (latest)

| Period | National | Gauteng | Source | Tag |
|---|---|---|---|---|
| FY2023/24 | **17,061** (up 264% since 2014/15; 44% during a hijacking; under 5% linked to ransom, trafficking or extortion) | — | ISS, 3 Dec 2024, citing SAPS (`docs/EVIDENCE.md:15`) | `FACT` |
| FY2024/25, full year | **Not confirmed.** One blog says 16,901. | — | [ModernGhana blog](https://www.modernghana.com/blogs/1527748/south-africas-kidnapping-crisis-when-did-ordinar.amp) | `REPORTED` (weak). Needs a human reading of the SAPS 2024/25 annual report PDF already linked at `docs/EVIDENCE.md:17`. |
| Q2 2024/25 (Jul–Sep 2024) | 3,995, of which **185 involved ransom** | — | [PMG meeting 39978](https://pmg.org.za/committee-meeting/39978/) | `REPORTED` |
| Q4 2024/25 (Jan–Mar 2025) | Up **11.1%** (Mchunu) **or** 6.8% (IOL); the two conflict | — | [IOL 10 Jun 2025](https://iol.co.za/news/crime-and-courts/2025-06-10-kidnapping-capital-of-south-africa-how-can-gauteng-combat-its-worrying-kidnapping-crisis/) | `REPORTED` |
| FY2025/26 by quarter | Q1 4,466 · Q2 4,772 · Q3 4,775 · Q4 **4,478** (−2% year on year). Ransom kidnappings by quarter: 209 (+54.8%), 224, 208, 216. | Q4: 2,414 → **2,452**, 54.8% of the national total, about 27 a day; 163 ransom cases, over 75% of the national ransom total | [BusinessTech 873160](https://businesstech.co.za/news/government/873160/disturbing-crime-trend-targeting-people-in-south-africas-richest-province/); [DA Gauteng, May 2026](https://dagauteng.org.za/2026/05/gauteng-remains-south-africas-kidnapping-capital-with-27-incidents-a-day); [IOL 9 Jun 2026](https://iol.co.za/news/crime-and-courts/2026-06-09-gautengs-crime-statistics-a-decline-in-serious-crimes-but-a-rise-in-kidnappings/) | `REPORTED`. The Q4 figures were released by the Acting Minister on 22 May 2026. |
| FY2025/26, sum of quarters | about **18,491** in total; **857** ransom | — | My sum of the quarters above | `ESTIMATE`. This is not an official annual figure. |
| Jan–Mar 2026, Johannesburg district | 971 (40% of Gauteng). SAPS counts forced ATM withdrawals and app transfers as kidnapping. | — | [AllAfrica, Jun 2026](https://allafrica.com/stories/202606030620.html) | `REPORTED` |
| **Q1 2026/27 (Apr–Jun 2026)** | **4,638**, up 172 (+3.9%) | **2,367**. Kempton Park 76, up from 48 (+58.3%), the highest precinct in Gauteng. | [SAnews node 84435](https://www.sanews.gov.za/node/84435); [The Post 29 Aug 2026](https://thepost.co.za/news/crime-and-courts/2026-08-29-kidnapping-rise-to-over-4600-as-gauteng-records-highest-total/) | `REPORTED`. BusinessTech gives **4,251**, which conflicts. The Q1 2025/26 figure of 4,466 equals 4,638 − 172, so the two sources agree internally. |

---

## 2 · Public-sector doors

| Body | What it is and does | Source (date) | Tag | Fit and ask |
|---|---|---|---|---|
| **CPSI** (Centre for Public Service Innovation) | Co-hosted the Geekulcha hackathon. Its functions include replicating innovative solutions: the 2025/26 target was 4, and 0 had been achieved by Sep 2025. Budget about R51.2m (adjusted). Its **Public Sector Innovation Awards** closed for entries on 19 Sep 2025. Older rules let private entrants in only if the innovation is **implemented in the public sector and has run for at least one year**. | `docs/MASTER-CONTEXT.md:16` (`FACT`); [Treasury AENE 2025, Vote 11a](https://www.treasury.gov.za/documents/mtbps/2025/aene/Vote%2011a%20Centre%20for%20Public%20Service%20Innovation.pdf); [cpsitest.syncrony.com](https://cpsitest.syncrony.com/); [SAnews node 22345 (2014 rules)](https://www.sanews.gov.za/node/22345) | `REPORTED` | **Warm door.** Ask for a debrief and advice on which SAPS or Civilian Secretariat innovation contact to approach, and when. VUKA is **not eligible for the awards yet**: it would need a public-sector deployment that has run for a year. |
| **Civilian Secretariat for Police Service** (CSPS) | Wrote the Integrated Crime and Violence Prevention Strategy (Cabinet-approved), which takes a "whole of society" approach and includes victim support and linking people to services. It trains Community Policing Forums (CPFs) and evaluates how well they work. It manages the **Safer Spaces** portal (saferspaces.org.za) with GIZ support. | [Vuk'uzenzele](https://www.vukuzenzele.gov.za/book/export/html/8282); [Treasury ENE 2026, Vote 21](https://www.treasury.gov.za/documents/national%20budget/2026/ene/Vote%2021%20Civilian%20Secretariat%20for%20the%20Police%20Service.pdf); [GIZ](https://www.giz.de/en/projects/violence-prevention-programme-tc-component) | `REPORTED` | The policy door. Ask for knowledge-sharing on Safer Spaces and guidance on what SAPS can lawfully take from a private app. |
| **GBV Command Centre** (Department of Social Development, DSD) | Lines: 0800 428 428, USSD `*120*7867#`, SMS 31531. **Relaunched in Dec 2024** after a provider failure. The SMS, USSD, web and WhatsApp channels were promised for Q1 2025, and I found no confirmation they were delivered. **Its geolocation is waiting on Information Regulator approval under POPIA.** | [SAnews node 72527](https://www.sanews.gov.za/node/72527); [ITWeb](https://itweb.co.za/article/govt-to-broaden-contact-options-for-national-gbv-command-centre/dgp45MaB16GqX9l8); [Daily Maverick 10 Dec 2024](https://www.dailymaverick.co.za/article/2024-12-10-gender-based-violence-helpline-cut.md) | `REPORTED` | A **referral destination** for VUKA's help screen, not a partner. Its geolocation delay is a warning about how closely the Regulator watches location data in GBV services. |
| **Thuthuzela Care Centres** (NPA) | **66** centres after Phuthaditjhaba opened in Apr 2025. The core team is NPA's Sexual Offences and Community Affairs Unit (SOCA) with Health, SAPS, DSD and NGOs. Public-private funding includes mining-company pledges of about R18.9m in 2025. | [NPA node 2389](https://www.npa.gov.za/node/2389); [TCC list PDF](https://www.justice.gov.za/vg/sxo/2025-TCC-List-NPA-30March2025.pdf); [Minerals Council TCC report 2025](https://www.mineralscouncil.org.za/womeninmining/wp-content/uploads/2026/08/Thuthuzela-Care-Centre-Annual-Report-2025.pdf) | `REPORTED` | A referral destination. Later, ask SOCA how an exported timing record should be handled. **No claims about evidential weight.** |
| **National Council on GBVF** | Seven members appointed on **31 Jul 2026** for 1 Aug 2026 to 31 Jul 2029, under Act 9 of 2024. It coordinates the National Strategic Plan and is linked to the **national-disaster classification of GBVF (21 Nov 2025)**, which requires all organs of state to carry out contingency measures. | [SAnews node 83277](https://www.sanews.gov.za/node/83277); [EWN 21 Nov 2025](https://www.ewn.co.za/2025/11/21/govt-officially-declares-gender-based-violence-and-femicide-a-national-disaster) | `REPORTED` | Strategic, for later (2027). Approach through NGO partners. |
| **GBVF Response Fund** | Private-sector led, launched Feb 2019. Early grants were R50k–R250k a year for community-based organisations (CBOs) and intermediaries. A grant-management partner call closed 14 Feb 2025 and required NPC/Trust registration. | [Vuk'uzenzele](https://www.vukuzenzele.gov.za/book/export/html/6448); [NGO Pulse](https://ngopulse.net/profiles/employers/gbvf-response-fund-575) | `REPORTED` | PILOT CORE (Pty) Ltd is **probably not eligible directly** (`ASSUMPTION`). The only route is funding that reaches an NGO partner. |
| **DSTI / TIA** | TIA's seed fund works **through implementing partners** such as university technology transfer offices and incubators, with no direct online application. Wits and TIA published "a shared innovation future" in Aug 2026; Wits has received over R20m in TIA seed support. The **TIA PreSeed 2026 call with Propella closed 16 Oct 2026.** | [TIA EOI PDF (Mar 2026)](https://www.tia.org.za/storage/2026/03/EOI-Seed-Fund-Implementing-partner-call.pdf); [Wits, Aug 2026](https://www.wits.ac.za/news/latest-news/research-news/2026/--2026-08/building-on-strength-tia-and-wits-chart-a-shared-innovation-future.html); [InnovationBridge](https://innovationbridge.info/ibportal/content/technology-innovation-agency-tia-seed-fund-programme) | `REPORTED` | Route funding questions through the Wits E-Hub or the Wits technology transfer office. I found no DSTI call specific to GBV or safety. |
| **Gauteng e-Gov / Community Safety: e-Panic Button** | Piloted Apr 2023 and launched May 2024. The app sends GPS location to the nearest responder, and **80,000+ physical buttons** were distributed, framed as a GBVF response. An Integrated Provincial Command Centre has been delayed. | [Gauteng gov, 2 Dec 2024](https://www.gauteng.gov.za/News/NewsDetails/%7B6beb7de0-145f-478f-9891-4477d0d49dc7%7D); [BusinessTech 773865](https://businesstech.co.za/news/trending/773865/gauteng-officially-launches-e-panic-button/) | `REPORTED` | A public **incumbent and possible later partner** in the province with most kidnappings. Do not pitch VUKA as a replacement. |
| **Higher Health** | National post-school health agency. 24-hour line 0800 36 36 36 in all official languages; refers students to TCCs and the NPA. | [higherhealth.ac.za](https://higherhealth.ac.za/gender-based-violence/) | `REPORTED` | The route to scale across campuses once one campus pilot exists. |

---

## 3 · NGOs and coalitions

| Organisation | Mission (as reported) | Partnership pattern | Tech or app precedent | Public route (organisation-level) | Fit | Tag |
|---|---|---|---|---|---|---|
| **TEARS Foundation** | GBV and sexual-abuse support; free USSD `*134*7355#` | Corporate and tech partnerships | **MoyaApp partnership, 24 Nov 2025**: data-free directory and GBV education ([Bizcommunity](https://www.bizcommunity.com/article/an-african-solution-for-an-african-crisis-tearsmoyaapp-partnership-174526a)). Has written on tech used against women ([tears.co.za ?p=8437](https://tears.co.za/?p=8437)). A link to an AVBOB app partnership was seen but not checked. | tears.co.za | **Highest.** Experienced with tech partners and alert to abuse through tech. | `REPORTED` |
| **Sonke Gender Justice** (with the **GenG** coalition: ActionAid SA, ACTIVATE!) | Gender justice; work with men and boys | Coalitions, policy reform; co-chairs the Mpumalanga GBVF Council (2025) | **GenG Engage app launched 4 Apr 2025**: zero-rated, designed with users, links survivors to services ([Sonke](https://genderjustice.org.za/geng-launches-innovative-mobile-app-to-combat-gender-based-violence-and-femicide-in-south-africa/)) | genderjustice.org.za | **High.** Can review the "abuser is the guardian" case and how VUKA should be designed with users. | `REPORTED` |
| **Rape Crisis Cape Town Trust** | Survivor support in English, Afrikaans and isiXhosa | Service partnerships | **Mxit Rape Information Portal (2013)** ([IOL](https://www.iol.co.za/news/mxits-new-app-joins-rape-battle-1562926)). WhatsApp service terms effective 31 Oct 2025. | rapecrisis.org.za | High for reviewing wording and consent | `REPORTED` |
| **POWA** (People Opposing Women Abuse) | Shelters in East and West Rand and Berea; counselling; legal desk | Corporate cause-marketing (L'Oréal); grants (Ford Foundation grant ended Sep 2025) | None found | powa.co.za (`ASSUMPTION`: not confirmed) | Medium. Short of funds; a Gauteng referral partner later. | `REPORTED` |
| **LifeLine SA** | 24-hour crisis counselling; national office plus affiliates | Corporate (SPAR since 2019, with the NPA); co-runs the Stop Gender Violence line 0800 150 150 | Helplines only | lifeline.org.za; 0861 322 322 (directory listing, unconfirmed) | Medium. Can review the guardian alert and help screen. | `REPORTED` |
| **Women for Change** | GBVF advocacy. Petition passed **1.1m signatures** (its own count); led the **Women's Shutdown on 21 Nov 2025**, the day GBVF was classified a national disaster | Mass mobilisation | None found | womenforchange.co.za | An amplifier with a political edge. Approach only after a design review. | `REPORTED` |
| **Action Society** | Civil-rights and community-safety NPO, Cape Town | Community projects (Lentegeur watch container, Oct 2024) | None found | actionsociety.co.za | **Has an adversarial history with SAPS** (complaints to the Public Protector). Its former safety director, Ian Cameron, is a DA MP who chaired Parliament's police committee. Use it as a critical reader, not a public partner. | `REPORTED` |
| **Missing Children South Africa** | NPO/PBO since Mar 2007; supports SAPS when anyone goes missing | **Close working relationship with SAPS**; national helpline | Not found | missingchildren.org.za | Medium-low. Its focus is missing persons and children, which is weak for adult express kidnapping. Ask for first-hour guidance for families. | `REPORTED` |
| **Community Policing Forums** | Statutory link between police stations and communities; CSPS trains them | Station-level patrols and information sharing with private security (Buffalo City 2026) | Not found | Through the police station in each area | **The route to the local SAPS station** at the pilot site | `REPORTED` |
| **BACSA** | Business–SAPS crime partnership | MoU since 2018; E2 network | E2 platform, ANPR | bac.org.za (`ASSUMPTION`) | The industry channel into SAPS; ties to insight 1 (B2B) | `REPORTED` |
| **SABRIC** | Bank-funded NPO; shares information on bank crime | MoU with SAPS (2001, renewed 2015); work with the Department of Justice | Data and reporting | banking.org.za | Banking Ombud practice: banks refund express-kidnapping losses case by case. Ties to the Nedbank track. | `REPORTED` |
| **ISS Africa** | Research on justice and violence prevention; **Crime Hub** (crimehub.org); runs the national **Violence Prevention Forum** (since 2015) | Funded research, multi-sector dialogue | None needed | issafrica.org | An honest data partner: it can give a critical read of VUKA's claims | `REPORTED` |
| **Safer Spaces** | National knowledge portal on violence prevention, run with CSPS and supported by GIZ | Practitioner network | Portal | saferspaces.org.za | A low-cost visibility channel | `REPORTED` |
| **Kwanele** (not on the brief, but essential) | GBV NPO founded 2020 or 2021 (sources differ); its app is used at **UCT since Oct 2023** | University deployments; NPA work; was pursuing an MoU with SAPS | Panic button, live chat, evidence vault | news.uct.ac.za | **Peer, precedent and possible competitor.** Learn from how it approached SAPS and the NPA. Never copy its claims about legal admissibility. | `REPORTED` |

---

## 4 · Campus as the first pilot community

- **Wits already has a panic button.** It uses **mySOS**: pressing the Wits button sends an alert and the member's location to Campus Protection Services ([wits.ac.za/mywits/mysos](https://www.wits.ac.za/mywits/mysos/)). A student paper reported a 3–5 minute response ([Wits Vuvuzela 29 Mar 2024](https://witsvuvuzela.com/2024/03/29/is-wits-doing-enough-to-keep-us-safe/)). The university also lists 24-hour escorts and security desks. `REPORTED`.
- **The Wits Gender Equity Office (GEO)** has handled gender-based harm since 2013. Its services are confidential and free, with in-person and online reporting. The Wits Students' Crisis Line is 0800 111 331.
- **Campus GBV is a live issue at Wits.** In **Nov 2025** there were protests over how GBV was handled, with 25 demands, and Wits responded on 13 Nov 2025 ([Wits](https://www.wits.ac.za/news/latest-news/general-news/2025/2025-11/response-to-students-on-gbh-matters.html); [TimesLive 14 Nov 2025](https://www.timeslive.co.za/news/south-africa/2025-11-14-students-protest-at-wits-over-handling-of-gbv/)). `REPORTED`.
- **Precedents at other universities:**
  - UCT with Kwanele, Oct–Nov 2023 ([UCT News](https://news.uct.ac.za/article/-2023-11-02-uct-gets-powerful-new-tool-to-combat-gender-based-violence)).
  - UP with the Hatfield City Improvement District panic app, at R100 a year, Jun 2024 ([UP](https://www.up.ac.za/news/post_3234651-safety-at-your-fingertips-)).
  - UKZN has a panic button in its own app (2019).

  All `REPORTED`.
- **Implications** (`PROPOSED`):
  1. Position VUKA as covering coercion where the member can't press a button, sending alerts to guardians and Campus Protection alongside mySOS. It is not a replacement for mySOS.
  2. Ask Campus Protection whether the guardian alert should give **the campus emergency number as well as 10111** when the member is on campus.
  3. Ask the GEO to review the duress path and the "abuser is the guardian" scenario before any student uses it.
  4. Get ethics clearance and a consent protocol (`ASSUMPTION`: a Wits ethics committee route applies).
  5. Treat the Nov 2025 protests as a reason to go through the GEO and SRC, and never to use them in marketing.
  6. Higher Health is the route to further campuses.

---

## 5 · Risks

1. **Sharing data with police (POPIA).**
   - **SAPS itself breached POPIA.** In the Krugersdorp case (2022), rape victims' details leaked from SAPS. The Information Regulator summonsed SAPS on 29 Aug 2022 and issued an **enforcement notice in Apr 2023**: notify the victims, publish an apology, investigate the officers, and train staff on POPIA ([Information Regulator media statement](https://inforegulator.org.za/wp-content/uploads/2020/07/MEDIA-STATEMENT_-REGULATOR-ISSUES-A-SUMMONS-AGAINST-SOUTH-AFRICAN-POLICE-SERVICE-.pdf); [Werksmans](https://werksmans.com/legal-updates-and-opinions/information-regulator-bites-enforcement-notice-issued-against-the-saps/)). `REPORTED`.
   - **Special personal information.** Information about "criminal behaviour" is special personal information under s26, and s57 may require the Regulator's prior authorisation ([Regulator guidance note](https://inforegulator.org.za/wp-content/uploads/2020/07/Revised-Guidance-Note-on-applications-for-Prior-Authorisation-adopted-by-Members-30-Jan14.pdf)). `REPORTED`.
   - **Practitioner reading:** a lawful demand (subpoena or warrant) is covered by s15(3)(c), but an investigator's informal phone request creates no obligation to disclose ([MJK Inc](https://mjkinc.co.za/popia/disclosures-to-saps-sars-regulators)). This is secondary commentary.
   - **POPIA s6** excludes criminal investigations only "where adequate safeguards have been established in legislation". Commentators say no such legislation exists, so POPIA applies to SAPS ([Michalsons](https://www.michalsons.com/blog/information-regulator-versus-saps-the-scalding-tea/59455)).
   - **Rule** (`PROPOSED`, consistent with the "does / does not" table in `02-SAPS-AND-NGOS.md`): data reaches police only when the member exports it, or under a lawful order that is logged. VUKA pushes nothing to SAPS. **A lawyer must decide** whether an exported record counts as "criminal behaviour" information. That is a human gate.
2. **The abuser is police, or a guardian.**
   - About 95–97 SAPS members were accused of rape or sexual violence in 2024/25, against 122 in 2022/23 ([EWN 22 Feb 2026](https://www.ewn.co.za/2026/02/22/gauteng-legislature-committee-shocked-that-97-cops-accused-of-sexual-violence-or-rape)).
   - At least seven police officers had been arrested in kidnapping cases by 2024 ([Daily Maverick 7 Sep 2024](https://www.dailymaverick.co.za/article/2024-09-07-africas-abduction-capital-harrowing-tales-of-kidnapping-syndicates-holding-sa-to-ransom.md)).
   - A Hawks officer was arrested on 22 Sep 2026.
   - All `REPORTED`.
   - `PROPOSED` design answers:
     - The guardian help screen should offer **non-police routes** as well as 10111: the GBV Command Centre, TEARS USSD, and Campus Protection on campus.
     - Removing a guardian stays silent (ADR-0036).
     - NGOs review this scenario first.
   - **Domestic Violence Act s2B (in force 14 Apr 2023).** Any adult who knows of or suspects domestic violence against a **child, a person with a disability or an older person** must report it to a social worker or SAPS; failing to do so is an offence ([Acts Online](https://www.acts.co.za/domestic-violence-act-199/2b__obligation_to_report_domes)). Guardian onboarding should say this (`PROPOSED`). Activists warned that mandatory reporting can override women's autonomy ([GroundUp](https://groundup.news/article/activists-raise-alarm-over-ammendments-domestic-violence-act/)). This needs legal review, which is a human gate.
3. **Conditions for any NGO endorsement** (`PROPOSED`):
   - Endorsement only in writing.
   - No "backed by" or "in partnership with" wording before that.
   - Test only under the NGO's own safeguarding protocol.
   - Respect that NGOs are under-resourced ([NWU](https://news.nwu.ac.za/digital-shadows-deadly-realities-technology-facilitated-femicide-south-africa)): offer something in return (`PROPOSED`), and avoid the **16 Days of Activism (25 Nov–10 Dec)** for asks.
   - Expect Kwanele's reported challenges (`REPORTED`): funding, access to devices, and users' **low trust in law enforcement**.
4. **Reputation.**
   - Action Society's adversarial stance and political ties could colour a later approach to SAPS.
   - Women for Change's campaigning is highly visible.
   - The Wits GBV protests (Nov 2025) mean any pilot must be survivor-led and must not be marketed on the back of them.
   - Overlap with incumbents (mySOS, Kwanele, Gauteng e-Panic, Namola, MySAPS) means each conversation must state plainly what VUKA does that they don't, using the language "notices possible duress", "guardians are told", and "proves when, not what".
5. **Timing.** SAPS leadership is in flux and the Madlanga report lands on 16 Nov 2026. A national SAPS ask now is likely to stall or be refused (`ASSUMPTION`).

---

## 6 · Ranked stakeholder map (`PROPOSED`)

| Rank | Who | Why first or now | The ask (one, specific) | What not to ask yet |
|---|---|---|---|---|
| 1 | **CPSI** | The only warm government relationship (hackathon co-host, `FACT`); its mandate is replicating public-sector innovation; low risk | A 30-minute debrief: which SAPS or CSPS innovation contact, when, and what evidence they would want to see | Endorsement; an awards entry (not eligible until there is a year of public-sector deployment) |
| 2 | **Wits**: Campus Protection Services, GEO and E-Hub | The demo community (15 Oct 2026); a bounded group that can consent; incumbent mySOS; route to TIA | Campus Protection: should the guardian alert carry the campus number as well as 10111? GEO: review the duress path and the abuser-as-guardian case. E-Hub: a protocol for a consenting closed beta. | Wide rollout; any data feed to Campus Protection |
| 3 | **TEARS Foundation** | GBV specialist with recent tech partnerships (MoyaApp, Nov 2025) that writes about tech used against women | A design review of duress wording and the guardian alert; permission to list `*134*7355#` on the help screen | Referral of survivor testers before a safeguarding protocol exists |
| 4 | **Sonke / GenG** | Built and launched an app with users (Apr 2025); works with men and boys; sits on a GBVF council | A review of how VUKA could be misused when the abuser is a guardian; lessons from zero-rating | Co-branding |
| 5 | **Rape Crisis Cape Town Trust** | Survivor-centred practice; ran an app portal before (Mxit, 2013) | Review consent wording and the help screen | A Western Cape pilot (later) |
| 6 | **ISS Africa** | The source of VUKA's headline kidnapping statistic; Crime Hub; Violence Prevention Forum | A critical read of the honesty ledger and the kidnapping methodology (ransom vs robbery-linked); an invitation to the Forum | A quote for marketing |
| 7 | **Kwanele** (peer) | Already through the campus, NPA and SAPS-MoU path | A call to learn from its experience; check whether the two apps could work together at UCT and Wits | Anything that looks like competing for the same campus |
| 8 | **SABRIC and BACSA** | Hold written agreements with SAPS; their territory is express kidnapping and banking; links to insight 1 | SABRIC: how a timestamp of a duress signal could support a customer's fraud dispute (**not proof of duress**). BACSA: the criteria for joining E2. | Joining E2 as a dispatch feed (VUKA does not dispatch) |
| 9 | **Civilian Secretariat / Safer Spaces** | The policy door; CPF training | A Safer Spaces knowledge entry; guidance on what SAPS may lawfully accept from a private app | An MoU |
| 10 | **Local SAPS station and CPF at the pilot site** | The Namola–Brooklyn (2017) and Kwanele–Claremont precedents | Station feedback on the guardian instruction, and on what an investigator needs from a record the member exports | Any data flow |
| 11 | LifeLine, POWA, Missing Children SA, Women for Change, Action Society | Situational: review, referral or amplification | One specific review each (see §3) | Public endorsement |
| 12 | Gauteng e-Gov / Community Safety; National Council on GBVF; Higher Health; TIA through Wits | Scale and funding come after the beta | Interoperability and procurement conversations; seed funding through the Wits route | — |
| 13 | **SAPS provincial and national** (Gauteng kidnapping/extortion unit; Crime Intelligence anti-kidnapping team; Visible Policing / 10111) | Only after the Madlanga report, with beta evidence, introduced by CPSI, CSPS or BACSA | Feedback on the guardian instruction and the exported-record format | Integration with 10111 or command centres |

GBV Command Centre and Thuthuzela Care Centres are **referral destinations** on the help screen, not partners.

## 7 · Order of approach (`PROPOSED` dates)

- **By 31 Oct 2026:**
  - CPSI debrief.
  - Wits Campus Protection, GEO and E-Hub introductions.
  - Print the "does / does not" table.
- **1–24 Nov 2026 (before the 16 Days of Activism):**
  - Design reviews with TEARS, Sonke and Rape Crisis (aim for two of the three).
  - ISS critical read.
  - Kwanele peer call.
  - Note that 4 Nov (elections) and 9–16 Nov (Madlanga hearings and report) may absorb government attention.
- **Dec 2026 – Jan 2027:**
  - Agree the Wits closed-beta protocol and ethics process.
  - SABRIC and BACSA alongside the Nedbank track.
- **Q1 2027:**
  - CSPS and Safer Spaces.
  - Local SAPS station and CPF at the pilot site.
  - Formal request to CPSI for an introduction, with beta results.
- **Q2 2027 onward:**
  - SAPS provincial, through formal channels.
  - Gauteng e-Gov.
  - National Council on GBVF.
  - TIA seed funding through Wits.

## 8 · Differences from `docs/venture/02-SAPS-AND-NGOS.md`

The research confirms its order: NGOs, then campus, then SAPS, with industry bodies alongside. It adds:
- **Missing from the doc:** Kwanele, Higher Health, Gauteng e-Panic, the National Council on GBVF, and the national-disaster classification.
- **Wits already runs mySOS**, so the beta must complement it.
- **"Call 10111" needs a qualifier and non-police alternatives.**
- **Missing Children SA is a weak fit** for adult express kidnapping.
- **Timing windows:** the 16 Days of Activism and the Madlanga report.
- **Stale statistic:** the doc's 17,061 is still the latest confirmed annual figure, but quarterly figures through Jun 2026 now exist.


## KEY FACTS
- [FACT] CPSI (Centre for Public Service Innovation) co-hosted the Geekulcha hackathon, with Telkom. — docs/MASTER-CONTEXT.md:16 (2026-09)
- [FACT] SAPS recorded 17,061 kidnappings in FY2023/24, up 264% since 2014/15. 44% happened during a hijacking, and under 5% were linked to ransom, trafficking or extortion. — docs/EVIDENCE.md:15 (ISS Africa, 3 Dec 2024, citing SAPS) (2024-12-03)
- [REPORTED] Q1 2026/27 (Apr–Jun 2026): 4,638 kidnappings nationally, up 172 (+3.9%) year on year. Gauteng had 2,367; Kempton Park 76, up from 48. — https://www.sanews.gov.za/node/84435 ; https://thepost.co.za/news/crime-and-courts/2026-08-29-kidnapping-rise-to-over-4600-as-gauteng-records-highest-total/ (2026-08-29)
- [REPORTED] FY2025/26 kidnappings by quarter: 4,466, 4,772, 4,775 and 4,478 (Q4 −2% year on year). Ransom kidnappings: 209, 224, 208, 216. — https://businesstech.co.za/news/government/873160/disturbing-crime-trend-targeting-people-in-south-africas-richest-province/ (2026-09)
- [ESTIMATE] The sum of the reported FY2025/26 quarters is about 18,491 kidnappings and 857 ransom kidnappings. This is not an official annual figure. — Arithmetic on the BusinessTech quarterly figures (above) (2026-10-18)
- [REPORTED] Q4 2025/26 statistics were released on 22 May 2026. Gauteng kidnappings rose from 2,414 to 2,452 (54.8% of the national total, about 27 a day), including 163 ransom cases (over 75% of the national ransom total). — https://dagauteng.org.za/2026/05/gauteng-remains-south-africas-kidnapping-capital-with-27-incidents-a-day ; https://iol.co.za/news/crime-and-courts/2026-06-09-gautengs-crime-statistics-a-decline-in-serious-crimes-but-a-rise-in-kidnappings/ (2026-05-22)
- [REPORTED] The SAPS Crime Intelligence National Anti-Kidnapping Task Team was set up in Nov 2021. A 2025 briefing cited 437 arrests and 68 convictions over four years. — https://sabcnews.com/sabcnews/?p=728023 (attribution uncertain); https://www.dailymaverick.co.za/article/2023-02-02-anti-kidnapping-units-tireless-work-earns-national-award (2025)
- [REPORTED] In early Mar 2026, SAPS set up a specialised Gauteng unit for kidnapping, extortion and crimes against infrastructure projects. — https://www.ewn.co.za/2026/03/07/lesufi-welcomes-establishment-of-two-saps-units-aimed-at-tacking-high-priority-crime-threats (2026-03-07)
- [REPORTED] There are 19 10111 centres, open 24/7. National average response times as at 30 Apr 2026: Alpha 28:30, Bravo 25:45, Charlie 24:34. In 2025/26, 2,008,711 emergency calls were not responded to. — https://static.pmg.org.za/RCW502-2026-07-08.pdf (2026-07-08)
- [REPORTED] MySAPS app (SAPS with Vodacom, Oct 2019): anonymous tip-offs, police-station finder, emergency messages; USSD *134*10111#. — https://www.news24.com/southafrica/news/first-for-africa-saps-launches-app-to-turn-tide-against-crime-20191025 (2019-10-25)
- [REPORTED] SAPS and BACSA signed an MoU on 15 Aug 2018. BACSA's E2 network links 470+ vetted private security companies and 18,000+ ANPR cameras to SAPS command centres, with 2,581 arrests in the year to Aug 2025. — https://pmg.org.za/committee-question/30227/ ; https://www.engineeringnews.co.za/article/bacsas-eyes-and-ears-initiative-drives-2-581-arrests-over-the-past-year-2025-09-29 (2025-09-29)
- [REPORTED] SAPS–SABRIC MoU first agreed in 2001 and renewed in 2015. — https://www.sanews.gov.za/node/34731 (2015)
- [REPORTED] Namola and Brooklyn SAPS signed a police-station partnership on 5 Feb 2017. — https://www.itweb.co.za/article/namola-partners-with-brooklyn-police/VKA3WwqdDYWqrydZ (2017-02-05)
- [REPORTED] National Commissioner Masemola was placed on precautionary suspension in Apr 2026, with Dimpane acting. The Madlanga Commission's final report is due 16 Nov 2026; public hearings are paused until 9 Nov because of the 4 Nov local government elections. — https://iol.co.za/news/south-africa/2026-04-23-saps-in-crisis-ramaphosa-suspends-masemola-appoints-dimpane-as-acting-police-commissioner-amid-mounting-scandals/ ; https://briefly.co.za/south-africa/254771-madlanga-commission-pauses-public-hearings-9-november-local-government-elections/ (2026-07-09)
- [REPORTED] CPSI's 2025/26 target was 4 innovations replicated in the public sector, with 0 achieved by Sep 2025. — https://www.treasury.gov.za/documents/mtbps/2025/aene/Vote 11a Centre for Public Service Innovation.pdf (2025-10)
- [REPORTED] CPSI awards (2014 rules): private or NGO entrants are eligible only if the innovation is implemented in the public sector and has run for at least one year. — https://www.sanews.gov.za/node/22345 (2014)
- [REPORTED] The GBV Command Centre (0800 428 428) was relaunched in Dec 2024. Its geolocation is waiting on Information Regulator approval under POPIA. — https://www.sanews.gov.za/node/72527 (2024-12)
- [REPORTED] 66 Thuthuzela Care Centres were operating after the Phuthaditjhaba launch. — https://www.npa.gov.za/node/2389 (2025-04)
- [REPORTED] GBVF was classified a national disaster under s23 of the Disaster Management Act on 21 Nov 2025. — https://www.ewn.co.za/2025/11/21/govt-officially-declares-gender-based-violence-and-femicide-a-national-disaster (2025-11-21)
- [REPORTED] Members of the National Council on GBVF were appointed on 31 Jul 2026 for 1 Aug 2026 to 31 Jul 2029. — https://www.sanews.gov.za/node/83277 (2026-07-31)
- [REPORTED] The TEARS Foundation–MoyaApp partnership (data-free GBV directory) was announced 24 Nov 2025. TEARS runs USSD *134*7355#. — https://www.bizcommunity.com/article/an-african-solution-for-an-african-crisis-tearsmoyaapp-partnership-174526a (2025-11-24)
- [REPORTED] The GenG coalition (Sonke, ACTIVATE!, ActionAid SA) launched the zero-rated GenG Engage app on 4 Apr 2025. — https://genderjustice.org.za/geng-launches-innovative-mobile-app-to-combat-gender-based-violence-and-femicide-in-south-africa/ (2025-04-04)
- [REPORTED] Wits uses the mySOS app: the Wits button alerts Campus Protection Services with the member's location. — https://www.wits.ac.za/mywits/mysos/ (2026-10)
- [REPORTED] Students protested at Wits over its handling of GBV in Nov 2025, presenting 25 demands; Wits responded on 13 Nov 2025. — https://www.wits.ac.za/news/latest-news/general-news/2025/2025-11/response-to-students-on-gbh-matters.html (2025-11-13)
- [REPORTED] UCT adopted the Kwanele GBV app in Oct–Nov 2023. Kwanele was reported in 2024 to be working toward an MoU with SAPS; no signature was confirmed. — https://news.uct.ac.za/article/-2023-11-02-uct-gets-powerful-new-tool-to-combat-gender-based-violence ; https://witsvuvuzela.com/2024/05/23/gbv-panic-button-an-app-that-saves-lives/ (2024-05-23)
- [REPORTED] Gauteng e-Panic Button: piloted Apr 2023, launched May 2024; 80,000+ physical buttons distributed, framed as a GBVF response. — https://www.gauteng.gov.za/News/NewsDetails/%7B6beb7de0-145f-478f-9891-4477d0d49dc7%7D (2024-12-02)
- [REPORTED] The Information Regulator found SAPS in breach of POPIA over the leak of Krugersdorp rape victims' details: a summons on 29 Aug 2022, then an enforcement notice in Apr 2023. — https://werksmans.com/legal-updates-and-opinions/information-regulator-bites-enforcement-notice-issued-against-the-saps/ (2023-04-05)
- [REPORTED] About 95–97 SAPS members were accused of rape or sexual violence in 2024/25 (IPID figures as reported). — https://www.ewn.co.za/2026/02/22/gauteng-legislature-committee-shocked-that-97-cops-accused-of-sexual-violence-or-rape (2026-02-22)
- [REPORTED] A Hawks cyber-crime officer was arrested on 22 Sep 2026 on kidnapping and extortion charges. — https://briefly.co.za/south-africa/254164-hawks-officer-arrested-alleged-kidnappings-extortion-gqeberha-south-africans-frustrated/ (2026-09-22)
- [REPORTED] Domestic Violence Act s2B (in force 14 Apr 2023): an adult who knows of or suspects domestic violence against a child, a person with a disability or an older person must report it to a social worker or SAPS; failing to do so is an offence. — https://www.acts.co.za/domestic-violence-act-199/2b__obligation_to_report_domes (2023-04-14)
- [REPORTED] TIA seed funding works through implementing partners (university technology transfer offices, incubators) with no direct application. Wits has received over R20m in TIA seed support. The TIA PreSeed 2026 call with Propella closed 16 Oct 2026. — https://www.wits.ac.za/news/latest-news/research-news/2026/--2026-08/building-on-strength-tia-and-wits-chart-a-shared-innovation-future.html ; https://innovationbridge.info/ibportal/content/technology-innovation-agency-tia-seed-fund-programme (2026-08)
- [ASSUMPTION] PILOT CORE (Pty) Ltd is probably not eligible directly for GBVF Response Fund grants, which have gone to NPOs and CBOs. — Inference from https://ngopulse.net/profiles/employers/gbvf-response-fund-575 (2026-10-18)
- [ASSUMPTION] A national SAPS approach before Q1 2027 is likely to stall, given acting leadership and the Madlanga report. — Inference from the SAPS leadership sources above (2026-10-18)
- [PROPOSED] Order of approach: CPSI debrief and Wits → TEARS, Sonke and Rape Crisis design reviews before 25 Nov → ISS and Kwanele → SABRIC and BACSA → CSPS and the local SAPS station and CPF (Q1 2027) → SAPS provincial and national (Q2 2027 onward). — This report §6–7 (2026-10-18)

## CONFLICTS/GAPS
- TOOL LIMIT: WebFetch failed with DNS ENOTFOUND on every domain tried, and curl was refused (403) by the egress proxy. No page was opened directly; every web claim comes from search-engine extracts and is tagged REPORTED. A human should open the SAPS quarterly PDFs and the PMG reply before any figure is promoted to FACT.
- Q1 2026/27 national kidnappings: 4,638 (SAnews, The Post) against 4,251 (BusinessTech). Unresolved until the SAPS PDF is read.
- The FY2024/25 full-year kidnapping total is not confirmed (one blog says 16,901). The SAPS 2024/25 annual report PDF is already linked at docs/EVIDENCE.md:17 and needs a human reading of the kidnapping row.
- Q4 2024/25 kidnapping change: +11.1% (Mchunu) against +6.8% (IOL).
- Q4 2025/26 Gauteng kidnapping count: 2,452 (DA, IOL) against a 2,404 figure in one IOL piece.
- I could not confirm the anti-kidnapping task team's 2025 figures (437 arrests, 68 convictions), the URL they came from, or the team's current mandate under acting leadership.
- There is no confirmation that Dimpane (acting National Commissioner) and Cachalia (acting Police Minister) are still in post as of Oct 2026.
- I found no SAPS unit dedicated to hijacking or vehicle crime; the evidence on hijacking is limited to the repo's FACTs.
- CPSI's 2026 awards cycle and current eligibility rules were not found; the rules cited date from 2014, the categories from 2020, and the CPSI page seen was a test domain (cpsitest.syncrony.com). Not confirmed by search: cpsi.co.za, policesecretariat.gov.za, bac.org.za, powa.co.za, and the LifeLine website.
- GBV Command Centre: no confirmation that the SMS, USSD and WhatsApp channels promised for Q1 2025 went live, or that geolocation was approved.
- There is no source for whether Kwanele's SAPS MoU was signed, or for Kwanele's 2025–2026 status.
- MySAPS's current features and the AMBER Alert programme's current status are unverified; the sources date from 2019–2020.
- The search did not surface an organisation-level partnership contact for LifeLine SA or POWA.
- The Wits E-Hub Tech & AI Day (15 Oct 2026) was not indexed. The demo and the feedback rest on the founders' own account, not on a third-party source.
- No POPIA guidance from the Information Regulator was found on private companies disclosing to SAPS. Whether a member-exported VUKA record counts as 'criminal behaviour' special personal information (s26/s57) needs legal advice, which is a human gate.
- The SafeTech Africa HackLab 2026 (UNFPA, up to US$10k) closes 18 Oct 2026, today, and is probably missed. The source is a secondary listing (menterprise.africa).
- Repo doc docs/venture/02-SAPS-AND-NGOS.md lists Missing Children SA under express kidnapping; the research shows its focus is missing persons and children, a weak fit for adult express kidnapping.

## RECS
- Contact CPSI now, before 31 Oct 2026, for a debrief only. Ask which SAPS or Civilian Secretariat innovation contact to approach, when, and with what evidence. Save the formal introduction request for Q1 2027 with beta results. Do not plan a CPSI awards entry until a public-sector deployment has run for a year.
- Make Wits the first pilot community, positioned to complement mySOS. Ask Campus Protection Services whether guardian alerts should give the campus emergency number as well as 10111; ask the Gender Equity Office to review the duress path and the abuser-as-guardian case; ask the E-Hub for a protocol for a consenting closed beta with ethics clearance. Route TIA seed-funding questions through Wits.
- Hold two or three GBV NGO design reviews (TEARS first, then Sonke/GenG and Rape Crisis Cape Town) between 1 and 24 Nov 2026, before the 16 Days of Activism (25 Nov–10 Dec). Ask only for review, not endorsement or testers. Offer something in return for staff time.
- Change the guardian help screen (PROPOSED, needs a decision by Lethabo or Sibusiso): keep 'Call 10111' but add non-police routes (GBV Command Centre 0800 428 428, TEARS *134*7355#, Campus Protection when on campus). Never imply that VUKA speeds police response; Parliament reported a 28:30 Alpha average and over 2 million unanswered emergency calls in 2025/26.
- Hold any approach to SAPS national office or the province until after the Madlanga final report (16 Nov 2026), and route it through CPSI, the Civilian Secretariat or BACSA. Begin SAPS contact in Q1 2027 at the police station and CPF serving the pilot site, following the Namola–Brooklyn (2017) and Kwanele–Claremont precedents. Ask only for feedback on the guardian instruction and the format of a member-exported record. No data flows.
- Pair the SABRIC and BACSA conversations with the Nedbank and insurer track (insight 1). With SABRIC, discuss whether a timestamp of a duress signal could support a customer's express-kidnapping fraud dispute, without claiming it proves duress. With BACSA, learn the E2 criteria, without proposing a dispatch feed.
- Add Kwanele, Higher Health, Gauteng e-Panic, the National Council on GBVF and the national-disaster classification to docs/venture/02-SAPS-AND-NGOS.md. Move Missing Children SA out of the core express-kidnapping row. Never adopt Kwanele-style claims about legal admissibility.
- Get a South African privacy lawyer's view (human gate) on POPIA s26/s57 (criminal-behaviour information and prior authorisation) for member-exported records, and on Domestic Violence Act s2B mandatory-reporting duties for guardians, before any SAPS conversation. Keep the rule that VUKA pushes nothing to SAPS; data leaves only by member export or a logged lawful order.
- Have a human read the official SAPS PDFs (FY2024/25 annual report; Q1 2026/27) to settle the 4,638 vs 4,251 conflict and the 2024/25 annual kidnapping total before any of these figures goes into a pitch. Until then, cite 17,061 (FY2023/24, FACT) and label the quarterly figures as reported.
- Record every meeting in docs/build-log/entries/ (organisation, date, what was said, what was agreed) with no personal contact details. Hold any 'endorsed by', 'backed by' or 'in partnership with' wording until the organisation says so in writing.