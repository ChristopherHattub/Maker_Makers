      // -----------------------------------------------------------------------
      // Elephant Builder: a chunky elephant with ears, tusks and a trunk up or down
      // -----------------------------------------------------------------------
      function buildElephant(p) {
        var sc = new Scene(), i, grey = '#cbd5e1', dk = '#94a3b8', S = p.size;
        bellyBall(sc, 'body', 'b', 0, 0, 30, 20, 32, grey, { sq: 2.8, cs: 2.6, cut: 0.4, seg: 30 });
        for (i = -1; i <= 1; i += 2) {
          post(sc, 'legs', 'b', 18, i * 14, 8.4, 8, 22, grey);
          post(sc, 'legs', 'b', -20, i * 14, 8.4, 8, 22, grey);
          for (var t = 0; t < 3; t++) { eyeAt(sc, 'toes', 'b', [25.2, 1.5, i * (14 - 3 + t * 3)], 1.0, '#f1f5f9'); }
        }
        // head on a tall chest column
        var hr = 15 * p.head, hx = 34, hy = 54;
        bellyBall(sc, 'body', 'b', 24, 0, 15, 17, 36, grey, { sq: 2.4, cs: 2.4, cut: 0.4 });
        ball(sc, 'head', 'h', [hx, hy, 0], hr, hr * 0.92, hr * 0.98, grey);
        ball(sc, 'head', 'h', [hx + hr * 0.55, hy - hr * 0.75, 0], hr * 0.7, hr * 0.62, hr * 0.7, grey, { dir: [0, 1, 0] });
        for (i = -1; i <= 1; i += 2) {
          eyeAt(sc, 'face', 'h', [hx + hr * 0.82, hy + hr * 0.2, i * hr * 0.5], 1.9, EYE);
          // ears: big kite plates
          var E = p.ears;
          sc.add('ears', 'h', plate([[0, 8 * E], [-11 * E, 14 * E], [-20 * E, 6 * E], [-17 * E, -12 * E], [-6 * E, -26 * E], [4 * E, -8 * E]], [hx - hr * 0.1, hy + hr * 0.1, i * (hr * 0.9 - 1.6)], 0, i > 0 ? 1 : -1, 3, 0.8), dk);
          // tusks hang forward and down from the cheeks
          if (p.tusk > 0) spike(sc, 'tusks', 'h', [hx + hr * 0.6, hy - hr * 0.5, i * hr * 0.45], vnorm([0.6, -1, i * 0.2]), 2.6, 15 * p.tusk, '#fffbeb', 4);
        }
        // trunk
        var up = Math.round(p.trunk) === 1, tc;
        if (!up) tc = [[hx + hr * 0.85, hy - hr * 0.3, 0], [hx + hr * 1.0, hy - hr * 1.0, 0], [hx + hr * 1.1, 12, 0], [hx + hr * 1.5, 3, 0]];
        else tc = [[hx + hr * 0.85, hy - hr * 0.2, 0], [hx + hr * 1.2, hy + hr * 0.55, 0], [hx + hr * 1.3, hy + hr * 1.5, 0], [hx + hr * 0.95, hy + hr * 2.2, 0]];
        tubeAdd(sc, 'trunk', 'h', tc, function (t) { return 5.8 - 2.4 * t; }, grey, { per: 8, ground: false });
        tubeAdd(sc, 'tail', 'b', [[-30, 18, 0], [-36, 12, 0], [-38, 3, 0]], function (t) { return 2.2 - 0.6 * t; }, dk, {});
        scaleScene(sc, S);
        return finish(sc);
      }

      var ELE_PARAMS = [
        { group: 'Elephant', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.3, step: 0.05, value: 1 },
        { group: 'Elephant', key: 'trunk', label: 'Trunk', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Trunk down', 'Trunk up'] },
        { group: 'Elephant', key: 'head', label: 'Head size', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Elephant', key: 'ears', label: 'Ear size', unit: '×', min: 0.6, max: 1.3, step: 0.05, value: 1 },
        { group: 'Elephant', key: 'tusk', label: 'Tusk length (0 = none)', unit: '×', min: 0, max: 1.5, step: 0.05, value: 0.8 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-088',
        category: 'ANIMALS // WILDLIFE',
        title: 'Elephant Builder',
        fileName: 'Elephant',
        defaultColor: '#cbd5e1',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', legs: 'Legs', toes: 'Toenails', head: 'Head', face: 'Eyes', ears: 'Ears', tusks: 'Tusks', trunk: 'Trunk', tail: 'Tail' },
        parameters: ELE_PARAMS,
        presets: makePresets(ELE_PARAMS, [
          ['Default elephant', {}],
          ['Happy trunk-up', { trunk: 1 }],
          ['Baby elephant', { size: 0.7, head: 1.25, ears: 1.2, tusk: 0 }],
          ['Big tusker', { size: 1.2, tusk: 1.4, ears: 1.1 }]
        ]),
        build: buildElephant
      };
