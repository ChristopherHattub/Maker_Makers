      // -----------------------------------------------------------------------
      // Articulated Snake: print-in-place beads, a wedge head with a forked tongue
      // -----------------------------------------------------------------------
      function buildSnake(p) {
        var g = p.gap, n = Math.round(p.segments), sc = new Scene(), k;
        var rj = [];
        for (k = 0; k <= n; k++) {
          var t = k / n;
          rj.push(Math.max(3.7, p.bodyR * (0.8 + 0.2 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.1))) * lerp(1, p.tailTaper, Math.pow(t, 1.7))));
        }
        var Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g), P = [];
        for (k = 1; k <= n; k++) P.push(p.pitch * lerp(1, 0.85, k / n));
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: wiggle(n, p.wiggle, p.waves), g: g, bulge: p.bead, tip: rj[n] * 1.6, bend: p.__bend, seg: 32,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        // sculpted wedge head with brows, jaw and nostrils; it stays clear of the first joint
        var hs = p.headSize, hR = rj[0] * 1.2 * hs, hL = 24 * hs, rear = -jd0.e, Sk = new Sculpt(0.75), hc = '#4ade80', neckR = rj[0];
        var hx = rear - hL * 0.5;
        Sk.path('head', [[rear - 0.4, neckR * 0.72, 0, neckR * 0.95], [hx, hR * 0.56, 0, hR * 0.9], [rear - hL * 0.9, hR * 0.32, 0, hR * 0.46]], hc, 3);
        [-1, 1].forEach(function (s) {
          Sk.ell('head', [hx + 2, hR * 0.56, s * hR * 0.72], [hL * 0.34, hR * 0.5, hR * 0.46], hc, 2.5);
          Sk.path('head', [[hx + hL * 0.25, hR * 1.14, s * hR * 0.56, 1.3], [hx - hL * 0.18, hR * 1.02, s * hR * 0.5, 1]], hc, 1.2);
          Sk.ell('head', [rear - hL * 0.88, hR * 0.56, s * hR * 0.2], [1.3, 1.1, 1.1], hc, 0.8);
          Sk.path(null, [[rear - hL * 1.02, hR * 0.22, s * hR * 0.22, 0.55], [hx + 2, hR * 0.28, s * hR * 1.1, 0.6]], null, 0).carve(0.5);
        });
        Sk.clipX(rear - 0.1);
        Sk.reach = 0.72;
        Sk.run();
        sc.add('head', 'head', ch.rootBall, hc);
        [-1, 1].forEach(function (sd) {
          var e = Sk.hit([hx - hL * 0.14, hR * 0.86, sd * 60], [0, 0, -sd]);
          sc.add('eyes', 'head', dome(e.p, e.n, 2.6 * hs, { angle: 46, seg: 18 }), '#fde047');
          sc.add('pupils', 'head', dome(vadd(e.p, vmul(e.n, 0.75 * hs)), e.n, 1.1 * hs, { sink: 0.5 }), '#1e293b');
        });
        var nose = Sk.hit([rear - hL - 30, 2, 0], [1, 0, 0]);
        if (p.tongue > 0) {
          var T = p.tongue, w = 1.1;
          sc.add('tongue', 'head', flatSlab([[-2, -w], [T * 0.55, -w], [T, -w * 2.8], [T * 0.62, -w * 0.5], [T * 0.62, w * 0.5], [T, w * 2.8], [T * 0.55, w], [-2, w]], [nose.p[0] + 0.5, 0, 0], Math.PI, 1.6, 0.4), '#fb7185');
        }
        Sk.addTo(sc, 'head');
        ch.segs.forEach(function (sg) {
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', 'seg' + sg.k, sg.shell, sg.k % 2 ? '#4ade80' : '#fde047');
        });
        return finishSculpt(sc);
      }

      var SNAKE_PARAMS = [
        { group: 'Body', key: 'segments', label: 'Segments (length)', unit: '', min: 10, max: 24, step: 1, value: 16 },
        { group: 'Body', key: 'pitch', label: 'Segment length', unit: ' mm', min: 8, max: 14, step: 0.5, value: 10.5 },
        { group: 'Body', key: 'bodyR', label: 'Body thickness (radius)', unit: ' mm', min: 5, max: 10, step: 0.5, value: 6.5 },
        { group: 'Body', key: 'tailTaper', label: 'Taper to the tail (thin ↔ full)', unit: '×', min: 0.4, max: 0.9, step: 0.05, value: 0.6 },
        { group: 'Body', key: 'bead', label: 'Bead fullness (smooth ↔ knobbly)', unit: '', min: 0, max: 0.45, step: 0.05, value: 0.22 },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.5, step: 0.05, value: 1.1 },
        { group: 'Head', key: 'tongue', label: 'Tongue length (0 = none)', unit: ' mm', min: 0, max: 22, step: 1, value: 12 },
        { group: 'Pose', key: 'wiggle', label: 'Slither (straight ↔ curvy)', unit: '°', min: 0, max: 12, step: 0.5, value: 6 },
        { group: 'Pose', key: 'waves', label: 'Waves along the body', unit: '', min: 0.5, max: 3, step: 0.25, value: 1.5 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-080',
        category: 'ANIMALS // FLEXI',
        title: 'Articulated Snake',
        fileName: 'Flexi_Snake',
        defaultColor: '#4ade80',
        palette: ANIMAL_PALETTE,
        partNames: { head: 'Head', eyes: 'Eyes', pupils: 'Pupils', tongue: 'Tongue', bodyA: 'Body beads', bodyB: 'Body beads, alternate' },
        parameters: SNAKE_PARAMS,
        presets: makePresets(SNAKE_PARAMS, [
          ['Default snake', {}],
          ['Long python', { segments: 24, bodyR: 7.5, pitch: 9.5, wiggle: 7, waves: 2 }],
          ['Garden snake', { segments: 12, bodyR: 5.5, tongue: 16, headSize: 1.2 }],
          ['Fat cobra', { segments: 14, bodyR: 9, headSize: 1.45, tailTaper: 0.5, wiggle: 4 }],
          ['Straight (easy print)', { wiggle: 0 }]
        ]),
        build: buildSnake
      };
