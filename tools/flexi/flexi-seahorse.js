      // -----------------------------------------------------------------------
      // Seahorse: lies on its side. A snout, a curved neck, a round belly and a curling tail of beads
      // -----------------------------------------------------------------------
      function buildSeahorse(p) {
        var g = p.gap, n = Math.round(p.segments), sc = new Scene(), k;
        var belly = Math.min(Math.round(n * 0.36), n - 3);
        var rj = [], yaw = [];
        for (k = 0; k <= n; k++) {
          var v = k < belly + 2 ? lerp(p.neckR, p.bellyR, smooth(k / belly)) : lerp(p.bellyR, p.tailR, Math.pow((k - belly - 1) / Math.max(n - belly - 1, 1), 0.8));
          rj.push(Math.max(3.7, v));
        }
        for (k = 1; k <= n; k++) {
          if (k <= 4) yaw.push(-deg(p.neckBend));
          else if (k <= belly + 1) yaw.push(deg(p.neckBend) * 0.45);
          else yaw.push(deg(p.tailCurl) * lerp(0.6, 1, (k - belly) / (n - belly)));
        }
        var Y0 = 0.85 * rj[0], jd0 = jointDims(rj[0], g), P = [];
        for (k = 1; k <= n; k++) P.push(p.pitch * (k <= belly + 1 ? 1 : lerp(1, 0.8, (k - belly) / (n - belly))));
        var ch = chain({ J0: [0, Y0, 0], dir: [1, 0, 0], P: P, rj: rj, yaw: yaw, g: g, bulge: p.bead, tip: rj[n] * 1.3, bend: p.__bend,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        var hs = p.headSize, hd = headShell([0, Y0, 0], [1, 0, 0], jd0, rj[0], 16 * hs, 1.55 * rj[0] * hs, 0.9 * rj[0] * hs, 0.85, 0);
        sc.add('head', 'head', hd.shell, '#fda4af');
        sc.add('head', 'head', ch.rootBall, '#fda4af');
        var nose = hd.point(0, 0, 1); // snout tube sticks out of the nose
        sc.add('head', 'head', blobShell([nose[0] - p.snout / 2 + 3, Y0, nose[2]], [1, 0, 0], p.snout / 2, 2.6, 2.6, 14, 0), '#fda4af');
        [-1, 1].forEach(function (sd) { sc.add('eyes', 'head', blobShell(hd.point(0.55, sd * deg(62), 0.95), [1, 0, 0], 2.4, 2.4, 2.4, 10, 0), '#334155'); });
        if (p.crown > 0) [0.55, 0.72, 0.88].forEach(function (u, i) {
          sc.add('crown', 'head', coneShell(hd.point(u, 0, 0.92), [-0.15, 1, 0], 1.8, p.crown * (1 - i * 0.12), 8, 1.2, 0), '#fde047');
        });
        ch.segs.forEach(function (sg) {
          var id = 'seg' + sg.k;
          sc.add(sg.k % 2 ? 'bodyA' : 'bodyB', id, sg.shell, sg.k % 2 ? '#fda4af' : '#fdba74');
          if (p.ridges > 0 && sg.k > 1) {
            var su = clamp((sg.jin.Rs * 1.2 + 1 - sg.sR) / (sg.sF - sg.sR), 0.5, 0.8);
            sc.add('crown', id, coneShell(onSeg(sg, su, 0, 0.9), [0, 1, 0], 0.2 * sg.rad(su), p.ridges * clamp(sg.rf / p.bellyR + 0.2, 0.45, 1), 8, 1.2, 0), '#fde047');
          }
        });
        // dorsal fin: a flat fan on one side of the belly
        if (p.fin > 0) {
          var fs = ch.segs[belly + 1], sr = fs.rad(0.5), bl = fs.sF - fs.sR, half = Math.min(bl * 0.34, 5), root = slabRoot(fs, 2.2), mid = axisAt(fs, 0.5), F = p.fin;
          sc.add('fins', 'seg' + fs.k, flatSlab([[-half, root], [-half, sr + 1.8], [-half - 3, sr + 1.8 + F * 0.5], [-1, sr + 1.8 + F], [half + 3, sr + 1.8 + F * 0.7], [half, sr + 1.8], [half, root]], [mid[0], 0, mid[2]], heading(fs.fr.a), 2.0, 0.5), '#93c5fd');
        }
        return sc.entries();
      }

      var SEAHORSE_PARAMS = [
        { group: 'Body', key: 'segments', label: 'Segments (neck, belly and tail)', unit: '', min: 11, max: 20, step: 1, value: 15 },
        { group: 'Body', key: 'pitch', label: 'Segment length', unit: ' mm', min: 8, max: 14, step: 0.5, value: 10 },
        { group: 'Body', key: 'neckR', label: 'Neck thickness (radius)', unit: ' mm', min: 4.5, max: 8, step: 0.1, value: 5.5 },
        { group: 'Body', key: 'bellyR', label: 'Belly size (radius)', unit: ' mm', min: 6, max: 11, step: 0.5, value: 8.5 },
        { group: 'Body', key: 'tailR', label: 'Tail thickness at the tip', unit: ' mm', min: 3.7, max: 5, step: 0.1, value: 3.8 },
        { group: 'Body', key: 'bead', label: 'Bead fullness (smooth ↔ knobbly)', unit: '', min: 0, max: 0.45, step: 0.05, value: 0.22 },
        { group: 'Pose', key: 'neckBend', label: 'Neck curve (straight ↔ arched)', unit: '°', min: 0, max: 12, step: 0.5, value: 8 },
        { group: 'Pose', key: 'tailCurl', label: 'Tail curl (straight ↔ curled)', unit: '°', min: 0, max: 10, step: 0.5, value: 8 },
        { group: 'Head & fin', key: 'snout', label: 'Snout length', unit: ' mm', min: 8, max: 28, step: 1, value: 16 },
        { group: 'Head & fin', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head & fin', key: 'crown', label: 'Crown spike height (0 = none)', unit: ' mm', min: 0, max: 12, step: 1, value: 7 },
        { group: 'Head & fin', key: 'ridges', label: 'Back ridge height (0 = none)', unit: ' mm', min: 0, max: 10, step: 1, value: 5 },
        { group: 'Head & fin', key: 'fin', label: 'Fin size (0 = none)', unit: ' mm', min: 0, max: 30, step: 1, value: 18 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-099',
        category: 'FLEXI // SEA CREATURES',
        title: 'Flexi Seahorse',
        fileName: 'Flexi_Seahorse',
        defaultColor: '#fda4af',
        palette: FLEXI_PALETTE,
        partNames: { head: 'Head & snout', eyes: 'Eyes', crown: 'Crown & ridges', bodyA: 'Body beads', bodyB: 'Body beads, alternate', fins: 'Fin' },
        parameters: SEAHORSE_PARAMS,
        presets: makePresets(SEAHORSE_PARAMS, [
          ['Default seahorse', {}],
          ['Curly tail', { segments: 18, tailCurl: 10, neckBend: 9 }],
          ['Pot-bellied', { bellyR: 10.5, neckR: 6.5, tailR: 4.5, segments: 13, headSize: 1.2 }],
          ['Pygmy seahorse', { segments: 12, bellyR: 7, neckR: 4.8, snout: 10, crown: 4, ridges: 3, fin: 12 }],
          ['Straight (easy print)', { neckBend: 0, tailCurl: 0 }]
        ]),
        build: buildSeahorse
      };
