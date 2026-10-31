      // -----------------------------------------------------------------------
      // Turtle & Tortoise: a chunky shell animal, or a trinket dish with a turtle body
      // -----------------------------------------------------------------------
      function buildTurtle2(p) {
        var sc = new Scene(), i, Sr = p.shellL / 2, Sw = p.shellW / 2, Sh = p.shellH, hs = p.headSize, dish = p.dish > 0;
        var green = '#86efac', skin = '#a3e635', dark = '#4d7c0f';
        var h = Sh / 1.35, cy = 0.35 * h, N = 3;
        if (dish) {
          sc.add('shell', 'sh', cupShell(0, 0, Sr, Sw, Sh * 0.8, 2.4, 2.4, 44), green);
        } else {
          bellyBall(sc, 'shell', 'sh', 0, 0, Sr, Sw, h, green, { sq: N, cs: 3, seg: 28, cut: 0.35 });
          var pl = [[0, 0, 0.3]];
          for (i = 0; i < 6; i++) pl.push([Math.cos(TAU * i / 6) * 0.58, Math.sin(TAU * i / 6) * 0.58, 0.2]);
          if (p.plates > 0) pl.forEach(function (q) {
            var x = q[0] * Sr, z = q[1] * Sw, rho = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / Sr), N)), 1 / N);
            var yy = cy + h * rho * Math.sqrt(Math.max(0, 1 - Math.pow(z / (Sw * Math.max(rho, 0.05)), 2)));
            sc.add('plates', 'sh', blobShell([x, yy - p.plates * 0.35, z], [1, 0, 0], q[2] * Sr * 0.85, q[2] * Sw * 0.85, p.plates, 14, undefined), '#fde047');
          });
        }
        // head, neck, legs, tail
        var hr = 8.5 * hs, hx = Sr + hr * 0.5 + p.neck;
        bellyBall(sc, 'neck', 'n', Sr + p.neck * 0.5 - 1, 0, 6 + p.neck * 0.6, 6, 7.5, skin);
        bellyBall(sc, 'head', 'n', hx, 0, hr * 1.1, hr * 0.95, hr * 0.9, skin);
        for (i = -1; i <= 1; i += 2) {
          eyeAt(sc, 'face', 'n', [hx + hr * 0.75, hr * 0.95 + 0.4, i * hr * 0.5], 1.7, EYE);
          bellyBall(sc, 'legs', 'sh', Sr * 0.5, i * (Sw * 0.78), 8, 5.5, 5, skin);
          bellyBall(sc, 'legs', 'sh', -Sr * 0.55, i * (Sw * 0.7), 8, 5.5, 5, skin);
        }
        tubeAdd(sc, 'tail', 'sh', [[-Sr + 3, 3, 0], [-Sr - 5, 3, 1], [-Sr - 10 * p.tail, 2.5, 0]], function (t) { return 3.4 - 1.7 * t; }, skin, { ground: true, per: 6 });
        void dark;
        return finish(sc);
      }

      var TURTLE2_PARAMS = [
        { group: 'Shell', key: 'dish', label: 'Open shell (trinket dish)', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Solid shell', 'Open dish'] },
        { group: 'Shell', key: 'shellL', label: 'Shell length', unit: ' mm', min: 50, max: 100, step: 1, value: 72 },
        { group: 'Shell', key: 'shellW', label: 'Shell width', unit: ' mm', min: 44, max: 90, step: 1, value: 62 },
        { group: 'Shell', key: 'shellH', label: 'Shell height (tortoise ↔ sea turtle)', unit: ' mm', min: 16, max: 46, step: 1, value: 30 },
        { group: 'Shell', key: 'plates', label: 'Shell plate height (0 = none)', unit: ' mm', min: 0, max: 5, step: 0.5, value: 2.5 },
        { group: 'Head & tail', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.5, step: 0.05, value: 1.1 },
        { group: 'Head & tail', key: 'neck', label: 'Neck reach', unit: ' mm', min: 0, max: 10, step: 1, value: 4 },
        { group: 'Head & tail', key: 'tail', label: 'Tail length', unit: '×', min: 0.5, max: 2, step: 0.1, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-082',
        category: 'ANIMALS // REPTILES',
        title: 'Turtle & Tortoise',
        fileName: 'Turtle',
        defaultColor: '#86efac',
        palette: ANIMAL_PALETTE,
        partNames: { shell: 'Shell', plates: 'Shell plates', neck: 'Neck', head: 'Head', face: 'Eyes', legs: 'Legs', tail: 'Tail' },
        parameters: TURTLE2_PARAMS,
        presets: makePresets(TURTLE2_PARAMS, [
          ['Default turtle', {}],
          ['Tall tortoise', { shellH: 44, shellL: 62, shellW: 56, plates: 3.5, neck: 2 }],
          ['Flat sea turtle', { shellH: 18, shellL: 88, shellW: 70, plates: 1.5, headSize: 1 }],
          ['Baby turtle', { shellL: 56, shellW: 50, shellH: 26, headSize: 1.4, neck: 5 }],
          ['Trinket dish', { dish: 1, shellH: 34 }],
          ['Big trinket dish', { dish: 1, shellL: 92, shellW: 82, shellH: 36 }]
        ]),
        build: buildTurtle2
      };
