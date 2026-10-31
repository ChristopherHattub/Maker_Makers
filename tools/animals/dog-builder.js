      // -----------------------------------------------------------------------
      // Dog Builder: a sitting dog sculpted as one seamless surface
      // -----------------------------------------------------------------------
      function buildDog(p) {
        var sc = new Scene(), S = new Sculpt(1.3), k = p.chunk, hs = p.headSize, fur = '#d9a066', hr = 14 * hs, ear = '#a9713f', white = '#f8fafc';
        S.ell('body', [-8, 15, 0], [22 * k, 19, 19 * k], fur, 5);
        S.ell('body', [2, 36, 0], [14 * k, 21, 13.5 * k], fur, 8);
        S.paint('chest', [12, 36, 0], [13, 24, 10], white);
        [-1, 1].forEach(function (s) {
          S.ell('body', [-12, 13, s * 14 * k], [15, 13, 8], fur, 3);
          S.ell('paws', [6, 3.3, s * 16 * k], [11, 3.8, 5.4], white, 2);
          S.path('body', [[9, 36, s * 6.5 * k, 6], [13, 18, s * 6.6 * k, 5], [14, 5, s * 6.6 * k, 4.4]], fur, 2.5);
          S.ell('paws', [18, 3.2, s * 6.6 * k], [7.5, 3.6, 5.2], white, 2);
        });
        var hx = 8, hy = 62;
        S.ell('head', [hx, hy, 0], [hr, hr * 0.92, hr * 1.02], fur, 7);
        // muzzle: length from the slider, it always rests on the chest line so it never overhangs
        var ml = hr * (0.45 + 1.0 * p.snout), my = hy - hr * 0.3, mx = hx + hr * 0.62;
        S.path('muzzle', [[mx, my + 1, 0, hr * 0.5], [mx + ml * 0.55, my - 0.5, 0, hr * 0.44], [mx + ml, my - 1, 0, hr * 0.38]], white, 3);
        S.ell('muzzle', [mx + ml * 0.35, my - hr * 0.36, 0], [ml * 0.6 + 3, hr * 0.2, hr * 0.32], white, 2.5); // lower jaw
        S.path('mouth', [[mx + ml * 0.9, my - hr * 0.2, -hr * 0.34, 0.7], [mx + ml + hr * 0.28, my - hr * 0.2, 0, 0.8], [mx + ml * 0.9, my - hr * 0.2, hr * 0.34, 0.7]], null, 0, 3).carve(0.8);
        S.paint('patch', [hx + hr * 0.5, hy + hr * 0.3, hr * 0.5], [hr * 0.55, hr * 0.5, hr * 0.42], ear);
        // ears
        var style = Math.round(p.ears), E = p.earSize * hs;
        [-1, 1].forEach(function (s) {
          if (style === 0) { // floppy: lies against the side of the head
            S.ell('ears', [hx - hr * 0.1, hy + hr * 0.42, s * hr * 0.92], [7 * E, 6 * E, 3.4], ear, 1.5);
            S.ell('ears', [hx - hr * 0.1, hy - hr * 0.1, s * hr * 1.0], [8 * E, 11 * E, 3.2], ear, 1.5);
          } else if (style === 1) { // pricked
            var ey = hy + hr * 0.5, W = 7.5 * E, H = 17 * E;
            S.plate('ears', [[-W, ey], [W, ey], [W * 0.1, ey + H], [-W * 0.3, ey + H * 0.9]], [hx - hr * 0.1, 0, s * hr * 0.6], [0, 0, s], 4, ear, 2.5, 1.4);
          } else { // small folded rose ear
            S.path('ears', [[hx - hr * 0.2, hy + hr * 0.62, s * hr * 0.55, 4 * E], [hx - hr * 0.02, hy + hr * 0.82, s * hr * 0.9, 3.4 * E], [hx + hr * 0.2, hy + hr * 0.62, s * hr * 1.06, 2.6 * E]], ear, 1.5, 4);
          }
        });
        // collar with a round tag, tail rising from the rump
        if (Math.round(p.collar) === 1) {
          var ring = [];
          for (var i = 0; i <= 28; i++) { var a = (i / 28) * TAU; ring.push([hx - 3 + Math.cos(a) * 11.5 * k, hy - hr * 0.86 - Math.cos(a) * 3, Math.sin(a) * 11.5 * k, 1.9]); }
          S.path('collar', ring, '#60a5fa', 0.8, 2);
          S.ell('tag', [hx - 3 + 13 * k, hy - hr * 0.86 - 7, 0], [1.6, 3.6, 3.6], '#fde047', 0.8);
        }
        var tl = p.tail;
        S.path('tail', [[-27, 8, 0, 5], [-33, 16 * tl, 0, 4.2], [-37, 27 * tl, 0, 3.4], [-34, 37 * tl, 0, 2.2]], fur, 3);
        S.reach = 0.72;
        S.run();
        var nose = S.hit([hx + 80, my + hr * 0.12, 0], [-1, 0, 0]);
        sc.add('nose', 'b', dome(nose.p, vnorm([nose.n[0] + 0.3, nose.n[1] + 0.25, 0]), hr * 0.21, { angle: 55 }), '#1e293b');
        [-1, 1].forEach(function (s) {
          var e = S.hit([hx + 80, hy + hr * 0.22, s * hr * 0.42], [-1, 0, 0]), R = p.eye * hs;
          sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 48 }), '#3f2a1d');
          sc.add('eyes', 'b', dome(vadd(e.p, vadd(vmul(e.n, R * 0.36), [0, R * 0.32, s * -R * 0.2])), e.n, R * 0.28, { sink: 0.5 }), '#3f2a1d');
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size / 100);
      }

      var DOG_PARAMS = [
        { group: 'Dog', key: 'size', label: 'Overall size', unit: '%', min: 60, max: 130, step: 1, value: 100 },
        { group: 'Dog', key: 'chunk', label: 'Body (slim ↔ chunky)', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Dog', key: 'tail', label: 'Tail length', unit: '×', min: 0.6, max: 1.25, step: 0.05, value: 1 },
        { group: 'Dog', key: 'collar', label: 'Collar and tag', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'snout', label: 'Snout (flat ↔ long)', unit: '×', min: 0, max: 0.8, step: 0.05, value: 0.35 },
        { group: 'Head', key: 'ears', label: 'Ear style', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Floppy', 'Pricked', 'Small'] },
        { group: 'Head', key: 'earSize', label: 'Ear size', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head', key: 'eye', label: 'Eye size', unit: ' mm', min: 2, max: 4.5, step: 0.1, value: 3.2 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-079',
        category: 'ANIMALS // PETS',
        title: 'Dog Builder',
        fileName: 'Dog',
        defaultColor: '#d9a066',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', chest: 'Chest', paws: 'Paws', head: 'Head', muzzle: 'Muzzle', patch: 'Eye patch', ears: 'Ears', collar: 'Collar', tag: 'Tag', tail: 'Tail', nose: 'Nose', eyes: 'Eyes' },
        parameters: DOG_PARAMS,
        presets: makePresets(DOG_PARAMS, [
          ['Default dog', {}],
          ['Pug', { snout: 0, ears: 2, headSize: 1.2, chunk: 1.25, tail: 0.6, eye: 4.2 }],
          ['Corgi', { snout: 0.4, ears: 1, earSize: 1.25, chunk: 1.15, tail: 0.6 }],
          ['Husky', { snout: 0.45, ears: 1, earSize: 1, tail: 1.2 }],
          ['Puppy', { size: 70, headSize: 1.25, earSize: 1.3, eye: 4.4, snout: 0.15 }]
        ]),
        build: buildDog
      };
