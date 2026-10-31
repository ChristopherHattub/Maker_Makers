      // -----------------------------------------------------------------------
      // Dragon Maker: a sitting dragon sculpted as one seamless surface: folded wings, horns, belly plates, spade tail
      // -----------------------------------------------------------------------
      function buildDragon(p, api) {
        var sc = new Scene(), S = new Sculpt(1.5).useEdits(api), hs = p.headSize, col = '#a78bfa', belly = '#fde68a', dark = '#7c3aed', pale = '#ddd6fe', L = p.tailLen, i;
        S.piece('torso');
        S.ell('body', [-5, 18, 0], [22, 20, 18], col, 5);
        S.path('body', [[0, 26, 0, 16], [8, 44, 0, 12.5], [11, 58, 0, 9.5], [9, 70, 0, 8.5], [14, 80, 0, 8]], col, 7);
        // belly plates: horizontal grooves on a painted front
        S.paint('belly', [13, 34, 0], [12, 30, 10], belly);
        for (i = 0; i < 5; i++) { var by = 16 + i * 8.5, bx = 15 + i * 1.1; S.path(null, [[bx + 2, by, -8, 0.8], [bx + 5, by - 1, 0, 0.9], [bx + 2, by, 8, 0.8]], null, 0, 3); S.carve(0.8); }
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'hindL' : 'hindR');
          S.ell('body', [-8, 14, s * 14], [16, 14, 8], col, 4);
          S.ell('feet', [10, 3.4, s * 14], [12, 3.9, 6.6], dark, 2.5);
          for (var t = -1; t <= 1; t++) S.ell('claws', [21, 2.3, s * 14 + t * 3.8], [3, 2.4, 1.8], pale, 0.8);
          S.piece(s < 0 ? 'armL' : 'armR');
          S.path('arms', [[9, 42, s * 10, 3.8], [15, 37, s * 11, 3], [19, 42, s * 9.5, 2.3]], dark, 2);
        });
        // head with a long snout, brow and jaw
        var hr = 15.5 * hs, hx = 22, hy = 90;
        S.piece('head');
        S.ell('head', [hx, hy, 0], [hr * 1.05, hr * 0.8, hr * 0.82], col, 6);
        S.ell('head', [hx + hr * 1.05, hy - hr * 0.14, 0], [hr * 0.9, hr * 0.42, hr * 0.52], col, 4);
        S.ell('jaw', [hx + hr * 0.8, hy - hr * 0.62, 0], [hr * 0.86, hr * 0.26, hr * 0.48], belly, 2.2);
        [-1, 1].forEach(function (s) {
          S.piece('head');
          S.ell('head', [hx + hr * 1.62, hy + hr * 0.08, s * hr * 0.24], [hr * 0.17, hr * 0.17, hr * 0.17], col, 1.5); // nostril bump
          S.path('head', [[hx - hr * 0.1, hy + hr * 0.7, s * hr * 0.48, 2.5], [hx + hr * 0.4, hy + hr * 0.6, s * hr * 0.42, 1.8]], col, 1.6);
          S.path(null, [[hx + hr * 1.85, hy - hr * 0.4, s * hr * 0.4, 0.9], [hx + hr * 0.4, hy - hr * 0.34, s * hr * 0.72, 1]], null, 0).carve(0.8);
          S.piece('horns', 'head');
          var hb = [hx - hr * 0.5, hy + hr * 0.45, s * hr * 0.46], H = 18 * p.horns;
          S.path('horns', [[hb[0], hb[1], hb[2], 3.6], [hb[0] - H * 0.28, hb[1] + H * 0.52, hb[2] + s * H * 0.08, 2.6], [hb[0] - H * 0.38, hb[1] + H, hb[2] + s * H * 0.04, 0.5]], '#f1f5f9', 1.5);
          var eb = [hx - hr * 0.8, hy + hr * 0.1, s * hr * 0.66];
          S.path('horns', [[eb[0], eb[1], eb[2], 2.5], [eb[0] - 4, eb[1] + 6 * p.horns, eb[2] + s * 3, 1.5], [eb[0] - 5, eb[1] + 11 * p.horns, eb[2] + s * 5, 0.4]], pale, 1);
        });
        // tail on the bed, ending in a spade
        var tailPts = [[-20, 8, 0, 11], [-40 * L, 5.4, 9, 7.6], [-62 * L, 3.4, 12 * p.curl + 2, 4.8], [-82 * L, 2.1, 4 * p.curl, 2.8]];
        S.piece('tail');
        S.path('tail', tailPts, col, 5);
        var tip = tailPts[3], sa = tip[0], sz = tip[2];
        S.ell('spade', [sa - 5, 1.8, sz], [9, 2.2, 7], dark, 1.5);
        S.ell('spade', [sa - 12, 1.8, sz], [4.5, 2, 3.2], dark, 1.5);
        // back spikes: triangular fins on the neck, back and tail
        S.piece('spines');
        var n = Math.round(p.spines), sz0 = p.spineSize;
        for (i = 0; i < n; i++) {
          var u = n > 1 ? i / (n - 1) : 0, x, y, z = 0, H2;
          if (u < 0.38) { var w = u / 0.38, nk = spline([[3, 78, 0], [1, 62, 0], [-5, 47, 0], [-14, 36, 0], [-24, 27, 0]], 6), np = nk[Math.round(w * (nk.length - 1))]; x = np[0]; y = np[1]; H2 = 9 * sz0; }
          else { var w2 = (u - 0.38) / 0.62, q = spline(tailPts.map(function (a) { return a.slice(0, 3); }), 6), pt = q[Math.round(w2 * (q.length - 2))]; x = pt[0]; y = pt[1] + lerp(9, 2, w2); z = pt[2]; H2 = lerp(8.5, 4, w2) * sz0; }
          S.plate('spines', [[-H2 * 0.62, y - 3], [H2 * 0.62, y - 3], [-H2 * 0.38, y + H2]], [x, 0, z], [1, 0, 0], 2.6, pale, 1.2, 1);
        }
        // wings: folded up behind the shoulders, ribs over a membrane
        if (p.wings > 0) [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'wingL' : 'wingR');
          var W = p.wings, x0 = -4, y0 = 42, d = [-Math.cos(deg(30)), 0, s * Math.sin(deg(30))], at = [x0, 0, s * 9];
          var poly = [[-3, y0], [24 * W, y0 + 26 * W], [36 * W, y0 + 44 * W], [27 * W, y0 + 45 * W], [24 * W, y0 + 58 * W], [15 * W, y0 + 54 * W], [10 * W, y0 + 66 * W], [2 * W, y0 + 52 * W], [-3, y0 + 40 * W]];
          S.plate('wings', poly, at, d, 3, pale, 1.5, 1);
          function rib(ex, ey, r0) { return [[at[0] + d[0] * -1, y0 + 5, at[2] + d[2] * -1, r0], [at[0] + d[0] * ex, y0 + ey, at[2] + d[2] * ex, r0 * 0.68]]; }
          S.path('wing ribs', rib(34 * W, 43 * W, 2.6), dark, 1);
          S.path('wing ribs', rib(23 * W, 56 * W, 2.6), dark, 1);
          S.path('wing ribs', rib(10 * W, 64 * W, 2.6), dark, 1);
        });
        S.reach = 0.7;
        S.run();
        [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'eyeL' : 'eyeR', e = S.face(id, [180, hy + hr * 0.26, s * hr * 0.52], [-1, 0, 0], 'head');
          if (!e) return;
          var R = 3.8 * hs * e.k;
          S.addon(id, e.p, R);
          sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 36 }), '#fbbf24');
          var ps = S.sub(s < 0 ? 'pupilL' : 'pupilR', id, vadd(e.p, vmul(e.n, R * 0.2)), R * 0.6);
          if (ps) { var pu = ps.p; sc.add('pupils', 'b', sweep([[pu[0], pu[1] - R * 0.6 * ps.k, pu[2], 0.6 * ps.k], [pu[0] + 0.2, pu[1], pu[2], 0.9 * ps.k], [pu[0], pu[1] + R * 0.6 * ps.k, pu[2], 0.6 * ps.k]], { seg: 8, per: 3, floor: null }), '#1e293b'); }
        });
        if (p.gem > 0) { var g = S.face('gem', [180, 46, 0], [-1, 0, 0], 'torso'); if (g) { sc.add('gem', 'b', dome(g.p, g.n, 3.6 * g.k, { angle: 55, seg: 8 }), '#f0abfc'); S.addon('gem', g.p, 3.6 * g.k); } }
        S.addTo(sc);
        return finishSculpt(sc, 1, S);
      }

      var DRAGON_PARAMS = [
        { group: 'Dragon', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Dragon', key: 'horns', label: 'Horn length', unit: '×', min: 0.5, max: 1.5, step: 0.05, value: 1 },
        { group: 'Dragon', key: 'gem', label: 'Chest gem', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] },
        { group: 'Wings', key: 'wings', label: 'Wing size (0 = none)', unit: '×', min: 0, max: 1.2, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'spines', label: 'Back spikes', unit: '', min: 0, max: 14, step: 1, value: 10, slider: true },
        { group: 'Spine & tail', key: 'spineSize', label: 'Spike size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'tailLen', label: 'Tail length', unit: '×', min: 0.7, max: 1.25, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'curl', label: 'Tail curl (straight ↔ curled)', unit: '×', min: 0, max: 2, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-077',
        category: 'ANIMALS // FANTASY',
        title: 'Dragon Maker',
        fileName: 'Dragon',
        defaultColor: '#a78bfa',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly plates', feet: 'Feet', claws: 'Claws', arms: 'Arms', head: 'Head', jaw: 'Jaw', eyes: 'Eyes', pupils: 'Pupils', horns: 'Horns', spines: 'Back spikes', tail: 'Tail', spade: 'Tail spade', wings: 'Wings', 'wing ribs': 'Wing ribs', gem: 'Chest gem' },
        parameters: DRAGON_PARAMS,
        presets: makePresets(DRAGON_PARAMS, [
          ['Default dragon', {}],
          ['Baby dragon', { headSize: 1.25, wings: 0.65, spines: 6, tailLen: 0.75, horns: 0.6 }],
          ['Spiky wyvern', { spines: 14, spineSize: 1.3, horns: 1.5, wings: 1.2 }],
          ['Wingless drake', { wings: 0, headSize: 1.15, horns: 1.2, gem: 0 }],
          ['Curled tail dragon', { curl: 2, tailLen: 1.2 }]
        ]),
        sculpt: sculptModule([
          { id: 'head', label: 'Head', section: 'Head' }, { id: 'horns', label: 'Horns', section: 'Head' }, { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'gem', label: 'Chest gem', section: 'Body' }, { id: 'spines', label: 'Back spikes', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' }, { id: 'wingL', label: 'Left wing', section: 'Body' }, { id: 'wingR', label: 'Right wing', section: 'Body' },
          { id: 'armL', label: 'Left arm', section: 'Limbs' }, { id: 'armR', label: 'Right arm', section: 'Limbs' }, { id: 'hindL', label: 'Left leg', section: 'Limbs' }, { id: 'hindR', label: 'Right leg', section: 'Limbs' }
        ]),
        build: buildDragon
      };
