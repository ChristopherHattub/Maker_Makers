#!/usr/bin/env node
// Print check for one animal page with optional parameter overrides and entry filter.
// Usage: node tools/animals/pc.mjs programs/<name>.html [--set key=value ...] [--only a,b] [--preset label]
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const args = process.argv.slice(2), file = args.shift(), sets = {}; let only = null, preset = null;
while (args.length) { const a = args.shift(); if (a === '--set') { const [k, v] = args.shift().split('='); sets[k] = Number(v); } else if (a === '--only') only = args.shift().split(','); else if (a === '--preset') preset = args.shift(); }
const html = readFileSync(file, 'utf8');
const m = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<script src="shared\/generator-core\.js">/);
const win = {};
vm.runInNewContext(m[1], { window: win, document: {}, console, Math });
const cfg = win.MM_GENERATOR, params = {};
cfg.parameters.forEach((p) => { params[p.key] = p.value; });
if (preset) Object.assign(params, cfg.presets.find((p) => p.label === preset).values);
Object.assign(params, sets);
let entries = cfg.build.call(cfg, params, { params, rebuild() {}, setParams() {}, toast() {} });
if (only) entries = entries.filter((e) => only.includes(e.name));
const pcWin = {};
vm.runInNewContext(readFileSync(new URL('../../programs/shared/print-check.js', import.meta.url), 'utf8'), { window: pcWin, Math, Date });
const r = pcWin.MM_PRINT_CHECK.check(entries, {});
let lo = 1e9, hi = -1e9;
entries.forEach((e) => { for (let i = 1; i < e.positions.length; i += 3) { lo = Math.min(lo, e.positions[i]); hi = Math.max(hi, e.positions[i]); } });
console.log('y range', lo.toFixed(2), hi.toFixed(2), 'entries', entries.map((e) => e.name).join(','));
(r.issues || []).forEach((i) => console.log(i.severity, i.kind, i.message, (i.spots || []).slice(0, 4).map((s) => JSON.stringify(s)).join(' ')));
if (!(r.issues || []).length) console.log('no supports needed');
