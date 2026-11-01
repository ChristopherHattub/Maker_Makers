      // -----------------------------------------------------------------------
      // Mushroom Critters: a mushroom gnome, a frog or a snail, each sculpted as one seamless surface
      // -----------------------------------------------------------------------
      function buildCritter(p, api) {
        var sc = new Scene(), sp = Math.round(p.species), S = new Sculpt(1.2).useEdits(api), i, sz = p.size;
        function eyes(x, y, z, r0, white, parent) {
          [-1, 1].forEach(function (s) {
            var id = s < 0 ? 'eyeL' : 'eyeR', e = S.face(id, [x + 200, y, s * z], [-1, 0, 0], parent);
            if (!e) return;
            var r = r0 * e.k;
            S.addon(id, e.p, r);
            sc.add('eyes', 'b', dome(e.p, e.n, r, { angle: 48 }), white ? '#f8fafc' : '#1e293b');
            var rise = (r / Math.sin(deg(48))) * (1 - Math.cos(deg(48)));
            if (white) sc.add('pupils', 'b', dome(vadd(e.p, vmul(e.n, rise * 0.7)), e.n, r * 0.56, { sink: 0.6 }), '#1e293b');
            else sc.add('eyes', 'b', dome(vadd(e.p, vadd(vmul(e.n, r * 0.36), [0, r * 0.3, 0])), e.n, r * 0.26, { sink: 0.4 }), '#1e293b');
          });
        }
        S.reach = 0.72;
        if (sp === 0) { // mushroom gnome: stem body with a face, gilled cap, beard and boots
          var Rs = 15 * sz, Hs = 40 * sz, cap = 27 * sz * p.cap, capH = 24 * sz * p.capTall, cy = Hs * 1.22 + (cap - 27 * sz) * 0.7, stem = '#fef3c7', red = '#fb7185';
          S.piece('stem');
          S.ell('stem', [0, Hs * 0.42, 0], [Rs, Hs * 0.55, Rs], stem, 4);
          S.path('stem', [[0, Hs * 0.6, 0, Rs * 0.84], [0, cy, 0, Rs * 0.7]], stem, 5);
          // cap: its underside is trimmed into a 45 degree cone; radial gills are pressed into it
          S.piece('cap');
          S.ell('cap', [0, cy + capH * 0.16, 0], [cap * 1.02, capH * 0.84, cap * 1.02], red, 3);
          S.paint('gills', [0, cy - cap * 0.62, 0], [cap * 1.5, cap * 0.76, cap * 1.5], '#fcd9b6');
          S.relief([-cap * 1.1, cy - cap, -cap * 1.1], [cap * 1.1, cy + capH * 0.1, cap * 1.1], function (x, y, z) { return Math.hypot(x, z) < Rs * 0.92 ? 0 : 0.8 * Math.pow(Math.abs(Math.sin(Math.atan2(z, x) * 16)), 3); });
          for (i = 0; i < 9; i++) { // spots
            var a = i * 2.4, rr = i === 0 ? 0 : cap * (i < 4 ? 0.46 : 0.8), t2 = rr / (cap * 1.02), yy = cy + capH * 0.16 + capH * 0.84 * Math.sqrt(Math.max(1 - t2 * t2, 0.03)), sr = (i % 3 === 0 ? 5.4 : 3.8) * sz;
            S.ell('spots', [Math.cos(a) * rr, yy - 0.4, Math.sin(a) * rr], [sr, Math.max(1.7, 2 * sz), sr], '#fff7ed', 1);
          }
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'footL' : 'footR');
            S.ell('feet', [Rs * 0.62, 3.5 * sz, s * Rs * 0.55], [9.5 * sz, 4 * sz, 6.5 * sz], '#92400e', 1.5);
            S.piece(s < 0 ? 'armL' : 'armR');
            S.path('stem', [[Rs * 0.2, Hs * 0.5, s * Rs * 0.86, 3.3 * sz], [Rs * 0.62, Hs * 0.32, s * Rs * 0.96, 2.8 * sz], [Rs * 0.95, Hs * 0.34, s * Rs * 0.74, 2.4 * sz]], stem, 2);
          });
          S.piece('beard', 'stem');
          S.path('beard', [[Rs * 0.76, Hs * 0.42, -Rs * 0.52, 3.6 * sz], [Rs * 0.96, Hs * 0.34, 0, 5 * sz], [Rs * 0.76, Hs * 0.42, Rs * 0.52, 3.6 * sz]], '#f8fafc', 2.2);
          S.ell('beard', [Rs * 0.9, Hs * 0.16, 0], [Rs * 0.28, Hs * 0.17, Rs * 0.5], '#f8fafc', 2.5);
          S.piece('nose', 'stem');
          S.ell('nose', [Rs * 1.02, Hs * 0.56, 0], [4 * sz, 3.6 * sz, 3.8 * sz], '#fda4af', 1.2);
          S.run();
          eyes(0, Hs * 0.68, Rs * 0.38, 2.9 * sz, false, 'stem');
        } else if (sp === 1) { // frog: wide smile, folded legs and bulging eyes
          var W = 24 * sz, g1 = '#86efac', g2 = '#4ade80';
          S.piece('torso');
          S.ell('body', [0, W * 0.42, 0], [W * 1.12, W * 0.66, W * 0.96], g1, 3);
          S.ell('body', [W * 0.42, W * 0.74, 0], [W * 0.66, W * 0.42, W * 0.76], g1, 6);
          S.paint('belly', [W * 0.9, W * 0.26, 0], [W * 0.5, W * 0.36, W * 0.76], '#ecfccb');
          [-1, 1].forEach(function (s) {
            var zE = s * W * 0.42, yE = W * 1.12;
            S.piece('torso');
            S.ell('body', [W * 0.56, yE, zE], [W * 0.22, W * 0.24, W * 0.23], g1, 2);
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('legs', [-W * 0.54, W * 0.34, s * W * 0.82], [W * 0.56, W * 0.34, W * 0.27], g2, 2.5);
            S.path('legs', [[-W * 0.2, W * 0.15, s * W * 1.02, W * 0.15], [W * 0.34, W * 0.1, s * W * 1.04, W * 0.11]], g2, 1.5);
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('legs', [[W * 0.66, W * 0.46, s * W * 0.7, W * 0.19], [W * 0.86, W * 0.24, s * W * 0.74, W * 0.16], [W * 0.92, W * 0.1, s * W * 0.74, W * 0.15]], g2, 2);
            for (var c = -1; c <= 1; c++) {
              S.piece(s < 0 ? 'frontL' : 'frontR');
              S.ell('toes', [W * 1.04 + (1 - Math.abs(c)) * 2, 1.9, s * W * 0.72 + c * W * 0.15], [W * 0.15, 2.3, W * 0.11], g2, 1.4);
              S.piece(s < 0 ? 'hindL' : 'hindR');
              S.ell('toes', [W * 0.46 + (1 - Math.abs(c)) * 2, 1.9, s * W * 1.04 + c * W * 0.15], [W * 0.15, 2.3, W * 0.11], g2, 1.4);
            }
            S.piece('torso');
            S.paint('cheeks', [W * 0.9, W * 0.9, s * W * 0.62], [W * 0.2, W * 0.13, W * 0.17], '#fda4af');
          });
          S.run();
          var mp = [];
          if (!S.deleted('mouth')) {
            S.parents.mouth = 'torso'; S.pivots.mouth = [W, W * 0.76, 0];
            for (i = 0; i <= 12; i++) { var az = lerp(-0.74, 0.74, i / 12), mh = S.hit(S.xf('mouth', [W * 3, W * 0.8 - W * 0.09 * (1 - az * az / 0.55), az * W]), [-1, 0, 0]); mp.push(mh.p.concat([0.95])); S.addon('mouth', mh.p, 1.2); }
            sc.add('mouth', 'b', sweep(mp, { seg: 8, per: 2, floor: 0 }), '#1e293b');
          }
          [-1, 1].forEach(function (s) {
            var id = s < 0 ? 'eyeL' : 'eyeR', e = S.face(id, [W * 3, W * 1.16, s * W * 0.42], [-1, 0, 0], 'torso');
            if (!e) return;
            var r = W * 0.17 * e.k;
            S.addon(id, e.p, r);
            sc.add('eyes', 'b', dome(e.p, e.n, r, { angle: 50 }), '#fde047');
            var rise = (r / Math.sin(deg(50))) * (1 - Math.cos(deg(50)));
            var pu = S.sub(s < 0 ? 'pupilL' : 'pupilR', id, vadd(e.p, vmul(e.n, rise * 0.7)), r * 0.58);
            if (pu) sc.add('pupils', 'b', dome(pu.p, e.n, r * 0.58 * pu.k, { sink: 0.6 }), '#1e293b');
          });
        } else { // snail: a foot on the bed, raised neck and a spiral shell
          var Rr = 21 * sz, sx = -7 * sz, sy = Rr * 0.98, skin = '#fde68a';
          S.piece('foot');
          S.path('body', [[-40 * sz, 1.8, 0, 2.6], [-20 * sz, 3.4, 0, 6], [6 * sz, 4.2, 0, 7.4], [18 * sz, 4.6, 0, 7]], skin, 3);
          S.piece('neck');
          S.path('body', [[15 * sz, 6, 0, 7], [23 * sz, 16 * sz, 0, 6.2], [26 * sz, 28 * sz, 0, 5.6]], skin, 3);
          S.ell('body', [28 * sz, 33 * sz, 0], [8 * sz, 7 * sz, 7 * sz], skin, 3);
          S.piece('shell');
          S.ell('shell', [sx, sy, 0], [Rr, Rr, 11.5 * sz], '#fdba74', 1.5);
          S.relief([sx - Rr, sy - Rr, -13 * sz], [sx + Rr, sy + Rr, 13 * sz], function (x, y) {
            var dx = x - sx, dy = y - sy, r = Math.hypot(dx, dy), turns = r / (Rr * 0.34) - Math.atan2(dy, dx) / TAU, f = turns - Math.floor(turns);
            return r < 1.5 ? 0 : 1.15 * smooth(1 - Math.abs(f - 0.5) / 0.17);
          });
          S.paint('swirl', [sx, sy, 0], [Rr * 0.34, Rr * 0.34, 14 * sz], '#f97316');
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'stalkL' : 'stalkR', 'neck');
            var tb = [29 * sz, 38 * sz, s * 3 * sz], tt = [32 * sz, 50 * sz, s * 8 * sz];
            S.path('stalks', [tb.concat([2.2]), tt.concat([1.6])], skin, 1.4);
            S.ell('stalks', [tt[0], tt[1] + 1, tt[2]], [3, 3, 3], skin, 1);
          });
          S.run();
          [-1, 1].forEach(function (s) {
            var id = s < 0 ? 'eyeL' : 'eyeR', e = S.face(id, [200, 50 * sz + 1.4, s * 8 * sz], [-1, 0, 0], s < 0 ? 'stalkL' : 'stalkR');
            if (!e) return;
            S.addon(id, e.p, 1.7 * e.k);
            sc.add('eyes', 'b', dome(e.p, e.n, 1.7 * e.k, { angle: 52, sink: 0.8 }), '#1e293b');
          });
        }
        S.addTo(sc);
        return finishSculpt(sc, 1, S);
      }

      var CRIT_PARAMS = [
        { group: 'Critter', key: 'species', label: 'Critter', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Mushroom gnome', 'Frog', 'Snail'] },
        { group: 'Critter', key: 'size', label: 'Overall size', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1 },
        { group: 'Mushroom gnome', key: 'cap', label: 'Cap width', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Mushroom gnome', key: 'capTall', label: 'Cap height', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-086',
        category: 'ANIMALS // CRITTERS',
        title: 'Mushroom Critters',
        fileName: 'Critter',
        defaultColor: '#fb7185',
        palette: ANIMAL_PALETTE,
        partNames: { stem: 'Stem body', cap: 'Mushroom cap', gills: 'Gills', spots: 'Cap spots', nose: 'Nose', mouth: 'Mouth', beard: 'Beard', feet: 'Boots', body: 'Body', belly: 'Belly', cheeks: 'Cheeks', legs: 'Legs', toes: 'Toes', eyes: 'Eyes', pupils: 'Pupils', shell: 'Shell', swirl: 'Shell centre', stalks: 'Eye stalks' },
        parameters: CRIT_PARAMS,
        presets: makePresets(CRIT_PARAMS, [
          ['Default mushroom gnome', {}],
          ['Tiny toadstool', { size: 0.8, cap: 1.25, capTall: 0.8 }],
          ['Frog', { species: 1 }],
          ['Big frog', { species: 1, size: 1.15 }],
          ['Snail', { species: 2 }],
          ['Giant snail', { species: 2, size: 1.3 }]
        ]),
        sculpt: sculptModule([
          { id: 'cap', label: 'Cap', section: 'Body' }, { id: 'stem', label: 'Body', section: 'Body' }, { id: 'torso', label: 'Body', section: 'Body' }, { id: 'foot', label: 'Foot', section: 'Body' }, { id: 'neck', label: 'Neck', section: 'Body' }, { id: 'shell', label: 'Shell', section: 'Body' }, { id: 'beard', label: 'Beard', section: 'Body' }, { id: 'nose', label: 'Nose', section: 'Body' }, { id: 'mouth', label: 'Mouth', section: 'Body' },
          { id: 'eyeL', label: 'Left eye', section: 'Eyes' }, { id: 'pupilL', label: 'Left pupil', section: 'Eyes', parent: 'eyeL' }, { id: 'eyeR', label: 'Right eye', section: 'Eyes' }, { id: 'pupilR', label: 'Right pupil', section: 'Eyes', parent: 'eyeR' }, { id: 'stalkL', label: 'Left stalk', section: 'Eyes' }, { id: 'stalkR', label: 'Right stalk', section: 'Eyes' },
          { id: 'armL', label: 'Left arm', section: 'Limbs' }, { id: 'armR', label: 'Right arm', section: 'Limbs' }, { id: 'footL', label: 'Left boot', section: 'Limbs' }, { id: 'footR', label: 'Right boot', section: 'Limbs' }, { id: 'frontL', label: 'Left front leg', section: 'Limbs' }, { id: 'frontR', label: 'Right front leg', section: 'Limbs' }, { id: 'hindL', label: 'Left hind leg', section: 'Limbs' }, { id: 'hindR', label: 'Right hind leg', section: 'Limbs' }
        ]),
        build: buildCritter
      };
