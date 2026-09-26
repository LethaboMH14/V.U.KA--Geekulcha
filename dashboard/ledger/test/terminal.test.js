// Tests for dashboard/ledger/terminal.js: pure helpers, plus a smoke test of
// play() on a tiny fake DOM (no jsdom dependency). Run: node --test dashboard/ledger/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createTerminal, displayValue, entryHeaderText, phaseTag, shortenHex, toneForOk, verdictSummary,
} from "../terminal.js";

const HEX64 = "a1b2c3d4" + "0".repeat(48) + "e5f6a7b8";

test("shortenHex keeps 8…8 and leaves short hex alone", () => {
  assert.equal(shortenHex(HEX64), "a1b2c3d4…e5f6a7b8");
  assert.equal(shortenHex("0x" + HEX64), "0xa1b2c3d4…e5f6a7b8");
  assert.equal(shortenHex("abcd"), "abcd");
  assert.equal(shortenHex("not hex"), "not hex");
});

test("displayValue marks long hex and long text copyable", () => {
  assert.deepEqual(displayValue(HEX64), { text: "a1b2c3d4…e5f6a7b8", full: HEX64, hex: true, copyable: true });
  assert.equal(displayValue(null), null);
  assert.equal(displayValue("0x01").copyable, false);
  const long = "payload hidden (commitment only) and a much longer tail";
  assert.equal(displayValue(long).text.length, 44);
  assert.equal(displayValue(long).copyable, true);
});

test("phase tags and tones", () => {
  assert.equal(phaseTag("event_hash"), "hash");
  assert.equal(phaseTag("signature"), "sig");
  assert.equal(phaseTag("something_new"), "somethi");
  assert.equal(phaseTag("__proto__"), "__proto");
  assert.equal(toneForOk(true).tone, "ok");
  assert.equal(toneForOk(false).tone, "fail");
  assert.equal(toneForOk(null).tone, "info");
  assert.equal(entryHeaderText(3, "checkin_result"), "── entry #3 · checkin_result ──");
  assert.equal(entryHeaderText(3), "── entry #3 ──");
});

test("verdictSummary covers the four Result states", () => {
  assert.equal(verdictSummary({ state: "live-verified" }).title, "LIVE-VERIFIED");
  assert.equal(verdictSummary({ state: "archived" }).title, "ARCHIVED (SAMPLE — not independent)");
  assert.equal(verdictSummary({ state: "unavailable" }).title, "UNAVAILABLE");
  const f = verdictSummary({ state: "failed", firstBroken: 4, reason: "prev link mismatch" });
  assert.equal(f.title, "FAILED at entry #4");
  assert.equal(f.note, "prev link mismatch");
  assert.equal(verdictSummary({ state: "failed", firstBroken: null }).title, "FAILED");
});

test("terminal.js never uses innerHTML", () => {
  const src = readFileSync(new URL("../terminal.js", import.meta.url), "utf8");
  assert.equal(/innerHTML|outerHTML|insertAdjacentHTML/.test(src.replace(/^\s*\/\/.*$/gm, "")), false);
});

// ---- tiny fake DOM, just enough for createTerminal ----
function fakeDocument() {
  const doc = { hidden: false };
  class Node {
    constructor(tag) {
      Object.assign(this, { tagName: tag, children: [], parent: null, ownerDocument: doc, _text: "", className: "", style: {}, attrs: {} });
      this.scrollTop = 0; this.scrollHeight = 0; this.clientHeight = 0;
      const self = this;
      this.classList = {
        add: (...c) => { self.className = [...new Set([...self.className.split(" ").filter(Boolean), ...c])].join(" "); },
        remove: (...c) => { self.className = self.className.split(" ").filter((x) => x && !c.includes(x)).join(" "); },
        toggle: (c, on) => (on ? self.classList.add(c) : self.classList.remove(c)),
        contains: (c) => self.className.split(" ").includes(c),
      };
    }
    get textContent() { return this.children.length ? this.children.map((c) => c.textContent).join("") : this._text; }
    set textContent(v) { this.children = []; this._text = String(v); }
    append(...ns) { for (const n of ns) { n.parent = this; this.children.push(n); } }
    insertBefore(n, ref) { n.parent = this; this.children.splice(this.children.indexOf(ref), 0, n); }
    remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); }
    replaceChildren() { this.children = []; }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    removeAttribute(k) { if (k === "style") this.style = {}; delete this.attrs[k]; }
    addEventListener() {}
    querySelectorAll(sel) {
      const classes = sel.split(",").map((s) => s.trim().replace(/^\./, ""));
      const out = [];
      const walk = (n) => { for (const c of n.children) { if (classes.some((k) => c.classList.contains(k))) out.push(c); walk(c); } };
      walk(this);
      return out;
    }
  }
  doc.createElement = (t) => new Node(t);
  doc.createTextNode = (t) => { const n = new Node("#text"); n._text = String(t); return n; };
  doc.defaultView = { matchMedia: () => ({ matches: false }), navigator: {}, getSelection: () => null };
  return doc;
}

async function* trace(tag, result) {
  yield { phase: "parse", label: `Parse ${tag}`, ok: true };
  yield { phase: "canonical", label: "<img src=x onerror=alert(1)>", value: HEX64, ok: true, entry: 0, kind: "registration" };
  yield { phase: "link", label: "Check prev link", value: HEX64, ok: false, entry: 1 };
  yield { phase: "root", label: "Recompute root", value: HEX64, ok: null };
  return result;
}

test("play() renders groups and verdict, returns the Result; a second play never interleaves", async () => {
  const doc = fakeDocument();
  const root = doc.createElement("div");
  const term = createTerminal(root, { reducedMotion: false });
  const body = root.children[1];
  const rA = { state: "failed", firstBroken: 1, reason: "prev link mismatch", head: HEX64, root: null };
  const rB = { state: "archived", firstBroken: null, reason: null, head: HEX64, root: HEX64 };
  const pA = term.play(trace("A", rA), { speed: 1 });
  const pB = term.play(trace("B", rB), { speed: 1 }); // skips A, then runs B
  term.skip();
  assert.equal(await pA, rA);
  assert.equal(await pB, rB);
  const text = body.textContent;
  assert.ok(text.includes("── entry #0 · registration ──"));
  assert.ok(text.includes("<img src=x onerror=alert(1)>"));
  assert.ok(text.includes("FAILED at entry #1"));
  assert.ok(text.indexOf("Parse A") < text.indexOf("FAILED") && text.indexOf("FAILED") < text.indexOf("Parse B"));
  assert.ok(text.includes("ARCHIVED (SAMPLE — not independent)"));
  term.clear();
  assert.equal(body.children.length, 1); // only the idle prompt remains
});

test("animated play completes on its own timers and clears animation styles", async () => {
  const doc = fakeDocument();
  const root = doc.createElement("div");
  const term = createTerminal(root, { reducedMotion: false });
  const r = { state: "live-verified", firstBroken: null, reason: null, head: HEX64, root: HEX64 };
  assert.equal(await term.play(trace("C", r), { speed: 50 }), r);
  assert.equal(root.querySelectorAll("vt-typing, vt-reveal").length, 0);
  assert.ok(root.children[1].textContent.includes("LIVE-VERIFIED"));
});

test("a verdict step is folded into the banner when a Result follows", async () => {
  const doc = fakeDocument();
  const root = doc.createElement("div");
  const term = createTerminal(root, { reducedMotion: true });
  async function* t() {
    yield { phase: "parse", label: "Read export", ok: true };
    yield { phase: "verdict", label: "Verdict: failed", value: "failed", ok: false };
    return { state: "failed", firstBroken: null, reason: "bad", head: null, root: null };
  }
  await term.play(t());
  const text = root.children[1].textContent;
  assert.ok(!text.includes("Verdict: failed"));
  assert.ok(text.includes("FAILED"));
  await term.play([{ phase: "verdict", label: "Verdict: failed", ok: false }]);
  assert.ok(root.children[1].textContent.includes("Verdict: failed"));
});
