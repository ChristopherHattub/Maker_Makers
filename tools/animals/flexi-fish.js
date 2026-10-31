      // -----------------------------------------------------------------------
      // Flexi Fish: a plump print-in-place fish with a rounded head, fan tail, dorsal and side fins
      // -----------------------------------------------------------------------
      function uprightSlab(sg, u, poly, y0, t) {
        var o = axisAt(sg, u), a = vnorm([sg.fr.a[0], 0, sg.fr.a[2]]), side = vnorm([sg.fr.u[0], 0, sg.fr.u[2]]);
        return slab(poly, { o: [o[0] - side[0] * t / 2, o[1] + y0, o[2] - side[2] * t / 2], x: a, y: [0, 1, 0], z: side }, t, 0.5);
      }

      function buildFish(p) {
        var g = p.gap, n = Math.round(p.segments), sc = new Scene(), k;
        var rj = [];
        for (k = 0; k <= n; k++) {
          var t = k / n;
          rj.push(Math.max(3.7, p.bodyR * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t * 0.8 + 0.18))) * lerp(1, p.tailTaper, Math.pow(t, 2.6))));
        }
        var Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g), P = [];
        for (k = 1; k <= n; k++) P.push(p.pitch * lerp(1, 0.85, k / n));
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: wiggle(n, p.wiggle, p.waves), g: g, bulge: p.bead, tip: rj[n] * 1.2, bend: p.__bend, seg: 32,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        // sculpted head: rounded forehead, lips and a gill ridge; it stays clear of the first joint
        var rear = -jd0.e, hL = p.headLen * 1.35, hR = rj[0] * 1.35, Sk = new Sculpt(0.8), hc = '#fb923c', hx = rear - hL * 0.5;
        Sk.path('head', [[rear - 0.4, Y0, 0, rj[0] * 0.98], [hx, hR * 0.72, 0, hR], [rear - hL * 0.9, hR * 0.5, 0, hR * 0.56]], hc, 3);
        Sk.ell('lips', [rear - hL * 1.06, hR * 0.5, 0], [hR * 0.2, hR * 0.28, hR * 0.34], '#fda4af', 1);
        Sk.path(null, [[rear - hL * 1.2, hR * 0.5, -hR * 0.26, 0.5], [rear - hL * 1.2, hR * 0.5, hR * 0.26, 0.5]], null, 0).carve(0.4);
        [-1, 1].forEach(function (s) {
          Sk.path('gills', [[rear - hL * 0.2, hR * 0.28, s * hR * 0.84, 0.9], [rear - hL * 0.12, hR * 0.8, s * hR * 0.92, 1.1], [rear - hL * 0.22, hR * 1.3, s * hR * 0.6, 0.9]], '#fed7aa', 1.2);
        });
        Sk.clipX(rear - 0.1);
        Sk.reach = 0.72;
        Sk.run();
        sc.add('head', 'head', ch.rootBall, hc);
        [-1, 1].forEach(function (sd) {
          var e = Sk.hit([hx - hL * 0.1, hR * 0.86, sd * 60], [0, 0, -sd]), R = p.eye * 1.25;
          sc.add('eyes', 'head', dome(e.p, e.n, R, { angle: 48, seg: 22 }), '#f8fafc');
          var rise = (R / Math.sin(deg(48))) * (1 - Math.cos(deg(48)));
          sc.add('pupils', 'head', dome(vadd(e.p, vmul(e.n, rise * 0.7)), e.n, R * 0.55, { sink: 0.5 }), '#1e293b');
        });
        Sk.addTo(sc, 'head');
        ch.segs.forEach(function (sg) {
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', 'seg' + sg.k, sg.shell, sg.k % 2 ? '#fb923c' : '#fef3c7');
        });
        var di = Math.max(2, Math.round(n * 0.4)), ds = ch.segs[di - 1], dr = ds.rad(0.55), dbl = ds.sF - ds.sR, F = p.dorsal;
        if (F > 0) {
          var base = Math.max(ds.jin.Rs * 1.07 + 1, 0.72 * dr), hw = Math.min(dbl * 0.4, 6);
          sc.add('fins', 'seg' + ds.k, uprightSlab(ds, 0.5, [[-hw, 0], [hw, 0], [hw * 0.92, F * 0.42], [hw * 0.5, F * 0.8], [-hw * 0.1, F], [-hw * 0.5, F * 0.74], [-hw * 1.05, F * 0.84], [-hw * 1.5, F * 0.5], [-hw * 1.85, F * 0.52], [-hw * 1.5, F * 0.2]], base, 2.4), '#fb923c');
        }
        var si = Math.max(2, Math.round(n * 0.25)), ss = ch.segs[si - 1], sr = ss.rad(0.5), sbl = ss.sF - ss.sR, root = slabRoot(ss, 2.2);
        if (p.sideFin > 0) {
          var hdg = heading(ss.fr.a), mid = axisAt(ss, 0.5), S = p.sideFin, hw2 = Math.min(sbl * 0.3, 4);
          [-1, 1].forEach(function (sd) {
            sc.add('fins', 'seg' + ss.k, flatSlab(mirrorPoly([[-hw2, root], [-hw2, sr + 1.8], [-hw2 + 2, sr + 1.8 + S * 0.55], [-hw2 + 5, sr + 1.8 + S], [hw2 + 4, sr + 1.8 + S * 0.55], [hw2, sr + 1.8], [hw2, root]], sd), [mid[0], 0, mid[2]], hdg, 2.2, 0.5), '#fb923c');
          });
        }
        var ls = ch.segs[n - 1], F2 = p.tailFin;
        if (F2 > 0) {
          var low = ls.fr.o[1], s0 = ls.sF - 3.2;
          var poly = [[0, -low], [F2 * 0.5, -low], [F2 * 1.08, -low], [F2 * 0.86, F2 * 0.08], [F2 * 0.68, F2 * 0.22], [F2 * 0.88, F2 * 0.42], [F2 * 1.1, F2 * 0.8], [F2 * 0.62, F2 * 0.6], [F2 * 0.2, F2 * 0.42], [0, F2 * 0.26]];
          var o = vadd(ls.fr.o, vmul(ls.fr.a, s0)), a = vnorm([ls.fr.a[0], 0, ls.fr.a[2]]), sid = vnorm([ls.fr.u[0], 0, ls.fr.u[2]]);
          sc.add('fins', 'seg' + n, slab(poly, { o: [o[0] - sid[0] * 1.2, ls.fr.o[1], o[2] - sid[2] * 1.2], x: a, y: [0, 1, 0], z: sid }, 2.4, 0.6), '#fb923c');
        }
        return finishSculpt(sc);
      }

      var FISH_PARAMS = [
        { group: 'Body', key: 'segments', label: 'Segments', unit: '', min: 6, max: 14, step: 1, value: 9 },
        { group: 'Body', key: 'pitch', label: 'Segment length', unit: ' mm', min: 9, max: 15, step: 0.5, value: 11 },
        { group: 'Body', key: 'bodyR', label: 'Body thickness (radius)', unit: ' mm', min: 6, max: 13, step: 0.5, value: 9.5 },
        { group: 'Body', key: 'tailTaper', label: 'Taper to the tail (thin ↔ full)', unit: '×', min: 0.35, max: 0.8, step: 0.05, value: 0.45 },
        { group: 'Body', key: 'bead', label: 'Bead fullness (smooth ↔ knobbly)', unit: '', min: 0, max: 0.4, step: 0.05, value: 0.15 },
        { group: 'Head', key: 'headLen', label: 'Head length', unit: ' mm', min: 10, max: 24, step: 1, value: 15 },
        { group: 'Head', key: 'eye', label: 'Eye size', unit: ' mm', min: 1.8, max: 4, step: 0.1, value: 2.8 },
        { group: 'Pose', key: 'wiggle', label: 'Swim wiggle (straight ↔ curvy)', unit: '°', min: 0, max: 9, step: 0.5, value: 4 },
        { group: 'Pose', key: 'waves', label: 'Waves along the body', unit: '', min: 0.5, max: 2.5, step: 0.25, value: 1 },
        { group: 'Fins', key: 'dorsal', label: 'Dorsal fin height (0 = none)', unit: ' mm', min: 0, max: 30, step: 1, value: 18 },
        { group: 'Fins', key: 'sideFin', label: 'Side fin length (0 = none)', unit: ' mm', min: 0, max: 30, step: 1, value: 14 },
        { group: 'Fins', key: 'tailFin', label: 'Tail fin size (0 = none)', unit: ' mm', min: 0, max: 44, step: 1, value: 30 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-081',
        category: 'ANIMALS // FLEXI',
        title: 'Flexi Fish',
        fileName: 'Flexi_Fish',
        defaultColor: '#fdba74',
        palette: ANIMAL_PALETTE,
        partNames: { head: 'Head', lips: 'Lips', gills: 'Gills', eyes: 'Eyes', pupils: 'Pupils', bodyA: 'Body beads', bodyB: 'Body beads, alternate', fins: 'Fins' },
        parameters: FISH_PARAMS,
        presets: makePresets(FISH_PARAMS, [
          ['Default fish', {}],
          ['Goldfish', { bodyR: 11, tailFin: 38, dorsal: 22, eye: 3.4, segments: 8 }],
          ['Slim trout', { segments: 12, bodyR: 8, tailFin: 26, dorsal: 14, sideFin: 12 }],
          ['Tiny fish', { segments: 7, bodyR: 8, pitch: 10, tailFin: 24 }],
          ['Straight (easy print)', { wiggle: 0 }]
        ]),
        build: buildFish
      };
