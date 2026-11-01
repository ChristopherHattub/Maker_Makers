      // -----------------------------------------------------------------------
      // Horse Builder: a horse, pony or unicorn, standing, kneeling or rearing, sculpted as one seamless surface
      // -----------------------------------------------------------------------
      function buildHorse(p, api) {
        var kind0 = Math.round(p.kind), sc = new Scene(), S = new Sculpt(1.35).useEdits(api, p.size), kind = kind0, coat = ['#8a5a33', '#a97142', '#f8fafc'][kind0], mane = ['#2b1d14', '#efe3cf', '#d8b4fe'][kind0], mane2 = ['#3a281b', '#dccbb0', '#f9a8d4'][kind0], hoof_ = ['#2f2620', '#3b2f26', '#fde047'][kind0], snoutC = ['#4a3020', '#6b4a2e', '#f3e1ea'][kind0], B = p.bulk, N = p.neck, hs = p.head, i;
        var hasHorn = kind === 2, wx = p.bar;
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
            S.path('legs', [[21 * B, by - 4, fz, 6.4 * wx], [22 * B, 26, fz, 4 * wx], [22 * B, 22, fz, 4.4 * wx], [22 * B, 11, fz, 2.9 * wx], [22 * B, 5, fz, 3.6 * wx]], coat, 2);
            S.ell('hooves', [22.5 * B, 2.8, fz], [5.4, 3.4, 5.2], hoof_, 1);
            S.piece(s < 0 ? 'hindL' : 'hindR');
            S.ell('legs', [-23 * B, by - 8, fz], [10 * B, 14, 7], coat, 3);
            S.path('legs', [[-25 * B, by - 16, fz, 5.6 * wx], [-29 * B, 22, fz, 3.9 * wx], [-25 * B, 11, fz, 2.9 * wx], [-25 * B, 5, fz, 3.6 * wx]], coat, 2);
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
        S.ell('head', [hx, hy, 0], [12 * hs, 10 * hs, 8.2 * hs], coat, 5);
                [-1, 1].forEach(function (s) {
          S.piece(s < 0 ? 'earL' : 'earR', 'head');
          var ear = [hx - 7 * hs, hy + 6 * hs, s * 4.6 * hs];
          S.path('ears', [ear.concat([3 * hs]), [ear[0] - 0.4, ear[1] + 5 * hs, ear[2] + s * 1, 2.4 * hs], [ear[0] - 0.2, ear[1] + 10.5 * hs, ear[2] + s * 1.4, 0.6]], coat, 1.2);
        });
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
        S.reach = pose === 2 ? 0.92 : 0.6;
        S.run();
        // head: one smooth form sloping down from the poll, so it reads as a horse and prints without support
        var skull = [hx + 1 * hs, hy + 1 * hs, 0], cheek = [hx + 6 * hs, hy - 5 * hs, 0], snout = [hx + 12 * hs, hy - 14 * hs, 0], nose = [hx + 15 * hs, hy - 21 * hs, 0];
        S.shell(sc, 'head', 'head', 'b', sweep([skull.concat([8.6 * hs]), cheek.concat([8 * hs]), snout.concat([5.4 * hs]), nose.concat([4.9 * hs])], { seg: 28, per: 28, floor: null }), coat, 'neck');
        S.shell(sc, 'head', 'muzzle', 'b', sweep([[snout[0] + 1.9 * hs, snout[1] - 4.2 * hs, 0, 5.45 * hs], [nose[0], nose[1], 0, 5.3 * hs], [nose[0] + 0.7 * hs, nose[1] - 2.2 * hs, 0, 3.4 * hs]], { seg: 16, per: 28, floor: null }), snoutC, 'neck');
        if (Math.round(p.blaze) === 1) S.shell(sc, 'head', 'blaze', 'b', sweep([[hx + 8 * hs, hy + 3.5 * hs, 0, 1.6 * hs], [hx + 12.2 * hs, hy - 2.6 * hs, 0, 2.4 * hs], [hx + 16.3 * hs, hy - 11.2 * hs, 0, 1.5 * hs]], { seg: 14, per: 14, floor: null }), '#f8fafc', 'neck');
        if (hasHorn) { // spiral horn: a smooth cone wrapped by one raised band
          var hb = [hx + 6 * hs, hy + 6 * hs, 0], hl = p.horn, ht = [hb[0] + hl * 0.46, hb[1] + hl, 0], coil = [];
          S.shell(sc, 'horn', 'horn', 'b', sweep([hb.concat([3.6 * hs]), ht.concat([0.6])], { seg: 28, per: 22, floor: null }), '#fde047', 'head');
          for (i = 0; i <= 48; i++) {
            var cu = i / 48, ca = cu * Math.PI * 8, cr = lerp(3.6 * hs, 0.6, cu) * 0.96;
            coil.push([lerp(hb[0], ht[0], cu) + Math.cos(ca) * cr * 0.9, lerp(hb[1], ht[1], cu) - Math.cos(ca) * cr * 0.42, Math.sin(ca) * cr, lerp(0.75, 0.3, cu)]);
          }
          S.shell(sc, 'horn', 'horn band', 'b', sweep(coil, { seg: 96, per: 8, floor: null }), '#f59e0b', 'head');
        }
        [-1, 1].forEach(function (s) {
          var n = vnorm([0.3, 0.3, s]), ep = vadd(cheek, vmul(n, 7.8 * hs));
          softEyeOn(sc, S, s < 0 ? 'eyeL' : 'eyeR', s < 0 ? 'pupilL' : 'pupilR', { surf: function () { return { p: ep, n: n }; } }, 0, 0, 'head', 2.7 * hs, kind === 2 ? '#4338ca' : '#3f2413');
          var nid = s < 0 ? 'nostrilL' : 'nostrilR', nn = vnorm([0.85, -0.25, s * 0.5]), np = vadd([nose[0] + 0.8 * hs, nose[1] - 1 * hs, 0], vmul(nn, 4.2 * hs));
          S.parents[nid] = 'head'; S.pivots[nid] = np;
          if (!S.deleted(nid)) { var nq = S.xf(nid, np); S.addon(nid, nq, 1.2 * hs); sc.add('nostrils', 'b', dome(nq, nn, 1.2 * hs, { angle: 30, seg: 14 }), kind === 2 ? '#f472b6' : '#1c1410'); }
        });
        [-1, 1].forEach(function (s) {
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size, S);
      }
      function s0(v) { return v; }
      var UNICORN_PARAMS = [
        { group: 'Creature', key: 'kind', label: 'Type', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Horse', 'Pony', 'Unicorn'] },
        { group: 'Creature', key: 'pose', label: 'Pose', unit: '', min: 0, max: 2, step: 1, value: 1, options: ['Kneeling', 'Standing', 'Rearing'] },
        { group: 'Creature', key: 'bar', label: 'Leg thickness', unit: '×', min: 0.85, max: 1.3, step: 0.05, value: 1 },
        { group: 'Creature', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Creature', key: 'bulk', label: 'Body (slim ↔ stocky)', unit: '×', min: 0.85, max: 1.2, step: 0.05, value: 1 },
        { group: 'Head', key: 'neck', label: 'Neck length', unit: '×', min: 0.9, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'head', label: 'Head size', unit: '×', min: 0.85, max: 1.2, step: 0.05, value: 1 },
        { group: 'Head', key: 'horn', label: 'Horn length', unit: ' mm', min: 14, max: 40, step: 1, value: 26 },
        { group: 'Markings', key: 'blaze', label: 'White blaze on the face', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['Off', 'On'] },
        { group: 'Hair', key: 'mane', label: 'Mane locks', unit: '', min: 3, max: 9, step: 1, value: 6 },
        { group: 'Hair', key: 'lock', label: 'Lock length', unit: ' mm', min: 8, max: 22, step: 1, value: 14 },
        { group: 'Hair', key: 'tail', label: 'Tail length', unit: ' mm', min: 16, max: 50, step: 1, value: 38 },
      ];
      window.MM_GENERATOR = {
        code: 'MM-090',
        category: 'ANIMALS // WILDLIFE',
        title: 'Horse Builder',
        fileName: 'Horse',
        defaultColor: '#8a5a33',
        palette: ANIMAL_PALETTE,
        partNames: { 'mane 2': 'Mane, second colour', muzzle: 'Muzzle', body: 'Body', legs: 'Legs', hooves: 'Hooves', neck: 'Neck', head: 'Head', nostrils: 'Nostrils', blaze: 'Blaze', eyes: 'Eyes', ears: 'Ears', horn: 'Horn', 'horn band': 'Horn spiral', mane: 'Mane', tail: 'Tail', wings: 'Wings' },
        parameters: UNICORN_PARAMS,
        presets: makePresets(UNICORN_PARAMS, [
          ['Default horse', {}],
          ['Rearing horse', { pose: 2 }],
          ['Resting horse', { pose: 0 }],
          ['Pony', { kind: 1, size: 0.8, head: 1.2, neck: 0.9, bulk: 1.1, mane: 8 }],
          ['Unicorn', { kind: 2, blaze: 0, mane: 8, horn: 30 }],
          ['Long-maned horse', { mane: 9, lock: 17, tail: 50 }]
        ]),
        sculpt: sculptModule([
          { id: 'neck', label: 'Neck', section: 'Head' }, { id: 'head', label: 'Head', section: 'Head' }, { id: 'horn', label: 'Horn', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' }, { id: 'earL', label: 'Left ear', section: 'Head' }, { id: 'earR', label: 'Right ear', section: 'Head' }, { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'nostrilL', label: 'Left nostril', section: 'Head' }, { id: 'nostrilR', label: 'Right nostril', section: 'Head' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'mane', label: 'Mane', section: 'Body' }, { id: 'tail', label: 'Tail', section: 'Body' },
          { id: 'frontL', label: 'Left front leg', section: 'Legs' }, { id: 'frontR', label: 'Right front leg', section: 'Legs' }, { id: 'hindL', label: 'Left hind leg', section: 'Legs' }, { id: 'hindR', label: 'Right hind leg', section: 'Legs' }
        ]),
        build: buildHorse
      };
