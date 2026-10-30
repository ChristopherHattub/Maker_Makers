#!/usr/bin/env node
// CI printability check for one generator: defaults + every preset (see check-mesh.mjs).
// Usage: node scripts/ci/check-generator.mjs <name> [--update-baseline]
//
// FAIL  the page does not load, build() throws or returns nothing, or any variant is not watertight / manifold.
// FAIL  a print-check ERROR kind (floating, overhang) shows up in a variant that the baseline does not list for it.
// WARN  print-check errors the baseline already records (known, not yet fixed). Shown as annotations and in the summary.
// ci/printability-baseline.json is the list of those known errors; fix a generator, then re-run with --update-baseline
// so the ratchet tightens. Nothing is ever added to it silently by CI.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const name = process.argv[2];
const update = process.argv.includes('--update-baseline');
if (!name) { console.error('usage: check-generator.mjs <name> [--update-baseline]'); process.exit(2); }
const basePath = root + 'ci/printability-baseline.json';
const baseline = existsSync(basePath) ? JSON.parse(readFileSync(basePath, 'utf8')) : {};

const run = spawnSync(process.execPath, [root + '.claude/skills/makermakers-generator/check-mesh.mjs', root + 'programs/' + name + '.html', '--all', '--json'],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
let data = null;
try { data = JSON.parse(run.stdout.trim().split('\n').pop()); } catch (e) { /* load failure */ }

const failures = [], warnings = [], known = {};
if (!data) failures.push('page failed to load: ' + ((run.stderr || run.stdout || 'no output').trim().split('\n').slice(-2).join(' ')));
else {
  data.variants.forEach((v) => {
    if (!v.meshOk) failures.push('[' + v.label + '] ' + (v.error || 'not watertight / manifold or has NaN values'));
    const kinds = [...new Set(v.print.filter((i) => i.severity === 'error').map((i) => i.kind))];
    if (kinds.length) known[v.label] = kinds;
    const allowed = (baseline[name] || {})[v.label] || [];
    kinds.forEach((k) => {
      const msg = '[' + v.label + '] print check ' + k + ': ' + v.print.find((i) => i.kind === k && i.severity === 'error').message;
      (allowed.includes(k) ? warnings : failures).push(allowed.includes(k) ? msg : 'NEW ' + msg);
    });
  });
}

if (update) {
  if (data && !failures.some((f) => !f.startsWith('NEW '))) {
    if (Object.keys(known).length) baseline[name] = known; else delete baseline[name];
    const sorted = Object.fromEntries(Object.keys(baseline).sort().map((k) => [k, baseline[k]]));
    writeFileSync(basePath, JSON.stringify(sorted, null, 2) + '\n');
    console.log(name + ': baseline ' + (known && Object.keys(known).length ? 'updated (' + Object.keys(known).length + ' variants with known errors)' : 'cleared (no print errors)'));
    process.exit(0);
  }
  console.error(name + ': not updating baseline, mesh check failed'); process.exit(1);
}

const n = data ? data.variants.length : 0;
const status = failures.length ? 'FAIL' : warnings.length ? 'PASS (known print-check errors)' : 'PASS';
const lines = ['### ' + name + ': ' + status, data ? n + ' variants checked (defaults + ' + (n - 1) + ' presets)' + (data.three ? ', three.js loaded' : '') : ''];
failures.forEach((f) => lines.push('- FAIL ' + f));
warnings.forEach((w) => lines.push('- known ' + w));
console.log(lines.filter(Boolean).join('\n'));
if (process.env.GITHUB_ACTIONS) {
  failures.forEach((f) => console.log('::error title=' + name + '::' + f.replace(/\n/g, ' ')));
  warnings.slice(0, 10).forEach((w) => console.log('::warning title=' + name + '::' + w.replace(/\n/g, ' ')));
}
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.filter(Boolean).join('\n') + '\n\n');
process.exit(failures.length ? 1 : 0);
