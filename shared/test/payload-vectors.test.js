import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canonicalize } from "../canonical.js";
import { PayloadError, validatePayload, validatePayloadJson, validateSchema } from "../payloads.js";

const vectors = JSON.parse(
  readFileSync(new URL("../../contracts/vectors/payloads.json", import.meta.url), "utf8"),
);
const hex = (bytes) => Buffer.from(bytes).toString("hex");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

describe("§4b payload golden vectors", () => {
  it.each(vectors.golden)("validates $name and matches Python reference bytes", (entry) => {
    expect(validatePayload(entry.kind, entry.payload)).toEqual(entry.payload);
    const canonicalBytes = canonicalize(entry.payload);
    const salt = Buffer.from(entry.salt_b64, "base64");

    expect(salt).toHaveLength(16);
    expect(hex(canonicalBytes)).toBe(entry.canonical_hex);
    expect(sha256(canonicalBytes)).toBe(entry.sha256_hex);
    expect(sha256(Buffer.concat([salt, Buffer.from(canonicalBytes)]))).toBe(entry.commitment_hex);
  });
});

describe("§4b payload raw JSON rejection vectors", () => {
  it.each(vectors.rejections)("rejects $name before schema acceptance", (entry) => {
    expect(typeof entry.json).toBe("string");
    expect(() => validatePayloadJson(entry.kind, entry.json)).toThrow(PayloadError);
  });

  it("routes floats and duplicate keys through canonicalizeJson", () => {
    const float = vectors.rejections.find((entry) => entry.name.endsWith("window_float"));
    const duplicate = vectors.rejections.find((entry) => entry.name.includes("duplicate"));
    expect(float.json).toContain("20.0");
    expect(duplicate.json.match(/"kind"/g)).toHaveLength(2);
    expect(() => validatePayloadJson(float.kind, float.json)).toThrow(/invalid canonical payload JSON/);
    expect(() => validatePayloadJson(duplicate.kind, duplicate.json)).toThrow(/invalid canonical payload JSON/);
  });

  it("fails closed when a future schema keyword is not implemented", () => {
    expect(() => validateSchema({ kind: "checkin_opened" }, { type: "object", x_future: true }))
      .toThrow(/unsupported schema keyword x_future/);
  });

  it("counts 128 non-BMP characters as 128 code points, not 256 UTF-16 units", () => {
    const valid = vectors.golden.find((entry) => entry.name.endsWith("128_non_bmp"));
    const invalid = vectors.rejections.find((entry) => entry.name.endsWith("129_non_bmp"));
    const validId = valid.payload.journey_id;
    const invalidId = JSON.parse(invalid.json).journey_id;

    expect([...validId]).toHaveLength(128);
    expect(validId.length).toBe(256);
    expect(validatePayload(valid.kind, valid.payload)).toEqual(valid.payload);
    expect([...invalidId]).toHaveLength(129);
    expect(() => validatePayloadJson(invalid.kind, invalid.json)).toThrow(PayloadError);
  });
});
