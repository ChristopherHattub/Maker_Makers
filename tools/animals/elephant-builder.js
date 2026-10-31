      // -----------------------------------------------------------------------
      // Elephant Builder: body on the bed with stout legs standing proud, the head corbelled out over the chest,
      // the trunk resting on the bed or raised, tusks rising forward and ears leaning back. No supports at any setting.
      // -----------------------------------------------------------------------
      function buildElephant(p) {
        var sc = new Scene(), grey = '#cbd5e1', dk = '#94a3b8', lr = p.legs, B = p.bulk, hs = p.head, E = p.ears, sd;
        var body = pod([0, 25 * B, 0], 31 * B, 27 * B, 20 * B, { flare: 0.6 });
        sc.add('body', 'b', body.tris, grey);
        var lz = 13.5 * B + 3;
        [[19 * B], [-20 * B]].forEach(function (q) {
          [-1, 1].forEach(function (s) {
            post(sc, 'legs', 'b', q[0], s * lz, lr * 1.08, lr, 24 * B, grey);
            for (var t = -1; t <= 1; t++) {
              var a = deg(t * 32);
              if (q[0] > 0) sc.add('toes', 'b', pod([q[0] + Math.cos(a) * lr * 0.86, 1.4, s * lz + Math.sin(a) * lr * 0.86], 2.1, 2.2, 2.1, { rings: 8, seg: 14 }).tris, '#f8fafc');
            }
          });
        });
        var hr = 17 * hs, hx = 27 * B + hr * 0.25, hy = 40 * B + hr * 0.55;
        var head = pod([hx, hy, 0], hr * 1.02, hr, hr * 0.92, { anchor: [hx - hr * 0.95, 8, 0], anchorR: 8 });
        sc.add('head', 'b', head.tris, grey);
        // jaw: extra mass under the face that carries the tusks and the trunk root
        sc.add('head', 'b', pod([hx + hr * 0.32, hy - hr * 0.22, 0], hr * 0.66, hr * 0.62, hr * 0.74, { anchor: [hx - hr * 0.7, 6, 0], anchorR: 9 }).tris, grey);
        [-1, 1].forEach(function (s) {
          var eye = head.surf(s * 58, hy + hr * 0.2);
          sc.add('eyes', 'b', dome(eye.p, eye.n, 2.5), '#1e293b');
          // ear: a fan in a plane that leans out from the head. Its lower edge rises at 50 degrees from the root.
          var root = [hx - hr * 0.1, 0, s * (hr * 0.62)], d = [-Math.cos(deg(28)), 0, s * Math.sin(deg(28))], y0 = hy - hr * 0.18;
          var L = 24 * E, ear = [[-3, y0], [L * 0.62, y0 + L * 0.74], [L, y0 + L * 1.05], [L * 0.98, y0 + L * 1.42], [L * 0.62, y0 + L * 1.62], [L * 0.18, y0 + L * 1.42], [-3, y0 + L * 0.95]];
          sc.add('ears', 'b', vslab(ear, root, d, 3.2, 0.8), dk);
          if (p.tusk > 0) {
            var tb = [hx + hr * 0.5, hy - hr * 0.12, s * hr * 0.34], tl = 15 * p.tusk;
            sc.add('tusks', 'b', horn(tb, [tb[0] + tl * 0.62, tb[1] + tl, tb[2] + s * tl * 0.1], 2.9, { bendX: tl * 0.14, flatStart: true }), '#fffbeb');
          }
        });
        var tr = 6.2 * p.trunkW, fx = hx + hr * 0.82, fy = hy - hr * 0.22;
        if (Math.round(p.trunk) === 1) {
          sc.add('trunk', 'b', sweep([[fx - 8, fy + 5, 0, tr], [fx + 2, fy + hr * 0.5, 0, tr * 0.86], [fx + 8, fy + hr * 0.95, 0, tr * 0.68], [fx + 7, fy + hr * 1.7, 0, tr * 0.54], [fx + 1, fy + hr * 2.35, 0, tr * 0.5]], { seg: 20, per: 6, rise: true }), grey);
        } else {
          var foot = fx + Math.min(fy * 0.2, 9);
          sc.add('trunk', 'b', sweep([[fx - 3, fy + 2, 0, tr * 0.86], [fx + 1, fy * 0.72, 0, tr * 0.82], [lerp(fx, foot, 0.6), fy * 0.4, 0, tr * 0.78], [foot, tr * 2.4, 0, tr * 0.74], [foot, tr * 1.2, 0, tr * 0.74], [foot, 0, 0, tr * 0.74]], { seg: 20, per: 7, flatEnd: true }), grey);
        }
        var ty = 34 * B;
        sc.add('tail', 'b', sweep([[-28 * B, ty, 0, 2.6], [-33 * B, ty * 0.62, 0, 2.2], [-35 * B, ty * 0.28, 0, 1.9], [-35 * B, 3, 0, 2.2], [-35 * B, 0, 0, 2.4]], { seg: 12, per: 5, flatEnd: true }), dk);
        scaleScene(sc, p.size);
        return finish(sc);
      }
      var ELE_PARAMS = [
        { group: 'Elephant', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Elephant', key: 'bulk', label: 'Body (compact ↔ huge)', unit: '×', min: 0.8, max: 1.15, step: 0.05, value: 1 },
        { group: 'Elephant', key: 'legs', label: 'Leg thickness', unit: ' mm', min: 7, max: 11, step: 0.5, value: 8.5 },
        { group: 'Head', key: 'head', label: 'Head size', unit: '×', min: 0.9, max: 1.3, step: 0.05, value: 1 },
        { group: 'Head', key: 'ears', label: 'Ear size', unit: '×', min: 0.6, max: 1.25, step: 0.05, value: 1 },
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
        partNames: { body: 'Body', legs: 'Legs', toes: 'Toenails', head: 'Head', eyes: 'Eyes', ears: 'Ears', tusks: 'Tusks', trunk: 'Trunk', tail: 'Tail' },
        parameters: ELE_PARAMS,
        presets: makePresets(ELE_PARAMS, [
          ['Default elephant', {}],
          ['Happy trunk-up', { trunk: 1 }],
          ['Baby elephant', { size: 0.7, head: 1.3, ears: 1.2, tusk: 0, bulk: 0.9 }],
          ['Big tusker', { size: 1.25, tusk: 1.5, ears: 1.15, bulk: 1.15, legs: 10 }]
        ]),
        build: buildElephant
      };
