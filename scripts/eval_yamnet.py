"""Generate transparent M1/M2/M3 reports from precomputed JSON results.

This standard-library tool performs no inference and reads no audio.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import re
import sys


SHA256_RE = re.compile(r"[0-9a-f]{64}\Z")
AUDIO_SUFFIXES = (".wav", ".mp3", ".flac", ".ogg")
WILSON_Z = 1.959963984540054


class InvalidInput(ValueError):
    """Input data violates the measurement input schema."""


def _reject_constant(value: str):
    raise InvalidInput(f"non-finite JSON number is not allowed: {value}")


def _has_audio_reference(value) -> bool:
    if isinstance(value, dict):
        return any(_has_audio_reference(key) or _has_audio_reference(item)
                   for key, item in value.items())
    if isinstance(value, list):
        return any(_has_audio_reference(item) for item in value)
    return isinstance(value, str) and value.lower().endswith(AUDIO_SUFFIXES)


def _object(value, expected_keys: set[str], where: str) -> dict:
    if not isinstance(value, dict):
        raise InvalidInput(f"{where} must be an object")
    unknown = set(value) - expected_keys
    missing = expected_keys - set(value)
    if unknown:
        raise InvalidInput(f"{where} has unknown field(s): {', '.join(sorted(unknown))}")
    if missing:
        raise InvalidInput(f"{where} is missing field(s): {', '.join(sorted(missing))}")
    return value


def _string(value, where: str, nonempty: bool = True) -> str:
    if not isinstance(value, str) or (nonempty and not value.strip()):
        raise InvalidInput(f"{where} must be a{' non-empty' if nonempty else ''} string")
    return value


def _integer(value, where: str, minimum: int | None = None) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise InvalidInput(f"{where} must be an integer")
    if minimum is not None and value < minimum:
        raise InvalidInput(f"{where} must be at least {minimum}")
    return value


def _finite_number(value, where: str, minimum: float | None = None) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise InvalidInput(f"{where} must be a finite number")
    if not math.isfinite(value):
        raise InvalidInput(f"{where} must be a finite number")
    number = float(value)
    if minimum is not None and number < minimum:
        raise InvalidInput(f"{where} must be at least {minimum}")
    return number


def _config_sha(config: dict, where: str) -> str:
    value = _string(config["model_sha256"], f"{where}.model_sha256")
    if SHA256_RE.fullmatch(value) is None:
        raise InvalidInput(f"{where}.model_sha256 must be 64 lowercase hexadecimal characters")
    return value


def _threshold(config: dict, where: str) -> int:
    value = _integer(config["threshold_bp"], f"{where}.threshold_bp", 0)
    if value > 10000:
        raise InvalidInput(f"{where}.threshold_bp must be at most 10000")
    return value


def _base(measure: str, config: dict, n: int, method: str,
          numerator: int, denominator: int) -> dict:
    return {"measure": measure, "status": "measured", "numerator": numerator,
            "denominator": denominator, "n": n, "config": config, "method": method}


def _wilson_interval(successes: int, observations: int) -> list[float]:
    p = successes / observations
    z2 = WILSON_Z * WILSON_Z
    divisor = 1 + z2 / observations
    center = (p + z2 / (2 * observations)) / divisor
    half = WILSON_Z * math.sqrt(p * (1 - p) / observations + z2 / (4 * observations * observations)) / divisor
    return [round(max(0.0, center - half), 4), round(min(1.0, center + half), 4)]


def report_m1(data: dict) -> dict:
    top = _object(data, {"config", "clips"}, "M1 input")
    config = _object(top["config"], {"model_sha256", "threshold_bp", "class",
                                     "dataset", "dataset_version"}, "M1 config")
    _config_sha(config, "M1 config")
    threshold = _threshold(config, "M1 config")
    _string(config["class"], "M1 config.class")
    _string(config["dataset"], "M1 config.dataset")
    _string(config["dataset_version"], "M1 config.dataset_version")
    clips = top["clips"]
    if not isinstance(clips, list):
        raise InvalidInput("M1 clips must be an array")
    clip_ids = set()
    successes = 0
    for index, item in enumerate(clips):
        clip = _object(item, {"clip_id", "licence", "score_bp"}, f"M1 clips[{index}]")
        clip_id = _string(clip["clip_id"], f"M1 clips[{index}].clip_id")
        licence = _string(clip["licence"], f"M1 clips[{index}].licence")
        if clip_id in clip_ids:
            raise InvalidInput(f"duplicate M1 clip_id: {clip_id}")
        clip_ids.add(clip_id)
        score = _integer(clip["score_bp"], f"M1 clips[{index}].score_bp", 0)
        if score > 10000:
            raise InvalidInput(f"M1 clips[{index}].score_bp must be at most 10000")
        if not licence.strip():
            raise InvalidInput(f"M1 clips[{index}].licence must be non-empty")
        successes += score >= threshold
    n = len(clips)
    report = _base("M1_detection_recall", config, n,
                   "Positive clips with score_bp >= threshold_bp / all positive clips; Wilson 95% interval (z=1.959963984540054).",
                   successes, n)
    if n == 0:
        report["status"] = "not_measured"
        report["reason"] = "no clips in input"
    else:
        report["recall"] = successes / n
        report["wilson_95"] = _wilson_interval(successes, n)
    return report


def report_m2(data: dict) -> dict:
    top = _object(data, {"config", "runs"}, "M2 input")
    config = _object(top["config"], {"model_sha256", "threshold_bp", "refractory_s"}, "M2 config")
    _config_sha(config, "M2 config")
    _threshold(config, "M2 config")
    refractory = _finite_number(config["refractory_s"], "M2 config.refractory_s", 0)
    runs = top["runs"]
    if not isinstance(runs, list):
        raise InvalidInput("M2 runs must be an array")
    run_ids = set()
    raw = counted = 0
    armed_total = 0
    for index, item in enumerate(runs):
        run = _object(item, {"run_id", "armed_seconds", "consent_recorded", "alarm_times_s"},
                      f"M2 runs[{index}]")
        run_id = _string(run["run_id"], f"M2 runs[{index}].run_id")
        if run_id in run_ids:
            raise InvalidInput(f"duplicate M2 run_id: {run_id}")
        run_ids.add(run_id)
        seconds = _integer(run["armed_seconds"], f"M2 runs[{index}].armed_seconds", 0)
        if run["consent_recorded"] is not True:
            raise InvalidInput(f"M2 runs[{index}].consent_recorded must be true")
        times = run["alarm_times_s"]
        if not isinstance(times, list):
            raise InvalidInput(f"M2 runs[{index}].alarm_times_s must be an array")
        alarm_times = [_finite_number(value, f"M2 runs[{index}].alarm_times_s[{j}]", 0)
                       for j, value in enumerate(times)]
        raw += len(alarm_times)
        armed_total += seconds
        previous_counted = None
        for alarm_time in sorted(alarm_times):
            if previous_counted is None or alarm_time - previous_counted >= refractory:
                counted += 1
                previous_counted = alarm_time
    n = len(runs)
    denominator = armed_total
    report = _base("M2_false_alarms_per_armed_hour", config, n,
                   "Within each run, sort alarm times and merge an alarm when it is less than refractory_s after the previous counted alarm; counted alarms / armed hours. Limited-sample estimate, not a field rate.",
                   counted, denominator)
    report.update({"raw": raw, "counted": counted, "armed_seconds_total": armed_total,
                   "run_count": n, "rate_unit": "alarms_per_armed_hour"})
    if armed_total == 0:
        report["status"] = "not_measured"
        report["reason"] = "zero total armed seconds"
    else:
        report["false_alarms_per_hour"] = counted / (armed_total / 3600)
    return report


def report_m3(data: dict) -> dict:
    top = _object(data, {"config", "attempts"}, "M3 input")
    config = _object(top["config"], {"clock_offset_ms", "clock_uncertainty_ms", "network"}, "M3 config")
    offset = _integer(config["clock_offset_ms"], "M3 config.clock_offset_ms")
    uncertainty = _integer(config["clock_uncertainty_ms"], "M3 config.clock_uncertainty_ms", 0)
    _string(config["network"], "M3 config.network")
    attempts = top["attempts"]
    if not isinstance(attempts, list):
        raise InvalidInput("M3 attempts must be an array")
    attempt_ids = set()
    latencies = []
    lost = 0
    for index, item in enumerate(attempts):
        attempt = _object(item, {"attempt_id", "detected_at_ms", "displayed_at_ms"},
                          f"M3 attempts[{index}]")
        attempt_id = _string(attempt["attempt_id"], f"M3 attempts[{index}].attempt_id")
        if attempt_id in attempt_ids:
            raise InvalidInput(f"duplicate M3 attempt_id: {attempt_id}")
        attempt_ids.add(attempt_id)
        detected = _integer(attempt["detected_at_ms"], f"M3 attempts[{index}].detected_at_ms", 0)
        displayed = attempt["displayed_at_ms"]
        if displayed is None:
            lost += 1
        else:
            displayed = _integer(displayed, f"M3 attempts[{index}].displayed_at_ms", 0)
            latencies.append(displayed - detected - offset)
    n = len(attempts)
    report = _base("M3_detection_to_guardian_display_latency", config, n,
                   "Latency_ms = displayed_at_ms - detected_at_ms - clock_offset_ms; lost attempts remain in n and denominator; percentiles use delivered attempts, nearest-rank p95.",
                   len(latencies), n)
    report.update({"lost": lost, "clock_offset_ms": offset,
                   "clock_uncertainty_ms": uncertainty,
                   "clock_suspect": sum(value < 0 for value in latencies)})
    if n < 30:
        report["status"] = "insufficient_n"
        report["reason"] = "fewer than 30 attempts"
    elif not latencies:
        report["status"] = "not_measured"
        report["reason"] = "no displayed attempts"
    else:
        ordered = sorted(latencies)
        size = len(ordered)
        middle = size // 2
        median = ordered[middle] if size % 2 else (ordered[middle - 1] + ordered[middle]) / 2
        rank_95 = math.ceil(0.95 * size)
        report.update({"median_ms": median, "p95_ms": ordered[rank_95 - 1],
                       "min_ms": ordered[0], "max_ms": ordered[-1]})
    return report


def _load_json(path: Path) -> dict:
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError as error:
        raise FileNotFoundError(f"cannot read input file {path}: {error}") from error
    except UnicodeError as error:
        raise InvalidInput(f"input file is not valid UTF-8: {path}") from error
    try:
        value = json.loads(raw, parse_constant=_reject_constant)
    except (json.JSONDecodeError, InvalidInput) as error:
        raise InvalidInput(f"invalid JSON in {path}: {error}") from error
    if not isinstance(value, dict):
        raise InvalidInput(f"top-level JSON in {path} must be an object")
    if _has_audio_reference(value):
        raise InvalidInput(f"audio filename or reference is forbidden in {path}")
    return value


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--m1", type=Path)
    parser.add_argument("--m2", type=Path)
    parser.add_argument("--m3", type=Path)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args(argv)
    sources = [("m1", args.m1, report_m1), ("m2", args.m2, report_m2), ("m3", args.m3, report_m3)]
    selected = [(name, path, function) for name, path, function in sources if path is not None]
    if not selected:
        print("FAIL: supply at least one of --m1, --m2, or --m3")
        return 2
    try:
        reports = [function(_load_json(path)) for _, path, function in selected]
        result = {"reports": reports}
        output = json.dumps(result, indent=2, allow_nan=False) + "\n"
        if args.out is not None:
            try:
                args.out.write_text(output, encoding="utf-8")
            except OSError as error:
                print(f"NOT RUN: cannot write report {args.out}: {error}")
                return 3
        print(output, end="")
        return 0
    except FileNotFoundError as error:
        print(f"NOT RUN: {error}")
        return 3
    except (InvalidInput, OSError) as error:
        print(f"FAIL: {error}")
        return 2


if __name__ == "__main__":
    sys.exit(main())
