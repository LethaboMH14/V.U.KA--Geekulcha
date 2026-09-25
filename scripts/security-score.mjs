#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registerFile = path.join(repo, 'docs/security/scorecard/controls.json');
const ssdFile = path.join(repo, 'docs/security/SSDLC.md');
const threatFile = path.join(repo, 'docs/security/THREAT-MODEL.md');
const ciJobsFile = path.join(repo, '.github/workflows/checks.yml');
const categories = [
  'Duress and coercion', 'Device (MASVS)', 'API and server (ASVS, API Top 10)',
  'Chain and anchor', `Privacy and POPIA (LINDDUN, L1${String.fromCharCode(0x2013)}L16)`, 'Supply chain',
  'Operations and governance',
];
const implementationRoots = ['app/', 'server/', 'anchor/', 'shared/', 'dashboard/', 'scripts/', 'contracts/', '.github/'];

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function argsOf(argv) {
  const opts = { out: path.join(repo, 'security-score.json'), results: null, commit: null, generatedAt: null, regression: null };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!['--out', '--results', '--commit', '--generated-at', '--check-regression'].includes(key)) fail(`Unknown option: ${key}`);
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) fail(`Missing value for ${key}`);
    const value = argv[++i];
    if (key === '--out') {
      const portableTmp = process.platform === 'win32' && value.startsWith('/tmp/')
        ? path.join(os.tmpdir(), value.slice('/tmp/'.length))
        : value;
      opts.out = path.resolve(portableTmp);
    }
    if (key === '--results') opts.results = path.resolve(value);
    if (key === '--commit') opts.commit = value;
    if (key === '--generated-at') opts.generatedAt = value;
    if (key === '--check-regression') opts.regression = path.resolve(value);
  }
  if (!opts.results) fail('--results <dir> is required');
  if (!opts.commit) fail('--commit <sha> is required');
  if (!opts.generatedAt || Number.isNaN(Date.parse(opts.generatedAt))) fail('--generated-at <timestamp> is required and must be a valid date');
  opts.generatedAt = new Date(opts.generatedAt).toISOString();
  return opts;
}

function controlIdsFromSsd(text) {
  return [...text.matchAll(/^\|[ \t]*\*{0,2}(C-\d+)\*{0,2}[ \t]*\|/gm)].map(m => m[1]);
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { fail(`Cannot read valid JSON at ${file}: ${error.message}`); }
}

function sourceOwners(text) {
  const owners = new Map();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\|[ \t]*\*{0,2}(C-\d+)\*{0,2}[ \t]*\|/);
    if (!match) continue;
    const cells = line.split('|').map(value => value.trim());
    const owner = cells.at(-2);
    if (owner && owner !== 'â€”' && owner !== '-') owners.set(match[1], owner);
  }
  return owners;
}

function isImplementationPath(value) {
  const normalized = value.replaceAll('\\', '/');
  const filename = path.posix.basename(normalized);
  if (normalized.split('/').some(segment => segment.toLowerCase() === 'docs') || /\.(?:md|txt|rst)$/i.test(filename) || /^(?:README|LICENSE)/i.test(filename)) return false;
  return !normalized.startsWith('/') && !normalized.split('/').includes('..') &&
    implementationRoots.some(root => normalized.startsWith(root));
}

function resultFiles(resultsDir) {
  const files = [];
  if (!fs.existsSync(resultsDir)) return files;
  const visit = dir => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) visit(full);
      else if (item.isFile() && /\.(?:tap|xml)$/i.test(item.name)) files.push(full);
    }
  };
  visit(resultsDir);
  return files;
}

function verifyResultsManifest(resultsDir, commit) {
  const manifestPath = path.join(resultsDir, 'results-manifest.json');
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (typeof manifest.head_sha !== 'string' || manifest.head_sha.toLowerCase() !== commit.toLowerCase() || !Array.isArray(manifest.files)) return false;
    const declared = new Map();
    for (const entry of manifest.files) {
      if (!entry || typeof entry.name !== 'string' || typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(entry.sha256)) return false;
      const name = entry.name.replaceAll('\\', '/');
      if (!name || name.startsWith('/') || name.split('/').includes('..') || declared.has(name)) return false;
      declared.set(name, entry.sha256.toLowerCase());
    }
    const actualFiles = resultFiles(resultsDir);
    if (actualFiles.length !== declared.size) return false;
    for (const full of actualFiles) {
      const name = path.relative(resultsDir, full).replaceAll('\\', '/');
      const expected = declared.get(name);
      if (!expected || crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex') !== expected) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function reportResults(resultsDir, manifestValid) {
  const cases = [];
  if (!manifestValid) return cases;
  for (const full of resultFiles(resultsDir)) {
    const text = fs.readFileSync(full, 'utf8');
    cases.push(...(/\.tap$/i.test(full) ? tapResults(text) : junitResults(text)));
  }
  return cases;
}

function tapResults(text) {
  const cases = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(not ok|ok)\s+\d+(?:\.\d+)*\s+-\s+(.+?)\s*$/i);
    if (!match) continue;
    const directive = match[2].match(/\s+#\s*(SKIP|TODO)\b/i);
    const name = directive ? match[2].slice(0, directive.index).trim() : match[2].trim();
    cases.push({ name, status: directive ? (directive[1].toUpperCase() === 'SKIP' ? 'skipped' : 'todo') : (match[1].toLowerCase() === 'ok' ? 'pass' : 'fail') });
  }
  return cases;
}
function junitResults(text) {
  const cases = [];
  const tag = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase\s*>)/gi;
  for (const match of text.matchAll(tag)) {
    const attrs = match[1];
    const body = match[2] || '';
    const name = [...attrs.matchAll(/\b(name|classname)=["']([^"']*)["']/gi)].map(item => item[2]).join(' ');
    const status = /<skipped\b/i.test(body) ? 'skipped' : /<(?:failure|error)\b/i.test(body) ? 'fail' : 'pass';
    cases.push({ name, status });
  }
  return cases;
}

function statusFor(id, cases) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const token = new RegExp(`(^|[^A-Za-z0-9-])${escaped}([^A-Za-z0-9]|$)`, 'i');
  const matching = cases.filter(result => token.test(result.name));
  if (!matching.length) return 'missing';
  return matching.find(result => result.status === 'skipped' || result.status === 'todo')?.status ||
    matching.find(result => result.status === 'fail')?.status ||
    (matching.every(result => result.status === 'pass') ? 'pass' : 'missing');
}

function scoreRegister(register, opts, owners) {
  const ciFile = path.join(opts.results, 'ci-status.json');
  const ci = fs.existsSync(ciFile) ? readJson(ciFile) : null;
  if (ci && ((ci.head_sha !== null && typeof ci.head_sha !== 'string') || typeof ci.status !== 'string')) {
    fail('results/ci-status.json must contain {head_sha: string|null, status: string}');
  }
  const resultsBound = verifyResultsManifest(opts.results, opts.commit);
  const reports = reportResults(opts.results, resultsBound);
  const matchingCommit = ci?.head_sha?.toLowerCase() === opts.commit.toLowerCase();
  const unratedCount = register.filter(control => control.severity === 'unrated').length;
  const rows = register.map(control => {
    let level = 0;
    let why = '';
    let next = '';
    const paths = Array.isArray(control.evidence_paths) ? control.evidence_paths : [];
    const implementationPaths = paths.filter(isImplementationPath);
    const existingImplementation = implementationPaths.filter(p => {
      const target = path.resolve(repo, p);
      return fs.existsSync(target) && fs.statSync(target).isFile();
    });
    const docPaths = Array.isArray(control.doc_paths) ? control.doc_paths : [];
    const testIds = control.tests || [];
    if (!owners.has(control.id)) {
      why = 'The source control row has no owner.';
      next = 'Add an owner to the control row.';
    } else if (!existingImplementation.length) {
      why = implementationPaths.length
        ? 'No cited implementation path exists in the scored checkout.'
        : docPaths.length
          ? 'Only documentation paths are cited; documentation does not establish implementation (E1).'
          : 'No implementation path under an allowed source root is cited.';
      next = 'Cite an existing implementation or configuration file under an allowed source root.';
    } else {
      level = 1;
      const presentTests = testIds.filter(id => testIdExists(id));
      const testStatuses = presentTests.map(id => ({ id, status: statusFor(id, reports) }));
      const passingTest = testStatuses.find(result => result.status === 'pass');
      if (!resultsBound) {
        why = 'results not bound to scored commit';
        next = 'Write a results-manifest.json for the exact scored commit and verify every TAP/JUnit file hash.';
      } else if (!matchingCommit) {
        why = ci ? `CI head_sha ${ci.head_sha} does not match scored commit ${opts.commit}.` : 'No ci-status.json with a head_sha exists in the results directory.';
        next = 'Produce per-test results and ci-status.json for the exact scored commit.';
      } else if (!presentTests.length) {
        why = testIds.length ? 'None of the mapped tests is present in the test source.' : 'No mapped test is available for E2.';
        next = `Add ${testIds[0] || 'a named test'} to the test suite and map it to this control.`;
      } else if (!passingTest) {
        const skipped = testStatuses.find(result => result.status === 'skipped' || result.status === 'todo');
        const failed = testStatuses.find(result => result.status === 'fail');
        const missing = testStatuses.find(result => result.status === 'missing');
        why = skipped
          ? `Mapped test ${skipped.id} is ${skipped.status}; skipped and todo tests do not pass.`
          : failed
            ? `Mapped test ${failed.id} has a failing per-test result.`
            : `Mapped test ${missing?.id || presentTests[0]} has no per-test result in the results artefact.`;
        next = `Record a passing per-test result for ${testStatuses.map(result => result.id).join(' or ')} at this commit.`;
      } else {
        level = 2;
        const review = existingReview(control, opts.commit);
        if (!review.valid) {
          why = review.why;
          next = 'Add a valid non-author approval review record for the scored commit.';
        } else {
          level = 3;
          const independentReport = validExternalReport(control.external || []);
          if (independentReport) {
            level = 4;
            why = 'No higher evidence level is defined.';
            next = 'Keep the independent assessment report linked and current.';
          } else {
            why = 'No external independent assessment report is linked (G8).';
            next = 'Add an external independent assessment report.';
          }
        }
      }
    }
    const category = control.category;
    return {
      id: control.id, title: control.title, category, level: `E${level}`,
      evidence_paths: paths, doc_paths: docPaths,
      weight: control.weight,
      what: (control.threats || []).length ? control.threats.join(', ') : 'No threat ID mapped.',
      how: control.mechanism,
      method: [...(control.tests || []), ...(control.ci_jobs || [])].join(', ') || 'No named automated test or CI job mapped.',
      why, next,
    };
  });
  const summarize = subset => {
    const weight = subset.reduce((n, c) => n + c.weight, 0);
    const scored = subset.reduce((n, c) => n + c.weight * Number(c.level.slice(1)), 0);
    const tested = subset.filter(c => Number(c.level.slice(1)) >= 2).reduce((n, c) => n + c.weight, 0);
    const mix = Object.fromEntries(['E0', 'E1', 'E2', 'E3', 'E4'].map(level => [level, subset.filter(c => c.level === level).length]));
    return {
      evidence_score: weight ? Number((scored / (weight * 4) * 100).toFixed(2)) : 0,
      evidence_confidence: weight ? Number((tested / weight * 100).toFixed(2)) : 0,
      level_mix: mix,
    };
  };
  const all = summarize(rows);
  return {
    generated_at: opts.generatedAt,
    commit: opts.commit,
    ci: ci ? { status: ci.status, head_sha: ci.head_sha, run_url: ci.run_url || '' } : null,
    overall: { evidence_score: all.evidence_score, evidence_confidence: all.evidence_confidence },
    unrated_severity_notice: `${unratedCount} controls have unrated severity; weight defaults to 1`,
    categories: categories.map(name => ({ name, ...summarize(rows.filter(c => c.category === name)) })),
    controls: rows,
  };
}

function testFiles() {
  const roots = new Set(['test', 'shared/test', 'anchor/tests', 'server/tests']);
  const workflow = fs.readFileSync(path.join(repo, '.github/workflows/security-score.yml'), 'utf8');
  for (const match of workflow.matchAll(/\b((?:[A-Za-z0-9_.-]+\/)*tests?)(?=\/|\b)/g)) roots.add(match[1]);
  const files = [];
  for (const root of roots) {
    const dir = path.join(repo, root);
    if (!fs.existsSync(dir)) continue;
    const visit = current => {
      for (const item of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, item.name);
        if (item.isDirectory()) visit(full);
        else if (item.isFile()) files.push(full);
      }
    };
    visit(dir);
  }
  return files.filter(file => path.relative(repo, file).replaceAll('\\', '/') !== 'test/security-score.test.mjs');
}
const testSources = testFiles().map(file => fs.readFileSync(file, 'utf8'));
function testIdExists(id) { return testSources.some(source => new RegExp(`(^|[^A-Za-z0-9-])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`, 'm').test(source)); }
function parseReviewFrontMatter(text) {
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};
  return Object.fromEntries(match[1].split(/\r?\n/).flatMap(line => {
    const field = line.match(/^([a-z_]+):\s*(.*?)\s*$/i);
    return field ? [[field[1], field[2].replace(/^['"]|['"]$/g, '')]] : [];
  }));
}
function reviewValidity(record, commit, source) {
  const missing = ['reviewer', 'author', 'decision', 'reviewed_commit'].filter(field => !String(record?.[field] ?? '').trim());
  if (missing.length) return { valid: false, why: `Review record missing field: ${missing[0]}.` };
  if (record.decision.toLowerCase() !== 'approve') return { valid: false, why: 'Review decision is not approve.' };
  if (record.reviewer.toLowerCase() === record.author.toLowerCase()) return { valid: false, why: 'Review is self-review (reviewer equals author).' };
  if (record.reviewed_commit.toLowerCase() !== commit.toLowerCase()) return { valid: false, why: 'Review reviewed_commit does not match scored commit.' };
  return { valid: true, source };
}
function existingReview(control, commit) {
  let failure = 'No review link is recorded.';
  for (const link of control.review_links || []) {
    if (typeof link === 'string' && /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+#pullrequestreview-\d+$/i.test(link)) {
      failure = 'GitHub PR review URL requires reviewer, author, decision, and reviewed_commit fields in the register entry.';
      continue;
    }
    if (link && typeof link === 'object' && typeof link.url === 'string' && /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+#pullrequestreview-\d+$/i.test(link.url)) {
      const result = reviewValidity(link, commit, link.url);
      if (result.valid) return result;
      failure = result.why;
      continue;
    }
    const file = typeof link === 'string' ? link : link?.path;
    if (typeof file !== 'string' || !/^docs\/reviews\/(?!.*(?:^|\/)\.\.(?:\/|$)).+\.md$/i.test(file)) continue;
    const full = path.resolve(repo, file);
    if (!full.startsWith(`${path.resolve(repo, 'docs/reviews')}${path.sep}`) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
      failure = 'Review markdown file is missing.';
      continue;
    }
    const result = reviewValidity(parseReviewFrontMatter(fs.readFileSync(full, 'utf8')), commit, file);
    if (result.valid) return result;
    failure = result.why;
  }
  return { valid: false, why: failure };
}
function validExternalReport(entries) {
  return entries.some(entry => {
    if (!entry || typeof entry !== 'object' || entry.independent !== true ||
      !['assessor', 'organisation', 'report_path', 'assessed_commit_or_release', 'date'].every(key => String(entry[key] ?? '').trim()) ||
      Number.isNaN(Date.parse(entry.date)) || !/^[a-f0-9]{64}$/i.test(entry.report_sha256 || '')) return false;
    const full = path.resolve(repo, entry.report_path);
    if (!full.startsWith(`${repo}${path.sep}`) || !fs.existsSync(full) || !fs.statSync(full).isFile()) return false;
    return crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex') === entry.report_sha256.toLowerCase();
  });
}
function ciJobs() {
  const text = fs.readFileSync(ciJobsFile, 'utf8');
  const jobs = text.match(/^  [a-z][a-z0-9-]*:/gm) || [];
  return jobs.map(line => line.trim().slice(0, -1));
}

const opts = argsOf(process.argv.slice(2));
const sourceText = fs.readFileSync(ssdFile, 'utf8');
const sourceIds = controlIdsFromSsd(sourceText);
const registerDocument = readJson(registerFile);
const register = registerDocument.controls;
if (!Array.isArray(register) || register.some(c => !c.id)) fail('Register must contain a controls array.');
const registerIds = register.map(c => c.id);
const sourceSet = new Set(sourceIds);
const programmeFile = path.join(repo, 'docs/security/SECURITY-PROGRAMME.md');
if (fs.existsSync(programmeFile)) {
  const programmeText = fs.readFileSync(programmeFile, 'utf8');
  for (const match of programmeText.matchAll(/\bC-\d{2,3}\b/g)) sourceSet.add(match[0]);
}
const registerSet = new Set(registerIds);
const missing = [...sourceSet].filter(id => !registerSet.has(id));
const extra = [...registerSet].filter(id => !sourceSet.has(id));
if (missing.length || extra.length) {
  console.error(`SSDLC/register mismatch (source rows: ${sourceIds.length}, register rows: ${registerSet.size})`);
  console.error(`Missing from register: ${missing.join(', ') || '(none)'}`);
  console.error(`Extra in register: ${extra.join(', ') || '(none)'}`);
  process.exit(2);
}
if (new Set(registerIds).size !== registerIds.length) fail('Register contains duplicate control IDs.');
const availableJobs = ciJobs();
const threatText = fs.readFileSync(threatFile, 'utf8');
const threatIds = new Set([...threatText.matchAll(/^\|\s*((?:TM-C|PH-|SV-|GD-|VP-|HD-|BK-|CI-)\d+)\s*\|/gm)].map(m => m[1]));
for (const control of register) {
  if (!categories.includes(control.category)) fail(`${control.id}: unknown category ${control.category}`);
  if (!['high', 'medium', 'low', 'unrated'].includes(control.severity)) fail(`${control.id}: invalid severity`);
  if (![1, 2, 3].includes(control.weight)) fail(`${control.id}: invalid weight`);
  if (!(control.ci_jobs || []).every(job => availableJobs.includes(job))) fail(`${control.id}: CI job not present in checks.yml`);
  for (const id of control.threats || []) if (!threatIds.has(id)) fail(`${control.id}: threat ${id} not present in THREAT-MODEL.md`);
}
const result = scoreRegister(register, opts, sourceOwners(sourceText));
// Coercion threats the threat model doesn't yet link to a control: weighted as unrated until it does.
result.unmapped_coercion_threats = [...(registerDocument.unmapped_coercion_threats ?? [])].sort();
if (opts.regression) {
  const old = readJson(opts.regression);
  const oldLevels = new Map((old.controls || []).map(c => [c.id, Number(String(c.level).replace('E', ''))]));
  const drops = result.controls.filter(c => c.weight === 3 && oldLevels.has(c.id) && Number(c.level.slice(1)) < oldLevels.get(c.id));
  if (drops.length) fail(`High-weight controls regressed: ${drops.map(c => `${c.id} E${oldLevels.get(c.id)} â†’ ${c.level}`).join(', ')}`);
}
fs.mkdirSync(path.dirname(opts.out), { recursive: true });
fs.writeFileSync(opts.out, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${opts.out}`);
console.log(`Evidence score: ${result.overall.evidence_score}; evidence confidence: ${result.overall.evidence_confidence}`);
console.log(result.unrated_severity_notice);
for (const c of result.categories) console.log(`${c.name}: ${c.evidence_score}; confidence ${c.evidence_confidence}; ${JSON.stringify(c.level_mix)}`);


