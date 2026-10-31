      // -----------------------------------------------------------------------
      // Shark Fin Trophy: one or two swept fins cutting through a wave top on a stepped plinth.
      // The waves are one closed height field and each fin is a lens-section loft, so nothing overhangs.
      // -----------------------------------------------------------------------
      function finShell(x, z, y0, H, chord, thick, sweep) {
        var rings = [], N = 26, i;
        for (i = 0; i <= N; i++) {
          var t = i / N, y = y0 + H * t;
          rings.push({ y: y, cx: x - sweep * H * Math.pow(t, 1.5), cz: z, rx: Math.max(chord * Math.pow(1 - t, 0.72), 1.3), rz: Math.max(thick * Math.pow(1 - t, 0.55), 1.1) });
        }
        return loft(rings, 44, { pow: 1.6 }).tris;
      }
      function buildSharkFin(p) {
        var sc = new Scene(), R = p.base / 2, hP = p.plinth, square = Math.round(p.shape) === 1, pw = square ? 5 : 2, A = p.waveH, W = p.waves;
        function step(r0, r1, y0, y1) { return loft([{ y: y0, cx: 0, cz: 0, rx: r0, rz: r0 * 0.72 }, { y: y1 - 1.6, cx: 0, cz: 0, rx: r0, rz: r0 * 0.72 }, { y: y1, cx: 0, cz: 0, rx: r1, rz: r1 * 0.72 }], 72, { pow: pw, poleLift: 0 }).tris; }
        sc.add('plinth', 'b', step(R, R - 1.6, 0, hP * 0.55), '#475569');
        sc.add('plinth', 'b', step(R - 4, R - 5.6, hP * 0.5, hP), '#64748b');
        var rw = R - 6, freq = (TAU * W) / (2 * rw);
        function top(x, z) {
          var d = Math.hypot(x, z / 0.72) / rw, edge = 1 - smooth((d - 0.8) / 0.2);
          return hP + 0.6 + edge * A * (0.55 + 0.45 * Math.sin(x * freq + 1.1 * Math.sin(z * freq * 0.6)));
        }
        var pos = reliefDisc(rw, hP - 1, function (x, z) { return top(x, z / 0.72); }, 30, 96, square ? 5 : 0);
        for (var i = 2; i < pos.length; i += 3) pos[i] *= 0.72;
        sc.add('waves', 'b', pos, '#60a5fa');
        var h = p.height, c = p.chord, fins = Math.round(p.fins);
        sc.add('fin', 'b', finShell(fins === 2 ? c * 0.55 : c * 0.2, fins === 2 ? -rw * 0.22 : 0, hP - 0.5, h, c, p.thick, p.sweep), '#93c5fd');
        if (fins === 2) sc.add('fin2', 'b', finShell(-c * 0.5, rw * 0.26, hP - 0.5, h * 0.62, c * 0.68, p.thick * 0.8, p.sweep), '#bfdbfe');
        return finish(sc);
      }
      var SHARKFIN_PARAMS = [
        { group: 'Fin', key: 'height', label: 'Fin height', unit: ' mm', min: 40, max: 110, step: 1, value: 72 },
        { group: 'Fin', key: 'chord', label: 'Fin width at the waves (half)', unit: ' mm', min: 14, max: 34, step: 1, value: 24 },
        { group: 'Fin', key: 'sweep', label: 'Sweep back (upright ↔ raked)', unit: '×', min: 0, max: 0.8, step: 0.05, value: 0.5 },
        { group: 'Fin', key: 'thick', label: 'Fin thickness (half)', unit: ' mm', min: 2.5, max: 7, step: 0.5, value: 4.5 },
        { group: 'Fin', key: 'fins', label: 'Fins', unit: '', min: 1, max: 2, step: 1, value: 1, options: ['One fin', 'Two fins'] },
        { group: 'Base', key: 'base', label: 'Base width', unit: ' mm', min: 70, max: 130, step: 1, value: 96 },
        { group: 'Base', key: 'plinth', label: 'Plinth height', unit: ' mm', min: 8, max: 26, step: 1, value: 14 },
        { group: 'Base', key: 'shape', label: 'Base shape', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Oval', 'Rounded square'] },
        { group: 'Waves', key: 'waveH', label: 'Wave height', unit: ' mm', min: 1, max: 7, step: 0.5, value: 4 },
        { group: 'Waves', key: 'waves', label: 'Waves across', unit: '', min: 2, max: 7, step: 0.5, value: 4 }
      ];
      window.MM_GENERATOR = {
        code: 'MM-087',
        category: 'ANIMALS // SEA LIFE',
        title: 'Shark Fin Trophy',
        fileName: 'Shark_Fin_Trophy',
        defaultColor: '#93c5fd',
        palette: ANIMAL_PALETTE,
        partNames: { plinth: 'Plinth', waves: 'Waves', fin: 'Shark fin', fin2: 'Second fin' },
        parameters: SHARKFIN_PARAMS,
        presets: makePresets(SHARKFIN_PARAMS, [
          ['Default fin trophy', {}],
          ['Great white', { height: 100, chord: 32, thick: 6, base: 120, plinth: 18, waveH: 5 }],
          ['Mini desk fin', { height: 44, chord: 16, thick: 3, base: 72, plinth: 9, waveH: 2.5, waves: 3 }],
          ['Circling pair', { fins: 2, base: 124, height: 76, chord: 22 }],
          ['Square plaque', { shape: 1, sweep: 0.35, plinth: 12 }]
        ]),
        build: buildSharkFin
      };
