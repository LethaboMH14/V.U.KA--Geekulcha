// Tests for the ledger app's hash router (dashboard/IA.md, "App"). app.js boots only when a
// DOM exists, so importing it here runs nothing. Run: node --test dashboard/ledger/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveRoute, VIEWS } from "../app.js";

test("each view's own hash resolves to itself", () => {
  for (const id of ["overview", "verify", "anchors", "activity", "method", "settings"]) {
    assert.equal(resolveRoute(`#${id}`), id);
    assert.ok(VIEWS[id], `${id} has a page title`);
  }
});

test("old one-page hashes are aliases: #ledger → overview, #how → method", () => {
  assert.equal(resolveRoute("#ledger"), "overview");
  assert.equal(resolveRoute("#how"), "method");
  assert.equal(resolveRoute("#VERIFY"), "verify"); // VIGIL's share link must land on Verify
});

test("empty, unknown and prototype-named hashes fall back to overview", () => {
  for (const hash of ["", "#", undefined, null, "#main", "#verify?x=1", "#constructor", "#__proto__", "#toString"]) {
    assert.equal(resolveRoute(hash), "overview", String(hash));
  }
});
