      // -----------------------------------------------------------------------
      // Owl Stacker: an owl, or a totem of up to three owls stacked in one column
      // -----------------------------------------------------------------------
      function buildOwl(p) {
        var sc = new Scene(), n = Math.round(p.owls), i, u, brown = '#b08968', cream = '#fef3c7', gold = '#fbbf24';
        var R = 17 * p.chunk, unitH = 40, H = unitH * n + 8;
        var hh = H / 1.4, cyy = 0.4 * hh;
        function rAt(y) { var q = clamp((y - cyy) / hh, 0, 0.999); return R * 1.02 * Math.pow(1 - Math.pow(q, 2.6), 1 / 2.6); }
        bellyBall(sc, 'body', 'b', 0, 0, R, R * 1.02, H / 1.4, brown, { sq: 2.6, cs: 2.6, cut: 0.4, seg: 30 });
        for (u = 0; u < n; u++) {
          var y0 = 8 + u * unitH, fy = y0 + unitH * 0.62;
          // belly feathers on the lower half of each unit
          if (u < n) ball(sc, 'belly', 'b', [R * 0.55, y0 + unitH * 0.2, 0], R * 0.45, R * 0.62, unitH * 0.2, cream, { dir: [0, 1, 0] });
          // face: two big eye discs, pupils and a beak
          for (i = -1; i <= 1; i += 2) {
            ball(sc, 'eyes', 'b', [R * 0.78, fy, i * R * 0.42], 2.6, R * 0.34, R * 0.34, cream, { dir: [1, 0, 0] });
            eyeAt(sc, 'pupils', 'b', [R * 0.78 + 2, fy, i * R * 0.42], p.pupil, EYE);
            if (p.wings > 0) sc.add('wings', 'b', plate([[R * 0.55, unitH * 0.25 * p.wings], [R * 0.3, unitH * 0.58 * p.wings], [-R * 0.15, unitH * 0.6 * p.wings], [-R * 0.55, unitH * 0.3 * p.wings], [-R * 0.2, -unitH * 0.2 * p.wings]],
              [0, y0 + unitH * 0.4, i * (rAt(y0 + unitH * 0.5) - 1.4)], 0, i > 0 ? 1 : -1, 3, 0.8), '#8d6e4b');
          }
          spike(sc, 'beak', 'b', [R * 0.9, fy - 2, 0], vnorm([0.55, -1, 0]), 2.8, 7, gold, 2.5);
        }
        // ear tufts on the top owl
        for (i = -1; i <= 1; i += 2) spike(sc, 'tufts', 'b', [R * 0.1, H * 0.93, i * rAt(H * 0.93) * 0.75], vnorm([-0.1, 1, i * 0.25]), 3.6, 11 * p.tufts, brown, 5);
        // feet
        for (i = -1; i <= 1; i += 2) bellyBall(sc, 'feet', 'b', R * 0.55, i * R * 0.45, 6, 4, 3, gold);
        return finish(sc);
      }

      var OWL_PARAMS = [
        { group: 'Owl', key: 'owls', label: 'Owls in the stack', unit: '', min: 1, max: 3, step: 1, value: 1 },
        { group: 'Owl', key: 'chunk', label: 'Width (slim ↔ chunky)', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Owl', key: 'wings', label: 'Wing length (0 = none)', unit: '×', min: 0, max: 1.4, step: 0.05, value: 1 },
        { group: 'Face', key: 'pupil', label: 'Pupil size', unit: ' mm', min: 1.4, max: 4, step: 0.1, value: 2.6 },
        { group: 'Face', key: 'tufts', label: 'Ear tuft length', unit: '×', min: 0.4, max: 1.6, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-083',
        category: 'ANIMALS // BIRDS',
        title: 'Owl Stacker',
        fileName: 'Owl',
        defaultColor: '#b08968',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly feathers', eyes: 'Eye discs', pupils: 'Pupils', wings: 'Wings', beak: 'Beaks', tufts: 'Ear tufts', feet: 'Feet' },
        parameters: OWL_PARAMS,
        presets: makePresets(OWL_PARAMS, [
          ['Default owl', {}],
          ['Owl pair', { owls: 2 }],
          ['Owl totem', { owls: 3, chunk: 0.9 }],
          ['Wide-eyed owlet', { chunk: 1.25, pupil: 3.6, wings: 0.6, tufts: 0.5 }]
        ]),
        build: buildOwl
      };
