// Paw print mesher: heightmap (models/heightmap.png) -> three watertight solids.
// Shared by index.html (browser) and check.mjs (Node). No dependencies.
// Units are millimetres; the grid is CELL mm per heightmap pixel. Z is up, the model sits on z = 0.
(function (root) {
  'use strict';

  var CELL = 0.25;            // mm per heightmap pixel (keep in step with build.py PX_MM)
  var DISC_D = 100;           // plaque and stamp diameter
  var RELIEF = 2.0;           // mm of height for the darkest ink

  var MODELS = {
    plaque: { label: 'Plaque', file: 'paw-plaque', note: '100 mm disc, 3 mm base, rim, paw raised up to 2 mm. Print face up, no supports.' },
    paw: { label: 'Paw only', file: 'paw-only', note: 'Paw outline, 2 mm backing, ink raised up to 2 mm. Print face up, no supports.' },
    stamp: { label: 'Stamp / mould', file: 'paw-stamp', note: '100 mm block, 10 mm thick, mirrored paw cut 2 mm deep. Press into clay for a raised paw.' }
  };

  // hm = { w, h, relief: Float32Array 0..1, mask: Uint8Array } (row 0 = top of the photo)
  function makeGrid(kind, hm) {
    var nx, ny, inside, height, i, j, k;
    if (kind === 'paw') {
      var pad = 2;
      nx = hm.w + pad * 2; ny = hm.h + pad * 2;
      inside = new Uint8Array(nx * ny); height = new Float32Array(nx * ny);
      for (j = 0; j < hm.h; j++) {
        for (i = 0; i < hm.w; i++) {
          if (!hm.mask[j * hm.w + i]) continue;
          k = (j + pad) * nx + (i + pad);
          inside[k] = 1;
          height[k] = 2.0 + RELIEF * hm.relief[j * hm.w + i];
        }
      }
      return { nx: nx, ny: ny, inside: inside, height: height };
    }
    nx = ny = Math.round(DISC_D / CELL);
    inside = new Uint8Array(nx * ny); height = new Float32Array(nx * ny);
    var r = DISC_D / 2, ox = Math.floor((nx - hm.w) / 2), oy = Math.floor((ny - hm.h) / 2);
    var mirror = kind === 'stamp';
    for (j = 0; j < ny; j++) {
      for (i = 0; i < nx; i++) {
        var x = (i + 0.5) * CELL - r, y = (j + 0.5) * CELL - r, d = Math.sqrt(x * x + y * y);
        if (d > r) continue;
        k = j * nx + i;
        inside[k] = 1;
        var si = mirror ? (nx - 1 - i) - ox : i - ox, sj = j - oy, v = 0;
        if (si >= 0 && si < hm.w && sj >= 0 && sj < hm.h) v = hm.relief[sj * hm.w + si];
        if (kind === 'plaque') {
          var rim = d > r - 2.5 ? 1.2 : (d > r - 3.1 ? 1.2 * (r - 2.5 - d + 0.6) / 0.6 : 0);
          height[k] = 3.0 + Math.max(rim, RELIEF * v);
        } else {
          height[k] = 10.0 - RELIEF * v;
        }
      }
    }
    return { nx: nx, ny: ny, inside: inside, height: height };
  }

  // Fill diagonal-only contacts (two cells meeting at one corner) so every edge stays manifold.
  function fixPinches(g) {
    var nx = g.nx, ny = g.ny, ins = g.inside, changed = true, i, j;
    function fill(i, j) {
      var s = 0, c = 0, k = j * nx + i;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var a = i + d[0], b = j + d[1];
        if (a >= 0 && b >= 0 && a < nx && b < ny && ins[b * nx + a]) { s += g.height[b * nx + a]; c++; }
      });
      ins[k] = 1; g.height[k] = c ? s / c : 0;
    }
    while (changed) {
      changed = false;
      for (j = 0; j < ny - 1; j++) {
        for (i = 0; i < nx - 1; i++) {
          var a = ins[j * nx + i], b = ins[j * nx + i + 1], c = ins[(j + 1) * nx + i], d = ins[(j + 1) * nx + i + 1];
          if (a && d && !b && !c) { fill(i + 1, j); changed = true; }
          else if (b && c && !a && !d) { fill(i, j); changed = true; }
        }
      }
    }
  }

  // Build the solid. Returns { pos, idx (indexed, watertight), tris, topTris (top surface comes first), size: [x,y,z] }.
  function build(kind, hm) {
    var g = makeGrid(kind, hm);
    fixPinches(g);
    var nx = g.nx, ny = g.ny, ins = g.inside, H = g.height;
    var cx = nx * CELL / 2, cy = ny * CELL / 2;
    function isIn(i, j) { return i >= 0 && j >= 0 && i < nx && j < ny && ins[j * nx + i] === 1; }
    function X(i) { return i * CELL - cx; }
    function Y(j) { return cy - j * CELL; }   // photo row 0 at the top (+y)

    var pos = [], idx = [];
    var topId = new Int32Array((nx + 1) * (ny + 1)).fill(-1);
    var botId = new Int32Array((nx + 1) * (ny + 1)).fill(-1);
    function top(i, j) {
      var k = j * (nx + 1) + i;
      if (topId[k] < 0) {
        var s = 0, c = 0;
        for (var dj = -1; dj <= 0; dj++) for (var di = -1; di <= 0; di++) {
          if (isIn(i + di, j + dj)) { s += H[(j + dj) * nx + i + di]; c++; }
        }
        topId[k] = pos.length / 3; pos.push(X(i), Y(j), s / c);
      }
      return topId[k];
    }
    function bot(i, j) {
      var k = j * (nx + 1) + i;
      if (botId[k] < 0) { botId[k] = pos.length / 3; pos.push(X(i), Y(j), 0); }
      return botId[k];
    }
    var i, j;

    // Top surface: two triangles per cell, diagonal chosen along the smaller height change.
    for (j = 0; j < ny; j++) {
      for (i = 0; i < nx; i++) {
        if (!isIn(i, j)) continue;
        var A = top(i, j), B = top(i + 1, j), C = top(i + 1, j + 1), D = top(i, j + 1);
        if (Math.abs(pos[A * 3 + 2] - pos[C * 3 + 2]) <= Math.abs(pos[B * 3 + 2] - pos[D * 3 + 2])) {
          idx.push(D, C, A, C, B, A);
        } else {
          idx.push(D, B, A, D, C, B);
        }
      }
    }

    var topTris = idx.length / 3;

    // Walls: one quad per exposed cell side, outward facing.
    function wall(i0, j0, i1, j1, ox, oy) {
      var a = top(i0, j0), b = top(i1, j1), c = bot(i1, j1), d = bot(i0, j0);
      // triangle (d, c, b): normal = (c-d) x (b-d); flip if it points away from (ox, oy)
      var ex = X(i1) - X(i0), ey = Y(j1) - Y(j0);
      var nxx = ey, nyy = -ex;          // normal of (d, c, b) is along (ey, -ex)
      if (nxx * ox + nyy * oy > 0) idx.push(d, c, b, d, b, a);
      else idx.push(d, b, c, d, a, b);
    }
    for (j = 0; j < ny; j++) {
      for (i = 0; i < nx; i++) {
        if (!isIn(i, j)) continue;
        if (!isIn(i, j - 1)) wall(i, j, i + 1, j, 0, 1);
        if (!isIn(i, j + 1)) wall(i + 1, j + 1, i, j + 1, 0, -1);
        if (!isIn(i - 1, j)) wall(i, j + 1, i, j, -1, 0);
        if (!isIn(i + 1, j)) wall(i + 1, j, i + 1, j + 1, 1, 0);
      }
    }

    // Bottom: one strip per horizontal run of cells, zipped between the corner vertices that walls
    // and neighbouring strips use on each grid line (no T-junctions, far fewer triangles than per cell).
    function lineStops(jl) {   // x positions needed on grid line jl (between rows jl-1 and jl)
      var s = [];
      for (var x = 0; x <= nx; x++) {
        var aboveL = isIn(x - 1, jl - 1), aboveR = isIn(x, jl - 1), belowL = isIn(x - 1, jl), belowR = isIn(x, jl);
        if (aboveL !== aboveR || belowL !== belowR || aboveL !== belowL || aboveR !== belowR) s.push(x);
      }
      return s;
    }
    var stops = [];
    for (j = 0; j <= ny; j++) stops.push(lineStops(j));
    for (j = 0; j < ny; j++) {
      i = 0;
      while (i < nx) {
        if (!isIn(i, j)) { i++; continue; }
        var a0 = i;
        while (i < nx && isIn(i, j)) i++;
        var a1 = i;
        var upper = stops[j].filter(function (x) { return x >= a0 && x <= a1; });
        var lower = stops[j + 1].filter(function (x) { return x >= a0 && x <= a1; });
        // zipper: upper chain on line j (y high), lower chain on line j+1 (y low); faces point down (-z)
        var u = 0, l = 0;
        while (u < upper.length - 1 || l < lower.length - 1) {
          var advanceUpper = l >= lower.length - 1 || (u < upper.length - 1 && upper[u + 1] <= lower[l + 1]);
          if (advanceUpper) {
            idx.push(bot(upper[u], j), bot(upper[u + 1], j), bot(lower[l], j + 1));
            u++;
          } else {
            idx.push(bot(upper[u], j), bot(lower[l + 1], j + 1), bot(lower[l], j + 1));
            l++;
          }
        }
      }
    }

    var p = new Float32Array(pos), ix = new Uint32Array(idx);
    var maxZ = 0;
    for (var q = 2; q < p.length; q += 3) if (p[q] > maxZ) maxZ = p[q];
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (q = 0; q < p.length; q += 3) {
      if (p[q] < minX) minX = p[q]; if (p[q] > maxX) maxX = p[q];
      if (p[q + 1] < minY) minY = p[q + 1]; if (p[q + 1] > maxY) maxY = p[q + 1];
    }
    return { pos: p, idx: ix, tris: ix.length / 3, topTris: topTris, size: [maxX - minX, maxY - minY, maxZ] };
  }

  // Binary STL from an indexed mesh.
  function toSTL(m) {
    var n = m.tris, buf = new ArrayBuffer(84 + n * 50), dv = new DataView(buf), p = m.pos, ix = m.idx;
    var hdr = 'Paw print, mm';
    for (var c = 0; c < hdr.length; c++) dv.setUint8(c, hdr.charCodeAt(c));
    dv.setUint32(80, n, true);
    var o = 84;
    for (var t = 0; t < n; t++) {
      var a = ix[t * 3] * 3, b = ix[t * 3 + 1] * 3, d = ix[t * 3 + 2] * 3;
      var ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
      var vx = p[d] - p[a], vy = p[d + 1] - p[a + 1], vz = p[d + 2] - p[a + 2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      var len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      dv.setFloat32(o, nx / len, true); dv.setFloat32(o + 4, ny / len, true); dv.setFloat32(o + 8, nz / len, true);
      o += 12;
      [a, b, d].forEach(function (v) {
        dv.setFloat32(o, p[v], true); dv.setFloat32(o + 4, p[v + 1], true); dv.setFloat32(o + 8, p[v + 2], true);
        o += 12;
      });
      dv.setUint16(o, 0, true); o += 2;
    }
    return buf;
  }

  // Watertight check: every edge used exactly twice, once in each direction. Also signed volume.
  function check(m) {
    var edges = new Map(), ix = m.idx, p = m.pos, bad = 0, open = 0, flipped = 0, vol = 0;
    for (var t = 0; t < ix.length; t += 3) {
      for (var e = 0; e < 3; e++) {
        var a = ix[t + e], b = ix[t + (e + 1) % 3];
        var key = a < b ? a * 4294967296 + b : b * 4294967296 + a;
        var rec = edges.get(key) || [0, 0];
        rec[a < b ? 0 : 1]++;
        edges.set(key, rec);
      }
      var A = ix[t] * 3, B = ix[t + 1] * 3, C = ix[t + 2] * 3;
      vol += (p[A] * (p[B + 1] * p[C + 2] - p[B + 2] * p[C + 1]) - p[A + 1] * (p[B] * p[C + 2] - p[B + 2] * p[C]) + p[A + 2] * (p[B] * p[C + 1] - p[B + 1] * p[C])) / 6;
    }
    edges.forEach(function (r) {
      var n = r[0] + r[1];
      if (n === 1) open++;
      else if (n !== 2) bad++;
      else if (r[0] !== 1) flipped++;
    });
    return { edges: edges.size, open: open, nonManifold: bad, flipped: flipped, volumeMm3: vol };
  }

  var api = { CELL: CELL, MODELS: MODELS, build: build, toSTL: toSTL, check: check };
  root.PawMesher = api;
})(typeof window !== 'undefined' ? window : globalThis);
