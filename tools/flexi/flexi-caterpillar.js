      // -----------------------------------------------------------------------
      // Caterpillar: big round beads with little feet, a head with eyes and two antennae
      // -----------------------------------------------------------------------
      function legBlade(L, sweep, y0, half, root) {
        var sw = Math.tan(deg(sweep));
        return [[-half, root], [-half, y0], [sw * L - 0.7, y0 + L], [sw * L + 0.7, y0 + L], [half, y0], [half, root]];
      }

      function buildCater(p) {
        var g = p.gap, n = Math.round(p.segments), sc = new Scene(), k;
        var rj = [];
        for (k = 0; k <= n; k++) {
          var t = k / n;
          rj.push(Math.max(3.7, p.bodyR * (0.9 + 0.1 * Math.sin(Math.PI * t)) * lerp(1, p.tailTaper, Math.pow(t, 2))));
        }
        var Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g), P = [];
        for (k = 1; k <= n; k++) P.push(p.pitch);
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: wiggle(n, p.wiggle, p.waves).map(function (y, i) { return y * lerp(1, 0.45, Math.pow((i + 1) / n, 2)); }), g: g, bulge: p.bead, tip: rj[n] * 1.1, bend: p.__bend,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        var hs = p.headSize, hd = headShell([0, Y0, 0], [1, 0, 0], jd0, rj[0], 14 * hs, 1.3 * rj[0] * hs, 0.8 * rj[0] * hs, 0.7, 0);
        sc.add('head', 'head', hd.shell, '#86efac');
        sc.add('head', 'head', ch.rootBall, '#86efac');
        [-1, 1].forEach(function (sd) {
          sc.add('eyes', 'head', blobShell(hd.point(0.45, sd * deg(55), 0.97), [1, 0, 0], 2.4, 2.4, 2.4, 10, 0), '#334155');
          // feelers: thin blades lying on the bed, pointing forward and out
          var base = hd.point(0.3, sd * deg(70), 0.8), hdg = heading([-1, 0, sd * p.feelerSplay * 0.02]);
          sc.add('feelers', 'head', flatSlab([[-2, -0.9], [p.feelerLen * 0.5, -1.0], [p.feelerLen, sd * -0.0 - 0.3], [p.feelerLen, 0.3], [p.feelerLen * 0.5, 1.0], [-2, 0.9]].map(function (q) { return [q[0], q[1]]; }),
            [base[0], 0, base[2]], hdg + sd * deg(-p.feelerSplay), 1.8, 0.4), '#fde047');
        });
        ch.segs.forEach(function (sg) {
          var id = 'seg' + sg.k, rm = sg.rad(0.5) * 1.02, bl = sg.sF - sg.sR;
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', id, sg.shell, sg.k % 2 ? '#86efac' : '#a7f3d0');
          var half = Math.min(bl * 0.2, 1.5), hdg = heading(sg.fr.a), mid = axisAt(sg, 0.5);
          [-1, 1].forEach(function (sd) {
            sc.add('legs', id, flatSlab(mirrorPoly(legBlade(p.legLen, p.legSweep, rm + 1.6, half, slabRoot(sg, 2.2)), sd), [mid[0], 0, mid[2]], hdg, 2.2, 0.5), '#fde047');
          });
        });
        return sc.entries();
      }

      var CATER_PARAMS = [
        { group: 'Body', key: 'segments', label: 'Segments', unit: '', min: 6, max: 16, step: 1, value: 10 },
        { group: 'Body', key: 'pitch', label: 'Segment length', unit: ' mm', min: 10, max: 18, step: 0.5, value: 13 },
        { group: 'Body', key: 'bodyR', label: 'Body thickness (radius)', unit: ' mm', min: 6, max: 12, step: 0.5, value: 8.5 },
        { group: 'Body', key: 'tailTaper', label: 'Taper to the tail (thin ↔ full)', unit: '×', min: 0.5, max: 1, step: 0.05, value: 0.7 },
        { group: 'Body', key: 'bead', label: 'Bead fullness (smooth ↔ round)', unit: '', min: 0, max: 0.5, step: 0.05, value: 0.38 },
        { group: 'Pose', key: 'wiggle', label: 'Wiggle (straight ↔ curvy)', unit: '°', min: 0, max: 10, step: 0.5, value: 5 },
        { group: 'Pose', key: 'waves', label: 'Waves along the body', unit: '', min: 0.5, max: 3, step: 0.25, value: 1 },
        { group: 'Feet & antennae', key: 'legLen', label: 'Foot length', unit: ' mm', min: 4, max: 14, step: 1, value: 7 },
        { group: 'Feet & antennae', key: 'legSweep', label: 'Feet sweep back', unit: '°', min: 0, max: 40, step: 1, value: 10 },
        { group: 'Feet & antennae', key: 'feelerLen', label: 'Antenna length', unit: ' mm', min: 8, max: 34, step: 1, value: 18 },
        { group: 'Feet & antennae', key: 'feelerSplay', label: 'Antennae spread', unit: '°', min: 5, max: 70, step: 1, value: 35 },
        { group: 'Feet & antennae', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.5, step: 0.05, value: 1.15 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-100',
        category: 'FLEXI // BUGS',
        title: 'Flexi Caterpillar',
        fileName: 'Flexi_Caterpillar',
        defaultColor: '#a7f3d0',
        palette: FLEXI_PALETTE,
        partNames: { head: 'Head', eyes: 'Eyes', bodyA: 'Body beads', bodyB: 'Body beads, alternate', feelers: 'Antennae' },
        parameters: CATER_PARAMS,
        presets: makePresets(CATER_PARAMS, [
          ['Default caterpillar', {}],
          ['Long caterpillar', { segments: 16, pitch: 11, bodyR: 7, wiggle: 7, waves: 1.5 }],
          ['Chubby', { segments: 7, bodyR: 11, pitch: 16, bead: 0.45, headSize: 1.35 }],
          ['Fuzzy feet', { legLen: 12, legSweep: 25 }],
          ['Straight (easy print)', { wiggle: 0 }]
        ]),
        build: buildCater
      };
