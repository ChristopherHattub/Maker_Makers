      // -----------------------------------------------------------------------
      // Dragon Maker: a perched dragon with wings, horns, back spikes and a long tail
      // -----------------------------------------------------------------------
      function buildDragon(p) {
        var sc = new Scene(), i, hs = p.headSize, col = '#a78bfa', belly = '#fde68a', dark = '#7c3aed', L = p.tailLen;
        bellyBall(sc, 'body', 'b', 0, 0, 22, 19, 24, col);
        ball(sc, 'body', 'b', [4, 34, 0], 22, 15, 14.5, col, { dir: tilt(80) });
        ball(sc, 'belly', 'b', [10, 28, 0], 18, 10, 11, belly, { dir: tilt(86) });
        for (i = -1; i <= 1; i += 2) {
          bellyBall(sc, 'feet', 'b', 14, i * 11, 8.5, 5.2, 5.5, dark);
          post(sc, 'body', 'b', 8, i * 11, 6.5, 5.5, 20, col);
          spike(sc, 'arms', 'b', [16, 36, i * 10], vnorm([0.25, -1, i * 0.2]), 2.6, 8, dark, 3);
        }
        // neck column and head
        var hr = 11 * hs, hx = 15, hy = 62;
        bellyBall(sc, 'body', 'b', 14, 0, 15, 10.5, 36, col, { sq: 2.4 });
        ball(sc, 'head', 'h', [hx, hy, 0], hr * 1.05, hr * 0.85, hr * 0.85, col);
        ball(sc, 'head', 'h', [hx + hr * 0.85, hy - hr * 0.25, 0], hr * 0.55, hr * 0.62, hr * 0.5, col, { dir: tilt(-12) });
        ball(sc, 'head', 'h', [hx + hr * 0.4, hy - hr * 0.8, 0], hr * 0.85, hr * 0.8, hr * 0.55, belly, { dir: [0, 1, 0] });
        for (i = -1; i <= 1; i += 2) {
          eyeAt(sc, 'face', 'h', [hx + hr * 0.7, hy + hr * 0.3, i * hr * 0.55], 2.2, '#fbbf24');
          eyeAt(sc, 'face', 'h', [hx + hr * 1.35, hy - hr * 0.2, i * hr * 0.22], 1.1, EYE);
          spike(sc, 'horns', 'h', [hx - hr * 0.35, hy + hr * 0.65, i * hr * 0.5], vnorm([-0.35, 1, i * 0.25]), 2.9, 14 * p.horns, '#f1f5f9', 4);
        }
        // spine ridge: cones running down the back and along the tail
        var n = Math.round(p.spines), tc = [[-18, 8, 0], [-34 * L, 6, 7], [-56 * L, 4, 12 * p.curl], [-72 * L, 3, 0.4]];
        var tr = function (t) { return 9.5 - 7 * t; }, tpath = spline(tc, 8);
        tpath.forEach(function (q, ix) { q[1] = 0.55 * tr(ix / (tpath.length - 1)); });
        for (i = 0; i < n; i++) {
          if (i < 2) { spike(sc, 'spines', 'b', [-8 - i * 6, 40 - i * 9, 0], vnorm([-0.35, 1, 0]), 3.3, 10 * p.spineSize, '#c4b5fd', 6); continue; }
          var u = (i - 2) / Math.max(n - 3, 1), q = tpath[Math.round(lerp(4, tpath.length - 6, u))], rr = tr(q[2] === undefined ? 0 : 0) , tt = tpath.indexOf(q) / (tpath.length - 1);
          spike(sc, 'spines', 'b', [q[0], q[1] + tr(tt) * 0.55, q[2]], vnorm([-0.35, 1, 0]), 3.3 * (1 - 0.45 * tt), 10 * p.spineSize * (1 - 0.5 * tt), '#c4b5fd', 6);
        }
        // tail
        tubeAdd(sc, 'tail', 'b', tc, tr, col, { ground: true, per: 8 });
        // wings: tall bat-wing plates standing beside the shoulders
        if (p.wings > 0) {
          var W = p.wings, wp = [[4, 0], [-2 * W, 26 * W], [-4 * W, 44 * W], [-8 * W, 56 * W], [-18 * W, 60 * W], [-28 * W, 52 * W], [-31 * W, 40 * W], [-24 * W, 22 * W], [-10, 0]];
          for (i = -1; i <= 1; i += 2) sc.add('wings', 'w' + i, plate(wp, [-2, 28, i > 0 ? 10 : -13], 0, 3.2, 1, 0.8), '#c4b5fd');
        }
        // chest gem
        if (p.gem > 0) ball(sc, 'gem', 'b', [18.5, 34, 0], 3.4, 3.4, 3.4, '#f0abfc');
        return finish(sc);
      }

      var DRAGON_PARAMS = [
        { group: 'Dragon', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1 },
        { group: 'Dragon', key: 'horns', label: 'Horn length', unit: '×', min: 0.5, max: 1.6, step: 0.05, value: 1 },
        { group: 'Dragon', key: 'gem', label: 'Chest gem', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] },
        { group: 'Wings', key: 'wings', label: 'Wing size (0 = none)', unit: '×', min: 0, max: 1.4, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'spines', label: 'Back spikes', unit: '', min: 0, max: 12, step: 1, value: 8 },
        { group: 'Spine & tail', key: 'spineSize', label: 'Spike size', unit: '×', min: 0.5, max: 1.5, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'tailLen', label: 'Tail length', unit: '×', min: 0.6, max: 1.3, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'curl', label: 'Tail curl (straight ↔ curled)', unit: '×', min: 0, max: 1.6, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-077',
        category: 'ANIMALS // FANTASY',
        title: 'Dragon Maker',
        fileName: 'Dragon',
        defaultColor: '#a78bfa',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly', feet: 'Feet & claws', arms: 'Arms', head: 'Head', face: 'Eyes', horns: 'Horns', spines: 'Back spikes', tail: 'Tail', wings: 'Wings', gem: 'Chest gem' },
        parameters: DRAGON_PARAMS,
        presets: makePresets(DRAGON_PARAMS, [
          ['Default dragon', {}],
          ['Baby dragon', { headSize: 1.35, wings: 0.6, spines: 5, tailLen: 0.7, horns: 0.6 }],
          ['Spiky wyvern', { spines: 12, spineSize: 1.4, horns: 1.5, wings: 1.2 }],
          ['Wingless drake', { wings: 0, headSize: 1.15, horns: 1.2 }],
          ['Curled tail dragon', { curl: 1.6, tailLen: 1.2 }]
        ]),
        build: buildDragon
      };
