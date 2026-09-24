// T01 (JS side) — shared/canonical.js against docs/VUKA-2-SPEC.md §5.
// Golden expectations were cross-checked live against Python's
// json.dumps(sort_keys=True, separators=(",", ":"), ensure_ascii=True);
// the vector file contracts/vectors/canonical.json is the binding one
// once Sibusiso lands it (see vectors.test.js).
import { describe, expect, it } from "vitest";
import {
  CanonicalisationError,
  canonicalJson,
  canonicalize,
  canonicalizeJson,
} from "../canonical.js";
import { bytesToHex } from "../merkle.js";

const utf8 = (s) => bytesToHex(new TextEncoder().encode(s));

describe("canonicalJson — golden form (§5 rules 1–2)", () => {
  it("keeps scalars in JSON form", () => {
    expect(canonicalJson(null)).toBe("null");
    expect(canonicalJson(true)).toBe("true");
    expect(canonicalJson(false)).toBe("false");
    expect(canonicalJson(0)).toBe("0");
  });

  it("sorts object keys by code point, recursively", () => {
    expect(canonicalJson({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(canonicalJson({ z: { d: 4, c: 3 }, a: 1 })).toBe('{"a":1,"z":{"c":3,"d":4}}');
    // '_' (0x5F) sorts before 'a' (0x61); uppercase (0x42) before lowercase
    expect(canonicalJson({ underscore_x: 1, ab: 2 })).toBe('{"ab":2,"underscore_x":1}');
    expect(canonicalJson({ B: 1, a: 2 })).toBe('{"B":1,"a":2}');
  });

  it("keeps array order and encodes empty containers", () => {
    expect(canonicalJson([3, 1, 2])).toBe("[3,1,2]");
    expect(canonicalJson({ list: [], map: {} })).toBe('{"list":[],"map":{}}');
expect(canonicalJson({ z: { d: 4, c: [3, 1, 2] }, a: [] })).toBe(
      '{"a":[],"z":{"c":[3,1,2],"d":4}}',
    );
  });

  it("escapes non-ASCII string content as lowercase \\uXXXX", () => {
    expect(canonicalJson({ woord: "sêl" })).toBe('{"woord":"s\\u00eal"}');
    expect(canonicalJson({ greet: "Sawubona" })).toBe('{"greet":"Sawubona"}'); // isiZulu, ASCII
    expect(canonicalJson({ x: "" })).toBe('{"x":"\\u007f"}'); // DEL escapes too
    expect(canonicalJson({ x: "\u0001\u001f" })).toBe('{"x":"\\u0001\\u001f"}');
  });

  it("escapes outside-BMP characters as UTF-16 surrogate pairs", () => {
    expect(canonicalJson({ mood: "🙂" })).toBe('{"mood":"\\ud83d\\ude42"}');
  });

  it("escapes quotes, backslashes and short controls", () => {
    expect(canonicalJson({ q: 'a"b\\c\nd' })).toBe('{"q":"a\\"b\\\\c\\nd"}');
  });

  it("keeps integers within ±(2^53 − 1) as integers", () => {
    expect(canonicalJson({ n: 9007199254740991 })).toBe('{"n":9007199254740991}');
    expect(canonicalJson({ n: -9007199254740991 })).toBe('{"n":-9007199254740991}');
    expect(canonicalJson({ n: -0 })).toBe('{"n":0}');
  });
});

describe("canonicalJson — rejections (§5 rules 1, 3, 4)", () => {
  const rejects = (value) => expect(() => canonicalJson(value)).toThrow(CanonicalisationError);

  it("refuses floats, wherever they sit", () => {
    rejects({ score: 1.5 });
    rejects({ deep: { in: [0, [0.5]] } });
  });

  it("refuses 2^53 and beyond", () => {
    rejects(9007199254740992);
    rejects({ n: -9007199254740992 });
  });

  it("refuses NaN and Infinity", () => {
    rejects(NaN);
    rejects({ n: Infinity });
  });

  it("refuses non-ASCII keys", () => {
    rejects({ "kéy": 1 });
    rejects({ "µ": 1 });
  });

  it("refuses values a Python dict cannot hold", () => {
    rejects(undefined);
    rejects({ a: undefined });
    rejects([undefined]);
    rejects(10n);
    rejects(() => 1);
    rejects(new Date(0));
  });
});

describe("canonicalize — canonical bytes", () => {
  it("gives the UTF-8 bytes of the canonical text", () => {
    expect(bytesToHex(canonicalize({ a: 1 }))).toBe(utf8('{"a":1}'));
  });
});

describe("canonicalizeJson — strict text entry for the vectors", () => {
  it("canonicalises valid text", () => {
    expect(bytesToHex(canonicalizeJson('{"b": 2, "a": [1, {"c": 2}]}'))).toBe(
      utf8('{"a":[1,{"c":2}],"b":2}'),
    );
    expect(bytesToHex(canonicalizeJson("true"))).toBe(utf8("true"));
  });

  it("refuses duplicate keys at any depth", () => {
    expect(() => canonicalizeJson('{"a":1,"a":2}')).toThrow(CanonicalisationError);
    expect(() => canonicalizeJson('{"x":{"b":1,"b":2}}')).toThrow(CanonicalisationError);
    expect(() => canonicalizeJson('{"__proto__":1,"__proto__":2}')).toThrow(
      CanonicalisationError,
    );
  });

  it("refuses floats in text, including exponent notation that names an integer", () => {
    expect(() => canonicalizeJson('{"a":1.5}')).toThrow(CanonicalisationError);
    expect(() => canonicalizeJson('{"a":1e2}')).toThrow(CanonicalisationError);
    expect(() => canonicalizeJson('{"a":-0.0}')).toThrow(CanonicalisationError);
  });

  it("refuses integers beyond ±(2^53 − 1) in text", () => {
    expect(() => canonicalizeJson('{"a":9007199254740992}')).toThrow(CanonicalisationError);
    expect(() => canonicalizeJson('{"a":9007199254740993}')).toThrow(CanonicalisationError);
  });

  it("refuses malformed JSON", () => {
    expect(() => canonicalizeJson('{"a":1}x')).toThrow(CanonicalisationError);
    expect(() => canonicalizeJson('{"a":}')).toThrow(CanonicalisationError);
    expect(() => canonicalizeJson('{"a" 1}')).toThrow(CanonicalisationError);
    expect(() => canonicalizeJson("[1,]")).toThrow(CanonicalisationError);
    expect(() => canonicalizeJson('{"a":"raw\u0001char"}')).toThrow(CanonicalisationError);
  });

  it("treats __proto__ as a plain own property, not the prototype", () => {
    // '_' (0x5F) sorts before 'a' (0x61), so this is also the sorted form.
    expect(bytesToHex(canonicalizeJson('{"__proto__":1,"a":2}'))).toBe(
      utf8('{"__proto__":1,"a":2}'),
    );
  });
});