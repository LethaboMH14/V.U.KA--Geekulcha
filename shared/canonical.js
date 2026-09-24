// shared/canonical.js — the canonical JSON form of docs/VUKA-2-SPEC.md §5.
//
// The canonical bytes are the UTF-8 of Python
//   json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
// exactly byte for byte (spec §5: "There is one JS implementation
// (shared/canonical.js), used by the app and the verify page, and one Python
// implementation in anchor/"). The rules this module enforces:
//
//   1. Object keys are ASCII only, sorted by code point, recursively.
//   2. Non-ASCII string content is escaped as \uXXXX in lowercase hex, and
//      characters outside the BMP as UTF-16 surrogate pairs (matches Python's
//      ensure_ascii=True, whose escape set is [^ -~] plus " and \).
//   3. No floats anywhere in a hashed or signed object.
//   4. Integers stay within ±(2^53 − 1).
//
// Vectors: contracts/vectors/canonical.json (T01). A rejection vector must
// fail here exactly as it fails in Python.
//
// Zero dependencies: this file is imported by the verify page and the app.

/** Raised for any value, key or JSON text the canonical form refuses. */
export class CanonicalisationError extends Error {
  constructor(message, path = "$") {
    super(`${message} (at ${path})`);
    this.name = "CanonicalisationError";
    this.path = path;
  }
}

function hex4(codeUnit) {
  return codeUnit.toString(16).padStart(4, "0");
}

// Python's ESCAPE_ASCII regex is ([\\"]|[^ -~]): printable US-ASCII (0x20–0x7E)
// stays literal, everything else escapes, DEL (0x7F) included. Iterating UTF-16
// code units encodes astral characters as lowercase surrogate pairs, which is
// exactly what Python emits, and lone surrogates pass through the same way.
function escapeString(s) {
  let out = '"';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 0x22) out += '\\"';
    else if (c === 0x5c) out += "\\\\";
    else if (c === 0x08) out += "\\b";
    else if (c === 0x09) out += "\\t";
    else if (c === 0x0a) out += "\\n";
    else if (c === 0x0c) out += "\\f";
    else if (c === 0x0d) out += "\\r";
    else if (c >= 0x20 && c <= 0x7e) out += s[i];
    else out += "\\u" + hex4(c);
  }
  return out + '"';
}

function checkAsciiKey(key, path) {
  for (let i = 0; i < key.length; i++) {
    if (key.charCodeAt(i) > 0x7f) {
      throw new CanonicalisationError("object keys must be ASCII only", path);
    }
  }
}

function encodeNumber(n, path) {
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new CanonicalisationError("only finite numbers are canonical", path);
  }
  if (!Number.isInteger(n)) {
    throw new CanonicalisationError("no floats in a hashed or signed object", path);
  }
  if (!Number.isSafeInteger(n)) {
    throw new CanonicalisationError("integers must stay within ±(2^53 − 1)", path);
  }
  // JS -0 is integer-valued; Python's integer 0 prints "0".
  return Object.is(n, -0) ? "0" : String(n);
}

function isPlainObject(v) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

function encode(value, path) {
  if (value === null) return "null";
  switch (typeof value) {
    case "boolean":
      return value ? "true" : "false";
    case "number":
      return encodeNumber(value, path);
    case "string":
      return escapeString(value);
    case "object":
      break; // handled below
    default:
      // undefined, function, symbol, bigint — none of them exist in a Python
      // dict, so none of them may reach the signer.
      throw new CanonicalisationError(`type ${typeof value} is not canonical`, path);
  }
  if (Array.isArray(value)) {
    const items = value.map((item, i) => encode(item, `${path}[${i}]`));
    return "[" + items.join(",") + "]";
  }
  if (!isPlainObject(value)) {
    throw new CanonicalisationError("only plain objects are canonical", path);
  }
  const keys = Object.keys(value);
  for (const key of keys) checkAsciiKey(key, path);
  keys.sort(); // keys are ASCII, so code-unit order is code-point order
  const members = keys.map((key) => `${escapeString(key)}:${encode(value[key], `${path}.${key}`)}`);
  return "{" + members.join(",") + "}";
}

/**
 * Canonical JSON text for an in-memory value.
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalJson(value) {
  return encode(value, "$");
}

/**
 * Canonical bytes (UTF-8 of the canonical text) for an in-memory value.
 * These are the bytes that go to SHA-256 or to the native signer.
 * @param {unknown} value
 * @returns {Uint8Array}
 */
export function canonicalize(value) {
  return new TextEncoder().encode(canonicalJson(value));
}
// --- strict JSON text → canonical bytes (duplicate keys and floats refused) ---

const CONTROL_CHARS = /[\u0000-\u001f]/;

class JsonParser {
  constructor(text) {
    this.text = text;
    this.pos = 0;
  }

  atEnd() {
    return this.pos >= this.text.length;
  }

  fail(message) {
    throw new CanonicalisationError(`${message} at byte ${this.pos}`);
  }

  skipWs() {
    while (!this.atEnd()) {
      const c = this.text[this.pos];
      if (c === " " || c === "\t" || c === "\n" || c === "\r") this.pos++;
      else break;
    }
  }

  expect(literal) {
    if (!this.text.startsWith(literal, this.pos)) this.fail(`expected ${literal}`);
    this.pos += literal.length;
  }

  parseValue() {
    this.skipWs();
    if (this.atEnd()) this.fail("unexpected end of JSON");
    const c = this.text[this.pos];
    if (c === "{") return this.parseObject();
    if (c === "[") return this.parseArray();
    if (c === '"') return this.parseString();
    if (c === "t") {
      this.expect("true");
      return true;
    }
    if (c === "f") {
      this.expect("false");
      return false;
    }
    if (c === "n") {
      this.expect("null");
      return null;
    }
    return this.parseNumber();
  }

  // Object keys are collected in a Set so a duplicate key is refused here,
  // before it can be collapsed. "__proto__" is defined as an own data
  // property, so a hostile payload cannot reach the prototype.
  parseObject() {
    this.expect("{");
    const obj = {};
    const seen = new Set();
    this.skipWs();
    if (this.text[this.pos] === "}") {
      this.pos++;
      return obj;
    }
    for (;;) {
      this.skipWs();
      if (this.text[this.pos] !== '"') this.fail("expected a string key");
      const key = this.parseString();
      if (seen.has(key)) {
        throw new CanonicalisationError(`duplicate key "${key}" in JSON text`);
      }
      seen.add(key);
      this.skipWs();
      if (this.text[this.pos] !== ":") this.fail("expected ':'");
      this.pos++;
      const value = this.parseValue();
      Object.defineProperty(obj, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      this.skipWs();
      if (this.text[this.pos] === ",") {
        this.pos++;
        continue;
      }
      if (this.text[this.pos] === "}") {
        this.pos++;
        return obj;
      }
      this.fail("expected ',' or '}'");
    }
  }

  parseArray() {
    this.expect("[");
    const arr = [];
    this.skipWs();
    if (this.text[this.pos] === "]") {
      this.pos++;
      return arr;
    }
    for (;;) {
      arr.push(this.parseValue());
      this.skipWs();
      if (this.text[this.pos] === ",") {
        this.pos++;
        continue;
      }
      if (this.text[this.pos] === "]") {
        this.pos++;
        return arr;
      }
      this.fail("expected ',' or ']'");
    }
  }
parseString() {
    // caller checked the opening quote
    this.pos++;
    let out = "";
    for (;;) {
      if (this.atEnd()) this.fail("unterminated string");
      const c = this.text[this.pos];
      if (c === '"') {
        this.pos++;
        return out;
      }
      if (c === "\\") {
        this.pos++;
        if (this.atEnd()) this.fail("unterminated escape");
        const e = this.text[this.pos++];
        switch (e) {
          case '"': out += '"'; break;
          case "\\": out += "\\"; break;
          case "/": out += "/"; break;
          case "b": out += "\b"; break;
          case "f": out += "\f"; break;
          case "n": out += "\n"; break;
          case "r": out += "\r"; break;
          case "t": out += "\t"; break;
          case "u": {
            if (this.pos + 4 > this.text.length) this.fail("incomplete \\u escape");
            const hexDigits = this.text.slice(this.pos, this.pos + 4);
            if (!/^[0-9a-fA-F]{4}$/.test(hexDigits)) this.fail("bad \\u escape");
            out += String.fromCharCode(parseInt(hexDigits, 16));
            this.pos += 4;
            break;
          }
          default:
            this.fail(`bad escape \\${e}`);
        }
        continue;
      }
      if (CONTROL_CHARS.test(c)) this.fail("raw control character in string");
      out += c;
      this.pos++;
    }
  }

  // Refuses anything not lexically an integer. Python's json.loads("1e2") is
  // the float 100.0 and json.dumps gives "100.0", so an exponent or fraction
  // may never reach the canonical form. An integer token beyond ±(2^53 − 1)
  // is refused outright rather than silently rounded.
  parseNumber() {
    const rest = this.text.slice(this.pos);
    const match = rest.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/);
    if (!match) this.fail("not a JSON value");
    const [token, , fraction, exponent] = match;
    this.pos += token.length;
    if (fraction !== undefined || exponent !== undefined) {
      throw new CanonicalisationError("no floats in a hashed or signed object");
    }
    const value = Number(token);
    if (!Number.isSafeInteger(value)) {
      throw new CanonicalisationError("integers must stay within ±(2^53 − 1)");
    }
    return value;
  }
}

/**
 * Strict parse of JSON text, then canonicalise. A duplicate key at any depth,
 * a float (including exponent notation such as 1e2) or an integer outside
 * ±(2^53 − 1) is refused — this is the entry point the T01 rejection vectors
 * run through.
 * @param {string} text
 * @returns {Uint8Array}
 */
export function canonicalizeJson(text) {
  if (typeof text !== "string") {
    throw new CanonicalisationError("canonicalizeJson takes JSON text");
  }
  const parser = new JsonParser(text);
  const value = parser.parseValue();
  parser.skipWs();
  if (!parser.atEnd()) parser.fail("trailing characters after JSON value");
  return canonicalize(value);
}