      // -----------------------------------------------------------------------
      // Shark Fin Trophy: a shark fin on a name-plate base, or a whole chunky shark
      // -----------------------------------------------------------------------
      function roundRect(w, d, r) {
        var pts = [], i, k, cs = [[w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, 90], [-w / 2 + r, -d / 2 + r, 180], [w / 2 - r, -d / 2 + r, 270]];
        for (k = 0; k < 4; k++) for (i = 0; i <= 6; i++) { var a = deg(cs[k][2] + (90 * i) / 6); pts.push([cs[k][0] + Math.cos(a) * r, cs[k][1] + Math.sin(a) * r]); }
        return pts;
      }

      function buildShark2(p) {
        var sc = new Scene(), i, blue = '#93c5fd', white = '#f1f5f9', dk = '#60a5fa', F = p.fin;
        if (Math.round(p.kind) === 0) { // trophy
          var bw = p.baseW, bd = 40;
          sc.add('base', 'base', flatSlab(roundRect(bw, bd, 6), [0, 0, 0], 0, 7, 1.6), '#475569');
          sc.add('plate', 'base', flatSlab(roundRect(bw - 14, 14, 3), [0, 0, 11], 0, 9.2, 0.8), '#fbbf24');
          var fp = [[-24 * F, 0], [20 * F, 0], [16 * F, 10 * F], [4 * F, 28 * F], [-6 * F, 44 * F * p.tall], [-10 * F, 56 * F * p.tall], [-18 * F, 40 * F * p.tall], [-23 * F, 18 * F]];
          sc.add('fin', 'fin', plate(fp, [-bw * 0.12, 6, -4], 0, 8, 1, 1.4), blue);
          for (i = -1; i <= 1; i += 2) sc.add('waves', 'base', flatSlab(roundRect(bw * 0.28, 5, 2.4), [bw * (0.18 + 0.1 * i * 0.0), 0, i * 11 * 0 - 6], 0, 9, 0.6), dk);
        } else { // whole shark, chunky and low
          var L = 38 * p.length, H = 15;
          bellyBall(sc, 'body', 'b', 0, 0, L, H, H, blue, { sq: 2.6, cs: 2.6, cut: 0.4, seg: 30 });
          bellyBall(sc, 'belly', 'b', L * 0.25, 0, L * 0.7, H * 0.78, H * 0.55, white, { sq: 2.6, cs: 2.6, cut: 0.4, seg: 24 });
          bellyBall(sc, 'body', 'b', L * 0.9, 0, 12, H * 0.62, H * 0.62, blue, { sq: 2.4, cut: 0.4 });
          for (i = -1; i <= 1; i += 2) {
            eyeAt(sc, 'face', 'b', [L * 0.8, H * 1.0, i * H * 0.55], 2, EYE);
            sc.add('fins', 'b', flatSlab([[-3, 2], [-1, 12 * F], [9, 18 * F], [12, 8 * F], [6, 2]].map(function (q) { return [q[0], q[1]]; }), [L * 0.35, 0, i * (H * 0.85)], i > 0 ? -Math.PI / 2 + 0.4 : Math.PI / 2 - 0.4, 3, 0.7), dk);
          }
          sc.add('fins', 'b', plate([[-14 * F, 0], [14 * F, 0], [6 * F, 20 * F * p.tall], [-6 * F, 34 * F * p.tall], [-4 * F, 12 * F]], [L * 0.1, H * 0.9, -1.8], 0, 3.6, 1, 0.9), dk);
          sc.add('fins', 'b', plate([[10, 4], [-26 * F, 4], [-22 * F, 26 * F * p.tall], [-6, 32 * F * p.tall], [8, 14], [6, 0]].map(function (q) { return [q[0], q[1]]; }), [-L - 6, 0, -1.8], 0, 3.6, 1, 0.9), dk);
          for (i = -1; i <= 1; i += 2) for (var t = 0; t < 4; t++) spike(sc, 'teeth', 'b', [L * 0.86 + t * 2.2 - 3, H * 0.05 + 0.4, i * H * 0.28], [0, -1, 0], 0.9, 2.6, white, 1.2, 6);
        }
        return finish(sc);
      }

      var SHARK2_PARAMS = [
        { group: 'Shark', key: 'kind', label: 'Model', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Fin trophy', 'Whole shark'] },
        { group: 'Shark', key: 'fin', label: 'Fin size', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 },
        { group: 'Shark', key: 'tall', label: 'Fin height (short ↔ tall)', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Trophy', key: 'baseW', label: 'Base width', unit: ' mm', min: 70, max: 120, step: 1, value: 90 },
        { group: 'Whole shark', key: 'length', label: 'Body length', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-087',
        category: 'ANIMALS // SEA LIFE',
        title: 'Shark Fin Trophy',
        fileName: 'Shark',
        defaultColor: '#93c5fd',
        palette: ANIMAL_PALETTE,
        partNames: { base: 'Base', plate: 'Name plate strip', fin: 'Shark fin', waves: 'Waves', body: 'Body', belly: 'Belly', face: 'Eyes', fins: 'Fins', teeth: 'Teeth' },
        parameters: SHARK2_PARAMS,
        presets: makePresets(SHARK2_PARAMS, [
          ['Default fin trophy', {}],
          ['Great white fin', { fin: 1.3, tall: 1.25, baseW: 110 }],
          ['Mini fin', { fin: 0.7, baseW: 72 }],
          ['Whole shark', { kind: 1 }],
          ['Long hammer-free shark', { kind: 1, length: 1.35, fin: 1.1 }]
        ]),
        build: buildShark2
      };
