      // -----------------------------------------------------------------------
      // Owl Stacker: one owl, or a totem of up to three, sculpted as one seamless surface with scalloped feathers
      // -----------------------------------------------------------------------
      function buildOwl(p, api) {
        var sc = new Scene(), S = new Sculpt(1.2 + 0.25 * (Math.round(p.owls) - 1)).useEdits(api, p.size), n = Math.round(p.owls), R0 = 25 * p.plump, H0 = 52, brown = '#a97c50', wing = '#7c5a38', cream = '#fbeed5', disc = '#e7cda2', y = 0, faces = [], u, i;
        for (u = 0; u < n; u++) {
          var k = 1 - 0.13 * u, R = R0 * k, h = H0 * k, y0 = u === 0 ? 0 : y - h * 0.16, mid = y0 + h * 0.5;
          S.piece('owl' + u);
          S.ell('body', [0, mid, 0], [R, h * 0.56, R * 0.96], brown, u === 0 ? 4 : 2.5);
          S.paint('belly', [R * 0.72, y0 + h * 0.34, 0], [R * 0.62, h * 0.36, R * 0.72], cream);
          [-1, 1].forEach(function (s) {
            // facial disc: a shallow carved bowl around each eye
            var ex = R * 0.86, ey = y0 + h * 0.66, ez = s * R * 0.42;
            S.ell(null, [ex + R * 0.26, ey, ez], [R * 0.3, R * 0.36, R * 0.36], null, 0).carve(2);
            S.paint('face', [ex, ey, ez], [R * 0.36, R * 0.42, R * 0.42], disc);
            if (p.wings > 0) {
              var W = p.wings;
              S.piece(u === 0 ? (s < 0 ? 'wingL' : 'wingR') : 'owl' + u);
              S.ell('wings', [-R * 0.1, y0 + h * 0.5, s * R * 0.86], [R * 0.56, h * 0.32, R * 0.15 + 2.4 * W], wing, 1.2);
              S.piece('owl' + u);
              for (i = 0; i < 3; i++) S.path(null, [[-R * 0.55 + i * R * 0.34, y0 + h * 0.2, s * R * 1.06, 0.7], [-R * 0.3 + i * R * 0.34, y0 + h * 0.42, s * R * 1.12, 0.8]], null, 0, 3).carve(0.7);
            }
          });
          var rows = Math.round(p.feathers);
          if (rows > 0) (function (y0, h, R) { // scalloped chest feathers, pressed into the surface
            var ry = h * 0.56 / rows, rz = R * 0.34;
            S.relief([R * 0.25, y0 + h * 0.06, -R], [R * 1.4, y0 + h * 0.58, R], function (x, yy, z) {
              var row = Math.floor((yy - y0 - h * 0.06) / ry), oz = row % 2 ? rz : 0, cz = ((z + oz + 100 * rz) % (2 * rz)) - rz, ty = ((yy - y0 - h * 0.06) / ry) - row;
              if (row < 0 || row >= rows) return 0;
              var a = cz / rz, edge = Math.sqrt(Math.max(1 - a * a, 0)); // arc of each scallop
              return 0.9 * smooth(1 - Math.abs(ty - (1 - edge)) / 0.3);
            });
          })(y0, h, R);
          faces.push({ y: y0 + h * 0.66, R: R, top: u === n - 1, y0: y0, h: h, k: k });
          y = y0 + h;
        }
        var t = faces[faces.length - 1];
        if (p.tufts > 0) [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'tuftL' : 'tuftR', 'owl' + (n - 1));
          var ty = t.y0 + t.h * 0.86, tz = s * t.R * 0.6, T = 15 * p.tufts * t.k;
          S.path('tufts', [[-t.R * 0.05, ty - 3, tz, 5 * t.k], [-t.R * 0.1, ty + T * 0.5, tz + s * T * 0.12, 3.3 * t.k], [-t.R * 0.14, ty + T, tz + s * T * 0.22, 0.6]], wing, 2);
        });
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'footL' : 'footR');
          S.ell('feet', [R0 * 0.8, 2.8, s * R0 * 0.42], [8, 3.2, 6], '#fbbf24', 2);
          for (var c = -1; c <= 1; c++) S.ell('feet', [R0 * 0.8 + 7, 2, s * R0 * 0.42 + c * 3.4], [3.6, 2.2, 1.9], '#f59e0b', 0.8);
        });
        S.run();
        faces.forEach(function (f, fi) {
          var R = f.R, own = 'owl' + fi, one = fi === 0 ? '' : fi + 1;
          [-1, 1].forEach(function (s) {
            var id = (s < 0 ? 'eyeL' : 'eyeR') + one, e = S.face(id, [R * 4, f.y, s * R * 0.42], [-1, 0, 0], own);
            if (!e) return;
            var er = R * 0.24 * p.eye * e.k;
            S.addon(id, e.p, er);
            sc.add('eyes', 'b', dome(e.p, e.n, er, { angle: 48, seg: 28 }), '#fbbf24');
            var rise = (er / Math.sin(deg(48))) * (1 - Math.cos(deg(48)));
            var pu = S.sub((s < 0 ? 'pupilL' : 'pupilR') + one, id, vadd(e.p, vmul(e.n, rise * 0.7)), er * p.pupil);
            if (pu) sc.add('pupils', 'b', dome(pu.p, e.n, er * p.pupil * pu.k, { sink: 0.8 }), '#1e293b');
          });
          var bid = 'beak' + one, bk = S.face(bid, [R * 4, f.y - R * 0.3, 0], [-1, 0, 0], own);
          if (bk) { sc.add('beak', 'b', dome(bk.p, vnorm([bk.n[0], bk.n[1] + 0.2, 0]), R * 0.15 * bk.k, { angle: 62, seg: 14 }), '#f59e0b'); S.addon(bid, bk.p, R * 0.15 * bk.k); }
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size, S);
      }
      var OWL_PARAMS = [
        { group: 'Owl', key: 'owls', label: 'Owls in the stack', unit: '', min: 1, max: 3, step: 1, value: 1, slider: true },
        { group: 'Owl', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 },
        { group: 'Owl', key: 'plump', label: 'Body (slim ↔ plump)', unit: '×', min: 0.85, max: 1.2, step: 0.05, value: 1 },
        { group: 'Face', key: 'eye', label: 'Eye size', unit: '×', min: 0.8, max: 1.25, step: 0.05, value: 1 },
        { group: 'Face', key: 'pupil', label: 'Pupil size (shy ↔ wide-eyed)', unit: '×', min: 0.35, max: 0.7, step: 0.05, value: 0.55 },
        { group: 'Face', key: 'tufts', label: 'Ear tuft length (0 = none)', unit: '×', min: 0, max: 1.5, step: 0.05, value: 1 },
        { group: 'Details', key: 'wings', label: 'Wing thickness (0 = none)', unit: '×', min: 0, max: 1.3, step: 0.05, value: 1 },
        { group: 'Details', key: 'feathers', label: 'Chest feather rows (0 = none)', unit: '', min: 0, max: 4, step: 1, value: 3, slider: true }
      ];
      window.MM_GENERATOR = {
        code: 'MM-083',
        category: 'ANIMALS // BIRDS',
        title: 'Owl Stacker',
        fileName: 'Owl',
        defaultColor: '#a97c50',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Chest feathers', face: 'Face discs', eyes: 'Eyes', pupils: 'Pupils', wings: 'Wings', beak: 'Beak', tufts: 'Ear tufts', feet: 'Feet' },
        parameters: OWL_PARAMS,
        presets: makePresets(OWL_PARAMS, [
          ['Default owl', {}],
          ['Owl pair', { owls: 2 }],
          ['Owl totem', { owls: 3 }],
          ['Wide-eyed owlet', { plump: 1.15, pupil: 0.7, eye: 1.2, wings: 0.7, tufts: 0.5, size: 0.75, feathers: 2 }]
        ]),
        sculpt: sculptModule([
          { id: 'owl0', label: 'Owl', section: 'Bottom owl' }, { id: 'eyeL', label: 'Left eye', section: 'Bottom owl' }, { id: 'pupilL', label: 'Left pupil', section: 'Bottom owl', parent: 'eyeL' }, { id: 'eyeR', label: 'Right eye', section: 'Bottom owl' }, { id: 'pupilR', label: 'Right pupil', section: 'Bottom owl', parent: 'eyeR' }, { id: 'beak', label: 'Beak', section: 'Bottom owl' }, { id: 'wingL', label: 'Left wing', section: 'Bottom owl' }, { id: 'wingR', label: 'Right wing', section: 'Bottom owl' }, { id: 'footL', label: 'Left foot', section: 'Bottom owl' }, { id: 'footR', label: 'Right foot', section: 'Bottom owl' },
          { id: 'owl1', label: 'Owl', section: 'Middle owl' }, { id: 'eyeL2', label: 'Left eye', section: 'Middle owl' }, { id: 'pupilL2', label: 'Left pupil', section: 'Middle owl', parent: 'eyeL2' }, { id: 'eyeR2', label: 'Right eye', section: 'Middle owl' }, { id: 'pupilR2', label: 'Right pupil', section: 'Middle owl', parent: 'eyeR2' }, { id: 'beak2', label: 'Beak', section: 'Middle owl' },
          { id: 'owl2', label: 'Owl', section: 'Top owl' }, { id: 'eyeL3', label: 'Left eye', section: 'Top owl' }, { id: 'pupilL3', label: 'Left pupil', section: 'Top owl', parent: 'eyeL3' }, { id: 'eyeR3', label: 'Right eye', section: 'Top owl' }, { id: 'pupilR3', label: 'Right pupil', section: 'Top owl', parent: 'eyeR3' }, { id: 'beak3', label: 'Beak', section: 'Top owl' },
          { id: 'tuftL', label: 'Left tuft', section: 'Tufts' }, { id: 'tuftR', label: 'Right tuft', section: 'Tufts' }
        ]),
        build: buildOwl
      };
