      // -----------------------------------------------------------------------
      // Bunny & Hare Sitter: a sitting or loafing rabbit, or a long-legged standing hare, sculpted as one seamless surface
      // -----------------------------------------------------------------------
      // A carrot or a flower, as separate smooth shells. at: where the paws are, pose: 0 sitting, 1 hare, 2 loaf.
      function bunnyCarrot(pose, k) {
        var out = [], leaves = [];
        if (pose === 0) { // leans against the chest, tip on the bed, held between the paws
          out.push(sweep([[41, 1.3, 0, 1.9], [31, 12, 0, 3.4], [22, 24, 0, 5.2]], { seg: 20, per: 8, floor: 0 }));
          [[-4, 0], [0, 0.4], [4, 0]].forEach(function (lf) {
            leaves.push(horn([22, 25, lf[0] * 0.5], [27 + lf[1] * 6, 42 + (lf[0] === 0 ? 4 : 0), lf[0] * 1.8], 2.2, { seg: 10 }));
          });
        } else { // lies on the bed in front of the paws, fat end towards the bunny
          var x0 = pose === 1 ? 33 : 31, z0 = pose === 1 ? 0 : 0;
          out.push(sweep([[x0 + 28, 0.9, z0, 1.9], [x0 + 15, 2.6, z0, 3.6], [x0, 3.4, z0, 5.2]], { seg: 20, per: 8, bed: true, floor: 0 }));
          [[-3.4, 0], [0, 1], [3.4, 0]].forEach(function (lf) {
            leaves.push(horn([x0 + 1, 5, z0 + lf[0] * 0.5], [x0 - 7 - lf[1] * 3, 16 + lf[1] * 3, z0 + lf[0] * 2.4], 2, { seg: 10 }));
          });
        }
        return { body: out, leaves: leaves };
      }

      // Tulip bud (lobed cup) or daisy (a flat scalloped dish with a centre) on a stem that starts on the bed.
      function bunnyFlower(pose, style, k) {
        var base, top, stem = [], bloom = [], centre = null, y1, x, z;
        if (pose === 0) { x = 22; z = 0; y1 = 18; } else if (pose === 1) { x = 10; z = -19; y1 = 24; } else { x = 24; z = -22; y1 = 18; }
        stem.push(sweep([[x + 1.5, 0.9, z, 2], [x + 0.5, y1 * 0.5, z, 1.7], [x, y1, z, 1.5]], { seg: 12, per: 6, rise: true, floor: 0 }));
        stem.push(horn([x + 1, 6, z], [x + 10, 14, z + (z >= 0 ? 4 : -4)], 1.6, { seg: 10 })); // one leaf
        if (style === 0) { // tulip
          var rings = [
            { y: y1 - 1, cx: x, cz: z, rx: 1.6, rz: 1.6 }, { y: y1 + 1, cx: x, cz: z, rx: 3.6, rz: 3.6 }, { y: y1 + 3.5, cx: x, cz: z, rx: 5.4, rz: 5.4 },
            { y: y1 + 6.5, cx: x, cz: z, rx: 6.2, rz: 6.2 }, { y: y1 + 9.5, cx: x, cz: z, rx: 5.4, rz: 5.4 }, { y: y1 + 12, cx: x, cz: z, rx: 3.6, rz: 3.6 }, { y: y1 + 13.6, cx: x, cz: z, rx: 1.4, rz: 1.4 }
          ];
          bloom.push(loft(rings, 40, { mod: function (th, t) { return 1 - 0.26 * smooth((t - 0.45) / 0.45) * (0.5 - 0.5 * Math.cos(deg(th) * 3)); } }).tris);
        } else { // daisy
          var dr = [
            { y: y1, cx: x, cz: z, rx: 1.6, rz: 1.6 }, { y: y1 + 2, cx: x, cz: z, rx: 3.8, rz: 3.8 }, { y: y1 + 4.4, cx: x, cz: z, rx: 6.4, rz: 6.4 },
            { y: y1 + 6.4, cx: x, cz: z, rx: 8.4, rz: 8.4 }, { y: y1 + 7.8, cx: x, cz: z, rx: 8.6, rz: 8.6 }, { y: y1 + 8.8, cx: x, cz: z, rx: 6.4, rz: 6.4 }
          ];
          bloom.push(loft(dr, 56, { mod: function (th, t) { return 1 - 0.2 * smooth((t - 0.2) / 0.3) * (0.5 - 0.5 * Math.cos(deg(th) * 8)); } }).tris);
          centre = dome([x, y1 + 8.8, z], [0, 1, 0], 3.3, { angle: 40, sink: 1.2 });
        }
        return { stem: stem, bloom: bloom, centre: centre };
      }

      function buildBunny(p, api) {
        var sc = new Scene(), S = new Sculpt(1.2).useEdits(api, p.size / 100), k = p.chunk, hs = p.headSize, pose = Math.round(p.pose);
        var fur = '#e6d9c6', white = '#fbf7f2', pink = '#fda4af', dark = '#8d6e57', blush = '#fdc7cf';
        var marks = Math.round(p.marks), earStyle = Math.round(p.ears), earLen = p.earLen, tailStyle = Math.round(p.tailStyle), prop = Math.round(p.prop);
        var hr = 13.5 * hs, hx, hy, tx, ty, L = p.legs, yb = 0;
        var pawX = 17, pawZ = 6;

        S.piece('torso');
        if (pose === 0) { // sitting up, hind feet forward
          S.ell('body', [-6, 17, 0], [21 * k, 24, 17.5 * k], fur, 6);   // dips below the bed, so the belly is a flat base
          S.ell('body', [4, 30, 0], [15 * k, 16, 13 * k], fur, 9);
          S.paint('belly', [12, 26, 0], [10, 14, 9.5], white);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-9, 15, s * 14 * k], [15, 14, 8.5], fur, 3);          // haunch
            S.ell('paws', [7, 2.0, s * 15.5 * k], [14, 3.8, 5.2], white, 2);      // long hind foot lying forward
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('body', [[9, 30, s * 6 * k, 5], [13, 17, s * 6.2 * k, 4.2], [14.5, 5, s * 6.2 * k, 3.7]], fur, 2.5);
            S.ell('paws', [pawX + 1, 1.9, s * 6.2 * k], [6, 3.4, 4.2], white, 2);
          });
          hx = 12; hy = 47; tx = -24; ty = 0;
        } else if (pose === 1) { // standing hare: long legs tucked under a lean body, the big haunch behind
          yb = 22 + 19 * L;
          S.ell('body', [-3, yb, 0], [24 * k, 12.5 * k, 11 * k], fur, 5);
          S.ell('body', [12, yb + 3, 0], [12, 14, 10 * k], fur, 7);
          S.path('body', [[14, yb + 8, 0, 8], [19, yb + 20, 0, 6.6]], fur, 6);   // neck
          S.paint('belly', [10, yb - 2, 0], [13, 9, 8.5], white);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('body', [[10, yb + 1, s * 6.4 * k, 5.2], [11, yb * 0.5, s * 6.4 * k, 3.9], [11.5, 3.5, s * 6.4 * k, 3.3]], fur, 2.5);
            S.ell('paws', [15, 2.2, s * 6.4 * k], [6.5, 3, 3.4], white, 2);
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-14, yb - 3, s * 9.2 * k], [13, 15, 6.8], fur, 3);       // thigh
            S.path('body', [[-17, yb - 8, s * 9.2 * k, 5.4], [-23, yb * 0.42, s * 9.2 * k, 3.6], [-24, 5, s * 9.2 * k, 3.4]], fur, 2.5);
            S.ell('paws', [-10, 2.2, s * 9.2 * k], [16, 3, 3.8], white, 2);        // the long hind foot on the bed
          });
          hx = 22; hy = yb + 29; tx = -25; ty = yb + 1;
          pawX = 16; pawZ = 6.4;
        } else { // loaf: tucked down, paws just in front
          S.ell('body', [-4, 12, 0], [27 * k, 20, 16 * k], fur, 5);
          S.ell('body', [14, 15, 0], [12, 14, 12 * k], fur, 7);
          S.paint('belly', [18, 12, 0], [10, 10, 9], white);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('paws', [-3, 1.6, s * 15.5 * k], [14, 3.6, 4.2], white, 2);
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.ell('paws', [26, 1.6, s * 6.4 * k], [7, 3.4, 4.2], white, 2);
          });
          hx = 22; hy = 31; tx = -29; ty = 14;
          pawX = 26;
        }

        // head: round, with a small muzzle and puffy cheeks (a longer face on the hare)
        var mz = p.muzzle, mx = hx + hr * (0.74 + 0.28 * mz), my = hy - hr * 0.3;
        S.piece('head');
        S.ell('head', [hx, hy, 0], [hr * (1 + 0.1 * mz), hr * 0.92, hr * 0.95], fur, 7);
        S.piece('muzzle', 'head');
        S.ell('muzzle', [mx, my + 0.6, 0], [hr * (0.46 + 0.3 * mz), hr * 0.4, hr * 0.5], white, 3);
        [-1, 1].forEach(function (s) {
          S.ell('cheeks', [mx - hr * 0.1, my - hr * 0.1, s * hr * 0.4], [hr * 0.36, hr * 0.34, hr * 0.36], white, 3);
        });
        S.piece('head');
        S.path('mouth', [[mx + hr * 0.42, my - hr * 0.08, 0, 0.5], [mx + hr * 0.5, my - hr * 0.5, 0, 0.55]], null, 0, 3).carve(0.6);
        [-1, 1].forEach(function (s) {
          S.path('mouth', [[mx + hr * 0.5, my - hr * 0.5, 0, 0.5], [mx + hr * 0.4, my - hr * 0.62, s * hr * 0.22, 0.55], [mx + hr * 0.24, my - hr * 0.6, s * hr * 0.36, 0.5]], null, 0, 3).carve(0.6);
        });
        if (marks > 0) { // spots / blaze and socks, as painted regions
          S.piece('head');
          if (marks === 1) {
            S.paint('patch', [hx - hr * 0.1, hy + hr * 0.45, hr * 0.5], [hr * 0.52, hr * 0.48, hr * 0.4], dark);
            S.paint('patch', [hx - hr * 0.1, hy + hr * 0.45, -hr * 0.5], [hr * 0.52, hr * 0.48, hr * 0.4], dark);
            S.piece('torso');
            S.paint('patch', [-14, yb ? yb + 3 : 22, 6], [10, 11, 10], dark);
            S.paint('patch', [-2, yb ? yb + 6 : 26, -8], [8, 8, 9], dark);
          } else {
            S.paint('blaze', [hx + hr * 0.95, hy + hr * 0.2, 0], [hr * 0.38, hr * 0.8, hr * 0.2], white);
            S.paint('blaze', [hx - hr * 0.3, hy + hr * 0.55, 0], [hr * 0.5, hr * 0.35, hr * 0.18], white);
          }
        }
        // ears: upright plates standing in the y-z plane, or lop ears drooping against the cheeks
        var E = hs * earLen, spread = p.spread;
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'earL' : 'earR', 'head');
          var style = earStyle === 2 ? (s < 0 ? 0 : 1) : earStyle;         // 2: one up, one down
          if (style === 0) {
            var W = 6.4 * hs, H = 34 * E, lean = (3 + 12 * spread) * E * s, ex = hx - hr * 0.22, z0 = s * hr * 0.46, y0 = hy + hr * 0.5;
            // outline (along z, height): the plate is mirrored, so the pair matches
            var up = [], dn = [], N = 9, q, t, hw, cx;
            for (q = 0; q <= N; q++) {
              t = q / N; hw = W * Math.pow(Math.sin(Math.PI * (0.2 + 0.8 * t)), 0.55); cx = lean * Math.pow(t, 1.4);
              up.push([cx + hw, H * t]); dn.unshift([cx - hw, H * t]);
            }
            var pts = [[W, -3]].concat(up, dn.slice(1), [[-W, -3]]);
            S.plate('ears', pts.map(function (v) { return [v[0], y0 + v[1]]; }), [ex, 0, z0], [0, 0, 1], 4.2, fur, 2.5, 1.6);
            for (var j = 0; j < 4; j++) { // pink inside, on the front face only
              var f = 0.1 + j * 0.2;
              S.paint('inner', [ex + 1.4, y0 + H * (0.14 + f * 0.8), z0 + lean * Math.pow(0.14 + f * 0.8, 1.4)], [1.9, H * 0.12, W * (0.66 - f * 0.28)], pink);
            }
          } else {
            var ex2 = hx - hr * 0.3, ez = s * hr * 0.9, L2 = 15 * E;
            S.ell('ears', [ex2, hy + hr * 0.15 - L2 * 0.18, ez], [7.2 * hs, L2, 3.6], fur, 2.5);
            S.paint('inner', [ex2 + 0.3, hy + hr * 0.1 - L2 * 0.16, ez + s * 2.6], [4.2 * hs, L2 * 0.72, 1.5], pink);
          }
        });
        // tail
        var tf = p.tail;
        S.piece('tail');
        if (tailStyle === 0) { // pom-pom
          var pr0 = 4.8 + 4.4 * tf;
          S.ell('tail', [tx - 2, pose === 1 ? ty : pr0 * 0.85, 0], [pr0, pr0, pr0], white, 3);
        } else if (tailStyle === 1) { // fluffy tuft: a rosette of small puffs
          var pr = 3 + 2.6 * tf, rr = 2.2 + 3.2 * tf, ty2 = pose === 1 ? ty : rr + pr * 0.8;
          S.ell('tail', [tx - 2, ty2, 0], [pr, pr, pr], white, 3);
          for (var u = 0; u < 7; u++) {
            var a = (u / 7) * TAU + 0.3;
            S.ell('tail', [tx - 2 - 1.5 * Math.cos(u), ty2 + Math.sin(a) * rr, Math.cos(a) * rr], [pr * 0.85, pr * 0.85, pr * 0.85], white, 2);
          }
        } else { // hare scut: a short upturned tuft with a dark tip
          var sl = 0.7 + 0.6 * tf;
          S.path('tail', [[tx + 1, ty - 2, 0, 5.2], [tx - 4, ty + 4 * sl, 0, 4.6], [tx - 6.5, ty + 9 * sl, 0, 3.4]], white, 3);
          S.paint('tip', [tx - 7.4, ty + 11 * sl, 0], [3.6, 3.6, 3.6], '#3b3330');
        }
        S.reach = pose === 1 ? 0.8 : 0.78;
        S.run();
        // face details on the finished surface
        var nose = S.face('nose', [mx + 80, my + hr * 0.18, 0], [-1, 0, 0], 'muzzle');
        if (nose) { sc.add('nose', 'b', dome(nose.p, vnorm([nose.n[0], nose.n[1] + 0.1, 0]), hr * 0.17 * nose.k, { angle: 45 }), pink); S.addon('nose', nose.p, hr * 0.17 * nose.k); }
        [-1, 1].forEach(function (s) {
          var az = deg(56);
          softEye(sc, S, s < 0 ? 'eyeL' : 'eyeR', s < 0 ? 'pupilL' : 'pupilR', [hx + 80 * Math.cos(az), hy + hr * 0.2, s * 80 * Math.sin(az)], [-Math.cos(az), 0, -s * Math.sin(az)], 'head', p.eye * hs, '#5b3a29');
        });
        // prop
        if (prop === 1) {
          var c = bunnyCarrot(pose, k);
          c.body.forEach(function (t) { S.shell(sc, 'prop', 'carrot', 'b', t, '#fb923c'); });
          c.leaves.forEach(function (t) { S.shell(sc, 'prop', 'carrot top', 'b', t, '#86c26b'); });
        } else if (prop >= 2) {
          var f2 = bunnyFlower(pose, prop - 2, k);
          f2.stem.forEach(function (t) { S.shell(sc, 'prop', 'stem', 'b', t, '#86c26b'); });
          f2.bloom.forEach(function (t) { S.shell(sc, 'prop', 'petals', 'b', t, prop === 2 ? '#f472b6' : '#fdf2f8'); });
          if (f2.centre) S.shell(sc, 'prop', 'flower centre', 'b', f2.centre, '#fde047');
        }
        S.addTo(sc);
        return finishSculpt(sc, p.size / 100, S);
      }

      var BUNNY_PARAMS = [
        { group: 'Pose', key: 'pose', label: 'Pose', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Sitting bunny', 'Standing hare', 'Loaf'] },
        { group: 'Pose', key: 'size', label: 'Overall size', unit: '%', min: 60, max: 130, step: 1, value: 100 },
        { group: 'Pose', key: 'chunk', label: 'Body (slim ↔ plump)', unit: '×', min: 0.85, max: 1.3, step: 0.05, value: 1 },
        { group: 'Pose', key: 'legs', label: 'Hare leg length', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1, showIf: function (q) { return Math.round(q.pose) === 1; } },
        { group: 'Ears', key: 'ears', label: 'Ear style', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Upright', 'Lop', 'Half lop'] },
        { group: 'Ears', key: 'earLen', label: 'Ear length (bunny ↔ hare)', unit: '×', min: 0.5, max: 1.7, step: 0.05, value: 1 },
        { group: 'Ears', key: 'spread', label: 'Upright ear spread', unit: '×', min: 0, max: 1, step: 0.05, value: 0.3, showIf: function (q) { return Math.round(q.ears) !== 1; } },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.1, step: 0.05, value: 1 },
        { group: 'Head', key: 'muzzle', label: 'Muzzle (cute ↔ hare)', unit: '×', min: 0, max: 1, step: 0.05, value: 0.2 },
        { group: 'Head', key: 'eye', label: 'Eye size', unit: ' mm', min: 2.2, max: 4.0, step: 0.1, value: 2.8 },
        { group: 'Tail', key: 'tailStyle', label: 'Tail style', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Pom-pom', 'Fluffy tuft', 'Hare scut'] },
        { group: 'Tail', key: 'tail', label: 'Tail fluff', unit: '×', min: 0, max: 1, step: 0.05, value: 0.6 },
        { group: 'Extras', key: 'prop', label: 'Prop', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['None', 'Carrot', 'Tulip', 'Daisy'] },
        { group: 'Extras', key: 'marks', label: 'Markings', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Plain', 'Patches', 'Blaze'] }
      ];

      window.MM_GENERATOR = {
        code: 'MM-126',
        category: 'ANIMALS // BUNNIES',
        title: 'Bunny & Hare Sitter',
        fileName: 'Bunny',
        defaultColor: '#e6d9c6',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly', paws: 'Paws', head: 'Head', muzzle: 'Muzzle', cheeks: 'Cheeks', ears: 'Ears', inner: 'Inner ears', patch: 'Patches', blaze: 'Blaze', tail: 'Tail', tip: 'Tail tip', nose: 'Nose', eyes: 'Eyes', pupils: 'Pupils', glints: 'Eye glints', carrot: 'Carrot', 'carrot top': 'Carrot top', stem: 'Stem', petals: 'Petals', 'flower centre': 'Flower centre' },
        parameters: BUNNY_PARAMS,
        presets: makePresets(BUNNY_PARAMS, [
          ['Default bunny', {}],
          ['Lop bunny', { ears: 1, earLen: 1, muzzle: 0, headSize: 1.1, chunk: 1.2, tailStyle: 1 }],
          ['Easter bunny', { prop: 1, marks: 2, tailStyle: 1, tail: 0.8, earLen: 1.1 }],
          ['Standing hare', { pose: 1, legs: 1, earLen: 1.45, muzzle: 0.9, spread: 0.45, tailStyle: 2, chunk: 0.9 }],
          ['Long-legged hare', { pose: 1, legs: 1.3, earLen: 1.6, muzzle: 1, spread: 0.6, tailStyle: 2, chunk: 0.85 }],
          ['Sitting hare', { earLen: 1.5, muzzle: 0.8, chunk: 0.9, tailStyle: 2 }],
          ['Loaf with a flower', { pose: 2, prop: 2, ears: 2, chunk: 1.15 }],
          ['Spring daisy bunny', { prop: 3, ears: 2, marks: 1, tail: 0.8 }]
        ]),
        sculpt: sculptModule([
          { id: 'head', label: 'Head', section: 'Head' }, { id: 'muzzle', label: 'Muzzle', section: 'Head', parent: 'head' }, { id: 'nose', label: 'Nose', section: 'Head', parent: 'muzzle' },
          { id: 'earL', label: 'Left ear', section: 'Head' }, { id: 'earR', label: 'Right ear', section: 'Head' },
          { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' }, { id: 'prop', label: 'Carrot or flower', section: 'Body' },
          { id: 'frontL', label: 'Left front leg', section: 'Legs' }, { id: 'frontR', label: 'Right front leg', section: 'Legs' }, { id: 'hindL', label: 'Left hind leg', section: 'Legs' }, { id: 'hindR', label: 'Right hind leg', section: 'Legs' }
        ]),
        build: buildBunny
      };
