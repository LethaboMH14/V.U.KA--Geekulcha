import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const repo = process.cwd();
const scanner = path.resolve(process.argv[2] || path.join('.tools', process.platform === 'win32' ? 'gitleaks.exe' : 'gitleaks'));
if (!fs.existsSync(scanner)) throw new Error('Pass an installed Gitleaks executable path.');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'vuka-security-test-'));
const run = (args, expected, description, env = process.env) => {
  const r = spawnSync('git', args, { cwd: fixture, env, encoding: 'utf8' });
  if (r.error || (expected === 0 ? r.status !== 0 : r.status === 0 || r.status === null)) {
    throw new Error(`${description} failed: ${r.error?.message || r.stderr || r.stdout}`);
  }
  console.log(`PASS: ${description}`);
  return (r.stdout || '') + (r.stderr || '');
};
run(['init','-q'],0,'isolated fixture initialised');
run(['config','core.excludesFile','.git/info/exclude'],0,'fixture excludes are local and readable');
for(const file of ['.githooks/pre-commit','.gitleaks.toml','scripts/check-intake.mjs','docs/security/intake-gate.json']) {
  fs.mkdirSync(path.dirname(path.join(fixture,file)),{recursive:true});
  fs.copyFileSync(path.join(repo,file),path.join(fixture,file));
}
fs.chmodSync(path.join(fixture,'.githooks/pre-commit'),0o755);
fs.mkdirSync(path.join(fixture,'.tools'));
const fixtureScanner = path.join(fixture,'.tools',process.platform==='win32'?'gitleaks.exe':'gitleaks');
fs.copyFileSync(scanner,fixtureScanner);
fs.chmodSync(fixtureScanner,0o755);
fs.writeFileSync(path.join(fixture,'.gitignore'),'.tools/\n');
run(['config','core.hooksPath','.githooks'],0,'hook enabled in fixture');
const commit = ['-c','user.name=VUKA synthetic test','-c','user.email=sim_test@example.invalid',
  '-c','commit.gpgsign=false','commit','-m','test: synthetic gate exercise'];
fs.writeFileSync(path.join(fixture,'README.md'),'Synthetic clean fixture only.\n');
run(['add','.'],0,'clean content staged');
run(commit,0,'clean staged commit passes actual hook');
const synthetic = ['VUKA','TEST','SECRET'].join('_')+'_'+'A'.repeat(24);
fs.writeFileSync(path.join(fixture,'example.txt'),synthetic+'\n');
run(['add','example.txt'],0,'noncredential synthetic leak staged');
const leakOutput=run(commit,1,'synthetic leak blocks actual hook');
if (leakOutput.includes(synthetic)) throw new Error('Scanner exposed unredacted fixture.');
fs.writeFileSync(path.join(fixture,'example.txt'),'Clean replacement in worktree only.\n');
run(commit,1,'clean unstaged replacement cannot conceal staged leak');
run(['add','example.txt'],0,'clean replacement staged');
run(commit,0,'clean replacement passes');
fs.mkdirSync(path.join(fixture,'server'));
fs.writeFileSync(path.join(fixture,'server','example.py'),'# Synthetic application intake fixture\n');
run(['add','server/example.py'],0,'application fixture staged');
const intakeOutput=run(commit,1,'unapproved feature intake blocks actual hook');
if (!intakeOutput.includes('Feature intake blocked')) throw new Error('Expected intake gate denial was not observed.');
run(['reset','--','server/example.py'],0,'unstage fixture after denial');
// Remove scanner availability in the fixture. Do not modify the real tool.
fs.renameSync(fixtureScanner, fixtureScanner+'.disabled');
fs.writeFileSync(path.join(fixture,'README.md'),'Synthetic clean fixture changed.\n');
run(['add','README.md'],0,'clean update staged');
// Force command lookup to exclude an independently installed Gitleaks while retaining Git/Node shell utilities.
const env = {...process.env};
const key=Object.keys(env).find(k=>k.toLowerCase()==='path')||'PATH';
env[key]=(env[key]||'').split(path.delimiter).filter(p=>{
  try { return !['gitleaks','gitleaks.exe'].some(n=>fs.existsSync(path.join(p,n))); } catch { return true; }
}).join(path.delimiter);
const missing=run(commit,1,'missing scanner blocks commit',env);
if(!missing.includes('Commit blocked: install Gitleaks')) throw new Error('Missing-scanner failure was not from the expected guard.');
console.log('Security integration checks passed; no fixture was added to the real repository.');
console.log(`Synthetic-only fixture retained for inspection: ${fixture}`);
