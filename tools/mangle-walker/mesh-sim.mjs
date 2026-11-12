#!/usr/bin/env node
// Mesh simulation for the Mangle Rack Walker (slot 137): rolls the crank gear all the way round the rack's
// racetrack of teeth, the way the guide grooves force it to, and reports how far the two tooth outlines overlap
// (and how much room is left). No browser needed.
// Usage: node tools/mangle-walker/mesh-sim.mjs [preset label] [--step 0.2] [--set key=value,key=value]
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const argv = process.argv.slice(2);
const stepArg = argv.indexOf('--step');
const STEP = stepArg >= 0 ? parseFloat(argv[stepArg + 1]) : 0.2;
const shiftArg = argv.indexOf('--shift'); // test aid: turn the gear by this many degrees to prove the check can fail
const SHIFT = shiftArg >= 0 ? parseFloat(argv[shiftArg + 1]) * Math.PI / 180 : 0;
const setArg = argv.indexOf('--set'); // e.g. --set teeth=16,module=1.8,backlash=0.2
const presetLabel = argv.filter((a, i) => !a.startsWith('--') && !(stepArg >= 0 && i === stepArg + 1) && !(shiftArg >= 0 && i === shiftArg + 1) && !(setArg >= 0 && i === setArg + 1))[0];

const html = readFileSync(new URL('../../programs/mangle-walker.html', import.meta.url), 'utf8');
const m = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<script src="shared\/export-utils/);
const win = {};
vm.runInNewContext(m[1], { window: win, document: {}, console });
const cfg = win.MM_GENERATOR, S = cfg.sim;
const params = {};
cfg.parameters.forEach((p) => { params[p.key] = p.value; });
if (presetLabel) Object.assign(params, cfg.presets.find((p) => p.label === presetLabel).values);

if (setArg >= 0) argv[setArg + 1].split(',').forEach((kv) => { const [k, v] = kv.split('='); params[k] = parseFloat(v); });
const D = S.derive(params);
const cav = S.cavityLoop(D);
const gear = S.gearOutline(D.zp, D.m, Math.PI / 2, D.b);

function densify(poly, h) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / h));
    for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  return out;
}
function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
function distEdges(poly, x, y) {
  let best = 1e9;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], dx = b[0] - a[0], dy = b[1] - a[1];
    const L2 = dx * dx + dy * dy, t = L2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)) : 0;
    const d = Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
    if (d < best) best = d;
  }
  return best;
}

const gearDense = densify(gear, 0.15), cavDense = densify(cav, 0.15);
const { Lh, d, rp } = D;
// path: [centre x, centre y, rotation phi] as a function of arc position s
function pose(s) {
  const lenA = Lh, arc = Math.PI * d;
  let r = s;
  if (r <= lenA) return [r, d, r / rp];
  r -= lenA;
  if (r <= arc) { const th = Math.PI / 2 - r / d; return [Lh + d * Math.cos(th), d * Math.sin(th), (Lh + r) / rp]; }
  r -= arc;
  const base1 = (Lh + arc) / rp;
  if (r <= 2 * Lh) return [Lh - r, -d, base1 + r / rp];
  r -= 2 * Lh;
  const base2 = base1 + 2 * Lh / rp;
  if (r <= arc) { const th = -Math.PI / 2 - r / d; return [-Lh + d * Math.cos(th), d * Math.sin(th), base2 + r / rp]; }
  r -= arc;
  const base3 = base2 + arc / rp;
  return [-Lh + r, d, base3 + r / rp];
}
const total = 4 * Lh + 2 * Math.PI * d;

let worstPen = 0, worstAt = 0, minGap = 1e9;
for (let s = 0; s <= total; s += STEP) {
  const [cx, cy, phi0] = pose(s), phi = phi0 + SHIFT, c = Math.cos(phi), sn = Math.sin(phi);
  let pen = 0;
  for (const q of gearDense) {
    const x = cx + c * q[0] - sn * q[1], y = cy + sn * q[0] + c * q[1];
    if (!inside(cav, x, y)) pen = Math.max(pen, distEdges(cav, x, y));
  }
  // ring corners poking into the gear
  const gearWorld = gear.map((q) => [cx + c * q[0] - sn * q[1], cy + sn * q[0] + c * q[1]]);
  for (const q of cavDense) if (inside(gearWorld, q[0], q[1])) pen = Math.max(pen, distEdges(gearWorld, q[0], q[1]));
  if (pen > worstPen) { worstPen = pen; worstAt = s; }
}
// phase check: the gear must come back to the start pose after one lap (tooth pitch multiple)
const end = pose(total), endPhase = ((end[2] % (2 * Math.PI / D.zp)) + 2 * Math.PI / D.zp) % (2 * Math.PI / D.zp);
console.log(`${presetLabel || 'defaults'}: gear ${D.zp} teeth, rack ${D.N} per row, module ${D.m}, lap ${total.toFixed(1)} mm, centre offset ${d.toFixed(2)} mm`);
console.log(`  worst overlap of tooth outlines: ${worstPen.toFixed(3)} mm at s=${worstAt.toFixed(1)} (backlash ${D.b} mm)`);
console.log(`  phase after one lap vs tooth pitch: ${(endPhase * 180 / Math.PI).toFixed(3)} deg (0 or ${(360 / D.zp).toFixed(1)} is right)`);
process.exit(worstPen > 0.05 ? 1 : 0);
