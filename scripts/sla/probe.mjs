#!/usr/bin/env node
/**
 * One service-level probe of the live VUKA stack (docs/venture/04-SLA.md).
 *
 * Measures three things a partner bank or insurer would hold us to, from the
 * outside, with no credentials:
 *   api_health      GET <api>/healthz, n samples: answered "ok" with the
 *                   database reachable, and how long it took (p50, p95).
 *   anchor_fresh    the newest 0x01 root on the Hedera topic, read from the
 *                   public mirror node: how old it is.
 *   verify_site     the public "verify a record" page answers 200.
 *
 * One run is one sample, not an SLA: availability over a month comes from
 * many runs (scripts/sla/aggregate.mjs). Anything that could not be measured
 * counts as NOT met, never as met. Targets are PROPOSED (04-SLA.md §3).
 *
 * Usage:
 *   node scripts/sla/probe.mjs [--api URL] [--mirror URL] [--topic 0.0.N]
 *     [--ledger URL] [--samples 5] [--timeout-ms 10000] [--out file.json]
 *     [--summary] [--fail-on-breach] [--now ISO-8601]
 */
import {writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export const DEFAULTS = {
  api: 'https://vuka-anchor-server.azurewebsites.net',
  mirror: 'https://testnet.mirrornode.hedera.com',
  topic: '0.0.10687280',
  ledger: 'https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/ledger/',
  samples: 5,
  timeoutMs: 10_000,
};

// PROPOSED targets, docs/venture/04-SLA.md §3 (pilot phase).
export const SLO = {
  api_health_success_ratio: 0.995, // S1 alert path, 99.5% a month
  api_health_p95_ms: 1500, // S1 latency guard
  anchor_max_age_s: 65 * 60, // S5: newest root under 65 minutes old (team/sibusiso.md acceptance)
  verify_site_ok: true, // S7
  verify_site_ratio: 0.995, // S7 over a window
};

const ROOT_TYPE = 0x01; // spec §10: typed 33-byte messages, 0x01 root, 0x02 key-manifest hash

export function parseArgs(argv) {
  const opts = {...DEFAULTS, out: null, summary: false, failOnBreach: false, now: null};
  const flags = {'--api': 'api', '--mirror': 'mirror', '--topic': 'topic', '--ledger': 'ledger', '--samples': 'samples', '--timeout-ms': 'timeoutMs', '--out': 'out', '--now': 'now'};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--summary') opts.summary = true;
    else if (a === '--fail-on-breach') opts.failOnBreach = true;
    else if (flags[a]) {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) throw new Error(`Missing value for ${a}`);
      opts[flags[a]] = v;
    } else throw new Error(`Unknown option: ${a}`);
  }
  opts.samples = Number(opts.samples);
  opts.timeoutMs = Number(opts.timeoutMs);
  if (!Number.isInteger(opts.samples) || opts.samples < 1 || opts.samples > 50) throw new Error('--samples must be an integer from 1 to 50');
  if (!Number.isInteger(opts.timeoutMs) || opts.timeoutMs < 100) throw new Error('--timeout-ms must be an integer of at least 100');
  if (!/^\d+\.\d+\.\d+$/.test(opts.topic)) throw new Error('--topic must look like 0.0.N');
  if (opts.now !== null && Number.isNaN(Date.parse(opts.now))) throw new Error('--now must be an ISO-8601 time');
  for (const k of ['api', 'mirror', 'ledger']) opts[k] = String(opts[k]).replace(/\/$/, k === 'ledger' ? '/' : '');
  return opts;
}

/** Nearest-rank percentile; null for an empty list. */
export function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)];
}

async function timedFetch(url, timeoutMs) {
  const started = performance.now();
  try {
    const res = await fetch(url, {signal: AbortSignal.timeout(timeoutMs), headers: {accept: 'application/json, text/html'}});
    const text = await res.text();
    return {ok: true, status: res.status, text, ms: Math.round(performance.now() - started)};
  } catch (e) {
    return {ok: false, error: e?.name === 'TimeoutError' ? 'timeout' : String(e?.cause?.code ?? e?.message ?? e), ms: Math.round(performance.now() - started)};
  }
}

export async function probeApiHealth(opts) {
  const samples = [];
  for (let i = 0; i < opts.samples; i++) {
    const r = await timedFetch(`${opts.api}/healthz`, opts.timeoutMs);
    let healthy = false;
    if (r.ok && r.status === 200) {
      try {
        const body = JSON.parse(r.text);
        healthy = body.status === 'ok' && body.database === 'reachable';
      } catch {
        healthy = false;
      }
    }
    samples.push({healthy, status: r.ok ? r.status : null, error: r.ok ? null : r.error, ms: r.ms});
  }
  const good = samples.filter(s => s.healthy);
  const latencies = good.map(s => s.ms);
  return {
    n: samples.length,
    healthy: good.length,
    success_ratio: good.length / samples.length,
    p50_ms: percentile(latencies, 50),
    p95_ms: percentile(latencies, 95),
    max_ms: latencies.length ? Math.max(...latencies) : null,
    latencies_ms: latencies,
    errors: [...new Set(samples.filter(s => !s.healthy).map(s => s.error ?? `http_${s.status}`))],
  };
}

/** "1790283223.545362104" (seconds.nanoseconds, as the mirror returns it) to epoch milliseconds. */
export function consensusToMs(ts) {
  const m = /^(\d+)\.(\d{1,9})$/.exec(String(ts));
  if (!m) return null;
  return Number(m[1]) * 1000 + Math.floor(Number(m[2].padEnd(9, '0')) / 1e6);
}

export async function probeAnchorFreshness(opts, nowMs) {
  const r = await timedFetch(`${opts.mirror}/api/v1/topics/${opts.topic}/messages?order=desc&limit=25`, opts.timeoutMs);
  if (!r.ok) return {measured: false, error: r.error};
  if (r.status !== 200) return {measured: false, error: `http_${r.status}`};
  let messages;
  try {
    messages = JSON.parse(r.text).messages;
  } catch {
    return {measured: false, error: 'bad_json'};
  }
  if (!Array.isArray(messages)) return {measured: false, error: 'bad_shape'};
  const root = messages.find(m => {
    const bytes = Buffer.from(String(m.message ?? ''), 'base64');
    return bytes.length === 33 && bytes[0] === ROOT_TYPE;
  });
  if (!root) return {measured: false, error: 'no_root_in_last_25_messages'};
  const at = consensusToMs(root.consensus_timestamp);
  if (at === null) return {measured: false, error: 'bad_consensus_timestamp'};
  return {
    measured: true,
    sequence: root.sequence_number ?? null,
    consensus_at: new Date(at).toISOString(),
    age_s: Math.max(0, Math.round((nowMs - at) / 1000)),
  };
}

export async function probeVerifySite(opts) {
  const r = await timedFetch(opts.ledger, opts.timeoutMs);
  return r.ok ? {measured: true, status: r.status, ok: r.status === 200, ms: r.ms} : {measured: false, error: r.error, ok: false};
}

/** Each SLO is met, breached or unmeasured; unmeasured is never counted as met. */
export function judge(result) {
  const {api_health: api, anchor_fresh: anchor, verify_site: site} = result;
  const slos = [
    {id: 'api_health_success_ratio', target: `>= ${SLO.api_health_success_ratio}`, value: api.success_ratio, met: api.success_ratio >= SLO.api_health_success_ratio},
    {id: 'api_health_p95_ms', target: `<= ${SLO.api_health_p95_ms}`, value: api.p95_ms, met: api.p95_ms === null ? null : api.p95_ms <= SLO.api_health_p95_ms},
    {id: 'anchor_max_age_s', target: `<= ${SLO.anchor_max_age_s}`, value: anchor.measured ? anchor.age_s : null, met: anchor.measured ? anchor.age_s <= SLO.anchor_max_age_s : null},
    {id: 'verify_site_ok', target: 'HTTP 200', value: site.measured ? site.status : null, met: site.measured ? site.ok : null},
  ];
  const met = slos.filter(s => s.met === true).length;
  return {slos, score: {met, of: slos.length, unmeasured: slos.filter(s => s.met === null).length, ratio: met / slos.length}};
}

export async function runProbe(opts) {
  const nowMs = opts.now ? Date.parse(opts.now) : Date.now();
  const result = {
    probe: 'vuka-sla-probe',
    version: 1,
    started_at: new Date(nowMs).toISOString(),
    targets: {api: opts.api, mirror: opts.mirror, topic: opts.topic, ledger: opts.ledger},
    api_health: await probeApiHealth(opts),
    anchor_fresh: await probeAnchorFreshness(opts, nowMs),
    verify_site: await probeVerifySite(opts),
  };
  return {...result, ...judge(result)};
}

export function summaryMarkdown(r) {
  const fmt = v => (v === null || v === undefined ? 'not measured' : String(v));
  const ms = v => (v === null || v === undefined ? 'not measured' : `${v} ms`);
  const verdict = s => (s.met === null ? 'NOT MEASURED' : s.met ? 'met' : 'BREACHED');
  const lines = [
    `### VUKA service-level probe, ${r.started_at}`,
    '',
    `Score: **${r.score.met}/${r.score.of} SLOs met** (${r.score.unmeasured} not measured; not measured counts as not met). One run is one sample, not an SLA.`,
    '',
    '| SLO | Target (PROPOSED) | Value | Verdict |',
    '|---|---|---|---|',
    ...r.slos.map(s => `| ${s.id} | ${s.target} | ${fmt(s.value)} | ${verdict(s)} |`),
    '',
    `api_health: n = ${r.api_health.n}, healthy ${r.api_health.healthy}, p50 ${ms(r.api_health.p50_ms)}, p95 ${ms(r.api_health.p95_ms)}${r.api_health.errors.length ? `, errors: ${r.api_health.errors.join(', ')}` : ''}.`,
    r.anchor_fresh.measured
      ? `anchor_fresh: root sequence ${fmt(r.anchor_fresh.sequence)} at ${r.anchor_fresh.consensus_at}, age ${r.anchor_fresh.age_s} s (testnet topic ${r.targets.topic}).`
      : `anchor_fresh: not measured (${r.anchor_fresh.error}).`,
  ];
  return lines.join('\n') + '\n';
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  const r = await runProbe(opts);
  const json = JSON.stringify(r, null, 2) + '\n';
  if (opts.out) writeFileSync(opts.out, json);
  process.stdout.write(opts.summary ? summaryMarkdown(r) : json);
  if (opts.failOnBreach && r.score.met < r.score.of) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
