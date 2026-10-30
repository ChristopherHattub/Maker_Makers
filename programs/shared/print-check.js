// Maker Makers printability check (shared by the generator engine and the node test tool).
//
// It voxelises the finished model the way a slicer sees it (union of every shell, nonzero winding),
// then looks for the things that make a print fail without supports:
//   floating   solid that starts above the bed and is not connected to anything that reaches it
//   overhang   solid with nothing under it within about 45 degrees (sagging or spaghetti)
//   thin       features thinner than the nozzle can lay down as a wall
// Units are millimetres, Y up, bed at y = 0. Input is the same [{ name, positions }] list build() returns.
//
//   var r = MM_PRINT_CHECK.check(entries, { angle: 45, minWall: 0.8, cell: 0.4 });
//   r.issues -> [{ kind, severity: 'error' | 'warn', message, y0, y1, area }]
(function (root) {
  'use strict';

  function check(entries, opt) {
    opt = opt || {};
    var minWall = opt.minWall || 0.8;
    var angle = opt.angle || 45;
    var t0 = Date.now();

    // ---- bounds and grid -------------------------------------------------------------------
    var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9], i, k, e, p;
    for (e = 0; e < entries.length; e++) {
      p = entries[e].positions;
      for (i = 0; i < p.length; i += 3) for (k = 0; k < 3; k++) {
        if (p[i + k] < lo[k]) lo[k] = p[i + k];
        if (p[i + k] > hi[k]) hi[k] = p[i + k];
      }
    }
    if (lo[0] > hi[0]) return { ok: true, issues: [], ms: 0 };
    var span = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
    var c = opt.cell || Math.max(0.4, span / 170);
    var x0 = lo[0] - c, y0 = lo[1] - c * 0.0, z0 = lo[2] - c;
    // the bed is y = 0: keep layer 0 exactly on it
    y0 = Math.min(lo[1], 0);
    var nx = Math.ceil((hi[0] - x0) / c) + 2, ny = Math.ceil((hi[1] - y0) / c) + 1, nz = Math.ceil((hi[2] - z0) / c) + 2;
    var N = nx * ny * nz;
    if (N > 40e6) return { ok: true, issues: [], ms: 0, skipped: true };
    var solid = new Uint8Array(N);
    var at = function (ix, iy, iz) { return (iy * nz + iz) * nx + ix; };

    // ---- voxelise: vertical rays through every column, nonzero winding ----------------------
    var hitsPerCol = new Array(nx * nz);
    var EPSX = 0.000137, EPSZ = 0.000091; // keeps rays off shared triangle edges
    for (e = 0; e < entries.length; e++) {
      p = entries[e].positions;
      for (i = 0; i < p.length; i += 9) {
        var ax = p[i], ay = p[i + 1], az = p[i + 2], bx = p[i + 3], by = p[i + 4], bz = p[i + 5], cx = p[i + 6], cy = p[i + 7], cz = p[i + 8];
        // normal y component tells entering (+) or leaving (-) when seen from below
        var ny_ = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        if (ny_ === 0) continue;
        var wdir = ny_ > 0 ? -1 : 1;
        var minx = Math.min(ax, bx, cx), maxx = Math.max(ax, bx, cx), minz = Math.min(az, bz, cz), maxz = Math.max(az, bz, cz);
        var ix0 = Math.max(0, Math.ceil((minx - x0) / c - 0.5)), ix1 = Math.min(nx - 1, Math.floor((maxx - x0) / c - 0.5));
        var iz0 = Math.max(0, Math.ceil((minz - z0) / c - 0.5)), iz1 = Math.min(nz - 1, Math.floor((maxz - z0) / c - 0.5));
        for (var iz = iz0; iz <= iz1; iz++) {
          var pz = z0 + (iz + 0.5) * c + EPSZ;
          for (var ix = ix0; ix <= ix1; ix++) {
            var px = x0 + (ix + 0.5) * c + EPSX;
            var w0 = (bx - ax) * (pz - az) - (bz - az) * (px - ax);
            var w1 = (cx - bx) * (pz - bz) - (cz - bz) * (px - bx);
            var w2 = (ax - cx) * (pz - cz) - (az - cz) * (px - cx);
            if (!((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0))) continue;
            var s = w0 + w1 + w2; // twice the signed projected area
            var y = (w1 * ay + w2 * by + w0 * cy) / s;
            var ci = iz * nx + ix;
            (hitsPerCol[ci] || (hitsPerCol[ci] = [])).push(y, wdir);
          }
        }
      }
    }
    for (var col = 0; col < hitsPerCol.length; col++) {
      var h = hitsPerCol[col];
      if (!h) continue;
      var pairs = [];
      for (i = 0; i < h.length; i += 2) pairs.push([h[i], h[i + 1]]);
      pairs.sort(function (a, b) { return a[0] - b[0]; });
      var wind = 0, start = 0, cix = col % nx, ciz = (col - cix) / nx;
      for (i = 0; i < pairs.length; i++) {
        var prev = wind;
        wind += pairs[i][1];
        if (prev <= 0 && wind > 0) start = pairs[i][0];
        else if (prev > 0 && wind <= 0) {
          var ya = Math.max(0, Math.ceil((start - y0) / c - 0.5)), yb = Math.min(ny - 1, Math.ceil((pairs[i][0] - y0) / c - 0.5) - 1);
          for (var iy = ya; iy <= yb; iy++) solid[at(cix, iy, ciz)] = 1;
        }
      }
    }
    hitsPerCol = null;

    var issues = [];
    var layerOf = function (idx) { return Math.floor(idx / (nz * nx)); };
    var yOf = function (iy) { return y0 + iy * c; };

    // ---- connected pieces (26 neighbours) --------------------------------------------------
    var label = new Int32Array(N), comps = [], stack = new Int32Array(N > 1e6 ? 1e6 : N + 1), sp, idx, nl = 0;
    var NB = [];
    for (var dy = -1; dy <= 1; dy++) for (var dz = -1; dz <= 1; dz++) for (var dx = -1; dx <= 1; dx++) if (dx || dy || dz) NB.push([dx, dy, dz]);
    for (idx = 0; idx < N; idx++) {
      if (!solid[idx] || label[idx]) continue;
      nl++;
      var cnt = 0, miny = ny, maxy = 0, minIdx = idx, cxs = 0, cys = 0, czs = 0;
      sp = 0; stack[sp++] = idx; label[idx] = nl;
      while (sp) {
        var cur = stack[--sp], cyy = layerOf(cur), rem = cur - cyy * nz * nx, czz = Math.floor(rem / nx), cxx = rem - czz * nx;
        cnt++; cxs += cxx; cys += cyy; czs += czz;
        if (cyy < miny) { miny = cyy; minIdx = cur; }
        if (cyy > maxy) maxy = cyy;
        for (var nb = 0; nb < 26; nb++) {
          var qx = cxx + NB[nb][0], qy = cyy + NB[nb][1], qz = czz + NB[nb][2];
          if (qx < 0 || qy < 0 || qz < 0 || qx >= nx || qy >= ny || qz >= nz) continue;
          var qi = at(qx, qy, qz);
          if (solid[qi] && !label[qi]) { label[qi] = nl; if (sp < stack.length) stack[sp++] = qi; }
        }
      }
      comps.push({ id: nl, n: cnt, miny: miny, maxy: maxy, cx: cxs / cnt, cy: cys / cnt, cz: czs / cnt });
    }
    var floats = comps.filter(function (cp) { return cp.miny > 1 && cp.n > 12; });
    var spots = [];
    if (floats.length) {
      var lowest = Math.min.apply(null, floats.map(function (cp) { return yOf(cp.miny); }));
      floats.forEach(function (cp) { spots.push({ x: x0 + (cp.cx + 0.5) * c, y: yOf(cp.cy), z: z0 + (cp.cz + 0.5) * c, y0: yOf(cp.miny), y1: yOf(cp.maxy), area: Math.max(4, cp.n * c * c), extent: 0 }); });
      issues.push({ kind: 'floating', severity: 'error', y0: lowest, y1: yOf(Math.max.apply(null, floats.map(function (cp) { return cp.maxy; }))), area: floats.reduce(function (a, cp) { return a + cp.n * c * c * c; }, 0),
        message: (floats.length === 1 ? 'A part starts ' : floats.length + ' parts start ') + (lowest > 0 ? 'as low as ' : '') + lowest.toFixed(1) + ' mm above the bed with nothing under ' + (floats.length === 1 ? 'it' : 'them') + '. ' +
          (floats.length === 1 ? 'It' : 'They') + ' will print as loose strands unless supported or joined to the model.' });
    }

    // ---- overhangs: solid with nothing within reach on the layer below ---------------------
    var reach = Math.tan(angle * Math.PI / 180) * c; // horizontal shift allowed per layer
    var rc = Math.max(1, Math.ceil(reach / c - 1e-6)), r2 = (reach / c + 0.45) * (reach / c + 0.45);
    var offs = [];
    for (dz = -rc; dz <= rc; dz++) for (dx = -rc; dx <= rc; dx++) if (dx * dx + dz * dz <= r2) offs.push([dx, dz]);
    var oh = new Uint8Array(N), ohN = 0;
    for (var iy2 = 1; iy2 < ny; iy2++) {
      for (var iz2 = 0; iz2 < nz; iz2++) {
        for (var ix2 = 0; ix2 < nx; ix2++) {
          if (!solid[at(ix2, iy2, iz2)]) continue;
          var ok = false;
          for (var o = 0; o < offs.length && !ok; o++) {
            var sx = ix2 + offs[o][0], sz = iz2 + offs[o][1];
            if (sx >= 0 && sz >= 0 && sx < nx && sz < nz && solid[at(sx, iy2 - 1, sz)]) ok = true;
          }
          if (!ok) { oh[at(ix2, iy2, iz2)] = 1; ohN++; }
        }
      }
    }
    if (ohN) {
      var ohTotal = 0, ohLo = 1e9, ohHi = 0, ohExt = 0, ohBands = [];
      var seen = new Uint8Array(N);
      for (idx = 0; idx < N; idx++) {
        if (!oh[idx] || seen[idx]) continue;
        var cn = 0, ymin = ny, ymax = 0, xa = nx, xb = 0, za = nz, zb = 0, sxs = 0, szs = 0;
        sp = 0; stack[sp++] = idx; seen[idx] = 1;
        while (sp) {
          var q = stack[--sp], qy2 = layerOf(q), rm = q - qy2 * nz * nx, qz2 = Math.floor(rm / nx), qx2 = rm - qz2 * nx;
          cn++; sxs += qx2; szs += qz2;
          if (qy2 < ymin) ymin = qy2; if (qy2 > ymax) ymax = qy2;
          if (qx2 < xa) xa = qx2; if (qx2 > xb) xb = qx2; if (qz2 < za) za = qz2; if (qz2 > zb) zb = qz2;
          // slivers of a shallow bar sit a few cells apart on every layer, so join them across a wider reach
          for (var wy = -1; wy <= 1; wy++) for (var wz = -4; wz <= 4; wz++) for (var wx = -4; wx <= 4; wx++) {
            var ux = qx2 + wx, uy = qy2 + wy, uz = qz2 + wz;
            if (ux < 0 || uy < 0 || uz < 0 || ux >= nx || uy >= ny || uz >= nz) continue;
            var ui = at(ux, uy, uz);
            if (oh[ui] && !seen[ui]) { seen[ui] = 1; if (sp < stack.length) stack[sp++] = ui; }
          }
        }
        var area = cn * c * c, ext = Math.max(xb - xa + 1, zb - za + 1) * c;
        if (area < 2.5 && ymax - ymin < 2) continue; // a stray corner voxel, slicers lay this down fine
        ohTotal += area; ohLo = Math.min(ohLo, yOf(ymin)); ohHi = Math.max(ohHi, yOf(ymax + 1)); ohExt = Math.max(ohExt, ext);
        ohBands.push([yOf(ymin), yOf(ymax + 1), area]);
        spots.push({ x: x0 + (sxs / cn + 0.5) * c, y: yOf((ymin + ymax) / 2), z: z0 + (szs / cn + 0.5) * c, y0: yOf(ymin), y1: yOf(ymax + 1), area: area, extent: ext });
      }
      if (ohTotal > 0) {
        // the three tallest bands by area, so the message points at the worst places
        var bands = {};
        ohBands.forEach(function (bd) { var key = Math.round(bd[0] / 2) * 2; bands[key] = (bands[key] || 0) + bd[2]; });
        var worst = Object.keys(bands).sort(function (a, b) { return bands[b] - bands[a]; }).slice(0, 3).map(Number).sort(function (a, b) { return a - b; });
        issues.push({ kind: 'overhang', severity: ohTotal > 8 || ohExt > 8 ? 'error' : 'warn', y0: ohLo, y1: ohHi, area: ohTotal, extent: ohExt,
          message: 'Overhang steeper than about 50\u00b0 (around ' + Math.round(ohTotal) + ' mm\u00b2, up to ' + ohExt.toFixed(0) + ' mm across), mostly near ' +
            worst.map(function (v) { return v + ' mm'; }).join(', ') + ' high. It will sag or print as strands without supports.' });
      }
    }

    // ---- thin features: opening of the solid by a ball of radius minWall / 2 ---------------
    var rr = minWall / 2 / c; // radius in cells
    var dt = chamfer(solid, nx, ny, nz, 1); // inside distance (cells)
    var core = new Uint8Array(N), anyCore = false;
    for (idx = 0; idx < N; idx++) if (solid[idx] && dt[idx] >= rr - 0.3) { core[idx] = 1; anyCore = true; }
    var thin = new Uint8Array(N), thinN = 0;
    var dcore = chamfer(core, nx, ny, nz, 0); // distance from the core (cells)
    for (idx = 0; idx < N; idx++) if (solid[idx] && (!anyCore || dcore[idx] > rr + 0.3)) { thin[idx] = 1; thinN++; }
    if (thinN * c * c * c > 1.2) {
      var seen2 = new Uint8Array(N), best = null;
      var total = 0;
      for (idx = 0; idx < N; idx++) {
        if (!thin[idx] || seen2[idx]) continue;
        var cn2 = 0, ya2 = ny, yb2 = 0;
        sp = 0; stack[sp++] = idx; seen2[idx] = 1;
        while (sp) {
          var q3 = stack[--sp], qy3 = layerOf(q3), rm3 = q3 - qy3 * nz * nx, qz3 = Math.floor(rm3 / nx), qx3 = rm3 - qz3 * nx;
          cn2++; if (qy3 < ya2) ya2 = qy3; if (qy3 > yb2) yb2 = qy3;
          for (var m2 = 0; m2 < 26; m2++) {
            var ux2 = qx3 + NB[m2][0], uy2 = qy3 + NB[m2][1], uz2 = qz3 + NB[m2][2];
            if (ux2 < 0 || uy2 < 0 || uz2 < 0 || ux2 >= nx || uy2 >= ny || uz2 >= nz) continue;
            var ui2 = at(ux2, uy2, uz2);
            if (thin[ui2] && !seen2[ui2]) { seen2[ui2] = 1; if (sp < stack.length) stack[sp++] = ui2; }
          }
        }
        if (cn2 * c * c * c < 0.6) continue;
        total++;
        if (!best || cn2 > best.n) best = { n: cn2, y0: yOf(ya2), y1: yOf(yb2 + 1) };
      }
      if (total) issues.push({ kind: 'thin', severity: 'warn', y0: best.y0, y1: best.y1, area: thinN * c * c * c,
        message: total + ' feature' + (total > 1 ? 's are' : ' is') + ' thinner than ' + minWall + ' mm (around ' + best.y0.toFixed(1) + ' to ' + best.y1.toFixed(1) + ' mm high). A 0.4 mm nozzle may skip them.' });
    }

    issues.sort(function (a, b) { return (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1); });
    var sc = 0, spotsOut = spots;
    for (idx = 0; idx < N; idx++) sc += solid[idx];
    return { ok: issues.length === 0, issues: issues, spots: spotsOut, solid: sc * c * c * c, cell: c, vox: opt.keepGrid ? { solid: solid, nx: nx, ny: ny, nz: nz, c: c, x0: x0, y0: y0, z0: z0 } : null, ms: Date.now() - t0, grid: [nx, ny, nz] };
  }

  // Approximate Euclidean distance (3-4-5 chamfer, in cells). mode 1: distance from empty cells for solid
  // cells (distance to the surface); mode 0: distance of every cell to the nearest set cell.
  function chamfer(set, nx, ny, nz, mode) {
    var N = nx * ny * nz, d = new Float32Array(N), BIG = 1e6, i;
    for (i = 0; i < N; i++) d[i] = (mode ? !set[i] : !!set[i]) ? 0 : BIG;
    var A = 1, B = 1.4142, C = 1.7321;
    var idx = function (x, y, z) { return (y * nz + z) * nx + x; };
    var x, y, z, dx, dy, dz, v, nxt;
    for (y = 0; y < ny; y++) for (z = 0; z < nz; z++) for (x = 0; x < nx; x++) {
      v = d[idx(x, y, z)]; if (!v) continue;
      for (dy = -1; dy <= 0; dy++) for (dz = -1; dz <= 1; dz++) for (dx = -1; dx <= 1; dx++) {
        if (dy === 0 && (dz > 0 || (dz === 0 && dx >= 0))) continue;
        var sx = x + dx, sy = y + dy, sz = z + dz;
        if (sx < 0 || sy < 0 || sz < 0 || sx >= nx || sz >= nz) continue;
        var w = (dx ? 1 : 0) + (dy ? 1 : 0) + (dz ? 1 : 0); w = w === 1 ? A : w === 2 ? B : C;
        nxt = d[idx(sx, sy, sz)] + w; if (nxt < v) v = nxt;
      }
      d[idx(x, y, z)] = v;
    }
    for (y = ny - 1; y >= 0; y--) for (z = nz - 1; z >= 0; z--) for (x = nx - 1; x >= 0; x--) {
      v = d[idx(x, y, z)]; if (!v) continue;
      for (dy = 0; dy <= 1; dy++) for (dz = -1; dz <= 1; dz++) for (dx = -1; dx <= 1; dx++) {
        if (dy === 0 && (dz < 0 || (dz === 0 && dx <= 0))) continue;
        var tx = x + dx, ty = y + dy, tz = z + dz;
        if (tx < 0 || ty >= ny || tz < 0 || tx >= nx || tz >= nz) continue;
        var w2 = (dx ? 1 : 0) + (dy ? 1 : 0) + (dz ? 1 : 0); w2 = w2 === 1 ? A : w2 === 2 ? B : C;
        nxt = d[idx(tx, ty, tz)] + w2; if (nxt < v) v = nxt;
      }
      d[idx(x, y, z)] = v;
    }
    return d;
  }

  root.MM_PRINT_CHECK = { check: check, chamfer: chamfer };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.MM_PRINT_CHECK;
})(typeof window !== 'undefined' ? window : globalThis);
