# Evidence base for E-Hub insight 1: VUKA sold to and integrated with Nedbank and insurers

**Research date:** 2026-10-18. **Serves criteria:** B (business viability), T (technical feasibility), S (scalability). **"Would a real user trust and use this?"** Customers already use safety features inside the apps they trust: the Nedbank Money app has 3.0m active clients, FNB GuardMe sits inside the FNB app, and Discovery 911 sits inside the Discovery Insure app. The evidence also shows two things that break trust. Discovery fined a client for a mistaken panic code, and Capitec's CIO argues that a duress PIN stops working once criminals learn about it. Both are covered below.

## 0. Method and its limits (read first)
- **No page was opened directly.** In this session WebFetch failed on DNS (`ENOTFOUND`) for every host tried, and direct `curl` through the egress proxy got `403 CONNECT` (for example businesstech.co.za, personal.nedbank.co.za and ebucks.com). Every citation below comes from the search tool's extract of the cited page. **Re-open every URL before you quote it to a judge, investor or bank.**
- Tags: **FACT** means the bank's, insurer's or regulator's own page or release said it, seen through a search extract. **REPORTED** means press or third-party, not independently checked. **ESTIMATE** is derived. **ASSUMPTION** is believed but unchecked. **PROPOSED** is designed, not built.
- Repo facts are cited by path:line. This report fills the "Research pending" row in `docs/venture/01-B2B-ENTERPRISE.md:96`.

---
## 1. Nedbank

### 1.1 Digital channels
- **FACT:** Active Nedbank Money app clients rose 14% to **3.0 million** in FY2025. Digitally active retail clients in Personal and Private Banking rose 9% to **3.4 million**. The group passed **8 million clients**. Source: Nedbank FY2025 results, 3 Mar 2026, https://group.nedbank.co.za/news-and-insights/press/2026/a-transformation-year-as-nedbank-positions-for-growth.html
- **FACT:** Money app security features:
  - **Fraud awareness screens.** If the app is opened during a phone call, the user must confirm they know the caller. The page is undated. https://personal.nedbank.co.za/home/fraud-awareness/banking-safely/money-app-security.html
  - **In-app Approve-it**, which replaced cellphone pop-ups as a SIM-swap defence. https://personal.nedbank.co.za/bank/digital-banking/needs/manage/in-app-approve-it.html
  - **MoneyGuard.** Flagged card transactions trigger an SMS, and the client replies Y or N. https://personal.nedbank.co.za/home/fraud-awareness/safeguard-your-money-with-moneyguard.html
  - Card freeze, and virtual cards with spend limits.
- **REPORTED:** Entersekt's mobile-PKI authentication has run on Nedbank's apps since 2012, first App Suite and later Money (vendor case study). This means Nedbank has embedded a third-party security SDK before. https://www.entersekt.com/resources/nedbank-and-entersekt-mobile-authenticat
- **No Nedbank panic, duress or kidnapping feature found** (absence of evidence, 18 Oct 2026). The nearest material:
  - **REPORTED:** Nedbank's head of digital channels gives a "protocol for banking app shakedown victims": put your safety first and stay calm. The TechCentral article is undated. https://techcentral.co.za/?p=234770
  - **REPORTED:** In April 2025 Nedbank warned that criminals target smartphones to reach banking apps. https://businesstech.co.za/news/banking/818648/nedbank-warns-south-africans-with-banking-apps-on-their-phones/

### 1.2 Fraud and financial-crime posture
- **REPORTED:** At a SAFPS summit, Nedbank's head of financial crime risk said Nedbank stopped more than **R7.5bn** of *application* fraud in 2024, with losses under about R50m. This is application fraud, not digital or coerced fraud. ITWeb, May 2025: https://www.itweb.co.za/article/nedbank-fends-off-r75bn-in-cyber-fraud-attempts/KWEBb7yLlyGvmRjO
- **REPORTED:** In a May 2026 complaint about R24,900 lost after a phone theft, Nedbank said the valid app PIN was used and no fraud alert was generated. https://dailynews.co.za/news/south-africa/2026-05-30-they-gave-nedbank-37-years-of-loyalty-when-fraudsters-struck-the-bank-gave-them-r1300-and-silence/
- **Gap:** The official FY2025 digital-fraud loss figure was not found.

### 1.3 API Marketplace, open banking and fintech routes
- **FACT:**
  - Nedbank calls its API Marketplace Africa's first PSD2-aligned API platform.
  - Partners must subscribe to the **Authorisation API** and the **Subscription API** first. Auth is **OAuth 2.0**.
  - There is a **sandbox**. Access starts with a "register interest" form, after which a sales consultant contacts you.
  - Products cover loans, rewards, **Value Added Services (VAS)** and account transactions.
  - It was named "Best Open Banking APIs South Africa 2021".
  - Sources: https://api-marketplace.nedbank.co.za/ · https://api-marketplace.nedbank.co.za/blog/signing-up-for-api-marketplace.html · https://api-marketplace.nedbank.co.za/find-the-right-api/value-added-services-api.html · https://personal.nedbank.co.za/learn/blog/nedbank-api-marketplace-wins-a-global-award.html
- **Gaps:**
  - No public partner list, production-approval steps or fees.
  - No public API that *receives* a third-party risk signal into Nedbank's fraud engine. Offer B would therefore be a custom integration (ASSUMPTION).
- **FACT:** On 13 Aug 2025 Nedbank agreed to buy **iKhokha** for about **R1.65bn**. https://group.nedbank.co.za/news-and-insights/press/2025/nedbank-acquires-ikhokha.html
  - **REPORTED:** The Competition Commission recommended unconditional approval in late October 2025. The Tribunal's final decision was not confirmed.
- **REPORTED:** In July 2025 Breezy signed a deal to supply trade-ins to **Avo SuperShop**, Nedbank's marketplace (nearly 3m customers). https://investor.asbis.com/news/press/breezy-accelerates-its-growth-across-africa
- **REPORTED:** The FSCA's 2026–2029 regulation plan, published 3 Jul 2026, lists open-finance work. Most of the rules are still in drafting. https://launchbaseafrica.com/2026/07/13/south-africas-fintechs-face-a-wave-of-new-data-and-open-finance-rules-heres-the-timeline/

### 1.4 Enterprise development and YouthX
- **REPORTED (HYPE Magazine, 2026):** YouthX 2026:
  - Open to ages 18–26. Entries ran **14 Aug–9 Oct 2026**. Winners are announced **21 Nov 2026**.
  - The support includes **mentorship through Nedbank's enterprise development team**, financial-literacy training and guidance from financial advisers.
  - In 2025 the prize was up to R200,000.
  - https://hypemagazine.co.za/?p=119155 · https://hypemagazine.co.za/?p=93874
- **REPORTED:** Nedbank has run an in-house enterprise and supplier development (ESD) programme since September 2015, covering mentorship, training and coaching. https://www.jsemagazine.co.za/jse-supplement/company-profiles-jse-supplement/market-growth/
- **Gap:** No public "top 50" list exists. The top-50 status rests only on the email recorded in the repo. YouthX is an enterprise-development channel, not procurement. Use it to *get introductions* to Digital Channels and Financial Crime Risk, never as evidence of a commercial relationship (matches `docs/venture/01-B2B-ENTERPRISE.md:4`).

### 1.5 Nedbank Insurance
- **FACT:**
  - **MyCover** covers buildings, contents, vehicle, valuables and personal legal liability.
  - **MyCover Life** offers R100k–R3m of cover.
  - Credit Life.
  - An **Accidental Death Plan** underwritten by Nedgroup Life.
  - https://nedbank.co.za/content/nedbank-insurance/desktop/gt/en/aboutus/about-nedbank-insurance/About-us.html · https://personal.nedbank.co.za/content/dam/nedbank/insurance-pdf/terms-and-conditions/accidental-death-plan-terms-and-conditions.pdf
- **No Nedbank kidnap, express-kidnapping or personal-safety product, and no panic button, was found.** Hijack cover sits in the motor policy wording, which was not seen.

---
## 2. Other SA banks: features to position against

| Bank | Coercion / safety feature | Status & date | Source |
|---|---|---|---|
| **Discovery Bank** | **Panic Code** inside the **Digital Account Vault**: entering it instead of the security code leaves the app looking normal. It silently alerts the fraud team, shares live location and starts real-time fraud monitoring. The bank may involve police and send **armed response**. Transactions keep processing. | Announced 27 Mar 2025; launch reported 4 Jun 2025. Qorus MEA 2025 winner. "Being patented" (REPORTED). | FACT https://www.discovery.co.za/bank/blog-security-code-and-panic-code-keep-you-safer · https://www.discovery.co.za/bank/news-discovery-bank-launch-2025 · REPORTED https://www.ewn.co.za/discovery-bank-launches-panic-code-security-feature-but-be-aware-that-misuse-could-cost-you |
| Discovery Bank (cost of false alarms) | A client who entered the panic code by mistake was charged a **R1,000** misuse fee (full fee **R2,000**). | EWN, 4 Jun 2025 | REPORTED (same EWN link) |
| **FNB** | **GuardMe**: an in-app panic button powered by **AURA**, which sends the nearest armed response. **R19.90 per member per month** after 3 free months. Up to 100% back in eBucks, capped at 6 members; Easy Bundle excluded. Non-FNB family members can be added. Also a "visible accounts" option and a team that blocks accounts and traces funds when a client is in danger. | Launched Apr 2022. Listed in eBucks earn rules for Jul 2024–Jun 2025. **2026 status and price not confirmed.** | REPORTED https://www.itnewsafrica.com/2022/04/fnb-partners-with-aura-to-keep-customers-safe/ · FACT (undated) https://www.ebucks.com/web/eBucks/partners/guardme.jsp · REPORTED https://businesstech.co.za/news/banking/786765/kidnappers-on-the-hunt-for-banking-details-in-south-africa-and-refunds-arent-guaranteed/ |
| **Capitec** | (a) **Real-time payment risk warnings**: the client can pause or cancel; rolled out from 2025. (b) **"Secret/Secure Safe"**: accounts hidden from the app and reachable only in a branch. About **75,000** accounts used it in its first month (REPORTED). (c) **"Trusted Approver"**: a nominated person approves payments and can pause the app or freeze cards. Sources conflict on whether it is in development or rolling out. (d) CIO Andrew Baker's essay (1 Aug 2026) argues **a duress PIN makes you less safe**, because a secret the bank markets becomes known to criminals. | 2025–2026 | REPORTED https://businesstech.co.za/news/banking/857024/great-news-for-capitec-customers-in-south-africa-with-banking-apps-on-their-phones/ (17 Apr 2026) · https://techfinancials.co.za/2026/09/01/capitecs-ai-saved-clients-r699-million-in-2026-blocking-113410-fraud-cases/ · https://andrewbaker.ninja/2026/08/01/capitec-secure-safe-why-a-duress-pin-makes-you-less-safe-not-more/ |
| **Standard Bank** | In-app vishing-call alert, opt-in. Immediate Payments run 06:00–17:00, capped at R200,000. **New, once-off or changed beneficiaries are held for 2 hours.** No duress feature found. | Vishing alert 6 Aug 2024; payment page undated | FACT https://www.standardbank.co.za/southafrica/news-and-media/newsroom/scammers-turn-to-phone-calls-as-banks-clamp-down-on-fraud · https://community.standardbank.co.za/t5/Key-app-features/Immediate-Payments-on-the-Mobile-Banking-App/m-p/424284 |
| **Absa** | Daily limits the customer sets, an in-app fraud call, and a digital fraud warranty. **The first and second payments to a new beneficiary are held for 1 hour.** Immediate payments: R5m on weekdays, R25,000 after hours. No duress feature found. | Undated FAQ | FACT https://absa.co.za/self-service/safety-security/absa-banking-app · https://www.absa.co.za/self-service/digital-banking-services/online-banking/make-payments/ |
| TymeBank | Daily limits by account history: R2,000, R10,000 and R100,000. No duress feature found. | Old article | REPORTED https://businesstech.co.za/news/?p=283534 |
| African Bank | **Nothing found** | — | Gap |
| *Valor* (third party, BYY Strategic Services) | A **voice-activated** panic app. It claims to alert the user's **bank fraud department** and claims partnerships with **unnamed SA banks**. **This is the closest direct competitor to VIGIL.** | Launched Mar 2025 | REPORTED https://www.engineeringnews.co.za/article/voice-activated-valor-panic-app-aimed-at-enhancing-safety-2025-03-31 |

**SABRIC, the ombud and the scale of the problem**
- **FACT/REPORTED:** SABRIC, "Hijackers force banking app transfers in rising crime trend" (TimesLive, 23 Mar 2026). CEO Andre Wentzel says these incidents are now a recognised part of violent crime. Victims are forced past security controls, sometimes into taking loans. SABRIC's advice is to **keep less money in accounts that are easy to reach**. https://www.sabric.co.za/hijackers-force-banking-app-transfers-in-rising-crime-trend/
- **No SABRIC or regulator guidance on transfer limits or cooling-off periods was found.** The new-beneficiary holds at Absa and Standard Bank are bank policy, not a regulatory requirement.
- **FACT:** SABRIC's 2024 crime statistics (released around Aug 2025):
  - Total losses fell from R3.3bn to R2.7bn.
  - Digital banking made up 65.3% of incidents.
  - Digital-banking cases rose from **31,612 to 64,000**, and losses from **R1bn to >R1.4bn**.
  - SABRIC blames **social engineering, not compromised platforms**.
  - https://www.sabric.co.za/?p=3440
  - **Conflict:** TechAfrica reports about 98,000 cases and R1.888bn. https://techafricanews.com/2025/08/29/south-africa-sees-86-surge-in-digital-banking-fraud-losses-near-r1-9-billion/
- **REPORTED:** National Financial Ombud (NFO) case:
  - A kidnapped client lost **R103,092**. The bank's fraud system *flagged and called*, and the client **confirmed the payments under duress**.
  - The NFO found the bank not negligent and the bank paid part of the loss as goodwill.
  - The NFO's test is that banks are liable only for maladministration or unfair treatment, or for failing to prevent or reduce the loss.
  - Business Report, 18 Mar 2025: https://businessreport.co.za/business/2025-03-18-kidnapped-for-cash-the-growing-crisis-of-express-kidnappings-and-bank-liability-in-south-africa · Daily Maverick, 14 Aug 2024: https://www.dailymaverick.co.za/article/2024-08-14-ombud-scheme-sounds-alarm-over-rise-in-express-kidnappings/
  - **This case is the clearest public example of the gap a covert signal channel could fill.**
- **REPORTED:** SAPS kidnapping counts for 2025/26 by quarter: 4,466 / 4,772 / 4,775 / 4,478. Q1 2026/27: 4,251. Ransom kidnappings in Q1 2026/27: 231 (+10.5%). SAPS publishes **no separate express-kidnapping count**. BusinessTech, 3 Sep 2026: https://businesstech.co.za/news/government/873160/disturbing-crime-trend-targeting-people-in-south-africas-richest-province/

---
## 3. Insurers with kidnap, hijack or personal-safety cover

| Insurer | Product | Price | Source / tag |
|---|---|---|---|
| **iTOO Special Risks** (underwritten by **Hollard**, also sold through PSG) | **[My]Cylution** personal cyber in five packages (Mega, Giga, Tera, Peta, Exa). Theft of funds is a cover line; **express kidnapping** is in the higher tiers. Separate kidnap-and-ransom (K&R) policy covering 20+ events. Payouts reimburse **after** the event. | Base from **R22.50/month** (SureStart, page about 3 years old). A broker quote page shows **R85–R325/month**, with express kidnapping only in the top two tiers (R50k and R100k cover). A family K&R policy costs about **R15,000/year** (FAnews, Sep 2024). **The prices conflict.** | REPORTED https://www.surestart.co.za/post/personal-cyber-protection · https://www.cybercovered.co.za/quote-for-personal-cyber-insurance · https://www.fanews.co.za/article/non-life/15/personal-lines/1005/rising-demand-for-kidnap-and-ransom-cover-amid-increasing-risks/40185 · FACT https://www.psg.co.za/documents/get-a-quote/psg_mycylution_brochure.pdf · https://hollard.co.za/business-and-people/itoo/financial-lines-and-crime-insurance |
| **Santam** | K&R for **businesses**, travel hijack and hostage cover, and an SOS button in the Santam app | n/a | FACT https://www.santam.co.za/insurance/for-specialised-risks/accident-and-health/kidnap-and-ransom/ |
| **OUTsurance** | **Help@OUT Panic Assistance**, powered by **AURA**: armed and medical response; up to 3 family or friends | **Free** for policyholders; R199/year for non-clients (2022) | REPORTED https://businesstech.co.za/news/industry-news/568808/outsurance-clients-enjoy-immediate-medical-or-armed-response-service-at-no-extra-cost/ |
| **King Price** | **code red** in-app panic button with **Secura** (more than 280 armed-response companies) | A "nominal" monthly fee; amount not found | REPORTED (Feb 2021) https://www.fanews.co.za/article/non-life/15/general/1217/king-price-launches-app-based-emergency-response-service/31187 |
| **Discovery Insure** | **Discovery 911** virtual panic button: security through **AURA**, medical through **Netcare911** | R55/month app-only; R70 / R95 / R140 for 1 / 2 / up to 5 subscriptions. Seen in one search extract and absent from the press release, so **re-check**. | FACT https://www.discovery.co.za/car-and-home-insurance/discovery-911-virtual-panic-button · release 3–4 Jun 2026 https://www.mynewsdesk.com/za/discovery-holdings-ltd/pressreleases/aura-partners-with-discovery-to-power-launch-of-discovery-911-emergency-response-service-3452363 |
| **Momentum Insure** | **Safety Alert** panic button: hold for 2 seconds; the control room sends help; 1,800 armed responders. AURA lists Momentum as a customer, but that it powers this product is inferred. | **No extra cost** for car and home policyholders plus 1 nominated user | FACT https://momentum.co.za/momentum/personal/products/car-and-home/safety-alert |
| 1st for Women | Panic button through "Guardian Angel on Call" on car, home and building policies | n/a | FACT https://www.firstforwomen.co.za/app |
| Hollard (outside iTOO), Old Mutual iWYZE | **Nothing found** | — | Gap |

**Takeaway (ESTIMATE):** iTOO/Hollard is the only insurer found selling **retail express-kidnapping or theft-of-funds cover**, so it is the natural first fit for claim verification (Offer C). OUTsurance, Momentum and King Price already bundle panic buttons as a free or low-cost **value-add**, so VIGIL would be pitched there as an extra trigger feeding their existing response partner, not as a second response service.

---
## 4. Response platforms banks and insurers already use (B2B2C precedents)
- **AURA** (REPORTED, mostly AURA's own claims):
  - A per-user, per-month B2B2C subscription sold through insurers, banks, security companies and apps.
  - Named partners: **FNB, Momentum, Tracker, Investec, OUTsurance, Uber, Discovery Insure**.
  - Integration is by **API embedded in the partner's app** or a **white-label app**. Responders are registered with PSIRA (Private Security Industry Regulatory Authority).
  - It raised $14.6m in May 2025 and has **1.2m paying subscribers** globally. Average response is under 10 minutes (company claim).
  - https://techcabal.com/2025/05/16/south-africa-founded-aura-raises-14-6-million/ · https://www.aura.services/ke/en/integrations · https://www.biznews.com/good-hope-project/aura-justin-suttner
- **Namola** (REPORTED, 2017–2018): a free non-profit app built by Happimo and **sponsored by Dialdirect** for its national roll-out. Taxify/Bolt embedded a Namola button. Bolt **replaced Namola with the AA in April 2023**, free to users. https://www.itweb.co.za/article/namola-app-now-available-nationally/YKzQenMj4DavZd2r · https://aa.co.za/bolt-partners-with-the-automobile-association-aa-to-provide-emergency-response-services-for-its-drivers-and-passengers
- **Uber:** the emergency button in the Safety Toolkit connects to a third-party responder (AURA in SA, in-app since 2018). "Record My Ride" was added in July 2026. FACT https://www.uber.com/en-ZA/newsroom/new-safety-toolkit-arrives-south-africa · REPORTED https://www.ewn.co.za/2026/07/08/uber-rolls-out-enhanced-safety-features-in-south-africa
- **Who pays, five patterns found:**
  1. The customer pays through the bank: GuardMe, R19.90.
  2. The insurer absorbs the cost as a value-add: OUTsurance, Momentum.
  3. The insurer sells a priced add-on: Discovery 911, R55–R140.
  4. The platform absorbs it: Uber, Bolt.
  5. A sponsor funds an NGO: Namola with Dialdirect.

  **AURA is the shared response layer behind many of them.** VUKA should position as the **trigger and verifiable-record layer** that can feed AURA or a bank, not as a competing response network (PROPOSED).

---
## 5. What a SA bank or insurer will require of VUKA as a vendor (exact instruments)

| Instrument | What it means for VUKA | Dates | Source |
|---|---|---|---|
| **Joint Standard 1 of 2023 — IT Governance and Risk Management** (FSCA + PA) | Board-owned IT risk, IT service and programme management frameworks at the bank or insurer. Vendors are pulled into these frameworks. | Published Nov 2023; **effective 15 Nov 2024** | REPORTED https://www.ensafrica.com/news/detail/7867/fsca-and-pa-publish-joint-standard-1-of-2023- |
| **Joint Standard 2 of 2024 — Cybersecurity and Cyber Resilience Requirements** (FSCA + PA) | Covers banks and insurers. Contracts or SLAs must define security roles. Third parties get the same monitoring and access limits as staff. Data must be returned, transferred or deleted securely when the contract ends. Penetration tests and vulnerability assessments are required (secondary summaries). | Published 16/17 May 2024; **effective 1 June 2025** (Joint Notice 1 of 2024; Joint Communication 5 of 2024 dated 24/26 Jun 2024). 12 months allowed to comply (REPORTED). | https://www.moonstone.co.za/cybersecurity-joint-standard-commencement-date-confirmed/ · text: https://jutacomplinews.co.za/media/filestore/2024/07/Joint_Standard_2_of_2024__Cybersecurity__Cyber_resilience_Requirements_1.pdf |
| **Joint Communication 5 of 2026 / Joint Notice 2 of 2026** — template for reporting material IT and cyber incidents | The bank must send its **initial notice within 24 hours of classifying** an incident, an update within **14 days**, and a final report on an agreed date. **VUKA must therefore tell the bank fast enough for the bank to meet 24h.** | **Effective 1 Sep 2026** | FACT https://www.resbank.co.za/en/home/publications/publication-detail-pages/prudential-authority/pa-public-awareness/Communication/2026/joint-communication-5-of-2026-determination-of-notification-template-for-material-it-and-cyber-incidents |
| **Guidance Note G5/2014 — Outsourcing of functions within banks** (Banks Act s6(5), read with **Regulation 39**) | The bank's board stays accountable for anything outsourced. A "Directive 3/2014" could **not** be confirmed. | 8 Jul 2014 | FACT https://lawlibrary.org.za/akn/za/statement/guidance-note/sarb/2014/5/eng@2014-07-08 |
| **Directive D3/2018 + Guidance Note G5/2018** — cloud computing and offshoring of data (banks) | Material cloud or offshore arrangements need a board-approved data strategy, regulator access, data portability and forensic audit rights. **This bites directly on VUKA's data currently sitting in Azure UAE North.** | Mandatory from **1 Oct 2018** | REPORTED https://www.bakermckenzie.com/en/insight/publications/alerts/2025/08/south-africa-fsca-pa-guidance-on-cloud-and-data-offshoring |
| **Joint Communication 2 of 2025** — cloud computing and data offshoring (all financial institutions) | Interim good practice. A binding Joint Standard is being prepared; consultation is reportedly scheduled for 2027/28. | **25 Jul 2025** | FACT https://www.resbank.co.za/content/dam/sarb/publications/prudential-authority/pa-public-awareness/covid-19-response/2025/Joint%20Communication%202%20of%202025%20-%20Cloud%20computing%20and%20offshoring%20of%20data.pdf |
| **PA Directive D2/2019** — reporting material IT/cyber incidents (banks) | Notice within 1 day; root-cause report within 14 days. It may now overlap with JC 5/2026, which is unconfirmed. | 2019 | REPORTED https://regalert.today/document/e124aa24-8c8f-4833-b964-5f7b3b6458d3 |
| **Joint Standard 1 of 2024 — Outsourcing by Insurers** | Replaced GOI 5 and covers **material** functions only. The insurer must do due diligence and notify **both PA and FSCA**. Existing arrangements must comply by **30 Nov 2026** or at renewal. | **Commenced 1 Dec 2024** | REPORTED https://www.deneys.co.za/thinking/joint-standard-1-2024-new-requirements-outsourcing-insurers |
| A cross-sector Joint Standard on third-party services / outsourcing | On the FSCA plan; **no published draft found** | — | REPORTED (FSCA plan) |
| **SARB NPS Directive 1 of 2024** — cyber resilience in the National Payment System | Applies only if VUKA becomes a critical IT provider to a payment participant (ASSUMPTION) | Issued 17 May 2024 (Gazette 4835); comply by 17 Aug 2024 (REPORTED) | https://www.michalsons.com/blog/sarb-cybersecurity-and-cyber-resilience-directive/78268 |
| **POPIA s19–s22, s72** | s20: as an operator, VUKA processes only with authorisation and keeps data confidential. **s21: a written operator contract is mandatory** (the Regulator found against Dis-Chem under s21(1) for not having one), and VUKA must tell the bank **immediately** of a compromise. s22: the bank, as responsible party, reports through the Regulator's eServices portal, mandatory since April 2025 (sources give 1 Apr or 17 Apr). **s72: cross-border transfers need adequate foreign law, binding corporate rules, a contract, consent or contractual necessity.** Fines up to R10m. | In force | https://fasken.com/en/knowledge/2023/09/beware-of-the-operator-contract-a-necessity-for-popia-compliance · https://inforegulator.org.za/wp-content/uploads/2020/07/DIS-CHEM-ENFORCEMENT-NOTICE.pdf · https://acts.co.za/news/blog/2025/05/popia-regulation-amendments-2025 · https://www.michalsons.com/focus-areas/privacy-and-data-protection/transfers-of-personal-information-outside-south-africa |
| Cybercrimes Act s54 (reporting duty for financial institutions) | **Not in force** according to sources up to 2024; check the Gazette | — | REPORTED https://www.michalsons.com/blog/the-impact-of-the-cybercrimes-act-on-financial-institutions/56437 |

**Typical vendor due diligence** (REPORTED, SA fintech-contract guidance and practitioner sources):
- A security questionnaire.
- **ISO 27001** is the usual certification ask; a **SOC 2** report is often accepted.
- Recent **penetration test** results.
- A business continuity plan (BCP) and disaster recovery (DR) plan.
- Incident-notification SLAs.
- A list of your own sub-processors (the bank treats them as "fourth parties").
- Source: https://mjkinc.co.za/software-technology-law/fintech-contracts

**Data residency:** Azure **South Africa North** (Johannesburg, 3 availability zones, paired with South Africa West) has been available since Mar 2019. FACT/REPORTED: https://www.azurespeed.com/Information/AzureRegions/SouthAfricaNorth

**VUKA today** (repo FACT, `docs/venture/01-B2B-ENTERPRISE.md:90-95`):
- Penetration test not done (G8).
- POPIA Information Officer registration not submitted.
- Operator agreement not drafted.
- **Data in Azure UAE North, with no documented s72 basis**, while the privacy notice says South Africa North.
- No SLA baseline yet.

---
## 6. How SA banks and insurers integrate third parties (public examples)
1. **A third-party service embedded inside the bank or insurer app:**
   - FNB GuardMe (AURA, opened from the eBucks tile).
   - OUTsurance Help@OUT (AURA).
   - Discovery 911 (AURA + Netcare911).
   - Momentum Safety Alert.
   - King Price code red (Secura).
   - Uber Safety Toolkit (AURA).
2. **A security SDK inside the bank app:** Nedbank with Entersekt (mobile PKI since 2012). Entersekt has partnered with BioCatch on behavioural biometrics, but **no SA bank customer of BioCatch was confirmed**.
3. **A white-label app:** AURA offers one. Avo is Nedbank's own marketplace.
4. **APIs through open-banking style platforms:** the Nedbank API Marketplace (OAuth 2.0; Authorisation and Subscription APIs; sandbox).
5. **A duress signal into the bank's fraud operations:** Discovery Bank's panic code (built in-house). Valor *claims* bank fraud-desk alerts with unnamed banks. **No public example was found of a SA bank taking a third-party duress or risk signal into its fraud engine.** That is both VUKA's opening and its hardest sale.
6. **Acquisition:** Nedbank and iKhokha.

---
## 7. Recommendation: three offers each, and the first pilot (all PROPOSED)

**To Nedbank** (Nedbank has no public coercion feature, while its peers FNB, Discovery and Capitec do):
- **N1. A duress risk signal into Fraud Operations, starting observe-only.**
  - VUKA sends a signed webhook (ADR-0037 `BankSignal`) carrying a pseudonymous partner reference and the trigger: `duress_signal`, `no_answer` or `contact_lost`.
  - Nedbank's own rules and people decide what to do. **The signal is never enough on its own to act.**
  - It answers the NFO case directly: the bank called, the client said yes under duress. A signal sent earlier through a separate channel gives the fraud team something to weigh against that "yes".
  - Built today: simulated bank only (`docs/venture/01-B2B-ENTERPRISE.md:21`).
- **N2. VIGIL as a value-added service inside the Money app, on the GuardMe model.**
  - Start with a white-label build or deep link, and move to an SDK later.
  - Price against GuardMe's R19.90 and the repo's R20 per member per month (ASSUMPTION).
  - Pair with an existing responder (for example AURA) rather than building armed response. Whether AURA accepts third-party triggers is not verified.
- **N3. ANCHOR records for disputes and ombud complaints.**
  - With the member's consent, the disputes team gets a timeline it can verify itself: when the signal existed, and that it has not been changed.
  - It does not show what happened and is not proof of duress.
  - Possible route: the API Marketplace VAS / partner track, or a direct agreement.

**To an insurer** (lead with iTOO/Hollard because it sells express-kidnapping and theft-of-funds cover; OUTsurance or Momentum as value-add partners):
- **I1. A claim-verification API (ANCHOR)** for theft-of-funds and express-kidnapping claims. Measure investigation time and the number of claims it touches. A missing record must **never** count against a claimant (G38).
- **I2. VIGIL bundled with personal cyber or express-kidnapping cover** as a value-add, priced per policy. The actuary test from the repo: the insurer must save at least 12 × the price per member per year.
- **I3. The trigger layer for the insurer's existing panic button.** VIGIL's check-in, no-answer deadline and covert trigger feed the insurer's AURA or Secura dispatch.

**First pilot (PROPOSED; the numbers are planning figures, not commitments):**
- **Phase 0, about 6 weeks, paperwork. All of this is needed before any partner data flows:**
  - Move data to Azure South Africa North, or document an s72 basis.
  - Sign a POPIA s21 operator agreement.
  - Complete an independent penetration test.
  - Commit to an incident-notification time that lets the partner meet its 24h duty under JC 5/2026.
  - Answer the partner's vendor questionnaire.
  - Write the interface spec from the `BankSignal` contract.
- **Phase 1, 90 days, observe-only:** one partner, a cohort of **up to about 300** consenting staff or volunteers (PROPOSED). Signals go to a named fraud-ops queue and the bank takes **no automatic action**. Measure:
  - false check-ins per member per week,
  - p95 alert delivery time,
  - stand-down rate,
  - ops minutes per signal,
  - a member-comfort survey (insight 3).
- **Phase 2, 9–12 months:** **up to 5,000** consenting members (repo ASSUMPTION, `docs/venture/01-B2B-ENTERPRISE.md:80`). The signal becomes a live risk input; the bank decides any hold. In the insurer version, measure claims touched and investigation time.
- **Commercial terms:** a paid pilot or a set-up fee (unpriced). Exit thresholds agreed *with* the partner, not set by us. On exit, the partner's members' data is deleted.
- **No detection-accuracy claim** until a method and n exist.
- **Entry route:** YouthX enterprise-development mentorship to get introductions to Nedbank Digital Channels and Financial Crime Risk Management. Separately, approach AURA as a possible channel.

**Risks to present honestly:**
- Discovery built its panic code in-house and is patenting it.
- Capitec's CIO argues duress PINs backfire once they are publicised.
- False alarms cost money: Discovery's misuse fee is R1,000–R2,000.
- Valor already claims bank fraud-desk alerts.
- SABRIC attributes most digital fraud to social engineering, not coercion. The coercion share of losses is unknown.


## KEY FACTS
- [FACT] Active Nedbank Money app clients rose 14% to 3.0 million in FY2025; digitally active retail clients (Personal and Private Banking) 3.4 million; group reached 8 million clients — https://group.nedbank.co.za/news-and-insights/press/2026/a-transformation-year-as-nedbank-positions-for-growth.html (2026-03-03)
- [FACT] Nedbank Money app has fraud awareness screens shown when the app is opened during a call (user must confirm they know the caller), in-app Approve-it (SIM-swap defence), MoneyGuard SMS Y/N card-fraud check, card freeze and virtual cards with limits; no panic or duress feature found — https://personal.nedbank.co.za/home/fraud-awareness/banking-safely/money-app-security.html (undated page; searched 2026-10-18)
- [REPORTED] Entersekt mobile-PKI authentication has run on Nedbank's apps since 2012 (App Suite, then Money): a precedent for a third-party security SDK inside the Nedbank app — https://www.entersekt.com/resources/nedbank-and-entersekt-mobile-authenticat (vendor case study, undated)
- [REPORTED] Nedbank prevented over R7.5bn of application fraud in 2024, with losses under about R50m (application fraud only) — https://www.itweb.co.za/article/nedbank-fends-off-r75bn-in-cyber-fraud-attempts/KWEBb7yLlyGvmRjO (2025-05)
- [FACT] Nedbank API Marketplace: PSD2-aligned, OAuth 2.0, partners must first subscribe to the Authorisation and Subscription APIs, sandbox reached via a register-interest form; includes a Value Added Services API; named Best Open Banking APIs South Africa 2021 — https://api-marketplace.nedbank.co.za/blog/signing-up-for-api-marketplace.html (undated; award 2021)
- [FACT] Nedbank agreed to acquire iKhokha for about R1.65bn (100%, all cash) — https://group.nedbank.co.za/news-and-insights/press/2025/nedbank-acquires-ikhokha.html (2025-08-13)
- [REPORTED] YouthX 2026: ages 18-26, entries 14 Aug to 9 Oct 2026, winners announced 21 Nov 2026; support includes mentorship through Nedbank's enterprise development team; no public top-50 list found — https://hypemagazine.co.za/?p=119155 (2026)
- [FACT] Nedbank Insurance lists MyCover (buildings, contents, vehicle, valuables, personal legal liability), MyCover Life (R100k-R3m), Credit Life and an Accidental Death Plan (Nedgroup Life); no kidnap or personal-safety product found — https://nedbank.co.za/content/nedbank-insurance/desktop/gt/en/aboutus/about-nedbank-insurance/About-us.html (searched 2026-10-18)
- [FACT] Discovery Bank Panic Code (Digital Account Vault): app looks normal, fraud team silently alerted, live location shared, may involve police and dispatch armed response; transactions keep processing — https://www.discovery.co.za/bank/blog-security-code-and-panic-code-keep-you-safer (announced 2025-03-27; launch reported 2025-06-04)
- [REPORTED] A Discovery Bank client who entered the panic code by mistake was charged a R1,000 misuse penalty (full fee R2,000) — https://www.ewn.co.za/discovery-bank-launches-panic-code-security-feature-but-be-aware-that-misuse-could-cost-you (2025-06-04)
- [REPORTED] FNB GuardMe (AURA-powered in-app panic button) costs R19.90 per member per month after 3 free months, with up to 100% eBucks back capped at 6 members; launched April 2022; 2026 status not confirmed — https://www.itnewsafrica.com/2022/04/fnb-partners-with-aura-to-keep-customers-safe/ (2022-04 (eBucks page undated))
- [REPORTED] Capitec rolled out real-time payment risk warnings from 2025, and a branch-only hidden account ('Secret/Secure Safe') used by about 75,000 accounts in its first month; a 'Trusted Approver' (a nominated person approves payments) is reported as in development or rolling out — https://techfinancials.co.za/2026/09/01/capitecs-ai-saved-clients-r699-million-in-2026-blocking-113410-fraud-cases/ (2026-09-01)
- [REPORTED] Capitec CIO Andrew Baker argues a duress PIN makes clients less safe because a marketed secret becomes known to criminals — https://andrewbaker.ninja/2026/08/01/capitec-secure-safe-why-a-duress-pin-makes-you-less-safe-not-more/ (2026-08-01)
- [FACT] Standard Bank holds payments to new, once-off or changed beneficiaries for 2 hours; Immediate Payments run 06:00-17:00 capped at R200,000 — https://community.standardbank.co.za/t5/Key-app-features/Immediate-Payments-on-the-Mobile-Banking-App/m-p/424284 (undated)
- [FACT] Absa holds the first and second payments to a new beneficiary for 1 hour; immediate payments capped at R5m on weekdays and R25,000 after hours — https://www.absa.co.za/self-service/digital-banking-services/online-banking/make-payments/ (undated)
- [REPORTED] Valor (BYY Strategic Services), a voice-activated panic app, claims to alert the user's bank fraud department and claims partnerships with unnamed SA banks — https://www.engineeringnews.co.za/article/voice-activated-valor-panic-app-aimed-at-enhancing-safety-2025-03-31 (2025-03-31)
- [FACT] SABRIC: criminals force victims to move money through banking apps after hijackings and robberies; advice is to keep less money in easy-access accounts — https://www.sabric.co.za/hijackers-force-banking-app-transfers-in-rising-crime-trend/ (2026-03-23 (TimesLive date))
- [FACT] SABRIC 2024 statistics: total financial crime losses R2.7bn (down from R3.3bn); digital banking 65.3% of incidents; digital banking cases 31,612 to 64,000 and losses R1bn to over R1.4bn; attributed to social engineering — https://www.sabric.co.za/?p=3440 (released ~2025-08)
- [REPORTED] NFO case: a kidnapped client lost R103,092; the bank's fraud system flagged and called, the client confirmed under duress; NFO found the bank not negligent; bank paid part as goodwill — https://businessreport.co.za/business/2025-03-18-kidnapped-for-cash-the-growing-crisis-of-express-kidnappings-and-bank-liability-in-south-africa (2025-03-18)
- [REPORTED] SAPS kidnapping counts: 4,466 / 4,772 / 4,775 / 4,478 across 2025/26 quarters; 4,251 in Q1 2026/27; ransom kidnappings 231 in Q1 2026/27; no separate express-kidnapping count — https://businesstech.co.za/news/government/873160/disturbing-crime-trend-targeting-people-in-south-africas-richest-province/ (2026-09-03)
- [FACT] iTOO [My]Cylution personal cyber is underwritten by Hollard and comes in five packages (Mega, Giga, Tera, Peta, Exa) — https://www.psg.co.za/documents/get-a-quote/psg_mycylution_brochure.pdf (undated brochure)
- [REPORTED] iTOO personal cyber pricing conflicts: base from R22.50/month (SureStart, ~3 years old) vs a broker quote page showing R85-R325/month with express kidnapping only in the top two tiers (R50k and R100k cover) — https://www.cybercovered.co.za/quote-for-personal-cyber-insurance (undated; SureStart page ~2023)
- [REPORTED] iTOO family kidnap-and-ransom policy from about R15,000 per year; payouts reimburse after the event — https://www.fanews.co.za/article/non-life/15/personal-lines/1005/rising-demand-for-kidnap-and-ransom-cover-amid-increasing-risks/40185 (2024-09)
- [FACT] Discovery 911 virtual panic button in the Discovery Insure app: security through AURA, medical through Netcare911; launched with AURA — https://www.mynewsdesk.com/za/discovery-holdings-ltd/pressreleases/aura-partners-with-discovery-to-power-launch-of-discovery-911-emergency-response-service-3452363 (2026-06-03/04)
- [REPORTED] Discovery 911 pricing: R55/month app-only; R70 / R95 / R140 for 1 / 2 / up to 5 subscriptions (seen in one search extract, not in the press release) — https://www.discovery.co.za/car-and-home-insurance/discovery-911-virtual-panic-button (2026-06)
- [REPORTED] OUTsurance Help@OUT Panic Assistance (AURA) is free for policyholders; R199/year for non-clients — https://businesstech.co.za/news/industry-news/568808/outsurance-clients-enjoy-immediate-medical-or-armed-response-service-at-no-extra-cost/ (2022)
- [FACT] Momentum Insure Safety Alert panic button is free for car and home policyholders plus one nominated user; 1,800 armed responders — https://momentum.co.za/momentum/personal/products/car-and-home/safety-alert (undated page (launched 2019))
- [REPORTED] King Price code red in-app panic button with Secura (more than 280 armed-response companies) for a 'nominal' monthly fee; amount not published — https://www.fanews.co.za/article/non-life/15/general/1217/king-price-launches-app-based-emergency-response-service/31187 (2021-02)
- [REPORTED] AURA sells B2B2C on a per-user-per-month subscription through partners (FNB, Momentum, Tracker, Investec, OUTsurance, Uber, Discovery Insure); integrates by API in the partner app or a white-label app; 1.2m paying subscribers globally — https://techcabal.com/2025/05/16/south-africa-founded-aura-raises-14-6-million/ (2025-05-16)
- [REPORTED] Bolt replaced Namola with the AA as its SOS emergency provider; free to users — https://aa.co.za/bolt-partners-with-the-automobile-association-aa-to-provide-emergency-response-services-for-its-drivers-and-passengers (2023-04)
- [REPORTED] Joint Standard 1 of 2023 (IT Governance and Risk Management) effective 15 Nov 2024 — https://www.ensafrica.com/news/detail/7867/fsca-and-pa-publish-joint-standard-1-of-2023- (2023-11)
- [REPORTED] Joint Standard 2 of 2024 (Cybersecurity and Cyber Resilience Requirements) effective 1 June 2025 under Joint Notice 1 of 2024; applies to banks and insurers — https://www.moonstone.co.za/cybersecurity-joint-standard-commencement-date-confirmed/ (2024-06)
- [FACT] Joint Communication 5 of 2026 / Joint Notice 2 of 2026: material IT/cyber incident template effective 1 Sep 2026; initial notice within 24h of classification, update within 14 days — https://www.resbank.co.za/en/home/publications/publication-detail-pages/prudential-authority/pa-public-awareness/Communication/2026/joint-communication-5-of-2026-determination-of-notification-template-for-material-it-and-cyber-incidents (2026-09-01)
- [FACT] Guidance Note 5 of 2014 'Outsourcing of functions within banks' issued under Banks Act s6(5), read with Regulation 39; board remains accountable — https://lawlibrary.org.za/akn/za/statement/guidance-note/sarb/2014/5/eng@2014-07-08 (2014-07-08)
- [REPORTED] Directive D3/2018 with Guidance Note G5/2018 on cloud computing and offshoring of data (banks), mandatory for material arrangements from 1 Oct 2018 — https://www.bakermckenzie.com/en/insight/publications/alerts/2025/08/south-africa-fsca-pa-guidance-on-cloud-and-data-offshoring (2025-08)
- [FACT] Joint Communication 2 of 2025 on cloud computing and offshoring of data issued 25 Jul 2025; a binding Joint Standard is in development, with consultation reportedly in 2027/28 — https://www.resbank.co.za/content/dam/sarb/publications/prudential-authority/pa-public-awareness/covid-19-response/2025/Joint%20Communication%202%20of%202025%20-%20Cloud%20computing%20and%20offshoring%20of%20data.pdf (2025-07-25)
- [REPORTED] Joint Standard 1 of 2024 (Outsourcing by Insurers) commenced 1 Dec 2024, replacing GOI 5; notify both PA and FSCA; existing arrangements to comply by 30 Nov 2026 or at renewal — https://www.deneys.co.za/thinking/joint-standard-1-2024-new-requirements-outsourcing-insurers (2024)
- [REPORTED] POPIA s21 requires a written operator contract and immediate operator notice of compromise to the responsible party; the Regulator found Dis-Chem in breach of s21(1) for lacking one; breach reports go through the eServices portal (mandatory from April 2025) — https://inforegulator.org.za/wp-content/uploads/2020/07/DIS-CHEM-ENFORCEMENT-NOTICE.pdf (2020 notice; portal 2025-04)
- [FACT] VUKA data currently sits in Azure UAE North with no documented POPIA s72 basis; penetration test not done; operator agreement not drafted — docs/venture/01-B2B-ENTERPRISE.md:90-95 (2026-10-18)
- [FACT] VUKA's bank protective-hold signal exists only against a simulated bank (sim_bank); no real bank integration — docs/venture/01-B2B-ENTERPRISE.md:21 (2026-10-18)
- [PROPOSED] Recommended first pilot: Phase 1 observe-only, up to about 300 consenting staff/volunteers for 90 days; Phase 2 up to 5,000 consenting members for 9-12 months — this report; 5,000 figure from docs/venture/01-B2B-ENTERPRISE.md:80 (ASSUMPTION there) (2026-10-18)

## CONFLICTS/GAPS
- Method limit: WebFetch failed on DNS and curl got 403 CONNECT for every host tried in this session. Every citation comes from search-engine extracts; none of the pages was opened directly. Re-open each URL before any external use.
- iTOO [My]Cylution price conflicts. docs/EVIDENCE.md:23 tags 'from R22.50/month' as FACT from itoo.co.za, but this search found R22.50 only on a roughly 3-year-old SureStart page, and a broker page showing R85-R325/month with express kidnapping only in the top two tiers. Re-verify and consider downgrading the repo tag.
- FNB GuardMe: the R19.90 price appears on the undated eBucks page and in 2022 press; one source says R19.00. No 2026 confirmation that GuardMe is still sold (docs/EVIDENCE.md:24 is already flagged for re-check).
- Discovery Bank panic code date: launch event 27 Mar 2025 vs EWN launch article 4 Jun 2025. The R1,000/R2,000 misuse fee comes only from EWN. The patent claim is unverified.
- Discovery 911 prices (R55 / R70 / R95 / R140) came from one search extract and are absent from the press release; the release is dated 3 Jun on one copy and 4 Jun 2026 on another.
- SABRIC 2024 digital-banking figures conflict: SABRIC's statement (31,612 to 64,000 cases; R1bn to over R1.4bn) vs TechAfrica (about 98,000 cases; R1.888bn).
- No SABRIC or regulator guidance on transfer limits or cooling-off for coerced app transfers was found. The 1-hour (Absa) and 2-hour (Standard Bank) new-beneficiary holds are bank policy pages, undated.
- Nothing found for African Bank; TymeBank only has old tiered-limit data. Hollard (outside iTOO) and Old Mutual iWYZE: no personal-safety or panic product found.
- Nedbank: no official FY2025 digital-fraud loss figure; no public API Marketplace partner list, production-approval process or fees; no public API for receiving third-party risk signals; no Nedbank supplier information-security requirements found.
- Nedbank YouthX 'top 50': no public list. The status rests only on the email recorded in the repo. 2026 YouthX dates come from HYPE Magazine, not a Nedbank page.
- Capitec feature names and status conflict ('Secret Safe' vs 'Secure Safe'; Trusted Approver 'in development' vs 'rolling out'). Sources are an executive's blog, LinkedIn and press, not Capitec product pages.
- Valor: the named partner banks and the price were not found; 'world's first' and the bank partnerships are company claims.
- AURA's partner list, response times and subscriber count are mostly AURA's own claims. Whether AURA accepts third-party triggers (VUKA feeding AURA dispatch) is unverified. That AURA powers Momentum Safety Alert is inferred, not confirmed.
- Joint Standard 1 of 2023: publication date reported as 11 or 15 Nov 2023. Joint Standard 2 of 2024: publication 16 or 17 May 2024. The 12-month compliance window comes from the consultation report, not the standard's text.
- 'Directive 3/2014' on bank outsourcing could not be confirmed; only Guidance Note G5/2014 was found. Whether Directive D2/2019 has been superseded by Joint Communication 5 of 2026 is unconfirmed.
- Joint Standard 1 of 2024 (insurers) transition: sources differ between a 6-month window and a 24-month / 30 Nov 2026 deadline.
- Cybercrimes Act s54 commencement: sources up to 2024 say not in force; no 2025-2026 check against the Government Gazette.
- POPIA eServices portal mandatory date reported as 1 Apr or 17 Apr 2025.
- Whether VIGIL's audio processing makes it special personal information under POPIA (for example biometric) was not researched; a question for counsel.
- Policyholder Protection Rules on bundled or value-added services: only 2021 drafts found; final status unknown. This matters if an insurer bundles VIGIL.

## RECS
- Lead the Nedbank conversation with Offer N1: a duress risk signal into Nedbank Fraud Operations, starting observe-only. Nedbank has no public coercion feature while FNB, Discovery and Capitec do. Frame it around the NFO case where the bank called and the client confirmed under duress. The signal never causes an action on its own; Nedbank's people decide.
- Offer N2 as the adoption route: VIGIL as a value-added service in the Money app on the GuardMe model (white-label or deep link first, SDK later), priced against GuardMe's R19.90 and the repo's R20 per member per month (ASSUMPTION). Pair with an existing responder such as AURA instead of building response.
- Offer N3 and I1 as the evidence product: ANCHOR records, with the member's consent, that disputes or claims teams can verify themselves. Say they show when a signal existed and that it was not altered, never what happened, and never as proof of duress.
- Make iTOO/Hollard the first insurer conversation: it is the only insurer found selling retail express-kidnapping and theft-of-funds cover. Treat OUTsurance, Momentum and King Price as value-add partners where VIGIL is the trigger into their existing AURA/Secura dispatch (I3), not a competing response service.
- Open a channel conversation with AURA. It already runs the panic layer for FNB, OUTsurance, Discovery Insure and Uber, so a VIGIL-to-AURA trigger could reach several institutions through one integration. Unverified whether AURA accepts third-party triggers.
- Close the vendor gate before any partner data flows: move data to Azure South Africa North or document a POPIA s72 basis (also needed under Directive D3/2018); draft a POPIA s21 operator agreement; commission an independent penetration test; commit to an incident-notice time that lets a bank meet its 24h duty under Joint Communication 5 of 2026; prepare an ISO 27001-aligned security pack (certification later).
- Run the pilot in two phases. Phase 0: about 6 weeks of paperwork and interface spec. Phase 1: 90 days observe-only with up to about 300 consenting staff/volunteers. Phase 2: 9-12 months with up to 5,000 consenting members. Measure false check-ins per member-week, p95 alert delivery, stand-down rate, fraud-ops minutes per signal and member comfort. Publish no detection-accuracy figure without a method and n.
- Use the YouthX enterprise-development mentorship only to ask for introductions to Nedbank Digital Channels and Financial Crime Risk Management. Never describe YouthX top-50 status as a commercial relationship.
- Put the counter-evidence in both pitches: Discovery's in-house, patent-pending panic code; Capitec's CIO argument that duress PINs backfire once publicised; Discovery's R1,000-R2,000 false-alarm penalty; Valor's competing bank-alert claim. Differentiate on what VUKA adds: works across banks, guardian no-answer deadlines, and a record anyone can verify.
- Before any external use, update docs/EVIDENCE.md:23-24 (iTOO price conflict, GuardMe 2026 status) after a human re-opens the sources in a browser. This was a read-only task, so no repo files were changed.