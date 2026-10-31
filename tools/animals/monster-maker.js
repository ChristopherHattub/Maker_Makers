      // -----------------------------------------------------------------------
      // Alien & Monster Maker: a chunky body on the bed with any number of eyes, raised arms, horns, antennae and fangs.
      // Everything that sticks out climbs at 45 degrees or more, so it prints without supports.
      // -----------------------------------------------------------------------
      function buildMonster(p, api) {
        var sc = new Scene(), S = new Sculpt(1.3).useEdits(api, p.size), kind = Math.round(p.kind), W = p.width, H = p.height, n = Math.round(p.eyes), er = p.eyeSize, i;
        var skin = ['#86efac', '#d8b4fe', '#fdba74', '#7dd3fc'][kind], dark = ['#34d399', '#a78bfa', '#fb923c', '#38bdf8'][kind], R = W * [0.86, 1, 1, 1][kind], sides = [-1, 1];
        S.piece('torso');
        S.ell('body', [0, H * 0.45, 0], [R, H * 0.5, R * 0.9], skin, 5);
        S.ell('body', [R * 0.02, H * 0.72, 0], [R * 0.8, H * 0.32, R * 0.74], skin, 8);
        S.paint('belly', [R * 0.9, H * 0.22, 0], [R * 0.48, H * 0.27, R * 0.62], kind === 0 ? '#d9f99d' : '#fef3c7');
        if (kind === 2) S.relief([-R * 1.2, H * 0.12, -R * 1.2], [R * 1.2, H * 1.1, R * 1.2], function (x, y, z) { // shaggy coat
          return 0.55 * Math.pow(Math.abs(Math.sin(Math.atan2(z, x) * 13 + y * 0.32)) , 2);
        });
        // eye sockets, an open mouth and a lower lip with fangs that point up
        var eyeY = H * 0.68, spread = n > 1 ? Math.min(40, 15 + n * 7) : 0, eyes = [];
        for (i = 0; i < n; i++) {
          var th = n > 1 ? lerp(-spread, spread, i / (n - 1)) : 0, ey = n === 1 ? H * 0.64 : eyeY + (n > 2 ? H * 0.09 * (1 - Math.abs(th) / spread) : 0), r = (n === 1 ? 1.5 : 1) * er;
          eyes.push({ th: th, y: ey, r: r });
          S.ell(null, [Math.cos(deg(th)) * R * 1.06, ey, Math.sin(deg(th)) * R * 1.0], [r * 0.56, r * 1.08, r * 1.08], null, 0).carve(1.6);
        }
        var mY = H * 0.38, mw = p.mouth;
        if (mw > 0) {
          var mz2 = Math.sin(deg(mw)) * R * 0.92, fx0 = Math.cos(deg(mw * 0.5)) * R * 0.92;
          S.piece('mouth', 'torso');
          S.path('lip', [[fx0, mY + 1.5, -mz2, 2], [R * 1.0, mY - H * 0.07, 0, 2.8], [fx0, mY + 1.5, mz2, 2]], dark, 1.5, 6);
          var nf = Math.round(p.fangs);
          for (i = 0; i < nf; i++) {
            var fa = nf > 1 ? lerp(-mw * 0.66, mw * 0.66, i / (nf - 1)) : 0, fz = Math.sin(deg(fa)) * R * 0.94, fxx = Math.cos(deg(fa)) * R * 1.0, fy = mY - H * 0.06 * (1 - Math.pow(fa / mw, 2));
            S.path('fangs', [[fxx - 0.5, fy, fz, 2.6], [fxx + 0.4, fy + 5, fz, 1.5], [fxx + 0.6, fy + 9, fz, 0.5]], '#f8fafc', 0.5);
          }
        }
        if (p.arms > 0) sides.forEach(function (sd) {
          S.piece(sd < 0 ? 'armL' : 'armR');
          var L = p.arms, bz = sd * R * 0.76, by = H * 0.46, tip = [L * 0.15, by + L * 1.1, bz + sd * L * 0.86];
          S.path('arms', [[0, by - 3, bz, 6], [L * 0.08, by + L * 0.5, bz + sd * L * 0.5, 4.8], tip.concat([4.2])], dark, 3);
          [-1, 0, 1].forEach(function (f) { S.path('arms', [[tip[0], tip[1] + 2.5, tip[2], 2.7], [tip[0] + f * 3.4 + 0.5, tip[1] + 7, tip[2] + sd * 1.8, 1.8], [tip[0] + f * 5, tip[1] + 12, tip[2] + sd * 2.6, 0.8]], kind === 2 ? '#f8fafc' : dark, 1); });
        });
        if (p.horns > 0) sides.forEach(function (sd) {
          S.piece(sd < 0 ? 'hornL' : 'hornR', 'torso');
          var hx = 0, hy = H * 0.85, hz = sd * R * 0.56, Hn = p.horns;
          S.path('horns', [[hx, hy, hz, 5.4], [hx - Hn * 0.05, hy + Hn * 0.48, hz + sd * Hn * 0.36, 3.6], [hx + Hn * 0.05, hy + Hn * 0.98, hz + sd * Hn * 0.42, 0.7]], '#fde047', 2);
        });
        var na = Math.round(p.antennae);
        for (i = 0; i < na; i++) {
          S.piece('ant' + i, 'torso');
          var az = na > 1 ? lerp(-R * 0.34, R * 0.34, i / (na - 1)) : 0, top = H * 0.97, ah = H * 0.42, tipA = [-3, top + ah, az * 1.8];
          S.path('antennae', [[0, top - 2, az, 2.8], [-2, top + ah * 0.55, az * 1.5, 2.1], tipA.concat([1.9])], dark, 1.6);
          S.ell('antenna tips', [tipA[0], tipA[1] + 2.8, tipA[2]], [4.4, 4.4, 4.4], '#fde047', 1.2);
        }
        if (kind === 3) {
          for (i = 0; i < 6; i++) {
            S.piece('tent' + i);
            var ta = deg(30 + i * 60), Lt = R + 26, tp = [];
            for (var q = 0; q <= 4; q++) { var u = q / 4, an = ta + 0.75 * u * u, rd = lerp(R * 0.72, Lt, u), rr = lerp(7.4, 2.8, u); tp.push([Math.cos(an) * rd, rr * 0.62, Math.sin(an) * rd, rr]); }
            S.path('feet', tp, dark, 3, 4);
          }
        } else sides.forEach(function (sd) {
          var fz = sd * R * 0.52;
          S.piece(sd < 0 ? 'footL' : 'footR');
          S.ell('feet', [R * 0.68, 4.4, fz], [12.5, 5.2, 8.5], dark, 2.5);
          [-1, 0, 1].forEach(function (c) { S.ell('claws', [R * 0.68 + 11, 2.5, fz + c * 4.4], [3.5, 2.8, 2.4], '#f8fafc', 0.8); });
        });
        S.piece('spots', 'torso');
        var spots = Math.round(p.spots);
        for (i = 0; i < spots; i++) {
          var sa = deg(110 + (i * 137.5) % 140), sy = H * (0.3 + ((i * 0.37) % 0.5)), sr = 3.6 + (i % 3) * 1.2;
          S.ell('spots', [Math.cos(sa) * R * 0.96, sy, Math.sin(sa) * R * 0.86], [sr, sr, sr], dark, 1);
        }
        S.reach = 0.72;
        S.run();
        eyes.forEach(function (e, ei) {
          var id = 'eye' + ei, hit = S.face(id, [Math.cos(deg(e.th)) * R * 4, e.y, Math.sin(deg(e.th)) * R * 4], [-Math.cos(deg(e.th)), 0, -Math.sin(deg(e.th))], 'torso'), ang = e.r > 8 ? 40 : 52;
          if (!hit) return;
          var rr = e.r * hit.k;
          S.addon(id, hit.p, rr * 0.92);
          sc.add('eyes', 'b', dome(hit.p, hit.n, rr * 0.92, { angle: ang, seg: 28 }), '#f8fafc');
          var rise = ((rr * 0.92) / Math.sin(deg(ang))) * (1 - Math.cos(deg(ang))), pu = S.sub('pupil' + ei, id, vadd(hit.p, vmul(hit.n, rise * 0.72)), rr * 0.48);
          if (pu) sc.add('pupils', 'b', dome(pu.p, hit.n, rr * 0.48 * pu.k, { sink: 0.8 }), '#1e293b');
        });
        S.addTo(sc);
        return finishSculpt(sc, p.size, S);
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
        { group: 'Extras', key: 'antennae', label: 'Antennae', unit: '', min: 0, max: 3, step: 1, value: 2, slider: true },
        { group: 'Extras', key: 'spots', label: 'Back spots', unit: '', min: 0, max: 9, step: 1, value: 3 }
      ];
      window.MM_GENERATOR = {
        code: 'MM-089',
        category: 'ANIMALS // CREATURES',
        title: 'Alien & Monster Maker',
        fileName: 'Monster',
        defaultColor: '#86efac',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly', lip: 'Lip', 'antenna tips': 'Antenna tips', claws: 'Claws', eyes: 'Eyes', pupils: 'Pupils', fangs: 'Fangs', arms: 'Arms', horns: 'Horns', antennae: 'Antennae', feet: 'Feet', spots: 'Spots' },
        parameters: MONSTER_PARAMS,
        presets: makePresets(MONSTER_PARAMS, [
          ['Default little alien', {}],
          ['One-eyed cyclops', { kind: 1, eyes: 1, eyeSize: 8, antennae: 0, horns: 14, fangs: 1, width: 30 }],
          ['Horned beast', { kind: 2, eyes: 2, horns: 24, antennae: 0, fangs: 4, mouth: 38, width: 33, height: 52, arms: 20 }],
          ['Tentacle blob', { kind: 3, eyes: 5, eyeSize: 5, antennae: 0, arms: 0, height: 46, width: 30, fangs: 0 }],
          ['Tiny three-eye', { size: 0.7, eyes: 3, antennae: 1, arms: 12, height: 44, width: 24 }]
        ]),
        sculpt: sculptModule([
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'mouth', label: 'Mouth and fangs', section: 'Body' }, { id: 'spots', label: 'Spots', section: 'Body' },
          { id: 'eye0', label: 'Eye 1', section: 'Eyes' }, { id: 'pupil0', label: 'Pupil 1', section: 'Eyes', parent: 'eye0' }, { id: 'eye1', label: 'Eye 2', section: 'Eyes' }, { id: 'pupil1', label: 'Pupil 2', section: 'Eyes', parent: 'eye1' }, { id: 'eye2', label: 'Eye 3', section: 'Eyes' }, { id: 'pupil2', label: 'Pupil 3', section: 'Eyes', parent: 'eye2' }, { id: 'eye3', label: 'Eye 4', section: 'Eyes' }, { id: 'pupil3', label: 'Pupil 4', section: 'Eyes', parent: 'eye3' }, { id: 'eye4', label: 'Eye 5', section: 'Eyes' }, { id: 'pupil4', label: 'Pupil 5', section: 'Eyes', parent: 'eye4' },
          { id: 'hornL', label: 'Left horn', section: 'Top' }, { id: 'hornR', label: 'Right horn', section: 'Top' }, { id: 'ant0', label: 'Antenna 1', section: 'Top' }, { id: 'ant1', label: 'Antenna 2', section: 'Top' }, { id: 'ant2', label: 'Antenna 3', section: 'Top' },
          { id: 'armL', label: 'Left arm', section: 'Limbs' }, { id: 'armR', label: 'Right arm', section: 'Limbs' }, { id: 'footL', label: 'Left foot', section: 'Limbs' }, { id: 'footR', label: 'Right foot', section: 'Limbs' }, { id: 'tent0', label: 'Tentacle 1', section: 'Limbs' }, { id: 'tent1', label: 'Tentacle 2', section: 'Limbs' }, { id: 'tent2', label: 'Tentacle 3', section: 'Limbs' }, { id: 'tent3', label: 'Tentacle 4', section: 'Limbs' }, { id: 'tent4', label: 'Tentacle 5', section: 'Limbs' }, { id: 'tent5', label: 'Tentacle 6', section: 'Limbs' }
        ]),
        build: buildMonster
      };
