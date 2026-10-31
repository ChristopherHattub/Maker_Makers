      // -----------------------------------------------------------------------
      // Octopus & Squid: a mantle dome with curling tentacles lying on the bed
      // -----------------------------------------------------------------------
      function buildOcto(p) {
        var sc = new Scene(), sq = Math.round(p.kind) === 1, n = Math.round(p.arms), i, pink = sq ? '#fda4af' : '#c084fc', pale = sq ? '#fecdd3' : '#e9d5ff';
        var R = 17 * p.size, hr = R;
        if (!sq) {
          bellyBall(sc, 'head', 'h', 0, 0, R, R * 0.95, R * 1.5, pink, { sq: 2.4, cs: 2.4, cut: 0.4, seg: 30 });
          for (i = -1; i <= 1; i += 2) {
            eyeAt(sc, 'eyes', 'h', [R * 0.78, R * 0.95, i * R * 0.5], 3.4, '#f8fafc');
            eyeAt(sc, 'pupils', 'h', [R * 0.78 + 2.6, R * 0.95, i * R * 0.5], 1.9, EYE);
          }
        } else { // squid: a long mantle lying back, short head and fins
          bellyBall(sc, 'head', 'h', -R * 0.9, 0, R * 1.9, R * 0.8, R * 0.8, pink, { sq: 2.4, cs: 2.4, cut: 0.4, seg: 30 });
          bellyBall(sc, 'head', 'h', R * 0.85, 0, R * 0.85, R * 0.75, R * 0.7, pink, { sq: 2.6, cs: 2.6, cut: 0.4 });
          for (i = -1; i <= 1; i += 2) {
            eyeAt(sc, 'eyes', 'h', [R * 1.1, R * 0.62, i * R * 0.55], 3, '#f8fafc');
            eyeAt(sc, 'pupils', 'h', [R * 1.1 + 2.3, R * 0.62, i * R * 0.55], 1.7, EYE);
          }
          sc.add('fins', 'h', plate([[R * 0.5, 0], [-R * 0.95, 0], [-R * 0.75, R * 0.8], [-R * 0.2, R * 1.5], [R * 0.2, R * 0.9]], [-R * 1.7, 7, -1.5], 0, 3, 1, 0.9), pale);
        }
        // tentacles: tubes lying on the bed that sweep out and curl at the tip
        for (i = 0; i < n; i++) {
          var base, a, len = p.length * R, cu = p.curl;
          if (!sq) a = TAU * (i + 0.5) / n; else a = lerp(-Math.PI * 0.62, Math.PI * 0.62, n > 1 ? i / (n - 1) : 0.5);
          var dx = Math.cos(a), dz = Math.sin(a), ox = sq ? R * 1.45 : 0, r0 = sq ? R * 0.5 : R * 0.8;
          var sgn = (i % 2 ? -1 : 1) * cu;
          var pts = [], k;
          for (k = 0; k <= 5; k++) {
            var u = k / 5, ang = a + sgn * 1.6 * u * u, rad = r0 + len * u * (sq ? 0.8 : 1);
            if (sq && u > 0.01) { ang = a * (1 - 0.25 * u) + sgn * 0.5 * u * u; }
            pts.push([ox + Math.cos(ang) * rad, 3, Math.sin(ang) * rad]);
          }
          tubeAdd(sc, 'arms', 'a' + i, pts, function (t) { return (sq ? 4.4 : 5.6) * (1 - 0.72 * t) + 0.8; }, i % 2 ? pale : pink, { ground: true, per: 8 });
        }
        return finish(sc);
      }

      var OCTO_PARAMS = [
        { group: 'Creature', key: 'kind', label: 'Kind', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Octopus', 'Squid'] },
        { group: 'Creature', key: 'size', label: 'Body size', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Tentacles', key: 'arms', label: 'Tentacles', unit: '', min: 4, max: 10, step: 1, value: 8 },
        { group: 'Tentacles', key: 'length', label: 'Tentacle length', unit: '×', min: 1.2, max: 3, step: 0.1, value: 2 },
        { group: 'Tentacles', key: 'curl', label: 'Curl (straight ↔ curly)', unit: '×', min: 0, max: 1.5, step: 0.05, value: 0.8 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-085',
        category: 'ANIMALS // SEA LIFE',
        title: 'Octopus & Squid',
        fileName: 'Octopus',
        defaultColor: '#c084fc',
        palette: ANIMAL_PALETTE,
        partNames: { head: 'Body', eyes: 'Eyes', pupils: 'Pupils', arms: 'Tentacles', fins: 'Fins' },
        parameters: OCTO_PARAMS,
        presets: makePresets(OCTO_PARAMS, [
          ['Default octopus', {}],
          ['Curly octopus', { curl: 1.5, length: 2.4 }],
          ['Baby octopus', { size: 0.75, arms: 6, length: 1.5 }],
          ['Squid', { kind: 1, arms: 8, length: 1.8, curl: 0.4 }],
          ['Long-armed squid', { kind: 1, arms: 10, length: 2.4, curl: 0.2 }]
        ]),
        build: buildOcto
      };
