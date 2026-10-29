// Homepage world map: every group in BUNDLES is a region on one big 2D grid, with generators as tiles
// inside it. The camera pans (drag, wheel, arrow keys) and zooms (pinch, Ctrl+wheel, +/-). Selecting a
// tile snaps the camera to it and opens a details panel; selecting it again opens the generator.
// Layout is automatic: each group is sized to its tiles and packed in rings around the Workshop tile (the `at` and
// `size` fields in js/programs.js are ignored). See docs/homepage.md.

const WORLD = { CELL: 128, TILE: 128, PAD: 8, REGION_GAP: 16, MIN_K: 0.18, MAX_K: 2.4 };
const SORT_MODES = {
  default: 'Groups, biggest in the middle',
  name: 'Groups, A to Z',
  newest: 'Groups, newest first',
  'flat-name': 'No groups, A to Z',
  'flat-newest': 'No groups, newest first'
};
const LAYOUT_KEY = 'mm-home-layout';   // the visitor's own sort and tile order, kept in this browser only
const EMPTY_CELL_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect x='1.5' y='1.5' width='109' height='109' rx='14' fill='%23ffffff' fill-opacity='0.025' stroke='%23ffffff' stroke-opacity='0.16' stroke-width='1.5' stroke-dasharray='5 6'/%3E%3C/svg%3E\")";

const worldState = {
  regions: [],
  bounds: { w: 1, h: 1 },
  cam: { x: 0, y: 0, k: 1 },
  sel: null,        // { type: 'tile'|'empty'|'group', region, prog?, col?, row? }
  anim: null,
  size: { w: 1, h: 1 },
  ready: false,
  drawQueued: false,
  mode: 'default',
  groupOrder: [],   // group ids in the order they were packed when the visitor started rearranging
  order: {},        // custom tile order per group id, from drag and drop (see worldMoveTile)
  arranging: false
};

// The Workshop is a large tile in the middle of the map (not a generator). It occupies WORKSHOP.cols x WORKSHOP.rows cells
// starting at cell WORKSHOP.at, and opens the free-range 3D editor at #/workshop. See docs/workshop.md.
const WORKSHOP = { at: [0, 0], cols: 4, rows: 4 };

const wEl = {};

function worldClamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function worldReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

// ---------- layout ----------

// Columns and rows for a group of n tiles: close to square (counting the header row), with few unused cells.
function regionShape(n) {
  if (!n) return { w: 2, h: 1 };
  let best = null;
  for (let w = 2; w <= 9; w++) {
    const h = Math.ceil(n / w);
    const score = (w * h - n) * 1.2 + Math.abs(Math.log(w / (h + 1))) * 4 + (w > n ? 3 : 0);
    if (!best || score < best.score) best = { w, h, score };
  }
  return best;
}

// Packs the regions (already in priority order) around the Workshop: each goes to the free spot that touches
// something already placed and sits closest to the Workshop's centre, so the map grows outward in rings.
function layoutWorld(groups) {
  const C = WORLD.CELL, P = WORLD.PAD, G = WORLD.REGION_GAP;
  const regions = groups.map(g => {
    const { w, h } = regionShape(g.members.length);
    return { group: g, w, h, pw: w * C + P * 2, ph: (h + 1) * C + P * 2 };
  });
  const ws = { x: WORKSHOP.at[0] * C, y: WORKSHOP.at[1] * C, w: WORKSHOP.cols * C, h: WORKSHOP.rows * C };
  const placed = [ws];
  const wcx = ws.x + ws.w / 2, wcy = ws.y + ws.h / 2;
  const clash = (x, y, w, h) => placed.some(p => x < p.x + p.w + G && p.x < x + w + G && y < p.y + p.h + G && p.y < y + h + G);
  regions.forEach(r => {
    const xs = [], ys = [];
    placed.forEach(p => {
      xs.push(p.x + p.w + G, p.x - r.pw - G, p.x, p.x + p.w - r.pw);
      ys.push(p.y + p.h + G, p.y - r.ph - G, p.y, p.y + p.h - r.ph);
    });
    let best = null;
    for (const x of xs) for (const y of ys) {
      if (clash(x, y, r.pw, r.ph)) continue;
      const d = Math.hypot(x + r.pw / 2 - wcx, y + r.ph / 2 - wcy);
      if (!best || d < best.d - 0.5) best = { x, y, d };
    }
    r.px = best.x; r.py = best.y;
    placed.push({ x: r.px, y: r.py, w: r.pw, h: r.ph });
  });
  const minX = Math.min(...placed.map(p => p.x)), minY = Math.min(...placed.map(p => p.y));
  const maxX = Math.max(...placed.map(p => p.x + p.w)), maxY = Math.max(...placed.map(p => p.y + p.h));
  worldState.bounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  return regions;
}

// Pixel position of a tile cell in world space.
function cellRect(region, col, row) {
  const C = WORLD.CELL;
  return { x: region.px + WORLD.PAD + col * C, y: region.py + WORLD.PAD + (row + 1) * C, w: WORLD.TILE, h: WORLD.TILE };
}

// Outline of a region as a rounded path: a rectangle, with the empty end of a part-filled last row cut away.
function regionPath(r) {
  const C = WORLD.CELL, P = WORLD.PAD, n = r.group.members.length;
  const last = n ? n - r.w * (r.h - 1) : r.w;
  const pts = last === r.w
    ? [[0, 0], [r.pw, 0], [r.pw, r.ph], [0, r.ph]]
    : [[0, 0], [r.pw, 0], [r.pw, r.ph - C], [last * C + P * 2, r.ph - C], [last * C + P * 2, r.ph], [0, r.ph]];
  const rad = 18;
  let d = '';
  pts.forEach((pt, i) => {
    const prev = pts[(i + pts.length - 1) % pts.length], next = pts[(i + 1) % pts.length];
    const toward = (a, b) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]), t = Math.min(rad, len / 2) / len;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    };
    const p1 = toward(pt, prev), p2 = toward(pt, next);
    d += `${i ? 'L' : 'M'}${p1[0]} ${p1[1]}Q${pt[0]} ${pt[1]} ${p2[0]} ${p2[1]}`;
  });
  return d + 'Z';
}

// ---------- groups, sorting and the visitor's own arrangement ----------

function worldLoadSaved() {
  try {
    const v = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');
    if (v.mode in SORT_MODES) worldState.mode = v.mode;
    if (v.order && typeof v.order === 'object') worldState.order = v.order;
    if (Array.isArray(v.groupOrder)) worldState.groupOrder = v.groupOrder;
  } catch (e) { /* storage blocked or corrupt: use the defaults */ }
}

function worldSave() {
  try { localStorage.setItem(LAYOUT_KEY, JSON.stringify({ mode: worldState.mode, order: worldState.order, groupOrder: worldState.groupOrder })); } catch (e) { /* ignore */ }
}

// The groups to show right now, as copies of BUNDLES entries with their own member lists.
function worldViewGroups() {
  const mode = worldState.mode;
  const byTitle = (a, b) => a.title.localeCompare(b.title);
  const byNew = (a, b) => b.slot - a.slot;

  if (mode.startsWith('flat')) {
    const all = [...new Set(BUNDLES.flatMap(b => b.members))].sort(mode === 'flat-name' ? byTitle : byNew);
    return [{ id: 'all', name: 'All generators', accent: '#00e5ff', description: 'Every generator in one block.', members: all }];
  }

  const saved = worldState.order, placed = {};
  if (mode === 'default') {
    Object.keys(saved).forEach(gid => (saved[gid] || []).forEach(id => { if (!placed[id]) placed[id] = gid; }));
  }
  const groups = BUNDLES.filter(b => b.members.length || b.planned).map((b, i) => {
    let members = b.members.filter(p => !placed[p.id] || placed[p.id] === b.id);
    if (mode === 'default' && saved[b.id]) {
      const ordered = saved[b.id].map(id => PROGRAMS.find(p => p.id === id)).filter(p => p && p.programUrl && placed[p.id] === b.id);
      members = ordered.concat(members.filter(p => !ordered.includes(p)));
    } else if (mode === 'name') members = members.slice().sort(byTitle);
    else if (mode === 'newest') members = members.slice().sort(byNew);
    return { ...b, members, _i: i };
  });
  const newest = g => g.members.reduce((m, p) => Math.max(m, p.slot), -1);
  groups.sort((a, b) => {
    if (!a.members.length !== !b.members.length) return a.members.length ? -1 : 1;   // empty groups last
    if (mode === 'name') return a.name.localeCompare(b.name);
    if (mode === 'newest') return newest(b) - newest(a);
    if (mode === 'default' && worldState.groupOrder.length) {   // keep the map steady once the visitor has arranged it
      const at = g => { const i = worldState.groupOrder.indexOf(g.id); return i < 0 ? 1e9 : i; };
      if (at(a) !== at(b)) return at(a) - at(b);
    }
    return b.members.length - a.members.length || a._i - b._i;
  });
  return groups;
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
    const get = f => fetch(SPRITE_DIR + f).then(r => (r.ok ? r.json() : null)).catch(() => null);
    spriteManifest = Promise.all([get('manifest.json'), get('manifest-v2.json')]).then(([v1, v2]) => ({ v1, v2 }));
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

function spriteApply(ms) {
  wEl.canvas.querySelectorAll('.tile').forEach(tile => {
    const img = tile.querySelector('.tile-art img[data-std]');
    const id = img && img.dataset.std.replace(/^.*\/([^/]+)\.\w+$/, '$1');
    if (!id || tile.querySelector('.tile-sprite, .tile-obj')) return;
    if (ms.v2 && ms.v2.tiles[id]) hoverApply(tile, ms.v2, id);
    else if (ms.v1 && ms.v1.tiles[id]) spriteApplyV1(tile, ms.v1, ms.v1.tiles[id]);
  });
}

function spriteApplyV1(tile, m, entry) {
  const span = document.createElement('span');
  span.className = 'tile-sprite';
  span.setAttribute('aria-hidden', 'true');
  span.style.backgroundImage = `url(${SPRITE_DIR}${m.sheets[entry.sheet].file})`;
  span._sprite = { m, entry, timer: null };
  tile.querySelector('.tile-art').appendChild(span);
  tile.classList.add('has-sprite', 'has-pro');
  spriteShow(span, 0);
}

// v2 hover: shared base tile + a 24-frame rotating hologram layer that pops out of the frame on hover.
// The label and slot number are text; the hologram layer may overflow the tile (see .tile-obj in styles.css).
function hoverApply(tile, m, id) {
  let entry = m.tiles[id];
  if (entry.gemini && /[?&]gemini\b/.test(location.search)) entry = { ...entry, ...entry.gemini };   // ?gemini shows the older Gemini-drawn frames
  const section = tile.closest('.region')?.dataset.region;
  const art = tile.querySelector('.tile-art');
  const base = document.createElement('span');
  base.className = 'tile-base';
  base.setAttribute('aria-hidden', 'true');
  base.style.backgroundImage = `url(${SPRITE_DIR}${m.rims[section] || m.base})`;
  const slot = document.createElement('span');
  slot.className = 'tile-slot';
  slot.setAttribute('aria-hidden', 'true');
  slot.textContent = String(entry.slot).padStart(2, '0');
  const obj = document.createElement('span');
  obj.className = 'tile-obj';
  obj.setAttribute('aria-hidden', 'true');
  const lay = { cols: entry.cols || m.cols, frames: entry.frames || m.frames, rows: entry.rowsPerBlock || m.rowsPerBlock,
                block: entry.block || 0, mirror: Boolean(entry.mirror) };
  const order = entry.order || [...Array(lay.frames).keys()];                  // frames to play, in turn order
  lay.seq = order.slice();
  if (lay.mirror) for (let i = order.length - 2; i > 0; i--) lay.seq.push(-order[i]);   // negative = mirrored frame
  const size = m.cell * m.displayScale, sheet = entry.file ? entry : m.sheets[entry.sheet];
  obj.style.width = obj.style.height = `${size}px`;
  // The 24-frame atlas is big (~300 KB), so tiles start on a small still of frame 0 and fetch the atlas on demand.
  const sheetCss = `${sheet.width * m.displayScale}px ${sheet.height * m.displayScale}px`;
  obj._hover = { m, entry, lay, size, p: 0, dir: 0, frame: 0, raf: 0, last: 0, acc: 0,
                 ready: !entry.poster, loading: null, visible: false, sheetUrl: `${SPRITE_DIR}${sheet.file}`, sheetCss };
  if (entry.poster) {
    obj.style.backgroundImage = `url(${SPRITE_DIR}${entry.poster})`;
    obj.style.backgroundSize = '100% 100%';
    obj.style.backgroundPosition = '0 0';
  } else {
    obj.style.backgroundImage = `url(${obj._hover.sheetUrl})`;
    obj.style.backgroundSize = sheetCss;
  }
  art.append(base, slot, obj);
  tile.classList.add('has-3d', 'has-pro');
  hoverDraw(obj);
  hoverWatch(obj);
}

function hoverLoad(obj) {
  const h = obj._hover;
  if (h.ready || h.loading) return h.loading;
  h.loading = new Promise(resolve => {
    const im = new Image();
    im.onload = () => {
      h.ready = true;
      obj.style.backgroundImage = `url(${h.sheetUrl})`;
      obj.style.backgroundSize = h.sheetCss;
      hoverDraw(obj);
      resolve();
    };
    im.onerror = () => { h.loading = null; resolve(); };
    im.src = h.sheetUrl;
  });
  return h.loading;
}

// Warm the atlases of tiles on screen, one at a time while the browser is idle, so most hovers start instantly.
// Skipped on Data Saver / slow connections, where the atlas is fetched on first hover or tap instead.
const holoQueue = [];
let holoBusy = false, holoObserver = null;
function hoverWatch(obj) {
  const c = navigator.connection;
  if (obj._hover.ready || !('IntersectionObserver' in window) || (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')))) return;
  holoObserver = holoObserver || new IntersectionObserver(entries => {
    entries.forEach(en => {
      const h = en.target._hover;
      h.visible = en.isIntersecting;
      if (en.isIntersecting && !h.ready && !holoQueue.includes(en.target)) holoQueue.push(en.target);
    });
    holoPump();
  }, { rootMargin: '100px' });
  holoObserver.observe(obj);
}
function holoPump() {
  if (holoBusy) return;
  let obj;
  while ((obj = holoQueue.shift()) && (!obj.isConnected || obj._hover.ready || !obj._hover.visible));
  if (!obj) return;
  holoBusy = true;
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
  idle(() => hoverLoad(obj).then(() => { holoBusy = false; holoPump(); }));
}

const easeOutBack = x => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

function hoverDraw(obj) {
  const h = obj._hover, m = h.m;
  const e = easeOutBack(Math.min(1, h.p));
  const scale = m.restScale + (1 - m.restScale) * e;
  const lay = h.lay, step = lay.seq[h.frame], f = Math.abs(step);
  const col = f % lay.cols, row = lay.rows * lay.block + Math.floor(f / lay.cols);
  if (h.ready) obj.style.backgroundPosition = `${-col * m.cell * m.displayScale}px ${-row * m.cell * m.displayScale}px`;
  obj.style.transform = `translate(-50%, -50%) scale(${(Object.is(step, -0) || step < 0 ? -1 : 1) * scale}, ${scale})`;
  obj.style.filter = `drop-shadow(0 0 ${3 + 9 * Math.min(1, h.p)}px rgba(60, 230, 255, ${0.35 + 0.4 * Math.min(1, h.p)}))`;
}

// Frames only change on display refreshes. Stepping every 41.7 ms (24 fps) on a 60 Hz screen alternates 2 and 3
// refreshes per frame, which reads as judder. So measure the refresh interval and step a whole number of refreshes.
function hoverLoop(obj, now) {
  const h = obj._hover, m = h.m, dt = Math.min(64, now - h.last);
  h.last = now;
  (h.dts = h.dts || []).push(dt);
  if (h.dts.length > 12) h.dts.shift();
  const r = h.dts.length >= 5 ? [...h.dts].sort((a, b) => a - b)[Math.floor(h.dts.length / 2)] : 16.7;
  const n = Math.max(1, Math.round(1000 / m.fps / r));
  h.p = Math.max(0, Math.min(1, h.p + h.dir * dt / (h.dir > 0 ? 260 : 200)));
  if (!h.ready) h.acc = 0;     // hold on the still until the atlas arrives
  else h.acc += dt;
  // After the pointer leaves, shrink back but keep turning (twice as fast) until the loop lands on frame 0, so the
  // tile settles on the rest pose without a snap.
  const step = r * (h.dir < 0 ? Math.max(1, Math.round(n / 2)) : n);
  while (h.acc >= step - r * 0.4) {
    h.acc -= step;
    h.frame = (h.frame + 1) % h.lay.seq.length;
    if (h.dir < 0 && h.p <= 0 && h.frame === 0) break;
  }
  if (h.acc < 0) h.acc = 0;
  if (h.dir < 0 && h.p <= 0 && h.frame === 0) { h.acc = 0; h.raf = 0; hoverDraw(obj); return; }
  hoverDraw(obj);
  h.raf = requestAnimationFrame(t => hoverLoop(obj, t));
}

function hoverStart(tile, on) {
  const obj = tile.querySelector('.tile-obj');
  if (!obj || !obj._hover || worldReducedMotion()) return;
  const h = obj._hover;
  h.dir = on ? 1 : -1;
  if (on) hoverLoad(obj);
  if (!h.raf) { h.last = performance.now(); h.raf = requestAnimationFrame(t => hoverLoop(obj, t)); }
}

function spriteRemove() {
  wEl.canvas.querySelectorAll('.tile.has-sprite, .tile.has-3d').forEach(tile => {
    spriteStop(tile);
    const obj = tile.querySelector('.tile-obj');
    if (obj && obj._hover) cancelAnimationFrame(obj._hover.raf);
    tile.querySelectorAll('.tile-sprite, .tile-base, .tile-slot, .tile-obj').forEach(n => n.remove());
    tile.classList.remove('has-sprite', 'has-3d');
  });
}

function worldSetExperimental(on) {
  worldState.experimental = on;
  WORLD.TILE = on ? WORLD.CELL : 112;
  wEl.root.classList.toggle('exp', on);
  const imgs = wEl.canvas.querySelectorAll('.tile-art img[data-std]');
  const setImg = img => {
    const tile = img.closest('.tile');
    if (!on) { tile.classList.remove('has-pro'); img.src = img.dataset.std; return; }
    img.onload = () => { if (img.src.includes('/pro/')) tile.classList.add('has-pro'); };
    img.onerror = () => { img.onerror = null; tile.classList.remove('has-pro'); img.src = img.dataset.std; };
    img.src = img.dataset.pro;
  };
  if (on) {
    // Hologram tiles hide their <img>, so only fetch artwork for tiles the manifest doesn't cover.
    spriteLoad().then(ms => {
      if (!worldState.experimental) return;
      imgs.forEach(img => {
        const id = img.dataset.std.replace(/^.*\/([^/]+)\.\w+$/, '$1');
        if (!(ms && ms.v2 && ms.v2.tiles[id])) setImg(img);
      });
      if (ms) spriteApply(ms);
    });
  } else {
    imgs.forEach(setImg);
    spriteRemove();
  }
  worldSelect(null);
  worldRedraw();
}

// ---------- render ----------

function regionHTML(r) {
  const g = r.group;
  const filled = g.members.length;
  const C = WORLD.CELL;
  const tiles = g.members.map((p, i) => {
    const col = i % r.w, row = Math.floor(i / r.w);
    const thumb = p.thumbnailUrl
      ? `<img data-std="${p.thumbnailUrl}" data-pro="${proThumbUrl(p.thumbnailUrl)}" alt="" loading="lazy" draggable="false">`
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
      <svg class="region-shape" width="${r.pw}" height="${r.ph}" aria-hidden="true"><path d="${regionPath(r)}"/></svg>
      <div class="region-inner" style="left:${WORLD.PAD}px; top:${WORLD.PAD}px; width:${r.w * C}px; height:${(r.h + 1) * C}px">
        <div class="region-head" data-act="group">
          <h3>${escapeHTML(g.name)}</h3>
          <span class="region-meta">${filled ? `${filled}` : 'COMING SOON'}</span>
          <p>${escapeHTML(g.description || '')}</p>
        </div>
        <div class="region-slots" style="top:${C}px; width:${r.w * C}px; height:${r.h * C}px${filled ? '' : `; background-image:${EMPTY_CELL_SVG}; background-size:${C}px ${C}px`}">
          ${tiles}
        </div>
      </div>
    </section>`;
}

function workshopTileHTML() {
  const C = WORLD.CELL, w = WORKSHOP.cols * C, h = WORKSHOP.rows * C;
  return `
    <button class="workshop-tile" type="button" style="left:${WORKSHOP.at[0] * C}px; top:${WORKSHOP.at[1] * C}px; width:${w}px; height:${h}px"
            aria-label="Workshop: a free-range 3D editor. Import STL files, add shapes, move, scale and rotate.">
      <span class="ws-grid" aria-hidden="true"></span>
      <svg class="ws-holo" viewBox="0 0 240 150" aria-hidden="true">
        <g class="ws-orbit">
          <path class="ws-f" d="M40 96 L70 80 L100 96 L100 128 L70 144 L40 128Z M40 96 L70 112 L100 96 M70 112 L70 144"/>
          <circle class="ws-f" cx="170" cy="100" r="26"/><ellipse class="ws-f" cx="170" cy="100" rx="26" ry="8"/>
          <path class="ws-f" d="M120 40 L150 82 L90 82Z M120 40 L120 82"/>
          <path class="ws-f" d="M184 30 l12 -8 l12 8 v14 l-12 8 l-12 -8z"/>
        </g>
      </svg>
      <span class="ws-label"><strong>Workshop</strong><em>Import STLs &middot; add shapes &middot; move, scale, rotate</em></span>
    </button>`;
}

function initWorldMap() {
  worldLoadSaved();
  wEl.root = document.getElementById('world');
  wEl.vp = document.getElementById('world-viewport');
  wEl.canvas = document.getElementById('world-canvas');
  wEl.panel = document.getElementById('world-panel');
  wEl.mini = document.getElementById('world-minimap');
  wEl.search = document.getElementById('world-search');
  wEl.hint = document.getElementById('world-hint');
  wEl.sort = document.getElementById('world-sort');
  wEl.arrange = document.getElementById('world-arrange');
  wEl.reset = document.getElementById('world-reset');

  const spriteTile = e => (worldState.experimental && !worldState.arranging ? e.target.closest?.('.tile.has-sprite, .tile.has-3d') : null);
  const hoverOn = t => (t.classList.contains('has-3d') ? hoverStart(t, true) : spritePlay(t));
  const hoverOff = t => (t.classList.contains('has-3d') ? hoverStart(t, false) : spriteStop(t));
  wEl.canvas.addEventListener('mouseover', e => { const t = spriteTile(e); if (t) hoverOn(t); });
  wEl.canvas.addEventListener('mouseout', e => {
    const t = spriteTile(e);
    if (t && !t.contains(e.relatedTarget)) hoverOff(t);
  });
  wEl.canvas.addEventListener('focusin', e => { const t = spriteTile(e); if (t) hoverOn(t); });
  wEl.canvas.addEventListener('focusout', e => { const t = spriteTile(e); if (t) hoverOff(t); });
  worldBuild();                 // the edge-to-edge hologram view is the only view
  bindWorldInput();
  bindWorldArrange();
  new ResizeObserver(worldResized).observe(wEl.root);
  worldState.ready = true;
  worldState.needsHome = true;
  worldMapShown();
}

// (Re)creates every region and tile from the current sort and arrangement. Tiles are plain DOM, so this is cheap
// enough to run after each drop; the camera is left where it is.
function worldBuild() {
  worldSelect(null);
  const groups = worldViewGroups();
  worldState.regions = layoutWorld(groups);
  wEl.canvas.innerHTML = worldState.regions.map(regionHTML).join('') + workshopTileHTML() + '<div class="cell-cursor" id="cell-cursor" hidden></div>';
  wEl.cursor = document.getElementById('cell-cursor');

  const filled = groups.reduce((n, g) => n + g.members.length, 0);
  document.getElementById('world-stats').textContent =
    `${filled} generators${worldState.mode.startsWith('flat') ? '' : ` · ${groups.filter(g => g.members.length).length} groups`}`;
  wEl.sort.value = worldState.mode;
  wEl.reset.hidden = !Object.keys(worldState.order).length;
  worldSetExperimental(true);
  if (wEl.search.value) worldSearch(wEl.search.value, false);
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

// The home view: centred on the Workshop tile, close enough to read the first ring of groups around it.
function worldHome(instant) {
  const C = WORLD.CELL, { w, h } = worldState.size;
  const k = worldClamp(Math.min(w / (9.5 * C), h / (7 * C)), 0.3, 1);
  worldFocusRect({ x: WORKSHOP.at[0] * C, y: WORKSHOP.at[1] * C, w: WORKSHOP.cols * C, h: WORKSHOP.rows * C }, k, !instant);
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
  if (wEl.cursor) wEl.cursor.hidden = true;
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
  const open = g.members.length ? 0 : s.region.w * s.region.h;
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
      <div class="panel-stats"><strong>${g.members.length}</strong> generator${g.members.length === 1 ? '' : 's'} ${open ? ` &middot; <strong>${open}</strong> open slot${open === 1 ? '' : 's'}` : ''}</div>
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
  if (worldState.arranging) return;   // taps do nothing while rearranging
  if (e.target.closest('.workshop-tile')) { location.hash = '#/workshop'; return; }
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
    if (inCell && !region.group.members.length && col >= 0 && col < region.w && row >= 0 && row < region.h) {
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
  let drag = null, lastPinch = null, tileDrag = null;

  const rel = e => { const r = vp.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  vp.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    worldStopAnim();
    if (worldState.arranging && !pointers.size) {
      const tile = e.target.closest('.tile');
      if (tile) { tileDrag = { id: e.pointerId, tile, sx: e.clientX, sy: e.clientY, moved: false, raf: 0 }; return; }
    }
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
    if (tileDrag && tileDrag.id === e.pointerId) { worldDragMove(tileDrag, e); return; }
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
    if (tileDrag && tileDrag.id === e.pointerId) {
      const t = tileDrag;
      tileDrag = null;
      worldDragEnd(t, e.type === 'pointerup');
      return;
    }
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
  vp.addEventListener('click', e => { if (e.detail === 0 && !worldState.arranging) worldTap(e); });

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

function worldSearch(query, pan = true) {
  const q = query.trim().toLowerCase();
  wEl.root.classList.toggle('searching', Boolean(q));
  let first = null;
  wEl.canvas.querySelectorAll('.tile').forEach(t => {
    const hit = Boolean(q) && t.dataset.search.includes(q);
    t.classList.toggle('match', hit);
    if (hit && !first) first = t;
  });
  if (first && pan) {
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
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(ox + (WORKSHOP.at[0] * WORLD.CELL - b.x) * s, oy + (WORKSHOP.at[1] * WORLD.CELL - b.y) * s, WORKSHOP.cols * WORLD.CELL * s, WORKSHOP.rows * WORLD.CELL * s);
    ctx.globalAlpha = 1;
    const { cam, size } = worldState;
    const vx = ox + (-cam.x / cam.k - b.x) * s, vy = oy + (-cam.y / cam.k - b.y) * s;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(vx, vy, size.w / cam.k * s, size.h / cam.k * s);
  });
}

// ---------- sorting and rearranging ----------

function bindWorldArrange() {
  wEl.sort.innerHTML = Object.entries(SORT_MODES).map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
  wEl.sort.value = worldState.mode;
  wEl.sort.addEventListener('change', () => {
    worldState.mode = wEl.sort.value;
    worldSave();
    worldArrangeUI();
    worldBuild();
    worldHome(false);
  });
  wEl.arrange.addEventListener('click', () => {
    worldState.arranging = !worldState.arranging;
    worldArrangeUI();
    worldSelect(null);
  });
  wEl.reset.addEventListener('click', () => {
    worldState.order = {};
    worldState.groupOrder = [];
    worldSave();
    worldBuild();
  });
  worldArrangeUI();
}

function worldArrangeUI() {
  const flat = worldState.mode.startsWith('flat');
  if (flat) worldState.arranging = false;
  wEl.arrange.disabled = flat;
  wEl.arrange.title = flat ? 'Switch to a grouped sort to rearrange tiles' : 'Drag tiles to reorder them, or into another group';
  wEl.arrange.setAttribute('aria-pressed', String(worldState.arranging));
  wEl.arrange.textContent = worldState.arranging ? 'Done' : 'Rearrange';
  wEl.root.classList.toggle('arranging', worldState.arranging);
  wEl.hint.textContent = worldState.arranging
    ? 'Drag a tile to a new spot or into another group, then press Done'
    : 'Drag to pan · pinch or Ctrl+scroll to zoom · select a tile, then select it again to open it';
  wEl.hint.classList.toggle('gone', !worldState.arranging);
}

// Where a screen point would drop a tile: the region under it and the cell index in that region.
function worldDropAt(clientX, clientY) {
  const r = wEl.vp.getBoundingClientRect(), { x, y, k } = worldState.cam;
  const wx = (clientX - r.left - x) / k, wy = (clientY - r.top - y) / k;
  const C = WORLD.CELL, P = WORLD.PAD;
  const region = worldState.regions.find(g => wx >= g.px && wx <= g.px + g.pw && wy >= g.py && wy <= g.py + g.ph);
  if (!region) return null;
  const col = worldClamp(Math.floor((wx - region.px - P) / C), 0, region.w - 1);
  const row = worldClamp(Math.floor((wy - region.py - P) / C) - 1, 0, region.h - 1);
  return { region, idx: row * region.w + col };
}

// Moving only writes a transform on the dragged tile and (once per frame) positions one marker, so it stays smooth.
function worldDragMove(t, e) {
  const dx = e.clientX - t.sx, dy = e.clientY - t.sy;
  if (!t.moved) {
    if (Math.hypot(dx, dy) < 6) return;
    t.moved = true;
    try { wEl.vp.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    t.tile.classList.add('dragging');
    wEl.vp.classList.add('panning');
  }
  t.x = e.clientX; t.y = e.clientY;
  if (t.raf) return;
  t.raf = requestAnimationFrame(() => {
    t.raf = 0;
    const k = worldState.cam.k;
    t.tile.style.transform = `translate(${(t.x - t.sx) / k}px, ${(t.y - t.sy) / k}px) scale(1.08)`;
    t.drop = worldDropAt(t.x, t.y);
    const c = wEl.cursor;
    if (!t.drop) { c.hidden = true; return; }
    const n = t.drop.region.group.members.length;
    const idx = Math.min(t.drop.idx, Math.max(0, n - (t.drop.region.group.members.includes(PROGRAMS.find(p => p.id === t.tile.dataset.id)) ? 1 : 0)));
    const rect = cellRect(t.drop.region, idx % t.drop.region.w, Math.floor(idx / t.drop.region.w));
    c.style.left = `${rect.x}px`; c.style.top = `${rect.y}px`;
    c.style.setProperty('--accent', t.drop.region.group.accent);
    c.hidden = false;
  });
}

function worldDragEnd(t, committed) {
  cancelAnimationFrame(t.raf);
  wEl.vp.classList.remove('panning');
  t.tile.classList.remove('dragging');
  t.tile.style.transform = '';
  wEl.cursor.hidden = true;
  if (!t.moved || !committed) return;
  const drop = worldDropAt(t.x, t.y);
  if (!drop) return;
  const prog = PROGRAMS.find(p => p.id === t.tile.dataset.id);
  const from = worldRegion(t.tile.closest('.region').dataset.region);
  worldMoveTile(prog, from, drop.region, drop.idx);
}

// Moves a tile to a cell (same group or another), remembers the whole arrangement in this browser, and redraws.
function worldMoveTile(prog, from, to, idx) {
  const wasDefault = worldState.mode === 'default';
  const lists = {};
  worldState.regions.forEach(r => { lists[r.group.id] = r.group.members.map(p => p.id); });
  lists[from.group.id] = lists[from.group.id].filter(id => id !== prog.id);
  lists[to.group.id].splice(Math.min(idx, lists[to.group.id].length), 0, prog.id);
  if (!worldState.groupOrder.length || !wasDefault) worldState.groupOrder = worldState.regions.map(r => r.group.id);
  worldState.order = lists;
  worldState.mode = 'default';
  worldSave();

  if (wasDefault && from === to) {
    // Same group: nothing changes size, so just slide the tiles to their new cells.
    const C = WORLD.CELL;
    from.group.members = lists[from.group.id].map(id => PROGRAMS.find(p => p.id === id));
    from.group.members.forEach((p, i) => {
      const el = wEl.canvas.querySelector(`.region[data-region="${from.group.id}"] .tile[data-id="${p.id}"]`);
      el.style.left = `${(i % from.w) * C}px`; el.style.top = `${Math.floor(i / from.w) * C}px`;
      el.classList.toggle('has-left', i % from.w > 0); el.classList.toggle('has-up', i >= from.w);
    });
    wEl.reset.hidden = false;
    return;
  }
  worldBuild();
}
