      // -----------------------------------------------------------------------
      // Centipede: a long chain of beads, a pair of legs on every bead, feelers and tail prongs
      // -----------------------------------------------------------------------
      function legBlade(L, sweep, y0, half, root) {
        var sw = Math.tan(deg(sweep));
        return [[-half, root], [-half, y0], [sw * L - 0.7, y0 + L], [sw * L + 0.7, y0 + L], [half, y0], [half, root]];
      }

      function buildCentipede(p) {
        var g = p.gap, n = Math.round(p.segments), sc = new Scene(), k;
        var rj = [];
        for (k = 0; k <= n; k++) {
          var t = k / n;
          rj.push(Math.max(3.7, p.bodyR * (0.82 + 0.18 * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.1))) * lerp(1, p.tailTaper, Math.pow(t, 2))));
        }
        var Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g), P = [];
        for (k = 1; k <= n; k++) P.push(p.pitch);
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: wiggle(n, p.wiggle, p.waves).map(function (y, i) { return y * lerp(1, 0.45, Math.pow((i + 1) / n, 2)); }), g: g, bulge: p.bead, tip: rj[n] * 1.1, bend: p.__bend,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        var hs = p.headSize, hd = headShell([0, Y0, 0], [1, 0, 0], jd0, rj[0], 14 * hs, 1.3 * rj[0] * hs, 0.8 * rj[0] * hs, 0.7, 0);
        sc.add('head', 'head', hd.shell, '#fb923c');
        sc.add('head', 'head', ch.rootBall, '#fb923c');
        [-1, 1].forEach(function (sd) {
          sc.add('eyes', 'head', blobShell(hd.point(0.45, sd * deg(55), 0.97), [1, 0, 0], 2.4, 2.4, 2.4, 10, 0), '#334155');
          // feelers: thin blades lying on the bed, pointing forward and out
          var base = hd.point(0.3, sd * deg(70), 0.8), hdg = heading([-1, 0, sd * p.feelerSplay * 0.02]);
          sc.add('feelers', 'head', flatSlab([[-2, -0.9], [p.feelerLen * 0.5, -1.0], [p.feelerLen, sd * -0.0 - 0.3], [p.feelerLen, 0.3], [p.feelerLen * 0.5, 1.0], [-2, 0.9]].map(function (q) { return [q[0], q[1]]; }),
            [base[0], 0, base[2]], hdg + sd * deg(-p.feelerSplay), 1.8, 0.4), '#fde047');
        });
        ch.segs.forEach(function (sg) {
          var id = 'seg' + sg.k, rm = sg.rad(0.5) * 1.02, bl = sg.sF - sg.sR;
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', id, sg.shell, sg.k % 2 ? '#fb923c' : '#fdba74');
          var half = Math.min(bl * 0.2, 1.5), hdg = heading(sg.fr.a), mid = axisAt(sg, 0.5);
          [-1, 1].forEach(function (sd) {
            sc.add('legs', id, flatSlab(mirrorPoly(legBlade(p.legLen * (0.75 + 0.25 * Math.sin(Math.PI * sg.k / n)), p.legSweep, rm + 1.6, half, slabRoot(sg, 2.2)), sd), [mid[0], 0, mid[2]], hdg, 2.2, 0.5), '#fde047');
          });
        });
        // tail prongs on the last bead
        var last = ch.segs[n - 1], tm = axisAt(last, 0.7);
        [-1, 1].forEach(function (sd) {
          sc.add('feelers', 'seg' + n, flatSlab([[-1, 0.4 * sd], [p.feelerLen * 0.7, sd * 4], [p.feelerLen * 0.7 + 1, sd * 4 + 0.4], [2, 0.4 * sd + sd * 1.8]].map(function (q) { return q; }),
            [tm[0], 0, tm[2]], heading(last.fr.a), 2.0, 0.4), '#fde047');
        });
        return sc.entries();
      }

      var CENTI_PARAMS = [
        { group: 'Body', key: 'segments', label: 'Segments', unit: '', min: 8, max: 22, step: 1, value: 14 },
        { group: 'Body', key: 'pitch', label: 'Segment length', unit: ' mm', min: 8, max: 14, step: 0.5, value: 10 },
        { group: 'Body', key: 'bodyR', label: 'Body thickness (radius)', unit: ' mm', min: 4.5, max: 9, step: 0.5, value: 6 },
        { group: 'Body', key: 'tailTaper', label: 'Taper to the tail (thin ↔ full)', unit: '×', min: 0.6, max: 1, step: 0.05, value: 0.75 },
        { group: 'Body', key: 'bead', label: 'Bead fullness (smooth ↔ knobbly)', unit: '', min: 0, max: 0.45, step: 0.05, value: 0.25 },
        { group: 'Pose', key: 'wiggle', label: 'Wiggle (straight ↔ curvy)', unit: '°', min: 0, max: 8, step: 0.5, value: 5 },
        { group: 'Pose', key: 'waves', label: 'Waves along the body', unit: '', min: 0.5, max: 3, step: 0.25, value: 1.5 },
        { group: 'Legs & feelers', key: 'legLen', label: 'Leg length', unit: ' mm', min: 8, max: 24, step: 1, value: 16 },
        { group: 'Legs & feelers', key: 'legSweep', label: 'Legs sweep back', unit: '°', min: 0, max: 40, step: 1, value: 22 },
        { group: 'Legs & feelers', key: 'feelerLen', label: 'Feeler length', unit: ' mm', min: 8, max: 34, step: 1, value: 20 },
        { group: 'Legs & feelers', key: 'feelerSplay', label: 'Feelers spread', unit: '°', min: 5, max: 70, step: 1, value: 30 },
        { group: 'Legs & feelers', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-096',
        category: 'FLEXI // BUGS',
        title: 'Flexi Centipede',
        fileName: 'Flexi_Centipede',
        defaultColor: '#fb923c',
        palette: FLEXI_PALETTE,
        partNames: { head: 'Head', eyes: 'Eyes', bodyA: 'Body beads', bodyB: 'Body beads, alternate', legs: 'Legs', feelers: 'Feelers & tail prongs' },
        parameters: CENTI_PARAMS,
        presets: makePresets(CENTI_PARAMS, [
          ['Default centipede', {}],
          ['Giant (22 segments)', { segments: 22, pitch: 9, wiggle: 6, waves: 2 }],
          ['Stubby', { segments: 9, bodyR: 7.5, legLen: 11, bead: 0.35, headSize: 1.2 }],
          ['Hairy legs', { legLen: 24, legSweep: 30, feelerLen: 30 }],
          ['Straight (easy print)', { wiggle: 0 }]
        ]),
        build: buildCentipede
      };
