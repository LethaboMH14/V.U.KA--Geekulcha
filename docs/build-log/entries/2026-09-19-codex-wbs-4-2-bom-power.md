## 2026-09-19 | Codex assistant | GPT-5 | WBS 4.2 — BOM/power | partial

This entry serves C3 (solution progress). Trust answer: a reviewer can distinguish public listing prices from formal quotes and can see that physical load/runtime are not measured.

**Research** — Read `docs/MASTER-CONTEXT.md`, WBS/team operating instructions, `team/vukosi.md`, `docs/OVERLAPS.md`, and the current build-log convention/template; checked the existing `appliance/` tree and WBS 3.2 context. Retrieved public supplier product pages/search listings for Pi 5, AI HAT+, Camera Module 3 NOIR, 27W PSU, two LiFePO4 battery listings, and candidate power meters; cache/live availability differences are called out in the BOM.

**Real data / references** — **FACT:** On 2026-09-19, PiShop displayed Pi 5 8GB at R3,399.89 inc VAT and a 27W 5.1V/5A PSU at R219.90 inc VAT; its AI HAT+ listing price was R2,179.91 inc VAT, with conflicting stock views (search listing in stock vs direct page out of stock). PiShop's Camera Module 3 NOIR 76° listing showed R539.90 inc VAT and its 200 mm Pi 5 cable showed R18.89 inc VAT. Electromann showed LiFePO4 12.8V/20Ah item 10004351 at R1,095 tax included, shipping extra; Communica showed its distinct BATT 12,8V20 COM at R1,193.70 inc VAT. The Hashrate meter page showed R449, 5–3600W, ±2% claimed accuracy, and sold out. Detailed links/caveats are in `appliance/BOM.md`. These are listing observations only, not supplier quotations. **FACT:** no device/instrument data or power readings were supplied; wattage and runtime remain not measured.

**Business reasoning** — This gives Babatunde and the leads an auditable first cost baseline without overstating completeness or using unsupported runtime economics.

**Competitor reference** — Not applicable: no competitor capability or price comparison is made; this entry is limited to VUKA's candidate BOM and evidence boundary.

Changed: added `appliance/BOM.md`, `appliance/POWER-MEASUREMENT.md`, and `docs/VUKOSI-WBS-4.2-HANDOFF.md`; updated Vukosi's task/status in `team/vukosi.md`; declared the shared hardware/BOM economics claim in `docs/OVERLAPS.md`. No production code, interface, contract, external contact, or purchase changed.

Evidence: public-source links and prices are recorded with VAT/stock/shipping caveats. `git diff --cached --check` passed; the local Markdown-link check passed for 4 files; `python -m unittest discover -s appliance/tests -v` passed 7/7 existing producer tests; `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` passed; `.tools/gitleaks.exe git --redact --config .gitleaks.toml --log-opts=--all` and `.tools/gitleaks.exe dir --redact --config .gitleaks.toml .` found no leaks; `node scripts/test-security.mjs .tools/gitleaks.exe` passed. Draft PR #42 was opened; GitHub `document-contracts` and `secret-scan` checks both passed; Sibusiso and Lethabo review requests are pending. Power measurement: **NOT MEASURED**. Formal supplier quotations: **none obtained**. Human review: **pending**.

Decision: none; BOM parts are **PROPOSED** candidates only. No procurement/design approval inferred.

Needs/blockers: Lethabo — approve physical configuration/procurement path; Vukosi — confirm access to physical appliance and suitable specified analyzer, acquire written quotations, execute raw-data test; Sibusiso — review power/measurement architecture; Babatunde — hold unit economics until the BOM is priced and selected; Khutso — retain quote and measurement lineage.

Business handoff: `docs/VUKOSI-WBS-4.2-HANDOFF.md`.

Next: Vukosi to confirm physical device/meter availability and obtain formal supplier quotes; Sibusiso/Lethabo review before execution or purchase. Proposed schedule dates in the prior task table are assumptions; rebaseline with leads because the 2026-09-17 WBS 4.2 date has passed.
