      // -----------------------------------------------------------------------
      // Alien & Monster Maker: seven archetypes, each its own model with its own sliders.
      // Gumdrop buddy, Classic grey, Saucer pilot, Cyclops brute, Slime blob, Bug alien and Yeti beast.
      // Everything that sticks out climbs at 45 degrees or more, so the defaults print without supports.
      // -----------------------------------------------------------------------
      var MONSTER_KINDS = ['Gumdrop buddy', 'Classic grey', 'Saucer pilot', 'Cyclops brute', 'Slime blob', 'Bug alien', 'Yeti beast'];
      var WHITE = '#f8fafc', BONE = '#fef3c7', GOLD = '#fde047';
      function kindIs(k) { return function (q) { return Math.round(q.kind) === k; }; }
      // Point on the surface of an ellipsoid (centre c, radii r) seen from +x at height y and sideways z, sunk by `sink` mm.
      function ellFront(c, r, y, z, sink) {
        var q = 1 - Math.pow((y - c[1]) / r[1], 2) - Math.pow((z - c[2]) / r[2], 2);
        return [c[0] + r[0] * Math.sqrt(Math.max(q, 0.02)) - (sink || 0), y, z];
      }
      // A cartoon eye on the finished surface, looking out at angle th (degrees about up, 0 = +x).
      function eyeAt2(sc, S, i, c, th, y, R, parent, iris) {
        var d = [Math.cos(deg(th)), 0, Math.sin(deg(th))];
        return softEye(sc, S, 'eye' + i, 'pupil' + i, [c[0] + d[0] * 90, y, c[2] + d[2] * 90], [-d[0], 0, -d[2]], parent, R, iris || WHITE);
      }
      // Open mouth cut into the +x face: a flat bottom and a pointed 45 degree roof, so the opening prints without supports.
      function archMouth(S, x, y, w, h, depth) {
        var roof = Math.min(w, h * 0.7);
        S.plate(null, [[-w, y - h * 0.3], [-w * 0.55, y - h * 0.3 - w * 0.25], [w * 0.55, y - h * 0.3 - w * 0.25], [w, y - h * 0.3], [w, y], [0, y + roof], [-w, y]], [x, 0, 0], [0, 0, 1], depth * 2, null, 1.2, 1).carve(1.2);
      }

      // ---- 0: Gumdrop buddy (the original little alien) ----
      function gumdrop(S, sc, p) {
        var W = p.width, H = p.height, n = Math.round(p.eyes), er = p.eyeSize, i, skin = '#86efac', dark = '#34d399', R = W * 0.86, sides = [-1, 1];
        S.piece('torso');
        S.ell('body', [0, H * 0.45, 0], [R, H * 0.5, R * 0.9], skin, 5);
        S.ell('body', [R * 0.02, H * 0.72, 0], [R * 0.8, H * 0.32, R * 0.74], skin, 8);
        S.paint('belly', [R * 0.9, H * 0.22, 0], [R * 0.48, H * 0.27, R * 0.62], '#d9f99d');
        var eyeY = H * 0.68, spread = n > 1 ? Math.min(40, 15 + n * 7) : 0, eyes = [];
        for (i = 0; i < n; i++) {
          var th = n > 1 ? lerp(-spread, spread, i / (n - 1)) : 0, ey = n === 1 ? H * 0.64 : eyeY + (n > 2 ? H * 0.09 * (1 - Math.abs(th) / spread) : 0), r = (n === 1 ? 1.5 : 1) * er;
          eyes.push({ th: th, y: ey, r: r });
          S.ell(null, [Math.cos(deg(th)) * R * 1.06, ey, Math.sin(deg(th)) * R * 1.0], [r * 0.56, r * 1.08, r * 1.08], null, 0).carve(1.6);
        }
        var mY = H * 0.38, mw = p.mouth;
        if (mw > 0) {
          var mz2 = Math.sin(deg(mw)) * R * 0.92, fx0 = Math.cos(deg(mw * 0.5)) * R * 0.92;
          S.piece('mouth', 'torso');
          S.path('lip', [[fx0, mY + 1.5, -mz2, 2], [R * 1.0, mY - H * 0.07, 0, 2.8], [fx0, mY + 1.5, mz2, 2]], dark, 1.5, 6);
          var nf = Math.round(p.fangs);
          for (i = 0; i < nf; i++) {
            var fa = nf > 1 ? lerp(-mw * 0.66, mw * 0.66, i / (nf - 1)) : 0, fz = Math.sin(deg(fa)) * R * 0.94, fxx = Math.cos(deg(fa)) * R * 1.0, fy = mY - H * 0.06 * (1 - Math.pow(fa / mw, 2));
            S.path('fangs', [[fxx - 0.5, fy, fz, 2.6], [fxx + 0.4, fy + 5, fz, 1.5], [fxx + 0.6, fy + 9, fz, 0.5]], WHITE, 0.5);
          }
        }
        if (p.arms > 0) sides.forEach(function (sd) {
          S.piece(sd < 0 ? 'armL' : 'armR');
          var L = p.arms, bz = sd * R * 0.76, by = H * 0.46, tip = [L * 0.15, by + L * 1.1, bz + sd * L * 0.86];
          S.path('arms', [[0, by - 3, bz, 6], [L * 0.08, by + L * 0.5, bz + sd * L * 0.5, 4.8], tip.concat([4.2])], dark, 3);
          [-1, 0, 1].forEach(function (f) { S.path('arms', [[tip[0], tip[1] + 2.5, tip[2], 2.7], [tip[0] + f * 3.4 + 0.5, tip[1] + 7, tip[2] + sd * 1.8, 1.8], [tip[0] + f * 5, tip[1] + 12, tip[2] + sd * 2.6, 0.8]], dark, 1); });
        });
        if (p.horns > 0) sides.forEach(function (sd) {
          S.piece(sd < 0 ? 'hornL' : 'hornR', 'torso');
          var hy = H * 0.85, hz = sd * R * 0.56, Hn = p.horns;
          S.path('horns', [[0, hy, hz, 5.4], [-Hn * 0.05, hy + Hn * 0.48, hz + sd * Hn * 0.36, 3.6], [Hn * 0.05, hy + Hn * 0.98, hz + sd * Hn * 0.42, 0.7]], GOLD, 2);
        });
        var na = Math.round(p.antennae);
        for (i = 0; i < na; i++) {
          S.piece('ant' + i, 'torso');
          var az = na > 1 ? lerp(-R * 0.34, R * 0.34, i / (na - 1)) : 0, top = H * 0.97, ah = H * 0.42, tipA = [-3, top + ah, az * 1.8];
          S.path('antennae', [[0, top - 2, az, 2.8], [-2, top + ah * 0.55, az * 1.5, 2.1], tipA.concat([1.9])], dark, 1.6);
          S.ell('antenna tips', [tipA[0], tipA[1] + 2.8, tipA[2]], [4.4, 4.4, 4.4], GOLD, 1.2);
        }
        sides.forEach(function (sd) {
          var fz = sd * R * 0.52;
          S.piece(sd < 0 ? 'footL' : 'footR');
          S.ell('feet', [R * 0.68, 4.4, fz], [12.5, 5.2, 8.5], dark, 2.5);
          [-1, 0, 1].forEach(function (c) { S.ell('claws', [R * 0.68 + 11, 2.5, fz + c * 4.4], [3.5, 2.8, 2.4], WHITE, 0.8); });
        });
        S.piece('spots', 'torso');
        var spots = Math.round(p.spots);
        for (i = 0; i < spots; i++) {
          var sa = deg(110 + (i * 137.5) % 140), sy = H * (0.3 + ((i * 0.37) % 0.5)), sr = 3.6 + (i % 3) * 1.2;
          S.ell('spots', [Math.cos(sa) * R * 0.96, sy, Math.sin(sa) * R * 0.86], [sr, sr, sr], dark, 1);
        }
        S.reach = 0.72;
        return function () {
          eyes.forEach(function (e, ei) {
            var id = 'eye' + ei, hit = S.face(id, [Math.cos(deg(e.th)) * R * 4, e.y, Math.sin(deg(e.th)) * R * 4], [-Math.cos(deg(e.th)), 0, -Math.sin(deg(e.th))], 'torso'), ang = e.r > 8 ? 40 : 52;
            if (!hit) return;
            var rr = e.r * hit.k;
            S.addon(id, hit.p, rr * 0.92);
            sc.add('eyes', 'b', dome(hit.p, hit.n, rr * 0.92, { angle: ang, seg: 28 }), WHITE);
            var rise = ((rr * 0.92) / Math.sin(deg(ang))) * (1 - Math.cos(deg(ang))), pu = S.sub('pupil' + ei, id, vadd(hit.p, vmul(hit.n, rise * 0.72)), rr * 0.48);
            if (pu) sc.add('pupils', 'b', dome(pu.p, hit.n, rr * 0.48 * pu.k, { sink: 0.8 }), '#1e293b');
          });
        };
      }

      // ---- 1: Classic grey: a huge teardrop cranium on a thin body, slanted black almond eyes, one arm waving ----
      function classicGrey(S, sc, p) {
        var skin = '#b8c4cf', R = p.greyHead, BH = p.greyBody, ek = p.greyEyes, sl = p.greySlant, both = Math.round(p.greyArms) === 1;
        var yT = 15 + BH;
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'legL' : 'legR');
          S.path('body', [[0, 3, s * 5.2, 3.4], [0.5, 10, s * 5.2, 3.6], [0, 17, s * 5, 4.2]], skin, 2);
          S.ell('feet', [3.5, 2.2, s * 6], [7, 2.6, 3.8], skin, 1.5);
        });
        S.piece('torso');
        S.ell('body', [0, 15 + BH * 0.5, 0], [7.5, BH * 0.55 + 1.5, 9], skin, 4);
        S.path('body', [[0, yT - 3, 0, 3.4], [0.6, yT + 5, 0, 3]], skin, 2);
        var hy = yT + 5 + R * 0.78, hc = [-R * 0.06, hy, 0], hr = [R * 0.9, R * 0.82, R * 0.96];
        S.piece('head');
        S.ell('head', hc, hr, skin, 4);
        S.path('head', [[R * 0.2, hy - R * 0.45, 0, R * 0.5], [R * 0.34, hy - R * 0.85, 0, R * 0.26], [R * 0.3, yT + 4, 0, 2.6]], skin, 4);
        // almond eyes: a lens that is thin at both corners and climbs toward the temple
        S.piece('eyes', 'head');
        [-1, 1].forEach(function (s) {
          var pts = [], ey = hy - R * 0.12, er = R * 0.19 * ek;
          [[0.1, 0.25], [0.24, 0.75], [0.4, 1], [0.56, 0.8], [0.68, 0.3]].forEach(function (q, qi) {
            var z = s * R * q[0] * (0.85 + 0.15 * ek), y = ey + Math.tan(deg(sl)) * (Math.abs(z) - R * 0.3) * 0.9, f = ellFront(hc, hr, y, z, er * q[1] * 0.55);
            pts.push([f[0], y, z, Math.max(er * q[1], 0.9)]);
          });
          S.path('eyes', pts, '#0f172a', 0.8, 5);
        });
        // tiny nostrils and a thin mouth line
        S.piece('head');
        [-1, 1].forEach(function (s) { S.ell(null, ellFront(hc, hr, hy - R * 0.52, s * 1.6, 0).map(function (v, i) { return i === 0 ? v + R * 0.12 : v; }), [1.2, 0.7, 0.7], null, 0).carve(0.4); });
        S.path(null, [[R * 0.42, hy - R * 0.74, -R * 0.12, 0.6], [R * 0.46, hy - R * 0.76, 0, 0.7], [R * 0.42, hy - R * 0.74, R * 0.12, 0.6]], null, 0).carve(0.4);
        // arms: long and thin, three long fingers, raised in greeting
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'armL' : 'armR');
          var up = both || s > 0, sh = [0, yT - 4, s * 8.2];
          if (up) {
            var hand = [3, yT + 20, s * 25];
            S.path('body', [sh.concat([2.6]), [1, yT + 8, s * 16, 2.3], hand.concat([2.1])], skin, 1.6);
            [-1, 0, 1].forEach(function (f) { S.path('body', [[hand[0], hand[1] + 1, hand[2], 1.5], [hand[0] + f * 2.4, hand[1] + 6, hand[2] + s * (2 + f * 0.8), 1], [hand[0] + f * 3.2, hand[1] + 10, hand[2] + s * (2.6 + f * 1.2), 0.75]], skin, 0.8); });
          } else {
            S.path('body', [[0, yT - 4, s * 7.6, 2.6], [0.6, yT - 11, s * 8.2, 2.3], [1.6, 18, s * 7.8, 2.1]], skin, 2.5);
            S.ell('body', [2.4, 16.5, s * 7.6], [2.6, 3, 2.2], skin, 1.2);
          }
        });
        S.reach = 0.9;
        return null;
      }

      // ---- 2: Saucer pilot: a flying saucer with rim lights and a little alien in the cockpit ----
      function saucerPilot(S, sc, p) {
        var Rs = p.ufoWidth, foot = Rs * 0.58, y1 = (Rs - foot) / 0.84, deck = y1 + 2 + Rs * p.ufoDeck, cock = Rs * 0.42, hs = p.ufoHead, skin = '#86efac', dark = '#22c55e';
        var top = deck + 3.2;
        // the pilot is sculpted, standing on a hidden post inside the hull
        S.piece('torso');
        S.path('body', [[0, 0.6, 0, cock * 0.7], [0, top, 0, cock * 0.7]], skin, 2);
        S.ell('body', [0, top + 5, 0], [9, 9, 10], skin, 4);
        var hy = top + 9 + 11 * hs;
        S.piece('head');
        S.ell('head', [0.5, hy, 0], [11.5 * hs, 11 * hs, 12 * hs], skin, 5);
        S.paint('cheeks', [11 * hs, hy - 5 * hs, 0], [3, 3.4 * hs, 8 * hs], '#bbf7d0');
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'armL' : 'armR');
          var hand = [5, top + 24, s * 20];
          S.path('arms', [[0, top + 6, s * 8, 3], [2, top + 13, s * 15, 2.6], hand.concat([2.4])], dark, 2);
          [-1, 0, 1].forEach(function (f) { S.path('arms', [[hand[0], hand[1] + 1, hand[2], 1.8], [hand[0] + f * 2.8, hand[1] + 6, hand[2] + s * 1.6, 1.2], [hand[0] + f * 3.6, hand[1] + 9.5, hand[2] + s * 2.2, 0.7]], dark, 0.8); });
        });
        var na = Math.round(p.ufoAntennae);
        for (var i = 0; i < na; i++) {
          S.piece('ant' + i, 'head');
          var az = na > 1 ? lerp(-6, 6, i / (na - 1)) * hs : 0, ty = hy + 10 * hs, tip = [-2.5, ty + 13, az * 2];
          S.path('antennae', [[-1, ty - 2, az, 2.2], [-2, ty + 7, az * 1.5, 1.8], tip.concat([1.6])], dark, 1.2);
          S.ell('antenna tips', [tip[0], tip[1] + 2.4, tip[2]], [3.4, 3.4, 3.4], GOLD, 1);
        }
        S.reach = 0.85;
        return function () {
          // hull: a lower dome rising from a wide foot to the rim, then a deck sloping in to the cockpit collar
          var lower = loft([{ y: 0, cx: 0, cz: 0, rx: foot, rz: foot }, { y: 1, cx: 0, cz: 0, rx: foot + 0.6, rz: foot + 0.6 }, { y: y1 * 0.5, cx: 0, cz: 0, rx: lerp(foot, Rs, 0.55), rz: lerp(foot, Rs, 0.55) }, { y: y1, cx: 0, cz: 0, rx: Rs - 0.6, rz: Rs - 0.6 }, { y: y1 + 0.6, cx: 0, cz: 0, rx: Rs - 1.2, rz: Rs - 1.2 }], 96, { poleLift: 0 });
          S.shell(sc, 'saucer', 'saucer', 'b', lower.tris, '#94a3b8');
          var band = loft([{ y: y1 - 6.5, cx: 0, cz: 0, rx: Rs - 6, rz: Rs - 6 }, { y: y1 - 0.2, cx: 0, cz: 0, rx: Rs + 0.4, rz: Rs + 0.4 }, { y: y1 + 1.4, cx: 0, cz: 0, rx: Rs + 0.4, rz: Rs + 0.4 }, { y: y1 + 2.4, cx: 0, cz: 0, rx: Rs - 0.8, rz: Rs - 0.8 }], 96, { poleLift: 0, free: true });
          S.shell(sc, 'rim', 'rim', 'b', band.tris, '#c084fc');
          var upper = loft([{ y: y1 + 1, cx: 0, cz: 0, rx: Rs - 1.4, rz: Rs - 1.4 }, { y: lerp(y1 + 1, deck, 0.45), cx: 0, cz: 0, rx: lerp(Rs - 1.4, cock + 2, 0.62), rz: lerp(Rs - 1.4, cock + 2, 0.62) }, { y: deck, cx: 0, cz: 0, rx: cock + 2, rz: cock + 2 }, { y: deck + 0.3, cx: 0, cz: 0, rx: cock, rz: cock }], 96, { poleLift: 0 });
          S.shell(sc, 'deck', 'deck', 'b', upper.tris, '#cbd5e1');
          var collar = loft([{ y: deck - 1, cx: 0, cz: 0, rx: cock + 1.2, rz: cock + 1.2 }, { y: deck + 2.4, cx: 0, cz: 0, rx: cock + 1.2, rz: cock + 1.2 }, { y: top, cx: 0, cz: 0, rx: cock, rz: cock }, { y: top + 0.01, cx: 0, cz: 0, rx: cock * 0.7, rz: cock * 0.7 }], 72, { poleLift: 0, free: true });
          S.shell(sc, 'cockpit', 'cockpit ring', 'b', collar.tris, '#c084fc');
          var nl = Math.round(p.ufoLights), ly = lerp(y1 + 1, deck, 0.3); // lights ring the deck, which faces up, so they print anywhere
          for (var j = 0; j < nl; j++) {
            var s0 = upper.surf((j / nl) * 360 + 180 / Math.max(nl, 1), ly);
            S.shell(sc, 'lights', 'lights', 'b', dome(s0.p, s0.n, 2.4, { angle: 45, seg: 18 }), GOLD, 'deck');
          }
          var ne = Math.round(p.ufoEyes), spread = ne === 1 ? 0 : ne === 2 ? 22 : 34;
          for (var e = 0; e < ne; e++) {
            var th = ne > 1 ? lerp(-spread, spread, e / (ne - 1)) : 0, ey = hy + (ne === 1 ? 4 : 3) * hs + (ne === 3 && e === 1 ? 3 * hs : 0);
            eyeAt2(sc, S, e, [0.5, hy, 0], th, ey, (ne === 1 ? 5.8 : ne === 2 ? 4.6 : 3.8) * hs, 'head');
          }
        };
      }

      // ---- 3: Cyclops brute: a hunched brute on its knuckles, one giant eye, an underbite with tusks ----
      function cyclopsBrute(S, sc, p) {
        var B = p.bruteBulk, A = p.bruteArms, skin = '#c4b5fd', dark = '#8b5cf6', i;
        S.piece('torso');
        S.ell('body', [-10, 20, 0], [17 * B, 19, 18 * B], skin, 6);
        S.ell('body', [5, 36, 0], [19 * B, 18, 23 * B], skin, 8);
        S.ell('body', [-3, 48, 0], [15 * B, 10, 21 * B], skin, 8);
        S.ell('body', [-11, 7, 0], [10, 9, 9 * B], skin, 6); // squat: the seat fills the gap between the legs
        S.paint('belly', [16 * B, 25, 0], [9, 9.5, 14 * B], '#ede9fe');
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'legL' : 'legR');
          S.path('body', [[-13, 16, s * 11 * B, 8.5], [-11, 6, s * 13 * B, 7.5]], skin, 4);
          S.ell('feet', [-5, 3.4, s * 13.5 * B], [11, 3.8, 7.5], dark, 2);
          S.piece(s < 0 ? 'armL' : 'armR');
          var fz = s * (24 * B + 2), sh = [3, 46, s * 21 * B];
          S.path('arms', [sh.concat([8.5 * A]), [13, 27, fz + s * 0.5, 7 * A], [19, 10, fz, 6.5 * A]], skin, 7);
          S.ell('fists', [21, 6.2, fz], [8 * A, 6.6, 7.6 * A], dark, 2.5);
          S.path('body', [[6, 2, s * 15 * B, 6.5], [6, 31, s * 16.5 * B, 6.5]], skin, 5); // flank down to the bed under the shoulder, so the armpit prints
          for (i = -1; i <= 1; i++) S.ell('fists', [20 + 8 * A, 3.4, fz + i * 4 * A], [3, 3, 2.4], dark, 1.2);
        });
        var hx = 11.5, hy = 50, eR = p.bruteEye;
        S.piece('head');
        S.ell('head', [hx, hy, 0], [11.5, 11, 12.5], skin, 5);
        S.ell('head', [hx + 2, hy + 8, 0], [9.5, 4, 10.5], skin, 3); // heavy brow block
        S.ell('head', [hx + 4.5, hy - 3, 0], [7.5, 11.5, 10], skin, 4); // flat, upright face under the brow, down to the jaw
        S.piece('jaw', 'head');
        S.ell('jaw', [hx + 5, hy - 13, 0], [8, 6.5, 11.5], skin, 3); // underbite jaw resting on the chest
        S.path('lip', [[hx + 10, hy - 8.5, -10, 1.8], [hx + 12.2, hy - 9.8, -5, 2.2], [hx + 12.9, hy - 10.2, 0, 2.3], [hx + 12.2, hy - 9.8, 5, 2.2], [hx + 10, hy - 8.5, 10, 1.8]], dark, 0.8); // a thick lower lip, raised so it prints
        var T = p.bruteTusks;
        if (T > 0) [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'tuskL' : 'tuskR', 'jaw');
          S.path('tusks', [[hx + 10.5, hy - 11, s * 7.5, 3.2], [hx + 11.8, hy - 10 + T * 0.55, s * 8.4, 2.4], [hx + 11.8, hy - 9 + T, s * 9.4, 1.4]], BONE, 1);
        });
        var Hn = p.bruteHorns;
        if (Hn > 0) [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'hornL' : 'hornR', 'head');
          S.path('horns', [[hx - 3, hy + 8, s * 7, 3.6], [hx - 4, hy + 8 + Hn * 0.6, s * (8 + Hn * 0.3), 2.2], [hx - 2, hy + 8 + Hn, s * (8 + Hn * 0.42), 0.6]], BONE, 1.5);
        });
        S.reach = 0.82;
        return function () {
          var e = S.face('eye0', [hx + 90, hy + 3.5, 0], [-1, 0, 0], 'head');
          if (!e) return;
          var R = eR * e.k;
          S.addon('eye0', e.p, R);
          sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 33, seg: 36 }), WHITE);
          var rise = (R / Math.sin(deg(33))) * (1 - Math.cos(deg(33))), pu = S.sub('pupil0', 'eye0', vadd(e.p, vmul(e.n, rise * 0.8)), R * 0.5);
          if (pu) {
            sc.add('irises', 'b', dome(pu.p, e.n, R * 0.5 * pu.k, { angle: 44, seg: 28, sink: 0.6 }), '#f59e0b');
            var ri = (R * 0.5 * pu.k / Math.sin(deg(44))) * (1 - Math.cos(deg(44)));
            sc.add('pupils', 'b', dome(vadd(pu.p, vmul(e.n, ri * 0.8)), e.n, R * 0.24 * pu.k, { sink: 0.5, seg: 20 }), '#0f172a');
          }
        };
      }

      // ---- 4: Slime blob: a melting puddle with drips, eyes on stalks and a gaping mouth ----
      function slimeBlob(S, sc, p) {
        var W = p.slimeWidth, H = p.slimeHeight, goo = '#a3e635', dark = '#84cc16', i, ns = Math.round(p.slimeStalks), stalkTips = [];
        S.piece('torso');
        S.ell('body', [0, 1.5, 0], [W * 1.32, 3.2, W * 1.28], goo, 7);
        S.ell('body', [0, H * 0.36, 0], [W, H * 0.42, W * 0.96], goo, 9);
        S.ell('body', [-W * 0.12, H * 0.7, W * 0.06], [W * 0.66, H * 0.3, W * 0.62], goo, 9);
        // lumps and drips
        for (i = 0; i < 5; i++) { var la = deg(150 + i * 47), ly = H * (0.35 + 0.08 * (i % 3)); S.ell('body', ellFront([0, H * 0.36, 0], [W, H * 0.42, W * 0.96], ly, 0).map(function (v, k) { return k === 0 ? Math.cos(la) * W * 0.92 : k === 2 ? Math.sin(la) * W * 0.9 : v; }), [6, 6, 6], goo, 3); }
        var nd = Math.round(p.slimeDrips);
        for (i = 0; i < nd; i++) {
          var da = deg(-70 + (i * 140) / Math.max(nd - 1, 1) + (i % 2) * 9), dy = H * (0.55 + 0.12 * (i % 3));
          var rr = function (y) { var t = (y - H * 0.36) / (H * 0.42); return W * Math.sqrt(Math.max(1 - t * t, 0.05)) * 0.98; };
          var pts = [], q;
          for (q = 0; q <= 4; q++) { var y = lerp(dy, 4, q / 4), rad = rr(Math.max(y, H * 0.36)) + (y < H * 0.36 ? (H * 0.36 - y) * 0.42 : 0); pts.push([Math.cos(da) * (rad - 0.6), y, Math.sin(da) * (rad - 0.6), lerp(1.6, 2.8, q * q / 16)]); }
          S.path('drips', pts, dark, 2.5);
          S.ell('drips', [pts[4][0] * 1.04, 3.4, pts[4][2] * 1.04], [3.6, 3.4, 3.6], dark, 2);
        }
        if (p.slimeMouth > 0) { S.piece('mouth', 'torso'); archMouth(S, W * 0.96, H * 0.34, W * 0.38 * p.slimeMouth + 3, H * 0.18 * p.slimeMouth + 3, 5); }
        for (i = 0; i < ns; i++) {
          S.piece('stalk' + i, 'torso');
          var sa = ns > 1 ? lerp(-38, 38, i / (ns - 1)) : 0, base = [Math.cos(deg(sa)) * W * 0.3 - W * 0.1, H * 0.92, Math.sin(deg(sa)) * W * 0.5], L = p.slimeStalkLen * (1 - 0.18 * (i % 2));
          var tip = [base[0] + 3 + L * 0.12, base[1] + L, base[2] + Math.sin(deg(sa)) * L * 0.42];
          S.path('stalks', [base.concat([3.4]), [lerp(base[0], tip[0], 0.5), lerp(base[1], tip[1], 0.5), lerp(base[2], tip[2], 0.55), 2.4], tip.concat([2.8])], goo, 2);
          S.ell('eyeballs', [tip[0] + 0.5, tip[1] + 3.6, tip[2]], [5.4, 5.4, 5.4], WHITE, 1.6);
          stalkTips.push({ c: [tip[0] + 0.5, tip[1] + 3.6, tip[2]], th: sa * 0.6 });
        }
        var nt = Math.round(p.slimeTentacles);
        for (i = 0; i < nt; i++) {
          S.piece('tent' + i);
          var ta = deg(200 + (i - (nt - 1) / 2) * (300 / Math.max(nt, 1)) * 0.9), Lt = W * 1.3 + 16, tp = [];
          for (q = 0; q <= 4; q++) { var u = q / 4, an = ta + 0.7 * u * u, rd = lerp(W * 0.9, Lt, u), r2 = lerp(6.4, 2.4, u); tp.push([Math.cos(an) * rd, r2 * 0.62, Math.sin(an) * rd, r2]); }
          S.path('drips', tp, dark, 3, 4);
        }
        S.reach = 0.8;
        return function () {
          if (ns) stalkTips.forEach(function (t, i2) { eyeAt2(sc, S, i2, t.c, t.th, t.c[1] + 3, 3.1, 'stalk' + i2, '#38bdf8'); });
          else [-1, 1].forEach(function (s, i2) { eyeAt2(sc, S, i2, [0, 0, 0], s * 24, H * 0.62, 6, 'torso'); });
        };
      }

      // ---- 5: Bug alien: a beetle-like body low on the bed, legs splayed flat, compound eyes, pincers, antennae and mantis claws ----
      function bugAlien(S, sc, p) {
        var Ab = p.bugAbdomen, E = p.bugEyes, AL = p.bugAntennae, legs = Math.round(p.bugLegs) ? 3 : 2, claws = Math.round(p.bugClaws) === 1, shell = '#0d9488', skin = '#5eead4', i;
        S.piece('torso');
        S.ell('body', [-Ab * 0.55, 10, 0], [Ab * 0.66, 11, 14], skin, 5);
        S.ell('body', [-Ab * 1.12, 7, 0], [Ab * 0.32, 7, 9], skin, 5);
        S.ell('body', [5, 13, 0], [9.5, 13, 10.5], skin, 6);
        S.ell('body', [4, 0.5, 0], [11, 5, 10], skin, 4); // flat pad under the thorax
        // wing cases on the back, with a seam down the middle and bands across the abdomen
        S.paint('wing cases', [-Ab * 0.62, 17, 0], [Ab * 0.78, 9, 15], shell);
        S.path(null, [[Ab * 0.05, 21.5, 0, 0.9], [-Ab * 0.55, 21.6, 0, 1], [-Ab * 1.22, 13, 0, 0.8]], null, 0).carve(0.5);
        for (i = 1; i <= 3; i++) S.path(null, [[-Ab * (0.3 + i * 0.27), 1, -15, 0.7], [-Ab * (0.3 + i * 0.27), 22, 0, 0.8], [-Ab * (0.3 + i * 0.27), 1, 15, 0.7]], null, 0).carve(0.4);
        var hx = 10, hy = 29;
        S.piece('head');
        S.ell('head', [hx, hy, 0], [9, 8.5, 9.5], skin, 4);
        S.piece('eyes', 'head');
        [-1, 1].forEach(function (s) { S.ell('eyes', [hx + 4, hy + 2, s * 7.2], [6 * E, 6.4 * E, 5.4 * E], '#f43f5e', 1.2); });
        S.relief([hx - 4, hy - 6, -16], [hx + 14, hy + 10, 16], function (x, y, z) { // facets on the compound eyes
          if (Math.abs(z) < 3.5 || y < hy) return 0; // facets on the upper half only, so the underside stays smooth
          return 0.4 * Math.pow(Math.abs(Math.sin(y * 1.3) * Math.sin(z * 1.3 + x * 0.65)), 2);
        });
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'mandL' : 'mandR', 'head');
          S.path('mandibles', [[hx + 7, hy - 2, s * 3.6, 2.4], [hx + 10.5, hy + 3, s * 4.4, 2], [hx + 11.5, hy + 8, s * 2.4, 1.5]], shell, 1.2);
          if (AL > 0) {
            S.piece(s < 0 ? 'antL' : 'antR', 'head');
            var a0 = [hx + 1, hy + 6, s * 3.5];
            S.path('antennae', [a0.concat([2]), [hx - 2, hy + 6 + AL * 0.55, s * (4 + AL * 0.28), 1.6], [hx + 2, hy + 6 + AL, s * (5 + AL * 0.42), 1.4]], shell, 1.2);
            S.ell('antennae', [hx + 2.6, hy + 7.8 + AL, s * (5 + AL * 0.42)], [2.4, 2.4, 2.4], shell, 0.8);
          }
          for (var l = 0; l < legs; l++) {
            S.piece((s < 0 ? 'leg' : 'legR') + l);
            var lx = legs === 3 ? 6 - l * 11 : 2 - l * 14, sp = deg(legs === 3 ? [-30, 5, 40][l] : [-22, 30][l]), kr = 16, fr = 29;
            var knee = [lx + Math.sin(sp) * kr, 2.2, s * (7 + Math.cos(sp) * kr)], ft = [lx + Math.sin(sp) * fr + (l === 0 ? 4 : 0), 1.6, s * (7 + Math.cos(sp) * fr)];
            S.path('legs', [[lx, 3, s * 6, 3.6], knee.concat([3]), ft.concat([2.3])], shell, 2);
            S.ell('legs', [ft[0], 1.6, ft[2]], [3, 1.9, 3], shell, 1);
          }
          if (claws) {
            S.piece(s < 0 ? 'clawL' : 'clawR');
            S.path('claws', [[hx + 1, 12, s * 8, 3.2], [hx + 4, 18, s * 11, 2.9], [hx + 5, 26, s * 14, 2.5], [hx + 7, 32, s * 14.5, 2], [hx + 9.5, 36, s * 13.5, 1.4]], shell, 1.6);
          }
        });
        S.reach = 0.9;
        return null;
      }

      // ---- 6: Yeti beast: shaggy fur, ram horns, a roaring mouth and both arms raised ----
      function yetiBeast(S, sc, p) {
        var H = p.yetiHeight, Hn = p.yetiHorns, L = p.yetiArms, fur = '#f1f5f9', face = '#93c5fd', claw = '#334155', i;
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'legL' : 'legR');
          S.path('body', [[0, 4, s * 10, 8], [0, 15, s * 10, 9]], fur, 4);
          S.ell('feet', [6, 3.6, s * 11], [13, 4, 8.5], face, 2);
          for (i = -1; i <= 1; i++) S.ell('claws', [17.5, 2.6, s * 11 + i * 4], [3, 2.4, 1.8], claw, 0.8);
        });
        S.piece('torso');
        S.ell('body', [0, H * 0.38, 0], [19, H * 0.38, 21], fur, 8);
        S.ell('body', [1, H * 0.7, 0], [16, H * 0.24, 18], fur, 9);
        var fy = H * 0.7, fc = [1, H * 0.7, 0], fr = [16, H * 0.24, 18];
        S.paint('face', [14, fy - 1, 0], [7, H * 0.13, 11], face);
        S.path('body', [[ellFront(fc, fr, fy + 5, -9, 1)[0], fy + 5, -9, 2.6], [ellFront(fc, fr, fy + 6.5, 0, 0.6)[0], fy + 6.5, 0, 3], [ellFront(fc, fr, fy + 5, 9, 1)[0], fy + 5, 9, 2.6]], fur, 2); // brow
        if (p.yetiFur > 0) S.relief([-26, 8, -26], [26, H * 1.0, 26], function (x, y, z) { // shaggy locks, but not on the face
          var a = Math.atan2(z, x), band = y > fy - H * 0.17 && y < fy + H * 0.2, fw = band ? clamp((Math.abs(a) - 0.5) / 0.25, 0, 1) : 1;
          return p.yetiFur * 1.1 * fw * Math.pow(Math.abs(Math.sin(a * 15 + y * 0.28)), 2);
        });
        if (p.yetiRoar > 0) {
          S.piece('mouth', 'torso');
          var mx = ellFront(fc, fr, fy - 7, 0, 0)[0];
          archMouth(S, mx, fy - 9, 4 + 5 * p.yetiRoar, 3 + 5 * p.yetiRoar, 4);
          [-1, 1].forEach(function (s) { var bx = ellFront(fc, fr, fy - 12 - 3 * p.yetiRoar, s * (2.5 + 2.5 * p.yetiRoar), 1.2)[0]; S.path('fangs', [[bx - 0.6, fy - 13 - 3 * p.yetiRoar, s * (2.5 + 2.5 * p.yetiRoar), 1.8], [bx + 0.2, fy - 9.5 - 3 * p.yetiRoar, s * (2.6 + 2.5 * p.yetiRoar), 0.6]], WHITE, 0.6); });
        }
        if (Hn > 0) [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'hornL' : 'hornR', 'torso');
          var b = [-3, H * 0.86, s * 11];
          S.path('horns', [b.concat([5]), [-6, b[1] + Hn * 0.45, s * (12 + Hn * 0.55), 3.8], [-3, b[1] + Hn * 0.82, s * (12 + Hn * 0.9), 2.4], [2, b[1] + Hn, s * (12 + Hn * 0.95), 0.8]], BONE, 2);
        });
        if (L > 0) [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'armL' : 'armR');
          var sh = [0, H * 0.56, s * 17], hand = [4, sh[1] + L * 1.05, s * (19 + L * 0.72)];
          S.path('body', [sh.concat([7.5]), [2, sh[1] + L * 0.5, s * (18 + L * 0.42), 6], hand.concat([5])], fur, 4);
          [-1, 0, 1].forEach(function (f) { S.path('claws', [[hand[0] + f * 3, hand[1] + 3.5, hand[2], 2], [hand[0] + f * 4, hand[1] + 8, hand[2] + s * 1.5, 0.6]], claw, 0.8); });
        });
        S.reach = 0.85;
        return function () {
          [-1, 1].forEach(function (s, i2) {
            var e = S.face('eye' + i2, [fc[0] + Math.cos(deg(18)) * 90, fy + 1.5, s * Math.sin(deg(18)) * 90], [-Math.cos(deg(18)), 0, -s * Math.sin(deg(18))], 'torso');
            if (!e) return;
            var R = 2.6 * e.k;
            S.addon('eye' + i2, e.p, R);
            sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 40, seg: 20, sink: 1 }), '#0f172a');
          });
        };
      }

      var MONSTER_BUILDERS = [gumdrop, classicGrey, saucerPilot, cyclopsBrute, slimeBlob, bugAlien, yetiBeast];
      function buildMonster(p, api) {
        var sc = new Scene(), S = new Sculpt(1.3).useEdits(api, p.size), kind = clamp(Math.round(p.kind), 0, MONSTER_BUILDERS.length - 1);
        var after = MONSTER_BUILDERS[kind](S, sc, p);
        S.run();
        if (after) after();
        S.addTo(sc);
        return finishSculpt(sc, p.size, S);
      }
      var MONSTER_PARAMS = [
        { group: 'Creature', key: 'kind', label: 'Archetype', unit: '', min: 0, max: 6, step: 1, value: 0, options: MONSTER_KINDS },
        { group: 'Creature', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 },
        // Gumdrop buddy
        { group: 'Gumdrop buddy', key: 'height', label: 'Body height', unit: ' mm', min: 40, max: 80, step: 1, value: 56, showIf: kindIs(0) },
        { group: 'Gumdrop buddy', key: 'width', label: 'Body width (half)', unit: ' mm', min: 20, max: 36, step: 1, value: 27, showIf: kindIs(0) },
        { group: 'Gumdrop buddy', key: 'eyes', label: 'Eyes', unit: '', min: 1, max: 5, step: 1, value: 2, showIf: kindIs(0) },
        { group: 'Gumdrop buddy', key: 'eyeSize', label: 'Eye size', unit: ' mm', min: 4, max: 9, step: 0.5, value: 6.5, showIf: kindIs(0) },
        { group: 'Gumdrop buddy', key: 'mouth', label: 'Mouth width (0 = none)', unit: '°', min: 0, max: 45, step: 1, value: 28, showIf: kindIs(0) },
        { group: 'Gumdrop buddy', key: 'fangs', label: 'Fangs', unit: '', min: 0, max: 4, step: 1, value: 2, showIf: kindIs(0) },
        { group: 'Gumdrop buddy', key: 'arms', label: 'Arm length (0 = none)', unit: ' mm', min: 0, max: 26, step: 1, value: 16, showIf: kindIs(0) },
        { group: 'Gumdrop buddy', key: 'horns', label: 'Horn length (0 = none)', unit: ' mm', min: 0, max: 26, step: 1, value: 0, showIf: kindIs(0) },
        { group: 'Gumdrop buddy', key: 'antennae', label: 'Antennae', unit: '', min: 0, max: 3, step: 1, value: 2, slider: true, showIf: kindIs(0) },
        { group: 'Gumdrop buddy', key: 'spots', label: 'Back spots', unit: '', min: 0, max: 9, step: 1, value: 3, showIf: kindIs(0) },
        // Classic grey
        { group: 'Classic grey', key: 'greyHead', label: 'Head size', unit: ' mm', min: 16, max: 26, step: 0.5, value: 21, showIf: kindIs(1) },
        { group: 'Classic grey', key: 'greyEyes', label: 'Eye size', unit: '×', min: 0.7, max: 1.35, step: 0.05, value: 1, showIf: kindIs(1) },
        { group: 'Classic grey', key: 'greySlant', label: 'Eye slant (calm ↔ sly)', unit: '°', min: 0, max: 35, step: 1, value: 20, showIf: kindIs(1) },
        { group: 'Classic grey', key: 'greyBody', label: 'Body height', unit: ' mm', min: 14, max: 30, step: 1, value: 20, showIf: kindIs(1) },
        { group: 'Classic grey', key: 'greyArms', label: 'Arms', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['One waving', 'Both raised'], showIf: kindIs(1) },
        // Saucer pilot
        { group: 'Saucer pilot', key: 'ufoWidth', label: 'Saucer radius', unit: ' mm', min: 30, max: 46, step: 1, value: 38, showIf: kindIs(2) },
        { group: 'Saucer pilot', key: 'ufoDeck', label: 'Deck height', unit: '×', min: 0.15, max: 0.4, step: 0.01, value: 0.26, showIf: kindIs(2) },
        { group: 'Saucer pilot', key: 'ufoLights', label: 'Rim lights', unit: '', min: 0, max: 14, step: 1, value: 8, showIf: kindIs(2) },
        { group: 'Saucer pilot', key: 'ufoHead', label: 'Pilot head size', unit: '×', min: 0.8, max: 1.2, step: 0.05, value: 1, showIf: kindIs(2) },
        { group: 'Saucer pilot', key: 'ufoEyes', label: 'Pilot eyes', unit: '', min: 1, max: 3, step: 1, value: 2, slider: true, showIf: kindIs(2) },
        { group: 'Saucer pilot', key: 'ufoAntennae', label: 'Pilot antennae', unit: '', min: 0, max: 2, step: 1, value: 2, slider: true, showIf: kindIs(2) },
        // Cyclops brute
        { group: 'Cyclops brute', key: 'bruteBulk', label: 'Bulk', unit: '×', min: 0.85, max: 1.2, step: 0.05, value: 1, showIf: kindIs(3) },
        { group: 'Cyclops brute', key: 'bruteArms', label: 'Arm thickness', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1, showIf: kindIs(3) },
        { group: 'Cyclops brute', key: 'bruteEye', label: 'Eye size', unit: ' mm', min: 5, max: 8, step: 0.25, value: 7, showIf: kindIs(3) },
        { group: 'Cyclops brute', key: 'bruteTusks', label: 'Tusk length (0 = none)', unit: ' mm', min: 0, max: 12, step: 0.5, value: 8, showIf: kindIs(3) },
        { group: 'Cyclops brute', key: 'bruteHorns', label: 'Horn length (0 = none)', unit: ' mm', min: 0, max: 16, step: 0.5, value: 7, showIf: kindIs(3) },
        // Slime blob
        { group: 'Slime blob', key: 'slimeWidth', label: 'Blob width (half)', unit: ' mm', min: 20, max: 34, step: 1, value: 27, showIf: kindIs(4) },
        { group: 'Slime blob', key: 'slimeHeight', label: 'Blob height', unit: ' mm', min: 30, max: 60, step: 1, value: 44, showIf: kindIs(4) },
        { group: 'Slime blob', key: 'slimeStalks', label: 'Eye stalks (0 = eyes on body)', unit: '', min: 0, max: 4, step: 1, value: 3, slider: true, showIf: kindIs(4) },
        { group: 'Slime blob', key: 'slimeStalkLen', label: 'Stalk length', unit: ' mm', min: 8, max: 24, step: 1, value: 15, showIf: kindIs(4) },
        { group: 'Slime blob', key: 'slimeMouth', label: 'Mouth (0 = none)', unit: '×', min: 0, max: 1, step: 0.05, value: 0.6, showIf: kindIs(4) },
        { group: 'Slime blob', key: 'slimeDrips', label: 'Drips', unit: '', min: 0, max: 8, step: 1, value: 5, slider: true, showIf: kindIs(4) },
        { group: 'Slime blob', key: 'slimeTentacles', label: 'Tentacles', unit: '', min: 0, max: 6, step: 1, value: 0, slider: true, showIf: kindIs(4) },
        // Bug alien
        { group: 'Bug alien', key: 'bugAbdomen', label: 'Abdomen length', unit: ' mm', min: 20, max: 40, step: 1, value: 30, showIf: kindIs(5) },
        { group: 'Bug alien', key: 'bugEyes', label: 'Eye size', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1, showIf: kindIs(5) },
        { group: 'Bug alien', key: 'bugAntennae', label: 'Antenna length (0 = none)', unit: ' mm', min: 0, max: 30, step: 1, value: 18, showIf: kindIs(5) },
        { group: 'Bug alien', key: 'bugLegs', label: 'Legs', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Four', 'Six'], showIf: kindIs(5) },
        { group: 'Bug alien', key: 'bugClaws', label: 'Mantis claws', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'], showIf: kindIs(5) },
        // Yeti beast
        { group: 'Yeti beast', key: 'yetiHeight', label: 'Body height', unit: ' mm', min: 50, max: 80, step: 1, value: 64, showIf: kindIs(6) },
        { group: 'Yeti beast', key: 'yetiHorns', label: 'Horn length (0 = none)', unit: ' mm', min: 0, max: 24, step: 1, value: 16, showIf: kindIs(6) },
        { group: 'Yeti beast', key: 'yetiArms', label: 'Raised arm length (0 = none)', unit: ' mm', min: 0, max: 24, step: 1, value: 16, showIf: kindIs(6) },
        { group: 'Yeti beast', key: 'yetiRoar', label: 'Roar (0 = mouth closed)', unit: '×', min: 0, max: 1, step: 0.05, value: 0.7, showIf: kindIs(6) },
        { group: 'Yeti beast', key: 'yetiFur', label: 'Shaggy fur', unit: '×', min: 0, max: 1, step: 0.05, value: 0.7, showIf: kindIs(6) }
      ];
      window.MM_GENERATOR = {
        code: 'MM-089',
        category: 'ANIMALS // CREATURES',
        title: 'Alien & Monster Maker',
        fileName: 'Monster',
        defaultColor: '#86efac',
        palette: ANIMAL_PALETTE,
        partNames: {
          body: 'Body', belly: 'Belly', lip: 'Lip', 'antenna tips': 'Antenna tips', claws: 'Claws', eyes: 'Eyes', pupils: 'Pupils', glints: 'Eye glints', irises: 'Iris', fangs: 'Fangs', arms: 'Arms', horns: 'Horns', antennae: 'Antennae', feet: 'Feet', spots: 'Spots',
          head: 'Head', cheeks: 'Cheeks', saucer: 'Saucer hull', rim: 'Saucer rim', deck: 'Saucer deck', 'cockpit ring': 'Cockpit ring', lights: 'Rim lights',
          jaw: 'Jaw', tusks: 'Tusks', fists: 'Fists', drips: 'Drips', stalks: 'Eye stalks', eyeballs: 'Eyeballs', 'wing cases': 'Wing cases', mandibles: 'Mandibles', legs: 'Legs', face: 'Face'
        },
        parameters: MONSTER_PARAMS,
        presets: makePresets(MONSTER_PARAMS, [
          ['Default gumdrop buddy', {}],
          ['Tiny three-eye', { size: 0.7, eyes: 3, antennae: 1, arms: 12, height: 44, width: 24 }],
          ['Classic grey', { kind: 1 }],
          ['Big-brain grey', { kind: 1, greyHead: 25, greyEyes: 1.25, greySlant: 28, greyBody: 16, greyArms: 1 }],
          ['Saucer pilot', { kind: 2 }],
          ['Cyclops pilot', { kind: 2, ufoEyes: 1, ufoAntennae: 1, ufoHead: 1.15, ufoLights: 12 }],
          ['Cyclops brute', { kind: 3 }],
          ['Slime blob', { kind: 4 }],
          ['Tentacle slime', { kind: 4, slimeStalks: 0, slimeTentacles: 6, slimeHeight: 38, slimeDrips: 3 }],
          ['Bug alien', { kind: 5 }],
          ['Yeti beast', { kind: 6 }]
        ]),
        sculpt: sculptModule([
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'head', label: 'Head', section: 'Body' }, { id: 'jaw', label: 'Jaw', section: 'Body', parent: 'head' }, { id: 'mouth', label: 'Mouth', section: 'Body' }, { id: 'spots', label: 'Spots', section: 'Body' },
          { id: 'saucer', label: 'Saucer hull', section: 'Saucer' }, { id: 'rim', label: 'Saucer rim', section: 'Saucer' }, { id: 'deck', label: 'Saucer deck', section: 'Saucer' }, { id: 'cockpit', label: 'Cockpit ring', section: 'Saucer' }, { id: 'lights', label: 'Rim lights', section: 'Saucer', parent: 'saucer' },
          { id: 'eyes', label: 'Eyes', section: 'Eyes' },
          { id: 'eye0', label: 'Eye 1', section: 'Eyes' }, { id: 'pupil0', label: 'Pupil 1', section: 'Eyes', parent: 'eye0' }, { id: 'eye1', label: 'Eye 2', section: 'Eyes' }, { id: 'pupil1', label: 'Pupil 2', section: 'Eyes', parent: 'eye1' }, { id: 'eye2', label: 'Eye 3', section: 'Eyes' }, { id: 'pupil2', label: 'Pupil 3', section: 'Eyes', parent: 'eye2' }, { id: 'eye3', label: 'Eye 4', section: 'Eyes' }, { id: 'pupil3', label: 'Pupil 4', section: 'Eyes', parent: 'eye3' }, { id: 'eye4', label: 'Eye 5', section: 'Eyes' }, { id: 'pupil4', label: 'Pupil 5', section: 'Eyes', parent: 'eye4' },
          { id: 'stalk0', label: 'Eye stalk 1', section: 'Top' }, { id: 'stalk1', label: 'Eye stalk 2', section: 'Top' }, { id: 'stalk2', label: 'Eye stalk 3', section: 'Top' }, { id: 'stalk3', label: 'Eye stalk 4', section: 'Top' },
          { id: 'hornL', label: 'Left horn', section: 'Top' }, { id: 'hornR', label: 'Right horn', section: 'Top' }, { id: 'tuskL', label: 'Left tusk', section: 'Top' }, { id: 'tuskR', label: 'Right tusk', section: 'Top' }, { id: 'mandL', label: 'Left mandible', section: 'Top' }, { id: 'mandR', label: 'Right mandible', section: 'Top' },
          { id: 'ant0', label: 'Antenna 1', section: 'Top' }, { id: 'ant1', label: 'Antenna 2', section: 'Top' }, { id: 'ant2', label: 'Antenna 3', section: 'Top' }, { id: 'antL', label: 'Left antenna', section: 'Top' }, { id: 'antR', label: 'Right antenna', section: 'Top' },
          { id: 'armL', label: 'Left arm', section: 'Limbs' }, { id: 'armR', label: 'Right arm', section: 'Limbs' }, { id: 'clawL', label: 'Left claw', section: 'Limbs' }, { id: 'clawR', label: 'Right claw', section: 'Limbs' },
          { id: 'legL', label: 'Left leg', section: 'Limbs' }, { id: 'legR', label: 'Right leg', section: 'Limbs' }, { id: 'footL', label: 'Left foot', section: 'Limbs' }, { id: 'footR', label: 'Right foot', section: 'Limbs' },
          { id: 'leg0', label: 'Left leg 1', section: 'Limbs' }, { id: 'leg1', label: 'Left leg 2', section: 'Limbs' }, { id: 'leg2', label: 'Left leg 3', section: 'Limbs' }, { id: 'legR0', label: 'Right leg 1', section: 'Limbs' }, { id: 'legR1', label: 'Right leg 2', section: 'Limbs' }, { id: 'legR2', label: 'Right leg 3', section: 'Limbs' },
          { id: 'tent0', label: 'Tentacle 1', section: 'Limbs' }, { id: 'tent1', label: 'Tentacle 2', section: 'Limbs' }, { id: 'tent2', label: 'Tentacle 3', section: 'Limbs' }, { id: 'tent3', label: 'Tentacle 4', section: 'Limbs' }, { id: 'tent4', label: 'Tentacle 5', section: 'Limbs' }, { id: 'tent5', label: 'Tentacle 6', section: 'Limbs' }
        ]),
        build: buildMonster
      };
