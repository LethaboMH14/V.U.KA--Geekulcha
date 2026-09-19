# KHAYA power measurement procedure

**Status: PROPOSED procedure; NOT MEASURED.** This supports criterion C3 by turning a future appliance test into a repeatable, reviewable observation rather than a runtime claim. A user should be able to see the exact test setup, instrument, operating state, and raw readings behind any reported number.

## Current evidence

- **FACT:** No physical KHAYA appliance or power-meter reading was supplied or recorded in this checkout as of 2026-09-19.
- **FACT:** The candidate Raspberry Pi 5 is listed for 5V/5A USB-C input; that is the supplier/board input specification, not a measurement of KHAYA power draw.
- **FACT:** Battery runtime, idle/peak wattage, energy per event, mains-loss behaviour, and recovery time are all **not measured**.
- **FACT:** WBS 4.2's planned date in the team schedule is 2026-09-17; that date is past as of 2026-09-19. The schedule labels dates as assumptions, and no rebaseline is approved here. WBS 4.4 is not evidenced by this procedure.

## Safety and instrument gate

1. Identify and photograph/list the exact appliance revision, board, camera/sensors, accelerator, cooling, storage, network equipment, output loads, PSU, firmware/software commit, and all connected peripherals. Record any absent component; do not substitute a different setup without labelling it.
2. Use a properly rated true/active-power energy analyzer or plug meter that matches the local plug/supply and whose documented voltage, current, power, energy range, resolution, and uncertainty cover the expected load. Record make/model/serial, calibration certificate or manufacturer accuracy specification, calibration date if available, and measurement interval. A displayed number without range/accuracy is not measurement evidence.
3. The only identified watt-meter candidate with a published accuracy/range in the research was listed as sold out, with a 5W lower power range. Do not use it as evidence unless availability is confirmed and the instrument's floor is shown to cover the observed load. If the appliance may operate below the instrument's lower limit, obtain a suitable low-power analyzer or laboratory instrument first.
4. Measure at the complete assembly's AC input for wall energy, including PSU losses. If measuring the battery/DC path later, use an appropriately rated DC energy meter and an approved, fused converter/power-path. Do not open or probe mains wiring. Have a competent person set up mains equipment; stop if the plug, wiring, enclosure, grounding, or instrument rating is uncertain.
5. Keep the system under observation on a safe bench. Record room conditions and ambient temperature if they may affect fan/thermal behaviour. No unattended battery discharge or deep-discharge test is authorized by this procedure.

## Proposed run protocol

The values below are **PROPOSED protocol choices**, not observed duration, test results, or a claim that any hardware can yet perform these states. Sibusiso and Vukosi should review the instrument and operating-state choices before executing.

1. Verify the unit configuration and instrument gate above. Photograph meter start values and instrument setup; record the system clock source and timezone.
2. Allow the device to boot and stabilize. **PROPOSED:** record each test state for 15 minutes after stabilization, with the instrument logging at one-second intervals where the instrument supports it. If it cannot export samples, record start/end Wh and take timestamped display photographs at fixed intervals; report that coarser method.
3. Repeat each executable state in **PROPOSED three independent runs**. Do not pool runs if hardware, workload, or ambient conditions differ. These sample sizes are a test plan only, not completed experiments.
4. Record separate states when the relevant components exist: (a) boot/startup; (b) idle after boot; (c) camera active without inference; (d) the actual reviewed inference workload; (e) synthetic event creation/queue flush; (f) alert output active; and (g) combined expected load. Mark unavailable states “not run,” not zero. The WBS 3.2 producer only establishes synthetic software events; it does not establish camera, inference, siren, or sensor power.
5. For each run, preserve the raw log/photos and report actual minimum, mean, and maximum active power (W), start/end energy (Wh or kWh), voltage, test duration, sample count, instrument uncertainty/range, and the exact workload. Compute averages only from logged readings and show the formula/source file. Never derive battery runtime from the battery label or a single wall-power reading.
6. Stop and investigate if the system throttles, overheats, reboots, drops power, or exceeds instrument range. Preserve the failed run and its conditions; do not discard it from the evidence set.

## Blank run record

Copy a row per run only when an actual measurement is performed. Leave no number inferred from a component specification.

| Run ID | Date/time + timezone | Appliance revision / commit | State + workload | Meter make/model/serial + accuracy/range | Start/end | Samples | Min/mean/max W | Energy Wh | Conditions / anomalies | Raw evidence path |
|---|---|---|---|---|---:|---:|---|---:|---|---|
| — | **NOT MEASURED** | — | — | No instrument confirmed | — | — | — | — | No physical setup/evidence supplied | — |

## Boundary

This procedure measures a specified setup only. It does not establish sensor accuracy, person-versus-dog classification, physical tamper detection, battery capacity/health, runtime, mains-loss continuity, outage recovery, offline delivery, or field reliability. Those require separate instrumented tests and remain unmeasured until evidence is recorded. Mains/WAN recovery belongs to the dependent WBS 4.4 activity, not this record.
