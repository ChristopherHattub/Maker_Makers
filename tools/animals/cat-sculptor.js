      // -----------------------------------------------------------------------
      // Cat Sculptor: sitting, loafing or curled-up sleeping cat
      // -----------------------------------------------------------------------
      function buildCat(p) {
        var sc = new Scene(), k = p.chunk, hs = p.headSize, pose = Math.round(p.pose), z, i;
        var hx, hy, hz = 0, dirH = [1, 0, 0];
        if (pose === 0) { // sit
          bellyBall(sc, 'body', 'b', -6, 0, 22 * k, 19 * k, 23 * k, '#fdba74');
          ball(sc, 'body', 'b', [3, 28, 0], 21, 14 * k, 13.5 * k, '#fdba74', { dir: tilt(75) });
          bellyBall(sc, 'paws', 'b', 17, 7.5 * k, 7, 4.4 * k, 4.4, '#fde6c8');
          bellyBall(sc, 'paws', 'b', 17, -7.5 * k, 7, 4.4 * k, 4.4, '#fde6c8');
          post(sc, 'body', 'b', 11, 7 * k, 5 * k, 4.4 * k, 22, '#fdba74');
          post(sc, 'body', 'b', 11, -7 * k, 5 * k, 4.4 * k, 22, '#fdba74');
          hx = 7; hy = 54;
        } else if (pose === 1) { // loaf
          bellyBall(sc, 'body', 'b', -2, 0, 27 * k, 17 * k, 20 * k, '#fdba74');
          bellyBall(sc, 'paws', 'b', 25, 8 * k, 6.5, 4.6 * k, 4.6, '#fde6c8');
          bellyBall(sc, 'paws', 'b', 25, -8 * k, 6.5, 4.6 * k, 4.6, '#fde6c8');
          hx = 23; hy = 0;
        } else { // curled up asleep
          bellyBall(sc, 'body', 'b', -4, -2, 27, 22 * k, 17 * k, '#fdba74');
          bellyBall(sc, 'paws', 'b', 18, 14 * k, 7, 4.6 * k, 4.6, '#fde6c8');
          hx = 24; hy = 0; hz = 0;
        }
        // head
        var hr = 12.5 * hs;
        if (hy === 0) {
          bellyBall(sc, 'head', 'h', hx, 0, hr * 1.02, hr * 1.15, hr, '#fdba74');
          hy = hr * 0.65;
        } else {
          ball(sc, 'head', 'h', [hx, hy, 0], hr * 1.02, hr * 1.15, hr, '#fdba74');
        }
        // muzzle, nose and eyes
        ball(sc, 'face', 'h', [hx + hr * 0.88, hy - hr * 0.24, 0], hr * 0.2, hr * 0.28, hr * 0.2, '#fda4af');
        for (i = -1; i <= 1; i += 2) {
          eyeAt(sc, 'face', 'h', [hx + hr * 0.78, hy + hr * 0.2, i * hr * 0.45], p.eye, EYE);
          // ears: triangle cones leaning out
          spike(sc, 'ears', 'h', [hx - hr * 0.1, hy + hr * 0.7, i * hr * 0.55], vnorm([-0.1, 1, i * 0.2]), 5.2 * p.ear, 10 * p.ear, '#fdba74', 7);
        }
        // tail
        var tl = p.tail, tc;
        if (pose === 0) {
          tc = [[-22, 3, 0], [-29, 3, 8], [-26, 3, 20], [-12, 3, 27 * tl], [4, 3, 25 * tl], [14, 3, 17 * tl]];
        } else if (pose === 1) {
          tc = [[-26, 3, 4], [-30, 3, 14], [-18, 3, 22], [-2, 3, 21], [12, 3, 17]];
        } else {
          tc = [[-28, 3, -8], [-24, 3, -24 * tl], [-6, 3, -30 * tl], [14, 3, -26 * tl], [26, 3, -14 * tl]];
        }
        tubeAdd(sc, 'tail', 'b', tc, function (t) { return 3.9 - 1.1 * t; }, '#fdba74', { ground: true, per: 6 });
        scaleScene(sc, p.size / 100);
        return finish(sc);
      }

      var CAT_PARAMS = [
        { group: 'Pose', key: 'pose', label: 'Pose', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Sitting', 'Loaf', 'Curled up'] },
        { group: 'Pose', key: 'size', label: 'Overall size', unit: '%', min: 60, max: 130, step: 1, value: 100 },
        { group: 'Pose', key: 'chunk', label: 'Body (slim ↔ chunky)', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Pose', key: 'tail', label: 'Tail curl (tight ↔ loose)', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Head', key: 'ear', label: 'Ear size', unit: '×', min: 0.6, max: 1.6, step: 0.05, value: 1 },
        { group: 'Head', key: 'eye', label: 'Eye size', unit: ' mm', min: 1.6, max: 3.6, step: 0.1, value: 2.4 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-078',
        category: 'ANIMALS // PETS',
        title: 'Cat Sculptor',
        fileName: 'Cat',
        defaultColor: '#fdba74',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', paws: 'Paws', head: 'Head', face: 'Nose & eyes', ears: 'Ears', tail: 'Tail' },
        parameters: CAT_PARAMS,
        presets: makePresets(CAT_PARAMS, [
          ['Default cat', {}],
          ['Chubby loaf', { pose: 1, chunk: 1.3, headSize: 1.1 }],
          ['Sleeping curl', { pose: 2, chunk: 0.9, tail: 1.2 }],
          ['Kitten', { size: 70, headSize: 1.3, ear: 1.4, eye: 3.2 }],
          ['Big-eared sitter', { ear: 1.6, eye: 3 }]
        ]),
        build: buildCat
      };
