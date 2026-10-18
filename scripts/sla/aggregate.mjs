#!/usr/bin/env node
/**
 * Many probe runs (scripts/sla/probe.mjs --out) into one window: the figures
 * an SLA report quotes (docs/venture/04-SLA.md §4). Every figure carries its
 * n. A run that could not measure something is counted as a miss for that
 * SLO, never dropped.
 *
 * Usage: node scripts/sla/aggregate.mjs <probe.json | directory> [...] [--summary]
 */
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SLO, percentile} from './probe.mjs';

export function loadRuns(paths) {
  const files = paths.flatMap(p => (statSync(p).isDirectory() ? readdirSync(p).filter(f => f.endsWith('.json')).map(f => join(p, f)) : [p]));
  return files
    .map(f => JSON.parse(readFileSync(f, 'utf8')))
    .filter(r => r.probe === 'vuka-sla-probe' && r.version === 1)
    .sort((a, b) => a.started_at.localeCompare(b.started_at));
}

export function aggregate(runs) {
  if (!runs.length) throw new Error('no probe runs to aggregate');
  const samples = runs.reduce((t, r) => t + r.api_health.n, 0);
  const healthy = runs.reduce((t, r) => t + r.api_health.healthy, 0);
  const latencies = runs.flatMap(r => r.api_health.latencies_ms ?? []);
  const anchorMeasured = runs.filter(r => r.anchor_fresh.measured);
  const anchorWithin = anchorMeasured.filter(r => r.anchor_fresh.age_s <= SLO.anchor_max_age_s).length;
  const siteOk = runs.filter(r => r.verify_site.ok).length;
  return {
    window: {from: runs[0].started_at, to: runs.at(-1).started_at, runs: runs.length},
    api_availability: {healthy, samples, ratio: healthy / samples, target: SLO.api_health_success_ratio},
    api_latency_ms: {n: latencies.length, p50: percentile(latencies, 50), p95: percentile(latencies, 95), target_p95: SLO.api_health_p95_ms},
    anchor_freshness: {
      runs_within_target: anchorWithin,
      runs: runs.length,
      runs_unmeasured: runs.length - anchorMeasured.length,
      ratio: anchorWithin / runs.length,
      max_age_s: anchorMeasured.length ? Math.max(...anchorMeasured.map(r => r.anchor_fresh.age_s)) : null,
      target_s: SLO.anchor_max_age_s,
    },
    verify_site: {runs_ok: siteOk, runs: runs.length, ratio: siteOk / runs.length},
  };
}

/** The window's SLA score: SLOs met ÷ SLOs promised (04-SLA.md §3). Nothing measured means not met. */
export function score(a) {
  const slos = [
    {id: 'api_availability', met: a.api_availability.ratio >= SLO.api_health_success_ratio},
    {id: 'api_latency_p95', met: a.api_latency_ms.p95 !== null && a.api_latency_ms.p95 <= SLO.api_health_p95_ms},
    {id: 'anchor_freshness', met: a.anchor_freshness.ratio === 1},
    {id: 'verify_site', met: a.verify_site.ratio >= SLO.verify_site_ratio},
  ];
  const met = slos.filter(s => s.met).length;
  return {slos, met, of: slos.length, ratio: met / slos.length};
}

export function summaryMarkdown(a) {
  const pct = x => `${(x * 100).toFixed(2)}%`;
  return [
    `### VUKA service levels, ${a.window.from} to ${a.window.to} (${a.window.runs} probe runs)`,
    '',
    '| Measure | Value | n | Target (PROPOSED) |',
    '|---|---|---|---|',
    `| API availability (healthz ok, database reachable) | ${pct(a.api_availability.ratio)} | ${a.api_availability.samples} samples | ${pct(a.api_availability.target)} |`,
    `| API latency p95 | ${a.api_latency_ms.p95 ?? 'not measured'} ms | ${a.api_latency_ms.n} | <= ${a.api_latency_ms.target_p95} ms |`,
    `| Anchor root within ${a.anchor_freshness.target_s / 60} min | ${pct(a.anchor_freshness.ratio)} (max age ${a.anchor_freshness.max_age_s ?? 'not measured'} s) | ${a.anchor_freshness.runs} runs, ${a.anchor_freshness.runs_unmeasured} unmeasured | 100% |`,
    `| Verify page up | ${pct(a.verify_site.ratio)} | ${a.verify_site.runs} runs | ${pct(SLO.verify_site_ratio)} |`,
    '',
    `Score: **${score(a).met}/${score(a).of} SLOs met** in this window (unmeasured counts as missed).`,
    '',
    'Probe spacing limits resolution: an outage shorter than the gap between runs can be missed. Unmeasured runs count as misses.',
  ].join('\n') + '\n';
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2);
  const summary = args.includes('--summary');
  const paths = args.filter(a => a !== '--summary');
  if (!paths.length) {
    console.error('Usage: node scripts/sla/aggregate.mjs <probe.json | directory> [...] [--summary]');
    process.exit(2);
  }
  const a = aggregate(loadRuns(paths));
  process.stdout.write(summary ? summaryMarkdown(a) : JSON.stringify({...a, score: score(a)}, null, 2) + '\n');
}
