      // -----------------------------------------------------------------------
      // Turtle: a domed shell, a jointed neck and head, four jointed flippers and a little tail
      // -----------------------------------------------------------------------
      function paddlePoly(S) { // flipper blade: root at the origin, pointing along +x
        return [[-3, -3.4], [3 * S, -4.4 * S], [10 * S, -6 * S], [17 * S, -4.5 * S], [21 * S, -1 * S], [20 * S, 2.4 * S], [14 * S, 4.5 * S], [6 * S, 5 * S], [-3, 3.4]];
      }

      function buildTurtle(p) {
        var g = p.gap, sc = new Scene(), i, k;
        var Sr = p.shellL / 2, Sw = p.shellW / 2, Sh = p.shellH;
        // shell: a dome flat on the bed (x = length, z = width)
        var prof = [[0, 0], [0.97, 0]];
        for (i = 1; i < 14; i++) { var t = (Math.PI / 2) * (i / 14); prof.push([Math.pow(Math.cos(t), 0.8), Sh * Math.sin(t)]); }
        prof.push([0, Sh]);
        var fr = frame([0, 0, 0], [0, 1, 0], [0, 0, 1]); // u = -x, v = +z
        var shellProf = prof.map(function (q, ix) { return ix === 0 || ix === prof.length - 1 ? q : [q[0] * Sr, q[1]]; });
        sc.add('shell', 'shell', lathe(fr, shellProf, 40, { ax: 1, ay: Sw / Sr, floor: 0 }), '#86efac');
        // scutes: raised plates on top
        function domeY(x, z) { var q = (x * x) / (Sr * Sr) + (z * z) / (Sw * Sw); return q >= 1 ? 0 : Sh * Math.pow(1 - Math.pow(q, 1 / 0.8 * 0.5), 0.5) * 0.98; }
        var plates = [[0, 0, 0.3]];
        for (i = 0; i < 6; i++) plates.push([Math.cos(TAU * i / 6) * 0.55, Math.sin(TAU * i / 6) * 0.55, 0.22]);
        if (p.scutes > 0) plates.forEach(function (q) {
          var x = q[0] * Sr, z = q[1] * Sw, y = Sh * Math.sqrt(Math.max(0, 1 - Math.pow(q[0], 2) - Math.pow(q[1], 2))) * 0.97;
          sc.add('scutes', 'shell', blobShell([x, y - 0.4, z], [1, 0, 0], q[2] * Sr * 0.9, q[2] * Sw * 0.9, p.scutes, 12, 0), '#fde047');
        });
        // neck and head: a short chain that ends in the head
        var nn = Math.round(p.neckSegs), rj = [], P = [];
        for (k = 0; k <= nn; k++) rj.push(k < nn ? p.neckR * lerp(0.85, 1, k / nn) : p.neckR * 1.5 * p.headSize);
        for (k = 0; k < nn; k++) P.push(p.pitch);
        var jd0 = jointDims(rj[0], g), extra = rj[0] * 0.8 + 0.8, dirN = [-1, 0, 0];
        var J0 = [-Sr * 0.9 + (-1) * (jd0.e + extra), 0.85 * rj[0], 0];
        var ch = chain({ J0: J0, dir: dirN, P: P, rj: rj, yaw: wiggle(nn, p.neckBend, 1), g: g, bulge: 0.2, tip: rj[nn] * 1.5, bend: p.__bend, ov: 6, seg: 16, rootExtra: extra,
          hAxis: function (j) { return 0.85 * rj[j]; } });
        sc.add('shell', 'shell', ch.rootBall, '#86efac');
        ch.segs.forEach(function (sg) { sc.add(sg.k === nn ? 'head' : 'neck', 'neck' + sg.k, sg.shell, sg.k === nn ? '#a7f3d0' : '#6ee7b7'); });
        var hs = ch.segs[nn - 1];
        [-1, 1].forEach(function (sd) {
          sc.add('eyes', 'neck' + nn, blobShell(onSeg(hs, 0.62, sd * deg(62), 0.93), [1, 0, 0], 2.1, 2.1, 2.1, 10, 0), '#334155');
        });
        // flippers: big in front, small behind, hosted on the shell edge
        [[-0.42, p.flipperLen, 0.8, 1], [0.5, p.flipperLen * 0.7, 0.62, 0.6]].forEach(function (fl, li) {
          [-1, 1].forEach(function (sd) {
            var ang = Math.atan2(fl[0] * 0 + sd * 1, 0), ex = fl[0] * Sr, ez = sd * Sw * Math.sqrt(Math.max(0, 1 - Math.pow(fl[0], 2))) * 0.98;
            var nrm = vnorm([ex / (Sr * Sr), 0, ez / (Sw * Sw)]);
            var lean = deg(p.flipperSweep) * (li ? -1 : 1), tangent = [-nrm[2] * sd, 0, nrm[0] * sd];
            var v = vadd(vmul(nrm, Math.cos(lean)), vmul(vnorm([-sd * (-nrm[2]), 0, -sd * nrm[0]]), 0));
            var fwd = vnorm([-1, 0, 0]), dirv = vadd(vmul(nrm, Math.cos(lean)), vmul(fwd, Math.sin(lean) * (li ? -1 : 1)));
            var rj0 = (li ? 0.8 : 1) * p.flipperR;
            limb(sc, { host: 'shell', hostEntry: 'shell', hostColor: '#86efac', id: 'flip' + li + (sd > 0 ? 'r' : 'l'), entry: 'flippers', color: '#6ee7b7',
              attach: [ex * 0.96, 0, ez * 0.96], head: heading(dirv), lean: Math.abs(lean) + 0.55, n: 2, rj0: rj0, rj1: rj0 * 0.9, pitch: fl[1] * 0.45, g: g, yaw: [0, 0], bend: p.__bend, tip: 2.5,
              foot: paddlePoly(fl[2] * p.paddle), footEntry: 'flippers', footColor: '#6ee7b7' });
          });
        });
        // tail: two small segments behind
        var rt = [p.neckR * 0.8, 4.2, 3.8], jt = jointDims(rt[0], g), ext = rt[0] * 0.8 + 0.8;
        var ct = chain({ J0: [Sr * 0.93 + jt.e + ext, 0.85 * rt[0], 0], dir: [1, 0, 0], P: [8, 8], rj: rt, g: g, bulge: 0.15, tip: 9, bend: p.__bend, ov: 6, seg: 14, rootExtra: ext, hAxis: function (j) { return 0.85 * rt[j]; } });
        sc.add('shell', 'shell', ct.rootBall, '#86efac');
        ct.segs.forEach(function (sg) { sc.add('neck', 'tail' + sg.k, sg.shell, '#6ee7b7'); });
        return sc.entries();
      }

      var TURTLE_PARAMS = [
        { group: 'Shell', key: 'shellL', label: 'Shell length', unit: ' mm', min: 50, max: 100, step: 1, value: 70 },
        { group: 'Shell', key: 'shellW', label: 'Shell width', unit: ' mm', min: 44, max: 90, step: 1, value: 60 },
        { group: 'Shell', key: 'shellH', label: 'Shell height', unit: ' mm', min: 18, max: 40, step: 1, value: 26 },
        { group: 'Shell', key: 'scutes', label: 'Shell plate height (0 = none)', unit: ' mm', min: 0, max: 5, step: 0.5, value: 2 },
        { group: 'Neck & head', key: 'neckSegs', label: 'Neck segments (last one is the head)', unit: '', min: 2, max: 5, step: 1, value: 3 },
        { group: 'Neck & head', key: 'pitch', label: 'Neck segment length', unit: ' mm', min: 9, max: 14, step: 0.5, value: 11 },
        { group: 'Neck & head', key: 'neckR', label: 'Neck thickness (radius)', unit: ' mm', min: 4.5, max: 8, step: 0.1, value: 5.5 },
        { group: 'Neck & head', key: 'headSize', label: 'Head size', unit: '×', min: 0.8, max: 1.4, step: 0.05, value: 1.05 },
        { group: 'Neck & head', key: 'neckBend', label: 'Neck bend (straight ↔ curved)', unit: '°', min: 0, max: 8, step: 0.5, value: 3 },
        { group: 'Flippers', key: 'flipperLen', label: 'Flipper length', unit: ' mm', min: 20, max: 44, step: 1, value: 30 },
        { group: 'Flippers', key: 'flipperR', label: 'Flipper thickness (radius)', unit: ' mm', min: 3.7, max: 6.5, step: 0.1, value: 4.8 },
        { group: 'Flippers', key: 'paddle', label: 'Paddle size', unit: '×', min: 0.5, max: 1.4, step: 0.05, value: 0.9 },
        { group: 'Flippers', key: 'flipperSweep', label: 'Flipper sweep (out ↔ forward)', unit: '°', min: 0, max: 40, step: 1, value: 20 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-097',
        category: 'FLEXI // SEA CREATURES',
        title: 'Flexi Turtle',
        fileName: 'Flexi_Turtle',
        defaultColor: '#6ee7b7',
        palette: FLEXI_PALETTE,
        partNames: { shell: 'Shell', scutes: 'Shell plates', neck: 'Neck & tail', head: 'Head', eyes: 'Eyes', flippers: 'Flippers' },
        parameters: TURTLE_PARAMS,
        presets: makePresets(TURTLE_PARAMS, [
          ['Default turtle', {}],
          ['Tall tortoise', { shellH: 38, shellL: 64, shellW: 58, flipperLen: 24, paddle: 0.6, scutes: 3 }],
          ['Sea turtle', { shellH: 20, shellL: 84, shellW: 66, flipperLen: 40, paddle: 1.3, neckSegs: 2 }],
          ['Baby turtle', { shellL: 56, shellW: 50, shellH: 22, headSize: 1.15, neckSegs: 2, flipperLen: 24 }],
          ['Straight neck (easy print)', { neckBend: 0 }]
        ]),
        build: buildTurtle
      };
