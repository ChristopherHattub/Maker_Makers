/* Maker Makers Sculpt tab, shared by every generator page.
 *
 * Loaded before generator-core.js. The engine calls MMSculpt.create(ctx) once and gets back the Sculpt state and entry points.
 * ctx is the engine's side of the deal: the config, THREE, the scene objects and a few callbacks. Reads that change over time
 * (modelData, activeTab, ...) are getters, so the module never holds a stale copy. See docs/generator-styling.md.
 *
 * ctx: cfg, T, el, $, scene, renderer, camera, controls, raycaster, pointerNDC, params, sliderRefs, modelData, modelMeshes, activeTab,
 *      wasDragged(), pickAt(x, y), groupedNormals(entries), meshSettled(), rebuild(), scheduleRebuild(),
 *      sliderForMini(p), resetMiniRefs(), syncMiniRefs(), syncSliderRefs().
 */
(function () {
  'use strict';

  window.MMSculpt = { create: create };

  function create(ctx) {
  var cfg = ctx.cfg, T = ctx.T, el = ctx.el, $ = ctx.$;
  // Sculpt tab (cfg.sculpt): an experimental edit mode, right after Parametric.
  // Select tool: click a piece, drag it to move it, stretch it with sliders, delete it. The generator gets the edits in
  // api.sculpt.edits and rebuilds with them. Sculpt tool: drag the surface. Strokes are stored and replayed on every rebuild.
  // cfg.sculpt: { pieces: [{ id, label }], available(), pieceAt(point), bounds(id) }.
  // ---------------------------------------------------------------------------
  var sc8 = { tool: 'select', brush: 'grab', mirror: false, strength: 25, sel: null, edits: {}, strokes: [], undo: [], redo: [], radius: 6, shift: null, draft: false };
  var sc8Drag = null, sc8Box = null, sc8Brush = null, sc8Ui = null, sc8Mark = null;
  var sc8MarkMat = new T.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });

  function sculptOn() { return !!cfg.sculpt && (ctx.activeTab === 'sculpt' || (!!cfg.partEdit && ctx.activeTab === 'model')); }
  function sculptEdited() { return Object.keys(sc8.edits).length > 0 || sc8.strokes.length > 0; }
  function sculptState() { return { edits: JSON.stringify(sc8.edits), strokes: sc8.strokes.slice() }; }
  function sculptSnapshot() { sc8.undo.push(sculptState()); sc8.redo = []; if (sc8.undo.length > 40) sc8.undo.shift(); }
  function sculptStep(from, to) {
    var st = from.pop();
    if (!st) return;
    to.push(sculptState());
    sc8.edits = JSON.parse(st.edits);
    sc8.strokes = st.strokes;
    sculptCommit();
  }
  function sculptUndo() { sculptStep(sc8.undo, sc8.redo); }
  function sculptRedo() { sculptStep(sc8.redo, sc8.undo); }
  function sculptEdit(id) { return sc8.edits[id] || (sc8.edits[id] = { m: [0, 0, 0], s: [1, 1, 1] }); }
  function sculptWeight(d, r) { var t = 1 - d / r; return t <= 0 ? 0 : t * t * (3 - 2 * t); }

  // Grab: moves the surface by a drag. Every other brush is a run of dabs, each one reading the surface around its centre.
  function sculptGrab(p, st, zm) {
    var rr = st.r * st.r, cz = zm === undefined ? st.c[2] : 2 * zm - st.c[2], dzm = zm === undefined ? st.d[2] : -st.d[2];
    for (var i = 0; i < p.length; i += 3) {
      var dx = p[i] - st.c[0], dy = p[i + 1] - st.c[1], dz = p[i + 2] - cz, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= rr) continue;
      var w = sculptWeight(Math.sqrt(d2), st.r);
      p[i] += st.d[0] * w; p[i + 2] += dzm * w;
      if (p[i + 1] > 1e-4) p[i + 1] = Math.max(0, p[i + 1] + st.d[1] * w); // the flat underside stays on the bed
    }
  }
  function sculptDab(entries, st, zm) {
    var r = st.r, cx = st.c[0], cy = st.c[1], cz = zm === undefined ? st.c[2] : 2 * zm - st.c[2], rr = r * r, V = new Map();
    function key(p, i) { return Math.round(p[i] * 1000) + ',' + Math.round(p[i + 1] * 1000) + ',' + Math.round(p[i + 2] * 1000); }
    function near(p, i) { var a = p[i] - cx, b = p[i + 1] - cy, c = p[i + 2] - cz; return a * a + b * b + c * c < rr; }
    function node(p, i) {
      var k = key(p, i), v = V.get(k);
      if (!v) { v = { x: p[i], y: p[i + 1], z: p[i + 2], nx: 0, ny: 0, nz: 0, sx: 0, sy: 0, sz: 0, c: 0, refs: [] }; V.set(k, v); }
      return v;
    }
    entries.forEach(function (e) {
      var p = e.positions;
      for (var i = 0; i < p.length; i += 9) {
        if (!near(p, i) && !near(p, i + 3) && !near(p, i + 6)) continue;
        var a = node(p, i), b = node(p, i + 3), c = node(p, i + 6);
        var ux = b.x - a.x, uy = b.y - a.y, uz = b.z - a.z, wx = c.x - a.x, wy = c.y - a.y, wz = c.z - a.z;
        var nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
        [[a, b, c, i], [b, c, a, i + 3], [c, a, b, i + 6]].forEach(function (t) {
          var v = t[0];
          v.nx += nx; v.ny += ny; v.nz += nz;
          v.sx += t[1].x + t[2].x; v.sy += t[1].y + t[2].y; v.sz += t[1].z + t[2].z; v.c += 2;
          v.refs.push(p, t[3]);
        });
      }
    });
    var sum = 0, px = 0, py = 0, pz = 0, ax = 0, ay = 0, az = 0;
    V.forEach(function (v) {
      var d = Math.hypot(v.x - cx, v.y - cy, v.z - cz);
      v.w = d < r ? sculptWeight(d, r) : 0;
      if (!v.w) return;
      sum += v.w; px += v.x * v.w; py += v.y * v.w; pz += v.z * v.w; ax += v.nx * v.w; ay += v.ny * v.w; az += v.nz * v.w;
    });
    if (!sum) return;
    px /= sum; py /= sum; pz /= sum;
    var al = Math.hypot(ax, ay, az) || 1; ax /= al; ay /= al; az /= al;
    var amt = (st.amt * 0.6 / 50) * r * 0.07, mix = Math.min(0.9, (st.amt * 0.6 / 50) * 0.5); // 100% on the slider is a strength of 0.6
    V.forEach(function (v) {
      if (!v.w) return;
      var x = v.x, y = v.y, z = v.z, nl = Math.hypot(v.nx, v.ny, v.nz) || 1;
      if (st.tool === 'inflate' || st.tool === 'deflate') {
        var sg = st.tool === 'inflate' ? 1 : -1;
        x += (v.nx / nl) * amt * v.w * sg; y += (v.ny / nl) * amt * v.w * sg; z += (v.nz / nl) * amt * v.w * sg;
      } else if (st.tool === 'smooth') {
        x += (v.sx / v.c - x) * mix * v.w; y += (v.sy / v.c - y) * mix * v.w; z += (v.sz / v.c - z) * mix * v.w;
      } else if (st.tool === 'flatten') {
        var h = (x - px) * ax + (y - py) * ay + (z - pz) * az;
        x -= ax * h * mix * v.w; y -= ay * h * mix * v.w; z -= az * h * mix * v.w;
      } else if (st.tool === 'pinch') {
        x += (px - x) * mix * 0.5 * v.w; y += (py - y) * mix * 0.5 * v.w; z += (pz - z) * mix * 0.5 * v.w;
      }
      for (var i = 0; i < v.refs.length; i += 2) {
        var p = v.refs[i], k = v.refs[i + 1];
        p[k] = x; p[k + 2] = z;
        if (v.y > 1e-4) p[k + 1] = Math.max(0, y); // the flat underside stays on the bed
      }
    });
  }
  function sculptApplyOne(entries, st) {
    entries = entries.filter(function (e) { return !e.noSculpt; });   // an entry flagged noSculpt (Holiday Tree ornaments) ignores brush strokes
    if (st.tool && st.tool !== 'grab') {
      sculptDab(entries, st);
      if (st.zm !== undefined) sculptDab(entries, st, st.zm);
      return;
    }
    entries.forEach(function (e) { sculptGrab(e.positions, st); if (st.zm !== undefined) sculptGrab(e.positions, st, st.zm); });
  }
  function sculptApplyStrokes(entries) {
    sc8.strokes.forEach(function (st) { sculptApplyOne(entries, st); });
  }
  function sculptMeshChanged() {
    ctx.modelMeshes.forEach(function (mesh) { mesh.geometry.attributes.position.needsUpdate = true; });
    var normals = ctx.groupedNormals(ctx.modelData);
    ctx.modelMeshes.forEach(function (mesh, i) { mesh.geometry.attributes.normal.array.set(normals[i]); mesh.geometry.attributes.normal.needsUpdate = true; });
  }
  // After a brush stroke the mesh is already right: no rebuild, only what depends on it.
  function sculptSettle() {
    ctx.modelMeshes.forEach(function (mesh) { mesh.geometry.computeBoundingSphere(); });
    ctx.meshSettled();   // the core drops its print and part caches and redraws the colors, part list, stats and wireframe
    sculptRefresh();
  }
  function sculptMirrorPlane() { return sc8.mirror ? (sc8.shift ? -sc8.shift[1] : 0) : undefined; }

  // When an edit breaks a sculpted surface into separate solids, every solid after the largest of a piece becomes its own
  // selectable piece, nested under the original. Ids are owner~n, with n in size order. Generators without the kit are already split by solid.
  function sculptSplit(entries) {
    sc8.split = null;
    if (!cfg.sculpt.kit || !sculptEdited()) return entries;
    var surface = entries.filter(function (e) { return e.smoothGroup === 'sculpt'; });
    if (!surface.length) return entries;
    var hasOwn = Object.keys(sc8.edits).some(function (k) { return k.indexOf('~') >= 0; });
    if (sc8.draft && !hasOwn) return entries;
    var ids = new Map(), parent = [], tv = [];
    function find(a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; }
    function vid(p, i) {
      var k = Math.round(p[i] * 1000) + ',' + Math.round(p[i + 1] * 1000) + ',' + Math.round(p[i + 2] * 1000), v = ids.get(k);
      if (v === undefined) { v = parent.length; parent.push(v); ids.set(k, v); }
      return v;
    }
    surface.forEach(function (e) {
      var p = e.positions, t = new Int32Array(p.length / 9);
      for (var i = 0; i < p.length; i += 9) {
        var a = find(vid(p, i)), b = find(vid(p, i + 3)), c = find(vid(p, i + 6));
        if (a !== b) parent[b] = a;
        if (find(a) !== c) parent[c] = find(a);
        t[i / 9] = vid(p, i);
      }
      tv.push(t);
    });
    var shells = new Map();
    surface.forEach(function (e, ei) {
      var p = e.positions, t = tv[ei];
      for (var f = 0; f < t.length; f++) {
        var r = find(t[f]), S = shells.get(r);
        if (!S) { S = { n: 0, lo: [1e9, 1e9, 1e9], hi: [-1e9, -1e9, -1e9], votes: {}, seen: 0 }; shells.set(r, S); }
        S.n++;
        for (var k = 0; k < 9; k++) { var ax = k % 3, v = p[f * 9 + k]; if (v < S.lo[ax]) S.lo[ax] = v; if (v > S.hi[ax]) S.hi[ax] = v; }
        if (S.n % 16 === 1 && S.seen < 40) { // a sample of triangles votes on which piece this solid belongs to
          S.seen++;
          var who = cfg.sculpt.pieceAt({ x: (p[f * 9] + p[f * 9 + 3] + p[f * 9 + 6]) / 3, y: (p[f * 9 + 1] + p[f * 9 + 4] + p[f * 9 + 7]) / 3, z: (p[f * 9 + 2] + p[f * 9 + 5] + p[f * 9 + 8]) / 3 });
          if (who) S.votes[who] = (S.votes[who] || 0) + 1;
        }
      }
    });
    var byOwner = {}, extras = [], rootOf = new Map();
    shells.forEach(function (S, r) {
      S.owner = Object.keys(S.votes).sort(function (a, b) { return S.votes[b] - S.votes[a]; })[0];
      if (S.owner) (byOwner[S.owner] = byOwner[S.owner] || []).push(S);
      S.root = r;
    });
    var known = cfg.sculpt.available();
    Object.keys(byOwner).forEach(function (o) {
      var info = known.filter(function (p) { return p.id === o; })[0] || { label: o };
      byOwner[o].sort(function (a, b) { return b.n - a.n; }).slice(1).forEach(function (S, i) {
        S.id = o + '~' + (i + 1);
        S.ed = sc8.edits[S.id] || null;
        extras.push({ id: S.id, label: info.label + ' piece ' + (i + 2), section: info.section, parent: o, shell: S });
        rootOf.set(S.root, S);
      });
    });
    if (!extras.length) return entries;
    extras.forEach(function (x) {
      var S = x.shell;
      S.c = [(S.lo[0] + S.hi[0]) / 2, (S.lo[1] + S.hi[1]) / 2, (S.lo[2] + S.hi[2]) / 2];
    });
    var out = [], maps = [];
    entries.forEach(function (e) {
      var si = surface.indexOf(e);
      if (si < 0) { out.push(e); maps.push(null); return; }
      var t = tv[si], p = e.positions, keep = [], f, k;
      for (f = 0; f < t.length; f++) { var S0 = rootOf.get(find(t[f])); if (!(S0 && S0.ed && S0.ed.del)) keep.push(f); }
      var np = new Float32Array(keep.length * 9), own = new Array(keep.length);
      keep.forEach(function (f2, n) {
        var S1 = rootOf.get(find(t[f2])), ed = S1 && S1.ed;
        own[n] = S1 ? S1.id : null;
        for (k = 0; k < 9; k++) { var ax = k % 3, v = p[f2 * 9 + k]; np[n * 9 + k] = ed ? S1.c[ax] + (v - S1.c[ax]) * ed.s[ax] + ed.m[ax] : v; }
      });
      if (!keep.length) return;
      var c = Object.assign({}, e); c.positions = np;
      out.push(c); maps.push(own);
    });
    extras.forEach(function (x) {
      var S = x.shell, ed = S.ed;
      x.lo = S.lo; x.hi = S.hi;
      if (ed && !ed.del) for (var i = 0; i < 3; i++) { var l = S.c[i] + (S.lo[i] - S.c[i]) * ed.s[i] + ed.m[i], h = S.c[i] + (S.hi[i] - S.c[i]) * ed.s[i] + ed.m[i]; x.lo = x.lo.slice(); x.hi = x.hi.slice(); x.lo[i] = l; x.hi[i] = h; }
      x.gone = !!(ed && ed.del);
    });
    sc8.split = { extras: extras, maps: maps };
    return out;
  }
  function sculptExtra(id) { return sc8.split ? sc8.split.extras.filter(function (x) { return x.id === id; })[0] : null; }
  function sculptPieces() { return cfg.sculpt.available().concat(sc8.split ? sc8.split.extras : []); }
  function sculptBounds(id) { var x = sculptExtra(id); return x ? (x.gone ? null : { lo: x.lo, hi: x.hi }) : cfg.sculpt.bounds(id); }

  // Tints the triangles of the selected piece (and the pieces that follow it).
  function sculptHighlight() {
    if (sc8Mark) { ctx.scene.remove(sc8Mark); sc8Mark.geometry.dispose(); sc8Mark = null; }
    var id = sculptOn() && sc8.tool === 'select' ? sc8.sel : null, b = id ? sculptBounds(id) : null;
    if (!b) return;
    var out = [], pad = 2, q = { x: 0, y: 0, z: 0 };
    var split = sc8.split;
    if (sculptExtra(id)) ctx.modelData.forEach(function (e, ei) {
      var own = split.maps[ei], p = e.positions;
      if (own) for (var f = 0; f < own.length; f++) if (own[f] === id) for (var k = 0; k < 9; k++) out.push(p[f * 9 + k]);
    });
    else if (cfg.sculpt.trisOf) cfg.sculpt.trisOf(id, ctx.modelData, out);
    else ctx.modelData.forEach(function (e, ei) {
      var own = split && split.maps[ei];
      var p = e.positions;
      for (var i = 0; i < p.length; i += 9) {
        q.x = (p[i] + p[i + 3] + p[i + 6]) / 3; q.y = (p[i + 1] + p[i + 4] + p[i + 7]) / 3; q.z = (p[i + 2] + p[i + 5] + p[i + 8]) / 3;
        if (q.x < b.lo[0] - pad || q.x > b.hi[0] + pad || q.y < b.lo[1] - pad || q.y > b.hi[1] + pad || q.z < b.lo[2] - pad || q.z > b.hi[2] + pad) continue;
        if (own && own[i / 9]) continue; // a broken-off solid is its own piece
        var who = cfg.sculpt.pieceAt(q);
        if (who !== id && !cfg.sculpt.isUnder(who, id)) continue;
        for (var k = 0; k < 9; k++) out.push(p[i + k]);
      }
    });
    if (!out.length) return;
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(out), 3));
    sc8Mark = new T.Mesh(g, sc8MarkMat);
    sc8Mark.renderOrder = 2;
    ctx.scene.add(sc8Mark);
  }

  function sculptRefresh() {
    var flag = $('mm-sculpt-flag');
    if (flag) flag.hidden = !sculptEdited();
    if (!sc8Box) {
      sc8Box = new T.Box3Helper(new T.Box3(), new T.Color(0xfbbf24));
      sc8Box.visible = false;
      ctx.scene.add(sc8Box);
    }
    var b = sculptOn() && sc8.tool === 'select' && sc8.sel ? sculptBounds(sc8.sel) : null;
    sc8Box.visible = !!b;
    if (b) { sc8Box.box.min.set(b.lo[0], b.lo[1], b.lo[2]); sc8Box.box.max.set(b.hi[0], b.hi[1], b.hi[2]); }
    sculptHighlight();
    if (sc8Ui) sc8Ui();
    if (cfg.partEdit) partEditRefresh();
  }
  // Part-edit mini window (cfg.partEdit): the settings of the selected piece, over the 3D view.
  // A parameter belongs to a piece when its `part` (a label or a list of labels) matches the piece's label from cfg.sculptLink / partNames.
  var peBox = null, peKey = '';
  function partEditRefresh() {
    var id = sculptOn() ? sc8.sel : null, piece = null;
    if (id) sculptPieces().forEach(function (q) { if (q.id === id) piece = q; });
    if (!peBox) {
      peBox = el('div', { class: 'mm-pe', id: 'mm-pe', role: 'dialog', 'aria-label': 'Part settings', hidden: '' });
      ctx.renderer.domElement.parentNode.appendChild(peBox);
    }
    if (!piece || (sc8.edits[id] && sc8.edits[id].del)) { peBox.hidden = true; peKey = ''; return; }
    var mine = (cfg.parameters || []).filter(function (p) {
      var w = [].concat(p.part || []);
      return (w.indexOf(piece.base) >= 0 || w.indexOf(piece.label) >= 0) && (!p.showIf || p.showIf(ctx.params));
    });
    var key = id + '|' + mine.map(function (p) { return p.key; }).join(',');
    var moved = !!(sc8.edits[id] && (sc8.edits[id].m[0] || sc8.edits[id].m[1] || sc8.edits[id].m[2]));
    if (key !== peKey) {
      peKey = key; ctx.resetMiniRefs();
      peBox.innerHTML = '';
      peBox.appendChild(el('div', { class: 'mm-pe-head' }, [
        el('strong', { text: piece.label }),
        el('button', { type: 'button', class: 'mm-pe-x', 'aria-label': 'Close part settings', text: '\u00d7', onclick: function () { sc8.sel = null; sculptRefresh(); } })
      ]));
      var body = el('div', { class: 'mm-pe-body' });
      if (mine.length) mine.forEach(function (p) { body.appendChild(ctx.sliderForMini(p)); });
      else body.appendChild(el('p', { class: 'mm-note', text: 'No settings for this part. Drag it to move it.' }));
      peBox.appendChild(body);
      peBox.appendChild(el('div', { class: 'mm-pe-foot' }, [
        el('button', { type: 'button', class: 'mm-btn', id: 'mm-pe-undo', text: 'Undo', onclick: function () { sculptUndo(); } }),
        el('button', { type: 'button', class: 'mm-btn', id: 'mm-pe-reset', text: 'Reset position', onclick: function () {
          var ed = sc8.edits[sc8.sel]; if (!ed) return;
          sculptSnapshot(); ed.m = [0, 0, 0]; if (!ed.del && ed.s[0] === 1 && ed.s[1] === 1 && ed.s[2] === 1) delete sc8.edits[sc8.sel];
          sculptCommit();
        } })
      ]));
    } else ctx.syncMiniRefs();
    var rb = $('mm-pe-reset'); if (rb) rb.hidden = !moved;
    var ub = $('mm-pe-undo'); if (ub) ub.hidden = !sc8.undo.length;
    ctx.syncSliderRefs();
    peBox.hidden = false;
  }

  function sculptCommit() { sc8.draft = false; ctx.rebuild(); }
  function sculptDraft() { sc8.draft = true; ctx.scheduleRebuild(); }

  function sculptBrushAt(point) {
    if (!sc8Brush) {
      sc8Brush = new T.Mesh(new T.SphereGeometry(1, 24, 16), new T.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.22, depthWrite: false }));
      ctx.scene.add(sc8Brush);
    }
    sc8Brush.visible = !!point;
    if (point) { sc8Brush.position.copy(point); sc8Brush.scale.setScalar(sc8.radius); }
  }

  function sculptPlanePoint(e, drag) {
    var rect = ctx.renderer.domElement.getBoundingClientRect();
    ctx.pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ctx.pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    ctx.raycaster.setFromCamera(ctx.pointerNDC, ctx.camera);
    return ctx.raycaster.ray.intersectPlane(drag.plane, new T.Vector3());
  }

  function sculptPointerDown(e) {
    if (!sculptOn() || e.button !== 0 || e.target !== ctx.renderer.domElement) return;
    var hit = ctx.pickAt(e.clientX, e.clientY);
    if (!hit) { sc8Drag = { type: 'none' }; return; }
    ctx.controls.enabled = false;
    var n = new T.Vector3();
    ctx.camera.getWorldDirection(n);
    var drag = { start: hit.point.clone(), plane: new T.Plane().setFromNormalAndCoplanarPoint(n, hit.point), moved: false };
    if (sc8.tool === 'select') {
      var own = sc8.split && sc8.split.maps[hit.meshIndex];
      var id = (own && own[hit.faceIndex]) || cfg.sculpt.pieceAt(hit.point, hit);
      sc8.sel = id;
      drag.type = 'move'; drag.id = id;
      drag.base = (sc8.edits[id] && sc8.edits[id].m || [0, 0, 0]).slice();
      sculptRefresh();
    } else {
      var zm = sculptMirrorPlane();
      if (sc8.brush === 'grab') {
        drag.type = 'grab';
        drag.stroke = { c: [hit.point.x, hit.point.y, hit.point.z], r: sc8.radius, d: [0, 0, 0], zm: zm };
        drag.orig = ctx.modelData.map(function (m) { return m.positions.slice(); });
      } else {
        drag.type = 'paint';
        drag.moved = true;
        sculptSnapshot();
        drag.dab = function (pt) {
          var st = { tool: sc8.brush, c: [pt.x, pt.y, pt.z], r: sc8.radius, amt: sc8.strength, zm: zm };
          sc8.strokes.push(st);
          sculptApplyOne(ctx.modelData, st);
          sculptMeshChanged();
          sculptBrushAt(pt);
          if ($('mm-sculpt-flag')) $('mm-sculpt-flag').hidden = false;
        };
        drag.dab(hit.point);
      }
    }
    sc8Drag = drag;
  }

  function sculptPointerMove(e) {
    if (!sculptOn()) return;
    if (!sc8Drag) {
      if (sc8.tool === 'sculpt' && e.target === ctx.renderer.domElement && e.pointerType !== 'touch') { var h = ctx.pickAt(e.clientX, e.clientY); sculptBrushAt(h && h.point); }
      return;
    }
    var drag = sc8Drag;
    if (drag.type === 'none') return;
    e.preventDefault();
    if (drag.type === 'paint') {
      drag.ex = e.clientX; drag.ey = e.clientY;
      if (drag.queued) return;
      drag.queued = true;
      requestAnimationFrame(function () {
        drag.queued = false;
        if (sc8Drag !== drag) return;
        var h = ctx.pickAt(drag.ex, drag.ey);
        if (h) drag.dab(h.point);
      });
      return;
    }
    var pt = sculptPlanePoint(e, drag);
    if (!pt) return;
    var d = pt.sub(drag.start);
    if (!drag.moved) {
      if (d.length() < 0.6) return;
      drag.moved = true;
      sculptSnapshot();
    }
    if (drag.type === 'move') {
      if (!drag.id) return;
      sculptEdit(drag.id).m = [drag.base[0] + d.x, drag.base[1] + d.y, drag.base[2] + d.z];
      sculptDraft();
    } else {
      drag.stroke.d = [d.x, d.y, d.z];
      if (drag.queued) return;
      drag.queued = true;
      requestAnimationFrame(function () {
        drag.queued = false;
        if (sc8Drag !== drag) return;
        ctx.modelData.forEach(function (m, i) { m.positions.set(drag.orig[i]); });
        sculptApplyOne(ctx.modelData, drag.stroke);
        sculptMeshChanged();
        sculptBrushAt(new T.Vector3(drag.stroke.c[0] + drag.stroke.d[0], drag.stroke.c[1] + drag.stroke.d[1], drag.stroke.c[2] + drag.stroke.d[2]));
      });
    }
  }

  function sculptPointerUp() {
    var drag = sc8Drag;
    sc8Drag = null;
    ctx.controls.enabled = true;
    sculptBrushAt(null);
    if (!drag || drag.type === 'none') {
      if (drag && sculptOn() && !ctx.wasDragged() && sc8.tool === 'select' && sc8.sel) { sc8.sel = null; sculptRefresh(); }
      return;
    }
    if (!drag.moved) return;
    if (drag.type === 'move') { sculptCommit(); return; }
    if (drag.type === 'grab') {
      // a drag that ends before its last frame ran: bring the mesh up to the final position
      ctx.modelData.forEach(function (m, i) { m.positions.set(drag.orig[i]); });
      sculptApplyOne(ctx.modelData, drag.stroke);
      sculptMeshChanged();
      sc8.strokes.push(drag.stroke);
    }
    sculptSettle();
  }

  function sculptToggleDelete() {
    if (!sc8.sel) return;
    sculptSnapshot();
    var ed = sculptEdit(sc8.sel);
    ed.del = !ed.del;
    sculptCommit();
  }

  // Sculpt for any generator: each separate closed shell of the model is a piece, found from the mesh after every build.
  // A shell can be moved, stretched or deleted as a whole, so the surfaces stay closed. A model built as one shell has one piece.
  function sculptGeneric() {
    var last = null;
    function analyse(entries) {
      var groups = {}, order = [];
      entries.forEach(function (e, i) { var g = e.smoothGroup || ('#' + i); if (!groups[g]) { groups[g] = []; order.push(g); } groups[g].push(i); });
      var pieces = [], maps = entries.map(function (e) { return new Int32Array(e.positions.length / 9); }), counts = {};
      order.forEach(function (g) {
        var ids = new Map(), parent = [];
        function find(a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; }
        function vid(p, i) {
          var k = Math.round(p[i] * 1000) + ',' + Math.round(p[i + 1] * 1000) + ',' + Math.round(p[i + 2] * 1000), v = ids.get(k);
          if (v === undefined) { v = parent.length; parent.push(v); ids.set(k, v); }
          return v;
        }
        var tv = [];
        groups[g].forEach(function (ei) {
          var p = entries[ei].positions, t = [];
          for (var i = 0; i < p.length; i += 9) {
            var a = vid(p, i), b = vid(p, i + 3), c = vid(p, i + 6), ra = find(a), rb = find(b);
            if (ra !== rb) parent[rb] = ra;
            var rc = find(c), r2 = find(a);
            if (rc !== r2) parent[rc] = r2;
            t.push(a);
          }
          tv.push(t);
        });
        var rootTo = new Map();
        groups[g].forEach(function (ei, gi) {
          var t = tv[gi], m = maps[ei], p = entries[ei].positions, name = entries[ei].name || 'body';
          for (var f = 0; f < t.length; f++) {
            var r = find(t[f]), pi = rootTo.get(r);
            if (pi === undefined) { pi = pieces.length; rootTo.set(r, pi); pieces.push({ g: g, tris: {}, lo: [1e9, 1e9, 1e9], hi: [-1e9, -1e9, -1e9] }); }
            m[f] = pi;
            var P = pieces[pi];
            P.tris[name] = (P.tris[name] || 0) + 1;
            for (var c2 = 0; c2 < 9; c2++) { var ax = c2 % 3, v2 = p[f * 9 + c2]; if (v2 < P.lo[ax]) P.lo[ax] = v2; if (v2 > P.hi[ax]) P.hi[ax] = v2; }
          }
        });
      });
      // cfg.sculptLink(meshName, lo, hi) can return { key, label }: shells with the same key are one piece (a wheel and its axle).
      if (cfg.sculptLink) {
        var mlo = [1e9, 1e9, 1e9], mhi = [-1e9, -1e9, -1e9];
        pieces.forEach(function (P) { for (var a = 0; a < 3; a++) { mlo[a] = Math.min(mlo[a], P.lo[a]); mhi[a] = Math.max(mhi[a], P.hi[a]); } });
        var keyTo = {}, kept = [], remap = pieces.map(function (P) {
          var top = Object.keys(P.tris)[0], link = cfg.sculptLink(top, P.lo, P.hi, { lo: mlo, hi: mhi }), into = link && keyTo[link.key];
          if (!into) { kept.push(P); if (link) { keyTo[link.key] = P; P.linkLabel = link.label; } return kept.length - 1; }
          Object.keys(P.tris).forEach(function (n) { into.tris[n] = (into.tris[n] || 0) + P.tris[n]; });
          for (var a = 0; a < 3; a++) { into.lo[a] = Math.min(into.lo[a], P.lo[a]); into.hi[a] = Math.max(into.hi[a], P.hi[a]); }
          return kept.indexOf(into);
        });
        pieces = kept;
        maps.forEach(function (m) { for (var f = 0; f < m.length; f++) m[f] = remap[m[f]]; });
      }
      var names = cfg.partNames || {}, totals = {};
      pieces.forEach(function (P) {
        var best = Object.keys(P.tris).sort(function (a, b) { return P.tris[b] - P.tris[a]; })[0];
        P.name = best; P.base = P.linkLabel || names[best] || best.charAt(0).toUpperCase() + best.slice(1);
        totals[P.base] = (totals[P.base] || 0) + 1;
      });
      pieces.forEach(function (P) {
        counts[P.base] = (counts[P.base] || 0) + 1;
        P.id = P.base + '#' + counts[P.base];
        P.label = totals[P.base] > 1 ? P.base + ' ' + counts[P.base] : P.base;
        P.section = totals[P.base] > 1 ? P.base : 'Pieces';
      });
      return { pieces: pieces, maps: maps };
    }
    return {
      apply: function (entries) {
        last = null;
        if (!Object.keys(sc8.edits).length) return entries;
        var an = analyse(entries);
        an.pieces.forEach(function (P) {
          var ed = sc8.edits[P.id];
          P.ed = ed || null;
          P.c = [(P.lo[0] + P.hi[0]) / 2, (P.lo[1] + P.hi[1]) / 2, (P.lo[2] + P.hi[2]) / 2];
          P.lift = 0;
          if (ed && !ed.del) { // a piece moved below the bed is lifted back onto it
            var ny = P.c[1] + (P.lo[1] - P.c[1]) * ed.s[1] + ed.m[1];
            P.lift = ny < 0 ? -ny : 0;
          }
        });
        var out = [];
        entries.forEach(function (e, ei) {
          var p = e.positions, m = an.maps[ei], keep = [], i, k;
          for (var f = 0; f < m.length; f++) if (!(an.pieces[m[f]].ed && an.pieces[m[f]].ed.del)) keep.push(f);
          var np = new Float32Array(keep.length * 9), nm = new Int32Array(keep.length), sh = e.shade ? new Float32Array(keep.length * 3) : null;
          keep.forEach(function (f, n) {
            var P = an.pieces[m[f]], ed = P.ed;
            nm[n] = m[f];
            for (k = 0; k < 9; k++) {
              var ax = k % 3, v = p[f * 9 + k];
              np[n * 9 + k] = ed ? P.c[ax] + (v - P.c[ax]) * ed.s[ax] + ed.m[ax] + (ax === 1 ? P.lift : 0) : v;
            }
            if (sh) for (k = 0; k < 3; k++) sh[n * 3 + k] = e.shade[f * 3 + k];
          });
          if (!keep.length) return;
          var c = Object.assign({}, e); c.positions = np; if (sh) c.shade = sh;
          out.push(c); c.__map = nm;
        });
        an.pieces.forEach(function (P) {
          if (!P.ed || P.ed.del) return;
          for (var i = 0; i < 3; i++) {
            var l = P.c[i] + (P.lo[i] - P.c[i]) * P.ed.s[i] + P.ed.m[i] + (i === 1 ? P.lift : 0), h = P.c[i] + (P.hi[i] - P.c[i]) * P.ed.s[i] + P.ed.m[i] + (i === 1 ? P.lift : 0);
            P.lo[i] = l; P.hi[i] = h;
          }
        });
        last = { pieces: an.pieces, maps: out.map(function (e) { return e.__map; }) };
        return out;
      },
      _ensure: function () { if (!last) last = analyse(ctx.modelData); return last; },
      available: function () { return this._ensure().pieces; },
      pieceAt: function (pt, hit) {
        var a = this._ensure(), m = hit && a.maps[hit.meshIndex];
        return m && a.pieces[m[hit.faceIndex]] ? a.pieces[m[hit.faceIndex]].id : null;
      },
      bounds: function (id) {
        var P = this._ensure().pieces.filter(function (q) { return q.id === id; })[0];
        return P && !(P.ed && P.ed.del) ? { lo: P.lo, hi: P.hi } : null;
      },
      isUnder: function () { return false; },
      trisOf: function (id, entries, out) {
        var a = this._ensure(), idx = -1;
        a.pieces.forEach(function (q, i) { if (q.id === id) idx = i; });
        if (idx < 0) return;
        entries.forEach(function (e, ei) {
          var m = a.maps[ei], p = e.positions;
          if (!m) return;
          for (var f = 0; f < m.length; f++) if (m[f] === idx) for (var k = 0; k < 9; k++) out.push(p[f * 9 + k]);
        });
      }
    };
  }

  function sculptTabConfig() {
    return {
      id: 'sculpt', label: 'Sculpt',
      hint: 'Drag to edit. Empty space orbits',
      onPick: function () {},
      mount: function (box) {
        box.appendChild(el('h3', { class: 'mm-group-title', text: 'Sculpt' }));
        var toolBtns = {};
        function toolChip(id, label) {
          toolBtns[id] = el('button', { class: 'mm-chip', type: 'button', text: label, onclick: function () { sc8.tool = id; sculptBrushAt(null); sculptRefresh(); } });
          return toolBtns[id];
        }
        var toolRow = el('div', { class: 'mm-chips' }, [toolChip('select', 'Select'), toolChip('sculpt', 'Sculpt')]);
        if (cfg.partEdit) toolRow.style.display = 'none'; // moving parts lives on the Parametric tab
        box.appendChild(toolRow);
        var note = el('p', { class: 'mm-note' });
        var selectBox = el('div', {}), sculptBox = el('div', {});
        box.appendChild(note); box.appendChild(selectBox); box.appendChild(sculptBox);

        function slider(label, min, max, step, get, set, fmt, onDone, warnAt) {
          var out = el('span', { class: 'mm-slider-value' });
          var warn = el('span', { class: 'mm-slider-warn', hidden: '', text: 'May cause mesh errors' });
          function checkWarn(v) { if (warnAt) warn.hidden = v < warnAt; }
          var input = el('input', { type: 'range', min: String(min), max: String(max), step: String(step) });
          input.value = get(); out.textContent = fmt(get()); checkWarn(get());
          input.addEventListener('input', function () { set(Number(input.value)); out.textContent = fmt(Number(input.value)); checkWarn(Number(input.value)); });
          input.addEventListener('change', function () { if (onDone) onDone(); });
          return { node: el('div', { class: 'mm-slider' }, [el('div', { class: 'mm-slider-head' }, [el('span', { class: 'mm-slider-title' }, [el('label', { text: label }), warn]), out]), input]),
            sync: function () { input.value = get(); out.textContent = fmt(get()); } };
        }
        // Select tool
        var chips = el('div', { class: 'mm-part-tree' }), detail = el('div', {}), chipKey = '', chipEls = {}, openers = {};
        selectBox.appendChild(el('h3', { class: 'mm-group-title', text: 'Pieces' }));
        selectBox.appendChild(chips);
        function partChip(p, inSummary) {
          var c = el('button', { class: 'mm-chip', type: 'button', text: p.label, onclick: function (e) { if (inSummary) e.preventDefault(); sc8.sel = p.id; sculptRefresh(); } });
          chipEls[p.id] = c;
          return c;
        }
        // A piece with children is a collapsible row; pieces are grouped into sections by their `section` name.
        function partNode(p, list) {
          var kids = list.filter(function (q) { return q.parent === p.id; });
          if (!kids.length) return partChip(p, false);
          var d = el('details', { class: 'mm-part-node' }, [el('summary', {}, [partChip(p, true)]), el('div', { class: 'mm-part-kids' }, kids.map(function (q) { return partNode(q, list); }))]);
          kids.forEach(function (q) { openers[q.id] = { d: d, parent: p.id }; });
          return d;
        }
        selectBox.appendChild(detail);
        var snapped = false;
        function setScale(axis, v) {
          if (!sc8.sel) return;
          if (!snapped) { sculptSnapshot(); snapped = true; }
          sculptEdit(sc8.sel).s[axis] = v / 100;
          sculptDraft();
        }
        function done() { snapped = false; sculptCommit(); }
        function pct(v) { return Math.round(v) + '%'; }
        function curS(axis) { var e = sc8.sel && sc8.edits[sc8.sel]; return e && e.s ? Math.round(e.s[axis] * 100) : 100; }
        var sW = slider('Stretch length', 40, 250, 5, function () { return curS(0); }, function (v) { setScale(0, v); }, pct, done);
        var sH = slider('Stretch height', 40, 250, 5, function () { return curS(1); }, function (v) { setScale(1, v); }, pct, done);
        var sD = slider('Stretch width', 40, 250, 5, function () { return curS(2); }, function (v) { setScale(2, v); }, pct, done);
        var delBtn = el('button', { class: 'mm-btn', type: 'button', title: 'Delete key', onclick: sculptToggleDelete });
        var resetPiece = el('button', { class: 'mm-btn', type: 'button', text: 'Reset piece', onclick: function () {
          if (!sc8.sel || !sc8.edits[sc8.sel]) return;
          sculptSnapshot();
          delete sc8.edits[sc8.sel];
          sculptCommit();
        } });
        var selName = el('p', { class: 'mm-note' });
        detail.appendChild(selName);
        detail.appendChild(el('div', { class: 'mm-export-row' }, [delBtn, resetPiece]));
        detail.appendChild(sW.node); detail.appendChild(sH.node); detail.appendChild(sD.node);
        // Sculpt tool
        var brushes = [['grab', 'Grab', 'Drag to pull the surface.'], ['inflate', 'Inflate', 'Brush over the surface to puff it out.'], ['deflate', 'Deflate', 'Brush over the surface to press it in.'],
          ['smooth', 'Smooth', 'Brush over bumps to soften them.'], ['flatten', 'Flatten', 'Brush over the surface to level it.'], ['pinch', 'Pinch', 'Brush along a line to draw the surface together.']];
        var brushChips = el('div', { class: 'mm-chips' }), brushNote = el('p', { class: 'mm-note' });
        brushes.forEach(function (b) {
          brushChips.appendChild(el('button', { class: 'mm-chip', type: 'button', 'data-id': b[0], text: b[1], onclick: function () { sc8.brush = b[0]; sc8Ui(); } }));
        });
        sculptBox.appendChild(el('h3', { class: 'mm-group-title', text: 'Brushes' }));
        sculptBox.appendChild(brushChips);
        sculptBox.appendChild(brushNote);
        var rS = slider('Brush size', 2, 40, 1, function () { return sc8.radius; }, function (v) { sc8.radius = v; }, function (v) { return v + ' mm'; }, null, 20);
        var sS = slider('Strength', 1, 100, 1, function () { return sc8.strength; }, function (v) { sc8.strength = v; }, function (v) { return v + '%'; }, null, 60);
        sculptBox.appendChild(rS.node);
        sculptBox.appendChild(sS.node);
        var mirrorBtn = el('button', { class: 'mm-chip', type: 'button', text: 'Mirror left and right', onclick: function () { sc8.mirror = !sc8.mirror; sc8Ui(); } });
        sculptBox.appendChild(el('div', { class: 'mm-chips' }, [mirrorBtn]));
        // Both tools
        var undoBtn = el('button', { class: 'mm-btn', type: 'button', text: 'Undo', title: 'Ctrl+Z', onclick: sculptUndo });
        var redoBtn = el('button', { class: 'mm-btn', type: 'button', text: 'Redo', title: 'Ctrl+Y', onclick: sculptRedo });
        var resetAll = el('button', { class: 'mm-btn mm-btn--block', type: 'button', text: 'Reset all', onclick: function () {
          if (!sculptEdited()) return;
          sculptSnapshot();
          sc8.edits = {}; sc8.strokes = []; sc8.sel = null;
          sculptCommit();
        } });
        box.appendChild(el('div', { class: 'mm-export-row' }, [undoBtn, redoBtn]));
        box.appendChild(resetAll);
        box.appendChild(el('p', { class: 'mm-note', text: 'The print check runs when you leave this tab, so all your edits are checked at once.' }));

        sc8Ui = function () {
          toolBtns.select.setAttribute('aria-pressed', String(sc8.tool === 'select'));
          toolBtns.sculpt.setAttribute('aria-pressed', String(sc8.tool === 'sculpt'));
          selectBox.hidden = sc8.tool !== 'select';
          sculptBox.hidden = sc8.tool !== 'sculpt';
          note.textContent = sc8.tool === 'select' ? 'Click a piece or pick it from the list. Drag it on the model to move it.' : 'Pick a brush, then work on the model.';
          var list = sculptPieces(), key = list.map(function (p) { return p.id; }).join();
          if (key !== chipKey) {
            chipKey = key;
            while (chips.firstChild) chips.removeChild(chips.firstChild);
            chipEls = {}; openers = {};
            var names = [];
            list.forEach(function (p) { var n = p.section || 'Pieces'; if (names.indexOf(n) < 0) names.push(n); });
            names.forEach(function (n, i) {
              var tops = list.filter(function (p) { return (p.section || 'Pieces') === n && !(p.parent && list.some(function (q) { return q.id === p.parent; })); });
              var sec = el('details', { class: 'mm-part-node mm-part-section' }, [el('summary', { text: n }), el('div', { class: 'mm-part-kids' }, tops.map(function (p) { return partNode(p, list); }))]);
              if (i === 0) sec.open = true;
              chips.appendChild(sec);
            });
          }
          Object.keys(chipEls).forEach(function (id) { chipEls[id].setAttribute('aria-pressed', String(id === sc8.sel)); });
          // Picking a nested piece on the model opens the rows that hold it.
          if (sc8.sel && chipEls[sc8.sel]) {
            var up = chipEls[sc8.sel].parentNode;
            while (up && up !== chips) { if (up.tagName === 'DETAILS') up.open = true; up = up.parentNode; }
            if (sc8.sel !== sc8Ui.lastSel) { var o = openers[sc8.sel]; if (o) o.d.open = true; }
          }
          sc8Ui.lastSel = sc8.sel;
          detail.hidden = !sc8.sel;
          if (sc8.sel) {
            var info = sculptPieces().filter(function (p) { return p.id === sc8.sel; })[0], ed = sc8.edits[sc8.sel];
            selName.textContent = 'Selected: ' + (info ? info.label : sc8.sel);
            delBtn.textContent = ed && ed.del ? 'Restore' : 'Delete';
            sW.sync(); sH.sync(); sD.sync();
          }
          undoBtn.disabled = !sc8.undo.length;
          redoBtn.disabled = !sc8.redo.length;
          Array.prototype.forEach.call(brushChips.children, function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-id') === sc8.brush)); });
          brushNote.textContent = brushes.filter(function (b) { return b[0] === sc8.brush; })[0][2];
          mirrorBtn.setAttribute('aria-pressed', String(sc8.mirror));
          resetAll.disabled = !sculptEdited();
        };
      }
    };
  }
  return {
    state: sc8,
    on: sculptOn,
    edited: sculptEdited,
    applyStrokes: sculptApplyStrokes,
    split: sculptSplit,
    refresh: sculptRefresh,
    commit: sculptCommit,
    brushAt: sculptBrushAt,
    generic: sculptGeneric,
    tabConfig: sculptTabConfig,
    // Leaving or entering a tab with part-edit: back to the Select tool, nothing selected, no brush ring.
    resetForTab: function (tab) {
      sc8.tool = tab === 'sculpt' ? 'sculpt' : 'select'; sc8.sel = null; if (sc8Brush) sc8Brush.visible = false;
    },
    // Pointer and keyboard wiring, called once by the engine when the generator has a Sculpt tab.
    bindEvents: function () {
      // Capture phase on the parent, so a drag on the model is claimed before OrbitControls starts an orbit.
      ctx.renderer.domElement.parentNode.addEventListener('pointerdown', sculptPointerDown, true);
      window.addEventListener('pointermove', sculptPointerMove);
      window.addEventListener('pointerup', sculptPointerUp);
      window.addEventListener('pointercancel', sculptPointerUp);
      // Ctrl+Z undo, Ctrl+Y or Ctrl+Shift+Z redo (Cmd on a Mac), only in this tab.
      window.addEventListener('keydown', function (e) {
        if (!sculptOn() || !(e.ctrlKey || e.metaKey) || e.altKey) return;
        var t = e.target, typing = t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'range'));
        if (typing) return;
        var k = e.key.toLowerCase();
        if (k === 'z' && !e.shiftKey) { e.preventDefault(); sculptUndo(); }
        else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); sculptRedo(); }
      });
      // Delete or Backspace removes the selected piece (Restore or Undo brings it back).
      window.addEventListener('keydown', function (e) {
        if (!sculptOn() || cfg.partEdit || sc8.tool !== 'select' || !sc8.sel || (e.key !== 'Delete' && e.key !== 'Backspace')) return;
        var t = e.target;
        if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'range'))) return;
        var cur = sc8.edits[sc8.sel];
        if (cur && cur.del) return;
        e.preventDefault();
        sculptToggleDelete();
      });
    }
  };
  }
})();
