#!/usr/bin/env python3
"""Generate a new ANCHOR server Ed25519 signing key.

Writes the PRIVATE key (base64 of the raw 32 bytes, the exact value the
App Service setting VUKA_SERVER_ED25519_KEY_B64 takes) to a file outside the
repository, and prints only the PUBLIC key (base64 DER SubjectPublicKeyInfo,
the value contracts/keys/manifest.json pins as server_ed25519_public_key).

The private key is never printed. Keep a copy in a password manager, set it
in Azure yourself, then delete the file. Never commit it or paste it anywhere.

Usage: python scripts/new-server-signing-key.py [--out PATH]
"""
from __future__ import annotations

import argparse
import base64
import os
import sys
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, NoEncryption, PrivateFormat, PublicFormat

REPO = Path(__file__).resolve().parents[1]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out", type=Path, default=Path.home() / "vuka-server-ed25519.key",
                        help="where to write the private key (default: your home folder)")
    args = parser.parse_args(argv)
    out = args.out.expanduser().resolve()
    if REPO in out.parents or out == REPO:
        print(f"refused: {out} is inside the repository; the private key must never be near git", file=sys.stderr)
        return 2
    if out.exists():
        print(f"refused: {out} already exists; move it aside first so no key is overwritten", file=sys.stderr)
        return 2

    key = Ed25519PrivateKey.generate()
    private_b64 = base64.b64encode(key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())).decode("ascii")
    public_b64 = base64.b64encode(
        key.public_key().public_bytes(Encoding.DER, PublicFormat.SubjectPublicKeyInfo)).decode("ascii")

    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    with os.fdopen(os.open(out, flags, 0o600), "w", encoding="ascii") as handle:
        handle.write(private_b64)

    print(f"Private key written to: {out}  (not shown; never share it)")
    print("PUBLIC key (safe to share, goes into contracts/keys/manifest.json):")
    print(public_b64)
    return 0


if __name__ == "__main__":
    sys.exit(main())
