      // -----------------------------------------------------------------------
      // Elephant Builder: sculpted as one seamless surface: fan ears, a wrinkled trunk, rising tusks and toenails
      // -----------------------------------------------------------------------
      function buildElephant(p) {
        var sc = new Scene(), S = new Sculpt(1.55), grey = '#cbd5e1', dk = '#94a3b8', ivory = '#fffbeb', lr = p.legs, B = p.bulk, hs = p.head, E = p.ears, i;
        S.ell('body', [-3, 28 * B, 0], [33 * B, 26 * B, 21 * B], grey, 5);
        S.ell('body', [14 * B, 32 * B, 0], [18 * B, 22 * B, 19 * B], grey, 8);
        var lz = 15 * B;
        [[20 * B], [-23 * B]].forEach(function (q) {
          [-1, 1].forEach(function (s) {
            S.path('legs', [[q[0], 28 * B, s * lz * 0.9, lr * 1.3], [q[0], 13, s * lz, lr * 1.04], [q[0], lr * 0.6, s * lz, lr * 1.12]], grey, 4);
            for (var t = -1; t <= 1; t++) {
              var a = deg(t * 34);
              S.ell('toes', [q[0] + Math.cos(a) * lr * 0.94, 2.4, s * lz + Math.sin(a) * lr * 0.94], [2.6, 2.7, 2.5], '#f8fafc', 0.8);
            }
          });
        });
        // head with a domed brow and a mouth under the trunk
        var hr = 18 * hs, hx = 28 * B + hr * 0.2, hy = 44 * B + hr * 0.5;
        S.ell('head', [hx, hy, 0], [hr, hr * 0.98, hr * 0.92], grey, 7);
        S.ell('head', [hx + hr * 0.1, hy + hr * 0.62, 0], [hr * 0.62, hr * 0.42, hr * 0.7], grey, 5);
        S.ell('jaw', [hx + hr * 0.42, hy - hr * 0.72, 0], [hr * 0.5, hr * 0.32, hr * 0.5], dk, 3);
        // trunk: wrinkle grooves pressed across it
        var tr = 6.8 * p.trunkW, fx = hx + hr * 0.82, fy = hy - hr * 0.1, pts;
        if (Math.round(p.trunk) === 1) pts = [[fx - 9, fy - 2, 0, tr * 1.16], [fx - 1, fy + hr * 0.34, 0, tr * 0.98], [fx + 7, fy + hr * 0.92, 0, tr * 0.8], [fx + 10, fy + hr * 1.5, 0, tr * 0.62], [fx + 3, fy + hr * 2, 0, tr * 0.5]];
        else { var foot = fx + Math.min(fy * 0.24, 11); pts = [[fx - 4, fy + 4, 0, tr * 1.16], [fx + 3, fy * 0.72, 0, tr * 0.98], [lerp(fx, foot, 0.72), fy * 0.4, 0, tr * 0.82], [foot, tr * 1.2, 0, tr * 0.76], [foot + 1, tr * 0.5, 0, tr * 0.78]]; }
        S.path('trunk', pts, grey, 4);
        var wr = spline(pts.map(function (a) { return a.slice(0, 3); }), 5);
        for (i = 3; i < wr.length - 2; i += 2) {
          var pa = wr[i], tn = vnorm(vsub(wr[i + 1], wr[i - 1])), rw = lerp(tr * 0.95, tr * 0.6, i / wr.length) + 0.3, sdv = [0, 0, 1], up2 = vcross(sdv, tn);
          S.path(null, [vadd(pa, vadd(vmul(sdv, -rw * 0.8), vmul(up2, rw * 0.5))).concat([0.55]), vadd(pa, vmul(up2, rw * 1.04)).concat([0.65]), vadd(pa, vadd(vmul(sdv, rw * 0.8), vmul(up2, rw * 0.5))).concat([0.55])], null, 0, 2).carve(0.5);
        }
        [-1, 1].forEach(function (s) {
          // ear: a fan plate that leans out and back. Its lower edge climbs from the root, and its inside is painted.
          var L = 30 * E, y0 = hy - hr * 0.3, d = [-Math.cos(deg(58)), 0, s * Math.sin(deg(58))], root = [hx - hr * 0.2, 0, s * hr * 0.62];
          var ear = [[-5, y0], [L * 0.62, y0 + L * 0.7], [L * 0.98, y0 + L * 0.98], [L * 1.06, y0 + L * 1.22], [L * 0.86, y0 + L * 1.42], [L * 0.46, y0 + L * 1.48], [L * 0.1, y0 + L * 1.3], [-5, y0 + L * 0.95]];
          S.plate('ears', ear, root, d, 3.6, dk, 2.2, 1.5);
          var c1 = vadd(root, vmul(d, L * 0.56)), inner = [c1[0] + 1, y0 + L * 1.02, c1[2]];
          S.paint('inner ears', [inner[0] + 2, inner[1], inner[2]], [L * 0.42, L * 0.34, L * 0.46], '#fda4af');
          if (p.tusk > 0) {
            var tb = [hx + hr * 0.5, hy - hr * 0.56, s * hr * 0.44], tl = 15 * p.tusk;
            S.path('tusks', [tb.concat([3.4]), [tb[0] + tl * 0.48, tb[1] + tl * 0.5, tb[2] + s * tl * 0.1, 2.7], [tb[0] + tl * 0.8, tb[1] + tl * 1.2, tb[2] + s * tl * 0.14, 0.7]], ivory, 1);
          }
        });
        var ty = 40 * B;
        S.path('tail', [[-33 * B, ty, 0, 2.8], [-37 * B, ty * 0.62, 0, 2.2], [-38 * B, ty * 0.3, 0, 2], [-38 * B, 4, 0, 3.2], [-38 * B, 1, 0, 3.6]], dk, 2);
        S.reach = 0.72;
        S.run();
        [-1, 1].forEach(function (s) {
          var e = S.hit([hx + 200, hy + hr * 0.34, s * hr * 0.6], [-1, 0, 0]), R = 3.3 * hs;
          sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 46 }), '#1e293b');
          sc.add('eyes', 'b', dome(vadd(e.p, vadd(vmul(e.n, R * 0.34), [0, R * 0.3, 0])), e.n, R * 0.26, { sink: 0.4 }), '#1e293b');
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size);
      }
      var ELE_PARAMS = [
        { group: 'Elephant', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Elephant', key: 'bulk', label: 'Body (compact ↔ huge)', unit: '×', min: 0.85, max: 1.15, step: 0.05, value: 1 },
        { group: 'Elephant', key: 'legs', label: 'Leg thickness', unit: ' mm', min: 7, max: 11, step: 0.5, value: 8.5 },
        { group: 'Head', key: 'head', label: 'Head size', unit: '×', min: 0.9, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'ears', label: 'Ear size', unit: '×', min: 0.7, max: 1.2, step: 0.05, value: 1 },
        { group: 'Head', key: 'tusk', label: 'Tusk length (0 = none)', unit: '×', min: 0, max: 1.5, step: 0.05, value: 0.9 },
        { group: 'Trunk', key: 'trunk', label: 'Trunk', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Resting on the bed', 'Raised'] },
        { group: 'Trunk', key: 'trunkW', label: 'Trunk thickness', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 }
      ];
      window.MM_GENERATOR = {
        code: 'MM-088',
        category: 'ANIMALS // WILDLIFE',
        title: 'Elephant Builder',
        fileName: 'Elephant',
        defaultColor: '#cbd5e1',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', legs: 'Legs', toes: 'Toenails', head: 'Head', jaw: 'Jaw', eyes: 'Eyes', ears: 'Ears', 'inner ears': 'Inner ears', tusks: 'Tusks', trunk: 'Trunk', tail: 'Tail' },
        parameters: ELE_PARAMS,
        presets: makePresets(ELE_PARAMS, [
          ['Default elephant', {}],
          ['Happy trunk-up', { trunk: 1 }],
          ['Baby elephant', { size: 0.7, head: 1.25, ears: 1.15, tusk: 0, bulk: 0.9 }],
          ['Big tusker', { size: 1.25, tusk: 1.3, ears: 1.1, bulk: 1.1, legs: 10 }]
        ]),
        build: buildElephant
      };
