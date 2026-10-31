      // -----------------------------------------------------------------------
      // Owl Stacker: one owl, or a totem of up to three separate owls, each sitting on the head of the one below.
      // -----------------------------------------------------------------------
      function buildOwl(p) {
        var sc = new Scene(), n = Math.round(p.owls), R0 = 25 * p.plump, H0 = 50, brown = '#b08968', y = 0, u, i;
        for (u = 0; u < n; u++) {
          var k = 1 - 0.13 * u, R = R0 * k, h = H0 * k, top = u === n - 1;
          var y0 = u === 0 ? 0 : y - h * 0.2;
          var opt = u === 0 ? { flare: 0.8, seg: 56, rings: 32 } : { anchor: [0, y0, 0], anchorR: R * 0.72, seg: 56, rings: 32 };
          var mid = y0 + h * 0.5, body = pod([0, mid, 0], R, h * 0.56, R * 0.96, opt);
          sc.add('body', 'b', body.tris, brown);
          var faceY = y0 + h * 0.68;
          [-1, 1].forEach(function (sd) {
            var e = body.surf(sd * 32, faceY), er = R * 0.34 * p.eye;
            sc.add('eyes', 'b', dome(e.p, e.n, er, { angle: 40 }), '#fef3c7');
            var rise = (er / Math.sin(deg(40))) * (1 - Math.cos(deg(40)));
            sc.add('pupils', 'b', dome(vadd(e.p, vmul(e.n, rise * 0.75)), e.n, er * p.pupil, { sink: 0.8 }), '#1e293b');
            if (p.wings > 0) { // folded wing: a proud form against the flank, narrowing down into the body
              var w = body.surf(sd * 96, y0 + h * 0.5), wc = vadd(w.p, vmul(w.n, -R * 0.12));
              sc.add('wings', 'b', pod([wc[0] - R * 0.15, y0 + h * 0.48, wc[2]], R * 0.55, h * 0.28, R * 0.2 * p.wings, { anchor: [wc[0] - R * 0.1, y0 + h * 0.2, wc[2] - sd * R * 0.2], anchorR: R * 0.14, rings: 18, seg: 24 }).tris, '#8d6e4b');
            }
            if (top && p.tufts > 0) { // ear tufts rising from the crown
              var t = body.surf(sd * 90, y0 + h * 0.9), tb = vadd(t.p, vmul(t.n, -R * 0.1));
              sc.add('tufts', 'b', horn(tb, [tb[0] - 2, tb[1] + 13 * p.tufts * k, tb[2] + sd * 4 * p.tufts], R * 0.2, { flatStart: true, seg: 12 }), '#8d6e4b');
            }
          });
          var bk = body.surf(0, faceY - h * 0.12);
          sc.add('beak', 'b', dome(bk.p, vnorm([bk.n[0], bk.n[1] + 0.15, bk.n[2]]), R * 0.15, { angle: 55 }), '#fbbf24');
          // belly feathers: rows of small raised arcs
          var rows = Math.round(p.feathers);
          for (i = 0; i < rows; i++) {
            var fy = y0 + h * (0.2 + i * 0.1), cnt = 3 - (i % 2), span = 15;
            for (var q = 0; q < cnt; q++) {
              var c = (q - (cnt - 1) / 2) * span * 1.5;
              sc.add('belly', 'b', ridge(body, [[c - span * 0.62, fy + 1.4], [c - span * 0.32, fy - 0.5], [c, fy - 1.2], [c + span * 0.32, fy - 0.5], [c + span * 0.62, fy + 1.4]], 2.2), '#fef3c7');
            }
          }
          if (u === 0) [-1, 1].forEach(function (sd) {
            sc.add('feet', 'b', pod([R * 0.82, 2.6, sd * R * 0.42], 7, 2.8, 5.5, { rings: 10, seg: 20, flare: 0.85 }).tris, '#fbbf24');
          });
          y = y0 + h;
        }
        scaleScene(sc, p.size);
        return finish(sc);
      }
      var OWL_PARAMS = [
        { group: 'Owl', key: 'owls', label: 'Owls in the stack', unit: '', min: 1, max: 3, step: 1, value: 1, slider: true },
        { group: 'Owl', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 },
        { group: 'Owl', key: 'plump', label: 'Body (slim ↔ plump)', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Face', key: 'eye', label: 'Eye disc size', unit: '×', min: 0.75, max: 1.2, step: 0.05, value: 1 },
        { group: 'Face', key: 'pupil', label: 'Pupil size (shy ↔ wide-eyed)', unit: '×', min: 0.3, max: 0.7, step: 0.05, value: 0.5 },
        { group: 'Face', key: 'tufts', label: 'Ear tuft length (0 = none)', unit: '×', min: 0, max: 1.6, step: 0.05, value: 1 },
        { group: 'Details', key: 'wings', label: 'Wing thickness (0 = none)', unit: '×', min: 0, max: 1.4, step: 0.05, value: 1 },
        { group: 'Details', key: 'feathers', label: 'Belly feather rows', unit: '', min: 0, max: 3, step: 1, value: 2 }
      ];
      window.MM_GENERATOR = {
        code: 'MM-083',
        category: 'ANIMALS // BIRDS',
        title: 'Owl Stacker',
        fileName: 'Owl',
        defaultColor: '#b08968',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly feathers', eyes: 'Eye discs', pupils: 'Pupils', wings: 'Wings', beak: 'Beak', tufts: 'Ear tufts', feet: 'Feet' },
        parameters: OWL_PARAMS,
        presets: makePresets(OWL_PARAMS, [
          ['Default owl', {}],
          ['Owl pair', { owls: 2 }],
          ['Owl totem', { owls: 3 }],
          ['Wide-eyed owlet', { plump: 1.15, pupil: 0.65, eye: 1.1, wings: 0.7, tufts: 0.5, size: 0.75, feathers: 1 }]
        ]),
        build: buildOwl
      };
