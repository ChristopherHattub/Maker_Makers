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
