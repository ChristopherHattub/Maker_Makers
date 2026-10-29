      // -----------------------------------------------------------------------
      // Shark: a torpedo of beads with a pointed snout, an upright dorsal fin, side fins and a swinging tail fin
      // -----------------------------------------------------------------------
      // Slab standing upright in the vertical plane along a segment (fins). poly x along the body, y up from axis height + y0.
      function uprightSlab(sg, u, poly, y0, t) {
        var o = axisAt(sg, u), a = vnorm([sg.fr.a[0], 0, sg.fr.a[2]]), side = vnorm([sg.fr.u[0], 0, sg.fr.u[2]]);
        return slab(poly, { o: [o[0] - side[0] * t / 2, o[1] + y0, o[2] - side[2] * t / 2], x: a, y: [0, 1, 0], z: side }, t, 0.5);
      }

      function buildShark(p) {
        var g = p.gap, n = Math.round(p.segments), sc = new Scene(), k;
        var rj = [];
        for (k = 0; k <= n; k++) {
          var t = k / n;
          rj.push(Math.max(3.7, p.bodyR * (0.62 + 0.38 * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.12))) * lerp(1, p.tailTaper, Math.pow(t, 2.2))));
        }
        var Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g), P = [];
        for (k = 1; k <= n; k++) P.push(p.pitch * lerp(1, 0.85, k / n));
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: wiggle(n, p.wiggle, p.waves), g: g, bulge: p.bead, tip: rj[n] * 1.2, bend: p.__bend,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        // snout: a cone-shaped head
        var hd = headShell([0, Y0, 0], [1, 0, 0], jd0, rj[0], p.snout, rj[0] * 1.0, 0.18 * rj[0], 0.85, 0);
        sc.add('head', 'head', hd.shell, '#93c5fd');
        sc.add('head', 'head', ch.rootBall, '#93c5fd');
        [-1, 1].forEach(function (sd) {
          sc.add('eyes', 'head', blobShell(hd.point(0.6, sd * deg(70), 0.95), [1, 0, 0], 1.9, 1.9, 1.9, 10, 0), '#334155');
        });
        ch.segs.forEach(function (sg) {
          var id = 'seg' + sg.k;
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', id, sg.shell, sg.k % 2 ? '#93c5fd' : '#bfdbfe');
        });
        // dorsal fin on the thickest bead
        var di = Math.max(2, Math.round(n * 0.3)), ds = ch.segs[di - 1], dr = ds.rad(0.55), dbl = ds.sF - ds.sR, F = p.dorsal;
        if (F > 0) {
          var base = Math.max(ds.jin.Rs * 1.07 + 1, 0.72 * dr), hw = Math.min(dbl * 0.34, 5.5);
          sc.add('fins', 'seg' + ds.k, uprightSlab(ds, 0.5, [[-hw, 0], [hw, 0], [hw * 0.8, F * 0.35], [-hw * 1.9, F], [-hw * 1.1, F * 0.4]], base, 2.4), '#bfdbfe');
        }
        // side fins lie flat on the bed
        var si = Math.max(2, Math.round(n * 0.22)), ss = ch.segs[si - 1], sr = ss.rad(0.5), sbl = ss.sF - ss.sR, root = slabRoot(ss, 2.2);
        if (p.sideFin > 0) {
          var hdg = heading(ss.fr.a), mid = axisAt(ss, 0.5), S = p.sideFin, hw2 = Math.min(sbl * 0.3, 4);
          [-1, 1].forEach(function (sd) {
            sc.add('fins', 'seg' + ss.k, flatSlab(mirrorPoly([[-hw2, root], [-hw2, sr + 1.8], [-hw2 + 2, sr + 1.8 + S * 0.55], [-hw2 + 6, sr + 1.8 + S], [hw2 + 5, sr + 1.8 + S * 0.5], [hw2 + 7, sr + 1.8 + S * 0.2], [hw2, sr + 1.8], [hw2, root]], sd), [mid[0], 0, mid[2]], hdg, 2.2, 0.5), '#bfdbfe');
          });
        }
        // tail fin: long upper lobe, short lower lobe (a shark's tail), standing upright on the last bead
        var ls = ch.segs[n - 1], F2 = p.tailFin;
        if (F2 > 0) {
          var low = Math.min(F2 * 0.3, ls.fr.o[1] - 0.6), s0 = ls.sF - 3.2, hwid = 0.8;
          var poly = [[0, -low * 0.5], [F2 * 0.35, -low], [F2 * 0.75, -low * 1.0], [F2 * 0.4, -0.5], [F2 * 0.55, F2 * 0.2], [F2 * 0.95, F2 * 0.95], [F2 * 0.55, F2 * 0.78], [F2 * 0.15, F2 * 0.5], [0, F2 * 0.3]];
          var o = vadd(ls.fr.o, vmul(ls.fr.a, s0)), a = vnorm([ls.fr.a[0], 0, ls.fr.a[2]]), sid = vnorm([ls.fr.u[0], 0, ls.fr.u[2]]);
          sc.add('fins', 'seg' + n, slab(poly, { o: [o[0] - sid[0] * 1.2, ls.fr.o[1], o[2] - sid[2] * 1.2], x: a, y: [0, 1, 0], z: sid }, 2.4, 0.6), '#bfdbfe');
        }
        return sc.entries();
      }

      var SHARK_PARAMS = [
        { group: 'Body', key: 'segments', label: 'Segments', unit: '', min: 8, max: 16, step: 1, value: 12 },
        { group: 'Body', key: 'pitch', label: 'Segment length', unit: ' mm', min: 9, max: 15, step: 0.5, value: 11.5 },
        { group: 'Body', key: 'bodyR', label: 'Body thickness (radius)', unit: ' mm', min: 6, max: 11, step: 0.5, value: 8.5 },
        { group: 'Body', key: 'tailTaper', label: 'Taper to the tail (thin ↔ full)', unit: '×', min: 0.45, max: 0.9, step: 0.05, value: 0.55 },
        { group: 'Body', key: 'bead', label: 'Bead fullness (smooth ↔ knobbly)', unit: '', min: 0, max: 0.4, step: 0.05, value: 0.15 },
        { group: 'Body', key: 'snout', label: 'Snout length', unit: ' mm', min: 14, max: 40, step: 1, value: 24 },
        { group: 'Pose', key: 'wiggle', label: 'Swim wiggle (straight ↔ curvy)', unit: '°', min: 0, max: 9, step: 0.5, value: 4 },
        { group: 'Pose', key: 'waves', label: 'Waves along the body', unit: '', min: 0.5, max: 2.5, step: 0.25, value: 1 },
        { group: 'Fins', key: 'dorsal', label: 'Dorsal fin height (0 = none)', unit: ' mm', min: 0, max: 30, step: 1, value: 20 },
        { group: 'Fins', key: 'sideFin', label: 'Side fin length (0 = none)', unit: ' mm', min: 0, max: 36, step: 1, value: 24 },
        { group: 'Fins', key: 'tailFin', label: 'Tail fin size (0 = none)', unit: ' mm', min: 0, max: 40, step: 1, value: 28 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-098',
        category: 'FLEXI // SEA CREATURES',
        title: 'Flexi Shark',
        fileName: 'Flexi_Shark',
        defaultColor: '#93c5fd',
        palette: FLEXI_PALETTE,
        partNames: { head: 'Head', eyes: 'Eyes', bodyA: 'Body beads', bodyB: 'Body beads, alternate', fins: 'Fins' },
        parameters: SHARK_PARAMS,
        presets: makePresets(SHARK_PARAMS, [
          ['Default shark', {}],
          ['Great white', { segments: 14, bodyR: 10, dorsal: 26, sideFin: 30, tailFin: 34, snout: 26 }],
          ['Small shark', { segments: 10, bodyR: 7, snout: 16, dorsal: 16, sideFin: 18, tailFin: 22 }],
          ['Baby shark', { segments: 9, bodyR: 8, pitch: 10, snout: 18, dorsal: 14, wiggle: 5 }],
          ['Straight (easy print)', { wiggle: 0 }]
        ]),
        build: buildShark
      };
