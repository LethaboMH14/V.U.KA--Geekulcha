// dashboard/home.js: the home page's mobile menu, its live proof strip and the ANCHOR status.
// The strip reads the public Hedera mirror in this browser (ledger/lib/sources.js)
// and hashes the pinned key manifest exactly as the app does
// (shared/keys.js: sha256(canonicalManifestBytes(manifest))). Network data is written with textContent only.
// Every item shows real data or says plainly why it is unavailable.

const here = (p) => new URL(p, import.meta.url).href;
const PATHS = {
  sources: here("./ledger/lib/sources.js"),
  keys: here("../shared/keys.js"),
  pins: here("../contracts/keys/verify-pins.json"),
  manifest: here("../contracts/keys/manifest.json"),
};
const DEFAULT_TOPIC = "0.0.10687280";
const TOPIC_RE = /^\d+\.\d+\.\d+$/;
const TS_RE = /^\d+\.\d{1,9}$/;
const HASHSCAN = "https://hashscan.io/testnet";
const REFRESH_MS = 60_000;
const SCORE_RUNS = "https://github.com/LethaboMH14/V.U.KA--Geekulcha/actions/workflows/security-score.yml";
// The ANCHOR server (same default as ledger/lib/sources.js DEFAULT_SERVER) and its public health route.
const ANCHOR = "https://vuka-anchor-server.azurewebsites.net";
const HEALTH_TIMEOUT_MS = 8_000;

const $ = (id) => document.getElementById(id);

/* ---------------------------------------------------------------- mobile menu */
function initMenu() {
  const button = $("hm-menu");
  const nav = $("hm-nav");
  if (!button || !nav) return;
  const set = (open) => {
    button.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };
  button.addEventListener("click", () => set(button.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => { if (event.target.closest("a")) set(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      set(false);
      button.focus();
    }
  });
}

/* ---------------------------------------------------------------- helpers */
const SVG_NS = "http://www.w3.org/2000/svg";
function statusChip(kind, label) {
  const chip = document.createElement("span");
  chip.className = "cds-status";
  const icon = document.createElementNS(SVG_NS, "svg");
  for (const [k, v] of Object.entries({ class: "cds-status__icon", "data-kind": kind, viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": "true", focusable: "false" })) {
    icon.setAttribute(k, String(v));
  }
  const CIRCLE = "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Z";
  let shape;
  if (kind === "success") {
    shape = document.createElementNS(SVG_NS, "path");
    shape.setAttribute("fill-rule", "evenodd");
    shape.setAttribute("d", `${CIRCLE}M7 10.8 4.2 8l.9-.9L7 9l3.9-3.9.9.9Z`);
  } else if (kind === "error") {
    shape = document.createElementNS(SVG_NS, "path");
    shape.setAttribute("fill-rule", "evenodd");
    shape.setAttribute("d", `${CIRCLE}M10.7 11.5 8 8.8l-2.7 2.7-.8-.8L7.2 8 4.5 5.3l.8-.8L8 7.2l2.7-2.7.8.8L8.8 8l2.7 2.7Z`);
  } else {
    shape = document.createElementNS(SVG_NS, "circle");
    shape.setAttribute("cx", "8");
    shape.setAttribute("cy", "8");
    shape.setAttribute("r", "6.5");
  }
  shape.setAttribute("class", "cds-status__shape");
  icon.append(shape);
  const text = document.createElement("span");
  text.className = "cds-status__label";
  text.textContent = label;
  chip.append(icon, text);
  return chip;
}

function setItem(prefix, { kind, label, value, note, mono = false, href = null }) {
  const status = $(`${prefix}-status`);
  const valueEl = $(prefix);
  const noteEl = $(`${prefix}-note`);
  status.replaceChildren(statusChip(kind, label));
  valueEl.classList.toggle("mono", mono);
  if (href) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = value;
    valueEl.replaceChildren(a);
  } else {
    valueEl.textContent = value;
  }
  noteEl.textContent = note;
}

function consensusToDate(ts) {
  if (typeof ts !== "string" || !TS_RE.test(ts)) return null;
  const [s, ns] = ts.split(".");
  const d = new Date(Number(s) * 1000 + Math.floor(Number(ns.padEnd(9, "0")) / 1e6));
  return Number.isNaN(d.getTime()) ? null : d;
}

function ago(date) {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

const short = (hex) => (typeof hex === "string" && hex.length > 16 ? `${hex.slice(0, 8)}…${hex.slice(-8)}` : String(hex));
const reason = (error) => (error && typeof error.message === "string" && error.message ? error.message : "The request failed.");

async function getJson(url, what) {
  let response;
  try {
    response = await fetch(url, { headers: { accept: "application/json" } });
  } catch {
    throw new Error(`Could not load ${what}.`);
  }
  if (!response.ok) throw new Error(`${what} answered with HTTP ${response.status}.`);
  try {
    return await response.json();
  } catch {
    throw new Error(`${what} is not valid JSON.`);
  }
}

/* ---------------------------------------------------------------- proof strip */
const state = { topic: DEFAULT_TOPIC, pinnedFingerprint: null, manifestFingerprint: null, manifestError: null, latest: null };

async function loadPins() {
  // Pins and manifest are static files next to this site; they do not need the network.
  let pins = null;
  try {
    pins = await getJson(PATHS.pins, "The pin file");
    if (typeof pins?.topic_id === "string" && TOPIC_RE.test(pins.topic_id)) {
      state.topic = pins.topic_id;
      $("p-topic-note").textContent = "Pinned in contracts/keys/verify-pins.json.";
    } else {
      $("p-topic-note").textContent = "The pin file has no usable topic, so this is the built-in default.";
    }
  } catch (error) {
    $("p-topic-note").textContent = `${reason(error)} This is the built-in default topic.`;
  }
  const topicLink = $("p-topic");
  topicLink.textContent = state.topic;
  topicLink.href = `${HASHSCAN}/topic/${state.topic}`;

  if (typeof pins?.manifest_fingerprint_hex !== "string") {
    state.manifestError = "No pinned manifest fingerprint was available.";
    return;
  }
  state.pinnedFingerprint = pins.manifest_fingerprint_hex;
  try {
    const [manifest, { sha256, bytesToHex, canonicalManifestBytes }] = await Promise.all([
      getJson(PATHS.manifest, "The key manifest"),
      import(PATHS.keys),
    ]);
    state.manifestFingerprint = bytesToHex(await sha256(canonicalManifestBytes(manifest)));
  } catch (error) {
    state.manifestError = reason(error);
  }
}

function renderManifest(messages, mirrorError) {
  if (state.manifestError) {
    setItem("p-man", { kind: "idle", label: "Unavailable", value: "Not checked", note: state.manifestError });
    return;
  }
  const matches = state.manifestFingerprint === state.pinnedFingerprint;
  if (!matches) {
    setItem("p-man", {
      kind: "error", label: "Mismatch", mono: true, value: short(state.manifestFingerprint),
      note: `The manifest file hashes to ${short(state.manifestFingerprint)}, but the pin is ${short(state.pinnedFingerprint)}.`,
    });
    return;
  }
  let onTopic;
  if (mirrorError) onTopic = "Its 0x02 message on the topic was not checked, because the mirror is unavailable.";
  else {
    const hit = messages.find((m) => m.kind === "manifest" && m.payloadHex === state.pinnedFingerprint);
    onTopic = hit
      ? `Its 0x02 message is on the topic at sequence ${hit.sequence_number}.`
      : `No 0x02 message with it among the latest ${messages.length} topic messages (it is published before the first root, so it may be older).`;
  }
  setItem("p-man", {
    kind: "success", label: "Pinned", mono: true, value: short(state.pinnedFingerprint),
    note: `The canonical manifest hashes to the pinned fingerprint. ${onTopic}`,
  });
}

function renderRoot() {
  const latest = state.latest;
  if (!latest) return;
  const when = consensusToDate(latest.consensus_timestamp);
  $("p-root").querySelector(".hm-age")?.replaceChildren(document.createTextNode(when ? ago(when) : "time unknown"));
}

async function refresh() {
  const when = $("proof-when");
  let messages = [];
  let mirrorError = null;
  try {
    const { createSources } = await import(PATHS.sources);
    messages = await createSources({ network: "testnet" }).topicMessages(state.topic, { limit: 25, order: "desc" });
  } catch (error) {
    mirrorError = reason(error);
  }

  if (mirrorError) {
    state.latest = null;
    setItem("p-root", { kind: "idle", label: "Unavailable", value: "Mirror not reachable", note: mirrorError });
    when.textContent = "Mirror unavailable";
  } else {
    const root = messages.find((m) => m.kind === "root") ?? null;
    state.latest = root;
    if (root) {
      const date = consensusToDate(root.consensus_timestamp);
      setItem("p-root", {
        kind: "success", label: "Anchored", value: "",
        note: `Merkle root ${short(root.payloadHex)}, read from the Hedera mirror node.`,
      });
      const valueEl = $("p-root");
      const seq = document.createElement("a");
      seq.className = "mono";
      seq.href = TS_RE.test(String(root.consensus_timestamp))
        ? `${HASHSCAN}/transaction/${root.consensus_timestamp}`
        : `${HASHSCAN}/topic/${state.topic}`;
      seq.target = "_blank";
      seq.rel = "noopener noreferrer";
      seq.textContent = `Seq ${root.sequence_number}`;
      const age = document.createElement("span");
      age.className = "hm-age";
      age.textContent = date ? ago(date) : "time unknown";
      if (date) age.title = date.toISOString();
      valueEl.replaceChildren(seq, document.createTextNode(" · "), age);
    } else if (messages.length === 0) {
      setItem("p-root", { kind: "idle", label: "None yet", value: "No record fingerprints anchored yet", note: "The topic has no messages yet." });
    } else {
      setItem("p-root", {
        kind: "idle", label: "None recent", value: "No record fingerprints anchored yet",
        note: `None among the latest ${messages.length} topic messages.`,
      });
    }
    when.textContent = `Read ${new Date().toISOString().slice(11, 16)} UTC`;
  }
  renderManifest(messages, mirrorError);
}

async function initProof() {
  await loadPins();
  await refresh();
  setInterval(refresh, REFRESH_MS);
  setInterval(renderRoot, 15_000);
}

/* ---------------------------------------------------------------- ANCHOR status */
// GET /healthz from this browser, 8 s timeout. A browser can only read the answer when the server
// lists this site's origin in VUKA_DASHBOARD_ORIGINS (CORS). When the readable request fails, a
// second, opaque (no-cors) request tells "the server answered but the browser may not read it"
// apart from "nothing answered", so a CORS block is never reported as the server being down.
async function timedFetch(url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkAnchor() {
  if (!$("a-health")) return;
  const url = `${ANCHOR}/healthz`;
  const at = () => `${new Date().toISOString().slice(11, 16)} UTC`;
  let response;
  try {
    response = await timedFetch(url, { headers: { accept: "application/json" } });
  } catch (error) {
    if (error?.name === "AbortError") {
      setItem("a-health", { kind: "error", label: "Can't reach", value: "No answer", note: `GET /healthz did not answer within ${HEALTH_TIMEOUT_MS / 1000} seconds (checked ${at()}).` });
      return;
    }
    let answered = false;
    try {
      await timedFetch(url, { mode: "no-cors" });
      answered = true;
    } catch { /* nothing answered either */ }
    if (answered) {
      setItem("a-health", {
        kind: "idle", label: "Not readable", value: "Status not readable from this browser yet",
        note: `The server answered, but it does not yet let this site's address read the reply (CORS: VUKA_DASHBOARD_ORIGINS). That is not the same as down. Checked ${at()}.`,
      });
    } else {
      setItem("a-health", {
        kind: "idle", label: "Not readable", value: "Status not readable from this browser yet",
        note: `The request failed before any reply could be read: the network, a blocker, or the server being offline. Checked ${at()}.`,
      });
    }
    return;
  }
  if (response.ok) {
    setItem("a-health", { kind: "success", label: "Reachable", value: "Reachable", note: `GET /healthz answered HTTP ${response.status} (checked ${at()}).` });
  } else {
    setItem("a-health", { kind: "error", label: "Not healthy", value: `HTTP ${response.status}`, note: `The server answered GET /healthz with HTTP ${response.status}, not 200 (checked ${at()}).` });
  }
}

/* ---------------------------------------------------------------- security scorecard links */
// ledger-pages.yml carries security.html to the site root only when a security-score run on main
// has one to download (best effort), and a local checkout has none. When this copy of the site
// does not have it, every scorecard link (a[data-scorecard]) opens the CI runs that compute it
// rather than a 404.
async function checkScorecard() {
  const links = [...document.querySelectorAll("a[data-scorecard]")];
  const note = $("score-note");
  if (!links.length) return;
  let present = false;
  try {
    present = (await fetch(links[0].href, { method: "HEAD", cache: "no-store" })).ok;
  } catch { /* offline or blocked: treat as absent */ }
  if (present) return;
  for (const link of links) {
    link.href = SCORE_RUNS;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  if (note) note.textContent = "This copy of the site does not carry the scorecard, so the link opens the CI runs on GitHub that compute it.";
}

initMenu();
checkScorecard();
checkAnchor().then(() => setInterval(checkAnchor, REFRESH_MS));
initProof().catch((error) => {
  const when = $("proof-when");
  if (when) when.textContent = `Unavailable: ${reason(error)}`;
});
