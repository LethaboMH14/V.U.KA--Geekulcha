"""Put the registered YAMNet model into the native app's assets, or refuse.

For the za.co.vuka.app build (app/src/main). The model is never committed
(*.tflite is gitignored). This downloads it from Google's TF Hub listing (or
takes a local copy), checks its sha256 against the model register
(docs/MODEL-LICENCES.md row M1) using scripts/fetch_models.py, and only then
writes it atomically. The app reads the class labels from the zip embedded in
the verified model itself, so no separate class map is needed (M7 is still
pending in the register).

Usage:
    python scripts/fetch_yamnet_app.py
    python scripts/fetch_yamnet_app.py --model-file path/to/yamnet.tflite
"""

from __future__ import annotations

import argparse
import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_models import (  # noqa: E402
    REGISTER, DigestMismatch, RegisterError, _read_source, install_verified, registered_sha256,
)

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "app" / "src" / "main" / "assets" / "models" / "yamnet.tflite"
URL = "https://tfhub.dev/google/lite-model/yamnet/classification/tflite/1?lite-format=tflite"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--model-file", help="verify and install a local copy instead of downloading")
    args = parser.parse_args(argv)
    try:
        expected = registered_sha256(REGISTER.read_text(encoding="utf-8"))
        data = _read_source(args.model_file, None if args.model_file else URL, 64 * 1024 * 1024)
        observed = hashlib.sha256(data).hexdigest()
        print(f"model sha256 observed: {observed}")
        if observed != expected:
            raise DigestMismatch(observed, expected)
        install_verified(data, DEST, expected)
        print(f"installed: {DEST.relative_to(ROOT)}")
        return 0
    except (RegisterError, DigestMismatch) as error:
        print(f"FAIL: {error}")
        return 2


if __name__ == "__main__":
    sys.exit(main())
