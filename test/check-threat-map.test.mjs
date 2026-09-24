import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseThreatMap } from '../scripts/check-threat-map.mjs';

test('parses fully mapped threat rows', () => {
  const rows = parseThreatMap(`
| ID | Threat | Control | Test |
|---|---|---|---|
| PH-1 | forged event | V7 | T03, T18 |
`);
  assert.deepEqual(rows, [{ id: 'PH-1', missing: [] }]);
});

test('reports a missing test reference', () => {
  const rows = parseThreatMap(`| ID | Threat | Spec | Test |\n|---|---|---|---|\n| TM-C9 | Export risk | A5, V8 | — |`);
  assert.deepEqual(rows, [{ id: 'TM-C9', missing: ['test reference'] }]);
});

test('reports a missing spec reference', () => {
  const rows = parseThreatMap(`| ID | Threat | Spec | Test |\n|---|---|---|---|\n| SV-1 | Replay risk | signed request | T06 |`);
  assert.deepEqual(rows, [{ id: 'SV-1', missing: ['spec reference'] }]);
});

test('a test ID in the threat prose does not count as a test mapping', () => {
  const rows = parseThreatMap(`| ID | Threat | Control | Test |
|---|---|---|---|
| SV-1 | T06 replay risk | V7 | — |`);
  assert.deepEqual(rows, [{ id: 'SV-1', missing: ['test reference'] }]);
});

test('a spec reference in the threat prose does not count as a spec mapping', () => {
  const rows = parseThreatMap(`| ID | Threat | Control | Test |
|---|---|---|---|
| SV-2 | breaks A5 export | signed request | T19 |`);
  assert.deepEqual(rows, [{ id: 'SV-2', missing: ['spec reference'] }]);
});

test('ignores tables without threat IDs in the first cell', () => {
  const rows = parseThreatMap(`
| API risk | Control | Test |
|---|---|---|
| API1 Broken Object Level Authorization | C-36 | T19, T49 |
| 1 | ordinary row | §1 | T01 |
`);
  assert.deepEqual(rows, []);
});

test('runs against the repository threat model and prints a summary', () => {
  const script = fileURLToPath(new URL('../scripts/check-threat-map.mjs', import.meta.url));
  const output = execFileSync(process.execPath, [script], {
    cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
    encoding: 'utf8',
  });
  assert.match(output, /^\d+ rows, \d+ fully mapped$/m);
});
