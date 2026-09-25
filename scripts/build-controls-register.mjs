#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = {
  ssdcl: 'docs/security/SSDLC.md',
  threatModel: 'docs/security/THREAT-MODEL.md',
  programme: 'docs/security/SECURITY-PROGRAMME.md',
  overrides: 'docs/security/scorecard/controls.overrides.json',
  register: 'docs/security/scorecard/controls.json',
};
const IMPLEMENTATION_ROOTS = ['app/', 'server/', 'anchor/', 'shared/', 'dashboard/', 'scripts/', 'contracts/', '.github/'];
const THREAT_ID = /^[A-Z]{1,4}(-[A-Z])?-?\d+[a-z]?$/;
const CONTROL_ID = /\bC-\d{2,3}\b/g;
const TEST_ID = /\b(?:T\d{2}|PT-\d{2})\b/g;

const sortStrings = values => [...new Set(values)].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
const compareControlIds = (a, b) => {
  const [, an] = a.match(/^C-(\d+)$/) || [];
  const [, bn] = b.match(/^C-(\d+)$/) || [];
  return Number(an) - Number(bn) || a.localeCompare(b);
};
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

function cellsFor(line) {
  const cells = [];
  let value = '';
  let ticks = 0;
  const body = line.trim().slice(1, -1);
  for (const char of body) {
    if (char === '`') ticks++;
    if (char === '|' && ticks % 2 === 0) {
      cells.push(value.trim());
      value = '';
    } else value += char;
  }
  cells.push(value.trim());
  return cells;
}

function isTableLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|');
}

function parseTables(markdown) {
  const lines = markdown.split(/\r?\n/);
  const tables = [];
  for (let i = 0; i < lines.length;) {
    if (!isTableLine(lines[i])) { i++; continue; }
    const table = [];
    while (i < lines.length && isTableLine(lines[i])) table.push(cellsFor(lines[i++]));
    tables.push(table);
  }
  return tables;
}

function columnIndex(header, name) {
  return header.findIndex(cell => cell.trim().replace(/^\*\*|\*\*$/g, '').toLowerCase() === name);
}

function extractTests(value) {
  return [...(value ?? '').matchAll(TEST_ID)].map(match => match[0]);
}

function extractPaths(evidence) {
  const paths = [...(evidence ?? '').matchAll(/`([^`]+)`/g)].map(match => match[1].trim().replaceAll('\\', '/'));
  const evidencePaths = [];
  const docPaths = [];
  for (const item of paths) {
    if (IMPLEMENTATION_ROOTS.some(root => item.startsWith(root))) evidencePaths.push(item);
    else if (/^(?:\.\.\/|docs\/|[A-Za-z0-9_.-]+\.md(?:#.*)?$)/.test(item)) docPaths.push(item);
  }
  return { evidence_paths: sortStrings(evidencePaths), doc_paths: sortStrings(docPaths) };
}

export function parseSsdcl(markdown) {
  const lines = markdown.split(/\r?\n/);
  const controls = [];
  let section = '';
  for (let i = 0; i < lines.length;) {
    const heading = lines[i].match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (heading) section = heading[2].trim();
    if (!/^\|\s*C-\d{2,3}\s*\|/.test(lines[i])) { i++; continue; }

    let start = i;
    while (start > 0 && isTableLine(lines[start - 1])) start--;
    let end = i;
    while (end + 1 < lines.length && isTableLine(lines[end + 1])) end++;
    const table = lines.slice(start, end + 1).map(cellsFor);
    const header = table[0].map(cell => cell.toLowerCase());
    const idCol = header.findIndex(cell => /^(?:id|control id)$/.test(cell));
    const titleCol = header.findIndex(cell => /^(?:control|title)$/.test(cell));
    const statusCol = columnIndex(header, 'status');
    const evidenceCol = header.findIndex(cell => /^(?:evidence(?:\s*\/\s*test)?|evidence \/ test|checked by|command \/ evidence)$/i.test(cell));
    const ownerCol = columnIndex(header, 'owner');
    for (const row of table.slice(1)) {
      const id = (row[idCol >= 0 ? idCol : 0] ?? '').replace(/^\*\*|\*\*$/g, '').trim();
      if (!/^C-\d{2,3}$/.test(id)) continue;
      const title = row[titleCol >= 0 ? titleCol : 1] ?? '';
      const status = row[statusCol] ?? '';
      const evidence = row[evidenceCol] ?? '';
      const owner = row[ownerCol] ?? '';
      const paths = extractPaths(evidence);
      controls.push({ id, title, status, section, evidence, owner, tests: extractTests(evidence), ...paths });
    }
    i = end + 1;
  }
  return controls;
}

export function parseThreatModel(markdown) {
  const threats = [];
  for (const table of parseTables(markdown)) {
    const header = table[0]?.map(cell => cell.replace(/^\*\*|\*\*$/g, '').trim().toLowerCase()) ?? [];
    const controlCol = columnIndex(header, 'control');
    const testCol = columnIndex(header, 'test');
    if (controlCol < 0 || testCol < 0) continue;
    for (const row of table.slice(1)) {
      const id = (row[0] ?? '').replace(/^\*\*|\*\*$/g, '').trim();
      if (!THREAT_ID.test(id)) continue;
      const controlText = row[controlCol] ?? '';
      threats.push({
        id,
        controls: sortStrings([...(controlText.matchAll(CONTROL_ID) ?? [])].map(match => match[0])),
        tests: sortStrings(extractTests(row[testCol] ?? '')),
        coercion: id.startsWith('TM-C'),
      });
    }
  }
  return threats;
}

export function seedOverrides(register) {
  const result = {};
  for (const control of [...register].sort((a, b) => compareControlIds(a.id, b.id))) {
    const entry = {
      category: control.category,
      mechanism: control.mechanism,
      extra_tests: [],
      ci_jobs: sortStrings(control.ci_jobs ?? []),
      review_links: sortStrings(control.review_links ?? []),
      external: sortStrings(control.external ?? []),
    };
    result[control.id] = entry;
  }
  return result;
}

export function seedOverridesFromSources(register, ssdMarkdown, threatMarkdown) {
  const ssd = new Map(parseSsdcl(ssdMarkdown).map(control => [control.id, control]));
  const threats = parseThreatModel(threatMarkdown);
  const sourceTests = new Map([...ssd.keys()].map(id => [id, new Set(ssd.get(id).tests)]));
  for (const threat of threats) {
    for (const id of threat.controls) {
      if (!sourceTests.has(id)) sourceTests.set(id, new Set());
      for (const test of threat.tests) sourceTests.get(id).add(test);
    }
  }
  const result = seedOverrides(register);
  for (const control of register) {
    const derived = sourceTests.get(control.id) ?? new Set();
    result[control.id].extra_tests = sortStrings((control.tests ?? []).filter(test => !derived.has(test)));
  }
  return result;
}

function digest(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function buildRegister(root = REPO, { overridesText } = {}) {
  const resolve = relative => path.join(root, relative);
  const ssdFile = resolve(SOURCES.ssdcl);
  const threatFile = resolve(SOURCES.threatModel);
  const programmeFile = resolve(SOURCES.programme);
  const overrideFile = resolve(SOURCES.overrides);
  const ssdText = fs.readFileSync(ssdFile, 'utf8');
  const threatText = fs.readFileSync(threatFile, 'utf8');
  const ssd = parseSsdcl(ssdText);
  const threatRows = parseThreatModel(threatText);
  const overrides = overridesText ? JSON.parse(overridesText) : readJson(overrideFile);
  const programmeExists = fs.existsSync(programmeFile);
  const programmeRows = programmeExists ? parseProgramme(fs.readFileSync(programmeFile, 'utf8')) : [];
  const sourceControls = [...ssd, ...programmeRows];
  const byId = new Map();
  for (const control of sourceControls) byId.set(control.id, control);

  const resultControls = [...byId.values()].sort((a, b) => compareControlIds(a.id, b.id)).map(source => {
    const override = overrides[source.id] ?? {};
    if (override.severity_override && (!['high', 'medium', 'low'].includes(override.severity_override.level) || typeof override.severity_override.reason !== 'string' || !override.severity_override.reason.trim())) {
      throw new Error(`${source.id}: severity_override requires a high/medium/low level and a non-empty reason.`);
    }
    const mappedThreats = threatRows.filter(threat => threat.controls.includes(source.id));
    const threats = sortStrings(mappedThreats.map(threat => threat.id));
    // Severity is deliberately conservative: TM-C* rows are high; otherwise only an explicit, reasoned override applies. No severity is inferred from threat presence.
    let severity = 'unrated';
    let severity_source = 'unrated';
    if (mappedThreats.some(threat => threat.coercion)) {
      severity = 'high';
      severity_source = 'coercion-row';
    } else if (override.severity_override) {
      severity = override.severity_override.level;
      severity_source = 'override';
    }
    const tests = sortStrings([
      ...(source.tests ?? []),
      ...mappedThreats.flatMap(threat => threat.tests),
      ...(override.extra_tests ?? []),
    ]);
    return {
      id: source.id,
      title: source.title,
      status: source.status,
      section: source.section,
      owner: source.owner,
      category: override.category ?? '',
      threats,
      severity,
      severity_source,
      ...(severity_source === 'override' ? { severity_reason: override.severity_override.reason } : {}),
      weight: ({ high: 3, medium: 2, low: 1 })[severity] ?? 1,
      mechanism: override.mechanism ?? '',
      evidence_paths: source.evidence_paths,
      doc_paths: source.doc_paths,
      tests,
      ci_jobs: sortStrings(override.ci_jobs ?? []),
      review_links: sortStrings(override.review_links ?? []),
      external: sortStrings(override.external ?? []),
    };
  });
  const bySeveritySource = Object.fromEntries(['coercion-row', 'override', 'threat-model', 'unrated'].map(source => [source, resultControls.filter(control => control.severity_source === source).length]));
  const generatedFiles = [SOURCES.ssdcl, SOURCES.threatModel, ...(programmeExists ? [SOURCES.programme] : []), SOURCES.overrides];
  const output = {
    generated_from: generatedFiles.map(file => ({ path: file, sha256: digest(resolve(file)) })),
    sources: {
      security_programme: { path: SOURCES.programme, available: programmeExists },
    },
    severity_rule: 'TM-C* coercion-row threat => high (weight 3); otherwise use only an explicit severity_override with reason; otherwise unrated (weight 1). Severity is never inferred from mapped threat presence.',
    counts: {
      controls: resultControls.length,
      by_severity_source: bySeveritySource,
      unrated: resultControls.filter(control => control.severity_source === 'unrated').length,
    },
    controls: resultControls,
  };
  return output;
}

function parseProgramme(markdown) {
  const controls = [];
  for (const table of parseTables(markdown)) {
    const header = table[0]?.map(cell => cell.trim().toLowerCase()) ?? [];
    const idCol = header.findIndex(cell => /^(?:id|control id)$/.test(cell));
    const titleCol = header.findIndex(cell => /^(?:control|title|requirement)$/.test(cell));
    const statusCol = columnIndex(header, 'status');
    const evidenceCol = header.findIndex(cell => /^(?:evidence(?:\s*\/\s*test)?|evidence \/ test|checked by)$/i.test(cell));
    const ownerCol = columnIndex(header, 'owner');
    for (const row of table.slice(1)) {
      const id = (row[idCol >= 0 ? idCol : 0] ?? row.join(' ')).match(/\bC-\d{2,3}\b/)?.[0];
      if (!id) continue;
      const evidence = row[evidenceCol] ?? '';
      const paths = extractPaths(evidence);
      controls.push({
        id,
        title: (row[titleCol >= 0 ? titleCol : (idCol >= 0 ? 1 : 0)] ?? '').trim(),
        status: row[statusCol] ?? '', section: '§5', owner: row[ownerCol] ?? '',
        evidence, tests: extractTests(evidence), ...paths,
      });
    }
  }
  return controls;
}

function cli(argv) {
  let check = false;
  let root = REPO;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--check') check = true;
    else if (argv[i] === '--root' && argv[i + 1]) root = path.resolve(argv[++i]);
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  const outputFile = path.join(root, SOURCES.register);
  const generated = json(buildRegister(root));
  if (check) {
    const existing = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : '';
    if (existing !== generated) {
      let before = [];
      let after = [];
      try { before = JSON.parse(existing).controls ?? []; } catch {}
      try { after = JSON.parse(generated).controls ?? []; } catch {}
      const oldIds = new Set(before.map(control => control.id));
      const newIds = new Set(after.map(control => control.id));
      const changed = [...newIds].filter(id => oldIds.has(id) && json(before.find(control => control.id === id)) !== json(after.find(control => control.id === id))).length;
      console.error(`controls.json drift: ${changed} changed, ${[...newIds].filter(id => !oldIds.has(id)).length} added, ${[...oldIds].filter(id => !newIds.has(id)).length} removed.`);
      process.exitCode = 1;
      return;
    }
    console.log('controls.json is up to date.');
    return;
  }
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, generated, 'utf8');
  console.log(`Wrote ${path.relative(root, outputFile).replaceAll('\\', '/')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { cli(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
