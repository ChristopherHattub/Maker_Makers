      // =======================================================================
      // Animal kit (shared by the animal generators; source: tools/animals/animal-kit.js)
      // Animals are built from overlapping closed shells (ellipsoids, swept tubes, cones, slabs, rounded
      // legs). Slicers union the overlaps. Everything faces +x, stands on y = 0, and body masses sit on a
      // flat belly or on legs so the defaults print without supports. Uses the lathe/frame helpers of
      // tools/flexi/flexi-lib.js, which is concatenated in front of this file.
      // =======================================================================
      var ANIMAL_PALETTE = [
        { name: 'Bone White', color: '#f1f5f9' }, { name: 'Peach Fuzz', color: '#fdba74' },
        { name: 'Cocoa Brown', color: '#a16a4a' }, { name: 'Glow Mint', color: '#a7f3d0' },
        { name: 'Berry Sorbet', color: '#fda4af' }, { name: 'Phantom Ice', color: '#93c5fd' },
        { name: 'Sunny Yellow', color: '#fde047' }, { name: 'Shadow Black', color: '#334155' }
      ];

      // Ellipsoid: semi-axes a (along dir), w (sideways), h (up). Centre c. cut > 0 flattens it on the bed.
      function ball(sc, entry, body, c, a, w, h, color, opt) {
        opt = opt || {};
        var dir = opt.dir || [1, 0, 0];
        sc.add(entry, body, blobShell(c, dir, a, w, h, opt.seg || 18, opt.floor), color);
      }
      // Flat-bellied ellipsoid on the bed: semi-axes a (along heading `yaw`, radians about up), w (sideways), h (up).
      // The lowest 45% is replaced by a flat base (centre 0.55 h above the bed), so the lower flank is never
      // flatter than about 55 degrees and the body prints on its belly without supports.
      function dRing(pos, c, lat, w, h, cy, seg, cs) {
        var base = pos.length / 3, j, th, m = cs || 2, e = 2 / m, sn = h > 0 ? Math.pow(cy / h, m / 2) : 2, phi;
        var full = sn >= 0.995;
        phi = full ? 0 : Math.asin(sn);
        for (j = 0; j < seg; j++) {
          th = full ? (j / seg) * TAU : -phi + (j / (seg - 1)) * (Math.PI + 2 * phi);
          var cc = Math.cos(th), ss = Math.sin(th);
          var cx = (cc < 0 ? -1 : 1) * Math.pow(Math.abs(cc), e), sy = (ss < 0 ? -1 : 1) * Math.pow(Math.abs(ss), e);
          var y = full ? c[1] + h * sy : Math.max(0, c[1] + h * sy);
          pos.push(c[0] + lat[0] * w * cx, y, c[2] + lat[2] * w * cx);
        }
        return base;
      }
      function bellyShell(x, z, a, w, h, yaw, seg, cutFrac, sqz, cs) {
        seg = seg || 20;
        var cy = h * (cutFrac === undefined ? 0.55 : cutFrac), R = 36, pos = [], idx = [], i, j, ex = 2 / (sqz || 4);
        var dir = [Math.cos(yaw || 0), 0, -Math.sin(yaw || 0)], lat = [Math.sin(yaw || 0), 0, Math.cos(yaw || 0)];
        pos.push(x - dir[0] * a, cy, z - dir[2] * a);
        var rings = [];
        for (i = 1; i < R; i++) {
          var t = (Math.PI * i) / R, ct = Math.cos(t), rho = Math.pow(Math.sin(t), ex), s = -a * (ct < 0 ? -1 : 1) * Math.pow(Math.abs(ct), ex);
          rings.push(dRing(pos, [x + dir[0] * s, cy, z + dir[2] * s], lat, w * rho, h * rho, cy, seg, cs));
        }
        pos.push(x + dir[0] * a, cy, z + dir[2] * a);
        var top = pos.length / 3 - 1;
        for (j = 0; j < seg; j++) idx.push(0, rings[0] + (j + 1) % seg, rings[0] + j);
        for (i = 0; i < rings.length - 1; i++) {
          for (j = 0; j < seg; j++) {
            var nj = (j + 1) % seg;
            idx.push(rings[i] + j, rings[i] + nj, rings[i + 1] + nj, rings[i] + j, rings[i + 1] + nj, rings[i + 1] + j);
          }
        }
        var lr = rings[rings.length - 1];
        for (j = 0; j < seg; j++) idx.push(lr + j, lr + (j + 1) % seg, top);
        return expandTris(new Float32Array(pos), idx);
      }
      function bellyBall(sc, entry, body, x, z, a, w, h, color, opt) {
        opt = opt || {};
        sc.add(entry, body, bellyShell(x, z, a, w, h, opt.yaw, opt.seg, opt.cut, opt.sq, opt.cs), color);
      }
      // Rounded upright cylinder standing on the bed (legs, feet, posts). r0 at the bed, r1 at the top.
      function post(sc, entry, body, x, z, r0, r1, h, color, y0) {
        var base = y0 === undefined ? 0 : y0;
        var fr = frame([x, base, z], [0, 1, 0], [0, 0, 1]);
        var rr = Math.min(r0, h * 0.4), prof = [[0, 0], [r0 * 0.75, 0], [r0, rr * 0.55]];
        prof.push([lerp(r0, r1, 0.5), h * 0.5], [r1, h - r1 * 0.35], [r1 * 0.78, h - r1 * 0.04], [0, h]);
        sc.add(entry, body, lathe(fr, prof, 16, {}), color);
      }
      // Cone (horn, ear, beak, tooth): base centre, direction, base radius, height. Embedded sink mm into the host.
      function spike(sc, entry, body, base, dir, r, h, color, sink, seg) {
        var fr = frame(base, dir, [0, 1, 0]), s = sink === undefined ? 1.5 : sink, dn = vnorm(dir);
        if (dn[1] > 0.05) s = Math.min(s, Math.max(0.5, (base[1] - 0.3) / dn[1])); // never dip below the bed
        sc.add(entry, body, lathe(fr, [[0, h], [r * 0.5, h * 0.55], [r * 0.92, h * 0.12], [r, 0], [r, -s], [0, -s]], seg || 12, {}), color);
      }
      // Catmull-Rom sample of control points [[x,y,z],...]; per = samples per span.
      function spline(pts, per) {
        var out = [], n = pts.length, i, j, k;
        for (i = 0; i < n - 1; i++) {
          var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n - 1)];
          for (j = 0; j < per; j++) {
            var t = j / per, t2 = t * t, t3 = t2 * t, q = [];
            for (k = 0; k < 3; k++) q.push(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3));
            out.push(q);
          }
        }
        out.push(pts[n - 1].slice());
        return out;
      }
      // Tube swept along path (dense points) with radius fn(t), t = 0..1, round ends. floor clamps to the bed.
      function tube(path, radfn, seg, opt) {
        opt = opt || {};
        seg = seg || 12;
        var n = path.length, rings = [], i, j, T = [], N, B, tg;
        for (i = 0; i < n; i++) {
          var a = path[Math.max(i - 1, 0)], b = path[Math.min(i + 1, n - 1)];
          T.push(vnorm(vsub(b, a)));
        }
        N = vcross(T[0], [0, 1, 0]);
        if (vlen(N) < 0.1) N = vcross(T[0], [0, 0, 1]);
        N = vnorm(N);
        var pos = [], idx = [];
        function ring(c, r, nrm, bin, tgv) {
          if (opt.ground) { var lt = vnorm([tgv[2], 0, -tgv[0]]); return dRing(pos, c, lt, r, r, c[1], seg); }
          var base = pos.length / 3;
          for (j = 0; j < seg; j++) {
            var th = (j / seg) * TAU, cs = Math.cos(th) * r, sn = Math.sin(th) * r;
            var y = c[1] + nrm[1] * cs + bin[1] * sn * (opt.ay || 1);
            if (opt.floor !== undefined && y < opt.floor) y = opt.floor;
            pos.push(c[0] + nrm[0] * cs + bin[0] * sn, y, c[2] + nrm[2] * cs + bin[2] * sn);
          }
          return base;
        }
        var capN = 3, ringBase = [];
        function pole(c) { pos.push(c[0], c[1], c[2]); return pos.length / 3 - 1; }
        var r0 = radfn(0), r1 = radfn(1), startPole, endPole, frames = [];
        for (i = 0; i < n; i++) {
          tg = T[i];
          N = vnorm(vsub(N, vmul(tg, vdot(N, tg))));
          B = vcross(tg, N);
          frames.push([N, B]);
        }
        // start cap
        var seq = [];
        startPole = pole(vsub(path[0], vmul(T[0], r0)));
        for (i = 1; i <= capN; i++) {
          var al = (Math.PI / 2) * (1 - i / (capN + 1));
          seq.push(ring(vsub(path[0], vmul(T[0], r0 * Math.sin(al))), r0 * Math.cos(al), frames[0][0], frames[0][1], T[0]));
        }
        for (i = 0; i < n; i++) seq.push(ring(path[i], radfn(i / (n - 1)), frames[i][0], frames[i][1], T[i]));
        for (i = 1; i <= capN; i++) {
          var al2 = (Math.PI / 2) * (i / (capN + 1));
          seq.push(ring(vadd(path[n - 1], vmul(T[n - 1], r1 * Math.sin(al2))), r1 * Math.cos(al2), frames[n - 1][0], frames[n - 1][1], T[n - 1]));
        }
        endPole = pole(vadd(path[n - 1], vmul(T[n - 1], r1)));
        for (j = 0; j < seg; j++) idx.push(startPole, seq[0] + (j + 1) % seg, seq[0] + j);
        for (i = 0; i < seq.length - 1; i++) {
          for (j = 0; j < seg; j++) {
            var nj = (j + 1) % seg;
            idx.push(seq[i] + j, seq[i] + nj, seq[i + 1] + nj, seq[i] + j, seq[i + 1] + nj, seq[i + 1] + j);
          }
        }
        var last = seq[seq.length - 1];
        for (j = 0; j < seg; j++) idx.push(last + j, last + (j + 1) % seg, endPole);
        return expandTris(new Float32Array(pos), idx);
      }
      function tubeAdd(sc, entry, body, ctrl, radfn, color, opt) {
        opt = opt || {};
        var path = spline(ctrl, opt.per || 6);
        if (opt.ground) path.forEach(function (q, i) { q[1] = 0.55 * radfn(i / (path.length - 1)); });
        sc.add(entry, body, tube(path, radfn, opt.seg || 14, opt), color);
      }
      // Upright flat slab (ear, wing, fin, plate) in the vertical plane through `at` heading `hd` (radians in x/z).
      // poly is [[along, up], ...] relative to at; thickness t extrudes sideways by `side` (+1/-1) from z-offset zOff.
      function plate(poly, at, hd, t, side, ch) {
        var along = [Math.cos(hd), 0, -Math.sin(hd)], sideV = [Math.sin(hd), 0, Math.cos(hd)];
        var basis = { o: [at[0], at[1], at[2]], x: along, y: [0, 1, 0], z: vmul(sideV, side) };
        return slab(poly, basis, t, ch);
      }
      // Hollow cup/dome: a closed lathe with an outer wall and an inner cavity. prof is outer [[r,s],...] from the top pole
      // (s increases downward is NOT required; give pole -> rim). The inner wall is the outer offset by `wall` mm.
      function hollowLathe(fr, outerProf, innerProf, seg, opt) {
        var prof = outerProf.concat(innerProf);
        return lathe(fr, prof, seg, opt || {});
      }
      // Eye: a dark ball on the face with a tiny white glint, both separate entries by the caller.
      function eyeAt(sc, entry, body, c, r, color, dir) {
        sc.add(entry, body, blobShell(c, dir || [1, 0, 0], r, r, r, 10, undefined), color);
      }
      // Mirrors z of a point
      function mz(p, s) { return [p[0], p[1], p[2] * s]; }

      // Lifts the model to the bed (lowest point y = 0) and centres it, then returns the entries.
      function finish(sc) {
        var minY = Infinity, seen = [];
        sc.order.forEach(function (name) {
          sc.groups[name].forEach(function (a) {
            if (seen.indexOf(a) >= 0) return;
            seen.push(a);
            for (var i = 1; i < a.length; i += 3) if (a[i] < minY) minY = a[i];
          });
        });
        if (isFinite(minY) && minY > 1e-6) seen.forEach(function (a) { for (var i = 1; i < a.length; i += 3) a[i] -= minY; });
        else if (minY < -1e-6) seen.forEach(function (a) { for (var i = 1; i < a.length; i += 3) if (a[i] < 0) a[i] = 0; }); // a few embedded tips dip under the bed: flatten them
        return sc.entries();
      }

      // Generic four-legged body used by the cat, dog, elephant and unicorn: returns anchor points for details.
      // o: bodyL, bodyW, bodyH (ellipsoid semi-axes), legH, legR, headR, headL, neck (rise), x of head etc.
      function quadruped(sc, o, col) {
        var bx = 0, by = o.legH + o.bodyH * 0.55;
        ball(sc, 'body', 'b', [bx, by, 0], o.bodyL, o.bodyW, o.bodyH, col.body);
        var lx = o.bodyL * 0.58, lz = o.bodyW * 0.62;
        [[lx, 1], [lx, -1], [-lx, 1], [-lx, -1]].forEach(function (q, i) {
          post(sc, 'legs', 'b', q[0], q[1] * lz, o.legR, o.legR * 0.92, o.legH + o.bodyH * 0.55, col.legs || col.body);
        });
        return { by: by, lx: lx, lz: lz };
      }

      // Scales every shell of the scene about the origin (all shells move together, so the bed height stays 0).
      function scaleScene(sc, s) {
        var seen = [];
        sc.order.forEach(function (name) {
          sc.groups[name].forEach(function (a) {
            if (seen.indexOf(a) >= 0) return;
            seen.push(a);
            for (var i = 0; i < a.length; i++) a[i] *= s;
          });
        });
      }
      function tilt(deg0) { return [Math.cos(deg(deg0)), Math.sin(deg(deg0)), 0]; }
      var EYE = '#1e293b';

      // Open dish (trinket tray) with the oval footprint a x w, rim height H, wall thickness wall, floor thickness fl.
      // Printed upright: the outside leans out at 60 degrees or more, the inside opens upward, so no supports.
      function cupShell(x, z, a, w, H, wall, fl, seg) {
        var o = [[0, 0], [a * 0.74, 0], [a * 0.84, H * 0.28], [a * 0.93, H * 0.58], [a * 0.985, H * 0.82], [a, H]];
        var inn = [[a - wall, H], [a * 0.93 - wall, H * 0.6], [a * 0.78 - wall * 0.6, fl + (H - fl) * 0.25], [a * 0.5, fl], [0, fl]];
        var fr = frame([x, 0, z], [0, 1, 0], [0, 0, 1]);
        return lathe(fr, o.concat(inn), seg || 40, { ay: w / a });
      }

      // ---- Self-limiting shapes: built bottom to top and never growing outward faster than about 45 degrees (Y up, faces +x) ----
      var GROW = 0.9; // largest outward step per mm of height

      // Closed loft from horizontal rings, bottom to top: [{ y, cx, cz, rx, rz }]. Flat bottom, pole on top.
      // o.pow squares the section off (2 = ellipse), o.mod(thDeg, t) multiplies the radius, o.yaw turns the section, o.free skips the growth limit.
      function loft(rings, seg, o) {
        o = o || {};
        seg = seg || 40;
        var pow = o.pow || 2, n = rings.length, V = [], i, j, cy = Math.cos(o.yaw || 0), sy = Math.sin(o.yaw || 0);
        for (i = 0; i < n; i++) {
          var r = rings[i], row = [], ti = i / (n - 1);
          for (j = 0; j < seg; j++) {
            var th = (j / seg) * TAU, c = Math.cos(th), s = Math.sin(th);
            var q = Math.pow(Math.pow(Math.abs(c), pow) + Math.pow(Math.abs(s), pow), -1 / pow);
            var m = o.mod ? o.mod((th * 180) / Math.PI, ti) : 1;
            var lx = r.rx * c * q * m, lz = r.rz * s * q * m;
            row.push([r.cx + lx * cy - lz * sy, r.y, r.cz + lx * sy + lz * cy]);
          }
          V.push(row);
        }
        if (!o.free) {
          for (i = 1; i < n; i++) {
            var lim = GROW * (V[i][0][1] - V[i - 1][0][1]), px = 0, pz = 0;
            for (j = 0; j < seg; j++) { px += V[i - 1][j][0]; pz += V[i - 1][j][2]; }
            px /= seg; pz /= seg;
            for (j = 0; j < seg; j++) {
              var a = V[i - 1][j], b = V[i][j], nx = a[0] - px, nz = a[2] - pz, nl = Math.hypot(nx, nz) || 1;
              nx /= nl; nz /= nl;
              var out = (b[0] - a[0]) * nx + (b[2] - a[2]) * nz;
              var dx = b[0] - a[0], dz = b[2] - a[2], dl = Math.hypot(dx, dz);
              if (out > 0 && dl > lim) { b[0] = a[0] + (dx * lim) / dl; b[2] = a[2] + (dz * lim) / dl; }
            }
          }
        }
        var pos = [], idx = [], top = V[n - 1], tx = 0, tz = 0, tn = rings[n - 1].y, bx = 0, bz = 0;
        for (j = 0; j < seg; j++) { tx += top[j][0]; tz += top[j][2]; bx += V[0][j][0]; bz += V[0][j][2]; }
        pos.push(bx / seg, V[0][0][1], bz / seg);
        for (i = 0; i < n; i++) for (j = 0; j < seg; j++) pos.push(V[i][j][0], V[i][j][1], V[i][j][2]);
        pos.push(tx / seg, tn + (o.poleLift === undefined ? 0.05 : o.poleLift), tz / seg);
        var last = 1 + n * seg;
        function at(a, b) { return 1 + a * seg + b; }
        for (j = 0; j < seg; j++) idx.push(0, at(0, (j + 1) % seg), at(0, j));
        for (i = 0; i < n - 1; i++) for (j = 0; j < seg; j++) {
          var nj = (j + 1) % seg;
          idx.push(at(i, j), at(i, nj), at(i + 1, nj), at(i, j), at(i + 1, nj), at(i + 1, j));
        }
        for (j = 0; j < seg; j++) idx.push(at(n - 1, j), at(n - 1, (j + 1) % seg), last);
        return { tris: expandTris(new Float32Array(pos), idx), V: V, seg: seg, surf: function (thDeg, y) { return loftSurf(V, seg, thDeg, y); } };
      }
      // Point and outward normal on a loft, at an angle (0 = +x, 90 = +z) and a height.
      function loftSurf(V, seg, thDeg, y) {
        var n = V.length, i = 0;
        while (i < n - 2 && V[i + 1][0][1] < y) i++;
        var ta = clamp((y - V[i][0][1]) / ((V[i + 1][0][1] - V[i][0][1]) || 1), 0, 1);
        var f = ((((thDeg % 360) + 360) % 360) / 360) * seg, j0 = Math.floor(f) % seg, j1 = (j0 + 1) % seg, tb = f - Math.floor(f);
        function P(ii, jj) { return V[ii][(jj + seg) % seg]; }
        function mix(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
        var p = mix(mix(P(i, j0), P(i, j1), tb), mix(P(i + 1, j0), P(i + 1, j1), tb), ta);
        var cx = 0, cz = 0, q;
        for (q = 0; q < seg; q++) { cx += V[i][q][0]; cz += V[i][q][2]; }
        cx /= seg; cz /= seg;
        var du = vsub(P(i, j0 + 1), P(i, j0 - 1)), dv = vsub(P(i + 1, j0), P(i, j0)), nrm = vnorm(vcross(du, dv));
        if (nrm[0] * (p[0] - cx) + nrm[2] * (p[2] - cz) < 0) nrm = vmul(nrm, -1);
        return { p: p, n: nrm };
      }

      // Rounded form: a dome of semi-axes rx, ry, rz around c. Below the middle it narrows to the bed, or to o.anchor
      // ([x, y, z], a point inside the shape underneath, with o.anchorR its radius there), by no more than the growth limit.
      function pod(c, rx, ry, rz, o) {
        o = o || {};
        var y1 = c[1] + ry, anchor = o.anchor, y0 = anchor ? anchor[1] : Math.max(0, c[1] - ry), ar = o.anchorR === undefined ? 1.5 : o.anchorR;
        var N = o.rings || 30, rings = [], flare = o.flare === undefined ? 0 : o.flare;
        for (var i = 0; i <= N; i++) {
          var y = lerp(y0, y1, Math.pow(i / N, 0.9)), t = clamp((y - c[1]) / ry, -1, 1), k = Math.sqrt(Math.max(1 - t * t, 0.0004));
          if (i === N) k = 0.02;
          var w = anchor ? smooth(clamp((y - y0) / Math.max(c[1] - y0, 0.01), 0, 1)) : 1;
          var cx = anchor ? lerp(anchor[0], c[0], w) : c[0], cz = anchor ? lerp(anchor[2], c[2], w) : c[2];
          var sq = y < c[1] && flare ? lerp(1, k, 1 - flare) : k;
          var rr = { y: y, cx: cx, cz: cz, rx: rx * sq, rz: rz * sq };
          if (anchor && i === 0) { rr.rx = ar; rr.rz = ar; }
          else if (!anchor && i === 0 && y0 <= 0.001) { rr.rx = rx * Math.max(sq, 0.2); rr.rz = rz * Math.max(sq, 0.2); }
          rings.push(rr);
        }
        return loft(rings, o.seg || 44, { pow: o.pow, mod: o.mod, yaw: o.yaw });
      }

      // Tube along a smooth path. pts [[x, y, z, r], ...]; ends close with a round tip unless o.flatStart.
      // o.bed keeps it lying on the bed: the axis follows 0.65 x radius, so the flat underside meets the sides at 45 degrees.
      // o.rise forces each step to climb at least as fast as it travels, so a free-standing limb never overhangs.
      function sweep(pts, o) {
        o = o || {};
        var seg = o.seg || 20, per = o.per || 7, S = [], i, k;
        function cr(a, b, c, d, t) { return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t); }
        for (i = 0; i < pts.length - 1; i++) {
          var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
          for (k = 0; k < per; k++) {
            var t = k / per;
            S.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t), cr(p0[2], p1[2], p2[2], p3[2], t), Math.max(lerp(p1[3], p2[3], t), 0.4)]);
          }
        }
        S.push(pts[pts.length - 1].slice());
        if (o.rise) {
          for (i = 1; i < S.length; i++) {
            var hh = Math.hypot(S[i][0] - S[i - 1][0], S[i][2] - S[i - 1][2]);
            if (S[i][1] < S[i - 1][1] + hh * 1.08) S[i][1] = S[i - 1][1] + hh * 1.08;
          }
        }
        function tip(sample, dirSign, cap) { // round end: extra samples past the end, shrinking
          var a = sample, r = a[3], d = cap.d, out = [];
          for (var q = 1; q <= 4; q++) {
            var ang = (q / 5) * (Math.PI / 2), sc = Math.cos(ang);
            out.push([a[0] + d[0] * dirSign * r * Math.sin(ang), a[1] + d[1] * dirSign * r * Math.sin(ang), a[2] + d[2] * dirSign * r * Math.sin(ang), Math.max(r * sc, 0.25)]);
          }
          return out;
        }
        var dEnd = vnorm(vsub(S[S.length - 1], S[S.length - 2])), dStart = vnorm(vsub(S[1], S[0]));
        var endCaps = o.flatEnd ? [] : tip(S[S.length - 1], 1, { d: dEnd });
        var startCaps = o.flatStart ? [] : tip(S[0], -1, { d: dStart }).reverse();
        var all = startCaps.concat(S, endCaps);
        var floor = o.floor === undefined ? 0 : o.floor;
        if (o.bed) all = all.map(function (a) { return [a[0], 0.65 * a[3], a[2], a[3]]; });
        var up = [0, 1, 0], pos = [], idx = [];
        pos.push(0, 0, 0);
        var prevU = null;
        for (i = 0; i < all.length; i++) {
          var a0 = all[Math.max(i - 1, 0)], a1 = all[Math.min(i + 1, all.length - 1)], dirv = vnorm(vsub(a1, a0));
          var u = prevU ? vnorm(vsub(prevU, vmul(dirv, vdot(prevU, dirv)))) : vnorm(vcross(Math.abs(dirv[1]) > 0.95 ? [1, 0, 0] : up, dirv));
          prevU = u;
          var v = vcross(dirv, u);
          for (k = 0; k < seg; k++) {
            var th = (k / seg) * TAU, rr = all[i][3];
            var x = all[i][0] + (u[0] * Math.cos(th) + v[0] * Math.sin(th)) * rr, y = all[i][1] + (u[1] * Math.cos(th) + v[1] * Math.sin(th)) * rr, z = all[i][2] + (u[2] * Math.cos(th) + v[2] * Math.sin(th)) * rr;
            if (floor !== null && y < floor) y = floor;
            pos.push(x, y, z);
          }
        }
        var n = all.length, f = all[0], l = all[n - 1];
        pos[0] = f[0]; pos[1] = Math.max(f[1], floor === null ? -1e9 : floor); pos[2] = f[2];
        pos.push(l[0], Math.max(l[1], floor === null ? -1e9 : floor), l[2]);
        function at(a, b) { return 1 + a * seg + b; }
        for (k = 0; k < seg; k++) idx.push(0, at(0, (k + 1) % seg), at(0, k));
        for (i = 0; i < n - 1; i++) for (k = 0; k < seg; k++) {
          var nk = (k + 1) % seg;
          idx.push(at(i, k), at(i, nk), at(i + 1, nk), at(i, k), at(i + 1, nk), at(i + 1, k));
        }
        var lastV = 1 + n * seg;
        for (k = 0; k < seg; k++) idx.push(at(n - 1, k), at(n - 1, (k + 1) % seg), lastV);
        return expandTris(new Float32Array(pos), idx);
      }
      // Tapered spike or horn from a point inside the host up to a tip. It is pushed up if it would lean too far.
      function horn(base, tip, r0, o) {
        o = o || {};
        var mid = [lerp(base[0], tip[0], 0.55) + (o.bendX || 0), lerp(base[1], tip[1], 0.55), lerp(base[2], tip[2], 0.55) + (o.bendZ || 0), r0 * 0.68];
        return sweep([[base[0], base[1], base[2], r0], mid, [tip[0], tip[1], tip[2], Math.max(r0 * 0.16, 0.5)]], { rise: true, seg: o.seg || 14, per: 5, flatStart: o.flatStart });
      }
      // Shallow dome stuck on a surface: it meets the surface at 45 degrees, so even on a vertical face its lower edge prints.
      function dome(p, n, baseR, o) {
        o = o || {};
        var ang = deg(o.angle || 45), R = baseR / Math.sin(ang), h = R * (1 - Math.cos(ang)), sink = o.sink === undefined ? Math.max(1.2, baseR * 0.5) : o.sink;
        var prof = [[0, h]], i;
        for (i = 1; i <= 6; i++) { var a = (i / 6) * ang; prof.push([R * Math.sin(a), h - R + R * Math.cos(a)]); }
        prof.push([baseR, -sink], [0, -sink]);
        return lathe(frame(p, n, [0, 1, 0]), prof, o.seg || 20);
      }
      // Thin raised line on a loft (mouth, wing edge, shell scute): [[thDeg, y], ...] on the surface, meeting it at 45 degrees.
      function ridge(host, marks, w, o) {
        o = o || {};
        var R = w / 1.41, sunk = R * 0.71, pts = marks.map(function (m) { var s = host.surf(m[0], m[1]); return vsub(s.p, vmul(s.n, sunk)).concat([R * (m[2] === undefined ? 1 : m[2])]); });
        return sweep(pts, { seg: o.seg || 10, per: o.per || 4, floor: 0 });
      }
      // Flat plate standing in a vertical plane. poly [[s, y], ...]: s runs along the heading dir (a [x, 0, z] vector), y is world height.
      function vslab(poly, at, dir, t, ch) {
        var d = vnorm(dir), side = [-d[2], 0, d[0]];
        return slab(poly, { o: [at[0] - side[0] * t / 2, at[1] || 0, at[2] - side[2] * t / 2], x: d, y: [0, 1, 0], z: side }, t, ch === undefined ? 0.5 : ch);
      }
      // Closed block whose top is a height field over a disc or rounded square: top(x, z) is the top height, it starts at y0.
      function reliefDisc(R, y0, top, nr, nt, shape) {
        var pos = [], idx = [], i, j;
        function edge(th) { if (!shape) return R; var c = Math.abs(Math.cos(th)), s = Math.abs(Math.sin(th)); return R / Math.pow(Math.pow(c, shape) + Math.pow(s, shape), 1 / shape); }
        pos.push(0, y0, 0);
        for (j = 0; j < nt; j++) { var a = (j / nt) * TAU; pos.push(Math.cos(a) * edge(a), y0, Math.sin(a) * edge(a)); }
        for (i = nr; i >= 1; i--) for (j = 0; j < nt; j++) {
          var th = (j / nt) * TAU, rr = (i / nr) * edge(th), x = Math.cos(th) * rr, z = Math.sin(th) * rr;
          pos.push(x, top(x, z), z);
        }
        pos.push(0, top(0, 0), 0);
        function at(a, b) { return 1 + a * nt + b; }
        var rows = nr + 1;
        for (j = 0; j < nt; j++) idx.push(0, at(0, j), at(0, (j + 1) % nt));
        for (i = 0; i < rows - 1; i++) for (j = 0; j < nt; j++) {
          var nj = (j + 1) % nt;
          idx.push(at(i, j), at(i + 1, j), at(i + 1, nj), at(i, j), at(i + 1, nj), at(i, nj));
        }
        var last = 1 + rows * nt;
        for (j = 0; j < nt; j++) idx.push(at(rows - 1, j), last, at(rows - 1, (j + 1) % nt));
        return expandTris(new Float32Array(pos), idx);
      }
      function eyePair(sc, host, th, y, r, o) { // white eyes with dark pupils, on both sides of the +x face
        o = o || {};
        [-1, 1].forEach(function (sd) {
          var s = host.surf(sd * th, y);
          sc.add('eyes', 'b', dome(s.p, s.n, r, { angle: 50 }), o.white || '#f8fafc');
          var R = r / Math.sin(deg(50)), h = R * (1 - Math.cos(deg(50))), ahead = vadd(s.p, vmul(s.n, h * 0.8));
          sc.add('pupils', 'b', dome(vadd(ahead, vmul(s.n, -0.2)), s.n, r * (o.pupil || 0.55), { sink: 0.8 }), o.dark || '#1e293b');
        });
      }
