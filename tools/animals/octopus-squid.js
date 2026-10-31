      // -----------------------------------------------------------------------
      // Octopus & Squid: a soft sculpted mantle, with tentacles and suckers that curl flat on the bed
      // -----------------------------------------------------------------------
      function buildOcto(p) {
        var sc = new Scene(), S = new Sculpt(1.25 + 0.2 * p.size * (p.length - 1)), sq = Math.round(p.kind) === 1, n = Math.round(p.arms), i, k;
        var pink = sq ? '#fda4af' : '#c084fc', pale = sq ? '#ffe4e6' : '#f3e8ff', deep = sq ? '#fb7185' : '#a855f7', R = 17 * p.size, eyeY, eyeZ, eyeX;
        if (!sq) {
          S.ell('head', [0, R * 0.7, 0], [R * 1.08, R * 0.8, R * 1.08], pink, 5);    // skirt where the arms start
          S.ell('head', [-R * 0.16, R * 1.75, 0], [R * 1.02, R * 1.3, R * 0.98], pink, 7); // mantle
          eyeY = R * 1.16; eyeZ = R * 0.56; eyeX = 0;
          S.path(null, [[R * 1.18, R * 0.78, -R * 0.2, 0.9], [R * 1.28, R * 0.7, 0, 1], [R * 1.18, R * 0.78, R * 0.2, 0.9]], null, 0, 3).carve(0.8);
          for (i = 0; i < 6; i++) { var a0 = 2 + i * 0.75, y0 = R * (1.5 + (i % 3) * 0.55); S.paint('spots', [-R * 0.16 + Math.cos(a0) * R, y0, Math.sin(a0) * R], [R * 0.27, R * 0.27, R * 0.27], deep); }
        } else {
          S.path('head', [[-R * 2.7, R * 0.42, 0, R * 0.36], [-R * 1.4, R * 0.72, 0, R * 0.86], [-R * 0.2, R * 0.74, 0, R * 0.92], [R * 0.7, R * 0.6, 0, R * 0.72]], pink, 3);
          S.ell('head', [R * 1.1, R * 0.62, 0], [R * 0.72, R * 0.66, R * 0.78], pink, 3);
          [-1, 1].forEach(function (s) { S.ell('fins', [-R * 2.3, 1.7, s * R * 0.66], [R * 0.82, 1.9, R * 0.86], pale, 1.5); });
          eyeY = R * 0.8; eyeZ = R * 0.5; eyeX = R * 1.1;
          for (i = 0; i < 5; i++) S.paint('spots', [-R * (0.4 + i * 0.42), R * 1.5, (i % 2 ? 1 : -1) * R * 0.3], [R * 0.17, R * 0.3, R * 0.17], deep);
        }
        var r0 = (sq ? 4.8 : 6.6) * Math.sqrt(p.size), ox = sq ? R * 1.5 : 0, base = sq ? R * 0.55 : R * 0.84, len = p.length * R;
        for (i = 0; i < n; i++) {
          var a = sq ? lerp(-Math.PI * 0.55, Math.PI * 0.55, n > 1 ? i / (n - 1) : 0.5) : TAU * (i + 0.5) / n, sgn = (i % 2 ? -1 : 1) * p.curl, pts = [];
          for (k = 0; k <= 7; k++) {
            var u = k / 7, ang = sq ? a * (1 - 0.25 * u) + sgn * 0.5 * u * u : a + sgn * 1.0 * Math.pow(u, 2), rad = base + len * (sq ? 0.8 : 1) * Math.pow(u, 0.9), r = r0 * (1 - 0.66 * u);
            pts.push([ox + Math.cos(ang) * rad, r * 0.62, Math.sin(ang) * rad, r]);
          }
          S.path('arms', pts, pink, 2.5, 4);
          for (k = 1; k < 7; k++) { // suckers along the top of each arm
            var q = pts[k], sr = q[3] * 0.56;
            S.ell('suckers', [q[0], q[1] + q[3] * 0.84, q[2]], [sr, sr * 0.62, sr], pale, 0.7);
          }
        }
        S.reach = 0.72;
        S.run();
        [-1, 1].forEach(function (s) {
          var e = S.hit([eyeX + R * 5, eyeY, s * eyeZ], [-1, 0, 0]), er = R * 0.3;
          sc.add('eyes', 'b', dome(e.p, e.n, er, { angle: 48, seg: 26 }), '#f8fafc');
          var rise = (er / Math.sin(deg(48))) * (1 - Math.cos(deg(48)));
          sc.add('pupils', 'b', dome(vadd(e.p, vmul(e.n, rise * 0.7)), e.n, er * 0.56, { sink: 0.7 }), '#1e293b');
        });
        S.addTo(sc);
        return finishSculpt(sc);
      }

      var OCTO_PARAMS = [
        { group: 'Creature', key: 'kind', label: 'Kind', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Octopus', 'Squid'] },
        { group: 'Creature', key: 'size', label: 'Body size', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Tentacles', key: 'arms', label: 'Tentacles', unit: '', min: 4, max: 10, step: 1, value: 8, slider: true },
        { group: 'Tentacles', key: 'length', label: 'Tentacle length', unit: '×', min: 1.2, max: 3, step: 0.1, value: 1.7 },
        { group: 'Tentacles', key: 'curl', label: 'Curl (straight ↔ curly)', unit: '×', min: 0, max: 1.5, step: 0.05, value: 0.8 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-085',
        category: 'ANIMALS // SEA LIFE',
        title: 'Octopus & Squid',
        fileName: 'Octopus',
        defaultColor: '#c084fc',
        palette: ANIMAL_PALETTE,
        partNames: { head: 'Body', spots: 'Spots', eyes: 'Eyes', pupils: 'Pupils', arms: 'Tentacles', suckers: 'Suckers', fins: 'Fins' },
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
