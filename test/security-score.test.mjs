import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const sourceRoot = path.resolve(import.meta.dirname, '..');
const scriptSource = fs.readFileSync(path.join(sourceRoot, 'scripts/security-score.mjs'), 'utf8');
const sourceDocument = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'docs/security/scorecard/controls.json'), 'utf8'));
const sourceRegister = sourceDocument.controls;
const programmeAvailable = fs.existsSync(path.join(sourceRoot, 'docs/security/SECURITY-PROGRAMME.md'));
const sourceSsd = fs.readFileSync(path.join(sourceRoot, 'docs/security/SSDLC.md'), 'utf8');
const externalIds = ['C-130', 'C-131', 'C-132', 'C-133', 'C-134', 'C-136', 'C-137', 'C-139'];
const categories = [
  'Duress and coercion', 'Device (MASVS)', 'API and server (ASVS, API Top 10)', 'Chain and anchor',
  'Privacy and POPIA (LINDDUN, L1–L16)', 'Supply chain', 'Operations and governance',
];
const commit = '0123456789abcdef0123456789abcdef01234567';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vuka-score-'));
  for (const dir of ['scripts', 'server', 'docs/security/scorecard', 'docs/security', '.github/workflows', 'test', 'shared/test', 'docs/reviews']) {
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  }
  fs.writeFileSync(path.join(root, 'scripts/security-score.mjs'), scriptSource);
  fs.copyFileSync(path.join(sourceRoot, '.github/workflows/checks.yml'), path.join(root, '.github/workflows/checks.yml'));
  fs.copyFileSync(path.join(sourceRoot, 'docs/security/THREAT-MODEL.md'), path.join(root, 'docs/security/THREAT-MODEL.md'));
  fs.writeFileSync(path.join(root, 'docs/security/SSDLC.md'), sourceSsd);
  fs.writeFileSync(path.join(root, 'test/test.test.mjs'), '// T01\n');
  fs.writeFileSync(path.join(root, 'shared/test/test.js'), '// no mapped test here\n');
  fs.writeFileSync(path.join(root, 'server/implementation.py'), 'implemented fixture evidence\n');
  fs.writeFileSync(path.join(root, 'docs/fixture.md'), 'documentation fixture\n');
  fs.writeFileSync(path.join(root, 'docs/reviews/review.md'), 'non-author review fixture\n');
  fs.writeFileSync(path.join(root, 'independent-report.pdf'), 'fixture report\n');
  const document = structuredClone(sourceDocument);
  document.controls[0] = { ...document.controls[0], title: 'Fixture', category: categories[1], threats: [], severity: 'high', severity_source: 'override', weight: 3, mechanism: 'Fixture mechanism', evidence_paths: [], doc_paths: [], tests: ['T01'], ci_jobs: ['tests'], review_links: [], external: [] };
  fs.writeFileSync(path.join(root, 'docs/security/scorecard/controls.json'), JSON.stringify(document, null, 2));
  return root;
}

function run(root, extra = []) {
  const out = path.join(root, 'out.json');
  const results = path.join(root, 'results');
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/security-score.mjs'), '--out', out, '--results', results, '--commit', commit, ...extra], { cwd: root, encoding: 'utf8' });
  return { ...result, out: fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : null };
}
function updateControl(root, update) {
  const file = path.join(root, 'docs/security/scorecard/controls.json');
  const document = JSON.parse(fs.readFileSync(file, 'utf8'));
  document.controls[0] = { ...document.controls[0], ...update };
  fs.writeFileSync(file, JSON.stringify(document, null, 2));
}
function results(root, { headSha = commit, tap = 'TAP version 13\nok 1 - T01 fixture passed\n', status = 'failure' } = {}) {
  const dir = path.join(root, 'results');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'node.tap'), tap);
  fs.writeFileSync(path.join(dir, 'ci-status.json'), JSON.stringify({ status, head_sha: headSha, run_url: 'https://example.invalid/run' }));
}
function score(result) { return result.out.controls.find(control => control.id === 'C-01'); }

test('fixture register proves E0, E1, E2, E3 and E4 transitions from implementation and per-test evidence', () => {
  const root = fixture();
  try {
    for (const [update, expected] of [[{}, 'E0'], [{ evidence_paths: ['server/implementation.py'] }, 'E1']]) {
      updateControl(root, update);
      const result = run(root);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(score(result).level, expected);
    }
    updateControl(root, { evidence_paths: ['server/implementation.py'] });
    results(root);
    let result = run(root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(score(result).level, 'E2', 'a passing mapped test counts even when overall run status is failure');

    updateControl(root, { evidence_paths: ['server/implementation.py'], review_links: ['docs/reviews/review.md'] });
    result = run(root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(score(result).level, 'E3');

    updateControl(root, { evidence_paths: ['server/implementation.py'], review_links: ['docs/reviews/review.md'], external: ['independent-report.pdf'] });
    result = run(root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(score(result).level, 'E4');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('documentation-only evidence stays E0 and is shown separately', () => {
  const root = fixture();
  try {
    updateControl(root, { doc_paths: ['docs/fixture.md'] });
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(score(result).level, 'E0');
    assert.deepEqual(score(result).doc_paths, ['docs/fixture.md']);
    assert.match(score(result).why, /documentation paths/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('mismatched head_sha refuses E2', () => {
  const root = fixture();
  try {
    updateControl(root, { evidence_paths: ['server/implementation.py'] });
    results(root, { headSha: 'ffffffffffffffffffffffffffffffffffffffff' });
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(score(result).level, 'E1');
    assert.match(score(result).why, /does not match scored commit/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('a skipped mapped test refuses E2 and states why', () => {
  const root = fixture();
  try {
    updateControl(root, { evidence_paths: ['server/implementation.py'] });
    results(root, { tap: 'TAP version 13\nok 1 - T01 fixture # SKIP pending fixture\n' });
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(score(result).level, 'E1');
    assert.match(score(result).why, /skipped/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('the SSDLC source has 79 rows and three-digit IDs are parsed', () => {
  const ssd = fs.readFileSync(path.join(sourceRoot, 'docs/security/SSDLC.md'), 'utf8');
  const ids = [...ssd.matchAll(/^\|\s*(C-\d+)\s*\|/gm)].map(match => match[1]);
  assert.equal(ids.length, 79);
  for (const id of ['C-100', 'C-101', 'C-102', 'C-110', 'C-112', 'C-120', 'C-121', 'C-122']) assert.ok(ids.includes(id), `${id} should be registered`);
  for (const id of ids) assert.ok(sourceRegister.some(control => control.id === id), `${id} should be registered`);
  if (programmeAvailable) {
    for (const id of externalIds) assert.ok(sourceRegister.some(control => control.id === id), `${id} should be registered`);
  } else {
    // §5 controls live in SECURITY-PROGRAMME.md; until it is in the tree they are absent, and the register says so.
    assert.equal(sourceRegister.length, 79);
    assert.equal(sourceDocument.sources.security_programme.available, false);
  }
  assert.match(scriptSource, /C-\\d\+/);
});

test('SSDLC/register mismatch exits 2 and prints the diff', () => {
  const root = fixture();
  try {
    const file = path.join(root, 'docs/security/scorecard/controls.json');
    const document = JSON.parse(fs.readFileSync(file, 'utf8'));
    document.controls = document.controls.slice(1);
    fs.writeFileSync(file, JSON.stringify(document));
    const result = run(root);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Missing from register: C-01/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('regression check fails when a high-weight control drops a level', () => {
  const root = fixture();
  try {
    const old = path.join(root, 'old.json');
    fs.writeFileSync(old, JSON.stringify({ controls: [{ id: 'C-01', level: 'E2' }] }));
    updateControl(root, {});
    const result = run(root, ['--check-regression', old]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /High-weight controls regressed: C-01 E2/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

