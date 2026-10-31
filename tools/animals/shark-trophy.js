      // -----------------------------------------------------------------------
      // Shark Fin Trophy: a shark's back breaking the surface, with its fin and tail tip, on a stepped plinth.
      // The back, fin and tail are sculpted as one surface, blended into rolling waves with white caps.
      // -----------------------------------------------------------------------
      function buildSharkFin(p) {
        var sc = new Scene(), S = new Sculpt(Math.max(1.55, p.base / 62)), R = p.base / 2, hP = p.plinth, square = Math.round(p.shape) === 1, A = p.waveH, W = p.waves, h = p.height, c = p.chord, fins = Math.round(p.fins), i;
        var rw = R - 3, zk = 0.72, blue = '#60a5fa', fin = '#93c5fd', foam = '#f8fafc', gold = '#fbbf24', sea = hP + A * 0.5, freq = (TAU * W) / (2 * rw);
        // plinth: a chamfered foot with a gold band and a top step
        var pw = square ? 5 : 2;
        function step(r0, y0, y1, color, name) {
          var cm = Math.min(1.8, (y1 - y0) * 0.3);
          sc.add(name, 'b', loft([{ y: y0, cx: 0, cz: 0, rx: r0, rz: r0 * zk }, { y: y1 - cm, cx: 0, cz: 0, rx: r0, rz: r0 * zk }, { y: y1, cx: 0, cz: 0, rx: r0 - cm, rz: (r0 - cm) * zk }], 96, { pow: pw, poleLift: 0 }).tris, color);
        }
        step(R + 3, 0, hP * 0.44, '#334155', 'plinth');
        step(R + 0.5, hP * 0.4, hP * 0.62, gold, 'band');
        step(R - 1, hP * 0.58, hP + 1, '#475569', 'plinth');
        // waves and the shark share one sculpted surface
        function top(x, z) {
          var d = square ? Math.pow(Math.pow(Math.abs(x / rw), pw) + Math.pow(Math.abs(z / (rw * zk)), pw), 1 / pw) : Math.hypot(x / rw, z / (rw * zk));
          var edge = 1 - smooth((d - 0.82) / 0.18), wv = Math.sin(x * freq + 1.2 * Math.sin(z * freq * 0.7)) + 0.4 * Math.sin(x * freq * 2.1 + z * freq * 1.3);
          return Math.max(hP + 1.2, hP + 1.2 + edge * (A * 0.55 + A * 0.34 * wv));
        }
        function shark(x0, z0, sc1, nm) {
          var H = h * sc1, C = c * sc1, sw = p.sweep * H, T = p.thick * sc1;
          S.path('back', [[x0 + C * 2.1, sea - 5, z0, 4], [x0 + C * 0.8, sea + 1.5, z0, 9 * sc1], [x0 - C * 0.7, sea + 2, z0, 9 * sc1], [x0 - C * 2.2, sea - 3, z0, 3.5]], fin, 3);
          S.paint('belly', [x0 + C * 0.6, sea - 2, z0 + 10 * sc1], [C * 3, 3.4, 4], foam);
          var poly = [[C * 1.1, sea - 2], [C * 0.86, sea + H * 0.18], [C * 0.48, sea + H * 0.42], [-sw * 0.1 + C * 0.14, sea + H * 0.66], [-sw * 0.55, sea + H * 0.88], [-sw * 0.96, sea + H], [-sw * 0.94 - 1, sea + H * 0.95], [-sw * 0.62 - C * 0.05, sea + H * 0.66], [-sw * 0.44 - C * 0.3, sea + H * 0.38], [-C * 0.66, sea + H * 0.16], [-C * 1.05, sea - 2]];
          S.plate(nm, poly, [x0, 0, z0], [1, 0, 0], 2 * T, fin, 3, Math.min(1.6, T * 0.7));
          // gentle thickening at the fin root, and the tail tip breaking the water behind it
          S.ell(nm, [x0 - C * 0.05, sea + 2, z0], [C * 0.92, H * 0.14, T * 1.7], fin, 3);
          var tx = x0 - C * 2.25, tH = H * 0.46;
          S.plate(nm, [[C * 0.34, sea - 2], [C * 0.08, sea + tH * 0.46], [-tH * 0.42, sea + tH], [-tH * 0.3, sea + tH * 0.52], [-C * 0.36, sea - 2]], [tx, 0, z0], [1, 0, 0], T * 1.2, fin, 2, Math.min(1, T * 0.5));
        }
        var rx0 = fins === 2 ? rw * 0.1 : 0;
        shark(rx0 + c * 0.2, fins === 2 ? -rw * zk * 0.3 : 0, 1, 'fin');
        if (fins === 2) shark(-rw * 0.08, rw * zk * 0.38, 0.62, 'fin2');
        S._name('waves', blue);
        var waveOp = { name: 'waves', k: 2.2, lo: [-rw, 0, -rw * zk], hi: [rw, hP + A + 2, rw * zk], d: function (x, y, z) {
          var sd = square ? Math.pow(Math.pow(Math.abs(x / rw), pw) + Math.pow(Math.abs(z / (rw * zk)), pw), 1 / pw) : Math.hypot(x / rw, z / (rw * zk));
          return Math.max((y - top(x, z)) * 0.8, (sd - 1) * rw * zk);
        } };
        S.ops.push(waveOp);
        // white caps along the crests, and foam where the fin cuts the water
        S.paint('foam', [rx0 + c * 1.5, sea + 1, fins === 2 ? -rw * zk * 0.3 : 0], [c * 0.9, 3, 12], foam);
        for (i = 0; i < 5; i++) { var fa = i * 2.5 + 0.7; S.paint('foam', [Math.cos(fa) * rw * 0.72, hP + A * 0.9, Math.sin(fa) * rw * zk * 0.72], [rw * 0.22, A * 0.42 + 0.6, rw * 0.1], foam); }
        S.reach = 0.72;
        S.run();
        S.addTo(sc);
        var es = finishSculpt(sc);
        return es;
      }
      var SHARKFIN_PARAMS = [
        { group: 'Fin', key: 'height', label: 'Fin height', unit: ' mm', min: 40, max: 110, step: 1, value: 72 },
        { group: 'Fin', key: 'chord', label: 'Fin width at the waves (half)', unit: ' mm', min: 14, max: 30, step: 1, value: 22 },
        { group: 'Fin', key: 'sweep', label: 'Sweep back (upright ↔ raked)', unit: '×', min: 0.2, max: 0.75, step: 0.05, value: 0.55 },
        { group: 'Fin', key: 'thick', label: 'Fin thickness (half)', unit: ' mm', min: 2.5, max: 6, step: 0.5, value: 3.5 },
        { group: 'Fin', key: 'fins', label: 'Sharks', unit: '', min: 1, max: 2, step: 1, value: 1, options: ['One shark', 'Two sharks'] },
        { group: 'Base', key: 'base', label: 'Base width', unit: ' mm', min: 90, max: 150, step: 1, value: 118 },
        { group: 'Base', key: 'plinth', label: 'Plinth height', unit: ' mm', min: 8, max: 26, step: 1, value: 16 },
        { group: 'Base', key: 'shape', label: 'Base shape', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Oval', 'Rounded square'] },
        { group: 'Waves', key: 'waveH', label: 'Wave height', unit: ' mm', min: 2, max: 8, step: 0.5, value: 5 },
        { group: 'Waves', key: 'waves', label: 'Waves across', unit: '', min: 2, max: 6, step: 0.5, value: 3.5 }
      ];
      window.MM_GENERATOR = {
        code: 'MM-087',
        category: 'ANIMALS // SEA LIFE',
        title: 'Shark Fin Trophy',
        fileName: 'Shark_Fin_Trophy',
        defaultColor: '#93c5fd',
        palette: ANIMAL_PALETTE,
        partNames: { plinth: 'Plinth', band: 'Gold band', waves: 'Waves', foam: 'Foam', back: 'Shark back', belly: 'Pale flank', fin: 'Shark fin', fin2: 'Second shark' },
        parameters: SHARKFIN_PARAMS,
        presets: makePresets(SHARKFIN_PARAMS, [
          ['Default fin trophy', {}],
          ['Great white', { height: 100, chord: 29, thick: 5, base: 148, plinth: 20, waveH: 6 }],
          ['Mini desk fin', { height: 44, chord: 14, thick: 2.5, base: 90, plinth: 9, waveH: 3, waves: 3 }],
          ['Circling pair', { fins: 2, base: 146, height: 70, chord: 20 }],
          ['Square plaque', { shape: 1, sweep: 0.4, plinth: 12 }]
        ]),
        build: buildSharkFin
      };
