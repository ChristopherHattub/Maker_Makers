      // -----------------------------------------------------------------------
      // Cat Sculptor: a sitting, loafing or curled-up cat sculpted as one seamless surface
      // -----------------------------------------------------------------------
      function buildCat(p, api) {
        var sc = new Scene(), S = new Sculpt(1.15).useEdits(api, p.size / 100), k = p.chunk, hs = p.headSize, pose = Math.round(p.pose), fur = '#fdba74', cream = '#fff1dc', dark = '#c2703d', pink = '#fda4af';
        var hx, hy, hr = 13.5 * hs, sd, i, ears = [];
        if (pose === 0) { // sitting
          S.piece('torso');
          S.ell('body', [-7, 15, 0], [21 * k, 19, 18 * k], fur, 5);
          S.ell('body', [3, 35, 0], [13 * k, 20, 12.5 * k], fur, 8);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-10, 13, s * 13 * k], [15, 13, 7.5], fur, 3);                        // haunch
            S.ell('paws', [7, 3.2, s * 15 * k], [10, 3.6, 5], cream, 2);                         // hind foot
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('body', [[9, 34, s * 6 * k, 5.6], [13, 18, s * 6.2 * k, 4.6], [14, 5, s * 6.2 * k, 4]], fur, 2.5);
            S.ell('paws', [17, 3, s * 6.2 * k], [6.5, 3.4, 4.6], cream, 2);
          });
          hx = 7; hy = 58;
        } else if (pose === 1) { // loaf
          S.piece('torso');
          S.ell('body', [-4, 16, 0], [28 * k, 20, 17 * k], fur, 5);
          [-1, 1].forEach(function (s) { S.piece(s < 0 ? 'frontL' : 'frontR'); S.ell('paws', [22, 3, s * 7.5 * k], [7, 3.5, 4.6], cream, 3); });
          hx = 24; hy = 30;
        } else { // curled up, chin on the bed beside the tail
          S.piece('torso');
          S.ell('body', [-6, 13, -3], [27, 17 * k, 21 * k], fur, 5);
          S.piece('frontR');
          S.ell('paws', [17, 3, 17 * k], [8, 3.6, 5], cream, 3);
          hx = 21; hy = 11.5 * hs;
        }
        // head: wide cheeks, a small muzzle and a chin
        S.piece('head');
        S.ell('head', [hx, hy, 0], [hr * 0.95, hr * 0.86, hr * 1.1], fur, pose === 0 ? 6 : 5);
        [-1, 1].forEach(function (s) {
          S.piece('head');
          S.ell('muzzle', [hx + hr * 0.78, hy - hr * 0.26, s * hr * 0.27], [hr * 0.3, hr * 0.26, hr * 0.33], cream, 2);
          S.ell('head', [hx + hr * 0.1, hy - hr * 0.2, s * hr * 0.86], [hr * 0.55, hr * 0.48, hr * 0.42], fur, 3); // cheek
          // ear: a rounded triangle facing forward, with a pink inside
          var earH = s < 0 ? p.earL : p.earR, E = 13 * p.ear * hs * earH, ez = s * hr * 0.58, ey = hy + hr * 0.36, W = 6.4 * p.ear * hs;
          ears.push({ id: s < 0 ? 'earL' : 'earR', s: s, E: E, ez: ez, ey: ey, W: W });
        });
        S.piece('head');
        S.ell('muzzle', [hx + hr * 0.72, hy - hr * 0.5, 0], [hr * 0.24, hr * 0.17, hr * 0.26], cream, 2);
        // back of a tabby: stripes that are slightly proud, painted their own colour
        S.piece('stripes');
        var st = Math.round(p.stripes), bc = pose === 0 ? [-7, 15, 0] : pose === 1 ? [-4, 16, 0] : [-6, 13, -3], br = pose === 0 ? [21 * k, 19, 18 * k] : pose === 1 ? [28 * k, 20, 17 * k] : [27, 17 * k, 21 * k];
        for (i = 0; i < st; i++) {
          var dx = st > 1 ? lerp(-br[0] * 0.62, pose === 0 ? 2 : br[0] * 0.3, i / (st - 1)) : -br[0] * 0.3;
          S.path('stripes', bandOver(bc, br, dx, 0.72, 2.3, 0.4), dark, 0.8, 3);
        }
        // tail on the bed, curling round the feet
        var tl = p.tail, tc;
        if (pose === 0) tc = [[-24, 3.2, 3, 5.4], [-30, 3, 13, 5], [-25, 2.9, 25 * tl, 4.6], [-9, 2.7, 30 * tl, 4.2], [8, 2.5, 28 * tl, 3.9], [19, 2.4, 22 * tl, 3.6]];
        else if (pose === 1) tc = [[-28, 3.2, 5, 5], [-32, 3, 16 * k, 4.6], [-20, 2.8, 24 * k * tl, 4.2], [-2, 2.6, 24 * k * tl, 3.8], [13, 2.4, 19 * k * tl, 3.5]];
        else tc = [[-27, 3.2, -4, 5.4], [-24, 3, -27 * tl, 4.6], [-6, 2.8, -33 * tl, 4.2], [14, 2.6, -27 * tl, 3.8], [26, 2.4, -13 * tl, 3.5]];
        S.piece('tail');
        S.path('tail', tc, fur, 2.5);
        var wantCollar = Math.round(p.collar) === 1 && pose === 0;
        S.parents.nose = 'head'; S.parents.eyeL = 'head'; S.parents.eyeR = 'head'; S.parents.pupilL = 'eyeL'; S.parents.pupilR = 'eyeR';
        S.run();
        ears.forEach(function (q) { // mirrored smooth plates, so both ears match
          var s = q.s, W = q.W, E = q.E, at = [hx - hr * 0.1 - 1.7, 0, q.ez];
          function mir(list) { return list.map(function (c) { return [c[0] * s, c[1]]; }); }
          S.shell(sc, q.id, 'ears', 'b', vslab(mir([[-W, q.ey], [W, q.ey], [W * 0.92, q.ey + E * 0.45], [W * 0.62, q.ey + E], [W * 0.34, q.ey + E * 1.04], [W * 0.06, q.ey + E * 0.92], [-W * 0.6, q.ey + E * 0.42]]), [at[0] + 1.7, 0, at[2]], [0, 0, 1], 3.4, 0.9), fur, 'head');
          S.shell(sc, q.id, 'inner ears', 'b', vslab(mir([[-W * 0.52, q.ey + 2], [W * 0.56, q.ey + 2], [W * 0.52, q.ey + E * 0.5], [W * 0.34, q.ey + E * 0.78], [-W * 0.3, q.ey + E * 0.42]]), [at[0] + 2.8, 0, at[2]], [0, 0, 1], 1.5, 0.4), pink, 'head');
        });
        if (wantCollar) S.shell(sc, 'collar', 'collar', 'b', collarBand(hx - 3, hy - hr * 0.76, 9.6 * k, 11.2 * k, 1.5, 1), '#fb7185');
        // mouth, nose and eyes go on the finished surface, and follow the head when it is edited
        if (!S.deleted('nose')) {
          S.pivots.nose = [hx + 60, hy - hr * 0.1, 0];
          var nO = S.xf('nose', [hx + 60, hy - hr * 0.1, 0]), nose = S.hit(nO, [-1, 0, 0]), nk = S.scaleOf('nose');
          sc.add('nose', 'b', dome(nose.p, vnorm([nose.n[0], nose.n[1] + 0.15, 0]), 2.1 * hs * nk, { angle: 55 }), pink);
          S.addon('nose', nose.p, 2.1 * hs * nk);
        }
        [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'eyeL' : 'eyeR';
          if (S.deleted(id)) return;
          var yE = hy + hr * 0.3, zE = s * hr * 0.46;
          S.pivots[id] = [hx + 60, yE, zE];
          var eO = S.xf(id, [hx + 60, yE, zE]), e = S.hit(eO, [-1, 0, 0]), R = p.eye * hs * S.scaleOf(id);
          S.addon(id, e.p, R);
          if (Math.round(p.closed) === 1 || pose === 2) { // sleeping: a soft closed-eye line
            sc.add('eyes', 'b', sweep([[e.p[0] - 0.6, e.p[1] + 0.8, e.p[2] - R, 0.75], [e.p[0] - 0.1, e.p[1] - 0.3, e.p[2], 0.75], [e.p[0] - 0.6, e.p[1] + 0.8, e.p[2] + R, 0.75]], { seg: 8, per: 4, floor: null }), '#334155');
          } else {
            sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 42 }), '#bef264');
            var pid = s < 0 ? 'pupilL' : 'pupilR';
            if (!S.deleted(pid)) {
              var pu = S.ownMove(pid, vadd(e.p, vmul(e.n, R * 0.28))), ps = S.ownScale(pid), hh = R * 0.55 * ps[1], rw = (ps[0] + ps[2]) / 2;
              sc.add('pupils', 'b', sweep([[pu[0], pu[1] - hh, pu[2], 0.65 * rw], [pu[0] + 0.25, pu[1], pu[2], 0.95 * rw], [pu[0], pu[1] + hh, pu[2], 0.65 * rw]], { seg: 8, per: 3, floor: null }), '#1e293b');
              S.addon(pid, pu, Math.max(hh, 1.2));
            }
          }
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size / 100, S);
      }
      var CAT_PARAMS = [
        { group: 'Pose', key: 'pose', label: 'Pose', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Sitting', 'Loaf', 'Curled up'] },
        { group: 'Pose', key: 'size', label: 'Overall size', unit: '%', min: 60, max: 130, step: 1, value: 100 },
        { group: 'Pose', key: 'chunk', label: 'Body (slim ↔ chunky)', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Pose', key: 'tail', label: 'Tail curl (tight ↔ loose)', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'ear', label: 'Ear size', unit: '×', min: 0.7, max: 1.5, step: 0.05, value: 1 },
        { group: 'Head', key: 'earL', label: 'Left ear height', unit: '×', min: 0.5, max: 1.6, step: 0.05, value: 1 },
        { group: 'Head', key: 'earR', label: 'Right ear height', unit: '×', min: 0.5, max: 1.6, step: 0.05, value: 1 },
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
          ['Kitten', { size: 70, headSize: 1.25, ear: 1.15, eye: 4.8, stripes: 2 }],
          ['Plain sitter', { stripes: 0, ear: 1.2, eye: 4.2 }]
        ]),
        sculpt: sculptModule([
          { id: 'head', label: 'Head', section: 'Head' }, { id: 'earL', label: 'Left ear', section: 'Head' }, { id: 'earR', label: 'Right ear', section: 'Head' },
          { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' },
          { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' }, { id: 'nose', label: 'Nose', section: 'Head' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'collar', label: 'Collar', section: 'Body' }, { id: 'stripes', label: 'Stripes', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' },
          { id: 'frontL', label: 'Left front leg', section: 'Legs' }, { id: 'frontR', label: 'Right front leg', section: 'Legs' }, { id: 'hindL', label: 'Left hind leg', section: 'Legs' }, { id: 'hindR', label: 'Right hind leg', section: 'Legs' }
        ]),
        build: buildCat
      };
