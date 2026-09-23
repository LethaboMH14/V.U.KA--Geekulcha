"""Offline acceptance tests for the P3.V2 YAMNet provenance gate.

All generated content is synthetic; no audio, downloaded weights or network
service is needed to run this suite.
"""

from __future__ import annotations

import contextlib
import hashlib
import io
from pathlib import Path
import socket
import sys
import tempfile
import unittest
from unittest import mock


sys.path.insert(0, str(Path(__file__).parents[1]))
import fetch_models as subject  # noqa: E402


ROOT = Path(__file__).parents[2]
EXPECTED = "10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de"
LABELS = ("Screaming", "Shout", "Yell", "Glass", "Shatter", "Breaking")


def sim_map(indices=(31, 32, 33, 34, 35, 36)):
    return "index,mid,display_name\n" + "".join(
        f"{index},/sim_{name.lower()},{name}\n" for index, name in zip(indices, LABELS)
    )


class OfflineTests(unittest.TestCase):
    def setUp(self):
        no_socket = mock.patch.object(socket, "socket", side_effect=AssertionError("network use in unit test"))
        no_socket.start()
        self.addCleanup(no_socket.stop)

    def test_u1_single_register_row(self):
        text = f"| M1 | YAMNet TFLite | v | `{EXPECTED}` FACT | Apache-2.0 |\n"
        self.assertEqual(subject.registered_sha256(text), EXPECTED)

    def test_u2_reject_missing_duplicate_and_malformed_digest(self):
        row = f"| M1 | YAMNet TFLite | v | `{EXPECTED}` | Apache-2.0 |"
        cases = ("", row + "\n" + row, row.replace(EXPECTED, EXPECTED[:-1]),
                 row.replace(EXPECTED, "A" + EXPECTED[1:]),
                 row.replace(EXPECTED, "g" + EXPECTED[1:]))
        for text in cases:
            with self.subTest(text=text), self.assertRaises(subject.RegisterError):
                subject.registered_sha256(text)

    def test_u3_real_register_digest(self):
        actual = (ROOT / "docs" / "MODEL-LICENCES.md").read_text(encoding="utf-8")
        self.assertEqual(subject.registered_sha256(actual), EXPECTED)

    def test_u4_u5_verify_file_and_report_observed_digest(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sim_model.tflite"
            path.write_bytes(b"sim_model")
            expected = hashlib.sha256(b"sim_model").hexdigest()
            self.assertEqual(subject.verify_file(path, expected), expected)
            path.write_bytes(b"sim_modem")
            observed = hashlib.sha256(b"sim_modem").hexdigest()
            with self.assertRaises(subject.DigestMismatch) as caught:
                subject.verify_file(path, expected)
            self.assertIn(observed, str(caught.exception))
            self.assertIn(expected, str(caught.exception))
            self.assertEqual(caught.exception.observed, observed)

    def test_u6_bad_install_preserves_existing_destination(self):
        with tempfile.TemporaryDirectory() as directory:
            dest = Path(directory) / "yamnet.tflite"
            dest.write_bytes(b"sim_existing_good")
            before = hashlib.sha256(dest.read_bytes()).hexdigest()
            with self.assertRaises(subject.DigestMismatch):
                subject.install_verified(b"sim_bad", dest, before)
            self.assertEqual(hashlib.sha256(dest.read_bytes()).hexdigest(), before)
            self.assertEqual([p.name for p in Path(directory).iterdir()], [dest.name])

    def test_u7_bad_install_never_creates_destination(self):
        with tempfile.TemporaryDirectory() as directory:
            dest = Path(directory) / "yamnet.tflite"
            with self.assertRaises(subject.DigestMismatch):
                subject.install_verified(b"sim_bad", dest, "0" * 64)
            self.assertFalse(dest.exists())
            self.assertEqual(list(Path(directory).iterdir()), [])

    def test_u8_shuffled_rows_and_nonstandard_indices(self):
        rows = sim_map((101, 203, 305, 407, 509, 611)).splitlines()
        shuffled = "\n".join([rows[0], *reversed(rows[1:])]) + "\n"
        self.assertEqual(subject.class_indices_by_label(shuffled),
                         dict(zip(LABELS, (101, 203, 305, 407, 509, 611))))

    def test_u9_u10_u11_missing_duplicated_and_partial_labels(self):
        fixture = sim_map()
        cases = (fixture.replace("33,/sim_yell,Yell\n", "")
                 .replace("31,/sim_screaming,Screaming\n", ""),
                 fixture + "50,/sim_glass_2,Glass\n",
                 fixture.replace("34,/sim_glass,Glass\n", "34,/sim_wine,Wine glass\n")
                 + "50,/sim_glass_breaking,Glass breaking\n")
        for text in cases:
            with self.subTest(text=text), self.assertRaises(subject.ClassMapError):
                subject.class_indices_by_label(text)

    def test_u12_reject_bad_header_index_and_duplicate_index(self):
        fixture = sim_map()
        cases = (fixture.replace("index,mid,display_name", "mid,index,display_name"),
                 fixture.replace("34,/sim_glass,Glass", "not_an_int,/sim_glass,Glass"),
                 fixture.replace("34,/sim_glass,Glass", "33,/sim_glass,Glass"))
        for text in cases:
            with self.subTest(text=text), self.assertRaises(subject.ClassMapError):
                subject.class_indices_by_label(text)

    def test_u13_predecessor_indices_are_not_hidden_constants(self):
        actual = subject.class_indices_by_label(sim_map((427, 395, 195, 39, 708, 709)))
        self.assertEqual(actual["Screaming"], 427)
        self.assertEqual(actual["Glass"], 39)
        self.assertNotEqual(actual, {"Shout": 6, "Yell": 9, "Screaming": 11,
                                     "Glass": 435, "Shatter": 437, "Breaking": 464})

    def test_u14_valid_interpreter_input_details(self):
        for shape in ([15600], [1, 15600]):
            with self.subTest(shape=shape):
                self.assertIsNone(subject.assert_input_details([{"shape": shape, "dtype": "float32"}]))

    def test_u15_invalid_interpreter_input_details(self):
        cases = ([{"shape": [1, 16000], "dtype": "float32"}],
                 [{"shape": [15600, 1, 1], "dtype": "float16"}],
                 [{"shape": [15600], "dtype": "int8"}],
                 [{"shape": [15600], "dtype": "float32"}] * 2,
                 [])
        for details in cases:
            with self.subTest(details=details), self.assertRaises(subject.InputShapeError):
                subject.assert_input_details(details)

    def test_u16_basis_point_rounding(self):
        for score, expected in ((0, 0), (1, 10000), (0.12345, 1235),
                                (0.99994, 9999), (0.99995, 10000)):
            with self.subTest(score=score):
                self.assertEqual(subject.score_to_bp(score), expected)

    def test_u17_invalid_scores(self):
        for score in (-0.0001, 1.0001, float("nan"), float("inf"), True):
            with self.subTest(score=score), self.assertRaises(ValueError):
                subject.score_to_bp(score)

    def test_u18_cli_mismatch_leaves_no_destination(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            model = root / "sim_bad.tflite"
            class_map = root / "sim_map.csv"
            model.write_bytes(b"sim_not_registered_model")
            class_map.write_text(sim_map(), encoding="utf-8")
            dest = root / "assets"
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                status = subject.main(["--model-file", str(model),
                                       "--class-map-file", str(class_map),
                                       "--dest", str(dest)])
            self.assertEqual(status, 2)
            self.assertFalse((dest / "yamnet.tflite").exists())
            self.assertIn(hashlib.sha256(model.read_bytes()).hexdigest(), output.getvalue())

    def test_u19_cli_missing_interpreter_is_not_run(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            model = root / "sim_model.tflite"
            class_map = root / "sim_map.csv"
            model.write_bytes(b"sim_model")
            class_map.write_text(sim_map(), encoding="utf-8")
            output = io.StringIO()
            with mock.patch.object(subject, "registered_sha256", return_value=hashlib.sha256(b"sim_model").hexdigest()), \
                 mock.patch("importlib.import_module", side_effect=ImportError("sim_missing_interpreter")), \
                 contextlib.redirect_stdout(output):
                status = subject.main(["--model-file", str(model),
                                       "--class-map-file", str(class_map),
                                       "--dest", str(root / "assets"),
                                       "--check-interpreter"])
            self.assertEqual(status, 3)
            self.assertIn("NOT RUN", output.getvalue())


if __name__ == "__main__":
    unittest.main()
