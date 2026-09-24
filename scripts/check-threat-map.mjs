import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    for (const cells of table.slice(2)) {
      const id = cells[0]?.replace(/^\*\*|\*\*$/g, '').trim();
      if (!/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/.test(id ?? '') || !/\d/.test(id)) continue;
      const rowText = cells.join(' ');
      const missing = [];
      if (!/(?:§\s*\d+|\b(?:V|G|A|S|P|D)\d+\b|\bADR-\d{4}\b)/u.test(rowText)) {
        missing.push('spec reference');
      }
      if (!/(?:\bT\d{2}\b|\bPT-\d{2}\b)/u.test(rowText)) {
        missing.push('test reference');
      }
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
