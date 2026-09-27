"""Offline tests for the P7a report instrument; all inputs are sim_ fixtures."""

import contextlib
import io
import json
import math
import socket
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import eval_yamnet as subject


SIM_SHA = "a" * 64


def m1_fixture(scores=None, threshold=6000):
    scores = scores if scores is not None else [7000] * 8 + [2000] * 2
    return {
        "config": {
            "model_sha256": SIM_SHA,
            "threshold_bp": threshold,
            "class": "Screaming",
            "dataset": "sim_dataset",
            "dataset_version": "sim_v1",
        },
        "clips": [
            {"clip_id": f"sim_clip_{i:04d}", "licence": "CC-BY-4.0", "score_bp": score}
            for i, score in enumerate(scores)
        ],
    }


def m2_fixture(runs=None, refractory=10):
    if runs is None:
        runs = [{"run_id": "sim_r1", "armed_seconds": 1800,
                 "consent_recorded": True, "alarm_times_s": [12.0, 14.5, 400.0]}]
    return {"config": {"model_sha256": SIM_SHA, "threshold_bp": 6000,
                       "refractory_s": refractory}, "runs": runs}


def m3_fixture(latencies=None, lost=0, offset=0, uncertainty=0):
    if latencies is None:
        latencies = list(range(1, 31))
    attempts = []
    for i in range(len(latencies)):
        detected = 1000 + i * 100
        displayed = None if i < lost else detected + latencies[i] + offset
        attempts.append({"attempt_id": f"sim_a{i:03d}", "detected_at_ms": detected,
                         "displayed_at_ms": displayed})
    return {"config": {"clock_offset_ms": offset,
                       "clock_uncertainty_ms": uncertainty,
                       "network": "sim_wifi"}, "attempts": attempts}


class OfflineInstrumentTests(unittest.TestCase):
    def setUp(self):
        self.socket_guard = patch.object(socket, "socket", side_effect=AssertionError("network forbidden"))
        self.socket_guard.start()
        self.addCleanup(self.socket_guard.stop)

    def invoke(self, data, measure):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / f"{measure}.json"
            destination = Path(directory) / "report.json"
            source.write_text(json.dumps(data, allow_nan=True), encoding="utf-8")
            stdout = io.StringIO()
            with contextlib.redirect_stdout(stdout):
                code = subject.main([f"--{measure}", str(source), "--out", str(destination)])
            report = json.loads(destination.read_text(encoding="utf-8")) if destination.exists() else None
            return code, report, stdout.getvalue()

    def assert_invalid(self, data, measure):
        code, report, output = self.invoke(data, measure)
        self.assertEqual(code, 2, output)
        self.assertIsNone(report)

    def test_e1_m1_hand_oracle_8_of_10_wilson_interval(self):
        code, report, _ = self.invoke(m1_fixture(), "m1")
        m1 = report["reports"][0]
        self.assertEqual(code, 0)
        self.assertEqual(m1["status"], "computed_unverified")
        self.assertEqual((m1["numerator"], m1["denominator"], m1["n"]), (8, 10, 10))
        self.assertEqual(m1["wilson_95"], [0.4902, 0.9433])

    def test_e2_m1_zero_and_all_success_wilson_hand_oracle(self):
        _, zero, _ = self.invoke(m1_fixture([0] * 10), "m1")
        _, all_success, _ = self.invoke(m1_fixture([10000] * 10), "m1")
        self.assertEqual(zero["reports"][0]["wilson_95"], [0.0, 0.2775])
        self.assertEqual(all_success["reports"][0]["wilson_95"], [0.7225, 1.0])

    def test_e3_m1_exact_threshold_counts_as_detected(self):
        _, report, _ = self.invoke(m1_fixture([6000], threshold=6000), "m1")
        self.assertEqual(report["reports"][0]["numerator"], 1)

    def test_e4_m1_empty_clip_list_is_not_measured(self):
        code, report, _ = self.invoke(m1_fixture([]), "m1")
        self.assertEqual(code, 0)
        self.assertEqual(report["reports"][0]["status"], "not_measured")

    def test_e5_threshold_must_be_integer_basis_points_in_range(self):
        for bad in (0.6, "6000", True, 10001, -1):
            with self.subTest(threshold=bad):
                fixture = m1_fixture([6000])
                fixture["config"]["threshold_bp"] = bad
                self.assert_invalid(fixture, "m1")

    def test_e6_m1_clip_identity_and_licence_are_required_unique(self):
        duplicate = m1_fixture([1, 2])
        duplicate["clips"][1]["clip_id"] = duplicate["clips"][0]["clip_id"]
        empty_license = m1_fixture([1])
        empty_license["clips"][0]["licence"] = ""
        missing_id = m1_fixture([1])
        del missing_id["clips"][0]["clip_id"]
        for fixture in (duplicate, empty_license, missing_id):
            with self.subTest(fixture=fixture):
                self.assert_invalid(fixture, "m1")

    def test_f2_m1_reports_only_below_threshold_ids_in_input_order(self):
        _, report, _ = self.invoke(m1_fixture(), "m1")
        self.assertEqual(report["reports"][0]["missed_clip_ids"],
                         ["sim_clip_0008", "sim_clip_0009"])

    def test_e7_m2_refractory_merges_events_and_rate_matches_hand_oracle(self):
        code, report, _ = self.invoke(m2_fixture(), "m2")
        m2 = report["reports"][0]
        self.assertEqual(code, 0)
        self.assertEqual(m2["status"], "computed_unverified")
        self.assertEqual((m2["raw"], m2["counted"], m2["armed_seconds_total"]), (3, 2, 1800))
        self.assertEqual(m2["false_alarms_per_hour"], 4.0)

    def test_f1_m2_rejects_alarm_after_armed_window_but_accepts_endpoint(self):
        outside = m2_fixture([{"run_id": "sim_r1", "armed_seconds": 300,
                               "consent_recorded": True, "alarm_times_s": [300.01]}])
        self.assert_invalid(outside, "m2")
        endpoint = m2_fixture([{"run_id": "sim_r1", "armed_seconds": 300,
                                "consent_recorded": True, "alarm_times_s": [300.0]}])
        code, report, _ = self.invoke(endpoint, "m2")
        self.assertEqual(code, 0)
        self.assertEqual(report["reports"][0]["counted"], 1)

    def test_e8_m2_alarm_at_refractory_boundary_counts(self):
        fixture = m2_fixture([{"run_id": "sim_r1", "armed_seconds": 3600,
                               "consent_recorded": True, "alarm_times_s": [0.0, 10.0]}])
        _, report, _ = self.invoke(fixture, "m2")
        self.assertEqual(report["reports"][0]["counted"], 2)

    def test_e9_m2_combines_run_exposure(self):
        runs = [{"run_id": f"sim_r{i}", "armed_seconds": 1800,
                 "consent_recorded": True, "alarm_times_s": [float(i)]} for i in range(2)]
        _, report, _ = self.invoke(m2_fixture(runs), "m2")
        m2 = report["reports"][0]
        self.assertEqual((m2["counted"], m2["run_count"], m2["armed_seconds_total"]), (2, 2, 3600))
        self.assertEqual(m2["false_alarms_per_hour"], 2.0)

    def test_e10_m2_requires_consent_and_positive_exposure(self):
        for run in ({"run_id": "sim_r1", "armed_seconds": 20, "consent_recorded": False,
                     "alarm_times_s": []},
                    {"run_id": "sim_r1", "armed_seconds": 20, "alarm_times_s": []}):
            self.assert_invalid(m2_fixture([run]), "m2")
        _, report, _ = self.invoke(m2_fixture([{"run_id": "sim_r1", "armed_seconds": 0,
                                                "consent_recorded": True, "alarm_times_s": []}]), "m2")
        self.assertEqual(report["reports"][0]["status"], "not_measured")
        self.assert_invalid(m2_fixture([{"run_id": "sim_r1", "armed_seconds": -1,
                                         "consent_recorded": True, "alarm_times_s": []}]), "m2")

    def test_e11_m3_29_attempts_has_no_latency_statistics(self):
        _, report, _ = self.invoke(m3_fixture(list(range(1, 30))), "m3")
        m3 = report["reports"][0]
        self.assertEqual((m3["status"], m3["n"], m3["delivered"]),
                         ("insufficient_n", 29, 29))
        self.assertNotIn("median_ms", m3)
        self.assertNotIn("p95_ms", m3)

    def test_e12_m3_30_latency_values_nearest_rank_hand_oracle(self):
        _, report, _ = self.invoke(m3_fixture(), "m3")
        m3 = report["reports"][0]
        self.assertEqual((m3["median_ms"], m3["p95_ms"], m3["min_ms"], m3["max_ms"],
                          m3["lost"], m3["delivered"]),
                         (15.5, 29, 1, 30, 0, 30))

    def test_e13_m3_30_attempts_with_27_delivered_is_insufficient(self):
        _, report, _ = self.invoke(m3_fixture(list(range(1, 31)), lost=3), "m3")
        m3 = report["reports"][0]
        self.assertEqual((m3["status"], m3["reason"], m3["n"], m3["lost"],
                          m3["delivered"], m3["denominator"]),
                         ("insufficient_n", "fewer than 30 delivered attempts", 30, 3, 27, 30))
        for key in ("median_ms", "p95_ms", "min_ms", "max_ms"):
            self.assertNotIn(key, m3)

    def test_m3_40_attempts_with_30_delivered_reports_delivered_percentiles(self):
        _, report, _ = self.invoke(m3_fixture(list(range(1, 41)), lost=10), "m3")
        m3 = report["reports"][0]
        self.assertEqual((m3["n"], m3["lost"], m3["delivered"], m3["denominator"]),
                         (40, 10, 30, 40))
        self.assertEqual((m3["median_ms"], m3["p95_ms"], m3["min_ms"], m3["max_ms"]),
                         (25.5, 39, 11, 40))

    def test_m3_30_attempts_with_29_delivered_is_insufficient(self):
        _, report, _ = self.invoke(m3_fixture(list(range(1, 31)), lost=1), "m3")
        m3 = report["reports"][0]
        self.assertEqual((m3["status"], m3["reason"], m3["n"], m3["lost"], m3["delivered"]),
                         ("insufficient_n", "fewer than 30 delivered attempts", 30, 1, 29))
        for key in ("median_ms", "p95_ms", "min_ms", "max_ms"):
            self.assertNotIn(key, m3)

    def test_p7b_m3_negative_adjusted_latency_suppresses_all_percentiles(self):
        _, report, _ = self.invoke(m3_fixture([-5] + list(range(1, 30)), offset=0), "m3")
        m3 = report["reports"][0]
        self.assertEqual(m3["status"], "invalid_clock")
        self.assertEqual(m3["reason"], "negative adjusted latency")
        self.assertEqual(m3["clock_suspect"], 1)
        for key in ("median_ms", "p95_ms", "min_ms", "max_ms"):
            self.assertNotIn(key, m3)

    def test_p7b_m3_clean_deliveries_still_report_percentiles(self):
        _, report, _ = self.invoke(m3_fixture(list(range(1, 31))), "m3")
        m3 = report["reports"][0]
        self.assertEqual(m3["status"], "computed_unverified")
        self.assertEqual((m3["median_ms"], m3["p95_ms"], m3["min_ms"], m3["max_ms"]),
                         (15.5, 29, 1, 30))

    def test_e15_m3_requires_clock_offset_and_uncertainty(self):
        for missing in ("clock_offset_ms", "clock_uncertainty_ms"):
            fixture = m3_fixture()
            del fixture["config"][missing]
            self.assert_invalid(fixture, "m3")

    def test_e16_each_report_exposes_config_method_and_count_fields(self):
        for measurement, fixture in (("m1", m1_fixture()), ("m2", m2_fixture()),
                                     ("m3", m3_fixture())):
            with self.subTest(measure=measurement):
                _, report, _ = self.invoke(fixture, measurement)
                item = report["reports"][0]
                self.assertIn("config", item)
                self.assertIn("method", item)
                self.assertIn("n", item)
                self.assertIn("numerator", item)
                self.assertIn("denominator", item)

    def test_e17_audio_filename_or_extension_anywhere_is_rejected(self):
        for data in (m1_fixture(), m2_fixture(), m3_fixture()):
            for suffix in (".wav", ".mp3", ".flac", ".ogg"):
                poisoned = json.loads(json.dumps(data))
                poisoned["audio"] = f"sim_recording{suffix}"
                measure = "m1" if "clips" in poisoned else "m2" if "runs" in poisoned else "m3"
                with self.subTest(suffix=suffix, measure=measure):
                    self.assert_invalid(poisoned, measure)
                poisoned = json.loads(json.dumps(data))
                poisoned[f"sim_recording{suffix}"] = "not audio bytes"
                with self.subTest(suffix=suffix, measure=measure, key=True):
                    self.assert_invalid(poisoned, measure)

    def test_f3_audio_guard_rejects_additional_common_suffixes(self):
        for suffix in (".m4a", ".aac", ".opus", ".wma", ".aiff", ".amr"):
            fixture = m1_fixture([7000])
            fixture["config"]["class"] = f"sim_label{suffix}"
            with self.subTest(suffix=suffix):
                self.assert_invalid(fixture, "m1")

    def test_e18_whole_suite_forbids_socket_network_use(self):
        with self.assertRaises(AssertionError):
            socket.socket()

    def test_unknown_fields_wrong_types_and_nonfinite_numbers_fail(self):
        unknown = m1_fixture([1])
        unknown["unexpected"] = 1
        self.assert_invalid(unknown, "m1")
        wrong_bool = m2_fixture([{"run_id": "sim_r1", "armed_seconds": True,
                                  "consent_recorded": True, "alarm_times_s": []}])
        self.assert_invalid(wrong_bool, "m2")
        for nonfinite in (math.nan, math.inf, -math.inf):
            fixture = m2_fixture([{"run_id": "sim_r1", "armed_seconds": 10,
                                   "consent_recorded": True, "alarm_times_s": [nonfinite]}])
            self.assert_invalid(fixture, "m2")

    def test_unreadable_input_returns_exit_three(self):
        stdout = io.StringIO()
        with tempfile.TemporaryDirectory() as directory:
            missing = Path(directory) / "missing.json"
            with contextlib.redirect_stdout(stdout):
                code = subject.main(["--m1", str(missing)])
        self.assertEqual(code, 3)
        self.assertIn("NOT RUN", stdout.getvalue())

    def test_invalid_utf8_input_returns_exit_two(self):
        stdout = io.StringIO()
        with tempfile.TemporaryDirectory() as directory:
            invalid = Path(directory) / "invalid.json"
            invalid.write_bytes(b"\xff")
            with contextlib.redirect_stdout(stdout):
                code = subject.main(["--m1", str(invalid)])
        self.assertEqual(code, 2)
        self.assertIn("FAIL", stdout.getvalue())


if __name__ == "__main__":
    unittest.main()
