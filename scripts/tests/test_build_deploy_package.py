from __future__ import annotations

from io import BytesIO
import importlib.util
from pathlib import Path, PurePosixPath
import sys
import tarfile


MODULE_PATH = Path(__file__).parents[1] / "build-deploy-package.py"
SPEC = importlib.util.spec_from_file_location("build_deploy_package", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
package_builder = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = package_builder
SPEC.loader.exec_module(package_builder)


def make_archive(files: dict[str, bytes]) -> bytes:
    output = BytesIO()
    with tarfile.open(fileobj=output, mode="w:") as archive:
        directories = set()
        for name in files:
            directories.update(parent.as_posix() for parent in PurePosixPath(name).parents if parent.as_posix() != ".")
        for name in sorted(directories):
            info = tarfile.TarInfo(name)
            info.type = tarfile.DIRTYPE
            archive.addfile(info)
        for name, data in files.items():
            info = tarfile.TarInfo(name)
            info.size = len(data)
            archive.addfile(info, BytesIO(data))
    return output.getvalue()


def complete_deploy_files() -> dict[str, bytes]:
    names = package_builder.REQUIRED_MEMBERS
    return {name: b"sim_test_content\n" for name in names}


def test_package_selection_keeps_server_runtime_and_excludes_tests():
    files = complete_deploy_files()
    files.update(
        {
            "server/tests/test_only.py": b"sim_test_only",
            "anchor/tests/test_only.py": b"sim_test_only",
            "anchor/hedera-sidecar/publish.test.mjs": b"sim_test_only",
            "server/nested/runtime.py": b"sim_runtime",
        }
    )

    selected = package_builder.read_safe_package_members(make_archive(files))

    assert {item.name for item in selected} == package_builder.REQUIRED_MEMBERS | {
        "server/nested/runtime.py"
    }


def test_every_anchor_module_and_payload_schema_the_server_imports_is_included():
    """Regression: the server imports anchor.merkle/payloads/pin_authority/publish/
    verify and reads contracts/payloads/*.json + contracts/keys/manifest.json at
    runtime. Packaging only anchor/canonical.py (the original three-route scope)
    leaves those unresolved on a real deploy."""
    files = complete_deploy_files()
    files.update({
        "anchor/guardian_governance.py": b"sim_module",
        "contracts/payloads/checkin_result.v1.json": b"{}",
        "contracts/keys/verify-pins.json": b"{}",
        "anchor/tests/test_merkle.py": b"sim_test",
    })
    selected = {item.name for item in package_builder.read_safe_package_members(make_archive(files))}
    assert "anchor/guardian_governance.py" in selected
    assert "contracts/payloads/checkin_result.v1.json" in selected
    assert "anchor/tests/test_merkle.py" not in selected


def test_hedera_sidecar_source_is_packaged_but_not_node_modules_or_its_tests():
    """Regression: anchor/publish.py shells out to anchor/hedera-sidecar/cli.mjs
    for real Hedera submission; server/run_workers.py's batch coordinator now
    ticks unconditionally, so a deploy missing the sidecar's own source can
    never anchor for real even once real Hedera credentials are configured.
    node_modules is never packaged (forbidden_path_reason already refuses it
    outright); a deploy target runs its own `npm ci --ignore-scripts`."""
    files = complete_deploy_files()
    files.update({
        "anchor/hedera-sidecar/cli.mjs": b"sim_sidecar",
        "anchor/hedera-sidecar/publish.mjs": b"sim_sidecar",
        "anchor/hedera-sidecar/package.json": b"{}",
        "anchor/hedera-sidecar/package-lock.json": b"{}",
        "anchor/hedera-sidecar/publish.test.mjs": b"sim_test",
    })
    selected = {item.name for item in package_builder.read_safe_package_members(make_archive(files))}
    assert "anchor/hedera-sidecar/cli.mjs" in selected
    assert "anchor/hedera-sidecar/publish.mjs" in selected
    assert "anchor/hedera-sidecar/package.json" in selected
    assert "anchor/hedera-sidecar/package-lock.json" in selected
    assert "anchor/hedera-sidecar/publish.test.mjs" not in selected


def test_archive_path_guard_rejects_forbidden_names():
    for name in (
        "app/.env",
        "app/.env.production",
        "secrets/signing.pem",
        "secrets/private.key",
        "app/node_modules/library/index.js",
        "app/.git/config",
    ):
        assert package_builder.forbidden_path_reason(name), name


def test_archive_scan_refuses_forbidden_paths_before_packaging():
    files = complete_deploy_files() | {"server/.env.local": b"must not be read or included"}
    try:
        package_builder.read_safe_package_members(make_archive(files))
    except package_builder.PackageSafetyError as exc:
        assert str(exc) == "forbidden archive member (environment-file path): server/.env.local"
    else:
        raise AssertionError("environment-file path was not refused")


def test_archive_scan_refuses_private_key_shaped_content_without_echoing_it():
    marker = b"-" * 5 + b"BEGIN " + b"PRIVATE KEY" + b"-" * 5
    content = marker + b"\nsimulated-placeholder\n" + b"-" * 5 + b"END " + b"PRIVATE KEY" + b"-" * 5
    try:
        package_builder.read_safe_package_members(make_archive(complete_deploy_files() | {"server/main.py": content}))
    except package_builder.PackageSafetyError as exc:
        assert "private-key-shaped content found in: server/main.py" == str(exc)
        assert b"simulated-placeholder" not in str(exc).encode()
    else:
        raise AssertionError("private-key-shaped content was not refused")
