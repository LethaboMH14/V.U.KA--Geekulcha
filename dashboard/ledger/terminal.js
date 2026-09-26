// Terminal component for the public-ledger dashboard (CONTRACT.md, "terminal.js").
//
// It plays the trace steps from lib/pipeline.js verifyTrace() as terminal lines:
// how a member's record becomes a fingerprint, and how a bank or insurer checks it.
// It never computes or invents a cryptographic value. It only shows what the
// pipeline yields and returns.
//
// SECURITY: every string that can come from an export (label, value, detail,
// kind, reason, head, root) is written with textContent or setAttribute only.
// There is no innerHTML anywhere in this file.

const PHASE_TAGS = Object.freeze({
  parse: "parse",
  canonical: "canon",
  commitment: "commit",
  event_hash: "hash",
  link: "link",
  signature: "sig",
  head: "head",
  leaf: "leaf",
  path: "path",
  root: "root",
  ledger: "ledger",
  verdict: "verdict",
});

const LEDGER_PHASES = new Set(["head", "leaf", "path", "root", "ledger"]);
const TONES = new Set(["info", "ok", "fail", "dim", "accent", "warn"]);

// Pacing in milliseconds at speed 1. `speed` divides every value.
const TIMING = Object.freeze({
  charsPerMs: 0.3, // label typing rate
  minType: 45,
  maxType: 480,
  reveal: 110, // mark + value fade-in after the label lands
  lineGap: 35,
  phasePause: 60,
  entryPause: 260,
  verdictPause: 420,
  commandCharsPerMs: 0.07,
  maxCommand: 1100,
});

// ---------------------------------------------------------------------------
// Pure helpers (no DOM). Exported for tests; not part of the page contract.
// ---------------------------------------------------------------------------

/** Short tag for the phase column; unknown phases are cut to 7 characters. */
export function phaseTag(phase) {
  if (typeof phase !== "string" || phase === "") return "·";
  return Object.hasOwn(PHASE_TAGS, phase) ? PHASE_TAGS[phase] : phase.slice(0, 7);
}

/** True for a non-empty hex string, with or without a 0x prefix. */
export function isHex(value) {
  return typeof value === "string" && /^(0x)?[0-9a-fA-F]+$/.test(value);
}

/** "0x" + first `keep` … last `keep` hex digits; short input is returned unchanged. */
export function shortenHex(hex, keep = 8) {
  if (!isHex(hex)) return hex;
  const prefix = hex.startsWith("0x") ? "0x" : "";
  const body = hex.slice(prefix.length);
  if (body.length <= keep * 2 + 1) return hex;
  return `${prefix}${body.slice(0, keep)}…${body.slice(-keep)}`;
}

/**
 * How a Step value is shown: { text, full, hex, copyable } or null when empty.
 * Hex longer than 8…8 is shortened; long text is cut at 44 characters.
 */
export function displayValue(value, keep = 8) {
  if (value === undefined || value === null || value === "") return null;
  let full;
  if (typeof value === "string") full = value;
  else if (["number", "boolean", "bigint"].includes(typeof value)) full = String(value);
  else {
    try {
      full = JSON.stringify(value) ?? String(value);
    } catch {
      full = String(value);
    }
  }
  const hex = isHex(full);
  let text = full;
  if (hex) text = shortenHex(full, keep);
  else if (full.length > 44) text = `${full.slice(0, 43)}…`;
  const shortened = text !== full;
  return { text, full, hex, copyable: shortened || (hex && full.length >= 16) };
}

/** Step.ok → tone, mark and the word a screen reader hears. */
export function toneForOk(ok) {
  if (ok === true) return { tone: "ok", mark: "✓", word: "passed" };
  if (ok === false) return { tone: "fail", mark: "✗", word: "failed" };
  return { tone: "info", mark: "·", word: "info" };
}

/** `── entry #3 · checkin_result ──` (kind only when the step carries it). */
export function entryHeaderText(entry, kind) {
  const k = typeof kind === "string" && kind !== "" ? ` · ${kind}` : "";
  return `── entry #${String(entry)}${k} ──`;
}

/** Result → the verdict banner: { tone, mark, title, note }. */
export function verdictSummary(result) {
  const reason = result && typeof result.reason === "string" && result.reason !== "" ? result.reason : null;
  switch (result && result.state) {
    case "live-verified":
      return {
        tone: "ok",
        mark: "✓",
        title: "LIVE-VERIFIED",
        note: reason ?? "The chain, the inclusion proof and the Hedera ledger message agree.",
      };
    case "archived":
      return {
        tone: "warn",
        mark: "◆",
        title: "ARCHIVED (SAMPLE — not independent)",
        note: reason ?? "The chain and proof match a stored copy of the ledger message, not a live Hedera read.",
      };
    case "unavailable":
      return {
        tone: "dim",
        mark: "○",
        title: "UNAVAILABLE",
        note: reason ?? "The chain verifies, but there is no proof or ledger message to compare it with.",
      };
    case "failed": {
      const at = result.firstBroken === null || result.firstBroken === undefined ? "" : ` at entry #${String(result.firstBroken)}`;
      return { tone: "fail", mark: "✗", title: `FAILED${at}`, note: reason ?? "A check failed." };
    }
    default:
      return {
        tone: "dim",
        mark: "?",
        title: "UNKNOWN RESULT",
        note: "The verifier returned a state this terminal does not recognise.",
      };
  }
}

/** Duration in ms to type `n` characters at `speed`. */
export function typeDuration(n, speed = 1) {
  const ms = Math.min(TIMING.maxType, Math.max(TIMING.minType, n / TIMING.charsPerMs));
  return Math.round(ms / normSpeed(speed));
}

export function normSpeed(speed) {
  const s = Number(speed);
  return Number.isFinite(s) && s > 0 ? Math.min(s, 50) : 1;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * createTerminal(rootEl, { reducedMotion, title?, command? }) →
 *   { clear(), line(text, tone), play(steps, { speed, command? }) → Promise<Result|null>, skip() }
 */
export function createTerminal(rootEl, options = {}) {
  if (!rootEl || !rootEl.ownerDocument) throw new TypeError("createTerminal needs a DOM element");
  const {
    reducedMotion = false,
    title = "vuka-verify — sim export",
    command = "vuka verify record.json",
  } = options;
  const doc = rootEl.ownerDocument;
  const win = doc.defaultView;

  const el = (tag, cls, text) => {
    const node = doc.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };
  const hide = (node) => {
    node.setAttribute("aria-hidden", "true");
    return node;
  };

  // --- structure ----------------------------------------------------------
  rootEl.replaceChildren();
  rootEl.classList.add("vt-terminal");
  if (reducedMotion) rootEl.classList.add("vt-still");

  const bar = el("div", "vt-bar");
  const dots = hide(el("span", "vt-dots"));
  dots.append(el("i"), el("i"), el("i"));
  const titleEl = el("span", "vt-title", title);
  const skipBtn = el("button", "vt-skip", "Skip ⏭");
  skipBtn.type = "button";
  skipBtn.hidden = true;
  skipBtn.setAttribute("aria-label", "Skip the animation and show every line now");
  const status = el("span", "vt-sr");
  status.setAttribute("role", "status");
  bar.append(dots, titleEl, skipBtn, status);

  const body = el("div", "vt-body");
  body.tabIndex = 0;
  body.setAttribute("role", "log");
  body.setAttribute("aria-live", "polite");
  body.setAttribute(
    "aria-label",
    "Verification trace: how the record becomes a fingerprint and how it is checked against the ledger",
  );
  const idle = hide(el("div", "vt-cmd vt-idle"));
  idle.append(el("span", "vt-ps1", "$"), el("span", "vt-cursor"));
  body.append(idle);
  rootEl.append(bar, body);

  // --- scrolling: follow the newest line unless the reader scrolled up ------
  let stick = true;
  body.addEventListener(
    "scroll",
    () => {
      stick = body.scrollHeight - body.scrollTop - body.clientHeight < 24;
    },
    { passive: true },
  );
  const follow = () => {
    if (stick) body.scrollTop = body.scrollHeight;
  };

  // --- run bookkeeping ----------------------------------------------------
  const runs = new Set(); // queued or active runs
  let queue = Promise.resolve();

  const prefersReduced = () => {
    try {
      return Boolean(win && win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch {
      return false;
    }
  };
  const animate = (run) => !run.skipping && !reducedMotion && !prefersReduced() && !doc.hidden;

  const wait = (run, ms) => {
    if (run.skipping || !(ms > 0)) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        if (run.wake === done) run.wake = null;
        resolve();
      };
      const timer = setTimeout(done, ms);
      run.wake = done;
    });
  };

  const strip = (node) => {
    for (const n of [node, ...node.querySelectorAll(".vt-typing, .vt-reveal")]) {
      n.classList.remove("vt-typing", "vt-reveal");
      n.removeAttribute("style");
    }
  };
  const stripAll = (run) => {
    for (const node of run.animated) strip(node);
    run.animated.length = 0;
  };
  const skipRun = (run) => {
    run.skipping = true;
    if (run.wake) run.wake();
    stripAll(run);
  };

  const setPlaying = (on) => {
    rootEl.classList.toggle("is-playing", on);
    idle.hidden = on;
    skipBtn.hidden = !on || reducedMotion || prefersReduced();
  };

  const append = (run, node) => {
    if (run && run.silent) return false;
    body.insertBefore(node, idle);
    follow();
    return true;
  };

  // Types `typed` in (CSS steps() on a clip-path) and fades `later` in after it.
  // Returns how long to wait before the next line.
  const type = (run, node, typed, later = [], rate = null, max = TIMING.maxType) => {
    if (!animate(run)) return 0;
    let visible = typed.textContent.length;
    for (const sr of typed.querySelectorAll(".vt-sr")) visible -= sr.textContent.length;
    const n = Math.max(1, visible);
    const speed = run.speed;
    const d = rate
      ? Math.round(Math.min(max, Math.max(TIMING.minType, n / rate)) / speed)
      : typeDuration(n, speed);
    typed.classList.add("vt-typing");
    typed.style.animationDuration = `${d}ms`;
    typed.style.animationTimingFunction = `steps(${n}, end)`;
    const reveal = Math.round(TIMING.reveal / speed);
    for (const n2 of later) {
      if (!n2) continue;
      n2.classList.add("vt-reveal");
      n2.style.animationDelay = `${d}ms`;
      n2.style.animationDuration = `${reveal}ms`;
    }
    run.animated.push(node);
    return d + reveal + Math.round(TIMING.lineGap / speed);
  };

  const settle = async (run, node, ms) => {
    await wait(run, ms);
    strip(node);
    const i = run.animated.indexOf(node);
    if (i >= 0) run.animated.splice(i, 1);
  };

  // --- copy to clipboard ----------------------------------------------------
  let announceTimer = null;
  const announce = (text) => {
    status.textContent = "";
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      status.textContent = text;
    }, 30);
  };

  const makeValue = (value) => {
    const shown = displayValue(value);
    if (!shown) return null;
    if (!shown.copyable) return el("span", "vt-val", shown.text);
    const node = el("span", "vt-val vt-copy", shown.text);
    node.tabIndex = 0;
    node.setAttribute("role", "button");
    node.setAttribute("title", shown.full);
    node.setAttribute("data-full", shown.full);
    node.setAttribute("aria-label", `${shown.text}. Copy the full value`);
    const restore = () => {
      node.textContent = shown.text;
      node.classList.remove("is-expanded");
    };
    const selectFallback = () => {
      node.textContent = shown.full;
      node.classList.add("is-expanded");
      try {
        const sel = win.getSelection();
        sel.selectAllChildren(node);
      } catch {
        /* selection unavailable: the full value is still visible */
      }
      announce("Copy was blocked. The full value is shown and selected; press Ctrl+C or ⌘C.");
      node.addEventListener("blur", restore, { once: true });
    };
    const copy = () => {
      let pending;
      try {
        pending = win.navigator.clipboard.writeText(shown.full);
      } catch {
        selectFallback();
        return;
      }
      Promise.resolve(pending).then(
        () => {
          node.classList.add("is-copied");
          announce("Copied the full value.");
          setTimeout(() => node.classList.remove("is-copied"), 1200);
        },
        selectFallback,
      );
    };
    node.addEventListener("click", copy);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        copy();
      }
    });
    return node;
  };

  // --- line builders ----------------------------------------------------------
  const buildLine = ({ tag, tone, mark, word, label, value, detail }) => {
    const line = el("div", `vt-line vt-line--${tone}`);
    const tagEl = el("span", "vt-tag", tag);
    const markEl = hide(el("span", "vt-mark", mark));
    const text = el("span", "vt-text");
    const labelEl = el("span", "vt-label");
    labelEl.append(el("span", "vt-sr", `${word}: `), doc.createTextNode(String(label ?? "")));
    const valueEl = makeValue(value);
    text.append(labelEl);
    if (valueEl) text.append(valueEl);
    line.append(tagEl, markEl, text);
    let detailEl = null;
    if (detail !== undefined && detail !== null && detail !== "") {
      detailEl = el("div", "vt-detail", detail);
      line.append(detailEl);
    }
    return { line, markEl, labelEl, valueEl, detailEl };
  };

  const rule = async (run, text, pause) => {
    await wait(run, pause);
    const node = el("div", "vt-rule", text);
    if (!append(run, node)) return null;
    if (animate(run)) {
      node.classList.add("vt-reveal");
      node.style.animationDuration = `${Math.round(TIMING.reveal / run.speed)}ms`;
      run.animated.push(node);
    }
    return node;
  };

  const renderStep = async (run, step) => {
    if (!step || typeof step !== "object") return;
    const hasEntry = step.entry !== undefined && step.entry !== null;
    const kind = typeof step.kind === "string" && step.kind !== "" ? step.kind : null;

    if (hasEntry && step.entry !== run.entry) {
      run.header = await rule(run, entryHeaderText(step.entry, kind), run.entry === undefined ? 0 : TIMING.entryPause / run.speed);
      run.headerKind = kind;
      run.entry = step.entry;
    } else if (hasEntry && run.header && !run.headerKind && kind) {
      run.header.textContent = entryHeaderText(step.entry, kind);
      run.headerKind = kind;
    } else if (!hasEntry && run.entry !== undefined && run.entry !== null && LEDGER_PHASES.has(step.phase)) {
      run.header = await rule(run, "── fingerprint & ledger ──", TIMING.entryPause / run.speed);
      run.entry = null;
    } else if (run.phase !== null && step.phase !== run.phase) {
      await wait(run, TIMING.phasePause / run.speed);
    }
    run.phase = step.phase;
    if (run.silent) return;

    const { tone, mark, word } = toneForOk(step.ok);
    const parts = buildLine({
      tag: phaseTag(step.phase),
      tone,
      mark,
      word,
      label: step.label,
      value: step.value,
      detail: step.detail,
    });
    if (!append(run, parts.line)) return;
    const ms = type(run, parts.line, parts.labelEl, [parts.markEl, parts.valueEl, parts.detailEl]);
    await settle(run, parts.line, ms);
  };

  const renderVerdict = async (run, result) => {
    await rule(run, "── verdict ──", TIMING.verdictPause / run.speed);
    const v = verdictSummary(result);
    const block = el("div", `vt-verdict vt-verdict--${v.tone}`);
    const big = el("div", "vt-verdict-title");
    const markEl = hide(el("span", "vt-mark", v.mark));
    const titleText = el("span", "vt-verdict-text", v.title);
    big.append(markEl, titleText);
    const note = el("div", "vt-verdict-note", v.note);
    block.append(big, note);
    if (!append(run, block)) return;
    const ms = type(run, block, titleText, [markEl, note], 0.05, 900);
    await settle(run, block, ms);

    const prints = [
      ["head", "record fingerprint (chain head)", result.head],
      ["root", "batch fingerprint (Merkle root)", result.root],
    ];
    for (const [tag, label, value] of prints) {
      if (value === undefined || value === null || value === "") continue;
      const parts = buildLine({ tag, tone: "accent", mark: "#", word: "fingerprint", label, value });
      parts.line.classList.add("vt-print");
      if (!append(run, parts.line)) return;
      await settle(run, parts.line, type(run, parts.line, parts.labelEl, [parts.markEl, parts.valueEl]));
    }
  };

  const renderCommand = async (run, cmd) => {
    const node = el("div", "vt-cmd");
    const text = el("span", "vt-cmd-text", cmd);
    node.append(hide(el("span", "vt-ps1", "$")), text);
    if (!append(run, node)) return;
    const ms = type(run, node, text, [], TIMING.commandCharsPerMs, TIMING.maxCommand);
    await settle(run, node, ms ? ms + Math.round(160 / run.speed) : 0);
  };

  const iteratorOf = (steps) => {
    if (steps && typeof steps[Symbol.asyncIterator] === "function") return steps[Symbol.asyncIterator]();
    if (steps && typeof steps[Symbol.iterator] === "function") return steps[Symbol.iterator]();
    throw new TypeError("play() needs an iterable of trace steps");
  };

  const execute = async (run, steps, cmd) => {
    setPlaying(true);
    let result = null;
    try {
      if (typeof cmd === "string" && cmd !== "") await renderCommand(run, cmd);
      const it = iteratorOf(steps);
      // A 'verdict' step is held back: when a Result follows, the banner says the
      // same thing (from the Result), so the step line would only repeat it.
      const held = [];
      for (;;) {
        const { value, done } = await it.next();
        if (done) {
          result = value ?? null;
          break;
        }
        if (value && value.phase === "verdict") {
          held.push(value);
          continue;
        }
        for (const step of held.splice(0)) await renderStep(run, step);
        await renderStep(run, value);
      }
      if (result && typeof result === "object") await renderVerdict(run, result);
      else for (const step of held) await renderStep(run, step);
      return result;
    } catch (error) {
      const message = error && typeof error.message === "string" ? error.message : String(error);
      if (!run.silent) append(run, buildLine({ tag: "error", ...toneForOk(false), label: `trace stopped: ${message}` }).line);
      throw error;
    } finally {
      stripAll(run);
      runs.delete(run);
      setPlaying(runs.size > 0);
    }
  };

  // --- keyboard ---------------------------------------------------------------
  skipBtn.addEventListener("click", () => api.skip());
  rootEl.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && runs.size > 0) {
      event.preventDefault();
      api.skip();
    }
  });

  // --- public API -------------------------------------------------------------
  const api = {
    /** Empties the log. An in-flight play keeps consuming its steps silently and still resolves with its Result. */
    clear() {
      for (const run of runs) {
        run.silent = true;
        skipRun(run);
      }
      for (const node of [...body.children]) if (node !== idle) node.remove();
      stick = true;
      body.scrollTop = 0;
    },

    /** Appends one line instantly. `text` goes in with textContent. */
    line(text, tone = "info") {
      const t = TONES.has(tone) ? tone : "info";
      const node = el("div", `vt-line vt-plain vt-line--${t}`);
      node.append(el("span", "vt-text", text ?? ""));
      append(null, node);
    },

    /**
     * Plays trace steps as lines and resolves with the iterable's return value
     * (the pipeline Result), or null when the iterable returns nothing.
     * A second play() makes earlier runs finish instantly, then starts; each
     * promise still resolves with its own Result and lines never interleave.
     * Rejects (after printing the error) if the steps iterable throws.
     */
    play(steps, { speed = 1, command: cmd = command } = {}) {
      for (const earlier of runs) skipRun(earlier);
      const run = {
        speed: normSpeed(speed),
        skipping: false,
        silent: false,
        wake: null,
        animated: [],
        entry: undefined,
        phase: null,
        header: null,
        headerKind: null,
      };
      runs.add(run);
      const task = queue.then(() => execute(run, steps, cmd));
      queue = task.catch(() => {});
      return task;
    },

    /** Renders the remaining lines of every queued or active play instantly. */
    skip() {
      for (const run of runs) skipRun(run);
    },
  };
  return api;
}
