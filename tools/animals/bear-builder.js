      // -----------------------------------------------------------------------
      // Bear Builder: a chunky, cuddly bear sculpted as one seamless surface (brown, polar, panda or koala-ish)
      // -----------------------------------------------------------------------
      // Species data: fur and detail colours plus a few proportions. Everything faces +x and sits on the bed.
      var BEAR_SPECIES = [
        { name: 'Brown', fur: '#a16a4a', light: '#e8cba3', inner: '#e8b995', nose: '#2b1d17', limbs: '#a16a4a', ear: '#a16a4a', pads: '#e8cba3', head: [1, 0.93, 1.05], snout: 1, noseK: 1, earK: 1, band: false },
        { name: 'Polar', fur: '#f1f5f9', light: '#f1f5f9', inner: '#cbd5e1', nose: '#1e293b', limbs: '#f1f5f9', ear: '#f1f5f9', pads: '#94a3b8', head: [1.1, 0.87, 0.97], snout: 1.3, noseK: 1.1, earK: 0.75, band: false },
        { name: 'Panda', fur: '#f8fafc', light: '#f8fafc', inner: '#475569', nose: '#111827', limbs: '#263040', ear: '#263040', pads: '#475569', head: [1, 0.92, 1.09], snout: 0.85, noseK: 1, earK: 1, band: true },
        { name: 'Koala', fur: '#9ca3af', light: '#e5e7eb', inner: '#f8fafc', nose: '#1f2937', limbs: '#9ca3af', ear: '#9ca3af', pads: '#6b7280', head: [0.96, 0.95, 1.13], snout: 0.62, noseK: 1.8, earK: 1.45, band: false }
      ];

      function buildBear(p, api) {
        var sc = new Scene(), S = new Sculpt(1.3).useEdits(api, p.size / 100), k = p.chunk, hs = p.headSize;
        var sp = BEAR_SPECIES[Math.round(p.species)], pose = Math.round(p.pose), hat = Math.round(p.hat), earStyle = Math.round(p.ears), patch = Math.round(p.patch);
        var fur = sp.fur, hr = 16 * hs, ha = sp.head[0] * hr, hb = sp.head[1] * hr, hc = sp.head[2] * hr, i;
        var hx, hy;
        S.reach = 1.15;
        // ---- body, legs and arms ----
        S.piece('torso');
        var shoulderY;
        if (pose === 1) { // standing
          hx = 3; hy = 63 + (hs - 1) * 8; shoulderY = 47;
          S.ell('body', [-2, 27, 0], [18.5 * k, 16.5, 18 * k], fur, 6);
          S.ell('body', [-1, 41, 0], [14.5 * k, 13, 14 * k], fur, 7);
          S.ell('body', [3, 49, 0], [9.5, 8, 10.5 * k], fur, 5);
          S.ell('body', [-19 * k, 25, 0], [5.2, 5.2, 5.2], fur, 3); // tail
          S.ell('body', [-1, 10, 0], [8, 10.5, 4], fur, 3); // fills the slot between the legs
          if (patch) bearPatch(S, patch, [13, 29, 0], p.patchSize * 0.92, sp.light);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'legL' : 'legR');
            S.path('legs', [[-1, 19, s * 9.8 * k, 9.4], [0, 10, s * 10.3 * k, 9], [1, 4.4, s * 10.3 * k, 8.4]], sp.limbs, 3);
            S.ell('legs', [8, 4.4, s * 10.8 * k], [11, 5, 7.8], sp.limbs, 2);
            S.paint('pads', [18, 4.8, s * 10.8 * k], [2.8, 3.2, 4.2], sp.pads);
            for (i = -1; i <= 1; i++) S.paint('pads', [17.2, 6.8, s * 10.8 * k + i * 3.8], [2.4, 1.9, 1.7], sp.pads);
            S.piece(s < 0 ? 'armL' : 'armR');
            S.path('arms', [[-1, 47, s * 11 * k, 6.5], [4, 41.5, s * 18.5 * k, 6.3], [10, 34, s * 17.5 * k, 6], [14.5, 28.5, s * 10 * k, 5.6]], sp.limbs, 3);
          });
        } else { // sitting (also the waving pose)
          hx = 4; hy = 58 + (hs - 1) * 8; shoulderY = 43;
          S.ell('body', [-3, 15, 0], [20 * k, 17, 19.5 * k], fur, 6);
          S.ell('body', [-1, 33, 0], [14.5 * k, 14, 14 * k], fur, 7);
          S.ell('body', [4, 41, 0], [10.5, 9, 11 * k], fur, 5);
          S.ell('body', [-22 * k, 10, 0], [5.4, 5.4, 5.4], fur, 3); // tail
          S.ell('body', [8, 2, 0], [13, 6.5, 14 * k], fur, 4); // seat between the thighs, so the underside is one flat base
          if (patch) bearPatch(S, patch, [12, 23, 0], p.patchSize * 0.95, sp.light);
          [-1, 1].forEach(function (s) {
            S.piece(s < 0 ? 'legL' : 'legR');
            S.path('legs', [[0, 12, s * 13.5 * k, 9.2], [12, 8.2, s * 15 * k, 8.6], [23, 7.6, s * 16.5 * k, 8.2]], sp.limbs, 3);
            S.paint('pads', [30.4, 8, s * 16.5 * k], [3.4, 5, 5], sp.pads);
            for (i = -1; i <= 1; i++) S.paint('pads', [29.6, 14, s * 16.5 * k + i * 4.6], [2.8, 2.3, 2.1], sp.pads);
            S.piece(s < 0 ? 'armL' : 'armR');
            if (pose === 2 && s > 0) { // raised, waving arm: climbs steeply so it prints without support
              S.path('arms', [[-1, 43, s * 11 * k, 6.4], [0, 51, s * 19 * k, 6.2], [2, 62, s * 26 * k, 5.8], [4, 73, s * 29 * k, 5.4]], sp.limbs, 3);
              S.paint('pads', [8.4, 74, s * 29 * k], [3.4, 3.8, 3.8], sp.pads);
              S.paint('pads', [8.2, 80, s * 29 * k], [2.4, 2, 2.2], sp.pads);
            } else {
              S.path('arms', [[-1, 43, s * 10.5 * k, 6.4], [3, 36, s * 16.8 * k, 6.2], [9, 27.5, s * 18 * k, 5.8], [15, 21.5, s * 16.5 * k, 5.4]], sp.limbs, 3);
            }
          });
        }
        if (sp.band) { // the panda's dark shoulder band
          S.piece('torso');
          S.paint('arms', [0, shoulderY - 3, 0], [17, 4.4, 26 * k], sp.limbs);
        }
        // ---- head ----
        S.piece('head');
        S.ell('head', [hx, hy, 0], [ha, hb, hc], fur, 7);
        S.ell('body', [hx + 2, hy - hb * 0.78, 0], [ha * 0.8, hb * 0.5, hc * 0.8], fur, 5); // chin and neck, so the head is held up from below
        S.ell('body', [hx + ha * 0.55, hy - hb * 0.82, 0], [ha * 0.55, hb * 0.42, hc * 0.55], fur, 4); // under the chin
        var sn = p.snout * sp.snout, mcx = hx + ha * 0.84 + (sn - 1) * 2, mcy = hy - hb * 0.26, ma = ha * 0.6 * sn + 1, mb = hb * 0.42, mc = hc * 0.56;
        S.piece('muzzle', 'head');
        S.ell('muzzle', [mcx, mcy, 0], [ma, mb, mc], sp.light, 4);
        S.ell('muzzle', [mcx - 1, mcy - mb * 0.5, 0], [ma * 0.9, mb * 0.8, mc * 0.86], sp.light, 3); // lower jaw
        var nrx = 4, nry = 3.5 * sp.noseK, nrz = 4.8 * sp.noseK;
        if (sp.noseK > 1.5) { nry = 6; nrz = 4.2; }
        S.piece('nose', 'muzzle');
        S.ell('nose', [mcx + ma - 1.6, mcy + mb * 0.3, 0], [nrx, nry, nrz], sp.nose, 1.6);
        function mzx(y, z) { return mcx + ma * Math.sqrt(Math.max(0.04, 1 - Math.pow((y - mcy) / mb, 2) - Math.pow(z / mc, 2))) - 0.3; }
        var my1 = mcy - mb * 0.1, my2 = mcy - mb * 0.62;
        S.piece('muzzle', 'head');
        S.path('mouth', [[mzx(my1, 0), my1, 0, 1.1], [mzx(my2, 0), my2, 0, 1.1]], null, 0, 2).carve(0.5);
        [-1, 1].forEach(function (s) {
          S.path('mouth', [[mzx(my2, 0), my2, 0, 0.9], [mzx(my2 - 0.8, s * mc * 0.18), my2 - 0.8, s * mc * 0.18, 0.9], [mzx(my2 + 0.6, s * mc * 0.4), my2 + 0.6, s * mc * 0.4, 0.9]], null, 0, 3).carve(0.5);
        });
        S.piece('head');
        if (Math.round(p.species) === 2) { // panda eye patches: two tilted ovals
          [-1, 1].forEach(function (s) {
            S.paint('patch', [hx + ha * 0.8, hy + hb * 0.34, s * hc * 0.46], [ha * 0.3, hb * 0.2, hc * 0.17], sp.limbs);
            S.paint('patch', [hx + ha * 0.8, hy + hb * 0.24, s * hc * 0.53], [ha * 0.3, hb * 0.2, hc * 0.17], sp.limbs);
          });
        }
        // ---- scarf (sculpted into the neck) ----
        var sy = hy - hb * 0.74;
        if (Math.round(p.scarf) === 1) {
          S.piece('scarf');
          var ring = [], rx = ha * 0.7 + 3.8, rz = hc * 0.7 + 3.8;
          for (i = 0; i <= 20; i++) { var th = (i / 20) * TAU; ring.push([hx + 2 + rx * Math.cos(th), sy + (Math.cos(th) > 0 ? -2.2 * Math.cos(th) : 0), rz * Math.sin(th), 4]); }
          S.path('scarf', ring, '#e11d48', 2.2, 2);
          var fxx = hx + 2 + rx * 0.8;
          S.plate('scarf', [[-4.2, sy + 3], [4.2, sy + 3], [5, sy - 14], [-0.5, sy - 18], [-4.8, sy - 13]], [fxx - 3.4, 0, 5.4 * k], [0, 0, 1], 3.4, '#be123c', 2.2, 1.2);
        }
        // ---- ears are rigid shells added after run() ----
        S.reach = 1.15;
        S.run();
        // eyes and nose sit on the finished surface
        [-1, 1].forEach(function (s) {
          softEye(sc, S, s < 0 ? 'eyeL' : 'eyeR', s < 0 ? 'pupilL' : 'pupilR', [hx + 80, hy + hb * 0.3, s * hc * 0.46], [-1, 0, 0], 'head', p.eye * hs, '#1e293b');
        });
        // ears: rounded domes (or pointed plates) with an inner ear
        var ER = 7 * p.earSize * sp.earK * hs * (earStyle === 1 ? 0.72 : earStyle === 2 ? 1.45 : 1);
        var phi = deg(earStyle === 2 ? 60 : 51), onHat = hat ? 1.8 : 0.4;
        [-1, 1].forEach(function (s) {
          var id = s < 0 ? 'earL' : 'earR';
          var cy = hy + hb * Math.cos(phi) * 0.97 + onHat, cz = s * hc * Math.sin(phi) * 0.97 + s * onHat, cx = hx - ha * 0.12, c = [cx, cy, cz], R = ER;
          var anc = [hx - ha * 0.12, hy + hb * 0.2, s * hc * 0.42], tris, inner;
          if (earStyle === 3) { // pointed ear: a rounded triangle plate
            var W = R * 1.05, H = R * 2.3, by = c[1] - R * 1.6;
            tris = vslab([[-0.9 * W * s, by], [0.3 * W * s, by], [0.9 * W * s, by + 1.1 * W], [0.55 * W * s, by + H * 0.78], [0.1 * W * s, by + H], [-0.35 * W * s, by + H * 0.82], [-0.85 * W * s, by + H * 0.4]], [c[0] - 1.5, 0, c[2]], [0, 0, 1], R * 0.8, 1);
            inner = vslab([[-0.5 * W * s, by + R * 0.9], [0.4 * W * s, by + R * 0.9], [0.4 * W * s, by + H * 0.55], [0.05 * W * s, by + H * 0.88], [-0.4 * W * s, by + H * 0.55]], [c[0] + R * 0.1, 0, c[2]], [0, 0, 1], R * 0.8, 0.6);
          } else {
            tris = pod(c, R * 0.6, R, R, { anchor: anc, anchorR: 2.5, rings: 24, seg: 36 }).tris;
            inner = pod([c[0] + R * 0.36, c[1] - R * 0.04, c[2] - s * R * 0.04], R * 0.5, R * 0.62, R * 0.62, { rings: 18, seg: 28 }).tris;
          }
          S.shell(sc, id, 'ears', 'b', tris, sp.ear, 'head');
          S.shell(sc, id, 'inner ears', 'b', inner, sp.inner, 'head');
        });
        // ---- hats: shells that hug the head ----
        if (hat) {
          var off = 2.1;
          // outer radius (x, z) of the head's surface at height y, with an offset
          var hrad = function (y, o, axis) {
            var a = (axis ? hc : ha) + o, b = hb + o, t = (y - hy) / b;
            return a * Math.sqrt(Math.max(0, 1 - t * t));
          };
          var cxh = hx - ha * 0.04;
          var tris2, trim, ball, yb;
          if (hat === 1) { // beanie: a knitted cap with a folded cuff and a pompom
            yb = hy + hb * 0.34;
            var cuffTop = yb + 6.4, top = hy + hb + off;
            var rings = [
              { y: yb - 1.2, cx: cxh, cz: 0, rx: hrad(yb - 1.2, -0.8, 0), rz: hrad(yb - 1.2, -0.8, 1) },
              { y: yb + 0.8, cx: cxh, cz: 0, rx: hrad(yb + 0.8, 1.1, 0), rz: hrad(yb + 0.8, 1.1, 1) },
              { y: yb + 2.4, cx: cxh, cz: 0, rx: hrad(yb + 2.4, 3.1, 0), rz: hrad(yb + 2.4, 3.1, 1) },
              { y: cuffTop - 1, cx: cxh, cz: 0, rx: hrad(cuffTop - 1, 3.2, 0), rz: hrad(cuffTop - 1, 3.2, 1) },
              { y: cuffTop, cx: cxh, cz: 0, rx: hrad(cuffTop, 2.6, 0), rz: hrad(cuffTop, 2.6, 1) },
              { y: cuffTop + 0.8, cx: cxh, cz: 0, rx: hrad(cuffTop + 0.8, 1.6, 0), rz: hrad(cuffTop + 0.8, 1.6, 1) }
            ];
            trim = loft(rings, 72, { free: true, poleLift: 0 }).tris;
            var cr = [], n = 14, y0 = cuffTop - 1.5;
            for (i = 0; i <= n; i++) {
              var yy = lerp(y0, top, i / n);
              cr.push({ y: yy, cx: cxh, cz: 0, rx: Math.max(hrad(yy, off, 0), i === n ? 0.3 : 0.9), rz: Math.max(hrad(yy, off, 1), i === n ? 0.3 : 0.9) });
            }
            tris2 = loft(cr, 72, { free: true, poleLift: 0 }).tris;
            ball = pod([cxh, top + 3, 0], 4.2, 4.2, 4.2, { anchor: [cxh, top - 1, 0], anchorR: 1.6, rings: 18, seg: 32 }).tris;
            S.shell(sc, 'hat', 'hat', 'b', tris2, '#38bdf8', 'head');
            S.shell(sc, 'hat', 'hat trim', 'b', trim, '#e0f2fe', 'head');
            S.shell(sc, 'hat', 'pompom', 'b', ball, '#fde047', 'head');
          } else { // party hat: a striped cone with a pompom on the tip
            yb = hy + hb * 0.5;
            var rb = Math.min(hrad(yb, -0.6, 0), hrad(yb, -0.6, 1)), rr = [], hh = 27 * hs;
            for (i = 0; i <= 12; i++) {
              var tt = i / 12, rad = i === 12 ? 0.3 : Math.max(0.3, rb * Math.pow(1 - tt, 0.92));
              rr.push({ y: yb - 1.5 + (hh + 1.5) * tt, cx: cxh - tt * 2, cz: 0, rx: rad, rz: rad });
            }
            tris2 = loft(rr, 56, { free: true, poleLift: 0 }).tris;
            var band = loft([
              { y: yb - 1.5, cx: cxh, cz: 0, rx: rb + 0.9, rz: rb + 0.9 },
              { y: yb + 0.4, cx: cxh, cz: 0, rx: rb + 1.4, rz: rb + 1.4 },
              { y: yb + 3.2, cx: cxh, cz: 0, rx: rb * 0.96 + 1.1, rz: rb * 0.96 + 1.1 },
              { y: yb + 4.6, cx: cxh, cz: 0, rx: rb * 0.9 + 0.1, rz: rb * 0.9 + 0.1 }
            ], 56, { free: true, poleLift: 0 }).tris;
            ball = pod([cxh - 2.2, yb - 1.5 + hh + 3.4, 0], 4, 4, 4, { anchor: [cxh - 2.2, yb - 1.5 + hh - 1.2, 0], anchorR: 1.2, rings: 18, seg: 32 }).tris;
            S.shell(sc, 'hat', 'hat', 'b', tris2, '#a855f7', 'head');
            S.shell(sc, 'hat', 'hat trim', 'b', band, '#fde047', 'head');
            S.shell(sc, 'hat', 'pompom', 'b', ball, '#fb7185', 'head');
          }
        }
        S.addTo(sc);
        return finishSculpt(sc, p.size / 100, S);
      }

      // Belly patch: a painted oval, round or heart on the front of the body.
      function bearPatch(S, kind, c, sz, color) {
        function o(dy, dz, ry, rz, rx) { S.paint('belly', [c[0], c[1] + dy * sz, c[2] + dz * sz], [rx || 8, ry * sz, rz * sz], color); }
        if (kind === 1) o(0, 0, 10.5, 8.2);
        else if (kind === 2) { // heart
          o(2.6, -3.9, 4.8, 4.6); o(2.6, 3.9, 4.8, 4.6); o(0, 0, 4.6, 7.4); o(-3.3, 0, 3.4, 5.4); o(-6, 0, 2.6, 3); o(-8, 0, 2, 1.5);
        } else { o(0, 0, 8.2, 8.2); }
      }

      var BEAR_PARAMS = [
        { group: 'Bear', key: 'species', label: 'Species', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['Brown', 'Polar', 'Panda', 'Koala'] },
        { group: 'Bear', key: 'pose', label: 'Pose', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['Sitting', 'Standing', 'Waving'] },
        { group: 'Bear', key: 'size', label: 'Overall size', unit: '%', min: 60, max: 130, step: 1, value: 100 },
        { group: 'Bear', key: 'chunk', label: 'Body (slim ↔ chunky)', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1.05 },
        { group: 'Bear', key: 'patch', label: 'Belly patch', unit: '', min: 0, max: 3, step: 1, value: 1, options: ['None', 'Oval', 'Heart', 'Round'] },
        { group: 'Bear', key: 'patchSize', label: 'Belly patch size', unit: '×', min: 0.6, max: 1.2, step: 0.05, value: 1, showIf: function (q) { return q.patch > 0; } },
        { group: 'Head', key: 'headSize', label: 'Head size', unit: '×', min: 0.85, max: 1.25, step: 0.05, value: 1 },
        { group: 'Head', key: 'snout', label: 'Snout (short ↔ long)', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head', key: 'ears', label: 'Ear shape', unit: '', min: 0, max: 3, step: 1, value: 0, options: ['Round', 'Small', 'Big fluffy', 'Pointy'] },
        { group: 'Head', key: 'earSize', label: 'Ear size', unit: '×', min: 0.7, max: 1.4, step: 0.05, value: 1 },
        { group: 'Head', key: 'eye', label: 'Eye size', unit: ' mm', min: 2, max: 4.4, step: 0.1, value: 3 },
        { group: 'Dress up', key: 'scarf', label: 'Scarf', unit: '', min: 0, max: 1, step: 1, value: 0, options: ['Off', 'On'] },
        { group: 'Dress up', key: 'hat', label: 'Hat', unit: '', min: 0, max: 2, step: 1, value: 0, options: ['None', 'Beanie', 'Party hat'] }
      ];

      window.MM_GENERATOR = {
        code: 'MM-124',
        category: 'ANIMALS // CUDDLY',
        title: 'Bear Builder',
        fileName: 'Bear',
        defaultColor: '#a16a4a',
        palette: ANIMAL_PALETTE,
        partNames: { body: 'Body', belly: 'Belly patch', arms: 'Arms', legs: 'Legs', pads: 'Paw pads', head: 'Head', muzzle: 'Muzzle', patch: 'Eye patches', ears: 'Ears', 'inner ears': 'Inner ears', scarf: 'Scarf', hat: 'Hat', 'hat trim': 'Hat trim', pompom: 'Pompom', nose: 'Nose', eyes: 'Eyes', pupils: 'Pupils', glints: 'Eye glints' },
        parameters: BEAR_PARAMS,
        presets: makePresets(BEAR_PARAMS, [
          ['Default brown bear', {}],
          ['Polar bear', { species: 1, ears: 1, patch: 0 }],
          ['Panda', { species: 2, patch: 0 }],
          ['Koala', { species: 3, ears: 2, patch: 3, headSize: 1.15 }],
          ['Standing bear', { pose: 1 }],
          ['Waving bear', { pose: 2, patch: 2 }],
          ['Winter bear', { scarf: 1, hat: 1, patch: 0 }],
          ['Party bear', { hat: 2, patch: 2, ears: 3 }],
          ['Cub', { size: 70, headSize: 1.25, earSize: 1.2, eye: 3.8, snout: 0.8, chunk: 1.2 }]
        ]),
        sculpt: sculptModule([
          { id: 'head', label: 'Head', section: 'Head' }, { id: 'muzzle', label: 'Muzzle', section: 'Head', parent: 'head' }, { id: 'nose', label: 'Nose', section: 'Head', parent: 'muzzle' },
          { id: 'earL', label: 'Left ear', section: 'Head' }, { id: 'earR', label: 'Right ear', section: 'Head' },
          { id: 'eyeL', label: 'Left eye', section: 'Head' }, { id: 'eyeR', label: 'Right eye', section: 'Head' }, { id: 'pupilL', label: 'Left pupil', section: 'Head', parent: 'eyeL' }, { id: 'pupilR', label: 'Right pupil', section: 'Head', parent: 'eyeR' },
          { id: 'hat', label: 'Hat', section: 'Head', parent: 'head' },
          { id: 'torso', label: 'Body', section: 'Body' }, { id: 'scarf', label: 'Scarf', section: 'Body' },
          { id: 'armL', label: 'Left arm', section: 'Limbs' }, { id: 'armR', label: 'Right arm', section: 'Limbs' }, { id: 'legL', label: 'Left leg', section: 'Limbs' }, { id: 'legR', label: 'Right leg', section: 'Limbs' }
        ]),
        build: buildBear
      };
