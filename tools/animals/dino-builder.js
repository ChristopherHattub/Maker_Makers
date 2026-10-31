      // -----------------------------------------------------------------------
      // Dino Builder: T-rex, Stegosaurus or Triceratops sculpted as one seamless surface
      // -----------------------------------------------------------------------
      function buildDino(p, api) {
        var sc = new Scene(), S = new Sculpt(1.4).useEdits(api), sp = Math.round(p.species), c = p.crest, hs = p.headSize, L = p.bodyLen / 100, i;
        var col = ['#86efac', '#fdba74', '#93c5fd'][sp], belly = '#fef3c7', dark = ['#34d399', '#f97316', '#60a5fa'][sp], claw = '#f8fafc';
        var eyeO, eyeZ, eyeY, nostril;
        function claws(x, z, n) { for (var q = 0; q < n; q++) S.ell('claws', [x + 1, 2.4, z + (q - (n - 1) / 2) * 4], [3.2, 2.5, 2], claw, 0.8); }
        function tail(x, z, r, len) { S.piece('tail'); S.path('tail', [[x, r * 0.7, z, r], [x - len * 0.35, r * 0.5, z + 5, r * 0.72], [x - len * 0.7, r * 0.34, z + 3, r * 0.42], [x - len, 1.6, z - 2, 1.9]], col, 5); }
        if (sp === 0) { // T-rex: sits back on haunches and tail
          S.piece('torso');
          S.ell('body', [-6, 19, 0], [23, 21, 19], col, 5);
          S.path('body', [[-2, 26, 0, 17], [10, 45, 0, 14.5], [21, 62, 0, 12]], col, 8);
          S.paint('belly', [18, 34, 0], [14, 28, 13], belly);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-9, 15, s * 15], [18, 15, 8.5], col, 4);               // thigh
            S.ell('feet', [10, 3.6, s * 15], [14, 4.2, 7.4], dark, 2.5);
            claws(23, s * 15, 3);
            // little arms folded up against the chest
            S.piece(s < 0 ? 'armL' : 'armR');
            S.path('arms', [[17, 44, s * 11, 3.6], [24, 41, s * 11.5, 2.8], [29, 47, s * 10, 2.2]], dark, 2);
          });
          tail(-22, 0, 14, 62 * L);
          var hr = 15 * hs, hx = 27, hy = 74;
          S.piece('head');
          S.ell('head', [hx, hy, 0], [hr * 1.15, hr * 0.78, hr * 0.8], col, 7);
          S.ell('head', [hx + hr * 1.05, hy - hr * 0.04, 0], [hr * 0.95, hr * 0.42, hr * 0.56], col, 4);   // upper snout
          S.ell('jaw', [hx + hr * 0.8, hy - hr * 0.58, 0], [hr * 1.05, hr * 0.26, hr * 0.5], belly, 2); // lower jaw
          [-1, 1].forEach(function (s) {
            S.path('head', [[hx + hr * 0.1, hy + hr * 0.72, s * hr * 0.42, 2.8], [hx + hr * 0.5, hy + hr * 0.62, s * hr * 0.38, 2]], col, 2);
            S.path(null, [[hx + hr * 1.9, hy - hr * 0.32, s * hr * 0.42, 0.9], [hx + hr * 0.3, hy - hr * 0.3, s * hr * 0.78, 1]], null, 0).carve(0.8); // mouth line   // brow ridge
            for (var t = 0; t < 4; t++) { var tx = hx + hr * (0.8 + t * 0.26); S.path('teeth', [[tx, hy - hr * 0.5, s * hr * 0.52, 1.5 * c], [tx, hy - hr * 0.24, s * hr * 0.5, 0.6]], claw, 0.3); }
          });
          eyeO = hy + hr * 0.3; eyeZ = hr * 0.5; eyeY = hx; nostril = [hy + hr * 0.12, hr * 0.2];
        } else {
          var bl = (sp === 1 ? 36 : 32) * L, bh = sp === 1 ? 23 : 22;
          S.piece('torso');
          S.ell('body', [0, bh * 0.82, 0], [bl, bh, sp === 1 ? 17 : 19], col, 5);
          S.paint('belly', [0, 3, 0], [bl * 0.9, 9, 19], belly);
          [-1, 1].forEach(function (s) {
            [[bl * 0.5, 6.4], [-bl * 0.55, 7.6]].forEach(function (q, qi) {
              S.piece((qi ? 'hind' : 'front') + (s < 0 ? 'L' : 'R'));
              S.path('body', [[q[0], 22, s * 14, q[1] + 2], [q[0], 9, s * 16, q[1]], [q[0] + 0.5, 3, s * 16, q[1] * 0.96]], col, 4);
              claws(q[0] + q[1] * 0.75, s * 16, 3);
            });
          });
          tail(-bl * 0.8, 0, 12, 56 * L);
          if (sp === 1) { // Stegosaurus: low head, plates along the back, spikes on the tail
            S.piece('neck');
            S.path('body', [[bl * 0.6, 8, 0, 12.5], [bl + 14, 5.4, 0, 8.4], [bl + 32, 4.2, 0, 6.5]], col, 6);
            S.piece('head', 'neck');
            S.ell('head', [bl + 40, 7.2, 0], [13 * hs, 8 * hs, 8 * hs], col, 3.5);
            eyeO = 9.5 * hs; eyeZ = 5 * hs; eyeY = bl + 42; nostril = [7 * hs, 2];
            S.piece('plates');
            var n = 7;
            for (i = 0; i < n; i++) {
              var u = i / (n - 1), px = lerp(bl * 0.62, -bl * 0.95, u), ht = (10 + 13 * Math.sin(Math.PI * u)) * c, w = (6 + 3 * Math.sin(Math.PI * u)) * c, q = 1 - (px * px) / (bl * bl), by = bh * 0.75 + bh * Math.sqrt(Math.max(q, 0.02)) - 4;
              S.plate('plates', [[-w, by], [w, by], [w * 0.5, by + ht * 0.62], [0, by + ht], [-w * 0.6, by + ht * 0.62]], [px, 0, i % 2 ? 2 : -2], [1, 0, 0], 3, '#fb7185', 1.5, 1);
            }
            S.piece('spikes');
            [-1, 1].forEach(function (s) {
              for (var si = 0; si < 2; si++) {
                var sx = -bl * 0.8 - (34 + si * 14) * L;
                S.path('spikes', [[sx, 4, s * 2, 3], [sx - 3, 4 + 8 * c, s * 7, 1.6], [sx - 5, 4 + 16 * c, s * 11, 0.5]], claw, 1);
              }
            });
          } else { // Triceratops: big head, tall frill and three horns
            var hR = 14 * hs, hX = bl + 13;
            S.piece('head');
            S.ell('head', [hX, hR * 0.72, 0], [hR * 1.3, hR * 0.85, hR * 0.95], col, 6);
            S.ell('beak', [hX + hR * 1.32, hR * 0.5, 0], [hR * 0.5, hR * 0.5, hR * 0.46], '#fde68a', 2.5);
            var fw = 21 * hs * (0.7 + 0.3 * c), fh = 34 * hs * (0.7 + 0.3 * c), fpoly = [[-fw * 0.7, hR * 0.6], [fw * 0.7, hR * 0.6]], fN = 12;
            for (i = 0; i <= fN; i++) { var aa = (Math.PI * i) / fN; fpoly.push([Math.cos(aa) * fw * (1 + 0.06 * Math.cos(aa * 12)), hR * 1.1 + Math.sin(aa) * fh * 0.72 * (1 + 0.05 * Math.cos(aa * 12))]); }
            S.piece('frill', 'head');
            S.plate('frill', fpoly, [hX - hR * 0.4, 0, 0], [0, 0, 1], 4, '#fb7185', 3, 1.6);
            S.piece('horns', 'head');
            [-1, 1].forEach(function (s) {
              var hb = [hX + hR * 0.42, hR * 1.2, s * hR * 0.46];
              S.path('horns', [[hb[0], hb[1], hb[2], 3.8], [hb[0] + 6 * c, hb[1] + 9 * c, hb[2], 2.6], [hb[0] + 12 * c, hb[1] + 19 * c, hb[2], 0.6]], claw, 1.5);
            });
            var nb = [hX + hR * 1.15, hR * 0.95, 0];
            S.path('horns', [[nb[0], nb[1], 0, 3], [nb[0] + 3, nb[1] + 5 * c, 0, 2], [nb[0] + 5, nb[1] + 11 * c, 0, 0.5]], claw, 1.2);
            eyeO = hR * 1.0; eyeZ = hR * 0.56; eyeY = hX + hR * 0.5; nostril = null;
          }
        }
        S.reach = 0.72;
        S.run();
        [-1, 1].forEach(function (s) {
          var cx = sp === 0 ? 150 : eyeY + 90, id = s < 0 ? 'eyeL' : 'eyeR', e = S.face(id, [cx, eyeO, s * eyeZ], [-1, 0, 0], 'head');
          if (nostril) { var ns = S.face(s < 0 ? 'nostrilL' : 'nostrilR', [cx, nostril[0], s * nostril[1]], [-1, 0, 0], 'head'); if (ns) { sc.add('pupils', 'b', dome(ns.p, ns.n, 1.1 * ns.k), '#1e293b'); S.addon(s < 0 ? 'nostrilL' : 'nostrilR', ns.p, 1.1 * ns.k); } }
          if (!e) return;
          var R = (sp === 0 ? 3.4 : 2.7) * hs * e.k;
          S.addon(id, e.p, R);
          sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 48 }), '#fef08a');
          var pid = s < 0 ? 'pupilL' : 'pupilR', pu = S.sub(pid, id, vadd(e.p, vmul(e.n, R * 0.3)), R * 0.5);
          if (pu) sc.add('pupils', 'b', dome(pu.p, e.n, R * 0.5 * pu.k, { sink: 0.6 }), '#1e293b');
        });
        S.addTo(sc);
        return finishSculpt(sc, 1, S);
      }

      var DINO_PARAMS = [
        { group: 'Dino', key: 'species', label: 'Species', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['T-rex', 'Stegosaurus', 'Triceratops'] },
        { group: 'Dino', key: 'bodyLen', label: 'Body and tail length', unit: '%', min: 80, max: 125, step: 1, value: 100 },
        { group: 'Dino', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Dino', key: 'crest', label: 'Teeth, plates, horns and frill size', unit: '×', min: 0.7, max: 1.35, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-076',
        category: 'ANIMALS // DINOSAURS',
        title: 'Dino Builder',
        fileName: 'Dino',
        defaultColor: '#86efac',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly', feet: 'Feet', claws: 'Claws', arms: 'Arms', head: 'Head', eyes: 'Eyes', pupils: 'Pupils', teeth: 'Teeth', tail: 'Tail', plates: 'Back plates', spikes: 'Tail spikes', beak: 'Beak', frill: 'Frill', horns: 'Horns' },
        parameters: DINO_PARAMS,
        presets: makePresets(DINO_PARAMS, [
          ['Default T-rex', {}],
          ['Big-head T-rex', { headSize: 1.2, crest: 1.2 }],
          ['Stegosaurus', { species: 1 }],
          ['Spiky Stegosaurus', { species: 1, crest: 1.35, bodyLen: 115 }],
          ['Triceratops', { species: 2 }],
          ['Baby Triceratops', { species: 2, headSize: 1.25, bodyLen: 85, crest: 0.75 }]
        ]),
        sculpt: sculptModule([
          { id: 'neck', label: 'Neck', section: 'Head' }, { id: 'head', label: 'Head', section: 'Head' }, { id: 'frill', label: 'Frill', section: 'Head' }, { id: 'horns', label: 'Horns', section: 'Head' }, { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' }, { id: 'nostrilL', label: 'Left nostril', section: 'Head' }, { id: 'nostrilR', label: 'Right nostril', section: 'Head' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'plates', label: 'Back plates', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' }, { id: 'spikes', label: 'Tail spikes', section: 'Body' },
          { id: 'armL', label: 'Left arm', section: 'Limbs' }, { id: 'armR', label: 'Right arm', section: 'Limbs' }, { id: 'frontL', label: 'Left front leg', section: 'Limbs' }, { id: 'frontR', label: 'Right front leg', section: 'Limbs' }, { id: 'hindL', label: 'Left hind leg', section: 'Limbs' }, { id: 'hindR', label: 'Right hind leg', section: 'Limbs' }
        ]),
        build: buildDino
      };
