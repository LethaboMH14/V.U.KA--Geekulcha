// shared/der.js — Android Keystore ECDSA signatures to WebCrypto raw form.
//
// Spec §5 rule 7: "Android Keystore returns ECDSA signatures in DER;
// shared/der.js converts them to raw r‖s for WebCrypto." P-256: r and s are
// each at most 32 bytes, so the raw form is exactly 64 bytes (r ‖ s,
// big-endian, left-padded with zeros).
//
// Strictness: Keystore emits minimal DER, so anything else is treated as
// corrupt rather than repaired — indefinite lengths, non-minimal lengths,
// non-minimal INTEGER padding, negative integers and trailing bytes are all
// refused. T03's golden vector (a real signature captured from a phone) runs
// through this module.
//
// Zero dependencies: this file is imported by the verify page and the app.

/** Raised for any DER byte string this module refuses. */
export class DerError extends Error {
  constructor(message) {
    super(message);
    this.name = "DerError";
  }
}

const RAW_LENGTH = 64; // 32-byte r ‖ 32-byte s
const COMPONENT_LENGTH = 32;

function assertBytes(value, name) {
  if (!(value instanceof Uint8Array)) {
    throw new DerError(`${name} must be a Uint8Array`);
  }
}

// DER lengths are definite and minimally encoded: short form below 0x80,
// long form only when needed, first long-form byte never 0x00 or 0xFF,
// never the indefinite 0x80.
function readLength(der, offset, end) {
  if (offset >= end) throw new DerError("truncated DER: length byte missing");
  const first = der[offset++];
  if (first < 0x80) return [first, offset];
  if (first === 0x80) throw new DerError("indefinite DER length");
  if (first === 0xff) throw new DerError("non-minimal DER length marker 0xff");
  const count = first - 0x80;
  if (count > 4) throw new DerError("DER length too long to be sensible");
  if (offset + count > end) throw new DerError("truncated DER: length bytes missing");
  if (der[offset] === 0x00) throw new DerError("non-minimal DER length (leading zero)");
  let length = 0;
  for (let i = 0; i < count; i++) length = length * 256 + der[offset + i];
  if (length < 0x80) throw new DerError("non-minimal DER length (long form for a short value)");
  return [length, offset + count];
}

// Reads one DER INTEGER for an ECDSA component: strips the sign padding,
// refuses negatives and non-minimal encodings, refuses anything over 32 bytes.
function readComponent(der, offset, end, name) {
  if (offset >= end) throw new DerError(`truncated DER: ${name} tag missing`);
  if (der[offset] !== 0x02) {
    throw new DerError(`expected INTEGER tag for ${name}, got 0x${der[offset].toString(16)}`);
  }
  const [length, contentStart] = readLength(der, offset + 1, end);
  if (contentStart + length > end) throw new DerError(`truncated DER: ${name} content missing`);
  if (length === 0) throw new DerError(`${name} is an empty INTEGER`);
  const content = der.subarray(contentStart, contentStart + length);
  // Minimal-INTEGER rules for a positive ECDSA component.
  if (content[0] & 0x80) {
    throw new DerError(`${name} is negative (high bit set, no sign padding)`);
  }
  let value = content;
  if (content[0] === 0x00) {
    if (content.length === 1) throw new DerError(`${name} is zero`);
    if (!(content[1] & 0x80)) {
      throw new DerError(`${name} has non-minimal INTEGER padding`);
    }
    value = content.subarray(1); // the single required sign padding byte
  }
  if (value.every((b) => b === 0x00)) throw new DerError(`${name} is zero`);
  if (value.length > COMPONENT_LENGTH) {
    throw new DerError(`${name} is longer than 32 bytes`);
  }
  const padded = new Uint8Array(COMPONENT_LENGTH);
  padded.set(value, COMPONENT_LENGTH - value.length);
  return [padded, contentStart + length];
}

/**
 * Converts a DER ECDSA signature to the raw 64-byte r‖s form WebCrypto uses.
 * @param {Uint8Array} der
 * @returns {Uint8Array} 64 bytes: 32-byte r, then 32-byte s
 */
export function derToRaw(der) {
  assertBytes(der, "DER signature");
  if (der.length < 8) throw new DerError("DER signature is too short");
  if (der[0] !== 0x30) {
    throw new DerError(`expected SEQUENCE tag 0x30, got 0x${der[0].toString(16)}`);
  }
  const [seqLength, contentStart] = readLength(der, 1, der.length);
  const contentEnd = contentStart + seqLength;
  if (contentEnd !== der.length) {
    throw new DerError("DER has trailing bytes or a short SEQUENCE");
  }
  const [r, afterR] = readComponent(der, contentStart, contentEnd, "r");
  const [s, afterS] = readComponent(der, afterR, contentEnd, "s");
  if (afterS !== contentEnd) throw new DerError("ECDSA SEQUENCE must hold exactly r and s");
  const raw = new Uint8Array(RAW_LENGTH);
  raw.set(r, 0);
  raw.set(s, COMPONENT_LENGTH);
  return raw;
}
/**
 * Inverse of derToRaw — DER-encodes raw components. Used to build test
 * fixtures and to cross-check parsed vectors; the phone itself only ever
 * produces DER.
 * @param {Uint8Array} r raw 32-byte (or shorter) r
 * @param {Uint8Array} s raw 32-byte (or shorter) s
 * @returns {Uint8Array} DER signature
 */
export function rawToDer(r, s) {
  assertBytes(r, "r");
  assertBytes(s, "s");
  const encodeComponent = (bytes, name) => {
    if (bytes.length === 0 || bytes.length > COMPONENT_LENGTH) {
      throw new DerError(`${name} must be 1..32 bytes`);
    }
    let start = 0;
    while (start < bytes.length - 1 && bytes[start] === 0x00) start++;
    const value = bytes.subarray(start);
    if (value.every((b) => b === 0x00)) throw new DerError(`${name} is zero`);
    const needsPad = (value[0] & 0x80) !== 0;
    let content;
    if (needsPad) {
      content = new Uint8Array(value.length + 1);
      content.set(value, 1);
    } else {
      content = value;
    }
    if (content.length < 0x80) {
      const out = new Uint8Array(content.length + 2);
      out[0] = 0x02;
      out[1] = content.length;
      out.set(content, 2);
      return out;
    }
    const out = new Uint8Array(content.length + 3);
    out[0] = 0x02;
    out[1] = 0x81;
    out[2] = content.length;
    out.set(content, 3);
    return out;
  };
  const rDer = encodeComponent(r, "r");
  const sDer = encodeComponent(s, "s");
  const seqLength = rDer.length + sDer.length;
  let header;
  if (seqLength < 0x80) {
    header = new Uint8Array([0x30, seqLength]);
  } else if (seqLength <= 0xff) {
    header = new Uint8Array([0x30, 0x81, seqLength]);
  } else {
    header = new Uint8Array([0x30, 0x82, (seqLength >> 8) & 0xff, seqLength & 0xff]);
  }
  const out = new Uint8Array(header.length + seqLength);
  out.set(header, 0);
  out.set(rDer, header.length);
  out.set(sDer, header.length + rDer.length);
  return out;
}