# VUKA compliance and governance — POPIA, RICA, Cybercrimes Act, Play policy

> **Owner:** Ipeleng Constance Modise. **Issued** 23 Sep 2026 by Lethabo (co-lead). **Status:** `PROPOSED`.
> **Serves:** S, B. **Not legal advice.** ⚑ marks a point that needs counsel or a primary-text read before it goes on a slide. Statutory quotes below come from the Accessible Law copy of POPIA (popia.co.za) and cybercrimesact.co.za, retrieved 23 Sep 2026; both are secondary copies ⚑ until checked against the Gazette.
> Companions: `docs/security/SSDLC.md` (controls C-nn), `docs/security/THREAT-MODEL.md`, `docs/VUKA-2-SPEC.md` §13, `docs/POPIA-IO-REGISTRATION.md`, [RICA position](../RICA-POSITION.md).

---

## 1 · Who is responsible

- **Responsible party:** Team SONAR, building VUKA. `FACT`: no company registration number exists anywhere in this repository (`docs/POPIA-IO-REGISTRATION.md` §2). ⚑ Which legal person is the responsible party before incorporation is a counsel question (Q-C1).
- **Information Officer:** **not registered.** The path is prepared, not submitted; the leads must designate the head (decision D-IO-1). Until then the head of the responsible party carries the duties (`docs/POPIA-IO-REGISTRATION.md` §1). Owner: Lethabo and Sibusiso.
- **Personal information during the event** is the team's own: test journeys carry real team phones' locations, and guardians are team members. Everything else is a `sim_` fixture.

## 2 · POPIA obligations → controls → evidence

| # | Obligation (section) | Text (short quote) | VUKA control | Evidence / test | Status | Owner |
|---|---|---|---|---|---|---|
| PO-1 | Lawful basis (s11(1)(a)) | processing only if "the data subject … consents to the processing" | Member consents at onboarding; each guardian consents at acceptance (spec §13, G6) | Onboarding and acceptance screens; privacy policy | **In build** | Ipeleng, Mutarisi |
| PO-2 | Withdrawal (s11(2)(b)) | may "withdraw … consent … at any time" | `DELETE /v1/subjects/{id}/data`: 72 h cooling-off, then payload and salt removed (§9, §13) | T04 after deletion | **In build** | Sibusiso |
| PO-3 | Residuals after withdrawal | — | Coarse class, time, actor id, journey id, hashes and public keys kept for chain integrity (§13) | Privacy-policy text (PR #43 S3) | ⚑ **Q-C2:** which s11 ground covers the residual after consent is withdrawn | Ipeleng |
| PO-4 | Notice (s18(1), s18(2)(a)) | "before the information is collected" | Member notice at onboarding; guardian s18 notice at acceptance (G6) | Screens; `docs/PRIVACY-POLICY.md` | **In build** (Sat 18:00) | Ipeleng |
| PO-5 | Minimality | quote NOT FETCHED this session | Never collected: raw audio, camera images, contacts beyond guardians, banking credentials; location only on `signal_detected` (§13, V9) | T41, T46 | **In build** | Vukosi |
| PO-6 | Retention | quote NOT FETCHED this session | Payloads and salts 90 days unless a dispute hold (P2) | Retention job; test to be added with P3.A3 | **Planned** | Sibusiso |
| PO-7 | Security safeguards (s19(1), s19(2)) | "identify all reasonably foreseeable internal and external risks"; "regularly verify that the safeguards are effectively implemented" | This SSDLC, the threat model and the internal test plan | `docs/security/` | **In build** | Ipeleng |
| PO-8 | Operators | s20/s21 text NOT FETCHED this session | Named operators: hosting (Azure), Google (FCM), the SMS gateway, Hedera (hashes only) (§13) | Privacy policy | ⚑ **Q-C3:** written operator terms for each; the demo uses standard provider terms | Lethabo |
| PO-9 | Breach notification (s22(1)–(3)) | notify "as soon as reasonably possible after the discovery" | Runbook, eServices portal | `SSDLC.md` §12.1; tabletop C-121 | **In build** | Ipeleng |
| PO-10 | Subject access | s23 text NOT FETCHED this session | `GET /v1/subjects/{id}/export` and `/record` to the authenticated subject (A5) | T19, T49 | **In build** | Sibusiso |
| PO-11 | Cross-border (s72(1)) | may not transfer to a foreign third party unless adequate protection, or "(b) the data subject consents to the transfer" | Azure **South Africa North** if the student subscription allows; otherwise record the s72 basis. FCM (Google) processes outside SA: disclosed in the notice and consented | Deployment record (Sibusiso); privacy policy | ⚑ **Q-C4:** is consent in the notice enough for FCM, or is s72(1)(a) needed | Sibusiso, Ipeleng |
| PO-12 | Public ledger | — | Only 33-byte typed messages; no personal data or key material on chain (§10) | T19, HD-3 | **In build** | Sibusiso |
| PO-13 | Children | — | `PROPOSED`: the demo and any pilot are for adults (18+); no child accounts | Onboarding copy | **Planned** | Lethabo |
| PO-14 | Biometrics | — | YAMNet classifies *what sound*, never *who* spoke; no voice recognition (duress doc §8) | Model card; T41 | **In build** | Vukosi |

## 3 · RICA

Our position is in [RICA-POSITION.md](../RICA-POSITION.md). It was written for the four-layer design, but its two bright lines carry over unchanged to VIGIL: **audio never persists**, and **no audio is ever attached to a record**. `docs/STAGED-DURESS-DEFENCE.md` §8 records that the RICA s1 "intercept" definition was read from primary text on 23 Sep; the counsel question stands. Controls: C-18 (no audio written), T41 (storage sweep). Status: **In build**.

## 4 · Cybercrimes Act 19 of 2020 — the s54 reporting duty

**What s54 says.** An "electronic communications service provider or financial institution" that becomes aware its service or network "is involved in the commission of" certain Chapter 2 offences must report to SAPS "not later than 72 hours after having become aware of the offence" (s54(1)(a)). Failure is an offence with a fine "not exceeding R50 000" (s54(3)). Source: https://cybercrimesact.co.za/section-54-obligations-of-electronic-communications-service-providers-and-financial-institutions/ (retrieved 23 Sep 2026).

**Does it apply to VUKA? No, today, for three separate reasons:**
1. **Not in force.** The same source carries the note "[Commencement date of section 54: To be proclaimed]". ⚑ Confirm against the Government Gazette before any slide says so.
2. **Not an electronic communications service provider.** s1 defines one as a person who provides an electronic communications service "under and in accordance with an electronic communications service licence" under the Electronic Communications Act, 2005, or who is deemed licensed or exempt. VUKA holds no such licence and provides an application that runs over other providers' networks. ⚑ Counsel to confirm that an app provider is not "exempted from being licenced" in the s1 sense (Q-C5).
3. **Not a financial institution.** s1 points to "section 1 of the Financial Sector Regulation Act, 2017". VUKA is not one. That Act's text: NOT FETCHED this session ⚑.

**What follows.** A partner bank *is* a financial institution and will carry its own s54 duty once proclaimed. VUKA's risk signal is not that bank's report and must not be sold as one. Staging an event remains cyber fraud, forgery and uttering under ss8–9 (duress doc §2, ⚑).

## 5 · Information Regulator — security-compromise route

"as of 01 April 2025, [the eServices portal] is mandatory for all organisations to report any security compromises using the portal, rather than via email" (Information Regulator media statement, 7 Apr 2025, https://inforegulator.org.za/wp-content/uploads/2025/04/MEDIA-STATEMENT-INVITATION-TO-REPORT-SECURITY-COMPROMISES-THROUGH-THE-eSERVICES-PORTAL-.pdf). The portal is https://eservices.inforegulator.org.za/compromises/default.aspx. The Regulator also publishes a step-by-step guide (https://www.inforegulator.org.za/wp-content/uploads/2025/05/stepbystepguide.pdf — found by search, not read this session). **Blocker:** reporting needs a portal account for the responsible party, which follows IO registration (D-IO-1).

## 6 · Android platform and Google Play policy

| Rule | Source (retrieved 23 Sep 2026) | Our control |
|---|---|---|
| "you cannot create a `microphone` foreground service while your app is in the background" | Android 14 foreground-service types, https://developer.android.com/about/versions/14/changes/fgs-types-required (page updated 21 Sep 2026) | Journey mode only; no boot receiver (V1, V10, G24) |
| Stalkerware: "Code that collects personal or sensitive user data from a device and transmits the data to a third party (enterprise or another individual) for monitoring purposes." | Play Console Help, Malware policy, https://support.google.com/googleplay/android-developer/answer/9888380 | See below |
| "Apps must present users with a persistent notification at all times when the app is running and a unique icon that clearly identifies the app." | same page | V2 neutral persistent notification |

**Our reading** `ASSUMPTION` (checked by Ipeleng against the full policy before any Play listing): VIGIL sends location to other adults, the guardians, so a reviewer could read it against the stalkerware definition. Our defences are that the member installs it on their own phone, arms each journey in the foreground, sees a persistent notification, and can see and remove guardians. No Accessibility API, no hidden icon. The page's rules on which monitoring uses are allowed were only available to us as a summary, not verbatim; ⚑ **Q-C6** before Play. **The hackathon build is sideloaded from GitHub Releases** (D1), so Play policy does not bind the demo.

## 7 · Governance controls

| ID | Control | How it works | Evidence | Status |
|---|---|---|---|---|
| GV-1 | **Honesty ledger** as a security control | Claims we refuse ("unhackable", "court-admissible", "proof of duress", "invisible"); `sim_` and SIMULATED labels; "not measured" is an answer | `docs/MASTER-CONTEXT.md` §6; spec §17; RG3 in `SSDLC.md` §11 | **Done** |
| GV-2 | ADR append-only; acceptance recorded per decision | A decision binds only with a named acceptor and a linkable record | `docs/adr.md`; `docs/ADR-ACCEPTANCE-RECORD.md` | **Done** |
| GV-3 | Security review before contract freeze | Ipeleng's review with conditions B1–B3, S1–S4 | `docs/ADR-ACCEPTANCE-RECORD.md` closure table; `SSDLC.md` §13 | **Done** (review) / conditions **Open** |
| GV-4 | Two-signature rule | Two distinct operators for deletion, threshold changes, key rotation (ADR-0036(8)) | T48 | **Planned** |
| GV-5 | Review routing | CODEOWNERS; both leads for contracts, ADRs, security and governance (`RULES.md`) | `.github/CODEOWNERS` | **Done**; not enforced remotely (G17) |
| GV-6 | Rules from comments become rules | A finding in a thread goes into `RULES.md` or a standing doc | `RULES.md` | **Done** |
| GV-7 | No generative model in the product | ADR-0038 | code review; S4 | **Done** (decision) |
| GV-8 | Absence of a record is never evidence against anyone | Partner agreements carry this line (duress doc layer 7) | Partner template (pilot) | **Planned** |

## 8 · Questions for counsel (⚑)

| # | Question | Why it matters |
|---|---|---|
| Q-C1 | Who is the responsible party before incorporation? | IO registration and portal account |
| Q-C2 | Which s11 ground covers the residual record after consent is withdrawn? | §13 keeps hashes permanently |
| Q-C3 | Are standard provider terms enough as s21 operator contracts for Azure, Google and the SMS gateway? | Operators are named in the policy |
| Q-C4 | Is consent in the s18 notice a sufficient s72 basis for FCM? | Alerts transit Google |
| Q-C5 | Could an app provider be "exempted from being licenced" and so an ECSP under the Cybercrimes Act? | s54, once proclaimed |
| Q-C6 | Does a self-installed personal-safety app that shares location with chosen adults fall under Play's stalkerware policy? | Play listing after the event |
| Q-C7 | Are salted, hashed Merkle roots on a public ledger personal information? | PO-12, deletion semantics |

## 9 · Limits

Sections 10, 14, 20, 21, 23 and 24 of POPIA and the Financial Sector Regulation Act were not read this session; the rows that depend on them say NOT FETCHED. Nothing here is a compliance claim.
