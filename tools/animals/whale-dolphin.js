      // -----------------------------------------------------------------------
      // Whale & Dolphin: a humpback, an orca or a dolphin swimming in a wave base, one sculpted surface.
      // The body floats half sunk in the sea (waterline well below the widest point), so its flank is never
      // flatter than about 30 degrees from vertical and it prints without supports. Flippers and flukes are
      // thin sheets draped on the waves; a raised tail stands on its own mound of water. The name is
      // engraved in a stroke font in the front wall of the base.
      // -----------------------------------------------------------------------
      var WD_DEG = Math.PI / 180;
      function wdArc(cx, cy, rx, ry, a0, a1) {
        var n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 24)), pts = [];
        for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * WD_DEG; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
        return pts;
      }
      function wdJoin() { return Array.prototype.concat.apply([], arguments); }
      function wdGlyph(w) { return { w: w, s: Array.prototype.slice.call(arguments, 1) }; }
      var WD_DOT = function (x, y) { return [[x, y], [x, y + 0.01]]; };
      // Stroke font (cap height 6) for the engraved name: letters, digits and a few marks.
      var WD_GLYPHS = {
        ' ': wdGlyph(2.5),
        'A': wdGlyph(4, [[0, 0], [2, 6], [4, 0]], [[0.9, 2.2], [3.1, 2.2]]),
        'B': wdGlyph(4, [[0, 0], [0, 6]], wdJoin([[0, 6], [2.4, 6]], wdArc(2.4, 4.5, 1.4, 1.5, 90, -90), [[0, 3]]), wdJoin([[0, 3], [2.6, 3]], wdArc(2.6, 1.5, 1.5, 1.5, 90, -90), [[0, 0]])),
        'C': wdGlyph(4.4, wdArc(2.2, 3, 2.2, 3, 45, 315)),
        'D': wdGlyph(4.4, [[0, 0], [0, 6]], wdJoin([[0, 6], [1.8, 6]], wdArc(1.8, 3, 2.6, 3, 90, -90), [[0, 0]])),
        'E': wdGlyph(4, [[4, 6], [0, 6], [0, 0], [4, 0]], [[0, 3], [3, 3]]),
        'F': wdGlyph(4, [[4, 6], [0, 6], [0, 0]], [[0, 3], [3, 3]]),
        'G': wdGlyph(4.4, wdJoin(wdArc(2.2, 3, 2.2, 3, 45, 360), [[2.4, 3]])),
        'H': wdGlyph(4, [[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]),
        'I': wdGlyph(0, [[0, 0], [0, 6]]),
        'J': wdGlyph(3, wdJoin([[3, 6]], wdArc(1.5, 1.5, 1.5, 1.5, 0, -180))),
        'K': wdGlyph(4, [[0, 0], [0, 6]], [[4, 6], [0, 2.5]], [[1.2, 3.5], [4, 0]]),
        'L': wdGlyph(3.6, [[0, 6], [0, 0], [3.6, 0]]),
        'M': wdGlyph(4.4, [[0, 0], [0, 6], [2.2, 2.2], [4.4, 6], [4.4, 0]]),
        'N': wdGlyph(4, [[0, 0], [0, 6], [4, 0], [4, 6]]),
        'O': wdGlyph(4.4, wdArc(2.2, 3, 2.2, 3, 0, 360)),
        'P': wdGlyph(4, [[0, 0], [0, 6]], wdJoin([[0, 6], [2.4, 6]], wdArc(2.4, 4.5, 1.6, 1.5, 90, -90), [[0, 3]])),
        'Q': wdGlyph(4.4, wdArc(2.2, 3, 2.2, 3, 0, 360), [[2.6, 1.6], [4.4, -0.6]]),
        'R': wdGlyph(4, [[0, 0], [0, 6]], wdJoin([[0, 6], [2.4, 6]], wdArc(2.4, 4.5, 1.6, 1.5, 90, -90), [[0, 3]]), [[1.6, 3], [4, 0]]),
        'S': wdGlyph(4, wdJoin(wdArc(2, 4.5, 1.9, 1.5, 20, 270), wdArc(2, 1.5, 2, 1.5, 90, -160))),
        'T': wdGlyph(4, [[0, 6], [4, 6]], [[2, 6], [2, 0]]),
        'U': wdGlyph(4, wdJoin([[0, 6]], wdArc(2, 2.2, 2, 2.2, 180, 360), [[4, 6]])),
        'V': wdGlyph(4, [[0, 6], [2, 0], [4, 6]]),
        'W': wdGlyph(5, [[0, 6], [1.1, 0], [2.5, 4], [3.9, 0], [5, 6]]),
        'X': wdGlyph(4, [[0, 6], [4, 0]], [[4, 6], [0, 0]]),
        'Y': wdGlyph(4, [[0, 6], [2, 3], [4, 6]], [[2, 3], [2, 0]]),
        'Z': wdGlyph(4, [[0, 6], [4, 6], [0, 0], [4, 0]]),
        '0': wdGlyph(3.8, wdArc(1.9, 3, 1.9, 3, 0, 360)),
        '1': wdGlyph(2, [[0.2, 4.8], [2, 6], [2, 0]]),
        '2': wdGlyph(4, wdJoin(wdArc(2, 4.3, 1.9, 1.7, 160, -20), [[0, 0], [4, 0]])),
        '3': wdGlyph(4, wdJoin(wdArc(2, 4.5, 1.8, 1.5, 150, -90), wdArc(2, 1.6, 2, 1.6, 90, -150))),
        '4': wdGlyph(4, [[3, 0], [3, 6], [0, 2], [4, 2]]),
        '5': wdGlyph(4, wdJoin([[3.6, 6], [0.4, 6], [0.7, 3.2]], wdArc(2, 1.8, 2, 1.8, 130, -150))),
        '6': wdGlyph(4, [[3.2, 6], [0.1, 2.2]], wdArc(2, 1.9, 1.9, 1.9, 0, 360)),
        '7': wdGlyph(4, [[0, 6], [4, 6], [1.4, 0]]),
        '8': wdGlyph(4, wdArc(2, 4.6, 1.6, 1.4, 0, 360), wdArc(2, 1.6, 1.9, 1.6, 0, 360)),
        '9': wdGlyph(4, wdArc(2, 4.1, 1.9, 1.9, 0, 360), [[0.8, 0], [3.9, 3.8]]),
        '-': wdGlyph(2.8, [[0.2, 3], [2.6, 3]]),
        '.': wdGlyph(0, WD_DOT(0, 0)),
        '!': wdGlyph(0, [[0, 6], [0, 1.8]], WD_DOT(0, 0)),
        '\'': wdGlyph(0, [[0, 6], [0, 4.5]]),
      };
      var wdName = 'OCEAN';
      // Name -> line segments [x0, y0, x1, y1] in mm, baseline y = 0, centred on x = 0, capital height capH (shrunk to fit maxW).
      function wdText(txt, capH, maxW) {
        var s = String(txt || '').toUpperCase().replace(/[^A-Z0-9 \-.!']/g, '').slice(0, 14), x = 0, raw = [], i, j, g, gap = 2.4;
        for (i = 0; i < s.length; i++) {
          g = WD_GLYPHS[s.charAt(i)];
          if (!g) continue;
          g.s.forEach(function (pl) { for (j = 0; j < pl.length - 1; j++) raw.push([x + pl[j][0], pl[j][1], x + pl[j + 1][0], pl[j + 1][1]]); });
          x += g.w + gap;
        }
        var w = Math.max(x - gap, 0.01), k = Math.min(capH / 6, maxW / w), off = (w * k) / 2;
        return { segs: raw.map(function (q) { return [q[0] * k - off, q[1] * k, q[2] * k - off, q[3] * k]; }), w: w * k, h: 6 * k };
      }
      // Signed distance (negative inside) from (u, v) to a closed polygon [[a, b], ...].
      function wdPolySD(poly, u, v) {
        var n = poly.length, best = 1e18, inside = false;
        for (var i = 0, j = n - 1; i < n; j = i++) {
          var a = poly[i], b = poly[j], ex = b[0] - a[0], ey = b[1] - a[1], fx = u - a[0], fy = v - a[1];
          var q = clamp((fx * ex + fy * ey) / ((ex * ex + ey * ey) || 1), 0, 1), gx = fx - ex * q, gy = fy - ey * q, dd = gx * gx + gy * gy;
          if (dd < best) best = dd;
          if ((a[1] > v) !== (b[1] > v) && u < a[0] + ((v - a[1]) * (b[0] - a[0])) / (b[1] - a[1])) inside = !inside;
        }
        return Math.sqrt(best) * (inside ? -1 : 1);
      }

      // Species: radius profile along the body (u from the tail end 0 to the nose 1, radius as a fraction of the length).
      var WD_SPECIES = [
        { // humpback: stout, broad head, long white flippers, small hump of a dorsal fin
          label: 'Humpback', back: '#64748b', belly: '#e2e8f0', fins: '#475569', flip: '#f1f5f9', sea: '#38bdf8',
          prof: [[0, 0.021], [0.1, 0.031], [0.24, 0.064], [0.4, 0.114], [0.56, 0.15], [0.7, 0.152], [0.82, 0.13], [0.92, 0.094], [1, 0.046]],
          headU: 0.74, finU: 0.3, finC: 0.05, finH: 0.062, flipU: 0.7, flipLen: 0.3, flipHW: 0.032, flukeW: 0.4, eyeU: 0.86, eyeR: 0.016, tilt: 1.1
        },
        { // orca: black and white, tall triangular dorsal fin, broad paddle flippers
          label: 'Orca', back: '#1e293b', belly: '#f8fafc', fins: '#0f172a', flip: '#1e293b', sea: '#38bdf8',
          prof: [[0, 0.023], [0.1, 0.035], [0.24, 0.078], [0.4, 0.13], [0.56, 0.158], [0.7, 0.15], [0.82, 0.122], [0.92, 0.086], [1, 0.04]],
          headU: 0.76, finU: 0.56, finC: 0.07, finH: 0.17, flipU: 0.72, flipLen: 0.15, flipHW: 0.052, flukeW: 0.34, eyeU: 0.9, eyeR: 0.014, tilt: 1.1
        },
        { // dolphin: slim, a rounded forehead and a beak, curved dorsal fin
          label: 'Dolphin', back: '#7aa7dc', belly: '#f1f5f9', fins: '#5f8fc9', flip: '#6b9bd1', sea: '#2dd4bf',
          prof: [[0, 0.025], [0.1, 0.036], [0.24, 0.072], [0.4, 0.104], [0.54, 0.113], [0.66, 0.106], [0.76, 0.088], [0.84, 0.064], [0.89, 0.044], [0.95, 0.03], [1, 0.021]],
          headU: 0.7, finU: 0.5, finC: 0.058, finH: 0.14, flipU: 0.68, flipLen: 0.14, flipHW: 0.024, flukeW: 0.3, eyeU: 0.83, eyeR: 0.0175, tilt: 1.1
        }
      ];
      // Piecewise-linear radius fraction at u.
      function wdRadius(prof, u) {
        u = clamp(u, 0, 1);
        for (var i = 0; i < prof.length - 1; i++) if (u <= prof[i + 1][0]) return lerp(prof[i][1], prof[i + 1][1], (u - prof[i][0]) / (prof[i + 1][0] - prof[i][0]));
        return prof[prof.length - 1][1];
      }

      // Plinth shell: a superellipse wall (radii Rx, Rz, exponent pw, centre bcx) from the bed to hP with chamfered edges, a flat top and bottom.
      // The name is engraved in the +z wall as V grooves (45 degree walls, so they print without supports); rings and angles are
      // dense where the lettering is, so the strokes stay crisp.
      function wdPlinth(bcx, Rx, Rz, pw, hP, nm, depth) {
        var cm = Math.min(1.4, hP * 0.25), ys = [0, cm * 0.5, cm, hP - cm, hP - cm * 0.5, hP], i, j, k;
        var hasText = nm.segs.length > 0, yb = (hP - nm.h) / 2, hw = Math.max(0.6, nm.h * 0.12), gw = hw + depth * 0.8 + 0.1;
        if (hasText) { for (y0 = yb - gw - 0.2; y0 <= yb + nm.h + gw + 0.3; y0 += 0.3) ys.push(Math.min(Math.max(y0, cm), hP - cm)); }
        var y0;
        ys.sort(function (a, b) { return a - b; });
        ys = ys.filter(function (v, q) { return q === 0 || v - ys[q - 1] > 0.05; });
        function qf(th) { var c = Math.cos(th), s = Math.sin(th); return Math.pow(Math.pow(Math.abs(c), pw) + Math.pow(Math.abs(s), pw), -1 / pw); }
        var ths = [], N0 = 150;
        for (i = 0; i < N0; i++) ths.push((i / N0) * TAU);
        if (hasText) {
          var xa = -nm.w / 2 - gw - 0.6, xb = nm.w / 2 + gw + 0.6;
          for (var xx = xa; xx <= xb; xx += 0.28) { // angle whose wall point has x = xx
            var lo = 0, hi = Math.PI;
            for (k = 0; k < 28; k++) { var mid = (lo + hi) / 2; if (Rx * Math.cos(mid) * qf(mid) > xx) lo = mid; else hi = mid; }
            ths.push((lo + hi) / 2);
          }
        }
        ths.sort(function (a, b) { return a - b; });
        ths = ths.filter(function (v, q) { return q === 0 || v - ths[q - 1] > 1e-4; });
        var segs = nm.segs;
        function groove(u, v) { // inward displacement at wall point (u along x from the centre, v above the bed)
          if (!hasText) return 0;
          var vv = v - yb, best = 1e9, q, ex, ey, t, dx, dy;
          if (Math.abs(u) > nm.w / 2 + gw + 1 || vv < -gw - 1 || vv > nm.h + gw + 1) return 0;
          for (q = 0; q < segs.length; q++) {
            var sg = segs[q]; ex = sg[2] - sg[0]; ey = sg[3] - sg[1];
            t = clamp(((u - sg[0]) * ex + (vv - sg[1]) * ey) / ((ex * ex + ey * ey) || 1), 0, 1);
            dx = u - sg[0] - ex * t; dy = vv - sg[1] - ey * t; dx = dx * dx + dy * dy; if (dx < best) best = dx;
          }
          return clamp(gw - Math.sqrt(best), 0, depth);
        }
        var pos = [bcx, 0, 0], idx = [], nT = ths.length, nR = ys.length;
        for (i = 0; i < nR; i++) {
          var y = ys[i], sh = y < cm ? cm - y : y > hP - cm ? y - (hP - cm) : 0;
          for (j = 0; j < nT; j++) {
            var th = ths[j], q = qf(th), px = (Rx - sh) * Math.cos(th) * q, pz = (Rz - sh) * Math.sin(th) * q;
            if (hasText && pz > 0) { var g = groove(px, y); if (g > 0) { var rl = Math.hypot(px, pz); px *= 1 - g / rl; pz *= 1 - g / rl; } }
            pos.push(bcx + px, y, pz);
          }
        }
        pos.push(bcx, hP, 0);
        function at(a, b) { return 1 + a * nT + b; }
        for (j = 0; j < nT; j++) idx.push(0, at(0, (j + 1) % nT), at(0, j));
        for (i = 0; i < nR - 1; i++) for (j = 0; j < nT; j++) { var nj = (j + 1) % nT; idx.push(at(i, j), at(i, nj), at(i + 1, nj), at(i, j), at(i + 1, nj), at(i + 1, j)); }
        var last = 1 + nR * nT;
        for (j = 0; j < nT; j++) idx.push(at(nR - 1, j), at(nR - 1, (j + 1) % nT), last);
        return expandTris(new Float32Array(pos), idx);
      }

      function buildWhale(p, api) {
        var sc = new Scene(), L = p.length, sp = WD_SPECIES[clamp(Math.round(p.species), 0, 2)], spI = clamp(Math.round(p.species), 0, 2), pose = Math.round(p.pose);
        var S = new Sculpt(clamp(1.1 + L * 0.0034, 1.3, 1.65)).useEdits(api);
        var hB = p.baseH, Wv = p.waveH, Wl = hB, i, j, s;
        var fin = p.finSize, flk = p.flukeSize;
        S.smoothing = 8;
        // ---------- body axis: control points [x, y, z, r], tail end first ----------
        function rAt(u) { return wdRadius(sp.prof, u) * L; }
        function archAt(u) { return p.arch * Math.pow(Math.sin(Math.PI * clamp(u, 0, 1)), 1.4); }
        var curl = pose === 1;
        function curlZ(u) { return curl ? 0.2 * L * Math.pow(1 - clamp(u / 0.46, 0, 1), 2) : 0; }
        function ax(u) { var r = rAt(u); return [-L / 2 + u * L, Wl + sp.tilt * 0.45 * r + archAt(u), curlZ(u), r]; }
        var us = [0, 0.1, 0.24, 0.4, 0.56, 0.7, 0.82, 0.92, 1], ctrl = [];
        if (spI === 2) us = [0, 0.1, 0.24, 0.4, 0.54, 0.66, 0.76, 0.84, 0.89, 0.95, 1];
        us.forEach(function (u) { ctrl.push(ax(u)); });
        // tail extension for the raised tail
        var tail0 = ax(0), up = pose === 2, stockTop = null, ext = [];
        if (up) {
          var R0 = 0.09 * L, Hs = 0.15 * L, r0 = Math.max(rAt(0) * 1.05, 2.4), r1 = Math.max(r0 * 0.78, 2.1);
          for (i = 1; i <= 4; i++) { var ph = (i / 4) * Math.PI / 2; ext.push([tail0[0] - R0 * Math.sin(ph), tail0[1] + R0 * (1 - Math.cos(ph)), 0, lerp(r0, r1, 0.3 * i / 4)]); }
          ext.push([tail0[0] - R0, tail0[1] + R0 + Hs * 0.5, 0, lerp(r0, r1, 0.65)]);
          ext.push([tail0[0] - R0, tail0[1] + R0 + Hs, 0, r1]);
          stockTop = ext[ext.length - 1];
        }
        // dense samples of the whole axis (body + extension) for the water ridge, foam and the tail direction
        var allCtrl = ext.slice().reverse().concat(ctrl), dense = [];
        (function () {
          var pts3 = allCtrl.map(function (q) { return [q[0], q[1], q[2]]; }), sm = spline(pts3, 4), n = allCtrl.length - 1;
          sm.forEach(function (q, k) {
            var f = (k / (sm.length - 1)) * n, a = Math.min(Math.floor(f), n - 1), t = f - a;
            dense.push({ x: q[0], y: q[1], z: q[2], r: lerp(allCtrl[a][3], allCtrl[a + 1][3], t) });
          });
        })();
        dense.forEach(function (q, k) {
          var a = dense[Math.max(k - 1, 0)], b = dense[Math.min(k + 1, dense.length - 1)], hz = Math.hypot(b.x - a.x, b.z - a.z) || 1e-6;
          q.slope = Math.abs(b.y - a.y) / hz;
          q.wl = q.y - 0.5 * q.r;                   // waterline at this point of the body
          q.rw = Math.sqrt(Math.max(q.r * q.r - Math.pow(q.y - q.wl, 2), 0.01));
        });
        // ---------- the sea: slab + waves + a ridge of water the body floats in ----------
        var lam = p.waveLen, fx = TAU / lam, fz = TAU / (lam * 1.25);
        var wca = Math.cos(0.45), wsa = Math.sin(0.45);
        function wave(x, z) { var u = x * wca + z * wsa, v = -x * wsa + z * wca; return 0.7 * Math.sin(fx * u + 0.7 * Math.sin(fz * v + 0.7)) + 0.3 * Math.sin(2.3 * fx * u + 1.7 + 0.5 * fz * v); }
        var feat = []; // points the base must contain: [x, z]
        dense.forEach(function (q) { feat.push([q.x - q.rw, q.z - q.rw], [q.x + q.rw, q.z + q.rw], [q.x, q.z - q.rw - 1], [q.x, q.z + q.rw + 1]); });
        // ---- tail end direction (horizontal) and flukes planform ----
        var tl = dense[0], t2 = dense[Math.min(6, dense.length - 1)], bdir;
        if (up) bdir = vnorm([-1, 0, 0]);
        else { bdir = vnorm([tl.x - t2.x, 0, tl.z - t2.z]); if (vlen(bdir) < 0.1) bdir = [-1, 0, 0]; }
        var bperp = [-bdir[2], 0, bdir[0]];
        var FW = sp.flukeW * L * flk;
        function flukePoly() { // planform [a, z], a back from the root, right half then left half
          var W = FW, R = [[-0.03, 0.035], [0.06, 0.13], [0.15, 0.28], [0.26, 0.42], [0.34, 0.5], [0.3, 0.435], [0.255, 0.33], [0.21, 0.21], [0.16, 0.09], [0.105, 0.0]], out = [];
          for (i = 0; i < R.length; i++) out.push([R[i][0] * W, R[i][1] * W]);
          for (i = R.length - 2; i >= 1; i--) out.push([R[i][0] * W, -R[i][1] * W]);
          out.push([-0.03 * W, -0.035 * W]);
          return out;
        }
        var flk2 = null, flukeVert = null;
        if (!up) {
          var fo = [tl.x + bdir[0] * 1.2, tl.z + bdir[2] * 1.2];
          flk2 = flukePoly().map(function (q) { return [fo[0] + bdir[0] * q[0] + bperp[0] * q[1], fo[1] + bdir[2] * q[0] + bperp[2] * q[1]]; });
          flk2.forEach(function (q) { feat.push([q[0], q[1]]); });
        } else {
          // vertical flukes on the stock, turned a little toward the viewer
          var ang = 64 * WD_DEG, dS = [Math.sin(ang), 0, Math.cos(ang)], hh = clamp(FW * 0.5, 20, 34), a2 = 2 + 0.46 * hh;
          // a V of flukes: each lobe widens by at most 0.5 mm per mm of height, so it prints without supports
          var vp = [[-2, 0], [-(2 + 0.18 * hh), 0.4 * hh], [-(2 + 0.34 * hh), 0.75 * hh], [-a2, hh], [-a2 * 0.97, hh + 2], [-a2 * 0.66, hh * 0.9], [-a2 * 0.3, hh * 0.76], [0, hh * 0.68]];
          var full = vp.slice();
          for (i = vp.length - 2; i >= 1; i--) full.push([-vp[i][0], vp[i][1]]);
          full.push([2, 0]);
          flukeVert = { poly: full.map(function (q) { return [q[0], q[1] + stockTop[1] - 2.2]; }), at: [stockTop[0], 0, stockTop[2]], dir: dS, h: hh };
          feat.push([stockTop[0] + dS[0] * a2, stockTop[2] + dS[2] * a2], [stockTop[0] - dS[0] * a2, stockTop[2] - dS[2] * a2]);
        }
        // ---- flippers: sheets draped on the water ----
        var fU = sp.flipU, fAx = ax(fU), fR = rAt(fU), fLen = sp.flipLen * L * fin, fHW = sp.flipHW * L * (0.7 + 0.3 * fin);
        var flipPolys = [];
        [1, -1].forEach(function (sd) {
          var rootR = fAx[3] * 0.62, root = [fAx[0] + 0.01 * L, sd * rootR], th = (spI === 0 ? 142 : spI === 1 ? 128 : 140) * WD_DEG;
          var d = [Math.cos(th), sd * Math.sin(th)], pr = [-d[1], d[0]], pts = [], nn = 12, t;
          function hw(tt) {
            var w = spI === 0 ? fHW * (0.78 + 0.5 * Math.sin(Math.PI * Math.pow(tt, 0.8)) * (1 - 0.55 * tt)) : spI === 1 ? fHW * (0.5 + 0.9 * Math.sin(Math.PI * Math.pow(tt, 0.75))) : fHW * (1.0 - 0.8 * tt) * (0.5 + 0.8 * Math.sin(Math.PI * Math.min(tt * 1.6, 1) * 0.5));
            return Math.max(w, 0.6) * (tt > 0.96 ? Math.sqrt(Math.max(1 - (tt - 0.96) / 0.04, 0.05)) : 1);
          }
          function lead(tt) { return spI === 0 ? 1 + 0.16 * Math.sin(tt * TAU * 3.2) * Math.min(tt * 3, 1) : 1; }
          for (t = 0; t <= nn; t++) { var tt = t / nn, c = (spI === 2 ? 0.34 : 0.14) * fLen * tt * tt, w = hw(tt); pts.push([root[0] + d[0] * fLen * tt + pr[0] * (c + w * sd * lead(tt)), root[1] + d[1] * fLen * tt + pr[1] * (c + w * sd * lead(tt))]); }
          for (t = nn; t >= 0; t--) { var t3 = t / nn, c2 = (spI === 2 ? 0.34 : 0.14) * fLen * t3 * t3, w2 = hw(t3); pts.push([root[0] + d[0] * fLen * t3 + pr[0] * (c2 - w2 * sd), root[1] + d[1] * fLen * t3 + pr[1] * (c2 - w2 * sd)]); }
          flipPolys.push({ sd: sd, poly: pts });
          pts.forEach(function (q) { feat.push([q[0], q[1]]); });
        });
        // base footprint
        var minX = 1e9, maxX = -1e9, maxZ = 0;
        feat.forEach(function (q) { minX = Math.min(minX, q[0]); maxX = Math.max(maxX, q[0]); maxZ = Math.max(maxZ, Math.abs(q[1])); });
        var square = Math.round(p.baseShape) === 1, pw = square ? 4 : 2, mg = 6 + Wv;
        var bcx = (minX + maxX) / 2, Rx = (maxX - minX) / 2 + mg, Rz = Math.max(maxZ + mg, Rx * 0.3);
        var nrm = 0;
        feat.forEach(function (q) { nrm = Math.max(nrm, Math.pow(Math.pow(Math.abs((q[0] - bcx) / Rx), pw) + Math.pow(Math.abs(q[1] / Rz), pw), 1 / pw)); });
        if (nrm > 1) { Rx *= nrm * 1.01; Rz *= nrm * 1.01; }
        function baseNorm(x, z) { return Math.pow(Math.pow(Math.abs((x - bcx) / Rx), pw) + Math.pow(Math.abs(z / Rz), pw), 1 / pw); }
        // water height field (memoised per grid column)
        var hP = Math.max(4, hB - Wv * 1.1 - 0.8), memo = new Map(); // hP: height of the plinth wall; the sea sits on top of it
        function Wf(x, z) {
          var key = Math.round(x * 50) * 40009 + Math.round(z * 50), got = memo.get(key);
          if (got !== undefined) return got;
          var emin = 1e9, ridge = 0, k, q, e, v;
          for (k = 0; k < dense.length; k++) {
            q = dense[k]; e = Math.hypot(x - q.x, z - q.z) - q.rw;
            if (e < emin) emin = e;
            if (q.slope > 1.35 || q.wl <= hB) continue;
            v = e <= 0 ? q.wl : hB + (q.wl - hB) * (1 - smooth(e / Math.max(1.3 * q.r, 6)));
            if (v > ridge) ridge = v;
          }
          var att = 1 - smooth((baseNorm(x, z) - 0.78) / 0.18), calm = smooth((emin - 1) / 12);
          var top = Math.max(lerp(hP + 0.5, hB + Wv * wave(x, z) * calm, att), ridge);
          memo.set(key, top);
          return top;
        }
        var ridgeMax = hB;
        dense.forEach(function (q) { if (q.slope <= 1.35 && q.wl > ridgeMax) ridgeMax = q.wl; });
        // ---------- build ----------
        var col = sp;
        var gp = Math.round(p.species) === 1;
        // body (tail to just behind the head) and head
        S.piece('body');
        var hU = sp.headU, bodyPts = [], headPts = [];
        allCtrl.forEach(function (q, k) { var xu = (q[0] + L / 2) / L; if (xu <= hU + 0.04) bodyPts.push(q); });
        S.path('body', bodyPts, col.back, 5, 6);
        S.piece('head', 'body');
        allCtrl.forEach(function (q) { var xu = (q[0] + L / 2) / L; if (xu >= hU - 0.04) headPts.push(q); });
        if (spI === 2) { // dolphin: round the forehead (melon) and add a separate beak
          var mel = ax(0.86), bk = [ax(0.88), ax(0.95), ax(1)];
          headPts = allCtrl.filter(function (q) { return (q[0] + L / 2) / L >= hU - 0.04 && (q[0] + L / 2) / L <= 0.9; });
          S.path('body', headPts, col.back, 5, 6);
          S.path('body', [[bk[0][0], bk[0][1] - 0.012 * L, 0, 0.036 * L], [bk[1][0], bk[1][1] - 0.02 * L, 0, 0.026 * L], [bk[2][0] + 0.005 * L, bk[2][1] - 0.024 * L, 0, 0.0195 * L]], col.back, 4, 5);
          S.ell('body', [mel[0] - 0.01 * L, mel[1] + 0.012 * L, 0], [0.05 * L, 0.052 * L, 0.05 * L], col.back, 4);
        } else {
          S.path('body', headPts, col.back, 5, 6);
          if (spI === 0) S.ell('body', [ax(0.9)[0], ax(0.9)[1] - 0.012 * L, 0], [0.085 * L, 0.06 * L, 0.098 * L], col.back, 5); // broad humpback head
        }
        // dorsal fin
        var fa = ax(sp.finU), fH = sp.finH * L * fin, fC = sp.finC * L * (0.6 + 0.4 * fin), fy0 = fa[1] + fa[3] * 0.8, ft = Math.max(2.4, 0.026 * L);
        var fpoly;
        if (spI === 0) fpoly = [[fC, fy0], [fC * 0.45, fy0 + fH * 0.55 + fa[3] * 0.2], [-fC * 0.1, fy0 + fH + fa[3] * 0.2], [-fC * 0.6, fy0 + fH * 0.45], [-fC, fy0]];
        else if (spI === 1) fpoly = [[fC, fy0], [fC * 0.55, fy0 + fH * 0.45 + fa[3] * 0.2], [fC * 0.05, fy0 + fH * 0.82 + fa[3] * 0.2], [-fC * 0.3, fy0 + fH + fa[3] * 0.2], [-fC * 0.62, fy0 + fH * 0.55], [-fC, fy0]];
        else fpoly = [[fC, fy0], [fC * 0.55, fy0 + fH * 0.5 + fa[3] * 0.2], [-fC * 0.15, fy0 + fH * 0.92 + fa[3] * 0.2], [-fC * 0.7, fy0 + fH + fa[3] * 0.2], [-fC * 0.78, fy0 + fH * 0.66], [-fC * 0.55, fy0 + fH * 0.3], [-fC, fy0]];
        // mouth lines and blowhole carved into the head
        S.piece('head', 'body');
        var mu0 = spI === 2 ? 0.84 : 0.8;
        [1, -1].forEach(function (sd) {
          var pts = [], nm = 7, k, u, a, y;
          for (k = 0; k <= nm; k++) {
            u = lerp(spI === 2 ? 0.995 : 0.99, mu0, k / nm); a = ax(u);
            var rr = spI === 2 && u > 0.87 ? (u > 0.93 ? lerp(0.0195, 0.026, (0.995 - u) / 0.065) : 0.03) * L : a[3];
            y = a[1] - (spI === 2 && u > 0.87 ? 0.02 * L + 0.2 * rr : 0.17 * a[3]);
            pts.push([a[0] + (u > 0.97 ? 0.004 * L : 0), y, sd * (rr * 0.96)]);
          }
          S.path(null, pts, null, 0, 3).carve(0.5);
        });
        // ---------- belly, patches, sea ----------
        var yc0 = ax(0.5)[1];
        S.piece('body');
        // pale belly: the lower flank along the whole body
        dense.forEach(function (q, k) {
          if (k % 3 || q.slope > 1.35) return;
          S.paint('belly', [q.x, q.y - q.r * 0.78, q.z], [0.034 * L + 1.5, q.r * 0.62, q.r * 1.3], col.belly);
        });
        if (gp) { // orca: white chin, eye patches and the grey saddle behind the fin
          var ep = ax(sp.eyeU - 0.035), sad = ax(sp.finU - 0.07);
          [1, -1].forEach(function (sd) { S.paint('patch', [ep[0] - 0.012 * L, ep[1] + ep[3] * 0.28, sd * ep[3] * 0.92], [0.04 * L, 0.02 * L, 0.03 * L], '#f8fafc'); });
          S.paint('saddle', [sad[0], sad[1] + sad[3] * 0.8, 0], [0.04 * L, 0.03 * L, sad[3] * 1.0], '#94a3b8');
        }
        // fins, flippers and flukes: thin sheets draped on the waves, then the sea itself
        function sheet(name, color, poly, thick, k) {
          var lo = [1e9, 0, 1e9], hi = [-1e9, 0, -1e9];
          poly.forEach(function (q) { lo[0] = Math.min(lo[0], q[0]); hi[0] = Math.max(hi[0], q[0]); lo[2] = Math.min(lo[2], q[1]); hi[2] = Math.max(hi[2], q[1]); });
          lo[1] = Math.max(hB - Wv - 3, 0); hi[1] = ridgeMax + Wv + thick + 1;
          S._name(name, color);
          return S._op({ name: name, k: k, lo: lo, hi: hi, d: function (x, y, z) {
            var w = Wf(x, z), sdv = wdPolySD(poly, x, z);
            return Math.max(sdv + 0.6, (y - (w + thick)) * 0.9, ((w - 1.6) - y) * 0.9);
          } });
        }
        flipPolys.forEach(function (fp) { S.piece(fp.sd > 0 ? 'flipperR' : 'flipperL', 'body'); sheet('flippers', col.flip, fp.poly, 2.5 + 0.012 * L, 1.2); });
        if (flk2) { S.piece('flukes', 'body'); sheet('flukes', col.fins, flk2, 3.0 + 0.012 * L, 1.2); }
        S.piece('waves');
        S._name('water', col.sea);
        S.ops.push({ piece: 'waves', name: 'water', k: 1.8, lo: [bcx - Rx, 0, -Rz], hi: [bcx + Rx, ridgeMax + Wv * 1.5 + 2, Rz], d: function (x, y, z) {
          return Math.max((y - Wf(x, z)) * 0.85, (baseNorm(x, z) - 0.965) * Math.min(Rx, Rz) * 0.9);
        } });
        // foam: a line along the waterline and white caps on the crests
        dense.forEach(function (q, k) {
          if (k % 2 || q.slope > 1.35) return;
          S.paint('foam', [q.x, q.wl + 0.2, q.z], [0.02 * L + 1, 1.1, q.rw + 1.8], '#f8fafc');
        });
        (function () {
          var n = 0, zi, xi, best, bx;
          for (zi = -3; zi <= 3 && n < 7; zi++) {
            var z0 = zi * Rz * 0.26 + (zi % 2) * Rz * 0.05;
            best = -1; bx = 0;
            for (xi = 0; xi <= 60; xi++) { var x0 = bcx - Rx * 0.85 + (xi / 60) * Rx * 1.7, wv = Wf(x0, z0) - hB; if (baseNorm(x0, z0) < 0.8 && wv > best) { best = wv; bx = x0; } }
            if (best > Wv * 0.55 && Wv > 0.4) { S.paint('foam', [bx, hB + best, z0], [5 + Wv, 1.4 + Wv * 0.45, 3.6], '#f8fafc'); n++; }
          }
        })();
        S.reach = 0.72;
        S.run();
        // dorsal fin and the raised flukes are crisp rigid shells (pieces of the Sculpt tab), merged into the body when sliced
        S.shell(sc, 'dorsal', 'dorsal', 'b', vslab(fpoly, [fa[0], 0, 0], [1, 0, 0], ft, 0.7), col.fins, 'body');
        if (flukeVert) S.shell(sc, 'flukes', 'flukes', 'b', vslab(flukeVert.poly, flukeVert.at, flukeVert.dir, 3.4, 0.8), col.fins, 'body');
        // eyes
        var eA = ax(sp.eyeU), eR = sp.eyeR * L;
        [-1, 1].forEach(function (sd) {
          softEye(sc, S, sd < 0 ? 'eyeL' : 'eyeR', sd < 0 ? 'pupilL' : 'pupilR', [eA[0], eA[1] + eA[3] * (spI === 2 ? 0.1 : 0.0), sd * (eA[3] + 40)], [0, 0, -sd], 'head', eR, '#475569');
        });
        // plinth wall under the sea: a smooth shell (a sculpted grid would stair-step a tall curved wall) with the name engraved in the front
        S.shell(sc, 'base', 'base', 'b', wdPlinth(bcx, Rx, Rz, pw, hP, wdText(hP - 3.4 >= 2.2 ? wdName : '', Math.min(p.nameSize, hP - 3.4), Math.min(0.55 * Rx, 70)), p.nameDepth), '#f1f5f9');
        S.addTo(sc);
        return finishSculpt(sc, 1, S);
      }

      var WD_PARAMS = [
        { group: 'Creature', key: 'species', label: 'Creature', unit: '', min: 0, max: 2, step: 1, value: 0, format: function (v) { return ['Humpback whale', 'Orca', 'Dolphin'][Math.round(v)]; } },
        { group: 'Creature', key: 'length', label: 'Body length', unit: ' mm', min: 80, max: 140, step: 1, value: 116 },
        { group: 'Creature', key: 'pose', label: 'Tail pose', unit: '', min: 0, max: 2, step: 1, value: 0, format: function (v) { return ['Cruising, flukes flat', 'Curled tail', 'Tail up (dive)'][Math.round(v)]; } },
        { group: 'Creature', key: 'arch', label: 'Back arch (flat ↔ rising)', unit: ' mm', min: 0, max: 10, step: 0.5, value: 3 },
        { group: 'Fins', key: 'finSize', label: 'Fin size (dorsal and flippers)', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 },
        { group: 'Fins', key: 'flukeSize', label: 'Tail fluke span', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Waves', key: 'baseShape', label: 'Base shape', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Oval', 'Rounded rectangle'] },
        { group: 'Waves', key: 'baseH', label: 'Base thickness (taller = room for bigger letters)', unit: ' mm', min: 8, max: 20, step: 1, value: 13 },
        { group: 'Waves', key: 'waveH', label: 'Wave height', unit: ' mm', min: 0, max: 5, step: 0.25, value: 2.5 },
        { group: 'Waves', key: 'waveLen', label: 'Wave length', unit: ' mm', min: 14, max: 40, step: 1, value: 24 },
        { group: 'Name', tab: 'name', key: 'nameSize', label: 'Letter height (limited by base thickness)', unit: ' mm', min: 3, max: 9, step: 0.5, value: 5 },
        { group: 'Name', tab: 'name', key: 'nameDepth', label: 'Engraving depth', unit: ' mm', min: 0.5, max: 1.5, step: 0.1, value: 0.9 }
      ];
      window.MM_GENERATOR = {
        code: 'MM-131',
        category: 'ANIMALS // SEA LIFE',
        title: 'Whale & Dolphin',
        fileName: 'Whale',
        defaultColor: '#64748b',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly', patch: 'Eye patches', saddle: 'Saddle', dorsal: 'Dorsal fin', fin: 'Fin', flippers: 'Flippers', flukes: 'Tail flukes', water: 'Sea', base: 'Base', foam: 'Foam', eyes: 'Eyes', pupils: 'Pupils', glints: 'Eye glints' },
        parameters: WD_PARAMS,
        presets: makePresets(WD_PARAMS, [
          ['Default humpback', {}],
          ['Cruising orca', { species: 1, length: 108, arch: 2 }],
          ['Playful dolphin', { species: 2, length: 96, pose: 1, arch: 6, waveH: 3 }],
          ['Diving humpback', { species: 0, pose: 2, arch: 2 }],
          ['Big-finned orca', { species: 1, finSize: 1.3, flukeSize: 1.2, arch: 2 }],
          ['Mini dolphin', { species: 2, length: 84, arch: 4, baseH: 8 }],
          ['Calm sea', { waveH: 0.5, arch: 0 }]
        ]),
        tabs: [{
          id: 'name',
          label: 'Name',
          hint: 'Type a name to engrave in the front of the base',
          mount: function (container, api) {
            var wrap = document.createElement('div'), head = document.createElement('div'), lab = document.createElement('label'), input = document.createElement('input'), note = document.createElement('p');
            wrap.className = 'mm-slider'; head.className = 'mm-slider-head';
            lab.textContent = 'Name to engrave'; head.appendChild(lab); wrap.appendChild(head);
            input.type = 'text'; input.maxLength = 14; input.value = wdName; input.placeholder = 'e.g. Ocean'; input.autocomplete = 'off'; input.spellcheck = false;
            input.addEventListener('input', function () { wdName = input.value; api.rebuild(); });
            wrap.appendChild(input);
            note.className = 'mm-note'; note.textContent = 'Up to 14 letters, numbers, - . ! and apostrophes, engraved in the front wall of the base. Long names shrink to fit. Leave it empty for no name.';
            container.appendChild(wrap); container.appendChild(note);
          }
        }],
        sculpt: sculptModule([
          { id: 'body', label: 'Body', section: 'Body' }, { id: 'head', label: 'Head', section: 'Body' },
          { id: 'eyeL', label: 'Left eye', section: 'Body' }, { id: 'pupilL', label: 'Left pupil', section: 'Body', parent: 'eyeL' }, { id: 'eyeR', label: 'Right eye', section: 'Body' }, { id: 'pupilR', label: 'Right pupil', section: 'Body', parent: 'eyeR' },
          { id: 'dorsal', label: 'Dorsal fin', section: 'Fins' }, { id: 'flipperL', label: 'Left flipper', section: 'Fins' }, { id: 'flipperR', label: 'Right flipper', section: 'Fins' }, { id: 'flukes', label: 'Tail flukes', section: 'Fins' },
          { id: 'waves', label: 'Waves', section: 'Sea' }, { id: 'base', label: 'Base', section: 'Sea' }
        ]),
        build: buildWhale
      };
