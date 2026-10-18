import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parseArgs, percentile, consensusToMs, runProbe, judge, summaryMarkdown, DEFAULTS} from '../scripts/sla/probe.mjs';
import {aggregate, loadRuns} from '../scripts/sla/aggregate.mjs';

const typed = (type, fill = 0xab) => Buffer.concat([Buffer.from([type]), Buffer.alloc(32, fill)]).toString('base64');
const NOW = '2026-10-18T12:00:00.000Z';
const nowS = Date.parse(NOW) / 1000;

/** A stand-in for the API, the mirror node and the ledger page, each switchable per test. */
function stack(behaviour) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const send = (code, body, type = 'application/json') => {
      res.writeHead(code, {'content-type': type});
      res.end(typeof body === 'string' ? body : JSON.stringify(body));
    };
    if (url.pathname === '/healthz') return behaviour.health(send);
    if (url.pathname.startsWith('/api/v1/topics/')) return send(200, {messages: behaviour.messages});
    if (url.pathname === '/ledger/') return send(behaviour.ledgerStatus ?? 200, '<!doctype html><title>VUKA Ledger</title>', 'text/html');
    send(404, {error: 'not_found'});
  });
  return new Promise(resolve =>
    server.listen(0, '127.0.0.1', () => {
      const base = `http://127.0.0.1:${server.address().port}`;
      resolve({server, opts: {...DEFAULTS, api: base, mirror: base, ledger: `${base}/ledger/`, samples: 4, timeoutMs: 2000, now: NOW}});
    }),
  );
}

test('arguments: defaults, overrides and refusals', () => {
  assert.equal(parseArgs([]).api, DEFAULTS.api);
  assert.equal(parseArgs(['--api', 'https://example.test/']).api, 'https://example.test');
  assert.equal(parseArgs(['--samples', '3']).samples, 3);
  assert.throws(() => parseArgs(['--samples', '0']), /samples/);
  assert.throws(() => parseArgs(['--samples', '51']), /samples/);
  assert.throws(() => parseArgs(['--topic', 'abc']), /topic/);
  assert.throws(() => parseArgs(['--now', 'yesterday']), /--now/);
  assert.throws(() => parseArgs(['--api']), /Missing value/);
  assert.throws(() => parseArgs(['--bogus']), /Unknown option/);
});

test('percentile is nearest-rank and null when there is nothing to rank', () => {
  assert.equal(percentile([], 95), null);
  assert.equal(percentile([300], 95), 300);
  assert.equal(percentile([5, 1, 4, 2, 3], 50), 3);
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 95), 19);
});

test('mirror consensus timestamps parse to milliseconds, malformed ones to null', () => {
  assert.equal(consensusToMs('1790283223.545362104'), 1790283223545);
  assert.equal(consensusToMs('1790283223.5'), 1790283223500);
  assert.equal(consensusToMs('2026-10-18T12:00:00Z'), null);
});

test('a healthy stack meets every SLO, and the newest 0x01 root is the one judged', async () => {
  const {server, opts} = await stack({
    health: send => send(200, {status: 'ok', database: 'reachable'}),
    messages: [
      {sequence_number: 9, consensus_timestamp: `${nowS - 30}.000000000`, message: typed(0x02)}, // manifest hash: skipped
      {sequence_number: 8, consensus_timestamp: `${nowS - 60}.000000000`, message: Buffer.from('not typed').toString('base64')}, // wrong length: skipped
      {sequence_number: 7, consensus_timestamp: `${nowS - 600}.250000000`, message: typed(0x01)},
      {sequence_number: 6, consensus_timestamp: `${nowS - 7200}.000000000`, message: typed(0x01)},
    ],
  });
  try {
    const r = await runProbe(opts);
    assert.equal(r.api_health.n, 4);
    assert.equal(r.api_health.healthy, 4);
    assert.equal(r.api_health.latencies_ms.length, 4);
    assert.equal(r.anchor_fresh.sequence, 7);
    assert.equal(r.anchor_fresh.age_s, 600);
    assert.equal(r.verify_site.ok, true);
    assert.deepEqual(r.score, {met: 4, of: 4, unmeasured: 0, ratio: 1});
    assert.match(summaryMarkdown(r), /4\/4 SLOs met/);
  } finally {
    server.close();
  }
});

test('a failing stack is breached, and what cannot be measured never counts as met', async () => {
  const {server, opts} = await stack({
    health: send => send(503, {error: 'database_unavailable'}),
    messages: [{sequence_number: 2, consensus_timestamp: `${nowS - 5}.0`, message: typed(0x02)}],
    ledgerStatus: 404,
  });
  try {
    const r = await runProbe(opts);
    assert.equal(r.api_health.success_ratio, 0);
    assert.equal(r.api_health.p95_ms, null);
    assert.deepEqual(r.api_health.errors, ['http_503']);
    assert.equal(r.anchor_fresh.measured, false);
    assert.equal(r.anchor_fresh.error, 'no_root_in_last_25_messages');
    assert.equal(r.verify_site.ok, false);
    assert.equal(r.score.met, 0);
    assert.equal(r.score.unmeasured, 2);
    assert.match(summaryMarkdown(r), /NOT MEASURED/);
    assert.match(summaryMarkdown(r), /BREACHED/);
  } finally {
    server.close();
  }
});

test('"ok" without a reachable database is not healthy', async () => {
  const {server, opts} = await stack({health: send => send(200, {status: 'ok', database: 'unknown'}), messages: []});
  try {
    const r = await runProbe({...opts, samples: 1});
    assert.equal(r.api_health.healthy, 0);
  } finally {
    server.close();
  }
});

test('a hung endpoint is a timeout, not a pass', async () => {
  const {server, opts} = await stack({health: () => undefined, messages: []});
  try {
    const r = await runProbe({...opts, samples: 1, timeoutMs: 150});
    assert.equal(r.api_health.healthy, 0);
    assert.deepEqual(r.api_health.errors, ['timeout']);
  } finally {
    server.closeAllConnections();
    server.close();
  }
});

test('an anchor older than 65 minutes breaches freshness', () => {
  const run = {
    api_health: {success_ratio: 1, p95_ms: 200},
    anchor_fresh: {measured: true, age_s: 65 * 60 + 1},
    verify_site: {measured: true, ok: true, status: 200},
  };
  const j = judge(run);
  assert.equal(j.slos.find(s => s.id === 'anchor_max_age_s').met, false);
  assert.equal(j.score.met, 3);
});

test('aggregation keeps every n and counts unmeasured runs as misses', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vuka-sla-'));
  const run = (t, healthy, lat, anchor, site) => ({
    probe: 'vuka-sla-probe', version: 1, started_at: t,
    api_health: {n: 4, healthy, latencies_ms: lat},
    anchor_fresh: anchor,
    verify_site: {ok: site},
  });
  writeFileSync(join(dir, 'a.json'), JSON.stringify(run('2026-10-18T10:00:00Z', 4, [100, 120, 140, 900], {measured: true, age_s: 300}, true)));
  writeFileSync(join(dir, 'b.json'), JSON.stringify(run('2026-10-18T11:00:00Z', 2, [110, 130], {measured: false, error: 'timeout'}, true)));
  writeFileSync(join(dir, 'c.json'), JSON.stringify(run('2026-10-18T12:00:00Z', 4, [100, 100, 100, 100], {measured: true, age_s: 5000}, false)));
  writeFileSync(join(dir, 'other.json'), JSON.stringify({probe: 'something-else'}));
  const a = aggregate(loadRuns([dir]));
  assert.equal(a.window.runs, 3);
  assert.equal(a.window.from, '2026-10-18T10:00:00Z');
  assert.deepEqual(a.api_availability, {healthy: 10, samples: 12, ratio: 10 / 12, target: 0.99});
  assert.equal(a.api_latency_ms.n, 10);
  assert.equal(a.api_latency_ms.p95, 900);
  assert.equal(a.anchor_freshness.runs_within_target, 1);
  assert.equal(a.anchor_freshness.runs_unmeasured, 1);
  assert.equal(a.anchor_freshness.max_age_s, 5000);
  assert.equal(a.verify_site.runs_ok, 2);
  assert.throws(() => aggregate([]), /no probe runs/);
});
