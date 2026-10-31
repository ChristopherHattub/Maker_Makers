      // -----------------------------------------------------------------------
      // Unicorn & Pegasus: a horse kneeling on the bed, legs folded, neck climbing to a head corbelled over the chest.
      // Horn, ears and mane locks rise upward, the tail flows along the bed and the wings fold up in leaning plates.
      // -----------------------------------------------------------------------
      function buildUnicorn(p, api) {
        var sc = new Scene(), S = new Sculpt(1.6).useEdits(api, p.size), kind = Math.round(p.kind), coat = '#f8fafc', mane = '#d8b4fe', mane2 = '#f9a8d4', hoof_ = '#fde047', B = p.bulk, N = p.neck, hs = p.head, i;
        var hasHorn = kind === 0 || kind === 2, hasWings = kind === 1 || kind === 2;
        var pose = Math.round(p.pose), nb, nt, nm, manePts, tailStrands, wingY, wingX;
        S.piece('torso');
        if (pose === 0) { // kneeling, legs folded on the bed
          S.ell('body', [0, 21 * B, 0], [34 * B, 22 * B, 17.5 * B], coat, 5);
          [-1, 1].forEach(function (s) {
            S.piece('torso');
            S.ell('body', [-20 * B, 17 * B, s * 11 * B], [17 * B, 17 * B, 9.5 * B], coat, 4);
            var fz = s * 13 * B, fx = 19 * B;
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('legs', [[fx, 13, s * 13 * B, 7.4], [fx + 14, 4.4, fz + s * 2, 6.2], [fx + 25, 3.6, fz + s * 1, 5.2]], coat, 3);
            S.ell('hooves', [fx + 30, 3.6, fz + s * 0.5], [5.8, 4, 5], hoof_, 1);
            var rz = s * 21 * B;
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.path('legs', [[-26 * B, 4, rz * 0.82, 6], [-6 * B, 3.4, rz, 5.2], [9 * B, 3, rz, 4.4]], coat, 2.5);
            S.ell('hooves', [13 * B, 3, rz], [5.2, 3.6, 4.6], hoof_, 1);
          });
          nb = [13 * B, 20 * B, 0]; nt = [24 * B + 13 * N, 26 * B + 32 * N, 0];
          manePts = { x0: nb[0] + 1, y0: nb[1] + 15 };
          tailStrands = [[-32 * B + 8, 5], [-32 * B - p.tail * 0.35, 3.4], [-32 * B - p.tail * 0.72, 2.8], [-32 * B - p.tail, 1.4]];
          wingY = 30 * B; wingX = 9 * B;
        } else if (pose === 1) { // standing square on all four legs
          var by = 44;
          S.ell('body', [0, by, 0], [33 * B, 17 * B, 15 * B], coat, 5);
          S.ell('body', [-17 * B, by + 1, 0], [18 * B, 18 * B, 15.5 * B], coat, 6);
          [-1, 1].forEach(function (s) {
            var fz = s * 9.5 * B;
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('legs', [[21 * B, by - 4, fz, 7], [22 * B, 24, fz, 4.6], [22 * B, 11, fz, 3.8], [22 * B, 5, fz, 4.2]], coat, 2.5);
            S.ell('hooves', [22.5 * B, 2.8, fz], [5.4, 3.4, 5.2], hoof_, 1);
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('legs', [-23 * B, by - 8, fz], [10 * B, 14, 7], coat, 3);
            S.path('legs', [[-25 * B, by - 16, fz, 6], [-29 * B, 20, fz, 4.4], [-25 * B, 11, fz, 3.8], [-25 * B, 5, fz, 4.2]], coat, 2.5);
            S.ell('hooves', [-24.5 * B, 2.8, fz], [5.4, 3.4, 5.2], hoof_, 1);
          });
          nb = [22 * B, by + 3, 0]; nt = [33 * B + 11 * N, by + 37 * N, 0];
          manePts = { x0: nb[0] - 1, y0: nb[1] + 13 };
          tailStrands = null;
          wingY = by + 8; wingX = 8 * B;
        } else { // rearing on the hind legs with the front hooves up
          S.ell('body', [-12 * B, 22, 0], [20 * B, 23, 15 * B], coat, 6);
          S.path('body', [[-10 * B, 28, 0, 16 * B], [2 * B, 44, 0, 14.5 * B], [12 * B, 58, 0, 12.5 * B]], coat, 7);
          [-1, 1].forEach(function (s) {
            var fz = s * 9.5 * B;
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('legs', [-12 * B, 20, s * 12 * B], [14, 22, 8], coat, 3);
            S.path('legs', [[-10 * B, 12, s * 12 * B, 6], [-1, 6, s * 12 * B, 4.2], [4, 4.4, s * 12 * B, 4]], coat, 2.5);
            S.ell('hooves', [9, 2.9, s * 12 * B], [5.6, 3.4, 5.2], hoof_, 1);
            S.piece(s < 0 ? 'frontL' : 'frontR');
            S.path('legs', [[12 * B, 50, s * 11 * B, 6.6], [19 * B, 60, s * 14 * B, 4.8], [24 * B, 70, s * 15 * B, 3.9]], coat, 2.5);
            S.ell('hooves', [25.5 * B, 75, s * 15 * B], [4.4, 4.8, 4.2], hoof_, 1);
          });
          nb = [14 * B, 58, 0]; nt = [24 * B + 9 * N, 58 + 34 * N, 0];
          manePts = { x0: nb[0] - 1, y0: nb[1] + 12 };
          tailStrands = [[-22 * B, 7], [-30 * B - p.tail * 0.35, 3.4], [-30 * B - p.tail * 0.72, 2.8], [-30 * B - p.tail, 1.4]];
          wingY = 40; wingX = 4 * B;
        }
        // neck, arched, climbing from the chest
        nm = [lerp(nb[0], nt[0], 0.46), lerp(nb[1], nt[1], 0.54), 0];
        S.piece('neck');
        S.path('body', [nb.concat([pose === 0 ? 14 * B : 12.5 * B]), nm.concat([10.5]), nt.concat([8.2])], coat, 7);
        // head: skull, tapering nose and soft muzzle
        var hy = nt[1] + 7 * hs, hx = nt[0] + 7 * hs;
        S.piece('head', 'neck');
        S.ell('head', [hx, hy, 0], [13 * hs, 10.5 * hs, 9.2 * hs], coat, 5);
        S.path('head', [[hx + 4 * hs, hy - 0.5 * hs, 0, 8.2 * hs], [hx + 16 * hs, hy - 3.5 * hs, 0, 6.3 * hs]], coat, 3);
        S.ell('muzzle', [hx + 19 * hs, hy - 4.5 * hs, 0], [6.8 * hs, 6 * hs, 6.8 * hs], '#fbcfe8', 1.6);
        [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'earL' : 'earR', 'head');
          var ear = [hx - 7 * hs, hy + 6.5 * hs, s * 5 * hs];
          S.path('ears', [ear.concat([3.4 * hs]), [ear[0] - 0.6, ear[1] + 6 * hs, ear[2] + s * 1.4, 2.5 * hs], [ear[0] - 0.8, ear[1] + 11.5 * hs, ear[2] + s * 2, 0.7]], coat, 1.2);
        });
        if (hasHorn) { // spiral horn: bands pressed around a tapering cone
          S.piece('horn', 'head');
          var hb = [hx + 3 * hs, hy + 7.5 * hs, 0], hl = p.horn, ht = [hb[0] + hl * 0.46, hb[1] + hl, 0], hd = vnorm(vsub(ht, hb));
          S.path('horn', [hb.concat([3.6 * hs]), ht.concat([0.7])], '#fde047', 0.8);
          S.relief([Math.min(hb[0], ht[0]) - 5, hb[1] + 1, -5], [Math.max(hb[0], ht[0]) + 5, ht[1] + 2, 5], function (x, y, z) {
            var q = vsub([x, y, z], hb), along = vdot(q, hd), rad = vsub(q, vmul(hd, along));
            return Math.hypot(rad[0], rad[1], rad[2]) > 6 ? 0 : 0.55 * Math.pow(Math.abs(Math.sin(along * 0.62 + Math.atan2(z, rad[0] * hd[1] - rad[1] * hd[0]))), 3);
          });
        }
        // mane: flowing locks along the back of the neck, in two colours
        S.piece('mane', 'neck');
        var locks = Math.round(p.mane);
        for (i = 0; i < locks; i++) {
          var t = (i + 0.5) / locks, cx = lerp(manePts.x0, nt[0], t) - lerp(12, 6.5, t), cy = lerp(manePts.y0, nt[1] + 5, t), L = p.lock * lerp(1.15, 0.85, t), off = i % 2 ? 2.8 : -2.8;
          S.path(i % 2 ? 'mane' : 'mane 2', [[cx + 5, cy - 3, off, 4.4], [cx - L * 0.36, cy + L * 0.56, off * 1.5, 3.4], [cx - L * 0.5, cy + L * 1.08, off * 1.7, 0.9]], i % 2 ? mane : mane2, 1.5);
        }
        S.path('mane 2', [[hx - 6 * hs, hy + 8 * hs, 0, 3.8], [hx + 1 * hs, hy + 13 * hs, s0(1), 2.8], [hx + 5 * hs, hy + 19 * hs, 0, 0.8]], mane2, 1.2); // forelock
        // tail: three strands, flowing along the bed or hanging down to it
        S.piece('tail');
        var tl = p.tail;
        [[-7, mane], [0, mane2], [7, mane]].forEach(function (st, si) {
          var name = si === 1 ? 'mane 2' : 'tail', z = st[0];
          if (tailStrands) {
            var T = tailStrands;
            S.path(name, [[T[0][0], T[0][1], z * 0.3, 6.4], [T[1][0], T[1][1], z + tl * 0.2, 5.4], [T[2][0], T[2][1], z * 1.4 + tl * 0.22, 4.4], [T[3][0], T[3][1], z * 1.8 - tl * 0.1, 1.6]], st[1], 1.4);
          } else {
            var rx = -36 * B, ry = 50;
            S.path(name, [[rx + 6, ry, z * 0.25, 5], [rx - 6, ry - 12, z * 0.5, 5.4], [rx - 11 - tl * 0.1, ry - 30, z * 0.8, 4.8], [rx - 12 - tl * 0.14, 3.2, z, 4.2], [rx - 12 - tl * 0.14, 0.8, z, 4.2]], st[1], 1.4);
          }
        });
        // wings: fan plates with stepped feather tips, ribbed down the feathers
        if (hasWings) [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'wingL' : 'wingR');
          var W = p.wing, y0 = wingY, a = deg(pose === 2 ? 44 : 26), d = [-Math.cos(a), 0, s * Math.sin(a)], root = [wingX, 0, s * 10 * B];
          var fw = [[-4, y0], [W * 0.84, y0 + W * 0.98], [W * 1.02, y0 + W * 1.28], [W * 0.84, y0 + W * 1.26], [W * 0.88, y0 + W * 1.56], [W * 0.66, y0 + W * 1.48], [W * 0.66, y0 + W * 1.8], [W * 0.42, y0 + W * 1.64], [W * 0.36, y0 + W * 1.94], [W * 0.1, y0 + W * 1.56], [-4, y0 + W * 0.9]];
          S.plate('wings', fw, root, d, 3.4, '#bae6fd', 1.8, 1.2);
          [[0.92, 1.22], [0.78, 1.5], [0.58, 1.72], [0.32, 1.84]].forEach(function (e) {
            S.path('feathers', [[root[0] + d[0] * 2, y0 + W * 0.28, root[2] + d[2] * 2, 2.2], [root[0] + d[0] * W * e[0], y0 + W * e[1], root[2] + d[2] * W * e[0], 1.5]], '#e0f2fe', 0.8);
          });
        });
        S.reach = pose === 2 ? 0.92 : 0.72;
        S.run();
        [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'eyeL' : 'eyeR', e = S.face(id, [hx + 2 * hs, hy + 3 * hs, s * 60], [0, 0, -s], 'head');
          var nid = s < 0 ? 'nostrilL' : 'nostrilR', ns = S.face(nid, [hx + 80, hy - 3 * hs, s * 3.2 * hs], [-1, 0, 0], 'head');
          if (ns) { sc.add('nostrils', 'b', dome(ns.p, ns.n, 1.3 * hs * ns.k), '#f472b6'); S.addon(nid, ns.p, 1.3 * hs * ns.k); }
          if (!e) return;
          var R = 3.3 * hs * e.k;
          S.addon(id, e.p, R);
          sc.add('eyes', 'b', dome(e.p, e.n, R, { angle: 46, seg: 24 }), '#312e81');
          sc.add('eyes', 'b', dome(vadd(e.p, vadd(vmul(e.n, R * 0.34), [0.8, R * 0.34, 0])), e.n, R * 0.28, { sink: 0.4 }), '#312e81');
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size, S);
      }
      function s0(v) { return v; }
      var UNICORN_PARAMS = [
        { group: 'Creature', key: 'kind', label: 'Type', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['Unicorn', 'Pegasus', 'Winged unicorn', 'Pony'] },
        { group: 'Creature', key: 'pose', label: 'Pose', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Kneeling', 'Standing', 'Rearing'] },
        { group: 'Creature', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Creature', key: 'bulk', label: 'Body (slim ↔ stocky)', unit: '×', min: 0.85, max: 1.2, step: 0.05, value: 1 },
        { group: 'Head', key: 'neck', label: 'Neck length', unit: '×', min: 0.9, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'head', label: 'Head size', unit: '×', min: 0.85, max: 1.2, step: 0.05, value: 1 },
        { group: 'Head', key: 'horn', label: 'Horn length', unit: ' mm', min: 14, max: 40, step: 1, value: 26 },
        { group: 'Hair', key: 'mane', label: 'Mane locks', unit: '', min: 3, max: 9, step: 1, value: 6 },
        { group: 'Hair', key: 'lock', label: 'Lock length', unit: ' mm', min: 8, max: 22, step: 1, value: 14 },
        { group: 'Hair', key: 'tail', label: 'Tail length', unit: ' mm', min: 16, max: 50, step: 1, value: 38 },
        { group: 'Wings', key: 'wing', label: 'Wing size', unit: ' mm', min: 18, max: 36, step: 1, value: 28 }
      ];
      window.MM_GENERATOR = {
        code: 'MM-090',
        category: 'ANIMALS // FANTASY',
        title: 'Unicorn & Pegasus',
        fileName: 'Unicorn',
        defaultColor: '#f1f5f9',
        palette: ANIMAL_PALETTE,
        partNames: { 'mane 2': 'Mane, second colour', feathers: 'Feathers', muzzle: 'Muzzle', body: 'Body', legs: 'Legs', hooves: 'Hooves', neck: 'Neck', head: 'Head', nostrils: 'Nostrils', eyes: 'Eyes', ears: 'Ears', horn: 'Horn', mane: 'Mane', tail: 'Tail', wings: 'Wings' },
        parameters: UNICORN_PARAMS,
        presets: makePresets(UNICORN_PARAMS, [
          ['Default unicorn', {}],
          ['Pegasus', { kind: 1 }],
          ['Winged unicorn', { kind: 2, wing: 32, horn: 30 }],
          ['Little pony', { kind: 3, size: 0.75, head: 1.2, neck: 0.9, bulk: 1.1, mane: 8 }],
          ['Standing unicorn', { pose: 1 }],
          ['Rearing pegasus', { pose: 2, kind: 1 }],
          ['Long-maned unicorn', { mane: 9, lock: 17, tail: 50, horn: 36 }]
        ]),
        sculpt: sculptModule([
          { id: 'neck', label: 'Neck', section: 'Head' }, { id: 'head', label: 'Head', section: 'Head' }, { id: 'horn', label: 'Horn', section: 'Head' }, { id: 'earL', label: 'Left ear', section: 'Head' }, { id: 'earR', label: 'Right ear', section: 'Head' }, { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'nostrilL', label: 'Left nostril', section: 'Head' }, { id: 'nostrilR', label: 'Right nostril', section: 'Head' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'mane', label: 'Mane', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' }, { id: 'wingL', label: 'Left wing', section: 'Body' }, { id: 'wingR', label: 'Right wing', section: 'Body' },
          { id: 'frontL', label: 'Left front leg', section: 'Legs' }, { id: 'frontR', label: 'Right front leg', section: 'Legs' }, { id: 'hindL', label: 'Left hind leg', section: 'Legs' }, { id: 'hindR', label: 'Right hind leg', section: 'Legs' }
        ]),
        build: buildUnicorn
      };
