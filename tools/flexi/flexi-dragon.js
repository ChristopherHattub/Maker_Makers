      // -----------------------------------------------------------------------
      // Dragon: head, a chain of beads for neck, body and tail, bat wings, spikes and paws
      // -----------------------------------------------------------------------
      function dragonRadii(p, n) {
        var r = [];
        for (var k = 0; k <= n; k++) {
          var t = k / n;
          r.push(Math.max(3.7, lerp(p.bodyR, p.tailR, Math.pow(smooth((t - 0.2) / 0.8), 0.9))));
        }
        return r;
      }

      // Bat wing outline (x along the body toward the tail, y outward), root narrow so it never touches the next bead.
      function wingPoly(S, sweep, rootHalf, y0) {
        var sw = Math.tan(deg(sweep));
        function pt(x, y) { return [x, y]; }
        var L = [
          pt(-rootHalf, 1), pt(-rootHalf, y0), pt(-rootHalf - 0.1 * S * sw, y0 + 0.3 * S),
          pt(-rootHalf - 0.35 * S * sw, y0 + 0.72 * S), pt(-rootHalf - 0.5 * S * sw, y0 + 0.98 * S),   // leading edge to the wing tip
          pt(-rootHalf - 0.12 * S * sw, y0 + 0.8 * S), pt(rootHalf + 0.1 * S * sw, y0 + 0.88 * S),     // scallops along the trailing edge
          pt(rootHalf + 0.2 * S * sw, y0 + 0.6 * S), pt(rootHalf + 0.42 * S * sw, y0 + 0.66 * S),
          pt(rootHalf + 0.34 * S * sw, y0 + 0.34 * S), pt(rootHalf + 0.5 * S * sw, y0 + 0.36 * S),
          pt(rootHalf, y0 + 0.08 * S), pt(rootHalf, 1)
        ];
        return L;
      }
      function pawPoly(len, rootHalf, footHalf, y0) {
        var w = footHalf, pts = [[-rootHalf, 1], [-rootHalf, y0], [-w, y0 + len * 0.3]];
        for (var i = 0; i < 3; i++) { // three toes, each ending in a point
          var xa = lerp(-w, w, i / 3), xb = lerp(-w, w, (i + 1) / 3);
          pts.push([xa + 0.15, y0 + len * 0.72], [(xa + xb) / 2, y0 + len], [xb - 0.15, y0 + len * 0.72]);
        }
        pts.push([w, y0 + len * 0.3], [rootHalf, y0], [rootHalf, 1]);
        return pts;
      }

      function buildDragon(p) {
        var g = p.gap, n = Math.round(p.segments), sc = new Scene(), k, i;
        var rj = dragonRadii(p, n), Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g);
        var P = [], yaw = [];
        for (k = 1; k <= n; k++) {
          P.push(p.pitch * lerp(1, 0.78, k / n));
          yaw.push(deg(p.waveAmp) * Math.sin(TAU * p.waves * ((k - 0.5) / n)));
        }
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: yaw, g: g, bulge: p.bead, tip: rj[n] * 1.2, bend: p.__bend,
          hAxis: function (j) { return 0.85 * rj[j]; } });

        // head
        var hs = p.headSize, Lh = 30 * hs, sRear = -jd0.e, sNose = sRear - Lh, Wh = 1.15 * rj[0] * hs, Wsn = 0.5 * rj[0] * hs;
        function headR(u) { // u = 0 nose .. 1 rear
          var rnd = u < 0.12 ? Math.sqrt(1 - Math.pow(1 - u / 0.12, 2)) : 1;
          var w = lerp(Wsn, Wh, smooth((u - 0.3) / 0.45)) * (1 - 0.14 * smooth((u - 0.82) / 0.18));
          return Math.max(w * rnd, 0.3);
        }
        var hprof = [[0, sNose]];
        for (i = 1; i <= 16; i++) { var u = i / 17; hprof.push([headR(u), lerp(sNose, sRear, u)]); }
        hprof.push([rj[0], sRear], [0, sRear]);
        var hfr = frame([0, Y0, 0], [1, 0, 0], [0, 1, 0]);
        sc.add('head', 'head', lathe(hfr, hprof, 24, { ay: 0.8, floor: 0 }), '#a7f3d0');
        sc.add('head', 'head', ch.rootBall, '#a7f3d0');
        function headPt(u, th, kk) {
          var s = lerp(sNose, sRear, u), r = headR(u) * (kk || 1);
          return [hfr.o[0] + hfr.a[0] * s + hfr.u[0] * Math.sin(th) * r, hfr.o[1] + Math.cos(th) * r * 0.8, hfr.o[2] + hfr.a[2] * s + hfr.u[2] * Math.sin(th) * r];
        }
        [-1, 1].forEach(function (sd) {
          sc.add('eyes', 'head', sphereShell(headPt(0.62, sd * deg(62), 0.92), 2.1 * hs, 12, 0), '#334155');
          if (p.hornLen > 0) {
            var base = headPt(0.84, sd * deg(38), 0.95), dir = vnorm([0.8, 0.55, sd * 0.35]);
            sc.add('horns', 'head', coneShell(base, dir, 2.2 * hs, p.hornLen, 10, 2.5, 0), '#fdba74');
          }
        });

        // body beads
        var wingSeg = Math.min(3, n - 1), pawSegs = [Math.min(6, n - 1), Math.min(9, n - 1)];
        ch.segs.forEach(function (sg, idx) {
          var id = 'seg' + sg.k;
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', id, sg.shell, sg.k % 2 ? '#6ee7b7' : '#a7f3d0');
          if (p.spikeH > 0) {
            var su = clamp((sg.jin.Rs * 1.2 + 1 - sg.sR) / (sg.sF - sg.sR), 0.5, 0.8); // past the socket cavity
            var h = p.spikeH * clamp(sg.rf / rj[0] + 0.25, 0.5, 1.1), b = onSeg(sg, su, 0, 0.9);
            sc.add('spikes', id, coneShell(b, [0, 1, 0], 0.2 * sg.rad(su), h, 8, 1.2, 0), '#fdba74');
          }
        });
        // wings and paws sit on one bead each and reach out past its neighbours
        function sideSlab(sg, poly, thick, entry, color, sd) {
          var f = sg.fr, hd = Math.atan2(-f.a[2], f.a[0]), mid = axisAt(sg, 0.5);
          var at = [mid[0], 0, mid[2]];
          var pl = poly.map(function (q) { return [q[0], q[1] * sd]; });
          sc.add(entry, 'seg' + sg.k, flatSlab(pl, at, hd, thick, 0.5), color);
        }
        var sgW = ch.segs[wingSeg - 1], rmaxW = sgW.rad(0.5) * 1.02, bodyLen = sgW.sF - sgW.sR;
        if (p.wingSpan > 0) {
          [-1, 1].forEach(function (sd) {
            sideSlab(sgW, wingPoly(p.wingSpan, p.wingSweep, Math.min(bodyLen * 0.32, 4.5), rmaxW + 2.2), 1.6, 'wings', '#fdba74', sd);
            // bone ribs along the wing
            sideSlab(sgW, [[-1, rmaxW + 1.4], [1, rmaxW + 1.4], [1 - p.wingSpan * 0.3 * Math.tan(deg(p.wingSweep)), rmaxW + 2 + p.wingSpan * 0.95], [-1 - p.wingSpan * 0.3 * Math.tan(deg(p.wingSweep)), rmaxW + 2 + p.wingSpan * 0.95]], 2.6, 'wings', '#fdba74', sd);
          });
        }
        if (p.paws > 0) {
          pawSegs.forEach(function (si, pi) {
            var sg = ch.segs[si - 1], rm = sg.rad(0.5) * 1.02, bl = sg.sF - sg.sR;
            [-1, 1].forEach(function (sd) {
              sideSlab(sg, pawPoly(p.pawLen * (pi ? 1.15 : 1), Math.min(bl * 0.25, 3.5), Math.min(bl * 0.44, 6), rm + 1.8), 2.4, 'claws', '#fde047', sd);
            });
          });
        }
        if (p.tailSpade > 0) {
          var sl = ch.segs[n - 1], S = p.tailSpade, hd2 = Math.atan2(-sl.fr.a[2], sl.fr.a[0]), at = axisAt(sl, 0.8);
          sc.add('claws', 'seg' + n, flatSlab([[-3, -2.6], [S * 0.35, -3.2], [S * 0.62, -S * 0.5], [S * 1.35, 0], [S * 0.62, S * 0.5], [S * 0.35, 3.2], [-3, 2.6]], [at[0], 0, at[2]], hd2, 2.2, 0.5), '#fde047');
        }
        return sc.entries();
      }

      var DRAGON_PARAMS = [
        { group: 'Body', key: 'segments', label: 'Segments (neck + body + tail)', unit: '', min: 10, max: 22, step: 1, value: 15 },
        { group: 'Body', key: 'pitch', label: 'Segment length', unit: ' mm', min: 9, max: 16, step: 0.5, value: 11 },
        { group: 'Body', key: 'bodyR', label: 'Body thickness (radius at the chest)', unit: ' mm', min: 6, max: 11, step: 0.5, value: 8 },
        { group: 'Body', key: 'tailR', label: 'Tail thickness (radius at the tip)', unit: ' mm', min: 3.7, max: 6, step: 0.1, value: 3.9 },
        { group: 'Body', key: 'bead', label: 'Bead fullness (smooth ↔ knobbly)', unit: '', min: 0, max: 0.5, step: 0.05, value: 0.22 },
        { group: 'Pose', key: 'waveAmp', label: 'Wiggle (straight ↔ curvy)', unit: '°', min: 0, max: 10, step: 0.5, value: 5 },
        { group: 'Pose', key: 'waves', label: 'Waves along the body', unit: '', min: 0.5, max: 3, step: 0.25, value: 1.25 },
        { group: 'Head & spikes', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head & spikes', key: 'hornLen', label: 'Horn length (0 = none)', unit: ' mm', min: 0, max: 16, step: 1, value: 9 },
        { group: 'Head & spikes', key: 'spikeH', label: 'Back spike height (0 = none)', unit: ' mm', min: 0, max: 12, step: 1, value: 6 },
        { group: 'Wings, paws & tail', key: 'wingSpan', label: 'Wing span (0 = none)', unit: ' mm', min: 0, max: 80, step: 1, value: 52 },
        { group: 'Wings, paws & tail', key: 'wingSweep', label: 'Wing sweep back', unit: '°', min: 15, max: 60, step: 1, value: 38 },
        { group: 'Wings, paws & tail', key: 'paws', label: 'Paws', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] },
        { group: 'Wings, paws & tail', key: 'pawLen', label: 'Paw length', unit: ' mm', min: 8, max: 26, step: 1, value: 16 },
        { group: 'Wings, paws & tail', key: 'tailSpade', label: 'Tail spade (0 = none)', unit: ' mm', min: 0, max: 24, step: 1, value: 12 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-091',
        category: 'FLEXI // DRAGONS',
        title: 'Flexi Dragon',
        fileName: 'Flexi_Dragon',
        defaultColor: '#a7f3d0',
        palette: FLEXI_PALETTE,
        partNames: { head: 'Head', eyes: 'Eyes', horns: 'Horns', bodyA: 'Body beads', bodyB: 'Body beads, alternate', spikes: 'Back spikes', wings: 'Wings', claws: 'Paws & tail spade' },
        parameters: DRAGON_PARAMS,
        presets: makePresets(DRAGON_PARAMS, [
          ['Default dragon', {}],
          ['Long wyrm', { segments: 22, pitch: 11, wingSpan: 0, paws: 0, waveAmp: 7, waves: 1.75, spikeH: 4, hornLen: 12 }],
          ['Chunky baby dragon', { segments: 12, pitch: 11, bodyR: 10, tailR: 5.5, bead: 0.32, headSize: 1.3, hornLen: 5, wingSpan: 36, tailSpade: 8, pawLen: 12 }],
          ['Wyvern', { segments: 16, wingSpan: 72, wingSweep: 50, paws: 0, waveAmp: 6, waves: 1, tailSpade: 16 }],
          ['Straight (easy print)', { waveAmp: 0 }]
        ]),
        build: buildDragon
      };
