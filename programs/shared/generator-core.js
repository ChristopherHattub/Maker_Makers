/* Maker Makers shared generator engine.
 *
 * A generator defines window.MM_GENERATOR (see docs/generator-styling.md) and then loads
 * this file. The engine draws the page layout, the 3D viewport, the Parametric and Color
 * tabs, the export buttons and the standalone download. The generator supplies only
 * parameters, presets, a palette and a build() function that returns triangles.
 */
(function () {
  'use strict';

  var cfg = window.MM_GENERATOR;
  var T = window.THREE;
  if (!cfg || !T) {
    throw new Error('generator-core.js needs window.MM_GENERATOR and THREE');
  }

  var NEUTRAL_MODEL_COLOR = '#cbd5e1'; // Parametric tab: neutral matte, no paint colors
  var CAVITY_SHADE = 0.82;             // How dark a fully shaded vertex gets (0..1)
  var CREASE_COS = Math.cos(50 * Math.PI / 180); // Faces turning more than 50 degrees are separate parts
  var MIN_PART_TRIS = 60;              // Smaller islands merge into the neighbor they touch most
  var PAINT_MATCH_MM = 40;             // Max distance to re-attach a saved paint after a rebuild
  var PALETTE = cfg.palette || [{ name: 'Bone White', color: '#f1f5f9' }];
  var DEFAULT_COLOR = cfg.defaultColor || PALETTE[0].color;

  // ---------------------------------------------------------------------------
  // 1. Parameters and DOM
  // ---------------------------------------------------------------------------
  var params = {};
  cfg.parameters.forEach(function (p) { params[p.key] = p.value; });

  var $ = function (id) { return document.getElementById(id); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k.indexOf('on') === 0) node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function formatParam(p, v) {
    if (p.format) return p.format(v);
    return v + (p.unit || '');
  }

  function slug(text) {
    return String(text || 'generator').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'generator';
  }

  function safeFileName(raw) {
    var cleaned = String(raw || '').trim().replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_');
    return cleaned || cfg.fileName || 'Model';
  }

  // Builds the whole page from the config so every generator looks the same.
  function buildShell() {
    var header = el('header', { class: 'mm-gen-header' }, [
      el('div', {}, [
        el('div', { class: 'mm-gen-id', text: cfg.code + ' // ' + cfg.category }),
        el('h1', { class: 'mm-gen-title', text: cfg.title })
      ]),
      el('div', { class: 'mm-gen-actions' }, [
        el('a', { class: 'mm-btn mm-btn--green', href: cfg.printerLink || '../index.html#map-screen', target: '_top', text: 'Find local printer for this STL' }),
        el('button', { class: 'mm-btn mm-btn--amber', type: 'button', id: 'mm-download-html', text: 'Download program (.html)', onclick: downloadStandalone }),
        el('a', { class: 'mm-btn', href: '../index.html', target: '_top', text: 'Back to grid' })
      ])
    ]);

    var tabModel = el('button', { class: 'mm-tab', type: 'button', id: 'mm-tab-model', 'aria-selected': 'true', text: 'Parametric', onclick: function () { setTab('model'); } });
    var tabColor = el('button', { class: 'mm-tab', type: 'button', id: 'mm-tab-color', 'aria-selected': 'false', text: 'Color tool', onclick: function () { setTab('color'); } });

    var modelBody = el('div', { id: 'mm-body-model', class: 'mm-panel-body' });
    var colorBody = el('div', { id: 'mm-body-color', class: 'mm-panel-body', hidden: '' });

    var fileInput = el('input', { id: 'mm-file-name', type: 'text', maxlength: '60', value: cfg.fileName || 'Model', spellcheck: 'false' });
    var footer = el('div', { class: 'mm-panel-footer' }, [
      el('div', { class: 'mm-stats', id: 'mm-stats', text: 'Geometry ready' }),
      el('label', { class: 'mm-file-field' }, [document.createTextNode('File name'), fileInput]),
      el('div', { class: 'mm-export-row' }, [
        el('button', { class: 'mm-btn mm-btn--solid', type: 'button', id: 'mm-export-stl', text: 'Export .STL', onclick: exportStl }),
        el('button', { class: 'mm-btn mm-btn--solid', type: 'button', id: 'mm-export-3mf', text: 'Export .3MF', onclick: export3mf })
      ]),
      el('button', { class: 'mm-btn mm-btn--amber mm-btn--block', type: 'button', text: 'Download standalone .html generator', onclick: downloadStandalone })
    ]);

    var panel = el('aside', { class: 'mm-panel' }, [
      el('div', { class: 'mm-tabs', role: 'tablist' }, [tabModel, tabColor]),
      modelBody,
      colorBody,
      footer
    ]);

    var stage = el('div', { class: 'mm-stage', id: 'mm-stage' });
    var viewport = el('section', { class: 'mm-viewport' }, [
      stage,
      el('div', { class: 'mm-overlay mm-overlay--tl', id: 'mm-hint', text: 'Drag or touch-swipe to orbit 3D mesh' }),
      el('div', { class: 'mm-overlay mm-overlay--tr', id: 'mm-dims', text: '' }),
      el('div', { class: 'mm-toast', id: 'mm-toast', role: 'status' }),
      el('div', { class: 'mm-view-buttons' }, [
        el('button', { class: 'mm-btn', type: 'button', text: 'Front', onclick: function () { centerCamera('front'); } }),
        el('button', { class: 'mm-btn', type: 'button', text: 'Iso', onclick: function () { centerCamera('iso'); } })
      ])
    ]);

    var main = el('main', { class: 'mm-main' }, [panel, viewport]);
    document.body.appendChild(header);
    document.body.appendChild(main);

    return { modelBody: modelBody, colorBody: colorBody, stage: stage, tabModel: tabModel, tabColor: tabColor };
  }

  var dom = buildShell();

  // Inside the site's viewer the page header already shows the title and the three buttons,
  // so the generator hides its own header and fills the frame.
  try {
    if (window.self !== window.top) document.body.classList.add('mm-framed');
  } catch (e) {
    document.body.classList.add('mm-framed');
  }

  // Parametric controls, grouped in the order the generator declares them.
  function renderParametricPanel() {
    var presetsRow = null;
    if (cfg.presets && cfg.presets.length) {
      presetsRow = el('div', { class: 'mm-group' }, [
        el('h3', { class: 'mm-group-title', text: 'Presets' }),
        el('div', { class: 'mm-chips' }, cfg.presets.map(function (preset) {
          return el('button', { class: 'mm-chip', type: 'button', text: preset.label, onclick: function () {
            setParams(preset.values);
            toast('Loaded "' + preset.label + '"');
          } });
        }))
      ]);
    }

    var groups = [];
    cfg.parameters.forEach(function (p) {
      var groupName = p.group || 'Parameters';
      var group = groups.filter(function (g) { return g.name === groupName; })[0];
      if (!group) {
        group = { name: groupName, items: [] };
        groups.push(group);
      }
      group.items.push(p);
    });

    var sections = groups.map(function (group) {
      return el('div', { class: 'mm-group' }, [
        el('h3', { class: 'mm-group-title', text: group.name }),
        el('div', {}, group.items.map(sliderFor))
      ]);
    });

    dom.modelBody.appendChild(el('h2', { class: 'mm-section-title', text: 'Parametric controls' }));
    if (presetsRow) dom.modelBody.appendChild(presetsRow);
    sections.forEach(function (s) { dom.modelBody.appendChild(s); });

    // Generator-specific extras (for example the Ghost Builder stamp tools).
    var extras = el('div', { class: 'mm-group', id: 'mm-extras' });
    dom.modelBody.appendChild(extras);
    if (typeof cfg.mount === 'function') cfg.mount(extras, api);
  }

  var sliderRefs = {};

  function sliderFor(p) {
    var output = el('span', { class: 'mm-slider-value', text: formatParam(p, params[p.key]) });
    var input = el('input', {
      type: 'range', min: String(p.min), max: String(p.max), step: String(p.step || 1), value: String(params[p.key]),
      'aria-label': p.label,
      oninput: function () {
        params[p.key] = Number(input.value);
        output.textContent = formatParam(p, params[p.key]);
        scheduleRebuild();
      }
    });
    sliderRefs[p.key] = { input: input, output: output, def: p };
    return el('div', { class: 'mm-slider' }, [
      el('div', { class: 'mm-slider-head' }, [el('label', { text: p.label }), output]),
      input
    ]);
  }

  function syncSliders() {
    Object.keys(sliderRefs).forEach(function (key) {
      var ref = sliderRefs[key];
      ref.input.value = String(params[key]);
      ref.output.textContent = formatParam(ref.def, params[key]);
    });
  }

  function setParams(values) {
    Object.keys(values).forEach(function (k) { params[k] = values[k]; });
    syncSliders();
    rebuild();
  }

  // ---------------------------------------------------------------------------
  // 2. Color tool panel
  // ---------------------------------------------------------------------------
  var selectedColor = PALETTE[0].color;
  var paints = []; // { kind, centroid: [x, y, z], color }
  var parts = null; // computed on demand: [{ id, kind, mesh, triangles, centroid, color, label }]
  var partIdsByMesh = []; // per mesh, Int32Array mapping triangle -> part index within that mesh
  var partBaseByMesh = []; // per mesh, index of its first part in `parts`

  function renderColorPanel() {
    dom.colorBody.innerHTML = '';
    dom.colorBody.appendChild(el('h2', { class: 'mm-section-title', text: 'Color tool' }));
    dom.colorBody.appendChild(el('p', { class: 'mm-note', text: 'Pick a color, then click a part of the model. The whole connected part is painted. Parts are found from connected surfaces and sharp creases.' }));

    var swatches = PALETTE.map(function (swatch) {
      return el('button', {
        class: 'mm-swatch', type: 'button', title: swatch.name,
        'aria-pressed': String(swatch.color === selectedColor),
        onclick: function () { selectColor(swatch.color); }
      }, [
        el('span', { class: 'mm-swatch-dot', style: 'background:' + swatch.color }),
        document.createTextNode(swatch.name)
      ]);
    });
    dom.colorBody.appendChild(el('div', { class: 'mm-swatches', id: 'mm-swatches' }, swatches));

    var picker = el('input', { type: 'color', value: selectedColor, 'aria-label': 'Custom color', oninput: function () { selectColor(picker.value); } });
    dom.colorBody.appendChild(el('div', { class: 'mm-custom-color' }, [document.createTextNode('Custom color'), picker]));

    dom.colorBody.appendChild(el('h3', { class: 'mm-group-title', text: 'Parts' }));
    dom.colorBody.appendChild(el('ul', { class: 'mm-part-list', id: 'mm-part-list' }));
    dom.colorBody.appendChild(el('button', { class: 'mm-btn mm-btn--block', type: 'button', id: 'mm-clear-paint', text: 'Clear all paint', onclick: clearPaint }));
  }

  function selectColor(color) {
    selectedColor = color;
    var swatches = document.querySelectorAll('#mm-swatches .mm-swatch');
    PALETTE.forEach(function (swatch, i) {
      swatches[i].setAttribute('aria-pressed', String(swatch.color.toLowerCase() === color.toLowerCase()));
    });
  }

  function renderPartList() {
    var list = $('mm-part-list');
    if (!list) return;
    list.innerHTML = '';
    if (!parts) return;
    parts.forEach(function (part) {
      list.appendChild(el('li', {}, [
        el('button', {
          class: 'mm-part', type: 'button',
          onclick: function () { paintPart(part, selectedColor); }
        }, [
          el('span', {}, [document.createTextNode(part.label)]),
          el('span', { class: 'mm-part-chip', style: 'background:' + (part.color || DEFAULT_COLOR) })
        ])
      ]));
    });
  }

  function clearPaint() {
    paints = [];
    if (parts) parts.forEach(function (p) { p.color = null; });
    refreshColors();
    renderPartList();
    toast('Paint cleared');
  }

  // The part of the same kind closest to a saved centroid, if it is near enough.
  function nearestPart(kind, centroid) {
    var best = null;
    var bestDist = PAINT_MATCH_MM;
    parts.forEach(function (part) {
      if (part.kind !== kind) return;
      var d = distance(part.centroid, centroid);
      if (d < bestDist) {
        bestDist = d;
        best = part;
      }
    });
    return best;
  }

  // Paints are stored by part centroid, so they survive slider rebuilds.
  function paintPart(part, color) {
    paints = paints.filter(function (p) {
      return nearestPart(p.kind, p.centroid) !== part;
    });
    paints.push({ kind: part.kind, centroid: part.centroid.slice(), color: color });
    part.color = color;
    refreshColors();
    renderPartList();
    toast('Painted ' + part.label);
  }

  function distance(a, b) {
    var dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // ---------------------------------------------------------------------------
  // 3. Three.js scene
  // ---------------------------------------------------------------------------
  var container = dom.stage;
  var scene = new T.Scene();
  scene.background = new T.Color(0x0b1120);

  var camera = new T.PerspectiveCamera(40, 1, 1, 2000);
  var renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  var controls = new T.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.minDistance = 40;
  controls.maxDistance = 900;

  var hemi = new T.HemisphereLight(0xe2e8f0, 0x1e293b, 0.75);
  scene.add(hemi);
  var key = new T.DirectionalLight(0xffffff, 0.85);
  key.position.set(85, 165, 125);
  key.castShadow = true;
  key.shadow.mapSize.width = 1024;
  key.shadow.mapSize.height = 1024;
  key.shadow.camera.near = 20;
  key.shadow.camera.far = 900;
  key.shadow.camera.left = -160;
  key.shadow.camera.right = 160;
  key.shadow.camera.top = 160;
  key.shadow.camera.bottom = -160;
  key.shadow.bias = -0.0008;
  scene.add(key);
  var rim = new T.DirectionalLight(0xa78bfa, 0.42);
  rim.position.set(-110, 90, -95);
  scene.add(rim);

  // Build plate: 160 mm x 160 mm, the standard size of the printers on the map.
  var plate = new T.Group();
  scene.add(plate);
  var plateMesh = new T.Mesh(new T.BoxGeometry(160, 2.4, 160), new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.15 }));
  plateMesh.position.y = -1.35;
  plateMesh.receiveShadow = true;
  plate.add(plateMesh);
  var grid = new T.GridHelper(150, 15, 0x6366f1, 0x334155);
  grid.position.y = -0.08;
  plate.add(grid);
  var frontBar = new T.Mesh(new T.BoxGeometry(36, 0.6, 2.5), new T.MeshBasicMaterial({ color: 0x00e5ff }));
  frontBar.position.set(0, 0.2, 76);
  plate.add(frontBar);

  var modelGroup = new T.Group();
  scene.add(modelGroup);
  var previewGroup = new T.Group();
  scene.add(previewGroup);

  var modelMaterial = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.03, vertexColors: true });
  var previewMaterial = new T.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.55 });
  var modelMeshes = []; // THREE.Mesh per build output entry, in the same order
  var modelData = [];   // build output: { name, positions, shade }
  var previewMesh = null;

  // ---------------------------------------------------------------------------
  // 4. Build, geometry helpers and parts
  // ---------------------------------------------------------------------------
  var rebuildQueued = false;
  function scheduleRebuild() {
    if (rebuildQueued) return;
    rebuildQueued = true;
    requestAnimationFrame(function () {
      rebuildQueued = false;
      rebuild();
    });
  }

  function rebuild() {
    var output = cfg.build(params, api) || [];
    modelData = output;

    modelMeshes.forEach(function (m) { modelGroup.remove(m); m.geometry.dispose(); });
    modelMeshes = output.map(function (entry) {
      var geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.BufferAttribute(entry.positions, 3));
      geometry.setAttribute('normal', new T.BufferAttribute(smoothNormals(entry.positions), 3));
      geometry.setAttribute('color', new T.BufferAttribute(new Float32Array(entry.positions.length), 3));
      geometry.computeBoundingSphere();
      var mesh = new T.Mesh(geometry, modelMaterial);
      mesh.name = entry.name || 'body';
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      modelGroup.add(mesh);
      return mesh;
    });

    parts = null;
    if (paints.length) ensureParts();
    refreshColors();
    renderPartList();
    updateStats();
  }

  // Smooth vertex normals for non-indexed triangles: vertices at the same position share a normal.
  function smoothNormals(positions) {
    var count = positions.length / 3;
    var ids = weldIds(positions);
    var sums = new Float64Array(count * 3);
    var normals = new Float32Array(positions.length);
    var triCount = count / 3;
    for (var t = 0; t < triCount; t++) {
      var a = t * 9;
      var n = faceNormalAt(positions, a);
      for (var v = 0; v < 3; v++) {
        var id = ids[t * 3 + v];
        sums[id * 3] += n[0];
        sums[id * 3 + 1] += n[1];
        sums[id * 3 + 2] += n[2];
      }
    }
    for (var i = 0; i < count; i++) {
      var id2 = ids[i];
      var x = sums[id2 * 3], y = sums[id2 * 3 + 1], z = sums[id2 * 3 + 2];
      var len = Math.sqrt(x * x + y * y + z * z) || 1;
      normals[i * 3] = x / len;
      normals[i * 3 + 1] = y / len;
      normals[i * 3 + 2] = z / len;
    }
    return normals;
  }

  function faceNormalAt(p, a) {
    var ux = p[a + 3] - p[a], uy = p[a + 4] - p[a + 1], uz = p[a + 5] - p[a + 2];
    var vx = p[a + 6] - p[a], vy = p[a + 7] - p[a + 1], vz = p[a + 8] - p[a + 2];
    return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  }

  // Returns one id per vertex. Vertices at the same position (to 0.001 mm) share an id.
  function weldIds(positions) {
    var count = positions.length / 3;
    var ids = new Uint32Array(count);
    var map = new Map();
    for (var i = 0; i < count; i++) {
      var key = Math.round(positions[i * 3] * 1000) + ',' + Math.round(positions[i * 3 + 1] * 1000) + ',' + Math.round(positions[i * 3 + 2] * 1000);
      var id = map.get(key);
      if (id === undefined) {
        id = map.size;
        map.set(key, id);
      }
      ids[i] = id;
    }
    return ids;
  }

  // Splits every mesh into parts. Triangles join a part when they share an edge and the
  // surface does not turn sharply across that edge (the crease angle is CREASE_COS).
  function ensureParts() {
    if (parts) return parts;
    parts = [];
    partIdsByMesh = [];
    partBaseByMesh = [];
    modelData.forEach(function (entry, meshIndex) {
      var pos = entry.positions;
      var triCount = pos.length / 9;
      var ids = weldIds(pos);
      var normals = new Float32Array(triCount * 3);
      var centroids = new Float32Array(triCount * 3);
      var degenerate = new Uint8Array(triCount);
      for (var t = 0; t < triCount; t++) {
        var n = faceNormalAt(pos, t * 9);
        var len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
        if (len < 1e-9) {
          degenerate[t] = 1;
          len = 1;
        }
        normals[t * 3] = n[0] / len;
        normals[t * 3 + 1] = n[1] / len;
        normals[t * 3 + 2] = n[2] / len;
        for (var k = 0; k < 3; k++) {
          centroids[t * 3 + k] = (pos[t * 9 + k] + pos[t * 9 + 3 + k] + pos[t * 9 + 6 + k]) / 3;
        }
      }

      var parent = new Int32Array(triCount);
      for (var i = 0; i < triCount; i++) parent[i] = i;
      function find(x) {
        while (parent[x] !== x) {
          parent[x] = parent[parent[x]];
          x = parent[x];
        }
        return x;
      }

      var edgeOwner = new Map();
      var vertexCount = weldCount(ids);
      var pairA = [];
      var pairB = [];
      for (var f = 0; f < triCount; f++) {
        for (var e = 0; e < 3; e++) {
          var u = ids[f * 3 + e];
          var v = ids[f * 3 + ((e + 1) % 3)];
          var edgeKey = u < v ? u * vertexCount + v : v * vertexCount + u;
          var other = edgeOwner.get(edgeKey);
          if (other === undefined) {
            edgeOwner.set(edgeKey, f);
          } else {
            pairA.push(f);
            pairB.push(other);
            // abs(): a face wound the other way is still the same surface. Degenerate
            // (zero-area) faces have no normal, so they always join their neighbor.
            var dot = normals[f * 3] * normals[other * 3] + normals[f * 3 + 1] * normals[other * 3 + 1] + normals[f * 3 + 2] * normals[other * 3 + 2];
            if (degenerate[f] || degenerate[other] || Math.abs(dot) >= CREASE_COS) {
              var ra = find(f), rb = find(other);
              if (ra !== rb) parent[ra] = rb;
            }
          }
        }
      }

      // Merge tiny islands (jagged faces around the eyes and mouth) into the largest neighbor.
      var sizeOfRoot = new Int32Array(triCount);
      for (var s = 0; s < triCount; s++) sizeOfRoot[find(s)]++;
      var bestNeighbor = new Map();
      function considerMerge(small, big) {
        if (sizeOfRoot[small] >= MIN_PART_TRIS) return;
        var current = bestNeighbor.get(small);
        if (current === undefined || sizeOfRoot[big] > sizeOfRoot[current]) bestNeighbor.set(small, big);
      }
      for (var p = 0; p < pairA.length; p++) {
        var pa = find(pairA[p]);
        var pb = find(pairB[p]);
        if (pa !== pb) {
          considerMerge(pa, pb);
          considerMerge(pb, pa);
        }
      }
      bestNeighbor.forEach(function (big, small) {
        var r1 = find(small), r2 = find(big);
        if (r1 !== r2) parent[r1] = r2;
      });

      var partOfRoot = new Map();
      var partOfTri = new Int32Array(triCount);
      var meshParts = [];
      for (var tri = 0; tri < triCount; tri++) {
        var root = find(tri);
        var pIndex = partOfRoot.get(root);
        if (pIndex === undefined) {
          pIndex = meshParts.length;
          partOfRoot.set(root, pIndex);
          meshParts.push({ triangles: [], sum: [0, 0, 0] });
        }
        partOfTri[tri] = pIndex;
        meshParts[pIndex].triangles.push(tri);
        meshParts[pIndex].sum[0] += centroids[tri * 3];
        meshParts[pIndex].sum[1] += centroids[tri * 3 + 1];
        meshParts[pIndex].sum[2] += centroids[tri * 3 + 2];
      }

      // Largest parts first, so the list reads body -> details.
      meshParts.sort(function (a, b) { return b.triangles.length - a.triangles.length; });
      var remap = new Int32Array(meshParts.length);
      meshParts.forEach(function (mp, newIndex) {
        remap[partOfRoot.get(find(mp.triangles[0]))] = newIndex;
      });
      for (var q = 0; q < triCount; q++) partOfTri[q] = remap[partOfTri[q]];

      partIdsByMesh[meshIndex] = partOfTri;
      partBaseByMesh[meshIndex] = parts.length;
      meshParts.forEach(function (mp, index) {
        var count = mp.triangles.length;
        var kind = entry.name || 'body';
        parts.push({
          kind: kind,
          mesh: meshIndex,
          triangles: mp.triangles,
          centroid: [mp.sum[0] / count, mp.sum[1] / count, mp.sum[2] / count],
          color: null,
          label: labelFor(kind, index, count)
        });
      });
    });

    // Re-attach saved paints to the parts they were made on.
    paints.forEach(function (paint) {
      var match = nearestPart(paint.kind, paint.centroid);
      if (match) match.color = paint.color;
    });
    return parts;
  }

  function weldCount(ids) {
    var max = 0;
    for (var i = 0; i < ids.length; i++) if (ids[i] > max) max = ids[i];
    return max + 1;
  }

  // Largest part of a mesh gets the mesh name; the rest are numbered.
  function labelFor(kind, index, triangleCount) {
    var name = cfg.partNames && cfg.partNames[kind] ? cfg.partNames[kind] : kind;
    var label = index === 0 ? name : 'Part ' + (index + 1);
    return label + ' · ' + triangleCount.toLocaleString() + ' tris';
  }

  // Writes the colors for the current tab. Parametric shows the neutral model; Color shows paint.
  function refreshColors() {
    var colorTab = activeTab === 'color';
    if (colorTab) ensureParts();
    modelMeshes.forEach(function (mesh, meshIndex) {
      var colorAttr = mesh.geometry.attributes.color;
      var data = colorAttr.array;
      var shade = modelData[meshIndex].shade;
      var triCount = data.length / 9;
      var base = new T.Color(NEUTRAL_MODEL_COLOR);
      for (var t = 0; t < triCount; t++) {
        var c = base;
        if (colorTab) {
          c = new T.Color(parts[globalPartIndex(meshIndex, t)].color || DEFAULT_COLOR);
        }
        for (var v = 0; v < 3; v++) {
          var vert = t * 3 + v;
          var s = shade ? shade[vert] : 0;
          var f = 1 - CAVITY_SHADE * s;
          data[vert * 3] = c.r * f;
          data[vert * 3 + 1] = c.g * f;
          data[vert * 3 + 2] = c.b * f;
        }
      }
      colorAttr.needsUpdate = true;
    });
  }

  // Global index into `parts` for a triangle of one mesh.
  function globalPartIndex(meshIndex, triangle) {
    return partBaseByMesh[meshIndex] + partIdsByMesh[meshIndex][triangle];
  }

  function updateStats() {
    var tris = 0;
    var min = [Infinity, Infinity, Infinity];
    var max = [-Infinity, -Infinity, -Infinity];
    modelData.forEach(function (entry) {
      var p = entry.positions;
      tris += p.length / 9;
      for (var i = 0; i < p.length; i += 3) {
        for (var k = 0; k < 3; k++) {
          if (p[i + k] < min[k]) min[k] = p[i + k];
          if (p[i + k] > max[k]) max[k] = p[i + k];
        }
      }
    });
    var size = tris ? [max[0] - min[0], max[1] - min[1], max[2] - min[2]] : [0, 0, 0];
    $('mm-stats').textContent = 'Geometry ready // ' + Math.round(tris).toLocaleString() + ' triangles';
    $('mm-dims').textContent = size[0].toFixed(1) + ' x ' + size[2].toFixed(1) + ' x ' + size[1].toFixed(1) + ' MM';
  }

  // Preview mesh for hover, for example a stamp under the cursor. Pass null to hide it.
  function setPreview(entry) {
    if (previewMesh) {
      previewGroup.remove(previewMesh);
      previewMesh.geometry.dispose();
      previewMesh = null;
    }
    if (!entry) return;
    var geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.BufferAttribute(entry.positions, 3));
    geometry.computeVertexNormals();
    previewMesh = new T.Mesh(geometry, previewMaterial);
    previewGroup.add(previewMesh);
  }

  function centerCamera(mode) {
    var box = new T.Box3().setFromObject(modelGroup);
    var center = box.isEmpty() ? new T.Vector3(0, cfg.targetHeight || 40, 0) : box.getCenter(new T.Vector3());
    var size = box.isEmpty() ? 120 : Math.max(box.getSize(new T.Vector3()).length(), 120);
    var w = container.clientWidth || 600;
    var h = container.clientHeight || 480;
    var narrow = w / h < 1 ? 1 / Math.max(0.55, w / h) : 1;
    var dist = size * 1.25 * Math.min(1.45, narrow);

    controls.target.copy(center);
    if (mode === 'iso') {
      camera.position.set(center.x + dist * 0.55, center.y + dist * 0.42, center.z + dist * 0.85);
    } else {
      camera.position.set(center.x, center.y + dist * 0.2, center.z + dist);
    }
    camera.lookAt(center);
    controls.update();
  }

  // ---------------------------------------------------------------------------
  // 5. Picking: click to act, hover to preview
  // ---------------------------------------------------------------------------
  var raycaster = new T.Raycaster();
  var pointerNDC = new T.Vector2();
  var downAt = { x: 0, y: 0 };
  var dragged = false;

  function pickAt(clientX, clientY) {
    var rect = renderer.domElement.getBoundingClientRect();
    pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);
    var hits = raycaster.intersectObjects(modelMeshes, false);
    if (!hits.length) return null;
    var hit = hits[0];
    var normal = hit.face.normal.clone().normalize();
    var part = null;
    var meshIndex = modelMeshes.indexOf(hit.object);
    if (meshIndex >= 0) {
      ensureParts();
      part = parts[globalPartIndex(meshIndex, hit.faceIndex)];
    }
    return {
      point: hit.point.clone(),
      normal: normal,
      meshName: hit.object.name,
      part: part
    };
  }

  renderer.domElement.addEventListener('pointerdown', function (e) {
    downAt.x = e.clientX;
    downAt.y = e.clientY;
    dragged = false;
  });

  renderer.domElement.addEventListener('pointermove', function (e) {
    var dx = e.clientX - downAt.x;
    var dy = e.clientY - downAt.y;
    if (dx * dx + dy * dy > 36) dragged = true;
    if (typeof cfg.onHover === 'function') {
      cfg.onHover(pickAt(e.clientX, e.clientY), api);
    }
  });

  renderer.domElement.addEventListener('pointerleave', function () {
    if (typeof cfg.onHover === 'function') cfg.onHover(null, api);
  });

  renderer.domElement.addEventListener('pointerup', function (e) {
    if (dragged || e.button !== 0) return;
    var hit = pickAt(e.clientX, e.clientY);
    if (!hit) return;
    if (activeTab === 'color') {
      if (hit.part) paintPart(hit.part, selectedColor);
      else toast('Click a part of the model to paint it');
      return;
    }
    if (typeof cfg.onPick === 'function') cfg.onPick(hit, api);
  });

  // ---------------------------------------------------------------------------
  // 6. Tabs, toast, export
  // ---------------------------------------------------------------------------
  var activeTab = 'model';

  function setTab(tab) {
    activeTab = tab;
    var isColor = tab === 'color';
    dom.tabModel.setAttribute('aria-selected', String(!isColor));
    dom.tabColor.setAttribute('aria-selected', String(isColor));
    dom.modelBody.hidden = isColor;
    dom.colorBody.hidden = !isColor;
    $('mm-hint').textContent = isColor
      ? 'Click a part to paint it'
      : 'Drag or touch-swipe to orbit 3D mesh';
    if (isColor) ensureParts();
    refreshColors();
    renderPartList();
  }

  var toastTimer = null;
  function toast(message) {
    var node = $('mm-toast');
    node.textContent = message;
    node.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.classList.remove('is-visible'); }, 2400);
  }

  // Binary STL in Z-up print coordinates, sitting on the bed (z = 0).
  function collectTriangles() {
    ensureParts();
    var triangles = [];
    modelData.forEach(function (entry) {
      var p = entry.positions;
      for (var i = 0; i < p.length; i += 3) {
        // Y-up (three.js) -> Z-up (printer): (x, y, z) -> (x, -z, y)
        triangles.push(p[i], -p[i + 2], p[i + 1]);
      }
    });
    var minZ = Infinity;
    for (var j = 2; j < triangles.length; j += 3) if (triangles[j] < minZ) minZ = triangles[j];
    if (isFinite(minZ)) for (var k = 2; k < triangles.length; k += 3) triangles[k] -= minZ;
    return triangles;
  }

  function exportStl() {
    var coords = collectTriangles();
    var triCount = coords.length / 9;
    var buffer = new ArrayBuffer(84 + triCount * 50);
    var view = new DataView(buffer);
    view.setUint32(80, triCount, true);
    var offset = 84;
    for (var t = 0; t < triCount; t++) {
      var b = t * 9;
      var n = faceNormalAt(coords, b);
      var len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1;
      view.setFloat32(offset, n[0] / len, true);
      view.setFloat32(offset + 4, n[1] / len, true);
      view.setFloat32(offset + 8, n[2] / len, true);
      offset += 12;
      for (var k = 0; k < 9; k++) {
        view.setFloat32(offset, coords[b + k], true);
        offset += 4;
      }
      view.setUint16(offset, 0, true);
      offset += 2;
    }
    saveBlob(new Blob([buffer], { type: 'application/octet-stream' }), safeFileName($('mm-file-name').value) + '.stl');
    toast('Saved ' + safeFileName($('mm-file-name').value) + '.stl');
  }

  // 3MF with per-part colors: one base material per distinct color, one pid per triangle.
  function export3mf() {
    ensureParts();
    // Same Y-up -> Z-up mapping and bed offset as the STL export.
    var minY = Infinity;
    modelData.forEach(function (entry) {
      var p = entry.positions;
      for (var i = 1; i < p.length; i += 3) if (p[i] < minY) minY = p[i];
    });
    if (!isFinite(minY)) minY = 0;

    var colorIndex = {};
    var colorList = [];
    var vertexXml = [];
    var triangleXml = [];
    var vertexOffset = 0;

    modelData.forEach(function (entry, meshIndex) {
      var p = entry.positions;
      var triCount = p.length / 9;
      var localVerts = {};
      var localIndex = 0;

      function vertexId(x, y, z) {
        var key = x.toFixed(4) + ',' + y.toFixed(4) + ',' + z.toFixed(4);
        if (localVerts[key] === undefined) {
          localVerts[key] = localIndex++;
          vertexXml.push('<vertex x="' + x.toFixed(4) + '" y="' + (-z).toFixed(4) + '" z="' + (y - minY).toFixed(4) + '"/>');
        }
        return localVerts[key] + vertexOffset;
      }

      for (var t = 0; t < triCount; t++) {
        var b = t * 9;
        var v1 = vertexId(p[b], p[b + 1], p[b + 2]);
        var v2 = vertexId(p[b + 3], p[b + 4], p[b + 5]);
        var v3 = vertexId(p[b + 6], p[b + 7], p[b + 8]);
        var color = (parts[globalPartIndex(meshIndex, t)].color || DEFAULT_COLOR).toUpperCase();
        if (colorIndex[color] === undefined) {
          colorIndex[color] = colorList.length;
          colorList.push(color);
        }
        triangleXml.push('<triangle v1="' + v1 + '" v2="' + v2 + '" v3="' + v3 + '" pid="1" p1="' + colorIndex[color] + '"/>');
      }
      vertexOffset += localIndex;
    });

    var baseXml = colorList.map(function (c) {
      return '<base name="' + c + '" displaycolor="' + c + '"/>';
    }).join('');

    var modelXml = '<?xml version="1.0" encoding="UTF-8"?>' +
      '<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">' +
      '<resources>' +
      '<basematerials id="1">' + baseXml + '</basematerials>' +
      '<object id="2" name="' + escapeXml(safeFileName($('mm-file-name').value)) + '" type="model" pid="1" pindex="0">' +
      '<mesh><vertices>' + vertexXml.join('') + '</vertices><triangles>' + triangleXml.join('') + '</triangles></mesh>' +
      '</object></resources>' +
      '<build><item objectid="2"/></build></model>';

    var contentTypes = '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>' +
      '</Types>';
    var rels = '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>' +
      '</Relationships>';

    var zip = makeZip([
      { name: '[Content_Types].xml', data: utf8(contentTypes) },
      { name: '_rels/.rels', data: utf8(rels) },
      { name: '3D/3dmodel.model', data: utf8(modelXml) }
    ]);
    var name = safeFileName($('mm-file-name').value);
    saveBlob(new Blob([zip], { type: 'application/octet-stream' }), name + '.3mf');
    toast('Saved ' + name + '.3mf with colors');
  }

  function escapeXml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c];
    });
  }

  function utf8(text) {
    return new TextEncoder().encode(text);
  }

  function saveBlob(blob, fileName) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  // Minimal ZIP writer (store, no compression), enough for a .3mf package.
  function makeZip(files) {
    var crcTable = makeZip.table || (makeZip.table = (function () {
      var table = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
      }
      return table;
    })());
    function crc32(data) {
      var crc = 0xffffffff;
      for (var i = 0; i < data.length; i++) crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
      return (crc ^ 0xffffffff) >>> 0;
    }

    var locals = [];
    var centrals = [];
    var offset = 0;
    files.forEach(function (file) {
      var nameBytes = utf8(file.name);
      var crc = crc32(file.data);
      var local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true);
      local.setUint16(8, 0, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, file.data.length, true);
      local.setUint32(22, file.data.length, true);
      local.setUint16(26, nameBytes.length, true);
      locals.push(new Uint8Array(local.buffer), nameBytes, file.data);

      var central = new DataView(new ArrayBuffer(46));
      central.setUint32(0, 0x02014b50, true);
      central.setUint16(4, 20, true);
      central.setUint16(6, 20, true);
      central.setUint16(8, 0x0800, true);
      central.setUint32(16, crc, true);
      central.setUint32(20, file.data.length, true);
      central.setUint32(24, file.data.length, true);
      central.setUint16(28, nameBytes.length, true);
      central.setUint32(42, offset, true);
      centrals.push(new Uint8Array(central.buffer), nameBytes);

      offset += 30 + nameBytes.length + file.data.length;
    });

    var centralSize = centrals.reduce(function (s, a) { return s + a.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);

    var parts = locals.concat(centrals, [new Uint8Array(end.buffer)]);
    var total = parts.reduce(function (s, a) { return s + a.length; }, 0);
    var out = new Uint8Array(total);
    var pos = 0;
    parts.forEach(function (a) { out.set(a, pos); pos += a.length; });
    return out;
  }

  // Standalone file: fetch this page, then inline the shared CSS and engine.
  function downloadStandalone() {
    var pageUrl = location.href;
    fetch(pageUrl).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (html) {
      return Promise.all([
        fetch(new URL('shared/generator.css', pageUrl)).then(function (r) { return r.text(); }),
        fetch(new URL('shared/generator-core.js', pageUrl)).then(function (r) { return r.text(); })
      ]).then(function (sources) {
        var inlined = html
          .replace(/<link rel="stylesheet" href="shared\/generator\.css"\s*\/?>/, function () { return '<style>\n' + sources[0] + '\n</style>'; })
          .replace(/<script src="shared\/generator-core\.js"><\/script>/, function () { return '<script>\n' + sources[1] + '\n<\/script>'; });
        saveBlob(new Blob([inlined], { type: 'text/html' }), slug(cfg.title) + '-generator.html');
        toast('Saved standalone generator');
      });
    }).catch(function () {
      toast('Open the generator through the site to download it');
    });
  }

  // ---------------------------------------------------------------------------
  // 7. API for the generator, resize and render loop
  // ---------------------------------------------------------------------------
  var api = {
    THREE: T,
    params: params,
    setParams: setParams,
    rebuild: scheduleRebuild,
    setPreview: setPreview,
    toast: toast,
    centerCamera: centerCamera
  };

  function handleResize() {
    var w = Math.max(1, Math.floor(container.clientWidth || 600));
    var h = Math.max(1, Math.floor(container.clientHeight || 450));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, true);
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(handleResize).observe(container);
  }
  window.addEventListener('resize', handleResize);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  function init() {
    renderParametricPanel();
    renderColorPanel();
    handleResize();
    rebuild();
    centerCamera('front');
    animate();
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
