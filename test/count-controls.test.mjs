import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { countControls } from '../scripts/count-controls.mjs';

test('counts statuses and reports duplicate and missing IDs in a fixture', () => {
  const fixture = [
    '| ID | Control | Status | Evidence |',
    '|---|---|---|---|',
    '| C-01 | First | **Done** | file |',
    '| C-03 | Second | **Not doing** — reason | file |',
    '| C-03 | Third | **Unexpected** | file |',
  ].join('\n');

  assert.deepEqual(countControls(fixture), {
    total: 3,
    counts: { Done: 1, 'In build': 0, Planned: 0, 'Not doing': 1, other: 1 },
    duplicates: ['C-03'],
    missing: ['C-02'],
  });
});

test('counts three-digit control IDs (C-100 and above)', () => {
  const md = ['| ID | Control | Status | Evidence |', '|---|---|---|---|', '| C-99 | A | **Done** | f |', '| C-100 | B | **Planned** | f |', '| C-122 | C | **Not doing** — reason | f |'].join(String.fromCharCode(10));
  const r = countControls(md);
  assert.equal(r.total, 3);
  assert.equal(r.counts['Not doing'], 1);
});

test('counts the real SSDLC controls', async () => {
  const markdown = await readFile(new URL('../docs/security/SSDLC.md', import.meta.url), 'utf8');
  const result = countControls(markdown);
  assert.equal(result.total, 79);
  assert.deepEqual(result.duplicates, []);
});
