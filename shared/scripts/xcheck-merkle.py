# Temporary cross-language check: recomputes the RFC 6962 roots for n = 1…8
# with hashlib and diffs them against shared/scripts/xcheck-merkle.mjs.
import hashlib
import json
import subprocess
import sys
from pathlib import Path

mjs = Path(__file__).resolve().parent / "xcheck-merkle.mjs"

def sha256(b):
    return hashlib.sha256(b).digest()


def mth(leaves):
    if len(leaves) == 1:
        return sha256(b"\x00" + leaves[0])
    k = 1
    while k * 2 < len(leaves):
        k *= 2
    return sha256(b"\x01" + mth(leaves[:k]) + mth(leaves[k:]))


reference = {}
for n in range(1, 9):
    leaves = sorted(sha256(f"head-{i}".encode()) for i in range(n))
    reference[f"n{n}"] = mth(leaves).hex()

result = subprocess.run(
    ["node", str(mjs)],
    capture_output=True, text=True, check=True,
)
js = json.loads(result.stdout)

failures = 0
for name, expected in reference.items():
    actual = js.get(name)
    if actual == expected:
        print(f"PASS {name}")
    else:
        failures += 1
        print(f"FAIL {name}\n  python: {expected}\n  js:     {actual}")

print(f"\n{len(reference) - failures}/{len(reference)} roots identical")
sys.exit(1 if failures else 0)