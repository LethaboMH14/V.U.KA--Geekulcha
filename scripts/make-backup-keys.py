"""Makes the secrets a backup ANCHOR server needs, once, into .env.backup.

  python scripts/make-backup-keys.py            # writes .env.backup (refuses to overwrite)
  python scripts/make-backup-keys.py --print    # also prints the values to paste into a
                                                # host's dashboard (Render, Koyeb…)

It creates:
  VUKA_PAYLOAD_KEY_B64         AES-256 key for payloads and account fields
  VUKA_SERVER_ED25519_KEY_B64  this server's own signing key (private; keep it secret)
  VUKA_BACKUP_MANIFEST_JSON    the key manifest pinning that key's public half
  POSTGRES_PASSWORD            for docker-compose's database

A backup server is NOT the team's official server: it has its own key and its
own database, and its records are separate. .env.backup is gitignored; never
commit it or paste it into chat.
"""
import argparse
import base64
import json
import os
import secrets
import sys
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, NoEncryption, PrivateFormat, PublicFormat

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".env.backup"
TEMPLATE = ROOT / ".env.backup.example"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--print", action="store_true", help="also print the generated values")
    args = parser.parse_args()
    if OUT.exists():
        print(f"{OUT.name} already exists; not overwriting (delete it first to make new keys)")
        return 1

    key = Ed25519PrivateKey.generate()
    manifest = json.loads((ROOT / "contracts/keys/manifest.json").read_text(encoding="utf8"))
    manifest["server_ed25519_public_key"] = base64.b64encode(
        key.public_key().public_bytes(Encoding.DER, PublicFormat.SubjectPublicKeyInfo)).decode()
    values = {
        "VUKA_PAYLOAD_KEY_B64": base64.b64encode(os.urandom(32)).decode(),
        "VUKA_SERVER_ED25519_KEY_B64": base64.b64encode(key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())).decode(),
        "VUKA_BACKUP_MANIFEST_JSON": json.dumps(manifest, separators=(",", ":")),
        "POSTGRES_PASSWORD": secrets.token_urlsafe(24),
    }

    lines = []
    for line in TEMPLATE.read_text(encoding="utf8").splitlines():
        name = line.split("=", 1)[0].strip()
        if name in values and not line.lstrip().startswith("#"):
            v = values[name]
            line = f"{name}='{v}'" if name == "VUKA_BACKUP_MANIFEST_JSON" else f"{name}={v}"
        lines.append(line)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf8")
    try:
        os.chmod(OUT, 0o600)
    except OSError:
        pass
    print(f"wrote {OUT.name} (gitignored). Fill in the email/SMS settings there.")
    if args.print:
        print("\nPaste these into your host's environment settings:\n")
        for k, v in values.items():
            if k != "POSTGRES_PASSWORD":
                print(f"{k}={v}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
