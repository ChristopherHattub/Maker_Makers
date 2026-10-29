#!/usr/bin/env node
// Print-in-place check for a flexi creature page: builds the model and measures the gap between every pair
// of separate rigid bodies (they must never touch or overlap, or the joint fuses solid when printed).
// Usage: node tools/flexi/check-flexi.mjs programs/<name>.html [presetLabel] [--bend deg] [--set key=value ...]
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const args = process.argv.slice(2);
const file = args.shift();
let presetLabel, bend = 0;
const sets = {};
while (args.length) {
  const a = args.shift();
  if (a === '--bend') bend = Number(args.shift());
  else if (a === '--set') { const [k, v] = args.shift().split('='); sets[k] = Number(v); }
  else presetLabel = a;
}
const html = readFileSync(file, 'utf8');
const m = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<script src="shared\/generator-core\.js">/);
const win = {};
vm.runInNewContext(m[1], { window: win, document: {}, console, Math });
const cfg = win.MM_GENERATOR;
const params = {};
cfg.parameters.forEach((p) => { params[p.key] = p.value; });
if (presetLabel) Object.assign(params, cfg.presets.find((p) => p.label === presetLabel).values);
Object.assign(params, sets);
if (bend) params.__bend = (bend * Math.PI) / 180;
const meshes = cfg.build.call(cfg, params, { params });
const bodies = win.MM_FLEXI_BODIES;
const gap = params.gap || 0.4;

// triangle list per body
const B = Object.keys(bodies).map((id) => {
  const arrs = bodies[id];
  let tris = [];
  for (const a of arrs) for (let i = 0; i < a.length; i += 9) tris.push(a.subarray(i, i + 9));
  const min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
  for (const t of tris) for (let v = 0; v < 3; v++) for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], t[v * 3 + c]); max[c] = Math.max(max[c], t[v * 3 + c]); }
  return { id, tris, min, max };
});
function ptTri(p, t) { // distance from point to triangle
  const a = [t[0], t[1], t[2]], b = [t[3], t[4], t[5]], c = [t[6], t[7], t[8]];
  const sub = (x, y) => [x[0] - y[0], x[1] - y[1], x[2] - y[2]], dot = (x, y) => x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot(ab, ap), d2 = dot(ac, ap);
  let q;
  if (d1 <= 0 && d2 <= 0) q = a;
  else {
    const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
    if (d3 >= 0 && d4 <= d3) q = b;
    else {
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); q = [a[0] + ab[0] * v, a[1] + ab[1] * v, a[2] + ab[2] * v]; }
      else {
        const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
        if (d6 >= 0 && d5 <= d6) q = c;
        else {
          const vb = d5 * d2 - d1 * d6;
          if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); q = [a[0] + ac[0] * w, a[1] + ac[1] * w, a[2] + ac[2] * w]; }
          else {
            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); q = [b[0] + (c[0] - b[0]) * w, b[1] + (c[1] - b[1]) * w, b[2] + (c[2] - b[2]) * w]; }
            else { const den = 1 / (va + vb + vc), v = vb * den, w = vc * den; q = [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w]; }
          }
        }
      }
    }
  }
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}
const CELL = 3;
function grid(body) {
  const cells = new Map();
  body.tris.forEach((t, i) => {
    const lo = [0, 1, 2].map((c) => Math.floor(Math.min(t[c], t[3 + c], t[6 + c]) / CELL)), hi = [0, 1, 2].map((c) => Math.floor(Math.max(t[c], t[3 + c], t[6 + c]) / CELL));
    for (let x = lo[0]; x <= hi[0]; x++) for (let y = lo[1]; y <= hi[1]; y++) for (let z = lo[2]; z <= hi[2]; z++) {
      const k = x + ',' + y + ',' + z; if (!cells.has(k)) cells.set(k, []); cells.get(k).push(i);
    }
  });
  return cells;
}
function samples(body) {
  const out = [];
  for (const t of body.tris) {
    const v = [[t[0], t[1], t[2]], [t[3], t[4], t[5]], [t[6], t[7], t[8]]];
    v.forEach((p) => out.push(p));
    for (let e = 0; e < 3; e++) { const a = v[e], b = v[(e + 1) % 3]; out.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]); }
    out.push([(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3, (v[0][2] + v[1][2] + v[2][2]) / 3]);
  }
  return out;
}
const R = 2.5;
function minDist(A, Bb, gridB) {
  let best = Infinity;
  for (const p of samples(A)) {
    const cx = Math.floor(p[0] / CELL), cy = Math.floor(p[1] / CELL), cz = Math.floor(p[2] / CELL), r = Math.ceil(R / CELL);
    const seen = new Set();
    for (let x = cx - r; x <= cx + r; x++) for (let y = cy - r; y <= cy + r; y++) for (let z = cz - r; z <= cz + r; z++) {
      const l = gridB.get(x + ',' + y + ',' + z); if (!l) continue;
      for (const i of l) { if (seen.has(i)) continue; seen.add(i); const d = ptTri(p, Bb.tris[i]); if (d < best) best = d; }
    }
  }
  return best;
}
const grids = B.map(grid);
function where(A, Bb, gridB) { // closest sample of A to Bb, in the local frame of each chain segment
  let best = Infinity, bp = null, bt = null;
  for (const p of samples(A)) {
    const cx = Math.floor(p[0] / CELL), cy = Math.floor(p[1] / CELL), cz = Math.floor(p[2] / CELL);
    for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) for (let z = cz - 1; z <= cz + 1; z++) {
      const l = gridB.get(x + ',' + y + ',' + z); if (!l) continue;
      for (const i of l) { const d = ptTri(p, Bb.tris[i]); if (d < best) { best = d; bp = p; bt = Bb.tris[i]; } }
    }
  }
  return { best, bp, bt };
}
let worst = Infinity, bad = 0, pairs = 0, tris = 0, worstPair = '';
const list = [];
for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
  const A = B[i], C = B[j];
  let near = true;
  for (let c = 0; c < 3; c++) if (A.min[c] > C.max[c] + R || C.min[c] > A.max[c] + R) near = false;
  if (!near) continue;
  pairs++;
  const d = Math.min(minDist(A, C, grids[j]), minDist(C, A, grids[i]));
  if (d < 2.4) list.push([d, A.id + ' / ' + C.id]);
  if (d < worst) { worst = d; worstPair = A.id + ' / ' + C.id; }
  if (d < gap * 0.75) bad++;
}
B.forEach((b) => { tris += b.tris.length; });
list.sort((a, b) => a[0] - b[0]);
console.log(`${B.length} rigid bodies, ${tris} tris, ${pairs} neighbouring pairs; smallest gap ${worst.toFixed(3)} mm (${worstPair}); gap setting ${gap} mm${bend ? '; every joint bent ' + bend + '°' : ''}`);
list.slice(0, 5).forEach((l) => console.log('  ' + l[0].toFixed(3) + ' mm  ' + l[1]));
if (process.env.WHERE && worstPair) {
  const [ia, ib] = worstPair.split(' / ');
  const A = B.find((b) => b.id === ia), C = B.find((b) => b.id === ib);
  const w1 = where(A, C, grids[B.indexOf(C)]), w2 = where(C, A, grids[B.indexOf(A)]);
  const w = w1.best < w2.best ? w1 : w2;
  console.log('closest point', w.bp.map((x) => x.toFixed(2)).join(','), 'triangle', Array.from(w.bt).map((x) => x.toFixed(2)).join(','));
  (win.MM_FLEXI_CHAINS || []).forEach((ch, ci) => ch.segs.forEach((sg) => {
    const loc = (q) => { const rel = [0, 1, 2].map((m) => q[m] - sg.fr.o[m]); const ax = [sg.fr.a, sg.fr.u, sg.fr.v]; return ax.map((a) => rel[0] * a[0] + rel[1] * a[1] + rel[2] * a[2]); };
    const pl = loc(w.bp), tl = loc([w.bt[0], w.bt[1], w.bt[2]]);
    if (Math.abs(pl[0]) < 14) console.log(`  chain${ci} seg${sg.k}: point s=${pl[0].toFixed(2)} r=${Math.hypot(pl[1], pl[2]).toFixed(2)}; triangle s=${tl[0].toFixed(2)} r=${Math.hypot(tl[1], tl[2]).toFixed(2)}  (P=${sg.P.toFixed(2)} sR=${sg.sR.toFixed(2)} sF=${sg.sF.toFixed(2)} rr=${sg.rr.toFixed(2)} rf=${sg.rf.toFixed(2)} R=${sg.jin.R.toFixed(2)} Rs=${sg.jin.Rs.toFixed(2)} ao=${sg.jin.ao.toFixed(2)} d=${sg.jin.d.toFixed(2)})`);
  }));
}
let lowest = 1e9;
B.forEach((b) => { lowest = Math.min(lowest, b.min[1]); });
console.log('lowest point y = ' + lowest.toFixed(3) + ' (bed is 0)');
console.log(bad ? `RESULT: ${bad} pair(s) closer than ${(gap * 0.75).toFixed(2)} mm, joints may fuse. Fix before shipping.` : 'RESULT: every moving part has clearance.');
process.exit(bad ? 1 : 0);
