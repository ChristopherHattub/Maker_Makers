      // -----------------------------------------------------------------------
      // Octopus: a domed head with eight jointed arms radiating across the bed
      // -----------------------------------------------------------------------
      function buildOctopus(p) {
        var g = p.gap, sc = new Scene(), arms = Math.round(p.arms), nseg = Math.round(p.armSegs), i, k;
        var Hr = p.headR, Hh = p.headH, rj0 = p.armR;
        // dome: flat on the bed, rising to a rounded top
        var prof = [[0, 0], [Hr * 0.92, 0]];
        for (i = 1; i < 14; i++) { var t = (Math.PI / 2) * (i / 14); prof.push([Hr * (0.92 + 0.08 * Math.cos(t)) * Math.pow(Math.cos(t), 0.9) + 0.01, Hh * Math.sin(t)]); }
        prof.push([0, Hh]);
        sc.add('head', 'head', lathe(frame([0, 0, 0], [0, 1, 0], [0, 0, 1]), prof, 36, { floor: 0 }), '#d8b4fe');
        // eyes
        [-1, 1].forEach(function (sd) {
          var a = sd * deg(24);
          var c = [Math.cos(a) * Hr * 0.62, Hh * 0.62, Math.sin(a) * Hr * 0.62];
          sc.add('eyes', 'head', blobShell(c, [Math.cos(a), 0, Math.sin(a)], 4.2 * p.eyeSize, 4.2 * p.eyeSize, 4.8 * p.eyeSize, 12, 0), '#334155');
        });
        for (i = 0; i < arms; i++) {
          var ang = TAU * (i / arms) + Math.PI / arms * 0 + deg(p.twist);
          var dir = [Math.cos(ang), 0, Math.sin(ang)];
          var attach = [dir[0] * Hr * 0.8, 0, dir[2] * Hr * 0.8];
          var sign = (p.curlMode > 0 && i % 2) ? -1 : 1, yaw = [];
          for (k = 1; k <= nseg; k++) yaw.push(sign * deg(p.curl) * (0.4 + 0.6 * (k / nseg)));
          var rj = taperRadii(nseg, rj0, p.tipR, 3.7), jd0 = jointDims(rj[0], g), P = [];
          for (k = 0; k < nseg; k++) P.push(p.pitch * lerp(1, 0.75, k / nseg));
          var extra = rj[0] * 0.6 + 0.6, J0 = [attach[0] + dir[0] * (jd0.e + extra), 0.85 * rj[0], attach[2] + dir[2] * (jd0.e + extra)];
          var ch = chain({ J0: J0, dir: dir, P: P, rj: rj, yaw: yaw, g: g, bulge: 0.12, tip: rj[nseg] * 2.6, bend: p.__bend, ov: 5, seg: 14, rootExtra: extra,
            hAxis: function (j) { return 0.85 * rj[j]; } });
          sc.add('head', 'head', ch.rootBall, '#d8b4fe');
          ch.segs.forEach(function (sg) { sc.add(i % 2 ? 'armsB' : 'armsA', 'arm' + i + '_' + sg.k, sg.shell, i % 2 ? '#d8b4fe' : '#fda4af'); });
        }
        return sc.entries();
      }

      var OCTO_PARAMS = [
        { group: 'Head', key: 'headR', label: 'Head radius', unit: ' mm', min: 15, max: 32, step: 1, value: 21 },
        { group: 'Head', key: 'headH', label: 'Head height', unit: ' mm', min: 14, max: 34, step: 1, value: 22 },
        { group: 'Head', key: 'eyeSize', label: 'Eye size', unit: '×', min: 0.6, max: 1.5, step: 0.05, value: 1 },
        { group: 'Arms', key: 'arms', label: 'Number of arms', unit: '', min: 5, max: 8, step: 1, value: 8 },
        { group: 'Arms', key: 'armSegs', label: 'Segments per arm', unit: '', min: 4, max: 10, step: 1, value: 7 },
        { group: 'Arms', key: 'pitch', label: 'Segment length', unit: ' mm', min: 8, max: 14, step: 0.5, value: 10 },
        { group: 'Arms', key: 'armR', label: 'Arm thickness at the head (radius)', unit: ' mm', min: 4.5, max: 8, step: 0.1, value: 5.6 },
        { group: 'Arms', key: 'tipR', label: 'Arm thickness at the tip', unit: ' mm', min: 3.7, max: 5, step: 0.1, value: 3.8 },
        { group: 'Pose', key: 'curl', label: 'Arm curl (straight ↔ spiral)', unit: '°', min: 0, max: 9, step: 0.5, value: 5 },
        { group: 'Pose', key: 'curlMode', label: 'Curl direction', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['All one way', 'Alternating'] },
        { group: 'Pose', key: 'twist', label: 'Turn the arms', unit: '°', min: 0, max: 45, step: 1, value: 0 },
        gapParam()
      ];

      window.MM_GENERATOR = {
        code: 'MM-094',
        category: 'FLEXI // SEA CREATURES',
        title: 'Flexi Octopus',
        fileName: 'Flexi_Octopus',
        defaultColor: '#d8b4fe',
        palette: FLEXI_PALETTE,
        partNames: { head: 'Head', eyes: 'Eyes', armsA: 'Arms', armsB: 'Arms, alternate' },
        parameters: OCTO_PARAMS,
        presets: makePresets(OCTO_PARAMS, [
          ['Default octopus', {}],
          ['Squid-ish (6 long arms)', { arms: 6, armSegs: 10, pitch: 9, headH: 28, headR: 17, curl: 3 }],
          ['Baby octopus', { headR: 17, headH: 20, armSegs: 5, eyeSize: 1.4, curl: 7, curlMode: 1 }],
          ['Swirl', { curl: 9, armSegs: 8 }],
          ['Splayed flat', { curl: 0 }]
        ]),
        build: buildOctopus
      };
