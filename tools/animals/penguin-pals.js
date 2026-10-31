      // -----------------------------------------------------------------------
      // Penguin Pals: a penguin with an optional chick, scarf or party hat
      // -----------------------------------------------------------------------
      function penguin(sc, at, z0, s, p, tag) {
        var i, black = '#334155', white = '#f8fafc', gold = '#fbbf24', H = 56 * s, R = 15 * s * p.chunk;
        bellyBall(sc, 'body', tag, at, z0, R, R * 0.95, H / 1.35, black, { sq: 2.6, cs: 2.6, cut: 0.4, seg: 30 });
        ball(sc, 'belly', tag, [at + R * 0.45, H * 0.4, z0], R * 0.55, R * 0.58, H * 0.36, white, { dir: [0, 1, 0] });
        for (i = -1; i <= 1; i += 2) {
          eyeAt(sc, 'face', tag, [at + R * 0.72, H * 0.78, z0 + i * R * 0.34], 1.7 * s + 0.4, white);
          eyeAt(sc, 'face', tag, [at + R * 0.72 + 1.2 * s, H * 0.78, z0 + i * R * 0.34], 1.0 * s + 0.2, EYE);
          // flippers hang from the shoulders, narrowing to the tip
          sc.add('flippers', tag, plate([[0, 0], [R * 0.34, -H * 0.1], [R * 0.3, -H * 0.3 * p.flipper], [0, -H * 0.4 * p.flipper], [-R * 0.3, -H * 0.3 * p.flipper], [-R * 0.34, -H * 0.1]],
            [at - R * 0.05, H * 0.62, z0 + i * (R * 0.9 - 1.5)], 0, i > 0 ? 1 : -1, 3, 0.8), black);
          bellyBall(sc, 'feet', tag, at + R * 0.55, z0 + i * R * 0.4, 6 * s, 4.4 * s, 3.2 * s, gold);
        }
        spike(sc, 'beak', tag, [at + R * 0.88, H * 0.7, z0], vnorm([0.55, -1, 0]), 2.5 * s + 0.5, 7 * s, gold, 2.5);
        if (p.extra === 1) { // scarf: a ring tube around the neck
          var ring = [], k, rr = R * 0.93;
          for (k = 0; k <= 22; k++) { var a = TAU * (k / 22 + 0.04); ring.push([at + Math.cos(a) * rr * 0.98, H * 0.6, z0 + Math.sin(a) * rr]); }
          sc.add('scarf', tag, tube(ring, function () { return 2.8 * s + 0.4; }, 10, {}), '#fb7185');
          sc.add('scarf', tag, plate([[0, 0], [4, -H * 0.2], [-4, -H * 0.2]], [at + R * 0.55, H * 0.6, z0 - 6], 0, 1, 3, 0.8), '#fb7185');
        } else if (p.extra === 2) { // party hat
          spike(sc, 'hat', tag, [at, H * 0.98, z0], [0, 1, 0], 6 * s, 16 * s, '#c084fc', 3.5);
          ball(sc, 'hat', tag, [at, H * 0.98 + 16 * s, z0], 2.2, 2.2, 2.2, '#fde047');
        }
      }

      function buildPenguin(p) {
        var sc = new Scene();
        penguin(sc, 0, 0, 1, p, 'big');
        if (p.chick > 0) penguin(sc, 14, 23 * p.chunk + 8, 0.45, { chunk: 1, flipper: 1, extra: 0 }, 'chick');
        return finish(sc);
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
        partNames: { body: 'Body', belly: 'Belly', face: 'Eyes', flippers: 'Flippers', feet: 'Feet', beak: 'Beak', scarf: 'Scarf', hat: 'Party hat' },
        parameters: PENGUIN_PARAMS,
        presets: makePresets(PENGUIN_PARAMS, [
          ['Default penguin', {}],
          ['Party penguin', { extra: 2, chunk: 1.15 }],
          ['Lone penguin', { chick: 0, extra: 0 }],
          ['Chubby scarf penguin', { chunk: 1.3, flipper: 0.8, extra: 1 }]
        ]),
        build: buildPenguin
      };
