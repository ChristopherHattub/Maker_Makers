      // -----------------------------------------------------------------------
      // Dragon Maker: a heraldic dragon sculpted as one seamless surface (muscled limbs, S-curved neck, wedge head
      // with brow, horns and fangs, belly plates), with raised bat wings, dorsal blades and a spade tail as clean shells.
      // Every pose is shaped to print without supports: the wings' lower edges climb at 45 degrees or more.
      // -----------------------------------------------------------------------
      var DRAGON_COLORS = { body: '#7c5cd6', belly: '#f2dfa0', dark: '#4a2f9a', membrane: '#c4b2f2', horn: '#efe9d8', eye: '#f59e0b', gem: '#f0abfc' };

      function buildDragon(p, api) {
        var sc = new Scene(), S = new Sculpt(1.1).useEdits(api), C = DRAGON_COLORS, pose = Math.round(p.pose), hs = p.headSize, later = [], i, t;
        var P = DRAGON_POSES[pose](p);
        var sleep = pose === 3;

        // ---- torso, neck and belly ----
        S.piece('torso');
        P.torso.forEach(function (f) { if (f[0] === 'ell') S.ell('body', f[1], f[2], C.body, f[3]); else S.path('body', f[1], C.body, f[2], 3); });
        S.path('body', P.neck.map(function (q, k) { var u = k / (P.neck.length - 1); return [q[0], q[1], q[2], q[3] * (1 + (hs - 1) * u * u)]; }), C.body, 6, 3); // the top of the neck grows with the head

        // ---- limbs ----
        function paw(at, hd, k, nToes) { // a foot flat on the bed: palm pad, separate knuckled toes and hooked claws, fanned along heading hd (radians, 0 = +x)
          var c = Math.cos(hd), s0 = Math.sin(hd);
          S.ell('feet', [at[0], 3 * k, at[2]], [6.6 * k, 3.6 * k, 5.6 * k], C.body, 2);
          for (var q = 0; q < nToes; q++) {
            var a = hd + (q - (nToes - 1) / 2) * 0.44, ca = Math.cos(a), sa = Math.sin(a), b = [at[0] + c * 2.5 * k, at[2] - s0 * 2.5 * k];
            var L = q === (nToes - 1) / 2 ? 1.12 : 1, m = [b[0] + ca * 5 * k * L, b[1] - sa * 5 * k * L], e = [b[0] + ca * 9.5 * k * L, b[1] - sa * 9.5 * k * L];
            S.path('feet', [[b[0], 2.1 * k, b[1], 2.6 * k], [m[0], 2.5 * k, m[1], 2.5 * k], [e[0], 1.6 * k, e[1], 2 * k]], C.body, 0.8); // toes sit into the bed so the support pass keeps them
            S.path('claws', [[e[0], 1.4 * k, e[1], 1.8 * k], [e[0] + ca * 2.8 * k, 1.1 * k, e[1] - sa * 2.8 * k, 1.45 * k], [e[0] + ca * 5.2 * k, 0.5, e[1] - sa * 5.2 * k, 1]], C.horn, 0.3);
          }
        }
        function raisedHand(at, dir, k) { // three curled claws reaching up and forward from a wrist
          S.ell('feet', at, [4.2 * k, 4.2 * k, 3.6 * k], C.body, 2);
          for (var q = -1; q <= 1; q++) {
            var b = [at[0] + dir[0] * 3 * k, at[1] + dir[1] * 3 * k, at[2] + q * 2.6 * k];
            var m = [b[0] + dir[0] * 4 * k, b[1] + dir[1] * 4 * k + 1.5 * k, b[2] + q * 1.2 * k];
            S.path('feet', [[b[0], b[1], b[2], 1.9 * k], [m[0], m[1], m[2], 1.5 * k]], C.body, 1);
            S.path('claws', [[m[0], m[1], m[2], 1.4 * k], [m[0] + dir[0] * 3 * k + 1.2 * k, m[1] + dir[1] * 3 * k + 2 * k, m[2], 0.9 * k], [m[0] + dir[0] * 4 * k + 2.6 * k, m[1] + 4.6 * k, m[2], 0.4]], C.horn, 0.5);
          }
        }
        [-1, 1].forEach(function (s) {
          var F = P.fore(s);
          S.piece(s < 0 ? 'armL' : 'armR');
          S.ell('body', F.sh, F.shR, C.body, 5); // shoulder muscle
          S.path('legs', [F.sh.concat([F.r[0]]), F.el.concat([F.r[1]]), F.wr.concat([F.r[2]])], C.body, 3, 4);
          if (F.raised) raisedHand(F.wr, F.dir, F.k); else paw(F.wr, F.hd, F.k, 3);
          var Hn = P.hind(s);
          S.piece(s < 0 ? 'hindL' : 'hindR');
          Hn.thigh.forEach(function (f) { if (f[0] === 'ell') S.ell('body', f[1], f[2], C.body, f[3]); else S.path('legs', f[1], C.body, f[2], 4); });
          if (Hn.meta) S.path('legs', Hn.meta.map(function (q) { return [q[0], Math.min(q[1], q[3] - 0.7), q[2], q[3]]; }), C.body, 2.5); // resting on the bed
          paw(Hn.paw, Hn.hd, Hn.k, 3);
        });

        // ---- head (built in head space: u forward, v up, w to the side, then pitched and placed) ----
        var H = P.head; if (H.rest) H = Object.assign({}, H, { y: H.y * hs }); // a head resting on the bed stays on it at any size
        var pc = Math.cos(deg(H.pitch)), ps = Math.sin(deg(H.pitch)), hz = H.z || 0, yawC = Math.cos(deg(H.yaw || 0)), yawS = Math.sin(deg(H.yaw || 0));
        function hp(u, v, w) {
          var x = (u * pc - v * ps) * hs, y = (u * ps + v * pc) * hs, z = w * hs;
          return [H.x + x * yawC - z * yawS, H.y + y, hz + x * yawS + z * yawC];
        }
        function hpr(u, v, w, r) { return hp(u, v, w).concat([r * hs]); }
        function hdir(u, v, w) { var a = hp(0, 0, 0), b = hp(u, v, w); return vnorm(vsub(b, a)); }
        S.piece('head');
        S.ell('head', hp(-1, 0.5, 0), [8.6 * hs, 6.6 * hs, 7 * hs], C.body, 4);                   // skull
        S.path('head', [hpr(3, -0.4, 0, 5.8), hpr(13, -1.6, 0, 4.4), hpr(22, -2.4, 0, 3.5)], C.body, 4); // long snout
        S.ell('head', hp(24.5, -2.2, 0), [3.4 * hs, 3.3 * hs, 3.9 * hs], C.body, 2.5);            // nose
        S.path('head', [hpr(0, 5.6, 0, 2.4), hpr(12, 2.6, 0, 2.1), hpr(23, 0.4, 0, 1.6)], C.body, 2); // nose ridge
        [-1, 1].forEach(function (s) {
          S.path('head', [hpr(-5, 5, s * 4, 2.6), hpr(1.5, 5.8, s * 5, 2.7), hpr(7, 3.8, s * 4.4, 1.6)], C.body, 1.8); // brow ridge
          S.ell('head', hp(0, -2.6, s * 4.6), [6.4 * hs, 4.4 * hs, 3.4 * hs], C.body, 2.5);                            // cheek
          S.path('head', [hpr(22, 0.2, s * 2.6, 1.5), hpr(25.5, -0.4, s * 2.2, 1.4)], C.body, 1);                         // nostril rim
          S.ell(null, hp(26.4, -0.6, s * 2), [1.2 * hs, 1 * hs, 0.9 * hs]).carve(0.6);                                   // nostril
        });
        S.piece('jaw', 'head');
        S.path('jaw', [hpr(-3, -4.6, 0, 5.2), hpr(9, -5.6, 0, 3.8), hpr(21, -5, 0, 2.7)], C.body, 2.5);
        S.paint('belly', hpr(8, -10, 0), [14 * hs, 4.2 * hs, 5.4 * hs], C.belly);
        if (P.throat) { // throat: carries the chin down to the chest at a printable slope
          S.piece('head');
          S.path('body', [hpr(14, -5.4, 0, 2.8), hpr(6, -6, 0, 4), hpr(-1, -5, 0, 4.8)].concat(P.throat), C.body, 4, 3);
          S.paint('belly', P.throat[0].slice(0, 3), [7, 16, 5.2], C.belly);
          S.piece('jaw', 'head');
        }
        [-1, 1].forEach(function (s) {
          S.path(null, [hpr(26, -3.4, s * 2.6, 0.7), hpr(13, -3.4, s * 4.3, 0.8), hpr(1, -2.2, s * 6.6, 0.9)], null, 0).carve(0.6); // mouth line
          S.piece('teeth', 'jaw');
          S.path('teeth', [hpr(20, -2.6, s * 3.5, 1.5), hpr(20.4, -6.2, s * 3.6, 0.55)], C.horn, 0.4); // fangs
          S.path('teeth', [hpr(15, -2.8, s * 4.1, 1.1), hpr(15.2, -5, s * 4.2, 0.5)], C.horn, 0.3);
          S.piece('head');
        });

        // ---- folded wings (asleep): laid along the back, fingers as ridges ----
        if (P.folded && p.wings > 0) [-1, 1].forEach(function (s) {
          var fz = s * 15 - 2, Wk = p.wings;
          S.piece(s < 0 ? 'wingL' : 'wingR');
          S.ell('wings', [-9, 19, fz - s * 1], [21 * Wk, 8.5, 4.6], C.membrane, 2.5);                                                // membrane folded on the flank
          S.path('wing bones', [[12, 21, fz - s * 2, 3], [4, 27, fz + s * 2.2, 2.6], [-6, 27.5, fz + s * 2.6, 2.2]], C.dark, 1.2);   // arm to the wrist
          [0, 1, 2].forEach(function (f) { S.path('wing bones', [[-6, 27.5, fz + s * 2.6, 1.9], [-16 - f * 2, 25 - f * 3.4, fz + s * (3.4 - f * 0.4), 1.6], [-30 * Wk - f * 2, 19 - f * 4.5, fz + s * (2.6 - f * 0.6), 1.3]], C.dark, 0.6); });
        });

        // ---- tail along the bed ----
        S.piece('tail');
        var T = P.tail;
        S.path('tail', T, C.body, 5, 3);

        // ---- belly plates: a pale stripe from chin to belly, banded by grooves, laid onto the real surface ----
        var near = [];
        function preField(x, y, z) {
          var m = 1e9;
          for (var oi = 0; oi < near.length; oi++) {
            var o = near[oi];
            if (x < o.lo[0] - 3 || x > o.hi[0] + 3 || y < o.lo[1] - 3 || y > o.hi[1] + 3 || z < o.lo[2] - 3 || z > o.hi[2] + 3) continue;
            var d = o.d(x, y, z); if (d < m) m = d;
          }
          return m;
        }
        function preHit(o, dir) { // first surface point along a ray, using only the forms whose boxes the ray passes
          var e2 = vadd(o, vmul(dir, 40)), lo = [0, 1, 2].map(function (c) { return Math.min(o[c], e2[c]) - 4; }), hi = [0, 1, 2].map(function (c) { return Math.max(o[c], e2[c]) + 4; });
          near = S.ops.filter(function (op) { return !op.carve && !op.paint && !op.relief && op.hi[0] > lo[0] && op.lo[0] < hi[0] && op.hi[1] > lo[1] && op.lo[1] < hi[1] && op.hi[2] > lo[2] && op.lo[2] < hi[2]; });
          var prev = preField(o[0], o[1], o[2]), st = 0.35, q = o;
          for (var k = 1; k < 115; k++) {
            q = vadd(o, vmul(dir, k * st)); var f = preField(q[0], q[1], q[2]);
            if (f < 0) { q = vadd(o, vmul(dir, (k - f / (f - prev)) * st)); break; }
            prev = f;
          }
          var e = 0.4;
          return { p: q, n: vnorm([preField(q[0] + e, q[1], q[2]) - preField(q[0] - e, q[1], q[2]), preField(q[0], q[1] + e, q[2]) - preField(q[0], q[1] - e, q[2]), preField(q[0], q[1], q[2] + e) - preField(q[0], q[1], q[2] - e)]) };
        }
        if (P.ventral) {
          S.piece('torso');
          var vg = [hp(13, -3.5, 0).concat([2.2]), hp(4, -4, 0).concat([3.2])].concat(P.ventral), vl = [], vc = [0];
          var vs = spline(vg.map(function (q) { return q.slice(0, 3); }), 10);
          var vw = spline(vg.map(function (q) { return [q[3], 0, 0]; }), 10);
          for (i = 1; i < vs.length; i++) vc.push(vc[i - 1] + vlen(vsub(vs[i], vs[i - 1])));
          var Ltot = vc[vc.length - 1], nextPaint = 0, nextGroove = 14 * hs, pitch = 5.4;
          for (i = 0; i < vs.length - 1; i++) {
            var tg = vnorm(vsub(vs[i + 1], vs[i])), fw = vnorm([-tg[1], tg[0], 0]), w0 = vw[i][0];
            if (vc[i] >= nextPaint) {
              var hv = preHit(vadd(vs[i], vmul(fw, 30)), vmul(fw, -1));
              S.paint('belly', vsub(hv.p, vmul(hv.n, 1.2)), [3.6, 3.6, w0], C.belly);
              nextPaint += 2.2;
            }
            if (vc[i] >= nextGroove && vc[i] < Ltot - 4) {
              var gp = [];
              [-1.25, -0.65, 0, 0.65, 1.25].forEach(function (tt) { var h2 = preHit(vadd(vadd(vs[i], [0, 0, tt * w0]), vmul(fw, 30)), vmul(fw, -1)); gp.push(vadd(h2.p, vmul(h2.n, 0.15)).concat([Math.abs(tt) > 1 ? 0.6 : 0.85])); });
              S.path(null, gp, null, 0, 4).carve(0.8);
              nextGroove += pitch;
            }
          }
        }

        // ---- sculpt it ----
        S.reach = P.reach || 1.1; // a little more generous than the kit default; the print check still passes
        S.smoothing = 12;
        S.run();

        // ---- horns, cheek spikes and the tail spade (clean shells) ----
        [-1, 1].forEach(function (s) {
          var hk = p.horns * hs * (sleep ? 0.6 : 1), hb = hp(-2.5, 4.4, s * 3.6), hb2 = hp(-5, 0.6, s * 5.4);
          function wv(b, x, y, z, r) { return [b[0] + x, b[1] + y, b[2] + s * z, r]; }
          S.shell(sc, 'horns', 'horns', 'b', sweep([wv(hb, 2, -2, 0, 3.6), wv(hb, -6 * hk, 6.5 * hk, 2 * hk, 3), wv(hb, -12.5 * hk, 12.5 * hk, 3.4 * hk, 2.2), wv(hb, -17 * hk, 19 * hk, 3.8 * hk, 1.4), wv(hb, -19 * hk, 25 * hk, 3.2 * hk, 0.5)], { seg: 18, per: 6, floor: null, rise: true }), C.horn, 'head');
          S.shell(sc, 'horns', 'horns', 'b', sweep([wv(hb2, 1.5, -1.5, 0, 2.3), wv(hb2, -5 * hk, 5.5 * hk, 2.6 * hk, 1.7), wv(hb2, -9 * hk, 11 * hk, 4.2 * hk, 1.1), wv(hb2, -10 * hk, 15 * hk, 4.4 * hk, 0.45)], { seg: 14, per: 6, floor: null, rise: true }), C.horn, 'head');
          S.shell(sc, 'horns', 'horns', 'b', sweep([hpr(-2, 4.6, s * 3.8, 3.4), hpr(-9, 8 + 3 * hk, s * (5.4 + hk), 2.8), hpr(-14 - 2 * hk, 13 + 8 * hk, s * (6 + 1.6 * hk), 1.9), hpr(-15 - 4 * hk, 18 + 13 * hk, s * (5 + 1.4 * hk), 0.5)], { seg: 18, per: 7, floor: null, rise: true }), C.horn, 'head');
          S.shell(sc, 'horns', 'horns', 'b', sweep([hpr(-4, 1, s * 5.6, 2.1), hpr(-10, 3 + 2 * hk, s * (8 + hk), 1.5), hpr(-13 - hk, 7 + 5 * hk, s * (9.5 + hk), 0.4)], { seg: 14, per: 6, floor: null, rise: true }), C.horn, 'head');
          if (!sleep) for (t = H.y < 24 ? 1 : 0; t < 2; t++) S.shell(sc, 'horns', 'spines', 'b', sweep([hpr(-1 - t * 3, -4.4 + t * 1.5, s * 6.2, 1.6), hpr(-6 - t * 3, -2.6 + t * 1.8, s * 8.6, 1.1), hpr(-9 - t * 3, 0.6 + t * 1.6, s * 9.2, 0.35)], { seg: 12, per: 5, floor: null, rise: true }), C.dark, 'head');
        });
        if (!sleep) [-1, 1].forEach(function (s) { // elbow spurs
          var F = P.fore(s), el = F.el;
          S.shell(sc, s < 0 ? 'armL' : 'armR', 'spines', 'b', sweep([[el[0] - F.r[1] * 0.4, el[1], el[2], 1.9], [el[0] - F.r[1] - 3, el[1] + 3, el[2] + s * 0.6, 1.2], [el[0] - F.r[1] - 5, el[1] + 6.5, el[2] + s * 0.8, 0.4]], { seg: 12, per: 4, floor: null, rise: true }), C.dark, 'torso');
        });
        var te = T[T.length - 1], tp = T[T.length - 2], hd = Math.atan2(-(te[2] - tp[2]), te[0] - tp[0]), sp = 9 * p.spade;
        S.shell(sc, 'tail', 'spade', 'b', flatSlab([[-3, 0], [sp * 0.25, sp * 0.5], [sp * 0.2, sp * 0.62], [sp * 1.15, 0], [sp * 0.2, -sp * 0.62], [sp * 0.25, -sp * 0.5]], [te[0] - Math.cos(hd) * 1.5, 0, te[2] + Math.sin(hd) * 1.5], hd, 2.6, 0.9), C.dark, 'tail');

        // ---- dorsal blades: fired onto the finished back along the spine line ----
        var n = Math.round(p.spines), line = spline(P.spine.map(function (q) { return q.slice(0, 3); }), 8), cum = [0];
        for (i = 1; i < line.length; i++) cum.push(cum[i - 1] + vlen(vsub(line[i], line[i - 1])));
        for (i = 0; i < n; i++) {
          var u = n > 1 ? i / (n - 1) : 0.3, L0 = u * cum[cum.length - 1], j = 1;
          while (j < cum.length - 1 && cum[j] < L0) j++;
          var a0 = line[j - 1], a1 = line[j], f = (L0 - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1), g0 = vadd(a0, vmul(vsub(a1, a0), f));
          var tan = vnorm(vsub(a1, a0)), up = P.spineUp ? P.spineUp(g0, u) : [0, 1, 0];
          var out = vnorm(vsub(up, vmul(tan, vdot(up, tan)))), hit = S.hit(vadd(g0, vmul(out, 40)), vmul(out, -1));
          var hgt = p.spineSize * (P.spineH ? P.spineH(u) : lerp(7, 4, u)), wid = hgt * 0.9 + 2;
          var dir = [tan[0], 0, tan[2]]; if (vlen(dir) < 0.2) dir = [1, 0, 0]; dir = vnorm(dir);
          var back = vmul(tan, -1), D = vnorm(vadd(out, vmul(back, 0.55)));
          if (D[1] < 0.8) { var hz2 = Math.hypot(D[0], D[2]) || 1, k2 = Math.sqrt(1 - 0.8 * 0.8) / hz2; D = [D[0] * k2, 0.8, D[2] * k2]; }
          var base = vsub(hit.p, vmul(out, 2.6)), tipP = vadd(hit.p, vmul(D, hgt));
          var fr = vsub(base, vmul(back, wid * 0.5)), bk = vadd(base, vmul(back, wid * 0.5));
          var midF = vadd(vadd(vmul(vadd(fr, tipP), 0.5), vmul(out, hgt * 0.12)), vmul(back, -wid * 0.1)), midB = vsub(vmul(vadd(bk, tipP), 0.5), vmul(out, hgt * 0.08));
          var pr = function (q) { return [vdot(vsub(q, hit.p), dir), q[1]]; };
          var poly = [pr(fr), pr(midF), pr(tipP), pr(midB), pr(bk)];
          S.shell(sc, 'spines', 'spines', 'b', vslab(poly, [hit.p[0], 0, hit.p[2]], dir, 2.2, 0.8), C.dark, 'torso');
        }

        // ---- wings: arm, wrist claw and four fingers over a scalloped membrane, in a vertical plane flaring back ----
        if (p.wings > 0) [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'wingL' : 'wingR', Wg = P.wing, W = p.wings * Wg.k;
          if (sleep) return; // folded wings are sculpted (see below)
          var a = deg(Wg.a), d = [-Math.cos(a), 0, s * Math.sin(a)], R = [Wg.x, Wg.y, s * Wg.z];
          function pt(uu, vv) { return [R[0] + d[0] * uu, R[1] + vv, R[2] + d[2] * uu]; }
          var spread = p.spread;
          var wr = [8 * W, 52 * W], tips = [[24 * W, lerp(70, 84, spread) * W], [lerp(40, 46, spread) * W, lerp(62, 74, spread) * W], [lerp(50, 58, spread) * W, lerp(46, 52, spread) * W], [lerp(42, 50, spread) * W, lerp(30, 34, spread) * W]];
          var poly = [[-6, -14], [-2, 6], wr.slice(), tips[0]];
          for (var q = 0; q < 3; q++) { // scallops: pulled toward the wrist on the top, straight in toward the body lower down
            var A = tips[q], B = tips[q + 1], M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], gap = Math.hypot(A[0] - B[0], A[1] - B[1]), N2;
            if (q === 0) N2 = [lerp(M[0], wr[0], 0.3), lerp(M[1], wr[1], 0.3)];
            else N2 = [M[0] - gap * (q === 1 ? 0.24 : 0.2), M[1] + gap * 0.02];
            poly.push([lerp(A[0], N2[0], 0.5) + 0.6, lerp(A[1], N2[1], 0.5) + 0.4], N2, [lerp(N2[0], B[0], 0.5) + 0.6, lerp(N2[1], B[1], 0.5) + 0.4], B);
          }
          var t4 = tips[3]; // trailing edge back to the body, climbing at about 50 degrees
          poly.push([t4[0] * 0.62, t4[1] * 0.62 - 2], [t4[0] * 0.3, t4[1] * 0.3 - 4], [4, -8]);
          later.push([id, 'wings', vslab(poly, [R[0], R[1], R[2]], d, 2.4, 0.8), C.membrane]);
          later.push([id, 'wing bones', sweep([pt(-4, -6).concat([3.8]), pt(-1, 14 * W).concat([3.4]), pt(wr[0] * 0.75, wr[1] * 0.7).concat([2.9]), pt(wr[0], wr[1]).concat([2.6])], { seg: 14, per: 6, floor: null }), C.dark]);
          later.push([id, 'wing bones', sweep([pt(wr[0] - 1.5, wr[1] - 1).concat([2.4]), pt(wr[0] - 3, wr[1] + 4).concat([1.6]), pt(wr[0] - 4.5, wr[1] + 8).concat([0.5])], { seg: 12, per: 4, floor: null }), C.horn]); // thumb claw
          tips.forEach(function (tp2, ti) {
            var mid = [lerp(wr[0], tp2[0], 0.5) + (ti === 0 ? -1.5 : 1.2), lerp(wr[1], tp2[1], 0.5) + (ti === 0 ? 1.5 : 1.6)];
            var fr0 = ti === 0 || ti === 3 ? [2.2, 1.6] : [1.7, 1.3]; // the shallow middle fingers stay close to the membrane so their undersides print
            later.push([id, 'wing bones', sweep([pt(wr[0], wr[1]).concat([fr0[0]]), pt(mid[0], mid[1]).concat([fr0[1]]), pt(lerp(wr[0], tp2[0], 0.93), lerp(wr[1], tp2[1], 0.93)).concat([0.9])], { seg: 12, per: 6, floor: null }), C.dark]); // the rounded end stays inside the membrane tip
          });
        });
        later.forEach(function (it) { S.shell(sc, it[0], it[1], 'b', it[2], it[3], it[4]); });

        // ---- eyes ----
        [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'eyeL' : 'eyeR', o = hp(4, 2.2, s * 24), dir = hdir(0, 0, -s);
          if (vlen(vsub(S.hit(o, dir).p, o)) > 30) return; // the head was moved or deleted in the Sculpt tab: no eye in mid-air
          if (sleep) {
            var e = S.face(id, o, dir, 'head');
            if (e) { S.addon(id, e.p, 3); sc.add('eyes', 'b', sweep([[e.p[0] - 3, e.p[1] + 0.6, e.p[2], 0.7], [e.p[0], e.p[1] - 0.4, e.p[2] + s * 0.3, 0.8], [e.p[0] + 3, e.p[1] + 0.6, e.p[2], 0.7]], { seg: 8, per: 4, floor: null }), '#2e1a5e'); }
          } else reptileEye(sc, S, id, s < 0 ? 'pupilL' : 'pupilR', o, dir, 'head', 2.2 * hs, C.eye, 0.85);
        });
        if (p.gem > 0 && P.gem) { var gm = S.face('gem', P.gem.o, P.gem.d, 'torso'); if (gm) { sc.add('gem', 'b', dome(gm.p, gm.n, 4.4 * gm.k, { angle: 40, seg: 6 }), C.gem); S.addon('gem', gm.p, 4.4 * gm.k); } }
        S.addTo(sc);
        return finishSculpt(sc, p.size, S);
      }

      // Poses: each returns the key joints of the skeleton. x is forward, y up, z to the side (s = -1 left, 1 right).
      function dragonTail(p, start, straight, curled) {
        var L = p.tailLen, c = p.curl;
        return straight.map(function (a, k) {
          var b = curled[k], x = lerp(a[0], b[0], c), z = lerp(a[1], b[1], c), r = a[2];
          return [start[0] + (x - start[0]) * L, Math.max(r * 0.8, start[1] * Math.pow(0.55, k)), start[2] + z * L, r];
        });
      }
      var DRAGON_POSES = [
        function (p) { // 0 sitting up like a statue: forelegs planted, haunches folded, wings raised
          return {
            torso: [['ell', [-12, 19, 0], [19, 19, 18.5], 6], ['path', [[-9, 26, 0, 15.5], [-1, 40, 0, 14], [6, 52, 0, 12]], 8], ['ell', [9, 44, 0], [11.5, 13, 12], 6], ['ell', [-12, 1.5, 0], [21, 5, 19], 6]],
            neck: [[8, 54, 0, 10.6], [13, 64, 0, 9.2], [15, 75, 0, 8.2], [16, 85, 0, 7.6], [17, 92, 0, 7.2]],
            throat: [[24, 80, 0, 5.6], [21, 66, 0, 7]],
            ventral: [[14, 88, 0, 4.2], [18, 78, 0, 5], [17, 66, 0, 6], [12, 52, 0, 7], [8, 38, 0, 7.5], [2, 26, 0, 7.5], [-2, 16, 0, 6.5]],
            fore: function (s) { return { sh: [11, 47, s * 10.5], shR: [8, 10, 6.5], el: [6, 28, s * 13], wr: [15, 7, s * 13], r: [6.4, 5, 4.2], hd: -s * 0.08, k: 1.05 }; },
            hind: function (s) { return { thigh: [['ell', [-10, 19, s * 15], [15, 14, 8.5], 5], ['path', [[-18, 28, s * 12, 9.5], [-5, 20, s * 16.5, 9], [4, 12, s * 17.5, 6]], 4]], meta: [[-22, 5, s * 17.5, 4.6], [-9, 4.2, s * 19, 4.2], [1, 3.8, s * 19.5, 3.8]], paw: [2, 0, s * 20], hd: -s * 0.14, k: 1.1 }; },
            head: { x: 20, y: 98, pitch: 22 },
            tail: dragonTail(p, [-25, 9, 0], [[-25, 0, 10.5], [-40, 2, 8], [-56, 4, 6.2], [-72, 5, 4.8], [-88, 5, 3.6], [-102, 4, 2.8], [-114, 3, 2.2]], [[-25, 0, 10.5], [-39, 4, 8], [-45, 18, 6.2], [-35, 32, 4.8], [-15, 36, 3.6], [5, 32, 2.8], [19, 26, 2.2]]),
            spine: [[14, 106, 0], [11, 94, 0], [9, 82, 0], [5, 68, 0], [-2, 58, 0], [-14, 44, 0], [-26, 30, 0], [-34, 16, 0]],
            spineUp: function (g0, u) { return u < 0.15 ? [-0.4, 1, 0] : [-1, 0.25, 0]; },
            spineH: function (u) { return u < 0.12 ? 5 : u < 0.6 ? lerp(6, 9, (u - 0.12) / 0.48) : lerp(9, 6, (u - 0.6) / 0.4); },
            wing: { x: -2, y: 60, z: 7, a: 32, k: 1 },
            gem: { o: [80, 52, 0], d: [-1, 0, 0] }
          };
        },
        function (p) { // 1 prowling: a low hunting crouch, shoulders up, chin just over the bed
          return {
            torso: [['ell', [-6, 13, 0], [28, 17, 16.5], 6], ['ell', [14, 17, 0], [13, 16, 13.5], 6], ['ell', [-24, 16.5, 0], [15, 19.5, 15.5], 5], ['ell', [-16, 1.5, 0], [32, 5, 19], 6]],
            neck: [[22, 23, 0, 10.5], [32, 18, 0, 9], [40, 13, 0, 8], [46, 10, 0, 7.4]],
            ventral: null,
            fore: function (s) { var st = s > 0 ? 6 : -1; return { sh: [16, 32, s * 11], shR: [8, 10, 6.5], el: [8, 4.8, s * 15.5], wr: [24 + st, 4, s * 15], r: [6.6, 5.2, 4.2], hd: -s * 0.12, k: 1.05 }; },
            hind: function (s) { var st = s > 0 ? -4 : 3; return { thigh: [['ell', [-24, 16, s * 14], [15, 17.5, 8.5], 5], ['path', [[-28, 28, s * 12, 9.5], [-16 + st, 18, s * 16, 8], [-12 + st, 10, s * 17, 5.5]], 4]], meta: [[-34, 5, s * 17, 4.6], [-20 + st, 4.2, s * 17.5, 4.2], [-10 + st, 3.8, s * 17.5, 3.8]], paw: [-9 + st, 0, s * 17.5], hd: -s * 0.1, k: 1.1 }; },
            head: { x: 51, y: 9.2, pitch: -6, rest: true },
            tail: dragonTail(p, [-36, 10, 0], [[-36, 0, 11], [-52, 2, 8.4], [-68, 5, 6.4], [-84, 8, 4.9], [-100, 9, 3.7], [-114, 9, 2.8], [-126, 8, 2.2]], [[-36, 0, 11], [-52, 4, 8.4], [-66, 14, 6.4], [-72, 28, 4.9], [-66, 42, 3.7], [-52, 48, 2.8], [-40, 46, 2.2]]),
            spine: [[47, 20, 0], [40, 23, 0], [30, 29, 0], [16, 37, 0], [0, 33, 0], [-18, 34, 0], [-34, 26, 0], [-46, 14, 0]],
            spineUp: function (g0, u) { return u < 0.15 ? [-0.3, 1, 0] : [0, 1, 0]; },
            spineH: function (u) { return u < 0.12 ? 5 : u < 0.55 ? lerp(6, 9, (u - 0.12) / 0.43) : lerp(9, 6, (u - 0.55) / 0.45); },
            wing: { x: 6, y: 33, z: 8, a: 40, k: 0.85 },
            gem: null
          };
        },
        function (p) { // 2 rearing up on its hind legs, claws raised, head high
          return {
            torso: [['ell', [-8, 22, 0], [19, 21, 18], 6], ['path', [[-6, 30, 0, 15.5], [-2, 50, 0, 13.6], [3, 68, 0, 11.6]], 8], ['ell', [4, 60, 0], [11.5, 14, 12], 6], ['ell', [-6, 1.5, 0], [22, 5, 19], 6], ['ell', [6, 10, 0], [9, 12, 10], 6]],
            neck: [[4, 74, 0, 10], [2, 86, 0, 8.2], [6, 98, 0, 7.4], [12, 106, 0, 7], [16, 109, 0, 6.8]],
            ventral: [[10, 102, 0, 4.2], [8, 90, 0, 5], [6, 78, 0, 6], [5, 64, 0, 7], [1, 48, 0, 7.5], [-3, 34, 0, 7.5], [-6, 22, 0, 6.5]],
            fore: function (s) { return { sh: [5, 66, s * 10.5], shR: [7.5, 9, 6], el: [11, 55, s * 11.5], wr: [20, 69, s * 13], r: [5.6, 4.4, 3.6], raised: true, dir: [0.55, 0.83, 0], k: 1 }; },
            hind: function (s) { return { thigh: [['ell', [-6, 23, s * 14], [15, 16, 8.5], 5], ['path', [[-12, 32, s * 12, 9.5], [0, 22, s * 16, 8.5], [6, 12, s * 16.5, 5.6]], 4]], meta: [[-14, 5, s * 17, 4.6], [-2, 4.2, s * 18, 4.2], [8, 3.8, s * 18.5, 3.8]], paw: [9, 0, s * 18.5], hd: -s * 0.12, k: 1.15 }; },
            head: { x: 18, y: 113, pitch: 24 },
            throat: [[22, 95, 0, 5.6], [19, 81, 0, 7]],
            tail: dragonTail(p, [-24, 10, 0], [[-24, 0, 11], [-40, 2, 8.4], [-56, 4, 6.4], [-72, 5, 4.9], [-88, 5, 3.7], [-102, 4, 2.8], [-114, 3, 2.2]], [[-24, 0, 11], [-39, 4, 8.4], [-45, 18, 6.4], [-35, 32, 4.9], [-15, 36, 3.7], [5, 32, 2.8], [19, 26, 2.2]]),
            spine: [[12, 118, 0], [6, 108, 0], [0, 96, 0], [-1, 82, 0], [-6, 68, 0], [-12, 52, 0], [-22, 32, 0], [-32, 16, 0]],
            spineUp: function (g0, u) { return u < 0.12 ? [-0.6, 1, 0] : [-1, 0.25, 0]; },
            spineH: function (u) { return u < 0.12 ? 5 : u < 0.6 ? lerp(6, 9, (u - 0.12) / 0.48) : lerp(9, 6, (u - 0.6) / 0.4); },
            wing: { x: -5, y: 74, z: 7, a: 28, k: 1.12 },
            gem: { o: [80, 58, 0], d: [-1, 0, 0] }
          };
        },
        function (p) { // 3 asleep, curled round with the tail wrapped in front and chin on the bed
          return {
            torso: [['ell', [-6, 12, -2], [28, 14.2, 20], 6], ['ell', [-20, 13, 2], [14, 15.2, 15], 5], ['ell', [-8, 1.5, -1], [33, 5, 25], 6]],
            neck: [[12, 14, 8, 11], [24, 10, 14, 9], [34, 8, 12, 7.6]],
            ventral: null,
            fore: function (s) { return { sh: [14, 16, s * 10 + 4], shR: [7, 7, 6], el: [21, 4.4, s * 12 + 6], wr: [32, 3.4, s * 7 + 18], r: [5.6, 4.6, 3.8], hd: 0.25, k: 0.85 }; },
            hind: function (s) { return { thigh: [['ell', [-20, 10, s * 15 - 1], [14, 12, 8], 4]], meta: [[-28, 4.4, s * 17, 4.2], [-12, 3.8, s * 19 - 1, 3.8]], paw: [-8, 0, s * 19 - 1], hd: s > 0 ? -0.3 : 0.3, k: 0.95 }; },
            head: { x: 42, y: 8.4, z: 9, pitch: 0, yaw: -12 },
            tail: [[-32, 8, -4, 10], [-38, 5.4, -18, 7.4], [-28, 4, -32, 5.6], [-8, 3.2, -36, 4.2], [14, 2.6, -32, 3.2], [30, 2, -20, 2.4], [40, 1.8, -8, 2]],
            spine: [[18, 20, 10], [6, 27, 4], [-8, 28, 0], [-22, 26, -2], [-32, 18, -6], [-38, 10, -16]],
            spineUp: null,
            spineH: function (u) { return lerp(6.5, 4, u); },
            wing: { k: 1 },
            folded: true,
            gem: null
          };
        }
      ];

      var DRAGON_PARAMS = [
        { group: 'Dragon', key: 'pose', label: 'Pose', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['Sitting', 'Prowling', 'Rearing', 'Asleep'] },
        { group: 'Dragon', key: 'size', label: 'Overall size', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Dragon', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Dragon', key: 'horns', label: 'Horn length', unit: '×', min: 0.4, max: 1.5, step: 0.05, value: 1 },
        { group: 'Dragon', key: 'gem', label: 'Chest gem', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Off', 'On'] },
        { group: 'Wings', key: 'wings', label: 'Wing size (0 = none)', unit: '×', min: 0, max: 1.2, step: 0.05, value: 1 },
        { group: 'Wings', key: 'spread', label: 'Wing spread', unit: '×', min: 0, max: 1, step: 0.05, value: 0.5 },
        { group: 'Spine & tail', key: 'spines', label: 'Back blades', unit: '', min: 0, max: 22, step: 1, value: 15, slider: true },
        { group: 'Spine & tail', key: 'spineSize', label: 'Blade size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'tailLen', label: 'Tail length', unit: '×', min: 0.75, max: 1.2, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'curl', label: 'Tail curl (straight ↔ wrapped)', unit: '×', min: 0, max: 1, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'spade', label: 'Tail spade', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-077',
        category: 'ANIMALS // FANTASY',
        title: 'Dragon Maker',
        fileName: 'Dragon',
        defaultColor: '#a78bfa',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly plates', legs: 'Legs', feet: 'Feet', claws: 'Claws', head: 'Head', jaw: 'Jaw', teeth: 'Teeth', eyes: 'Eyes', pupils: 'Pupils', horns: 'Horns', spines: 'Back blades', tail: 'Tail', spade: 'Tail spade', wings: 'Wing membrane', 'wing bones': 'Wing bones', gem: 'Chest gem' },
        parameters: DRAGON_PARAMS,
        presets: makePresets(DRAGON_PARAMS, [
          ['Default dragon', {}],
          ['Baby dragon', { headSize: 1.25, wings: 0.7, spines: 9, spineSize: 0.7, tailLen: 0.8, horns: 0.4, size: 0.8 }],
          ['Spiky wyvern', { spines: 22, spineSize: 1.35, horns: 1.5, wings: 1.2, spread: 1 }],
          ['Wingless drake', { wings: 0, headSize: 1.15, horns: 1.25, spines: 18 }],
          ['Jewel dragon', { gem: 1, horns: 0.8, spread: 0.2 }],
          ['Prowling dragon', { pose: 1, horns: 1.2, curl: 0.4 }],
          ['Rearing dragon', { pose: 2, spines: 17, horns: 1.3, spread: 1 }],
          ['Sleeping dragon', { pose: 3, spines: 11, curl: 1 }]
        ]),
        sculpt: sculptModule([
          { id: 'head', label: 'Head', section: 'Head' }, { id: 'horns', label: 'Horns', section: 'Head', parent: 'head' }, { id: 'jaw', label: 'Jaw', section: 'Head', parent: 'head' }, { id: 'teeth', label: 'Teeth', section: 'Head', parent: 'jaw' }, { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'gem', label: 'Chest gem', section: 'Body' }, { id: 'spines', label: 'Back blades', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' }, { id: 'wingL', label: 'Left wing', section: 'Body' }, { id: 'wingR', label: 'Right wing', section: 'Body' },
          { id: 'armL', label: 'Left arm', section: 'Limbs' }, { id: 'armR', label: 'Right arm', section: 'Limbs' }, { id: 'hindL', label: 'Left leg', section: 'Limbs' }, { id: 'hindR', label: 'Right leg', section: 'Limbs' }
        ]),
        build: buildDragon
      };
