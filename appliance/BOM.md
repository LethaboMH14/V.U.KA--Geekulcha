# KHAYA candidate BOM and price evidence

**Status: PROPOSED.** This is a preliminary candidate list for WBS 4.2, not an approved design, purchase order, or production bill of materials. It serves judging criterion C3 (solution progress) by making candidate costs and omissions auditable. A real operator should be able to inspect each source and distinguish listed prices from supplier quotations.

## Evidence boundary

- **FACT:** Public supplier page/search-listing observations below were captured on 2026-09-19 (Africa/Johannesburg). Some results are cached snapshots; any stock wording is only what the source displayed, not a live confirmation from the supplier. Amounts and stock states can change.
- **FACT:** These are web-listed prices, not formal, dated, addressed supplier quotations. No supplier was contacted and no order was placed in this work.
- **FACT:** No physical KHAYA appliance, power meter, measured wattage, or runtime evidence was supplied or found in this checkout.
- **PROPOSED:** Treat all components as candidates until compatibility, environment, safety, and price are reviewed by Vukosi, Sibusiso, Lethabo, and Babatunde within their roles.
- **ASSUMPTION:** Quantity is one of each priced candidate for a single prototype; no quantity commitment or repeat-unit cost is inferred.

## Public price observations

All prices are South African rand (ZAR). Where the seller says “inc VAT” or “tax included,” that is reproduced below. Shipping, adapter, and volume prices are not silently folded into the listed price.

| Subsystem | Exact candidate listing | Price and listing evidence | Important caveat |
|---|---|---|---|
| Edge compute | Raspberry Pi 5 8GB, PiShop model `Pi58 board` | **FACT:** R3,399.89, VAT included; the page snapshot reported 554 in stock (not independently reconfirmed). [PiShop product page](https://www.pishop.co.za/store/raspberry-pi-5/raspberry-pi-5-model-b-8gb) | This is board-only. Its page says a 5V/5A USB-C supply, case, active cooler, and storage are separate items. Not an outdoor-ready assembly. |
| Optional accelerator | Raspberry Pi AI HAT+ 26T, Hailo-8, model `RPi AI HAT+ 26T` / product title `HRP1LB1C2MA` | **FACT:** R2,179.91, VAT included, shown in PiShop search/product listing. [PiShop product page](https://www.pishop.co.za/store/raspberry-pi-ai-hat--26t-hrp1lb1c2ma-hailo8l) | **FACT:** The listing search view reported 20 in stock, while the direct product-page view during this research showed “Out of Stock.” Treat availability as unconfirmed and request a fresh written quote. Accelerator/model compatibility and thermal/power impact have not been tested here. |
| Camera candidate | Raspberry Pi Camera Module 3 NOIR standard (76° lens), product label `Cam 3 NOIR standard 76` | **FACT:** R539.90, VAT included in the PiShop category/product listings. [PiShop listing](https://www.pishop.co.za/store/raspberry-pi-camera-module-3-noir-standard-76-lens) | The PiShop description says a different CSI cable is needed for Raspberry Pi 5. **FACT:** A 200 mm Pi 5 camera adapter cable is separately listed at R18.89, VAT included. [PiShop camera list](https://www.pishop.co.za/store/module-3-cameras). No night-time detection result or field-of-view suitability is claimed. |
| Bench / mains supply | Official Raspberry Pi 27W USB-C PSU, black, model `Pi5 5A27W EU black` | **FACT:** R219.90, VAT included; PiShop's search listing reported 300 in stock (not independently reconfirmed). It lists output profiles including 5.1V/5A. [PiShop product page](https://www.pishop.co.za/store/raspberry-pi-official-27w-usb-c-power-supply-black-51v-5a-psu-type-eufor-pi5) | Product is marked Type EU and seller says a euro plug adapter is also needed. Adapter price is not included. This is a mains bench supply candidate, not the battery conversion/charger design. |
| Battery option A | Electromann SA `10004351`, 12.8V 20Ah LiFePO4 with built-in BMS | **FACT:** R1,095.00, tax included; shipping calculated at checkout; page displayed in stock and “usually ships out the same day.” [Electromann product page](https://electromannsa.co.za/products/lifepo4-20ah-12-8v-rechargeable-battery) | Vendor explicitly warns not to connect batteries in series. It is not a drop-in Pi supply. The page's stated dimensions differ from the other vendor's similarly described battery, so treat this as a distinct SKU, not an identical substitute. |
| Battery option B | Communica `BATT 12,8V20 COM`, 12.8V 20Ah LiFePO4 | **FACT:** R1,193.70 inc VAT (R1,038.00 ex VAT); page displayed in stock, 2–5 working-day delivery, and free shipping for orders over R1,000. Page lists 256Wh typical energy, built-in BMS, and 20A max charge/discharge. [Communica product page](https://www.communica.co.za/products/batt-12-8v20-com) | Distinct SKU and price from option A; do not combine both in one BOM. The listed nominal energy does not establish usable energy or runtime in KHAYA. |

No subtotal is reported: this candidate list is incomplete, contains an out-of-stock/availability-conflicted accelerator, and includes mutually exclusive battery options. Any subtotal could be mistaken for a complete build cost.

## Unpriced / unresolved lines

These are **not quoted** and must remain in any complete cost model:

- **FACT:** Raspberry Pi 5 listing identifies cooling, storage, and enclosure as separate items; no exact production choices/prices are selected here.
- **NOT QUOTED:** Outdoor enclosure with a verified installation method, thermal design, cable glands, and mounting hardware. A [Daynight Electrical IP66 enclosure listing](https://daynightelectrical.co.za/products/plastic-enclosure-with-chassis-plate-6) was found, but no price could be verified in the accessible page. IP rating alone does not establish that a completed installation is weatherproof.
- **NOT QUOTED / DESIGN REQUIRED:** Safe 12.8V battery charging, regulated 5.1V output, power-path/load sharing, fusing, low-voltage cutoff, connectors, and wiring. Do not connect the listed battery directly to the Raspberry Pi. No such circuit is approved or tested by this document.
- **NOT QUOTED:** Siren/alert output, tamper switch, sensor/mounts, storage card, heat-management parts, backup communications, and installation labour.
- **NOT QUOTED:** A suitable, currently obtainable measurement instrument for low-load active power and accumulated Wh. The [Hashrate Killawatt page](https://www.hashrate.co.za/products/digital-watt-meter-killawatt) displayed R449, a 5–3600W range and ±2% claimed accuracy, but also displayed “Sold Out.” Its stated lower limit may not cover a low appliance state. No instrument was purchased or used.

## Quote request needed to close WBS 4.2

**PROPOSED:** Request written, dated quotations for the chosen exact SKUs and quantities. Ask each supplier to state VAT, shipping to the actual delivery area, stock/lead time, quote validity, and substitutions explicitly. First resolve the accelerator stock conflict, Pi 5 plug/adaptor choice, battery architecture, enclosure, and missing safety/power-path parts. No vendor outreach or procurement is authorized or represented by this entry.

**Decision state: none.** This file records candidates, not a selection. WBS 4.2 is only partially evidenced until formal quotes and physical power measurements are attached.
