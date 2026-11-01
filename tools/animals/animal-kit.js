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

      // ---- Sculpt: blended implicit forms, meshed as one seamless closed surface ----
      // Forms melt into each other with a smooth blend, instead of intersecting at hard seams. A final pass works up from
      // the bed, layer by layer, and removes anything that is not reachable within 45 degrees of the solid below, so the
      // surface cannot float or overhang at any slider value. Forms need support underneath, or they get trimmed away.
      function Sculpt(cell) { this.addons = []; this.parents = {}; this.outScale = 1; this.h = cell || 1.2; this.ops = []; this.names = []; this.colors = {}; this.reach = 0.82; }
      Sculpt.prototype._name = function (name, color) { if (name === null || name === undefined) return; if (this.names.indexOf(name) < 0) this.names.push(name); if (color) this.colors[name] = color; };
      Sculpt.prototype._op = function (o) { o.piece = this.curPiece; this.ops.push(o); return this; };
      // ---- Sculpt tab: named pieces the user can move, stretch and delete (see the Sculpt tab in shared/generator-core.js) ----
      // Later forms belong to this piece. parent: a piece whose edits this one also follows.
      Sculpt.prototype.piece = function (id, parent) { this.curPiece = id; (this.parents = this.parents || {}); if (parent) this.parents[id] = parent; return this; };
      // Reads the editor's state. scale is what finishSculpt scales the model by.
      Sculpt.prototype.useEdits = function (api, scale) {
        this.st = api && api.sculpt; this.outScale = scale || 1; this.addons = []; this.parents = this.parents || {};
        if (this.st && this.st.draft) this.h *= 1.7;
        return this;
      };
      Sculpt.prototype._edit = function (id) { return (this.st && this.st.edits && this.st.edits[id]) || null; };
      Sculpt.prototype._chain = function (id) { var out = [], g = 0; while (id && g++ < 6) { var e = this._edit(id); if (e) out.push({ id: id, e: e }); id = this.parents && this.parents[id]; } return out; };
      Sculpt.prototype.deleted = function (id) { return this._chain(id).some(function (c) { return c.e.del; }); };
      // Maps a point of the model as first built to where the edits put it (own edit first, then each parent's).
      Sculpt.prototype.xf = function (id, p) {
        var self = this, q = p.slice();
        this._chain(id).forEach(function (c) {
          var C = self.pivots[c.id] || [0, 0, 0], s = c.e.s || [1, 1, 1], m = c.e.m || [0, 0, 0];
          for (var i = 0; i < 3; i++) q[i] = C[i] + (q[i] - C[i]) * s[i] + m[i] / self.outScale;
        });
        return q;
      };
      // Where a detail placed by hand on the surface goes after its own edit: moved by m, with its own size factor.
      Sculpt.prototype.ownMove = function (id, p) { var e = this._edit(id), m = e && e.m ? e.m : [0, 0, 0]; return [p[0] + m[0] / this.outScale, p[1] + m[1] / this.outScale, p[2] + m[2] / this.outScale]; };
      Sculpt.prototype.ownScale = function (id) { var e = this._edit(id), s = e && e.s ? e.s : [1, 1, 1]; return [s[0], s[1], s[2]]; };
      Sculpt.prototype.scaleOf = function (id) { var k = 1; this._chain(id).forEach(function (c) { var s = c.e.s || [1, 1, 1]; k *= (s[0] + s[1] + s[2]) / 3; }); return k; };
      Sculpt.prototype._applyEdits = function () {
        var self = this, box = {};
        this.pivots = {}; this.boxes = {};
        this.ops.forEach(function (o) {
          if (!o.piece || o.relief) return;
          var b = box[o.piece] = box[o.piece] || { lo: [1e9, 1e9, 1e9], hi: [-1e9, -1e9, -1e9] };
          for (var c = 0; c < 3; c++) { b.lo[c] = Math.min(b.lo[c], o.lo[c]); b.hi[c] = Math.max(b.hi[c], o.hi[c]); }
        });
        Object.keys(box).forEach(function (id) { var b = box[id]; self.pivots[id] = [(b.lo[0] + b.hi[0]) / 2, (b.lo[1] + b.hi[1]) / 2, (b.lo[2] + b.hi[2]) / 2]; self.boxes[id] = b; });
        this.pieceIds = Object.keys(box);
        this.ops = this.ops.filter(function (o) { return !(o.piece && self.deleted(o.piece)); });
        this.ops.forEach(function (o) {
          if (!o.piece) return;
          var ch = self._chain(o.piece);
          if (!ch.length) return;
          var base = o.d, kmin = 1;
          ch.forEach(function (c) { var s = c.e.s || [1, 1, 1]; kmin *= Math.min(s[0], s[1], s[2]); });
          var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
          [0, 1].forEach(function (a) { [0, 1].forEach(function (b) { [0, 1].forEach(function (c) {
            var q = self.xf(o.piece, [a ? o.hi[0] : o.lo[0], b ? o.hi[1] : o.lo[1], c ? o.hi[2] : o.lo[2]]);
            for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i]); hi[i] = Math.max(hi[i], q[i]); }
          }); }); });
          o.lo = lo; o.hi = hi; o.late = true;
          o.d = function (x, y, z) {
            var q = [x, y, z];
            ch.slice().reverse().forEach(function (c) { // undo the parents first, then this piece
              var C = self.pivots[c.id] || [0, 0, 0], s = c.e.s || [1, 1, 1], m = c.e.m || [0, 0, 0];
              for (var i = 0; i < 3; i++) q[i] = C[i] + (q[i] - C[i] - m[i] / self.outScale) / s[i];
            });
            return base(q[0], q[1], q[2]) * kmin;
          };
        });
      };
      // A detail added after run() (eyes, nose), so it can be picked as a piece too.
      Sculpt.prototype.addon = function (id, p, r, box) { this.addons.push({ id: id, p: p, r: r, box: box }); };
      // A detail placed on the finished surface by a ray: returns its hit (with k, its size factor), or null if deleted. Call after run().
      Sculpt.prototype.face = function (id, o, dir, parent) {
        if (parent && parent !== id) this.parents[id] = parent;
        if (this.deleted(id)) return null;
        this.pivots[id] = this.pivots[id] || o;
        var h = this.hit(this.xf(id, o), dir);
        h.k = this.scaleOf(id);
        return h;
      };
      // A small detail sitting on another one (a pupil on an eye): moved only by its own edit. Returns { p, k }, or null if deleted.
      Sculpt.prototype.sub = function (id, parent, p, r) {
        if (parent && parent !== id) this.parents[id] = parent;
        if (this.deleted(id)) return null;
        var s = this.ownScale(id), k = (s[0] + s[1] + s[2]) / 3, q = this.ownMove(id, p);
        this.addon(id, q, r * k);
        return { p: q, k: k };
      };
      // A rigid closed shell (a fin, a bead, a plinth) as a piece: moved and stretched as a whole. Call after run().
      Sculpt.prototype.shell = function (sc, id, entry, body, tris, color, parent) {
        if (parent && parent !== id) this.parents[id] = parent;
        if (this.deleted(id)) return;
        var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9], i, c;
        for (i = 0; i < tris.length; i += 3) for (c = 0; c < 3; c++) { if (tris[i + c] < lo[c]) lo[c] = tris[i + c]; if (tris[i + c] > hi[c]) hi[c] = tris[i + c]; }
        this.pivots[id] = this.pivots[id] || [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
        if (this._chain(id).length) {
          lo = [1e9, 1e9, 1e9]; hi = [-1e9, -1e9, -1e9];
          for (i = 0; i < tris.length; i += 3) {
            var q = this.xf(id, [tris[i], tris[i + 1], tris[i + 2]]);
            for (c = 0; c < 3; c++) { tris[i + c] = q[c]; if (q[c] < lo[c]) lo[c] = q[c]; if (q[c] > hi[c]) hi[c] = q[c]; }
          }
        }
        this.addon(id, [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2], Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2, { lo: lo, hi: hi });
        sc.add(entry, body, tris, color);
      };
      // Which piece is at a point of the finished model? Used by the Select tool.
      Sculpt.prototype.pieceAt = function (pt) {
        var sh = (this.st && this.st.shift) || [0, 0], k = this.outScale, x = (pt.x + sh[0]) / k, y = pt.y / k, z = (pt.z + sh[1]) / k, best = null, bd = 1e9, i;
        var small = this.addons.slice().sort(function (u, v) { return u.r - v.r; }); // a pupil sits inside its eye: the smaller one wins
        for (i = 0; i < small.length; i++) {
          var a = small[i];
          if (a.box ? (x >= a.box.lo[0] - 0.3 && x <= a.box.hi[0] + 0.3 && y >= a.box.lo[1] - 0.3 && y <= a.box.hi[1] + 0.3 && z >= a.box.lo[2] - 0.3 && z <= a.box.hi[2] + 0.3) : Math.hypot(a.p[0] - x, a.p[1] - y, a.p[2] - z) < a.r + 0.4) return a.id;
        }
        this.ops.forEach(function (o) {
          if (!o.piece || o.carve || o.paint || o.relief) return;
          var d = o.d(x, y, z);
          if (d < bd) { bd = d; best = o.piece; }
        });
        return best;
      };
      // Box around a piece in the finished model, for the selection outline.
      Sculpt.prototype.boundsOf = function (id) {
        var self = this, sh = (this.st && this.st.shift) || [0, 0], k = this.outScale, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9], any = false;
        (this.pieceIds || []).forEach(function (pid) {
          var isIt = pid === id;
          if (!isIt) { var g = 0, up = self.parents && self.parents[pid]; while (up && g++ < 6) { if (up === id) isIt = true; up = self.parents[up]; } }
          if (!isIt || self.deleted(pid)) return;
          var b = self.boxes[pid];
          [0, 1].forEach(function (a) { [0, 1].forEach(function (e) { [0, 1].forEach(function (c) {
            var q = self.xf(pid, [a ? b.hi[0] : b.lo[0], e ? b.hi[1] : b.lo[1], c ? b.hi[2] : b.lo[2]]);
            for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i]); hi[i] = Math.max(hi[i], q[i]); }
            any = true;
          }); }); });
        });
        (this.addons || []).forEach(function (a) {
          var g = 0, up = self.parents && self.parents[a.id], isIt = a.id === id;
          while (!isIt && up && g++ < 6) { if (up === id) isIt = true; up = self.parents[up]; }
          if (!isIt) return;
          for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], a.box ? a.box.lo[i] : a.p[i] - a.r); hi[i] = Math.max(hi[i], a.box ? a.box.hi[i] : a.p[i] + a.r); }
          any = true;
        });
        if (!any) return null;
        return { lo: [lo[0] * k - sh[0], lo[1] * k, lo[2] * k - sh[1]], hi: [hi[0] * k - sh[0], hi[1] * k, hi[2] * k - sh[1]] };
      };
      // cfg.sculpt for a generator built with Sculpt. pieces: [{ id, label }].
      function sculptModule(pieces) {
        return {
          kit: true,
          pieces: pieces,
          available: function () { var S = window.MM_SCULPT_LAST; return S ? pieces.filter(function (p) { return (S.pieceIds || []).indexOf(p.id) >= 0 || (S.addons || []).some(function (a) { return a.id === p.id; }) || S.deleted(p.id); }) : pieces; },
          pieceAt: function (pt) { var S = window.MM_SCULPT_LAST; return S ? S.pieceAt(pt) : null; },
          bounds: function (id) { var S = window.MM_SCULPT_LAST; return S ? S.boundsOf(id) : null; },
          isUnder: function (id, parent) { var S = window.MM_SCULPT_LAST, g = 0, up = id && S && S.parents && S.parents[id]; while (up && g++ < 6) { if (up === parent) return true; up = S.parents[up]; } return false; }
        };
      }
      // Ellipsoid: c centre, r [rx, ry, rz], k blend radius.
      Sculpt.prototype.ell = function (name, c, r, color, k) {
        this._name(name, color); var m = Math.max(r[0], r[1], r[2]);
        return this._op({ name: name, k: k === undefined ? 4 : k, lo: [c[0] - r[0], c[1] - r[1], c[2] - r[2]], hi: [c[0] + r[0], c[1] + r[1], c[2] + r[2]], d: function (x, y, z) {
          var a = (x - c[0]) / r[0], b = (y - c[1]) / r[1], e = (z - c[2]) / r[2], k0 = Math.sqrt(a * a + b * b + e * e);
          if (k0 < 1e-4) return -Math.min(r[0], r[1], r[2]);
          var a2 = a / r[0], b2 = b / r[1], e2 = e / r[2], k1 = Math.sqrt(a2 * a2 + b2 * b2 + e2 * e2);
          return Math.max(k0 * (k0 - 1) / k1, -m);
        } });
      };
      // Tapered limb through points [[x, y, z, r], ...], smoothed through the points.
      Sculpt.prototype.path = function (name, pts, color, k, per) {
        this._name(name, color);
        var P = [], i, j, n = per === undefined ? 6 : per;
        function cr(a, b, c, d, t) { return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t); }
        if (pts.length === 2) P = pts; else {
          for (i = 0; i < pts.length - 1; i++) {
            var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
            for (j = 0; j < n; j++) { var t = j / n; P.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t), cr(p0[2], p1[2], p2[2], p3[2], t), Math.max(lerp(p1[3], p2[3], t), 0.2)]); }
          }
          P.push(pts[pts.length - 1]);
        }
        var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
        P.forEach(function (q) { for (var c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], q[c] - q[3]); hi[c] = Math.max(hi[c], q[c] + q[3]); } });
        return this._op({ name: name, k: k === undefined ? 4 : k, lo: lo, hi: hi, d: function (x, y, z) {
          var best = 1e9;
          for (var s = 0; s < P.length - 1; s++) {
            var a = P[s], b = P[s + 1], bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2], px = x - a[0], py = y - a[1], pz = z - a[2];
            var t = clamp((px * bx + py * by + pz * bz) / ((bx * bx + by * by + bz * bz) || 1), 0, 1), ex = px - bx * t, ey = py - by * t, ez = pz - bz * t;
            var v = Math.sqrt(ex * ex + ey * ey + ez * ez) - (a[3] + (b[3] - a[3]) * t);
            if (v < best) best = v;
          }
          return best;
        } });
      };
      // Flat rounded plate in a vertical plane: poly [[s, y], ...], s along dir (a horizontal vector) from `at`, y is world height.
      Sculpt.prototype.plate = function (name, poly, at, dir, t, color, k, round) {
        this._name(name, color);
        var d = vnorm(dir), sd = [-d[2], 0, d[0]], n = poly.length, rd = round === undefined ? Math.min(1, t * 0.4) : round, ht = t / 2 - rd;
        var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
        poly.forEach(function (q) {
          [-t, t].forEach(function (w) {
            var x = at[0] + d[0] * q[0] + sd[0] * w / 2, z = at[2] + d[2] * q[0] + sd[2] * w / 2;
            lo[0] = Math.min(lo[0], x); hi[0] = Math.max(hi[0], x); lo[2] = Math.min(lo[2], z); hi[2] = Math.max(hi[2], z);
          });
          lo[1] = Math.min(lo[1], q[1]); hi[1] = Math.max(hi[1], q[1]);
        });
        return this._op({ name: name, k: k === undefined ? 2 : k, lo: lo, hi: hi, d: function (x, y, z) {
          var rx = x - at[0], rz = z - at[2], u = rx * d[0] + rz * d[2], w = rx * sd[0] + rz * sd[2], best = 1e18, inside = false;
          if (Math.abs(w) > t + 6) return Math.abs(w) - t / 2;
          for (var i = 0, j = n - 1; i < n; j = i++) {
            var a = poly[i], b = poly[j], ex = b[0] - a[0], ey = b[1] - a[1], fx = u - a[0], fy = y - a[1];
            var q = clamp((fx * ex + fy * ey) / ((ex * ex + ey * ey) || 1), 0, 1), gx = fx - ex * q, gy = fy - ey * q, dd = gx * gx + gy * gy;
            if (dd < best) best = dd;
            if ((a[1] > y) !== (b[1] > y) && u < a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1])) inside = !inside;
          }
          var s2 = Math.sqrt(best) * (inside ? -1 : 1) + rd, w2 = Math.abs(w) - ht;
          return Math.min(Math.max(s2, w2), 0) + Math.hypot(Math.max(s2, 0), Math.max(w2, 0)) - rd;
        } });
      };
      // Carves a form (an ell / path / plate result pushed last) out of everything so far.
      Sculpt.prototype.carve = function (k) { var o = this.ops[this.ops.length - 1]; o.carve = true; if (k !== undefined) o.k = k; return this; };
      // Recolours the surface inside an ellipsoid, without changing its shape (bellies, patches, masks).
      Sculpt.prototype.paint = function (name, c, r, color) {
        this._name(name, color);
        return this._op({ name: name, paint: true, lo: [c[0] - r[0], c[1] - r[1], c[2] - r[2]], hi: [c[0] + r[0], c[1] + r[1], c[2] + r[2]], k: 0, d: function (x, y, z) {
          var a = (x - c[0]) / r[0], b = (y - c[1]) / r[1], e = (z - c[2]) / r[2]; return a * a + b * b + e * e - 1;
        } });
      };
      // Moves the surface in a box by fn(x, y, z) mm (positive = inward): grooves, scales, shell plates.
      Sculpt.prototype.relief = function (lo, hi, fn) { return this._op({ relief: true, lo: lo, hi: hi, k: 0, d: fn, name: this.names[0] }); };
      // Keeps only x <= maxX (used by flexi heads, which must stay clear of the first joint).
      Sculpt.prototype.clipX = function (maxX) { this.maxX = maxX; return this; };
      Sculpt.prototype.run = function () {
        this._applyEdits();
        window.MM_SCULPT_LAST = this;
        var h = this.h, ops = this.ops, lo = [1e9, 0, 1e9], hi = [-1e9, 0, -1e9], i, a;
        ops.forEach(function (o) { if (o.carve || o.paint || o.relief) return; for (var c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], o.lo[c]); hi[c] = Math.max(hi[c], o.hi[c]); } });
        if (lo[0] > hi[0]) { lo = [-2, 0, -2]; hi = [2, 2, 2]; } // every form was deleted: an empty field
        lo[1] = 0;
        var x0 = lo[0] - 2 * h, z0 = lo[2] - 2 * h, nx = Math.ceil((hi[0] - lo[0]) / h) + 5, ny = Math.ceil(hi[1] / h) + 4, nz = Math.ceil((hi[2] - lo[2]) / h) + 5, N = nx * ny * nz;
        var F = new Float32Array(N).fill(1000), L = new Uint8Array(N), idx = function (ix, iy, iz) { return (iy * nz + iz) * nx + ix; }, names = this.names, self = this;
        function raster(o) {
          var pad = (o.k || 0) + 2.2 * h, label = names.indexOf(o.name);
          var ia = Math.max(0, Math.floor((o.lo[0] - pad - x0) / h)), ib = Math.min(nx - 1, Math.ceil((o.hi[0] + pad - x0) / h));
          var ja = Math.max(0, Math.floor((o.lo[1] - pad) / h)), jb = Math.min(ny - 1, Math.ceil((o.hi[1] + pad) / h));
          var ka = Math.max(0, Math.floor((o.lo[2] - pad - z0) / h)), kb = Math.min(nz - 1, Math.ceil((o.hi[2] + pad - z0) / h));
          for (var iy = ja; iy <= jb; iy++) for (var iz = ka; iz <= kb; iz++) for (var ix = ia; ix <= ib; ix++) {
            var n = idx(ix, iy, iz), d = o.d(x0 + ix * h, iy * h, z0 + iz * h), f = F[n];
            if (o.relief) { F[n] = f + d; continue; }
            if (o.paint) { if (d < 0) L[n] = label; continue; }
            var k = o.k;
            if (o.carve) { var q = -d, w = k > 0 ? clamp(0.5 + 0.5 * (f - q) / k, 0, 1) : (f > q ? 1 : 0); F[n] = lerp(q, f, w) + (k > 0 ? k * w * (1 - w) : 0); continue; }
            if (d - k > f) continue;
            var t = k > 0 ? clamp(0.5 + 0.5 * (f - d) / k, 0, 1) : (d < f ? 1 : 0);
            F[n] = lerp(f, d, t) - (k > 0 ? k * t * (1 - t) : 0);
            if (d < f) L[n] = label;
          }
        }
        ops.forEach(function (o) { if (!o.late) raster(o); });
        if (this.maxX !== undefined) for (var cy = 0; cy < ny; cy++) for (var cz = 0; cz < nz; cz++) for (var cx = 0; cx < nx; cx++) { var v = x0 + cx * h - this.maxX, m = idx(cx, cy, cz); if (v > F[m]) F[m] = v; }
        // Support pass: a layer may only hold what is within 45 degrees of the solid on the layer below.
        var D = new Float32Array(nx * nz), S2 = 1.4142 * h, A = nx * nz;
        for (var ly = 1; ly < ny; ly++) {
          var base = (ly - 1) * A, ib2;
          for (ib2 = 0; ib2 < A; ib2++) { var fb = F[base + ib2]; D[ib2] = fb < 0 ? fb : 1e6; }
          // seed outside cells beside the solid with their true sub-cell distance, then spread
          for (var pz = 0; pz < nz; pz++) for (var px = 0; px < nx; px++) {
            var c0 = pz * nx + px; if (D[c0] < 0) continue;
            var fv = F[base + c0];
            if ((px > 0 && D[c0 - 1] < 0) || (px < nx - 1 && D[c0 + 1] < 0) || (pz > 0 && D[c0 - nx] < 0) || (pz < nz - 1 && D[c0 + nx] < 0)) D[c0] = Math.min(fv, h);
          }
          for (pz = 0; pz < nz; pz++) for (px = 0; px < nx; px++) {
            c0 = pz * nx + px; if (D[c0] <= 0) continue; var b0 = D[c0];
            if (px > 0) b0 = Math.min(b0, D[c0 - 1] + h); if (pz > 0) { b0 = Math.min(b0, D[c0 - nx] + h); if (px > 0) b0 = Math.min(b0, D[c0 - nx - 1] + S2); if (px < nx - 1) b0 = Math.min(b0, D[c0 - nx + 1] + S2); }
            D[c0] = b0;
          }
          for (pz = nz - 1; pz >= 0; pz--) for (px = nx - 1; px >= 0; px--) {
            c0 = pz * nx + px; if (D[c0] <= 0) continue; b0 = D[c0];
            if (px < nx - 1) b0 = Math.min(b0, D[c0 + 1] + h); if (pz < nz - 1) { b0 = Math.min(b0, D[c0 + nx] + h); if (px < nx - 1) b0 = Math.min(b0, D[c0 + nx + 1] + S2); if (px > 0) b0 = Math.min(b0, D[c0 + nx - 1] + S2); }
            D[c0] = b0;
          }
          var top = ly * A;
          for (ib2 = 0; ib2 < A; ib2++) { var allow = D[ib2] - h * self.reach * 0.92; if (allow > F[top + ib2]) F[top + ib2] = allow; }
        }
        // Drop specks: keep only solid connected to the bed through cell faces.
        var keep = new Uint8Array(N), st = new Int32Array(N), sp = 0, cc;
        for (i = A; i < 2 * A; i++) if (F[i] < 0) { keep[i] = 1; st[sp++] = i; }
        while (sp) {
          cc = st[--sp];
          var nb6 = [cc - 1, cc + 1, cc - nx, cc + nx, cc - A, cc + A];
          for (var b6 = 0; b6 < 6; b6++) { var q6 = nb6[b6]; if (q6 >= A && q6 < N && F[q6] < 0 && !keep[q6]) { keep[q6] = 1; st[sp++] = q6; } }
        }
        for (i = A; i < N; i++) if (F[i] < 0 && !keep[i]) F[i] = 0.5;
        // Pieces the user moved or stretched are added after the support pass, so they are not trimmed away.
        ops.forEach(function (o) { if (o.late) raster(o); });
        // The bed: layer 0 is just outside, so the underside meshes flat.
        for (i = 0; i < A; i++) if (F[i] < 0) F[i] = 1e-4;
        for (i = 0; i < A; i++) { F[i] = F[i] < 1e-3 && F[i + A] < 0 ? 1e-4 : Math.max(F[i], 1e-4); }
        this.F = F; this.L = L; this.grid = { nx: nx, ny: ny, nz: nz, x0: x0, z0: z0, h: h };
        return this;
      };
      Sculpt.prototype.field = function (x, y, z) {
        var g = this.grid, h = g.h, fx = (x - g.x0) / h, fy = y / h, fz = (z - g.z0) / h;
        var ix = clamp(Math.floor(fx), 0, g.nx - 2), iy = clamp(Math.floor(fy), 0, g.ny - 2), iz = clamp(Math.floor(fz), 0, g.nz - 2), tx = fx - ix, ty = fy - iy, tz = fz - iz, F = this.F;
        function v(a, b, c) { return F[((iy + b) * g.nz + iz + c) * g.nx + ix + a]; }
        return lerp(lerp(lerp(v(0, 0, 0), v(1, 0, 0), tx), lerp(v(0, 0, 1), v(1, 0, 1), tx), tz), lerp(lerp(v(0, 1, 0), v(1, 1, 0), tx), lerp(v(0, 1, 1), v(1, 1, 1), tx), tz), ty);
      };
      // First point on the surface along a ray, with its outward normal. Call after run().
      Sculpt.prototype.hit = function (o, dir) {
        var d = vnorm(dir), s = 0, st = this.h * 0.25, p = o, prev = this.field(o[0], o[1], o[2]);
        for (var i = 0; i < 800; i++) {
          s += st; p = vadd(o, vmul(d, s));
          var f = this.field(p[0], p[1], p[2]);
          if (f < 0 && prev >= 0) { p = vadd(o, vmul(d, s - st * (f / (f - prev)))); break; }
          prev = f;
        }
        var e = this.h, self = this;
        function g(a, b, c) { return self.field(p[0] + a, p[1] + b, p[2] + c); }
        return { p: p, n: vnorm([g(e, 0, 0) - g(-e, 0, 0), g(0, e, 0) - g(0, -e, 0), g(0, 0, e) - g(0, 0, -e)]) };
      };
      // Meshes the field and adds it to a Scene as one smoothGroup split into paintable entries. Marching tetrahedra: always closed and manifold.
      Sculpt.prototype.addTo = function (sc, body) {
        var g = this.grid, F = this.F, L = this.L, nx = g.nx, ny = g.ny, nz = g.nz, h = g.h, x0 = g.x0, z0 = g.z0, names = this.names, A = nx * nz;
        var TET = [[0, 1, 3, 7], [0, 3, 2, 7], [0, 2, 6, 7], [0, 6, 4, 7], [0, 4, 5, 7], [0, 5, 1, 7]];
        var cor = [0, 1, nz * 0 + nx, nx + 1, A, A + 1, A + nx, A + nx + 1]; // x bit 1, z bit 2, y bit 4
        var verts = new Map(), P = [], out = names.map(function () { return []; });
        function vert(a, b) {
          var key = a < b ? a * N2 + b : b * N2 + a, got = verts.get(key);
          if (got !== undefined) return got;
          var fa = F[a], fb = F[b], t = clamp(fa / (fa - fb), 0.02, 0.98);
          function xyz(n) { var iy = Math.floor(n / A), r = n - iy * A, iz = Math.floor(r / nx); return [x0 + (r - iz * nx) * h, iy * h, z0 + iz * h]; }
          var pa = xyz(a), pb = xyz(b), id = P.length / 3;
          P.push(lerp(pa[0], pb[0], t), lerp(pa[1], pb[1], t), lerp(pa[2], pb[2], t));
          verts.set(key, id);
          return id;
        }
        var N2 = nx * ny * nz;
        function tri(a, b, c, lab, nIn) { // winding so the normal points from solid toward empty; nIn = a node inside
          var ax = P[a * 3], ay = P[a * 3 + 1], az = P[a * 3 + 2], ux = P[b * 3] - ax, uy = P[b * 3 + 1] - ay, uz = P[b * 3 + 2] - az, vx = P[c * 3] - ax, vy = P[c * 3 + 1] - ay, vz = P[c * 3 + 2] - az;
          var cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
          var iy = Math.floor(nIn / A), r = nIn - iy * A, iz = Math.floor(r / nx), ix = r - iz * nx;
          var dot = cx * (x0 + ix * h - ax) + cy * (iy * h - ay) + cz * (z0 + iz * h - az);
          out[lab].push(a, dot > 0 ? c : b, dot > 0 ? b : c);
        }
        for (var iy = 0; iy < ny - 1; iy++) for (var iz = 0; iz < nz - 1; iz++) for (var ix = 0; ix < nx - 1; ix++) {
          var n0 = (iy * nz + iz) * nx + ix, any = 0;
          for (var c = 0; c < 8; c++) if (F[n0 + cor[c]] < 0) any++;
          if (any === 0 || any === 8) continue;
          for (var t = 0; t < 6; t++) {
            var T = TET[t], ins = [], ous = [];
            for (var q = 0; q < 4; q++) { var nn = n0 + cor[T[q]]; (F[nn] < 0 ? ins : ous).push(nn); }
            if (!ins.length || !ous.length) continue;
            var lab = L[ins[0]];
            if (ins.length === 1) tri(vert(ins[0], ous[0]), vert(ins[0], ous[1]), vert(ins[0], ous[2]), lab, ins[0]);
            else if (ins.length === 3) tri(vert(ous[0], ins[0]), vert(ous[0], ins[1]), vert(ous[0], ins[2]), lab, ins[0]);
            else {
              var a = vert(ins[0], ous[0]), b = vert(ins[0], ous[1]), cc = vert(ins[1], ous[1]), d = vert(ins[1], ous[0]);
              tri(a, b, cc, lab, ins[0]); tri(a, cc, d, lab, ins[0]);
            }
          }
        }
        // Drop the first layer onto the bed, so the bottom edge has no undercut.
        for (var fl = 1; fl < P.length; fl += 3) if (P[fl] < h) P[fl] = 0;
        // Light smoothing removes the small ripple left by the grid. The flat underside stays on the bed.
        var nv = P.length / 3, sum = new Float32Array(nv * 3), cnt = new Uint16Array(nv), pass, ii;
        function link(u, v) { sum[u * 3] += P[v * 3]; sum[u * 3 + 1] += P[v * 3 + 1]; sum[u * 3 + 2] += P[v * 3 + 2]; cnt[u]++; }
        for (pass = 0; pass < (this.smoothing || 6); pass++) {
          var lam = pass % 2 ? -0.34 : 0.33; // shrink then inflate, so the volume holds
          sum.fill(0); cnt.fill(0);
          out.forEach(function (idx) { for (var e = 0; e < idx.length; e += 3) { var a0 = idx[e], b0 = idx[e + 1], c0 = idx[e + 2]; link(a0, b0); link(a0, c0); link(b0, c0); link(b0, a0); link(c0, a0); link(c0, b0); } });
          for (ii = 0; ii < nv; ii++) {
            if (!cnt[ii]) continue;
            var low = P[ii * 3 + 1] <= h * 1.5; // near the bed: tidy the outline, but keep the height
            for (var ax = 0; ax < 3; ax++) if (!low || ax !== 1) P[ii * 3 + ax] += lam * (sum[ii * 3 + ax] / cnt[ii] - P[ii * 3 + ax]);
                      }
        }
        // Straighten the edges between paint regions: slide each boundary vertex toward its boundary neighbours.
        var owner = new Map(), bn = new Map();
        function be(u, v, li) {
          var key = u < v ? u * nv + v : v * nv + u, o = owner.get(key);
          if (o === undefined) { owner.set(key, li); return; }
          if (o !== li) { (bn.get(u) || bn.set(u, []).get(u)).push(v); (bn.get(v) || bn.set(v, []).get(v)).push(u); }
        }
        out.forEach(function (idx, li) { for (var e = 0; e < idx.length; e += 3) { be(idx[e], idx[e + 1], li); be(idx[e + 1], idx[e + 2], li); be(idx[e + 2], idx[e], li); } });
        for (pass = 0; pass < 5; pass++) {
          var moved = [];
          bn.forEach(function (ns, v) {
            if (P[v * 3 + 1] <= h * 1.5 || ns.length !== 2) return;
            var mx = 0, my = 0, mz = 0;
            ns.forEach(function (q) { mx += P[q * 3]; my += P[q * 3 + 1]; mz += P[q * 3 + 2]; });
            moved.push(v, P[v * 3] + 0.35 * (mx / ns.length - P[v * 3]), P[v * 3 + 1] + 0.35 * (my / ns.length - P[v * 3 + 1]), P[v * 3 + 2] + 0.35 * (mz / ns.length - P[v * 3 + 2]));
          });
          for (ii = 0; ii < moved.length; ii += 4) { var vv = moved[ii]; P[vv * 3] = moved[ii + 1]; P[vv * 3 + 1] = moved[ii + 2]; P[vv * 3 + 2] = moved[ii + 3]; }
        }
        var self = this;
        out.forEach(function (idx, li) {
          if (!idx.length) return;
          var arr = new Float32Array(idx.length * 3);
          for (var i = 0; i < idx.length; i++) { arr[i * 3] = P[idx[i] * 3]; arr[i * 3 + 1] = P[idx[i] * 3 + 1]; arr[i * 3 + 2] = P[idx[i] * 3 + 2]; }
          sc.add(names[li], body || 'b', arr, self.colors[names[li]]);
          (sc.sculpted = sc.sculpted || {})[names[li]] = true;
        });
      };
      // Scene output with the sculpted entries tagged as one seamless surface.
      function finishSculpt(sc, scale, S) {
        if (scale && scale !== 1) scaleScene(sc, scale);
        if (!sc.order.length) return [];
        var first = sc.groups[sc.order[0]][0], x0 = first[0], z0 = first[2];
        var es = finish(sc);
        if (S && S.st) { // once anything is edited the model stays where it is on the bed, so it does not jump under the cursor
          var shift = [x0 - first[0], z0 - first[2]], edited = Object.keys(S.st.edits).length || S.st.strokes.length;
          if (!edited || !S.st.shift) S.st.shift = shift;
          var ax = shift[0] - S.st.shift[0], az = shift[1] - S.st.shift[1];
          if (ax || az) es.forEach(function (e) { for (var i = 0; i < e.positions.length; i += 3) { e.positions[i] += ax; e.positions[i + 2] += az; } });
        }
        es.forEach(function (e) { if (sc.sculpted && sc.sculpted[e.name]) e.smoothGroup = 'sculpt'; });
        return es;
      }
      // A face detail on the sculpted surface: fired from `o` along `dir`.
      function detail(sc, S, name, o, dir, r, color, opt) { var s = S.hit(o, dir); sc.add(name, 'b', dome(s.p, s.n, r, opt), color); return s; }
      // Points of a band running over an ellipsoid at a fixed x offset, from one side to the other (stripes, ribs, shell bands).
      function bandOver(c, r, dx, reach, rad, sink) {
        var out = [], n = 8;
        for (var i = 0; i <= n; i++) {
          var u = lerp(-reach, reach, i / n), q = 1 - (dx * dx) / (r[0] * r[0]) - u * u, top = Math.sqrt(Math.max(q, 0.01));
          out.push([c[0] + dx, c[1] + r[1] * top - (sink || 0), c[2] + r[2] * u, rad * (1 - 0.3 * Math.abs(u))]);
        }
        return out;
      }
      // A small, set-in reptile eye: a low iris with a dark pupil. Keep it under a brow ridge sculpted before run().
      // slit > 0 gives an upright slit pupil of that height factor.
      function reptileEye(sc, S, id, pid, o, dir, parent, R0, iris, slit) {
        var e = S.face(id, o, dir, parent);
        if (!e) return null;
        var R = R0 * e.k;
        S.addon(id, e.p, R);
        sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 34, seg: 22, sink: 1.2 }), iris);
        var rise = (R / Math.sin(deg(34))) * (1 - Math.cos(deg(34))), pu = S.sub(pid, id, vadd(e.p, vmul(e.n, rise * 0.72)), R * 0.5);
        if (!pu) return e;
        if (slit) {
          var hh = R * slit * pu.k, q = pu.p;
          sc.add('pupils', 'b', sweep([[q[0], q[1] - hh, q[2], 0.4 * pu.k], [q[0] + e.n[0] * 0.15, q[1], q[2] + e.n[2] * 0.15, Math.max(0.55, R * 0.2) * pu.k], [q[0], q[1] + hh, q[2], 0.4 * pu.k]], { seg: 8, per: 3, floor: null }), '#0f172a');
        } else sc.add('pupils', 'b', dome(pu.p, e.n, R * 0.55 * pu.k, { sink: 0.5 }), '#0f172a');
        return e;
      }
