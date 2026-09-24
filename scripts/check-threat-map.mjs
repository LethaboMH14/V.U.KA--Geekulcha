import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// A control reference is a spec section or requirement ID, an ADR, or an
// SSDLC control (`C-nn` in docs/security/SSDLC.md), which carries its own
// status and evidence column.
const SPEC_REF = /(?:§\s*\d+|\b(?:V|G|A|S|P|D|B)\d+\b|\bADR-\d{4}\b|\bC-\d{2}\b)/u;
const TEST_REF = /(?:\bT\d{2}\b|\bPT-\d{2}\b)/u;

/** Parse Markdown table rows that look like threat rows and report missing map refs. */
export function parseThreatMap(markdown) {
  const rows = [];
  const lines = markdown.split(/\r?\n/);
  const cellsFor = line => line.trim().slice(1, -1).split('|').map(cell => cell.trim());
  for (let i = 0; i < lines.length;) {
    if (!lines[i].trim().startsWith('|') || !lines[i].trim().endsWith('|')) { i++; continue; }
    const table = [];
    while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
      table.push(cellsFor(lines[i++]));
    }
    const header = table[0]?.map(cell => cell.toLowerCase()) ?? [];
    // Identify the STRIDE and coercion threat tables by their actual columns.
    // Asset, boundary, API mapping and new-test tables are not threat tables.
    if (!header.includes('threat') || !header.includes('test')) continue;
    // Read references only from the column that should hold them: the spec
    // reference from `Spec` (coercion table) or `Control` (STRIDE tables), the
    // test reference from `Test`. A test ID mentioned in the threat prose does
    // not count as a mapping.
    const specCol = header.includes('spec') ? header.indexOf('spec') : header.indexOf('control');
    const testCol = header.indexOf('test');
    for (const cells of table.slice(2)) {
      const id = cells[0]?.replace(/^\*\*|\*\*$/g, '').trim();
      if (!/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/.test(id ?? '') || !/\d/.test(id)) continue;
      const missing = [];
      if (specCol < 0 || !SPEC_REF.test(cells[specCol] ?? '')) missing.push('spec reference');
      if (!TEST_REF.test(cells[testCol] ?? '')) missing.push('test reference');
      rows.push({ id, missing });
    }
  }
  return rows;
}

function main() {
  const strict = process.argv.includes('--strict');
  const root = process.cwd();
  const file = path.join(root, 'docs/security/THREAT-MODEL.md');
  const parsed = parseThreatMap(fs.readFileSync(file, 'utf8'));
  for (const row of parsed) {
    if (row.missing.length) console.log(`${row.id}: missing ${row.missing.join(' and ')}`);
  }
  const mapped = parsed.filter(row => row.missing.length === 0).length;
  console.log(`${parsed.length} rows, ${mapped} fully mapped`);
  if (strict && mapped !== parsed.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
