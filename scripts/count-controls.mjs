import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const STATUSES = ['Done', 'In build', 'Planned', 'Not doing'];

export function countControls(markdown) {
  const counts = Object.fromEntries([...STATUSES, 'other'].map((status) => [status, 0]));
  const ids = [];
  let statusColumn = -1;

  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.some((cell) => /^:?-{3,}:?$/.test(cell))) continue;

    if (/^C-\d{2}$/.test(cells[0] ?? '')) {
      ids.push(cells[0]);
      const cell = cells[statusColumn] ?? '';
      const match = cell.match(/^\*\*(Done|In build|Planned|Not doing)\*\*/);
      counts[match ? match[1] : 'other'] += 1;
      continue;
    }

    statusColumn = cells.findIndex((cell) => /^status$/i.test(cell));
  }

  const frequencies = new Map();
  for (const id of ids) frequencies.set(id, (frequencies.get(id) ?? 0) + 1);
  const duplicates = [...frequencies].filter(([, count]) => count > 1).map(([id]) => id);
  const numbers = ids.map((id) => Number(id.slice(2)));
  const present = new Set(numbers);
  const missing = numbers.length
    ? Array.from({ length: Math.max(...numbers) - Math.min(...numbers) + 1 }, (_, i) => i + Math.min(...numbers))
      .filter((number) => !present.has(number))
      .map((number) => `C-${String(number).padStart(2, '0')}`)
    : [];

  return { total: ids.length, counts, duplicates, missing };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const file = process.argv[2] ?? 'docs/security/SSDLC.md';
  const result = countControls(await readFile(file, 'utf8'));
  const details = Object.entries(result.counts).map(([status, count]) => `${status}=${count}`).join(' ');
  console.log(`total=${result.total} ${details}`);
  console.log(`duplicates=${result.duplicates.length ? result.duplicates.join(',') : 'none'} missing=${result.missing.length ? result.missing.join(',') : 'none'}`);
}
