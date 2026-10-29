      // -----------------------------------------------------------------------
      // Crocodile: a long snout, a thick body with back scutes, four stubby jointed legs and a heavy tail
      // -----------------------------------------------------------------------
      function crocRadii(p, n, nb) {
        var r = [];
        for (var k = 0; k <= n; k++) {
          var v;
          if (k < nb) v = p.bodyR * (0.78 + 0.22 * smooth(k / 2));
          else v = lerp(p.bodyR * 0.92, p.tailR, Math.pow((k - nb) / Math.max(n - nb, 1), 0.85));
          r.push(Math.max(3.7, v));
        }
        return r;
      }

      function buildCroc(p) {
        var g = p.gap, nb = Math.round(p.bodySegs), nt = Math.round(p.tailSegs), n = nb + nt, sc = new Scene(), k;
        var rj = crocRadii(p, n, nb), Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g), P = [];
        for (k = 1; k <= n; k++) P.push(p.pitch * (k <= nb ? 1 : lerp(1, 0.8, (k - nb) / nt)));
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: wiggle(n, p.wiggle, p.waves), g: g, bulge: p.bead, tip: rj[n] * 2.4, bend: p.__bend,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        var hs = p.headSize, hd = headShell([0, Y0, 0], [1, 0, 0], jd0, rj[0], p.snout * hs, 1.05 * rj[0] * hs, 0.62 * rj[0] * hs, 0.6, 0);
        sc.add('head', 'head', hd.shell, '#6ee7b7');
        sc.add('head', 'head', ch.rootBall, '#6ee7b7');
        [-1, 1].forEach(function (sd) {
          sc.add('eyes', 'head', blobShell(hd.point(0.78, sd * deg(52), 0.97), [1, 0, 0], 3 * p.eyeSize, 3 * p.eyeSize, 3.4 * p.eyeSize, 12, 0), '#334155');
        });
        ch.segs.forEach(function (sg) {
          var id = 'seg' + sg.k;
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', id, sg.shell, sg.k % 2 ? '#6ee7b7' : '#a7f3d0');
          if (p.scutes > 0) {
            var su = clamp((sg.jin.Rs * 1.2 + 1 - sg.sR) / (sg.sF - sg.sR), 0.5, 0.8);
            [-1, 1].forEach(function (sd) {
              sc.add('scutes', id, coneShell(onSeg(sg, su, sd * deg(28), 0.93), vnorm([0, 1, sd * 0.45]), 0.19 * sg.rad(su), p.scutes, 8, 1.1, 0), '#fdba74');
            });
          }
        });
        // four legs: two on the shoulders, two on the hips
        var legHosts = [[2, -1], [Math.max(nb, 3), 1]];
        legHosts.forEach(function (lh, li) {
          var sg = ch.segs[Math.min(lh[0], n) - 1];
          [-1, 1].forEach(function (sd) {
            var rj0 = p.legThick, yL = 0.85 * rj0, attach = flank(sg, sd, yL, 0.5, 0.3);
            var side3 = vnorm([sg.fr.u[0], 0, sg.fr.u[2]]), tail = vnorm([sg.fr.a[0], 0, sg.fr.a[2]]);
            var splay = deg(li ? p.splayRear : p.splayFront);
            var v = vadd(vmul(side3, sd * Math.cos(splay)), vmul(tail, lh[1] * Math.sin(splay)));
            limb(sc, { host: 'seg' + sg.k, hostEntry: sg.k % 2 ? 'bodyA' : 'bodyB', hostColor: '#6ee7b7', id: 'leg' + li + (sd > 0 ? 'r' : 'l'), entry: 'legs', color: '#34d399', attach: attach, head: heading(v), lean: splay, n: 2,
              rj0: rj0, rj1: rj0 * 0.9, pitch: p.legLen, g: g, yaw: [0, 0], bend: p.__bend, tip: 2.5, foot: footPoly(p.toeLen, Math.round(p.toes), 0.6), footEntry: 'toes', footColor: '#fde047' });
          });
        });
        return sc.entries();
      }

      var CROC_PARAMS = [
        { group: 'Body & tail', key: 'bodySegs', label: 'Body segments (neck to hips)', unit: '', min: 4, max: 8, step: 1, value: 6 },
        { group: 'Body & tail', key: 'tailSegs', label: 'Tail segments', unit: '', min: 5, max: 14, step: 1, value: 9 },
        { group: 'Body & tail', key: 'pitch', label: 'Segment length', unit: ' mm', min: 8, max: 14, step: 0.5, value: 10 },
        { group: 'Body & tail', key: 'bodyR', label: 'Body thickness (radius)', unit: ' mm', min: 6, max: 10, step: 0.5, value: 7.5 },
        { group: 'Body & tail', key: 'tailR', label: 'Tail thickness at the tip', unit: ' mm', min: 3.7, max: 6, step: 0.1, value: 4 },
        { group: 'Body & tail', key: 'bead', label: 'Bead fullness (smooth ↔ knobbly)', unit: '', min: 0, max: 0.45, step: 0.05, value: 0.15 },
        { group: 'Pose', key: 'wiggle', label: 'Body wiggle (straight ↔ curvy)', unit: '°', min: 0, max: 9, step: 0.5, value: 4 },
        { group: 'Pose', key: 'waves', label: 'Waves along the body', unit: '', min: 0.5, max: 2.5, step: 0.25, value: 1 },
        { group: 'Head & back', key: 'snout', label: 'Snout length', unit: ' mm', min: 22, max: 60, step: 1, value: 40 },
        { group: 'Head & back', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Head & back', key: 'eyeSize', label: 'Eye size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head & back', key: 'scutes', label: 'Back plate height (0 = none)', unit: ' mm', min: 0, max: 8, step: 0.5, value: 4 },
        { group: 'Legs & toes', key: 'legLen', label: 'Leg segment length', unit: ' mm', min: 8, max: 16, step: 0.5, value: 10 },
        { group: 'Legs & toes', key: 'legThick', label: 'Leg thickness (radius)', unit: ' mm', min: 3.7, max: 7, step: 0.1, value: 5 },
        { group: 'Legs & toes', key: 'splayFront', label: 'Front legs sweep (back ↔ forward)', unit: '°', min: 0, max: 45, step: 1, value: 20 },
        { group: 'Legs & toes', key: 'splayRear', label: 'Hind legs sweep (out ↔ back)', unit: '°', min: 0, max: 45, step: 1, value: 25 },
        { group: 'Legs & toes', key: 'toes', label: 'Toes per foot', unit: '', min: 3, max: 5, step: 1, value: 4 },
        { group: 'Legs & toes', key: 'toeLen', label: 'Toe length', unit: ' mm', min: 6, max: 14, step: 0.5, value: 8 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-093',
        category: 'FLEXI // REPTILES',
        title: 'Flexi Crocodile',
        fileName: 'Flexi_Crocodile',
        defaultColor: '#6ee7b7',
        palette: FLEXI_PALETTE,
        partNames: { head: 'Head', eyes: 'Eyes', bodyA: 'Body beads', bodyB: 'Body beads, alternate', scutes: 'Back plates', legs: 'Legs', toes: 'Toes' },
        parameters: CROC_PARAMS,
        presets: makePresets(CROC_PARAMS, [
          ['Default crocodile', {}],
          ['Gator', { snout: 32, headSize: 1.15, bodyR: 8, scutes: 5 }],
          ['Gharial', { snout: 58, headSize: 0.85, bodyR: 6.5, legThick: 4, scutes: 2 }],
          ['Baby croc', { snout: 28, headSize: 1.2, eyeSize: 1.3, tailSegs: 7, scutes: 3 }],
          ['Flat out (easy print)', { wiggle: 0 }]
        ]),
        build: buildCroc
      };
