      // -----------------------------------------------------------------------
      // Frog & Toad: a squat sculpted amphibian (tree frog, bullfrog or toad) with big eyes, a closed or open mouth,
      // an optional tongue that flicks up to catch a fly, and an optional lily-pad base.
      // Everything faces +x and sits on the bed (or on the pad). The Sculpt support pass keeps every form within 45 degrees
      // of the solid below it, so the legs lie folded on the pad, the eyes sit on mounds, the tongue climbs steeply and the
      // open mouth gets a pointed roof.
      // -----------------------------------------------------------------------
      var FROG_KINDS = [
        { // tree frog: slim, long legs, huge eyes, round toe pads
          ba: 22, bh: 13, bw: 17, hump: 0.95, ha: 17, hh: 10.5, hw: 19, eR: 8.2, thigh: 8.4, arm: 3.8, toe: 13, toeR: 1.9, toePad: 3.5, padRad: 49,
          skin: '#84cc16', spot: '#65a30d', belly: '#fef3c7', iris: '#ef4444', pads: '#fb923c', web: '#fb923c', slit: 0.9, eyeDir: [0.7, 0.62, 0.36]
        },
        { // bullfrog: heavy, wide mouth, eardrum discs, ridges down the back
          ba: 26, bh: 15, bw: 21, hump: 0.9, ha: 21, hh: 11.5, hw: 23, eR: 6.2, thigh: 10, arm: 4.6, toe: 12, toeR: 2.1, toePad: 2.3, padRad: 56,
          skin: '#65a30d', spot: '#3f6212', belly: '#fef3c7', iris: '#fb923c', pads: '#4d7c0f', web: '#84cc16', slit: 0, eyeDir: [0.78, 0.45, 0.42], ears: '#a3e635', ridges: true
        },
        { // toad: low, wide, warty, short legs, glands behind the eyes
          ba: 24, bh: 13.5, bw: 23, hump: 0.7, ha: 17.5, hh: 9.5, hw: 21.5, eR: 5.6, thigh: 8, arm: 4.2, toe: 8.5, toeR: 2.1, toePad: 0, padRad: 53,
          skin: '#a16a4a', spot: '#6b4128', belly: '#fde4c4', iris: '#fb923c', pads: '#a16a4a', web: '#a16a4a', slit: 0, eyeDir: [0.7, 0.55, 0.45], glands: '#7c4a2d'
        }
      ];
      var FROG_PAD = '#15803d', FROG_TONGUE = '#fb7185', FROG_MOUTH = '#be123c', FROG_FLY = '#334155', FROG_FLYWING = '#e2e8f0';

      function etop(c, r, x, z) {
        var u = (x - c[0]) / r[0], w = (z - c[2]) / r[2], q = 1 - u * u - w * w;
        return q > 0 ? c[1] + r[1] * Math.sqrt(q) : -1e9;
      }

      // Lily pad: a closed polar disc (flat underside, rounded dome top, 15 pressed veins, a small heart-shaped notch at the back, clear of the frog).
      // It is its own shell, not part of the sculpted field, so its rim is smooth.
      function lilyPad(R, cx, dy) {
        var nr = 44, nt = 240, nVein = 15, nd = Math.PI, half = 0.3, tipR = (R - 9) / R, pos = [], idx = [], i, j;
        function edge(th) {
          var da = Math.abs(Math.atan2(Math.sin(th - nd), Math.cos(th - nd)));
          return R * (tipR + (1 - tipR) * smooth(da / half));
        }
        function top(x, z, th) {
          var r = Math.sqrt(x * x + z * z), t = r / Math.max(edge(th), 1e-3), sp = TAU / nVein, ang = ((th % sp) + sp) % sp, dist = Math.min(ang, sp - ang) * r;
          return 2.9 + 1.0 * (1 - t * t) - 0.7 * smooth((1.1 - dist) / 0.8) * smooth((r - 9) / 6) * smooth((0.93 - t) / 0.1);
        }
        pos.push(cx, dy, 0);
        for (j = 0; j < nt; j++) { var a0 = (j / nt) * TAU; pos.push(cx + Math.cos(a0) * edge(a0), dy, Math.sin(a0) * edge(a0)); }
        for (i = nr; i >= 1; i--) for (j = 0; j < nt; j++) {
          var th = (j / nt) * TAU, rr = (i / nr) * edge(th), x = Math.cos(th) * rr, z = Math.sin(th) * rr;
          pos.push(cx + x, dy + top(x, z, th), z);
        }
        pos.push(cx, dy + 3.9, 0);
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

      // Tree-frog eye: an iris dome that meets the globe at 46 degrees (so its lower rim prints) with an upright slit pupil.
      function slitEye(sc, S, id, pid, o, dir, parent, R0, iris, slit) {
        var e = S.face(id, o, dir, parent);
        if (!e) return null;
        var R = R0 * e.k, ang = 38, rise = (R / Math.sin(deg(ang))) * (1 - Math.cos(deg(ang)));
        S.addon(id, e.p, R);
        sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: ang, seg: 28, sink: 1.2 }), iris);
        var pu = S.sub(pid, id, vadd(e.p, vmul(e.n, rise * 0.72)), R * 0.5);
        if (!pu) return e;
        var hh2 = R * slit * pu.k, q = pu.p, up = vnorm(vsub([0, 1, 0], vmul(e.n, e.n[1])));
        sc.add('pupils', 'b', sweep([vadd(q, vmul(up, -hh2)).concat([0.45 * pu.k]), vadd(vadd(q, vmul(e.n, 0.15)), [0, 0, 0]).concat([Math.max(0.7, R * 0.22) * pu.k]), vadd(q, vmul(up, hh2)).concat([0.45 * pu.k])], { seg: 8, per: 3, floor: null }), '#0f172a');
        return e;
      }

      function buildFrog(p, api) {
        var K = FROG_KINDS[p.kind], size = p.size, sc = new Scene(), S = new Sculpt(1.3 / size).useEdits(api, size);
        var pl = p.plump, ba = K.ba * pl, bh = K.bh * Math.sqrt(pl), bw = K.bw * pl, ha = K.ha, hh = K.hh, hw = K.hw * (0.94 + 0.06 * pl);
        // An open mouth is a pointed arch (its roof climbs at about 52 degrees, so it prints), and the jaw drop makes the head taller.
        var mo = p.mouthOpen, mH = mo, mAz = mH / 1.3;
        if (p.mouth >= 1) hh = Math.max(hh, (7.5 + mH) / 1.95);
        var padOn = p.base === 1, PR = K.padRad * p.padSize, Y0 = -1.2, lift = padOn ? 2.6 : 0, px = -2; // the frog is sculpted on the bed (Y0 sinks its feet so they print flat) and lifted onto the pad afterwards
        var bx = -10, by = Y0 + bh * 0.62, hx = bx + ba * 0.75, hy = Y0 + hh * 0.95;
        var bodyC = [bx, by, 0], bodyR = [ba, bh, bw], humpC = [bx - ba * 0.3, by + bh * 0.28, 0], humpR = [ba * 0.75, bh * K.hump, bw * 0.9];
        var headC = [hx, hy, 0], headR = [ha, hh, hw];
        function topAt(x, z) { return Math.max(etop(bodyC, bodyR, x, z), etop(humpC, humpR, x, z), etop(headC, headR, x, z)); }
        var skin = K.skin, mouthY = Y0 + K.hh * 0.52, i, s;

        // ---- body and head ----
        S.piece('body');
        S.ell('skin', bodyC, bodyR, skin, 4);
        S.ell('skin', humpC, humpR, skin, 4);
        S.piece('head', 'body');
        S.ell('skin', headC, headR, skin, 4);
        S.paint('belly', [hx + ha * 0.45, Y0 - 1, 0], [ha * 0.95, hh * 0.78, hw * 0.8], K.belly);

        // ---- back: ridges (bullfrog), glands and warts (toad) ----
        if (K.ridges) {
          [-1, 1].forEach(function (sd) {
            S.piece(sd < 0 ? 'ridgeL' : 'ridgeR', 'body');
            var pts = [], t, x, z;
            for (t = 0; t <= 5; t++) { x = lerp(hx - ha * 0.42, bx - ba * 0.78, t / 5); z = sd * lerp(hw * 0.64, bw * 0.62, t / 5); pts.push([x, topAt(x, z) - 0.7, z, 1.8]); }
            S.path('skin', pts, skin, 2);
          });
        }
        if (K.glands) {
          [-1, 1].forEach(function (sd) {
            S.piece(sd < 0 ? 'glandL' : 'glandR', 'head');
            var gx = hx - ha * 0.52, gz = sd * hw * 0.6;
            S.ell('glands', [gx, topAt(gx, gz) - 1.6, gz], [8.2, 4.2, 4.8], K.glands, 2);
          });
        }
        if (p.warts > 0) {
          var bumps = [], n = 40, a;
          for (i = 0; i < n; i++) {
            var rr = Math.sqrt((i + 0.5) / n), aa = i * 2.39996 + 0.6, hsh = (Math.sin(i * 12.9898) * 43758.5453) % 1;
            bumps.push([bx - ba * 0.12 + ba * 0.92 * rr * Math.cos(aa), bw * 0.88 * rr * Math.sin(aa), 2.8 + Math.abs(hsh) * 1.6, 0.7 + Math.abs(hsh) * 0.5]);
          }
          S.piece('body');
          S.relief([bx - ba * 1.1, Y0 + bh * 0.4, -bw - 2], [bx + ba * 0.9, Y0 + bh * 2.2, bw + 2], function (x, y, z) {
            var g = smooth((y - (by + bh * 0.05)) / 3), sum = 0, j, b, dd;
            if (g <= 0) return 0;
            for (j = 0; j < bumps.length; j++) {
              b = bumps[j]; dd = ((x - b[0]) * (x - b[0]) + (z - b[1]) * (z - b[1])) / (b[2] * b[2]);
              if (dd < 1) sum = Math.max(sum, (1 - dd) * (1 - dd) * b[3]);
            }
            return -p.warts * 2.1 * g * sum;
          });
        }
        if (p.spots === 1) {
          var spots = [[-18, -9, 3.6], [-8, 12, 3.2], [-26, 6, 3], [-2, -7, 2.6], [-14, 1, 2.8], [-22, -15, 2.8], [4, 9, 2.4], [-30, -2, 2.4]];
          spots.forEach(function (q) {
            var sx = bx + q[0] * ba / 22, sz = q[1] * bw / 17, sy = topAt(sx, sz);
            if (sy > 0) S.paint('spots', [sx, sy - 0.8, sz], [q[2], 2.6, q[2]], K.spot);
          });
        }

        // ---- mouth ----
        var open = p.mouth >= 1;
        S.piece('head', 'body');
        if (!open) {
          var gp = [], th, ym, q2, hs;
          for (i = -6; i <= 6; i++) {
            th = (i / 6) * 1.5; ym = mouthY + 2.4 * Math.pow(Math.abs(i) / 6, 2);
            q2 = 1 - Math.pow((ym - hy) / hh, 2); hs = Math.sqrt(Math.max(q2, 0.05));
            gp.push([hx + (ha * hs - 0.6) * Math.cos(th), ym, (hw * hs - 0.6) * Math.sin(th), 1.5]);
          }
          S.path(null, gp, null, 0).carve(0.5);
        } else {
          var ccx = hx + ha * 0.8, ccy = Y0 + 4.5, cax = ha * 0.8;
          S._op({ name: null, carve: true, k: 1.2, lo: [ccx - cax, ccy, -mAz], hi: [ccx + cax, ccy + mH, mAz], d: function (x, y, z) {
            var u = Math.sqrt(((x - ccx) / cax) * ((x - ccx) / cax) + (z / mAz) * (z / mAz));
            return Math.max((u - (1 - (y - ccy) / mH)) * Math.min(cax, mAz) * 0.6, ccy - y);
          } });
          S.paint('mouth', [ccx, ccy + mH * 0.3, 0], [cax * 0.82, mH * 0.58, mAz * 0.78], FROG_MOUTH);
        }

        // ---- eyes: mounds and globes on the head ----
        var eR = K.eR * p.eye, ez = hw * p.eyeSet, ex = hx + ha * 0.14, eyes = [];
        [-1, 1].forEach(function (sd) {
          var ey = topAt(ex, sd * ez) + eR * 0.5, id = sd < 0 ? 'bulgeL' : 'bulgeR';
          S.piece(id, 'head');
          S.ell('skin', [ex, ey - eR * 1.05, sd * ez], [eR * 1.05, eR * 1.05, eR * 1.05], skin, 3);
          S.ell('skin', [ex, ey, sd * ez], [eR, eR * 0.96, eR], skin, 2);
          eyes.push({ sd: sd, id: id, c: [ex, ey, sd * ez] });
        });

        // ---- front legs ----
        [-1, 1].forEach(function (sd) {
          var id = sd < 0 ? 'armL' : 'armR', sx = hx - ha * 0.46, sz = sd * hw * 0.8, wx = hx + ha * 0.3, wz = sd * hw * 0.84, f, ph, tipx, tipz;
          S.piece(id, 'body');
          S.path('limbs', [[sx, Y0 + 11, sz, K.arm * 1.45], [sx + 1, Y0 + 5.5, sd * hw * 0.93, K.arm * 1.05], [wx, Y0 + 2.6, wz, K.arm * 0.85]], skin, 3);
          S.piece(id + 'Hand', id);
          for (f = 0; f < 4; f++) {
            ph = (f - 1.5) * 0.36; tipx = wx + 8.5 * Math.cos(ph); tipz = wz + 8.5 * Math.sin(ph);
            S.path('limbs', [[wx, Y0 + 2.4, wz, K.arm * 0.8], [tipx, Y0 + K.toeR * 0.8, tipz, K.toeR]], skin, 1.5, 2);
            if (K.toePad) S.ell('toes', [tipx, Y0 + K.toePad * 0.8, tipz], [K.toePad, K.toePad * 0.85, K.toePad], K.pads, 1);
          }
        });

        // ---- hind legs: folded thigh, shin and a webbed foot, all lying on the pad ----
        var thR = K.thigh * p.legs;
        [-1, 1].forEach(function (sd) {
          var id = sd < 0 ? 'legL' : 'legR', hip = [bx - ba * 0.3, by + bh * 0.1, sd * bw * 0.8], knee = [bx + ba * 0.38, Y0 + thR * 0.66, sd * (bw + thR * 0.8)];
          var ank = [bx - ba * 0.7, Y0 + 3.2, sd * (bw + thR * 1.35 + 3)], f, ph, tipx, tipz, tl = K.toe * (0.85 + 0.15 * p.legs);
          S.piece(id, 'body');
          S.path('limbs', [[hip[0], hip[1], hip[2], thR], [bx + ba * 0.04, Y0 + thR * 1.0, sd * (bw + thR * 0.55), thR * 1.05], [knee[0], knee[1], knee[2], thR * 0.7]], skin, 4);
          S.path('limbs', [[knee[0], knee[1], knee[2], thR * 0.6], [bx - ba * 0.18, Y0 + 3.6, sd * (bw + thR * 1.4 + 1), 3.9], [ank[0], ank[1], ank[2], 3.2]], skin, 3);
          S.piece(id + 'Foot', id);
          S.ell('web', [ank[0] + tl * 0.55, Y0 + 1.7, ank[2] + sd * 0.6], [tl * 0.62, 1.8, tl * 0.72], K.web, 1);
          for (f = 0; f < 4; f++) {
            ph = (f - 1.5) * 0.4; tipx = ank[0] + tl * Math.cos(ph); tipz = ank[2] + sd * 1.2 + tl * Math.sin(ph);
            S.path('limbs', [[ank[0], Y0 + 2.6, ank[2], 2.8], [tipx, Y0 + K.toeR * 0.8, tipz, K.toeR]], skin, 1.5, 2);
            if (K.toePad) S.ell('toes', [tipx, Y0 + K.toePad * 0.8, tipz], [K.toePad, K.toePad * 0.85, K.toePad], K.pads, 1);
          }
        });

        // ---- tongue and fly ----
        var fly = null;
        if (p.mouth === 2) {
          var L = p.tongue, up = deg(p.tongueUp), fy0 = Y0 + 7.2, lipx = hx + ha * 0.95;
          var tip = [lipx + L * Math.cos(up), fy0 + L * Math.sin(up), 0], fs = p.fly;
          S.piece('tongue', 'head');
          S.ell('tongue', [lipx - 5, fy0 - 0.2, 0], [7, 3.4, 4.2], FROG_TONGUE, 2); // the root, lying on the jaw floor
          S.path('tongue', [[lipx - 2.5, fy0, 0, 3.3], [tip[0], tip[1], 0, 2.4]], FROG_TONGUE, 2); // a straight pole: it climbs at the lift angle, so it prints
          S.ell('tongue', [tip[0], tip[1], 0], [3.3, 3.3, 3.3], FROG_TONGUE, 1.5);
          S.piece('fly', 'tongue');
          fly = { c: [tip[0] - 1.8, tip[1] + 3.3 * fs, 0], f: fs };
          S.ell('fly', fly.c, [6.4 * fs, 3.9 * fs, 4.2 * fs], FROG_FLY, 1.2);
          S.ell('fly', [fly.c[0] + 4.6 * fs, fly.c[1] + 0.6 * fs, 0], [2.9 * fs, 2.8 * fs, 3 * fs], FROG_FLY, 1);
        }

        S.smoothing = 26;
        S.reach = 1.0; // forms may lean out up to about 50 degrees from the bed: the print check allows 40, the kit's default 0.72 is stricter than a frog needs
        S.run();

        // ---- details placed on the finished surface: eyes, eardrums, fly eyes and wings ----
        eyes.forEach(function (e) {
          var sd = e.sd, n = vnorm([K.eyeDir[0], K.eyeDir[1], sd * K.eyeDir[2]]), o = vadd(e.c, vmul(n, 60)), dir = vmul(n, -1), pid = sd < 0 ? 'pupilL' : 'pupilR', eid = sd < 0 ? 'eyeL' : 'eyeR';
          if (K.slit) slitEye(sc, S, eid, pid, o, dir, e.id, eR * 0.5, K.iris, K.slit);
          else softEye(sc, S, eid, pid, o, dir, e.id, eR * 0.74, K.iris);
        });
        if (K.ears) {
          [-1, 1].forEach(function (sd) {
            var id = sd < 0 ? 'earL' : 'earR', t = S.face(id, [hx - ha * 0.12, hy - hh * 0.02, sd * 80], [0, 0, -sd], 'head');
            if (t) { S.addon(id, t.p, 6.4 * t.k); sc.add('ears', 'b', dome(t.p, t.n, 6.4 * t.k, { angle: 36, seg: 36, sink: 1.2 }), K.ears); }
          });
        }
        S.addTo(sc);
        if (padOn) {
          S.shell(sc, 'pad', 'pad', 'b', lilyPad(PR, px, -lift), FROG_PAD); // in the sculpt frame, which sits `lift` lower
          sc.order.forEach(function (name) { sc.groups[name].forEach(function (a) { for (var q = 1; q < a.length; q += 3) a[q] += lift; }); });
          S.yOff = lift;
        }
        if (fly) {
          var fc = fly.c, f2 = fly.f, w;
          [-1, 1].forEach(function (sd) {
            var id = sd < 0 ? 'flyEyeL' : 'flyEyeR';
            var fd = vnorm([0.8, 0.2, sd * 0.55]), e2 = S.face(id, vadd([fc[0] + 4.6 * f2, fc[1] + 0.6 * f2, 0], vmul(fd, 30)), vmul(fd, -1), 'fly');
            if (e2) { S.addon(id, e2.p, 1.5 * f2 * e2.k); sc.add('flyeyes', 'b', dome(e2.p, e2.n, 1.5 * f2 * e2.k, { angle: 50, seg: 16, sink: 0.9 }), '#ef4444'); }
            var poly = [[-1.5, -1], [3.5, 5], [7, 11], [8.6, 15], [5.6, 14.2], [1.8, 9.5], [-1.5, 4.5]].map(function (q) { return [q[0] * 0.8 * f2, q[1] * 0.8 * f2]; });
            var ah = Math.PI + sd * 0.7, al = [Math.cos(ah), 0, -Math.sin(ah)], sv = [Math.sin(ah), 0, Math.cos(ah)], tl = 0.4, up2 = [sv[0] * sd * Math.sin(tl), Math.cos(tl), sv[2] * sd * Math.sin(tl)];
            var nz = vcross(al, up2);
            w = slab(poly, { o: [fc[0] - 0.5, fc[1] + 1.6 * f2, fc[2] + sd * 1.6 * f2], x: al, y: up2, z: vmul(nz, 1) }, 1.4, 0.3);
            S.shell(sc, sd < 0 ? 'wingL' : 'wingR', 'flywings', 'b', w, FROG_FLYWING, 'fly');
          });
        }
        return finishSculpt(sc, size, S);
      }

      var FROG_PARAMS = [
        { group: 'Frog', key: 'kind', label: 'Kind', unit: '', min: 0, max: 2, step: 1, value: 0, format: function (v) { return ['Tree frog', 'Bullfrog', 'Toad'][v]; } },
        { group: 'Frog', key: 'size', label: 'Overall size', unit: '×', min: 0.8, max: 1.25, step: 0.05, value: 1 },
        { group: 'Frog', key: 'plump', label: 'Body (slim ↔ chubby)', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Frog', key: 'legs', label: 'Back legs (small ↔ big)', unit: '×', min: 0.8, max: 1.1, step: 0.05, value: 1 },
        { group: 'Eyes', key: 'eye', label: 'Eye size', unit: '×', min: 0.7, max: 1.5, step: 0.05, value: 1.1 },
        { group: 'Eyes', key: 'eyeSet', label: 'Eye spacing (close ↔ wide)', unit: '', min: 0.4, max: 0.62, step: 0.02, value: 0.52, format: function (v) { return Math.round((v - 0.4) / 0.22 * 100) + '%'; } },
        { group: 'Mouth', key: 'mouth', label: 'Mouth', unit: '', min: 0, max: 2, step: 1, value: 0, format: function (v) { return ['Closed smile', 'Open wide', 'Tongue & fly'][v]; } },
        { group: 'Mouth', key: 'mouthOpen', label: 'Mouth opening (height)', unit: ' mm', min: 11, max: 18, step: 1, value: 12, showIf: function (p) { return p.mouth >= 1; } },
        { group: 'Mouth', key: 'tongue', label: 'Tongue length', unit: ' mm', min: 24, max: 40, step: 1, value: 28, showIf: function (p) { return p.mouth === 2; } },
        { group: 'Mouth', key: 'tongueUp', label: 'Tongue lift (steeper prints better)', unit: '°', min: 60, max: 82, step: 1, value: 64, showIf: function (p) { return p.mouth === 2; } },
        { group: 'Mouth', key: 'fly', label: 'Fly size', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1.1, showIf: function (p) { return p.mouth === 2; } },
        { group: 'Skin', key: 'warts', label: 'Warts (0 = smooth)', unit: '×', min: 0, max: 1.6, step: 0.1, value: 0, showIf: function (p) { return p.kind === 2; } },
        { group: 'Skin', key: 'spots', label: 'Back spots', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] },
        { group: 'Base', key: 'base', label: 'Base', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['No base', 'Lily pad'] },
        { group: 'Base', key: 'padSize', label: 'Lily pad size', unit: '×', min: 0.9, max: 1.4, step: 0.05, value: 1, showIf: function (p) { return p.base === 1; } }
      ];

      window.MM_GENERATOR = {
        code: 'MM-125',
        category: 'ANIMALS // AMPHIBIANS',
        title: 'Frog & Toad',
        fileName: 'Frog_Toad',
        defaultColor: '#84cc16',
        palette: [
          { name: 'Leaf Green', color: '#84cc16' }, { name: 'Pond Green', color: '#15803d' },
          { name: 'Toad Brown', color: '#a16a4a' }, { name: 'Cream Belly', color: '#fef3c7' },
          { name: 'Tongue Pink', color: '#fb7185' }, { name: 'Sunny Orange', color: '#fb923c' },
          { name: 'Cherry Red', color: '#ef4444' }, { name: 'Shadow Black', color: '#334155' }
        ],
        partNames: { skin: 'Body & head', limbs: 'Legs & arms', web: 'Webbed feet', toes: 'Toe pads', belly: 'Belly & throat', mouth: 'Mouth inside', spots: 'Back spots', glands: 'Neck glands', ears: 'Eardrums', eyes: 'Eyes', pupils: 'Pupils', glints: 'Eye glints', tongue: 'Tongue', fly: 'Fly', flyeyes: 'Fly eyes', flywings: 'Fly wings', pad: 'Lily pad' },
        parameters: FROG_PARAMS,
        presets: makePresets(FROG_PARAMS, [
          ['Default tree frog', {}],
          ['Fly catcher', { mouth: 2 }],
          ['Chubby tree frog', { plump: 1.2, eye: 1.3, legs: 1.1 }],
          ['Bullfrog', { kind: 1 }],
          ['Big-mouth bullfrog', { kind: 1, mouth: 1, mouthOpen: 16 }],
          ['Bullfrog and fly', { kind: 1, mouth: 2, tongue: 30 }],
          ['Warty toad', { kind: 2, warts: 1 }],
          ['Toad catching a fly', { kind: 2, warts: 1, mouth: 2, tongue: 24 }],
          ['Tiny frog, no pad', { size: 0.8, base: 0, eye: 1.3 }]
        ]),
        sculpt: sculptModule([
          { id: 'head', label: 'Head', section: 'Head' }, { id: 'bulgeL', label: 'Left eye mound', section: 'Head' }, { id: 'bulgeR', label: 'Right eye mound', section: 'Head' },
          { id: 'eyeL', label: 'Left eye', section: 'Head', parent: 'bulgeL' }, { id: 'eyeR', label: 'Right eye', section: 'Head', parent: 'bulgeR' },
          { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' },
          { id: 'earL', label: 'Left eardrum', section: 'Head' }, { id: 'earR', label: 'Right eardrum', section: 'Head' },
          { id: 'glandL', label: 'Left gland', section: 'Head' }, { id: 'glandR', label: 'Right gland', section: 'Head' },
          { id: 'body', label: 'Body', section: 'Body' }, { id: 'ridgeL', label: 'Left back ridge', section: 'Body' }, { id: 'ridgeR', label: 'Right back ridge', section: 'Body' },
          { id: 'armL', label: 'Left arm', section: 'Legs' }, { id: 'armR', label: 'Right arm', section: 'Legs' }, { id: 'armLHand', label: 'Left hand', section: 'Legs', parent: 'armL' }, { id: 'armRHand', label: 'Right hand', section: 'Legs', parent: 'armR' },
          { id: 'legL', label: 'Left back leg', section: 'Legs' }, { id: 'legR', label: 'Right back leg', section: 'Legs' }, { id: 'legLFoot', label: 'Left foot', section: 'Legs', parent: 'legL' }, { id: 'legRFoot', label: 'Right foot', section: 'Legs', parent: 'legR' },
          { id: 'tongue', label: 'Tongue', section: 'Fly' }, { id: 'fly', label: 'Fly', section: 'Fly', parent: 'tongue' }, { id: 'flyEyeL', label: 'Fly left eye', section: 'Fly', parent: 'fly' }, { id: 'flyEyeR', label: 'Fly right eye', section: 'Fly', parent: 'fly' },
          { id: 'wingL', label: 'Fly left wing', section: 'Fly', parent: 'fly' }, { id: 'wingR', label: 'Fly right wing', section: 'Fly', parent: 'fly' },
          { id: 'pad', label: 'Lily pad', section: 'Base' }
        ]),
        build: buildFrog
      };
