# Temporary cross-language check: computes the Python reference canonical form
# for the same values as shared/scripts/xcheck-canonical.mjs and diffs them.
import json
import subprocess
import sys
from pathlib import Path

mjs = Path(__file__).resolve().parent / "xcheck-canonical.mjs"

cases = {
    "ascii_object": {"b": 2, "a": 1, "sub": {"d": 4, "c": 3}},
    "nested_arrays": {"z": {"d": 4, "c": [3, 1, 2]}, "a": [], "empty_map": {}},
    "afrikaans": {"woord": "s\u00eal", "boot": "kanotjie"},
    "isizulu": {"greet": "Sawubona, unjani?", "phrase": "ngiyaphila"},
    "emoji": {"mood": "\U0001F642", "flags": "\U0001F1FF\U0001F1E6"},
    "control_chars": {"x": "\u0001\u001f\u007f", "quote": 'a"b\\c\nd\te\rf\x00g'},
    "max_ints": {"hi": 9007199254740991, "lo": -9007199254740991, "zero": 0, "neg": 0},
    "bools_null": {"t": True, "f": False, "n": None},
    "empty_string": {"s": ""},
    "unicode_bmp": {"devanagari": "\u0928\u092e\u0938\u094d\u0924\u0947", "cjk": "\u5b89\u5168", "accented": "\u00e9\u00e0\u00fc"},
}

reference = {
    name: json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    for name, value in cases.items()
}

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

print(f"\n{len(reference) - failures}/{len(reference)} cases byte-identical")
sys.exit(1 if failures else 0)