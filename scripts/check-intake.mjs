import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const staged = process.argv.includes('--staged');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const read = p => staged ? git('show', `:${p}`) : fs.readFileSync(p, 'utf8');
const files = staged
  ? git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z').split('\0').filter(Boolean)
  : walk('.');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (['.git', '.tools', 'node_modules', 'work'].includes(e.name)) return [];
    const p = path.posix.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
// Repository tooling is allowed while remediation is blocked. Application/infra
// intake remains a reviewed scope boundary, not a substitute for human review.
const feature = files.filter(p => /^(server|edge|mobile|android|app|src|components|infra|contracts)\//.test(p) ||
  (!/^(scripts|\.githooks|\.github)\//.test(p) && /\.(py|kt|java|tsx?|jsx?|go|rs|swift|apk|onnx|pt|tflite)$/i.test(p)));
if (!feature.length) { console.log('Intake gate: documentation/repository tooling only.'); process.exit(0); }
const gate = JSON.parse(read('docs/security/intake-gate.json'));
const keys = ['three_credentials_revoked', 'reused_password_changed', 'old_private_dataset_remediated', 'old_readmes_built_designed_split', 'local_hook_and_ci_proven'];
const good = gate.status === 'approved' && keys.every(k => gate.requirements?.[k]?.verified === true &&
  typeof gate.requirements[k].evidence === 'string' && gate.requirements[k].evidence.trim()) &&
  ['lethabo','sibusiso'].every(k => typeof gate.lead_approvals?.[k] === 'string' && gate.lead_approvals[k].trim());
if (!good) {
  console.error('Feature intake blocked: remediation evidence and both human lead approvals are required.');
  process.exit(1);
}
console.log('Intake gate has evidence references and approval records; reviewers must verify their authenticity.');
