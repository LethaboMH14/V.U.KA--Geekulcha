// VUKA Ledger: page glue for the public-ledger dashboard (dashboard/ledger/CONTRACT.md).
//
// Everything on this page is live: the ANCHOR server's public routes, its /ws/panel
// feed and the public Hedera testnet mirror. Nothing here reads sample/ (a test
// fixture only). Verification itself lives in lib/pipeline.js and shared/*.js;
// this file wires sources → pipeline → terminal and renders the result.
//
// SECURITY: anything that came from the network or from an export is rendered with
// textContent only. Links built from network data are checked against strict
// patterns before they are used as href. The page never uploads an export.

const here = (p) => new URL(p, import.meta.url).href;

const PATHS = {
  sources: here("./lib/sources.js"),
  pipeline: here("./lib/pipeline.js"),
  terminal: here("./terminal.js"),
  verify: here("../../shared/verify.js"),
  keys: here("../../shared/keys.js"),
  pins: here("../../contracts/keys/verify-pins.json"),
  manifest: here("../../contracts/keys/manifest.json"),
};

const FALLBACK_SERVER = "https://vuka-anchor-server.azurewebsites.net";
const FALLBACK_MIRROR = "https://testnet.mirrornode.hedera.com";
const FALLBACK_TOPIC = "0.0.10687280";
const HASHSCAN = "https://hashscan.io/testnet";
const FEED_MAX = 60;
const RATE_MINUTES = 15;
const MAX_EXPORT_BYTES = 5 * 1024 * 1024;
const LS_SERVER = "vuka-ledger-server";
const LS_THEME = "vuka-ledger-theme";

const HEX64 = /^[0-9a-f]{64}$/;
const TOPIC_RE = /^\d+\.\d+\.\d+$/;
const TS_RE = /^\d{1,12}\.\d{1,9}$/;

const $ = (id) => document.getElementById(id);
const reducedMotion = (() => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
})();

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}
const SVGNS = "http://www.w3.org/2000/svg";
function svg(tag, attrs = {}) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}
function lsGet(key) { try { return window.localStorage.getItem(key); } catch { return null; } }
function lsSet(key, value) { try { if (value === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, value); } catch { /* storage blocked */ } }

function shortHex(hex, keep = 8) {
  if (typeof hex !== "string") return "";
  return hex.length > keep * 2 + 1 ? `${hex.slice(0, keep)}…${hex.slice(-keep)}` : hex;
}
function pad(n) { return String(n).padStart(2, "0"); }
/** "1790294400.000000001" → Date, or null. */
function consensusToDate(ts) {
  if (typeof ts !== "string" || !TS_RE.test(ts)) return null;
  const [s, ns] = ts.split(".");
  const d = new Date(Number(s) * 1000 + Math.floor(Number(ns.padEnd(9, "0")) / 1e6));
  return Number.isNaN(d.getTime()) ? null : d;
}
function fmtUtc(d, withDate = true) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "unknown time";
  const t = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  return withDate ? `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${t} UTC` : t;
}
function hostOf(url) { try { return new URL(url).host; } catch { return String(url); } }
function safeSeq(n) { const v = Number(n); return Number.isSafeInteger(v) && v > 0 ? v : null; }
function hashscanTx(ts) { return TS_RE.test(String(ts)) ? `${HASHSCAN}/transaction/${ts}` : null; }
function hashscanTopic(topic) { return TOPIC_RE.test(String(topic)) ? `${HASHSCAN}/topic/${topic}` : `${HASHSCAN}/topic/${FALLBACK_TOPIC}`; }
function extLink(href, text) {
  const a = el("a", null, text);
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

// ---------------------------------------------------------------------------
// status: a 6px dot plus a text label (DESIGN.md); the label carries the state,
// the dot's colour only repeats it
// ---------------------------------------------------------------------------
function statusMark(state, label) {
  const span = el("span", "status");
  span.dataset.state = state;
  const dot = el("span", "dot");
  dot.setAttribute("aria-hidden", "true");
  span.append(dot, el("span", "status-label", label));
  return span;
}
function setPill(container, state, label) {
  if (!container) return;
  container.replaceChildren(statusMark(state, label));
}
/** A thrown source error → a short state for the status line; the full text goes in Details. */
function failLabel(message) {
  const m = String(message ?? "");
  if (/^Could not reach/i.test(m)) return "can't connect (network or CORS)";
  if (/did not answer within/i.test(m)) return "timed out";
  const http = /HTTP (\d{3})/.exec(m);
  if (http) return `error (HTTP ${http[1]})`;
  return "error";
}
/** Copy a value; if the clipboard is blocked, select the text node instead. */
function copyText(text, button, target) {
  const done = (label) => {
    button.textContent = label;
    setTimeout(() => { button.textContent = "Copy"; }, 1500);
  };
  const fallback = () => {
    try {
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      done("Selected");
    } catch { done("Copy failed"); }
  };
  try {
    if (!navigator.clipboard?.writeText) { fallback(); return; }
    navigator.clipboard.writeText(text).then(() => done("Copied"), fallback);
  } catch { fallback(); }
}

// ---------------------------------------------------------------------------
// notices (module or pinned-file problems)
// ---------------------------------------------------------------------------
function notice(text) {
  const p = el("p", "notice", text);
  $("notices").append(p);
  return p;
}

/** The non-default-server notice follows the server in use (boot, Apply, Use the default server). */
function serverNotice(defaultServer) {
  state.serverNotice?.remove();
  state.serverNotice = null;
  if (state.server === defaultServer) return;
  // A shared link can carry ?server=; say so plainly. The server only supplies
  // proofs and the feed: every root is still read from the Hedera mirror on the
  // pinned topic, so a different server cannot make a record verify.
  state.serverNotice = notice(`This page is using the ANCHOR server ${hostOf(state.server)}, not the default ${hostOf(defaultServer)}. Its feed and "latest anchor" are its own claims; record roots are still read from the Hedera mirror on the pinned topic. Settings → Use the default server switches back.`);
}

async function loadModule(url, label) {
  try {
    return await import(url);
  } catch (error) {
    notice(`${label} did not load, so part of this page cannot run. ${error?.message ?? ""}`.trim());
    return null;
  }
}
async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${new URL(url).pathname} answered HTTP ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// state
// ---------------------------------------------------------------------------
const state = {
  mods: {},
  pins: null,
  manifest: null,
  manifestFingerprint: null,
  sources: null,
  server: FALLBACK_SERVER,
  mirror: FALLBACK_MIRROR,
  topic: FALLBACK_TOPIC,
  closeFeed: null,
  feedRows: [],
  feedTotal: 0,
  arrivals: [],
  term: null,
  busy: false,
  lastExport: null,
  serverNotice: null,
};

// ---------------------------------------------------------------------------
// theme + settings
// ---------------------------------------------------------------------------
function applyTheme(choice) {
  const root = document.documentElement;
  if (choice === "light" || choice === "dark") root.dataset.theme = choice;
  else delete root.dataset.theme;
  const radio = $(`theme-${choice === "light" || choice === "dark" ? choice : "system"}`);
  if (radio) radio.checked = true;
}

function validServer(value) {
  let url;
  try { url = new URL(String(value).trim()); } catch { return null; }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) return null;
  if (url.username || url.password) return null;
  return url.origin + url.pathname.replace(/\/+$/, "");
}

function chooseServer(defaultServer) {
  const fromQuery = new URLSearchParams(window.location.search).get("server");
  if (fromQuery) {
    const v = validServer(fromQuery);
    if (v) return v;
    notice("The ?server= address was ignored: it must be an https:// address (http:// only for localhost).");
  }
  const saved = validServer(lsGet(LS_SERVER) ?? "");
  return saved ?? defaultServer;
}

// ---------------------------------------------------------------------------
// connections
// ---------------------------------------------------------------------------
function setSource(id, pillState, pillLabel, detail) {
  const li = $(id);
  if (!li) return;
  li.dataset.state = pillState;
  const label = li.querySelector(".src-state");
  if (label) label.textContent = pillLabel;
  const d = $(`${id}-detail`);
  if (d) d.textContent = detail;
  // the header's network dot follows the mirror, the only source the ledger is read from
  if (id === "src-mirror") { const dot = $("net-dot"); if (dot) dot.dataset.state = pillState; }
}

function connect() {
  const { sources: srcMod } = state.mods;
  if (state.closeFeed) { try { state.closeFeed(); } catch { /* closed */ } state.closeFeed = null; }
  if (!srcMod) {
    for (const id of ["src-api", "src-feed", "src-mirror"]) setSource(id, "failed", "not loaded", "lib/sources.js did not load, so no source can be read.");
    renderChainError("The network module did not load.");
    return;
  }
  try {
    state.sources = srcMod.createSources({ server: state.server, network: "testnet" });
  } catch (error) {
    state.sources = null; // late answers from the previous server must not land
    notice(error.message);
    return;
  }
  state.mirror = srcMod.MIRRORS?.testnet ?? FALLBACK_MIRROR;
  loadLatest();
  loadChain();
  openFeed();
}

async function loadLatest() {
  const s = state.sources;
  setSource("src-api", "wait", "checking", `${hostOf(s.server)} · GET /v1/anchor/latest`);
  const tile = $("tile-latest");
  setPill(tile.querySelector(".tile-pill"), "wait", "Checking");
  $("latest-value").textContent = "…";
  $("latest-note").textContent = "Asking the server…";
  try {
    const latest = await s.latest();
    if (s !== state.sources) return; // a newer connect() owns the tile now
    setSource("src-api", "ok", "reachable", `${hostOf(s.server)} · /v1/anchor/latest answered`);
    if (!latest) {
      setPill(tile.querySelector(".tile-pill"), "unavailable", "None yet");
      $("latest-value").textContent = "No confirmed anchor";
      $("latest-note").textContent = "The server answered 404: no batch has been confirmed on the ledger yet.";
      return;
    }
    const r = latest.receipt ?? {};
    const seq = safeSeq(r.sequence_number);
    const when = consensusToDate(r.consensus_timestamp);
    setPill(tile.querySelector(".tile-pill"), "wait", "Checking ledger");
    const v = $("latest-value");
    v.replaceChildren();
    v.append(el("span", "mono", seq ? `#${seq}` : "#?"), document.createTextNode(` · ${fmtUtc(when)}`));
    const note = $("latest-note");
    note.replaceChildren();
    const topic = TOPIC_RE.test(String(r.topic_id)) ? r.topic_id : "(invalid)";
    note.append(document.createTextNode(`Topic ${topic}, epoch ${String(r.topic_epoch ?? "?")}. `));
    const tx = hashscanTx(r.consensus_timestamp);
    if (tx) note.append(extLink(tx, "HashScan ↗"));
    // The server's word alone is not "confirmed": check the receipt against the
    // pinned topic and the mirror's own record at that sequence.
    const [pillState, pillLabel, why] = await confirmOnMirror(s, r, seq);
    if (s !== state.sources) return; // the server changed while the mirror was read
    setPill(tile.querySelector(".tile-pill"), pillState, pillLabel);
    note.append(document.createTextNode(` ${why}`));
  } catch (error) {
    if (s !== state.sources) return;
    setSource("src-api", "failed", failLabel(error.message), `${hostOf(s.server)}: ${error.message}`);
    setPill(tile.querySelector(".tile-pill"), "unavailable", "Unknown");
    $("latest-value").textContent = "Unknown";
    $("latest-note").textContent = "The server could not be reached, so the latest anchor is unknown. The mirror below is independent of it.";
  }
}

/** Cross-check a server receipt against the pins and the mirror → [pillState, label, sentence]. */
async function confirmOnMirror(s, r, seq) {
  const { pipeline } = state.mods;
  if (!pipeline?.confirmReceipt) return ["unavailable", "Unchecked", "The verification module did not load, so the server's receipt was not checked."];
  let m = null;
  const pins = state.pins;
  if (pins?.topic_id && seq && r.topic_id === pins.topic_id && r.topic_epoch === pins.topic_epoch) {
    try {
      m = await s.message(pins.topic_id, seq);
    } catch (error) {
      return ["unavailable", "Server only", `Not confirmed on the mirror: ${error.message}`];
    }
  }
  const c = pipeline.confirmReceipt(r, pins, m);
  return [c.state, c.label, c.reason];
}

// ---------------------------------------------------------------------------
// key manifest: hash the pinned file, compare to the pin and to the 0x02 message
// ---------------------------------------------------------------------------
async function checkPinnedManifest() {
  const tile = $("tile-manifest");
  const { keys } = state.mods;
  if (!state.pins || !state.manifest) {
    setPill(tile.querySelector(".tile-pill"), "failed", "Not loaded");
    $("manifest-value").textContent = "—";
    $("manifest-note").textContent = "The pinned files in contracts/keys/ could not be loaded.";
    return;
  }
  const pin = String(state.pins.manifest_fingerprint_hex ?? "");
  $("manifest-value").textContent = shortHex(pin, 10);
  if (!keys) {
    setPill(tile.querySelector(".tile-pill"), "unavailable", "Not hashed");
    $("manifest-note").textContent = "shared/keys.js did not load, so the pinned manifest was not hashed.";
    return;
  }
  try {
    const digest = await keys.sha256(keys.canonicalManifestBytes(state.manifest));
    state.manifestFingerprint = keys.bytesToHex(digest);
  } catch (error) {
    state.manifestFingerprint = null;
    $("manifest-note").textContent = `The pinned manifest could not be hashed: ${error.message}`;
    setPill(tile.querySelector(".tile-pill"), "failed", "Hash failed");
    return;
  }
  const same = state.manifestFingerprint === pin;
  setPill(tile.querySelector(".tile-pill"), same ? "ok" : "failed", same ? "Pinned" : "Mismatch");
  $("manifest-note").textContent = same
    ? "SHA-256 of the pinned manifest equals the pin. Checking the ledger…"
    : "The pinned manifest does not hash to the pinned fingerprint. Do not trust server signatures.";
}

function markManifestOnLedger(messages, error) {
  const note = $("manifest-note");
  if (!state.manifestFingerprint || state.manifestFingerprint !== state.pins?.manifest_fingerprint_hex) return;
  if (error) {
    note.textContent = "SHA-256 of the pinned manifest equals the pin. The ledger could not be read, so the 0x02 message was not checked.";
    return;
  }
  const hit = messages.find((m) => m.kind === "manifest" && m.payloadHex === state.manifestFingerprint);
  note.replaceChildren();
  if (hit) {
    note.append(document.createTextNode(`Pinned manifest hashes to the pin and matches 0x02 message #${safeSeq(hit.sequence_number) ?? "?"} on the topic. `));
    const tx = hashscanTx(hit.consensus_timestamp);
    if (tx) note.append(extLink(tx, "HashScan ↗"));
  } else {
    setPill($("tile-manifest").querySelector(".tile-pill"), "unavailable", "Not on ledger");
    note.textContent = "The pinned manifest hashes to the pin, but no 0x02 message with that fingerprint is among the topic messages read.";
  }
}

// ---------------------------------------------------------------------------
// the chain of anchored roots (Hedera mirror)
// ---------------------------------------------------------------------------
/** One quiet full-width row in the topic-messages table: loading, empty or error. */
function chainQuietRow(message) {
  const tr = el("tr", "is-empty");
  const td = el("td", "empty", message);
  td.colSpan = 5;
  tr.append(td);
  $("chain").replaceChildren(tr);
}
function renderChainError(message) {
  chainQuietRow(message);
  $("chain-note").textContent = "";
}

async function loadChain() {
  const s = state.sources;
  const mirrorHost = hostOf(state.mirror);
  setSource("src-mirror", "wait", "checking", `${mirrorHost} · topic ${state.topic}`);
  $("chain-note").textContent = "";
  chainQuietRow(`Reading topic ${state.topic} from the Hedera mirror…`);
  let messages;
  try {
    messages = await s.topicMessages(state.topic, { limit: 100, order: "desc" });
  } catch (error) {
    if (s !== state.sources) return;
    setSource("src-mirror", "failed", failLabel(error.message), `${mirrorHost}: ${error.message}`);
    renderChainError(`Hedera mirror: ${failLabel(error.message)}. Nothing is shown in its place. The raw error is under Details in the status line.`);
    markManifestOnLedger([], error);
    return;
  }
  if (s !== state.sources) return;
  setSource("src-mirror", "ok", "reachable", `${mirrorHost} · ${messages.length} message${messages.length === 1 ? "" : "s"} read`);
  let manifestPool = messages;
  const pinnedOnPage = (list) => list.some((m) => m.kind === "manifest" && m.payloadHex === state.manifestFingerprint);
  if (messages.length >= 100 && !pinnedOnPage(messages)) {
    // The 0x02 message is published before the first root, so on a busy topic it
    // is older than the newest 100 (which may hold a later 0x02): read the oldest ones too.
    try {
      manifestPool = messages.concat(await s.topicMessages(state.topic, { limit: 100, order: "asc" }));
    } catch { /* keep the newest page; the note says "among the topic messages read" */ }
  }
  if (s !== state.sources) return;
  markManifestOnLedger(manifestPool, null);

  const roots = messages.filter((m) => m.kind === "root");
  const manifests = messages.filter((m) => m.kind === "manifest");
  const others = messages.length - roots.length - manifests.length;
  const count = messages.length >= 100 ? "at least 100 messages (the newest 100 were read)" : `${messages.length} message${messages.length === 1 ? "" : "s"}`;
  const note = $("chain-note");
  if (messages.length === 0) {
    note.textContent = "";
    chainQuietRow(`Topic ${state.topic} has no messages on the mirror yet. Roots appear here once ANCHOR publishes its first batch.`);
    return;
  }
  const parts = [`${roots.length} root${roots.length === 1 ? "" : "s"} (0x01)`, `${manifests.length} key manifest${manifests.length === 1 ? "" : "s"} (0x02)`];
  if (others > 0) parts.push(`${others} other`);
  note.textContent = roots.length === 0
    ? `No record fingerprints anchored on this topic yet. The mirror returned ${count} on topic ${state.topic}: ${parts.join(", ")}.`
    : `The mirror returned ${count} on topic ${state.topic}: ${parts.join(", ")}.`;

  const list = $("chain");
  list.replaceChildren();
  for (const m of messages.slice(0, 30)) list.append(renderMessageRow(m));
}

/** Seq · Type · Payload (short, copyable) · Consensus time (UTC) · Links. */
function renderMessageRow(m) {
  const tr = el("tr");
  tr.dataset.kind = m.kind;
  const seq = safeSeq(m.sequence_number);
  const tdSeq = el("td", "mono num", seq ? String(seq) : "?");
  const tdType = el("td", m.kind === "root" || m.kind === "manifest" ? null : "type-other",
    m.kind === "root" ? "Root" : m.kind === "manifest" ? "Manifest" : "Other");
  tdType.title = m.kind === "root" ? "0x01: a record fingerprint (Merkle root)" : m.kind === "manifest" ? "0x02: the server's key manifest fingerprint" : "Not a VUKA message type";
  const tdPayload = el("td");
  if (m.payloadHex) {
    const wrap = el("span", "payload");
    const short = el("span", "mono", shortHex(m.payloadHex, 8));
    short.title = m.payloadHex;
    short.setAttribute("aria-hidden", "true"); // screen readers get the full value below
    const full = el("span", "sr-only", m.payloadHex);
    const btn = el("button", "btn btn-quiet btn-sm", "Copy");
    btn.type = "button";
    btn.setAttribute("aria-label", `Copy the full payload of message ${seq ?? "?"}`);
    btn.addEventListener("click", () => copyText(m.payloadHex, btn, full));
    wrap.append(short, full, btn);
    tdPayload.append(wrap);
  } else {
    tdPayload.append(el("span", "mono", `${m.bytes?.length ?? 0} bytes`));
  }
  const tdTime = el("td", "mono", fmtUtc(consensusToDate(m.consensus_timestamp)).replace(/ UTC$/, ""));
  const tdLinks = el("td");
  const links = el("span", "cell-links");
  const tx = hashscanTx(m.consensus_timestamp);
  if (tx) links.append(extLink(tx, "HashScan ↗"));
  if (seq && TOPIC_RE.test(state.topic)) links.append(extLink(`${state.mirror}/api/v1/topics/${state.topic}/messages/${seq}`, "Mirror ↗"));
  tdLinks.append(links);
  tr.append(tdSeq, tdType, tdPayload, tdTime, tdLinks);
  return tr;
}

// ---------------------------------------------------------------------------
// live feed (/ws/panel) + events-per-minute chart
// ---------------------------------------------------------------------------
function openFeed() {
  const s = state.sources;
  const host = hostOf(s.server);
  setSource("src-feed", "wait", "connecting", `${host} · /ws/panel`);
  setPill($("feed-pill"), "wait", "Connecting");
  $("feed-empty").textContent = "Connecting to the live feed…";
  let opened = false;
  state.closeFeed = s.panel(onFeedRow, (st) => {
    if (st === "open") {
      opened = true;
      setSource("src-feed", "ok", "connected", `${host} · /ws/panel open`);
      setPill($("feed-pill"), "ok", "Live");
      if (state.feedRows.length === 0) $("feed-empty").textContent = "Connected. No events have arrived yet; each accepted event appears here as it happens.";
    } else {
      const why = opened
        ? "The connection closed."
        : "The WebSocket could not be opened (the browser reports no detail for WebSocket failures).";
      setSource("src-feed", st === "error" ? "failed" : "unavailable", opened ? "closed" : "can't connect", `${host} · /ws/panel: ${why}`);
      setPill($("feed-pill"), "unavailable", opened ? "Closed" : "Unreachable");
      if (state.feedRows.length === 0) $("feed-empty").textContent = `No live feed. ${why} Use Reconnect to try again.`;
    }
  });
}

function onFeedRow(row) {
  const subject = typeof row.subject === "string" ? row.subject.slice(0, 32) : "?";
  const index = Number.isSafeInteger(row.chain_index) ? row.chain_index : null;
  const hash = typeof row.event_hash === "string" ? row.event_hash.slice(0, 64) : "";
  const at = typeof row.received_at === "string" ? new Date(row.received_at) : null;
  const when = at && !Number.isNaN(at.getTime()) ? at : new Date();
  const simulated = row.simulated === true && typeof row.kind === "string";
  const kind = simulated ? row.kind.slice(0, 40) : null;

  state.feedTotal += 1;
  state.arrivals.push(Date.now()); // "received" per minute: arrival time here, not a server-supplied time
  const cutoff = Date.now() - (RATE_MINUTES + 1) * 60000;
  state.arrivals = state.arrivals.filter((t) => t >= cutoff);

  const tr = el("tr", reducedMotion ? null : "is-new");
  const tdSub = el("td", "mono", subject);
  tdSub.title = "Salted hash; changes on every server restart";
  const tdIdx = el("td", "mono num", index === null ? "?" : String(index));
  const tdHash = el("td", "mono", shortHex(hash, 6));
  tdHash.title = hash;
  const tdAt = el("td", "mono", fmtUtc(when, false));
  const tdKind = el("td");
  if (kind) {
    const wrap = el("span", "kind");
    wrap.append(el("span", "mono", kind), el("span", "sim-tag", "SIMULATED"));
    tdKind.append(wrap);
  } else {
    tdKind.append(el("span", "mono", "hidden"));
    tdKind.title = "Kinds are shown only for sim_ test subjects";
  }
  tr.append(tdSub, tdIdx, tdHash, tdAt, tdKind);
  const body = $("feed-body");
  body.prepend(tr);
  while (body.children.length > FEED_MAX) body.lastElementChild.remove();
  state.feedRows = [...body.children];
  const emptyBody = $("feed-empty-body");
  if (emptyBody) emptyBody.hidden = true; else $("feed-empty").hidden = true;
  $("feed-count").textContent = `${state.feedTotal} event${state.feedTotal === 1 ? "" : "s"} since this page opened`;
  drawRate();
}

let rateObserved = false;
function drawRate() {
  const chart = $("rate-chart");
  if (!chart) return;
  if (!rateObserved && "ResizeObserver" in window) {
    // the SVG is drawn at its real pixel width so text never scales; redraw on resize
    rateObserved = true;
    new ResizeObserver(() => drawRate()).observe(chart);
  }
  const measured = Math.round(chart.getBoundingClientRect().width);
  const W = measured > 0 ? measured : 1152, H = 96, T = 22, B = 20;
  chart.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const now = Date.now();
  const minuteNow = Math.floor(now / 60000);
  const bins = [];
  for (let i = RATE_MINUTES - 1; i >= 0; i -= 1) bins.push({ minute: minuteNow - i, n: 0 });
  for (const t of state.arrivals) {
    const idx = Math.floor(t / 60000) - (minuteNow - RATE_MINUTES + 1);
    if (idx >= 0 && idx < RATE_MINUTES) bins[idx].n += 1;
  }
  const max = Math.max(...bins.map((b) => b.n));
  const top = Math.max(4, max);
  const plotH = H - T - B;
  const base = T + plotH;
  const slot = W / RATE_MINUTES;
  const barW = Math.max(3, Math.min(24, slot * 0.6));
  const barTop = (n) => base - Math.max(2, (n / top) * plotH);

  chart.replaceChildren();
  chart.append(svg("line", { x1: 0, x2: W, y1: base + 0.5, y2: base + 0.5, class: "c-base" }));
  for (const [x, anchor, label] of [[0, "start", `${RATE_MINUTES} min ago`], [W, "end", "now"]]) {
    const t = svg("text", { x, y: H - 4, "text-anchor": anchor, class: "c-axis" });
    t.textContent = label;
    chart.append(t);
  }
  const total = bins.reduce((a, b) => a + b.n, 0);
  if (total === 0) {
    const t = svg("text", { x: W / 2, y: T + plotH / 2 + 4, "text-anchor": "middle", class: "c-empty" });
    t.textContent = state.feedTotal === 0 ? "No events received yet" : `No events in the last ${RATE_MINUTES} minutes`;
    chart.append(t);
  } else {
    // one direct label: the newest minute's value
    const last = bins[RATE_MINUTES - 1];
    const cx = slot * (RATE_MINUTES - 1) + slot / 2;
    const wide = slot >= 56;
    const t = svg("text", { x: wide ? cx : W, y: (last.n > 0 ? barTop(last.n) : base) - 6, "text-anchor": wide ? "middle" : "end", class: "c-label" });
    t.textContent = `${last.n}/min`;
    chart.append(t);
  }
  const tip = $("rate-tip");
  bins.forEach((b, i) => {
    const cx = slot * i + slot / 2;
    let bar = null;
    if (b.n > 0) {
      const x0 = cx - barW / 2, x1 = cx + barW / 2, y0 = barTop(b.n);
      const r = Math.min(2, barW / 2, (base - y0) / 2);
      // rounded top, square on the baseline
      bar = svg("path", { d: `M${x0} ${base}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${base}Z`, class: "c-bar" });
      chart.append(bar);
    }
    const hit = svg("rect", { x: slot * i, y: 0, width: slot, height: base, class: "c-hit" });
    const d = new Date(b.minute * 60000);
    const text = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC · ${b.n} event${b.n === 1 ? "" : "s"}`;
    hit.addEventListener("pointerenter", () => {
      tip.textContent = text;
      const box = chart.getBoundingClientRect();
      tip.style.left = `${Math.min(Math.max(cx * (box.width / W), 60), box.width - 60)}px`;
      tip.style.top = `${(b.n > 0 ? barTop(b.n) : base) * (box.height / H)}px`;
      tip.hidden = false;
      bar?.classList.add("is-hover");
    });
    hit.addEventListener("pointerleave", () => { tip.hidden = true; bar?.classList.remove("is-hover"); });
    chart.append(hit);
  });
  chart.setAttribute("aria-label", `Events received per minute over the last ${RATE_MINUTES} minutes: ${total} in total, at most ${max} in one minute. The table below lists each event.`);
}

// ---------------------------------------------------------------------------
// verify a record
// ---------------------------------------------------------------------------
function fallbackTerminal(root) {
  root.replaceChildren();
  const list = el("ol", "fallback-term");
  list.setAttribute("role", "log");
  list.setAttribute("aria-live", "polite");
  root.append(list);
  const add = (text, tone = "info") => { list.append(el("li", `t-${tone}`, text)); list.scrollTop = list.scrollHeight; };
  return {
    clear() { list.replaceChildren(); },
    line: add,
    async play(steps) {
      const it = steps[Symbol.asyncIterator]();
      for (;;) {
        const { value, done } = await it.next();
        if (done) return value ?? null;
        const mark = value.ok === true ? "✓" : value.ok === false ? "✗" : "·";
        add(`${mark} ${value.label ?? ""}${value.detail ? ` — ${value.detail}` : ""}${value.value ? ` ${shortHex(String(value.value), 8)}` : ""}`,
          value.ok === true ? "ok" : value.ok === false ? "fail" : "dim");
      }
    },
  };
}

/** Pass the pipeline's steps through while keeping its return value (the Result). */
async function* tap(gen, sink) {
  const result = yield* gen;
  sink.result = result;
  return result;
}

function setBusy(on) {
  state.busy = on;
  for (const id of ["btn-verify", "btn-clear"]) { const b = $(id); if (b) b.disabled = on; }
  $("btn-verify").textContent = on ? "Verifying…" : "Verify";
}

async function runVerify(text, name = "record.json") {
  if (state.busy) return;
  const { pipeline, verify } = state.mods;
  const term = state.term;
  if (!pipeline || !term) {
    showResult({ state: "unavailable", reason: "The verification module did not load, so nothing was checked.", notChecked: true }, null);
    return;
  }
  setBusy(true);
  $("result").hidden = true;
  term.clear();
  try {
    let exportObj;
    if (typeof text === "string" && text.length > MAX_EXPORT_BYTES) {
      const reason = `That text is ${(text.length / 1048576).toFixed(1)} MB; exports are far smaller. Paste the JSON VIGIL shared.`;
      term.line(reason, "fail");
      showResult({ state: "failed", reason, firstBroken: null }, null);
      return;
    }
    try {
      exportObj = pipeline.exportFromShare ? pipeline.exportFromShare(text) : JSON.parse(text);
    } catch (error) {
      term.line(error.message, "fail");
      showResult({ state: "failed", reason: error.message, firstBroken: null }, null);
      return;
    }
    state.lastExport = exportObj;
    if (!state.pins || !state.manifest) {
      const reason = "The pinned key files (contracts/keys/) could not be loaded, so server signatures cannot be checked.";
      term.line(reason, "fail");
      showResult({ state: "failed", reason, firstBroken: null }, null);
      return;
    }

    const head = verify?.chainHeadHex ? verify.chainHeadHex(exportObj) : exportObj?.entries?.at?.(-1)?.event_hash;
    let proof = null;
    let ledgerMessage = null;
    let proofError = null;
    let messageError = null;
    const s = state.sources;
    if (s && typeof head === "string" && HEX64.test(head)) {
      term.line(`Asking ${hostOf(s.server)} for the Merkle proof of head ${shortHex(head, 8)}`, "dim");
      try {
        proof = await s.proof(head);
        term.line(proof
          ? `Proof received: ${proof.path.length} step${proof.path.length === 1 ? "" : "s"}, ledger sequence ${safeSeq(proof.receipt?.sequence_number) ?? "?"}.`
          : "The server has no confirmed anchor containing this head yet.", proof ? "accent" : "dim");
      } catch (error) {
        proofError = error.message;
        term.line(`Proof not available: ${error.message}`, "fail");
      }
      const seq = safeSeq(proof?.receipt?.sequence_number);
      if (seq) {
        // Always the pinned topic: the server only names a sequence; the root
        // itself comes from the mirror on the topic in contracts/keys/.
        const topic = state.pins.topic_id;
        term.line(`Reading message #${seq} of topic ${topic} from ${hostOf(state.mirror)}`, "dim");
        try {
          ledgerMessage = await s.message(topic, seq);
          if (!ledgerMessage) term.line("The mirror has no message at that sequence.", "fail");
        } catch (error) {
          messageError = error.message;
          term.line(`Ledger message not available: ${error.message}`, "fail");
        }
      }
    } else if (!s) {
      term.line("The network module did not load; only the chain itself can be checked.", "fail");
    }

    const sink = {};
    const steps = tap(pipeline.verifyTrace(exportObj, { pins: state.pins, manifest: state.manifest, proof, ledgerMessage, archived: false }), sink);
    const safeName = String(name).replace(/[^\w.\-]/g, "_").slice(0, 60) || "record.json";
    let played;
    try {
      played = await term.play(steps, { speed: 1, command: `vuka verify ${safeName}` });
    } catch (error) {
      showResult({ state: "failed", reason: `The trace stopped: ${error.message}`, firstBroken: null }, null);
      return;
    }
    const result = sink.result ?? played;
    if (!result) {
      showResult({ state: "failed", reason: "The verifier returned no result.", firstBroken: null }, null);
      return;
    }
    showResult(result, { proof, ledgerMessage, proofError, messageError });
  } finally {
    setBusy(false);
  }
}

// label: the status line next to the dot; lead: the reason's first sentence (none where the reason already says it).
const RESULT_COPY = {
  "live-verified": {
    label: "Live-verified",
    lead: "This record matches the public ledger.",
  },
  archived: {
    label: "Archived",
    lead: "Matches a stored copy of the ledger message, not a live reading.",
  },
  unavailable: {
    label: "Unavailable",
    lead: "",
  },
  failed: {
    label: "Failed",
    lead: "",
  },
};

// shared/verify.js reason codes → a plain sentence for the reader (the code stays in brackets).
const REASON_TEXT = {
  event_hash_mismatch: "This entry's contents do not match its recorded hash, so it was changed after it was written",
  prev_hash_mismatch: "This entry does not link to the one before it, so an entry was removed, added or reordered",
  commitment_mismatch: "The entry's payload or salt does not match its commitment",
  payload_salt_mismatch: "The entry's payload and salt do not match each other",
  signature_invalid: "The entry's signature does not verify with the key registered for it",
  server_signature_invalid: "The server signature does not verify with the pinned server key",
  unknown_signer_key: "The entry is signed by a key that was never registered in this record",
  counter_replay: "The signer's counter repeats or goes backwards, as in a replayed entry",
  key_conflict: "A signer key is registered twice with different values",
  actor_mismatch: "The entry's actor does not match its signing key",
  bad_shape: "The export is not in the expected shape",
  empty_export: "The export has no entries",
};
function plainReason(reason) {
  const code = String(reason ?? "");
  return REASON_TEXT[code] ? `${REASON_TEXT[code]} (${code})` : code || "A check failed";
}

function showResult(result, ctx) {
  const st = RESULT_COPY[result.state] ? result.state : "failed";
  const copy = RESULT_COPY[st];
  const card = $("result");
  card.dataset.state = st;
  const brokenAt = st === "failed" && Number.isInteger(result.firstBroken) ? result.firstBroken : null;
  const label = brokenAt === null ? copy.label : `Failed at entry ${brokenAt}`;
  $("result-title").textContent = label;

  const receipt = result.receipt ?? ctx?.proof?.receipt ?? null;
  const msg = ctx?.ledgerMessage ?? null;
  const when = consensusToDate(msg?.consensus_timestamp ?? receipt?.consensus_timestamp);
  let text;
  if (st === "live-verified") {
    text = `Your browser recomputed ${result.entries} entr${result.entries === 1 ? "y" : "ies"}, the Merkle root, and read the same root from Hedera testnet message #${safeSeq(msg?.sequence_number ?? receipt?.sequence_number) ?? "?"}, reached consensus ${fmtUtc(when)}. The record existed in this form, in this order, no later than that time. It does not show that the events were real.`;
  } else if (st === "archived") {
    text = "Every check passed against a stored copy. A stored copy is not independent; read the ledger live before relying on it.";
  } else if (st === "unavailable") {
    const why = ctx?.proofError ? `The proof could not be fetched: ${ctx.proofError}` :
      ctx?.messageError ? `The ledger message could not be read: ${ctx.messageError}` :
        result.reason ?? "No confirmed anchor contains this record's latest entry yet.";
    // The not-anchored reason already names the anchoring cadence; do not say it twice.
    const later = /anchoring runs/i.test(why) ? " Try again later." : " Anchoring runs within a minute for PIN-gated events and hourly for the rest; try again later.";
    text = result.notChecked
      ? why
      : `Every hash, link and signature in the record checks out. ${why}${later}`;
  } else {
    // The entry number is already in the status line ("Failed at entry n").
    const reason = plainReason(result.reason);
    text = `${reason}${/[.!?]$/.test(reason) ? "" : "."} Do not rely on this record.`;
  }
  $("result-text").textContent = copy.lead ? `${copy.lead} ${text}` : text;

  const rows = [];
  if (!result.notChecked && (st !== "failed" || result.head)) {
    rows.push(["Status", label]);
    rows.push(["Merkle root", result.root ?? "not computed"]);
    rows.push(["Chain head", result.head ?? "unknown"]);
    rows.push(["Entries", String(result.entries ?? "?")]);
    rows.push(["Topic", receipt?.topic_id ?? state.pins?.topic_id ?? "—"]);
    rows.push(["Sequence", String(safeSeq(msg?.sequence_number ?? receipt?.sequence_number) ?? "—")]);
    rows.push(["Consensus time", when ? `${fmtUtc(when)} (${msg?.consensus_timestamp ?? receipt?.consensus_timestamp})` : "—"]);
    rows.push(["Running hash", msg?.running_hash ?? receipt?.running_hash ?? "—"]);
    rows.push(["Network", `Hedera ${state.pins?.network ?? "testnet"}, epoch ${receipt?.topic_epoch ?? state.pins?.topic_epoch ?? "?"}`]);
    rows.push(["Key manifest", state.pins?.manifest_fingerprint_hex ?? "—"]);
    rows.push(["Checked at", `${fmtUtc(new Date())} by VUKA Ledger in the browser`]);
  }
  const list = $("keep-list");
  list.replaceChildren();
  for (const [k, v] of rows) {
    const th = el("th", null, k);
    th.scope = "row";
    const tr = el("tr");
    tr.append(th, el("td", null, v));
    list.append(tr);
  }
  $("keep").hidden = rows.length === 0;
  $("keep-note").textContent = st === "live-verified"
    ? "File these values with your records. Anyone can later check the root against the same topic and sequence."
    : st === "unavailable"
      ? "Not yet matched to the ledger. You can keep the head and root now and verify again once the record is anchored."
      : "These values were computed but are not confirmed by the ledger.";
  card.dataset.copy = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  $("copy-status").textContent = "";
  card.hidden = false;
  if (!reducedMotion) card.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function copyFingerprint() {
  const card = $("result");
  const text = card.dataset.copy ?? "";
  const status = $("copy-status");
  const fallback = () => {
    const range = document.createRange();
    range.selectNodeContents($("keep-list"));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    status.textContent = "Selected. Press Ctrl+C or ⌘C to copy.";
  };
  try {
    if (!navigator.clipboard?.writeText) { fallback(); return; }
    navigator.clipboard.writeText(text).then(() => { status.textContent = "Copied."; }, fallback);
  } catch { fallback(); }
}

function readFile(file) {
  if (!file) return;
  if (file.size > MAX_EXPORT_BYTES) {
    $("input-note").textContent = `That file is ${(file.size / 1048576).toFixed(1)} MB; exports are far smaller. Choose the JSON file VIGIL shared.`;
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result ?? "");
    $("export-text").value = text;
    $("input-note").textContent = `Loaded ${file.name} (${text.length.toLocaleString()} characters). Nothing was uploaded.`;
    runVerify(text, file.name);
  };
  reader.onerror = () => { $("input-note").textContent = "The file could not be read. Try pasting its contents instead."; };
  reader.readAsText(file);
}

function wireVerify() {
  const drop = $("drop");
  const file = $("export-file");
  file.addEventListener("change", () => { readFile(file.files?.[0]); file.value = ""; });
  for (const ev of ["dragenter", "dragover"]) {
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("is-over"); });
  }
  for (const ev of ["dragleave", "dragend"]) drop.addEventListener(ev, () => drop.classList.remove("is-over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("is-over");
    readFile(e.dataTransfer?.files?.[0]);
  });
  // stop a file dropped next to the zone from navigating away
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => e.preventDefault());

  $("btn-verify").addEventListener("click", () => {
    const text = $("export-text").value.trim();
    if (!text) {
      $("input-note").textContent = "Paste an export or choose a file first. In VIGIL: Settings → My record → Share with a bank or insurer.";
      $("export-text").focus();
      return;
    }
    runVerify(text, "pasted.json");
  });
  $("btn-clear").addEventListener("click", () => {
    $("export-text").value = "";
    $("result").hidden = true;
    state.term?.clear();
    state.term?.line("Waiting for a record. Drop the file VIGIL shared, or paste it.", "dim");
    $("input-note").textContent = "Nothing is uploaded. The proof comes from the ANCHOR server and the root from the public Hedera mirror.";
  });
  $("btn-copy").addEventListener("click", copyFingerprint);
}

// ---------------------------------------------------------------------------
// nav highlight
// ---------------------------------------------------------------------------
/** Header field: Enter moves to Verify with the pasted record (or fingerprint) in the paste box. Nothing runs by itself. */
function wireQuick() {
  const form = $("quick-form");
  const input = $("quick-input");
  if (!form || !input) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    const box = $("export-text");
    if (!text || !box) return;
    box.value = text;
    const note = $("input-note");
    if (note) {
      note.textContent = /^[0-9a-fA-F]{64}$/.test(text)
        ? "That is a 64-hex fingerprint. This page checks a whole record: paste the export JSON VIGIL shared, then compare its Merkle root or chain head with this value."
        : "Record copied from the header field. Press Verify to check it.";
    }
    input.value = "";
    if (location.hash === "#verify") $("verify")?.scrollIntoView();
    else location.hash = "#verify";
    box.focus({ preventScroll: true });
  });
}

function wireNav() {
  const links = [...document.querySelectorAll("[data-nav]")];
  const mark = (id) => links.forEach((a) => a.setAttribute("aria-current", String(a.dataset.nav === id)));
  mark((location.hash || "#ledger").slice(1));
  // "Method" is the tab label for #how; #method is accepted as an alias
  const alias = () => { if (location.hash === "#method") { $("how")?.scrollIntoView(); mark("how"); } };
  alias();
  window.addEventListener("hashchange", alias);
  wireQuick();
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) mark(visible.target.id);
  }, { rootMargin: "-120px 0px -55% 0px", threshold: [0, 0.25, 0.5] });
  for (const id of ["ledger", "verify", "how", "settings"]) { const s = $(id); if (s) io.observe(s); }
}

// ---------------------------------------------------------------------------
// settings
// ---------------------------------------------------------------------------
function wireSettings(defaultServer) {
  const input = $("server-url");
  input.value = state.server;
  $("settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = validServer(input.value);
    const status = $("settings-status");
    if (!v) {
      status.textContent = "Enter an https:// address (http:// only for localhost).";
      input.focus();
      return;
    }
    state.server = v;
    input.value = v;
    lsSet(LS_SERVER, v === defaultServer ? null : v);
    status.textContent = `Using ${hostOf(v)}. Reconnecting…`;
    serverNotice(defaultServer);
    connect();
  });
  $("btn-reset").addEventListener("click", () => {
    state.server = defaultServer;
    input.value = defaultServer;
    lsSet(LS_SERVER, null);
    $("settings-status").textContent = `Using the default server, ${hostOf(defaultServer)}.`;
    serverNotice(defaultServer);
    connect();
  });
  for (const r of document.querySelectorAll('input[name="theme"]')) {
    r.addEventListener("change", () => { applyTheme(r.value); lsSet(LS_THEME, r.value === "system" ? null : r.value); });
  }
  $("feed-reconnect").addEventListener("click", () => {
    if (state.closeFeed) { try { state.closeFeed(); } catch { /* closed */ } }
    if (state.sources) openFeed();
  });
}

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------
async function boot() {
  applyTheme(lsGet(LS_THEME) ?? "system");
  wireNav();
  drawRate();

  const [sources, pipeline, terminal, verify, keys] = await Promise.all([
    loadModule(PATHS.sources, "The network module (lib/sources.js)"),
    loadModule(PATHS.pipeline, "The verification module (lib/pipeline.js)"),
    loadModule(PATHS.terminal, "The terminal (terminal.js)"),
    loadModule(PATHS.verify, "shared/verify.js"),
    loadModule(PATHS.keys, "shared/keys.js"),
  ]);
  state.mods = { sources, pipeline, terminal, verify, keys };

  try {
    [state.pins, state.manifest] = await Promise.all([fetchJson(PATHS.pins), fetchJson(PATHS.manifest)]);
  } catch (error) {
    notice(`The pinned key files could not be loaded (${error.message}). Records cannot be verified until they load.`);
  }
  if (state.pins?.topic_id && TOPIC_RE.test(state.pins.topic_id)) state.topic = state.pins.topic_id;
  $("intro-topic").textContent = state.topic;
  const topicLink = $("topic-link");
  topicLink.textContent = state.topic;
  topicLink.href = hashscanTopic(state.topic);
  $("topic-note").textContent = state.pins ? "Pinned in contracts/keys/verify-pins.json." : "The pin file did not load; this is the built-in default topic.";
  setPill($("tile-topic").querySelector(".tile-pill"), state.pins ? "info" : "unavailable", state.pins ? "Pinned" : "Not loaded");
  const epochValue = $("epoch-value");
  if (epochValue) epochValue.textContent = state.pins ? `Hedera ${String(state.pins.network ?? "testnet")} · epoch ${String(state.pins.topic_epoch ?? "?")}` : "Unknown (pins not loaded)";

  // terminal
  const host = $("terminal");
  try {
    state.term = terminal?.createTerminal
      ? terminal.createTerminal(host, { reducedMotion, title: "vuka-verify — live", command: "vuka verify record.json" })
      : fallbackTerminal(host);
  } catch (error) {
    notice(`The terminal could not start (${error.message}); a plain log is used instead.`);
    state.term = fallbackTerminal(host);
  }
  state.term.line("Waiting for a record. Drop the file VIGIL shared, or paste it.", "dim");

  const defaultServer = sources?.DEFAULT_SERVER ?? FALLBACK_SERVER;
  state.server = chooseServer(defaultServer);
  serverNotice(defaultServer);
  wireSettings(defaultServer);
  wireVerify();

  await checkPinnedManifest();
  connect();
  setInterval(drawRate, 30000);
}

boot().catch((error) => notice(`The page could not start: ${error.message}`));
