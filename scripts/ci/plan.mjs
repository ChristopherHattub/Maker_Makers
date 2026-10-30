#!/usr/bin/env node
// Decides which generators the printability workflow checks. Prints a JSON array of names to stdout.
// Usage: node scripts/ci/plan.mjs <base-sha|''> [all|name,name,...]
//   - an explicit list or "all" (workflow_dispatch) wins
//   - no base (first push of a branch, all-zero sha): every generator
//   - a change to shared code (programs/shared/, the check scripts, the baseline, this workflow): every generator
//   - otherwise: each programs/<name>.html that was added or modified (a new generator is "added", so it is always checked)
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const all = readdirSync(root + 'programs').filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5)).sort();
const base = process.argv[2] || '';
const request = process.argv[3] || '';
const out = (list, why) => { console.error('plan: ' + why + ' -> ' + list.length + ' generators'); console.log(JSON.stringify(list)); process.exit(0); };

if (request && request !== 'all') {
  const want = request.split(',').map((s) => s.trim().replace(/^programs\//, '').replace(/\.html$/, '')).filter(Boolean);
  const unknown = want.filter((n) => !all.includes(n));
  if (unknown.length) { console.error('unknown generators: ' + unknown.join(', ')); process.exit(2); }
  out(want, 'requested');
}
if (request === 'all') out(all, 'requested all');
if (!base || /^0+$/.test(base)) out(all, 'no base commit');

let diff;
try { diff = execFileSync('git', ['diff', '--name-status', '--no-renames', base, 'HEAD'], { cwd: root, encoding: 'utf8' }); }
catch (e) { out(all, 'base commit not available'); }
const files = diff.split('\n').filter(Boolean).map((l) => { const [s, ...p] = l.split('\t'); return { s, p: p.join('\t') }; });
const shared = /^(programs\/shared\/|\.claude\/skills\/makermakers-generator\/check-mesh\.mjs$|scripts\/ci\/|ci\/|\.github\/workflows\/printability\.yml$)/;
if (files.some((f) => shared.test(f.p))) out(all, 'shared code changed');
const changed = files.filter((f) => f.s !== 'D' && /^programs\/[^/]+\.html$/.test(f.p)).map((f) => f.p.slice(9, -5));
out(all.filter((n) => changed.includes(n)), 'changed generator pages');
