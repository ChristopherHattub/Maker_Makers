#!/usr/bin/env node
// Builds the three paw models from models/heightmap.png exactly as the viewer does, checks each is
// watertight (every edge shared by two faces, consistently wound) and reports size and triangles.
// Usage: node check.mjs [--stl]   (--stl also writes models/*.stl, which are git-ignored)
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import vm from 'node:vm';

const here = new URL('.', import.meta.url).pathname;
const sandbox = { Map, Math, Float32Array, Uint32Array, Int32Array, Uint8Array, ArrayBuffer, DataView };
sandbox.globalThis = sandbox;
vm.runInNewContext(readFileSync(here + 'mesher.js', 'utf8'), sandbox);
const M = sandbox.PawMesher;

// Minimal PNG decoder: 8-bit RGB / RGBA / grey, non-interlaced (what build.py writes).
function readPNG(file) {
  const b = readFileSync(file);
  let o = 8, w, h, ct, idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o), type = b.toString('ascii', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8 || d[12]) throw new Error('unsupported PNG'); }
    if (type === 'IDAT') idat.push(d);
    o += 12 + len;
  }
  const ch = { 0: 1, 2: 3, 6: 4 }[ct], raw = inflateSync(Buffer.concat(idat)), stride = w * ch, out = new Uint8Array(w * h * ch);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? out[y * stride + x - ch] : 0, up = y ? out[(y - 1) * stride + x] : 0, ul = y && x >= ch ? out[(y - 1) * stride + x - ch] : 0;
      let v = raw[src + x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const p = a + up - ul, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - ul); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : ul; }
      out[y * stride + x] = v & 255;
    }
  }
  return { w, h, ch, data: out };
}

const png = readPNG(here + 'models/heightmap.png');
const hm = { w: png.w, h: png.h, relief: new Float32Array(png.w * png.h), mask: new Uint8Array(png.w * png.h) };
for (let k = 0; k < png.w * png.h; k++) { hm.relief[k] = png.data[k * png.ch] / 255; hm.mask[k] = png.data[k * png.ch + 1] > 127 ? 1 : 0; }

let fail = false;
for (const kind of Object.keys(M.MODELS)) {
  const t0 = Date.now(), m = M.build(kind, hm), c = M.check(m);
  const ok = !c.open && !c.nonManifold && !c.flipped && c.volumeMm3 > 0;
  if (!ok) fail = true;
  console.log(`${M.MODELS[kind].label.padEnd(14)} ${m.size.map((v) => v.toFixed(1)).join(' x ')} mm  ${m.tris} tris  ` +
    `vol ${(c.volumeMm3 / 1000).toFixed(1)} cm3  open ${c.open}  non-manifold ${c.nonManifold}  flipped ${c.flipped}  ` +
    `${ok ? 'WATERTIGHT' : 'FAIL'}  (${Date.now() - t0} ms)`);
  if (process.argv.includes('--stl')) writeFileSync(here + 'models/' + M.MODELS[kind].file + '.stl', Buffer.from(M.toSTL(m)));
}
process.exit(fail ? 1 : 0);
