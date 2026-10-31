      // -----------------------------------------------------------------------
      // Unicorn & Pegasus: a horse kneeling on the bed, legs folded, neck climbing to a head corbelled over the chest.
      // Horn, ears and mane locks rise upward, the tail flows along the bed and the wings fold up in leaning plates.
      // -----------------------------------------------------------------------
      function buildUnicorn(p) {
        var sc = new Scene(), kind = Math.round(p.kind), coat = '#f1f5f9', mane = '#d8b4fe', hoof = '#fde047', B = p.bulk, N = p.neck, hs = p.head;
        var hasHorn = kind === 0 || kind === 2, hasWings = kind === 1 || kind === 2;
        var body = pod([0, 22 * B, 0], 34 * B, 23 * B, 17 * B, { flare: 0.7, rings: 34 });
        sc.add('body', 'b', body.tris, coat);
        [-1, 1].forEach(function (sd) {
          sc.add('body', 'b', pod([-19 * B, 17 * B, sd * 11 * B], 16 * B, 17 * B, 9 * B, { flare: 0.75, rings: 20, seg: 30 }).tris, coat); // haunch
          var fz = sd * 13 * B, fx = 22 * B; // folded foreleg, flat on the bed
          sc.add('legs', 'b', sweep([[fx - 8, 0, fz, 6.5], [fx + 8, 0, fz + sd * 2, 5.6], [fx + 22, 0, fz + sd * 1, 4.8]], { bed: true, seg: 16, per: 5 }), coat);
          sc.add('hooves', 'b', sweep([[fx + 21, 0, fz + sd * 1, 4.9], [fx + 28, 0, fz + sd * 0.5, 4.6]], { bed: true, seg: 14, per: 3 }), hoof);
          var rear = sd * 21 * B; // tucked hind leg
          sc.add('legs', 'b', sweep([[-30 * B, 0, rear * 0.8, 5.4], [-6 * B, 0, rear, 5], [8 * B, 0, rear, 4.4]], { bed: true, seg: 14, per: 5 }), coat);
          sc.add('hooves', 'b', sweep([[8 * B, 0, rear, 4.5], [14 * B, 0, rear, 4.2]], { bed: true, seg: 14, per: 3 }), hoof);
        });
        // neck climbs from the chest
        var nb = [20 * B, 26 * B, 0], nt = [nb[0] + 15 * N, nb[1] + 32 * N, 0];
        sc.add('neck', 'b', sweep([nb.concat([13 * B]), [lerp(nb[0], nt[0], 0.5), lerp(nb[1], nt[1], 0.5), 0, 10], nt.concat([8])], { rise: true, seg: 26, per: 6, flatStart: true }), coat);
        // head
        var hy = nt[1] + 5 * hs, hx = nt[0] + 9 * hs;
        var head = pod([hx, hy, 0], 15 * hs, 9.5 * hs, 8 * hs, { anchor: [nt[0] - 3, nt[1] - 14, 0], anchorR: 6, seg: 40 });
        sc.add('head', 'b', head.tris, coat);
        sc.add('muzzle', 'b', pod([hx + 11 * hs, hy - 3.5 * hs, 0], 6.5 * hs, 5.5 * hs, 5.8 * hs, { anchor: [hx - 4 * hs, hy - 16 * hs, 0], anchorR: 3, rings: 18, seg: 26 }).tris, '#fda4af');
        [-1, 1].forEach(function (sd) {
          var e = head.surf(sd * 72, hy + 2.5 * hs);
          sc.add('eyes', 'b', dome(e.p, e.n, 2.5 * hs), '#1e293b');
          var ear = [hx - 7 * hs, hy + 6 * hs, sd * 4 * hs];
          sc.add('ears', 'b', horn(ear, [ear[0] - 1, ear[1] + 10 * hs, ear[2] + sd * 2], 2.8 * hs, { flatStart: true, seg: 12 }), coat);
        });
        if (hasHorn) {
          var hb = [hx - 1 * hs, hy + 6 * hs, 0], hl = p.horn;
          sc.add('horn', 'b', horn(hb, [hb[0] + hl * 0.48, hb[1] + hl, 0], 3.2 * hs, { flatStart: true, seg: 16 }), '#fde047');
          for (var w = 1; w <= 3; w++) { // spiral bands on the horn
            var tw = w / 4.4, by = hb[1] + hl * tw, bx = hb[0] + hl * 0.48 * tw, br = (3.2 * hs) * (1 - tw * 0.85);
            sc.add('horn', 'b', pod([bx, by, 0], br + 0.6, 1.1, br + 0.6, { anchor: [bx, by - 1.2, 0], anchorR: br, rings: 6, seg: 16 }).tris, '#fde047');
          }
        }
        // mane: locks that climb up and back from the neck ridge, each one starting inside the neck
        var locks = Math.round(p.mane);
        for (var i = 0; i < locks; i++) {
          var t = (i + 0.5) / locks, cx = lerp(nb[0], nt[0], t) - lerp(10, 5, t), cy = lerp(nb[1], nt[1], t) + lerp(7, 7, t), L = p.lock * lerp(1.15, 0.8, t), off = i % 2 ? 2.2 : -2.2;
          sc.add('mane', 'b', horn([cx + 2, cy - 1, off], [cx - L * 0.6, cy + L, off * 1.7], 4, { flatStart: true, seg: 12 }), mane);
        }
        sc.add('mane', 'b', horn([hx - 8 * hs, hy + 4 * hs, 0], [hx + 2 * hs, hy + 15 * hs, 0], 3.4, { flatStart: true, seg: 12 }), mane); // forelock
        // tail flows along the bed
        var tl = p.tail, sg = [-34 * B, 0, 0];
        sc.add('tail', 'b', sweep([[sg[0] + 7, 0, 0, 6], [sg[0] - tl * 0.35, 0, tl * 0.22, 8], [sg[0] - tl * 0.72, 0, tl * 0.2, 7.2], [sg[0] - tl, 0, -tl * 0.12, 2.8]], { bed: true, seg: 18, per: 7 }), mane);
        // wings: leaning plates, the lower edge climbs at 50 degrees from the shoulder
        if (hasWings) [-1, 1].forEach(function (sd) {
          var S = p.wing, y0 = 28 * B, a = deg(24), d = [-Math.cos(a), 0, sd * Math.sin(a)], root = [11 * B, 0, sd * 8 * B];
          var fw = [[-4, y0], [S * 0.7, y0 + S * 0.84], [S * 0.86, y0 + S * 1.12], [S * 0.74, y0 + S * 1.2], [S * 0.72, y0 + S * 1.38], [S * 0.54, y0 + S * 1.42], [S * 0.5, y0 + S * 1.62], [S * 0.3, y0 + S * 1.58], [S * 0.22, y0 + S * 1.72], [0, y0 + S * 1.42], [-4, y0 + S * 0.8]];
          sc.add('wings', 'b', vslab(fw, root, d, 3.2, 0.8), '#bae6fd');
        });
        scaleScene(sc, p.size);
        return finish(sc);
      }
      var UNICORN_PARAMS = [
        { group: 'Creature', key: 'kind', label: 'Type', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['Unicorn', 'Pegasus', 'Winged unicorn', 'Pony'] },
        { group: 'Creature', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.4, step: 0.05, value: 1 },
        { group: 'Creature', key: 'bulk', label: 'Body (slim ↔ stocky)', unit: '×', min: 0.85, max: 1.2, step: 0.05, value: 1 },
        { group: 'Head', key: 'neck', label: 'Neck length', unit: '×', min: 0.8, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'head', label: 'Head size', unit: '×', min: 0.85, max: 1.3, step: 0.05, value: 1 },
        { group: 'Head', key: 'horn', label: 'Horn length', unit: ' mm', min: 14, max: 40, step: 1, value: 26 },
        { group: 'Hair', key: 'mane', label: 'Mane locks', unit: '', min: 3, max: 9, step: 1, value: 6 },
        { group: 'Hair', key: 'lock', label: 'Lock length', unit: ' mm', min: 8, max: 22, step: 1, value: 14 },
        { group: 'Hair', key: 'tail', label: 'Tail length', unit: ' mm', min: 16, max: 46, step: 1, value: 30 },
        { group: 'Wings', key: 'wing', label: 'Wing size', unit: ' mm', min: 18, max: 36, step: 1, value: 28 }
      ];
      window.MM_GENERATOR = {
        code: 'MM-090',
        category: 'ANIMALS // FANTASY',
        title: 'Unicorn & Pegasus',
        fileName: 'Unicorn',
        defaultColor: '#f1f5f9',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', legs: 'Legs', hooves: 'Hooves', neck: 'Neck', head: 'Head', muzzle: 'Muzzle', eyes: 'Eyes', ears: 'Ears', horn: 'Horn', mane: 'Mane', tail: 'Tail', wings: 'Wings' },
        parameters: UNICORN_PARAMS,
        presets: makePresets(UNICORN_PARAMS, [
          ['Default unicorn', {}],
          ['Pegasus', { kind: 1 }],
          ['Winged unicorn', { kind: 2, wing: 32, horn: 30 }],
          ['Little pony', { kind: 3, size: 0.75, head: 1.3, neck: 0.85, bulk: 1.1, mane: 8 }],
          ['Long-maned unicorn', { mane: 9, lock: 20, tail: 44, horn: 36 }]
        ]),
        build: buildUnicorn
      };
