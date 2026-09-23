# Coercion scenario catalogue (CEM-0)

> **Status:** `PROPOSED`. A catalogue for Lethabo, Ipeleng and Vukosi that feeds ADR-0039. **Generated** by `scripts/coercion_scenarios.py`: never edit this file by hand.
>
> **Every number here is an uncalibrated design prior, not a probability.** The tally is an evidence count in integer decibans (10 db is x10 odds, +3 db is about x2) with every reason shown. It is not the chance that anyone was coerced, and no weight has been fitted to data. M1, M2 and M7 in `docs/VUKA-2-SPEC.md` section 16, and pilot data, will replace them.
>
> **Regenerate:** `python scripts/coercion_scenarios.py` rewrites this file. `python scripts/coercion_scenarios.py --check` exits 1 if it is stale (run by `test/coercion-scenarios.test.mjs`). `--csv PATH` writes the same rows as CSV.

## 1 · What is stored and what is computed

- **Stored** (committed, private): the facts. Each reason's raw inputs (class, `score_bp`, `threshold_bp`, pattern, offsets), PIN outcomes, server outcomes, guardian acknowledgements and bank acknowledgements.
- **Computed at read time, versioned** (`cem_version: CEM-0`): the tally, the band, K, the E-level, 'no acknowledgement by T' and fast-path eligibility. The tally is never written into the chain, so it can be recomputed once calibration exists.
- **Never on chain:** anything except the 33-byte typed roots (`docs/VUKA-2-SPEC.md` section 10).

## 2 · The model in one screen

- **Two outputs, kept apart.** The **response tier** is what the system does, set only by the hard rules (section 4). The **evidence tally** is a sum of reason points. The tally never sets or lowers a tier.
- **Tiers:** T0 record only (motion alone lands here) · T1 check-in ('Journey check') · T2 guardians alerted · T3 guardians alerted + bank protective signal (S1, ADR-0037) · Closed (guardian `stand_down`, or the 6 h auto-close).
- **Decay:** detector reasons (sound, motion) decay with a 120 s half-life: `points x 2^(-dt/120)`, rounded half-up on the magnitude, computed with exact integer comparisons (no floating point). PIN, contact, journey, movement, time, bank and guardian reasons do not decay within an incident.
- **Total** = the sum of decayed points, an integer. **K** = min(P, N) / max(P, N) as an integer percentage, where P is the positive sum and N the absolute negative sum. K of 50% or more reads 'conflicting evidence: guardian judgement'.
- **Bands** (labels, not probabilities): below 5 faint · 5 to 11 some · 12 to 19 strong · 20 to 29 very strong · 30 or more overwhelming. A duress signal always reads **user-signalled**.
- **Fast path** (`PROPOSED`, a decision for Lethabo, not built): if the tally reaches 25 db with no normal PIN while the check-in window is still open, guardians would be alerted before `no_answer`. It is shown beside each tier and never changes it. The bank signal still needs H1 or H4.

### Engine choices where the spec was silent

- Motion corroborates a sound only if the sound comes 0 to 10 s after it (H3's look-back); otherwise the motion is struck out as not recorded.
- Supporting sounds (distress vocalisations, tyre squeal, car alarm) attach to a trigger within 10 s and never open a check-in alone. Negative context counts only within 1 s of a trigger (same or adjacent window).
- The check-in opens 1 s after the first trigger; `no_answer` is due at opened + window + 10 s grace. A normal PIN in the first 75% of the window is `normal_pin_in_window`, after that `normal_pin_slow`.
- `contact_lost` and bank-partner reasons count only while an incident is open (spec section 8). A `stand_down` closes it, and later `contact_lost` does not fire (T10).
- `night` and `month_end_window` are held at 0: the CEM-0 spec admits time context only if the research supports it, and the research brief found no source (gap 6).
- The K cap at T2 is reported but never overrides H1 or H4, because section 2 of the CEM-0 spec says the tally can never override a hard rule. In practice it never binds (see 'What we forgot').
- **E-level** counts independent principals: the device (detection and PIN together), a guardian's own-key acknowledgement, and a bank-partner record. A server timestamp is not a witness, and a bank acknowledgement of our own signal is not independent.

## 3 · YAMNet classes referenced

Every label and index below was checked on 23 Sep 2026 against `yamnet_class_map.csv` (https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv), 521 classes, sha256 `cdf24d193e196d9e95912a2667051ae203e92a2ba09449218ccb40ef787c6df2`. Mapping is by exact label (V3), so 'Children shouting' (10) never matches 'Shout' (6).

| Reason family | Index | Exact label | Mapping status |
|---|---:|---|---|
| scream | 11 | Screaming | BUILT-SPEC |
| shout_or_yell | 6 | Shout | BUILT-SPEC |
| shout_or_yell | 9 | Yell | BUILT-SPEC |
| glass_or_breaking | 435 | Glass | BUILT-SPEC |
| glass_or_breaking | 437 | Shatter | BUILT-SPEC |
| glass_or_breaking | 464 | Breaking | BUILT-SPEC |
| smash_crash | 463 | Smash, crash | PROPOSED |
| gun_like | 421 | Gunshot, gunfire | ADR-0039 |
| gun_like | 422 | Machine gun | ADR-0039 |
| gun_like | 423 | Fusillade | ADR-0039 |
| distress_vocal | 19 | Crying, sobbing | PROPOSED |
| distress_vocal | 21 | Whimper | PROPOSED |
| distress_vocal | 33 | Groan | PROPOSED |
| distress_vocal | 39 | Gasp | PROPOSED |
| tyre_squeal_or_skid | 306 | Skidding | PROPOSED |
| tyre_squeal_or_skid | 307 | Tire squeal | PROPOSED |
| car_alarm | 304 | Car alarm | PROPOSED |
| media_context | 132 | Music | PROPOSED |
| media_context | 267 | Video game music | PROPOSED |
| media_context | 518 | Television | PROPOSED |
| media_context | 519 | Radio | PROPOSED |
| crowd_context | 61 | Cheering | PROPOSED |
| crowd_context | 62 | Applause | PROPOSED |
| crowd_context | 64 | Crowd | PROPOSED |
| children_playing | 66 | Children playing | PROPOSED |
| laughter | 13 | Laughter | PROPOSED |
| siren_nearby | 317 | Police car (siren) | PROPOSED |
| siren_nearby | 318 | Ambulance (siren) | PROPOSED |
| siren_nearby | 319 | Fire engine, fire truck (siren) | PROPOSED |
| siren_nearby | 390 | Siren | PROPOSED |
| unmapped | 10 | Children shouting | not mapped |
| unmapped | 12 | Whispering | not mapped |
| unmapped | 426 | Fireworks | not mapped |
| unmapped | 427 | Firecracker | not mapped |

## 4 · Reasons and hard rules

| Reason | db | Status | Decays | Meaning |
|---|---:|---|---|---|
| `scream_single` | +7 | BUILT-SPEC | yes | Screaming (11) above threshold in one 0.975 s window |
| `scream_sustained` | +12 | BUILT-SPEC | yes | Screaming in 3 or more windows within 10 s; replaces scream_single |
| `shout_or_yell` | +4 | BUILT-SPEC | yes | Shout (6) or Yell (9) above threshold |
| `glass_or_breaking` | +5 | BUILT-SPEC | yes | Glass (435), Shatter (437) or Breaking (464) above threshold |
| `smash_crash` | +3 | PROPOSED | yes | Smash, crash (463) as an added trigger class |
| `gun_like_single` | +8 | ADR-0039 | yes | a gun-like sound (421, 422, 423) in one window |
| `gun_like_repeated` | +12 | ADR-0039 | yes | a gun-like sound in 2 or more windows within 10 s; replaces gun_like_single |
| `distress_vocal` | +3 | PROPOSED | yes | Crying, sobbing (19), Whimper (21), Groan (33) or Gasp (39); +3 each, capped at +6; supporting only |
| `tyre_squeal_or_skid` | +3 | PROPOSED | yes | Skidding (306) or Tire squeal (307); supporting only |
| `car_alarm` | +2 | PROPOSED | yes | Car alarm (304); supporting only |
| `media_context` | -6 | PROPOSED | yes | Music (132), Video game music (267), Television (518) or Radio (519) in the same or an adjacent window |
| `crowd_context` | -5 | PROPOSED | yes | Cheering (61), Applause (62) or Crowd (64) in the same or an adjacent window |
| `children_playing` | -4 | PROPOSED | yes | Children playing (66) in the same or an adjacent window |
| `laughter` | -4 | PROPOSED | yes | Laughter (13) in the same or an adjacent window |
| `siren_nearby` | +0 | PROPOSED | yes | Siren (390) or 317 to 319; ambiguous, a note only |
| `trigger_words` | +10 | PARKED | yes | 'kill', 'give me your PIN', 'shut up' or isiZulu, Afrikaans, Sesotho equivalents; needs a second model and a RICA/POPIA answer |
| `impact` | +4 | ADR-0039 | yes | accelerometer impact; counts only as look-back corroboration of a sound (H3) |
| `snatch` | +5 | ADR-0039 | yes | accelerometer snatch pattern; look-back corroboration only (H3) |
| `shake_sustained` | +3 | ADR-0039 | yes | sustained shaking; look-back corroboration only (H3) |
| `surge` | +0 | DROPPED | no | dropped in ADR-0039: it fires while driving |
| `bluetooth_drop_at_speed` | +0 | PARKED | no | car Bluetooth drops at vehicle speed; stretch detector in spec section 1, no weight set |
| `walk_to_vehicle_after_detection` | +8 | PROPOSED | no | speed bucket goes walking or stationary to vehicle within 120 s after a detection |
| `vehicle_stop_then_detection` | +3 | PROPOSED | no | vehicle speed bucket drops to stationary, then a detection |
| `duress_signal` | +40 | BUILT-SPEC | no | a duress signal (spec section 3) at any prompt; H1 sets T3; +40 is for display |
| `no_answer_after_detection` | +10 | BUILT-SPEC | no | server no_answer after a detection |
| `normal_pin_in_window` | -6 | BUILT-SPEC | no | normal PIN within the first 75% of the check-in window |
| `normal_pin_slow` | -3 | BUILT-SPEC | no | normal PIN after 75% of the window; -3 instead of -6 |
| `answered_late_normal` | +0 | BUILT-SPEC | no | normal PIN after no_answer; anomaly note answered_late |
| `checkin_not_shown` | +2 | BUILT-SPEC | no | opened never arrives, e.g. notifications revoked; anomaly note |
| `journey_ended_soon_after_detection` | +6 | PROPOSED | no | journey ended 120 s or less after a detection with no PIN; ending is not PIN-gated |
| `contact_lost_soon_after_detection` | +10 | BUILT-SPEC | no | contact_lost 120 s or less after a detection |
| `contact_lost_no_detection` | +1 | BUILT-SPEC | no | contact_lost with no detection in the previous 120 s (a dead zone) |
| `app_killed_while_armed` | +4 | PROPOSED | no | the app was killed while armed; detected at the next start |
| `rebooted_while_armed` | +2 | PROPOSED | no | the phone rebooted while armed; the V10 re-arm prompt |
| `clock_skew` | +0 | BUILT-SPEC | no | device clock more than 120 s off; integrity note only |
| `opened_late` | +0 | BUILT-SPEC | no | opened arrived late; deadline starts at receipt; integrity note only |
| `night` | +2 | PROPOSED | no | 22:00 to 05:00; the research brief found no source, so it is held at 0 |
| `month_end_window` | +1 | PROPOSED | no | month end; the research brief found no source, so it is held at 0 |
| `fireworks_season` | -3 | PROPOSED | no | Diwali, Guy Fawkes or New Year; applied only to a gun-like sound |
| `guardian_alert_delivered` | +0 | BUILT-SPEC | no | the guardian alert was delivered |
| `guardian_alert_opened` | +0 | ADR-0039 | no | the guardian opened the alert |
| `guardian_ack_called_10111` | +0 | BUILT-SPEC | no | guardian acknowledgement 'called 10111'; raises the E-level to E2 |
| `guardian_ack_handling` | +0 | BUILT-SPEC | no | guardian acknowledgement 'handling'; raises the E-level to E2 |
| `guardian_stand_down` | +0 | BUILT-SPEC | no | guardian stand_down; H6 closes the incident |
| `no_ack_by_T` | +0 | PROPOSED | no | derived: no acknowledgement recorded by a time, shown with the delivery state |
| `new_beneficiary_during_incident` | +8 | PROPOSED | no | bank partner: a new beneficiary added during an open incident |
| `large_transfer_within_30min_of_detection` | +10 | PROPOSED | no | bank partner: a large transfer within 30 min of a detection |
| `atm_withdrawal_unusual_hour_during_incident` | +8 | PROPOSED | no | bank partner: an ATM withdrawal at an unusual hour during an incident |
| `limit_increase_during_incident` | +8 | PROPOSED | no | bank partner: a limit increase during an incident |
| `bank_decline_by_own_risk_engine` | +3 | PROPOSED | no | bank partner: the bank's own risk engine declined a transaction |
| `high_crime_precinct` | +2 | PARKED | no | needs the parked UMOJA risk layer and SAPS precinct data |
| `claim_filed_without_guardian_record` | +0 | PROPOSED | no | note for the insurer's investigator; never an automatic denial |
| `detections_only_when_insured_high_cover` | +0 | PROPOSED | no | note for the insurer's investigator; never an automatic denial |
| `repeat_incidents_same_pattern` | +0 | PROPOSED | no | note for the insurer's investigator; never an automatic denial |

Status: **BUILT-SPEC** in `docs/VUKA-2-SPEC.md` today · **ADR-0039** proposed there · **PROPOSED** new in CEM-0 · **PARKED** designed, not built · **DROPPED** removed. PARKED and DROPPED reasons are shown, never scored.

| Rule | From the accepted ADRs (the tally never overrides these) | How the generator enforces it |
|---|---|---|
| **H1** | A duress signal (a checkin_result duress PIN, pin_authorised mode duress, or answered_late carrying a duress PIN) sets T3 at once. | Any scored duress_signal sets the peak to T3 at its time; the band reads user-signalled. |
| **H2** | Detection alone (any sounds, any motion, any context) never sends the bank signal. The maximum is T1, or T2 only through the PROPOSED fast path. | T2 and T3 are reachable only from H1 or H4; an assertion fails the build if a detection-only scenario passes T1. The fast path is reported beside the tier, never inside it. |
| **H3** | Motion alone never opens a check-in; it stays T0 and is not recorded unless it corroborates a sound, looking back over -10 s to 0. | A motion reason is scored only if a trigger sound occurs 0 to 10 s after it; otherwise it is struck out as not recorded. |
| **H4** | no_answer or contact_lost during an open incident sets T2; after 3 min with no stand_down, T3 (S1). contact_lost after a normal-PIN outcome is open at P3.L8. | contact_lost is scored only while an incident is open (spec section 8); T3 at +180 s unless a stand_down came first. Scenarios with contact_lost after a normal PIN are marked P3.L8 open. |
| **H5** | A normal PIN never lowers the tier and never closes an incident, because it can be forced. It adds only a small negative tally. | Normal-PIN reasons change the tally only; the tier logic ignores them. |
| **H6** | A guardian stand_down closes the incident. | The first stand_down closes it; later contact_lost is not fired (T10). |
| **H7** | A guardian acknowledgement adds no coercion evidence; it raises the E-level only (E2). | Guardian reasons carry 0 db. |
| **H8** | Bank-partner signals are E3 inputs from the PROPOSED partner API. They can raise the tally and the E-level, but never trigger the bank signal. | Bank reasons are scored only during an open incident and never enter the tier logic. |

## 5 · The catalogue at a glance

**133 scenarios.**

| Category | Scenarios | Minimum |
|---|---:|---:|
| A · Single sound | 14 | 12 |
| B · Motion only | 6 | 6 |
| C · Sound + motion | 10 | 10 |
| D · Duress PIN in its contexts | 11 | 10 |
| E · No answer and contact lost | 11 | 10 |
| F · Journey and speed-bucket sequences | 13 | 10 |
| G · Guardian activity | 11 | 10 |
| H · Cancellations and normal PIN | 8 | 8 |
| I · Device and time anomalies | 9 | 8 |
| J · Bank-partner signals | 8 | 8 |
| K · Benign and false situations | 13 | 12 |
| L · Staged and fraudulent events | 6 | 6 |
| M · Remote coercion VIGIL can't see | 4 | 4 |
| N · Parked signals | 4 | 4 |
| O · Human reactions | 5 | 4 |

| Final state | T0 | T1 | T2 | T3 | Closed |
|---|---:|---:|---:|---:|---:|
| Scenarios | 21 | 55 | 10 | 39 | 8 |

| Peak tier reached | T0 | T1 | T2 | T3 |
|---|---:|---:|---:|---:|
| Scenarios | 21 | 55 | 14 | 43 |

Scenarios reaching T2 or T3 from detection alone: **0** (H2 holds). Every T3 is set by H1 or H4.

- **Highest totals:** J01 Duress PIN, then a new beneficiary and a large transfer (59 db); D02 Quick duress PIN after sustained screaming (55 db); D08 Late duress PIN after no_answer (54 db).
- **Highest totals without a duress signal:** F13 Hijacking, held for two hours, transfers (41 db); F02 Scream, walk to a vehicle, contact lost, ATM at night (36 db); J07 House robbery with a forced app transfer (28 db).
- **Most conflicted:** F07 Forced normal PIN, then the journey is ended (K 100%); K12 Action movie at home (K 100%); F08 Soccer crowd, then walking to the car (K 90%).
- **Would take the PROPOSED fast path:** H06.

## 6 · Scenarios

Times are seconds from the first signal; each row is evaluated at its `eval t`. Struck-out reasons were not recorded, and the reason is given. Decayed points show the undecayed value and its time in parentheses.

### A · Single sound

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| A01 | One scream window on the walk home (eval t=1) | +7 scream_single | 7 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 | ambiguous |
| A02 | Sustained screaming (eval t=1) | +12 scream_sustained | 12 | 0% | strong | T1 (V4 check-in; H2 caps detection at T1) | no (peak 12 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 | ambiguous |
| A03 | One shout (eval t=1) | +4 shout_or_yell | 4 | 0% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 4 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 | ambiguous |
| A04 | Breaking glass at home at night (eval t=1) | +5 glass_or_breaking | 5 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 5 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 | ambiguous |
| A05 | Smash or crash sound (proposed class) (eval t=1) | +3 smash_crash | 3 | 0% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 3 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | PROPOSED 1 | ambiguous |
| A06 | One gun-like sound (eval t=1) | +8 gun_like_single | 8 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 8 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | ADR-0039 1 | ambiguous |
| A07 | Repeated gun-like sounds (eval t=1) | +12 gun_like_repeated | 12 | 0% | strong | T1 (V4 check-in; H2 caps detection at T1) | no (peak 12 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | ADR-0039 1 | ambiguous |
| A08 | The same scream read two minutes later (eval t=120) | +4 scream_single (+7 at t=0) | 4 | 0% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 | ambiguous |
| A09 | Sustained scream read four minutes later (eval t=240) | +3 scream_sustained (+12 at t=0) | 3 | 0% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 12 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 | ambiguous |
| A10 | Crying alone, no trigger (eval t=1) | ~~distress_vocal Crying, sobbing~~ (no trigger within 10 s: not recorded) | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | PROPOSED 1 | ambiguous |
| A11 | Tyre squeal alone (eval t=1) | ~~tyre_squeal_or_skid~~ (no trigger within 10 s: not recorded) | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | PROPOSED 1 | ambiguous |
| A12 | Car alarm alone (eval t=1) | ~~car_alarm~~ (no trigger within 10 s: not recorded) | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | PROPOSED 1 | false |
| A13 | Siren alone (eval t=1) | ~~siren_nearby~~ (no co-occurring trigger) | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | PROPOSED 1 | false |
| A14 | Smash-and-grab on a parked car (eval t=2) | +5 glass_or_breaking, +2 car_alarm | 7 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · PROPOSED 1 | real |

- **A01** A single Screaming window is classified while the user walks home from a Soweto taxi stop. The check-in has just opened. Signals: t=0 scream_single. If real: The quiet check-in is the only visible effect until a PIN, silence or a duress PIN. If false: The user enters the normal PIN; nothing reaches guardians.
- **A02** Screaming fills three windows inside ten seconds near the phone in a parked car. Signals: t=0 scream_sustained. If real: Strong evidence, but still only a check-in: H2 stops detection at T1. If false: A child's tantrum or a horror film; a normal PIN answers it.
- **A03** A single Shout window at a busy Johannesburg intersection. Signals: t=0 shout_or_yell. If real: A shout is weak on its own; the check-in carries the decision. If false: Street noise; faint evidence and a normal PIN.
- **A04** Glass breaks in the kitchen while the user is home alone with a journey still armed. Signals: t=0 glass_or_breaking. If real: A burglar breaking a window; the check-in is the first step. If false: A dropped glass; the normal PIN ends the question.
- **A05** Smash, crash is heard as a car door is forced in a Pretoria parking lot. Signals: t=0 smash_crash. If real: Adds a trigger the built spec does not have; weak alone. If false: Bins, a slammed boot or a dropped crate. Notes: Smash, crash (463) is a PROPOSED trigger; the built spec maps only Screaming, Shout, Yell, Glass, Shatter, Breaking.
- **A06** A single gun-like window at dusk in a township street. Signals: t=0 gun_like_single. If real: A shot fired near the user; only a check-in follows. If false: A car backfire or a firecracker. Research: ACLU-SS.
- **A07** Two gun-like windows within ten seconds near a tavern. Signals: t=0 gun_like_repeated. If real: Strong evidence of a shooting nearby, but still T1 until the user or the server acts. If false: Fireworks outside the permitted days, or a construction nail gun. Research: ACLU-SS.
- **A08** A1-style single scream, re-read at 120 s: one half-life of decay. Signals: t=0 scream_single. If real: Old evidence counts for less; the server-side deadline is what matters by now. If false: The tally fades on its own if nothing else happens. Notes: 7 x 2^(-120/120) = 3.5, rounded half-up to 4.
- **A09** Sustained screaming re-read at 240 s, two half-lives later. Signals: t=0 scream_sustained. If real: The detector evidence has decayed; only non-decaying facts would keep it high. If false: Faint by now.
- **A10** Only Crying, sobbing is heard; no trigger class fires. Signals: t=0 distress_vocal (Crying, sobbing). If real: A distressed person who does not scream gets no check-in. If false: Nothing happens, as intended for grief or a baby. Notes: Supporting classes attach to a trigger; alone they are never recorded. Research: GAP-BENIGN.
- **A11** Tire squeal outside a mall exit; no scream, no shout. Signals: t=0 tyre_squeal_or_skid. If real: A hijacker's getaway leaves no record if nobody screams. If false: Normal traffic; nothing recorded.
- **A12** A car alarm sounds in a Durban parking garage. Signals: t=0 car_alarm. If real: A break-in nearby that does not involve the user. If false: Nothing recorded, as intended.
- **A13** An ambulance siren passes on the N1. Signals: t=0 siren_nearby. If real: Not a user event. If false: Nothing recorded.
- **A14** Glass breaks and a car alarm starts two seconds later beside the user's parked car. Signals: t=0 glass_or_breaking · t=2 car_alarm. If real: A property crime; the check-in lets the user say they are fine. If false: Someone else's car; the normal PIN closes the question for the user.

### B · Motion only

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| B01 | Phone dropped on tiles (eval t=1) | ~~impact~~ (H3: not recorded) | 0 | 0% | faint | T0 (H3 motion only) | n/a: no check-in | none | journey_armed | ADR-0039 1 | false |
| B02 | Silent phone snatch (eval t=1) | ~~snatch~~ (H3: not recorded) | 0 | 0% | faint | T0 (H3 motion only) | n/a: no check-in | none | journey_armed | ADR-0039 1 | real |
| B03 | Jogging on gravel (eval t=1) | ~~shake_sustained~~ (H3: not recorded) | 0 | 0% | faint | T0 (H3 motion only) | n/a: no check-in | none | journey_armed | ADR-0039 1 | false |
| B04 | Hard braking (surge, dropped) (eval t=1) | (+0 surge: DROPPED, not scored) | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | DROPPED 1 | false |
| B05 | Bag grab with impact, victim silent (eval t=2) | ~~impact~~ (H3: not recorded), ~~snatch~~ (H3: not recorded) | 0 | 0% | faint | T0 (H3 motion only) | n/a: no check-in | none | journey_armed | ADR-0039 2 | real |
| B06 | Gym bag thrown around (eval t=61) | ~~impact~~ (H3: not recorded), ~~impact~~ (H3: not recorded), ~~impact~~ (H3: not recorded) | 0 | 0% | faint | T0 (H3 motion only) | n/a: no check-in | none | journey_armed | ADR-0039 3 | false |

- **B01** The phone slips from a pocket onto a tiled floor. Signals: t=0 impact. If real: Not applicable. If false: Nothing is recorded (H3).
- **B02** A thief snatches the phone from the user's hand at a Braamfontein corner and runs; nobody screams. Signals: t=0 snatch. If real: VIGIL records nothing: motion alone never opens a check-in. If false: Not applicable. Notes: Stated limitation: a silent snatch is invisible to CEM-0. Research: GAP-PHONE.
- **B03** The phone shakes continuously in a running belt. Signals: t=0 shake_sustained. If real: Not applicable. If false: Nothing is recorded (H3).
- **B04** The driver brakes hard at a robot; the accelerometer surges. Signals: t=0 surge. If real: Not applicable. If false: Surge was dropped because it fires while driving.
- **B05** A bag with the phone inside is ripped off the user's shoulder; impact then snatch, no sound. Signals: t=0 impact · t=1 snatch. If real: Nothing is recorded; the user must rely on other help. If false: Not applicable. Research: SCIAM-SILENT.
- **B06** Impacts at 0, 30 and 60 s as a gym bag is tossed into a locker. Signals: t=0 impact · t=30 impact · t=60 impact. If real: Not applicable. If false: Nothing is recorded (H3).

### C · Sound + motion

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| C01 | Snatch, then a scream (eval t=5) | +5 snatch, +7 scream_single | 12 | 0% | strong | T1 (V4 check-in; H2 caps detection at T1) | no (peak 12 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · ADR-0039 1 | real |
| C02 | Impact, shaking, then sustained screaming (eval t=6) | +4 impact, +3 shake_sustained, +12 scream_sustained | 19 | 0% | strong | T1 (V4 check-in; H2 caps detection at T1) | no (peak 19 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · ADR-0039 2 | real |
| C03 | Snatch 15 s before the scream (eval t=15) | ~~snatch~~ (H3: not recorded), +7 scream_single | 7 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · ADR-0039 1 | real |
| C04 | Scream, then the phone is grabbed (eval t=3) | +7 scream_single, ~~snatch~~ (H3: not recorded) | 7 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · ADR-0039 1 | real |
| C05 | Window smashed at a robot (eval t=2) | +4 impact, +5 glass_or_breaking | 9 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 9 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · ADR-0039 1 | real |
| C06 | Impact and a gun-like sound (eval t=1) | +4 impact, +8 gun_like_single | 12 | 0% | strong | T1 (V4 check-in; H2 caps detection at T1) | no (peak 12 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | ADR-0039 2 | real |
| C07 | Shaking, then a shout (eval t=3) | +3 shake_sustained, +4 shout_or_yell | 7 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · ADR-0039 1 | ambiguous |
| C08 | Snatch, sustained scream, gasping and sobbing (eval t=12) | +5 snatch, +12 scream_sustained, +3 distress_vocal Gasp, +3 distress_vocal Whimper, +0 distress_vocal Crying, sobbing (+3 at t=12) | 23 | 0% | very strong | T1 (V4 check-in; H2 caps detection at T1) | no (peak 23 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · ADR-0039 1 · PROPOSED 3 | real |
| C09 | Gym: shaking, shout and music (eval t=2) | +3 shake_sustained, +4 shout_or_yell, -6 media_context Music | 1 | 86% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 2 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · ADR-0039 1 · PROPOSED 1 | false |
| C10 | Impact and a scream among children (eval t=5) | +4 impact, +7 scream_single, -4 children_playing | 7 | 36% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · ADR-0039 1 · PROPOSED 1 | ambiguous |

- **C01** A phone snatch at a Hillbrow corner, and the user screams five seconds later. Signals: t=0 snatch · t=5 scream_single. If real: The snatch corroborates the scream inside the look-back window. If false: Horseplay; the normal PIN answers it.
- **C02** The user is shoved against a wall, the phone shakes, then sustained screaming starts. Signals: t=0 impact · t=2 shake_sustained · t=6 scream_sustained. If real: Strong, corroborated evidence; still T1 until PIN or silence. If false: A rough game; a normal PIN.
- **C03** The phone is snatched and the user screams only after fifteen seconds of shock. Signals: t=0 snatch · t=15 scream_single. If real: The snatch falls outside the 10 s look-back and is not recorded. If false: Not applicable. Notes: Delayed screaming loses its motion corroboration.
- **C04** The user screams and the attacker grabs the phone three seconds later. Signals: t=0 scream_single · t=3 snatch. If real: The grab comes after the sound, so the look-back never sees it. If false: Not applicable. Notes: The look-back only looks backwards; motion after the sound never counts; motion after the sound is outside the look-back.
- **C05** The car is stationary at a traffic light when the side window is smashed. Signals: t=0 impact · t=2 glass_or_breaking. If real: Smash-and-grab; corroborated but not violent to the person. If false: A stone thrown up by a truck.
- **C06** The user falls to the ground as a gun-like sound goes off. Signals: t=0 impact · t=1 gun_like_single. If real: Corroborated; the check-in follows. If false: A backfire as the user trips.
- **C07** The phone shakes in a struggle, then a single shout. Signals: t=0 shake_sustained · t=3 shout_or_yell. If real: Some evidence of a scuffle. If false: Play-fighting.
- **C08** A snatch, sustained screaming, then Gasp, Whimper and Crying, sobbing windows. Signals: t=0 snatch · t=6 scream_sustained · t=7 distress_vocal (Gasp) · t=9 distress_vocal (Whimper) · t=12 distress_vocal (Crying, sobbing). If real: Very strong evidence; the distress cap holds the vocal part at +6. If false: Unlikely to be benign. Notes: Three distress windows score +6, not +9 (cap).
- **C09** A spin class with a loud instructor and music. Signals: t=0 shake_sustained · t=2 shout_or_yell · t=2 media_context (Music). If real: Not applicable. If false: Music cancels most of the shout; K flags the conflict.
- **C10** A child falls in a playground next to the user and screams; Children playing is heard. Signals: t=0 impact · t=5 scream_single · t=5 children_playing. If real: A real fall, not coercion. If false: The context lowers the tally; a normal PIN closes the question for the user.

### D · Duress PIN in its contexts

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| D01 | Duress PIN at the check-in (eval t=20) | +6 scream_single (+7 at t=0), +40 duress_signal checkin | 46 | 0% | user-signalled | T3 (H1 at t=20) | n/a: H1 first at t=20 | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 | real |
| D02 | Quick duress PIN after sustained screaming (eval t=8) | +11 scream_sustained (+12 at t=0), +4 impact, +40 duress_signal checkin | 55 | 0% | user-signalled | T3 (H1 at t=8) | n/a: H1 first at t=8 | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · ADR-0039 1 | real |
| D03 | Duress PIN at the settings prompt (eval t=0) | +40 duress_signal settings | 40 | 0% | user-signalled | T3 (H1 at t=0) | n/a: no check-in | E1, 1 principal | journey_armed, pin_authorised, guardian_alerted, bank_signal_sent | BUILT-SPEC 1 | real |
| D04 | Duress PIN while adding a guardian (eval t=0) | +40 duress_signal guardian_add | 40 | 0% | user-signalled | T3 (H1 at t=0) | n/a: no check-in | E1, 1 principal | journey_armed, pin_authorised, guardian_alerted, bank_signal_sent, decoy_added | BUILT-SPEC 1 | real |
| D05 | Duress PIN while removing a guardian (eval t=0) | +40 duress_signal guardian_remove | 40 | 0% | user-signalled | T3 (H1 at t=0) | n/a: no check-in | E1, 1 principal | journey_armed, pin_authorised, guardian_alerted, bank_signal_sent | BUILT-SPEC 1 | real |
| D06 | Duress PIN at evidence deletion (eval t=0) | +40 duress_signal deletion | 40 | 0% | user-signalled | T3 (H1 at t=0) | n/a: no check-in | E1, 1 principal | journey_armed, pin_authorised, guardian_alerted, bank_signal_sent | BUILT-SPEC 1 | real |
| D07 | Duress PIN at recovery (eval t=0) | +40 duress_signal recovery | 40 | 0% | user-signalled | T3 (H1 at t=0) | n/a: no check-in | E1, 1 principal | journey_armed, pin_authorised, guardian_alerted, bank_signal_sent | BUILT-SPEC 1 | real |
| D08 | Late duress PIN after no_answer (eval t=95) | +4 scream_single (+7 at t=0), +10 no_answer_after_detection, +40 duress_signal late | 54 | 0% | user-signalled | T3 (H1 at t=95) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, no_answer, answered_late, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 | real |
| D09 | Duress, then 10111, then stand_down (eval t=1800) | +0 scream_single (+7 at t=0), +40 duress_signal checkin, 0 guardian_alert_delivered, 0 guardian_ack_called_10111, 0 guardian_stand_down | 40 | 0% | user-signalled | Closed (H6 stand_down at t=1800); peak T3 (H1 at t=15) | n/a: H1 first at t=15 | E2, 2 principals | journey_armed, signal_detected, checkin_opened, checkin_result, incident_closed, guardian_alerted, guardian_ack, bank_signal_sent | BUILT-SPEC 5 | real |
| D10 | Accidental duress PIN after a dropped glass (eval t=10) | +5 glass_or_breaking, +40 duress_signal checkin | 45 | 0% | user-signalled | T3 (H1 at t=10) | n/a: H1 first at t=10 | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 | false |
| D11 | Duress PIN, then the phone is switched off (eval t=100) | +4 scream_single (+7 at t=0), +40 duress_signal checkin, +10 contact_lost_soon_after_detection | 54 | 0% | user-signalled | T3 (H1 at t=12) | n/a: H1 first at t=12 | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, contact_lost, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 | real |

- **D01** After a scream the attacker demands the phone be unlocked; the user answers the check-in with the duress PIN. Signals: t=0 scream_single · t=20 duress_signal (checkin). If real: Guardians are alerted and the bank signal goes at once; the phone shows the normal outcome. If false: An accidental duress PIN alerts guardians who cannot call until a stand_down. Research: TC-UNLOCK, FTC-PIN.
- **D02** Sustained screaming with an impact; the user enters the duress PIN at 8 s. Signals: t=0 scream_sustained · t=0 impact · t=8 duress_signal (checkin). If real: T3 at 8 s. If false: Not applicable.
- **D03** The attacker makes the user open settings to disarm VIGIL; the user types the duress PIN. Nothing was heard. Signals: t=0 duress_signal (settings). If real: The settings change looks done; T16 says this raises the full alarm. If false: Not applicable.
- **D04** The attacker makes the user add him as a guardian; the duress PIN creates a decoy guardian. Signals: t=0 duress_signal (guardian_add). If real: The decoy's acceptance succeeds but it never receives alerts; real guardians are told. If false: Not applicable.
- **D05** An abusive partner makes the user remove her sister as guardian; she enters the duress PIN. Signals: t=0 duress_signal (guardian_remove). If real: The removal looks done and does nothing. If false: Not applicable. Research: TF-IPV.
- **D06** The attacker orders the user to delete the VUKA record; she enters the duress PIN. Signals: t=0 duress_signal (deletion). If real: The deletion looks done and does nothing. If false: Not applicable.
- **D07** The attacker tries to move the user's VUKA account onto his own phone; the duress PIN is entered. Signals: t=0 duress_signal (recovery). If real: The recovery looks done and does nothing. If false: Not applicable. Notes: Recovery is on the cut line; if it is cut, no code is shown.
- **D08** The user could not reach the phone in time; no_answer fired, then she enters the duress PIN at 95 s. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=95 duress_signal (late). If real: answered_late carries the duress PIN: T3 immediately (T09). If false: Not applicable.
- **D09** Duress PIN at 15 s; a guardian calls 10111; police find the user and the guardian stands down after 30 min. Signals: t=0 scream_single · t=15 duress_signal (checkin) · t=16 guardian_alert_delivered · t=60 guardian_ack_called_10111 · t=1800 guardian_stand_down. If real: The record holds two principals (device and guardian): E2. If false: Not applicable. Notes: H7: guardian acknowledgement adds no coercion evidence.
- **D10** A glass breaks at home and the user, flustered, types the duress PIN by mistake. Signals: t=0 glass_or_breaking · t=10 duress_signal (checkin). If real: Not applicable. If false: Guardians and the bank act on a false alarm; there is no user-side cancel, and guardians may not call until a stand_down. Research: FTC-PIN.
- **D11** Duress PIN at 12 s; the attacker switches the phone off, so contact is lost at 100 s. Signals: t=0 scream_single · t=12 duress_signal (checkin) · t=100 contact_lost_soon_after_detection. If real: Already T3; contact_lost adds evidence the incident is not over. If false: Not applicable. Research: GAP-PHONE.

### E · No answer and contact lost

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| E01 | Scream, then no answer (eval t=71) | +5 scream_single (+7 at t=0), +10 no_answer_after_detection | 15 | 0% | strong | T2 (H4 at t=71) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted | BUILT-SPEC 2 | ambiguous |
| E02 | Scream, no answer, three minutes pass (eval t=251) | +2 scream_single (+7 at t=0), +10 no_answer_after_detection | 12 | 0% | strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 | ambiguous |
| E03 | No answer, guardian handling, then stand_down (eval t=200) | +2 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 guardian_alert_delivered, 0 guardian_ack_handling, 0 guardian_stand_down | 12 | 0% | strong | Closed (H6 stand_down at t=200); peak T2 (H4 at t=71) | no (peak 7 db) | E2, 2 principals | journey_armed, signal_detected, checkin_opened, no_answer, incident_closed, guardian_alerted, guardian_ack | BUILT-SPEC 5 | false |
| E04 | Phone smashed after sustained screaming (eval t=275) | +2 scream_sustained (+12 at t=0), +10 no_answer_after_detection, +10 contact_lost_soon_after_detection | 22 | 0% | very strong | T3 (H4 +3 min at t=251) | no (peak 12 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, contact_lost, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 | real |
| E05 | Dead zone with no incident (eval t=600) | ~~contact_lost_no_detection~~ (section 8: no open incident, not fired) | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | BUILT-SPEC 1 | false |
| E06 | TV scream, normal PIN, then a dead zone 20 min later (eval t=1380) | +0 scream_single (+7 at t=0), +0 media_context Television (-6 at t=0), -6 normal_pin_in_window, +1 contact_lost_no_detection | -5 | 17% | faint | T3 (H4 +3 min at t=1380) | no (peak 1 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, contact_lost, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 · PROPOSED 1 | false |
| E07 | Battery dies after a scream (eval t=251) | +2 scream_single (+7 at t=0), +10 no_answer_after_detection, +10 contact_lost_soon_after_detection | 22 | 0% | very strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, contact_lost, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 | ambiguous |
| E08 | TV scream, phone left behind, guardian stands down late (eval t=300) | +1 scream_single (+7 at t=0), -1 media_context Television (-6 at t=0), +10 no_answer_after_detection, 0 guardian_alert_delivered, 0 guardian_stand_down | 10 | 9% | some | Closed (H6 stand_down at t=300); peak T3 (H4 +3 min at t=251) | no (peak 1 db) | E2, 2 principals | journey_armed, signal_detected, checkin_opened, no_answer, incident_closed, guardian_alerted, guardian_ack, bank_signal_sent | BUILT-SPEC 4 · PROPOSED 1 | false |
| E09 | Short 20 s window, no answer (eval t=31) | +3 shout_or_yell (+4 at t=0), +10 no_answer_after_detection | 13 | 0% | strong | T2 (H4 at t=31) | no (peak 4 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted | BUILT-SPEC 2 | ambiguous |
| E10 | Normal PIN, then contact lost soon after (eval t=110) | +4 scream_single (+7 at t=0), -6 normal_pin_in_window, +10 contact_lost_soon_after_detection | 8 | 43% | some | T2 (H4 at t=110) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, contact_lost, guardian_alerted | BUILT-SPEC 3 | ambiguous |
| E11 | Load-shedding takes the tower down after a false alarm (eval t=570) | +0 shout_or_yell (+4 at t=0), -6 normal_pin_in_window, +1 contact_lost_no_detection | -5 | 17% | faint | T3 (H4 +3 min at t=570) | no (peak 4 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, contact_lost, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 | false |

- **E01** A scream and no PIN: the server fires no_answer at 71 s. Signals: t=0 scream_single · t=71 no_answer_after_detection. If real: Guardians are alerted (T2). If false: The user left the phone in another room.
- **E02** As E01, but nobody stands down for three minutes. Signals: t=0 scream_single · t=71 no_answer_after_detection. If real: The bank signal goes at 251 s (S1). If false: The bank applies friction to an innocent user until they release it.
- **E03** No answer; a guardian replies 'handling', reaches the user in person and stands down at 200 s. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=72 guardian_alert_delivered · t=120 guardian_ack_handling · t=200 guardian_stand_down. If real: Not applicable. If false: Closed before the 3-minute bank rule. Notes: H7: guardian acknowledgement adds no coercion evidence.
- **E04** Sustained screaming; the phone is smashed at 5 s, so no_answer fires at 71 s and contact is lost at 95 s. Signals: t=0 scream_sustained · t=71 no_answer_after_detection · t=95 contact_lost_soon_after_detection. If real: T3 at 251 s from no_answer. If false: Not applicable. Research: GAP-PHONE.
- **E05** Heartbeats stop in a dead zone on the R21 with nothing detected. Signals: t=600 contact_lost_no_detection. If real: Not applicable. If false: contact_lost never fires without an open incident (spec section 8).
- **E06** A TV scream is answered with the normal PIN; twenty minutes later the user drives into a dead zone. Signals: t=0 scream_single · t=0 media_context (Television) · t=10 normal_pin_in_window · t=1200 contact_lost_no_detection. If real: Not applicable. If false: The incident never closed, so the dead zone reaches guardians and then the bank. Notes: Guardians were never notified, so the 6 h auto-close cannot run either; H5: the normal PIN lowered the tally, not the tier; P3.L8 open: contact_lost after a normal-PIN outcome.
- **E07** The battery dies at 30 s; no PIN arrives and contact is lost at 120 s. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=120 contact_lost_soon_after_detection. If real: Correct escalation. If false: A flat battery looks the same as an attacker switching the phone off. Notes: Heartbeats carry no battery level, so the server cannot tell.
- **E08** The user is in the shower; a TV scream opens a check-in nobody answers. A guardian stands down at 300 s. Signals: t=0 scream_single · t=0 media_context (Television) · t=71 no_answer_after_detection · t=72 guardian_alert_delivered · t=300 guardian_stand_down. If real: Not applicable. If false: The bank signal already went at 251 s; the stand_down came too late to stop it. Notes: H7: guardian acknowledgement adds no coercion evidence.
- **E09** A driver chose the 20 s window; a shout and no PIN. Signals: t=0 shout_or_yell · t=31 no_answer_after_detection. If real: Guardians are alerted after 31 s. If false: A driver who cannot touch the phone while driving.
- **E10** A scream, a normal PIN at 12 s, then heartbeats stop and contact is lost at 110 s. Signals: t=0 scream_single · t=12 normal_pin_in_window · t=110 contact_lost_soon_after_detection. If real: A forced normal PIN followed by the phone being switched off. If false: A tunnel on the Gautrain route; heartbeats return later but nothing is retracted. Notes: H5: the normal PIN lowered the tally, not the tier; P3.L8 open: contact_lost after a normal-PIN outcome.
- **E11** A neighbour's argument opens a check-in answered normally; at 300 s the cell tower loses power. Signals: t=0 shout_or_yell · t=20 normal_pin_in_window · t=390 contact_lost_no_detection. If real: Not applicable. If false: The open incident turns a power cut into a bank signal. Notes: H5: the normal PIN lowered the tally, not the tier; P3.L8 open: contact_lost after a normal-PIN outcome.

### F · Journey and speed-bucket sequences

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| F01 | Scream, trigger words, erratic motion, then a withdrawal (eval t=900) | +0 shake_sustained (+3 at t=0), +0 impact (+4 at t=3), +0 scream_sustained (+12 at t=5), (+10 trigger_words kill: PARKED, not scored), +10 no_answer_after_detection, +8 atm_withdrawal_unusual_hour_during_incident | 18 | 0% | strong | T3 (H4 +3 min at t=256) | no (peak 19 db) | E0, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · ADR-0039 2 · PROPOSED 1 · PARKED 1 | real |
| F02 | Scream, walk to a vehicle, contact lost, ATM at night (eval t=1500) | +0 scream_sustained (+12 at t=0), 0 night (unsourced; +2 held), +8 walk_to_vehicle_after_detection, +10 no_answer_after_detection, +10 contact_lost_soon_after_detection, +8 atm_withdrawal_unusual_hour_during_incident | 36 | 0% | overwhelming | T3 (H4 +3 min at t=251) | no (peak 16 db) | E0, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, no_answer, contact_lost, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 · PROPOSED 3 | real |
| F03 | Hijacking with abduction (eval t=253) | +1 tyre_squeal_or_skid (+3 at t=0), +1 shout_or_yell (+4 at t=2), +3 vehicle_stop_then_detection, +1 glass_or_breaking (+5 at t=3), +1 distress_vocal Crying, sobbing (+3 at t=10), +10 no_answer_after_detection | 17 | 0% | strong | T3 (H4 +3 min at t=253) | no (peak 18 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 · PROPOSED 3 | real |
| F04 | Express kidnapping from a mall parking lot (eval t=251) | +1 shout_or_yell (+4 at t=0), +8 walk_to_vehicle_after_detection, +10 no_answer_after_detection | 19 | 0% | strong | T3 (H4 +3 min at t=251) | no (peak 11 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 1 | real |
| F05 | E-hailing abduction (eval t=251) | +2 scream_single (+7 at t=0), +10 no_answer_after_detection | 12 | 0% | strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 | real |
| F06 | The attacker ends the journey (eval t=71) | +5 scream_single (+7 at t=0), +6 journey_ended_soon_after_detection, +10 no_answer_after_detection | 21 | 0% | very strong | T2 (H4 at t=71) | no (peak 12 db) | E0, 1 principal | journey_armed, journey_ended, signal_detected, checkin_opened, no_answer, guardian_alerted | BUILT-SPEC 2 · PROPOSED 1 | real |
| F07 | Forced normal PIN, then the journey is ended (eval t=30) | +6 scream_single (+7 at t=0), -6 normal_pin_in_window | 0 | 100% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 | real |
| F08 | Soccer crowd, then walking to the car (eval t=90) | +2 shout_or_yell (+4 at t=0), -3 crowd_context Cheering (-5 at t=0), -6 normal_pin_in_window, +8 walk_to_vehicle_after_detection | 1 | 90% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 0 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 2 | false |
| F09 | Smash-and-grab at a robot, no abduction (eval t=25) | +4 glass_or_breaking (+5 at t=0), +3 vehicle_stop_then_detection, -6 normal_pin_in_window | 1 | 86% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 8 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 1 | real |
| F10 | Minibus taxi argument at a stop (eval t=10) | +4 shout_or_yell, +3 vehicle_stop_then_detection, -6 normal_pin_in_window | 1 | 86% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 1 | false |
| F11 | Mugging on the walk home at night (eval t=40) | +4 snatch (+5 at t=0), 0 night (unsourced; +2 held), +6 scream_single (+7 at t=4), -6 normal_pin_in_window | 4 | 60% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 12 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · ADR-0039 1 · PROPOSED 1 | real |
| F12 | Forced ATM withdrawal while walking (eval t=400) | +0 shout_or_yell (+4 at t=0), 0 night (unsourced; +2 held), +10 no_answer_after_detection, +8 atm_withdrawal_unusual_hour_during_incident | 18 | 0% | strong | T3 (H4 +3 min at t=251) | no (peak 4 db) | E0, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 2 | real |
| F13 | Hijacking, held for two hours, transfers (eval t=7200) | +0 shout_or_yell (+4 at t=0), +3 vehicle_stop_then_detection, +0 glass_or_breaking (+5 at t=1), +10 no_answer_after_detection, 0 guardian_alert_delivered, +10 contact_lost_soon_after_detection, 0 guardian_ack_called_10111, +8 new_beneficiary_during_incident, +10 large_transfer_within_30min_of_detection | 41 | 0% | overwhelming | T3 (H4 +3 min at t=251) | no (peak 12 db) | E3, 3 principals | journey_armed, signal_detected, checkin_opened, no_answer, contact_lost, guardian_alerted, guardian_ack, bank_signal_sent | BUILT-SPEC 6 · PROPOSED 3 | real |

- **F01** Erratic motion, an impact, sustained screaming and a threat to kill; nobody answers and an ATM withdrawal follows 15 min later. Signals: t=0 shake_sustained · t=3 impact · t=5 scream_sustained · t=6 trigger_words (kill) · t=76 no_answer_after_detection · t=900 atm_withdrawal_unusual_hour_during_incident. If real: T3 at 256 s from no_answer; the bank already knows of its own withdrawal. If false: Not applicable. Notes: Lethabo's first timing sequence. Trigger words are PARKED; H8: bank evidence moved the tally and E-level, not the tier; PARKED signals would add +10 db if built (what-if total 28). Research: ISS-EXPRESS, TC-ATM.
- **F02** Sustained screaming at night; within a minute the user moves at vehicle speed, contact is lost and an ATM withdrawal follows at 25 min. Signals: t=0 scream_sustained · t=0 night · t=60 walk_to_vehicle_after_detection · t=71 no_answer_after_detection · t=110 contact_lost_soon_after_detection · t=1500 atm_withdrawal_unusual_hour_during_incident. If real: The express-kidnapping pattern; T3 at 251 s. If false: Not applicable. Notes: Lethabo's second timing sequence; H8: bank evidence moved the tally and E-level, not the tier; time context unsourced: held at 0. Research: ISS-EXPRESS, TC-ATM, GAP-MONTHEND.
- **F03** At the gate, tyres squeal, the car stops, a shout and breaking glass; the user is pushed into the passenger seat. Signals: t=0 tyre_squeal_or_skid · t=2 shout_or_yell · t=2 vehicle_stop_then_detection · t=3 glass_or_breaking · t=10 distress_vocal (Crying, sobbing) · t=73 no_answer_after_detection. If real: T3 at 253 s. If false: Not applicable. Research: ISS-HIJACK.
- **F04** A shout in a Sandton mall parking lot; within 40 s the phone moves at vehicle speed; no PIN. Signals: t=0 shout_or_yell · t=40 walk_to_vehicle_after_detection · t=71 no_answer_after_detection. If real: T3 at 251 s. If false: A user who shouted at a friend and then drove off without looking at the phone. Research: ISS-EXPRESS, TC-ATM.
- **F05** The user screams in an e-hailing car when the driver turns off the route; no PIN. Signals: t=0 scream_single · t=71 no_answer_after_detection. If real: T3 at 251 s, but nothing records the route deviation: there is no location history. If false: Not applicable. Research: GAP-EHAILING.
- **F06** After a scream the attacker ends the VUKA journey at 30 s, which needs no PIN; the check-in deadline still runs. Signals: t=0 scream_single · t=30 journey_ended_soon_after_detection · t=71 no_answer_after_detection. If real: no_answer still fires at 71 s, but heartbeats stop legitimately, so contact_lost never can. If false: The user ended the journey on arrival and ignored the check-in.
- **F07** The attacker watches the user enter the normal PIN at 15 s, then ends the journey at 30 s. Signals: t=0 scream_single · t=15 normal_pin_in_window. If real: Nothing escalates: T1 is the end of the line. If false: Not applicable. Notes: journey_ended at 30 s is not a reason after a PIN (the reason requires no PIN); H5: the normal PIN lowered the tally, not the tier. Research: TC-PIN.
- **F08** Shouting and cheering at an Orlando Stadium derby; normal PIN; the user drives home 90 s later. Signals: t=0 shout_or_yell · t=0 crowd_context (Cheering) · t=20 normal_pin_in_window · t=90 walk_to_vehicle_after_detection. If real: Not applicable. If false: walk_to_vehicle adds +8 to an innocent trip home. Notes: H5: the normal PIN lowered the tally, not the tier.
- **F09** The car stops at a robot and the passenger window is smashed; the user answers with the normal PIN at 25 s. Signals: t=0 glass_or_breaking · t=0 vehicle_stop_then_detection · t=25 normal_pin_in_window. If real: A property crime; the user is safe and says so. If false: Not applicable. Notes: H5: the normal PIN lowered the tally, not the tier.
- **F10** A loud argument between passengers as the taxi stops; the user answers normally. Signals: t=0 shout_or_yell · t=0 vehicle_stop_then_detection · t=10 normal_pin_in_window. If real: Not applicable. If false: Low tally; the normal PIN answers it. Notes: H5: the normal PIN lowered the tally, not the tier.
- **F11** A snatch and a scream at 21:30; the attackers run and the user answers normally at 40 s. Signals: t=0 snatch · t=0 night · t=4 scream_single · t=40 normal_pin_in_window. If real: A mugging that is over; T1 is right. If false: Not applicable. Notes: H5: the normal PIN lowered the tally, not the tier; time context unsourced: held at 0.
- **F12** A shout at a Pretoria CBD ATM at night; the user is made to withdraw cash; no PIN. Signals: t=0 shout_or_yell · t=0 night · t=71 no_answer_after_detection · t=400 atm_withdrawal_unusual_hour_during_incident. If real: T3 at 251 s; the withdrawal adds E3-type evidence. If false: Not applicable. Notes: H8: bank evidence moved the tally and E-level, not the tier; time context unsourced: held at 0. Research: NCA-ATM.
- **F13** The car is stopped and the window smashed; contact is lost; a guardian calls 10111; transfers follow; the user is released two hours later. Signals: t=0 shout_or_yell · t=0 vehicle_stop_then_detection · t=1 glass_or_breaking · t=71 no_answer_after_detection · t=72 guardian_alert_delivered · t=115 contact_lost_soon_after_detection · t=400 guardian_ack_called_10111 · t=1100 new_beneficiary_during_incident · t=1200 large_transfer_within_30min_of_detection. If real: Every fact is recorded before the money moved; three principals. If false: Not applicable. Notes: H8: bank evidence moved the tally and E-level, not the tier; H7: guardian acknowledgement adds no coercion evidence. Research: ISS-HIJACK, TC-UNLOCK.

### G · Guardian activity

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| G01 | Guardian calls 10111 (eval t=120) | +4 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 guardian_alert_delivered, 0 guardian_alert_opened, 0 guardian_ack_called_10111 | 14 | 0% | strong | T2 (H4 at t=71) | no (peak 7 db) | E2, 2 principals | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, guardian_ack | BUILT-SPEC 4 · ADR-0039 1 | ambiguous |
| G02 | Guardian 'handling' does not stop the bank rule (eval t=400) | +1 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 guardian_alert_delivered, 0 guardian_ack_handling, 0 guardian_stand_down | 11 | 0% | some | Closed (H6 stand_down at t=400); peak T3 (H4 +3 min at t=251) | no (peak 7 db) | E2, 2 principals | journey_armed, signal_detected, checkin_opened, no_answer, incident_closed, guardian_alerted, guardian_ack, bank_signal_sent | BUILT-SPEC 5 | ambiguous |
| G03 | Alert never delivered (eval t=251) | +2 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 no_ack_by_T | 12 | 0% | strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 1 | real |
| G04 | Attacker texts the guardian 'I'm fine' (eval t=150) | +5 scream_sustained (+12 at t=0), +10 no_answer_after_detection, 0 guardian_alert_delivered, 0 guardian_stand_down | 15 | 0% | strong | Closed (H6 stand_down at t=150); peak T2 (H4 at t=71) | no (peak 12 db) | E2, 2 principals | journey_armed, signal_detected, checkin_opened, no_answer, incident_closed, guardian_alerted, guardian_ack | BUILT-SPEC 4 | real |
| G05 | Correct stand_down on a TV false alarm (eval t=170) | +3 scream_single (+7 at t=0), -2 media_context Television (-6 at t=0), +10 no_answer_after_detection, 0 guardian_alert_delivered, 0 guardian_stand_down | 11 | 15% | some | Closed (H6 stand_down at t=170); peak T2 (H4 at t=71) | no (peak 1 db) | E2, 2 principals | journey_armed, signal_detected, checkin_opened, no_answer, incident_closed, guardian_alerted, guardian_ack | BUILT-SPEC 4 · PROPOSED 1 | false |
| G06 | Duress PIN, guardian calls 10111 (eval t=45) | +5 scream_single (+7 at t=0), +40 duress_signal checkin, 0 guardian_alert_delivered, 0 guardian_ack_called_10111 | 45 | 0% | user-signalled | T3 (H1 at t=14) | n/a: H1 first at t=14 | E2, 2 principals | journey_armed, signal_detected, checkin_opened, checkin_result, guardian_alerted, guardian_ack, bank_signal_sent | BUILT-SPEC 4 | real |
| G07 | Guardian acknowledgement adds nothing to the tally (eval t=90) | +4 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 guardian_ack_handling | 14 | 0% | strong | T2 (H4 at t=71) | no (peak 7 db) | E2, 2 principals | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, guardian_ack | BUILT-SPEC 3 | ambiguous |
| G08 | Two guardians disagree (eval t=130) | +3 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 guardian_ack_called_10111, 0 guardian_stand_down | 13 | 0% | strong | Closed (H6 stand_down at t=130); peak T2 (H4 at t=71) | no (peak 7 db) | E2, 2 principals | journey_armed, signal_detected, checkin_opened, no_answer, incident_closed, guardian_alerted, guardian_ack | BUILT-SPEC 4 | real |
| G09 | Decoy guardian added under duress (eval t=1) | +40 duress_signal guardian_add, 0 guardian_alert_delivered | 40 | 0% | user-signalled | T3 (H1 at t=0) | n/a: no check-in | E1, 1 principal | journey_armed, pin_authorised, guardian_alerted, bank_signal_sent, decoy_added | BUILT-SPEC 2 | real |
| G10 | Nobody stands down: the 6 h auto-close (eval t=21700) | +0 glass_or_breaking (+5 at t=0), +10 no_answer_after_detection, 0 guardian_alert_delivered, 0 guardian_alert_opened | 10 | 0% | some | Closed (section 8 auto-close after 6 h); peak T3 (H4 +3 min at t=251) | no (peak 5 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, incident_closed, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 · ADR-0039 1 | false |
| G11 | Abusive guardian still inside the 24 h removal delay (eval t=72) | +3 shout_or_yell (+4 at t=0), +10 no_answer_after_detection, 0 guardian_alert_delivered | 13 | 0% | strong | T2 (H4 at t=71) | no (peak 4 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted | BUILT-SPEC 3 | real |

- **G01** No answer; the alert is delivered and opened; the guardian taps 'called 10111'. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=72 guardian_alert_delivered · t=90 guardian_alert_opened · t=120 guardian_ack_called_10111. If real: E2: a second principal responded. If false: Police attend a false alarm; the record shows who acted and when. Notes: H7: guardian acknowledgement adds no coercion evidence.
- **G02** A guardian replies 'handling' at 100 s and stands down only at 400 s. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=72 guardian_alert_delivered · t=100 guardian_ack_handling · t=400 guardian_stand_down. If real: The bank signal went at 251 s; 'handling' is not a stand_down. If false: A false alarm reached the bank because the guardian did not stand down. Notes: H7: guardian acknowledgement adds no coercion evidence.
- **G03** The only guardian's phone is off; nothing is acknowledged by 251 s. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=251 no_ack_by_T (delivery: not delivered). If real: The bank signal is the only help that still moves. If false: Not applicable. Notes: There is no delivery-failure state in the contract to show here.
- **G04** The attacker uses the victim's WhatsApp to tell the guardian all is well; the guardian stands down at 150 s. Signals: t=0 scream_sustained · t=71 no_answer_after_detection · t=72 guardian_alert_delivered · t=150 guardian_stand_down. If real: The stand_down closes the incident before the bank signal: the attacker wins. If false: Not applicable. Notes: The alert says 'Don't call or text them', but nothing stops the attacker texting the guardian; H7: guardian acknowledgement adds no coercion evidence.
- **G05** A TV scream, no answer; the guardian reaches the user by landline and stands down at 170 s. Signals: t=0 scream_single · t=0 media_context (Television) · t=71 no_answer_after_detection · t=72 guardian_alert_delivered · t=170 guardian_stand_down. If real: Not applicable. If false: Closed 10 s before the bank signal would have gone. Notes: H7: guardian acknowledgement adds no coercion evidence.
- **G06** Duress PIN at 14 s; the guardian calls 10111 at 45 s. Signals: t=0 scream_single · t=14 duress_signal (checkin) · t=15 guardian_alert_delivered · t=45 guardian_ack_called_10111. If real: T3 and E2. If false: Not applicable. Notes: H7: guardian acknowledgement adds no coercion evidence.
- **G07** As E01, plus a 'handling' acknowledgement at 90 s. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=90 guardian_ack_handling. If real: The tally is unchanged by the acknowledgement (H7); the E-level rises. If false: Same. Notes: H7: guardian acknowledgement adds no coercion evidence.
- **G08** Guardian 1 calls 10111 at 100 s; guardian 2, unaware, stands down at 130 s. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=100 guardian_ack_called_10111 · t=130 guardian_stand_down. If real: One guardian's stand_down closes the incident while the other is calling the police. If false: Not applicable. Notes: H7: guardian acknowledgement adds no coercion evidence.
- **G09** The attacker's own phone accepts a guardian invite created with the duress PIN; real guardians are told. Signals: t=0 duress_signal (guardian_add) · t=1 guardian_alert_delivered. If real: The decoy never receives alerts. If false: Not applicable.
- **G10** A dropped glass at night, the user asleep; guardians get the alert but nobody acknowledges; heartbeats continue. Signals: t=0 glass_or_breaking · t=71 no_answer_after_detection · t=72 guardian_alert_delivered · t=300 guardian_alert_opened. If real: Not applicable. If false: The bank signal went at 251 s, and the incident auto-closes at 6 h.
- **G11** The user scheduled removal of an abusive ex-partner as guardian; an hour later a shout goes unanswered. Signals: t=0 shout_or_yell · t=71 no_answer_after_detection · t=72 guardian_alert_delivered. If real: The abuser, still a guardian for 24 h, receives the alert and the location attached to signal_detected. If false: Not applicable. Notes: The stated cost of ADR-0036 (5). Research: TF-IPV.

### H · Cancellations and normal PIN

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| H01 | Quick normal PIN after a scream (eval t=8) | +7 scream_single, -6 normal_pin_in_window | 1 | 86% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 | ambiguous |
| H02 | Slow normal PIN (eval t=50) | +5 scream_single (+7 at t=0), -3 normal_pin_slow | 2 | 60% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 | ambiguous |
| H03 | Late normal PIN does not stop the bank rule (eval t=251) | +2 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 answered_late_normal | 12 | 0% | strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, no_answer, answered_late, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 | false |
| H04 | Instinctive normal PIN after a mugging (eval t=5) | +5 snatch, +4 shout_or_yell, -6 normal_pin_in_window | 3 | 67% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 9 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · ADR-0039 1 | real |
| H05 | Sustained scream, normal PIN (eval t=20) | +11 scream_sustained (+12 at t=0), -6 normal_pin_in_window | 5 | 55% conflicting | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 12 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 | ambiguous |
| H06 | The fast path fires, then a normal PIN (eval t=30) | +3 impact (+4 at t=0), +10 scream_sustained (+12 at t=1), +10 gun_like_repeated (+12 at t=3), -6 normal_pin_in_window | 17 | 26% | strong | T1 (V4 check-in; H2 caps detection at T1) | yes at t=3 (28 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · ADR-0039 2 | real |
| H07 | Normal PIN, then a duress PIN at settings (eval t=400) | +1 scream_single (+7 at t=0), -6 normal_pin_in_window, +40 duress_signal settings | 35 | 15% | user-signalled | T3 (H1 at t=400) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, pin_authorised, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 | real |
| H08 | Normal PIN, incident never closes (eval t=30000) | +0 glass_or_breaking (+5 at t=0), -6 normal_pin_in_window | -6 | 0% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 5 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 | false |

- **H01** A scream, then the normal PIN at 8 s. Signals: t=0 scream_single · t=8 normal_pin_in_window. If real: A forced normal PIN reads the same. If false: The ordinary cancel; the incident stays open. Notes: H5: the normal PIN lowered the tally, not the tier.
- **H02** A scream, then the normal PIN at 50 s, after 75% of the window. Signals: t=0 scream_single · t=50 normal_pin_slow. If real: Hesitation may mean pressure; it subtracts only 3. If false: The phone was in a bag. Notes: H5: the normal PIN lowered the tally, not the tier.
- **H03** No answer at 71 s; the user enters the normal PIN at 90 s; nobody stands down. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=90 answered_late_normal. If real: Not applicable. If false: answered_late is not a stand_down, so the bank signal still goes at 251 s. Notes: answered_late does not stop the 3-minute bank rule.
- **H04** A snatch and a shout; the attacker is gone and the user answers normally at 5 s. Signals: t=0 snatch · t=2 shout_or_yell · t=5 normal_pin_in_window. If real: Correct: the user is safe. If false: Not applicable. Notes: H5: the normal PIN lowered the tally, not the tier.
- **H05** Sustained screaming, then the normal PIN at 20 s. Signals: t=0 scream_sustained · t=20 normal_pin_in_window. If real: A forced normal PIN. If false: Children's game; K flags the conflict. Notes: H5: the normal PIN lowered the tally, not the tier.
- **H06** An impact, sustained screaming and repeated gun-like sounds within 3 s; the normal PIN comes at 30 s. Signals: t=0 impact · t=1 scream_sustained · t=3 gun_like_repeated · t=30 normal_pin_in_window. If real: Under the PROPOSED fast path guardians would already be alerted at 3 s. If false: Under the fast path, guardians would get a false alert before the user could answer. Notes: H5: the normal PIN lowered the tally, not the tier.
- **H07** A forced normal PIN at 10 s; at 400 s the attacker demands VIGIL be switched off and the user enters the duress PIN. Signals: t=0 scream_single · t=10 normal_pin_in_window · t=400 duress_signal (settings). If real: T3 at 400 s. If false: Not applicable. Notes: H5: the normal PIN lowered the tally, not the tier.
- **H08** A dropped glass is answered normally; eight hours later the incident is still open. Signals: t=0 glass_or_breaking · t=10 normal_pin_in_window. If real: Not applicable. If false: No stand_down and no guardians notified, so no close path exists. Notes: no auto-close: guardians were never notified (section 8); H5: the normal PIN lowered the tally, not the tier.

### I · Device and time anomalies

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| I01 | Check-in never shown (eval t=600) | +0 scream_sustained (+12 at t=0), +2 checkin_not_shown | 2 | 0% | faint | T1 (V4 check-in; H2 caps detection at T1) | n/a: check-in never shown | E0, 1 principal | journey_armed, signal_detected | BUILT-SPEC 2 | ambiguous |
| I02 | App force-stopped after the check-in opened (eval t=3600) | +0 scream_single (+7 at t=0), +10 no_answer_after_detection, +4 app_killed_while_armed | 14 | 0% | strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 1 | real |
| I03 | Phone rebooted after a scream (eval t=300) | +1 scream_single (+7 at t=0), +10 no_answer_after_detection, +10 contact_lost_soon_after_detection, +2 rebooted_while_armed | 23 | 0% | very strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, contact_lost, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 · PROPOSED 1 | real |
| I04 | Clock skew on the PIN result (eval t=10) | +7 scream_single, -6 normal_pin_in_window, 0 clock_skew | 1 | 86% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 3 | false |
| I05 | opened arrives late (eval t=30) | +4 glass_or_breaking (+5 at t=0), 0 opened_late, -6 normal_pin_in_window | -2 | 67% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 5 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 3 | false |
| I06 | Gun-like sound at night (eval t=1) | +8 gun_like_single, 0 night (unsourced; +2 held) | 8 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 8 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | ADR-0039 1 · PROPOSED 1 | ambiguous |
| I07 | Guy Fawkes fireworks (eval t=20) | +11 gun_like_repeated (+12 at t=0), -3 fireworks_season, -6 normal_pin_in_window | 2 | 82% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 9 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 1 · ADR-0039 1 · PROPOSED 1 | false |
| I08 | Month-end scream (eval t=1) | +7 scream_single, 0 month_end_window (unsourced; +1 held) | 7 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · PROPOSED 1 | ambiguous |
| I09 | Battery at 3% during a shout (eval t=95) | +2 shout_or_yell (+4 at t=0), +10 no_answer_after_detection, +10 contact_lost_soon_after_detection | 22 | 0% | very strong | T2 (H4 at t=71) | no (peak 4 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, contact_lost, guardian_alerted | BUILT-SPEC 3 | ambiguous |

- **I01** Notifications were revoked, so the check-in never appears and opened never arrives. Signals: t=0 scream_sustained · t=1 checkin_not_shown. If real: No opened means no no_answer deadline: nothing escalates. If false: Nothing escalates. Notes: opened never arrives, so no no_answer deadline exists.
- **I02** The attacker force-stops the app at 10 s; the server still fires no_answer (T07); the kill is seen at the next start. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=3600 app_killed_while_armed. If real: Server-owned escalation survives the kill. If false: Not applicable.
- **I03** The attacker reboots the phone at 10 s; heartbeats stop; the V10 re-arm prompt appears at 200 s. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=100 contact_lost_soon_after_detection · t=200 rebooted_while_armed. If real: T3 at 251 s. If false: Not applicable.
- **I04** The phone clock is wrong by an hour; the normal PIN result is accepted and flagged. Signals: t=0 scream_single · t=10 normal_pin_in_window · t=10 clock_skew. If real: Not applicable. If false: An integrity note only. Notes: H5: the normal PIN lowered the tally, not the tier.
- **I05** Poor data delays opened; the deadline starts at receipt; normal PIN at 30 s. Signals: t=0 glass_or_breaking · t=1 opened_late · t=30 normal_pin_in_window. If real: Not applicable. If false: An integrity note only. Notes: H5: the normal PIN lowered the tally, not the tier.
- **I06** A gun-like sound at 23:00. Signals: t=0 gun_like_single · t=0 night. If real: Night adds nothing until it is sourced. If false: A backfire. Notes: time context unsourced: held at 0. Research: GAP-MONTHEND, JAC-HIJACK.
- **I07** Repeated gun-like sounds on 5 November at 20:00; the user answers normally. Signals: t=0 gun_like_repeated · t=0 fireworks_season · t=20 normal_pin_in_window. If real: Not applicable. If false: The season lowers the gun-like reason; the normal PIN answers. Notes: H5: the normal PIN lowered the tally, not the tier. Research: LAW-FIREWORKS, ACLU-SS.
- **I08** A scream on the 25th, payday. Signals: t=0 scream_single · t=0 month_end_window. If real: Month end adds nothing until it is sourced. If false: Same. Notes: time context unsourced: held at 0. Research: GAP-MONTHEND.
- **I09** A shout; the battery dies at 5 s; no PIN; contact lost at 95 s. Signals: t=0 shout_or_yell · t=71 no_answer_after_detection · t=95 contact_lost_soon_after_detection. If real: T2. If false: A flat battery looks like an attack.

### J · Bank-partner signals

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| J01 | Duress PIN, then a new beneficiary and a large transfer (eval t=320) | +1 scream_single (+7 at t=0), +40 duress_signal checkin, +8 new_beneficiary_during_incident, +10 large_transfer_within_30min_of_detection | 59 | 0% | user-signalled | T3 (H1 at t=15) | n/a: H1 first at t=15 | E1, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, checkin_result, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 2 | real |
| J02 | No answer, then a large transfer (eval t=600) | +0 scream_single (+7 at t=0), +10 no_answer_after_detection, +10 large_transfer_within_30min_of_detection | 20 | 0% | very strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E0, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 1 | real |
| J03 | Coerced normal PIN plus bank anomalies (eval t=400) | +1 scream_single (+7 at t=0), -6 normal_pin_in_window, +8 limit_increase_during_incident, +8 new_beneficiary_during_incident | 11 | 35% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E1, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 2 | real |
| J04 | ATM withdrawal at night during an incident (eval t=900) | +0 shout_or_yell (+4 at t=0), 0 night (unsourced; +2 held), +10 no_answer_after_detection, +8 atm_withdrawal_unusual_hour_during_incident | 18 | 0% | strong | T3 (H4 +3 min at t=251) | no (peak 4 db) | E0, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 2 | real |
| J05 | Bank declines on its own (eval t=301) | +1 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 guardian_ack_called_10111, +10 large_transfer_within_30min_of_detection, +3 bank_decline_by_own_risk_engine | 24 | 0% | very strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E3, 3 principals | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, guardian_ack, bank_signal_sent | BUILT-SPEC 3 · PROPOSED 2 | real |
| J06 | Bank anomaly with no incident (eval t=10) | ~~new_beneficiary_during_incident~~ (no open incident), ~~large_transfer_within_30min_of_detection~~ (no open incident) | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | PROPOSED 2 | ambiguous |
| J07 | House robbery with a forced app transfer (eval t=420) | +0 glass_or_breaking (+5 at t=0), +0 shout_or_yell (+4 at t=3), +0 distress_vocal Crying, sobbing (+3 at t=10), +10 no_answer_after_detection, +8 new_beneficiary_during_incident, +10 large_transfer_within_30min_of_detection | 28 | 0% | very strong | T3 (H4 +3 min at t=251) | no (peak 12 db) | E0, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 3 · PROPOSED 3 | real |
| J08 | Intimate partner forces a transfer (eval t=900) | +0 shout_or_yell (+4 at t=0), -6 normal_pin_in_window, +10 large_transfer_within_30min_of_detection | 4 | 60% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 4 db) | E1, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 1 | real |

- **J01** Duress PIN at 15 s; at 300 s a new beneficiary is added and a large transfer attempted. Signals: t=0 scream_single · t=15 duress_signal (checkin) · t=300 new_beneficiary_during_incident · t=320 large_transfer_within_30min_of_detection. If real: The bank's hold is already in place; its own records corroborate. If false: Not applicable. Notes: H8: bank evidence moved the tally and E-level, not the tier. Research: ISS-EXPRESS, TC-UNLOCK.
- **J02** No answer; at 600 s a large transfer leaves the account. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=600 large_transfer_within_30min_of_detection. If real: T3 at 251 s; the bank's evidence adds +10. If false: Not applicable. Notes: H8: bank evidence moved the tally and E-level, not the tier. Research: TC-ATM.
- **J03** The normal PIN is forced at 12 s; the bank sees a limit increase and a new beneficiary minutes later. Signals: t=0 scream_single · t=12 normal_pin_in_window · t=380 limit_increase_during_incident · t=400 new_beneficiary_during_incident. If real: The tally rises past 'strong', but guardians are never alerted: bank evidence cannot move the tier (H8). If false: Not applicable. Notes: H5: the normal PIN lowered the tally, not the tier; H8: bank evidence moved the tally and E-level, not the tier. Research: TC-PIN.
- **J04** A shout at night, no answer; an ATM withdrawal at 900 s. Signals: t=0 shout_or_yell · t=0 night · t=71 no_answer_after_detection · t=900 atm_withdrawal_unusual_hour_during_incident. If real: T3 at 251 s. If false: Not applicable. Notes: H8: bank evidence moved the tally and E-level, not the tier; time context unsourced: held at 0. Research: NCA-ATM, TC-ATM.
- **J05** No answer; the guardian calls 10111; the bank's own engine declines a large transfer at 301 s. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=150 guardian_ack_called_10111 · t=300 large_transfer_within_30min_of_detection · t=301 bank_decline_by_own_risk_engine. If real: E3: device, guardian and bank. If false: Not applicable. Notes: H8: bank evidence moved the tally and E-level, not the tier; H7: guardian acknowledgement adds no coercion evidence.
- **J06** A journey is armed but nothing was heard; a new beneficiary and a large transfer appear. Signals: t=0 new_beneficiary_during_incident · t=10 large_transfer_within_30min_of_detection. If real: VUKA holds no incident, so the partner input has nowhere to go. If false: Normal banking.
- **J07** Glass breaks, a shout, sobbing; the family is tied up; no PIN; transfers at 400 to 420 s. Signals: t=0 glass_or_breaking · t=3 shout_or_yell · t=10 distress_vocal (Crying, sobbing) · t=71 no_answer_after_detection · t=400 new_beneficiary_during_incident · t=420 large_transfer_within_30min_of_detection. If real: T3 at 251 s; the record precedes the transfers. If false: Not applicable. Notes: H8: bank evidence moved the tally and E-level, not the tier. Research: CIT-HOUSE, TC-UNLOCK.
- **J08** A partner shouts once, makes the user enter the normal PIN, then forces a transfer from her app. Signals: t=0 shout_or_yell · t=10 normal_pin_in_window · t=900 large_transfer_within_30min_of_detection. If real: T1; coercive control rarely sounds like a scream. If false: Not applicable. Notes: H5: the normal PIN lowered the tally, not the tier; H8: bank evidence moved the tally and E-level, not the tier. Research: TF-IPV.

### K · Benign and false situations

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| K01 | Television scream (eval t=6) | +7 scream_single, -6 media_context Television, -6 normal_pin_in_window | -5 | 58% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 1 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 1 | false |
| K02 | Soccer match at a tavern (eval t=15) | +4 shout_or_yell, -5 crowd_context Cheering, -6 normal_pin_in_window | -7 | 36% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak -1 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 1 | false |
| K03 | Children playing (eval t=10) | +7 scream_single, -4 children_playing, -6 normal_pin_in_window | -3 | 70% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 3 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 1 | false |
| K04 | Braai: a dropped bottle and laughter (eval t=20) | +4 glass_or_breaking (+5 at t=0), -4 laughter, -6 normal_pin_in_window | -6 | 40% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 1 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 1 | false |
| K05 | New Year fireworks (eval t=25) | +10 gun_like_repeated (+12 at t=0), -3 fireworks_season, -4 crowd_context Cheering (-5 at t=1), -6 normal_pin_in_window | -3 | 77% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 4 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 1 · ADR-0039 1 · PROPOSED 2 | false |
| K06 | Phone drop (eval t=1) | ~~impact~~ (H3: not recorded) | 0 | 0% | faint | T0 (H3 motion only) | n/a: no check-in | none | journey_armed | ADR-0039 1 | false |
| K07 | Gym: phone in a locker (eval t=251) | +1 shout_or_yell (+4 at t=0), -1 media_context Music (-6 at t=0), +10 no_answer_after_detection | 10 | 9% | some | T3 (H4 +3 min at t=251) | no (peak -1 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 1 | false |
| K08 | Church service (eval t=30) | +3 shout_or_yell (+4 at t=0), -5 media_context Music (-6 at t=0), -4 crowd_context Applause (-5 at t=0), -6 normal_pin_in_window | -12 | 20% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak -5 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 2 | false |
| K09 | Loud argument at home (eval t=20) | +4 shout_or_yell, -6 normal_pin_in_window | -2 | 67% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 4 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 | ambiguous |
| K10 | Taxi rank (eval t=25) | +3 shout_or_yell (+4 at t=0), -4 crowd_context Crowd (-5 at t=0), +2 car_alarm, -6 normal_pin_in_window | -5 | 50% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 2 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 2 | false |
| K11 | Glass recycling bank (eval t=15) | +5 glass_or_breaking, +3 smash_crash, -6 normal_pin_in_window | 2 | 75% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 8 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 1 | false |
| K12 | Action movie at home (eval t=20) | +11 gun_like_repeated (+12 at t=0), -5 media_context Television (-6 at t=0), -6 normal_pin_in_window | 0 | 100% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 6 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 1 · ADR-0039 1 · PROPOSED 1 | false |
| K13 | Cinema horror film (eval t=55) | +9 scream_sustained (+12 at t=0), -4 media_context Music (-6 at t=0), -3 normal_pin_slow | 2 | 78% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 6 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 · PROPOSED 1 | false |

- **K01** A crime drama on TV; a scream and Television in the same window; normal PIN at 6 s. Signals: t=0 scream_single · t=0 media_context (Television) · t=6 normal_pin_in_window. If real: Not applicable. If false: Faint; answered. Notes: H5: the normal PIN lowered the tally, not the tier.
- **K02** A Soweto derby on the big screen; shouting and cheering; normal PIN at 15 s. Signals: t=0 shout_or_yell · t=0 crowd_context (Cheering) · t=15 normal_pin_in_window. If real: Not applicable. If false: Negative; answered. Notes: H5: the normal PIN lowered the tally, not the tier. Research: GAP-BENIGN.
- **K03** Children screaming in a backyard game. Signals: t=0 scream_single · t=0 children_playing · t=10 normal_pin_in_window. If real: Not applicable. If false: Answered. Notes: H5: the normal PIN lowered the tally, not the tier. Research: GAP-BENIGN.
- **K04** A bottle breaks at a Saturday braai amid laughter. Signals: t=0 glass_or_breaking · t=0 laughter · t=20 normal_pin_in_window. If real: Not applicable. If false: Answered. Notes: H5: the normal PIN lowered the tally, not the tier.
- **K05** Midnight fireworks and cheering on 1 January. Signals: t=0 gun_like_repeated · t=0 fireworks_season · t=1 crowd_context (Cheering) · t=25 normal_pin_in_window. If real: Not applicable. If false: Answered. Notes: H5: the normal PIN lowered the tally, not the tier. Research: LAW-FIREWORKS, ACLU-SS.
- **K06** The phone falls out of a car door. Signals: t=0 impact. If real: Not applicable. If false: Nothing recorded (H3).
- **K07** A shout over gym music; the phone is in a locker; nobody answers and nobody stands down. Signals: t=0 shout_or_yell · t=0 media_context (Music) · t=71 no_answer_after_detection. If real: Not applicable. If false: A false no_answer reaches the bank at 251 s (M7 measures this rate).
- **K08** A preacher shouts over music and applause. Signals: t=0 shout_or_yell · t=0 media_context (Music) · t=0 crowd_context (Applause) · t=30 normal_pin_in_window. If real: Not applicable. If false: Strongly negative; answered. Notes: H5: the normal PIN lowered the tally, not the tier.
- **K09** A loud argument, one shout; the user answers normally. Signals: t=0 shout_or_yell · t=20 normal_pin_in_window. If real: The same record may hide intimate-partner coercion. If false: An ordinary argument. Notes: H5: the normal PIN lowered the tally, not the tier. Research: TF-IPV.
- **K10** A marshal shouts at Bree Street taxi rank; a crowd and a car alarm. Signals: t=0 shout_or_yell · t=0 crowd_context (Crowd) · t=4 car_alarm · t=25 normal_pin_in_window. If real: Not applicable. If false: Answered. Notes: H5: the normal PIN lowered the tally, not the tier.
- **K11** The user empties bottles into a recycling bank. Signals: t=0 glass_or_breaking · t=1 smash_crash · t=15 normal_pin_in_window. If real: Not applicable. If false: Answered; glass has no negative context. Notes: H5: the normal PIN lowered the tally, not the tier.
- **K12** Gunfire in a film; Television in the same window. Signals: t=0 gun_like_repeated · t=0 media_context (Television) · t=20 normal_pin_in_window. If real: Not applicable. If false: Answered. Notes: H5: the normal PIN lowered the tally, not the tier.
- **K13** Sustained screaming over the soundtrack; the user answers late in the window. Signals: t=0 scream_sustained · t=0 media_context (Music) · t=55 normal_pin_slow. If real: Not applicable. If false: Answered slowly. Notes: H5: the normal PIN lowered the tally, not the tier.

### L · Staged and fraudulent events

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| L01 | Clean-room staging with a duress PIN (eval t=200) | +4 scream_sustained (+12 at t=0), +40 duress_signal checkin, +8 new_beneficiary_during_incident | 52 | 0% | user-signalled | T3 (H1 at t=10) | n/a: H1 first at t=10 | E1, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, checkin_result, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 1 | staged |
| L02 | Staged no-answer before an ATM withdrawal (eval t=600) | +0 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 no_ack_by_T, +8 atm_withdrawal_unusual_hour_during_incident | 18 | 0% | strong | T3 (H4 +3 min at t=251) | no (peak 7 db) | E0, 2 principals (bank record without a guardian) | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 2 | staged |
| L03 | Claim with no VUKA record at all (eval t=0) | 0 claim_filed_without_guardian_record | 0 | 0% | faint | T0 (not armed) | n/a: no check-in | none | nothing | PROPOSED 1 | ambiguous |
| L04 | Third incident in a month, same pattern (eval t=12) | +7 scream_single, +40 duress_signal checkin, 0 repeat_incidents_same_pattern | 47 | 0% | user-signalled | T3 (H1 at t=12) | n/a: H1 first at t=12 | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, guardian_alerted, bank_signal_sent | BUILT-SPEC 2 · PROPOSED 1 | staged |
| L05 | Detections only while insured at high cover (eval t=71) | +3 shout_or_yell (+4 at t=0), +10 no_answer_after_detection, 0 detections_only_when_insured_high_cover | 13 | 0% | strong | T2 (H4 at t=71) | no (peak 4 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened, no_answer, guardian_alerted | BUILT-SPEC 2 · PROPOSED 1 | staged |
| L06 | The 'victim' is the conspirator (eval t=0) | +40 duress_signal settings | 40 | 0% | user-signalled | T3 (H1 at t=0) | n/a: no check-in | E1, 1 principal | journey_armed, pin_authorised, guardian_alerted, bank_signal_sent | BUILT-SPEC 1 | staged |

- **L01** An accomplice screams near the phone; the claimant enters the duress PIN and then tries a transfer to claim for it. Signals: t=0 scream_sustained · t=10 duress_signal (checkin) · t=200 new_beneficiary_during_incident. If real: Not applicable. If false: The partner bank's hold blocks the claimant's own transfer; the record shows only what was fed in. Notes: Staging is itself an offence (STAGED-DURESS-DEFENCE section 2); H8: bank evidence moved the tally and E-level, not the tier. Research: CIT-STAGED.
- **L02** An accomplice screams, the claimant ignores the check-in and withdraws cash at 600 s; the alert was delivered but nobody acknowledged. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=251 no_ack_by_T (delivery: delivered, no acknowledgement) · t=600 atm_withdrawal_unusual_hour_during_incident. If real: Not applicable. If false: The record reads like F12; only other records (ATM camera, cell towers) can separate them. Notes: H8: bank evidence moved the tally and E-level, not the tier. Research: CIT-STAGED, GAP-STAGED.
- **L03** A claimant says she was coerced, but no journey was armed. Signals: t=0 claim_filed_without_guardian_record. If real: The absence of a record is never evidence against anyone. If false: The same: no conclusion either way.
- **L04** Scream then duress PIN, for the third time this month. Signals: t=0 scream_single · t=12 duress_signal (checkin) · t=12 repeat_incidents_same_pattern. If real: Repeat victimisation happens; the note is for an investigator, not a rule. If false: A pattern for a human to examine. Research: GAP-STAGED.
- **L05** Every detection falls inside a high-cover insurance window. Signals: t=0 shout_or_yell · t=71 no_answer_after_detection · t=71 detections_only_when_insured_high_cover. If real: Coincidence is possible; never an automatic denial. If false: A pattern for a human to examine.
- **L06** A man staging his own kidnapping enters the duress PIN at settings himself. Signals: t=0 duress_signal (settings). If real: Not applicable. If false: The record cannot tell a conspirator's duress PIN from a victim's. Research: CIT-STAGED.

### M · Remote coercion VIGIL can't see

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| M01 | Vishing call (eval t=0) | none | 0 | 0% | faint | T0 (not armed) | n/a: no check-in | none | nothing | none | remote |
| M02 | SIM swap (eval t=0) | none | 0 | 0% | faint | T0 (not armed) | n/a: no check-in | none | nothing | none | remote |
| M03 | Sextortion (eval t=0) | none | 0 | 0% | faint | T0 (not armed) | n/a: no check-in | none | nothing | none | remote |
| M04 | Investment or romance scam (eval t=0) | none | 0 | 0% | faint | T0 (not armed) | n/a: no check-in | none | nothing | none | remote |

- **M01** A caller posing as the bank's fraud desk talks the user into approving a payment. Signals: no signals. If real: VIGIL hears nothing: there is no scream, and the user believes the call. If false: Not applicable. Notes: Out of scope by design; stated, not hidden. Research: ENTERSEKT.
- **M02** A fraudster ports the user's number and resets banking access. Signals: no signals. If real: Nothing on the phone's microphone changes. If false: Not applicable. Notes: Out of scope by design. Research: XCONNECT.
- **M03** A threat to publish images unless money is paid. Signals: no signals. If real: Remote and silent; T0. If false: Not applicable. Notes: Out of scope; no source in the research brief is strong enough to cite for prevalence.
- **M04** The user sends money willingly to a scammer over weeks. Signals: no signals. If real: No coercion at the phone; T0. If false: Not applicable. Notes: Out of scope by design.

### N · Parked signals

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| N01 | Trigger words: 'give me your PIN' (eval t=1) | +4 shout_or_yell, (+10 trigger_words give me your PIN: PARKED, not scored) | 4 | 0% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 4 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · PARKED 1 | real |
| N02 | Bluetooth drops at speed (eval t=1) | (+0 bluetooth_drop_at_speed: PARKED, not scored) | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | PARKED 1 | real |
| N03 | High-crime precinct (eval t=1) | +7 scream_single, (+2 high_crime_precinct: PARKED, not scored) | 7 | 0% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 7 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · PARKED 1 | ambiguous |
| N04 | Surge while driving (eval t=2) | (+0 surge: DROPPED, not scored), +4 shout_or_yell | 4 | 0% | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 4 db) | E0, 1 principal | journey_armed, signal_detected, checkin_opened | BUILT-SPEC 1 · DROPPED 1 | false |

- **N01** A shout, then the words 'give me your PIN' in isiZulu. Signals: t=0 shout_or_yell · t=1 trigger_words (give me your PIN). If real: Would add +10 if built; not built (RICA/POPIA question to Ipeleng; would supersede ADR-0038). If false: A TV drama with the same words. Notes: PARKED signals would add +10 db if built (what-if total 14).
- **N02** The car's Bluetooth disconnects at 80 km/h as the hijacker throws the phone out. Signals: t=0 bluetooth_drop_at_speed. If real: Parked stretch detector with no weight; nothing recorded. If false: The user switched Bluetooth off.
- **N03** A scream in a precinct with high SAPS robbery counts. Signals: t=0 scream_single · t=0 high_crime_precinct. If real: Would add +2 if built; needs the parked risk layer. If false: Would also raise false alarms for everyone who lives there. Notes: PARKED signals would add +2 db if built (what-if total 9).
- **N04** Hard braking, then a shout. Signals: t=0 surge · t=2 shout_or_yell. If real: Surge is dropped; only the shout counts. If false: A near miss.

### O · Human reactions

| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |
|---|---|---|---:|---:|---|---|---|---|---|---|---|
| O01 | Freezing: no scream at all (eval t=5) | ~~distress_vocal Whimper~~ (no trigger within 10 s: not recorded), ~~distress_vocal Gasp~~ (no trigger within 10 s: not recorded) | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | PROPOSED 2 | real |
| O02 | Whispered threat (eval t=0) | none | 0 | 0% | faint | T0 (nothing detected) | n/a: no check-in | none | journey_armed | none | real |
| O03 | Coerced normal PIN (S6) (eval t=20) | +4 shout_or_yell, -6 normal_pin_in_window | -2 | 67% conflicting | faint | T1 (V4 check-in; H2 caps detection at T1) | no (peak 4 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 | real |
| O04 | Duress PIN forgotten under stress (eval t=55) | +9 scream_sustained (+12 at t=0), -3 normal_pin_slow | 6 | 33% | some | T1 (V4 check-in; H2 caps detection at T1) | no (peak 12 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result | BUILT-SPEC 2 | real |
| O05 | Fumbled PIN, answered late (eval t=100) | +4 scream_single (+7 at t=0), +10 no_answer_after_detection, 0 answered_late_normal | 14 | 0% | strong | T2 (H4 at t=71) | no (peak 7 db) | E1, 1 principal | journey_armed, signal_detected, checkin_opened, checkin_result, no_answer, answered_late, guardian_alerted | BUILT-SPEC 3 | real |

- **O01** The user freezes during an assault; only a Whimper and a Gasp are audible. Signals: t=0 distress_vocal (Whimper) · t=5 distress_vocal (Gasp). If real: Nothing is recorded: the most common reaction triggers nothing. If false: Not applicable. Research: SCIAM-TI, SCIAM-SILENT.
- **O02** The attacker whispers 'don't make a sound, give me the phone'. Signals: no signals. If real: Nothing is recorded; Whispering (12) is not mapped. If false: Not applicable. Research: GAP-WHISPER.
- **O03** A shout; the attacker watches the user enter the real PIN at 20 s. Signals: t=0 shout_or_yell · t=20 normal_pin_in_window. If real: 'Normal code entered', not 'safe': T1 stays. If false: Not applicable. Notes: H5: the normal PIN lowered the tally, not the tier. Research: TC-PIN.
- **O04** Sustained screaming; the user cannot recall the duress PIN and enters the normal one late in the window. Signals: t=0 scream_sustained · t=55 normal_pin_slow. If real: T1: the design depends on recall nobody has measured. If false: Not applicable. Notes: H5: the normal PIN lowered the tally, not the tier. Research: GAP-SECRET.
- **O05** A scream; the user fumbles, no_answer fires, then she enters the normal PIN at 100 s meaning the duress one. Signals: t=0 scream_single · t=71 no_answer_after_detection · t=100 answered_late_normal. If real: T2 from no_answer; the late normal PIN cannot lower it. If false: Not applicable. Notes: answered_late does not stop the 3-minute bank rule. Research: GAP-SECRET.

## 7 · The base-rate trap, illustrated

The true rate of coercion per armed journey-hour is **unknown**; only a pilot can measure it. The table reads three tallies as if each were a calibrated likelihood ratio, at two **assumed** base rates (`ASSUMPTION`, not a measurement). It shows why a large tally is still mostly false alarms when coercion is rare. It is arithmetic on uncalibrated priors, not a probability that anyone was coerced.

| Scenario | Tally | Read as odds | Share real at 1 in 10,000 | Share real at 1 in 1,000 |
|---|---:|---:|---:|---:|
| F02 Scream, walk to a vehicle, contact lost, ATM at night | 36 db | x3981 | 28.5% | 79.9% |
| E01 Scream, then no answer | 15 db | x31 | 0.3% | 3.1% |
| K01 Television scream | -5 db | x0.316 | 0.0% | 0.0% |

Computed with integers: the odds factor is floor(10^(db/10) x 1000) / 1000 by an exact integer root, and the share is that factor over (factor + base-rate odds), rounded half-up to 0.1%.

## 8 · What we forgot

Signals, contract fields and rules the catalogue shows are missing or undecided. Each names the scenarios that expose it.

1. **A check-in that is never shown has no deadline.** The no_answer deadline is keyed on the server receipt of opened (spec section 8). If opened never arrives (notifications revoked, full-screen intent refused), no deadline exists and nothing escalates. The server needs a fallback deadline from the receipt of signal_detected. Exposed by I01.
2. **A false alarm answered with a normal PIN never closes.** An incident closes only on stand_down or the 6 h auto-close, which needs guardians notified. A normal-PIN cancel leaves it open indefinitely, so a later dead zone or load-shedding outage fires contact_lost and reaches the bank signal (P3.L8, review blocker 3). Exposed by E06, E10, E11, H08.
3. **Ending a journey is not PIN-gated.** An attacker can end the journey with no PIN. Heartbeats then stop legitimately, so contact_lost can never fire. journey_ended should need a pin_authorised (a duress PIN there is then an alarm). Exposed by F06, F07.
4. **Duress-PIN recall under stress is unmeasured.** The design assumes a victim recalls a second PIN during an assault. No study was found and section 16 has no measure for it; the CEM-0 header cites an M8 that section 16 does not define. Exposed by O04, O05.
5. **Guardian delivery failure has no state.** no_ack_by_T needs a delivery state (queued, FCM accepted, displayed, SMS sent, failed), but no chain kind or contract field carries it. guardian_alert_delivered and guardian_alert_opened exist only as outbox state. Exposed by G03, L02.
6. **Bank trigger provenance is not recorded.** bank_signal_sent does not say which rule sent it (H1 duress or H4 no stand_down) or which event it rests on (Ipeleng's S1). Inbound partner observations (new beneficiary, ATM, decline) have no event kind at all. Exposed by J01, J02, J05, F13.
7. **Heartbeats carry no battery or network state.** A flat battery, a tower outage and an attacker switching the phone off all look identical to the server. Battery percentage and network type in the heartbeat would separate them without location. Exposed by E07, I09, E11.
8. **Anomaly notes need a payload-version bump.** app_killed_while_armed, rebooted_while_armed, checkin_not_shown and answered_late are reasons without a place in the payload. Adding them needs a pv bump in contract v2, not an ad hoc field. Exposed by I01, I02, I03.
9. **Motion after the sound never counts.** The look-back only runs backwards from a sound. A grab after a scream (the common order) is never recorded. A symmetric window of -10 s to +10 s needs a decision in ADR-0039. Exposed by C04, C03.
10. **Silence and whispers never open a check-in.** Freezing is the documented reaction for many victims, and distress vocalisations and Whispering (12) cannot trigger. Nothing in CEM-0 lets a supporting class open a check-in. Exposed by O01, O02, A10.
11. **Any single guardian's stand_down closes everything.** One guardian can close the incident while another is calling 10111, and an attacker texting from the victim's phone can talk a guardian into standing down before the 3-minute bank rule. Exposed by G08, G04.
12. **A late normal PIN does not stop the 3-minute bank rule.** answered_late is not a stand_down, so a user who answers late still gets a bank hold unless a guardian stands down. Guardians need to be told that the user answered late. Exposed by H03, O05.
13. **Bank evidence cannot alert guardians.** After a coerced normal PIN, strong bank-partner evidence during the incident still leaves the tier at T1 (H8). H8 forbids only the bank signal; alerting guardians on partner evidence is an open decision. Exposed by J03, J08.
14. **The K cap is inert and K flags ordinary cancels.** T3 comes only from H1 or H4, which the tally cannot override, so capping at T2 on K of 50% or more never binds. K also reads almost every quick normal-PIN cancel as conflicting. K fits better as a fast-path guard. Exposed by H01, H05, K12.
15. **An accidental duress PIN has no cancel.** A mistyped duress PIN sends the bank signal at once, and guardians may not call the user until a stand_down. There is no safe path for the user to say it was a mistake. Exposed by D10.
16. **A second detection inside an open incident is unspecified.** The spec does not say whether a new detection during an open incident opens a second check-in, restarts the deadline, or only adds a signal_detected. Exposed by H07, H08.
17. **Time-context weights are unsourced.** The research brief found no source for night or month-end timing of express kidnapping, so both are held at 0. The only timing snippet (hijacking, Thursdays 16:00 to 21:00) was not independently fetched. Exposed by I06, I08, F02.
18. **Fireworks are a calendar rule, not a sound.** YAMNet has Fireworks (426) and Firecracker (427). Co-occurrence with those classes could replace or support the calendar-only fireworks_season rule. Exposed by I07, K05.
19. **No route or location history.** Location is attached only to signal_detected, so an e-hailing driver leaving the route leaves no trace until something is heard. Exposed by F05.

## 9 · Sources

Facts come from the sourced research brief prepared for this catalogue on 23 Sep 2026; each entry carries its own source, date and URL. Quoted spans are as the brief recorded them. Where the brief marks a fact as a search-engine synthesis, a snippet or a paraphrase, that marker is kept in bold and the span is not a verified literal quote. `NOT FOUND` rows are gaps the brief could not source; they are cited as gaps, not as facts.

- **ACLU-SS** · ACLU of Massachusetts, Data for Justice Project, Boston ShotSpotter records, 8 Apr 2024. Quote: "16 percent of alerts corresponded to common urban sounds". https://data.aclum.org/2024/04/08/boston-shotspotter/
- **CIT-HOUSE** · The Citizen / Carletonville Herald, Blybank house robbery, 29 Jul 2026. Paraphrase: "forced to give their online banking details". https://www.citizen.co.za/carletonville-herald/local-news/2026/07/29/armed-house-robbery-in-blybank-family-tied-up-as-gunmen-empty-victims-bank-account/ **search-engine paraphrase; not independently fetched**.
- **CIT-STAGED** · The Citizen, Soweto staged kidnapping, 6 to 7 Aug 2026. Quote: "conspired with the three suspects to stage the kidnapping". https://www.citizen.co.za/news/soweto-man-arrested-after-staging-his-own-kidnapping-to-extort-r100k-from-family/ **search-engine synthesis; not independently fetched**.
- **ENTERSEKT** · Entersekt survey of 29 bank fraud professionals, date not recorded in the brief. Quote: "APP fraud and Vishing (52%)". https://www.entersekt.com/company/press-releases/tpost/03m7l1ms11-sa-banks-concerned-by-app-fraud-look-to **search-engine synthesis; not independently fetched**.
- **FTC-PIN** · US Federal Trade Commission press release on emergency ATM technology, 7 May 2010. Quote: "the costs and benefits of the emergency technologies specified in the Act". https://search.ftc.gov/news-events/news/press-releases/2010/05/ftc-issues-report-emergency-technology-use-atms **press release only; the report body was not read**.
- **GAP-BENIGN** · Research brief, gap 5, 23 Sep 2026. **NOT FOUND: no study of benign scream or shout sources near a phone**.
- **GAP-EHAILING** · Research brief, section 1, 23 Sep 2026. **NOT FOUND: no dataset quantifying e-hailing abduction**.
- **GAP-MONTHEND** · Research brief, gap 6, 23 Sep 2026. **NOT FOUND: no time-of-day, month-end or payday source for express kidnapping**.
- **GAP-PHONE** · Research brief, gap 7, 23 Sep 2026. **NOT FOUND: what attackers do physically to the phone (SIM out, off, discarded)**.
- **GAP-SECRET** · Research brief, gap 10, 23 Sep 2026. **NOT FOUND: whether victims can secretly operate a phone under duress**.
- **GAP-STAGED** · Research brief, gap 9, 23 Sep 2026. **NOT FOUND: share of kidnapping or robbery reports later found staged**.
- **GAP-WHISPER** · Research brief, section 4, 23 Sep 2026. **NOT FOUND: whispered or silent threats as a sourced robbery statistic**.
- **ISS-EXPRESS** · ISS Africa, 'South Africa's armed robbery problem drives kidnapping', 3 Dec 2024. Quote: "coerced into drawing money from ATMs or transferring their funds". https://issafrica.org/iss-today/south-africa-s-armed-robbery-problem-drives-kidnapping
- **ISS-HIJACK** · ISS Africa, same article, 3 Dec 2024. Quote: "44% committed during a hijacking". https://issafrica.org/iss-today/south-africa-s-armed-robbery-problem-drives-kidnapping
- **JAC-HIJACK** · Jacaranda FM, 'Criminals have new peak hijacking times in SA', date not found. Quote: "Thursdays between 16:00 and 21:00 were the highest-risk periods for hijackings". https://www.jacarandafm.com/shows/breakfast/criminals-have-new-peak-hijacking-times-in-sa/ **search snippet only; not independently fetched**.
- **LAW-FIREWORKS** · LawForAll, fireworks laws in South Africa, date not recorded in the brief. Quote: "Diwali, New Year's Eve, and Guy Fawkes". https://www.lawforall.co.za/arrest-crimes/fireworks-laws-south-africa/ **search-engine synthesis; not independently fetched**.
- **NCA-ATM** · National Crime Assist, 'Express Kidnappings', no publication date found on the page. Quote: "Accompanying victims to ATMs to withdraw cash, often under threat". https://nca247.org.za/express-kidnappings/
- **SCIAM-SILENT** · Scientific American, 'Sexual Assault May Trigger Involuntary Paralysis', 4 Aug 2017. Quote: "Many also did not yell for help". https://www.scientificamerican.com/article/sexual-assault-may-trigger-involuntary-paralysis/
- **SCIAM-TI** · Scientific American, same article, 4 Aug 2017. Quote: "70 percent experienced at least 'significant' tonic immobility". https://www.scientificamerican.com/article/sexual-assault-may-trigger-involuntary-paralysis/
- **TC-ATM** · TechCentral, 'Banking app kidnappings are on the rise in South Africa', 7 Nov 2023. Quote: "perpetrators drive around and make withdrawals at ATMs as quickly as they can". https://techcentral.co.za/banking-app-kidnappings-south-africa/234770/
- **TC-PIN** · TechCentral, same article, 7 Nov 2023. Quote: "Pins, biometric authentication and facial recognition prove to be ineffective". https://techcentral.co.za/banking-app-kidnappings-south-africa/234770/
- **TC-UNLOCK** · TechCentral, same article, 7 Nov 2023. Quote: "forced to open their own profile on their own phone". https://techcentral.co.za/banking-app-kidnappings-south-africa/234770/
- **TF-IPV** · Taylor & Francis Online, 'Cellphones and romantic relationships of young women in urban informal settlements in South Africa', date not recorded in the brief. Quote: "an extension of their repertoire of coercive control". https://www.tandfonline.com/doi/full/10.1080/13691058.2021.1953609 **search-engine synthesis; not independently fetched**.
- **XCONNECT** · XConnect, 'SIM Swap Fraud in South Africa 2024', 2024 (from the title). Quote: "around 60% of mobile banking fraud". https://www.xconnect.net/sim-swap-fraud-in-south-africa-2024 **search-engine synthesis; not independently fetched**.
- **YAMNET-CSV** · TensorFlow models repository, `yamnet_class_map.csv`, fetched 23 Sep 2026. https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv (sha256 `cdf24d193e196d9e95912a2667051ae203e92a2ba09449218ccb40ef787c6df2`).

Not used: the research brief's digital-fraud loss totals (one conflicts with a dead number in `docs/MASTER-CONTEXT.md`), its carjacking count and its sextortion share (low confidence).

