#!/usr/bin/env node
// Triangle-normal overhang check: independent of the voxel print check. For every variant of a generator (defaults and
// every preset, or --sweep for slider extremes) it adds up the area of triangles that face down and are steeper than
// LIMIT degrees from vertical (default 45; use 40 for margin), ignoring faces lying flat on the bed. A downward
// surface that is exactly flat (a bridge) is reported separately as `flat`.
// Usage: node .claude/skills/makermakers-generator/check-overhang.mjs programs/<name>.html [limit] [--mesh=name]
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const file = process.argv[2], limit = +(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 45);
const meshOnly = (process.argv.find((a) => a.startsWith('--mesh=')) || '').slice(7);
const html = readFileSync(file, 'utf8');
const m = html.match(/<script>\s*([\s\S]*?)<\/script>\s*(?:<script src="shared\/export-utils\.js"><\/script>\s*<script src="shared\/mesh-utils\.js"><\/script>\s*)?<script src="shared\/generator-core\.js">/);
const w = {}; vm.runInNewContext(m[1], { window: w, document: {}, console, Math });
const G = w.MM_GENERATOR, base = Object.fromEntries(G.parameters.map((q) => [q.key, q.value]));
export function overhang(p, lim) {
  const out = { bad: 0, flat: 0, worst: 0, by: {} };
  for (const e of G.build(p, {})) {
    if (meshOnly && e.name !== meshOnly) continue;
    const a = e.positions;
    for (let i = 0; i < a.length; i += 9) {
      const u = [a[i + 3] - a[i], a[i + 4] - a[i + 1], a[i + 5] - a[i + 2]], v = [a[i + 6] - a[i], a[i + 7] - a[i + 1], a[i + 8] - a[i + 2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], L = Math.hypot(...n);
      if (L < 1e-9) continue;
      const down = -n[1] / L; if (down <= 0) continue;
      const y = Math.max(a[i + 1], a[i + 4], a[i + 7]); if (y < 0.3) continue; // on the bed
      const over = 90 - Math.acos(Math.min(1, down)) * 180 / Math.PI, area = L / 2;
      if (down > 0.9999) { out.flat += area; continue; }
      if (over > lim) { out.bad += area; out.worst = Math.max(out.worst, over); out.by[e.name] = (out.by[e.name] || 0) + area; }
    }
  }
  return out;
}
if (process.argv[1].endsWith('check-overhang.mjs')) {
  let fail = false;
  for (const v of [{ label: 'defaults', values: {} }].concat(G.presets)) {
    const r = overhang(Object.assign({}, base, v.values), limit);
    if (r.bad > 1) fail = true;
    console.log((r.bad > 1 ? 'FAIL ' : 'ok   ') + v.label.padEnd(22) + ' steep ' + Math.round(r.bad) + ' mm2 (worst ' + r.worst.toFixed(0) + ' deg) ' + JSON.stringify(r.by) + '  flat ' + Math.round(r.flat) + ' mm2');
  }
  process.exit(fail ? 1 : 0);
}
