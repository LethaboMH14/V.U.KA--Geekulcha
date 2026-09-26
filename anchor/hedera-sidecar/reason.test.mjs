import assert from "node:assert/strict";
import test from "node:test";
import { failureReason } from "./reason.mjs";

class PrecheckStatusError extends Error {}

test("an SDK status code is reported, with the phase, but never the SDK message", () => {
  const error = new PrecheckStatusError("transaction 0.0.10686482@... failed; key 3030020100...");
  error.status = { toString: () => "INVALID_SIGNATURE" };
  const reason = failureReason(error, true);
  assert.equal(reason, "PrecheckStatusError INVALID_SIGNATURE (after submit)");
  assert.doesNotMatch(reason, /3030|0\.0\.10686482/);
});

test("a status is reduced to safe characters, however it renders", () => {
  const error = new Error("x");
  error.status = "Timeout <script>0x44ae secret=abc</script>";
  assert.match(failureReason(error, false), /^Error [A-Za-z0-9_.:-]+ \(before submit\)$/);
});

test("mirror messages and missing dependencies keep their existing text", () => {
  assert.equal(failureReason(new Error("mirror lag exceeded"), true), "mirror lag exceeded (after submit)");
  const missing = new Error("Cannot find package '@hiero-ledger/sdk'");
  missing.code = "ERR_MODULE_NOT_FOUND";
  assert.equal(failureReason(missing, false), "dependencies not installed (run npm ci)");
});

test("anything else stays generic", () => {
  assert.equal(failureReason(new Error("SDK text with 0xdeadbeef"), false), "submission or validation failed (before submit)");
});
