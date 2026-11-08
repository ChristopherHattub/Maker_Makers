#!/usr/bin/env node
// Planar simulation of the Gravity Walker (slot 122): checks that the proportions of programs/gravity-walker.html walk.
// Usage: node tools/gravity-walker/walk-sim.mjs [key=value ...] [--slopes] [--robust]
//   key=value  override a generator parameter, e.g. legR=60 head=1 slope=9
//   --slopes   walk speed for ramp slopes 4 to 14 degrees
//   --robust   9 perturbed runs (slope +-1.5 deg, body centre of mass +-15 %, rear leg centre of mass +-15 %, rear leg weight +-20 %); 9 of 9 is a sound design
//
// The model (docs/gravity-walker.md): two rigid links hinged at H, a body A and a rear leg B. Each has a foot arc of radius r
// centred on H (A +-20 deg, B +-24 deg about its own axis) that rolls on the ramp without slipping; the one that holds the ground is
// the stance leg, the other swings free between two stops (psi = B angle minus A angle). When the ground leaves the stance foot
// the other foot takes over with a plastic impact (sliding impulse at the ground); the stops are plastic impacts too.
// Generalised coordinates q = (s, phiA, phiB), s along the ramp; phi is the leg axis angle from the ramp normal, forward positive.
// The mass properties (mass, centre of mass distance and angle, inertia) come from the generator itself: cfg.walkProps(params).
// Units are cm, g, s. Nothing here ships to the browser; it is a design check, not proof that a printed toy will walk.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const G = 981;

function solve(M, b) { // Gaussian elimination with partial pivoting
  const n = b.length, A = M.map((r, i) => r.concat([b[i]]));
  for (let i = 0; i < n; i++) {
    let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
    [A[i], A[p]] = [A[p], A[i]];
    for (let k = i + 1; k < n; k++) { const f = A[k][i] / A[i][i]; for (let j = i; j <= n; j++) A[k][j] -= f * A[i][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = A[i][n]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
  return x;
}

export function simulate(P, { tEnd = 20, dt = 2e-4 } = {}) {
  const { r, gam, mA, mB, cA, cB, IA, IB, winA, winB, psiMin, psiMax } = P;
  const bA = P.betaA || 0, bB = P.betaB || 0, sg = Math.sin(gam), cg = Math.cos(gam);
  let q = [0, 0, P.psiMin], v = [0, 0, 0], stance = 'A', stop = 0, fail = null, transfers = 0;
  const touches = (leg, qq) => { const th = -(leg === 'A' ? qq[1] : qq[2]), w = leg === 'A' ? winA : winB; return th >= w[0] && th <= w[1]; };
  const Mmat = (qq) => {
    const pa = qq[1] + bA, pb = qq[2] + bB;
    return [[mA + mB, mA * cA * Math.cos(pa), mB * cB * Math.cos(pb)], [mA * cA * Math.cos(pa), mA * cA * cA + IA, 0], [mB * cB * Math.cos(pb), 0, mB * cB * cB + IB]];
  };
  const forces = (qq, vv) => {
    const pa = qq[1] + bA, pb = qq[2] + bB;
    const tf = (P.fric || 0) * mB * G * Math.tanh((vv[2] - vv[1]) / 0.05); // hinge friction
    return [(mA + mB) * G * sg + mA * cA * Math.sin(pa) * vv[1] ** 2 + mB * cB * Math.sin(pb) * vv[2] ** 2,
      -(mA * G * cA * (-sg * Math.cos(pa) + cg * Math.sin(pa))) + tf, -(mB * G * cB * (-sg * Math.cos(pb) + cg * Math.sin(pb))) - tf];
  };
  const rows = (leg, stopFlag) => { const J = [leg === 'A' ? [1, r, 0] : [1, 0, r]]; if (stopFlag) J.push([0, -1, 1]); return J; };
  const kkt = (qq, vv, J) => {
    const M = Mmat(qq), f = forces(qq, vv), A = [], b = [];
    for (let i = 0; i < 3; i++) { A.push([...M[i], ...J.map((row) => -row[i])]); b.push(f[i]); }
    J.forEach((row) => { A.push([...row, ...new Array(J.length).fill(0)]); b.push(0); });
    return solve(A, b).slice(0, 3);
  };
  const impact = (qq, vv, J) => {
    const M = Mmat(qq), Minv = [0, 1, 2].map((i) => solve(M, [0, 1, 2].map((j) => (i === j ? 1 : 0))));
    const mul = (x) => [0, 1, 2].map((i) => Minv[0][i] * x[0] + Minv[1][i] * x[1] + Minv[2][i] * x[2]);
    const JMJ = J.map((a) => { const x = mul(a); return J.map((b) => b[0] * x[0] + b[1] * x[1] + b[2] * x[2]); });
    const L = solve(JMJ, J.map((a) => -(a[0] * vv[0] + a[1] * vv[1] + a[2] * vv[2])));
    const dv = mul([0, 1, 2].map((i) => J.reduce((s, row, k) => s + row[i] * L[k], 0)));
    return [vv[0] + dv[0], vv[1] + dv[1], vv[2] + dv[2]];
  };
  v = impact(q, v, rows(stance, 0));
  let t = 0;
  for (; t < tEnd; t += dt) {
    let acc = kkt(q, v, rows(stance, stop));
    if (stop) {
      const free = kkt(q, v, rows(stance, 0)), psiAcc = free[2] - free[1];
      if ((stop > 0 && psiAcc < 0) || (stop < 0 && psiAcc > 0)) { stop = 0; acc = free; }
    }
    for (let i = 0; i < 3; i++) { v[i] += acc[i] * dt; q[i] += v[i] * dt; }
    const psi = q[2] - q[1];
    if (psi > psiMax && !stop) { q[2] = q[1] + psiMax; stop = 1; if (v[2] - v[1] > 0) v = impact(q, v, rows(stance, 1)); }
    else if (psi < psiMin && !stop) { q[2] = q[1] + psiMin; stop = -1; if (v[2] - v[1] < 0) v = impact(q, v, rows(stance, -1)); }
    if (!touches(stance, q)) {
      const other = stance === 'A' ? 'B' : 'A';
      if (touches(other, q)) { stance = other; transfers++; v = impact(q, v, rows(stance, stop)); }
      else { fail = 'lost the ground at t=' + t.toFixed(2) + ' s'; break; }
    }
    if (!isFinite(q[0])) { fail = 'numerical failure'; break; }
  }
  return { fail, transfers, distance: q[0], t, speed: q[0] / Math.max(t, 1e-9) };
}

export function loadGenerator(file) {
  const html = readFileSync(file, 'utf8');
  const m = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<script src="shared\/export-utils/);
  const win = {};
  vm.runInNewContext(m[1], { window: win, document: {}, console, Math });
  return win.MM_GENERATOR;
}
export function walks(cfg, over, extra = {}, tEnd = 8) {
  const p = {}; cfg.parameters.forEach((q) => { p[q.key] = q.value; }); Object.assign(p, over);
  const pr = cfg.walkProps(p), P = { ...pr, gam: p.slope * Math.PI / 180, ...extra };
  const s = simulate(P, { tEnd, dt: 4e-4 });
  return { pr, s, ok: !s.fail && s.distance > 3 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cfg = loadGenerator(fileURLToPath(new URL('../../programs/gravity-walker.html', import.meta.url)));
  const over = {};
  process.argv.slice(2).filter((a) => a.includes('=')).forEach((a) => { const [k, val] = a.split('='); over[k] = +val; });
  const d = 180 / Math.PI, base = walks(cfg, over, {}, 12), pr = base.pr;
  console.log(`body ${pr.mA.toFixed(1)} g, centre of weight ${(pr.cA / pr.r).toFixed(2)} x leg length under the hinge; rear legs ${pr.mB.toFixed(1)} g (${Math.round(100 * pr.mB / (pr.mA + pr.mB))} %), centre ${(pr.cB / pr.r).toFixed(2)} x leg length`);
  console.log(base.ok ? `walks at ${(base.s.speed).toFixed(1)} cm/s (${base.s.transfers} foot changes in ${base.s.t.toFixed(0)} s)` : 'does NOT walk: ' + (base.s.fail || 'stalled'));
  if (process.argv.includes('--slopes')) {
    const row = [];
    for (let slope = 4; slope <= 14; slope++) { const w = walks(cfg, { ...over, slope }, {}, 12); row.push(slope + ' deg: ' + (w.ok ? w.s.speed.toFixed(1) + ' cm/s' : 'no')); }
    console.log(row.join('\n'));
  }
  if (process.argv.includes('--robust')) {
    const perts = [{}, { slope: -1.5 }, { slope: 1.5 }, { cA: 0.85 }, { cA: 1.15 }, { cB: 0.85 }, { cB: 1.15 }, { mB: 1.2 }, { mB: 0.8 }];
    let n = 0;
    perts.forEach((q) => {
      const p = {}; cfg.parameters.forEach((x) => { p[x.key] = x.value; }); Object.assign(p, over);
      const b = cfg.walkProps(p), P = { ...b, gam: (p.slope + (q.slope || 0)) * Math.PI / 180, cA: b.cA * (q.cA || 1), cB: b.cB * (q.cB || 1), mB: b.mB * (q.mB || 1) };
      const s = simulate(P, { tEnd: 8, dt: 4e-4 }); if (!s.fail && s.distance > 3) n++;
    });
    console.log(`robustness ${n} of ${perts.length}`);
  }
}
