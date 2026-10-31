      // -----------------------------------------------------------------------
      // Dino Builder: chunky T-rex, Stegosaurus or Triceratops
      // -----------------------------------------------------------------------
      function diamond(w, h) { return [[-w, 0], [-w * 0.55, h * 0.8], [0, h], [w * 0.55, h * 0.8], [w, 0], [0, -h * 0.3]]; }

      function buildDino(p) {
        var sc = new Scene(), sp = Math.round(p.species), i, c = p.crest, hs = p.headSize, L = p.bodyLen / 60;
        var col = ['#86efac', '#fdba74', '#93c5fd'][sp], belly = '#fef3c7', dark = '#34d399';
        if (sp === 0) { // T-rex: sits upright on its tail
          bellyBall(sc, 'body', 'b', 0, 0, 22, 19, 24, col);
          ball(sc, 'body', 'b', [4, 34, 0], 22, 15, 14.5, col, { dir: tilt(80) });
          ball(sc, 'belly', 'b', [10, 28, 0], 18, 10, 11, belly, { dir: tilt(86) });
          for (i = -1; i <= 1; i += 2) {
            bellyBall(sc, 'feet', 'b', 14, i * 11, 8.5, 5.2, 5.5, dark);
            post(sc, 'body', 'b', 8, i * 11, 6.5, 5.5, 20, col);
            spike(sc, 'arms', 'b', [16, 34, i * 10], vnorm([0.25, -1, i * 0.2]), 2.6, 8, dark, 3);
          }
          var hr = 13 * hs, hx = 15, hy = 62;
          bellyBall(sc, 'body', 'b', 14, 0, 17, 11.5, 36, col, { sq: 2.4 });                       // neck column, carries the head
          ball(sc, 'head', 'h', [hx, hy, 0], hr * 1.05, hr * 0.85, hr * 0.85, col);
          ball(sc, 'head', 'h', [hx + hr * 0.85, hy - hr * 0.25, 0], hr * 0.55, hr * 0.62, hr * 0.5, col, { dir: tilt(-12) }); // snout
          ball(sc, 'head', 'h', [hx + hr * 0.4, hy - hr * 0.8, 0], hr * 0.85, hr * 0.8, hr * 0.55, belly, { dir: [0, 1, 0] }); // chin and throat
          for (i = -1; i <= 1; i += 2) {
            eyeAt(sc, 'face', 'h', [hx + hr * 0.7, hy + hr * 0.35, i * hr * 0.55], 2.3, EYE);
            for (var tt = 0; tt < 3; tt++) spike(sc, 'teeth', 'h', [hx + hr * (0.7 + tt * 0.22), hy - hr * 0.58, i * hr * 0.38], [0.1, -1, 0], 1.1, 3 * c, '#f8fafc', 1.5, 6);
          }
          tubeAdd(sc, 'tail', 'b', [[-18, 8, 0], [-34 * L, 6, 6], [-56 * L, 4, 3], [-78 * L, 3, 0]], function (t) { return 9.5 - 7 * t; }, col, { ground: true, per: 8 });
        } else if (sp === 1) { // Stegosaurus
          var bl = 30 * L;
          bellyBall(sc, 'body', 'b', 0, 0, bl, 17, 22, col);
          for (i = -1; i <= 1; i += 2) {
            post(sc, 'body', 'b', bl * 0.55, i * 14, 6.6, 5.8, 16, col); post(sc, 'body', 'b', -bl * 0.58, i * 14, 7, 6, 16, col);
            bellyBall(sc, 'feet', 'b', bl * 0.55 + 2, i * 14, 7.4, 6, 3.4, dark); bellyBall(sc, 'feet', 'b', -bl * 0.58 + 2, i * 14, 7.8, 6, 3.4, dark);
          }
          bellyBall(sc, 'body', 'b', bl + 5, 0, 12, 10, 11, col);                  // neck
          bellyBall(sc, 'head', 'h', bl + 17, 0, 8.5 * hs, 6.2 * hs, 6.6 * hs, col);
          for (i = -1; i <= 1; i += 2) eyeAt(sc, 'face', 'h', [bl + 19, 8, i * 4.6 * hs], 1.6, EYE);
          for (i = 0; i < 7; i++) {
            var u = i / 6, px = lerp(bl * 0.55, -bl * 0.85, u), hh = (8 + 10 * Math.sin(Math.PI * u)) * c, ty = 22 * (1 - Math.pow(Math.abs(px) / (bl * 1.05), 2.2)) + 14;
            sc.add('plates', 'pl' + i, plate(diamond(5.5 * (0.8 + 0.4 * c), hh), [px, Math.max(ty - hh * 0.45, 10), -1.7], 0, 1, 3.4, 0.8), '#fb7185');
          }
          tubeAdd(sc, 'tail', 'b', [[-bl + 4, 9, 0], [-bl - 16 * L, 5, 4], [-bl - 36 * L, 3, 2], [-bl - 52 * L, 2.5, 0]], function (t) { return 8 - 5.2 * t; }, col, { ground: true, per: 8 });
          for (i = -1; i <= 1; i += 2) for (var sI = 0; sI < 2; sI++) spike(sc, 'spikes', 'b', [-bl - (30 + 14 * sI) * L, 4.5, i * 2], vnorm([-0.35, 1, i * 0.25]), 2.8, 13 * c, '#f1f5f9', 3);
        } else { // Triceratops
          var tl = 28 * L;
          bellyBall(sc, 'body', 'b', 0, 0, tl, 19, 23, col);
          for (i = -1; i <= 1; i += 2) {
            post(sc, 'body', 'b', tl * 0.55, i * 15, 6.8, 6, 15, col); post(sc, 'body', 'b', -tl * 0.5, i * 15, 7, 6, 15, col);
            bellyBall(sc, 'feet', 'b', tl * 0.55 + 2, i * 15, 7.6, 6.2, 3.4, dark); bellyBall(sc, 'feet', 'b', -tl * 0.5 + 2, i * 15, 7.8, 6.2, 3.4, dark);
          }
          var hr3 = 12 * hs, hx3 = tl + 6;
          bellyBall(sc, 'head', 'h', hx3 + 4, 0, hr3 * 1.5, hr3 * 0.85, hr3 * 1.05, col);
          bellyBall(sc, 'beak', 'h', hx3 + hr3 * 1.7, 0, hr3 * 0.6, hr3 * 0.5, hr3 * 0.55, '#fde68a');
          // frill: a tall plate behind the head
          var fw = 17 * hs * (0.8 + 0.4 * c), fh = 22 * hs * (0.8 + 0.4 * c), fp = [[-fw, 0], [fw, 0]];
          for (i = 0; i <= 18; i++) { var aa = Math.PI * i / 18; fp.push([Math.cos(aa) * fw, 8 + Math.sin(aa) * fh]); }
          sc.add('frill', 'f', plate(fp, [hx3 - hr3 * 0.3, 0, -2.5], Math.PI / 2, 5, 1, 1.2), '#fb7185');
          for (i = -1; i <= 1; i += 2) {
            spike(sc, 'horns', 'h', [hx3 + hr3 * 1.05, hr3 * 0.95, i * hr3 * 0.5], vnorm([0.55, 1, i * 0.12]), 2.8, 15 * c, '#f8fafc', 3);
            eyeAt(sc, 'face', 'h', [hx3 + hr3 * 1.05, hr3 * 0.62, i * hr3 * 0.72], 1.8, EYE);
          }
          spike(sc, 'horns', 'h', [hx3 + hr3 * 2.0, hr3 * 0.6, 0], vnorm([0.4, 1, 0]), 2.8, 9 * c, '#f8fafc', 3);
          tubeAdd(sc, 'tail', 'b', [[-tl + 4, 9, 0], [-tl - 16 * L, 5, -4], [-tl - 32 * L, 3, 0]], function (t) { return 8 - 5.2 * t; }, col, { ground: true, per: 8 });
        }
        return finish(sc);
      }

      var DINO_PARAMS = [
        { group: 'Dino', key: 'species', label: 'Species', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['T-rex', 'Stegosaurus', 'Triceratops'] },
        { group: 'Dino', key: 'bodyLen', label: 'Body and tail length', unit: '%', min: 70, max: 130, step: 1, value: 100 },
        { group: 'Dino', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1 },
        { group: 'Dino', key: 'crest', label: 'Teeth, plates, horns and frill size', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-076',
        category: 'ANIMALS // DINOSAURS',
        title: 'Dino Builder',
        fileName: 'Dino',
        defaultColor: '#86efac',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly', feet: 'Feet', arms: 'Arms', head: 'Head', face: 'Eyes', teeth: 'Teeth', tail: 'Tail', plates: 'Back plates', spikes: 'Tail spikes', beak: 'Beak', frill: 'Frill', horns: 'Horns' },
        parameters: DINO_PARAMS,
        presets: makePresets(DINO_PARAMS, [
          ['Default T-rex', {}],
          ['Big-head T-rex', { headSize: 1.2, crest: 1.2 }],
          ['Stegosaurus', { species: 1 }],
          ['Spiky Stegosaurus', { species: 1, crest: 1.5, bodyLen: 115 }],
          ['Triceratops', { species: 2 }],
          ['Baby Triceratops', { species: 2, headSize: 1.35, bodyLen: 80, crest: 0.7 }]
        ]),
        build: buildDino
      };
