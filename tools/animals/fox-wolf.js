      // -----------------------------------------------------------------------
      // Fox & Wolf: a sitting or howling canine, as a bust or a full body, sculpted as one seamless surface
      // -----------------------------------------------------------------------
      var FOX_COATS = [
        { body: '#e8863a', light: '#f8fafc', dark: '#334155', ear: '#334155', tip: '#f8fafc', iris: '#f59e0b' },   // red fox
        { body: '#8a94a3', light: '#d6dce5', dark: '#5b6573', ear: '#8a94a3', tip: '#4b5563', iris: '#fbbf24' },   // grey wolf
        { body: '#eef2f7', light: '#ffffff', dark: '#b6c2d1', ear: '#eef2f7', tip: '#b6c2d1', iris: '#38bdf8' },   // arctic
        { body: '#e3bd84', light: '#f7ead2', dark: '#a98458', ear: '#e3bd84', tip: '#a98458', iris: '#7c4a2d' }    // desert sand
      ];
      // Ear shapes as fractions of the head radius: half width, height, outward lean, and how rounded the tip is.
      var FOX_EARS = [
        { W: 0.42, E: 1.55, lean: 0.12, round: 0 },     // fox: tall and pointed
        { W: 0.44, E: 1.25, lean: 0.06, round: 1 },    // wolf: shorter, a softer tip
        { W: 0.52, E: 2.3, lean: 0.3, round: 1 }       // fennec: huge
      ];

      function buildFox(p, api) {
        var facet = Math.round(p.facets), cell = [1.3, 2.3, 3.4][facet];
        window.MM_GENERATOR.creaseShading = facet ? 14 : 0;
        var sc = new Scene(), S = new Sculpt(cell).useEdits(api, p.size / 100), k = p.build, hs = p.headSize;
        if (facet) { S.smoothing = 1; S.blur = 0; }
        var coat = FOX_COATS[Math.round(p.coat)], ES = FOX_EARS[Math.round(p.ears)];
        var body = coat.body, light = coat.light, dark = coat.dark;
        var bust = Math.round(p.mode) === 0, howl = Math.round(p.pose) === 1, hr = 14 * hs, fat = Math.max(1, cell * 1.5), i;
        var th = deg(howl ? p.howl : 0), cs = Math.cos(th), sn = Math.sin(th), hx, hy;
        if (bust) { hx = howl ? 6 : 10; hy = howl ? 58 : 56; } else { hx = howl ? 8 : 12; hy = howl ? 70 : 64; }
        function H(u, v, w) { return [hx + u * cs - v * sn, hy + u * sn + v * cs, w]; }
        var fwd = [cs, sn, 0];

        // ---- body ----
        S.piece('torso');
        if (bust) {
          if (Math.round(p.base) === 1) S.ell('base', [0, 0, 0], [31, 8.5, 26 * k], '#475569', 3);
          S.ell('body', [0, 11, 0], [19 * k, 14, 24 * k], body, 6);
          S.ell('body', [4, 28, 0], [13.5 * k, 18, 15 * k], body, 8);
          S.ell('ruff', [9, 34, 0], [8, 10, 12 * k], light, 4);     // chest fluff
          S.paint('chest', [14, 22, 0], [8, 14, 10], light);
        } else {
          S.ell('body', [-9, 16, 0], [20 * k, 17, 15.5 * k], body, 5);
          S.ell('body', [4, 36, 0], [12.5 * k, 22, 11 * k], body, 8);
          S.ell('ruff', [11, 46, 0], [7, 9, 9.5 * k], light, 4);     // chest fluff
          S.paint('chest', [14, 34, 0], [8, 16, 8], light);
        }
        var neckA = bust ? [4, 36, 0, 11] : [6, 50, 0, 10.5], neckB = H(-0.1 * hr, -0.9 * hr, 0).concat([hr * 0.74]);
        S.path('body', [neckA, [(neckA[0] + neckB[0]) / 2, (neckA[1] + neckB[1]) / 2, 0, 10], neckB], body, 6);
        if (!bust) {
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-12, 13, s * 12.5 * k], [14, 13, 7], body, 3);
            S.ell('socks', [5, 3.2, s * 14 * k], [11, Math.max(3.4, fat * 0.95), Math.max(4.4, fat)], dark, 2);
            S.piece(s < 0 ? 'frontL' : 'frontR');
            var lr = Math.max(3.4, fat);
            S.path('body', [[9, 40, s * 6.2 * k, 5.2], [13, 22, s * 6.5 * k, Math.max(4, fat)], [14, 5, s * 6.6 * k, lr]], body, 2.5);
            S.path('socks', [[13.6, 14, s * 6.6 * k, lr + 0.3], [14, 4, s * 6.6 * k, lr + 0.2]], dark, 1.5);
            S.ell('socks', [17.5, 2.6, s * 6.6 * k], [7.5, Math.max(3.6, fat), Math.max(4.2, fat)], dark, 2.5);
          });
        }

        // ---- tail: a brush lying on the bed, curling round to the side ----
        var tailPts = null, tipAt = null;
        if (!bust) {
          var ts = p.tail, curl = p.curl / 100, L = 52 * ts, n = 9, a = Math.PI, px = -24, pz = 0, tr;
          tailPts = [];
          for (i = 0; i <= n; i++) {
            var t = i / n;
            tr = ts * Math.max(3.3 + 4.2 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.04)), 0.8), 0) * (1 - 0.32 * Math.pow(t, 3));
            tr = Math.max(tr, fat * 0.9);
            tailPts.push([px, tr * 0.78, pz, tr]);
            a -= curl * deg(215) / n; // turns toward +z (the heading starts at -x)
            px += Math.cos(a) * L / n; pz -= Math.sin(a) * L / n;
          }
          S.piece('tail');
          S.path('tail', tailPts, body, 3, 4);
          if (Math.round(p.tip) === 1) {
            var q0 = tailPts[n], q1 = tailPts[n - 3];
            S.paint('tip', q0.slice(0, 3), [q0[3] * 1.4 + 3, q0[3] * 1.6 + 3, q0[3] * 1.4 + 3], coat.tip);
            S.paint('tip', [(q0[0] + q1[0]) / 2, q0[1], (q0[2] + q1[2]) / 2], [q0[3] * 1.2 + 2.5, q0[3] * 1.5 + 2.5, q0[3] * 1.2 + 2.5], coat.tip);
          }
        }

        // ---- head ----
        S.piece('head');
        S.ell('head', H(0, 0, 0), [hr, hr * 0.9, hr * 1.02], body, 7);
        var ruff = p.ruff;
        [-1, 1].forEach(function (s) {
          var c = H(-0.15 * hr, -0.45 * hr, s * hr * 0.72), rr = 0.55 + 0.6 * ruff;
          S.ell('ruff', c, [hr * 0.55 * rr, hr * 0.4 * rr, hr * (0.28 + 0.14 * ruff)], light, 8);
        });
        var ml = hr * (0.8 + 1.1 * p.snout), mu = 0.55 * hr;
        function mz(t) { return [mu + ml * t, -0.14 * hr - 0.16 * hr * t, hr * (0.5 - 0.29 * t)]; } // u, v, radius along the muzzle
        S.piece('muzzle', 'head');
        var mpts = [0, 0.5, 1].map(function (t) { var m = mz(t), c = H(m[0], m[1], 0); return [c[0], c[1], 0, Math.max(m[2], fat * 0.9)]; });
        S.path('muzzle', mpts, body, 3);
        for (i = 0; i <= 4; i++) { // lighter lips and chin along the underside
          var mm = mz(i / 4 * 0.9), cj = H(mm[0], mm[1] - mm[2] * 0.82, 0);
          S.paint('jaw', cj, [mm[2] * 0.85, mm[2] * 0.85, mm[2] * 0.85], light);
        }
        if (facet < 2) [-1, 1].forEach(function (s) { // mouth line along each side
          var gp = [0.1, 0.5, 0.95].map(function (t) { var m = mz(t), c = H(m[0] + 0.2 * hr * (1 - t), m[1] - m[2] * 0.2, s * m[2] * 0.93); return [c[0], c[1], c[2], 0.75]; });
          S.path('mouth', gp, null, 0, 3).carve(0.8);
        });
        S.piece('head');

        // ---- run, then the shells and details that sit on the finished surface ----
        S.reach = (howl ? 0.6 : 0.5) * [1, 0.8, 0.6][facet];
        S.run();
        // ears: mirrored smooth plates standing on the skull
        [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'earL' : 'earR';
          var ec = H((howl ? 0 : -0.15) * hr, 0.5 * hr, s * hr * 0.45), W = ES.W * hr * p.earSize, E = ES.E * hr * p.earSize, yb = ec[1] - 0.2 * hr, lean = ES.lean * hr, at = [ec[0], 0, ec[2]];
          function mir(list) { return list.map(function (c) { return [c[0] * s, c[1]]; }); }
          var Wb = Math.min(W, 0.18 * hr), yb2 = yb - 0.4 * hr, // the ear root is narrower and deeper, so it stays inside the skull
            poly = ES.round
            ? [[-Wb, yb2], [Wb, yb2], [W, yb], [W * 0.95 + lean * 0.5, yb + E * 0.45], [W * 0.62 + lean, yb + E * 0.82], [W * 0.2 + lean, yb + E * 0.98], [-W * 0.2 + lean * 0.7, yb + E * 0.9], [-W * 0.7, yb + E * 0.5], [-W, yb]]
            : [[-Wb, yb2], [Wb, yb2], [W, yb], [W * 0.78 + lean * 0.6, yb + E * 0.5], [lean * 1.4 + W * 0.2, yb + E], [-W * 0.45, yb + E * 0.52], [-W, yb]];
          var t = Math.max(4.2, cell * 1.6);
          S.piece(id, 'head');
          var tilt = Math.min(th, deg(60)) * 0.3, pivot = [ec[0], yb, ec[2]];
          function tiltEar(tris) { for (var q = 0; q < tris.length; q += 3) { var dx = tris[q] - pivot[0], dy = tris[q + 1] - pivot[1]; tris[q] = pivot[0] + dx * Math.cos(tilt) - dy * Math.sin(tilt); tris[q + 1] = pivot[1] + dx * Math.sin(tilt) + dy * Math.cos(tilt); } return tris; }
          S.shell(sc, id, 'ears', 'b', tiltEar(vslab(mir(poly), at, [0, 0, 1], t, 0.9)), coat.ear, 'head');
          var ix = at[0] + t / 2 - 0.2, ip = ES.round
            ? [[-W * 0.5, yb + E * 0.22], [W * 0.5, yb + E * 0.22], [W * 0.5 + lean * 0.5, yb + E * 0.5], [W * 0.2 + lean, yb + E * 0.78], [-W * 0.1 + lean * 0.5, yb + E * 0.74], [-W * 0.45, yb + E * 0.5]]
            : [[-W * 0.45, yb + E * 0.22], [W * 0.45, yb + E * 0.22], [W * 0.3 + lean * 0.6, yb + E * 0.55], [lean + W * 0.05, yb + E * 0.84], [-W * 0.3, yb + E * 0.5]];
          S.shell(sc, id, 'inner ears', 'b', tiltEar(vslab(mir(ip), [ix + 0.6, 0, at[2]], [0, 0, 1], 1.4, 0.4)), light, 'head');
        });
        // nose
        var nm = mz(1), nw = H(nm[0] + 40, nm[1], 0), nose = S.face('nose', nw, [-fwd[0], -fwd[1], 0], 'muzzle');
        if (nose) { var nr = hr * 0.2 * nose.k; sc.add('nose', 'b', dome(nose.p, nose.n, nr, { angle: 42 }), '#1e293b'); S.addon('nose', nose.p, nr); }
        // eyes: set slightly back and tilted up at the outer corner by sitting a little high on the skull
        [-1, 1].forEach(function (s) {
          var eo = H(0.62 * hr + 60, 0.36 * hr, s * hr * 0.4);
          softEye(sc, S, s < 0 ? 'eyeL' : 'eyeR', s < 0 ? 'pupilL' : 'pupilR', eo, [-fwd[0], -fwd[1], 0], 'head', p.eye * hs, coat.iris);
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size / 100, S);
      }

      var FOX_PARAMS = [
        { group: 'Animal', key: 'mode', label: 'Shape', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Bust', 'Full body'] },
        { group: 'Animal', key: 'pose', label: 'Pose', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Sitting', 'Howling'] },
        { group: 'Animal', key: 'coat', label: 'Coat', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['Red fox', 'Grey wolf', 'Arctic', 'Desert sand'] },
        { group: 'Animal', key: 'size', label: 'Overall size', unit: '%', min: 60, max: 130, step: 1, value: 90 },
        { group: 'Animal', key: 'build', label: 'Body (slim ↔ stocky)', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Animal', key: 'facets', label: 'Style (smooth ↔ low-poly)', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Smooth', 'Soft facets', 'Low-poly'] },
        { group: 'Animal', key: 'base', label: 'Round base (bust)', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'], showIf: function (p) { return Math.round(p.mode) === 0; } },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'ears', label: 'Ear shape', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Fox', 'Wolf', 'Fennec'] },
        { group: 'Head', key: 'earSize', label: 'Ear size', unit: '×', min: 0.7, max: 1.3, step: 0.05, value: 1 },
        { group: 'Head', key: 'snout', label: 'Snout (short ↔ long)', unit: '×', min: 0, max: 1, step: 0.05, value: 0.6 },
        { group: 'Head', key: 'ruff', label: 'Cheek fluff', unit: '×', min: 0, max: 1, step: 0.05, value: 0.5 },
        { group: 'Head', key: 'eye', label: 'Eye size', unit: ' mm', min: 2, max: 4.5, step: 0.1, value: 3 },
        { group: 'Head', key: 'howl', label: 'Howl angle (head tilt)', unit: '°', min: 35, max: 70, step: 1, value: 58, showIf: function (p) { return Math.round(p.pose) === 1; } },
        { group: 'Tail', key: 'tail', label: 'Tail size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1, showIf: function (p) { return Math.round(p.mode) === 1; } },
        { group: 'Tail', key: 'curl', label: 'Tail curl (straight ↔ wrapped)', unit: '%', min: 0, max: 100, step: 5, value: 45, showIf: function (p) { return Math.round(p.mode) === 1; } },
        { group: 'Tail', key: 'tip', label: 'Tail tip', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Plain', 'Tipped'], showIf: function (p) { return Math.round(p.mode) === 1; } }
      ];

      window.MM_GENERATOR = {
        code: 'MM-127',
        category: 'ANIMALS // WILDLIFE',
        title: 'Fox & Wolf',
        fileName: 'FoxWolf',
        defaultColor: '#e8863a',
        palette: [
          { name: 'Fox Orange', color: '#e8863a' }, { name: 'Wolf Grey', color: '#8a94a3' },
          { name: 'Snow White', color: '#f1f5f9' }, { name: 'Shadow Slate', color: '#334155' },
          { name: 'Desert Sand', color: '#e3bd84' }, { name: 'Cocoa Brown', color: '#8b5a3c' },
          { name: 'Moon Silver', color: '#c9d1dc' }, { name: 'Sunny Yellow', color: '#fde047' }
        ],
        partNames: { body: 'Body', chest: 'Chest', socks: 'Paws and socks', base: 'Base', head: 'Head', ruff: 'Cheek fluff', muzzle: 'Muzzle', jaw: 'Chin and lips', ears: 'Ears', 'inner ears': 'Inner ears', tail: 'Tail', tip: 'Tail tip', nose: 'Nose', eyes: 'Eyes', pupils: 'Pupils', glints: 'Eye glints' },
        parameters: FOX_PARAMS,
        presets: makePresets(FOX_PARAMS, [
          ['Default fox', {}],
          ['Fox bust', { mode: 0 }],
          ['Howling wolf', { pose: 1, coat: 1, ears: 1, snout: 0.8, ruff: 0.9, build: 1.1, tip: 0, curl: 30 }],
          ['Wolf bust', { mode: 0, coat: 1, ears: 1, snout: 0.8, ruff: 0.9, headSize: 1.1 }],
          ['Fennec fox', { coat: 3, ears: 2, snout: 0.15, ruff: 0.3, eye: 3.8, size: 80, tip: 0, headSize: 1.15 }],
          ['Arctic fox', { coat: 2, ears: 1, earSize: 0.8, snout: 0.35, ruff: 0.9, tail: 1.3, curl: 70, tip: 0 }],
          ['Low-poly fox', { facets: 2 }],
          ['Low-poly wolf bust', { mode: 0, coat: 1, ears: 1, snout: 0.8, facets: 2 }]
        ]),
        sculpt: sculptModule([
          { id: 'head', label: 'Head', section: 'Head' }, { id: 'muzzle', label: 'Muzzle', section: 'Head', parent: 'head' }, { id: 'nose', label: 'Nose', section: 'Head', parent: 'muzzle' },
          { id: 'earL', label: 'Left ear', section: 'Head' }, { id: 'earR', label: 'Right ear', section: 'Head' },
          { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' },
          { id: 'frontL', label: 'Left front leg', section: 'Legs' }, { id: 'frontR', label: 'Right front leg', section: 'Legs' }, { id: 'hindL', label: 'Left hind leg', section: 'Legs' }, { id: 'hindR', label: 'Right hind leg', section: 'Legs' }
        ]),
        build: buildFox
      };
