      // -----------------------------------------------------------------------
      // Turtle & Tortoise: a shell with pressed-in plates over a sculpted body, or an open trinket dish in the shell
      // -----------------------------------------------------------------------
      function buildTurtle2(p) {
        var sc = new Scene(), S = new Sculpt(1.2 + p.shellL * 0.0045), Sr = p.shellL / 2, Sw = p.shellW / 2, Sh = p.shellH, hs = p.headSize, dish = p.dish > 0;
        var shell = '#4ade80', rim = '#22c55e', skin = '#bef264', dark = '#65a30d', tort = Sh > 34;
        // skin parts first, so the shell blends only a little over them
        var hr = 9.5 * hs, nx = Sr + p.neck, hx = nx + hr * 0.75, hy = Math.max(hr * 0.72, 7);
        S.path('skin', [[Sr * 0.6, 7, 0, 8], [nx, hy - 0.5, 0, 6.5]], skin, 4);
        S.ell('head', [hx, hy, 0], [hr * 1.2, hr * 0.8, hr * 0.92], skin, 4);
        S.ell('head', [hx + hr * 0.9, hy - hr * 0.1, 0], [hr * 0.5, hr * 0.48, hr * 0.56], skin, 2.5);
        [-1, 1].forEach(function (s) {
          S.path(null, [[hx + hr * 1.32, hy - hr * 0.22, s * hr * 0.2, 0.6], [hx + hr * 0.6, hy - hr * 0.3, s * hr * 0.76, 0.7]], null, 0).carve(0.6);
          // front and back legs: tortoise stumps or turtle flippers, all lying on the bed
          var fx = Sr * 0.58, bx = -Sr * 0.6, sz = s * Sw * 0.86;
          if (tort) {
            S.ell('legs', [fx, 6, sz], [9, 7, 9], skin, 3); S.ell('legs', [bx, 6, sz], [9, 7, 9], skin, 3);
            [fx, bx].forEach(function (lx) { for (var c = -1; c <= 1; c++) S.ell('claws', [lx + 7.5, 2, sz + c * 3.6 + s * 2], [2.6, 2.2, 1.7], '#f1f5f9', 0.8); });
          } else {
            S.path('legs', [[fx - 2, 2.6, sz * 0.8, 6.6], [fx + 8, 2.2, sz * 1.15, 5.8], [fx + 13, 1.7, sz * 1.55, 3.4]], skin, 3);
            S.path('legs', [[bx, 2.6, sz * 0.8, 6.2], [bx - 8, 2, sz * 1.06, 4.8], [bx - 13, 1.6, sz * 1.22, 2.6]], skin, 3);
          }
        });
        S.path('tail', [[-Sr * 0.9, 3, 0, 4], [-Sr - 5 * p.tail, 2.2, 1, 2.8], [-Sr - 11 * p.tail, 1.6, 0, 1]], skin, 2);
        // shell: rests on the bed, with a raised rim where it meets the body
        S.ell('shell', [0, Sh * 0.34, 0], [Sr, Sh * 0.72, Sw], shell, 1.4);
        S.ell('rim', [0, Sh * 0.16, 0], [Sr * 1.04, 3.4, Sw * 1.04], rim, 1);
        if (p.plates > 0) { // pressed plates: hexagons on a grid, grooved down the edges
          var cell = Sr * 0.44, depth = p.plates * 0.32;
          S.relief([-Sr, Sh * 0.24, -Sw], [Sr, Sh * 1.12, Sw], function (x, y, z) {
            var q = (x / cell) * 0.57735 + (z / cell) * 0.33333, r2 = (z / cell) * 0.66667, s3 = -q - r2;
            var rq = Math.round(q), rr = Math.round(r2), rs = Math.round(s3), dq = Math.abs(rq - q), dr = Math.abs(rr - r2), ds = Math.abs(rs - s3);
            if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs; else rs = -rq - rr;
            var e = Math.max(Math.abs(q - rq), Math.abs(r2 - rr), Math.abs(s3 - rs)); // 0 at centre, 0.67 at corners
            return depth * smooth((e - 0.42) / 0.14);
          });
        }
        if (dish) S.ell(null, [0, Sh * 0.34 + Sh * 0.72 * 1.02, 0], [Sr * 0.78, Sh * 0.72, Sw * 0.78], null, 0).carve(2.4);
        S.reach = 0.72;
        S.run();
        [-1, 1].forEach(function (s) {
          var e = S.hit([hx + 90, hy + hr * 0.18, s * hr * 0.56], [-1, 0, 0]), R = 2.5 * hs;
          sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 48 }), '#1e293b');
          sc.add('eyes', 'b', dome(vadd(e.p, vadd(vmul(e.n, R * 0.36), [0, R * 0.32, 0])), e.n, R * 0.25, { sink: 0.4 }), '#1e293b');
        });
        void dark;
        S.addTo(sc);
        return finishSculpt(sc);
      }

      var TURTLE2_PARAMS = [
        { group: 'Shell', key: 'dish', label: 'Shell', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Solid shell', 'Open dish'] },
        { group: 'Shell', key: 'shellL', label: 'Shell length', unit: ' mm', min: 50, max: 100, step: 1, value: 76 },
        { group: 'Shell', key: 'shellW', label: 'Shell width', unit: ' mm', min: 44, max: 90, step: 1, value: 62 },
        { group: 'Shell', key: 'shellH', label: 'Shell height (flat turtle ↔ tall tortoise)', unit: ' mm', min: 18, max: 48, step: 1, value: 30 },
        { group: 'Shell', key: 'plates', label: 'Shell plate depth (0 = smooth)', unit: ' mm', min: 0, max: 5, step: 0.5, value: 3 },
        { group: 'Head & tail', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.4, step: 0.05, value: 1.05 },
        { group: 'Head & tail', key: 'neck', label: 'Neck reach', unit: ' mm', min: 0, max: 12, step: 1, value: 5 },
        { group: 'Head & tail', key: 'tail', label: 'Tail length', unit: '×', min: 0.5, max: 1.8, step: 0.1, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-082',
        category: 'ANIMALS // REPTILES',
        title: 'Turtle & Tortoise',
        fileName: 'Turtle',
        defaultColor: '#4ade80',
        palette: ANIMAL_PALETTE,
        partNames: { shell: 'Shell', rim: 'Shell rim', skin: 'Neck', head: 'Head', eyes: 'Eyes', legs: 'Legs', claws: 'Claws', tail: 'Tail' },
        parameters: TURTLE2_PARAMS,
        presets: makePresets(TURTLE2_PARAMS, [
          ['Default turtle', {}],
          ['Tall tortoise', { shellH: 46, shellL: 68, shellW: 58, plates: 4, neck: 3 }],
          ['Flat sea turtle', { shellH: 20, shellL: 88, shellW: 70, plates: 2 }],
          ['Baby turtle', { shellL: 56, shellW: 50, shellH: 26, headSize: 1.35, neck: 6 }],
          ['Trinket dish', { dish: 1, shellH: 36, plates: 3 }],
          ['Big trinket dish', { dish: 1, shellL: 92, shellW: 82, shellH: 40, plates: 3 }]
        ]),
        build: buildTurtle2
      };
