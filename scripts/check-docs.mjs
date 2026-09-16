import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const assert = (ok, message) => { if (!ok) errors.push(message); };
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (['.git','.tools','node_modules','work'].includes(e.name)) return [];
    const p = path.join(dir,e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const read = p => {
  if (!fs.existsSync(p)) { errors.push(`Missing ${p}`); return ''; }
  return fs.readFileSync(p,'utf8');
};
const audit = [
 ['01-alignment.md',2500],['02-economics.md',3500],['03-user-journeys.md',4000],
 ['04-production-readiness.md',5000],['05-team-operating-system.md',Infinity],
 ['06-business-translation.md',3500],['07-red-team.md',3000],['08-consolidation.md',2000],
 ['09-credential-remediation-verification.md',1500,false] // 16 Sep addendum; verifies repo events, not the supplied §11 — its source-check record is its own §6
];
const docs = new Map(audit.map(([f,limit,sourceCheck=true]) => {
  const t=read(`docs/audit/${f}`);
  const body=f.startsWith('02') ? t.split('## Calculations appendix')[0] : t;
  const words=body.trim().split(/\s+/).length;
  assert(words<=limit,`${f}: ${words} words exceeds ${limit}`);
  if (sourceCheck) assert(t.includes('§11'),`${f}: missing source-check record`);
  console.log(`${f}: ${words} whitespace-delimited words`);
  return [f,t];
}));
const numberedRows = text => [...text.matchAll(/^\|\s*(\d+)\s*\|/gm)].map(m=>Number(m[1]));
const journey=docs.get('03-user-journeys.md');
assert((journey.match(/```mermaid/g)||[]).length===6,'Journeys: expected five flow diagrams and one overall diagram');
for(let i=1;i<=12;i++) assert(journey.includes(`**S${String(i).padStart(2,'0')}`),`Missing wireframe S${i}`);
const production=docs.get('04-production-readiness.md');
for(let i=1;i<=10;i++) {
  assert(new RegExp(`^\\| A${String(i).padStart(2,'0')} `,'m').test(production),`Missing web OWASP A${i}`);
  assert(new RegExp(`^\\| API${i} `,'m').test(production),`Missing API OWASP ${i}`);
}
const cases=numberedRows(production.split('## 7. Forty edge cases')[1]?.split('## 8.')[0]||'');
assert(cases.length>=40 && new Set(cases).size===cases.length,'Expected forty distinct production cases');
const business=docs.get('06-business-translation.md');
const translationRows=business.split('## 1. Translation table')[1]?.split('## 2.')[0].split('\n').filter(l=>l.startsWith('|'))||[];
assert(translationRows.length-2>=15,'Expected at least fifteen translation rows');
assert(numberedRows(business).length===20,'Expected twenty commercial objections');
const red=docs.get('07-red-team.md');
assert(numberedRows(red.split('## 1.')[1]?.split('## 2.')[0]||'').length===10,'Expected ten ranked failure stories');
assert(numberedRows(red.split('## 2.')[1]?.split('## 3.')[0]||'').length===20,'Expected twenty demo failures');
assert((red.match(/^\d+\. \*\*/gm)||[]).length===15,'Expected fifteen spoken judge answers');
const wbs=docs.get('05-team-operating-system.md');
assert((wbs.match(/^\| Sep \d+ /gm)||[]).length===15,'Expected fifteen calendar days, Sep 13–27');
const leaves=[...wbs.matchAll(/^\| (\d+\.\d+) \| ([^|]+) \| (\d+) \| (\d+) \| ([^|]+) \|/gm)];
assert(leaves.length===35,'Expected 35 WBS leaves');
const ids=new Set(leaves.map(m=>m[1]));
for(const m of leaves) {
  assert(Number(m[4])<=8,`WBS ${m[1]} exceeds one-day assumption`);
  for(const dep of m[5].trim().split(',')) assert(dep==='none'||ids.has(dep),`WBS ${m[1]} unknown dependency ${dep}`);
}
for(const name of ['lethabo','sibusiso','babatunde','mutarisi','khutso','vukosi','ipeleng']) {
  const t=read(`team/${name}.md`);
  for(const marker of ['AI tool / model','Sequenced work','Interfaces','Needs and blockers','Definition of done','Outside-role work','Running log'])
    assert(t.includes(marker),`team/${name}: missing ${marker}`);
}
for(const p of ['BRIEF.md','RULES.md','AGENTS.md','SECURITY.md','docs/BUILD-LOG.md','team/TEMPLATE.md','templates/BUSINESS-HANDOFF.md','docs/OVERLAPS.md','.github/pull_request_template.md']) read(p);
assert(read('BRIEF.md').trim().split(/\s+/).length<=500,'Brief exceeds 500-word one-page budget');
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
