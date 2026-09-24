// DER → raw r‖s conversion tests (spec §5 rule 7). P-256 components are at
// most 32 bytes; Keystore emits minimal DER, so anything else is refused.
import { describe, expect, it } from "vitest";
import { DerError, derToRaw, rawToDer } from "../der.js";

const hex = (s) => Uint8Array.from((s.match(/../g) ?? []).map((b) => parseInt(b, 16)));
const hexOf = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

// A minimal valid signature: r = 1, s = 1.
const R1_S1 = hex("3006020101020101");
const R1_S1_RAW = hex(
  "0000000000000000000000000000000000000000000000000000000000000001" +
    "0000000000000000000000000000000000000000000000000000000000000001",
);

// A 32-byte component whose top bit is set needs the 0x00 sign padding.
const R_HIGH = hex("80" + "00".repeat(31));
const S_HIGH = hex("ff" + "ee".repeat(31));
const HIGH_PAIR = hex(
  "3046" + "022100" + "80" + "00".repeat(31) + "022100" + "ff" + "ee".repeat(31),
);

describe("derToRaw", () => {
  it("converts a minimal DER signature to 64 raw bytes", () => {
    expect(hexOf(derToRaw(R1_S1))).toBe(hexOf(R1_S1_RAW));
  });

  it("left-pads short components and strips sign padding on high-bit values", () => {
    const raw = derToRaw(HIGH_PAIR);
    expect(hexOf(raw.subarray(0, 32))).toBe(hexOf(R_HIGH));
    expect(hexOf(raw.subarray(32))).toBe(hexOf(S_HIGH));
  });

  it("round-trips through rawToDer for high-bit and low values", () => {
    expect(hexOf(derToRaw(rawToDer(R_HIGH, S_HIGH)))).toBe(hexOf(R_HIGH) + hexOf(S_HIGH));
    expect(hexOf(derToRaw(rawToDer(R1_S1_RAW.subarray(0, 32), R1_S1_RAW.subarray(32))))).toBe(
      hexOf(R1_S1_RAW),
    );
  });

  const corrupt = (name, bytes) =>
    it(`refuses ${name}`, () => expect(() => derToRaw(hex(bytes))).toThrow(DerError));

  corrupt("a non-SEQUENCE tag", "3106020101020101");
  corrupt("an indefinite length", "308002010102010100");
  corrupt("truncated bytes", "300502010102");
  corrupt("trailing garbage", "300602010102010100");
  corrupt("an empty INTEGER (r)", "30050200020101");
  corrupt("a 33-byte component", "3026022101" + "01".repeat(32) + "020101");
  corrupt("a negative component (no sign padding)", "3006020180020101");
  corrupt("non-minimal INTEGER padding", "300702020000020101");
  corrupt("misplaced sign padding", "300702020001020101");
  corrupt("a non-minimal long length", "30810006020101020101");
  corrupt("an unexpected third INTEGER", "30090201010201010201ff");
  corrupt("an empty buffer", "");

  it("refuses a zero-length buffer and non-Uint8Array input", () => {
    expect(() => derToRaw(new Uint8Array(0))).toThrow(DerError);
    expect(() => derToRaw("3006020101020101")).toThrow(DerError);
  });

  it("refuses a zero component (r or s = 0 is not a valid ECDSA signature)", () => {
    // 0x00 0x00 content: stripped to nothing — refused.
    expect(() => derToRaw(hex("30060200020100"))).toThrow(DerError);
  });
});

describe("rawToDer", () => {
  it("produces the canonical DER for the known pair", () => {
    expect(hexOf(rawToDer(R1_S1_RAW.subarray(0, 32), R1_S1_RAW.subarray(32)))).toBe(
      hexOf(R1_S1),
    );
    expect(hexOf(rawToDer(R_HIGH, S_HIGH))).toBe(hexOf(HIGH_PAIR));
  });

  it("refuses zero or oversized components", () => {
    expect(() => rawToDer(new Uint8Array(32), S_HIGH)).toThrow(DerError);
    expect(() => rawToDer(R_HIGH, new Uint8Array(33))).toThrow(DerError);
  });
});