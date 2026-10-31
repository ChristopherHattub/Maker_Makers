      // -----------------------------------------------------------------------
      // Penguin Pals: a penguin with an optional chick, scarf or party hat
      // -----------------------------------------------------------------------
      function penguinForms(S, at, z0, sz, p) {
        var black = '#334155', white = '#f8fafc', gold = '#fbbf24', H = 60 * sz, R = 17 * sz * p.chunk;
        S.ell('body', [at, H * 0.42, z0], [R * 1.08, H * 0.46, R], black, 4 * sz);
        S.ell('body', [at + R * 0.06, H * 0.8, z0], [R * 0.72, H * 0.22, R * 0.72], black, 8 * sz);
        S.paint('belly', [at + R * 0.72, H * 0.38, z0], [R * 0.78, H * 0.38, R * 0.82], white);
        S.paint('belly', [at + R * 0.6, H * 0.76, z0 + R * 0.34], [R * 0.34, H * 0.1, R * 0.26], white);
        S.paint('belly', [at + R * 0.6, H * 0.76, z0 - R * 0.34], [R * 0.34, H * 0.1, R * 0.26], white);
        [-1, 1].forEach(function (s) {
          var fz = z0 + s * R * 0.98, F = p.flipper;
          S.path('flippers', [[at, H * 0.6, z0 + s * R * 0.8, 3.6 * sz], [at - R * 0.1, H * (0.6 - 0.22 * F), fz + s * 2 * sz, 3.2 * sz], [at - R * 0.16, H * (0.6 - 0.38 * F), fz + s * 1 * sz, 1.9 * sz]], black, 2 * sz);
          S.ell('feet', [at + R * 0.84, 2.6 * sz + 0.5, z0 + s * R * 0.42], [9 * sz, 3 * sz + 0.3, 6 * sz], gold, 1.6);
          for (var c = -1; c <= 1; c++) S.ell('feet', [at + R * 0.84 + 7.5 * sz, 1.8 * sz + 0.4, z0 + s * R * 0.42 + c * 3.4 * sz], [3 * sz, 1.9 * sz + 0.2, 1.8 * sz], gold, 1);
        });
        S.path('beak', [[at + R * 0.5, H * 0.74, z0, 4.4 * sz], [at + R * 0.82, H * 0.72, z0, 3.2 * sz], [at + R * 1.16, H * 0.695, z0, 1.2 * sz]], gold, 1.2);
        if (p.extra === 1) { // knitted scarf with a hanging tail
          var ring = [];
          for (var i = 0; i <= 28; i++) { var a = (i / 28) * TAU; ring.push([at + Math.cos(a) * R * 0.88, H * 0.63, z0 + Math.sin(a) * R * 0.88, 3.6 * sz]); }
          S.path('scarf', ring, '#fb7185', 1, 2);
          S.path('scarf', [[at + R * 0.82, H * 0.62, z0 - R * 0.34, 3.4 * sz], [at + R * 1.0, H * 0.42, z0 - R * 0.4, 3 * sz], [at + R * 1.0, H * 0.3, z0 - R * 0.42, 2.8 * sz]], '#fb7185', 1);
        } else if (p.extra === 2) { // party hat with a pompom
          S.path('hat', [[at, H * 0.94, z0, 8 * sz], [at, H * 1.2, z0, 1.3 * sz]], '#c084fc', 0.8);
          S.ell('pompom', [at, H * 1.22, z0], [3.1 * sz, 3.1 * sz, 3.1 * sz], '#fde047', 0.6);
        }
      }
      function penguinFace(sc, S, at, z0, sz, p) {
        var H = 60 * sz, R = 17 * sz * p.chunk;
        [-1, 1].forEach(function (s) {
          var e = S.hit([at + 200, H * 0.8, z0 + s * R * 0.36], [-1, 0, 0]), er = 3.6 * sz + 0.3;
          sc.add('eyes', 'b', dome(e.p, e.n, er, { angle: 48 }), '#1e293b');
          sc.add('eyes', 'b', dome(vadd(e.p, vadd(vmul(e.n, er * 0.36), [0, er * 0.3, 0])), e.n, er * 0.26, { sink: 0.4 }), '#1e293b');
        });
      }
      function buildPenguin(p) {
        var sc = new Scene(), S = new Sculpt(1.2), chick = p.chick > 0, cz = 25 * p.chunk + 10, kid = { chunk: 1, flipper: 1, extra: 0 };
        penguinForms(S, 0, 0, 1, p);
        if (chick) penguinForms(S, 12, cz, 0.5, kid);
        S.reach = 0.72;
        S.run();
        penguinFace(sc, S, 0, 0, 1, p);
        if (chick) penguinFace(sc, S, 12, cz, 0.5, kid);
        S.addTo(sc);
        return finishSculpt(sc);
      }

      var PENGUIN_PARAMS = [
        { group: 'Penguin', key: 'chunk', label: 'Width (slim ↔ chunky)', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Penguin', key: 'flipper', label: 'Flipper length', unit: '×', min: 0.5, max: 1.5, step: 0.05, value: 1 },
        { group: 'Penguin', key: 'extra', label: 'Accessory', unit: '', min: 0, max: 2, step: 1, value: 1, options: ['None', 'Scarf', 'Party hat'] },
        { group: 'Penguin', key: 'chick', label: 'Chick', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['No chick', 'With chick'] }
      ];

      window.MM_GENERATOR = {
        code: 'MM-084',
        category: 'ANIMALS // BIRDS',
        title: 'Penguin Pals',
        fileName: 'Penguin',
        defaultColor: '#334155',
        palette: ANIMAL_PALETTE,
        partNames: { pompom: 'Pompom', body: 'Body', belly: 'Belly', eyes: 'Eyes', pupils: 'Pupils', flippers: 'Flippers', feet: 'Feet', beak: 'Beak', scarf: 'Scarf', hat: 'Party hat' },
        parameters: PENGUIN_PARAMS,
        presets: makePresets(PENGUIN_PARAMS, [
          ['Default penguin', {}],
          ['Party penguin', { extra: 2, chunk: 1.15 }],
          ['Lone penguin', { chick: 0, extra: 0 }],
          ['Chubby scarf penguin', { chunk: 1.3, flipper: 0.8, extra: 1 }]
        ]),
        build: buildPenguin
      };
