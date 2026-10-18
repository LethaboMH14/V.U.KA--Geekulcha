import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parseSsdcl, parseThreatModel } from '../scripts/build-controls-register.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = path.join(repo, 'test/fixtures/register');
const buildScript = path.join(repo, 'scripts/build-controls-register.mjs');

function fixtureCopy() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'controls-register-'));
  fs.cpSync(fixture, root, { recursive: true });
  return root;
}

function run(root, ...args) {
  return spawnSync(process.execPath, [buildScript, '--root', root, ...args], { encoding: 'utf8' });
}

test('SSDLC parser reads three-digit IDs, metadata, tests, paths and section headings', () => {
  const text = fs.readFileSync(path.join(fixture, 'docs/security/SSDLC.md'), 'utf8');
  const controls = parseSsdcl(text);
  const threeDigit = controls.find(control => control.id === 'C-123');
  assert.equal(controls.length, 2);
  assert.equal(threeDigit.title, 'Three digit control');
  assert.equal(threeDigit.status, '**Planned**');
  assert.equal(threeDigit.owner, 'Bea');
  assert.equal(threeDigit.section, '4 · Design and implementation');
  assert.deepEqual(threeDigit.evidence_paths, ['server/auth.js']);
  assert.deepEqual(threeDigit.tests, ['T02']);
  assert.deepEqual(threeDigit.tests, ['T02']);
});

test('threat mapping reads Control by header name and ignores Residual C-IDs', () => {
  const text = fs.readFileSync(path.join(fixture, 'docs/security/THREAT-MODEL.md'), 'utf8');
  const threats = parseThreatModel(text);
  assert.deepEqual(threats.find(threat => threat.id === 'PH-1').controls, ['C-01']);
  assert.deepEqual(threats.find(threat => threat.id === 'TM-C4').controls, ['C-123']);
});

test('generation preserves overrides, applies coercion severity and leaves ordinary severity unrated', () => {
  const root = fixtureCopy();
  const first = run(root);
  assert.equal(first.status, 0, first.stderr);
  const output = JSON.parse(fs.readFileSync(path.join(root, 'docs/security/scorecard/controls.json'), 'utf8'));
  const ordinary = output.controls.find(control => control.id === 'C-01');
  const coercion = output.controls.find(control => control.id === 'C-123');
  assert.equal(ordinary.severity, 'unrated');
  assert.equal(ordinary.weight, 1);
  assert.deepEqual(ordinary.threats, ['PH-1']);
  assert.equal(coercion.severity, 'high');
  assert.equal(coercion.severity_source, 'coercion-row');
  assert.equal(coercion.weight, 3);
  assert.equal(coercion.mechanism, 'Preserved mechanism');
  assert.deepEqual(coercion.tests, ['PT-04', 'PT-88', 'T02']);
  assert.deepEqual(coercion.ci_jobs, ['security-score']);
  assert.deepEqual(coercion.review_links, ['docs/reviews/fixture.md']);
  assert.deepEqual(coercion.external, ['https://example.test/report']);
  assert.deepEqual(output.unmapped_coercion_threats, ['TM-C5']);
  assert.match(first.stderr, /Unmapped coercion threats.*TM-C5/);
  assert.match(output.severity_rule, /never inferred/i);
});

test('--check detects drift, succeeds after regeneration, and output bytes are deterministic', () => {
  const root = fixtureCopy();
  const initialCheck = run(root, '--check');
  assert.equal(initialCheck.status, 1);
  assert.match(initialCheck.stderr, /drift/);
  assert.equal(run(root).status, 0);
  const outputFile = path.join(root, 'docs/security/scorecard/controls.json');
  const first = fs.readFileSync(outputFile);
  assert.equal(run(root).status, 0);
  const second = fs.readFileSync(outputFile);
  assert.deepEqual(second, first);
  assert.equal(run(root, '--check').status, 0);
  fs.writeFileSync(outputFile, `${first.toString('utf8')} `);
  assert.equal(run(root, '--check').status, 1);
});
