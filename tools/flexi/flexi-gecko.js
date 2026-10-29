      // -----------------------------------------------------------------------
      // Gecko: a wide head with big eyes, a short body, four jointed legs with toes and a long tail
      // -----------------------------------------------------------------------
      function geckoRadii(p, n, nb) {
        var r = [];
        for (var k = 0; k <= n; k++) {
          var v;
          if (k < nb) v = p.bodyR * (0.78 + 0.22 * smooth(k / 2));
          else v = lerp(p.bodyR * 0.92, p.tailR, Math.pow((k - nb) / Math.max(n - nb, 1), 0.85));
          r.push(Math.max(3.7, v));
        }
        return r;
      }

      function buildGecko(p) {
        var g = p.gap, nb = Math.round(p.bodySegs), nt = Math.round(p.tailSegs), n = nb + nt, sc = new Scene(), k;
        var rj = geckoRadii(p, n, nb), Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g), P = [];
        for (k = 1; k <= n; k++) P.push(p.pitch * (k <= nb ? 1 : lerp(1, 0.8, (k - nb) / nt)));
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: wiggle(n, p.wiggle, p.waves), g: g, bulge: p.bead, tip: rj[n] * 2.4, bend: p.__bend,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        var hs = p.headSize, hd = headShell([0, Y0, 0], [1, 0, 0], jd0, rj[0], 26 * hs, 1.35 * rj[0] * hs, 0.55 * rj[0] * hs, 0.62, 0);
        sc.add('head', 'head', hd.shell, '#fdba74');
        sc.add('head', 'head', ch.rootBall, '#fdba74');
        [-1, 1].forEach(function (sd) {
          sc.add('eyes', 'head', blobShell(hd.point(0.6, sd * deg(58), 0.95), [1, 0, 0], 3.2 * p.eyeSize, 3.2 * p.eyeSize, 3.2 * p.eyeSize, 12, 0), '#334155');
        });
        ch.segs.forEach(function (sg) {
          var id = 'seg' + sg.k;
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', id, sg.shell, sg.k % 2 ? '#fdba74' : '#fde047');
          if (p.spots > 0 && sg.k <= nb + 4 && sg.rf > 4.4) {
            var su = clamp((sg.jin.Rs * 1.2 + 1 - sg.sR) / (sg.sF - sg.sR), 0.5, 0.8);
            sc.add('spots', id, blobShell(onSeg(sg, su, 0, 0.98), [1, 0, 0], 1.9, 1.9, 1.0, 10, 0), '#d8b4fe');
          }
        });
        // four legs: two on the shoulders, two on the hips
        var legHosts = [[2, -1], [nb, 1]];
        legHosts.forEach(function (lh, li) {
          var sg = ch.segs[Math.min(lh[0], n) - 1];
          [-1, 1].forEach(function (sd) {
            var rj0 = p.legThick, yL = 0.85 * rj0, attach = flank(sg, sd, yL, 0.5, 0.3);
            var side3 = vnorm([sg.fr.u[0], 0, sg.fr.u[2]]), tail = vnorm([sg.fr.a[0], 0, sg.fr.a[2]]);
            var splay = deg(li ? p.splayRear : p.splayFront);
            var v = vadd(vmul(side3, sd * Math.cos(splay)), vmul(tail, lh[1] * Math.sin(splay)));
            limb(sc, { host: 'seg' + sg.k, hostEntry: sg.k % 2 ? 'bodyA' : 'bodyB', hostColor: '#fdba74', id: 'leg' + li + (sd > 0 ? 'r' : 'l'), entry: 'legs', color: '#fb923c', attach: attach, head: heading(v), lean: splay, n: 2,
              rj0: rj0, rj1: rj0 * 0.9, pitch: p.legLen, g: g, yaw: [0, 0], bend: p.__bend, tip: 2.5, foot: footPoly(p.toeLen, Math.round(p.toes), 0.78), footEntry: 'toes', footColor: '#fde047' });
          });
        });
        return sc.entries();
      }

      var GECKO_PARAMS = [
        { group: 'Body & tail', key: 'bodySegs', label: 'Body segments (neck to hips)', unit: '', min: 4, max: 8, step: 1, value: 5 },
        { group: 'Body & tail', key: 'tailSegs', label: 'Tail segments', unit: '', min: 5, max: 14, step: 1, value: 9 },
        { group: 'Body & tail', key: 'pitch', label: 'Segment length', unit: ' mm', min: 8, max: 14, step: 0.5, value: 9.5 },
        { group: 'Body & tail', key: 'bodyR', label: 'Body thickness (radius)', unit: ' mm', min: 5, max: 9, step: 0.5, value: 6.5 },
        { group: 'Body & tail', key: 'tailR', label: 'Tail thickness at the tip', unit: ' mm', min: 3.7, max: 5, step: 0.1, value: 3.8 },
        { group: 'Body & tail', key: 'bead', label: 'Bead fullness (smooth ↔ knobbly)', unit: '', min: 0, max: 0.45, step: 0.05, value: 0.2 },
        { group: 'Pose', key: 'wiggle', label: 'Body wiggle (straight ↔ curvy)', unit: '°', min: 0, max: 9, step: 0.5, value: 4 },
        { group: 'Pose', key: 'waves', label: 'Waves along the body', unit: '', min: 0.5, max: 2.5, step: 0.25, value: 1 },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head', key: 'eyeSize', label: 'Eye size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head', key: 'spots', label: 'Back spots', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] },
        { group: 'Legs & toes', key: 'legLen', label: 'Leg segment length', unit: ' mm', min: 8, max: 16, step: 0.5, value: 11 },
        { group: 'Legs & toes', key: 'legThick', label: 'Leg thickness (radius)', unit: ' mm', min: 3.7, max: 6, step: 0.1, value: 4.4 },
        { group: 'Legs & toes', key: 'splayFront', label: 'Front legs sweep (back ↔ forward)', unit: '°', min: 0, max: 45, step: 1, value: 25 },
        { group: 'Legs & toes', key: 'splayRear', label: 'Hind legs sweep (out ↔ back)', unit: '°', min: 0, max: 45, step: 1, value: 20 },
        { group: 'Legs & toes', key: 'toes', label: 'Toes per foot', unit: '', min: 3, max: 5, step: 1, value: 5 },
        { group: 'Legs & toes', key: 'toeLen', label: 'Toe length', unit: ' mm', min: 6, max: 14, step: 0.5, value: 9 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-092',
        category: 'FLEXI // REPTILES',
        title: 'Flexi Gecko',
        fileName: 'Flexi_Gecko',
        defaultColor: '#fdba74',
        palette: FLEXI_PALETTE,
        partNames: { head: 'Head', eyes: 'Eyes', bodyA: 'Body beads', bodyB: 'Body beads, alternate', spots: 'Back spots', legs: 'Legs', toes: 'Toes' },
        parameters: GECKO_PARAMS,
        presets: makePresets(GECKO_PARAMS, [
          ['Default gecko', {}],
          ['Chunky leopard gecko', { bodyR: 8, tailR: 5, tailSegs: 6, bead: 0.3, headSize: 1.2, legThick: 5.2, legLen: 9.5 }],
          ['Long tail', { tailSegs: 14, wiggle: 6, waves: 1.5 }],
          ['Big-eyed tokay', { eyeSize: 1.35, headSize: 1.25, spots: 1 }],
          ['Flat out (easy print)', { wiggle: 0, splayFront: 30, splayRear: 30 }]
        ]),
        build: buildGecko
      };
