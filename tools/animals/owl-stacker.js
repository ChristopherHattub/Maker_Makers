      // -----------------------------------------------------------------------
      // Owl Stacker: one owl, or a totem of up to three, sculpted as one seamless surface with scalloped feathers
      // -----------------------------------------------------------------------
      function buildOwl(p, api) {
        var sc = new Scene(), S = new Sculpt(2).useEdits(api, p.size), n = Math.round(p.owls), R0 = 26 * p.plump, H0 = 56, y = 0, u, i;
        var brown = '#8a6642', dark = '#5c4128', cream = '#f5e6c8', disc = '#e8cfa3', gold = '#e8a317';
        S.run();
        for (u = 0; u < n; u++) (function (u) {
          var k = 1 - 0.13 * u, R = R0 * k, h = H0 * k, y0 = u === 0 ? 0 : y - h * 0.13, own = 'owl' + u, one = u === 0 ? '' : u + 1, top = u === n - 1;
          var prof = [[0, u === 0 ? 0.72 : 0.56, 0], [0.12, u === 0 ? 0.88 : 0.82, 0], [0.34, 1, 0], [0.5, 0.99, 0], [0.56, 0.97, 0], [0.76, 0.88, 0], [0.9, 0.64, 0], [0.98, 0.26, 0], [1, 0.02, 0]], body = profileLoft(0, y0, h, R, 0.94, prof);
          S.shell(sc, own, 'body', 'b', body.tris, brown);
          // chest: a smooth pale front with rows of small overlapping feathers
          var chest = profileLoft(0, y0, h * 0.62, R, 0.94, frontProfile(prof, 0.62, 0.8, 0.25));
          S.shell(sc, 'chest' + one, 'chest', 'b', chest.tris, cream, own);
          var rows = Math.round(p.feathers) * 2;
          for (i = 0; i < rows; i++) (function (i) {
            var fy = y0 + h * lerp(0.14, 0.5, rows > 1 ? i / (rows - 1) : 0.5), cnt = 8 - (i % 2), span = 13;
            for (var q = 0; q < cnt; q++) {
              var f = chest.surf((q - (cnt - 1) / 2) * span, fy), tt = S.xf(own, f.p);
              S.addon('chest' + one, tt, R * 0.09);
              sc.add('feathers', 'b', dome(tt, vnorm([f.n[0], f.n[1] + 0.25, f.n[2]]), R * 0.062, { angle: 32, seg: 14, sink: 0.8 }), '#b08a5e');
            }
          })(i);
          [-1, 1].forEach(function (s) {
            var fy = y0 + h * 0.7, id = (s < 0 ? 'eyeL' : 'eyeR') + one, pid = (s < 0 ? 'pupilL' : 'pupilR') + one;
            // face disc: a shallow pale bowl-shaped dome around each eye, then the eye and a heavy brow
            var d = body.surf(s * 25, fy), dn = vnorm([d.n[0] + 0.5, d.n[1], d.n[2]]), dt = S.xf(own, d.p);
            sc.add('face', 'b', dome(dt, dn, R * 0.42, { angle: 20, seg: 44 }), disc);
            var rise = (R * 0.42 / Math.sin(deg(20))) * (1 - Math.cos(deg(20))), lift = vadd(d.p, vmul(dn, rise * 0.92));
            softEyeOn(sc, S, id, pid, { surf: function () { return { p: lift, n: dn }; } }, 0, 0, own, R * 0.24 * p.eye, '#f59e0b');
            var b0 = body.surf(s * 5, fy + R * 0.3), b1 = body.surf(s * 26, fy + R * 0.42), b2 = body.surf(s * 52, fy + R * 0.28);
            S.shell(sc, 'brow' + one, 'brows', 'b', sweep([vadd(b0.p, vmul(b0.n, 1)).concat([1.6]), vadd(b1.p, vmul(b1.n, 1)).concat([1.5]), vadd(b2.p, vmul(b2.n, 0.2)).concat([0.8])], { seg: 12, per: 8, floor: null }), dark, own);
            if (p.wings > 0) { // folded wing with feather tiers
              var w = body.surf(s * 104, y0 + h * 0.42), wid = u === 0 ? (s < 0 ? 'wingL' : 'wingR') : (s < 0 ? 'wingL' : 'wingR') + one;
              var wing = pod([w.p[0], y0 + h * 0.44, w.p[2] - s * R * 0.06], R * 0.52, h * 0.27, R * 0.13 + 2.4 * p.wings, { anchor: [w.p[0], y0 + h * 0.14, w.p[2] - s * R * 0.2], anchorR: R * 0.1, rings: 24, seg: 40 });
              S.shell(sc, wid, 'wings', 'b', wing.tris, dark, own);
              // layered coverts: a lighter tier over the shoulder, ending in a soft point
              S.shell(sc, wid, 'wing feathers', 'b', pod([w.p[0], y0 + h * 0.54, w.p[2] - s * R * 0.03], R * 0.4, h * 0.15, R * 0.13 + 3.2 * p.wings, { anchor: [w.p[0], y0 + h * 0.3, w.p[2] - s * R * 0.14], anchorR: R * 0.08, rings: 22, seg: 36 }).tris, '#b08a5e', own);
            }
            if (top && p.tufts > 0) {
              var tb = body.surf(s * 74, y0 + h * 0.88), T = 11 * p.tufts * k, id2 = s < 0 ? 'tuftL' : 'tuftR';
              S.shell(sc, id2, 'tufts', 'b', sweep([vadd(tb.p, vmul(tb.n, -5)).concat([6.5 * k]), [tb.p[0] - 1, tb.p[1] + T * 0.45, tb.p[2] + s * T * 0.18, 4 * k], [tb.p[0] - 2, tb.p[1] + T, tb.p[2] + s * T * 0.42, 0.5]], { seg: 16, per: 8, floor: null }), dark, own);
            }
          });
          // hooked beak between the discs
          var bk = body.surf(0, y0 + h * 0.62), bid = 'beak' + one, bp = S.xf(own, bk.p);
          S.shell(sc, bid, 'beak', 'b', pod([bk.p[0] + 1.6, bk.p[1] + R * 0.02, 0], R * 0.14, R * 0.17, R * 0.12, { anchor: [bk.p[0] - R * 0.3, bk.p[1] - R * 0.3, 0], anchorR: 1.6, rings: 20, seg: 28 }).tris, gold, own);
          void bp;
          y = y0 + h;
        })(u);
        [-1, 1].forEach(function (s) {
          var fx = R0 * 0.66, fz = s * R0 * 0.38, id = s < 0 ? 'footL' : 'footR';
          S.shell(sc, id, 'feet', 'b', pod([fx, 3, fz], 8, 3.2, 6, { rings: 14, seg: 28, flare: 0.8 }).tris, gold);
          [-1, 0, 1].forEach(function (c) {
            S.shell(sc, id, 'feet', 'b', pod([fx + 8, 2, fz + c * 3.6], 4, 2.3, 2, { rings: 10, seg: 18, flare: 0.8 }).tris, gold);
            S.shell(sc, id, 'talons', 'b', pod([fx + 12, 1.5, fz + c * 3.6], 2.4, 1.6, 1.2, { rings: 8, seg: 14, flare: 0.8 }).tris, '#3f2a14');
          });
        });
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
        defaultColor: '#8a6642',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', chest: 'Chest', feathers: 'Chest feathers', face: 'Face discs', brows: 'Brows', eyes: 'Eyes', pupils: 'Pupils', glints: 'Eye glints', wings: 'Wings', 'wing feathers': 'Wing feathers', beak: 'Beak', tufts: 'Ear tufts', feet: 'Feet', talons: 'Talons' },
        parameters: OWL_PARAMS,
        presets: makePresets(OWL_PARAMS, [
          ['Default owl', {}],
          ['Owl pair', { owls: 2 }],
          ['Owl totem', { owls: 3 }],
          ['Wide-eyed owlet', { plump: 1.15, pupil: 0.7, eye: 1.2, wings: 0.7, tufts: 0.5, size: 0.75, feathers: 2 }]
        ]),
        sculpt: sculptModule([
          { id: 'owl0', label: 'Owl', section: 'Bottom owl' }, { id: 'chest', label: 'Chest', section: 'Bottom owl' }, { id: 'brow', label: 'Brows', section: 'Bottom owl' }, { id: 'eyeL', label: 'Left eye', section: 'Bottom owl' }, { id: 'pupilL', label: 'Left pupil', section: 'Bottom owl', parent: 'eyeL' }, { id: 'eyeR', label: 'Right eye', section: 'Bottom owl' }, { id: 'pupilR', label: 'Right pupil', section: 'Bottom owl', parent: 'eyeR' }, { id: 'beak', label: 'Beak', section: 'Bottom owl' }, { id: 'wingL', label: 'Left wing', section: 'Bottom owl' }, { id: 'wingR', label: 'Right wing', section: 'Bottom owl' }, { id: 'footL', label: 'Left foot', section: 'Bottom owl' }, { id: 'footR', label: 'Right foot', section: 'Bottom owl' },
          { id: 'owl1', label: 'Owl', section: 'Middle owl' }, { id: 'chest2', label: 'Chest', section: 'Middle owl' }, { id: 'brow2', label: 'Brows', section: 'Middle owl' }, { id: 'wingL2', label: 'Left wing', section: 'Middle owl' }, { id: 'wingR2', label: 'Right wing', section: 'Middle owl' }, { id: 'eyeL2', label: 'Left eye', section: 'Middle owl' }, { id: 'pupilL2', label: 'Left pupil', section: 'Middle owl', parent: 'eyeL2' }, { id: 'eyeR2', label: 'Right eye', section: 'Middle owl' }, { id: 'pupilR2', label: 'Right pupil', section: 'Middle owl', parent: 'eyeR2' }, { id: 'beak2', label: 'Beak', section: 'Middle owl' },
          { id: 'owl2', label: 'Owl', section: 'Top owl' }, { id: 'chest3', label: 'Chest', section: 'Top owl' }, { id: 'brow3', label: 'Brows', section: 'Top owl' }, { id: 'wingL3', label: 'Left wing', section: 'Top owl' }, { id: 'wingR3', label: 'Right wing', section: 'Top owl' }, { id: 'eyeL3', label: 'Left eye', section: 'Top owl' }, { id: 'pupilL3', label: 'Left pupil', section: 'Top owl', parent: 'eyeL3' }, { id: 'eyeR3', label: 'Right eye', section: 'Top owl' }, { id: 'pupilR3', label: 'Right pupil', section: 'Top owl', parent: 'eyeR3' }, { id: 'beak3', label: 'Beak', section: 'Top owl' },
          { id: 'tuftL', label: 'Left tuft', section: 'Tufts' }, { id: 'tuftR', label: 'Right tuft', section: 'Tufts' }
        ]),
        build: buildOwl
      };
