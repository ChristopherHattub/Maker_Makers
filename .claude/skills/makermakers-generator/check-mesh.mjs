#!/usr/bin/env node
// Printability check for a MakerMakers generator: runs build() with default (or preset) parameters
// and reports watertightness per mesh and overall, plus the shared print check. No browser needed.
// Usage: node .claude/skills/makermakers-generator/check-mesh.mjs programs/<name>.html [presetLabel] [--strict] [--all] [--json]
//   --all   check the defaults and then every preset (one process, one result)
//   --json  print one JSON object instead of the text report (used by scripts/ci/check-generator.mjs)
// Generators that call api.THREE (bookend-builder, image-clicker, key-clicker, remote-caddy, shelf-bracket,
// tealight-lantern, tray-maker, wall-hook-rack) need three.js r128: it is loaded from $THREE_PATH or
// node_modules/three/build/three.min.js (CI runs `npm install --no-save three@0.128.0`).
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith('--'));
const pos = argv.filter((a) => !a.startsWith('--'));
const file = pos[0];
const presetArg = pos[1];
const ALL = flags.includes('--all'), JSON_OUT = flags.includes('--json'), STRICT = flags.includes('--strict');
if (!file) { console.error('usage: check-mesh.mjs programs/<name>.html [preset label] [--all] [--json] [--strict]'); process.exit(2); }

const html = readFileSync(file, 'utf8');
const m = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<script src="shared\/generator-core\.js">/);
if (!m) { console.error('Could not find the config <script> before the engine tag.'); process.exit(2); }

// three.js r128 (global build), only for generators that use api.THREE.
let THREE;
const threePath = process.env.THREE_PATH || new URL('../../../node_modules/three/build/three.min.js', import.meta.url).pathname;
if (existsSync(threePath)) {
  const tw = {};
  vm.runInNewContext(readFileSync(threePath, 'utf8'), tw);
  THREE = tw.THREE;
}

// Math.random is seeded (and re-seeded before every variant) so a generator that randomises gives the same result every run.
let seed = 1;
const seededMath = Object.assign(Object.create(Math), {
  random() { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
});
const win = {};
vm.runInNewContext(m[1], { window: win, document: {}, console, Math: seededMath, THREE });
const cfg = win.MM_GENERATOR;
if (!cfg) { console.error('window.MM_GENERATOR not set'); process.exit(2); }

function buildVariant(presetLabel) {
  seed = 1;
  const params = {};
  cfg.parameters.forEach((p) => { params[p.key] = p.value; });
  if (presetLabel) {
    const preset = (cfg.presets || []).find((p) => p.label === presetLabel);
    if (!preset) { console.error('No preset named ' + presetLabel); process.exit(2); }
    Object.assign(params, preset.values);
  }
  const api = { params, THREE, rebuild() {}, setParams() {}, setPreview() {}, toast() {}, centerCamera() {} };
  if (typeof cfg.testSetup === 'function') cfg.testSetup(params); // optional: place stamps/cuts so they are checked too
  return cfg.build.call(cfg, params, api);
}

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


let pcCheck;
try {
  const pcWin = {};
  vm.runInNewContext(readFileSync(new URL('../../../programs/shared/print-check.js', import.meta.url), 'utf8'), { window: pcWin, Math, Date });
  pcCheck = pcWin.MM_PRINT_CHECK.check;
} catch (e) { pcCheck = null; }

// Runs one variant (defaults or a preset). out(text) receives the text report lines.
function runVariant(presetLabel, out) {
  const res = { label: presetLabel || 'defaults', meshOk: true, error: null, print: [], tris: 0 };
  let meshes;
  try { meshes = buildVariant(presetLabel); } catch (e) { res.meshOk = false; res.error = e.message; out('BUILD FAILED: ' + e.message); return res; }
  const line = (label, r) => {
    const ok = r.open === 0 && r.nonManifold === 0 && r.nan === 0;
    out(`${label}: ${r.tris} tris, ${r.verts} verts, open edges ${r.open}, non-manifold edges ${r.nonManifold}, degenerate ${r.degenerate}, NaN ${r.nan}, volume ${r.volume.toFixed(1)} mm3, size ${r.size.join(' x ')} (Y-up) ${ok ? 'OK' : 'CHECK'}`);
    return ok;
  };
  meshes.forEach((e) => { line('  mesh "' + e.name + '"', analyse([e])); });
  // Meshes sharing a smoothGroup are one surface split for painting, so they are checked together.
  const groups = new Map();
  meshes.forEach((e) => { const g = e.smoothGroup || ('__' + e.name); groups.set(g, (groups.get(g) || []).concat(e)); });
  for (const [g, list] of groups) {
    if (!g.startsWith('__') || list.length > 1) { if (!line('smoothGroup "' + g + '" (combined)', analyse(list))) res.meshOk = false; }
    else if (!line('solid "' + g.slice(2) + '"', analyse(list))) res.meshOk = false;
  }
  res.tris = analyse(meshes).tris;
  if (!res.tris) { res.meshOk = false; res.error = 'build() returned no triangles'; }
  out(res.meshOk ? 'RESULT: every closed surface is watertight.' : 'RESULT: not watertight, empty, or has bad values. Fix before shipping.');

  // Print check (same code as the live chip in the generator page): floating parts, overhangs over ~50 degrees, thin walls.
  // Informational by default; --strict fails on errors (floating parts, big overhangs).
  if (!pcCheck) { out('PRINT CHECK skipped: could not load print-check.js'); return res; }
  try {
    const pc = pcCheck(meshes);
    if (!pc.issues.length) out('PRINT CHECK: no supports needed (no floating parts, no overhang over ~50 degrees, no thin walls).');
    pc.issues.forEach((i) => { out('PRINT CHECK ' + i.severity.toUpperCase() + ' (' + i.kind + '): ' + i.message); res.print.push({ kind: i.kind, severity: i.severity, message: i.message }); });
    (pc.spots || []).slice(0, 6).forEach((s) => out('  at x ' + s.x.toFixed(1) + ' y ' + s.y.toFixed(1) + ' z ' + s.z.toFixed(1) + ' (Y-up), ' + Math.round(s.area) + ' mm2'));
  } catch (e) { out('PRINT CHECK skipped: ' + e.message); }
  return res;
}

const labels = ALL ? [null].concat((cfg.presets || []).map((p) => p.label)) : [presetArg || null];
const results = [];
labels.forEach((l) => {
  const lines = [];
  const r = runVariant(l, (t) => lines.push(t));
  results.push(r);
  if (!JSON_OUT) { if (ALL) console.log('== ' + r.label + ' =='); lines.forEach((t) => console.log(t)); }
});
const bad = results.some((r) => !r.meshOk || (STRICT && r.print.some((i) => i.severity === 'error')));
if (JSON_OUT) console.log(JSON.stringify({ file, three: !!THREE, variants: results }));
process.exit(bad ? 1 : 0);
