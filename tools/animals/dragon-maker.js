      // -----------------------------------------------------------------------
      // Dragon Maker: a sitting dragon sculpted as one seamless surface: folded wings, horns, belly plates, spade tail
      // -----------------------------------------------------------------------
      function buildDragon(p, api) {
        var sc = new Scene(), S = new Sculpt(1.1).useEdits(api), later = [], hs = p.headSize, col = '#8b6fd6', belly = '#f2dfa0', dark = '#5b3fb0', pale = '#d8cdf5', L = p.tailLen, c = p.curl, pose = Math.round(p.pose), i;
        var hr = 15.5 * hs, H, tailPts, back, wing, grooves = null;
        function foot(x, z, s, k) { // a clawed foot flat on the bed
          k = k || 1;
          S.ell('feet', [x, 3.2 * k, z], [11 * k, 3.6 * k, 6.4 * k], dark, 2);
          for (var t = -1; t <= 1; t++) {
            S.path('feet', [[x + 7 * k, 2.8 * k, z + t * 3 * k, 2.2 * k], [x + 13 * k, 2.2 * k, z + t * 4.2 * k, 1.8 * k]], dark, 1);
            S.path('claws', [[x + 13 * k, 2 * k, z + t * 4.2 * k, 1.7 * k], [x + 17 * k, 1.3, z + t * 4.8 * k, 0.5]], pale, 0.4);
          }
        }
        S.piece('torso');
        if (pose === 0) { // sitting up, tail curled along the bed
          S.ell('body', [-5, 18, 0], [22, 20, 18], col, 5);
          S.path('body', [[0, 26, 0, 16], [8, 44, 0, 12.5], [11, 58, 0, 9.5], [9, 70, 0, 8.5], [14, 80, 0, 8]], col, 7);
          S.paint('belly', [14, 36, 0], [12, 32, 10], belly);
          grooves = { x0: 15, dx: 1.1, y0: 16, dy: 8.5, n: 6, w: 8 };
          H = { x: 22, y: 90, z: 0 };
          tailPts = [[-20, 8, 0, 11], [-40 * L, 5.4, 9 * c, 7.6], [-62 * L, 3.4, 12 * c + 2, 4.8], [-82 * L, 2.1, 4 * c, 2.8]];
          back = [[3, 78], [1, 62], [-5, 47], [-14, 36], [-24, 27]];
          wing = { x: -4, z: 9, y0: 42, a: 30, k: 1 };
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-8, 14, s * 14], [16, 14, 8], col, 4);
            foot(10, s * 14, s);
            S.piece(s < 0 ? 'armL' : 'armR');
            S.path('arms', [[9, 42, s * 10, 3.8], [15, 37, s * 11, 3], [19, 42, s * 9.5, 2.3]], dark, 2);
            S.path('claws', [[19, 42, s * 9.5, 1.6], [22, 45, s * 9.2, 0.5]], pale, 0.4);
          });
        } else if (pose === 1) { // prowling on all fours, head low and forward
          S.ell('body', [-2, 17, 0], [31, 18, 17], col, 6);
          S.path('body', [[20, 20, 0, 12.5], [32, 33, 0, 9.8], [40, 45, 0, 8.4]], col, 6);
          S.paint('belly', [22, 22, 0], [15, 16, 9], belly);
          H = { x: 50, y: 53, z: 0 };
          tailPts = [[-26, 8, 0, 11], [-46 * L, 5.4, 8 * c, 7.6], [-68 * L, 3.4, 12 * c, 4.8], [-90 * L, 2.1, 3 * c, 2.8]];
          back = [[34, 46], [22, 37], [8, 36], [-10, 35], [-26, 26]];
          wing = { x: -6, z: 10, y0: 26, a: 18, k: 0.78 };
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-19, 15, s * 14], [15, 15, 8], col, 4);
            foot(-6, s * 17, s);
            S.piece(s < 0 ? 'armL' : 'armR');
            S.path('arms', [[20, 20, s * 12, 6], [30, 11, s * 15, 4.8], [34, 5, s * 15, 4]], col, 3);
            foot(38, s * 15, s, 0.8);
          });
        } else if (pose === 2) { // rearing up with wings raised
          S.ell('body', [-6, 18, 0], [20, 19, 17], col, 5);
          S.path('body', [[-2, 28, 0, 15], [6, 52, 0, 12.5], [10, 72, 0, 10], [8, 88, 0, 8.6], [13, 100, 0, 8]], col, 7);
          S.paint('belly', [12, 44, 0], [11, 38, 9], belly);
          grooves = { x0: 13, dx: 0.9, y0: 18, dy: 9, n: 7, w: 7.5 };
          H = { x: 21, y: 110, z: 0 };
          tailPts = [[-20, 8, 0, 11], [-40 * L, 5.4, 7 * c, 7.6], [-62 * L, 3.4, 10 * c, 4.8], [-82 * L, 2.1, 3 * c, 2.8]];
          back = [[3, 98], [0, 80], [-6, 62], [-14, 44], [-24, 28]];
          wing = { x: -2, z: 10, y0: 54, a: 54, k: 1.12 };
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-8, 14, s * 14], [15, 14, 8], col, 4);
            foot(10, s * 15, s, 1.05);
            S.piece(s < 0 ? 'armL' : 'armR');
            S.path('arms', [[10, 66, s * 9, 4.6], [17, 74, s * 13, 3.6], [21, 86, s * 15, 2.8]], dark, 2.2);
            for (var t = -1; t <= 1; t++) S.path('claws', [[21, 87, s * 15 + t * 1.3, 1.5], [22 + t, 93, s * 15 + t * 2.5, 0.5]], pale, 0.4);
          });
        } else { // asleep, curled round with its tail tucked in and chin on the bed
          S.ell('body', [-6, 14, -3], [28, 17, 22], col, 6);
          S.path('body', [[12, 12, 11, 12], [26, 8.5, 15, 9.8], [36, 7, 11, 8.6]], col, 6);
          H = { x: 47, y: 9.5, z: 6 };
          hr *= 0.8;
          tailPts = [[-28, 7, -8, 10], [-26 * L, 5, -29, 7.6], [-6, 3.6, -36 * Math.min(L, 1.15), 5.4], [16, 2.6, -31 * Math.min(L, 1.15), 3.8], [30, 2, -17, 2.6]];
          back = [[6, 29], [-4, 31], [-14, 30], [-24, 26], [-30, 16]];
          wing = { x: -8, z: 14, y0: 14, a: 8, k: 0.62 };
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('body', [-18, 12, s * 16 - 3], [14, 11, 8], col, 3);
            foot(-4, s * 21 - 3, s, 0.85);
            S.piece(s < 0 ? 'armL' : 'armR');
            S.path('arms', [[18, 7, s * 8 + 14, 5], [30, 3.4, s * 8 + 20, 3.8]], col, 2);
            foot(34, s * 8 + 21, s, 0.7);
          });
        }
        if (grooves) {
          S.piece('torso');
          for (i = 0; i < grooves.n; i++) { var by = grooves.y0 + i * grooves.dy, bx = grooves.x0 + i * grooves.dx; S.path(null, [[bx + 1.5, by, -grooves.w, 0.55], [bx + 4.7, by - 1, 0, 0.6], [bx + 1.5, by, grooves.w, 0.55]], null, 0, 3).carve(1.6); }
        }
        // head: skull, long snout with nostrils, jaw, brow, horns and cheek spines
        var hx = H.x, hy = H.y, hz = H.z, sleep = pose === 3;
        S.piece('head');
        S.ell('head', [hx, hy, hz], [hr * 1.02, hr * 0.74, hr * 0.8], col, 6);
        S.path('head', [[hx + hr * 0.3, hy - hr * 0.02, hz, hr * 0.56], [hx + hr * 1.1, hy - hr * 0.12, hz, hr * 0.42], [hx + hr * 1.62, hy - hr * 0.14, hz, hr * 0.34]], col, 4);
        S.piece('jaw', 'head');
        S.path('jaw', [[hx, hy - hr * 0.42, hz, hr * 0.38], [hx + hr * 1.0, hy - hr * 0.5, hz, hr * 0.26], [hx + hr * 1.5, hy - hr * 0.46, hz, hr * 0.19]], belly, 2);
        [-1, 1].forEach(function (s) {
          S.piece('head');
          S.ell('head', [hx + hr * 1.72, hy + hr * 0.06, hz + s * hr * 0.2], [hr * 0.15, hr * 0.15, hr * 0.14], col, 1.2);          // nostril bump
          S.path('head', [[hx - hr * 0.34, hy + hr * 0.62, hz + s * hr * 0.42, 2.6], [hx + hr * 0.3, hy + hr * 0.56, hz + s * hr * 0.46, 2.2], [hx + hr * 0.7, hy + hr * 0.28, hz + s * hr * 0.36, 1.2]], col, 1.6); // brow
          S.path(null, [[hx + hr * 1.9, hy - hr * 0.33, hz + s * hr * 0.24, 0.75], [hx + hr * 0.9, hy - hr * 0.32, hz + s * hr * 0.46, 0.8], [hx, hy - hr * 0.26, hz + s * hr * 0.72, 0.9]], null, 0).carve(0.55); // mouth line
          S.piece('teeth', 'jaw');
          for (var t = 0; t < 5; t++) { var tx = hx + hr * (0.5 + t * 0.26), tz = hz + s * hr * lerp(0.42, 0.24, t / 4); S.path('teeth', [[tx, hy - hr * 0.4, tz, 1], [tx, hy - hr * 0.2, tz, 0.35]], '#f8fafc', 0.25); }
          var hb = [hx - hr * 0.5, hy + hr * 0.45, hz + s * hr * 0.46], Hn = 20 * p.horns;
          later.push(['horns', 'horns', sweep([[hb[0], hb[1] - 2, hb[2], 4], [hb[0] - Hn * 0.34, hb[1] + Hn * 0.46, hb[2] + s * Hn * 0.08, 2.8], [hb[0] - Hn * 0.46, hb[1] + Hn * 0.78, hb[2] + s * Hn * 0.06, 1.7], [hb[0] - Hn * 0.34, hb[1] + Hn * 1.04, hb[2] + s * Hn * 0.02, 0.45]], { seg: 20, per: 7, floor: null }), '#efe9d8', 'head']);
          var eb = [hx - hr * 0.62, hy + hr * 0.14, hz + s * hr * 0.46];
          later.push(['horns', 'horns', sweep([[eb[0], eb[1] - 1.5, eb[2], 2.7], [eb[0] - 4.5, eb[1] + 7 * p.horns, eb[2] + s * 4, 1.5], [eb[0] - 6, eb[1] + 13 * p.horns, eb[2] + s * 6.4, 0.4]], { seg: 16, per: 6, floor: null }), pale, 'head']);
        });
        // tail on the bed, ending in a spade
        S.piece('tail');
        S.path('tail', tailPts, col, 5);
        var tip = tailPts[tailPts.length - 1], prev = tailPts[tailPts.length - 2], dir = vnorm([tip[0] - prev[0], 0, tip[2] - prev[2]]);
        S.ell('spade', [tip[0] + dir[0] * 5, 1.9, tip[2] + dir[2] * 5], [Math.abs(dir[0]) * 8 + 5, 2.3, Math.abs(dir[2]) * 8 + 5], dark, 1.5);
        S.ell('spade', [tip[0] + dir[0] * 13, 1.9, tip[2] + dir[2] * 13], [Math.abs(dir[0]) * 3.6 + 2, 2.1, Math.abs(dir[2]) * 3.6 + 2], dark, 1.5);
        // back fins follow the neck, the spine and the tail
        var n = Math.round(p.spines), sz0 = p.spineSize, nk = spline(back.map(function (q) { return [q[0], q[1], 0]; }), 6), tq = spline(tailPts.map(function (a) { return a.slice(0, 3); }), 6);
        for (i = 0; i < n; i++) {
          var u = n > 1 ? i / (n - 1) : 0, x, y, z = sleep ? -3 : 0, H2;
          if (u < 0.42) { var np = nk[Math.round((u / 0.42) * (nk.length - 1))]; x = np[0]; y = np[1]; H2 = 9.5 * sz0; }
          else { var w2 = (u - 0.42) / 0.58, pt = tq[Math.round(w2 * (tq.length - 2))]; x = pt[0]; y = pt[1] + lerp(9, 2, w2); z = pt[2]; H2 = lerp(9, 4, w2) * sz0; }
          later.push(['spines', 'spines', vslab([[-H2 * 0.4, y - 9], [H2 * 0.5, y - 9], [H2 * 0.66, y - 2], [H2 * 0.34, y + H2 * 0.3], [H2 * 0.02, y + H2 * 0.62], [-H2 * 0.42, y + H2], [-H2 * 0.5, y + H2 * 0.5], [-H2 * 0.66, y - 2]], [x + 2.5, 0, z], [1, 0, 0], 2.8, 1), pale, 'torso']);
        }
        // wings: long fingers over a scalloped membrane, with fully rounded edges
        if (p.wings > 0) [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'wingL' : 'wingR';
          if (sleep) { // folded against the flank
            var fz = s * 17 - 3;
            S.piece(id);
            S.ell('wings', [-8, 17, fz], [21 * p.wings, 11, 4.6], pale, 2);
            [-1, 0, 1].forEach(function (f) { S.path('wing ribs', [[6, 21, fz + s * 3.2, 1.3], [-14 + f * 4, 16 + f * 5.5, fz + s * 3.6, 1.05]], dark, 0.5); });
            return;
          }
          var W = p.wings * wing.k, a = deg(wing.a), d = [-Math.cos(a), 0, s * Math.sin(a)], at = [wing.x, 0, s * wing.z], y0 = wing.y0;
          var ends = [[38, 46], [28, 60], [16, 69], [4, 61]], poly = [[-4, y0 - 2], [12 * W, y0 + 13 * W], [26 * W, y0 + 28 * W]];
          ends.forEach(function (e, ei) {
            poly.push([e[0] * W, y0 + e[1] * W]);
            if (ei < ends.length - 1) { // the membrane sags in a soft curve between two fingers
              var nx = ends[ei + 1];
              for (var q = 1; q <= 4; q++) { var u = q / 5; poly.push([lerp(e[0], nx[0], u) * W - Math.sin(u * Math.PI) * 2.2 * W, y0 + lerp(e[1], nx[1], u) * W - Math.sin(u * Math.PI) * 4.6 * W]); }
            }
          });
          poly.push([-4, y0 + 42 * W]);
          later.push([id, 'wings', vslab(poly, at, d, 2.6, 0.9), pale]);
          function pt(sv, yv) { return [at[0] + d[0] * sv, yv, at[2] + d[2] * sv]; }
          ends.forEach(function (e) {
            later.push([id, 'wing ribs', sweep([pt(-1, y0 + 3).concat([2.7]), pt(e[0] * W * 0.5, y0 + e[1] * W * 0.56).concat([2]), pt(e[0] * W, y0 + e[1] * W).concat([0.9])], { seg: 12, per: 8, floor: null }), dark]);
          });
          later.push([id, 'wing ribs', sweep([pt(-2, y0).concat([3]), pt(-1, y0 + 42 * W).concat([1.5])], { seg: 12, per: 4, floor: null }), dark]);
        });
        S.reach = 0.85;
        S.smoothing = 12;
        S.run();
        later.forEach(function (it) { S.shell(sc, it[0], it[1], 'b', it[2], it[3], it[4]); });
        [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'eyeL' : 'eyeR', o = [hx + hr * 0.4, hy + hr * 0.26, hz + s * 90];
          if (sleep) {
            var e = S.face(id, o, [0, 0, -s], 'head');
            if (e) { S.addon(id, e.p, 3); sc.add('eyes', 'b', sweep([[e.p[0] - 3, e.p[1] + 0.6, e.p[2], 0.7], [e.p[0], e.p[1] - 0.4, e.p[2] + s * 0.3, 0.8], [e.p[0] + 3, e.p[1] + 0.6, e.p[2], 0.7]], { seg: 8, per: 4, floor: null }), '#2e1a5e'); }
          } else reptileEye(sc, S, id, s < 0 ? 'pupilL' : 'pupilR', o, [0, 0, -s], 'head', 3 * hs, '#f59e0b', 0.72);
        });
        if (p.gem > 0 && !sleep && pose !== 1) { var g = S.face('gem', [180, pose === 2 ? 60 : 46, 0], [-1, 0, 0], 'torso'); if (g) { sc.add('gem', 'b', dome(g.p, g.n, 3.6 * g.k, { angle: 55, seg: 8 }), '#f0abfc'); S.addon('gem', g.p, 3.6 * g.k); } }
        S.addTo(sc);
        return finishSculpt(sc, 1, S);
      }

      var DRAGON_PARAMS = [
        { group: 'Dragon', key: 'pose', label: 'Pose', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['Sitting', 'Prowling', 'Rearing', 'Asleep'] },
        { group: 'Dragon', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Dragon', key: 'horns', label: 'Horn length', unit: '×', min: 0.5, max: 1.5, step: 0.05, value: 1 },
        { group: 'Dragon', key: 'gem', label: 'Chest gem', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] },
        { group: 'Wings', key: 'wings', label: 'Wing size (0 = none)', unit: '×', min: 0, max: 1.2, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'spines', label: 'Back spikes', unit: '', min: 0, max: 18, step: 1, value: 13, slider: true },
        { group: 'Spine & tail', key: 'spineSize', label: 'Spike size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'tailLen', label: 'Tail length', unit: '×', min: 0.7, max: 1.25, step: 0.05, value: 1 },
        { group: 'Spine & tail', key: 'curl', label: 'Tail curl (straight ↔ curled)', unit: '×', min: 0, max: 2, step: 0.05, value: 1 }
      ];

      window.MM_GENERATOR = {
        code: 'MM-077',
        category: 'ANIMALS // FANTASY',
        title: 'Dragon Maker',
        fileName: 'Dragon',
        defaultColor: '#a78bfa',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly plates', feet: 'Feet', jaw: 'Jaw', teeth: 'Teeth', spade: 'Tail spade', claws: 'Claws', arms: 'Arms', head: 'Head', jaw: 'Jaw', eyes: 'Eyes', pupils: 'Pupils', horns: 'Horns', spines: 'Back spikes', tail: 'Tail', spade: 'Tail spade', wings: 'Wings', 'wing ribs': 'Wing ribs', gem: 'Chest gem' },
        parameters: DRAGON_PARAMS,
        presets: makePresets(DRAGON_PARAMS, [
          ['Default dragon', {}],
          ['Baby dragon', { headSize: 1.25, wings: 0.65, spines: 6, tailLen: 0.75, horns: 0.6 }],
          ['Spiky wyvern', { spines: 14, spineSize: 1.3, horns: 1.5, wings: 1.2 }],
          ['Wingless drake', { wings: 0, headSize: 1.15, horns: 1.2, gem: 0 }],
          ['Curled tail dragon', { curl: 2, tailLen: 1.2 }],
          ['Prowling dragon', { pose: 1, horns: 1.2 }],
          ['Rearing dragon', { pose: 2, spines: 15, horns: 1.3 }],
          ['Sleeping dragon', { pose: 3, wings: 0.9, spines: 10, gem: 0 }]
        ]),
        sculpt: sculptModule([
          { id: 'head', label: 'Head', section: 'Head' }, { id: 'horns', label: 'Horns', section: 'Head' }, { id: 'jaw', label: 'Jaw', section: 'Head', parent: 'head' }, { id: 'teeth', label: 'Teeth', section: 'Head', parent: 'jaw' }, { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'gem', label: 'Chest gem', section: 'Body' }, { id: 'spines', label: 'Back spikes', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' }, { id: 'wingL', label: 'Left wing', section: 'Body' }, { id: 'wingR', label: 'Right wing', section: 'Body' },
          { id: 'armL', label: 'Left arm', section: 'Limbs' }, { id: 'armR', label: 'Right arm', section: 'Limbs' }, { id: 'hindL', label: 'Left leg', section: 'Limbs' }, { id: 'hindR', label: 'Right leg', section: 'Limbs' }
        ]),
        build: buildDragon
      };
