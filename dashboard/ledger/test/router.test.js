// Tests for the ledger app's hash router (dashboard/IA.md, "App"). app.js boots only when a
// DOM exists, so importing it here runs nothing. Run: node --test dashboard/ledger/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { resolveRoute, pageTitle, VIEWS } from "../app.js";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

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

test("page titles read 'View: VUKA Ledger', aliases included", () => {
  assert.equal(pageTitle("verify"), "Verify: VUKA Ledger");
  assert.equal(pageTitle("how"), "Method: VUKA Ledger");
  assert.equal(pageTitle("#nope"), "Overview: VUKA Ledger");
});

test("the <head> first-paint script picks the same view as resolveRoute, and views.css shows each", () => {
  const html = read("index.html");
  const src = /<script id="boot-route">([\s\S]*?)<\/script>/.exec(html)?.[1];
  assert.ok(src, "index.html has the boot-route script");
  const bootView = (hash) => {
    const attrs = {};
    vm.runInNewContext(src, { location: { hash }, document: { documentElement: { setAttribute: (k, v) => { attrs[k] = v; } } } });
    return attrs["data-boot-view"];
  };
  for (const hash of ["", "#", "#verify", "#VERIFY", "#how", "#ledger", "#method", "#settings", "#anchors", "#activity",
    "#overview", "#main", "#bogus", "#verify?x=1", "#constructor", "#__proto__", "#toString", "# verify "]) {
    assert.equal(bootView(hash), resolveRoute(hash), JSON.stringify(hash));
  }
  const css = read("views.css");
  for (const id of Object.keys(VIEWS)) {
    assert.ok(css.includes(`html[data-boot-view="${id}"] section.view[data-view="${id}"]`), `views.css shows ${id} on first paint`);
    assert.match(html, new RegExp(`<section[^>]*data-view="${id}"`), `index.html has a ${id} view`);
  }
});
