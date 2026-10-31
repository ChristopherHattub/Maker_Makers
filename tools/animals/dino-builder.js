      // -----------------------------------------------------------------------
      // Dino Builder: T-rex, Stegosaurus or Triceratops sculpted as one seamless surface, each with its own sliders
      // -----------------------------------------------------------------------
      function buildDino(p, api) {
        var sc = new Scene(), S = new Sculpt(1.25).useEdits(api), sp = Math.round(p.species), hs = p.headSize, L = p.bodyLen / 100, i;
        var col = ['#7fb069', '#d9a441', '#6f9fc8'][sp], belly = '#efe6c8', dark = ['#4f7a3f', '#a8742a', '#46749c'][sp], claw = '#ede9d8';
        var eye;
        function claws(x, z, n) { for (var q = 0; q < n; q++) S.ell('claws', [x + 1, 2.2, z + (q - (n - 1) / 2) * 3.6], [3, 2.3, 1.8], claw, 0.8); }
        function tail(x, r, len) {
          S.piece('tail');
          S.path('tail', [[x, r * 0.72, 0, r], [x - len * 0.35, r * 0.54, 4, r * 0.74], [x - len * 0.7, r * 0.4, 3, r * 0.44], [x - len, 1.2, -2, 1.7]], col, 5);
        }
        if (sp === 0) { // T-rex: weight back over big thighs, tail on the bed, huge skull held forward
          var B = p.rexBulk, G = p.rexLeg, hx = 26 + p.rexLean * 8, hy = 76 - p.rexLean * 6, hr = 15 * hs, sl = hr * (1.25 + p.rexSnout * 0.7), jd = p.rexJaw;
          S.piece('torso');
          S.path('body', [[-10, 26, 0, 19 * B], [8, 36, 0, 17.5 * B], [hx - 12, hy - 22, 0, 12.5 * B], [hx - 5, hy - 7, 0, 10.5]], col, 8);
          for (i = 0; i <= 4; i++) { var bu = i / 4; S.paint('belly', [lerp(16, hx - 2, bu), lerp(22, hy - 12, bu), 0], [14 - 4 * bu, 13, 11 * B - 4 * bu], belly); }
          [-1, 1].forEach(function (s) {
            var z = s * 15 * B;
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-9, 23, z], [16 * G, 21, 9 * G], col, 4);
            S.path('body', [[-7, 13, z, 7.5 * G], [3, 7, z, 5.2 * G], [4, 3.4, z, 4.6 * G]], col, 3);
            S.ell('feet', [11, 3, z], [11, 3.4, 6.2 * G], dark, 2);
            for (var t = -1; t <= 1; t++) {
              S.path('feet', [[13, 2.6, z + t * 3.2 * G, 2.4], [20, 2, z + t * 4.2 * G, 1.9]], dark, 1);
              S.ell('claws', [22.5, 1.7, z + t * 4.3 * G], [2.6, 1.9, 1.4], claw, 0.5);
            }
            // tiny arms, tucked up and forward
            var A = p.rexArm, ax = hx - 10, ay = hy - 26;
            S.piece(s < 0 ? 'armL' : 'armR');
            S.path('arms', [[ax - 3, ay, s * 9.5 * B, 3.4], [ax + 3 * A, ay - 3 * A, s * 11 * B, 2.4], [ax + 8 * A, ay + 1, s * 10 * B, 1.8]], col, 1.5);
            S.path('claws', [[ax + 8 * A, ay + 1, s * 10.5 * B, 1], [ax + 11 * A, ay + 3.4, s * 10.5 * B, 0.5]], claw, 0.4);
          });
          tail(-22, 14 * p.rexTail, 70 * L);
          S.piece('head');
          S.ell('head', [hx, hy, 0], [hr * 1.05, hr * 0.72, hr * 0.74], col, 7);                                 // skull
          S.path('head', [[hx + hr * 0.3, hy + hr * 0.04, 0, hr * 0.6], [hx + sl * 0.62, hy - hr * 0.02, 0, hr * 0.46], [hx + sl, hy - hr * 0.1, 0, hr * 0.34]], col, 4); // deep snout
          S.ell('head', [hx + sl * 0.98, hy + hr * 0.1, 0], [hr * 0.26, hr * 0.2, hr * 0.28], col, 2);            // nose hump
          S.piece('jaw', 'head');
          S.path('jaw', [[hx - hr * 0.3, hy - hr * 0.42, 0, hr * 0.44 * jd], [hx + sl * 0.55, hy - hr * 0.56 * jd, 0, hr * 0.28 * jd], [hx + sl * 0.92, hy - hr * 0.54 * jd, 0, hr * 0.2 * jd]], belly, 2);
          [-1, 1].forEach(function (s) {
            S.piece('head');
            S.path('head', [[hx - hr * 0.5, hy + hr * 0.58, s * hr * 0.46, 2.6 + p.rexBrow], [hx + hr * 0.1, hy + hr * 0.55, s * hr * 0.54, 2.4 + p.rexBrow], [hx + hr * 0.5, hy + hr * 0.36, s * hr * 0.46, 1.6]], col, 1.6); // heavy brow
            S.path(null, [[hx + sl * 1.12, hy - hr * 0.3, s * hr * 0.26, 0.8], [hx + sl * 0.5, hy - hr * 0.3, s * hr * 0.5, 0.9], [hx - hr * 0.5, hy - hr * 0.22, s * hr * 0.74, 1]], null, 0).carve(0.6); // mouth line
            S.piece('teeth', 'jaw');
            var T = Math.round(p.rexTeeth);
            for (var q = 0; q < T; q++) { var tx = hx + lerp(hr * 0.2, sl * 0.92, q / Math.max(T - 1, 1)); S.path('teeth', [[tx, hy - hr * 0.42, s * lerp(hr * 0.5, hr * 0.28, q / Math.max(T - 1, 1)), 1.2], [tx, hy - hr * 0.2, s * lerp(hr * 0.5, hr * 0.28, q / Math.max(T - 1, 1)), 0.4]], claw, 0.25); }
          });
          eye = { y: hy + hr * 0.32, z: hr * 0.6, x: hx + hr * 0.12, r: 2.3 * hs, iris: '#d97706', slit: 0, side: true };
        } else if (sp === 1) { // Stegosaurus: high hips, tiny low head, plates and tail spikes
          var bl = 36 * L, hump = p.stegHump, sw = 16 * p.stegBulk, G2 = p.stegLeg;
          S.piece('torso');
          S.ell('body', [-bl * 0.12, 20 * hump, 0], [bl * 0.92, 24 * hump, sw], col, 6);
          S.ell('body', [bl * 0.5, 15, 0], [bl * 0.56, 15, sw * 0.86], col, 8);
          S.paint('belly', [0, 3, 0], [bl * 0.9, 8, sw], belly);
          [-1, 1].forEach(function (s) {
            [[bl * 0.56, 5.6, 16], [-bl * 0.5, 8, 24 * hump]].forEach(function (q, qi) {
              S.piece((qi ? 'hind' : 'front') + (s < 0 ? 'L' : 'R'));
              S.path('body', [[q[0], q[2], s * sw * 0.72, (q[1] + 2.6) * G2], [q[0], 9, s * (sw * 0.86), q[1] * G2], [q[0] + 0.5, 3, s * (sw * 0.86), q[1] * 0.96 * G2]], col, 4);
              claws(q[0] + q[1] * 0.72 * G2, s * sw * 0.86, 3);
            });
          });
          tail(-bl * 0.8, 12, 56 * L);
          var nk = p.stegNeck;
          S.piece('neck');
          S.path('body', [[bl * 0.72, 9, 0, 11.5], [bl + 14 * nk, 5.4, 0, 7.4], [bl + 28 * nk, 4.4, 0, 5.6]], col, 6);
          var hX = bl + 28 * nk + 9 * hs;
          S.piece('head', 'neck');
          S.ell('head', [hX, 6.6 * hs, 0], [11 * hs, 6.8 * hs, 6.6 * hs], col, 3.5);
          S.ell('head', [hX + 9 * hs, 4.8 * hs, 0], [6 * hs, 4.4 * hs, 4.6 * hs], col, 2.5);
          [-1, 1].forEach(function (s) { S.path('head', [[hX - 4 * hs, 11 * hs, s * 3.6 * hs, 1.5], [hX + 3 * hs, 10 * hs, s * 4.2 * hs, 1.1]], col, 1); });
          S.piece('plates');
          var n = Math.round(p.stegPlates), PS = p.stegPlateSize;
          for (i = 0; i < n; i++) {
            var u = n > 1 ? i / (n - 1) : 0.5, px = lerp(bl * 0.7, -bl * 1.05, u), ht = (9 + 15 * Math.sin(Math.PI * Math.min(u * 1.1, 1))) * PS, w = (5.5 + 3.5 * Math.sin(Math.PI * u)) * PS, q2 = 1 - Math.pow((px + bl * 0.12) / (bl * 0.92), 2), by = 20 * hump + 24 * hump * Math.sqrt(Math.max(q2, 0.02)) - 5;
            var poly = Math.round(p.stegPlateShape) === 0 ? [[-w, by], [w, by], [w * 0.62, by + ht * 0.55], [0, by + ht], [-w * 0.62, by + ht * 0.55]] : [[-w * 0.8, by], [w * 0.8, by], [w, by + ht * 0.4], [w * 0.6, by + ht * 0.82], [0, by + ht], [-w * 0.6, by + ht * 0.82], [-w, by + ht * 0.4]];
            S.plate('plates', poly, [px, 0, i % 2 ? 2.4 : -2.4], [1, 0, 0], 3, dark, 1.6, 1.3);
          }
          S.piece('spikes');
          var sc2 = Math.round(p.stegSpikes), SL = p.stegSpikeLen;
          for (i = 0; i < sc2; i++) {
            var sd = i % 2 ? 1 : -1, tt = (Math.floor(i / 2) + 0.5) / Math.ceil(sc2 / 2), sx = -bl * 0.8 - lerp(30, 52, tt) * L;
            S.path('spikes', [[sx, 3.5, sd * 2, 2.8], [sx - 3, 3.5 + 9 * SL, sd * 8 * SL, 1.6], [sx - 5, 3.5 + 18 * SL, sd * 13 * SL, 0.5]], claw, 1);
          }
          eye = { y: 8.6 * hs, z: 4.6 * hs, x: hX + 1 * hs, r: 1.7 * hs, iris: '#3f2a14', slit: 0, side: true };
        } else { // Triceratops: heavy head, tall frill and three horns
          var tl = 33 * L, tb = p.triBulk, G3 = p.triLeg;
          S.piece('torso');
          S.ell('body', [0, 19 * tb, 0], [tl, 23 * tb, 20 * tb], col, 6);
          S.paint('belly', [0, 3, 0], [tl * 0.9, 8, 20 * tb], belly);
          [-1, 1].forEach(function (s) {
            [[tl * 0.52, 7, 18], [-tl * 0.52, 8.4, 20]].forEach(function (q, qi) {
              S.piece((qi ? 'hind' : 'front') + (s < 0 ? 'L' : 'R'));
              S.path('body', [[q[0], q[2], s * 15 * tb, (q[1] + 2.6) * G3], [q[0], 9, s * 17 * tb, q[1] * G3], [q[0] + 0.5, 3, s * 17 * tb, q[1] * 0.96 * G3]], col, 4);
              claws(q[0] + q[1] * 0.72 * G3, s * 17 * tb, 3);
            });
          });
          tail(-tl * 0.82, 12.5, 40 * p.triTail);
          var hR = 15 * hs, hX2 = tl + 13 * hs;
          S.piece('head');
          S.ell('head', [hX2, hR * 0.72, 0], [hR * 1.32, hR * 0.84, hR * 0.92], col, 7);
          S.ell('head', [hX2 + hR * 1.0, hR * 0.5, 0], [hR * 0.72, hR * 0.5, hR * 0.56], col, 3);
          S.piece('beak', 'head');
          S.path('beak', [[hX2 + hR * 1.4, hR * 0.62, 0, hR * 0.38], [hX2 + hR * 1.82 * p.triBeak, hR * 0.32, 0, hR * 0.18]], '#c9b78a', 1.6);
          [-1, 1].forEach(function (s) { S.piece('head'); S.path('head', [[hX2 + hR * 0.1, hR * 1.2, s * hR * 0.5, 2.2], [hX2 + hR * 0.62, hR * 1.1, s * hR * 0.52, 1.4]], col, 1.2); });
          var FS = p.triFrill, fw = 22 * hs * FS, fh = 25 * hs * FS, fN = 16, cut = 0.05 + p.triScallop * 0.09, fpoly = [[-fw * 0.62, hR * 0.5], [fw * 0.62, hR * 0.5]];
          for (i = 0; i <= fN; i++) { var aa = (Math.PI * i) / fN, sc3 = 1 + cut * Math.cos(aa * 14); fpoly.push([Math.cos(aa) * fw * sc3, hR * 1.1 + Math.sin(aa) * fh * sc3]); }
          S.piece('frill', 'head');
          S.plate('frill', fpoly, [hX2 - hR * 0.5, 0, 0], [0, 0, 1], 4, dark, 3, 1.8);
          S.piece('horns', 'head');
          [-1, 1].forEach(function (s) {
            var hb = [hX2 + hR * 0.42, hR * 1.2, s * hR * 0.46], c = p.triBrow;
            S.path('horns', [[hb[0], hb[1], hb[2], 3.9], [hb[0] + 7 * c, hb[1] + 9 * c, hb[2], 2.7], [hb[0] + 15 * c, hb[1] + 20 * c, hb[2], 0.6]], claw, 1.5);
          });
          var nb = [hX2 + hR * 1.2, hR * 0.92, 0];
          S.path('horns', [[nb[0], nb[1], 0, 3], [nb[0] + 2.4 * p.triNose, nb[1] + 5 * p.triNose, 0, 2], [nb[0] + 3.4 * p.triNose, nb[1] + 12 * p.triNose, 0, 0.5]], claw, 1.2);
          eye = { y: hR * 0.92, z: hR * 0.6, x: hX2 + hR * 0.36, r: 2.2 * hs, iris: '#92400e', slit: 0, side: true };
        }
        S.reach = sp === 0 ? 0.98 : 0.8;
        S.smoothing = 8;
        S.run();
        [-1, 1].forEach(function (s) {
          reptileEye(sc, S, s < 0 ? 'eyeL' : 'eyeR', s < 0 ? 'pupilL' : 'pupilR', [eye.x, eye.y, s * 80], [0, 0, -s], 'head', eye.r * p.eyeSize, eye.iris, eye.slit);
        });
        S.addTo(sc);
        return finishSculpt(sc, 1, S);
      }

      function isRex(q) { return Math.round(q.species) === 0; }
      function isSteg(q) { return Math.round(q.species) === 1; }
      function isTri(q) { return Math.round(q.species) === 2; }
      var DINO_PARAMS = [
        { group: 'Dino', key: 'species', label: 'Species', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['T-rex', 'Stegosaurus', 'Triceratops'] },
        { group: 'Dino', key: 'bodyLen', label: 'Body and tail length', unit: '%', min: 80, max: 125, step: 1, value: 100 },
        { group: 'Dino', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Dino', key: 'eyeSize', label: 'Eye size', unit: '×', min: 0.7, max: 1.5, step: 0.05, value: 1 },
        { group: 'T-rex', key: 'rexBulk', label: 'Body (lean ↔ heavy)', unit: '×', min: 0.85, max: 1.2, step: 0.05, value: 1, showIf: isRex },
        { group: 'T-rex', key: 'rexLean', label: 'Lean (upright ↔ forward)', unit: '×', min: 0, max: 1, step: 0.05, value: 0.6, showIf: isRex },
        { group: 'T-rex', key: 'rexLeg', label: 'Leg thickness', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1, showIf: isRex },
        { group: 'T-rex', key: 'rexArm', label: 'Arm length', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1, showIf: isRex },
        { group: 'T-rex', key: 'rexTail', label: 'Tail thickness', unit: '×', min: 0.8, max: 1.25, step: 0.05, value: 1, showIf: isRex },
        { group: 'T-rex', key: 'rexSnout', label: 'Snout (short ↔ long)', unit: '×', min: 0, max: 1, step: 0.05, value: 0.5, showIf: isRex },
        { group: 'T-rex', key: 'rexJaw', label: 'Jaw depth', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1, showIf: isRex },
        { group: 'T-rex', key: 'rexBrow', label: 'Brow ridge', unit: ' mm', min: 0, max: 2.5, step: 0.25, value: 1, showIf: isRex },
        { group: 'T-rex', key: 'rexTeeth', label: 'Teeth per side', unit: '', min: 0, max: 9, step: 1, value: 6, slider: true, showIf: isRex },
        { group: 'Stegosaurus', key: 'stegBulk', label: 'Body width', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1, showIf: isSteg },
        { group: 'Stegosaurus', key: 'stegHump', label: 'Back height', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1, showIf: isSteg },
        { group: 'Stegosaurus', key: 'stegNeck', label: 'Neck length', unit: '×', min: 0.6, max: 1.3, step: 0.05, value: 1, showIf: isSteg },
        { group: 'Stegosaurus', key: 'stegLeg', label: 'Leg thickness', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1, showIf: isSteg },
        { group: 'Stegosaurus', key: 'stegPlates', label: 'Back plates', unit: '', min: 3, max: 13, step: 1, value: 9, slider: true, showIf: isSteg },
        { group: 'Stegosaurus', key: 'stegPlateSize', label: 'Plate size', unit: '×', min: 0.7, max: 1.35, step: 0.05, value: 1, showIf: isSteg },
        { group: 'Stegosaurus', key: 'stegPlateShape', label: 'Plate shape', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Pointed', 'Rounded'], showIf: isSteg },
        { group: 'Stegosaurus', key: 'stegSpikes', label: 'Tail spikes', unit: '', min: 0, max: 6, step: 1, value: 4, slider: true, showIf: isSteg },
        { group: 'Stegosaurus', key: 'stegSpikeLen', label: 'Spike length', unit: '×', min: 0.6, max: 1.35, step: 0.05, value: 1, showIf: isSteg },
        { group: 'Triceratops', key: 'triBulk', label: 'Body size', unit: '×', min: 0.85, max: 1.2, step: 0.05, value: 1, showIf: isTri },
        { group: 'Triceratops', key: 'triLeg', label: 'Leg thickness', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1, showIf: isTri },
        { group: 'Triceratops', key: 'triTail', label: 'Tail length', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1, showIf: isTri },
        { group: 'Triceratops', key: 'triFrill', label: 'Frill size', unit: '×', min: 0.75, max: 1.3, step: 0.05, value: 1, showIf: isTri },
        { group: 'Triceratops', key: 'triScallop', label: 'Frill edge (smooth ↔ scalloped)', unit: '×', min: 0, max: 1, step: 0.05, value: 0.5, showIf: isTri },
        { group: 'Triceratops', key: 'triBrow', label: 'Brow horn length', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1, showIf: isTri },
        { group: 'Triceratops', key: 'triNose', label: 'Nose horn length', unit: '×', min: 0.5, max: 1.5, step: 0.05, value: 1, showIf: isTri },
        { group: 'Triceratops', key: 'triBeak', label: 'Beak length', unit: '×', min: 0.9, max: 1.15, step: 0.01, value: 1, showIf: isTri }
      ];

      window.MM_GENERATOR = {
        code: 'MM-076',
        category: 'ANIMALS // DINOSAURS',
        title: 'Dino Builder',
        fileName: 'Dino',
        defaultColor: '#7fb069',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly', feet: 'Feet', claws: 'Claws', arms: 'Arms', head: 'Head', jaw: 'Jaw', eyes: 'Eyes', pupils: 'Pupils', teeth: 'Teeth', tail: 'Tail', plates: 'Back plates', spikes: 'Tail spikes', beak: 'Beak', frill: 'Frill', horns: 'Horns' },
        parameters: DINO_PARAMS,
        presets: makePresets(DINO_PARAMS, [
          ['Default T-rex', {}],
          ['Big-head T-rex', { headSize: 1.1, rexJaw: 1.15, rexTeeth: 8, rexBrow: 2 }],
          ['Stegosaurus', { species: 1 }],
          ['Spiky Stegosaurus', { species: 1, stegSpikes: 6, stegSpikeLen: 1.35, stegPlates: 12, bodyLen: 115 }],
          ['Triceratops', { species: 2 }],
          ['Baby Triceratops', { species: 2, headSize: 1.25, bodyLen: 85, triFrill: 0.8, triBrow: 0.7, triNose: 0.7 }]
        ]),
        sculpt: sculptModule([
          { id: 'neck', label: 'Neck', section: 'Head' }, { id: 'head', label: 'Head', section: 'Head' }, { id: 'jaw', label: 'Jaw', section: 'Head', parent: 'head' }, { id: 'teeth', label: 'Teeth', section: 'Head', parent: 'jaw' }, { id: 'beak', label: 'Beak', section: 'Head', parent: 'head' }, { id: 'frill', label: 'Frill', section: 'Head' }, { id: 'horns', label: 'Horns', section: 'Head' },
          { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'plates', label: 'Back plates', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' }, { id: 'spikes', label: 'Tail spikes', section: 'Body' },
          { id: 'armL', label: 'Left arm', section: 'Limbs' }, { id: 'armR', label: 'Right arm', section: 'Limbs' }, { id: 'frontL', label: 'Left front leg', section: 'Limbs' }, { id: 'frontR', label: 'Right front leg', section: 'Limbs' }, { id: 'hindL', label: 'Left hind leg', section: 'Limbs' }, { id: 'hindR', label: 'Right hind leg', section: 'Limbs' }
        ]),
        build: buildDino
      };
