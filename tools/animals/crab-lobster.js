      // -----------------------------------------------------------------------
      // Crab & Lobster (slot 132): a claw-forward crustacean. The claws rest on the bed and each pincer hinges on a post,
      // printed in place. Concatenated after tools/flexi/flexi-lib.js and tools/animals/animal-kit.js by build.mjs.
      // -----------------------------------------------------------------------

      // ---- 2D helpers: outlines in a (p, q) plane that T() maps onto the bed ----
      function clInset(poly, ins) { // moves every vertex of a counter-clockwise outline inward by ins (mitred, limited)
        var n = poly.length, out = [], i;
        for (i = 0; i < n; i++) {
          var a = poly[(i + n - 1) % n], b = poly[i], c = poly[(i + 1) % n];
          var e1 = [b[0] - a[0], b[1] - a[1]], e2 = [c[0] - b[0], c[1] - b[1]];
          var l1 = Math.hypot(e1[0], e1[1]) || 1, l2 = Math.hypot(e2[0], e2[1]) || 1;
          var n1 = [-e1[1] / l1, e1[0] / l1], n2 = [-e2[1] / l2, e2[0] / l2];
          var bx = n1[0] + n2[0], by = n1[1] + n2[1], k = 1 + n1[0] * n2[0] + n1[1] * n2[1];
          var ox = (bx / Math.max(k, 0.3)) * ins, oy = (by / Math.max(k, 0.3)) * ins, ol = Math.hypot(ox, oy);
          if (ol > ins * 2.2) { ox *= (ins * 2.2) / ol; oy *= (ins * 2.2) / ol; }
          out.push([b[0] + ox, b[1] + oy]);
        }
        return out;
      }
      // Extruded outline from height y0 to y1 with a rounded top edge of radius ch. T(p, q) -> [x, z].
      function clSlab(poly, T, y0, y1, ch) {
        if (polyArea(poly) < 0) poly = poly.slice().reverse();
        var n = poly.length, layers = [[y0, 0], [y1 - ch, 0]], k, i, j;
        for (k = 1; k <= 3; k++) { var an = (k / 3) * (Math.PI / 2); layers.push([y1 - ch + ch * Math.sin(an), ch * (1 - Math.cos(an))]); }
        var rings = layers.map(function (L) { return L[1] > 0 ? clInset(poly, L[1]) : poly; });
        var pos = [], m = layers.length, idx = [];
        layers.forEach(function (L, li) { rings[li].forEach(function (q) { var w = T(q); pos.push(w[0], L[0], w[1]); }); });
        var bot = earClip(poly), top = earClip(rings[m - 1]);
        for (j = 0; j < bot.length; j += 3) idx.push(bot[j + 2], bot[j + 1], bot[j]);
        for (j = 0; j < top.length; j += 3) idx.push((m - 1) * n + top[j], (m - 1) * n + top[j + 1], (m - 1) * n + top[j + 2]);
        for (i = 0; i < m - 1; i++) for (j = 0; j < n; j++) {
          var nj = (j + 1) % n, a0 = i * n + j, a1 = i * n + nj, b0 = (i + 1) * n + j, b1 = (i + 1) * n + nj;
          idx.push(a0, a1, b1, a0, b1, b0);
        }
        return expandTris(new Float32Array(pos), idx);
      }
      // Curved band (finger, arm plate): quadratic Bezier centre line c0-c1-c2, width w0 at the root to w1 at the round tip.
      function clBand(c0, c1, c2, w0, w1, t0, n) {
        var L = [], R = [], i, last = null;
        for (i = 0; i <= n; i++) {
          var t = t0 + (1 - t0) * (i / n), u = 1 - t;
          var P = [u * u * c0[0] + 2 * u * t * c1[0] + t * t * c2[0], u * u * c0[1] + 2 * u * t * c1[1] + t * t * c2[1]];
          var d = [2 * u * (c1[0] - c0[0]) + 2 * t * (c2[0] - c1[0]), 2 * u * (c1[1] - c0[1]) + 2 * t * (c2[1] - c1[1])];
          var dl = Math.hypot(d[0], d[1]) || 1;
          d = [d[0] / dl, d[1] / dl];
          var nl = [-d[1], d[0]], hw = 0.5 * lerp(w0, w1, Math.pow(t, 0.8));
          L.push([P[0] + nl[0] * hw, P[1] + nl[1] * hw]);
          R.push([P[0] - nl[0] * hw, P[1] - nl[1] * hw]);
          last = { P: P, d: d, nl: nl, hw: hw };
        }
        var cap = [];
        for (i = 1; i <= 3; i++) {
          var ph = (i * Math.PI) / 4;
          cap.push([last.P[0] + last.hw * (-last.nl[0] * Math.cos(ph) + last.d[0] * Math.sin(ph)), last.P[1] + last.hw * (-last.nl[1] * Math.cos(ph) + last.d[1] * Math.sin(ph))]);
        }
        return R.concat(cap, L.reverse());
      }
      function clHull(pts) { // convex hull, counter-clockwise (monotone chain)
        var p = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }), lo = [], up = [], i;
        function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
        for (i = 0; i < p.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p[i]) <= 0) lo.pop(); lo.push(p[i]); }
        for (i = p.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p[i]) <= 0) up.pop(); up.push(p[i]); }
        lo.pop(); up.pop();
        return lo.concat(up);
      }
      function clCircle(c, r, n) {
        var o = [];
        for (var i = 0; i < n; i++) o.push([c[0] + r * Math.cos((i / n) * TAU), c[1] + r * Math.sin((i / n) * TAU)]);
        return o;
      }
      function clRot(poly, h, phi) {
        var c = Math.cos(phi), s = Math.sin(phi);
        return poly.map(function (q) { var dx = q[0] - h[0], dy = q[1] - h[1]; return [h[0] + dx * c - dy * s, h[1] + dx * s + dy * c]; });
      }
      // Closed ring of revolution about a vertical axis through c (hub of the pincer). loop is [[r, y], ...] (a closed profile).
      function clRing(c, loop, seg) {
        var pos = [], idx = [], n = loop.length, i, j;
        for (j = 0; j < seg; j++) {
          var th = (j / seg) * TAU, cs = Math.cos(th), sn = Math.sin(th);
          for (i = 0; i < n; i++) pos.push(c[0] + loop[i][0] * cs, loop[i][1], c[1] + loop[i][0] * sn);
        }
        for (j = 0; j < seg; j++) for (i = 0; i < n; i++) {
          var nj = (j + 1) % seg, ni = (i + 1) % n, a = j * n + i, b = j * n + ni, c2 = nj * n + ni, d = nj * n + i;
          idx.push(a, b, c2, a, c2, d);
        }
        return expandTris(new Float32Array(pos), idx);
      }

      // ---- Carapace: a flat-bellied superellipsoid with an optional surface texture ----
      function CarDef(a, w, h, cut, sqz) {
        this.a = a; this.w = w; this.h = h; this.cy = h * cut; this.ex = 2 / sqz;
      }
      CarDef.prototype.rho = function (t) { return Math.pow(Math.sin(t), this.ex); };
      CarDef.prototype.xOf = function (t) { var c = Math.cos(t); return -this.a * (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), this.ex); };
      CarDef.prototype.tOfX = function (x) {
        var u = clamp(Math.abs(x) / this.a, 0, 0.999), c = Math.pow(u, 1 / this.ex);
        return Math.acos(x >= 0 ? -c : c);
      };
      // Point on the smooth surface at ring t (0 rear .. PI front) and cross-section angle th (0 = side, 90 = top).
      CarDef.prototype.pt = function (t, th) {
        var r = this.rho(t), cs = Math.cos(th), sn = Math.sin(th);
        var y = this.cy + this.h * r * sn, z = this.w * r * cs;
        return [this.xOf(t), Math.max(y, 0), z];
      };
      CarDef.prototype.normal = function (p) {
        var nx = p[0] / (this.a * this.a), ny = (p[1] - this.cy) / (this.h * this.h), nz = p[2] / (this.w * this.w);
        return vnorm([nx, ny, nz]);
      };
      CarDef.prototype.mesh = function (disp, R, S) {
        var pos = [], idx = [], i, j, self = this, a = this.a, cy = this.cy, h = this.h, w = this.w;
        pos.push(-a, cy, 0);
        var rings = [];
        for (i = 1; i < R; i++) {
          var t = (Math.PI * i) / R, r = this.rho(t), x = this.xOf(t), sn = h * r > 0 ? cy / (h * r) : 2, full = sn >= 0.995;
          var phi = full ? 0 : Math.asin(sn), base = pos.length / 3;
          for (j = 0; j < S; j++) {
            var th = full ? (j / S) * TAU : -phi + (j / (S - 1)) * (Math.PI + 2 * phi);
            var y = cy + h * r * Math.sin(th), z = w * r * Math.cos(th);
            if (!full) y = Math.max(y, 0);
            if (disp && y > 1.2) {
              var nv = self.normal([x, y, z]), d = disp(x, y, z) * smooth((y - 1.2) / 3);
              pos.push(x + nv[0] * d, Math.max(y + nv[1] * d, 0), z + nv[2] * d);
            } else pos.push(x, y, z);
          }
          rings.push(base);
        }
        pos.push(a, cy, 0);
        var top = pos.length / 3 - 1;
        for (j = 0; j < S; j++) idx.push(0, rings[0] + (j + 1) % S, rings[0] + j);
        for (i = 0; i < rings.length - 1; i++) for (j = 0; j < S; j++) {
          var nj = (j + 1) % S;
          idx.push(rings[i] + j, rings[i] + nj, rings[i + 1] + nj, rings[i] + j, rings[i + 1] + nj, rings[i + 1] + j);
        }
        var lr = rings[rings.length - 1];
        for (j = 0; j < S; j++) idx.push(lr + j, lr + (j + 1) % S, top);
        return expandTris(new Float32Array(pos), idx);
      };

      // Shell textures: height offset in mm (positive = out) at a point of the carapace.
      function clHexNear(x, z, sz) { // nearest and second nearest hex centre distances for a hex grid with centre spacing sz
        var size = sz / Math.sqrt(3), q = ((Math.sqrt(3) / 3) * x - z / 3) / size, r = ((2 / 3) * z) / size;
        var cx = q, cz = r, cy2 = -q - r, rq = Math.round(cx), rr = Math.round(cz), rs = Math.round(cy2);
        var dq = Math.abs(rq - cx), dr = Math.abs(rr - cz), ds = Math.abs(rs - cy2);
        if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs;
        var best = 1e9, second = 1e9, di, dj;
        for (di = -1; di <= 1; di++) for (dj = -1; dj <= 1; dj++) {
          if (di + dj > 1 || di + dj < -1) continue;
          var qq = rq + di, rr2 = rr + dj, px = size * (Math.sqrt(3) * qq + (Math.sqrt(3) / 2) * rr2), pz = size * 1.5 * rr2;
          var dd = Math.hypot(x - px, z - pz);
          if (dd < best) { second = best; best = dd; } else if (dd < second) second = dd;
        }
        return [best, second];
      }
      function clTexture(kind, depth, car) {
        var a = car.a, h = car.h;
        if (kind === 1) { // ribs radiating from the middle of the shell
          var nrib = 12;
          return function (x, y, z) {
            var rr = Math.hypot(x + a * 0.05, z * (a / car.w) * 1.15), fade = smooth((rr - 6) / 8), fy = smooth((y - 0.3 * h) / (0.25 * h) + 0.4);
            var th = Math.atan2(z * (a / car.w), x + a * 0.05);
            return depth * (0.5 * Math.cos(nrib * th) - 0.5) * fade * Math.min(1, fy + 0.35);
          };
        }
        if (kind === 2) { // rounded bumps on a hex grid
          return function (x, y, z) {
            var hn = clHexNear(x, z, 6.4), s = 2.0, wgt = smooth((y - 0.3 * car.h) / (0.25 * car.h));
            return depth * 1.1 * Math.exp(-(hn[0] * hn[0]) / (s * s)) * wgt - 0;
          };
        }
        if (kind === 3) { // plates separated by grooves
          return function (x, y, z) {
            var hn = clHexNear(x, z, 11), e = hn[1] - hn[0], wgt = smooth((y - 0.25 * car.h) / (0.25 * car.h) + 0.3);
            return -depth * 0.9 * (1 - smooth(e / 2.0)) * Math.min(1, wgt);
          };
        }
        return null; // smooth (and spiky, whose spines are separate shells)
      }

      var CL_DESC = 62;
      // ---- Legs, arms and eyes ----
      function clLeg(sc, s, hip, dir, o) {
        var yh = o.yHip, Hk = Math.max(o.knee, yh + 3), tn = Math.tan(deg(55)), td = Math.tan(deg(CL_DESC));
        var rA = (Hk - yh) / tn, rB = (Hk - 1.2) / td, rC = Math.max(o.reach - rA - rB, 2);
        function at(dist, y, r) { return [hip[0] + dir[0] * dist, y, hip[2] + dir[2] * dist, r]; }
        var pts = [at(-3, yh * 0.95, o.r0), at(rA, Hk, o.r0 * 0.9), at(rA + rB, o.r1 * 0.75 * 1.5, o.r1 * 1.5), at(rA + rB + rC * 0.55, o.r1 * 0.75 * 1.2, o.r1 * 1.2), at(rA + rB + rC, o.r1 * 0.75, o.r1)];
        sc.add('legs', 'b', sweep(pts, { per: 1, seg: 12, flatStart: true }), o.color);
      }
      function clEye(sc, base, dir, L, Re, color, pcolor) {
        var rs = 1.8, cylH = Re * 0.55, prof = [[0, cylH + Re * 0.95]], i;
        for (i = 1; i <= 5; i++) { var an = (i / 6) * (Math.PI / 2); prof.push([Re * Math.sin(an), cylH + Re * 0.95 * Math.cos(an)]); }
        prof.push([Re, cylH], [Re, 0], [rs, -(Re - rs) * 1.7], [rs, -L - 3], [0, -L - 3]);
        var top = vadd(base, vmul(dir, L)), fr = frame(top, dir, [1, 0, 0]);
        sc.add('eyes', 'b', lathe(fr, prof, 20, {}), color);
        var mid = vadd(top, vmul(dir, cylH * 0.45)), face = vadd(mid, [Re * 0.98, 0, 0]);
        sc.add('pupils', 'b', dome(face, [1, 0, 0], Re * 0.5, { angle: 30, sink: 1 }), pcolor);
      }

      // ---- The claw: palm and fixed finger, plus a pincer hinged on a post ----
      // Local frame: p runs along the claw, q to the outside; T maps it to the bed. The pincer sits on a thin stage with a
      // gap of g mm, wraps a post and is held on by the post's head, so it prints in place and swings in the bed plane.
      function clClaw(sc, s, o) {
        var k = o.k, kh = clamp(k, 0.92, 1.25), g = o.g, c = Math.cos(o.psi), sn = Math.sin(o.psi);
        var fx = c, fz = s * sn, lx = -sn, lz = s * c, C = o.C;
        function T(q) { return [C[0] + q[0] * fx + q[1] * lx, C[1] + q[0] * fz + q[1] * lz]; }
        var ap = o.ap * k, wp = o.wp * k, hp = o.hp * k, Lt = ap + o.fl * 30 * k;
        var Ro = 5.0 * kh, rn = 2.1 * kh, Hb = 6.4 * kh, tf = 1.0, wt = 2.7, tipq = (g + 0.15) / 2 + wt / 2;
        var ybase = o.movable ? tf + g : 0, Hf = tf + g + Hb;
        var Hp = ap * 0.835 + Ro + 4.4, Hq = 6.4 * Math.pow(k, 0.9);
        var phi = o.phi, i;
        // palm: a rounded egg with a flat belly
        sc.add('claws', 'b', bellyShell(C[0], C[1], ap, wp, hp, -s * o.psi, 28, 0.55, 2.2, 2), o.cClaw);
        var palmTop = hp * 1.55;
        // fixed finger
        var f0 = [0, -2.6 * k], f1 = [lerp(0, Lt, 0.56), -7.4 * k], f2 = [Lt, -tipq];
        var fixedPoly = clBand(f0, f1, f2, 10.5 * k, wt, 0, 26);
        sc.add('claws', 'b', clSlab(fixedPoly, T, 0, Hf, Math.min(1.0, wt * 0.33)), o.cClaw);
        // pincer outline at the closed position
        var tip = [Lt, tipq], dlen = Lt - Hp, d1 = [(Hp + Lt) / 2 + 0.12 * dlen, (Hq + tipq) / 2 + 0.15 * dlen];
        var t0 = 0.0, bp;
        var cl = function (t) { var u = 1 - t; return [u * u * Hp + 2 * u * t * d1[0] + t * t * tip[0], u * u * Hq + 2 * u * t * d1[1] + t * t * tip[1]]; };
        while (t0 < 0.5 && Math.hypot(cl(t0)[0] - Hp, cl(t0)[1] - Hq) < Ro * 0.82) t0 += 0.01;
        var wr = 7.4 * kh;
        var pinPoly = clRot(clBand([Hp, Hq], d1, tip, wr, wt, t0, 26), [Hp, Hq], phi);
        if (o.movable) {
          var rin = rn + g, yb = ybase, yt = Hf;
          var loop = [[rin + 0.25, yb], [Ro - 0.6, yb], [Ro, yb + 0.6], [Ro, yt - 0.9], [Ro - 0.9, yt], [rin + 0.3, yt], [rin, yt - 0.3], [rin, yb + 0.3]];
          var hub = T([Hp, Hq]);
          sc.add('pincers', 'b', clRing(hub, loop, 40), o.cPin);
          sc.add('pincers', 'b', clSlab(pinPoly, T, yb, yt, Math.min(0.9, wt * 0.33)), o.cPin);
          // stage under the whole swing, post and head
          var hullPts = clCircle([Hp, Hq], Ro + 1.3, 20);
          [0, 1].forEach(function (e) { hullPts = hullPts.concat(clRot(clBand([Hp, Hq], d1, tip, wr + 1.8, wt + 1.8, t0 * 0.6, 14), [Hp, Hq], e * deg(42))); });
          sc.add('claws', 'b', clSlab(clHull(hullPts), T, 0, tf, 0.4), o.cClaw);
          var Re = rn + 2.3, yh0 = Hf + g, hp0 = yh0 + 2.3 + 0.8;
          var postProf = [[0, hp0 + 1.0], [Re * 0.6, hp0 + 0.85], [Re * 0.9, hp0 + 0.45], [Re, hp0], [Re, yh0 + 2.3], [rn, yh0], [rn, 0.5], [0, 0.5]];
          sc.add('claws', 'b', lathe(frame([hub[0], 0, hub[1]], [0, 1, 0], [0, 0, 1]), postProf, 22, {}), o.cClaw);
        } else { // fixed shut: the pincer is welded to the hand
          sc.add('pincers', 'b', clSlab(pinPoly, T, 0, Hf, Math.min(0.9, wt * 0.33)), o.cPin);
          sc.add('pincers', 'b', clSlab(clCircle([Hp, Hq], Ro, 28), T, 0, Hf, 1.0), o.cPin);
          var jb = clBand([Hp, Hq], [Hp - 3, Hq * 0.2], [Hp - 6, -3.2 * k], 6, 6, 0, 8);
          sc.add('pincers', 'b', clSlab(jb, T, 0, Hf, 0.8), o.cPin);
        }
        return { wrist: [C[0] - fx * ap * 0.5, C[1] - fz * ap * 0.5], top: palmTop };
      }

      // ---- Build ----
      var CL_SCHEMES = [
        { name: 'Boiled red', shell: '#ef5b4c', limb: '#f2796b', claw: '#ef5b4c', tip: '#fdba74', eye: '#f8fafc' },
        { name: 'Sandy beach', shell: '#f3d9a4', limb: '#e8c98a', claw: '#fdba74', tip: '#fda4af', eye: '#f8fafc' },
        { name: 'Blue crab', shell: '#7cb7e8', limb: '#93c5fd', claw: '#f1f5f9', tip: '#fdba74', eye: '#f8fafc' },
        { name: 'Rock pool green', shell: '#86d3a3', limb: '#a7f3d0', claw: '#fde047', tip: '#fda4af', eye: '#f8fafc' },
        { name: 'Sunset orange', shell: '#fdba74', limb: '#fed7aa', claw: '#ef5b4c', tip: '#f1f5f9', eye: '#f8fafc' }
      ];
      var CL_POSES = {
        crab: [{ al: 22, R: 25, psi: -6 }, { al: 48, R: 27, psi: 22 }, { al: 8, R: 22, psi: -26 }, { al: 78, R: 28, psi: 48 }],
        lobster: [{ al: 14, R: 35, psi: -5 }, { al: 34, R: 35, psi: 18 }, { al: 6, R: 32, psi: -14 }, { al: 65, R: 33, psi: 44 }]
      };

      function buildCrab(p, api) {
        var sc = new Scene(), lob = p.species === 1, bs = p.size * (p.species === 1 ? 0.84 : 1), cs = CL_SCHEMES[p.scheme] || CL_SCHEMES[0], g = p.gap;
        var a = (lob ? 26 : 22) * bs, w = (lob ? 12.5 : 33) * bs, Hc = (lob ? 19 : 19.5) * bs * p.height, h = Hc / 1.42;
        var car = new CarDef(a, w, h, 0.42, lob ? 2.2 : 2.4), tex = p.tex, depth = p.texDepth;
        var disp = clTexture(tex, depth, car);
        sc.add('shell', 'b', car.mesh(disp, 60, 84), cs.shell);
        var s, i;
        // rostrum and spines
        if (lob) sc.add('shell', 'b', horn([a - 5 * bs, car.cy + h * 0.55, 0], [a + 6 * bs, car.cy + h * 0.55 + 10 * bs, 0], 2.2 * bs, { seg: 12 }), cs.shell);
        if (tex === 4) {
          var nsp = lob ? 6 : 9;
          for (i = 0; i < nsp; i++) [-1, 1].forEach(function (sd) {
            var xx = lerp(a * 0.72, -a * 0.6, i / (nsp - 1)), t = car.tOfX(xx), P = car.pt(t, deg(34)), nv = car.normal(P);
            P[2] *= sd; nv[2] *= sd;
            var dir = vnorm([nv[0] * 0.6, Math.max(nv[1], 0) + 1.4, nv[2] * 0.9 + 0]);
            dir[2] += sd * 0.35; dir = vnorm(dir);
            if (dir[1] < 0.87) { dir[1] = 0.87; dir = vnorm(dir); }
            spike(sc, 'spines', 'b', vsub(P, vmul(dir, 1.5)), dir, 1.7 * bs, 7 * bs, cs.claw, 2);
          });
          for (i = 0; i < 4; i++) {
            var xt = lerp(a * 0.2, -a * 0.55, i / 3), tt = car.tOfX(xt), PT = car.pt(tt, deg(90));
            spike(sc, 'spines', 'b', vsub(PT, [0, 1.5, 0]), [0, 1, 0], 1.7 * bs, 6.5 * bs, cs.claw, 2);
          }
        }
        // lobster tail
        if (lob) {
          var ns = p.tailSegs, Ls = 9.5 * bs, endX = -a * 0.7;
          for (i = 0; i < ns; i++) {
            var wi = w * (0.92 - 0.075 * i), hi = h * 1.07 * (0.8 - 0.065 * i), xc = -a * 0.78 - Ls * (i + 0.3), ai = Ls * 0.68;
            sc.add('tail', 'b', bellyShell(xc, 0, ai, wi, hi, 0, 30, 0.42, 2.0, 2), cs.limb);
            endX = xc - ai;
          }
          var fanW = w * 0.5, root = endX + 1.5;
          var Tf = function (q) { return [root - q[0], q[1]]; };
          var tel = [[-3, -3.4], [3, -5.6], [11, -6.2], [16.5, -3], [18, 0], [16.5, 3], [11, 6.2], [3, 5.6], [-3, 3.4]].map(function (q) { return [q[0] * bs, q[1] * bs * (fanW / 6.2) / 1]; });
          sc.add('tail', 'b', clSlab(tel, Tf, 0, 3.2, 1.1), cs.limb);
          [-1, 1].forEach(function (sd) {
            var urop = [[-2, -3], [4, -4.8], [12, -5.4], [17, -2.5], [17.5, 0.5], [14, 3.8], [6, 4.8], [-2, 3]].map(function (q) { return [q[0] * bs, q[1] * bs]; });
            urop = clRot(urop, [0, 0], sd * deg(30)).map(function (q) { return [q[0], q[1] + sd * 4.5 * bs]; });
            sc.add('tail', 'b', clSlab(urop, Tf, 0, 3.0, 1.0), cs.limb);
          });
        }
        // eyes
        var Re = 3.7 * p.eyeSize * (lob ? 0.85 : 1), te = car.tOfX(a * (lob ? 0.72 : 0.78));
        [-1, 1].forEach(function (sd) {
          var th = Math.acos(clamp(p.eyeGap, 0.1, 0.8)), P = car.pt(te, th);
          P[2] *= sd;
          var dir = vnorm([0.12, 1, sd * 0.2]);
          clEye(sc, vsub(P, [0, 1.2, 0]), dir, p.eyeLen * bs, Re, cs.eye, '#1e293b');
        });
        // antennae
        if (lob && p.antenna > 0) [-1, 1].forEach(function (sd) {
          var L = p.antenna * bs, b0 = [a - 3 * bs, car.cy + h * 0.6, sd * 3.2 * bs];
          sc.add('legs', 'b', sweep([[b0[0], b0[1], b0[2], 1.15], [b0[0] + L * 0.5, b0[1] + L * 0.6, b0[2] + sd * L * 0.12, 0.95], [b0[0] + L, b0[1] + L * 1.2, b0[2] + sd * L * 0.4, 0.75]], { rise: true, seg: 8, per: 6 }), cs.limb);
        });
        // legs
        var nL = p.legs, legR = lob ? 0.78 : 1;
        for (i = 0; i < nL; i++) {
          var u = nL > 1 ? i / (nL - 1) : 0.5, xx2 = lerp(a * (lob ? 0.34 : 0.5), -a * (lob ? 0.42 : 0.58), u);
          var t2 = car.tOfX(xx2), HP = car.pt(t2, 0), splay = lerp(lob ? 14 : 26, lob ? -24 : -34, u);
          [-1, 1].forEach(function (sd) {
            var dir = [Math.sin(deg(splay)), 0, sd * Math.cos(deg(splay))], hip = [HP[0], car.cy * 0.9, sd * HP[2]];
            clLeg(sc, sd, vsub(hip, vmul(dir, 0.5)), dir, { yHip: car.cy * 0.95, knee: p.legHeight * bs * (lob ? 0.85 : 1), reach: p.legReach * bs * (lob ? 0.8 : 1), r0: 3.1 * legR * (0.7 + 0.3 * bs), r1: 1.45 * legR, color: cs.limb });
          });
        }
        // claws
        var pose = CL_POSES[lob ? 'lobster' : 'crab'][p.pose], tn52 = Math.tan(deg(52));
        [-1, 1].forEach(function (sd) {
          var big = p.balance === 0 ? 1 : (p.balance === (sd > 0 ? 1 : 2) ? 1.3 : 0.82);
          var k = p.clawSize * big * bs ** 0.5, al = deg(pose.al), Ra = pose.R * bs * (0.82 + 0.18 * k);
          var tS = car.tOfX(a * (lob ? 0.5 : 0.56)), SP = car.pt(tS, deg(24)), S = [SP[0], Math.max(SP[1] * 0.9, 6), sd * SP[2] * 0.8];
          var Cc = [S[0] + Ra * Math.cos(al), S[2] + sd * Ra * Math.sin(al)];
          var species = lob ? { ap: 15, wp: 7.2, hp: 6.0, fl: 1.2 } : { ap: 11.5, wp: 9.5, hp: 7.5, fl: 1.0 };
          var Lt = species.ap * k + species.fl * 30 * k, psi = deg(pose.psi);
          var zt = Math.abs(Cc[1]) + Lt * Math.sin(psi);
          if (zt < 5) psi = Math.asin(clamp((5 - Math.abs(Cc[1])) / Lt, -1, 1));
          var info = clClaw(sc, sd, { C: Cc, psi: psi, k: k, g: g, phi: deg(p.opening), movable: p.movable === 1, ap: species.ap, wp: species.wp, hp: species.hp, fl: species.fl, cClaw: cs.claw, cPin: cs.tip });
          var Wr = [info.wrist[0], info.top * 0.72, info.wrist[1]];
          var dxz = [Wr[0] - S[0], Wr[2] - S[2]], dist = Math.hypot(dxz[0], dxz[1]), nrm = [-dxz[1] / dist, dxz[0] / dist];
          var out = sd > 0 ? 1 : -1, bulge = (nrm[1] * sd >= 0 ? 1 : -1);
          var Em = [S[0] + dxz[0] * 0.5 + nrm[0] * bulge * sd * 0 + (0), 0, S[2] + dxz[1] * 0.5];
          var side = [0, sd * 1]; // push the elbow outward
          Em[0] += 0; Em[2] += side[1] * dist * 0.14;
          var d1 = Math.hypot(Em[0] - S[0], Em[2] - S[2]), d2 = Math.hypot(Em[0] - Wr[0], Em[2] - Wr[2]);
          Em[1] = Math.max(S[1] + d1 * tn52, Wr[1] + d2 * tn52);
          var rs = 4.3 * (0.8 + 0.2 * k), re = 3.4 * (0.8 + 0.2 * k), rw = 3.7 * (0.8 + 0.2 * k);
          sc.add('arms', 'b', sweep([[S[0], S[1], S[2], rs], [Em[0], Em[1], Em[2], re], [Wr[0], Wr[1], Wr[2], rw]], { per: 1, seg: 14, flatStart: true, flatEnd: true }), cs.limb);
        });
        return finish(sc);
      }

      var CL_PARAMS = [
        { group: 'Creature', key: 'species', label: 'Species', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Crab', 'Lobster'] },
        { group: 'Creature', key: 'size', label: 'Body size', unit: '×', min: 0.8, max: 1.25, step: 0.05, value: 1 },
        { group: 'Creature', key: 'height', label: 'Shell height (flat ↔ domed)', unit: '×', min: 0.75, max: 1.3, step: 0.05, value: 1 },
        { group: 'Creature', key: 'scheme', label: 'Colours', unit: '', min: 0, max: 4, step: 1, value: 0, format: function (v) { return CL_SCHEMES[v].name; } },
        { group: 'Claws', key: 'clawSize', label: 'Claw size', unit: '×', min: 0.75, max: 1.25, step: 0.05, value: 1 },
        { group: 'Claws', key: 'pose', label: 'Claw pose', unit: '', min: 0, max: 3, step: 1, value: 0, format: function (v) { return ['Guarding forward', 'Spread apart', 'Pinching together', 'Arms wide'][v]; } },
        { group: 'Claws', key: 'balance', label: 'Claw balance', unit: '', min: 0, max: 2, step: 1, value: 0, format: function (v) { return ['Matching pair', 'Big right claw', 'Big left claw'][v]; } },
        { group: 'Claws', key: 'movable', label: 'Pincers', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Fixed shut', 'Movable'] },
        { group: 'Claws', key: 'opening', label: 'Pincer opening when printed', unit: '°', min: 0, max: 40, step: 1, value: 14 },
        { group: 'Claws', key: 'gap', label: 'Joint clearance (tight ↔ loose)', unit: ' mm', min: 0.3, max: 0.6, step: 0.05, value: 0.4 },
        { group: 'Legs', key: 'legs', label: 'Legs per side', unit: '', min: 2, max: 5, step: 1, value: 4 },
        { group: 'Legs', key: 'legReach', label: 'Leg reach', unit: ' mm', min: 22, max: 46, step: 1, value: 34 },
        { group: 'Legs', key: 'legHeight', label: 'Knee height (low ↔ stilts)', unit: ' mm', min: 11, max: 22, step: 1, value: 15 },
        { group: 'Eyes', key: 'eyeLen', label: 'Eye stalk length (0 = no stalk)', unit: ' mm', min: 0, max: 16, step: 1, value: 7 },
        { group: 'Eyes', key: 'eyeSize', label: 'Eye size', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Eyes', key: 'eyeGap', label: 'Eye spacing (apart ↔ close)', unit: '', min: 0.2, max: 0.7, step: 0.05, value: 0.4, format: function (v) { return Math.round(v * 100) + '%'; } },
        { group: 'Shell', key: 'tex', label: 'Shell texture', unit: '', min: 0, max: 4, step: 1, value: 0, format: function (v) { return ['Smooth', 'Ribbed', 'Bumpy', 'Plated', 'Spiky'][v]; } },
        { group: 'Shell', key: 'texDepth', label: 'Texture depth', unit: ' mm', min: 0.4, max: 2, step: 0.1, value: 1.1 },
        { group: 'Lobster', key: 'tailSegs', label: 'Tail segments', unit: '', min: 3, max: 6, step: 1, value: 5, showIf: function (q) { return q.species === 1; } },
        { group: 'Lobster', key: 'antenna', label: 'Antenna length (0 = none)', unit: ' mm', min: 0, max: 36, step: 1, value: 20, showIf: function (q) { return q.species === 1; } }
      ];

      window.MM_GENERATOR = {
        code: 'MM-132',
        category: 'ANIMALS // SEA LIFE',
        title: 'Crab & Lobster',
        fileName: 'Crab_Lobster',
        defaultColor: '#ef5b4c',
        palette: [
          { name: 'Lobster Red', color: '#ef5b4c' }, { name: 'Sunset Orange', color: '#fdba74' },
          { name: 'Coral Pink', color: '#fda4af' }, { name: 'Sand', color: '#f3d9a4' },
          { name: 'Ocean Blue', color: '#7cb7e8' }, { name: 'Sea Green', color: '#86d3a3' },
          { name: 'Bone White', color: '#f1f5f9' }, { name: 'Shadow Black', color: '#334155' }
        ],
        partNames: { shell: 'Shell', tail: 'Tail', legs: 'Legs & antennae', arms: 'Claw arms', claws: 'Claw hands', pincers: 'Pincers', spines: 'Spines', eyes: 'Eyes', pupils: 'Pupils' },
        parameters: CL_PARAMS,
        presets: makePresets(CL_PARAMS, [
          ['Default crab', {}],
          ['Red lobster', { species: 1, size: 1, legs: 4, legReach: 30, legHeight: 14, eyeLen: 4, eyeGap: 0.5 }],
          ['Fiddler crab', { balance: 1, clawSize: 1.2, pose: 1, legs: 4, scheme: 1 }],
          ['Armoured rock crab', { tex: 3, texDepth: 1.3, scheme: 3, height: 1.15, eyeLen: 3 }],
          ['Spiky king crab', { tex: 4, scheme: 0, legs: 5, legReach: 40, legHeight: 19, height: 1.1 }],
          ['Blue crab', { scheme: 2, tex: 1, texDepth: 1, pose: 1, eyeLen: 9 }],
          ['Pinching lobster', { species: 1, pose: 2, clawSize: 1.1, scheme: 4, tex: 1, tailSegs: 6 }]
        ]),
        printCheckOptions: { bridgeGap: 0.8 },
        build: buildCrab
      };
