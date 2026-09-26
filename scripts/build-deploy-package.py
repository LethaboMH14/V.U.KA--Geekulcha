#!/usr/bin/env python3
"""Create the server deployment ZIP only from a named Git commit archive."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tarfile
import zipfile


PRIVATE_KEY_SHAPE = re.compile(rb"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----")
REQUIRED_MEMBERS = {
    "anchor/canonical.py",
    "anchor/merkle.py",
    "anchor/payloads.py",
    "anchor/pin_authority.py",
    "anchor/publish.py",
    "anchor/verify.py",
    "contracts/keys/manifest.json",
    "contracts/keys/verify-pins.json",
    "requirements.txt",
    "server/db.py",
    "server/main.py",
    "server/payload_store.py",
    "server/requirements.txt",
    "startup.sh",
}


class PackageSafetyError(ValueError):
    """The selected commit contains a forbidden path or secret-shaped value."""


@dataclass(frozen=True)
class ArchiveFile:
    name: str
    data: bytes


def forbidden_path_reason(name: str) -> str | None:
    if "\\" in name:
        return "backslash in archive path"
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts:
        return "unsafe archive path"
    for part in path.parts:
        lowered = part.lower()
        if lowered == ".git":
            return "Git metadata path"
        if lowered == "node_modules":
            return "node_modules path"
        if lowered.startswith(".env"):
            return "environment-file path"
        if lowered.endswith(".pem"):
            return "PEM-key path"
        if lowered.endswith(".key"):
            return "key-file path"
    return None


def should_package(name: str) -> bool:
    """The server imports every non-test module under anchor/, plus the payload
    schemas and key manifest anchor/payloads.py and server/server_signing.py
    read from disk. Packaging only anchor/canonical.py (the original scope,
    from when the server had three routes) leaves those imports unresolved at
    runtime; a deployed server would fail on its first request, not at boot,
    since most are imported lazily inside route handlers."""
    path = PurePosixPath(name)
    parts = [p.lower() for p in path.parts]
    if len(path.parts) > 1 and path.parts[0] == "server":
        return not any(part in {"tests", "__pycache__", ".pytest_cache"} for part in parts)
    if len(path.parts) > 2 and path.parts[0] == "anchor" and path.parts[1] == "hedera-sidecar":
        # anchor/publish.py shells out to this sidecar for real Hedera
        # submission (server/anchoring.py's BatchCoordinator, run every
        # second by server/run_workers.py). node_modules is never packaged —
        # forbidden_path_reason already refuses it — so a deploy target still
        # needs its own `npm ci --ignore-scripts` run here after unpacking.
        if "node_modules" in parts or "tests" in parts or "__pycache__" in parts:
            return False
        if path.name.endswith(".test.mjs"):
            return False
        return path.suffix in {".mjs", ".json"}
    if len(path.parts) > 1 and path.parts[0] == "anchor":
        if path.parts[1] == "hedera-sidecar" or "tests" in parts or "__pycache__" in parts:
            return False
        return path.suffix == ".py"
    if len(path.parts) > 2 and path.parts[0] == "contracts" and path.parts[1] == "payloads":
        return path.suffix == ".json"
    return name in {
        "anchor/canonical.py",
        "contracts/keys/manifest.json",
        "contracts/keys/verify-pins.json",
        "requirements.txt",
        "startup.sh",
    }


def read_safe_package_members(archive_bytes: bytes) -> list[ArchiveFile]:
    """Validate every archived path and file body before selecting deploy files."""
    with tarfile.open(fileobj=BytesIO(archive_bytes), mode="r:") as archive:
        members = archive.getmembers()
        for member in members:
            reason = forbidden_path_reason(member.name)
            if reason:
                raise PackageSafetyError(f"forbidden archive member ({reason}): {member.name}")

        selected: list[ArchiveFile] = []
        for member in members:
            if member.isdir():
                continue
            if not should_package(member.name):
                continue
            if not member.isfile():
                raise PackageSafetyError(f"deploy member is not a regular file: {member.name}")
            source = archive.extractfile(member)
            if source is None:
                raise PackageSafetyError(f"could not read deploy member: {member.name}")
            data = source.read()
            if PRIVATE_KEY_SHAPE.search(data):
                raise PackageSafetyError(f"private-key-shaped content found in: {member.name}")
            selected.append(ArchiveFile(member.name, data))

        names = {item.name for item in selected}
        missing = sorted(REQUIRED_MEMBERS - names)
        if missing:
            raise PackageSafetyError(f"required deploy members missing: {', '.join(missing)}")
        return sorted(selected, key=lambda item: item.name)


def resolve_commit(repo_root: Path, requested: str) -> str:
    if not re.fullmatch(r"(?:[0-9a-fA-F]{40}|[0-9a-fA-F]{64})", requested):
        raise PackageSafetyError("commit must be a full 40- or 64-character commit SHA")
    result = subprocess.run(
        ["git", "rev-parse", "--verify", f"{requested}^{{commit}}"],
        cwd=repo_root,
        check=True,
        capture_output=True,
        text=True,
    )
    resolved = result.stdout.strip().lower()
    if resolved != requested.lower():
        raise PackageSafetyError("resolved commit SHA did not match requested SHA")
    return resolved


def git_archive(repo_root: Path, commit_sha: str) -> bytes:
    result = subprocess.run(
        ["git", "archive", "--format=tar", commit_sha],
        cwd=repo_root,
        check=True,
        capture_output=True,
    )
    return result.stdout


def build_package(repo_root: Path, commit_sha: str, output: Path) -> list[str]:
    resolved = resolve_commit(repo_root, commit_sha)
    members = read_safe_package_members(git_archive(repo_root, resolved))
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as package:
        for member in members:
            package.writestr(member.name, member.data)
    with zipfile.ZipFile(output, "r") as package:
        for name in package.namelist():
            reason = forbidden_path_reason(name)
            if reason:
                raise PackageSafetyError(f"forbidden ZIP member ({reason}): {name}")
            if PRIVATE_KEY_SHAPE.search(package.read(name)):
                raise PackageSafetyError(f"private-key-shaped content found in ZIP member: {name}")
    return [member.name for member in members]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("commit_sha", help="full commit SHA whose tracked archive is packaged")
    parser.add_argument("--output", required=True, type=Path, help="destination ZIP path")
    args = parser.parse_args(argv)
    repo_root = Path(__file__).resolve().parents[1]
    try:
        resolved = resolve_commit(repo_root, args.commit_sha)
        names = build_package(repo_root, resolved, args.output)
    except (PackageSafetyError, subprocess.CalledProcessError, OSError, tarfile.TarError, zipfile.BadZipFile) as exc:
        print(f"package refused: {exc}", file=sys.stderr)
        return 1
    print(f"commit: {resolved}")
    print(f"package: {args.output.resolve()}")
    print("files:")
    for name in names:
        print(f"  {name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
