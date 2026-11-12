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

  var NEUTRAL_MODEL_COLOR = '#cbd5e1'; // Tabs without part colors (e.g. Sculpt): neutral matte
  var CAVITY_SHADE = 0.82;             // How dark a fully shaded vertex gets (0..1)
  var PLATE_SIZES = [184, 256, 350];   // Preview beds in mm: A1 mini, X1 / P1 / A1, large format; bigger models get a bed to fit
  var CREASE_COS = Math.cos(50 * Math.PI / 180); // Faces turning more than 50 degrees are separate parts
  var MIN_PART_TRIS = 200;             // Smaller islands merge into the neighbor they touch most
  var PAINT_MATCH_MM = 40;             // Max distance to re-attach a saved paint after a rebuild
  var VIEW_MODES = [
    { id: 'solid', label: 'Solid', hint: 'Normal shaded model' },
    { id: 'wire', label: 'Wireframe', hint: 'Only the triangle edges the model is built from' },
    { id: 'edges', label: 'Solid + edges', hint: 'Shaded model with the triangle edges drawn on top' }
  ];
  // Lighting for the 3D preview (viewer only, exports are unchanged): 'soft' = shadowless soft light (default),
  // 'flat' = unlit vertex colours with crease outlines. The choice is remembered per browser.
  var LIGHT_MODES = [
    { id: 'soft', label: 'Soft light', hint: 'Shadowless, even light. Brightness does not change as you orbit' },
    { id: 'flat', label: 'Flat + outlines', hint: 'Flat colours with outlines on creases. Best for reading the build and painting parts' }
  ];
  var LIGHT_STORE = 'mm-lighting';
  var EDGE_CREASE_DEG = 30;            // Flat mode: outline edges where faces turn more than this
  var EDGE_MAX_TRIS = 400000;          // Flat mode: skip outlines on models denser than this (perf)
  var PALETTE = cfg.palette || [{ name: 'Bone White', color: '#f1f5f9' }];
  var DEFAULT_COLOR = cfg.defaultColor || PALETTE[0].color;

  // ---------------------------------------------------------------------------
  // 1. Parameters and DOM
  // ---------------------------------------------------------------------------
  var params = {};
  cfg.parameters.forEach(function (p) { params[p.key] = p.value; });

  var escapeXml = MMExport.escapeXml, utf8 = MMExport.utf8, saveBlob = MMExport.saveBlob, makeZip = MMExport.makeZip;
  var faceNormalAt = MMMesh.faceNormalAt, weldIds = MMMesh.weldIds, weldCount = MMMesh.weldCount;
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

  // The Sculpt tab lives in shared/sculpt.js. This is the engine's side of it: reads are getters because the values change after
  // this point (the scene is built later, modelData on every rebuild). A page without sculpt.js simply has no Sculpt tab.
  var SC = window.MMSculpt ? window.MMSculpt.create({
    cfg: cfg, T: T, el: el, $: $,
    get scene() { return scene; }, get renderer() { return renderer; }, get camera() { return camera; }, get controls() { return controls; },
    get raycaster() { return raycaster; }, get pointerNDC() { return pointerNDC; }, get params() { return params; },
    get modelData() { return modelData; }, get modelMeshes() { return modelMeshes; }, get activeTab() { return activeTab; },
    get sliderRefs() { return sliderRefs; },
    wasDragged: function () { return dragged; },
    pickAt: pickAt, groupedNormals: groupedNormals, rebuild: rebuild, scheduleRebuild: scheduleRebuild,
    sliderForMini: sliderForMini,
    resetMiniRefs: function () { miniRefs = {}; },
    syncMiniRefs: function () { syncRefMap(miniRefs); },
    syncSliderRefs: function () { syncRefMap(sliderRefs); },
    // After a brush stroke the mesh is already right: only what depends on it is refreshed.
    meshSettled: function () {
      printCache = null;
      parts = null;
      if (paints.length) ensureParts();
      refreshColors();
      renderPartList();
      updateStats();
      rebuildWire();
    }
  }) : null;

  function safeFileName(raw) {
    var cleaned = String(raw || '').trim().replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_');
    return cleaned || cfg.fileName || 'Model';
  }

  // Footer disclaimer. Keep in sync with DISCLAIMER.md and the #site-disclaimer block in index.html.
  var DISCLAIMER_SHORT = "The digital 3D models generated by this tool are provided 'as-is' for hobby and educational use. The creator of this software assumes no liability for injuries, damages, or losses resulting from the physical manufacturing, material choice, or real-world application of these generated files.";
  var DISCLAIMER_ITEMS = [
    'Everything here (models, exports, recommended print settings, the printer map) is provided "as is" and "as available", without warranty of any kind, express or implied, including merchantability and fitness for a particular purpose.',
    'You print at your own risk. Check every model and setting before printing, supervise prints, and follow your printer and material safety guidance. Slicer and printer compatibility is not guaranteed.',
    'To the fullest extent permitted by law, the site owner is not liable for failed prints, malfunctions, damage to printers or materials, wasted material, injury, property damage, or any other loss arising from use of this site.',
    'Community map and printer listings are third-party and often unverified. They are not endorsed. Check each location\'s own rules and fees.',
    'You are responsible for the legality of what you print and for having the right to print it.',
    'Printed parts are not tested or certified for any use. Do not rely on one where failure could cause injury or damage, and keep small parts away from young children.'
  ];

  // Consent gate shown before a file download. Confirm runs the download; Cancel or Esc closes.
  function confirmDownload(label, proceed) {
    if (document.getElementById('mm-consent')) return;
    var agree = el('input', { type: 'checkbox', id: 'mm-consent-agree' });
    var go = el('button', { class: 'mm-btn mm-btn--solid', type: 'button', text: 'Confirm & Download', disabled: 'disabled' });
    var prev = document.activeElement;
    function close() {
      document.removeEventListener('keydown', onKey, true);
      var m = document.getElementById('mm-consent');
      if (m) m.remove();
      if (prev && prev.focus) prev.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    agree.addEventListener('change', function () { go.disabled = !agree.checked; });
    go.addEventListener('click', function () {
      if (!agree.checked) return;
      close();
      if (cfg.exportWarning) confirmExtraWarning(cfg.exportWarning, proceed); else proceed();
    });
    var items = [
      el('p', {}, [el('strong', { text: 'Safety Warning: ' }), document.createTextNode('3D printed objects can shatter or break into small, sharp pieces. Items generated with this tool (such as articulated lanyard links, figures, or small accessories) are a severe choking hazard and are strictly not intended for young children.')]),
      el('p', { text: 'Additionally, if you are generating custom lamp shades or lighting fixtures, do not use them with incandescent bulbs or high-heat sockets. Materials like Matte PLA and Silk PETG will warp, melt, and pose a severe fire hazard.' })
    ];
    var modal = el('div', { class: 'mm-modal', id: 'mm-consent', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mm-consent-title' }, [
      el('div', { class: 'mm-modal-box' }, [
        el('h2', { id: 'mm-consent-title', class: 'mm-modal-title', text: 'Before you download' }),
        el('div', { class: 'mm-modal-body' }, items),
        el('label', { class: 'mm-check mm-modal-agree' }, [agree, el('span', { text: 'I understand and accept these safety risks.' })]),
        el('div', { class: 'mm-modal-actions' }, [
          el('button', { class: 'mm-btn', type: 'button', text: 'Cancel', onclick: close }),
          go
        ])
      ])
    ]);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(modal);
    agree.focus();
  }

  // Optional second warning for models with a specific hazard (cfg.exportWarning = { title, paragraphs, agree }).
  // Shown after the standard consent is accepted; the download only starts once this one is accepted too.
  function confirmExtraWarning(w, proceed) {
    if (document.getElementById('mm-consent2')) return;
    var agree = el('input', { type: 'checkbox', id: 'mm-consent2-agree' });
    var go = el('button', { class: 'mm-btn mm-btn--solid', type: 'button', text: 'Confirm & Download', disabled: 'disabled' });
    function close() {
      document.removeEventListener('keydown', onKey, true);
      var m = document.getElementById('mm-consent2');
      if (m) m.remove();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    agree.addEventListener('change', function () { go.disabled = !agree.checked; });
    go.addEventListener('click', function () { if (!agree.checked) return; close(); proceed(); });
    var items = (w.paragraphs || []).map(function (t) { return el('p', { text: t }); });
    var modal = el('div', { class: 'mm-modal', id: 'mm-consent2', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mm-consent2-title' }, [
      el('div', { class: 'mm-modal-box' }, [
        el('h2', { id: 'mm-consent2-title', class: 'mm-modal-title', text: w.title || 'One more safety warning' }),
        el('div', { class: 'mm-modal-body' }, items),
        el('label', { class: 'mm-check mm-modal-agree' }, [agree, el('span', { text: w.agree || 'I understand and accept these safety risks.' })]),
        el('div', { class: 'mm-modal-actions' }, [
          el('button', { class: 'mm-btn', type: 'button', text: 'Cancel', onclick: close }),
          go
        ])
      ])
    ]);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(modal);
    agree.focus();
  }

  // Always-visible disclaimer sentence, with the longer terms in a collapsed block under it.
  function disclaimerBlock() {
    var items = DISCLAIMER_ITEMS.map(function (t) { return el('p', { text: t }); });
    return el('div', { class: 'mm-disclaimer' }, [
      el('p', { class: 'mm-disclaimer-lead' }, [el('strong', { text: 'Disclaimer: ' }), document.createTextNode(DISCLAIMER_SHORT)]),
      el('details', {}, [
        el('summary', { text: 'Full terms' }),
        el('div', { class: 'mm-disclaimer-body' }, items)
      ])
    ]);
  }

  // Collapsible section used for every control group.
  function accordion(title, body, open) {
    var d = el('details', { class: 'mm-acc' }, [
      el('summary', { class: 'mm-acc-title', text: title }),
      el('div', { class: 'mm-acc-body' }, [body])
    ]);
    if (open) d.setAttribute('open', '');
    return d;
  }

  // Phone layout: the handle above the tabs drags the viewport height (CSS var --mm-vp), a tap toggles big model / big controls.
  function setupSheetHandle(main, handle) {
    var startY = 0, startH = 0, moved = false, dragging = false;
    function clamp(h) {
      var total = main.clientHeight;
      return Math.max(Math.round(total * 0.18), Math.min(Math.round(total * 0.82), h));
    }
    function setHeight(h) { main.style.setProperty('--mm-vp', clamp(h) + 'px'); }
    handle.addEventListener('pointerdown', function (e) {
      dragging = true; moved = false;
      startY = e.clientY;
      startH = main.querySelector('.mm-viewport').getBoundingClientRect().height;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientY - startY) > 4) moved = true;
      if (moved) setHeight(startH + (e.clientY - startY));
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      if (!moved) {
        var h = main.querySelector('.mm-viewport').getBoundingClientRect().height;
        setHeight(h > main.clientHeight * 0.6 ? main.clientHeight * 0.4 : main.clientHeight * 0.8);
      }
    }
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
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
        el('button', { class: 'mm-btn mm-btn--amber', type: 'button', id: 'mm-download-html', text: 'Download program (.html)', onclick: function () { confirmDownload('generator', downloadStandalone); } }),
        el('a', { class: 'mm-btn', href: '../index.html', target: '_top', text: 'Back to grid' })
      ])
    ]);

    var tabModel = el('button', { class: 'mm-tab', type: 'button', id: 'mm-tab-model', 'aria-selected': 'true', text: 'Parametric', onclick: function () { setTab('model'); } });
    var tabColor = el('button', { class: 'mm-tab', type: 'button', id: 'mm-tab-color', 'aria-selected': 'false', text: 'Color tool', onclick: function () { setTab('color'); } });

    var tabPrint = el('button', { class: 'mm-tab', type: 'button', id: 'mm-tab-print', 'aria-selected': 'false', text: 'Print', onclick: function () { setTab('print'); } });
    var printBody = el('div', { id: 'mm-body-print', class: 'mm-panel-body', hidden: '' });
    var modelBody = el('div', { id: 'mm-body-model', class: 'mm-panel-body' });
    var colorBody = el('div', { id: 'mm-body-color', class: 'mm-panel-body', hidden: '' });

    var fileInput = el('input', { id: 'mm-file-name', type: 'text', maxlength: '60', value: cfg.fileName || 'Model', spellcheck: 'false' });
    // Export block lives at the bottom of the Print tab (not in a footer), so every tab shows more settings.
    var exportBlock = el('div', { class: 'mm-export-block' }, [
      el('h3', { class: 'mm-group-title', text: 'Export' }),
      el('div', { class: 'mm-stats', id: 'mm-stats', text: 'Geometry ready' }),
      el('label', { class: 'mm-file-field' }, [document.createTextNode('File name'), fileInput]),
      el('div', { class: 'mm-export-row' }, [
        el('button', { class: 'mm-btn mm-btn--solid', type: 'button', id: 'mm-export-stl', text: 'Export .STL', onclick: function () { confirmDownload('.STL', exportStl); } }),
        el('button', { class: 'mm-btn mm-btn--solid', type: 'button', id: 'mm-export-obj', text: 'Export .OBJ (colors)', title: 'Zip with .obj + .mtl. Keeps your Color-tab colors for Bambu Studio, OrcaSlicer and PrusaSlicer; no print settings', onclick: function () { confirmDownload('.OBJ', exportObj); } })
      ]),
      el('button', { class: 'mm-btn mm-btn--amber mm-btn--block', type: 'button', text: 'Download standalone .html generator', onclick: function () { confirmDownload('generator', downloadStandalone); } }),
      disclaimerBlock()
    ]);

    // Phone sheet handle: drag to resize the viewport/sheet split, tap to flip between big model and big controls.
    var sheetHandle = el('div', { class: 'mm-sheet-handle', role: 'separator', 'aria-label': 'Drag to resize the 3D view', title: 'Drag to resize, tap to toggle' }, [el('span', { class: 'mm-sheet-grip' })]);

    // Optional generator tabs (cfg.tabs), shown right after Parametric.
    var tabDefs = (cfg.tabs || []).slice();
    // Every generator gets the Sculpt tab unless it opts out with sculpt: false. Models that print differently from what they show cannot use it.
    if (!SC || cfg.sculpt === false || (cfg.printMeshes && typeof cfg.printActive !== 'function') || /[?&]embed=workshop\b/.test(location.search)) cfg.sculpt = null;
    else if (!cfg.sculpt) cfg.sculpt = SC.generic();
    // cfg.partEdit: the Parametric tab itself selects and moves pieces and shows a mini settings window; the Sculpt tab then has only the sculpt brushes.
    if (cfg.sculpt) { if (cfg.tabsFirst) tabDefs.push(SC.tabConfig()); else tabDefs.unshift(SC.tabConfig()); }
    var extraTabs = tabDefs.map(function (t) {
      return {
        id: t.id, cfg: t,
        btn: el('button', { class: 'mm-tab', type: 'button', id: 'mm-tab-' + t.id, 'aria-selected': 'false', text: t.label, onclick: function () { setTab(t.id); } }),
        body: el('div', { id: 'mm-body-' + t.id, class: 'mm-panel-body', hidden: '' })
      };
    });

    var panel = el('aside', { class: 'mm-panel' }, [
      sheetHandle,
      el('div', { class: 'mm-tabs', role: 'tablist' }, (cfg.hideModelTab ? [] : (cfg.tabsFirst ? [] : [tabModel])).concat(extraTabs.map(function (t) { return t.btn; }), cfg.hideModelTab ? [] : (cfg.tabsFirst ? [tabModel] : []), [tabColor, tabPrint])),
      modelBody
    ].concat(extraTabs.map(function (t) { return t.body; }), [
      colorBody,
      printBody
    ]));

    var stage = el('div', { class: 'mm-stage', id: 'mm-stage' });
    var viewport = el('section', { class: 'mm-viewport' }, [
      stage,
      el('div', { class: 'mm-overlay mm-overlay--tl', id: 'mm-hint', text: 'Drag or touch-swipe to orbit 3D mesh' }),
      el('div', { class: 'mm-overlay mm-overlay--tr', id: 'mm-dims', text: '' }),
      el('div', { class: 'mm-overlay mm-sculpt-flag', id: 'mm-sculpt-flag', role: 'status', hidden: '', text: 'Sculpted Models may have print errors' }),
      el('div', { class: 'mm-toast', id: 'mm-toast', role: 'status' }),
      el('div', { class: 'mm-printcheck', id: 'mm-printcheck', hidden: '' }, [
        el('div', { class: 'mm-printlist', id: 'mm-printlist', hidden: '' }),
        el('button', { class: 'mm-printchip', type: 'button', id: 'mm-printchip', 'aria-expanded': 'false', 'aria-controls': 'mm-printlist', onclick: function () { togglePrintList(); } })
      ]),
      el('div', { class: 'mm-view-buttons' }, [
        el('button', { class: 'mm-btn', type: 'button', text: 'Front', onclick: function () { centerCamera('front'); } }),
        el('button', { class: 'mm-btn', type: 'button', text: 'Iso', onclick: function () { centerCamera('iso'); } }),
        el('button', { class: 'mm-btn', type: 'button', id: 'mm-colors-toggle', 'aria-pressed': 'true', text: 'Colors', title: 'Show or hide colors in the Parametric view', onclick: function () { toggleColors(); } })
      ])
    ]);

    var main = el('main', { class: 'mm-main' }, [panel, viewport]);
    setupSheetHandle(main, sheetHandle);
    document.body.appendChild(header);
    document.body.appendChild(main);

    return { exportBlock: exportBlock, extraTabs: extraTabs, modelBody: modelBody, colorBody: colorBody, printBody: printBody, stage: stage, tabModel: tabModel, tabColor: tabColor, tabPrint: tabPrint };
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
      presetsRow = accordion('Presets', el('div', { class: 'mm-chips' }, cfg.presets.map(function (preset) {
        return el('button', { class: 'mm-chip', type: 'button', text: preset.label, onclick: function () {
          setParams(preset.values);
          toast('Loaded "' + preset.label + '"');
        } });
      })), false);
    }

    var groups = [];
    cfg.parameters.forEach(function (p) {
      if (p.tab) return; // belongs to a generator tab (cfg.tabs)
      var groupName = p.group || 'Parameters';
      var group = groups.filter(function (g) { return g.name === groupName; })[0];
      if (!group) {
        group = { name: groupName, items: [] };
        groups.push(group);
      }
      group.items.push(p);
    });

    // First group opens by default (cfg.openGroups can list names instead); the rest start collapsed.
    var sections = groups.map(function (group, i) {
      var open = cfg.openGroups ? cfg.openGroups.indexOf(group.name) >= 0 : i === 0;
      var nodes = group.items.map(function (p) {
        var node = sliderFor(p);
        if (typeof p.showIf === 'function') showIfRefs.push({ node: node, p: p });
        return node;
      });
      var acc = accordion(group.name, el('div', {}, nodes), open);
      if (group.items.every(function (p) { return typeof p.showIf === 'function'; })) showIfGroups.push({ node: acc, items: group.items });
      return acc;
    });

    dom.modelBody.appendChild(el('h2', { class: 'mm-section-title', text: 'Parametric controls' }));
    if (presetsRow) dom.modelBody.appendChild(presetsRow);
    sections.forEach(function (s) { dom.modelBody.appendChild(s); });

    // Generator-specific extras (for example the Ghost Builder stamp tools).
    var extras = el('div', { id: 'mm-extras' });
    if (typeof cfg.mount === 'function') {
      dom.modelBody.appendChild(accordion(cfg.extrasTitle || 'Stamps & tools', extras, !!(cfg.openGroups && cfg.openGroups.indexOf(cfg.extrasTitle) >= 0)));
      cfg.mount(extras, api);
    }
    dom.modelBody.appendChild(accordion('View', el('div', {}, [
      el('div', { class: 'mm-slider' }, [
        el('div', { class: 'mm-slider-head' }, [el('label', { text: 'Lighting' })]),
        el('select', { id: 'mm-light-modes', 'aria-label': 'Lighting', onchange: function (e) { setLightMode(e.target.value); } }, LIGHT_MODES.map(function (mode) {
          return el('option', { value: mode.id, text: mode.label, title: mode.hint });
        }))
      ]),
      el('div', { class: 'mm-slider' }, [
        el('div', { class: 'mm-slider-head' }, [el('label', { text: 'Display' })]),
        el('select', { id: 'mm-view-modes', 'aria-label': 'Display', onchange: function (e) { setViewMode(e.target.value); } }, VIEW_MODES.map(function (mode) {
          return el('option', { value: mode.id, text: mode.label, title: mode.hint });
        }))
      ]),
      el('p', { class: 'mm-note', text: 'Wireframe shows the triangles the model is built from. It is only a view; exports are unchanged.' })
    ]), false));

    renderExtraTabs();
  }

  // Generator tabs: the tab's own controls (mount) first, then its sliders (parameters with tab: id) as open sections.
  function renderExtraTabs() {
    dom.extraTabs.forEach(function (t) {
      var box = el('div', { class: 'mm-group' });
      t.body.appendChild(box);
      if (typeof t.cfg.mount === 'function') t.cfg.mount(box, api);
      var groups = [];
      cfg.parameters.forEach(function (p) {
        if (p.tab !== t.id) return;
        var name = p.group || 'Settings';
        var group = groups.filter(function (g) { return g.name === name; })[0];
        if (!group) { group = { name: name, items: [] }; groups.push(group); }
        group.items.push(p);
      });
      groups.forEach(function (g) { t.body.appendChild(accordion(g.name, el('div', {}, g.items.map(sliderFor)), true)); });
    });
  }

  function tabHandlers() {
    if (activeTab === 'model') return cfg;
    var t = dom.extraTabs.filter(function (x) { return x.id === activeTab; })[0];
    return t ? t.cfg : null;
  }

  var sliderRefs = {};
  var showIfRefs = [];   // sliders with a showIf(params) rule, and the accordion groups made only of them
  var showIfGroups = [];
  function applyShowIf() {
    showIfRefs.forEach(function (r) { r.node.hidden = !r.p.showIf(params); });
    showIfGroups.forEach(function (g) { g.node.hidden = g.items.every(function (p) { return !p.showIf(params); }); });
  }

  // Print tab: material only. It picks the finish of the realistic render (cfg.printSettings.material sets the default).
  var printSettings = { material: (cfg.printSettings && cfg.printSettings.material) || 'PLA' };
  var PRINT_MATERIALS = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU'];

  // cfg.printMeshes may be switched on and off by the generator with cfg.printActive(params) (an optional print variant, such as
  // a rod split in two). While it is off the model prints as shown. cfg.printShowParts(params) picks, while it is on, whether
  // the Print tab shows the print layout (true) or the assembled model (false); exports and the print check use the layout.
  function printOn() { return !!cfg.printMeshes && (typeof cfg.printActive !== 'function' || !!cfg.printActive(params)); }
  function printShowing() { return printOn() && (typeof cfg.printShowParts !== 'function' || !!cfg.printShowParts(params)); }

  function renderPrintPanel() {
    dom.printBody.innerHTML = '';
    dom.printBody.appendChild(el('h2', { class: 'mm-section-title', text: 'Print' }));
    dom.printBody.appendChild(el('p', { class: 'mm-note', text: 'The 3D view shows a realistic preview with your painted colors. Pick a material to change its finish.' }));
    var sel = el('select', { 'aria-label': 'Material', onchange: function () {
      printSettings.material = sel.value;
      updatePrintLook();
    } }, PRINT_MATERIALS.map(function (o) { return el('option', { value: o, text: o }); }));
    sel.value = printSettings.material;
    if (sel.value !== printSettings.material) { printSettings.material = 'PLA'; sel.value = 'PLA'; }
    dom.printBody.appendChild(el('div', { class: 'mm-group' }, [el('div', { class: 'mm-slider' }, [el('div', { class: 'mm-slider-head' }, [el('label', { text: 'Material' })]), sel])]));
    if (typeof cfg.printPanel === 'function') {
      var extra = el('div', { class: 'mm-group' });
      dom.printBody.appendChild(extra);
      cfg.printPanel(extra, api);
    }
    dom.printBody.appendChild(dom.exportBlock);
  }

  // A parameter with `choices: [{ label, svg }]` is picked from a grid of icon buttons (value = index) instead of a slider.
  function choicesFor(p) {
    var btns = [];
    var label = el('span', { class: 'mm-slider-value' });
    function sync() {
      var cur = Math.round(params[p.key]);
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === cur)); });
      label.textContent = p.choices[cur] ? p.choices[cur].label : '';
    }
    p.choices.forEach(function (c, i) {
      var b = el('button', {
        type: 'button', class: 'mm-choice', title: c.label, 'aria-label': p.label + ': ' + c.label,
        onclick: function () { params[p.key] = i; sync(); scheduleRebuild(); }
      });
      b.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true">' + c.svg + '</svg><span>' + c.label + '</span>';
      btns.push(b);
    });
    sliderRefs[p.key] = { choices: true, sync: sync };
    sync();
    return el('div', { class: 'mm-slider' }, [
      el('div', { class: 'mm-slider-head' }, [el('label', { text: p.label }), label]),
      el('div', { class: 'mm-choices' }, btns)
    ]);
  }

  // Named options for a categorical parameter, or null when it is a real quantity (slider).
  // Explicit: `options: ['A', 'B']` (value = min + index). Automatic: a small integer range whose formatted
  // values contain no digits ('Off'/'On', 'None'/'Ball'/'Sparkle'...) is categorical.
  function optionNames(p) {
    if (p.choices || p.slider) return null;
    if (p.options) return p.options;
    if (typeof p.format !== 'function' || (p.step || 1) !== 1) return null;
    var count = Math.round(p.max - p.min) + 1;
    if (count < 2 || count > 8) return null;
    var names = [];
    for (var v = p.min; v <= p.max; v++) {
      var t = String(p.format(v));
      if (/\d/.test(t) || names.indexOf(t) >= 0) return null;
      names.push(t);
    }
    return names;
  }

  // Two options: both buttons visible, the selected one highlighted. More: a dropdown.
  function optionsFor(p, names) {
    var base = p.min || 0;
    var ctl, sync;
    if (names.length === 2) {
      var btns = names.map(function (name, i) {
        return el('button', { type: 'button', class: 'mm-toggle-btn', text: name, onclick: function () {
          params[p.key] = base + i; sync(); scheduleRebuild();
        } });
      });
      ctl = el('div', { class: 'mm-toggle', role: 'group', 'aria-label': p.label }, btns);
      sync = function () {
        var cur = Math.round(params[p.key]) - base;
        btns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === cur)); });
      };
    } else {
      ctl = el('select', { 'aria-label': p.label, onchange: function () {
        params[p.key] = base + Number(ctl.value); scheduleRebuild();
      } }, names.map(function (name, i) { return el('option', { value: String(i), text: name }); }));
      sync = function () { ctl.value = String(Math.round(params[p.key]) - base); };
    }
    sliderRefs[p.key] = { choices: true, sync: sync };
    sync();
    return el('div', { class: 'mm-slider' }, [
      el('div', { class: 'mm-slider-head' }, [el('label', { text: p.label })]),
      ctl
    ]);
  }

  function sliderFor(p) {
    if (p.choices) return choicesFor(p);
    var names = optionNames(p);
    if (names) return optionsFor(p, names);
    var output = el('span', { class: 'mm-slider-value', text: formatParam(p, params[p.key]) });
    var input = el('input', {
      type: 'range', min: String(p.min), max: String(p.max), step: String(p.step || 1), value: String(params[p.key]),
      'aria-label': p.label,
      oninput: function () {
        params[p.key] = Number(input.value);
        output.textContent = formatParam(p, params[p.key]);
        if (cfg.sculpt && cfg.sculpt.kit) SC.state.draft = true; // sculpted models use a quick coarse mesh while a slider moves
        sliding = true; // and skip the paint-part analysis, which only matters once the slider settles
        clearTimeout(slidingTimer);
        slidingTimer = setTimeout(settleSliding, 700);
        scheduleRebuild();
      },
      onchange: function () {
        if (cfg.sculpt && SC.state.draft) { sliding = false; clearTimeout(slidingTimer); SC.commit(); return; }
        settleSliding();
      }
    });
    sliderRefs[p.key] = { input: input, output: output, def: p };
    return el('div', { class: 'mm-slider' }, [
      el('div', { class: 'mm-slider-head' }, [el('label', { text: p.label }), output]),
      input
    ]);
  }

  // Sliders in the part-edit mini window (cfg.partEdit) are the same parameters again; they are kept in a second map so the Parametric panel keeps its own.
  var miniRefs = {};
  function sliderForMini(p) {
    var saved = sliderRefs[p.key], node = sliderFor(p);
    miniRefs[p.key] = sliderRefs[p.key];
    if (saved) sliderRefs[p.key] = saved; else delete sliderRefs[p.key];
    return node;
  }
  function syncSliders() {
    syncRefMap(sliderRefs); syncRefMap(miniRefs);
  }
  function syncRefMap(refs) {
    Object.keys(refs).forEach(function (key) {
      var ref = refs[key];
      if (ref.choices) { ref.sync(); return; }
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
          el('span', { class: 'mm-part-chip', style: 'background:' + (part.color || part.def || DEFAULT_COLOR) })
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
  scene.background = cfg.customStage ? null : new T.Color(0x0b1120);

  var camera = new T.PerspectiveCamera(40, 1, 1, 2000);
  var renderer = new T.WebGLRenderer({ antialias: true, alpha: !!cfg.customStage, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = false;   // shadows only in the Print tab's realistic render (see applyLighting)
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
  var ambient = new T.AmbientLight(0xffffff, 0);
  scene.add(ambient);
  var fill = new T.DirectionalLight(0xffffff, 0);   // rides on the camera, so it lights what you look at from any angle
  fill.position.set(0, 0, 1);
  camera.add(fill);
  scene.add(camera);

  var lightMode = 'soft';
  try { var savedLight = localStorage.getItem(LIGHT_STORE); if (savedLight === 'soft' || savedLight === 'flat') lightMode = savedLight; } catch (e) { /* storage blocked */ }
  var flatMaterial = new T.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  var edgeMaterial = new T.LineBasicMaterial({ color: 0x0b1120, transparent: true, opacity: 0.6 });

  // Set every light for the current lighting mode and tab. The Print tab keeps its realistic studio look.
  function applyLighting() {
    var print = activeTab === 'print';
    var shadows = print;
    if (renderer.shadowMap.enabled !== shadows) {
      renderer.shadowMap.enabled = shadows;
      scene.traverse(function (o) { if (o.material) [].concat(o.material).forEach(function (m) { m.needsUpdate = true; }); });
    }
    key.castShadow = shadows;
    if (print) {
      hemi.intensity = 0.5; key.intensity = 0.85; rim.intensity = 0.3; ambient.intensity = 0; fill.intensity = 0;
    } else if (lightMode === 'flat') {
      hemi.intensity = 0; key.intensity = 0; rim.intensity = 0; ambient.intensity = 0; fill.intensity = 0;   // unlit material
    } else {
      hemi.intensity = 0.65; ambient.intensity = 0.25;   // about 0.9 combined, so no side is dark
      key.intensity = 0; rim.intensity = 0;
      fill.intensity = 0.3;                              // weak, camera-attached
    }
  }

  // Build plate: the smallest common bed the model fits on (see PLATE_SIZES), resized after every build.
  // The mesh is a unit box scaled to size, so stages that restyle plateMesh / grid keep working.
  var plate = new T.Group();
  scene.add(plate);
  var plateMesh = new T.Mesh(new T.BoxGeometry(1, 2.4, 1), new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.15 }));
  plateMesh.position.y = -1.35;
  plateMesh.receiveShadow = true;
  plate.add(plateMesh);
  var grid = new T.GridHelper(1, 1, 0x6366f1, 0x334155);
  grid.position.y = -0.08;
  plate.add(grid);
  var frontBar = new T.Mesh(new T.BoxGeometry(36, 0.6, 2.5), new T.MeshBasicMaterial({ color: 0x00e5ff }));
  plate.add(frontBar);
  var plateSize = 0;
  setPlateSize(PLATE_SIZES[0]);

  function setPlateSize(mm) {
    if (mm === plateSize) return;
    plateSize = mm;
    plateMesh.scale.set(mm, 1, mm);
    var g = mm - 10, lines = new T.GridHelper(g, Math.round(g / 10), 0x6366f1, 0x334155);   // 10 mm squares
    grid.geometry.dispose();
    grid.geometry = lines.geometry;
    frontBar.position.set(0, 0.2, mm / 2 - 4);
    var half = Math.max(160, mm * 0.6);
    key.shadow.camera.left = -half; key.shadow.camera.right = half;
    key.shadow.camera.top = half; key.shadow.camera.bottom = -half;
    key.shadow.camera.updateProjectionMatrix();
  }
  // Plate for a model whose footprint reaches `reach` mm from the centre in x or z.
  function plateFor(reach) {
    var need = reach * 2;
    for (var i = 0; i < PLATE_SIZES.length; i++) if (need <= PLATE_SIZES[i]) return PLATE_SIZES[i];
    return Math.ceil(need / 50) * 50;
  }

  var modelGroup = new T.Group();
  scene.add(modelGroup);
  var previewGroup = new T.Group();
  scene.add(previewGroup);
  var wireGroup = new T.Group();
  scene.add(wireGroup);
  var viewMode = 'solid';

  var modelMaterial = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.03, vertexColors: true });
  // Print tab: a more realistic render driven by the Print settings (material) and the painted colors.
  var PRINT_LOOKS = {
    PLA: { roughness: 0.5, clearcoat: 0.1, clearcoatRoughness: 0.55, env: 0.35 },
    PETG: { roughness: 0.2, clearcoat: 0.7, clearcoatRoughness: 0.12, env: 0.55 },
    ABS: { roughness: 0.4, clearcoat: 0.06, clearcoatRoughness: 0.5, env: 0.3 },
    ASA: { roughness: 0.55, clearcoat: 0.0, clearcoatRoughness: 0.6, env: 0.25 },
    TPU: { roughness: 0.78, clearcoat: 0.0, clearcoatRoughness: 0.8, env: 0.15 }
  };
  var printUniforms = { uLayer: { value: 0.2 }, uStrength: { value: 0.1 } };
  var printMaterial = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0, vertexColors: true });
  printMaterial.extensions = { derivatives: true };
  printMaterial.onBeforeCompile = function (shader) {
    shader.uniforms.uLayer = printUniforms.uLayer;
    shader.uniforms.uStrength = printUniforms.uStrength;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vModelY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvModelY = (modelMatrix * vec4(position, 1.0)).y;');
    // Layer lines: faint horizontal banding that fades out when the lines get thinner than a pixel.
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vModelY;\nuniform float uLayer;\nuniform float uStrength;')
      .replace('#include <color_fragment>', '#include <color_fragment>\nfloat lph = vModelY / uLayer; float lfade = 1.0 - smoothstep(0.2, 0.7, fwidth(lph)); float lband = sin(lph * 6.2831853);\ndiffuseColor.rgb *= 1.0 - uStrength * lfade * (0.5 + 0.5 * lband);')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = normalize(normal + (viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz * (lband * uStrength * lfade * 0.8));');
  };
  var studioEnv = null;

  function makeStudioEnv() {
    var room = new T.Scene();
    room.background = new T.Color(0x46506a);
    function box(w, h, d, x, y, z, level) {
      var m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshBasicMaterial({ color: new T.Color(level, level, level) }));
      m.position.set(x, y, z);
      room.add(m);
    }
    box(40, 3, 40, 0, 45, 0, 6);
    box(3, 30, 40, 45, 15, 0, 3);
    box(3, 30, 40, -45, 15, 0, 1.5);
    box(40, 30, 3, 0, 15, 45, 2);
    var pm = new T.PMREMGenerator(renderer);
    var tex = pm.fromScene(room, 0.03).texture;
    pm.dispose();
    return tex;
  }

  var wireMaterial = new T.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.9 });
  var previewMaterial = new T.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.55 });
  var modelMeshes = []; // THREE.Mesh per build output entry, in the same order
  var modelData = [];   // build output: { name, positions, shade }
  var previewMesh = null;

  // ---------------------------------------------------------------------------
  // 4. Build, geometry helpers and parts
  // ---------------------------------------------------------------------------
  var rebuildQueued = false;
  var slidingTimer = 0;
  function settleSliding() { // the slider has stopped: do the paint-part analysis that was skipped
    clearTimeout(slidingTimer);
    if (!sliding) return;
    sliding = false;
    refreshColors();
    renderPartList();
  }
  var sliding = false; // a parameter slider is being dragged: rebuilds skip the (slow) paint-part analysis while nothing is painted
  function scheduleRebuild() {
    if (rebuildQueued) return;
    rebuildQueued = true;
    requestAnimationFrame(function () {
      rebuildQueued = false;
      rebuild();
    });
  }

  // Plate placement: the plate is centred on the origin and sized by the model's reach (plateFor), so every model is moved
  // to sit centred in x and z and rest on y = 0, whatever coordinates build() used. The view, plate, exports, print check
  // and Workshop see the placed model; the generator keeps working in its own coordinates (pick and hover points are moved
  // back by placeOffset, setPreview geometry is moved forward). Copies are made: a generator may reuse its arrays.
  var placeOffset = [0, 0, 0];
  function placed(entries, offset) {
    var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    entries.forEach(function (e) {
      var p = e.positions;
      for (var i = 0; i < p.length; i += 3) for (var k = 0; k < 3; k++) { if (p[i + k] < min[k]) min[k] = p[i + k]; if (p[i + k] > max[k]) max[k] = p[i + k]; }
    });
    if (!isFinite(min[0])) return { entries: entries, offset: offset || [0, 0, 0] };
    var off = offset || [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2];
    if (Math.abs(off[0]) < 1e-6 && Math.abs(off[1]) < 1e-6 && Math.abs(off[2]) < 1e-6) return { entries: entries, offset: off };
    return { offset: off, entries: entries.map(function (e) {
      var c = Object.assign({}, e), p = c.positions = new Float32Array(e.positions);
      for (var i = 0; i < p.length; i += 3) { p[i] += off[0]; p[i + 1] += off[1]; p[i + 2] += off[2]; }
      return c;
    }) };
  }
  // The world-space shift of the placed model (a generator may turn modelGroup, as Gift Box 2.0's turntable does).
  function placeShift() { return new T.Vector3(placeOffset[0], placeOffset[1], placeOffset[2]).applyQuaternion(modelGroup.quaternion); }
  // A pick for the generator's handlers, in build() coordinates.
  function buildHit(hit) {
    if (!hit) return hit;
    var h = Object.assign({}, hit);
    h.point = hit.point.clone().sub(placeShift());
    return h;
  }

  function rebuild() {
    applyShowIf();
    // Once the model is sculpted it stays where it is on the plate, so it does not jump under the cursor.
    var place = placed(cfg.build(params, api) || [], cfg.sculpt && SC.edited() ? placeOffset : null);
    placeOffset = place.offset;
    var output = place.entries;
    if (cfg.sculpt) {
      // Work on copies: a generator may keep and reuse its arrays between builds.
      output = output.map(function (e) { var c = Object.assign({}, e); c.positions = e.positions.slice(); return c; });
      if (cfg.sculpt.apply) output = cfg.sculpt.apply(output);
      SC.applyStrokes(output);
      output = SC.split(output);
    }
    modelData = output;
    printCache = null;

    modelMeshes.forEach(function (m) { modelGroup.remove(m); m.geometry.dispose(); });
    var normalsFor = groupedNormals(output);
    modelMeshes = output.map(function (entry, entryIndex) {
      var geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.BufferAttribute(entry.positions, 3));
      geometry.setAttribute('normal', new T.BufferAttribute(normalsFor[entryIndex], 3));
      geometry.setAttribute('color', new T.BufferAttribute(new Float32Array(entry.positions.length), 3));
      geometry.computeBoundingSphere();
      var mesh = new T.Mesh(geometry, currentModelMaterial(entry.name || 'body'));
      mesh.name = entry.name || 'body';
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      modelGroup.add(mesh);
      return mesh;
    });

    parts = null;
    if (paints.length) ensureParts();
    refreshColors();
    if (!sliding || paints.length) renderPartList();
    updateStats();
    rebuildWire();
    if (activeTab === 'print') updatePrintLook();
    updateShowcase();
    postEmbedModel();
    schedulePrintCheck();
    if (cfg.sculpt) SC.refresh();
  }

  // ---------------------------------------------------------------------------
  // Print check: after the sliders settle, the finished model is sliced the way a printer would (floating parts,
  // overhangs steeper than about 50 degrees, walls thinner than a nozzle) by shared/print-check.js. The chip in the
  // viewport says whether the model needs supports; click it for what and where. cfg.printCheck = false turns it off.
  // ---------------------------------------------------------------------------
  var CORE_SRC = (document.currentScript && document.currentScript.src) || '';
  var printCheckTimer = null, printCheckSeq = 0, printCheckSlow = 0, printMarks = null, printListOpen = false, printResult = null;

  function withPrintChecker(cb) {
    if (window.MM_PRINT_CHECK) return cb(window.MM_PRINT_CHECK);
    if (!CORE_SRC) return;
    var s = document.createElement('script');
    s.src = CORE_SRC.replace(/generator-core\.js(\?.*)?$/, 'print-check.js');
    s.onload = function () { if (window.MM_PRINT_CHECK) cb(window.MM_PRINT_CHECK); };
    document.head.appendChild(s);
  }

  // The check takes seconds on a big model, so it runs in a background worker and the page keeps responding. The worker is
  // made from the check's own code, so this also works in the standalone download. No worker: it runs on the page as before.
  var printWorker = null, printWorkerBusy = false, printWorkerFailed = false;
  function runPrintWorker(PC, seq) {
    if (printWorkerFailed || typeof Worker === 'undefined' || typeof Blob === 'undefined') return false;
    try {
      if (!printWorker) {
        var src = 'var chamfer = ' + PC.chamfer.toString() + ';\nvar check = ' + PC.check.toString() + ';\n' +
          'onmessage = function (e) { var r = null; try { r = check(e.data.entries, e.data.opt); } catch (err) { r = null; } postMessage({ seq: e.data.seq, res: r }); };';
        var url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        printWorker = new Worker(url);
        URL.revokeObjectURL(url);
        printWorker.onmessage = function (e) {
          printWorkerBusy = false;
          if (e.data.seq === printCheckSeq) showPrintResult(e.data.res);
        };
        printWorker.onerror = function () {
          printWorkerFailed = true; printWorkerBusy = false; printWorker = null;
          schedulePrintCheck();
        };
      }
      printWorkerBusy = true;
      printWorker.postMessage({ seq: seq, opt: cfg.printCheckOptions || {}, entries: printEntries().map(function (e) { return { name: e.name, positions: e.positions }; }) });
      return true;
    } catch (err) {
      printWorkerFailed = true; printWorkerBusy = false; printWorker = null;
      return false;
    }
  }

  function schedulePrintCheck() {
    if (EMBED || cfg.printCheck === false) return;
    var seq = ++printCheckSeq, box = $('mm-printcheck');
    if (printCheckTimer) clearTimeout(printCheckTimer);
    clearPrintMarks();
    if (printWorkerBusy && printWorker) { printWorker.terminate(); printWorker = null; printWorkerBusy = false; } // its answer is out of date
    if (cfg.sculpt && activeTab === 'sculpt') { if (box) box.hidden = true; return; } // checked once, on leaving the tab
    if (box) { box.hidden = false; $('mm-printchip').className = 'mm-printchip is-busy'; $('mm-printchip').textContent = 'Print check...'; }
    printCheckTimer = setTimeout(function () {
      withPrintChecker(function (PC) {
        if (seq !== printCheckSeq) return;
        if (runPrintWorker(PC, seq)) return;
        var t0 = Date.now(), res;
        try { res = PC.check(printEntries(), cfg.printCheckOptions || {}); } catch (e) { res = null; }
        printCheckSlow = Date.now() - t0 > 1500 ? 1500 : 0; // a slow model waits longer before it is checked again
        if (seq !== printCheckSeq) return;
        showPrintResult(res);
      });
    }, 450 + printCheckSlow);
  }

  function clearPrintMarks() {
    if (!printMarks) return;
    scene.remove(printMarks);
    printMarks.children.forEach(function (m) { m.geometry.dispose(); m.material.dispose(); });
    printMarks = null;
  }

  function showPrintResult(res) {
    var chip = $('mm-printchip'), list = $('mm-printlist'), box = $('mm-printcheck');
    printResult = res;
    if (!res || res.skipped) { box.hidden = true; return; }
    var errors = res.issues.filter(function (i) { return i.severity === 'error'; }).length;
    chip.className = 'mm-printchip ' + (errors ? 'is-bad' : res.issues.length ? 'is-warn' : 'is-ok');
    chip.textContent = errors ? 'Needs supports (' + res.issues.length + ')' : res.issues.length ? 'Print warning (' + res.issues.length + ')' : 'No supports needed';
    list.textContent = '';
    if (!res.issues.length) list.appendChild(el('p', { class: 'mm-printnote', text: 'No floating parts, no overhang steeper than about 50° and no wall thinner than 0.8 mm. This is a software estimate, not a guarantee.' }));
    res.issues.forEach(function (i) {
      var label = i.kind === 'floating' ? 'Floating part' : i.kind === 'overhang' ? 'Overhang' : 'Thin wall';
      list.appendChild(el('div', { class: 'mm-printissue is-' + i.severity }, [el('strong', { text: label }), el('span', { text: i.message })]));
    });
    if (res.issues.length) list.appendChild(el('p', { class: 'mm-printnote', text: 'Red dots in the 3D view show where. Turn on supports in your slicer, or change the settings until the check is green.' }));
    if (res.issues.length) {
      printMarks = new T.Group();
      (res.spots || []).slice(0, 40).forEach(function (sp) {
        var m = new T.Mesh(new T.SphereGeometry(Math.max(1.2, Math.min(4, Math.sqrt(sp.area) / 2.2)), 12, 8), new T.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.55, depthTest: false }));
        m.position.set(sp.x, sp.y, sp.z);
        m.renderOrder = 5;
        printMarks.add(m);
      });
      printMarks.visible = !printOn() || (activeTab === 'print' && printShowing());   // the marks are in print-plate coordinates
      scene.add(printMarks);
    }
  }

  function togglePrintList() {
    printListOpen = !printListOpen;
    $('mm-printlist').hidden = !printListOpen;
    $('mm-printchip').setAttribute('aria-expanded', printListOpen ? 'true' : 'false');
  }

  // Workshop embed (?embed=workshop): the page shows only the controls (no header, 3D view or Color / Print tabs) and sends the built model to the parent
  // after every rebuild, so the Workshop can place and edit it. The parent can send { type: 'mm-set-params', params, state }.
  // A generator with state outside its parameters (stamps) can add cfg.embedState = { get(), set(v) } so that state round-trips.
  var EMBED = /[?&]embed=workshop\b/.test(location.search);
  if (EMBED) document.body.classList.add('mm-embed');
  function postEmbedModel() {
    if (!EMBED || window.parent === window) return;
    window.parent.postMessage({ type: 'mm-model', params: JSON.parse(JSON.stringify(params)),
      state: cfg.embedState ? JSON.parse(JSON.stringify(cfg.embedState.get())) : null,
      parts: modelData.map(function (e) { return { name: e.name || 'body', positions: e.positions.slice() }; }) }, '*');
  }
  if (EMBED) window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data) return;
    if (e.data.type === 'mm-pick') {   // a click on the model in the Workshop's own view, in this page's coordinates
      var handler = tabHandlers(), d = e.data;
      if (handler && typeof handler.onPick === 'function') {
        handler.onPick({ point: new T.Vector3(d.point[0] - placeOffset[0], d.point[1] - placeOffset[1], d.point[2] - placeOffset[2]), normal: new T.Vector3(d.normal[0], d.normal[1], d.normal[2]), meshName: d.meshName, part: null }, api);
      }
      return;
    }
    if (e.data.type !== 'mm-set-params') return;
    if (cfg.embedState && e.data.state) cfg.embedState.set(e.data.state);   // generator-specific extras such as placed stamps
    setParams(e.data.params || {});
  });

  // View modes: 'solid', 'wire' (triangle edges only) and 'edges' (solid with edges on top).
  // The wire lines are only built while a mode needs them. Painting always shows the solid.
  function effectiveViewMode() {
    return activeTab === 'color' || activeTab === 'print' ? 'solid' : viewMode;
  }

  function currentModelMaterial(name) {
    if (showcaseOn()) return showcaseMaterial(name);
    if (activeTab === 'print') return printMaterial;
    return lightMode === 'flat' ? flatMaterial : modelMaterial;
  }

  function setLightMode(mode) {
    lightMode = mode === 'flat' ? 'flat' : 'soft';
    try { localStorage.setItem(LIGHT_STORE, lightMode); } catch (e) { /* storage blocked */ }
    var sel = $('mm-light-modes');
    if (sel) sel.value = lightMode;
    applyLighting();
    applyModelMaterial();
    rebuildWire();
  }

  // cfg.printMeshes(params, api, built) returns the meshes that are really printed when they differ from the display
  // pose (a ring shown assembled, printed as parts on the plate). Exports, the print check and the Print tab use them.
  var printCache = null, printView = null, printViewFor = null;
  function printEntries() {
    if (!printOn()) return modelData;
    if (!printCache) printCache = placed(cfg.printMeshes(params, api, modelData) || []).entries;
    return printCache;
  }

  function colorForKind(kind) {
    ensureParts();
    var found = parts.filter(function (p) { return p.kind === kind; })[0];
    return (found && (found.color || found.def)) || DEFAULT_COLOR;
  }

  function updatePrintView() {
    if (!cfg.printMeshes) return;
    var on = activeTab === 'print' && printShowing();
    modelGroup.visible = !on;
    if (printView && (!on || printViewFor !== printEntries())) {
      scene.remove(printView);
      printView.children.forEach(function (m) { m.geometry.dispose(); });
      printView = null;
    }
    if (printMarks) printMarks.visible = printOn() ? on : true;
    if (!on) { updateStats(); return; }
    if (!printView) {
      printViewFor = printEntries();
      printView = new T.Group();
      var normals = groupedNormals(printViewFor), min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      printViewFor.forEach(function (entry, i) {
        var g = new T.BufferGeometry(), n = entry.positions.length, colors = new Float32Array(n), c = new T.Color(colorForKind(entry.name));
        for (var v = 0; v < n; v += 3) {
          colors[v] = c.r; colors[v + 1] = c.g; colors[v + 2] = c.b;
          for (var k = 0; k < 3; k++) { min[k] = Math.min(min[k], entry.positions[v + k]); max[k] = Math.max(max[k], entry.positions[v + k]); }
        }
        g.setAttribute('position', new T.BufferAttribute(entry.positions, 3));
        g.setAttribute('normal', new T.BufferAttribute(normals[i], 3));
        g.setAttribute('color', new T.BufferAttribute(colors, 3));
        var mesh = new T.Mesh(g, printMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        printView.add(mesh);
      });
      scene.add(printView);
      setPlateSize(plateFor(Math.max(-min[0], max[0], -min[2], max[2])));
      $('mm-stats').textContent = 'Geometry ready // ' + Math.round(printViewFor.reduce(function (n, e) { return n + e.positions.length / 9; }, 0)).toLocaleString() + ' triangles';
      $('mm-dims').textContent = (max[0] - min[0]).toFixed(1) + ' x ' + (max[2] - min[2]).toFixed(1) + ' x ' + (max[1] - min[1]).toFixed(1) + ' MM // ' + plateSize + ' MM BED';
    }
  }

  // ---------------------------------------------------------------------------
  // Showcase render (cfg.showcase = { tab, materials: { meshName: 'metal' | 'gem' }, look(params) }): while that tab is
  // open the model is shown as jewellery, with polished metal, faceted stones and a slow turntable on a dark stage.
  // Preview only: exports never change. look() returns { metal: '#hex', roughness, gem: '#hex' }.
  // ---------------------------------------------------------------------------
  var jewel = null, showcaseSpin = true;
  function showcaseOn() { return !!cfg.showcase && !EMBED && activeTab === cfg.showcase.tab; }

  function makeJewelEnv() {
    var room = new T.Scene();
    room.background = new T.Color(0x0e0e0e);
    function panel(w, h, d, x, y, z, level) {
      var m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshBasicMaterial({ color: new T.Color(level, level, level) }));
      m.position.set(x, y, z);
      room.add(m);
    }
    panel(60, 2, 60, 0, 48, 0, 7);
    panel(2, 60, 14, 48, 10, 18, 7);
    panel(2, 60, 14, -48, 10, -18, 6);
    panel(10, 60, 2, -22, 10, 48, 5);
    panel(10, 60, 2, 26, 10, -48, 5);
    panel(70, 1, 70, 0, -40, 0, 0.35);
    var pm = new T.PMREMGenerator(renderer);
    var tex = pm.fromScene(room, 0.012).texture;
    pm.dispose();
    return tex;
  }

  function ensureJewel() {
    if (jewel) return jewel;
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    var g2 = cv.getContext('2d'), grad = g2.createRadialGradient(256, 200, 20, 256, 256, 400);
    grad.addColorStop(0, '#2c2f3c');
    grad.addColorStop(0.55, '#14151d');
    grad.addColorStop(1, '#06070b');
    g2.fillStyle = grad;
    g2.fillRect(0, 0, 512, 512);
    var pedestal = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 96), new T.MeshStandardMaterial({ color: 0x101118, roughness: 0.42, metalness: 0 }));
    pedestal.receiveShadow = true;
    pedestal.visible = false;
    scene.add(pedestal);
    var env = makeJewelEnv();
    pedestal.material.envMap = env;
    pedestal.material.envMapIntensity = 0.35;
    jewel = {
      background: new T.CanvasTexture(cv),
      pedestal: pedestal,
      metal: new T.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12, envMap: env, envMapIntensity: 1.25 }),
      gem: new T.ShaderMaterial({
        extensions: { derivatives: true },
        uniforms: { uTint: { value: new T.Color(0xffffff) } },
        vertexShader: 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: [
          'uniform vec3 uTint; varying vec3 vW;',
          'float lights(vec3 d) {',   // a studio of strip lights: high contrast is what makes a stone sparkle
          '  float a = atan(d.z, d.x), e = asin(clamp(d.y, -1.0, 1.0));',
          '  float strips = smoothstep(0.45, 0.95, sin(a * 9.0 + e * 5.0)) * smoothstep(-0.5, 0.5, d.y);',
          '  float bars = smoothstep(0.72, 0.98, sin(e * 13.0 + a * 2.0));',
          '  return 0.14 + 1.9 * strips + 0.8 * bars + 1.7 * smoothstep(0.6, 0.95, d.y);',
          '}',
          'vec3 pavilion(vec3 d, float side) {',   // reflect off the nearest of 16 pavilion facets
          '  float step_ = 6.2831853 / 16.0;',
          '  float c = (floor(atan(d.z, d.x) / step_) + 0.5) * step_;',
          '  vec3 n = normalize(vec3(cos(c) * 0.66, side, sin(c) * 0.66));',
          '  return reflect(d, n);',
          '}',
          'float trace(vec3 v, vec3 n, float ior) {',
          '  vec3 t = refract(-v, n, 1.0 / ior);',
          '  t = pavilion(t, -0.75);',
          '  t = pavilion(t, -0.75);',
          '  return lights(normalize(t));',
          '}',
          'void main() {',
          '  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));',   // flat per facet, whatever the vertex normals say
          '  vec3 v = normalize(cameraPosition - vW);',
          '  if (dot(n, v) < 0.0) n = -n;',
          '  float f = 0.17 + 0.83 * pow(1.0 - max(dot(n, v), 0.0), 5.0);',
          '  vec3 inside = vec3(trace(v, n, 2.38), trace(v, n, 2.42), trace(v, n, 2.47));',
          '  vec3 col = uTint * inside + vec3(lights(reflect(-v, n))) * f;',
          '  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);',
          '}'
        ].join('\n')
      })
    };
    return jewel;
  }

  function showcaseMaterial(name) {
    var j = ensureJewel();
    return (cfg.showcase.materials || {})[name] === 'gem' ? j.gem : j.metal;
  }

  function updateShowcase() {
    if (!cfg.showcase || EMBED) return;
    var on = showcaseOn();
    if (!on && !jewel) return;
    var j = ensureJewel();
    if (on) {
      var look = cfg.showcase.look(params) || {};
      j.metal.color.set(look.metal || '#ffffff');
      j.metal.roughness = look.roughness === undefined ? 0.16 : look.roughness;
      j.gem.uniforms.uTint.value.set(look.gem || '#ffffff');
      var box = new T.Box3().setFromObject(modelGroup), size = box.isEmpty() ? 60 : box.getSize(new T.Vector3()).length();
      j.pedestal.scale.set(size * 1.1, 2, size * 1.1);
      j.pedestal.position.y = -1;
      scene.background = j.background;
      hemi.intensity = 0.3; key.intensity = 0.9; rim.intensity = 0;
    }
    j.pedestal.visible = on;
    plate.visible = !on;
    controls.autoRotate = on && showcaseSpin;
    controls.autoRotateSpeed = 1.1;
  }

  // Apply the Print tab's settings to the realistic render: material finish, layer lines, lighting.
  function updatePrintLook() {
    var on = activeTab === 'print';
    var look = PRINT_LOOKS[printSettings.material] || PRINT_LOOKS.PLA;
    var lh = 0.2;
    printMaterial.roughness = look.roughness;
    printMaterial.clearcoat = look.clearcoat;
    printMaterial.clearcoatRoughness = look.clearcoatRoughness;
    printMaterial.envMapIntensity = look.env;
    printUniforms.uLayer.value = lh;
    printUniforms.uStrength.value = Math.max(0.05, Math.min(0.32, 0.11 * lh / 0.2));
    if (on && !studioEnv) {
      try { studioEnv = makeStudioEnv(); } catch (e) { studioEnv = null; }
    }
    printMaterial.envMap = on ? studioEnv : null;
    printMaterial.needsUpdate = true;
    applyLighting();
    if (!cfg.customStage) {
      scene.background = new T.Color(on ? 0x161d2c : 0x0b1120);
      plateMesh.material.color.set(on ? 0x3a4250 : 0x1e293b);
      plateMesh.material.roughness = on ? 0.55 : 0.85;
      grid.visible = !on;
    }
    if (on) $('mm-hint').textContent = 'Realistic preview: ' + printSettings.material;
    updatePrintView();
    updateShowcase();
  }

  function applyModelMaterial() {
    modelMeshes.forEach(function (mesh) { mesh.material = currentModelMaterial(mesh.name); });
  }

  function rebuildWire() {
    wireGroup.children.slice().forEach(function (line) { wireGroup.remove(line); line.geometry.dispose(); });
    var mode = effectiveViewMode();
    modelMeshes.forEach(function (mesh) { mesh.visible = mode !== 'wire'; });
    modelMaterial.polygonOffset = mode === 'edges';
    modelMaterial.polygonOffsetFactor = 1;
    modelMaterial.polygonOffsetUnits = 1;
    if (mode === 'solid') {
      // Flat lighting: outline the creases so the form still reads without shading.
      if (lightMode === 'flat' && activeTab !== 'print' && !showcaseOn()) {
        var tris = 0;
        modelMeshes.forEach(function (mesh) { tris += mesh.geometry.attributes.position.count / 3; });
        if (tris <= EDGE_MAX_TRIS) modelMeshes.forEach(function (mesh) {
          wireGroup.add(new T.LineSegments(new T.EdgesGeometry(mesh.geometry, EDGE_CREASE_DEG), edgeMaterial));
        });
      }
      return;
    }
    modelMeshes.forEach(function (mesh) {
      wireGroup.add(new T.LineSegments(new T.WireframeGeometry(mesh.geometry), wireMaterial));
    });
    wireMaterial.opacity = mode === 'edges' ? 0.45 : 0.9;
  }

  function setViewMode(mode) {
    viewMode = mode;
    var sel = $('mm-view-modes');
    if (sel) sel.value = mode;
    rebuildWire();
  }

  // Meshes with the same `smoothGroup` are shaded as one surface, so splitting a surface into
  // two entries (for example to paint a region on its own) leaves no seam in the lighting.
  function groupedNormals(entries) {
    var groups = {};
    entries.forEach(function (entry, i) {
      var key = entry.smoothGroup || ('mesh-' + i);
      (groups[key] = groups[key] || []).push(i);
    });
    var normalsFor = [];
    Object.keys(groups).forEach(function (key) {
      var members = groups[key];
      var total = 0;
      members.forEach(function (i) { total += entries[i].positions.length; });
      var merged = new Float32Array(total);
      var offset = 0;
      members.forEach(function (i) {
        merged.set(entries[i].positions, offset);
        offset += entries[i].positions.length;
      });
      var normals = cfg.creaseShading ? creaseNormals(merged, cfg.creaseShading) : smoothNormals(merged);
      offset = 0;
      members.forEach(function (i) {
        normalsFor[i] = normals.slice(offset, offset + entries[i].positions.length);
        offset += entries[i].positions.length;
      });
    });
    return normalsFor;
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

  // Like smoothNormals, but a vertex only blends the faces within `degrees` of the face being shaded, so flat tops
  // and straight walls keep crisp edges while curved outlines stay smooth (opt in with cfg.creaseShading).
  function creaseNormals(positions, degrees) {
    var count = positions.length / 3, triCount = count / 3;
    var ids = weldIds(positions);
    var cosLimit = Math.cos(degrees * Math.PI / 180);
    var fn = new Float32Array(triCount * 3), at = {}, t, v, n, len, id;
    for (t = 0; t < triCount; t++) {
      n = faceNormalAt(positions, t * 9);
      len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
      if (len < 1e-12) continue; // degenerate sliver: contributes nothing
      fn[t * 3] = n[0] / len; fn[t * 3 + 1] = n[1] / len; fn[t * 3 + 2] = n[2] / len;
      for (v = 0; v < 3; v++) { id = ids[t * 3 + v]; (at[id] = at[id] || []).push(t); }
    }
    var normals = new Float32Array(positions.length), list, k, u, sx, sy, sz, d, w;
    for (t = 0; t < triCount; t++) {
      for (v = 0; v < 3; v++) {
        list = at[ids[t * 3 + v]] || [];
        sx = fn[t * 3]; sy = fn[t * 3 + 1]; sz = fn[t * 3 + 2];
        if (sx === 0 && sy === 0 && sz === 0) sx = 1;
        for (k = 0; k < list.length; k++) {
          u = list[k];
          if (u === t) continue;
          d = fn[t * 3] * fn[u * 3] + fn[t * 3 + 1] * fn[u * 3 + 1] + fn[t * 3 + 2] * fn[u * 3 + 2];
          if (d >= cosLimit) { sx += fn[u * 3]; sy += fn[u * 3 + 1]; sz += fn[u * 3 + 2]; }
        }
        w = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
        normals[(t * 3 + v) * 3] = sx / w; normals[(t * 3 + v) * 3 + 1] = sy / w; normals[(t * 3 + v) * 3 + 2] = sz / w;
      }
    }
    return normals;
  }


  // Returns one id per vertex. Vertices at the same position (to 0.01 mm) share an id.

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

      // A mesh entry flagged singlePart is one paintable part (e.g. all teeth together).
      if (entry.singlePart) {
        for (var sp = 1; sp < triCount; sp++) {
          var spa = find(sp), spb = find(0);
          if (spa !== spb) parent[spa] = spb;
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
          def: entry.color || null,
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


  // Largest part of a mesh gets the mesh name; the rest are numbered.
  function labelFor(kind, index, triangleCount) {
    var name = cfg.partNames && cfg.partNames[kind] ? cfg.partNames[kind] : kind;
    var label = index === 0 ? name : 'Part ' + (index + 1);
    return label + ' · ' + triangleCount.toLocaleString() + ' tris';
  }

  var colorsHidden = false; // Parametric view only: the Colors button in the viewport turns part colors off
  function toggleColors() {
    colorsHidden = !colorsHidden;
    $('mm-colors-toggle').setAttribute('aria-pressed', String(!colorsHidden));
    refreshColors();
  }

  // Writes the colors for the current tab. Parametric, Color and Print show the part colors and paint; other tabs show the neutral model.
  function refreshColors() {
    var colorTab = (activeTab === 'model' && !colorsHidden) || activeTab === 'color' || activeTab === 'print' || (cfg.coloredTabs || []).indexOf(activeTab) >= 0; // Print preview (and cfg.coloredTabs) show the painted colors too
    var quick = colorTab && sliding && !parts && !paints.length; // dragging a slider on an unpainted model: each mesh gets its entry color, no part analysis
    if (colorTab && !quick) ensureParts();
    modelMeshes.forEach(function (mesh, meshIndex) {
      var colorAttr = mesh.geometry.attributes.color;
      var data = colorAttr.array;
      var shade = modelData[meshIndex].shade;
      var triCount = data.length / 9;
      var base = new T.Color(NEUTRAL_MODEL_COLOR);
      var quickColor = quick ? new T.Color(modelData[meshIndex].color || DEFAULT_COLOR) : null;
      for (var t = 0; t < triCount; t++) {
        var c = base;
        if (quick) {
          c = quickColor;
        } else if (colorTab) {
          c = new T.Color(parts[globalPartIndex(meshIndex, t)].color || parts[globalPartIndex(meshIndex, t)].def || DEFAULT_COLOR);
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
    if (tris) setPlateSize(plateFor(Math.max(-min[0], max[0], -min[2], max[2])));
    $('mm-stats').textContent = 'Geometry ready // ' + Math.round(tris).toLocaleString() + ' triangles';
    $('mm-dims').textContent = size[0].toFixed(1) + ' x ' + size[2].toFixed(1) + ' x ' + size[1].toFixed(1) + ' MM // ' + plateSize + ' MM BED';
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
    previewGroup.position.copy(placeShift());   // preview geometry is in build() coordinates, like the picks
    previewGroup.add(previewMesh);
  }

  function centerCamera(mode) {
    var box = new T.Box3().setFromObject(printView && printView.visible && activeTab === 'print' ? printView : modelGroup);
    var center = box.isEmpty() ? new T.Vector3(0, cfg.targetHeight || 40, 0) : box.getCenter(new T.Vector3());
    var size = box.isEmpty() ? 120 : Math.max(box.getSize(new T.Vector3()).length(), cfg.minFrame || 120);
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
      part: part,
      meshIndex: meshIndex,
      faceIndex: hit.faceIndex
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
    var h = tabHandlers();
    if (h && typeof h.onHover === 'function') h.onHover(buildHit(pickAt(e.clientX, e.clientY)), api);
  });

  renderer.domElement.addEventListener('pointerleave', function () {
    if (typeof cfg.onHover === 'function') cfg.onHover(null, api);
    dom.extraTabs.forEach(function (t) { if (typeof t.cfg.onHover === 'function') t.cfg.onHover(null, api); });
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
    var picker = tabHandlers();
    if (picker && typeof picker.onPick === 'function') picker.onPick(buildHit(hit), api);
  });

  // ---------------------------------------------------------------------------
  // 6. Tabs, toast, export
  // ---------------------------------------------------------------------------
  var activeTab = (cfg.hideModelTab || cfg.tabsFirst) && cfg.tabs && cfg.tabs.length ? cfg.tabs[0].id : 'model';

  // Crosshair only where a click places something. Painting uses a pointer, plain orbiting a grab hand.
  function updateCursor() {
    var tool = tabHandlers();
    var cursor = activeTab === 'color' ? 'pointer' : activeTab === 'print' ? 'grab' : (tool && typeof tool.onPick === 'function' ? 'crosshair' : 'grab');
    renderer.domElement.style.cursor = cursor;
  }

  function setTab(tab) {
    var wasPrint = activeTab === 'print', wasSculpt = activeTab === 'sculpt';
    activeTab = tab;
    if (cfg.partEdit && SC) SC.resetForTab(tab);
    var isColor = tab === 'color';
    dom.tabModel.setAttribute('aria-selected', String(tab === 'model'));
    dom.tabColor.setAttribute('aria-selected', String(isColor));
    dom.tabPrint.setAttribute('aria-selected', String(tab === 'print'));
    dom.modelBody.hidden = tab !== 'model';
    dom.colorBody.hidden = !isColor;
    dom.printBody.hidden = tab !== 'print';
    dom.extraTabs.forEach(function (t) {
      t.btn.setAttribute('aria-selected', String(t.id === tab));
      t.body.hidden = t.id !== tab;
    });
    var current = tabHandlers();
    $('mm-hint').textContent = isColor
      ? 'Click a part to paint it'
      : (current && current.hint) || (cfg.partEdit && tab === 'model' ? 'Tap a part to edit it, drag it to move it. Empty space orbits' : 'Drag or touch-swipe to orbit 3D mesh');
    // Placement tools (stamps, carving) belong to their own tab: clear their preview and cursor here.
    if (tab !== 'model' && typeof cfg.onHover === 'function') cfg.onHover(null, api);
    dom.extraTabs.forEach(function (t) { if (t.id !== tab && typeof t.cfg.onHover === 'function') t.cfg.onHover(null, api); });
    if (cfg.sculpt) {
      if (tab !== 'sculpt') SC.brushAt(null);
      if (tab === 'sculpt' || wasSculpt) schedulePrintCheck();
      SC.refresh();
    }
    $('mm-colors-toggle').hidden = tab !== 'model';
    updateCursor();
    if (isColor || tab === 'model' || tab === 'print' || (cfg.coloredTabs || []).indexOf(tab) >= 0) ensureParts();
    applyModelMaterial();
    updatePrintLook();
    refreshColors();
    renderPartList();
    rebuildWire();
    if (printOn() && (tab === 'print' || wasPrint)) centerCamera('iso');
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
    printEntries().forEach(function (entry) {
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

  // Colored OBJ: name.obj + name.mtl in one zip. One named material per distinct color (usemtl groups), which
  // Bambu Studio / OrcaSlicer / PrusaSlicer offer to map to filaments. Only the Color-tab colors are written,
  // never slicer print settings.
  function exportObj() {
    ensureParts();
    // Same Y-up -> Z-up mapping and bed offset as the STL export.
    var minY = Infinity;
    printEntries().forEach(function (entry) {
      var p = entry.positions;
      for (var i = 1; i < p.length; i += 3) if (p[i] < minY) minY = p[i];
    });
    if (!isFinite(minY)) minY = 0;

    var colorIndex = {};
    var colorList = [];
    var verts = [];
    var tris = [];
    var vertexOffset = 0;

    printEntries().forEach(function (entry, meshIndex) {
      var p = entry.positions;
      var triCount = p.length / 9;
      var localVerts = {};
      var localIndex = 0;

      function vertexId(x, y, z) {
        var key = x.toFixed(4) + ',' + y.toFixed(4) + ',' + z.toFixed(4);
        if (localVerts[key] === undefined) {
          localVerts[key] = localIndex++;
          verts.push('v ' + x.toFixed(4) + ' ' + (-z).toFixed(4) + ' ' + (y - minY).toFixed(4));
        }
        return localVerts[key] + vertexOffset + 1;
      }

      for (var t = 0; t < triCount; t++) {
        var b = t * 9;
        var part = printOn() ? null : parts[globalPartIndex(meshIndex, t)];
        var color = (part ? part.color || part.def || DEFAULT_COLOR : colorForKind(entry.name)).toUpperCase();
        if (colorIndex[color] === undefined) {
          colorIndex[color] = colorList.length;
          colorList.push(color);
        }
        tris.push({
          c: colorIndex[color],
          v: [vertexId(p[b], p[b + 1], p[b + 2]), vertexId(p[b + 3], p[b + 4], p[b + 5]), vertexId(p[b + 6], p[b + 7], p[b + 8])]
        });
      }
      vertexOffset += localIndex;
    });

    // Group faces by color: one usemtl block per color.
    tris.sort(function (a, b) { return a.c - b.c; });
    var name = safeFileName($('mm-file-name').value);
    var lines = ['# ' + cfg.title + ' - Maker Makers', 'mtllib ' + name + '.mtl', 'o ' + name].concat(verts);
    var current = -1;
    tris.forEach(function (t) {
      if (t.c !== current) {
        current = t.c;
        lines.push('g color_' + colorList[t.c].replace('#', ''));
        lines.push('usemtl color_' + colorList[t.c].replace('#', ''));
      }
      lines.push('f ' + t.v[0] + ' ' + t.v[1] + ' ' + t.v[2]);
    });

    var mtl = ['# Maker Makers colors'].concat(colorList.map(function (c) {
      var r = parseInt(c.slice(1, 3), 16) / 255, g = parseInt(c.slice(3, 5), 16) / 255, bl = parseInt(c.slice(5, 7), 16) / 255;
      var rgb = r.toFixed(4) + ' ' + g.toFixed(4) + ' ' + bl.toFixed(4);
      return 'newmtl color_' + c.replace('#', '') + '\nKa ' + rgb + '\nKd ' + rgb + '\nKs 0 0 0\nd 1\nillum 1\n';
    })).join('\n');

    var files = [
      { name: name + '.obj', data: utf8(lines.join('\n') + '\n') },
      { name: name + '.mtl', data: utf8(mtl) }
    ];
    saveBlob(new Blob([makeZip(files)], { type: 'application/zip' }), name + '-obj.zip');
    toast('Saved ' + name + '-obj.zip with ' + colorList.length + (colorList.length === 1 ? ' color' : ' colors'));
  }





  // Standalone file: fetch this page, then inline the shared CSS and engine.
  function downloadStandalone() {
    var pageUrl = location.href;
    fetch(pageUrl).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (html) {
      var shared = ['export-utils.js', 'mesh-utils.js', 'generator-core.js'];
      var vendor = ['three.min.js', 'OrbitControls.js'];
      function text(url) { return fetch(url).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }); }
      return Promise.all([
        text(new URL('shared/generator.css', pageUrl)),
        text(new URL('shared/print-check.js', pageUrl)),
        Promise.all(shared.map(function (f) { return text(new URL('shared/' + f, pageUrl)); })),
        Promise.all(vendor.map(function (f) { return text(new URL('../vendor/three/' + f, pageUrl)); }))
      ]).then(function (sources) {
        var inlined = html
          .replace(/<link rel="stylesheet" href="shared\/generator\.css"\s*\/?>/, function () { return '<style>\n' + sources[0] + '\n</style>'; })
          .replace(/<link rel="stylesheet" href="\.\.\/vendor\/fonts\/fonts\.css">\s*/, '')
          .replace(/<script src="\.\.\/vendor\/three\/(three\.min|OrbitControls)\.js"><\/script>/g, function (m, name) {
            return '<script>\n' + sources[3][name === 'three.min' ? 0 : 1] + '\n<\/script>';
          })
          .replace(/<script src="shared\/export-utils\.js"><\/script>\s*<script src="shared\/mesh-utils\.js"><\/script>\s*<script src="shared\/generator-core\.js"><\/script>/, function () {
            return '<script>\n' + sources[1] + '\n' + sources[2].join('\n') + '\n<\/script>';
          });
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
    setSpin: function (on) { showcaseSpin = !!on; updateShowcase(); },
    toast: toast,
    centerCamera: centerCamera,
    sculpt: SC ? SC.state : { tool: 'select', edits: {}, strokes: [], undo: [], redo: [], sel: null, shift: null, draft: false },   // no sculpt.js: generators still read an empty state
    // Moves the Parametric controls (presets, groups, View) out of the hidden Parametric tab, for a generator tab's own menu.
    takeParams: function () {
      var f = document.createDocumentFragment();
      while (dom.modelBody.firstChild) f.appendChild(dom.modelBody.firstChild);
      return f;
    }
  };

  if (cfg.sculpt) SC.bindEvents();

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
    if (typeof cfg.onFrame === 'function') cfg.onFrame();
    renderer.render(scene, camera);
  }

  function init() {
    renderParametricPanel();
    renderColorPanel();
    renderPrintPanel();
    updateCursor();
    handleResize();
    rebuild();
    centerCamera('front');
    if (cfg.hideModelTab || cfg.tabsFirst) setTab(activeTab);
    window.MM_STAGE = { THREE: T, modelGroup: modelGroup, getModelData: function () { return modelData; },
      getEmbed: function () {   // read by the site's "Send to Workshop" button
        return { params: JSON.parse(JSON.stringify(params)), state: cfg.embedState ? JSON.parse(JSON.stringify(cfg.embedState.get())) : null,
          parts: modelData.map(function (e) { return { name: e.name || 'body', positions: e.positions.slice() }; }) };
      } };   // read by tools/hologram.html
    if (typeof cfg.onStage === 'function') cfg.onStage({ THREE: T, scene: scene, camera: camera, renderer: renderer, controls: controls, hemi: hemi, key: key, rim: rim, plateMesh: plateMesh, grid: grid, container: container, modelGroup: modelGroup });
    applyLighting();
    var lsel = $('mm-light-modes');
    if (lsel) lsel.value = lightMode;
    applyModelMaterial();
    rebuildWire();
    animate();
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
