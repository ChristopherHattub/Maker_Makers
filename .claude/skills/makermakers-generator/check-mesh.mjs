#!/usr/bin/env node
// Printability check for a MakerMakers generator: runs build() with default (or preset) parameters
// and reports watertightness per mesh and overall. No browser needed.
// Usage: node .claude/skills/makermakers-generator/check-mesh.mjs programs/<name>.html [presetLabel]
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const file = process.argv[2];
const presetLabel = process.argv[3];
if (!file) { console.error('usage: check-mesh.mjs programs/<name>.html [preset label]'); process.exit(2); }

const html = readFileSync(file, 'utf8');
const m = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<script src="shared\/generator-core\.js">/);
if (!m) { console.error('Could not find the config <script> before the engine tag.'); process.exit(2); }

const win = {};
vm.runInNewContext(m[1], { window: win, document: {}, console, Math });
const cfg = win.MM_GENERATOR;
if (!cfg) { console.error('window.MM_GENERATOR not set'); process.exit(2); }

const params = {};
cfg.parameters.forEach((p) => { params[p.key] = p.value; });
if (presetLabel) {
  const preset = (cfg.presets || []).find((p) => p.label === presetLabel);
  if (!preset) { console.error('No preset named ' + presetLabel); process.exit(2); }
  Object.assign(params, preset.values);
}
const api = { params, THREE: undefined, rebuild() {}, setParams() {}, setPreview() {}, toast() {}, centerCamera() {} };
if (typeof cfg.testSetup === 'function') cfg.testSetup(params); // optional: place stamps/cuts so they are checked too
const meshes = cfg.build.call(cfg, params, api);

const EPS = 0.001; // same weld tolerance as the engine
const q = (v) => Math.round(v / EPS);
function analyse(entries) {
  const ids = new Map();
  const id = (x, y, z) => {
    const k = q(x) + ',' + q(y) + ',' + q(z);
    if (!ids.has(k)) ids.set(k, ids.size);
    return ids.get(k);
  };
  const edges = new Map(); // "a>b" directed edge count
  let tris = 0, degenerate = 0, nan = 0, volume = 0;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const e of entries) {
    const p = e.positions;
    for (let i = 0; i < p.length; i += 9) {
      tris++;
      for (let k = 0; k < 9; k++) if (!Number.isFinite(p[i + k])) nan++;
      for (let k = 0; k < 3; k++) for (let a = 0; a < 3; a++) {
        min[a] = Math.min(min[a], p[i + k * 3 + a]); max[a] = Math.max(max[a], p[i + k * 3 + a]);
      }
      const v = [0, 1, 2].map((k) => id(p[i + k * 3], p[i + k * 3 + 1], p[i + k * 3 + 2]));
      if (v[0] === v[1] || v[1] === v[2] || v[0] === v[2]) { degenerate++; continue; }
      for (let k = 0; k < 3; k++) {
        const key = v[k] + '>' + v[(k + 1) % 3];
        edges.set(key, (edges.get(key) || 0) + 1);
      }
      volume += (p[i] * (p[i + 4] * p[i + 8] - p[i + 5] * p[i + 7])
        - p[i + 1] * (p[i + 3] * p[i + 8] - p[i + 5] * p[i + 6])
        + p[i + 2] * (p[i + 3] * p[i + 7] - p[i + 4] * p[i + 6])) / 6;
    }
  }
  let open = 0, nonManifold = 0;
  for (const [key, n] of edges) {
    const [a, b] = key.split('>');
    const rev = edges.get(b + '>' + a) || 0;
    if (n > 1) nonManifold++;
    else if (rev === 0) open++;
  }
  return { tris, verts: ids.size, degenerate, nan, open, nonManifold, volume, size: max.map((v, i) => +(v - min[i]).toFixed(2)) };
}

let bad = false;
const line = (label, r) => {
  const ok = r.open === 0 && r.nonManifold === 0 && r.nan === 0;
  console.log(`${label}: ${r.tris} tris, ${r.verts} verts, open edges ${r.open}, non-manifold edges ${r.nonManifold}, degenerate ${r.degenerate}, NaN ${r.nan}, volume ${r.volume.toFixed(1)} mm3, size ${r.size.join(' x ')} (Y-up) ${ok ? 'OK' : 'CHECK'}`);
  return ok;
};
meshes.forEach((e) => { line('  mesh "' + e.name + '"', analyse([e])); });
// Meshes sharing a smoothGroup are one surface split for painting, so they are checked together.
const groups = new Map();
meshes.forEach((e) => { const g = e.smoothGroup || ('__' + e.name); groups.set(g, (groups.get(g) || []).concat(e)); });
for (const [g, list] of groups) {
  if (!g.startsWith('__') || list.length > 1) { if (!line('smoothGroup "' + g + '" (combined)', analyse(list))) bad = true; }
  else if (!line('solid "' + g.slice(2) + '"', analyse(list))) bad = true;
}
console.log(bad ? 'RESULT: not watertight or has bad values. Fix before shipping.' : 'RESULT: every closed surface is watertight.');

// Print check (same code as the live chip in the generator page): floating parts, overhangs over ~50 degrees, thin walls.
// Informational by default; add --strict to fail on errors (floating parts, big overhangs).
try {
  const pcWin = {};
  vm.runInNewContext(readFileSync(new URL('../../../programs/shared/print-check.js', import.meta.url), 'utf8'), { window: pcWin, Math, Date });
  const pc = pcWin.MM_PRINT_CHECK.check(meshes);
  if (!pc.issues.length) console.log('PRINT CHECK: no supports needed (no floating parts, no overhang over ~50 degrees, no thin walls).');
  pc.issues.forEach((i) => console.log('PRINT CHECK ' + i.severity.toUpperCase() + ' (' + i.kind + '): ' + i.message));
  (pc.spots || []).slice(0, 6).forEach((s) => console.log('  at x ' + s.x.toFixed(1) + ' y ' + s.y.toFixed(1) + ' z ' + s.z.toFixed(1) + ' (Y-up), ' + Math.round(s.area) + ' mm2'));
  if (process.argv.includes('--strict') && pc.issues.some((i) => i.severity === 'error')) bad = true;
} catch (e) { console.log('PRINT CHECK skipped: ' + e.message); }
process.exit(bad ? 1 : 0);
