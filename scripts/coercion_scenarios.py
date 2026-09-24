#!/usr/bin/env python3
"""Coercion scenario catalogue generator, CEM-0 (Coercion Evidence Model v0).

Status: PROPOSED. Every weight is an uncalibrated design prior, not a probability.

    python scripts/coercion_scenarios.py            # writes docs/COERCION-SCENARIOS.md
    python scripts/coercion_scenarios.py --check    # exit 1 if that file is stale
    python scripts/coercion_scenarios.py --csv PATH # also writes the rows as CSV
    python scripts/coercion_scenarios.py --json     # prints evaluated rows as JSON (tests)

Python 3.11+, standard library only. Deterministic: integer arithmetic only
(points are integer decibans; decay uses exact integer comparisons), and every
traversal is sorted or follows a fixed, declared order.
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import math
import sys
from fractions import Fraction
from pathlib import Path

CEM_VERSION = "CEM-0"
ROOT = Path(__file__).resolve().parent.parent
DOC_PATH = ROOT / "docs" / "COERCION-SCENARIOS.md"

HALF_LIFE_S = 120          # detector reasons halve every 120 s
LOOKBACK_S = 10            # motion corroborates a sound within [-10 s, 0] (H3)
SUPPORT_WINDOW_S = 10      # supporting sounds attach to a trigger within +/-10 s
CONTEXT_WINDOW_S = 1       # negative context: same or adjacent 0.975 s window
GRACE_S = 10               # no_answer = opened + window + 10 s grace (spec section 8)
H4_BANK_DELAY_S = 180      # H4: 3 min with no stand_down -> T3
AUTO_CLOSE_S = 21600       # 6 h auto-close (spec section 8)
SOON_S = 120               # "soon after detection"
FAST_PATH_DB = 25          # PROPOSED fast path threshold (section 5)
K_CONFLICT_PCT = 50        # conflict flag threshold
DISTRESS_CAP = 6           # distress_vocal cap
WINDOWS = (20, 60)         # allowed check-in windows (spec section 7)

# --------------------------------------------------------------------------
# YAMNet classes, by label. Checked on 23 Sep 2026 against
# research/audioset/yamnet/yamnet_class_map.csv (tensorflow/models, master),
# 521 classes, file sha256 cdf24d193e196d9e95912a2667051ae203e92a2ba09449218ccb40ef787c6df2.
# --------------------------------------------------------------------------
YAMNET_CSV_URL = ("https://raw.githubusercontent.com/tensorflow/models/master/"
                  "research/audioset/yamnet/yamnet_class_map.csv")
YAMNET_CSV_SHA256 = "cdf24d193e196d9e95912a2667051ae203e92a2ba09449218ccb40ef787c6df2"
YAMNET = [  # (reason family, index, exact label, status of the mapping)
    ("scream", 11, "Screaming", "BUILT-SPEC"),
    ("shout_or_yell", 6, "Shout", "BUILT-SPEC"),
    ("shout_or_yell", 9, "Yell", "BUILT-SPEC"),
    ("glass_or_breaking", 435, "Glass", "BUILT-SPEC"),
    ("glass_or_breaking", 437, "Shatter", "BUILT-SPEC"),
    ("glass_or_breaking", 464, "Breaking", "BUILT-SPEC"),
    ("smash_crash", 463, "Smash, crash", "PROPOSED"),
    ("gun_like", 421, "Gunshot, gunfire", "ADR-0039"),
    ("gun_like", 422, "Machine gun", "ADR-0039"),
    ("gun_like", 423, "Fusillade", "ADR-0039"),
    ("distress_vocal", 19, "Crying, sobbing", "PROPOSED"),
    ("distress_vocal", 21, "Whimper", "PROPOSED"),
    ("distress_vocal", 33, "Groan", "PROPOSED"),
    ("distress_vocal", 39, "Gasp", "PROPOSED"),
    ("tyre_squeal_or_skid", 306, "Skidding", "PROPOSED"),
    ("tyre_squeal_or_skid", 307, "Tire squeal", "PROPOSED"),
    ("car_alarm", 304, "Car alarm", "PROPOSED"),
    ("media_context", 132, "Music", "PROPOSED"),
    ("media_context", 267, "Video game music", "PROPOSED"),
    ("media_context", 518, "Television", "PROPOSED"),
    ("media_context", 519, "Radio", "PROPOSED"),
    ("crowd_context", 61, "Cheering", "PROPOSED"),
    ("crowd_context", 62, "Applause", "PROPOSED"),
    ("crowd_context", 64, "Crowd", "PROPOSED"),
    ("children_playing", 66, "Children playing", "PROPOSED"),
    ("laughter", 13, "Laughter", "PROPOSED"),
    ("siren_nearby", 317, "Police car (siren)", "PROPOSED"),
    ("siren_nearby", 318, "Ambulance (siren)", "PROPOSED"),
    ("siren_nearby", 319, "Fire engine, fire truck (siren)", "PROPOSED"),
    ("siren_nearby", 390, "Siren", "PROPOSED"),
    ("unmapped", 10, "Children shouting", "not mapped"),
    ("unmapped", 12, "Whispering", "not mapped"),
    ("unmapped", 426, "Fireworks", "not mapped"),
    ("unmapped", 427, "Firecracker", "not mapped"),
]
DISTRESS_LABELS = ("Crying, sobbing", "Whimper", "Groan", "Gasp")

# --------------------------------------------------------------------------
# REASONS: name -> (points in decibans, status, decays, one-line meaning).
# Exactly per the CEM-0 spec section 3. Insertion order is the display order.
# --------------------------------------------------------------------------
REASONS: dict[str, tuple[int, str, bool, str]] = {
    # Sound
    "scream_single": (7, "BUILT-SPEC", True, "Screaming (11) above threshold in one 0.975 s window"),
    "scream_sustained": (12, "BUILT-SPEC", True, "Screaming in 3 or more windows within 10 s; replaces scream_single"),
    "shout_or_yell": (4, "BUILT-SPEC", True, "Shout (6) or Yell (9) above threshold"),
    "glass_or_breaking": (5, "BUILT-SPEC", True, "Glass (435), Shatter (437) or Breaking (464) above threshold"),
    "smash_crash": (3, "PROPOSED", True, "Smash, crash (463) as an added trigger class"),
    "gun_like_single": (8, "ADR-0039", True, "a gun-like sound (421, 422, 423) in one window"),
    "gun_like_repeated": (12, "ADR-0039", True, "a gun-like sound in 2 or more windows within 10 s; replaces gun_like_single"),
    "distress_vocal": (3, "PROPOSED", True, "Crying, sobbing (19), Whimper (21), Groan (33) or Gasp (39); +3 each, capped at +6; supporting only"),
    "tyre_squeal_or_skid": (3, "PROPOSED", True, "Skidding (306) or Tire squeal (307); supporting only"),
    "car_alarm": (2, "PROPOSED", True, "Car alarm (304); supporting only"),
    "media_context": (-6, "PROPOSED", True, "Music (132), Video game music (267), Television (518) or Radio (519) in the same or an adjacent window"),
    "crowd_context": (-5, "PROPOSED", True, "Cheering (61), Applause (62) or Crowd (64) in the same or an adjacent window"),
    "children_playing": (-4, "PROPOSED", True, "Children playing (66) in the same or an adjacent window"),
    "laughter": (-4, "PROPOSED", True, "Laughter (13) in the same or an adjacent window"),
    "siren_nearby": (0, "PROPOSED", True, "Siren (390) or 317 to 319; ambiguous, a note only"),
    "trigger_words": (10, "PARKED", True, "'kill', 'give me your PIN', 'shut up' or isiZulu, Afrikaans, Sesotho equivalents; needs a second model and a RICA/POPIA answer"),
    # Motion (look-back corroboration only)
    "impact": (4, "ADR-0039", True, "accelerometer impact; counts only as look-back corroboration of a sound (H3)"),
    "snatch": (5, "ADR-0039", True, "accelerometer snatch pattern; look-back corroboration only (H3)"),
    "shake_sustained": (3, "ADR-0039", True, "sustained shaking; look-back corroboration only (H3)"),
    "surge": (0, "DROPPED", False, "dropped in ADR-0039: it fires while driving"),
    "bluetooth_drop_at_speed": (0, "PARKED", False, "car Bluetooth drops at vehicle speed; stretch detector in spec section 1, no weight set"),
    # Movement context (heartbeat speed bucket, V9)
    "walk_to_vehicle_after_detection": (8, "PROPOSED", False, "speed bucket goes walking or stationary to vehicle within 120 s after a detection"),
    "vehicle_stop_then_detection": (3, "PROPOSED", False, "vehicle speed bucket drops to stationary, then a detection"),
    # Check-in and PIN
    "duress_signal": (40, "BUILT-SPEC", False, "a duress signal (spec section 3) at any prompt; H1 sets T3; +40 is for display"),
    "no_answer_after_detection": (10, "BUILT-SPEC", False, "server no_answer after a detection"),
    "normal_pin_in_window": (-6, "BUILT-SPEC", False, "normal PIN within the first 75% of the check-in window"),
    "normal_pin_slow": (-3, "BUILT-SPEC", False, "normal PIN after 75% of the window; -3 instead of -6"),
    "answered_late_normal": (0, "BUILT-SPEC", False, "normal PIN after no_answer; anomaly note answered_late"),
    "checkin_not_shown": (2, "BUILT-SPEC", False, "opened never arrives, e.g. notifications revoked; anomaly note"),
    # Journey and device
    "journey_ended_soon_after_detection": (6, "PROPOSED", False, "journey ended 120 s or less after a detection with no PIN; ending is not PIN-gated"),
    "contact_lost_soon_after_detection": (10, "BUILT-SPEC", False, "contact_lost 120 s or less after a detection"),
    "contact_lost_no_detection": (1, "BUILT-SPEC", False, "contact_lost with no detection in the previous 120 s (a dead zone)"),
    "app_killed_while_armed": (4, "PROPOSED", False, "the app was killed while armed; detected at the next start"),
    "rebooted_while_armed": (2, "PROPOSED", False, "the phone rebooted while armed; the V10 re-arm prompt"),
    "clock_skew": (0, "BUILT-SPEC", False, "device clock more than 120 s off; integrity note only"),
    "opened_late": (0, "BUILT-SPEC", False, "opened arrived late; deadline starts at receipt; integrity note only"),
    # Time context
    "night": (2, "PROPOSED", False, "22:00 to 05:00; the research brief found no source, so it is held at 0"),
    "month_end_window": (1, "PROPOSED", False, "month end; the research brief found no source, so it is held at 0"),
    "fireworks_season": (-3, "PROPOSED", False, "Diwali, Guy Fawkes or New Year; applied only to a gun-like sound"),
    # Guardian activity (H7: no coercion evidence)
    "guardian_alert_delivered": (0, "BUILT-SPEC", False, "the guardian alert was delivered"),
    "guardian_alert_opened": (0, "ADR-0039", False, "the guardian opened the alert"),
    "guardian_ack_called_10111": (0, "BUILT-SPEC", False, "guardian acknowledgement 'called 10111'; raises the E-level to E2"),
    "guardian_ack_handling": (0, "BUILT-SPEC", False, "guardian acknowledgement 'handling'; raises the E-level to E2"),
    "guardian_stand_down": (0, "BUILT-SPEC", False, "guardian stand_down; H6 closes the incident"),
    "no_ack_by_T": (0, "PROPOSED", False, "derived: no acknowledgement recorded by a time, shown with the delivery state"),
    # Bank partner (E3, PROPOSED partner API, not built)
    "new_beneficiary_during_incident": (8, "PROPOSED", False, "bank partner: a new beneficiary added during an open incident"),
    "large_transfer_within_30min_of_detection": (10, "PROPOSED", False, "bank partner: a large transfer within 30 min of a detection"),
    "atm_withdrawal_unusual_hour_during_incident": (8, "PROPOSED", False, "bank partner: an ATM withdrawal at an unusual hour during an incident"),
    "limit_increase_during_incident": (8, "PROPOSED", False, "bank partner: a limit increase during an incident"),
    "bank_decline_by_own_risk_engine": (3, "PROPOSED", False, "bank partner: the bank's own risk engine declined a transaction"),
    # Location
    "high_crime_precinct": (2, "PARKED", False, "needs the parked UMOJA risk layer and SAPS precinct data"),
    # Staging and fraud indicators (notes for an insurer's investigator; never a score change)
    "claim_filed_without_guardian_record": (0, "PROPOSED", False, "note for the insurer's investigator; never an automatic denial"),
    "detections_only_when_insured_high_cover": (0, "PROPOSED", False, "note for the insurer's investigator; never an automatic denial"),
    "repeat_incidents_same_pattern": (0, "PROPOSED", False, "note for the insurer's investigator; never an automatic denial"),
}
REASON_ORDER = {name: i for i, name in enumerate(REASONS)}
STATUS_ORDER = ("BUILT-SPEC", "ADR-0039", "PROPOSED", "PARKED", "DROPPED")

TRIGGER = frozenset({"scream_single", "scream_sustained", "shout_or_yell", "glass_or_breaking",
                     "smash_crash", "gun_like_single", "gun_like_repeated"})
GUN = frozenset({"gun_like_single", "gun_like_repeated"})
SUPPORT = frozenset({"distress_vocal", "tyre_squeal_or_skid", "car_alarm"})
NEG_CONTEXT = frozenset({"media_context", "crowd_context", "children_playing", "laughter", "siren_nearby"})
MOTION = frozenset({"impact", "snatch", "shake_sustained", "surge"})
UNSOURCED = frozenset({"night", "month_end_window"})
CONTACT_LOST = frozenset({"contact_lost_soon_after_detection", "contact_lost_no_detection"})
H4_REASONS = CONTACT_LOST | {"no_answer_after_detection"}
NORMAL_PIN = frozenset({"normal_pin_in_window", "normal_pin_slow"})
GUARDIAN = frozenset({"guardian_alert_delivered", "guardian_alert_opened", "guardian_ack_called_10111",
                      "guardian_ack_handling", "guardian_stand_down", "no_ack_by_T"})
GUARDIAN_ACK = frozenset({"guardian_ack_called_10111", "guardian_ack_handling", "guardian_stand_down"})
BANK = frozenset({"new_beneficiary_during_incident", "large_transfer_within_30min_of_detection",
                  "atm_withdrawal_unusual_hour_during_incident", "limit_increase_during_incident",
                  "bank_decline_by_own_risk_engine"})
STAGING = frozenset({"claim_filed_without_guardian_record", "detections_only_when_insured_high_cover",
                     "repeat_incidents_same_pattern"})
DURESS_CONTEXTS = ("checkin", "settings", "guardian_add", "guardian_remove", "deletion", "recovery", "late")

KIND_ORDER = ("journey_armed", "journey_ended", "signal_detected", "checkin_opened", "checkin_result",
              "pin_authorised", "no_answer", "contact_lost", "answered_late", "incident_closed",
              "guardian_alerted", "guardian_ack", "bank_signal_sent", "decoy_added")

HARD_RULES = [
    ("H1", "A duress signal (a checkin_result duress PIN, pin_authorised mode duress, or answered_late carrying a duress PIN) sets T3 at once.",
     "Any scored duress_signal sets the peak to T3 at its time; the band reads user-signalled."),
    ("H2", "Detection alone (any sounds, any motion, any context) never sends the bank signal. The maximum is T1, or T2 only through the PROPOSED fast path.",
     "T2 and T3 are reachable only from H1 or H4; an assertion fails the build if a detection-only scenario passes T1. The fast path is reported beside the tier, never inside it."),
    ("H3", "Motion alone never opens a check-in; it stays T0 and is not recorded unless it corroborates a sound, looking back over -10 s to 0.",
     "A motion reason is scored only if a trigger sound occurs 0 to 10 s after it; otherwise it is struck out as not recorded."),
    ("H4", "no_answer or contact_lost during an open incident sets T2; after 3 min with no stand_down, T3 (S1). contact_lost after a normal-PIN outcome is open at P3.L8.",
     "contact_lost is scored only while an incident is open (spec section 8); T3 at +180 s unless a stand_down came first. Scenarios with contact_lost after a normal PIN are marked P3.L8 open."),
    ("H5", "A normal PIN never lowers the tier and never closes an incident, because it can be forced. It adds only a small negative tally.",
     "Normal-PIN reasons change the tally only; the tier logic ignores them."),
    ("H6", "A guardian stand_down closes the incident.",
     "The first stand_down closes it; later contact_lost is not fired (T10)."),
    ("H7", "A guardian acknowledgement adds no coercion evidence; it raises the E-level only (E2).",
     "Guardian reasons carry 0 db."),
    ("H8", "Bank-partner signals are E3 inputs from the PROPOSED partner API. They can raise the tally and the E-level, but never trigger the bank signal.",
     "Bank reasons are scored only during an open incident and never enter the tier logic."),
]

# --------------------------------------------------------------------------
# Research facts used. Quotes are short literal spans from the research brief.
# ('marker' is kept wherever the brief says the fact was not independently fetched.)
# --------------------------------------------------------------------------
SOURCES: dict[str, dict[str, str]] = {
    "ISS-EXPRESS": {"who": "ISS Africa, 'South Africa's armed robbery problem drives kidnapping'", "date": "3 Dec 2024",
                    "url": "https://issafrica.org/iss-today/south-africa-s-armed-robbery-problem-drives-kidnapping",
                    "quote": "coerced into drawing money from ATMs or transferring their funds", "marker": ""},
    "ISS-HIJACK": {"who": "ISS Africa, same article", "date": "3 Dec 2024",
                   "url": "https://issafrica.org/iss-today/south-africa-s-armed-robbery-problem-drives-kidnapping",
                   "quote": "44% committed during a hijacking", "marker": ""},
    "TC-ATM": {"who": "TechCentral, 'Banking app kidnappings are on the rise in South Africa'", "date": "7 Nov 2023",
               "url": "https://techcentral.co.za/banking-app-kidnappings-south-africa/234770/",
               "quote": "perpetrators drive around and make withdrawals at ATMs as quickly as they can", "marker": ""},
    "TC-UNLOCK": {"who": "TechCentral, same article", "date": "7 Nov 2023",
                  "url": "https://techcentral.co.za/banking-app-kidnappings-south-africa/234770/",
                  "quote": "forced to open their own profile on their own phone", "marker": ""},
    "TC-PIN": {"who": "TechCentral, same article", "date": "7 Nov 2023",
               "url": "https://techcentral.co.za/banking-app-kidnappings-south-africa/234770/",
               "quote": "Pins, biometric authentication and facial recognition prove to be ineffective", "marker": ""},
    "NCA-ATM": {"who": "National Crime Assist, 'Express Kidnappings'", "date": "no publication date found on the page",
                "url": "https://nca247.org.za/express-kidnappings/",
                "quote": "Accompanying victims to ATMs to withdraw cash, often under threat", "marker": ""},
    "CIT-HOUSE": {"who": "The Citizen / Carletonville Herald, Blybank house robbery", "date": "29 Jul 2026",
                  "url": "https://www.citizen.co.za/carletonville-herald/local-news/2026/07/29/armed-house-robbery-in-blybank-family-tied-up-as-gunmen-empty-victims-bank-account/",
                  "quote": "forced to give their online banking details",
                  "marker": "search-engine paraphrase; not independently fetched"},
    "SCIAM-SILENT": {"who": "Scientific American, 'Sexual Assault May Trigger Involuntary Paralysis'", "date": "4 Aug 2017",
                     "url": "https://www.scientificamerican.com/article/sexual-assault-may-trigger-involuntary-paralysis/",
                     "quote": "Many also did not yell for help", "marker": ""},
    "SCIAM-TI": {"who": "Scientific American, same article", "date": "4 Aug 2017",
                 "url": "https://www.scientificamerican.com/article/sexual-assault-may-trigger-involuntary-paralysis/",
                 "quote": "70 percent experienced at least 'significant' tonic immobility", "marker": ""},
    "ACLU-SS": {"who": "ACLU of Massachusetts, Data for Justice Project, Boston ShotSpotter records", "date": "8 Apr 2024",
                "url": "https://data.aclum.org/2024/04/08/boston-shotspotter/",
                "quote": "16 percent of alerts corresponded to common urban sounds", "marker": ""},
    "LAW-FIREWORKS": {"who": "LawForAll, fireworks laws in South Africa", "date": "date not recorded in the brief",
                      "url": "https://www.lawforall.co.za/arrest-crimes/fireworks-laws-south-africa/",
                      "quote": "Diwali, New Year's Eve, and Guy Fawkes",
                      "marker": "search-engine synthesis; not independently fetched"},
    "JAC-HIJACK": {"who": "Jacaranda FM, 'Criminals have new peak hijacking times in SA'", "date": "date not found",
                   "url": "https://www.jacarandafm.com/shows/breakfast/criminals-have-new-peak-hijacking-times-in-sa/",
                   "quote": "Thursdays between 16:00 and 21:00 were the highest-risk periods for hijackings",
                   "marker": "search snippet only; not independently fetched"},
    "FTC-PIN": {"who": "US Federal Trade Commission press release on emergency ATM technology", "date": "7 May 2010",
                "url": "https://search.ftc.gov/news-events/news/press-releases/2010/05/ftc-issues-report-emergency-technology-use-atms",
                "quote": "the costs and benefits of the emergency technologies specified in the Act",
                "marker": "press release only; the report body was not read"},
    "CIT-STAGED": {"who": "The Citizen, Soweto staged kidnapping", "date": "6 to 7 Aug 2026",
                   "url": "https://www.citizen.co.za/news/soweto-man-arrested-after-staging-his-own-kidnapping-to-extort-r100k-from-family/",
                   "quote": "conspired with the three suspects to stage the kidnapping",
                   "marker": "search-engine synthesis; not independently fetched"},
    "ENTERSEKT": {"who": "Entersekt survey of 29 bank fraud professionals", "date": "date not recorded in the brief",
                  "url": "https://www.entersekt.com/company/press-releases/tpost/03m7l1ms11-sa-banks-concerned-by-app-fraud-look-to",
                  "quote": "APP fraud and Vishing (52%)",
                  "marker": "search-engine synthesis; not independently fetched"},
    "XCONNECT": {"who": "XConnect, 'SIM Swap Fraud in South Africa 2024'", "date": "2024 (from the title)",
                 "url": "https://www.xconnect.net/sim-swap-fraud-in-south-africa-2024",
                 "quote": "around 60% of mobile banking fraud",
                 "marker": "search-engine synthesis; not independently fetched"},
    "TF-IPV": {"who": "Taylor & Francis Online, 'Cellphones and romantic relationships of young women in urban informal settlements in South Africa'", "date": "date not recorded in the brief",
               "url": "https://www.tandfonline.com/doi/full/10.1080/13691058.2021.1953609",
               "quote": "an extension of their repertoire of coercive control",
               "marker": "search-engine synthesis; not independently fetched"},
    "GAP-EHAILING": {"who": "Research brief, section 1", "date": "23 Sep 2026", "url": "",
                     "quote": "", "marker": "NOT FOUND: no dataset quantifying e-hailing abduction"},
    "GAP-MONTHEND": {"who": "Research brief, gap 6", "date": "23 Sep 2026", "url": "",
                     "quote": "", "marker": "NOT FOUND: no time-of-day, month-end or payday source for express kidnapping"},
    "GAP-PHONE": {"who": "Research brief, gap 7", "date": "23 Sep 2026", "url": "",
                  "quote": "", "marker": "NOT FOUND: what attackers do physically to the phone (SIM out, off, discarded)"},
    "GAP-BENIGN": {"who": "Research brief, gap 5", "date": "23 Sep 2026", "url": "",
                   "quote": "", "marker": "NOT FOUND: no study of benign scream or shout sources near a phone"},
    "GAP-SECRET": {"who": "Research brief, gap 10", "date": "23 Sep 2026", "url": "",
                   "quote": "", "marker": "NOT FOUND: whether victims can secretly operate a phone under duress"},
    "GAP-WHISPER": {"who": "Research brief, section 4", "date": "23 Sep 2026", "url": "",
                    "quote": "", "marker": "NOT FOUND: whispered or silent threats as a sourced robbery statistic"},
    "GAP-STAGED": {"who": "Research brief, gap 9", "date": "23 Sep 2026", "url": "",
                   "quote": "", "marker": "NOT FOUND: share of kidnapping or robbery reports later found staged"},
}

CATEGORIES = [
    ("A", "Single sound", 12), ("B", "Motion only", 6), ("C", "Sound + motion", 10),
    ("D", "Duress PIN in its contexts", 10), ("E", "No answer and contact lost", 10),
    ("F", "Journey and speed-bucket sequences", 10), ("G", "Guardian activity", 10),
    ("H", "Cancellations and normal PIN", 8), ("I", "Device and time anomalies", 8),
    ("J", "Bank-partner signals", 8), ("K", "Benign and false situations", 12),
    ("L", "Staged and fraudulent events", 6), ("M", "Remote coercion VIGIL can't see", 4),
    ("N", "Parked signals", 4), ("O", "Human reactions", 4),
]
CAT_NAME = {c: n for c, n, _ in CATEGORIES}
CAT_MIN = {c: m for c, _, m in CATEGORIES}

SCENARIOS: list[dict] = []


def S(sid, title, truth, narrative, signals, eval_t, if_real, if_false, notes="", ref=(), window=60, armed=True):
    """Register one scenario. signals: [(reason, t_seconds)] or [(reason, t, detail)]."""
    sig = []
    for item in signals:
        if len(item) == 2:
            sig.append((item[0], item[1], ""))
        else:
            sig.append((item[0], item[1], item[2]))
    SCENARIOS.append({"id": sid, "category": sid[0], "title": title, "truth": truth, "narrative": narrative,
                      "signals": sig, "eval_t": eval_t, "if_real": if_real, "if_false": if_false,
                      "notes": notes, "research_ref": tuple(ref), "window": window, "armed": armed})


# ==========================================================================
# THE CATALOGUE
# Times are seconds from the first signal. With the first trigger at t=0 and
# the default 60 s window: opened t=1, in-window PIN t<=46, slow PIN t=47..61,
# no_answer t=71. With a 20 s window: in-window t<=16, slow t=17..21, no_answer t=31.
# ==========================================================================

# ---- A · Single sound ----------------------------------------------------
S("A01", "One scream window on the walk home", "ambiguous",
  "A single Screaming window is classified while the user walks home from a Soweto taxi stop. The check-in has just opened.",
  [("scream_single", 0)], 1,
  "The quiet check-in is the only visible effect until a PIN, silence or a duress PIN.",
  "The user enters the normal PIN; nothing reaches guardians.")
S("A02", "Sustained screaming", "ambiguous",
  "Screaming fills three windows inside ten seconds near the phone in a parked car.",
  [("scream_sustained", 0)], 1,
  "Strong evidence, but still only a check-in: H2 stops detection at T1.",
  "A child's tantrum or a horror film; a normal PIN answers it.")
S("A03", "One shout", "ambiguous",
  "A single Shout window at a busy Johannesburg intersection.",
  [("shout_or_yell", 0)], 1,
  "A shout is weak on its own; the check-in carries the decision.",
  "Street noise; faint evidence and a normal PIN.")
S("A04", "Breaking glass at home at night", "ambiguous",
  "Glass breaks in the kitchen while the user is home alone with a journey still armed.",
  [("glass_or_breaking", 0)], 1,
  "A burglar breaking a window; the check-in is the first step.",
  "A dropped glass; the normal PIN ends the question.")
S("A05", "Smash or crash sound (proposed class)", "ambiguous",
  "Smash, crash is heard as a car door is forced in a Pretoria parking lot.",
  [("smash_crash", 0)], 1,
  "Adds a trigger the built spec does not have; weak alone.",
  "Bins, a slammed boot or a dropped crate.",
  notes="Smash, crash (463) is a PROPOSED trigger; the built spec maps only Screaming, Shout, Yell, Glass, Shatter, Breaking.")
S("A06", "One gun-like sound", "ambiguous",
  "A single gun-like window at dusk in a township street.",
  [("gun_like_single", 0)], 1,
  "A shot fired near the user; only a check-in follows.",
  "A car backfire or a firecracker.",
  ref=("ACLU-SS",))
S("A07", "Repeated gun-like sounds", "ambiguous",
  "Two gun-like windows within ten seconds near a tavern.",
  [("gun_like_repeated", 0)], 1,
  "Strong evidence of a shooting nearby, but still T1 until the user or the server acts.",
  "Fireworks outside the permitted days, or a construction nail gun.",
  ref=("ACLU-SS",))
S("A08", "The same scream read two minutes later", "ambiguous",
  "A1-style single scream, re-read at 120 s: one half-life of decay.",
  [("scream_single", 0)], 120,
  "Old evidence counts for less; the server-side deadline is what matters by now.",
  "The tally fades on its own if nothing else happens.",
  notes="7 x 2^(-120/120) = 3.5, rounded half-up to 4.")
S("A09", "Sustained scream read four minutes later", "ambiguous",
  "Sustained screaming re-read at 240 s, two half-lives later.",
  [("scream_sustained", 0)], 240,
  "The detector evidence has decayed; only non-decaying facts would keep it high.",
  "Faint by now.")
S("A10", "Crying alone, no trigger", "ambiguous",
  "Only Crying, sobbing is heard; no trigger class fires.",
  [("distress_vocal", 0, "Crying, sobbing")], 1,
  "A distressed person who does not scream gets no check-in.",
  "Nothing happens, as intended for grief or a baby.",
  notes="Supporting classes attach to a trigger; alone they are never recorded.", ref=("GAP-BENIGN",))
S("A11", "Tyre squeal alone", "ambiguous",
  "Tire squeal outside a mall exit; no scream, no shout.",
  [("tyre_squeal_or_skid", 0)], 1,
  "A hijacker's getaway leaves no record if nobody screams.",
  "Normal traffic; nothing recorded.")
S("A12", "Car alarm alone", "false",
  "A car alarm sounds in a Durban parking garage.",
  [("car_alarm", 0)], 1,
  "A break-in nearby that does not involve the user.",
  "Nothing recorded, as intended.")
S("A13", "Siren alone", "false",
  "An ambulance siren passes on the N1.",
  [("siren_nearby", 0)], 1,
  "Not a user event.",
  "Nothing recorded.")
S("A14", "Smash-and-grab on a parked car", "real",
  "Glass breaks and a car alarm starts two seconds later beside the user's parked car.",
  [("glass_or_breaking", 0), ("car_alarm", 2)], 2,
  "A property crime; the check-in lets the user say they are fine.",
  "Someone else's car; the normal PIN closes the question for the user.")

# ---- B · Motion only ------------------------------------------------------
S("B01", "Phone dropped on tiles", "false",
  "The phone slips from a pocket onto a tiled floor.",
  [("impact", 0)], 1,
  "Not applicable.",
  "Nothing is recorded (H3).")
S("B02", "Silent phone snatch", "real",
  "A thief snatches the phone from the user's hand at a Braamfontein corner and runs; nobody screams.",
  [("snatch", 0)], 1,
  "VIGIL records nothing: motion alone never opens a check-in.",
  "Not applicable.",
  notes="Stated limitation: a silent snatch is invisible to CEM-0.", ref=("GAP-PHONE",))
S("B03", "Jogging on gravel", "false",
  "The phone shakes continuously in a running belt.",
  [("shake_sustained", 0)], 1,
  "Not applicable.",
  "Nothing is recorded (H3).")
S("B04", "Hard braking (surge, dropped)", "false",
  "The driver brakes hard at a robot; the accelerometer surges.",
  [("surge", 0)], 1,
  "Not applicable.",
  "Surge was dropped because it fires while driving.")
S("B05", "Bag grab with impact, victim silent", "real",
  "A bag with the phone inside is ripped off the user's shoulder; impact then snatch, no sound.",
  [("impact", 0), ("snatch", 1)], 2,
  "Nothing is recorded; the user must rely on other help.",
  "Not applicable.",
  ref=("SCIAM-SILENT",))
S("B06", "Gym bag thrown around", "false",
  "Impacts at 0, 30 and 60 s as a gym bag is tossed into a locker.",
  [("impact", 0), ("impact", 30), ("impact", 60)], 61,
  "Not applicable.",
  "Nothing is recorded (H3).")

# ---- C · Sound + motion ---------------------------------------------------
S("C01", "Snatch, then a scream", "real",
  "A phone snatch at a Hillbrow corner, and the user screams five seconds later.",
  [("snatch", 0), ("scream_single", 5)], 5,
  "The snatch corroborates the scream inside the look-back window.",
  "Horseplay; the normal PIN answers it.")
S("C02", "Impact, shaking, then sustained screaming", "real",
  "The user is shoved against a wall, the phone shakes, then sustained screaming starts.",
  [("impact", 0), ("shake_sustained", 2), ("scream_sustained", 6)], 6,
  "Strong, corroborated evidence; still T1 until PIN or silence.",
  "A rough game; a normal PIN.")
S("C03", "Snatch 15 s before the scream", "real",
  "The phone is snatched and the user screams only after fifteen seconds of shock.",
  [("snatch", 0), ("scream_single", 15)], 15,
  "The snatch falls outside the 10 s look-back and is not recorded.",
  "Not applicable.",
  notes="Delayed screaming loses its motion corroboration.")
S("C04", "Scream, then the phone is grabbed", "real",
  "The user screams and the attacker grabs the phone three seconds later.",
  [("scream_single", 0), ("snatch", 3)], 3,
  "The grab comes after the sound, so the look-back never sees it.",
  "Not applicable.",
  notes="The look-back only looks backwards; motion after the sound never counts.")
S("C05", "Window smashed at a robot", "real",
  "The car is stationary at a traffic light when the side window is smashed.",
  [("impact", 0), ("glass_or_breaking", 2)], 2,
  "Smash-and-grab; corroborated but not violent to the person.",
  "A stone thrown up by a truck.")
S("C06", "Impact and a gun-like sound", "real",
  "The user falls to the ground as a gun-like sound goes off.",
  [("impact", 0), ("gun_like_single", 1)], 1,
  "Corroborated; the check-in follows.",
  "A backfire as the user trips.")
S("C07", "Shaking, then a shout", "ambiguous",
  "The phone shakes in a struggle, then a single shout.",
  [("shake_sustained", 0), ("shout_or_yell", 3)], 3,
  "Some evidence of a scuffle.",
  "Play-fighting.")
S("C08", "Snatch, sustained scream, gasping and sobbing", "real",
  "A snatch, sustained screaming, then Gasp, Whimper and Crying, sobbing windows.",
  [("snatch", 0), ("scream_sustained", 6), ("distress_vocal", 7, "Gasp"), ("distress_vocal", 9, "Whimper"),
   ("distress_vocal", 12, "Crying, sobbing")], 12,
  "Very strong evidence; the distress cap holds the vocal part at +6.",
  "Unlikely to be benign.",
  notes="Three distress windows score +6, not +9 (cap).")
S("C09", "Gym: shaking, shout and music", "false",
  "A spin class with a loud instructor and music.",
  [("shake_sustained", 0), ("shout_or_yell", 2), ("media_context", 2, "Music")], 2,
  "Not applicable.",
  "Music cancels most of the shout; K flags the conflict.")
S("C10", "Impact and a scream among children", "ambiguous",
  "A child falls in a playground next to the user and screams; Children playing is heard.",
  [("impact", 0), ("scream_single", 5), ("children_playing", 5)], 5,
  "A real fall, not coercion.",
  "The context lowers the tally; a normal PIN closes the question for the user.")

# ---- D · Duress PIN in its contexts ------------------------------------
S("D01", "Duress PIN at the check-in", "real",
  "After a scream the attacker demands the phone be unlocked; the user answers the check-in with the duress PIN.",
  [("scream_single", 0), ("duress_signal", 20, "checkin")], 20,
  "Guardians are alerted and the bank signal goes at once; the phone shows the normal outcome.",
  "An accidental duress PIN alerts guardians who cannot call until a stand_down.",
  ref=("TC-UNLOCK", "FTC-PIN"))
S("D02", "Quick duress PIN after sustained screaming", "real",
  "Sustained screaming with an impact; the user enters the duress PIN at 8 s.",
  [("impact", 0), ("scream_sustained", 0), ("duress_signal", 8, "checkin")], 8,
  "T3 at 8 s.",
  "Not applicable.")
S("D03", "Duress PIN at the settings prompt", "real",
  "The attacker makes the user open settings to disarm VIGIL; the user types the duress PIN. Nothing was heard.",
  [("duress_signal", 0, "settings")], 0,
  "The settings change looks done; T16 says this raises the full alarm.",
  "Not applicable.")
S("D04", "Duress PIN while adding a guardian", "real",
  "The attacker makes the user add him as a guardian; the duress PIN creates a decoy guardian.",
  [("duress_signal", 0, "guardian_add")], 0,
  "The decoy's acceptance succeeds but it never receives alerts; real guardians are told.",
  "Not applicable.")
S("D05", "Duress PIN while removing a guardian", "real",
  "An abusive partner makes the user remove her sister as guardian; she enters the duress PIN.",
  [("duress_signal", 0, "guardian_remove")], 0,
  "The removal looks done and does nothing.",
  "Not applicable.",
  ref=("TF-IPV",))
S("D06", "Duress PIN at evidence deletion", "real",
  "The attacker orders the user to delete the VUKA record; she enters the duress PIN.",
  [("duress_signal", 0, "deletion")], 0,
  "The deletion looks done and does nothing.",
  "Not applicable.")
S("D07", "Duress PIN at recovery", "real",
  "The attacker tries to move the user's VUKA account onto his own phone; the duress PIN is entered.",
  [("duress_signal", 0, "recovery")], 0,
  "The recovery looks done and does nothing.",
  "Not applicable.",
  notes="Recovery is on the cut line; if it is cut, no code is shown.")
S("D08", "Late duress PIN after no_answer", "real",
  "The user could not reach the phone in time; no_answer fired, then she enters the duress PIN at 95 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("duress_signal", 95, "late")], 95,
  "answered_late carries the duress PIN: T3 immediately (T09).",
  "Not applicable.")
S("D09", "Duress, then 10111, then stand_down", "real",
  "Duress PIN at 15 s; a guardian calls 10111; police find the user and the guardian stands down after 30 min.",
  [("scream_single", 0), ("duress_signal", 15, "checkin"), ("guardian_alert_delivered", 16),
   ("guardian_ack_called_10111", 60), ("guardian_stand_down", 1800)], 1800,
  "The record holds two principals (device and guardian): E2.",
  "Not applicable.")
S("D10", "Accidental duress PIN after a dropped glass", "false",
  "A glass breaks at home and the user, flustered, types the duress PIN by mistake.",
  [("glass_or_breaking", 0), ("duress_signal", 10, "checkin")], 10,
  "Not applicable.",
  "Guardians and the bank act on a false alarm; there is no user-side cancel, and guardians may not call until a stand_down.",
  ref=("FTC-PIN",))
S("D11", "Duress PIN, then the phone is switched off", "real",
  "Duress PIN at 12 s; the attacker switches the phone off, so contact is lost at 100 s.",
  [("scream_single", 0), ("duress_signal", 12, "checkin"), ("contact_lost_soon_after_detection", 100)], 100,
  "Already T3; contact_lost adds evidence the incident is not over.",
  "Not applicable.",
  ref=("GAP-PHONE",))

# ---- E · No answer and contact lost -------------------------------------
S("E01", "Scream, then no answer", "ambiguous",
  "A scream and no PIN: the server fires no_answer at 71 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71)], 71,
  "Guardians are alerted (T2).",
  "The user left the phone in another room.")
S("E02", "Scream, no answer, three minutes pass", "ambiguous",
  "As E01, but nobody stands down for three minutes.",
  [("scream_single", 0), ("no_answer_after_detection", 71)], 251,
  "The bank signal goes at 251 s (S1).",
  "The bank applies friction to an innocent user until they release it.")
S("E03", "No answer, guardian handling, then stand_down", "false",
  "No answer; a guardian replies 'handling', reaches the user in person and stands down at 200 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("guardian_alert_delivered", 72),
   ("guardian_ack_handling", 120), ("guardian_stand_down", 200)], 200,
  "Not applicable.",
  "Closed before the 3-minute bank rule.")
S("E04", "Phone smashed after sustained screaming", "real",
  "Sustained screaming; the phone is smashed at 5 s, so no_answer fires at 71 s and contact is lost at 95 s.",
  [("scream_sustained", 0), ("no_answer_after_detection", 71), ("contact_lost_soon_after_detection", 95)], 275,
  "T3 at 251 s from no_answer.",
  "Not applicable.",
  ref=("GAP-PHONE",))
S("E05", "Dead zone with no incident", "false",
  "Heartbeats stop in a dead zone on the R21 with nothing detected.",
  [("contact_lost_no_detection", 600)], 600,
  "Not applicable.",
  "contact_lost never fires without an open incident (spec section 8).")
S("E06", "TV scream, normal PIN, then a dead zone 20 min later", "false",
  "A TV scream is answered with the normal PIN; twenty minutes later the user drives into a dead zone.",
  [("scream_single", 0), ("media_context", 0, "Television"), ("normal_pin_in_window", 10),
   ("contact_lost_no_detection", 1200)], 1380,
  "Not applicable.",
  "The incident never closed, so the dead zone reaches guardians and then the bank.",
  notes="Guardians were never notified, so the 6 h auto-close cannot run either.")
S("E07", "Battery dies after a scream", "ambiguous",
  "The battery dies at 30 s; no PIN arrives and contact is lost at 120 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("contact_lost_soon_after_detection", 120)], 251,
  "Correct escalation.",
  "A flat battery looks the same as an attacker switching the phone off.",
  notes="Heartbeats carry no battery level, so the server cannot tell.")
S("E08", "TV scream, phone left behind, guardian stands down late", "false",
  "The user is in the shower; a TV scream opens a check-in nobody answers. A guardian stands down at 300 s.",
  [("scream_single", 0), ("media_context", 0, "Television"), ("no_answer_after_detection", 71),
   ("guardian_alert_delivered", 72), ("guardian_stand_down", 300)], 300,
  "Not applicable.",
  "The bank signal already went at 251 s; the stand_down came too late to stop it.")
S("E09", "Short 20 s window, no answer", "ambiguous",
  "A driver chose the 20 s window; a shout and no PIN.",
  [("shout_or_yell", 0), ("no_answer_after_detection", 31)], 31,
  "Guardians are alerted after 31 s.",
  "A driver who cannot touch the phone while driving.",
  window=20)
S("E10", "Normal PIN, then contact lost soon after", "ambiguous",
  "A scream, a normal PIN at 12 s, then heartbeats stop and contact is lost at 110 s.",
  [("scream_single", 0), ("normal_pin_in_window", 12), ("contact_lost_soon_after_detection", 110)], 110,
  "A forced normal PIN followed by the phone being switched off.",
  "A tunnel on the Gautrain route; heartbeats return later but nothing is retracted.")
S("E11", "Load-shedding takes the tower down after a false alarm", "false",
  "A neighbour's argument opens a check-in answered normally; at 300 s the cell tower loses power.",
  [("shout_or_yell", 0), ("normal_pin_in_window", 20), ("contact_lost_no_detection", 390)], 570,
  "Not applicable.",
  "The open incident turns a power cut into a bank signal.")

# ---- F · Journey and speed-bucket sequences ------------------------------
S("F01", "Scream, trigger words, erratic motion, then a withdrawal", "real",
  "Erratic motion, an impact, sustained screaming and a threat to kill; nobody answers and an ATM withdrawal follows 15 min later.",
  [("shake_sustained", 0), ("impact", 3), ("scream_sustained", 5), ("trigger_words", 6, "kill"),
   ("no_answer_after_detection", 76), ("atm_withdrawal_unusual_hour_during_incident", 900)], 900,
  "T3 at 256 s from no_answer; the bank already knows of its own withdrawal.",
  "Not applicable.",
  notes="Lethabo's first timing sequence. Trigger words are PARKED.", ref=("ISS-EXPRESS", "TC-ATM"))
S("F02", "Scream, walk to a vehicle, contact lost, ATM at night", "real",
  "Sustained screaming at night; within a minute the user moves at vehicle speed, contact is lost and an ATM withdrawal follows at 25 min.",
  [("scream_sustained", 0), ("night", 0), ("walk_to_vehicle_after_detection", 60),
   ("no_answer_after_detection", 71), ("contact_lost_soon_after_detection", 110),
   ("atm_withdrawal_unusual_hour_during_incident", 1500)], 1500,
  "The express-kidnapping pattern; T3 at 251 s.",
  "Not applicable.",
  notes="Lethabo's second timing sequence.", ref=("ISS-EXPRESS", "TC-ATM", "GAP-MONTHEND"))
S("F03", "Hijacking with abduction", "real",
  "At the gate, tyres squeal, the car stops, a shout and breaking glass; the user is pushed into the passenger seat.",
  [("tyre_squeal_or_skid", 0), ("vehicle_stop_then_detection", 2), ("shout_or_yell", 2), ("glass_or_breaking", 3),
   ("distress_vocal", 10, "Crying, sobbing"), ("no_answer_after_detection", 73)], 253,
  "T3 at 253 s.",
  "Not applicable.",
  ref=("ISS-HIJACK",))
S("F04", "Express kidnapping from a mall parking lot", "real",
  "A shout in a Sandton mall parking lot; within 40 s the phone moves at vehicle speed; no PIN.",
  [("shout_or_yell", 0), ("walk_to_vehicle_after_detection", 40), ("no_answer_after_detection", 71)], 251,
  "T3 at 251 s.",
  "A user who shouted at a friend and then drove off without looking at the phone.",
  ref=("ISS-EXPRESS", "TC-ATM"))
S("F05", "E-hailing abduction", "real",
  "The user screams in an e-hailing car when the driver turns off the route; no PIN.",
  [("scream_single", 0), ("no_answer_after_detection", 71)], 251,
  "T3 at 251 s, but nothing records the route deviation: there is no location history.",
  "Not applicable.",
  ref=("GAP-EHAILING",))
S("F06", "The attacker ends the journey", "real",
  "After a scream the attacker ends the VUKA journey at 30 s, which needs no PIN; the check-in deadline still runs.",
  [("scream_single", 0), ("journey_ended_soon_after_detection", 30), ("no_answer_after_detection", 71)], 71,
  "no_answer still fires at 71 s, but heartbeats stop legitimately, so contact_lost never can.",
  "The user ended the journey on arrival and ignored the check-in.")
S("F07", "Forced normal PIN, then the journey is ended", "real",
  "The attacker watches the user enter the normal PIN at 15 s, then ends the journey at 30 s.",
  [("scream_single", 0), ("normal_pin_in_window", 15)], 30,
  "Nothing escalates: T1 is the end of the line.",
  "Not applicable.",
  notes="journey_ended at 30 s is not a reason after a PIN (the reason requires no PIN).", ref=("TC-PIN",))
S("F08", "Soccer crowd, then walking to the car", "false",
  "Shouting and cheering at an Orlando Stadium derby; normal PIN; the user drives home 90 s later.",
  [("shout_or_yell", 0), ("crowd_context", 0, "Cheering"), ("normal_pin_in_window", 20),
   ("walk_to_vehicle_after_detection", 90)], 90,
  "Not applicable.",
  "walk_to_vehicle adds +8 to an innocent trip home.")
S("F09", "Smash-and-grab at a robot, no abduction", "real",
  "The car stops at a robot and the passenger window is smashed; the user answers with the normal PIN at 25 s.",
  [("vehicle_stop_then_detection", 0), ("glass_or_breaking", 0), ("normal_pin_in_window", 25)], 25,
  "A property crime; the user is safe and says so.",
  "Not applicable.")
S("F10", "Minibus taxi argument at a stop", "false",
  "A loud argument between passengers as the taxi stops; the user answers normally.",
  [("vehicle_stop_then_detection", 0), ("shout_or_yell", 0), ("normal_pin_in_window", 10)], 10,
  "Not applicable.",
  "Low tally; the normal PIN answers it.")
S("F11", "Mugging on the walk home at night", "real",
  "A snatch and a scream at 21:30; the attackers run and the user answers normally at 40 s.",
  [("snatch", 0), ("night", 0), ("scream_single", 4), ("normal_pin_in_window", 40)], 40,
  "A mugging that is over; T1 is right.",
  "Not applicable.")
S("F12", "Forced ATM withdrawal while walking", "real",
  "A shout at a Pretoria CBD ATM at night; the user is made to withdraw cash; no PIN.",
  [("shout_or_yell", 0), ("night", 0), ("no_answer_after_detection", 71),
   ("atm_withdrawal_unusual_hour_during_incident", 400)], 400,
  "T3 at 251 s; the withdrawal adds E3-type evidence.",
  "Not applicable.",
  ref=("NCA-ATM",))
S("F13", "Hijacking, held for two hours, transfers", "real",
  "The car is stopped and the window smashed; contact is lost; a guardian calls 10111; transfers follow; the user is released two hours later.",
  [("vehicle_stop_then_detection", 0), ("shout_or_yell", 0), ("glass_or_breaking", 1),
   ("no_answer_after_detection", 71), ("contact_lost_soon_after_detection", 115),
   ("guardian_alert_delivered", 72), ("guardian_ack_called_10111", 400),
   ("new_beneficiary_during_incident", 1100), ("large_transfer_within_30min_of_detection", 1200)], 7200,
  "Every fact is recorded before the money moved; three principals.",
  "Not applicable.",
  ref=("ISS-HIJACK", "TC-UNLOCK"))

# ---- G · Guardian activity ------------------------------------------------
S("G01", "Guardian calls 10111", "ambiguous",
  "No answer; the alert is delivered and opened; the guardian taps 'called 10111'.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("guardian_alert_delivered", 72),
   ("guardian_alert_opened", 90), ("guardian_ack_called_10111", 120)], 120,
  "E2: a second principal responded.",
  "Police attend a false alarm; the record shows who acted and when.")
S("G02", "Guardian 'handling' does not stop the bank rule", "ambiguous",
  "A guardian replies 'handling' at 100 s and stands down only at 400 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("guardian_alert_delivered", 72),
   ("guardian_ack_handling", 100), ("guardian_stand_down", 400)], 400,
  "The bank signal went at 251 s; 'handling' is not a stand_down.",
  "A false alarm reached the bank because the guardian did not stand down.")
S("G03", "Alert never delivered", "real",
  "The only guardian's phone is off; nothing is acknowledged by 251 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("no_ack_by_T", 251, "delivery: not delivered")], 251,
  "The bank signal is the only help that still moves.",
  "Not applicable.",
  notes="There is no delivery-failure state in the contract to show here.")
S("G04", "Attacker texts the guardian 'I'm fine'", "real",
  "The attacker uses the victim's WhatsApp to tell the guardian all is well; the guardian stands down at 150 s.",
  [("scream_sustained", 0), ("no_answer_after_detection", 71), ("guardian_alert_delivered", 72),
   ("guardian_stand_down", 150)], 150,
  "The stand_down closes the incident before the bank signal: the attacker wins.",
  "Not applicable.",
  notes="The alert says 'Don't call or text them', but nothing stops the attacker texting the guardian.")
S("G05", "Correct stand_down on a TV false alarm", "false",
  "A TV scream, no answer; the guardian reaches the user by landline and stands down at 170 s.",
  [("scream_single", 0), ("media_context", 0, "Television"), ("no_answer_after_detection", 71),
   ("guardian_alert_delivered", 72), ("guardian_stand_down", 170)], 170,
  "Not applicable.",
  "Closed 10 s before the bank signal would have gone.")
S("G06", "Duress PIN, guardian calls 10111", "real",
  "Duress PIN at 14 s; the guardian calls 10111 at 45 s.",
  [("scream_single", 0), ("duress_signal", 14, "checkin"), ("guardian_alert_delivered", 15),
   ("guardian_ack_called_10111", 45)], 45,
  "T3 and E2.",
  "Not applicable.")
S("G07", "Guardian acknowledgement adds nothing to the tally", "ambiguous",
  "As E01, plus a 'handling' acknowledgement at 90 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("guardian_ack_handling", 90)], 90,
  "The tally is unchanged by the acknowledgement (H7); the E-level rises.",
  "Same.")
S("G08", "Two guardians disagree", "real",
  "Guardian 1 calls 10111 at 100 s; guardian 2, unaware, stands down at 130 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("guardian_ack_called_10111", 100),
   ("guardian_stand_down", 130)], 130,
  "One guardian's stand_down closes the incident while the other is calling the police.",
  "Not applicable.")
S("G09", "Decoy guardian added under duress", "real",
  "The attacker's own phone accepts a guardian invite created with the duress PIN; real guardians are told.",
  [("duress_signal", 0, "guardian_add"), ("guardian_alert_delivered", 1)], 1,
  "The decoy never receives alerts.",
  "Not applicable.")
S("G10", "Nobody stands down: the 6 h auto-close", "false",
  "A dropped glass at night, the user asleep; guardians get the alert but nobody acknowledges; heartbeats continue.",
  [("glass_or_breaking", 0), ("no_answer_after_detection", 71), ("guardian_alert_delivered", 72),
   ("guardian_alert_opened", 300)], 21700,
  "Not applicable.",
  "The bank signal went at 251 s, and the incident auto-closes at 6 h.")
S("G11", "Abusive guardian still inside the 24 h removal delay", "real",
  "The user scheduled removal of an abusive ex-partner as guardian; an hour later a shout goes unanswered.",
  [("shout_or_yell", 0), ("no_answer_after_detection", 71), ("guardian_alert_delivered", 72)], 72,
  "The abuser, still a guardian for 24 h, receives the alert and the location attached to signal_detected.",
  "Not applicable.",
  notes="The stated cost of ADR-0036 (5).", ref=("TF-IPV",))

# ---- H · Cancellations and normal PIN -----------------------------------
S("H01", "Quick normal PIN after a scream", "ambiguous",
  "A scream, then the normal PIN at 8 s.",
  [("scream_single", 0), ("normal_pin_in_window", 8)], 8,
  "A forced normal PIN reads the same.",
  "The ordinary cancel; the incident stays open.")
S("H02", "Slow normal PIN", "ambiguous",
  "A scream, then the normal PIN at 50 s, after 75% of the window.",
  [("scream_single", 0), ("normal_pin_slow", 50)], 50,
  "Hesitation may mean pressure; it subtracts only 3.",
  "The phone was in a bag.")
S("H03", "Late normal PIN does not stop the bank rule", "false",
  "No answer at 71 s; the user enters the normal PIN at 90 s; nobody stands down.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("answered_late_normal", 90)], 251,
  "Not applicable.",
  "answered_late is not a stand_down, so the bank signal still goes at 251 s.")
S("H04", "Instinctive normal PIN after a mugging", "real",
  "A snatch and a shout; the attacker is gone and the user answers normally at 5 s.",
  [("snatch", 0), ("shout_or_yell", 2), ("normal_pin_in_window", 5)], 5,
  "Correct: the user is safe.",
  "Not applicable.")
S("H05", "Sustained scream, normal PIN", "ambiguous",
  "Sustained screaming, then the normal PIN at 20 s.",
  [("scream_sustained", 0), ("normal_pin_in_window", 20)], 20,
  "A forced normal PIN.",
  "Children's game; K flags the conflict.")
S("H06", "The fast path fires, then a normal PIN", "real",
  "An impact, sustained screaming and repeated gun-like sounds within 3 s; the normal PIN comes at 30 s.",
  [("impact", 0), ("scream_sustained", 1), ("gun_like_repeated", 3), ("normal_pin_in_window", 30)], 30,
  "Under the PROPOSED fast path guardians would already be alerted at 3 s.",
  "Under the fast path, guardians would get a false alert before the user could answer.")
S("H07", "Normal PIN, then a duress PIN at settings", "real",
  "A forced normal PIN at 10 s; at 400 s the attacker demands VIGIL be switched off and the user enters the duress PIN.",
  [("scream_single", 0), ("normal_pin_in_window", 10), ("duress_signal", 400, "settings")], 400,
  "T3 at 400 s.",
  "Not applicable.")
S("H08", "Normal PIN, incident never closes", "false",
  "A dropped glass is answered normally; eight hours later the incident is still open.",
  [("glass_or_breaking", 0), ("normal_pin_in_window", 10)], 30000,
  "Not applicable.",
  "No stand_down and no guardians notified, so no close path exists.")

# ---- I · Device and time anomalies ----------------------------------------
S("I01", "Check-in never shown", "ambiguous",
  "Notifications were revoked, so the check-in never appears and opened never arrives.",
  [("scream_sustained", 0), ("checkin_not_shown", 1)], 600,
  "No opened means no no_answer deadline: nothing escalates.",
  "Nothing escalates.")
S("I02", "App force-stopped after the check-in opened", "real",
  "The attacker force-stops the app at 10 s; the server still fires no_answer (T07); the kill is seen at the next start.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("app_killed_while_armed", 3600)], 3600,
  "Server-owned escalation survives the kill.",
  "Not applicable.")
S("I03", "Phone rebooted after a scream", "real",
  "The attacker reboots the phone at 10 s; heartbeats stop; the V10 re-arm prompt appears at 200 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("contact_lost_soon_after_detection", 100),
   ("rebooted_while_armed", 200)], 300,
  "T3 at 251 s.",
  "Not applicable.")
S("I04", "Clock skew on the PIN result", "false",
  "The phone clock is wrong by an hour; the normal PIN result is accepted and flagged.",
  [("scream_single", 0), ("normal_pin_in_window", 10), ("clock_skew", 10)], 10,
  "Not applicable.",
  "An integrity note only.")
S("I05", "opened arrives late", "false",
  "Poor data delays opened; the deadline starts at receipt; normal PIN at 30 s.",
  [("glass_or_breaking", 0), ("opened_late", 1), ("normal_pin_in_window", 30)], 30,
  "Not applicable.",
  "An integrity note only.")
S("I06", "Gun-like sound at night", "ambiguous",
  "A gun-like sound at 23:00.",
  [("gun_like_single", 0), ("night", 0)], 1,
  "Night adds nothing until it is sourced.",
  "A backfire.",
  ref=("GAP-MONTHEND", "JAC-HIJACK"))
S("I07", "Guy Fawkes fireworks", "false",
  "Repeated gun-like sounds on 5 November at 20:00; the user answers normally.",
  [("gun_like_repeated", 0), ("fireworks_season", 0), ("normal_pin_in_window", 20)], 20,
  "Not applicable.",
  "The season lowers the gun-like reason; the normal PIN answers.",
  ref=("LAW-FIREWORKS", "ACLU-SS"))
S("I08", "Month-end scream", "ambiguous",
  "A scream on the 25th, payday.",
  [("scream_single", 0), ("month_end_window", 0)], 1,
  "Month end adds nothing until it is sourced.",
  "Same.",
  ref=("GAP-MONTHEND",))
S("I09", "Battery at 3% during a shout", "ambiguous",
  "A shout; the battery dies at 5 s; no PIN; contact lost at 95 s.",
  [("shout_or_yell", 0), ("no_answer_after_detection", 71), ("contact_lost_soon_after_detection", 95)], 95,
  "T2.",
  "A flat battery looks like an attack.")

# ---- J · Bank-partner signals ---------------------------------------------
S("J01", "Duress PIN, then a new beneficiary and a large transfer", "real",
  "Duress PIN at 15 s; at 300 s a new beneficiary is added and a large transfer attempted.",
  [("scream_single", 0), ("duress_signal", 15, "checkin"), ("new_beneficiary_during_incident", 300),
   ("large_transfer_within_30min_of_detection", 320)], 320,
  "The bank's hold is already in place; its own records corroborate.",
  "Not applicable.",
  ref=("ISS-EXPRESS", "TC-UNLOCK"))
S("J02", "No answer, then a large transfer", "real",
  "No answer; at 600 s a large transfer leaves the account.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("large_transfer_within_30min_of_detection", 600)], 600,
  "T3 at 251 s; the bank's evidence adds +10.",
  "Not applicable.",
  ref=("TC-ATM",))
S("J03", "Coerced normal PIN plus bank anomalies", "real",
  "The normal PIN is forced at 12 s; the bank sees a limit increase and a new beneficiary minutes later.",
  [("scream_single", 0), ("normal_pin_in_window", 12), ("limit_increase_during_incident", 380),
   ("new_beneficiary_during_incident", 400)], 400,
  "The tally rises past 'strong', but guardians are never alerted: bank evidence cannot move the tier (H8).",
  "Not applicable.",
  ref=("TC-PIN",))
S("J04", "ATM withdrawal at night during an incident", "real",
  "A shout at night, no answer; an ATM withdrawal at 900 s.",
  [("shout_or_yell", 0), ("night", 0), ("no_answer_after_detection", 71),
   ("atm_withdrawal_unusual_hour_during_incident", 900)], 900,
  "T3 at 251 s.",
  "Not applicable.",
  ref=("NCA-ATM", "TC-ATM"))
S("J05", "Bank declines on its own", "real",
  "No answer; the guardian calls 10111; the bank's own engine declines a large transfer at 301 s.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("guardian_ack_called_10111", 150),
   ("large_transfer_within_30min_of_detection", 300), ("bank_decline_by_own_risk_engine", 301)], 301,
  "E3: device, guardian and bank.",
  "Not applicable.")
S("J06", "Bank anomaly with no incident", "ambiguous",
  "A journey is armed but nothing was heard; a new beneficiary and a large transfer appear.",
  [("new_beneficiary_during_incident", 0), ("large_transfer_within_30min_of_detection", 10)], 10,
  "VUKA holds no incident, so the partner input has nowhere to go.",
  "Normal banking.")
S("J07", "House robbery with a forced app transfer", "real",
  "Glass breaks, a shout, sobbing; the family is tied up; no PIN; transfers at 400 to 420 s.",
  [("glass_or_breaking", 0), ("shout_or_yell", 3), ("distress_vocal", 10, "Crying, sobbing"),
   ("no_answer_after_detection", 71), ("new_beneficiary_during_incident", 400),
   ("large_transfer_within_30min_of_detection", 420)], 420,
  "T3 at 251 s; the record precedes the transfers.",
  "Not applicable.",
  ref=("CIT-HOUSE", "TC-UNLOCK"))
S("J08", "Intimate partner forces a transfer", "real",
  "A partner shouts once, makes the user enter the normal PIN, then forces a transfer from her app.",
  [("shout_or_yell", 0), ("normal_pin_in_window", 10), ("large_transfer_within_30min_of_detection", 900)], 900,
  "T1; coercive control rarely sounds like a scream.",
  "Not applicable.",
  ref=("TF-IPV",))

# ---- K · Benign and false situations ---------------------------------------
S("K01", "Television scream", "false",
  "A crime drama on TV; a scream and Television in the same window; normal PIN at 6 s.",
  [("scream_single", 0), ("media_context", 0, "Television"), ("normal_pin_in_window", 6)], 6,
  "Not applicable.", "Faint; answered.")
S("K02", "Soccer match at a tavern", "false",
  "A Soweto derby on the big screen; shouting and cheering; normal PIN at 15 s.",
  [("shout_or_yell", 0), ("crowd_context", 0, "Cheering"), ("normal_pin_in_window", 15)], 15,
  "Not applicable.", "Negative; answered.", ref=("GAP-BENIGN",))
S("K03", "Children playing", "false",
  "Children screaming in a backyard game.",
  [("scream_single", 0), ("children_playing", 0), ("normal_pin_in_window", 10)], 10,
  "Not applicable.", "Answered.", ref=("GAP-BENIGN",))
S("K04", "Braai: a dropped bottle and laughter", "false",
  "A bottle breaks at a Saturday braai amid laughter.",
  [("glass_or_breaking", 0), ("laughter", 0), ("normal_pin_in_window", 20)], 20,
  "Not applicable.", "Answered.")
S("K05", "New Year fireworks", "false",
  "Midnight fireworks and cheering on 1 January.",
  [("gun_like_repeated", 0), ("fireworks_season", 0), ("crowd_context", 1, "Cheering"), ("normal_pin_in_window", 25)], 25,
  "Not applicable.", "Answered.", ref=("LAW-FIREWORKS", "ACLU-SS"))
S("K06", "Phone drop", "false",
  "The phone falls out of a car door.",
  [("impact", 0)], 1,
  "Not applicable.", "Nothing recorded (H3).")
S("K07", "Gym: phone in a locker", "false",
  "A shout over gym music; the phone is in a locker; nobody answers and nobody stands down.",
  [("shout_or_yell", 0), ("media_context", 0, "Music"), ("no_answer_after_detection", 71)], 251,
  "Not applicable.",
  "A false no_answer reaches the bank at 251 s (M7 measures this rate).")
S("K08", "Church service", "false",
  "A preacher shouts over music and applause.",
  [("shout_or_yell", 0), ("media_context", 0, "Music"), ("crowd_context", 0, "Applause"), ("normal_pin_in_window", 30)], 30,
  "Not applicable.", "Strongly negative; answered.")
S("K09", "Loud argument at home", "ambiguous",
  "A loud argument, one shout; the user answers normally.",
  [("shout_or_yell", 0), ("normal_pin_in_window", 20)], 20,
  "The same record may hide intimate-partner coercion.",
  "An ordinary argument.",
  ref=("TF-IPV",))
S("K10", "Taxi rank", "false",
  "A marshal shouts at Bree Street taxi rank; a crowd and a car alarm.",
  [("shout_or_yell", 0), ("crowd_context", 0, "Crowd"), ("car_alarm", 4), ("normal_pin_in_window", 25)], 25,
  "Not applicable.", "Answered.")
S("K11", "Glass recycling bank", "false",
  "The user empties bottles into a recycling bank.",
  [("glass_or_breaking", 0), ("smash_crash", 1), ("normal_pin_in_window", 15)], 15,
  "Not applicable.", "Answered; glass has no negative context.")
S("K12", "Action movie at home", "false",
  "Gunfire in a film; Television in the same window.",
  [("gun_like_repeated", 0), ("media_context", 0, "Television"), ("normal_pin_in_window", 20)], 20,
  "Not applicable.", "Answered.")
S("K13", "Cinema horror film", "false",
  "Sustained screaming over the soundtrack; the user answers late in the window.",
  [("scream_sustained", 0), ("media_context", 0, "Music"), ("normal_pin_slow", 55)], 55,
  "Not applicable.", "Answered slowly.")

# ---- L · Staged and fraudulent events -------------------------------------
S("L01", "Clean-room staging with a duress PIN", "staged",
  "An accomplice screams near the phone; the claimant enters the duress PIN and then tries a transfer to claim for it.",
  [("scream_sustained", 0), ("duress_signal", 10, "checkin"), ("new_beneficiary_during_incident", 200)], 200,
  "Not applicable.",
  "The partner bank's hold blocks the claimant's own transfer; the record shows only what was fed in.",
  notes="Staging is itself an offence (STAGED-DURESS-DEFENCE section 2).", ref=("CIT-STAGED",))
S("L02", "Staged no-answer before an ATM withdrawal", "staged",
  "An accomplice screams, the claimant ignores the check-in and withdraws cash at 600 s; the alert was delivered but nobody acknowledged.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("no_ack_by_T", 251, "delivery: delivered, no acknowledgement"),
   ("atm_withdrawal_unusual_hour_during_incident", 600)], 600,
  "Not applicable.",
  "The record reads like F12; only other records (ATM camera, cell towers) can separate them.",
  ref=("CIT-STAGED", "GAP-STAGED"))
S("L03", "Claim with no VUKA record at all", "ambiguous",
  "A claimant says she was coerced, but no journey was armed.",
  [("claim_filed_without_guardian_record", 0)], 0,
  "The absence of a record is never evidence against anyone.",
  "The same: no conclusion either way.",
  armed=False)
S("L04", "Third incident in a month, same pattern", "staged",
  "Scream then duress PIN, for the third time this month.",
  [("scream_single", 0), ("duress_signal", 12, "checkin"), ("repeat_incidents_same_pattern", 12)], 12,
  "Repeat victimisation happens; the note is for an investigator, not a rule.",
  "A pattern for a human to examine.",
  ref=("GAP-STAGED",))
S("L05", "Detections only while insured at high cover", "staged",
  "Every detection falls inside a high-cover insurance window.",
  [("shout_or_yell", 0), ("no_answer_after_detection", 71), ("detections_only_when_insured_high_cover", 71)], 71,
  "Coincidence is possible; never an automatic denial.",
  "A pattern for a human to examine.")
S("L06", "The 'victim' is the conspirator", "staged",
  "A man staging his own kidnapping enters the duress PIN at settings himself.",
  [("duress_signal", 0, "settings")], 0,
  "Not applicable.",
  "The record cannot tell a conspirator's duress PIN from a victim's.",
  ref=("CIT-STAGED",))

# ---- M · Remote coercion VIGIL can't see ----------------------------------
S("M01", "Vishing call", "remote",
  "A caller posing as the bank's fraud desk talks the user into approving a payment.",
  [], 0,
  "VIGIL hears nothing: there is no scream, and the user believes the call.",
  "Not applicable.",
  notes="Out of scope by design; stated, not hidden.", ref=("ENTERSEKT",), armed=False)
S("M02", "SIM swap", "remote",
  "A fraudster ports the user's number and resets banking access.",
  [], 0,
  "Nothing on the phone's microphone changes.",
  "Not applicable.",
  notes="Out of scope by design.", ref=("XCONNECT",), armed=False)
S("M03", "Sextortion", "remote",
  "A threat to publish images unless money is paid.",
  [], 0,
  "Remote and silent; T0.",
  "Not applicable.",
  notes="Out of scope; no source in the research brief is strong enough to cite for prevalence.", armed=False)
S("M04", "Investment or romance scam", "remote",
  "The user sends money willingly to a scammer over weeks.",
  [], 0,
  "No coercion at the phone; T0.",
  "Not applicable.",
  notes="Out of scope by design.", armed=False)

# ---- N · Parked signals ---------------------------------------------------
S("N01", "Trigger words: 'give me your PIN'", "real",
  "A shout, then the words 'give me your PIN' in isiZulu.",
  [("shout_or_yell", 0), ("trigger_words", 1, "give me your PIN")], 1,
  "Would add +10 if built; not built (RICA/POPIA question to Ipeleng; would supersede ADR-0038).",
  "A TV drama with the same words.")
S("N02", "Bluetooth drops at speed", "real",
  "The car's Bluetooth disconnects at 80 km/h as the hijacker throws the phone out.",
  [("bluetooth_drop_at_speed", 0)], 1,
  "Parked stretch detector with no weight; nothing recorded.",
  "The user switched Bluetooth off.")
S("N03", "High-crime precinct", "ambiguous",
  "A scream in a precinct with high SAPS robbery counts.",
  [("scream_single", 0), ("high_crime_precinct", 0)], 1,
  "Would add +2 if built; needs the parked risk layer.",
  "Would also raise false alarms for everyone who lives there.")
S("N04", "Surge while driving", "false",
  "Hard braking, then a shout.",
  [("surge", 0), ("shout_or_yell", 2)], 2,
  "Surge is dropped; only the shout counts.",
  "A near miss.")

# ---- O · Human reactions ------------------------------------------------------
S("O01", "Freezing: no scream at all", "real",
  "The user freezes during an assault; only a Whimper and a Gasp are audible.",
  [("distress_vocal", 0, "Whimper"), ("distress_vocal", 5, "Gasp")], 5,
  "Nothing is recorded: the most common reaction triggers nothing.",
  "Not applicable.",
  ref=("SCIAM-TI", "SCIAM-SILENT"))
S("O02", "Whispered threat", "real",
  "The attacker whispers 'don't make a sound, give me the phone'.",
  [], 0,
  "Nothing is recorded; Whispering (12) is not mapped.",
  "Not applicable.",
  ref=("GAP-WHISPER",))
S("O03", "Coerced normal PIN (S6)", "real",
  "A shout; the attacker watches the user enter the real PIN at 20 s.",
  [("shout_or_yell", 0), ("normal_pin_in_window", 20)], 20,
  "'Normal code entered', not 'safe': T1 stays.",
  "Not applicable.",
  ref=("TC-PIN",))
S("O04", "Duress PIN forgotten under stress", "real",
  "Sustained screaming; the user cannot recall the duress PIN and enters the normal one late in the window.",
  [("scream_sustained", 0), ("normal_pin_slow", 55)], 55,
  "T1: the design depends on recall nobody has measured.",
  "Not applicable.",
  ref=("GAP-SECRET",))
S("O05", "Fumbled PIN, answered late", "real",
  "A scream; the user fumbles, no_answer fires, then she enters the normal PIN at 100 s meaning the duress one.",
  [("scream_single", 0), ("no_answer_after_detection", 71), ("answered_late_normal", 100)], 100,
  "T2 from no_answer; the late normal PIN cannot lower it.",
  "Not applicable.",
  ref=("GAP-SECRET",))

# ==========================================================================
# WHAT WE FORGOT: items the catalogue exposed
# ==========================================================================
FORGOT = [
    ("A check-in that is never shown has no deadline",
     "The no_answer deadline is keyed on the server receipt of opened (spec section 8). If opened never arrives (notifications revoked, full-screen intent refused), no deadline exists and nothing escalates. The server needs a fallback deadline from the receipt of signal_detected.",
     ("I01",)),
    ("A false alarm answered with a normal PIN never closes",
     "An incident closes only on stand_down or the 6 h auto-close, which needs guardians notified. A normal-PIN cancel leaves it open indefinitely, so a later dead zone or load-shedding outage fires contact_lost and reaches the bank signal (P3.L8, review blocker 3).",
     ("E06", "E10", "E11", "H08")),
    ("Ending a journey is not PIN-gated",
     "An attacker can end the journey with no PIN. Heartbeats then stop legitimately, so contact_lost can never fire. journey_ended should need a pin_authorised (a duress PIN there is then an alarm).",
     ("F06", "F07")),
    ("Duress-PIN recall under stress is unmeasured",
     "The design assumes a victim recalls a second PIN during an assault. No study was found and section 16 has no measure for it; the CEM-0 header cites an M8 that section 16 does not define.",
     ("O04", "O05")),
    ("Guardian delivery failure has no state",
     "no_ack_by_T needs a delivery state (queued, FCM accepted, displayed, SMS sent, failed), but no chain kind or contract field carries it. guardian_alert_delivered and guardian_alert_opened exist only as outbox state.",
     ("G03", "L02")),
    ("Bank trigger provenance is not recorded",
     "bank_signal_sent does not say which rule sent it (H1 duress or H4 no stand_down) or which event it rests on (Ipeleng's S1). Inbound partner observations (new beneficiary, ATM, decline) have no event kind at all.",
     ("J01", "J02", "J05", "F13")),
    ("Heartbeats carry no battery or network state",
     "A flat battery, a tower outage and an attacker switching the phone off all look identical to the server. Battery percentage and network type in the heartbeat would separate them without location.",
     ("E07", "I09", "E11")),
    ("Anomaly notes need a payload-version bump",
     "app_killed_while_armed, rebooted_while_armed, checkin_not_shown and answered_late are reasons without a place in the payload. Adding them needs a pv bump in contract v2, not an ad hoc field.",
     ("I01", "I02", "I03")),
    ("Motion after the sound never counts",
     "The look-back only runs backwards from a sound. A grab after a scream (the common order) is never recorded. A symmetric window of -10 s to +10 s needs a decision in ADR-0039.",
     ("C04", "C03")),
    ("Silence and whispers never open a check-in",
     "Freezing is the documented reaction for many victims, and distress vocalisations and Whispering (12) cannot trigger. Nothing in CEM-0 lets a supporting class open a check-in.",
     ("O01", "O02", "A10")),
    ("Any single guardian's stand_down closes everything",
     "One guardian can close the incident while another is calling 10111, and an attacker texting from the victim's phone can talk a guardian into standing down before the 3-minute bank rule.",
     ("G08", "G04")),
    ("A late normal PIN does not stop the 3-minute bank rule",
     "answered_late is not a stand_down, so a user who answers late still gets a bank hold unless a guardian stands down. Guardians need to be told that the user answered late.",
     ("H03", "O05")),
    ("Bank evidence cannot alert guardians",
     "After a coerced normal PIN, strong bank-partner evidence during the incident still leaves the tier at T1 (H8). H8 forbids only the bank signal; alerting guardians on partner evidence is an open decision.",
     ("J03", "J08")),
    ("The K cap is inert and K flags ordinary cancels",
     "T3 comes only from H1 or H4, which the tally cannot override, so capping at T2 on K of 50% or more never binds. K also reads almost every quick normal-PIN cancel as conflicting. K fits better as a fast-path guard.",
     ("H01", "H05", "K12")),
    ("An accidental duress PIN has no cancel",
     "A mistyped duress PIN sends the bank signal at once, and guardians may not call the user until a stand_down. There is no safe path for the user to say it was a mistake.",
     ("D10",)),
    ("A second detection inside an open incident is unspecified",
     "The spec does not say whether a new detection during an open incident opens a second check-in, restarts the deadline, or only adds a signal_detected.",
     ("H07", "H08")),
    ("Time-context weights are unsourced",
     "The research brief found no source for night or month-end timing of express kidnapping, so both are held at 0. The only timing snippet (hijacking, Thursdays 16:00 to 21:00) was not independently fetched.",
     ("I06", "I08", "F02")),
    ("Fireworks are a calendar rule, not a sound",
     "YAMNet has Fireworks (426) and Firecracker (427). Co-occurrence with those classes could replace or support the calendar-only fireworks_season rule.",
     ("I07", "K05")),
    ("No route or location history",
     "Location is attached only to signal_detected, so an e-hailing driver leaving the route leaves no trace until something is heard.",
     ("F05",)),
]


# ==========================================================================
# ENGINE
# ==========================================================================
def round_half_up(x: Fraction) -> int:
    """floor(x + 1/2), exact."""
    return math.floor(x + Fraction(1, 2))


def decay(points: int, dt: int) -> int:
    """points x 2^(-dt/120), rounded half-up on the magnitude, in exact integers.

    n = floor(|p| x 2^(-dt/120) + 1/2) is the largest n with
    (2n - 1)^120 x 2^dt <= (2|p|)^120. The sign is restored afterwards, so a
    negative context decays exactly like its positive counterpart.
    """
    if points == 0 or dt <= 0:
        return points
    sign = 1 if points > 0 else -1
    p = abs(points)
    target = (2 * p) ** HALF_LIFE_S
    scale = 2 ** dt
    n = p
    while n > 0 and (2 * n - 1) ** HALF_LIFE_S * scale > target:
        n -= 1
    return sign * n


def lr_milli(db: int) -> int:
    """floor(10^(db/10) x 1000), exact integer root."""
    num = 10 ** max(0, db) * 1000 ** 10
    den = 10 ** max(0, -db)
    lo, hi = 0, 1000 * 10 ** (abs(db) // 10 + 1) + 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid ** 10 * den <= num:
            lo = mid
        else:
            hi = mid - 1
    return lo


def band(total: int) -> str:
    if total < 5:
        return "faint"
    if total <= 11:
        return "some"
    if total <= 19:
        return "strong"
    if total <= 29:
        return "very strong"
    return "overwhelming"


def sig_key(sig):
    return (sig[1], REASON_ORDER[sig[0]], sig[2])


def validate(s):
    sid = s["id"]
    assert s["category"] in CAT_NAME, sid
    assert s["window"] in WINDOWS, sid
    assert s["truth"] in ("real", "false", "ambiguous", "staged", "remote"), sid
    for key in s["research_ref"]:
        assert key in SOURCES, (sid, key)
    sigs = sorted(s["signals"], key=sig_key)
    trig = sorted(t for r, t, _ in sigs if r in TRIGGER)
    first = trig[0] if trig else None
    opened = first + 1 if first is not None else None
    shown = first is not None and not any(r == "checkin_not_shown" for r, _, _ in sigs)
    w = s["window"]
    na = [t for r, t, _ in sigs if r == "no_answer_after_detection"]
    for r, t, d in sigs:
        assert r in REASONS, (sid, r)
        assert isinstance(t, int) and 0 <= t <= s["eval_t"], (sid, r, t)
        if r == "distress_vocal":
            assert d in DISTRESS_LABELS, (sid, d)
        if r == "duress_signal":
            assert d in DURESS_CONTEXTS, (sid, d)
            if d == "checkin":
                assert shown and opened <= t <= opened + w, (sid, "duress outside window")
            if d == "late":
                assert na and t > na[0], (sid, "late duress without no_answer")
        if r == "no_answer_after_detection":
            assert shown, (sid, "no_answer without a shown check-in")
            assert t == opened + w + GRACE_S, (sid, "no_answer time", t, opened + w + GRACE_S)
            early = [x for rr, x, dd in sigs if x < t and (rr in NORMAL_PIN or (rr == "duress_signal" and dd == "checkin"))]
            assert not early, (sid, "no_answer after a PIN")
        if r == "normal_pin_in_window":
            assert shown and opened <= t and 4 * (t - opened) <= 3 * w, (sid, "pin_in_window timing")
        if r == "normal_pin_slow":
            assert shown and 4 * (t - opened) > 3 * w and t <= opened + w, (sid, "pin_slow timing")
        if r == "answered_late_normal":
            assert na and t > na[0], (sid, "answered_late without no_answer")
        if r in ("contact_lost_soon_after_detection", "walk_to_vehicle_after_detection", "journey_ended_soon_after_detection"):
            assert any(0 <= t - x <= SOON_S for x in trig), (sid, r, "needs a detection within 120 s")
        if r == "contact_lost_no_detection":
            assert not any(0 <= t - x <= SOON_S for x in trig), (sid, r, "a detection is within 120 s")
        if r == "journey_ended_soon_after_detection":
            assert not any(x <= t and (rr in NORMAL_PIN or rr == "duress_signal") for rr, x, _ in sigs), (sid, "journey end after a PIN")
    for a, b in (("scream_single", "scream_sustained"), ("gun_like_single", "gun_like_repeated")):
        assert not (any(r == a for r, _, _ in sigs) and any(r == b for r, _, _ in sigs)), (sid, a, b)


def entries_for(s):
    """Decide, for every signal, whether it is scored, and why not."""
    sigs = sorted(s["signals"], key=sig_key)
    trig = sorted(t for r, t, _ in sigs if r in TRIGGER)
    guns = sorted(t for r, t, _ in sigs if r in GUN)
    stands = sorted(t for r, t, _ in sigs if r == "guardian_stand_down")
    closed_t = stands[0] if stands else None
    opens = sorted([t for r, t, _ in sigs if r in TRIGGER or r == "duress_signal" or r == "no_answer_after_detection"])

    def incident_open(t):
        return any(x <= t for x in opens) and (closed_t is None or t < closed_t)

    out = []
    for r, t, d in sigs:
        pts, status, decays, _ = REASONS[r]
        state, why = "scored", ""
        if not s["armed"] and r not in STAGING:
            state, why = "excluded", "not armed"
        elif status in ("PARKED", "DROPPED"):
            state, why = "parked", status
        elif r in MOTION:
            if not any(t <= x <= t + LOOKBACK_S for x in trig):
                state, why = "excluded", "H3: not recorded"
        elif r in SUPPORT:
            if not any(abs(x - t) <= SUPPORT_WINDOW_S for x in trig):
                state, why = "excluded", "no trigger within 10 s: not recorded"
        elif r in NEG_CONTEXT:
            if not any(abs(x - t) <= CONTEXT_WINDOW_S for x in trig):
                state, why = "excluded", "no co-occurring trigger"
        elif r == "fireworks_season":
            if not guns:
                state, why = "excluded", "no gun-like sound"
        elif r in CONTACT_LOST:
            if not incident_open(t):
                state, why = "excluded", "section 8: no open incident, not fired"
        elif r in BANK:
            if not incident_open(t):
                state, why = "excluded", "no open incident"
        elif r in UNSOURCED:
            state, why = "unsourced", "unsourced"
        out.append({"reason": r, "t": t, "detail": d, "state": state, "why": why})
    return out


def contributions(entries, at):
    """Points for each scored entry evaluated at time `at` (index -> points)."""
    res = {}
    used = 0
    for i, e in enumerate(entries):
        if e["state"] != "scored" or e["t"] > at:
            continue
        base, _, decays, _ = REASONS[e["reason"]]
        p = decay(base, at - e["t"]) if decays else base
        if e["reason"] == "distress_vocal":
            p = max(0, min(p, DISTRESS_CAP - used))
            used += p
        res[i] = p
    return res


def evaluate(s):
    validate(s)
    ev, w = s["eval_t"], s["window"]
    entries = entries_for(s)
    scored = [e for e in entries if e["state"] == "scored"]
    trig = sorted(e["t"] for e in scored if e["reason"] in TRIGGER)
    first = trig[0] if trig else None
    shown = first is not None and not any(e["reason"] == "checkin_not_shown" for e in entries)
    opened = first + 1 if first is not None else None
    contrib = contributions(entries, ev)
    total = sum(contrib.values())
    pos = sum(v for v in contrib.values() if v > 0)
    neg = -sum(v for v in contrib.values() if v < 0)
    k = 0 if max(pos, neg) == 0 else round_half_up(Fraction(100 * min(pos, neg), max(pos, neg)))
    duress = [e for e in scored if e["reason"] == "duress_signal"]
    d_t = min((e["t"] for e in duress), default=None)
    h4 = sorted(e["t"] for e in scored if e["reason"] in H4_REASONS)
    h4_t = h4[0] if h4 else None
    closed_t = min((e["t"] for e in scored if e["reason"] == "guardian_stand_down"), default=None)
    normal = [e for e in scored if e["reason"] in NORMAL_PIN]
    notes = []

    # ---- tier: deterministic hard rules; the tally never decides it
    motion_excluded = any(e["reason"] in MOTION and e["state"] == "excluded" for e in entries)
    if not s["armed"]:
        peak, rule = 0, "not armed"
    elif first is not None:
        peak, rule = 1, "V4 check-in; H2 caps detection at T1"
    elif motion_excluded:
        peak, rule = 0, "H3 motion only"
    else:
        peak, rule = 0, "nothing detected"
    if h4_t is not None:
        peak, rule = 2, f"H4 at t={h4_t}"
    t3 = []
    if d_t is not None:
        t3.append((d_t, f"H1 at t={d_t}"))
    if h4_t is not None and (closed_t is None or closed_t > h4_t + H4_BANK_DELAY_S) and ev >= h4_t + H4_BANK_DELAY_S:
        t3.append((h4_t + H4_BANK_DELAY_S, f"H4 +3 min at t={h4_t + H4_BANK_DELAY_S}"))
    if t3:
        t3.sort()
        peak, rule = 3, t3[0][1]
    if d_t is None and h4_t is None:
        assert peak <= 1, (s["id"], "H2 violated: detection alone passed T1")
    alerted_t = min([x for x in (d_t, h4_t) if x is not None], default=None)
    last_sig = max([e["t"] for e in scored if e["reason"] in TRIGGER or e["reason"] == "duress_signal"
                    or e["reason"] in H4_REASONS], default=None)
    final = f"T{peak}"
    close_rule = ""
    if closed_t is not None and closed_t <= ev:
        final, close_rule = "Closed", f"H6 stand_down at t={closed_t}"
    elif (alerted_t is not None and last_sig is not None and ev >= last_sig + AUTO_CLOSE_S
          and not any(e["reason"] in CONTACT_LOST for e in scored)):
        final, close_rule = "Closed", "section 8 auto-close after 6 h"
    elif peak >= 1 and last_sig is not None and ev >= last_sig + AUTO_CLOSE_S and alerted_t is None:
        notes.append("no auto-close: guardians were never notified (section 8)")
    for e in scored:
        if e["reason"] in GUARDIAN and e["reason"] != "no_ack_by_T":
            assert alerted_t is not None and e["t"] >= alerted_t, (s["id"], e["reason"], "guardian activity before any alert")

    # ---- conflict and automatic notes
    conflict = k >= K_CONFLICT_PCT and not duress
    if conflict and peak == 3:
        notes.append("K cap at T2 not applied: H4 is a hard rule")
    if normal:
        notes.append("H5: the normal PIN lowered the tally, not the tier")
    if any(e["reason"] in BANK for e in scored):
        notes.append("H8: bank evidence moved the tally and E-level, not the tier")
    if any(e["reason"] in GUARDIAN_ACK for e in scored):
        notes.append("H7: guardian acknowledgement adds no coercion evidence")
    p3l8 = any(e["reason"] in CONTACT_LOST and any(n["t"] < e["t"] for n in normal) for e in scored)
    if p3l8:
        notes.append("P3.L8 open: contact_lost after a normal-PIN outcome")
    if any(e["reason"] == "checkin_not_shown" for e in entries):
        notes.append("opened never arrives, so no no_answer deadline exists")
    if any(e["state"] == "unsourced" for e in entries):
        notes.append("time context unsourced: held at 0")
    if any(e["reason"] in MOTION and e["state"] == "excluded" and any(x < e["t"] for x in trig) for e in entries):
        notes.append("motion after the sound is outside the look-back")
    if any(e["reason"] == "answered_late_normal" for e in scored) and peak >= 2:
        notes.append("answered_late does not stop the 3-minute bank rule")
    parked = [e for e in entries if e["state"] == "parked" and REASONS[e["reason"]][0] != 0]
    parked_db = sum(REASONS[e["reason"]][0] for e in parked)
    if parked:
        notes.append(f"PARKED signals would add +{parked_db} db if built (what-if total {total + parked_db})")

    # ---- fast path (PROPOSED, section 5)
    if first is None:
        fast = "n/a: no check-in"
    elif not shown:
        fast = "n/a: check-in never shown"
    else:
        fast, best = None, None
        for t in range(opened, opened + w + 1):
            if any(e["reason"] == "duress_signal" and e["t"] <= t for e in scored):
                fast = f"n/a: H1 first at t={d_t}"
                break
            if any(n["t"] <= t for n in normal):
                break
            tally = sum(contributions(entries, t).values())
            if tally >= FAST_PATH_DB:
                fast = f"yes at t={t} ({tally} db)"
                break
            best = tally if best is None else max(best, tally)
        if fast is None:
            fast = f"no (peak {best} db)" if best is not None else "no"

    # ---- evidence level
    has_signal = first is not None
    has_result = bool(normal) or bool(duress) or any(e["reason"] == "answered_late_normal" for e in scored)
    has_guardian = any(e["reason"] in GUARDIAN_ACK for e in scored)
    has_inst = any(e["reason"] in BANK for e in scored)
    if has_guardian and has_inst:
        lvl = "E3"
    elif has_guardian:
        lvl = "E2"
    elif has_result:
        lvl = "E1"
    elif has_signal:
        lvl = "E0"
    else:
        lvl = "none"
    principals = (1 if (has_signal or has_result) else 0) + has_guardian + has_inst
    e_level = lvl if lvl == "none" else f"{lvl}, {principals} principal{'s' if principals != 1 else ''}"
    if has_inst and not has_guardian:
        e_level += " (bank record without a guardian)"

    # ---- recorded kinds
    kinds = set()
    if s["armed"]:
        kinds.add("journey_armed")
    if has_signal:
        kinds.add("signal_detected")
        if shown:
            kinds.add("checkin_opened")
    for e in scored:
        r, d = e["reason"], e["detail"]
        if r in NORMAL_PIN:
            kinds.add("checkin_result")
        elif r == "duress_signal":
            if d == "checkin":
                kinds.add("checkin_result")
            elif d == "late":
                kinds.update(("checkin_result", "answered_late"))
            else:
                kinds.add("pin_authorised")
                if d == "guardian_add":
                    kinds.add("decoy_added")
        elif r == "answered_late_normal":
            kinds.update(("checkin_result", "answered_late"))
        elif r == "no_answer_after_detection":
            kinds.add("no_answer")
        elif r in CONTACT_LOST:
            kinds.add("contact_lost")
        elif r == "journey_ended_soon_after_detection":
            kinds.add("journey_ended")
        elif r in GUARDIAN_ACK:
            kinds.add("guardian_ack")
    if alerted_t is not None:
        kinds.add("guardian_alerted")
    if peak == 3:
        kinds.add("bank_signal_sent")
    if final == "Closed":
        kinds.add("incident_closed")
    kinds_sorted = [k_ for k_ in KIND_ORDER if k_ in kinds]

    mix = {}
    for e in entries:
        st = REASONS[e["reason"]][1]
        mix[st] = mix.get(st, 0) + 1
    status_mix = " · ".join(f"{st} {mix[st]}" for st in STATUS_ORDER if st in mix) or "none"

    reason_parts = []
    for i, e in enumerate(entries):
        r, d = e["reason"], e["detail"]
        base = REASONS[r][0]
        label = r + (f" {d}" if d and r in ("distress_vocal", "media_context", "crowd_context", "duress_signal", "trigger_words") else "")
        if e["state"] == "scored":
            p = contrib.get(i, 0)
            if p == 0 and base == 0:
                reason_parts.append(f"0 {label}")
            elif p != base:
                reason_parts.append(f"{p:+d} {label} ({base:+d} at t={e['t']})")
            else:
                reason_parts.append(f"{p:+d} {label}")
        elif e["state"] == "unsourced":
            reason_parts.append(f"0 {label} (unsourced; {base:+d} held)")
        elif e["state"] == "parked":
            reason_parts.append(f"({base:+d} {label}: {e['why']}, not scored)")
        else:
            reason_parts.append(f"~~{label}~~ ({e['why']})")

    return {
        "id": s["id"], "category": s["category"], "title": s["title"], "truth": s["truth"],
        "narrative": s["narrative"], "if_real": s["if_real"], "if_false": s["if_false"], "notes": s["notes"],
        "research_ref": list(s["research_ref"]), "eval_t": ev, "window": w,
        "signals": [[e["reason"], e["t"], e["detail"]] for e in entries],
        "reasons": reason_parts, "total": total, "positive": pos, "negative": neg, "k_pct": k,
        "conflict": conflict, "band": "user-signalled" if duress else band(total),
        "tier": final, "peak": peak, "rule": rule, "close_rule": close_rule,
        "detection_only": d_t is None and h4_t is None,
        "fast_path": fast, "e_level": e_level, "recorded_kinds": kinds_sorted,
        "status_mix": status_mix, "auto_notes": notes,
    }


def evaluate_all():
    ids = [s["id"] for s in SCENARIOS]
    assert len(ids) == len(set(ids)), "duplicate scenario id"
    rows = [evaluate(s) for s in sorted(SCENARIOS, key=lambda x: x["id"])]
    counts = {c: 0 for c in CAT_NAME}
    for r in rows:
        counts[r["category"]] += 1
    for c, m in CAT_MIN.items():
        assert counts[c] >= m, (c, counts[c], m)
    assert len(rows) >= 110, len(rows)
    known = set(ids)
    for _, _, refs in FORGOT:
        for x in refs:
            assert x in known, x
    return rows


# ==========================================================================
# RENDERING
# ==========================================================================
BANNED = ("court-admissible", "unhackable", "prevents crime", "proof of duress", "unbiased ai",
          "identifies criminals", "gunshot detected")


def tier_cell(r):
    if r["tier"] == "Closed":
        return f"Closed ({r['close_rule']}); peak T{r['peak']} ({r['rule']})"
    return f"{r['tier']} ({r['rule']})"


def base_rate_rows(rows):
    by_id = {r["id"]: r for r in rows}
    out = []
    for sid in ("F02", "E01", "K01"):
        r = by_id[sid]
        f = lr_milli(r["total"])
        cells = []
        for n in (10000, 1000):
            d = 1000 * (n - 1)
            pm = round_half_up(Fraction(1000 * f, f + d))
            cells.append(f"{pm // 10}.{pm % 10}%")
        lr = f"x{f // 1000}" if f >= 1000 else f"x0.{f:03d}"
        out.append((sid, r["title"], r["total"], lr, cells[0], cells[1]))
    return out


def render(rows):
    L = []
    a = L.append
    by_cat = {}
    for r in rows:
        by_cat.setdefault(r["category"], []).append(r)
    a("# Coercion scenario catalogue (CEM-0)")
    a("")
    a("> **Status:** `PROPOSED`. A catalogue for Lethabo, Ipeleng and Vukosi that feeds ADR-0039. **Generated** by `scripts/coercion_scenarios.py`: never edit this file by hand.")
    a(">")
    a("> **Every number here is an uncalibrated design prior, not a probability.** The tally is an evidence count in integer decibans (10 db is x10 odds, +3 db is about x2) with every reason shown. It is not the chance that anyone was coerced, and no weight has been fitted to data. M1, M2 and M7 in `docs/VUKA-2-SPEC.md` section 16, and pilot data, will replace them.")
    a(">")
    a("> **Regenerate:** `python scripts/coercion_scenarios.py` rewrites this file. `python scripts/coercion_scenarios.py --check` exits 1 if it is stale (run by `test/coercion-scenarios.test.mjs`). `--csv PATH` writes the same rows as CSV.")
    a("")
    a("## 1 · What is stored and what is computed")
    a("")
    a("- **Stored** (committed, private): the facts. Each reason's raw inputs (class, `score_bp`, `threshold_bp`, pattern, offsets), PIN outcomes, server outcomes, guardian acknowledgements and bank acknowledgements.")
    a(f"- **Computed at read time, versioned** (`cem_version: {CEM_VERSION}`): the tally, the band, K, the E-level, 'no acknowledgement by T' and fast-path eligibility. The tally is never written into the chain, so it can be recomputed once calibration exists.")
    a("- **Never on chain:** anything except the 33-byte typed roots (`docs/VUKA-2-SPEC.md` section 10).")
    a("")
    a("## 2 · The model in one screen")
    a("")
    a("- **Two outputs, kept apart.** The **response tier** is what the system does, set only by the hard rules (section 4). The **evidence tally** is a sum of reason points. The tally never sets or lowers a tier.")
    a("- **Tiers:** T0 record only (motion alone lands here) · T1 check-in ('Journey check') · T2 guardians alerted · T3 guardians alerted + bank protective signal (S1, ADR-0037) · Closed (guardian `stand_down`, or the 6 h auto-close).")
    a(f"- **Decay:** detector reasons (sound, motion) decay with a {HALF_LIFE_S} s half-life: `points x 2^(-dt/120)`, rounded half-up on the magnitude, computed with exact integer comparisons (no floating point). PIN, contact, journey, movement, time, bank and guardian reasons do not decay within an incident.")
    a("- **Total** = the sum of decayed points, an integer. **K** = min(P, N) / max(P, N) as an integer percentage, where P is the positive sum and N the absolute negative sum. K of 50% or more reads 'conflicting evidence: guardian judgement'.")
    a("- **Bands** (labels, not probabilities): below 5 faint · 5 to 11 some · 12 to 19 strong · 20 to 29 very strong · 30 or more overwhelming. A duress signal always reads **user-signalled**.")
    a(f"- **Fast path** (`PROPOSED`, a decision for Lethabo, not built): if the tally reaches {FAST_PATH_DB} db with no normal PIN while the check-in window is still open, guardians would be alerted before `no_answer`. It is shown beside each tier and never changes it. The bank signal still needs H1 or H4.")
    a("")
    a("### Engine choices where the spec was silent")
    a("")
    a(f"- Motion corroborates a sound only if the sound comes 0 to {LOOKBACK_S} s after it (H3's look-back); otherwise the motion is struck out as not recorded.")
    a(f"- Supporting sounds (distress vocalisations, tyre squeal, car alarm) attach to a trigger within {SUPPORT_WINDOW_S} s and never open a check-in alone. Negative context counts only within {CONTEXT_WINDOW_S} s of a trigger (same or adjacent window).")
    a("- The check-in opens 1 s after the first trigger; `no_answer` is due at opened + window + 10 s grace. A normal PIN in the first 75% of the window is `normal_pin_in_window`, after that `normal_pin_slow`.")
    a("- `contact_lost` and bank-partner reasons count only while an incident is open (spec section 8). A `stand_down` closes it, and later `contact_lost` does not fire (T10).")
    a("- `night` and `month_end_window` are held at 0: the CEM-0 spec admits time context only if the research supports it, and the research brief found no source (gap 6).")
    a("- The K cap at T2 is reported but never overrides H1 or H4, because section 2 of the CEM-0 spec says the tally can never override a hard rule. In practice it never binds (see 'What we forgot').")
    a("- **E-level** counts independent principals: the device (detection and PIN together), a guardian's own-key acknowledgement, and a bank-partner record. A server timestamp is not a witness, and a bank acknowledgement of our own signal is not independent.")
    a("")
    a("## 3 · YAMNet classes referenced")
    a("")
    a(f"Every label and index below was checked on 23 Sep 2026 against `yamnet_class_map.csv` ({YAMNET_CSV_URL}), 521 classes, sha256 `{YAMNET_CSV_SHA256}`. Mapping is by exact label (V3), so 'Children shouting' (10) never matches 'Shout' (6).")
    a("")
    a("| Reason family | Index | Exact label | Mapping status |")
    a("|---|---:|---|---|")
    for fam, idx, label, st in YAMNET:
        a(f"| {fam} | {idx} | {label} | {st} |")
    a("")
    a("## 4 · Reasons and hard rules")
    a("")
    a("| Reason | db | Status | Decays | Meaning |")
    a("|---|---:|---|---|---|")
    for name, (pts, st, dec, meaning) in REASONS.items():
        a(f"| `{name}` | {pts:+d} | {st} | {'yes' if dec else 'no'} | {meaning} |")
    a("")
    a("Status: **BUILT-SPEC** in `docs/VUKA-2-SPEC.md` today · **ADR-0039** proposed there · **PROPOSED** new in CEM-0 · **PARKED** designed, not built · **DROPPED** removed. PARKED and DROPPED reasons are shown, never scored.")
    a("")
    a("| Rule | From the accepted ADRs (the tally never overrides these) | How the generator enforces it |")
    a("|---|---|---|")
    for rid, stmt, how in HARD_RULES:
        a(f"| **{rid}** | {stmt} | {how} |")
    a("")
    # ---- at a glance
    a("## 5 · The catalogue at a glance")
    a("")
    a(f"**{len(rows)} scenarios.**")
    a("")
    a("| Category | Scenarios | Minimum |")
    a("|---|---:|---:|")
    for c, name, m in CATEGORIES:
        a(f"| {c} · {name} | {len(by_cat.get(c, []))} | {m} |")
    a("")
    finals = {}
    peaks = {}
    for r in rows:
        finals[r["tier"]] = finals.get(r["tier"], 0) + 1
        peaks[r["peak"]] = peaks.get(r["peak"], 0) + 1
    order = ["T0", "T1", "T2", "T3", "Closed"]
    a("| Final state | " + " | ".join(order) + " |")
    a("|---|" + "---:|" * len(order))
    a("| Scenarios | " + " | ".join(str(finals.get(x, 0)) for x in order) + " |")
    a("")
    a("| Peak tier reached | T0 | T1 | T2 | T3 |")
    a("|---|---:|---:|---:|---:|")
    a("| Scenarios | " + " | ".join(str(peaks.get(x, 0)) for x in range(4)) + " |")
    a("")
    det_t3 = [r["id"] for r in rows if r["detection_only"] and r["peak"] > 1]
    a(f"Scenarios reaching T2 or T3 from detection alone: **{len(det_t3)}** (H2 holds). Every T3 is set by H1 or H4.")
    a("")
    top = sorted(rows, key=lambda r: (-r["total"], r["id"]))[:3]
    top_nd = sorted([r for r in rows if r["band"] != "user-signalled"], key=lambda r: (-r["total"], r["id"]))[:3]
    conf = sorted(rows, key=lambda r: (-r["k_pct"], -r["total"], r["id"]))[:3]
    a("- **Highest totals:** " + "; ".join(f"{r['id']} {r['title']} ({r['total']} db)" for r in top) + ".")
    a("- **Highest totals without a duress signal:** " + "; ".join(f"{r['id']} {r['title']} ({r['total']} db)" for r in top_nd) + ".")
    a("- **Most conflicted:** " + "; ".join(f"{r['id']} {r['title']} (K {r['k_pct']}%)" for r in conf) + ".")
    fp = [r["id"] for r in rows if r["fast_path"].startswith("yes")]
    a(f"- **Would take the PROPOSED fast path:** {', '.join(fp) if fp else 'none'}.")
    a("")
    # ---- scenarios
    a("## 6 · Scenarios")
    a("")
    a("Times are seconds from the first signal; each row is evaluated at its `eval t`. Struck-out reasons were not recorded, and the reason is given. Decayed points show the undecayed value and its time in parentheses.")
    a("")
    for c, name, _ in CATEGORIES:
        a(f"### {c} · {name}")
        a("")
        a("| ID | Scenario | Reasons at eval t | Total | K | Band | Tier (rule) | Fast path | E-level | Recorded kinds | Status mix | Truth |")
        a("|---|---|---|---:|---:|---|---|---|---|---|---|---|")
        for r in by_cat.get(c, []):
            kflag = f"{r['k_pct']}% conflicting" if r["conflict"] else f"{r['k_pct']}%"
            reasons = ", ".join(r["reasons"]) if r["reasons"] else "none"
            kinds = ", ".join(r["recorded_kinds"]) if r["recorded_kinds"] else "nothing"
            a(f"| {r['id']} | {r['title']} (eval t={r['eval_t']}) | {reasons} | {r['total']} | {kflag} | {r['band']} | {tier_cell(r)} | {r['fast_path']} | {r['e_level']} | {kinds} | {r['status_mix']} | {r['truth']} |")
        a("")
        for r in by_cat.get(c, []):
            timeline = " · ".join(f"t={t} {rs}" + (f" ({d})" if d else "") for rs, t, d in r["signals"]) or "no signals"
            parts = [f"- **{r['id']}** {r['narrative']} Signals: {timeline}.",
                     f"If real: {r['if_real']} If false: {r['if_false']}"]
            extra = [n for n in [r["notes"]] if n] + r["auto_notes"]
            if extra:
                parts.append("Notes: " + "; ".join(x.rstrip(".") for x in extra) + ".")
            if r["research_ref"]:
                parts.append("Research: " + ", ".join(r["research_ref"]) + ".")
            a(" ".join(parts))
        a("")
    # ---- base rate
    a("## 7 · The base-rate trap, illustrated")
    a("")
    a("The true rate of coercion per armed journey-hour is **unknown**; only a pilot can measure it. The table reads three tallies as if each were a calibrated likelihood ratio, at two **assumed** base rates (`ASSUMPTION`, not a measurement). It shows why a large tally is still mostly false alarms when coercion is rare. It is arithmetic on uncalibrated priors, not a probability that anyone was coerced.")
    a("")
    a("| Scenario | Tally | Read as odds | Share real at 1 in 10,000 | Share real at 1 in 1,000 |")
    a("|---|---:|---:|---:|---:|")
    for sid, title, tot, lr, c1, c2 in base_rate_rows(rows):
        a(f"| {sid} {title} | {tot} db | {lr} | {c1} | {c2} |")
    a("")
    a("Computed with integers: the odds factor is floor(10^(db/10) x 1000) / 1000 by an exact integer root, and the share is that factor over (factor + base-rate odds), rounded half-up to 0.1%.")
    a("")
    # ---- forgot
    a("## 8 · What we forgot")
    a("")
    a("Signals, contract fields and rules the catalogue shows are missing or undecided. Each names the scenarios that expose it.")
    a("")
    for i, (title, body, refs) in enumerate(FORGOT, 1):
        a(f"{i}. **{title}.** {body} Exposed by {', '.join(refs)}.")
    a("")
    # ---- sources
    a("## 9 · Sources")
    a("")
    a("Facts come from the sourced research brief prepared for this catalogue on 23 Sep 2026; each entry carries its own source, date and URL. Quoted spans are as the brief recorded them. Where the brief marks a fact as a search-engine synthesis, a snippet or a paraphrase, that marker is kept in bold and the span is not a verified literal quote. `NOT FOUND` rows are gaps the brief could not source; they are cited as gaps, not as facts.")
    a("")
    used = sorted({k for r in rows for k in r["research_ref"]})
    for key in used:
        src = SOURCES[key]
        q = (f" {'Paraphrase' if 'paraphrase' in src['marker'] else 'Quote'}: \"{src['quote']}\"." if src["quote"] else "")
        m = f" **{src['marker']}**." if src["marker"] else ""
        u = f" {src['url']}" if src["url"] else ""
        a(f"- **{key}** · {src['who']}, {src['date']}.{q}{u}{m}")
    a(f"- **YAMNET-CSV** · TensorFlow models repository, `yamnet_class_map.csv`, fetched 23 Sep 2026. {YAMNET_CSV_URL} (sha256 `{YAMNET_CSV_SHA256}`).")
    a("")
    a("Not used: the research brief's digital-fraud loss totals (one conflicts with a dead number in `docs/MASTER-CONTEXT.md`), its carjacking count and its sextortion share (low confidence).")
    a("")
    text = "\n".join(L) + "\n"
    low = text.lower()
    for phrase in BANNED:
        assert phrase not in low, f"banned phrase in output: {phrase}"
    assert "](" not in text, "markdown link syntax would be checked as a local link"
    assert "318 ms" not in text
    return text


def write_csv(rows, path):
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(["id", "category", "title", "truth", "eval_t", "total", "k_pct", "conflict", "band", "tier", "peak",
                "rule", "close_rule", "fast_path", "e_level", "recorded_kinds", "status_mix", "reasons", "research_ref"])
    for r in rows:
        w.writerow([r["id"], r["category"], r["title"], r["truth"], r["eval_t"], r["total"], r["k_pct"],
                    "yes" if r["conflict"] else "no", r["band"], r["tier"], r["peak"], r["rule"], r["close_rule"],
                    r["fast_path"], r["e_level"], " ".join(r["recorded_kinds"]), r["status_mix"],
                    "; ".join(r["reasons"]), " ".join(r["research_ref"])])
    Path(path).write_text(buf.getvalue(), encoding="utf-8", newline="\n")


def summary(rows):
    counts = {}
    for r in rows:
        counts[r["category"]] = counts.get(r["category"], 0) + 1
    finals = {}
    for r in rows:
        finals[r["tier"]] = finals.get(r["tier"], 0) + 1
    top = sorted(rows, key=lambda r: (-r["total"], r["id"]))[:3]
    conf = sorted(rows, key=lambda r: (-r["k_pct"], -r["total"], r["id"]))[:3]
    print(f"{len(rows)} scenarios: " + ", ".join(f"{c} {counts.get(c, 0)}" for c in CAT_NAME))
    print("final tiers: " + ", ".join(f"{t} {finals.get(t, 0)}" for t in ("T0", "T1", "T2", "T3", "Closed")))
    print("top totals: " + "; ".join(f"{r['id']} {r['total']}" for r in top))
    print("most conflicted: " + "; ".join(f"{r['id']} K{r['k_pct']}%" for r in conf))


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--check", action="store_true", help="exit 1 if docs/COERCION-SCENARIOS.md is stale")
    ap.add_argument("--csv", metavar="PATH", help="also write the rows as CSV")
    ap.add_argument("--json", action="store_true", help="print evaluated rows as JSON and exit")
    args = ap.parse_args(argv)
    rows = evaluate_all()
    if args.json:
        json.dump(rows, sys.stdout, sort_keys=True, ensure_ascii=True)
        sys.stdout.write("\n")
        return 0
    text = render(rows)
    if args.check:
        current = DOC_PATH.read_bytes().replace(b"\r\n", b"\n") if DOC_PATH.exists() else b""
        if current != text.encode("utf-8"):
            print(f"{DOC_PATH.relative_to(ROOT)} is stale: run python scripts/coercion_scenarios.py", file=sys.stderr)
            return 1
        print(f"{DOC_PATH.relative_to(ROOT)} is up to date ({len(rows)} scenarios).")
        return 0
    with open(DOC_PATH, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    if args.csv:
        write_csv(rows, args.csv)
    summary(rows)
    return 0


if __name__ == "__main__":
    sys.exit(main())
