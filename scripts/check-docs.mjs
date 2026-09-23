import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const assert = (ok, message) => { if (!ok) errors.push(message); };
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (['.git','.tools','node_modules','work','archive'].includes(e.name)) return [];
    const p = path.join(dir,e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const read = p => {
  if (!fs.existsSync(p)) { errors.push(`Missing ${p}`); return ''; }
  return fs.readFileSync(p,'utf8');
};
// The four-layer audit pack moved to archive/2026-09-four-layer/docs/audit/ on 23 Sep 2026 (ADR-0034); its structural checks retired with it.
for(const name of ['lethabo','sibusiso','babatunde','mutarisi','khutso','vukosi','ipeleng']) {
  const t=read(`team/${name}.md`);
  for(const marker of ['AI tool / model','## Work order','Sequenced work','Interfaces','Needs and blockers','Definition of done','Outside-role work','Running log'])
    assert(t.includes(marker),`team/${name}: missing ${marker}`);
}
for(const p of ['docs/VUKA-2-SPEC.md','docs/MASTER-CONTEXT.md','docs/CHECKLIST.md','docs/EVIDENCE.md','docs/OPEN-GAPS.md','docs/STAGED-DURESS-DEFENCE.md','docs/ECONOMICS-VIGIL-ANCHOR.md','docs/SESSION-PROMPT.md','team/START-HERE.md','BRIEF.md','RULES.md','AGENTS.md','SECURITY.md','docs/BUILD-LOG.md','docs/build-log/README.md','docs/build-log/TEMPLATE.md','docs/AGENT-ROUTING.md','team/TEMPLATE.md','templates/BUSINESS-HANDOFF.md','docs/OVERLAPS.md','.github/CODEOWNERS','.github/pull_request_template.md']) read(p);
assert(read('BRIEF.md').trim().split(/\s+/).length<=500,'Brief exceeds 500-word one-page budget');
{
  const entries = fs.existsSync('docs/build-log/entries') ? fs.readdirSync('docs/build-log/entries').filter(f=>f.endsWith('.md')) : [];
  assert(entries.length>=1,'docs/build-log/entries/ has no entries — the frozen docs/BUILD-LOG.md convention has ended; see docs/build-log/README.md');
  for(const f of entries) assert(/^\d{4}-\d{2}-\d{2}-[a-z]+-[a-z0-9-]+\.md$/.test(f),`docs/build-log/entries/${f}: filename doesn't match YYYY-MM-DD-<author>-<slug>.md`);
}
for(const file of walk(root).filter(p=>p.endsWith('.md'))) {
  const text=read(file);
  for(const line of text.split('\n')) {
    if(line.includes('318 ms')) assert(/n\s*=\s*10/.test(line),`${file}: latency missing sample size on same line`);
  }
  for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target=m[1].split('#')[0];
    if(!target||/^[a-z]+:/i.test(target)||target.startsWith('<')) continue;
    assert(fs.existsSync(path.resolve(path.dirname(file),decodeURIComponent(target))),`${path.relative(root,file)}: broken link ${target}`);
  }
}
if(errors.length) { errors.forEach(e=>console.error(e)); process.exit(1); }
console.log('Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.');
