      // -----------------------------------------------------------------------
      // Penguin Pals: a penguin with an optional chick, scarf or party hat
      // -----------------------------------------------------------------------
      function penguin(sc, at, z0, s, p, tag) {
        var i, black = '#334155', white = '#f8fafc', gold = '#fbbf24', H = 56 * s, R = 15 * s * p.chunk;
        sc.add('body', tag, pod([at, H * 0.5, z0], R, H * 0.5, R * 0.95, { flare: 0.85, rings: 26, seg: 40 }).tris, black);
        // belly: a proud white front that fades into the body at the shoulders, one shape from the bed up
        var belly = pod([at + R * 0.34, H * 0.34, z0], R * 0.72, H * 0.34, R * 0.72, { flare: 0.85, rings: 22, seg: 32 });
        sc.add('belly', tag, belly.tris, white);
        var shell = pod([at, H * 0.5, z0], R, H * 0.5, R * 0.95, { flare: 0.85, rings: 26, seg: 40 });
        for (i = -1; i <= 1; i += 2) {
          var e = shell.surf(i * 34, H * 0.76);
          sc.add('eyes', tag, dome(e.p, e.n, 2.6 * s + 0.6, { angle: 48 }), white);
          sc.add('pupils', tag, dome(vadd(e.p, vmul(e.n, 0.7 * s + 0.2)), e.n, 1.2 * s + 0.3, { sink: 0.6 }), EYE);
          // flipper: lies along the flank and hangs from the shoulder, narrowing downward into the body
          var fl = shell.surf(i * 96, H * 0.42), fc = vadd(fl.p, vmul(fl.n, -R * 0.08));
          sc.add('flippers', tag, pod([fc[0], H * 0.44, fc[2]], R * 0.3, H * 0.23 * p.flipper, R * 0.2, { anchor: [fc[0], H * 0.44 - H * 0.26 * p.flipper, fc[2] - i * R * 0.18], anchorR: R * 0.1, rings: 16, seg: 20 }).tris, black);
          bellyBall(sc, 'feet', tag, at + R * 0.55, z0 + i * R * 0.4, 6 * s, 4.4 * s, 3.2 * s, gold);
        }
        var bk = shell.surf(0, H * 0.67);
        sc.add('beak', tag, dome(bk.p, vnorm([bk.n[0], bk.n[1] + 0.2, bk.n[2]]), 2.8 * s + 0.6, { angle: 58 }), gold);
        if (p.extra === 1) { // scarf: a ring tube around the neck
          var ring = [], k, rr = R * 0.9;
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
        partNames: { body: 'Body', belly: 'Belly', eyes: 'Eyes', pupils: 'Pupils', flippers: 'Flippers', feet: 'Feet', beak: 'Beak', scarf: 'Scarf', hat: 'Party hat' },
        parameters: PENGUIN_PARAMS,
        presets: makePresets(PENGUIN_PARAMS, [
          ['Default penguin', {}],
          ['Party penguin', { extra: 2, chunk: 1.15 }],
          ['Lone penguin', { chick: 0, extra: 0 }],
          ['Chubby scarf penguin', { chunk: 1.3, flipper: 0.8, extra: 1 }]
        ]),
        build: buildPenguin
      };
