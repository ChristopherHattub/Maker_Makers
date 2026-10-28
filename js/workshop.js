// Workshop: a free-range 3D editor. Import STL files, add shapes from a catalog, move / rotate / scale them,
// and export the whole scene as one STL. Runs entirely in the browser: files are read locally, never uploaded,
// and the autosave lives in localStorage only. See docs/workshop.md.
//
// The scene is Z-up like a slicer: the bed is the XY plane, so what you see matches what you export.

const WS_LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/TransformControls.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/BufferGeometryUtils.js'
];
const WS_SAVE_KEY = 'mm-workshop-v1';

const WS = { ready: false, loading: null, objs: [], sel: [], hist: [], hi: -1, mode: 'translate', snap: true, bed: 256, nextId: 1, set: 'basic', open: 'strip', q: '' };
const wsEl = {};

// ---------------------------------------------------------------- catalog

// Each shape: build(params) returns a Z-up BufferGeometry in mm. A shape with `gen` has a generator page: double-click it in the
// scene to jump to that generator's editor. `params` marks shapes whose geometry is rebuilt from the inspector.
function wsCatalog() {
  const T = THREE;
  const U = g => g.rotateX(Math.PI / 2);                       // Y-up primitive -> Z-up
  const merge = list => {
    const gs = list.map(g => { const n = g.index ? g.toNonIndexed() : g; n.deleteAttribute('uv'); return n; });
    return THREE.BufferGeometryUtils.mergeBufferGeometries(gs);
  };
  const at = (g, x, y, z) => g.translate(x, y, z);
  const extrude = (shape, depth) => new T.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 16 });
  const poly = pts => { const s = new T.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; };
  const ngon = (n, r, rot = 0) => poly([...Array(n)].map((_, i) => [Math.cos(rot + i * 2 * Math.PI / n) * r, Math.sin(rot + i * 2 * Math.PI / n) * r]));

  const heartShape = () => {
    const s = new T.Shape();
    s.moveTo(0, -14); s.bezierCurveTo(-22, 2, -14, 16, 0, 8); s.bezierCurveTo(14, 16, 22, 2, 0, -14);
    return s;
  };

  // Text is rasterised on a canvas and turned into merged boxes, so any keyboard character works with no font files.
  const textGeo = (p, extraZ = 0) => {
    const lines = String(p.text || ' ').split('\n');
    const px = 56, c = document.createElement('canvas'), ctx = c.getContext('2d');
    const font = `${p.bold ? 'bold ' : ''}${px}px "Helvetica Neue", Arial, sans-serif`;
    ctx.font = font;
    const wpx = Math.max(8, Math.ceil(Math.max(...lines.map(l => ctx.measureText(l).width))) + 8), hpx = Math.ceil(px * 1.25 * lines.length);
    c.width = wpx; c.height = hpx;
    ctx.font = font; ctx.fillStyle = '#000'; ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, 4, i * px * 1.25 + 4));
    const d = ctx.getImageData(0, 0, wpx, hpx).data, ps = p.size / px;      // mm per pixel
    const on = (x, y) => d[(y * wpx + x) * 4 + 3] > 110;
    const boxes = [], open = {};                                            // merge runs vertically into larger rectangles
    for (let y = 0; y <= hpx; y++) {
      const runs = {};
      if (y < hpx) for (let x = 0; x < wpx;) {
        if (!on(x, y)) { x++; continue; }
        let e = x; while (e < wpx && on(e, y)) e++;
        runs[x + ',' + e] = 1; x = e;
      }
      Object.keys(open).forEach(k => { if (!runs[k]) { boxes.push([k, open[k], y]); delete open[k]; } });
      Object.keys(runs).forEach(k => { if (!(k in open)) open[k] = y; });
    }
    const parts = boxes.map(([k, y0, y1]) => {
      const [x0, x1] = k.split(',').map(Number), w = (x1 - x0) * ps, h = (y1 - y0) * ps;
      return at(new T.BoxGeometry(w, h, p.thickness), (x0 * ps) + w / 2, -(y0 * ps) - h / 2, p.thickness / 2 + extraZ);
    });
    if (!parts.length) parts.push(new T.BoxGeometry(1, 1, p.thickness));
    return { geo: merge(parts), w: wpx * ps, h: hpx * ps };
  };
  const textShape = p => textGeo(p).geo;
  const sign = (plate, label, th = 3) => {                 // a flat plate with raised text on it
    plate.computeBoundingBox();
    const t = textGeo({ text: label, size: 9, thickness: 1.6, bold: true }, th);
    t.geo.translate(-t.w / 2, t.h / 2, 0);
    return merge([plate, t.geo]);
  };
  const lathe = pts => U(new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), 32));

  const sets = [
    { id: 'basic', name: 'Basic', items: [
      { id: 'cube', name: 'Cube', icon: '▣', build: () => new T.BoxGeometry(30, 30, 30) },
      { id: 'sphere', name: 'Sphere', icon: '●', build: () => U(new T.SphereGeometry(15, 40, 28)) },
      { id: 'cylinder', name: 'Cylinder', icon: '⬭', build: () => U(new T.CylinderGeometry(14, 14, 30, 48)) },
      { id: 'cone', name: 'Cone', icon: '▲', build: () => U(new T.ConeGeometry(15, 30, 48)) },
      { id: 'pyramid', name: 'Pyramid', icon: '△', build: () => U(new T.ConeGeometry(21.2, 30, 4).rotateY(Math.PI / 4)) },
      { id: 'torus', name: 'Torus', icon: '◯', build: () => new T.TorusGeometry(14, 5, 20, 48) },
      { id: 'wedge', name: 'Wedge', icon: '◢', build: () => extrude(poly([[-15, -15], [15, -15], [-15, 15]]), 30).rotateX(Math.PI / 2) },
      { id: 'hexprism', name: 'Hex prism', icon: '⬢', build: () => U(new T.CylinderGeometry(16, 16, 30, 6)) },
      { id: 'hemisphere', name: 'Dome', icon: '◗', build: () => U(merge([new T.SphereGeometry(16, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), new T.CircleGeometry(16, 40).rotateX(Math.PI / 2)])) },
      { id: 'capsule', name: 'Capsule', icon: '💊', build: () => U(merge([new T.CylinderGeometry(10, 10, 20, 32), at(new T.SphereGeometry(10, 32, 16), 0, 10, 0), at(new T.SphereGeometry(10, 32, 16), 0, -10, 0)])) },
      { id: 'prism3', name: 'Triangle prism', icon: '⏢', build: () => extrude(ngon(3, 18, Math.PI / 2), 30) },
      { id: 'ring', name: 'Ring', icon: '◌', build: () => lathe([[10, 0], [15, 0], [15, 10], [10, 10]]) }
    ] },
    { id: 'text', name: 'Text & Symbols', items: [
      { id: 'text', name: 'Text', icon: 'Aa', params: { text: 'Hello', size: 12, thickness: 3, bold: true }, build: textShape },
      { id: 'stop', name: 'Stop sign', icon: '🛑', build: () => sign(extrude(ngon(8, 22, Math.PI / 8), 3), 'STOP') },
      { id: 'yield', name: 'Yield sign', icon: '▽', build: () => extrude(ngon(3, 24, -Math.PI / 2), 3) },
      { id: 'warning', name: 'Warning', icon: '⚠', build: () => sign(extrude(ngon(3, 26, Math.PI / 2), 3), '!') },
      { id: 'noentry', name: 'No entry', icon: '⛔', build: () => merge([U(new T.CylinderGeometry(22, 22, 3, 48)), at(new T.BoxGeometry(32, 7, 1.6), 0, 0, 2.3)]) },
      { id: 'heart', name: 'Heart', icon: '♥', build: () => extrude(heartShape(), 6) },
      { id: 'star', name: 'Star', icon: '★', build: () => extrude(poly([...Array(10)].map((_, i) => { const r = i % 2 ? 9 : 22, a = Math.PI / 2 + i * Math.PI / 5; return [Math.cos(a) * r, Math.sin(a) * r]; })), 6) },
      { id: 'arrow', name: 'Arrow', icon: '➜', build: () => extrude(poly([[-22, -6], [4, -6], [4, -14], [22, 0], [4, 14], [4, 6], [-22, 6]]), 5) },
      { id: 'check', name: 'Check mark', icon: '✔', build: () => extrude(poly([[-20, 0], [-14, -6], [-6, 2], [14, -22], [20, -16], [-6, 14]]), 5) },
      { id: 'cross', name: 'Cross', icon: '✚', build: () => extrude(poly([[-6, -20], [6, -20], [6, -6], [20, -6], [20, 6], [6, 6], [6, 20], [-6, 20], [-6, 6], [-20, 6], [-20, -6], [-6, -6]]), 5) },
      { id: 'diamond', name: 'Diamond', icon: '◆', build: () => extrude(ngon(4, 22), 5) }
    ] },
    { id: 'items', name: 'Items', items: [
      { id: 'icecream', name: 'Ice cream', icon: '🍦', build: () => U(merge([at(new T.ConeGeometry(10, 28, 32).rotateX(Math.PI), 0, 14, 0), at(new T.SphereGeometry(12, 32, 24), 0, 32, 0), at(new T.SphereGeometry(5, 20, 16), 0, 45, 0)])) },
      { id: 'donut', name: 'Donut', icon: '🍩', build: () => new T.TorusGeometry(14, 6, 24, 48) },
      { id: 'apple', name: 'Apple', icon: '🍎', build: () => U(merge([new T.SphereGeometry(14, 36, 28), at(new T.CylinderGeometry(1.4, 1.4, 7, 12), 0, 15, 0)])) },
      { id: 'cupcake', name: 'Cupcake', icon: '🧁', build: () => U(merge([at(new T.CylinderGeometry(13, 9, 12, 32), 0, 6, 0), at(new T.SphereGeometry(13, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), 0, 12, 0), at(new T.SphereGeometry(4, 16, 12), 0, 26, 0)])) },
      { id: 'lollipop', name: 'Lollipop', icon: '🍭', build: () => U(merge([at(new T.CylinderGeometry(1.6, 1.6, 34, 16), 0, 17, 0), at(new T.CylinderGeometry(13, 13, 4, 40).rotateX(Math.PI / 2), 0, 44, 0)])) },
      { id: 'mug', name: 'Mug', icon: '☕', build: () => merge([lathe([[0, 0], [11, 0], [11, 24], [9, 24], [9, 2], [0, 2]]), at(U(new T.TorusGeometry(6, 1.8, 10, 24, Math.PI).rotateZ(-Math.PI / 2)), 11, 0, 12)]) },
      { id: 'cookie', name: 'Cookie', icon: '🍪', build: () => U(merge([new T.CylinderGeometry(15, 15, 4, 48), ...[[-6, 5], [5, 7], [8, -5], [-5, -6], [0, 0]].map(([x, z]) => at(new T.SphereGeometry(2.2, 12, 10), x, 2, z))])) }
    ] }
  ];

  // Generators with a page of their own. Fidgets, clickers and other mechanical / functional models stay out for now.
  const functional = new Set(['SLOT-27', 'SLOT-41']);
  const gens = PROGRAMS.filter(p => p.programUrl && !(p.bundles || []).includes('fidgets') && !functional.has(p.id));
  sets.push({ id: 'generators', name: 'Generators', items: gens.map(p => ({
    id: 'gen:' + p.id, name: p.title, img: p.thumbnailUrl, gen: p.id, params: null,
    build: () => { const t = textGeo({ text: p.title.length > 16 ? p.title.replace(/ /, '\n') : p.title, size: 5.5, thickness: 1.4, bold: true }, 3);
      const w = Math.max(40, t.w + 8), h = Math.max(24, t.h + 8);
      t.geo.translate(-t.w / 2, t.h / 2, 0);
      return merge([at(new T.BoxGeometry(w, h, 3), 0, 0, 1.5), t.geo]); }
  })) });
  return sets;
}

// ---------------------------------------------------------------- setup

function wsLoadLibs() {
  if (window.THREE && THREE.TransformControls) return Promise.resolve();
  if (WS.loading) return WS.loading;
  WS.loading = WS_LIBS.reduce((p, src) => p.then(() => new Promise((res, rej) => {
    if (src.includes('three.min') && window.THREE) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src));
    document.head.appendChild(s);
  })), Promise.resolve());
  return WS.loading;
}

function openWorkshop() {
  const root = document.getElementById('workshop-screen');
  if (WS.ready) { wsResize(); return; }
  if (!root.dataset.built) {
    root.dataset.built = '1';
    root.innerHTML = '<div class="ws-app"><div style="padding:2rem">Loading the Workshop&hellip;</div></div>';
    wsLoadLibs().then(() => { if (!WS.ready) wsInit(root); }).catch(err => {
      root.querySelector('.ws-app').innerHTML = '<div style="padding:2rem">The 3D library could not be loaded (' + escapeHTML(err.message) + '). Check your connection and reload.</div>';
      root.dataset.built = '';
    });
  }
}

function wsInit(root) {
  THREE.Object3D.DefaultUp.set(0, 0, 1);
  WS.sets = wsCatalog();
  WS.cat = {};
  WS.sets.forEach(s => s.items.forEach(i => { WS.cat[i.id] = i; }));

  root.innerHTML = `
  <div class="ws-app">
    <div class="ws-top">
      <div class="ws-top-row">
        <strong style="letter-spacing:3px;color:var(--bp-cyan)">WORKSHOP</strong>
        <button class="ws-btn" data-a="import">Import STL</button>
        <button class="ws-btn" data-a="export">Export STL</button>
        <button class="ws-btn" data-a="undo" title="Ctrl+Z">Undo</button>
        <button class="ws-btn" data-a="redo" title="Ctrl+Shift+Z">Redo</button>
        <button class="ws-btn" data-a="clear">Clear</button>
        <label>Bed <select id="ws-bed" class="bp-input"><option>180</option><option>220</option><option selected>256</option><option>350</option></select> mm</label>
        <span class="ws-spacer"></span>
        <input id="ws-q" type="search" class="bp-input" placeholder="Search shapes..." style="width:150px" aria-label="Search shapes">
        <button class="ws-btn" data-a="tabtoggle" title="Collapse or expand the shape tab" id="ws-tabtoggle">▾ All sets</button>
        <button class="ws-btn" data-a="back">✕ Back to map</button>
      </div>
      <div id="ws-sets" class="ws-top-row" style="padding-top:0"></div>
      <div id="ws-strip" class="ws-strip"></div>
      <div id="ws-all" class="ws-all" hidden></div>
    </div>
    <div class="ws-main">
      <div class="ws-stage" id="ws-stage">
        <div class="ws-tools">
          <button data-m="translate" class="on" title="Move (W) — or just drag a shape">Move</button>
          <button data-m="rotate" title="Rotate (E)">Rotate</button>
          <button data-m="scale" title="Scale (R)">Scale</button>
          <button data-a="snap" class="on" title="Snap to grid (G)">Snap</button>
          <button data-v="top">Top</button><button data-v="front">Front</button><button data-v="iso">Iso</button>
        </div>
        <div class="ws-toast" id="ws-toast"></div>
        <div class="ws-drop">Drop an .stl file to import</div>
      </div>
      <aside class="ws-side" id="ws-side"></aside>
    </div>
    <input type="file" id="ws-file" accept=".stl" multiple hidden>
  </div>`;
  wsEl.root = root; wsEl.stage = root.querySelector('#ws-stage'); wsEl.side = root.querySelector('#ws-side');

  const T = THREE;
  const r = new T.WebGLRenderer({ antialias: true });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio));
  wsEl.stage.prepend(r.domElement);
  const scene = new T.Scene(); scene.background = new T.Color(0x06152d);
  const cam = new T.PerspectiveCamera(45, 1, 1, 5000);
  scene.add(new T.HemisphereLight(0xffffff, 0x223355, 0.85));
  const sun = new T.DirectionalLight(0xffffff, 0.8); sun.position.set(120, -160, 260); scene.add(sun);
  const orbit = new T.OrbitControls(cam, r.domElement);
  orbit.enableDamping = true; orbit.mouseButtons = { LEFT: T.MOUSE.ROTATE, MIDDLE: T.MOUSE.DOLLY, RIGHT: T.MOUSE.PAN };
  const tc = new T.TransformControls(cam, r.domElement);
  scene.add(tc);
  tc.addEventListener('dragging-changed', e => { orbit.enabled = !e.value; if (e.value) wsGizmoStart(); else wsGizmoEnd(); });
  tc.addEventListener('objectChange', () => { wsKeepOnBed(); wsInspectorValues(); });
  Object.assign(WS, { r, scene, cam, orbit, tc, grid: null, pivot: new T.Object3D() });
  scene.add(WS.pivot);

  wsBuildBed();
  wsView('iso');
  wsBindUI();
  wsRenderCatalog();
  if (!wsLoad()) { /* empty scene */ }
  wsCommit(true);
  wsResize();
  new ResizeObserver(wsResize).observe(wsEl.stage);
  WS.ready = true;
  const loop = () => { requestAnimationFrame(loop); if (document.body.classList.contains('on-workshop')) { orbit.update(); r.render(scene, cam); } };
  loop();
  wsToast('Pick a shape from the tab above, or drop an STL file here.');
}

function wsResize() {
  if (!WS.r) return;
  const w = wsEl.stage.clientWidth, h = wsEl.stage.clientHeight;
  if (!w || !h) return;
  WS.r.setSize(w, h); WS.cam.aspect = w / h; WS.cam.updateProjectionMatrix();
}

function wsBuildBed() {
  const T = THREE, s = WS.bed;
  if (WS.bedGroup) { WS.scene.remove(WS.bedGroup); }
  const g = new T.Group();
  const grid = new T.GridHelper(s, s / 10, 0x00e5ff, 0x1a4a7a); grid.rotateX(Math.PI / 2); grid.position.z = -0.05;
  const plate = new T.Mesh(new T.PlaneGeometry(s, s), new T.MeshBasicMaterial({ color: 0x0a2246, transparent: true, opacity: 0.85 }));
  plate.position.z = -0.1;
  const edge = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(s, s, s)), new T.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.25 }));
  edge.position.z = s / 2;
  g.add(plate, grid, edge);
  WS.bedGroup = g; WS.scene.add(g);
  WS.pickPlane = plate;
}

function wsView(v) {
  const d = WS.bed * 1.4, c = WS.cam;
  const p = { top: [0, -0.001, 1.6], front: [0, -1.6, 0.5], iso: [1, -1.2, 0.9] }[v];
  c.position.set(p[0] * d * 0.9, p[1] * d * 0.9, p[2] * d * 0.9);
  WS.orbit.target.set(0, 0, 20); WS.orbit.update();
}

function wsToast(msg) {
  const t = document.getElementById('ws-toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(wsToast.t); wsToast.t = setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------------------------------------------------------------- objects

function wsMaterial(color) { return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide }); }

function wsCentre(geo) {
  geo.computeBoundingBox();
  const c = new THREE.Vector3(); geo.boundingBox.getCenter(c);
  geo.translate(-c.x, -c.y, -c.z);
  geo.computeVertexNormals(); geo.computeBoundingBox();
  return geo;
}

function wsAddObject(spec) {
  const o = { id: spec.id || WS.nextId++, name: spec.name, cat: spec.cat || null, params: spec.params || null, gen: spec.gen || null,
              geo: spec.geo || null, color: spec.color || 0x7ab3ff, locked: !!spec.locked, hidden: !!spec.hidden };
  WS.nextId = Math.max(WS.nextId, o.id + 1);
  if (o.cat && !o.geo) o.geo = wsCentre(WS.cat[o.cat].build(o.params));
  if (!o.geo) return null;
  o.mesh = new THREE.Mesh(o.geo, wsMaterial(o.color));
  o.mesh.userData.o = o; o.mesh.visible = !o.hidden;
  if (spec.pos) { o.mesh.position.fromArray(spec.pos); o.mesh.quaternion.fromArray(spec.quat); o.mesh.scale.fromArray(spec.scale); }
  WS.scene.add(o.mesh); WS.objs.push(o);
  return o;
}

function wsAddFromCatalog(id) {
  const item = WS.cat[id];
  const o = wsAddObject({ name: item.name, cat: id, params: item.params ? { ...item.params } : null, gen: item.gen, color: item.gen ? 0x4aa3ff : 0x7ab3ff });
  wsToBed(o); wsPlaceFree(o);
  wsSelect([o]); wsCommit();
  wsToast(item.gen ? item.name + ' added. Double-click it to open its generator.' : item.name + ' added.');
}

// Put a new shape on the nearest clear spot to the middle of the bed, so added shapes do not stack on each other.
function wsPlaceFree(o) {
  const b = wsBox(o), c = b.getCenter(new THREE.Vector3());
  o.mesh.position.x -= c.x; o.mesh.position.y -= c.y;
  const others = WS.objs.filter(x => x !== o && x.mesh.visible).map(wsBox);
  const w = b.max.x - b.min.x, d = b.max.y - b.min.y;
  for (let r = 0; r < 60; r++) for (let i = 0; i < Math.max(1, r * 8); i++) {
    const a = r ? (i / (r * 8)) * Math.PI * 2 : 0, x = Math.round(Math.cos(a) * r * 6 / 5) * 5, y = Math.round(Math.sin(a) * r * 6 / 5) * 5;
    if (!others.some(q => Math.abs(x - (q.min.x + q.max.x) / 2) < (w + q.max.x - q.min.x) / 2 + 3 && Math.abs(y - (q.min.y + q.max.y) / 2) < (d + q.max.y - q.min.y) / 2 + 3)) {
      o.mesh.position.x += x; o.mesh.position.y += y; return;
    }
  }
}

function wsBox(o) { o.mesh.updateMatrixWorld(true); return new THREE.Box3().setFromObject(o.mesh); }
function wsToBed(o) { const b = wsBox(o); o.mesh.position.z -= b.min.z; }
function wsKeepOnBed() { WS.sel.forEach(o => { if (!o.free) wsToBed(o); }); wsOutOfBed(); }

function wsOutOfBed() {
  const h = WS.bed / 2;
  const out = WS.objs.filter(o => o.mesh.visible).some(o => { const b = wsBox(o); return b.min.x < -h || b.max.x > h || b.min.y < -h || b.max.y > h; });
  const s = document.getElementById('ws-status');
  if (s) s.textContent = out ? '⚠ Something is outside the build plate' : '';
}

function wsRemove(o) {
  WS.scene.remove(o.mesh); o.mesh.material.dispose();
  WS.objs = WS.objs.filter(x => x !== o);
}

function wsDuplicate() {
  const copies = WS.sel.map(o => {
    const c = wsAddObject({ name: o.name + ' copy', cat: o.cat, params: o.params && { ...o.params }, gen: o.gen, geo: o.cat ? null : o.geo, color: o.color,
      pos: o.mesh.position.toArray(), quat: o.mesh.quaternion.toArray(), scale: o.mesh.scale.toArray() });
    c.mesh.position.x += 12; c.mesh.position.y -= 12;
    return c;
  });
  wsSelect(copies); wsCommit();
}

function wsDelete() {
  if (!WS.sel.length) return;
  WS.sel.slice().forEach(o => !o.locked && wsRemove(o));
  wsSelect([]); wsCommit();
}

// ---------------------------------------------------------------- selection and gizmo

function wsSelect(list) {
  WS.sel = list;
  WS.objs.forEach(o => o.mesh.material.emissive.setHex(WS.sel.includes(o) ? 0x0b6a80 : 0x000000));
  wsAttachGizmo();
  wsRenderSide();
}

function wsAttachGizmo() {
  const tc = WS.tc;
  tc.detach();
  const editable = WS.sel.filter(o => !o.locked && o.mesh.visible);
  if (!editable.length) return;
  if (editable.length === 1) { tc.attach(editable[0].mesh); }
  else {
    const c = new THREE.Box3(); editable.forEach(o => c.union(wsBox(o)));
    WS.pivot.position.copy(c.getCenter(new THREE.Vector3())); WS.pivot.rotation.set(0, 0, 0); WS.pivot.scale.set(1, 1, 1); WS.pivot.updateMatrixWorld(true);
    WS.pivotKids = editable;
    tc.attach(WS.pivot);
  }
  tc.setMode(WS.mode);
  tc.setTranslationSnap(WS.snap ? 5 : null); tc.setRotationSnap(WS.snap ? Math.PI / 12 : null); tc.setScaleSnap(WS.snap ? 0.05 : null);
}

function wsGizmoStart() {
  if (WS.tc.object === WS.pivot) WS.pivotKids.forEach(o => WS.pivot.attach(o.mesh));
}
function wsGizmoEnd() {
  if (WS.tc.object === WS.pivot) WS.pivotKids.forEach(o => WS.scene.attach(o.mesh));
  if (!WS.tc.dragging && WS.tcMoved !== false) { wsKeepOnBed(); wsCommit(); wsInspectorValues(); }
}

function wsPick(e) {
  const rect = WS.r.domElement.getBoundingClientRect();
  const v = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  const ray = new THREE.Raycaster(); ray.setFromCamera(v, WS.cam);
  const hit = ray.intersectObjects(WS.objs.filter(o => o.mesh.visible && !o.locked).map(o => o.mesh), false)[0];
  return { ray, o: hit ? hit.object.userData.o : null, point: hit && hit.point };
}

function wsBindUI() {
  const el = WS.r.domElement;
  let down = null, drag = null;
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0 || WS.tc.axis) return;
    const p = wsPick(e);
    down = { x: e.clientX, y: e.clientY, o: p.o, moved: false, shift: e.shiftKey };
    if (p.o) {
      if (!WS.sel.includes(p.o)) wsSelect(e.shiftKey ? WS.sel.concat(p.o) : [p.o]);
      // Grab and drag: slide the selection across the horizontal plane through the grabbed point.
      drag = { plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), -p.point.z), start: p.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -p.point.z), new THREE.Vector3()),
               origins: WS.sel.filter(o => !o.locked).map(o => o.mesh.position.clone()), objs: WS.sel.filter(o => !o.locked) };
      WS.orbit.enabled = false;
    }
  });
  el.addEventListener('pointermove', e => {
    if (!down) return;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) down.moved = true;
    if (!drag || !down.moved || !drag.start) return;
    const p = wsPick(e), pt = p.ray.ray.intersectPlane(drag.plane, new THREE.Vector3());
    if (!pt) return;
    const d = pt.sub(drag.start);
    if (WS.snap) { d.x = Math.round(d.x / 5) * 5; d.y = Math.round(d.y / 5) * 5; }
    drag.objs.forEach((o, i) => { o.mesh.position.x = drag.origins[i].x + d.x; o.mesh.position.y = drag.origins[i].y + d.y; });
    drag.did = true;
    wsAttachGizmo(); wsInspectorValues(); wsOutOfBed();
  });
  window.addEventListener('pointerup', e => {
    if (!down) return;
    if (drag) { WS.orbit.enabled = true; if (drag.did) wsCommit(); }
    if (!down.moved && !down.o && !down.shift && e.target === el) wsSelect([]);
    else if (!down.moved && down.o && down.shift) wsSelect(WS.sel.includes(down.o) ? WS.sel.filter(x => x !== down.o) : WS.sel.concat(down.o));
    else if (!down.moved && down.o) wsSelect([down.o]);
    down = null; drag = null;
  });
  el.addEventListener('dblclick', e => {
    const p = wsPick(e);
    if (!p.o) return;
    if (p.o.gen) { location.hash = '#/generator/' + encodeURIComponent(p.o.gen); return; }
    const t = document.getElementById('ws-text');
    if (t) { t.focus(); t.select(); } else wsToast('This shape has no generator yet.');
  });

  const root = wsEl.root;
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-a],[data-m],[data-v],[data-set],[data-add]');
    if (!b) return;
    if (b.dataset.m) { WS.mode = b.dataset.m; root.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); WS.tc.setMode(WS.mode); }
    else if (b.dataset.v) wsView(b.dataset.v);
    else if (b.dataset.set) { WS.set = b.dataset.set; WS.q = ''; document.getElementById('ws-q').value = ''; wsRenderCatalog(); }
    else if (b.dataset.add) wsAddFromCatalog(b.dataset.add);
    else wsAction(b.dataset.a);
  });
  document.getElementById('ws-bed').addEventListener('change', e => { WS.bed = Number(e.target.value); wsBuildBed(); wsOutOfBed(); });
  document.getElementById('ws-q').addEventListener('input', e => { WS.q = e.target.value.trim().toLowerCase(); wsRenderCatalog(); });
  document.getElementById('ws-file').addEventListener('change', e => { [...e.target.files].forEach(wsImportFile); e.target.value = ''; });
  const st = wsEl.stage;
  st.addEventListener('dragover', e => { e.preventDefault(); st.classList.add('dragover'); });
  st.addEventListener('dragleave', () => st.classList.remove('dragover'));
  st.addEventListener('drop', e => { e.preventDefault(); st.classList.remove('dragover'); [...e.dataTransfer.files].forEach(wsImportFile); });

  window.addEventListener('keydown', e => {
    if (!document.body.classList.contains('on-workshop') || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? wsRedo() : wsUndo(); }
    else if (mod && k === 'y') { e.preventDefault(); wsRedo(); }
    else if (mod && k === 'd') { e.preventDefault(); wsDuplicate(); }
    else if (mod && k === 'a') { e.preventDefault(); wsSelect(WS.objs.filter(o => o.mesh.visible && !o.locked)); }
    else if (k === 'delete' || k === 'backspace') { e.preventDefault(); wsDelete(); }
    else if (k === 'w' || k === 'e' || k === 'r') root.querySelector(`[data-m="${{ w: 'translate', e: 'rotate', r: 'scale' }[k]}"]`).click();
    else if (k === 'g') wsAction('snap');
    else if (k === 'b') wsDropSelected();
    else if (k === 'h') wsToggle('hidden');
    else if (k === 'f') wsFocus();
    else if (k === 'escape') wsSelect([]);
  });
}

function wsAction(a) {
  if (a === 'import') document.getElementById('ws-file').click();
  else if (a === 'export') wsExport();
  else if (a === 'undo') wsUndo();
  else if (a === 'redo') wsRedo();
  else if (a === 'clear') { if (!WS.objs.length || confirm('Remove everything from the Workshop?')) { WS.objs.slice().forEach(wsRemove); wsSelect([]); wsCommit(); } }
  else if (a === 'back') location.hash = '';
  else if (a === 'snap') { WS.snap = !WS.snap; wsEl.root.querySelector('[data-a="snap"]').classList.toggle('on', WS.snap); wsAttachGizmo(); wsToast('Snap ' + (WS.snap ? 'on (5 mm, 15°)' : 'off')); }
  else if (a === 'tabtoggle') { WS.open = WS.open === 'all' ? 'strip' : 'all'; wsRenderCatalog(); }
  else if (a.startsWith('bool-')) wsBoolean(a.slice(5));
  else if (a === 'dup') wsDuplicate();
  else if (a === 'del') wsDelete();
  else if (a === 'drop') wsDropSelected();
  else if (a === 'focus') wsFocus();
  else if (a === 'center') { WS.sel.forEach(o => { o.mesh.position.x = 0; o.mesh.position.y = 0; }); wsAttachGizmo(); wsCommit(); wsInspectorValues(); }
  else if (a === 'mirror') { WS.sel.forEach(o => { o.mesh.scale.x *= -1; }); wsCommit(); wsInspectorValues(); }
  else if (a === 'resetrot') { WS.sel.forEach(o => { o.mesh.rotation.set(0, 0, 0); wsToBed(o); }); wsCommit(); wsInspectorValues(); }
}

function wsDropSelected() { WS.sel.forEach(wsToBed); wsAttachGizmo(); wsCommit(); wsInspectorValues(); }

function wsFocus() {
  const list = WS.sel.length ? WS.sel : WS.objs;
  if (!list.length) return;
  const b = new THREE.Box3(); list.forEach(o => b.union(wsBox(o)));
  const c = b.getCenter(new THREE.Vector3()), d = Math.max(b.getSize(new THREE.Vector3()).length() * 1.8, 60);
  WS.orbit.target.copy(c);
  WS.cam.position.copy(c).add(new THREE.Vector3(0.6, -0.8, 0.6).normalize().multiplyScalar(d));
}

function wsToggle(key) {
  WS.sel.forEach(o => { o[key] = !o[key]; if (key === 'hidden') o.mesh.visible = !o.hidden; });
  wsAttachGizmo(); wsCommit(); wsRenderSide();
}

// ---------------------------------------------------------------- catalog UI

function wsCard(i) {
  const ic = i.img ? `<img class="ws-ic" src="${i.img}" alt="" draggable="false">` : `<span class="ws-ic">${i.icon}</span>`;
  return `<button class="ws-card" data-add="${escapeHTML(i.id)}" title="${escapeHTML(i.name)}${i.gen ? ' (has a generator)' : ''}">${ic}<span class="ws-nm">${escapeHTML(i.name)}</span></button>`;
}

function wsRenderCatalog() {
  const q = WS.q, all = WS.open === 'all' || q;
  document.getElementById('ws-sets').innerHTML =
    WS.sets.map(s => `<button class="ws-chip${s.id === WS.set && !q ? ' on' : ''}" data-set="${s.id}">${escapeHTML(s.name)} <small>${s.items.length}</small></button>`).join('') +
    '<span class="ws-spacer" style="flex:1"></span><span class="ws-note" id="ws-status" style="color:var(--bp-amber)"></span>';
  document.getElementById('ws-tabtoggle').textContent = all ? '▴ Collapse' : '▾ All sets';
  const strip = document.getElementById('ws-strip'), full = document.getElementById('ws-all');
  strip.hidden = all; full.hidden = !all;
  if (!all) strip.innerHTML = WS.sets.find(s => s.id === WS.set).items.map(wsCard).join('');
  else {
    const sets = WS.sets.map(s => ({ s, items: q ? s.items.filter(i => i.name.toLowerCase().includes(q)) : s.items })).filter(x => x.items.length);
    full.innerHTML = sets.length ? sets.map(x => `<h4>${escapeHTML(x.s.name)}</h4><div class="ws-grid-set">${x.items.map(wsCard).join('')}</div>`).join('') : '<p class="ws-note">No shapes match.</p>';
  }
  wsOutOfBed();
}

// ---------------------------------------------------------------- inspector

function wsRenderSide() {
  const side = wsEl.side, sel = WS.sel;
  const list = WS.objs.slice().reverse().map(o => `<li data-id="${o.id}" class="${sel.includes(o) ? 'sel' : ''}"><span class="n">${escapeHTML(o.name)}${o.gen ? ' ⚙' : ''}</span>
      <button data-t="hidden" title="Hide / show (H)">${o.hidden ? '◌' : '◉'}</button><button data-t="locked" title="Lock">${o.locked ? '🔒' : '🔓'}</button></li>`).join('');
  let insp = '<p class="ws-note">Select a shape to edit it. Drag a shape to move it, drag empty space to orbit, right-drag to pan, scroll to zoom. Shift-click selects several. Double-click a ⚙ shape to open its generator.</p>';
  if (sel.length) {
    const o = sel[0], one = sel.length === 1;
    insp = `<h4>${one ? escapeHTML(o.name) : sel.length + ' selected'}</h4>
      ${one ? `<input type="text" id="ws-name" value="${escapeHTML(o.name)}" aria-label="Name">` : ''}
      ${one ? ['Position', 'Rotation', 'Size'].map(g => `<div class="ws-note">${g} ${g === 'Rotation' ? '(°)' : '(mm)'}</div><div class="ws-row"><span></span>${'xyz'.split('').map(a => `<input type="number" step="${g === 'Rotation' ? 5 : 1}" data-f="${g[0]}${a}">`).join('')}</div>`).join('') +
        '<label><input type="checkbox" id="ws-lockprop" checked> Keep proportions</label>' : ''}
      ${one && o.params ? wsParamHTML(o) : ''}
      ${one ? `<label>Colour <input type="color" id="ws-color" value="#${o.color.toString(16).padStart(6, '0')}"></label>` : ''}
      <div class="ws-btns">
        <button data-a="dup" title="Ctrl+D">Duplicate</button><button data-a="del" title="Delete">Delete</button>
        <button data-a="drop" title="B">Drop to bed</button><button data-a="center">Centre</button>
        <button data-a="mirror">Mirror X</button><button data-a="resetrot">Reset rotation</button>
        <button data-a="focus" title="F">Focus</button>
      </div>
      <div class="ws-note">Combine ${sel.length > 1 ? '(first selected is the base)' : '(select 2 or more shapes)'}</div>
      <div class="ws-btns">
        <button data-a="bool-union" ${sel.length < 2 ? 'disabled' : ''}>Merge</button>
        <button data-a="bool-subtract" ${sel.length < 2 ? 'disabled' : ''}>Cut</button>
        <button data-a="bool-intersect" ${sel.length < 2 ? 'disabled' : ''}>Intersect</button>
      </div>${one && o.gen ? `<p class="ws-note">This shape has a generator. <a href="#/generator/${encodeURIComponent(o.gen)}" style="color:var(--bp-cyan)">Open its editor</a> (or double-click it).</p>` : ''}`;
  }
  side.innerHTML = `<div><h4>Selection</h4>${insp}</div><div><h4>Scene (${WS.objs.length})</h4><ul class="ws-list">${list || '<li class="ws-note">Empty</li>'}</ul>
    <p class="ws-note">Keys: W move · E rotate · R scale · G snap · B drop to bed · H hide · F focus · Ctrl+D duplicate · Ctrl+Z undo · Del delete</p>
    <p class="ws-note">Private: files never leave your browser.</p></div>`;
  side.onclick = e => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const o = WS.objs.find(x => x.id === Number(li.dataset.id)), t = e.target.closest('button[data-t]');
    if (t) { o[t.dataset.t] = !o[t.dataset.t]; if (t.dataset.t === 'hidden') o.mesh.visible = !o.hidden; wsAttachGizmo(); wsCommit(); wsRenderSide(); }
    else wsSelect(e.shiftKey ? WS.sel.concat(o) : [o]);
  };
  side.oninput = wsSideInput;
  side.onchange = e => { if (e.target.id === 'ws-color' || e.target.id === 'ws-name' || e.target.dataset.p) wsCommit(); };
  wsInspectorValues();
}

function wsParamHTML(o) {
  const p = o.params;
  return `<div class="ws-note">Shape settings</div>` + (o.cat === 'text'
    ? `<textarea id="ws-text" data-p="text" rows="2" class="bp-input" style="width:100%" aria-label="Text">${escapeHTML(p.text)}</textarea>
       <label>Height <input type="number" data-p="size" min="3" max="120" value="${p.size}"> mm</label>
       <label>Thickness <input type="number" data-p="thickness" min="0.4" max="60" step="0.2" value="${p.thickness}"> mm</label>
       <label><input type="checkbox" data-p="bold" ${p.bold ? 'checked' : ''}> Bold</label>` : '');
}

function wsInspectorValues() {
  const o = WS.sel[0];
  if (!o || WS.sel.length !== 1) return;
  const set = (f, v) => { const i = wsEl.side.querySelector(`[data-f="${f}"]`); if (i && document.activeElement !== i) i.value = Math.round(v * 100) / 100; };
  const m = o.mesh, b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
  set('Px', c.x); set('Py', c.y); set('Pz', c.z);
  const D = 180 / Math.PI; set('Rx', m.rotation.x * D); set('Ry', m.rotation.y * D); set('Rz', m.rotation.z * D);
  const g = o.geo.boundingBox.getSize(new THREE.Vector3());
  set('Sx', g.x * Math.abs(m.scale.x)); set('Sy', g.y * Math.abs(m.scale.y)); set('Sz', g.z * Math.abs(m.scale.z));
}

function wsSideInput(e) {
  const t = e.target, o = WS.sel[0];
  if (!o) return;
  if (t.id === 'ws-name') { o.name = t.value; wsEl.side.querySelector('h4').textContent = o.name; }
  else if (t.id === 'ws-color') { o.color = parseInt(t.value.slice(1), 16); o.mesh.material.color.setHex(o.color); }
  else if (t.dataset.p) {
    o.params[t.dataset.p] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? Number(t.value) || 1 : t.value;
    const g = wsCentre(WS.cat[o.cat].build(o.params)); o.mesh.geometry.dispose(); o.geo = o.mesh.geometry = g;
    wsToBed(o); wsAttachGizmo(); wsInspectorValues();
  } else if (t.dataset.f) {
    const k = t.dataset.f, v = Number(t.value);
    if (!isFinite(v)) return;
    const m = o.mesh, D = Math.PI / 180;
    if (k[0] === 'P') { const b = wsBox(o), c = b.getCenter(new THREE.Vector3()); m.position[k[1]] += v - c[k[1]]; }
    else if (k[0] === 'R') m.rotation[k[1]] = v * D;
    else if (k[0] === 'S' && v > 0.01) {
      const g = o.geo.boundingBox.getSize(new THREE.Vector3()), a = k[1], f = v / (g[a] * Math.abs(m.scale[a]));
      if (document.getElementById('ws-lockprop').checked) m.scale.multiplyScalar(f); else m.scale[a] *= f;
    }
    wsKeepOnBed(); wsAttachGizmo();
    clearTimeout(wsSideInput.t); wsSideInput.t = setTimeout(() => { wsCommit(); wsInspectorValues(); }, 400);
  }
}

// ---------------------------------------------------------------- boolean merge / cut

// CSG comes from three-bvh-csg, loaded on first use from its own module build (it needs a newer three than the editor,
// so shapes are passed across as plain vertex arrays). Works best on closed shapes; open or self-overlapping meshes may
// give rough results.
let wsCsgLib = null;
function wsCsg() {
  if (!wsCsgLib) wsCsgLib = Promise.all([
    import('https://esm.sh/three@0.160.0'),
    import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js'),
    import('https://esm.sh/three-bvh-csg@0.0.16?deps=three@0.160.0,three-mesh-bvh@0.7.3')
  ]).then(([three, utils, csg]) => ({ three, utils, csg }));
  return wsCsgLib;
}

async function wsBoolean(op) {
  const parts = WS.sel.filter(o => o.mesh.visible && !o.locked);
  if (parts.length < 2) { wsToast('Select two or more shapes first.'); return; }
  wsToast('Combining shapes…');
  let lib;
  try { lib = await wsCsg(); } catch (err) { wsToast('Could not load the boolean tool. Check your connection.'); return; }
  const { three: T2, utils, csg } = lib;
  const brush = o => {
    o.mesh.updateMatrixWorld(true);
    const src = o.geo.index ? o.geo.toNonIndexed() : o.geo, p = src.attributes.position, v = new THREE.Vector3(), arr = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.mesh.matrixWorld); arr.set([v.x, v.y, v.z], i * 3); }
    if (o.mesh.matrixWorld.determinant() < 0) for (let i = 0; i < p.count; i += 3) { const t = arr.slice(i * 3 + 3, i * 3 + 6); arr.copyWithin(i * 3 + 3, i * 3 + 6, i * 3 + 9); arr.set(t, i * 3 + 6); }
    let g = new T2.BufferGeometry(); g.setAttribute('position', new T2.BufferAttribute(arr, 3));
    g.setAttribute('normal', new T2.BufferAttribute(new Float32Array(arr.length), 3));
    g.setAttribute('uv', new T2.BufferAttribute(new Float32Array(p.count * 2), 2));
    g = utils.mergeVertices(g, 1e-4); g.computeVertexNormals();
    const b = new csg.Brush(g); b.updateMatrixWorld(); return b;
  };
  try {
    const ev = new csg.Evaluator(), type = { union: csg.ADDITION, subtract: csg.SUBTRACTION, intersect: csg.INTERSECTION }[op];
    let acc = brush(parts[0]);
    for (const o of parts.slice(1)) { acc = ev.evaluate(acc, brush(o), type); acc.updateMatrixWorld(); }
    const pos = acc.geometry.getAttribute('position'), idx = acc.geometry.index;
    if (!pos || pos.count < 3) { wsToast(op === 'intersect' ? 'Those shapes do not overlap, so nothing is left.' : 'The result is empty.'); return; }
    const g = new THREE.BufferGeometry();
    const flat = new Float32Array((idx ? idx.count : pos.count) * 3);
    for (let i = 0; i < flat.length / 3; i++) { const k = idx ? idx.getX(i) : i; flat.set([pos.getX(k), pos.getY(k), pos.getZ(k)], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(flat, 3));
    const box = new THREE.Box3().setFromBufferAttribute(g.attributes.position), c = box.getCenter(new THREE.Vector3());
    wsCentre(g);
    const name = { union: 'Merged', subtract: 'Cut', intersect: 'Intersection' }[op];
    parts.forEach(wsRemove);
    const r = wsAddObject({ name, geo: g, color: parts[0].color, pos: c.toArray(), quat: [0, 0, 0, 1], scale: [1, 1, 1] });
    wsSelect([r]); wsCommit();
    wsToast(name + ' done. Press Ctrl+Z to undo.');
  } catch (err) { wsToast('Could not combine those shapes (they may not be closed solids).'); }
}

// ---------------------------------------------------------------- history and autosave

function wsSnapshot() {
  return WS.objs.map(o => ({ id: o.id, name: o.name, cat: o.cat, params: o.params && { ...o.params }, gen: o.gen, geo: o.geo, color: o.color, locked: o.locked, hidden: o.hidden,
    pos: o.mesh.position.toArray(), quat: o.mesh.quaternion.toArray(), scale: o.mesh.scale.toArray() }));
}

function wsRestore(snap) {
  WS.objs.slice().forEach(wsRemove);
  snap.forEach(s => wsAddObject({ ...s, geo: s.cat ? null : s.geo }));
  wsSelect([]); wsOutOfBed();
}

function wsCommit(first) {
  if (first) { WS.hist = []; WS.hi = -1; }
  WS.hist = WS.hist.slice(0, WS.hi + 1);
  WS.hist.push(wsSnapshot()); if (WS.hist.length > 80) WS.hist.shift();
  WS.hi = WS.hist.length - 1;
  wsRenderSide(); wsOutOfBed(); wsSave();
}
function wsUndo() { if (WS.hi > 0) { WS.hi--; wsRestore(WS.hist[WS.hi]); wsSave(); } }
function wsRedo() { if (WS.hi < WS.hist.length - 1) { WS.hi++; wsRestore(WS.hist[WS.hi]); wsSave(); } }

// Autosave keeps the catalog shapes only (imported STLs can be large; they are not stored). Local to this browser.
function wsSave() {
  try {
    const keep = wsSnapshot().filter(s => s.cat).map(({ geo, ...rest }) => rest);
    localStorage.setItem(WS_SAVE_KEY, JSON.stringify({ bed: WS.bed, objs: keep }));
  } catch (err) { /* storage unavailable: autosave is optional */ }
}
function wsLoad() {
  try {
    const d = JSON.parse(localStorage.getItem(WS_SAVE_KEY) || 'null');
    if (!d) return false;
    WS.bed = d.bed || 256; document.getElementById('ws-bed').value = WS.bed; wsBuildBed();
    d.objs.filter(s => WS.cat[s.cat]).forEach(s => wsAddObject(s));
    return WS.objs.length > 0;
  } catch (err) { return false; }
}

// ---------------------------------------------------------------- STL in and out

function wsParseSTL(buf) {
  const dv = new DataView(buf), n = dv.getUint32(80, true);
  const head = new TextDecoder().decode(new Uint8Array(buf, 0, Math.min(80, buf.byteLength)));
  if (84 + n * 50 === buf.byteLength && !(head.startsWith('solid') && buf.byteLength > 84 && new TextDecoder().decode(new Uint8Array(buf, 84, 12)).includes('facet'))) {
    const pos = new Float32Array(n * 9);
    for (let i = 0; i < n; i++) for (let j = 0; j < 9; j++) pos[i * 9 + j] = dv.getFloat32(84 + i * 50 + 12 + j * 4, true);
    return pos;
  }
  const txt = new TextDecoder().decode(buf), out = [], re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g;
  let m; while ((m = re.exec(txt))) out.push(+m[1], +m[2], +m[3]);
  return new Float32Array(out);
}

function wsImportFile(file) {
  if (!/\.stl$/i.test(file.name)) { wsToast(file.name + ' is not an .stl file.'); return; }
  file.arrayBuffer().then(buf => {
    const pos = wsParseSTL(buf);
    if (pos.length < 9) { wsToast('Could not read ' + file.name); return; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    wsCentre(g);
    const o = wsAddObject({ name: file.name.replace(/\.stl$/i, ''), geo: g, color: 0xb0c4de });
    wsToBed(o); wsSelect([o]); wsCommit(); wsFocus();
    const s = g.boundingBox.getSize(new THREE.Vector3());
    wsToast(`Imported ${o.name} (${s.x.toFixed(0)} × ${s.y.toFixed(0)} × ${s.z.toFixed(0)} mm). Imported files are not kept after you close the page.`);
  });
}

function wsExport() {
  const vis = WS.objs.filter(o => o.mesh.visible);
  if (!vis.length) { wsToast('Nothing to export.'); return; }
  const tris = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  vis.forEach(o => {
    o.mesh.updateMatrixWorld(true);
    const g = o.geo.index ? o.geo.toNonIndexed() : o.geo, p = g.attributes.position, flip = o.mesh.matrixWorld.determinant() < 0;
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i).applyMatrix4(o.mesh.matrixWorld);
      b.fromBufferAttribute(p, i + 1).applyMatrix4(o.mesh.matrixWorld);
      c.fromBufferAttribute(p, i + 2).applyMatrix4(o.mesh.matrixWorld);
      tris.push(flip ? [a.clone(), c.clone(), b.clone()] : [a.clone(), b.clone(), c.clone()]);
    }
  });
  const buf = new ArrayBuffer(84 + tris.length * 50), dv = new DataView(buf);
  new TextEncoder().encodeInto('MakerMakers Workshop', new Uint8Array(buf, 0, 80));
  dv.setUint32(80, tris.length, true);
  const n = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
  tris.forEach(([p, q, r], i) => {
    n.crossVectors(e1.subVectors(q, p), e2.subVectors(r, p)).normalize();
    const f = [n.x, n.y, n.z, p.x, p.y, p.z, q.x, q.y, q.z, r.x, r.y, r.z];
    f.forEach((v, j) => dv.setFloat32(84 + i * 50 + j * 4, isFinite(v) ? v : 0, true));
  });
  const url = URL.createObjectURL(new Blob([buf], { type: 'model/stl' }));
  const link = document.createElement('a'); link.href = url; link.download = 'workshop.stl'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  wsToast(`Exported ${vis.length} object${vis.length > 1 ? 's' : ''} (${tris.length} triangles) as workshop.stl`);
}
