// Homepage world map: every group in BUNDLES is a region on one big 2D grid, with generators as tiles
// inside it. The camera pans (drag, wheel, arrow keys) and zooms (pinch, Ctrl+wheel, +/-). Selecting a
// tile snaps the camera to it and opens a details panel; selecting it again opens the generator.
// Layout comes from `at` and `size` on each group in js/programs.js. See docs/homepage.md.

const WORLD = { CELL: 128, TILE: 112, GAP: 16, PAD: 8, MIN_K: 0.18, MAX_K: 2.4, AUTO_COLS: 16 };
const EMPTY_CELL_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect x='1.5' y='1.5' width='109' height='109' rx='14' fill='%23ffffff' fill-opacity='0.025' stroke='%23ffffff' stroke-opacity='0.16' stroke-width='1.5' stroke-dasharray='5 6'/%3E%3C/svg%3E\")";

const worldState = {
  regions: [],
  bounds: { w: 1, h: 1 },
  cam: { x: 0, y: 0, k: 1 },
  sel: null,        // { type: 'tile'|'empty'|'group', region, prog?, col?, row? }
  anim: null,
  size: { w: 1, h: 1 },
  ready: false,
  drawQueued: false
};

const wEl = {};

function worldClamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function worldReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

// ---------- layout ----------

function layoutWorld(groups) {
  const regions = groups.map(g => {
    const [w, rows] = g.size || [4, 1];
    return { group: g, w, h: Math.max(rows, Math.ceil(g.members.length / w)), x: null, y: null };
  });
  regions.forEach(r => { if (r.group.at) [r.x, r.y] = r.group.at; });

  // Groups with no `at` are packed into rows below everything that has a position.
  let cy = regions.reduce((m, r) => (r.x === null ? m : Math.max(m, r.y + r.h + 1)), 0);
  let cx = 0, rowH = 0;
  regions.filter(r => r.x === null).forEach(r => {
    if (cx + r.w > WORLD.AUTO_COLS) { cx = 0; cy += rowH; rowH = 0; }
    r.x = cx; r.y = cy; cx += r.w; rowH = Math.max(rowH, r.h + 1);
  });

  const C = WORLD.CELL;
  regions.forEach(r => {
    r.px = r.x * C - WORLD.PAD;
    r.py = r.y * C - WORLD.PAD;
    r.pw = r.w * C - WORLD.GAP + WORLD.PAD * 2;
    r.ph = (r.h + 1) * C - WORLD.GAP + WORLD.PAD * 2;
  });
  const maxX = Math.max(...regions.map(r => r.px + r.pw));
  const maxY = Math.max(...regions.map(r => r.py + r.ph));
  const minX = Math.min(...regions.map(r => r.px));
  const minY = Math.min(...regions.map(r => r.py));
  worldState.bounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  return regions;
}

// Pixel position of a tile cell in world space.
function cellRect(region, col, row) {
  const C = WORLD.CELL;
  return { x: region.x * C + col * C, y: region.y * C + (row + 1) * C, w: WORLD.TILE, h: WORLD.TILE };
}

// ---------- experimental view ----------

// Experimental view: tiles touch edge to edge and use artwork from assets/thumbnails/pro/. To add art for a
// generator, drop a PNG there named like its normal thumbnail (assets/thumbnails/ghost-builder.svg ->
// assets/thumbnails/pro/ghost-builder.png). Tiles without one keep their normal thumbnail.
function proThumbUrl(url) {
  return url.replace(/^(.*\/)?([^/]+)\.\w+$/, 'assets/thumbnails/pro/$2.png');
}

// Hover animation: assets/thumbnails/sprites/manifest.json maps a thumbnail's basename to a row of frames in a
// sprite sheet (see docs/sprite-sheet-skill.md). In the experimental view those tiles show frame 0 and play the
// frames while hovered or focused. Tiles missing from the manifest keep their still.
let spriteManifest = null;
const SPRITE_DIR = 'assets/thumbnails/sprites/';

function spriteLoad() {
  if (!spriteManifest) {
    spriteManifest = fetch(SPRITE_DIR + 'manifest.json').then(r => (r.ok ? r.json() : null)).catch(() => null);
  }
  return spriteManifest;
}

function spriteShow(span, frame) {
  const d = span._sprite, scale = span.clientWidth / d.m.tile;
  const sheet = d.m.sheets[d.entry.sheet];
  span.style.backgroundSize = `${sheet.width * scale}px ${sheet.height * scale}px`;
  span.style.backgroundPosition = `${-(frame * d.m.cell + d.m.inset) * scale}px ${-(d.entry.row * d.m.cell + d.m.inset) * scale}px`;
}

function spriteStop(tile) {
  const span = tile.querySelector('.tile-sprite');
  if (!span || !span._sprite) return;
  clearInterval(span._sprite.timer);
  span._sprite.timer = null;
  spriteShow(span, 0);
}

function spritePlay(tile) {
  const span = tile.querySelector('.tile-sprite');
  if (!span || !span._sprite || span._sprite.timer || worldReducedMotion()) return;
  const d = span._sprite;
  let frame = 0;
  const tick = () => { frame = (frame + 1) % d.m.frames; spriteShow(span, frame); };
  tick();
  d.timer = setInterval(tick, 1000 / d.m.fps);
}

function spriteApply(m) {
  wEl.canvas.querySelectorAll('.tile').forEach(tile => {
    const img = tile.querySelector('.tile-art img[data-std]');
    const entry = img && m.tiles[img.dataset.std.replace(/^.*\/([^/]+)\.\w+$/, '$1')];
    if (!entry || tile.querySelector('.tile-sprite')) return;
    const span = document.createElement('span');
    span.className = 'tile-sprite';
    span.setAttribute('aria-hidden', 'true');
    span.style.backgroundImage = `url(${SPRITE_DIR}${m.sheets[entry.sheet].file})`;
    span._sprite = { m, entry, timer: null };
    tile.querySelector('.tile-art').appendChild(span);
    tile.classList.add('has-sprite', 'has-pro');
    spriteShow(span, 0);
  });
}

function spriteRemove() {
  wEl.canvas.querySelectorAll('.tile.has-sprite').forEach(tile => {
    spriteStop(tile);
    tile.querySelector('.tile-sprite')?.remove();
    tile.classList.remove('has-sprite');
  });
}

function worldSetExperimental(on) {
  worldState.experimental = on;
  WORLD.TILE = on ? WORLD.CELL : 112;
  wEl.root.classList.toggle('exp', on);
  wEl.canvas.querySelectorAll('.tile-art img[data-std]').forEach(img => {
    const tile = img.closest('.tile');
    if (!on) { tile.classList.remove('has-pro'); img.src = img.dataset.std; return; }
    img.onload = () => { if (img.src.includes('/pro/')) tile.classList.add('has-pro'); };
    img.onerror = () => { img.onerror = null; tile.classList.remove('has-pro'); img.src = img.dataset.std; };
    img.src = img.dataset.pro;
  });
  if (on) spriteLoad().then(m => { if (m && worldState.experimental) spriteApply(m); });
  else spriteRemove();
  const btn = document.getElementById('world-exp-toggle');
  if (btn) btn.setAttribute('aria-pressed', on);
  try { localStorage.setItem('mm-exp-view', on ? '1' : '0'); } catch (e) {}
  worldSelect(null);
  worldRedraw();
}

// ---------- render ----------

function regionHTML(r) {
  const g = r.group;
  const filled = g.members.length;
  const total = r.w * r.h;
  const C = WORLD.CELL;
  const tiles = g.members.map((p, i) => {
    const col = i % r.w, row = Math.floor(i / r.w);
    const thumb = p.thumbnailUrl
      ? `<img src="${p.thumbnailUrl}" data-std="${p.thumbnailUrl}" data-pro="${proThumbUrl(p.thumbnailUrl)}" alt="" loading="lazy" draggable="false">`
      : '<span class="tile-empty">+</span>';
    const search = escapeHTML(`${p.title} ${p.category} ${p.description} ${g.name}`.toLowerCase());
    return `
      <button class="tile${col ? ' has-left' : ''}${row ? ' has-up' : ''}" type="button" data-id="${p.id}" data-search="${search}"
              style="left:${col * C}px; top:${row * C}px" aria-label="${escapeHTML(p.title)}, ${escapeHTML(g.name)}">
        <span class="tile-glow" aria-hidden="true"></span>
        <span class="tile-card">
          <span class="tile-art">${thumb}</span>
          <span class="tile-label">${escapeHTML(p.title)}</span>
        </span>
      </button>`;
  }).join('');

  return `
    <section class="region${g.planned ? ' planned' : ''}${filled ? '' : ' no-tiles'}" data-region="${g.id}"
             style="left:${r.px}px; top:${r.py}px; width:${r.pw}px; height:${r.ph}px; --accent:${g.accent || '#00e5ff'}">
      <div class="region-heat" aria-hidden="true"></div>
      <div class="region-inner" style="left:${WORLD.PAD}px; top:${WORLD.PAD}px; width:${r.w * C - WORLD.GAP}px; height:${(r.h + 1) * C - WORLD.GAP}px">
        <div class="region-head" data-act="group">
          <h3>${escapeHTML(g.name)}</h3>
          <span class="region-meta">${filled ? `${filled} / ${total}` : 'COMING SOON'}</span>
          <p>${escapeHTML(g.description || '')}</p>
        </div>
        <div class="region-slots" style="top:${C}px; width:${r.w * C - WORLD.GAP}px; height:${r.h * C - WORLD.GAP}px; background-image:${EMPTY_CELL_SVG}; background-size:${C}px ${C}px">
          ${tiles}
        </div>
      </div>
    </section>`;
}

function initWorldMap() {
  const groups = BUNDLES.filter(b => b.members.length || b.planned);
  worldState.regions = layoutWorld(groups);

  wEl.root = document.getElementById('world');
  wEl.vp = document.getElementById('world-viewport');
  wEl.canvas = document.getElementById('world-canvas');
  wEl.panel = document.getElementById('world-panel');
  wEl.mini = document.getElementById('world-minimap');
  wEl.search = document.getElementById('world-search');
  wEl.hint = document.getElementById('world-hint');

  wEl.canvas.innerHTML = worldState.regions.map(regionHTML).join('') + '<div class="cell-cursor" id="cell-cursor" hidden></div>';
  wEl.cursor = document.getElementById('cell-cursor');

  const filled = groups.reduce((n, g) => n + g.members.length, 0);
  const open = worldState.regions.reduce((n, r) => n + r.w * r.h - r.group.members.length, 0);
  document.getElementById('world-stats').textContent =
    `${filled} generators · ${groups.filter(g => g.members.length).length} groups · ${open} open slots`;

  const expBtn = document.getElementById('world-exp-toggle');
  const spriteTile = e => (worldState.experimental ? e.target.closest?.('.tile.has-sprite') : null);
  wEl.canvas.addEventListener('mouseover', e => { const t = spriteTile(e); if (t) spritePlay(t); });
  wEl.canvas.addEventListener('mouseout', e => {
    const t = spriteTile(e);
    if (t && !t.contains(e.relatedTarget)) spriteStop(t);
  });
  wEl.canvas.addEventListener('focusin', e => { const t = spriteTile(e); if (t) spritePlay(t); });
  wEl.canvas.addEventListener('focusout', e => { const t = spriteTile(e); if (t) spriteStop(t); });
  if (expBtn) expBtn.addEventListener('click', () => worldSetExperimental(!worldState.experimental));
  let wasOn = false;
  try { wasOn = localStorage.getItem('mm-exp-view') === '1'; } catch (e) {}
  if (wasOn) worldSetExperimental(true);

  bindWorldInput();
  new ResizeObserver(worldResized).observe(wEl.root);
  worldState.ready = true;
  worldState.needsHome = true;
  worldMapShown();
}

// The map fills the window between the header and the footer, so the disclaimer stays visible.
function worldSizeToWindow() {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const h = window.innerHeight - (header ? header.offsetHeight : 0) - (footer ? footer.offsetHeight : 0);
  wEl.root.style.height = `${Math.max(window.innerWidth <= 760 ? 540 : 360, h)}px`;
}

function worldResized() {
  const r = wEl.vp.getBoundingClientRect();
  if (!r.width) return;
  worldState.size = { w: r.width, h: r.height };
  worldRedraw();
}

// Called by the router each time the home screen is shown.
function worldMapShown() {
  if (!worldState.ready) return;
  worldSizeToWindow();
  worldResized();
  if (worldState.needsHome && worldState.size.w > 1) {
    worldState.needsHome = false;
    worldHome(true);
  }
}

window.addEventListener('resize', () => { if (wEl.root) worldMapShown(); });

// ---------- camera ----------

function worldApply() {
  const { x, y, k } = worldState.cam;
  wEl.canvas.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  wEl.root.classList.toggle('far', k < 0.5);
  worldDrawMinimap();
}

function worldRedraw() { worldApply(); }

function worldStopAnim() {
  if (worldState.anim) cancelAnimationFrame(worldState.anim);
  worldState.anim = null;
}

function worldCenterOf(cam) {
  const { w, h } = worldState.size;
  return { x: (w / 2 - cam.x) / cam.k, y: (h / 2 - cam.y) / cam.k };
}

function worldAnimateTo(target, ms = 650) {
  worldStopAnim();
  const from = { ...worldState.cam };
  if (worldReducedMotion() || ms === 0) { Object.assign(worldState.cam, target); worldApply(); return; }
  const { w, h } = worldState.size;
  const c0 = worldCenterOf(from), c1 = worldCenterOf(target);
  const t0 = performance.now();
  const step = now => {
    let t = Math.min(1, (now - t0) / ms);
    t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const k = from.k * Math.pow(target.k / from.k, t);
    const cx = c0.x + (c1.x - c0.x) * t, cy = c0.y + (c1.y - c0.y) * t;
    worldState.cam = { k, x: w / 2 - cx * k, y: h / 2 - cy * k };
    worldApply();
    worldState.anim = t < 1 ? requestAnimationFrame(step) : null;
  };
  worldState.anim = requestAnimationFrame(step);
}

// The area of the viewport not covered by the details panel.
function worldFreeArea() {
  const { w, h } = worldState.size;
  if (wEl.panel.hidden) return { w, h, cx: w / 2, cy: h / 2 };
  if (w > 760) return { w: w - 372, h, cx: (w - 372) / 2, cy: h / 2 };
  const free = h * 0.46;
  return { w, h: free, cx: w / 2, cy: free / 2 };
}

function worldFocusRect(rect, k, animate = true) {
  const area = worldFreeArea();
  const target = {
    k,
    x: area.cx - (rect.x + rect.w / 2) * k,
    y: area.cy - (rect.y + rect.h / 2) * k
  };
  if (animate) worldAnimateTo(target); else { worldStopAnim(); worldState.cam = target; worldApply(); }
}

function worldFitRect(rect, minK, maxK, animate) {
  const { w, h } = worldState.size;
  const k = worldClamp(Math.min((w - 80) / rect.w, (h - 120) / rect.h), minK, maxK);
  worldFocusRect(rect, k, animate);
}

function worldHome(instant) {
  const used = worldState.regions.filter(r => r.group.members.length);
  const list = used.length ? used : worldState.regions;
  const x0 = Math.min(...list.map(r => r.px)), y0 = Math.min(...list.map(r => r.py));
  const x1 = Math.max(...list.map(r => r.px + r.pw)), y1 = Math.max(...list.map(r => r.py + r.ph));
  worldFitRect({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, 0.35, 1, !instant);
}

function worldFitAll() {
  worldFitRect(worldState.bounds, WORLD.MIN_K, 1, true);
}

function worldZoomAt(sx, sy, newK) {
  const cam = worldState.cam;
  const k = worldClamp(newK, WORLD.MIN_K, WORLD.MAX_K);
  const wx = (sx - cam.x) / cam.k, wy = (sy - cam.y) / cam.k;
  cam.x = sx - wx * k; cam.y = sy - wy * k; cam.k = k;
  worldApply();
}

// ---------- selection ----------

function worldRegion(id) { return worldState.regions.find(r => r.group.id === id); }

function worldSelect(sel) {
  worldState.sel = sel;
  document.querySelectorAll('.tile.selected').forEach(t => t.classList.remove('selected'));
  document.querySelectorAll('.region.selected').forEach(t => t.classList.remove('selected'));
  wEl.cursor.hidden = true;
  if (!sel) { wEl.panel.hidden = true; wEl.root.classList.remove('has-selection'); return; }

  wEl.root.classList.add('has-selection');
  sel.region.el = sel.region.el || wEl.canvas.querySelector(`[data-region="${sel.region.group.id}"]`);
  sel.region.el.classList.add('selected');
  let rect, k = Math.min(2, Math.max(worldState.cam.k, 1.3));

  if (sel.type === 'tile') {
    const i = sel.region.group.members.indexOf(sel.prog);
    sel.col = i % sel.region.w; sel.row = Math.floor(i / sel.region.w);
    wEl.canvas.querySelector(`.tile[data-id="${sel.prog.id}"]`).classList.add('selected');
    rect = cellRect(sel.region, sel.col, sel.row);
  } else if (sel.type === 'empty') {
    rect = cellRect(sel.region, sel.col, sel.row);
    const c = wEl.cursor;
    c.style.left = `${rect.x}px`; c.style.top = `${rect.y}px`;
    c.style.setProperty('--accent', sel.region.group.accent);
    c.hidden = false;
  } else {
    const r = sel.region;
    rect = { x: r.px, y: r.py, w: r.pw, h: r.ph };
    k = null;
  }

  wEl.panel.hidden = false;
  worldRenderPanel();
  if (k === null) {
    const area = worldFreeArea();
    const kk = worldClamp(Math.min((area.w - 60) / rect.w, (area.h - 60) / rect.h), 0.4, 1.4);
    worldFocusRect(rect, kk);
  } else {
    worldFocusRect(rect, k);
  }
  wEl.hint.classList.add('gone');
}

function worldTileTap(prog, region) {
  const s = worldState.sel;
  if (s && s.type === 'tile' && s.prog === prog) { openProgram(prog.id); return; }
  worldSelect({ type: 'tile', region, prog });
}

function worldRenderPanel() {
  const s = worldState.sel;
  const g = s.region.group;
  const total = s.region.w * s.region.h;
  const open = total - g.members.length;
  const members = g.members.map(p => `
    <button type="button" class="panel-member${s.prog === p ? ' on' : ''}" data-act="pick" data-id="${p.id}" title="${escapeHTML(p.title)}">
      ${p.thumbnailUrl ? `<img src="${p.thumbnailUrl}" alt="">` : ''}
      <span>${escapeHTML(p.title)}</span>
    </button>`).join('');

  let detail = '';
  if (s.type === 'tile') {
    const p = s.prog;
    detail = `
      <div class="panel-tile">
        <div class="panel-art">${p.thumbnailUrl ? `<img src="${p.thumbnailUrl}" alt="">` : ''}</div>
        <span class="panel-kicker">${escapeHTML(p.category || 'GENERATOR')}</span>
        <h4>${escapeHTML(p.title)}</h4>
        <p>${escapeHTML(p.description || '')}</p>
        <button type="button" class="btn btn-primary panel-open" data-act="open" data-id="${p.id}">Open generator &#9654;</button>
        <span class="panel-note">Or select the tile again.</span>
      </div>`;
  } else if (s.type === 'empty') {
    detail = `
      <div class="panel-tile">
        <span class="panel-kicker">OPEN SLOT // ${escapeHTML(g.name.toUpperCase())}</span>
        <h4>Nothing here yet</h4>
        <p>This spot is reserved for a future ${escapeHTML(g.name)} generator. Have an idea for what belongs here?</p>
        <button type="button" class="btn btn-amber panel-open" data-act="idea">&#10010; Suggest a generator</button>
      </div>`;
  }

  wEl.panel.style.setProperty('--accent', g.accent);
  wEl.panel.innerHTML = `
    <button type="button" class="panel-close" data-act="close" aria-label="Close details">&#10006;</button>
    <div class="panel-group">
      <span class="panel-kicker">GROUP</span>
      <h3>${escapeHTML(g.name)}</h3>
      <p>${escapeHTML(g.description || '')}</p>
      <div class="panel-stats"><strong>${g.members.length}</strong> generator${g.members.length === 1 ? '' : 's'} &middot; <strong>${open}</strong> open slot${open === 1 ? '' : 's'}</div>
      ${members ? `<div class="panel-members">${members}</div>` : '<div class="panel-soon">No generators in this group yet.</div>'}
    </div>
    ${detail}`;
}

function worldPanelClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const s = worldState.sel;
  if (b.dataset.act === 'close') worldSelect(null);
  else if (b.dataset.act === 'open') openProgram(b.dataset.id);
  else if (b.dataset.act === 'pick') {
    const prog = PROGRAMS.find(p => p.id === b.dataset.id);
    worldTileTap(prog, s.region);
  } else if (b.dataset.act === 'idea') worldSuggest(s.region.group);
}

function worldSuggest(group) {
  const t = document.getElementById('idea-title');
  if (t && !t.value) t.value = `${group.name}: `;
  toggleIdeaModal(true);
}

// ---------- input ----------

function worldTap(e) {
  const tile = e.target.closest('.tile');
  if (tile) {
    const prog = PROGRAMS.find(p => p.id === tile.dataset.id);
    const region = worldRegion(tile.closest('.region').dataset.region);
    worldTileTap(prog, region);
    return;
  }
  const slots = e.target.closest('.region-slots');
  if (slots) {
    const region = worldRegion(slots.closest('.region').dataset.region);
    const rect = slots.getBoundingClientRect();
    const k = worldState.cam.k;
    const col = Math.floor((e.clientX - rect.left) / (WORLD.CELL * k));
    const row = Math.floor((e.clientY - rect.top) / (WORLD.CELL * k));
    const inCell = ((e.clientX - rect.left) / k) % WORLD.CELL <= WORLD.TILE && ((e.clientY - rect.top) / k) % WORLD.CELL <= WORLD.TILE;
    if (inCell && col >= 0 && col < region.w && row >= 0 && row < region.h && col + row * region.w >= region.group.members.length) {
      const s = worldState.sel;
      if (s && s.type === 'empty' && s.region === region && s.col === col && s.row === row) { worldSuggest(region.group); return; }
      worldSelect({ type: 'empty', region, col, row });
      return;
    }
  }
  const region = e.target.closest('.region');
  if (region) { worldSelect({ type: 'group', region: worldRegion(region.dataset.region) }); return; }
  if (worldState.sel) worldSelect(null);
}

function bindWorldInput() {
  const vp = wEl.vp;
  const pointers = new Map();
  let drag = null, lastPinch = null;

  const rel = e => { const r = vp.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  vp.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    worldStopAnim();
    pointers.set(e.pointerId, rel(e));
    if (pointers.size === 1) {
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, cx: worldState.cam.x, cy: worldState.cam.y, moved: false };
    } else if (pointers.size === 2) {
      if (drag) drag.moved = true;
      const [a, b] = [...pointers.values()];
      lastPinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      try { vp.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
  });

  vp.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, rel(e));
    if (pointers.size >= 2 && lastPinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      worldState.cam.x += mx - lastPinch.mx; worldState.cam.y += my - lastPinch.my;
      if (lastPinch.d > 0) worldZoomAt(mx, my, worldState.cam.k * d / lastPinch.d); else worldApply();
      lastPinch = { d, mx, my };
      return;
    }
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true;
      try { vp.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      vp.classList.add('panning');
    }
    if (drag.moved) {
      worldState.cam.x = drag.cx + dx; worldState.cam.y = drag.cy + dy;
      worldApply();
    }
  });

  const end = e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (drag && drag.id === e.pointerId) {
      const tap = !drag.moved && e.type === 'pointerup';
      drag = null;
      vp.classList.remove('panning');
      if (tap) worldTap(e);
    }
    if (pointers.size < 2) lastPinch = null;
  };
  vp.addEventListener('pointerup', end);
  vp.addEventListener('pointercancel', end);

  // Keyboard activation of a focused tile (mouse and touch go through the pointer path above).
  vp.addEventListener('click', e => { if (e.detail === 0) worldTap(e); });

  vp.addEventListener('wheel', e => {
    e.preventDefault();
    worldStopAnim();
    if (e.ctrlKey || e.metaKey) {
      const p = rel(e);
      worldZoomAt(p.x, p.y, worldState.cam.k * Math.exp(-e.deltaY * 0.01));
    } else {
      worldState.cam.x -= e.deltaX; worldState.cam.y -= e.deltaY;
      worldApply();
    }
  }, { passive: false });

  // Focus moves the browser's own scroll; keep the viewport pinned and let the camera do the moving.
  vp.addEventListener('scroll', () => { vp.scrollLeft = 0; vp.scrollTop = 0; });
  vp.addEventListener('focusin', e => {
    const tile = e.target.closest && e.target.closest('.tile');
    if (!tile || !tile.matches(':focus-visible')) return;
    const prog = PROGRAMS.find(p => p.id === tile.dataset.id);
    const s = worldState.sel;
    if (!(s && s.prog === prog)) worldSelect({ type: 'tile', region: worldRegion(tile.closest('.region').dataset.region), prog });
  });

  vp.addEventListener('keydown', e => {
    if (e.target.matches && e.target.matches('input')) return;
    const step = 90;
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (e.key === 'Escape') { worldSelect(null); return; }
    if (e.target === vp && moves[e.key]) {
      e.preventDefault(); worldStopAnim();
      worldState.cam.x += moves[e.key][0]; worldState.cam.y += moves[e.key][1]; worldApply();
    } else if (e.key === '+' || e.key === '=') worldZoomAt(worldState.size.w / 2, worldState.size.h / 2, worldState.cam.k * 1.25);
    else if (e.key === '-') worldZoomAt(worldState.size.w / 2, worldState.size.h / 2, worldState.cam.k / 1.25);
    else if (e.key === '0') worldFitAll();
  });

  wEl.panel.addEventListener('click', worldPanelClick);
  // Keep panel gestures from panning the map underneath.
  wEl.panel.addEventListener('wheel', e => e.stopPropagation());

  const zoomBy = f => {
    worldStopAnim();
    const { w, h } = worldState.size;
    const cam = worldState.cam;
    const target = worldClamp(cam.k * f, WORLD.MIN_K, WORLD.MAX_K);
    const area = worldFreeArea();
    const c = { x: (area.cx - cam.x) / cam.k, y: (area.cy - cam.y) / cam.k };
    worldAnimateTo({ k: target, x: area.cx - c.x * target, y: area.cy - c.y * target }, 250);
  };
  document.getElementById('world-zoom-in').addEventListener('click', () => zoomBy(1.4));
  document.getElementById('world-zoom-out').addEventListener('click', () => zoomBy(1 / 1.4));
  document.getElementById('world-fit').addEventListener('click', worldFitAll);

  wEl.search.addEventListener('input', () => worldSearch(wEl.search.value));
  wEl.search.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const first = wEl.canvas.querySelector('.tile.match');
    if (!first) return;
    const prog = PROGRAMS.find(p => p.id === first.dataset.id);
    worldSelect({ type: 'tile', region: worldRegion(first.closest('.region').dataset.region), prog });
  });

  // Minimap: press or drag to jump the camera.
  let miniDown = false;
  const miniJump = e => {
    const m = worldMiniGeom();
    const r = wEl.mini.getBoundingClientRect();
    const wx = (e.clientX - r.left - m.ox) / m.s + worldState.bounds.x;
    const wy = (e.clientY - r.top - m.oy) / m.s + worldState.bounds.y;
    worldStopAnim();
    const { w, h } = worldState.size, k = worldState.cam.k;
    worldState.cam.x = w / 2 - wx * k; worldState.cam.y = h / 2 - wy * k;
    worldApply();
  };
  wEl.mini.addEventListener('pointerdown', e => { miniDown = true; wEl.mini.setPointerCapture(e.pointerId); miniJump(e); });
  wEl.mini.addEventListener('pointermove', e => { if (miniDown) miniJump(e); });
  wEl.mini.addEventListener('pointerup', () => { miniDown = false; });
}

function worldSearch(query) {
  const q = query.trim().toLowerCase();
  wEl.root.classList.toggle('searching', Boolean(q));
  let first = null;
  wEl.canvas.querySelectorAll('.tile').forEach(t => {
    const hit = Boolean(q) && t.dataset.search.includes(q);
    t.classList.toggle('match', hit);
    if (hit && !first) first = t;
  });
  if (first) {
    // Pan to the first match without opening details.
    const prog = PROGRAMS.find(p => p.id === first.dataset.id);
    const region = worldRegion(first.closest('.region').dataset.region);
    const i = region.group.members.indexOf(prog);
    worldFocusRect(cellRect(region, i % region.w, Math.floor(i / region.w)), Math.max(worldState.cam.k, 1));
  }
}

// ---------- minimap ----------

function worldMiniGeom() {
  const W = wEl.mini.width, H = wEl.mini.height, b = worldState.bounds;
  const s = Math.min((W - 8) / b.w, (H - 8) / b.h);
  return { s, ox: (W - b.w * s) / 2, oy: (H - b.h * s) / 2 };
}

function worldDrawMinimap() {
  if (!wEl.mini || worldState.drawQueued) return;
  worldState.drawQueued = true;
  requestAnimationFrame(() => {
    worldState.drawQueued = false;
    const ctx = wEl.mini.getContext('2d');
    const { s, ox, oy } = worldMiniGeom();
    const b = worldState.bounds;
    ctx.clearRect(0, 0, wEl.mini.width, wEl.mini.height);
    worldState.regions.forEach(r => {
      const x = ox + (r.px - b.x) * s, y = oy + (r.py - b.y) * s, w = r.pw * s, h = r.ph * s;
      ctx.globalAlpha = r.group.members.length ? 0.85 : 0.28;
      ctx.fillStyle = r.group.accent || '#00e5ff';
      ctx.fillRect(x, y, w, h);
    });
    ctx.globalAlpha = 1;
    const { cam, size } = worldState;
    const vx = ox + (-cam.x / cam.k - b.x) * s, vy = oy + (-cam.y / cam.k - b.y) * s;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(vx, vy, size.w / cam.k * s, size.h / cam.k * s);
  });
}
