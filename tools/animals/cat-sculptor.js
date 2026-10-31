      // -----------------------------------------------------------------------
      // Cat Sculptor: a sitting, loafing or curled-up cat sculpted as one seamless surface
      // -----------------------------------------------------------------------
      function buildCat(p) {
        var sc = new Scene(), S = new Sculpt(1.3), k = p.chunk, hs = p.headSize, pose = Math.round(p.pose), fur = '#fdba74', cream = '#fff1dc', dark = '#c2703d', pink = '#fda4af';
        var hx, hy, hr = 13.5 * hs, sd, i;
        if (pose === 0) { // sitting
          S.ell('body', [-7, 15, 0], [21 * k, 19, 18 * k], fur, 5);
          S.ell('body', [3, 35, 0], [13 * k, 20, 12.5 * k], fur, 8);
          [-1, 1].forEach(function (s) {
            S.ell('body', [-10, 13, s * 13 * k], [15, 13, 7.5], fur, 3);                        // haunch
            S.ell('paws', [7, 3.2, s * 15 * k], [10, 3.6, 5], cream, 2);                         // hind foot
            S.path('body', [[9, 34, s * 6 * k, 5.6], [13, 18, s * 6.2 * k, 4.6], [14, 5, s * 6.2 * k, 4]], fur, 2.5);
            S.ell('paws', [17, 3, s * 6.2 * k], [6.5, 3.4, 4.6], cream, 2);
          });
          hx = 7; hy = 58;
        } else if (pose === 1) { // loaf
          S.ell('body', [-4, 16, 0], [28 * k, 20, 17 * k], fur, 5);
          [-1, 1].forEach(function (s) { S.ell('paws', [22, 3, s * 7.5 * k], [7, 3.5, 4.6], cream, 3); });
          hx = 24; hy = 30;
        } else { // curled up, chin on the bed beside the tail
          S.ell('body', [-6, 13, -3], [27, 17 * k, 21 * k], fur, 5);
          S.ell('paws', [17, 3, 17 * k], [8, 3.6, 5], cream, 3);
          hx = 21; hy = 11.5 * hs;
        }
        // head: wide cheeks, a small muzzle and a chin
        S.ell('head', [hx, hy, 0], [hr * 0.95, hr * 0.86, hr * 1.1], fur, pose === 0 ? 6 : 5);
        [-1, 1].forEach(function (s) {
          S.ell('muzzle', [hx + hr * 0.78, hy - hr * 0.26, s * hr * 0.27], [hr * 0.3, hr * 0.26, hr * 0.33], cream, 2);
          S.ell('head', [hx + hr * 0.1, hy - hr * 0.2, s * hr * 0.86], [hr * 0.55, hr * 0.48, hr * 0.42], fur, 3); // cheek
          // ear: a rounded triangle facing forward, with a pink inside
          var E = 13 * p.ear * hs, ez = s * hr * 0.58, ey = hy + hr * 0.42, W = 6.4 * p.ear * hs, side = s * 0.42;
          var poly = [[-W, ey], [W, ey], [W * side + E * 0.22 * s, ey + E], [W * side - E * 0.06 * s, ey + E]];
          S.plate('ears', poly, [hx - hr * 0.1, 0, ez], [0, 0, 1], 3.4, fur, 2.5, 1);
          S.plate('inner ears', [[-W * 0.55, ey + 1.5], [W * 0.55, ey + 1.5], [W * side * 0.8 + E * 0.1 * s, ey + E * 0.66]], [hx - hr * 0.1 + 1.2, 0, ez], [0, 0, 1], 2.8, pink, 0.5, 0.8);
        });
        S.ell('muzzle', [hx + hr * 0.72, hy - hr * 0.5, 0], [hr * 0.24, hr * 0.17, hr * 0.26], cream, 2);
        // back of a tabby: stripes that are slightly proud, painted their own colour
        var st = Math.round(p.stripes), bc = pose === 0 ? [-7, 15, 0] : pose === 1 ? [-4, 16, 0] : [-6, 13, -3], br = pose === 0 ? [21 * k, 19, 18 * k] : pose === 1 ? [28 * k, 20, 17 * k] : [27, 17 * k, 21 * k];
        for (i = 0; i < st; i++) {
          var dx = st > 1 ? lerp(-br[0] * 0.62, pose === 0 ? 2 : br[0] * 0.3, i / (st - 1)) : -br[0] * 0.3;
          S.path('stripes', bandOver(bc, br, dx, 0.72, 1.9, 0.5), dark, 1, 2);
        }
        // tail on the bed, curling round the feet
        var tl = p.tail, tc;
        if (pose === 0) tc = [[-24, 3.2, 3, 5.4], [-30, 3, 13, 5], [-25, 2.9, 25 * tl, 4.6], [-9, 2.7, 30 * tl, 4.2], [8, 2.5, 28 * tl, 3.9], [19, 2.4, 22 * tl, 3.6]];
        else if (pose === 1) tc = [[-28, 3.2, 5, 5], [-32, 3, 16, 4.6], [-20, 2.8, 24 * tl, 4.2], [-2, 2.6, 24 * tl, 3.8], [13, 2.4, 19 * tl, 3.5]];
        else tc = [[-30, 3.2, -8, 5], [-24, 3, -27 * tl, 4.6], [-6, 2.8, -33 * tl, 4.2], [14, 2.6, -27 * tl, 3.8], [26, 2.4, -13 * tl, 3.5]];
        S.path('tail', tc, fur, 2.5);
        if (Math.round(p.collar) === 1 && pose === 0) S.path('collar', [[0, 47, 0, 0]].slice(0, 0).concat(ringPts(hx - 2, hy - hr * 0.72, 0, 9.5 * k, 11.5 * k, 1.9)), '#fb7185', 0.8, 2);
        S.run();
        // mouth, nose and eyes go on the finished surface
        var f = [hx + 60, hy - hr * 0.1, 0], dirIn = [-1, 0, 0];
        var nose = S.hit([hx + 60, hy - hr * 0.1, 0], dirIn);
        sc.add('nose', 'b', dome(nose.p, vnorm([nose.n[0], nose.n[1] + 0.15, 0]), 2.1 * hs, { angle: 55 }), pink);
        [-1, 1].forEach(function (s) {
          var yE = hy + hr * 0.2, zE = s * hr * 0.46, e = S.hit([hx + 60, yE, zE], dirIn), R = p.eye * hs;
          if (Math.round(p.closed) === 1 || pose === 2) { // sleeping: a soft closed-eye line
            sc.add('eyes', 'b', sweep([[e.p[0] - 0.6, yE + 0.8, zE - R, 0.75], [e.p[0] - 0.1, yE - 0.3, zE, 0.75], [e.p[0] - 0.6, yE + 0.8, zE + R, 0.75]], { seg: 8, per: 4, floor: null }), '#334155');
          } else {
            sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 42 }), '#bef264');
            var pu = vadd(e.p, vmul(e.n, R * 0.28));
            sc.add('pupils', 'b', sweep([[pu[0], pu[1] - R * 0.55, pu[2], 0.65], [pu[0] + 0.25, pu[1], pu[2], 0.95], [pu[0], pu[1] + R * 0.55, pu[2], 0.65]], { seg: 8, per: 3, floor: null }), '#1e293b');
          }
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size / 100);
      }
      function ringPts(x, y, z, rx, rz, r) {
        var out = [];
        for (var i = 0; i <= 28; i++) { var a = (i / 28) * TAU; out.push([x + Math.cos(a) * rx, y - Math.cos(a) * 3, z + Math.sin(a) * rz, r]); }
        return out;
      }

      var CAT_PARAMS = [
        { group: 'Pose', key: 'pose', label: 'Pose', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Sitting', 'Loaf', 'Curled up'] },
        { group: 'Pose', key: 'size', label: 'Overall size', unit: '%', min: 60, max: 130, step: 1, value: 100 },
        { group: 'Pose', key: 'chunk', label: 'Body (slim ↔ chunky)', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Pose', key: 'tail', label: 'Tail curl (tight ↔ loose)', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'ear', label: 'Ear size', unit: '×', min: 0.7, max: 1.5, step: 0.05, value: 1 },
        { group: 'Head', key: 'eye', label: 'Eye size', unit: ' mm', min: 2.4, max: 5, step: 0.1, value: 3.6 },
        { group: 'Head', key: 'closed', label: 'Eyes', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Open', 'Sleepy'] },
        { group: 'Coat', key: 'stripes', label: 'Tabby stripes', unit: '', min: 0, max: 6, step: 1, value: 4, slider: true },
        { group: 'Coat', key: 'collar', label: 'Collar (sitting pose)', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] }
      ];

      window.MM_GENERATOR = {
        code: 'MM-078',
        category: 'ANIMALS // PETS',
        title: 'Cat Sculptor',
        fileName: 'Cat',
        defaultColor: '#fdba74',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', paws: 'Paws', head: 'Head', muzzle: 'Muzzle', ears: 'Ears', 'inner ears': 'Inner ears', stripes: 'Stripes', tail: 'Tail', collar: 'Collar', nose: 'Nose', eyes: 'Eyes', pupils: 'Pupils' },
        parameters: CAT_PARAMS,
        presets: makePresets(CAT_PARAMS, [
          ['Default cat', {}],
          ['Chubby loaf', { pose: 1, chunk: 1.25, headSize: 1.1, stripes: 5 }],
          ['Sleeping curl', { pose: 2, chunk: 0.95, closed: 1, stripes: 3 }],
          ['Kitten', { size: 70, headSize: 1.25, ear: 1.3, eye: 4.8, stripes: 2 }],
          ['Plain sitter', { stripes: 0, ear: 1.2, eye: 4.2 }]
        ]),
        build: buildCat
      };
