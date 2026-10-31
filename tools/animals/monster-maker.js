      // -----------------------------------------------------------------------
      // Alien & Monster Maker: a chunky body on the bed with any number of eyes, raised arms, horns, antennae and fangs.
      // Everything that sticks out climbs at 45 degrees or more, so it prints without supports.
      // -----------------------------------------------------------------------
      function buildMonster(p) {
        var sc = new Scene(), kind = Math.round(p.kind), W = p.width, H = p.height, n = Math.round(p.eyes), er = p.eyeSize, i;
        var skin = ['#86efac', '#d8b4fe', '#fdba74', '#93c5fd'][kind], dark = ['#4ade80', '#a78bfa', '#fb923c', '#60a5fa'][kind];
        var taper = [0.86, 1, 1, 1][kind], R = W * taper;
        var body = pod([0, H * 0.52, 0], R, H * 0.52, R * 0.88, { flare: 0.75, mod: kind === 2 ? function (th, t) { return 1 + 0.035 * Math.sin(deg(th) * 11 + t * 14); } : null, seg: 72, rings: 40 });
        sc.add('body', 'b', body.tris, skin);
        // eyes in an arc across the face
        var eyeY = H * 0.68, spread = n > 1 ? Math.min(34, 12 + n * 7) : 0;
        for (i = 0; i < n; i++) {
          var th = n > 1 ? lerp(-spread, spread, i / (n - 1)) : 0, y = eyeY + (n > 2 ? H * 0.09 * (1 - Math.abs(th) / (spread || 1)) : 0), r = (n === 1 ? 1.6 : 1) * er;
          var s = body.surf(th, y);
          sc.add('eyes', 'b', dome(s.p, s.n, r, { angle: 50 }), '#f8fafc');
          var h = (r / Math.sin(deg(50))) * (1 - Math.cos(deg(50)));
          sc.add('pupils', 'b', dome(vadd(s.p, vmul(s.n, h * 0.65)), s.n, r * 0.5, { sink: 0.8 }), '#1e293b');
        }
        // mouth with fangs that point up from the lower lip
        var mY = H * 0.38, mw = p.mouth;
        if (mw > 0) {
          var marks = [];
          for (i = 0; i <= 10; i++) { var u = lerp(-mw, mw, i / 10); marks.push([u, mY - H * 0.07 * (1 - Math.pow(u / mw, 2))]); }
          sc.add('mouth', 'b', ridge(body, marks, 2.8), '#334155');
          var nf = Math.round(p.fangs);
          for (i = 0; i < nf; i++) {
            var fa = nf > 1 ? lerp(-mw * 0.65, mw * 0.65, i / (nf - 1)) : 0, fy = mY - H * 0.07 * (1 - Math.pow(fa / mw, 2)), fs = body.surf(fa, fy);
            sc.add('fangs', 'b', horn(vsub(fs.p, vmul(fs.n, 1.2)), [fs.p[0] + fs.n[0] * 1.6, fs.p[1] + 7, fs.p[2] + fs.n[2] * 1.6], 2.2, { flatStart: true, seg: 10 }), '#f8fafc');
          }
        }
        var sides = [-1, 1];
        // arms climb up and out from the flanks
        if (p.arms > 0) sides.forEach(function (sd) {
          var a = body.surf(sd * 90, H * 0.42), L = p.arms;
          var base = vsub(a.p, vmul(a.n, 5));
          var tip = [base[0] + L * 0.1, base[1] + L * 1.1, base[2] + sd * L * 0.72];
          sc.add('arms', 'b', sweep([base.concat([5]), [lerp(base[0], tip[0], 0.5), lerp(base[1], tip[1], 0.5), lerp(base[2], tip[2], 0.55), 4.2], tip.concat([3.6])], { rise: true, seg: 14, per: 5, flatStart: true }), dark);
          [-1, 0, 1].forEach(function (f) {
            sc.add('arms', 'b', horn([tip[0], tip[1] + 3.8, tip[2]], [tip[0] + f * 4, tip[1] + 11, tip[2] + sd * 3], 1.8, { seg: 8 }), dark);
          });
        });
        var topY = H * 0.86;
        if (p.horns > 0) sides.forEach(function (sd) {
          var b = body.surf(sd * 90, topY), hb = vsub(b.p, vmul(b.n, 4));
          sc.add('horns', 'b', horn(hb, [hb[0], hb[1] + p.horns, hb[2] + sd * p.horns * 0.55], 4.2, { flatStart: true, bendZ: sd * 2 }), '#fde047');
        });
        var na = Math.round(p.antennae);
        for (i = 0; i < na; i++) {
          var az = na > 1 ? lerp(-R * 0.35, R * 0.35, i / (na - 1)) : 0, ab = [0, H * 0.9, az], ah = H * 0.5, tipA = [-2, H * 0.9 + ah, az * 2];
          sc.add('antennae', 'b', sweep([ab.concat([2.2]), [-1, H * 0.9 + ah * 0.5, az * 1.5, 1.8], tipA.concat([1.6])], { rise: true, seg: 10, per: 4, flatStart: true }), dark);
          sc.add('antennae', 'b', pod([tipA[0], tipA[1] + 3, tipA[2]], 3.6, 3.6, 3.6, { anchor: [tipA[0], tipA[1] - 1, tipA[2]], anchorR: 1.5, seg: 18, rings: 12 }).tris, '#fde047');
        }
        // feet, or tentacles that lie flat on the bed
        if (kind === 3) {
          for (i = 0; i < 6; i++) {
            var ta = deg(30 + i * 60), L2 = R + 24;
            sc.add('feet', 'b', sweep([[Math.cos(ta) * R * 0.7, 0, Math.sin(ta) * R * 0.7, 7], [Math.cos(ta) * (R + 8), 0, Math.sin(ta) * (R + 8), 5.6], [Math.cos(ta + 0.25) * (L2 - 6), 0, Math.sin(ta + 0.25) * (L2 - 6), 4.2], [Math.cos(ta + 0.6) * L2, 0, Math.sin(ta + 0.6) * L2, 2.8]], { bed: true, seg: 16, per: 5 }), dark);
          }
        } else {
          sides.forEach(function (sd) {
            var fz = sd * R * 0.5;
            sc.add('feet', 'b', pod([R * 0.72, 4.5, fz], 11, 5, 8, { rings: 12, seg: 24, flare: 0.8 }).tris, dark);
          });
        }
        var spots = Math.round(p.spots);
        for (i = 0; i < spots; i++) {
          var sa = 110 + (i * 137.5) % 140, sy = H * (0.3 + ((i * 0.37) % 0.5)), q = body.surf(sa, sy);
          sc.add('spots', 'b', dome(q.p, q.n, 3 + (i % 3)), dark);
        }
        scaleScene(sc, p.size);
        return finish(sc);
      }
      var MONSTER_PARAMS = [
        { group: 'Creature', key: 'kind', label: 'Type', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['Little alien', 'Cyclops', 'Horned beast', 'Tentacle blob'] },
        { group: 'Creature', key: 'size', label: 'Overall size', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 },
        { group: 'Creature', key: 'height', label: 'Body height', unit: ' mm', min: 40, max: 80, step: 1, value: 56 },
        { group: 'Creature', key: 'width', label: 'Body width (half)', unit: ' mm', min: 20, max: 36, step: 1, value: 27 },
        { group: 'Face', key: 'eyes', label: 'Eyes', unit: '', min: 1, max: 5, step: 1, value: 2 },
        { group: 'Face', key: 'eyeSize', label: 'Eye size', unit: ' mm', min: 4, max: 9, step: 0.5, value: 6.5 },
        { group: 'Face', key: 'mouth', label: 'Mouth width (0 = none)', unit: '°', min: 0, max: 45, step: 1, value: 28 },
        { group: 'Face', key: 'fangs', label: 'Fangs', unit: '', min: 0, max: 4, step: 1, value: 2 },
        { group: 'Extras', key: 'arms', label: 'Arm length (0 = none)', unit: ' mm', min: 0, max: 26, step: 1, value: 16 },
        { group: 'Extras', key: 'horns', label: 'Horn length (0 = none)', unit: ' mm', min: 0, max: 26, step: 1, value: 0 },
        { group: 'Extras', key: 'antennae', label: 'Antennae', unit: '', min: 0, max: 3, step: 1, value: 2 },
        { group: 'Extras', key: 'spots', label: 'Back spots', unit: '', min: 0, max: 9, step: 1, value: 3 }
      ];
      window.MM_GENERATOR = {
        code: 'MM-089',
        category: 'ANIMALS // CREATURES',
        title: 'Alien & Monster Maker',
        fileName: 'Monster',
        defaultColor: '#86efac',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', eyes: 'Eyes', pupils: 'Pupils', mouth: 'Mouth', fangs: 'Fangs', arms: 'Arms', horns: 'Horns', antennae: 'Antennae', feet: 'Feet', spots: 'Spots' },
        parameters: MONSTER_PARAMS,
        presets: makePresets(MONSTER_PARAMS, [
          ['Default little alien', {}],
          ['One-eyed cyclops', { kind: 1, eyes: 1, eyeSize: 8, antennae: 0, horns: 14, fangs: 1, width: 30 }],
          ['Horned beast', { kind: 2, eyes: 2, horns: 24, antennae: 0, fangs: 4, mouth: 38, width: 33, height: 52, arms: 20 }],
          ['Tentacle blob', { kind: 3, eyes: 5, eyeSize: 5, antennae: 0, arms: 0, height: 46, width: 30, fangs: 0 }],
          ['Tiny three-eye', { size: 0.7, eyes: 3, antennae: 1, arms: 12, height: 44, width: 24 }]
        ]),
        build: buildMonster
      };
