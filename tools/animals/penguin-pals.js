      // -----------------------------------------------------------------------
      // Penguin Pals: a penguin with an optional chick, scarf or party hat
      // -----------------------------------------------------------------------
      // A smooth loft body with a crisp white front, slim flippers on the flanks, a slender bill and webbed feet.
      function makePenguin(sc, S, at, z0, sz, p, kid) {
        function id(x) { return kid ? 'chick' : x; }
        var H = 66 * sz, R = 19 * sz * p.chunk, black = kid ? '#64748b' : '#1f2937', white = '#f8fafc', gold = '#f59e0b', par = kid ? null : 'body';
        var prof = [[0, 0.74, 0], [0.1, 0.92, 0], [0.3, 1, 0.03], [0.52, 0.86, 0.06], [0.66, 0.68, 0.1], [0.75, 0.56, 0.13], [0.85, 0.62, 0.14], [0.93, 0.48, 0.13], [0.985, 0.2, 0.12], [1, 0.02, 0.12]];
        function place(lf) { var t = lf.tris; if (at || z0) for (var i = 0; i < t.length; i += 3) { t[i] += at; t[i + 2] += z0; } return lf; }
        function surf(lf, th, y) { var c = lf.surf(th, y); return { p: [c.p[0] + at, c.p[1], c.p[2] + z0], n: c.n }; }
        var body = place(profileLoft(0, 0, H, R, 0.92, prof));
        S.shell(sc, id('body'), 'body', 'b', body.tris, black);
        // belly: a second smooth form set forward, so its edge against the back is clean
        var belly = place(profileLoft(0, 0, H * 0.74, R, 0.92, frontProfile(prof, 0.74, 0.84, 0.21)));
        S.shell(sc, id('belly'), 'belly', 'b', belly.tris, white, par);
        [-1, 1].forEach(function (s) {
          var fy = H * 0.62, F = p.flipper, L = H * 0.34 * F, W = R * 0.34;
          // flipper: lies along the flank, its tip sinks into the wider body below
          S.shell(sc, id(s < 0 ? 'flipL' : 'flipR'), 'flippers', 'b', vslab([[-W * 0.1, fy + 2], [W * 0.9, fy], [W * 1.05, fy - L * 0.4], [W * 0.75, fy - L * 0.8], [W * 0.15, fy - L], [-W * 0.5, fy - L * 0.72], [-W * 0.7, fy - L * 0.3]], [at - R * 0.06, 0, z0 + s * R * 0.74], [1, 0, 0], 3.2 * sz + 0.6, 1), black);
          var fx = at + R * 0.72, fz = z0 + s * R * 0.42, Fk = sz;
          S.shell(sc, id(s < 0 ? 'footL' : 'footR'), 'feet', 'b', pod([fx, 2 * Fk + 0.5, fz], 7.5 * Fk, 2.4 * Fk + 0.4, 5.5 * Fk, { rings: 14, seg: 28, flare: 0.8 }).tris, gold);
          [-1, 0, 1].forEach(function (c) { S.shell(sc, id(s < 0 ? 'footL' : 'footR'), 'feet', 'b', pod([fx + 7 * Fk, 1.3 * Fk + 0.5, fz + c * 3.4 * Fk], 3.4 * Fk, 1.6 * Fk + 0.3, 1.8 * Fk, { rings: 10, seg: 18, flare: 0.8 }).tris, gold); });
          if (!kid) { // cheek patch
            var ck = surf(body, s * 74, H * 0.8);
            sc.add('cheeks', 'b', dome(ck.p, ck.n, 3.4 * sz, { angle: 26, seg: 22 }), '#fde047');
          }
          var ep = surf(body, s * 40, H * 0.85);
          var lf = { surf: function () { return { p: ep.p, n: ep.n }; } };
          softEyeOn(sc, S, kid ? 'chick' : (s < 0 ? 'eyeL' : 'eyeR'), kid ? 'chick' : (s < 0 ? 'pupilL' : 'pupilR'), lf, 0, 0, kid ? null : 'body', 2.9 * sz + 0.3, '#334155');
        });
        // bill: slender, upper and lower halves
        var bl = surf(body, 0, H * 0.82);
        var bid = id('beak');
        // both halves point down at about 45 degrees, which prints without support
        var bu = 6.5 * sz + 1, bx = bl.p[0], by = bl.p[1] + 1.5 * sz;
        S.shell(sc, bid, 'beak', 'b', sweep([[bx - 4 * sz, by + 2 * sz, z0, 2.6 * sz + 0.3], [bx + 0.5 * bu, by - 0.42 * bu, z0, 1.5 * sz + 0.3], [bx + bu, by - 0.85 * bu, z0, 0.5]], { seg: 18, per: 16, floor: null }), black, par);
        S.shell(sc, bid, 'bill stripe', 'b', sweep([[bx - 4 * sz, by + 0.2 * sz, z0, 2.1 * sz + 0.2], [bx + 0.4 * bu, by - 0.62 * bu, z0, 1.3 * sz + 0.2], [bx + 0.85 * bu, by - 1 * bu, z0, 0.45]], { seg: 16, per: 14, floor: null }), gold, par);
        if (p.extra === 1 && !kid) {
          S.shell(sc, 'scarf', 'scarf', 'b', collarBand(at + R * 0.09, H * 0.64, R * 0.7, R * 0.64, 1.8, 0), '#e11d48', 'body');
          S.shell(sc, 'scarf', 'scarf', 'b', vslab([[-R * 0.3, H * 0.62], [R * 0.05, H * 0.64], [R * 0.08, H * 0.32], [-R * 0.24, H * 0.34]], [at + R * 0.72, 0, z0 - R * 0.34], [0, 0, 1], 2.6, 0.8), '#be123c', 'body');
        } else if (p.extra === 2 && !kid) {
          var hb = H * 0.9;
          S.shell(sc, 'hat', 'hat', 'b', loft([{ y: hb, cx: at + R * 0.13, cz: z0, rx: 9.5 * p.chunk, rz: 8.8 * p.chunk }, { y: hb + 1, cx: at + R * 0.13, cz: z0, rx: 9.5 * p.chunk, rz: 8.8 * p.chunk }, { y: hb + 24, cx: at + R * 0.12, cz: z0, rx: 1.2, rz: 1.2 }], 48, { poleLift: 0 }).tris, '#a855f7', 'body');
          S.shell(sc, 'hat', 'pompom', 'b', pod([at + R * 0.13, hb + 26, z0], 3.2, 3.2, 3.2, { anchor: [at + R * 0.13, hb + 22.5, z0], anchorR: 1.2, rings: 16, seg: 24 }).tris, '#fde047', 'body');
        }
      }
      function buildPenguin(p, api) {
        var sc = new Scene(), S = new Sculpt(2).useEdits(api), cz = 27 * p.chunk + 13;
        S.run();
        makePenguin(sc, S, 0, 0, 1, p, false);
        if (p.chick > 0) makePenguin(sc, S, 13, cz, 0.5, { chunk: 1.05, flipper: 1, extra: 0 }, true);
        return finishSculpt(sc, 1, S);
      }

      var PENGUIN_PARAMS = [
        { group: 'Penguin', key: 'chunk', label: 'Width (slim ↔ chunky)', unit: '×', min: 0.8, max: 1.3, step: 0.05, value: 1 },
        { group: 'Penguin', key: 'flipper', label: 'Flipper length', unit: '×', min: 0.5, max: 1.5, step: 0.05, value: 1 },
        { group: 'Penguin', key: 'extra', label: 'Accessory', unit: '', min: 0, max: 2, step: 1, value: 1, options: ['None', 'Scarf', 'Party hat'] },
        { group: 'Penguin', key: 'chick', label: 'Chick', unit: '', min: 0, max: 1, step: 1, value: 1, options: ['No chick', 'With chick'] }
      ];

      window.MM_GENERATOR = {
        code: 'MM-084',
        category: 'ANIMALS // BIRDS',
        title: 'Penguin Pals',
        fileName: 'Penguin',
        defaultColor: '#334155',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Back', belly: 'Belly', eyes: 'Eyes', pupils: 'Pupils', glints: 'Eye glints', flippers: 'Flippers', feet: 'Feet', beak: 'Bill', 'bill stripe': 'Bill stripe', cheeks: 'Cheek patches', scarf: 'Scarf', hat: 'Party hat', pompom: 'Pompom' },
        parameters: PENGUIN_PARAMS,
        presets: makePresets(PENGUIN_PARAMS, [
          ['Default penguin', {}],
          ['Party penguin', { extra: 2, chunk: 1.15 }],
          ['Lone penguin', { chick: 0, extra: 0 }],
          ['Chubby scarf penguin', { chunk: 1.3, flipper: 0.8, extra: 1 }]
        ]),
        sculpt: sculptModule([
          { id: 'body', label: 'Body', section: 'Penguin' }, { id: 'belly', label: 'Belly', section: 'Penguin' }, { id: 'eyeL', label: 'Left eye', section: 'Penguin' }, { id: 'pupilL', label: 'Left pupil', section: 'Penguin', parent: 'eyeL' }, { id: 'eyeR', label: 'Right eye', section: 'Penguin' }, { id: 'pupilR', label: 'Right pupil', section: 'Penguin', parent: 'eyeR' }, { id: 'beak', label: 'Bill', section: 'Penguin' }, { id: 'scarf', label: 'Scarf', section: 'Penguin' }, { id: 'hat', label: 'Party hat', section: 'Penguin' }, { id: 'flipL', label: 'Left flipper', section: 'Penguin' }, { id: 'flipR', label: 'Right flipper', section: 'Penguin' }, { id: 'footL', label: 'Left foot', section: 'Penguin' }, { id: 'footR', label: 'Right foot', section: 'Penguin' },
          { id: 'chick', label: 'Chick', section: 'Chick' }
        ]),
        build: buildPenguin
      };
