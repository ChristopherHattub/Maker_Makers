      // -----------------------------------------------------------------------
      // Dog Builder: a sitting dog with adjustable snout, ears, tail and size
      // -----------------------------------------------------------------------
      function buildDog(p) {
        var sc = new Scene(), k = p.chunk, hs = p.headSize, i, fur = '#d9a066', hr = 12 * hs;
        bellyBall(sc, 'body', 'b', -8, 0, 22 * k, 19 * k, 22, fur);
        ball(sc, 'body', 'b', [3, 28, 0], 21, 14 * k, 13.5 * k, fur, { dir: tilt(78) });
        ball(sc, 'body', 'b', [12, 33, 0], 17, 9, 11 * k, fur, { dir: [0, 1, 0] }); // bib under the chin
        for (i = -1; i <= 1; i += 2) {
          post(sc, 'body', 'b', 12, i * 6.8 * k, 4.8, 4.2, 22, fur);
          bellyBall(sc, 'paws', 'b', 15, i * 6.8 * k, 6.6, 4.8, 4.4, '#f1f5f9');
        }
        var hx = 9, hy = 53;
        ball(sc, 'head', 'h', [hx, hy, 0], hr, hr * 1.05, hr * 0.95, fur);
        ball(sc, 'head', 'h', [hx + hr * 0.5, hy - hr * 0.5, 0], hr * 0.8, hr * 0.8, hr * 0.5, fur, { dir: [0, 1, 0] }); // chin and ruff under the head
        // snout and nose
        var sl = hr * (0.3 + 0.6 * p.snout), sd = tilt(-30), sx = hx + hr * 0.7 + sd[0] * sl * 0.7, sy = hy - hr * 0.12 + sd[1] * sl * 0.7;
        ball(sc, 'snout', 'h', [sx, sy, 0], sl, hr * 0.44, hr * 0.4, '#f1f5f9', { dir: sd });
        eyeAt(sc, 'face', 'h', [sx + sd[0] * sl * 0.92, sy + sd[1] * sl * 0.92 + hr * 0.04, 0], hr * 0.19, EYE);
        for (i = -1; i <= 1; i += 2) eyeAt(sc, 'face', 'h', [hx + hr * 0.7, hy + hr * 0.3, i * hr * 0.42], p.eye, EYE);
        // ears
        for (i = -1; i <= 1; i += 2) {
          if (p.ears === 0) { // floppy: a hanging plate with a rounded, tapering tip
            var L = 13 * p.earSize, W = 6.5 * p.earSize;
            sc.add('ears', 'h', plate([[W * 0.9, 0], [W * 1.1, -L * 0.35], [W * 0.55, -L * 0.8], [0, -L], [-W * 0.55, -L * 0.8], [-W * 1.1, -L * 0.35], [-W * 0.9, 0], [0, W * 0.5]],
              [hx - hr * 0.1, hy + hr * 0.62, i * hr * (i > 0 ? 0.72 : 0.72)], 0, i > 0 ? 1 : -1, 2.6, 0.8), '#b9824f');
          } else if (p.ears === 1) { // pointed
            spike(sc, 'ears', 'h', [hx - hr * 0.1, hy + hr * 0.7, i * hr * 0.55], vnorm([-0.1, 1, i * 0.2]), 5 * p.earSize, 12 * p.earSize, '#b9824f', 7);
          } else { // rose ears: small cones
            spike(sc, 'ears', 'h', [hx - hr * 0.15, hy + hr * 0.72, i * hr * 0.6], vnorm([-0.3, 1, i * 0.45]), 3.6 * p.earSize, 7 * p.earSize, '#b9824f', 6);
          }
        }
        // tail: rises behind the haunch, curl at the tip
        var tl = p.tail;
        tubeAdd(sc, 'tail', 'b', [[-27, 4, 0], [-32, 11, 0], [-36, 24 * tl, 0], [-34 + 3 * (tl - 1), 34 * tl, 0]], function (t) { return 3.8 - 1.4 * t; }, fur, { per: 6 });
        scaleScene(sc, p.size / 100);
        return finish(sc);
      }

      var DOG_PARAMS = [
        { group: 'Dog', key: 'size', label: 'Overall size', unit: '%', min: 60, max: 130, step: 1, value: 100 },
        { group: 'Dog', key: 'chunk', label: 'Body (slim ↔ chunky)', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Dog', key: 'tail', label: 'Tail length', unit: '×', min: 0.6, max: 1.3, step: 0.05, value: 1 },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Head', key: 'snout', label: 'Snout (flat ↔ long; long needs support)', unit: '×', min: 0, max: 0.8, step: 0.05, value: 0.25 },
        { group: 'Head', key: 'ears', label: 'Ear style', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Floppy', 'Pointy', 'Small'] },
        { group: 'Head', key: 'earSize', label: 'Ear size', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 },
        { group: 'Head', key: 'eye', label: 'Eye size', unit: ' mm', min: 1.6, max: 3.6, step: 0.1, value: 2.4 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-079',
        category: 'ANIMALS // PETS',
        title: 'Dog Builder',
        fileName: 'Dog',
        defaultColor: '#d9a066',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', paws: 'Paws', head: 'Head', snout: 'Snout', face: 'Nose & eyes', ears: 'Ears', tail: 'Tail' },
        parameters: DOG_PARAMS,
        presets: makePresets(DOG_PARAMS, [
          ['Default dog', {}],
          ['Pug', { snout: 0, ears: 2, headSize: 1.2, chunk: 1.25, tail: 0.6, eye: 3.2 }],
          ['Corgi', { snout: 0.4, ears: 1, earSize: 1.3, chunk: 1.1, tail: 0.6 }],
          ['Husky', { snout: 0.3, ears: 1, earSize: 1.1, tail: 1.3 }],
          ['Puppy', { size: 70, headSize: 1.3, ears: 0, earSize: 1.4, eye: 3.2, snout: 0.15 }]
        ]),
        build: buildDog
      };
