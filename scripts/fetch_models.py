"""Verify and install the registered YAMNet model and its class map.

The caller supplies both sources. This module contains no default download URL,
model weights, audio or third-party runtime dependency.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import importlib
import io
import math
import os
from pathlib import Path
import re
import sys
import tempfile
import urllib.request
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / "docs" / "MODEL-LICENCES.md"
DEFAULT_DEST = ROOT / "app" / "android" / "app" / "src" / "main" / "assets" / "models"
DETECTOR_LABELS = ("Screaming", "Shout", "Yell", "Glass", "Shatter", "Breaking")
SHA256_HEX = re.compile(r"[0-9a-f]{64}\Z")


class RegisterError(ValueError):
    """The model register cannot identify one valid YAMNet digest."""


class DigestMismatch(ValueError):
    def __init__(self, observed: str, expected: str):
        self.observed = observed
        self.expected = expected
        super().__init__(f"model sha256 mismatch: observed {observed}; expected {expected}")


class ClassMapError(ValueError):
    """A class map is malformed or misses one of the required exact labels."""


class InputShapeError(ValueError):
    """The interpreter input does not match the VIGIL audio contract."""


class PrerequisiteMissing(RuntimeError):
    """A supplied source or optional interpreter cannot be used yet."""


def registered_sha256(register_text: str) -> str:
    """Extract a single lowercase model digest from the YAMNet register row."""
    matches = []
    for line in register_text.splitlines():
        cells = [part.strip() for part in line.split("|")]
        if len(cells) > 4 and cells[1] in ("M1", "**M1**") and cells[2] == "YAMNet TFLite":
            digests = [value for value in re.findall(r"`([^`]+)`", cells[4])
                       if value != "FACT"]
            if len(digests) != 1 or SHA256_HEX.fullmatch(digests[0]) is None:
                raise RegisterError("YAMNet TFLite row needs exactly one lowercase 64-hex sha256")
            matches.append(digests[0])
    if len(matches) != 1:
        raise RegisterError(f"expected one YAMNet TFLite row; found {len(matches)}")
    return matches[0]


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_file(path: str | Path, expected_sha256: str) -> str:
    """Return the observed sha256 or raise with both observed and expected."""
    observed = _sha256_file(Path(path))
    if observed != expected_sha256:
        raise DigestMismatch(observed, expected_sha256)
    return observed


def install_verified(src_bytes_or_path: bytes | str | Path,
                     dest_path: str | Path, expected_sha256: str) -> str:
    """Atomically replace dest only after the temporary file matches its digest."""
    destination = Path(dest_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary_name = tempfile.mkstemp(prefix=f".{destination.name}.",
                                         suffix=".tmp", dir=destination.parent)
    temporary = Path(temporary_name)
    try:
        with os.fdopen(fd, "wb") as out:
            if isinstance(src_bytes_or_path, bytes):
                out.write(src_bytes_or_path)
            else:
                with Path(src_bytes_or_path).open("rb") as source:
                    for chunk in iter(lambda: source.read(1024 * 1024), b""):
                        out.write(chunk)
            out.flush()
            os.fsync(out.fileno())
        observed = verify_file(temporary, expected_sha256)
        os.replace(temporary, destination)
        return observed
    finally:
        temporary.unlink(missing_ok=True)


def class_indices_by_label(csv_text: str,
                           labels: tuple[str, ...] = DETECTOR_LABELS) -> dict[str, int]:
    """Map exact display names without trusting row order or recorded indices."""
    reader = csv.reader(io.StringIO(csv_text, newline=""), strict=True)
    try:
        header = next(reader)
    except (StopIteration, csv.Error) as error:
        raise ClassMapError("missing class-map header") from error
    if header != ["index", "mid", "display_name"]:
        raise ClassMapError("class-map header must be index,mid,display_name")
    by_name: dict[str, int] = {}
    seen_indices: set[int] = set()
    try:
        for row in reader:
            if len(row) != 3 or re.fullmatch(r"(?:0|[1-9][0-9]*)", row[0]) is None:
                raise ClassMapError("class-map row needs a non-negative integer index and three cells")
            index = int(row[0])
            if index in seen_indices:
                raise ClassMapError(f"duplicate class-map index: {index}")
            if row[2] in by_name:
                raise ClassMapError(f"duplicate class-map label: {row[2]}")
            seen_indices.add(index)
            by_name[row[2]] = index
    except csv.Error as error:
        raise ClassMapError(f"invalid class-map CSV: {error}") from error
    missing = [label for label in labels if label not in by_name]
    if missing:
        raise ClassMapError(f"missing exact display name(s): {', '.join(missing)}")
    return {label: by_name[label] for label in labels}


def assert_input_details(details: list[dict]) -> None:
    """Accept one float32 tensor with 15,600 samples and optional batch axis."""
    if len(details) != 1:
        raise InputShapeError(f"expected one input tensor; found {len(details)}")
    tensor = details[0]
    dtype = tensor.get("dtype")
    dtype_name = dtype if isinstance(dtype, str) else getattr(dtype, "__name__", None)
    shape = tensor.get("shape")
    if dtype_name != "float32" or shape is None or list(shape) not in ([15600], [1, 15600]):
        raise InputShapeError(f"expected float32 [15600] or [1, 15600]; got {dtype_name} {shape}")


def score_to_bp(score: float) -> int:
    """Convert a unit-interval score to integer basis points, half up."""
    if isinstance(score, bool) or not isinstance(score, (int, float)) or \
            not math.isfinite(score) or not 0 <= score <= 1:
        raise ValueError("score must be finite and within [0, 1]")
    return math.floor(score * 10000 + 0.5)


def _make_https_opener() -> urllib.request.OpenerDirector:
    """Build an opener that cannot handle file:// or ftp:// sources."""
    opener = urllib.request.OpenerDirector()
    for handler in (
        urllib.request.HTTPSHandler(),
        urllib.request.HTTPRedirectHandler(),
        urllib.request.HTTPDefaultErrorHandler(),
        urllib.request.HTTPErrorProcessor(),
        urllib.request.UnknownHandler(),
    ):
        opener.add_handler(handler)
    return opener


def _read_source(file_path: str | None, url: str | None, maximum_bytes: int) -> bytes:
    if file_path is not None:
        source = Path(file_path)
        if not source.is_file():
            raise PrerequisiteMissing(f"source file unavailable: {source}")
        if source.stat().st_size > maximum_bytes:
            raise PrerequisiteMissing("source exceeds maximum permitted size")
        return source.read_bytes()
    if url is None or urlsplit(url).scheme != "https":
        raise PrerequisiteMissing("supply an HTTPS URL or an existing local file")
    try:
        with _make_https_opener().open(url, timeout=30) as response:
            data = response.read(maximum_bytes + 1)
    except OSError as error:
        raise PrerequisiteMissing(f"source download unavailable: {type(error).__name__}") from error
    if len(data) > maximum_bytes:
        raise PrerequisiteMissing("source exceeds maximum permitted size")
    return data


def _check_interpreter(model_path: Path) -> None:
    try:
        module = importlib.import_module("ai_edge_litert.interpreter")
    except ImportError as error:
        raise PrerequisiteMissing("ai_edge_litert is unavailable; interpreter check NOT RUN") from error
    try:
        interpreter = module.Interpreter(model_path=str(model_path))
        interpreter.allocate_tensors()
        assert_input_details(interpreter.get_input_details())
    except InputShapeError:
        raise
    except (AttributeError, OSError, RuntimeError, ValueError) as error:
        raise PrerequisiteMissing(f"interpreter check unavailable: {type(error).__name__}") from error


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    model_source = parser.add_mutually_exclusive_group(required=True)
    model_source.add_argument("--model-file")
    model_source.add_argument("--model-url")
    map_source = parser.add_mutually_exclusive_group(required=True)
    map_source.add_argument("--class-map-file")
    map_source.add_argument("--class-map-url")
    parser.add_argument("--dest", type=Path, default=DEFAULT_DEST)
    parser.add_argument("--check-interpreter", action="store_true")
    args = parser.parse_args(argv)

    try:
        expected = registered_sha256(REGISTER.read_text(encoding="utf-8"))
        model_bytes = _read_source(args.model_file, args.model_url, 64 * 1024 * 1024)
        observed = hashlib.sha256(model_bytes).hexdigest()
        print(f"model sha256 observed: {observed}")
        if observed != expected:
            raise DigestMismatch(observed, expected)
        class_map_bytes = _read_source(args.class_map_file, args.class_map_url, 2 * 1024 * 1024)
        class_map_sha = hashlib.sha256(class_map_bytes).hexdigest()
        class_map = class_indices_by_label(class_map_bytes.decode("utf-8"))
        model_path = args.dest / "yamnet.tflite"
        install_verified(model_bytes, model_path, expected)
        install_verified(class_map_bytes, args.dest / "yamnet_class_map.csv", class_map_sha)
        print(f"class-map sha256 observed: {class_map_sha}")
        print(f"model source: {args.model_file or args.model_url}")
        print(f"class-map source: {args.class_map_file or args.class_map_url}")
        for label, index in class_map.items():
            print(f"{label}: {index}")
        if args.check_interpreter:
            _check_interpreter(model_path)
            print("interpreter input: PASS")
        return 0
    except PrerequisiteMissing as error:
        print(f"NOT RUN: {error}")
        return 3
    except (RegisterError, DigestMismatch, ClassMapError, InputShapeError,
            UnicodeDecodeError) as error:
        print(f"FAIL: {error}")
        return 2


if __name__ == "__main__":
    sys.exit(main())
