      // -----------------------------------------------------------------------
      // Mushroom Critters: a mushroom gnome, a frog or a snail
      // -----------------------------------------------------------------------
      function buildCritter(p) {
        var sc = new Scene(), sp = Math.round(p.species), i, s = p.size;
        if (sp === 0) { // mushroom gnome: stem body, bell cap, beard and nose
          var Rs = 11 * s, Hs = 30 * s, cap = 24 * p.cap, capH = 30 * p.capTall;
          bellyBall(sc, 'stem', 'b', 0, 0, Rs, Rs, Hs / 1.4, '#fef3c7', { sq: 2.4, cs: 2.4, cut: 0.4, seg: 28 });
          // cap: a bell whose underside rises at 55 degrees from the stem, then a dome
          var fr = frame([0, 0, 0], [0, 1, 0], [0, 0, 1]), y0 = Hs * 0.62, prof = [[0, y0 + capH * 1.0]];
          var rim = cap, ry = y0 + (rim - Rs * 0.8) * 1.2;
          for (i = 1; i <= 8; i++) { var t = (Math.PI / 2) * (i / 8); prof.push([rim * Math.sin(t), ry + (capH - (ry - y0)) * Math.cos(t) * 0.92 + 0.0]); }
          prof.push([rim, ry], [Rs * 0.8, y0 + 1], [0, y0 + 1]);
          sc.add('cap', 'c', lathe(fr, prof, 34, {}), '#fb7185');
          for (i = 0; i < 6; i++) { // spots on the cap
            var ang = TAU * i / 6 + 0.3, rr = rim * 0.62, yy = ry + (capH - (ry - y0)) * Math.cos(Math.asin(Math.min(0.95, rr / rim))) * 0.92;
            ball(sc, 'spots', 'c', [Math.cos(ang) * rr, yy + 0.2, Math.sin(ang) * rr], 3.2, 3.2, 1.8, '#fff7ed');
          }
          for (var e = -1; e <= 1; e += 2) eyeAt(sc, 'face', 'b', [Rs * 0.78, Hs * 0.5, e * Rs * 0.38], 1.8, EYE);
          ball(sc, 'face', 'b', [Rs * 0.95, Hs * 0.4, 0], 3, 2.8, 2.8, '#fda4af');
          bellyBall(sc, 'beard', 'b', Rs * 0.2, 0, Rs * 0.8, Rs * 0.92, Hs * 0.22, '#f1f5f9', { cut: 0.4 });
          for (e = -1; e <= 1; e += 2) bellyBall(sc, 'feet', 'b', Rs * 0.5, e * Rs * 0.5, 5, 3.6, 3, '#92400e');
        } else if (sp === 1) { // frog
          var W = 22 * s;
          bellyBall(sc, 'body', 'b', 0, 0, W, W * 0.85, W * 0.85, '#86efac', { sq: 2.6, cs: 2.6, cut: 0.4 });
          bellyBall(sc, 'belly', 'b', W * 0.45, 0, W * 0.55, W * 0.6, W * 0.45, '#ecfccb', { cut: 0.4 });
          for (i = -1; i <= 1; i += 2) {
            bellyBall(sc, 'legs', 'b', -W * 0.45, i * W * 0.85, W * 0.62, W * 0.3, W * 0.32, '#4ade80', { yaw: i * 0.25 });
            bellyBall(sc, 'legs', 'b', W * 0.62, i * W * 0.58, W * 0.34, W * 0.2, W * 0.2, '#4ade80');
            ball(sc, 'eyes', 'b', [W * 0.55, W * 1.0 * 1.0 - 4, i * W * 0.42], 5.2 * s, 5.2 * s, 5.2 * s, '#86efac');
            eyeAt(sc, 'pupils', 'b', [W * 0.55 + 3.6 * s, W * 1.0 - 3.6, i * W * 0.42], 2.4 * s, EYE);
            ball(sc, 'cheeks', 'b', [W * 0.78, W * 0.55, i * W * 0.55], 2.6, 2.6, 1.8, '#fda4af');
          }
        } else { // snail
          var Sb = 8 * s;
          tubeAdd(sc, 'body', 'b', [[-34 * s, 3, 0], [-20 * s, 3.5, 0], [0, 4.4, 0], [14 * s, 5, 0]], function (t) { return 3.4 + 2.4 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1)) * s - 1.6 * t * 0 + 1; }, '#fde68a', { ground: true, per: 8 });
          tubeAdd(sc, 'body', 'b', [[14 * s, 5.4, 0], [20 * s, 12, 0], [22 * s, 20, 0], [22.5 * s, 26, 0]], function (t) { return 5 - 1.2 * t; }, '#fde68a', { per: 8 });
          ball(sc, 'body', 'b', [24 * s, 28, 0], 6, 5.4, 5.4, '#fde68a');
          for (i = -1; i <= 1; i += 2) {
            spike(sc, 'stalks', 'b', [24 * s, 31.5, i * 2.4], vnorm([0.15, 1, i * 0.45]), 1.1, 11, '#fde68a', 3);
            eyeAt(sc, 'face', 'b', [24 * s + 2, 29, i * 4.6], 1.5, EYE);
          }
          var Rr = 17 * s;
          bellyBall(sc, 'shell', 's', -6 * s, 0, Rr, 9 * s, Rr * 1.1, '#fdba74', { sq: 2.2, cs: 2.2, cut: 0.4, seg: 30 });
          for (i = -1; i <= 1; i += 2) {
            var sp2 = [], k;
            for (k = 0; k <= 40; k++) { var u = k / 40, ang2 = u * TAU * 2.1 + 0.4, rad = (2 + 12 * u) * s; var px = -6 * s + Math.cos(ang2) * rad * 1.0, py = Rr * 1.1 * 0.62 + Math.sin(ang2) * rad * 1.05; sp2.push([px, py, i * (9 * s * Math.sqrt(Math.max(0.05, 1 - Math.pow((px + 6 * s) / Rr, 2) - Math.pow((py - Rr * 1.1 * 0.62) / (Rr * 1.1), 2))) - 0.6)]); }
            sc.add('swirl', 's', tube(sp2, function () { return 1.5; }, 8, {}), '#f97316');
          }
        }
        return finish(sc);
      }

      var CRIT_PARAMS = [
        { group: 'Critter', key: 'species', label: 'Critter', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Mushroom gnome', 'Frog', 'Snail'] },
        { group: 'Critter', key: 'size', label: 'Overall size', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Mushroom gnome', key: 'cap', label: 'Cap width', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1 },
        { group: 'Mushroom gnome', key: 'capTall', label: 'Cap height', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-086',
        category: 'ANIMALS // CRITTERS',
        title: 'Mushroom Critters',
        fileName: 'Critter',
        defaultColor: '#fb7185',
        palette: ANIMAL_PALETTE,
        partNames: { stem: 'Stem body', cap: 'Mushroom cap', spots: 'Cap spots', face: 'Face', beard: 'Beard', feet: 'Feet', body: 'Body', belly: 'Belly', legs: 'Legs', eyes: 'Eyes', pupils: 'Pupils', cheeks: 'Cheeks', stalks: 'Eye stalks', shell: 'Shell', swirl: 'Shell swirl' },
        parameters: CRIT_PARAMS,
        presets: makePresets(CRIT_PARAMS, [
          ['Default mushroom gnome', {}],
          ['Tiny toadstool', { size: 0.75, cap: 1.25, capTall: 0.8 }],
          ['Frog', { species: 1 }],
          ['Big frog', { species: 1, size: 1.3 }],
          ['Snail', { species: 2 }],
          ['Giant snail', { species: 2, size: 1.3 }]
        ]),
        build: buildCritter
      };
