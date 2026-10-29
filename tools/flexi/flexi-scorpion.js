      // -----------------------------------------------------------------------
      // Scorpion: armoured body, jointed claw arms with pincers, eight walking legs and a long jointed tail with a stinger
      // -----------------------------------------------------------------------
      function pincerPoly(s) {
        return [[-3, -3.2], [5 * s, -5.5 * s], [16 * s, -7 * s], [27 * s, -2.4 * s], [17 * s, -2.8 * s], [14 * s, -0.4 * s],
          [27 * s, 3.6 * s], [17 * s, 6.4 * s], [6 * s, 4.6 * s], [-3, 3.2]];
      }

      function buildScorpion(p) {
        var g = p.gap, nb = 4, nt = Math.round(p.tailSegs), n = nb + nt, sc = new Scene(), k;
        var rj = [];
        for (k = 0; k <= n; k++) rj.push(Math.max(3.7, k < nb ? p.bodyR * (k === 0 ? 0.85 : 1) : lerp(p.bodyR * 0.72, p.tailR, (k - nb) / nt)));
        rj[n] = p.tailR * 1.15; // stinger bulb
        var Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g), P = [], pitch = [];
        for (k = 1; k <= n; k++) {
          P.push(k <= nb ? p.pitch : p.pitch * 0.9);
          pitch.push(k > nb ? deg(p.tailLift) * (k - nb) / nt : 0);
        }
        var yaw = wiggle(n, p.wiggle, 1);
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: yaw, pitch: p.tailLift > 0 ? pitch : null, g: g, bulge: p.bead, tip: rj[n] * 2.8, bend: p.__bend,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        var hd = headShell([0, Y0, 0], [1, 0, 0], jd0, rj[0], 16, 1.15 * rj[0], 0.8 * rj[0], 0.6, 0);
        sc.add('head', 'head', hd.shell, '#fdba74');
        sc.add('head', 'head', ch.rootBall, '#fdba74');
        [-1, 1].forEach(function (sd) { sc.add('eyes', 'head', blobShell(hd.point(0.5, sd * deg(35), 0.97), [1, 0, 0], 1.7, 1.7, 1.7, 10, 0), '#334155'); });
        ch.segs.forEach(function (sg) {
          var id = 'seg' + sg.k;
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', id, sg.shell, sg.k % 2 ? '#fdba74' : '#fde047');
        });
        // claw arms leave the first body segment, forward and out
        var s1 = ch.segs[0];
        [-1, 1].forEach(function (sd) {
          var yL = 0.85 * p.clawR, side3 = vnorm([s1.fr.u[0], 0, s1.fr.u[2]]), fwd = vmul(vnorm([s1.fr.a[0], 0, s1.fr.a[2]]), -1);
          var lean = deg(p.clawSweep), v = vadd(vmul(side3, sd * Math.cos(lean)), vmul(fwd, Math.sin(lean)));
          limb(sc, { host: 'seg1', hostEntry: 'bodyA', hostColor: '#fdba74', id: 'claw' + (sd > 0 ? 'r' : 'l'), entry: 'arms', color: '#fb923c', attach: flank(s1, sd, yL, 0.5, 0.3), head: heading(v), lean: lean,
            n: 2, rj0: p.clawR, rj1: p.clawR * 0.9, pitch: p.clawLen, g: g, yaw: [0, 0], bend: p.__bend, tip: 2.5, foot: pincerPoly(p.pincer / 10), footEntry: 'pincers', footColor: '#fde047' });
        });
        // eight walking legs: four a side on the segments behind the claws
        for (k = 2; k <= nb + 1; k++) {
          [-1, 1].forEach(function (sd) {
            var sg = ch.segs[k - 1], side3 = vnorm([sg.fr.u[0], 0, sg.fr.u[2]]), tail = vnorm([sg.fr.a[0], 0, sg.fr.a[2]]);
            var lean = deg(p.legSweep) * (k - 3.5) * 0.6, v = vadd(vmul(side3, sd * Math.cos(lean)), vmul(tail, Math.sin(lean)));
            limb(sc, { host: 'seg' + sg.k, hostEntry: sg.k % 2 ? 'bodyA' : 'bodyB', hostColor: '#fdba74', id: 'leg' + k + (sd > 0 ? 'r' : 'l'), entry: 'legs', color: '#fb923c', attach: flank(sg, sd, 0.85 * 3.8, 0.78, 0.3), head: heading(v), lean: Math.abs(lean),
              n: 2, rj0: 3.8, rj1: 3.7, pitch: p.legLen, g: g, yaw: [0, 0], bend: p.__bend, tip: 2 });
          });
        }
        return sc.entries();
      }

      var SCORP_PARAMS = [
        { group: 'Body & tail', key: 'tailSegs', label: 'Tail segments', unit: '', min: 4, max: 10, step: 1, value: 7 },
        { group: 'Body & tail', key: 'pitch', label: 'Segment length', unit: ' mm', min: 8, max: 14, step: 0.5, value: 10 },
        { group: 'Body & tail', key: 'bodyR', label: 'Body thickness (radius)', unit: ' mm', min: 6, max: 10, step: 0.5, value: 7.5 },
        { group: 'Body & tail', key: 'tailR', label: 'Tail thickness at the tip', unit: ' mm', min: 3.7, max: 6, step: 0.1, value: 4 },
        { group: 'Body & tail', key: 'bead', label: 'Bead fullness (smooth ↔ knobbly)', unit: '', min: 0, max: 0.45, step: 0.05, value: 0.22 },
        { group: 'Pose', key: 'wiggle', label: 'Tail sway (straight ↔ curvy)', unit: '°', min: 0, max: 9, step: 0.5, value: 4 },
        { group: 'Pose', key: 'tailLift', label: 'Tail lift (0 = flat, prints with no supports)', unit: '°', min: 0, max: 7, step: 0.5, value: 0 },
        { group: 'Claws', key: 'clawLen', label: 'Claw arm segment length', unit: ' mm', min: 8, max: 16, step: 0.5, value: 11 },
        { group: 'Claws', key: 'clawR', label: 'Claw arm thickness (radius)', unit: ' mm', min: 3.7, max: 6.5, step: 0.1, value: 4.8 },
        { group: 'Claws', key: 'clawSweep', label: 'Claws reach (out ↔ forward)', unit: '°', min: 10, max: 60, step: 1, value: 45 },
        { group: 'Claws', key: 'pincer', label: 'Pincer size', unit: ' mm', min: 6, max: 16, step: 0.5, value: 10 },
        { group: 'Legs', key: 'legLen', label: 'Leg segment length', unit: ' mm', min: 6, max: 12, step: 0.5, value: 8.5 },
        { group: 'Legs', key: 'legSweep', label: 'Legs fan (straight out ↔ fanned)', unit: '°', min: 0, max: 35, step: 1, value: 18 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-095',
        category: 'FLEXI // BUGS',
        title: 'Flexi Scorpion',
        fileName: 'Flexi_Scorpion',
        defaultColor: '#fdba74',
        palette: FLEXI_PALETTE,
        partNames: { head: 'Head', eyes: 'Eyes', bodyA: 'Body beads', bodyB: 'Body beads, alternate', arms: 'Claw arms', pincers: 'Pincers', legs: 'Walking legs' },
        parameters: SCORP_PARAMS,
        presets: makePresets(SCORP_PARAMS, [
          ['Default scorpion', {}],
          ['Emperor scorpion', { bodyR: 9, tailR: 5, tailSegs: 5, pincer: 14, clawR: 5.8, bead: 0.3 }],
          ['Long-tail', { tailSegs: 10, wiggle: 6 }],
          ['Tail up (needs supports)', { tailLift: 6, tailSegs: 8 }],
          ['Flat out (easy print)', { wiggle: 0, tailLift: 0 }]
        ]),
        build: buildScorpion
      };
