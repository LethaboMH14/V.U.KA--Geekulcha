// Temporary cross-language check: prints canonical hex for fixed values so it
// can be diffed against Python json.dumps output. Not part of the test suite.
import { canonicalJson } from "../canonical.js";

const cases = {
  ascii_object: { b: 2, a: 1, sub: { d: 4, c: 3 } },
  nested_arrays: { z: { d: 4, c: [3, 1, 2] }, a: [], empty_map: {} },
  afrikaans: { woord: "sêl", boot: "kanotjie" },
  isizulu: { greet: "Sawubona, unjani?", phrase: "ngiyaphila" },
  emoji: { mood: "🙂", flags: "🇿🇦" },
  control_chars: { x: "\u0001\u001f\u007f", quote: 'a"b\\c\nd\te\rf\u0000g' },
  max_ints: { hi: 9007199254740991, lo: -9007199254740991, zero: 0, neg: -0 },
  bools_null: { t: true, f: false, n: null },
  empty_string: { s: "" },
  unicode_bmp: { devanagari: "नमस्ते", cjk: "安全", accented: "éàü" },
};

const out = {};
for (const [name, value] of Object.entries(cases)) out[name] = canonicalJson(value);
console.log(JSON.stringify(out, null, 2));