      // -----------------------------------------------------------------------
      // Dog Builder: a sitting dog sculpted as one seamless surface
      // -----------------------------------------------------------------------
      function buildDog(p, api) {
        var sc = new Scene(), S = new Sculpt(1.3).useEdits(api, p.size / 100), k = p.chunk, hs = p.headSize, fur = '#d9a066', hr = 14 * hs, ear = '#a9713f', white = '#f8fafc';
        var pose = Math.round(p.pose), hx = 8, hy = 62, tailPts;
        function paw(id, x, y, z) { S.ell('paws', [x, y, z], [7.5, 3.6, 5.2], white, 2); }
        S.piece('torso');
        if (pose === 0) { // sitting
          S.ell('body', [-8, 15, 0], [22 * k, 19, 19 * k], fur, 5);
          S.ell('body', [2, 36, 0], [14 * k, 21, 13.5 * k], fur, 8);
          S.paint('chest', [12, 36, 0], [13, 24, 10], white);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-12, 13, s * 14 * k], [15, 13, 8], fur, 3);
            S.ell('paws', [6, 3.3, s * 16 * k], [11, 3.8, 5.4], white, 2);
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('body', [[9, 36, s * 6.5 * k, 6], [13, 18, s * 6.6 * k, 5], [14, 5, s * 6.6 * k, 4.4]], fur, 2.5);
            paw('f', 18, 3.2, s * 6.6 * k);
          });
          tailPts = [[-27, 8, 0, 5], [-33, 16, 0, 4.2], [-37, 27, 0, 3.4], [-34, 37, 0, 2.2]];
        } else if (pose === 1) { // standing on all four legs, the belly arches between them
          S.ell('body', [-3, 36, 0], [29 * k, 15.5, 14.5 * k], fur, 5);
          S.ell('body', [16, 40, 0], [15, 16, 13 * k], fur, 8);
          S.path('body', [[20, 44, 0, 11], [27, 56, 0, 9]], fur, 6);
          S.paint('chest', [28, 38, 0], [13, 18, 10], white);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('body', [[17, 36, s * 8.5 * k, 7], [18, 18, s * 9 * k, 5], [18, 5, s * 9 * k, 4.4]], fur, 2.5);
            paw('f', 22, 3.2, s * 9 * k);
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-21, 32, s * 9 * k], [12, 14, 7], fur, 3);
            S.path('body', [[-23, 24, s * 9.5 * k, 6], [-27, 12, s * 9.5 * k, 4.6], [-24, 5, s * 9.5 * k, 4.2]], fur, 2.5);
            paw('h', -20, 3.2, s * 9.5 * k);
          });
          hx = 33; hy = 66;
          tailPts = [[-29, 42, 0, 4.6], [-37, 49, 0, 3.8], [-42, 58, 0, 3], [-41, 67, 0, 2]];
        } else if (pose === 2) { // lying down with the paws out in front
          S.ell('body', [-8, 14, 0], [28 * k, 16, 17 * k], fur, 5);
          S.ell('body', [12, 20, 0], [14, 20, 13 * k], fur, 8);
          S.paint('chest', [24, 18, 0], [11, 17, 10], white);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-22, 12, s * 15 * k], [14, 11, 7.5], fur, 3);
            S.ell('paws', [-4, 3.2, s * 19 * k], [10, 3.6, 5.2], white, 2);
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('body', [[16, 8, s * 9 * k, 6], [30, 4, s * 9 * k, 4.6], [38, 3.4, s * 9 * k, 4.2]], fur, 2.5);
            paw('f', 42, 3.2, s * 9 * k);
          });
          hx = 16; hy = 44;
          tailPts = [[-32, 5, 3, 4.6], [-42, 3.6, 10, 3.8], [-50, 2.8, 20, 3], [-48, 2, 30, 2.2]];
        } else { // begging: sitting tall with the front paws raised
          S.ell('body', [-8, 16, 0], [21 * k, 20, 18 * k], fur, 5);
          S.ell('body', [0, 42, 0], [13 * k, 23, 12.5 * k], fur, 8);
          S.path('body', [[3, 56, 0, 10.5], [7, 68, 0, 9.5]], fur, 6);
          S.paint('chest', [10, 40, 0], [11, 25, 9], white);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-10, 13, s * 14 * k], [15, 13, 8], fur, 3);
            S.ell('paws', [7, 3.3, s * 15 * k], [11, 3.8, 5.4], white, 2);
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('body', [[8, 46, s * 8 * k, 5.4], [14, 49, s * 9.5 * k, 4.4], [19, 56, s * 9 * k, 3.8]], fur, 2.5);
            S.ell('paws', [20, 59, s * 9 * k], [4.8, 4.2, 4.2], white, 1.5);
          });
          hx = 8; hy = 76;
          tailPts = [[-26, 5, 3, 4.6], [-36, 3.6, 8, 3.8], [-42, 2.8, 16, 3], [-41, 2, 25, 2.2]];
        }
        S.piece('head');
        S.ell('head', [hx, hy, 0], [hr, hr * 0.92, hr * 1.02], fur, 7);
        // muzzle: length from the slider, it always rests on the chest line so it never overhangs
        var ml = hr * (0.45 + 1.0 * p.snout), my = hy - hr * 0.3, mx = hx + hr * 0.62;
        S.piece('muzzle', 'head');
        S.path('muzzle', [[mx, my + 1, 0, hr * 0.5], [mx + ml * 0.55, my - 0.5, 0, hr * 0.44], [mx + ml, my - 1, 0, hr * 0.38]], white, 3);
        S.ell('muzzle', [mx + ml * 0.35, my - hr * 0.36, 0], [ml * 0.6 + 3, hr * 0.2, hr * 0.32], white, 2.5); // lower jaw
        S.path('mouth', [[mx + ml * 0.9, my - hr * 0.2, -hr * 0.34, 0.7], [mx + ml + hr * 0.28, my - hr * 0.2, 0, 0.8], [mx + ml * 0.9, my - hr * 0.2, hr * 0.34, 0.7]], null, 0, 3).carve(0.8);
        S.piece('head');
        S.paint('patch', [hx + hr * 0.5, hy + hr * 0.3, hr * 0.5], [hr * 0.55, hr * 0.5, hr * 0.42], ear);
        // ears
        var style = Math.round(p.ears), E = p.earSize * hs;
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'earL' : 'earR', 'head');
          if (style === 0) { // floppy: lies against the side of the head
            S.ell('ears', [hx - hr * 0.1, hy + hr * 0.42, s * hr * 0.92], [7 * E, 6 * E, 3.4], ear, 1.5);
            S.ell('ears', [hx - hr * 0.1, hy - hr * 0.1, s * hr * 1.0], [8 * E, 11 * E, 3.2], ear, 1.5);
          } else if (style === 1) { // pricked
            var ey = hy + hr * 0.5, W = 7.5 * E, H = 17 * E;
            S.plate('ears', [[-W, ey], [W, ey], [W * 0.1, ey + H], [-W * 0.3, ey + H * 0.9]], [hx - hr * 0.1, 0, s * hr * 0.6], [0, 0, s], 4, ear, 2.5, 1.4);
          } else { // small folded rose ear
            S.path('ears', [[hx - hr * 0.2, hy + hr * 0.62, s * hr * 0.55, 4 * E], [hx - hr * 0.02, hy + hr * 0.82, s * hr * 0.9, 3.4 * E], [hx + hr * 0.2, hy + hr * 0.62, s * hr * 1.06, 2.6 * E]], ear, 1.5, 4);
          }
        });
        // collar with a round tag, tail rising from the rump
        if (Math.round(p.collar) === 1) {
          S.piece('collar');
          var ring = [];
          for (var i = 0; i <= 28; i++) { var a = (i / 28) * TAU; ring.push([hx - 3 + Math.cos(a) * 11.5 * k, hy - hr * 0.86 - Math.cos(a) * 3, Math.sin(a) * 11.5 * k, 1.9]); }
          S.path('collar', ring, '#60a5fa', 0.8, 2);
          S.ell('tag', [hx - 3 + 13 * k, hy - hr * 0.86 - 7, 0], [1.6, 3.6, 3.6], '#fde047', 0.8);
        }
        var tl = p.tail;
        S.piece('tail');
        var t0 = tailPts[0];
        S.path('tail', tailPts.map(function (q) { return [t0[0] + (q[0] - t0[0]) * tl, t0[1] + (q[1] - t0[1]) * tl, t0[2] + (q[2] - t0[2]) * tl, q[3]]; }), fur, 3);
        S.reach = pose === 3 ? 0.95 : 0.72;
        S.run();
        var nose = S.face('nose', [hx + 80, my + hr * 0.12, 0], [-1, 0, 0], 'muzzle');
        if (nose) { sc.add('nose', 'b', dome(nose.p, vnorm([nose.n[0] + 0.3, nose.n[1] + 0.25, 0]), hr * 0.21 * nose.k, { angle: 55 }), '#1e293b'); S.addon('nose', nose.p, hr * 0.21 * nose.k); }
        [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'eyeL' : 'eyeR', e = S.face(id, [hx + 80, hy + hr * 0.22, s * hr * 0.42], [-1, 0, 0], 'head');
          if (!e) return;
          var R = p.eye * hs * e.k;
          S.addon(id, e.p, R);
          sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 48 }), '#3f2a1d');
          sc.add('eyes', 'b', dome(vadd(e.p, vadd(vmul(e.n, R * 0.36), [0, R * 0.32, s * -R * 0.2])), e.n, R * 0.28, { sink: 0.5 }), '#3f2a1d');
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size / 100, S);
      }

      var DOG_PARAMS = [
        { group: 'Dog', key: 'pose', label: 'Pose', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['Sitting', 'Standing', 'Lying down', 'Begging'] },
        { group: 'Dog', key: 'size', label: 'Overall size', unit: '%', min: 60, max: 130, step: 1, value: 100 },
        { group: 'Dog', key: 'chunk', label: 'Body (slim ↔ chunky)', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Dog', key: 'tail', label: 'Tail length', unit: '×', min: 0.6, max: 1.25, step: 0.05, value: 1 },
        { group: 'Dog', key: 'collar', label: 'Collar and tag', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'snout', label: 'Snout (flat ↔ long)', unit: '×', min: 0, max: 0.8, step: 0.05, value: 0.35 },
        { group: 'Head', key: 'ears', label: 'Ear style', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Floppy', 'Pricked', 'Small'] },
        { group: 'Head', key: 'earSize', label: 'Ear size', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head', key: 'eye', label: 'Eye size', unit: ' mm', min: 2, max: 4.5, step: 0.1, value: 3.2 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-079',
        category: 'ANIMALS // PETS',
        title: 'Dog Builder',
        fileName: 'Dog',
        defaultColor: '#d9a066',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', chest: 'Chest', paws: 'Paws', head: 'Head', muzzle: 'Muzzle', patch: 'Eye patch', ears: 'Ears', collar: 'Collar', tag: 'Tag', tail: 'Tail', nose: 'Nose', eyes: 'Eyes' },
        parameters: DOG_PARAMS,
        presets: makePresets(DOG_PARAMS, [
          ['Default dog', {}],
          ['Pug', { snout: 0, ears: 2, headSize: 1.2, chunk: 1.25, tail: 0.6, eye: 4.2 }],
          ['Corgi', { snout: 0.4, ears: 1, earSize: 1.25, chunk: 1.15, tail: 0.6 }],
          ['Husky', { snout: 0.45, ears: 1, earSize: 1, tail: 1.2 }],
          ['Standing dog', { pose: 1 }],
          ['Lying down', { pose: 2, snout: 0.3 }],
          ['Begging', { pose: 3, ears: 0 }],
          ['Puppy', { size: 70, headSize: 1.25, earSize: 1.3, eye: 4.4, snout: 0.15 }]
        ]),
        sculpt: sculptModule([
          { id: 'head', label: 'Head', section: 'Head' }, { id: 'muzzle', label: 'Muzzle', section: 'Head', parent: 'head' }, { id: 'nose', label: 'Nose', section: 'Head', parent: 'muzzle' }, { id: 'earL', label: 'Left ear', section: 'Head' }, { id: 'earR', label: 'Right ear', section: 'Head' }, { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'collar', label: 'Collar', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' },
          { id: 'frontL', label: 'Left front leg', section: 'Legs' }, { id: 'frontR', label: 'Right front leg', section: 'Legs' }, { id: 'hindL', label: 'Left hind leg', section: 'Legs' }, { id: 'hindR', label: 'Right hind leg', section: 'Legs' }
        ]),
        build: buildDog
      };
