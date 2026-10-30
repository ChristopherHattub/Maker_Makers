// Packs outline data for the Text generator from open-licence (SIL OFL 1.1) TrueType fonts.
// Usage: node tools/text-fonts/build.mjs
// Downloads the fonts into tools/text-fonts/cache/ (git-ignored), reads glyph outlines with a tiny TrueType
// parser (no dependencies) and rewrites the block between the FONTDATA markers in programs/text-generator.html.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const cache = path.join(here, 'cache');
const page = path.join(here, '..', '..', 'programs', 'text-generator.html');
const BASE = 'https://raw.githubusercontent.com/google/fonts/main/ofl/';

// id, label, google/fonts folder, file, line height (em), notes
const FONTS = [
  ['block', 'Bold block', 'archivoblack', 'ArchivoBlack-Regular'],
  ['tall', 'Tall condensed', 'bebasneue', 'BebasNeue-Regular'],
  ['round', 'Soft rounded', 'sniglet', 'Sniglet-ExtraBold'],
  ['bubble', 'Bubble', 'titanone', 'TitanOne-Regular'],
  ['slab', 'Slab serif', 'alfaslabone', 'AlfaSlabOne-Regular'],
  ['script', 'Script', 'pacifico', 'Pacifico-Regular'],
  ['swash', 'Retro script', 'lobster', 'Lobster-Regular'],
  ['arcade', 'Chunky caps', 'bungee', 'Bungee-Regular'],
  ['marker', 'Marker', 'caveatbrush', 'CaveatBrush-Regular'],
  ['comic', 'Comic caps', 'bangers', 'Bangers-Regular']
];

let CHARS = '';
for (let c = 32; c < 127; c++) CHARS += String.fromCharCode(c);
CHARS += 'ÀÁÂÄÇÈÉÊËÍÏÑÓÔÖÚÜàáâäçèéêëíïñóôöúüß¡¿°©€£';

function parse(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const tables = {};
  const n = dv.getUint16(4);
  for (let i = 0; i < n; i++) {
    const o = 12 + i * 16;
    const tag = String.fromCharCode(buf[o], buf[o + 1], buf[o + 2], buf[o + 3]);
    tables[tag] = { off: dv.getUint32(o + 8), len: dv.getUint32(o + 12) };
  }
  const head = tables.head.off, upm = dv.getUint16(head + 18), locFmt = dv.getInt16(head + 50);
  const numGlyphs = dv.getUint16(tables.maxp.off + 4);
  const hhea = tables.hhea.off;
  const asc = dv.getInt16(hhea + 4), desc = dv.getInt16(hhea + 6), nHM = dv.getUint16(hhea + 34);
  const loca = (i) => locFmt ? dv.getUint32(tables.loca.off + i * 4) : dv.getUint16(tables.loca.off + i * 2) * 2;
  const adv = (g) => dv.getUint16(tables.hmtx.off + Math.min(g, nHM - 1) * 4);
  // cmap format 4 (or 12) -> map
  const cm = tables.cmap.off, nSub = dv.getUint16(cm + 2), cmap = new Map();
  for (let i = 0; i < nSub; i++) {
    const pid = dv.getUint16(cm + 4 + i * 8), eid = dv.getUint16(cm + 6 + i * 8), so = cm + dv.getUint32(cm + 8 + i * 8);
    if (!((pid === 3 && (eid === 1 || eid === 10)) || pid === 0)) continue;
    const fmt = dv.getUint16(so);
    if (fmt === 4) {
      const segX2 = dv.getUint16(so + 6), endO = so + 14, startO = endO + segX2 + 2, deltaO = startO + segX2, rangeO = deltaO + segX2;
      for (let s = 0; s < segX2 / 2; s++) {
        const end = dv.getUint16(endO + s * 2), start = dv.getUint16(startO + s * 2), delta = dv.getInt16(deltaO + s * 2), ro = dv.getUint16(rangeO + s * 2);
        for (let c = start; c <= end && c < 0xffff; c++) {
          let g;
          if (ro === 0) g = (c + delta) & 0xffff;
          else { g = dv.getUint16(rangeO + s * 2 + ro + (c - start) * 2); if (g) g = (g + delta) & 0xffff; }
          if (g) cmap.set(c, g);
        }
      }
    } else if (fmt === 12) {
      const ng = dv.getUint32(so + 12);
      for (let k = 0; k < ng; k++) {
        const s0 = dv.getUint32(so + 16 + k * 12), e0 = dv.getUint32(so + 20 + k * 12), g0 = dv.getUint32(so + 24 + k * 12);
        for (let c = s0; c <= e0; c++) cmap.set(c, g0 + c - s0);
      }
    }
  }
  let cap = 0.7 * upm;
  if (tables['OS/2'] && dv.getUint16(tables['OS/2'].off) >= 2) { const v = dv.getInt16(tables['OS/2'].off + 88); if (v > 0) cap = v; }

  // Returns [contours], each a list of {x, y, on}
  function glyph(g, depth) {
    const a = loca(g), b = loca(g + 1);
    if (a === b) return [];
    let p = tables.glyf.off + a;
    const nc = dv.getInt16(p);
    p += 10;
    if (nc >= 0) {
      const ends = []; for (let i = 0; i < nc; i++) { ends.push(dv.getUint16(p)); p += 2; }
      const np = nc ? ends[nc - 1] + 1 : 0;
      const il = dv.getUint16(p); p += 2 + il;
      const flags = [];
      while (flags.length < np) {
        const f = dv.getUint8(p++); flags.push(f);
        if (f & 8) { let r = dv.getUint8(p++); while (r--) flags.push(f); }
      }
      const xs = [], ys = [];
      let v = 0;
      for (let i = 0; i < np; i++) { const f = flags[i]; if (f & 2) { const d = dv.getUint8(p++); v += (f & 16) ? d : -d; } else if (!(f & 16)) { v += dv.getInt16(p); p += 2; } xs.push(v); }
      v = 0;
      for (let i = 0; i < np; i++) { const f = flags[i]; if (f & 4) { const d = dv.getUint8(p++); v += (f & 32) ? d : -d; } else if (!(f & 32)) { v += dv.getInt16(p); p += 2; } ys.push(v); }
      const out = []; let s = 0;
      for (let c = 0; c < nc; c++) {
        const pts = [];
        for (let i = s; i <= ends[c]; i++) pts.push({ x: xs[i], y: ys[i], on: !!(flags[i] & 1) });
        out.push(pts); s = ends[c] + 1;
      }
      return out;
    }
    if (depth > 4) return [];
    const out = [];
    let more = true;
    while (more) {
      const fl = dv.getUint16(p), gi = dv.getUint16(p + 2); p += 4;
      let dx, dy;
      if (fl & 1) { dx = dv.getInt16(p); dy = dv.getInt16(p + 2); p += 4; } else { dx = dv.getInt8(p); dy = dv.getInt8(p + 1); p += 2; }
      if (!(fl & 2)) { dx = 0; dy = 0; }
      let a1 = 1, b1 = 0, c1 = 0, d1 = 1;
      const f2 = () => { const r = dv.getInt16(p) / 16384; p += 2; return r; };
      if (fl & 8) { a1 = d1 = f2(); } else if (fl & 0x40) { a1 = f2(); d1 = f2(); } else if (fl & 0x80) { a1 = f2(); b1 = f2(); c1 = f2(); d1 = f2(); }
      for (const ct of glyph(gi, depth + 1)) out.push(ct.map((q) => ({ x: q.x * a1 + q.y * c1 + dx, y: q.x * b1 + q.y * d1 + dy, on: q.on })));
      more = !!(fl & 0x20);
    }
    return out;
  }
  return { upm, asc, desc, cap, cmap, adv, glyph, numGlyphs };
}

// TrueType contour -> relative path "m x,y l dx,dy q cx,cy,dx,dy ... z" in 1/250-em integers (4 units of a 1000-em).
function contourPath(pts, k) {
  const Q = k / 4;
  const q = (v) => Math.round(v * Q);
  const n = pts.length;
  if (n < 2) return '';
  let start = pts.findIndex((p) => p.on), list, sx, sy;
  if (start < 0) { sx = (pts[0].x + pts[1].x) / 2; sy = (pts[0].y + pts[1].y) / 2; list = pts.slice(1).concat([pts[0]]); }
  else { sx = pts[start].x; sy = pts[start].y; list = pts.slice(start + 1).concat(pts.slice(0, start)); }
  let px = q(sx), py = q(sy), d = 'm' + px + ',' + py, cx = null, cy = null;
  const seg = (x, y) => {
    const X = q(x), Y = q(y);
    if (cx === null) { if (X !== px || Y !== py) d += 'l' + (X - px) + ',' + (Y - py); }
    else { d += 'q' + (q(cx) - px) + ',' + (q(cy) - py) + ',' + (X - px) + ',' + (Y - py); cx = cy = null; }
    px = X; py = Y;
  };
  for (const p of list) {
    if (p.on) seg(p.x, p.y);
    else { if (cx !== null) seg((cx + p.x) / 2, (cy + p.y) / 2); cx = p.x; cy = p.y; }
  }
  if (cx !== null) seg(sx, sy);
  return d + 'z';
}

async function load(folder, file) {
  const f = path.join(cache, file + '.ttf');
  if (!fs.existsSync(f)) {
    const r = await fetch(BASE + folder + '/' + file + '.ttf');
    if (!r.ok) throw new Error('download failed: ' + file);
    fs.mkdirSync(cache, { recursive: true });
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  return fs.readFileSync(f);
}

const data = {};
let total = 0;
for (const [id, label, folder, file] of FONTS) {
  const font = parse(await load(folder, file));
  const k = 1000 / font.upm;
  const g = {};
  for (const ch of CHARS) {
    const gi = font.cmap.get(ch.codePointAt(0));
    if (!gi) continue;
    const paths = font.glyph(gi, 0).map((c) => contourPath(c, k)).filter(Boolean).join('');
    g[ch] = [Math.round(font.adv(gi) * k / 4), paths];
  }
  data[id] = { label, asc: Math.round(font.asc * k / 4), desc: Math.round(font.desc * k / 4), cap: Math.round(font.cap * k / 4), g };
  total += JSON.stringify(data[id]).length;
  console.log(id, Object.keys(g).length, 'glyphs', (JSON.stringify(data[id]).length / 1024).toFixed(0) + ' KB');
}
const block = '// FONTDATA-BEGIN (generated by tools/text-fonts/build.mjs; fonts are SIL OFL 1.1, see docs/text-generator.md)\n      var FONTDATA = ' + JSON.stringify(data) + ';\n      // FONTDATA-END';
if (fs.existsSync(page)) {
  const html = fs.readFileSync(page, 'utf8');
  const re = /\/\/ FONTDATA-BEGIN[\s\S]*?\/\/ FONTDATA-END/;
  if (!re.test(html)) throw new Error('markers missing in ' + page);
  fs.writeFileSync(page, html.replace(re, () => block));
  console.log('updated', page, (total / 1024).toFixed(0) + ' KB of font data');
} else {
  fs.writeFileSync(path.join(cache, 'fontdata.js'), block);
  console.log('page missing; wrote cache/fontdata.js');
}
