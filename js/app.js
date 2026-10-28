function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function initSplash() {
  initWorldMap();
  renderIdeasLog();
}

function getSavedIdeas() {
  try {
    return JSON.parse(localStorage.getItem('mm_generator_ideas')) || [];
  } catch {
    return [];
  }
}

function toggleIdeaModal(show) {
  document.getElementById('idea-modal').classList.toggle('open', show);
}

function handleIdeaSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('idea-title').value.trim();
  const desc = document.getElementById('idea-desc').value.trim();
  if (!title || !desc) return;

  const ideas = getSavedIdeas();
  ideas.unshift({ title, desc, date: new Date().toLocaleDateString() });
  try {
    localStorage.setItem('mm_generator_ideas', JSON.stringify(ideas));
  } catch (err) {}

  document.getElementById('idea-form').reset();
  renderIdeasLog();
}

function renderIdeasLog() {
  const ideas = getSavedIdeas();
  const container = document.getElementById('ideas-log-container');
  if (ideas.length === 0) {
    container.innerHTML = `<div style="font-size:0.74rem; color:#8ab4e1; margin-top:0.4rem;">No generator ideas submitted yet.</div>`;
    return;
  }
  container.innerHTML = ideas.slice(0, 5).map(item => `
    <div class="idea-item">
      <strong style="color: var(--bp-white);">${item.title}</strong>
      <span style="float:right; color: var(--bp-cyan); font-size:0.68rem;">${item.date}</span>
      <p style="color:#b8d4f2; margin-top:0.2rem;">${item.desc}</p>
    </div>
  `).join('');
}

function exportIdeasJSON() {
  const ideas = getSavedIdeas();
  const url = URL.createObjectURL(new Blob([JSON.stringify(ideas, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'maker-makers-generator-ideas.json';
  a.click();
  URL.revokeObjectURL(url);
}

let activeProgram = PROGRAMS[0];

function hideAllScreens() {
  document.body.classList.remove('on-splash');
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('viewer-screen').style.display = 'none';
  document.getElementById('map-screen').style.display = 'none';
  document.getElementById('workshop-screen').style.display = 'none';
  document.body.classList.remove('on-workshop');
}

// Navigation is driven by the URL hash so the browser Back and Forward buttons work:
// '' = generators grid, '#/generator/SLOT-01' = viewer, '#/map' = printer map.
function goTo(hash) {
  if (location.hash === hash || (!hash && !location.hash)) {
    renderRoute();
  } else {
    location.hash = hash;
  }
}

function renderRoute() {
  const hash = location.hash;
  const genMatch = hash.match(/^#\/generator\/(.+)$/);
  if (genMatch && PROGRAMS.some(p => p.id === decodeURIComponent(genMatch[1]))) {
    renderProgram(decodeURIComponent(genMatch[1]));
  } else if (hash === '#/workshop') {
    renderWorkshop();
  } else if (hash === '#/map') {
    renderPrinterMap();
  } else {
    renderSplash();
  }
}

function showSplashScreen() { goTo(''); }
function openProgram(progId) { goTo(`#/generator/${encodeURIComponent(progId)}`); }
function showPrinterMapScreen() { goTo('#/map'); }

// Assigning iframe.src adds a browser history entry, which would make Back reload the frame
// instead of leaving the generator. location.replace swaps the frame without one.
function setFrameUrl(iframe, url) {
  try {
    iframe.contentWindow.location.replace(new URL(url, location.href).href);
  } catch (e) {
    iframe.src = url;
  }
}

function renderSplash() {
  hideAllScreens();
  document.getElementById('splash-screen').style.display = 'block';
  document.body.classList.add('on-splash');
  worldMapShown();
  const iframe = document.getElementById('external-program-iframe');
  if (iframe) setFrameUrl(iframe, 'about:blank');
}

// The generator runs in an iframe on the same origin; its engine exposes window.MM_STAGE (see generator-core.js).
function generatorStage() {
  const frame = document.getElementById('external-program-iframe');
  try { return frame.contentWindow.MM_STAGE || null; } catch (e) { return null; }
}

// Same as the generator's own "Export .STL" button, including its consent prompt.
function saveGeneratorStl() {
  try {
    const btn = document.getElementById('external-program-iframe').contentDocument.getElementById('mm-export-stl');
    if (btn) { btn.click(); return; }
  } catch (e) { /* fall through */ }
  alert('The generator is still loading. Try again in a moment.');
}

// Hands the built model (plus its settings and extras such as stamps) to the Workshop and opens it.
function sendToWorkshop() {
  const stage = generatorStage();
  if (!stage || !stage.getEmbed) { alert('The generator is still loading. Try again in a moment.'); return; }
  const m = stage.getEmbed();
  window.MM_WORKSHOP_INBOX = { gen: activeProgram.id, name: activeProgram.title, params: m.params, state: m.state, parts: m.parts };
  goTo('#/workshop');
}

function renderWorkshop() {
  hideAllScreens();
  document.getElementById('workshop-screen').style.display = 'block';
  document.body.classList.add('on-workshop');
  const iframe = document.getElementById('external-program-iframe');
  if (iframe) setFrameUrl(iframe, 'about:blank');
  openWorkshop();
}

function renderProgram(progId) {
  activeProgram = PROGRAMS.find(p => p.id === progId) || PROGRAMS[0];

  hideAllScreens();
  document.getElementById('viewer-screen').style.display = 'block';
  document.getElementById('viewer-screen').classList.toggle('has-program', Boolean(activeProgram.programUrl));
  const code = `MM-${String(activeProgram.slot).padStart(3, '0')}`;
  document.getElementById('viewer-code').textContent = `${code} // ${activeProgram.category || 'EMPTY BAY'}`;
  document.getElementById('viewer-title').textContent = activeProgram.title || 'UNASSIGNED MODULE';
  document.getElementById('stage-slot-tag').textContent = `MACHINERY SOCKET // ${activeProgram.id}`;

  const iframe = document.getElementById('external-program-iframe');
  const emptyMsg = document.getElementById('empty-stage-message');
  const saveBtns = ['btn-save-stl', 'btn-to-workshop'].map(id => document.getElementById(id));

  if (activeProgram.programUrl) {
    emptyMsg.style.display = 'none';
    iframe.style.display = 'block';
    setFrameUrl(iframe, activeProgram.programUrl);
    saveBtns.forEach(b => { b.disabled = false; });
  } else {
    iframe.style.display = 'none';
    setFrameUrl(iframe, 'about:blank');
    emptyMsg.style.display = 'block';
    saveBtns.forEach(b => { b.disabled = true; });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Consent gate before any file download. Keep the wording in sync with confirmDownload in programs/shared/generator-core.js.
function confirmSiteDownload(proceed) {
  if (document.getElementById('site-consent')) return;
  const modal = document.createElement('div');
  modal.className = 'site-modal';
  modal.id = 'site-consent';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `<div class="site-modal-box">
    <h2>Before you download</h2>
    <p><strong>Safety Warning:</strong> 3D printed objects can shatter or break into small, sharp pieces. Items generated with this tool (such as articulated lanyard links, figures, or small accessories) are a severe choking hazard and are strictly not intended for young children.</p>
    <p>Additionally, if you are generating custom lamp shades or lighting fixtures, do not use them with incandescent bulbs or high-heat sockets. Materials like Matte PLA and Silk PETG will warp, melt, and pose a severe fire hazard.</p>
    <label class="site-modal-agree"><input type="checkbox" id="site-consent-agree"> <span>I understand and accept these safety risks.</span></label>
    <div class="site-modal-actions"><button class="btn" type="button" id="site-consent-cancel">Cancel</button><button class="btn btn-amber" type="button" id="site-consent-go" disabled>Confirm &amp; Download</button></div>
  </div>`;
  const close = () => { document.removeEventListener('keydown', onKey, true); modal.remove(); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey, true);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.body.appendChild(modal);
  const agree = modal.querySelector('#site-consent-agree');
  const go = modal.querySelector('#site-consent-go');
  agree.addEventListener('change', () => { go.disabled = !agree.checked; });
  go.addEventListener('click', () => { if (!agree.checked) return; close(); proceed(); });
  modal.querySelector('#site-consent-cancel').addEventListener('click', close);
  agree.focus();
}

// Shared generators load programs/shared/*. Inline those files so the download works offline.
async function downloadStandaloneHTML() {
  if (!activeProgram.programUrl) return;
  const pageUrl = new URL(activeProgram.programUrl, location.href);
  const page = await fetch(pageUrl).then(r => r.text());
  const [css, core] = await Promise.all([
    fetch(new URL('shared/generator.css', pageUrl)).then(r => r.text()),
    fetch(new URL('shared/generator-core.js', pageUrl)).then(r => r.text())
  ]);
  const inlined = page
    .replace(/<link rel="stylesheet" href="shared\/generator\.css"\s*\/?>/, () => `<style>\n${css}\n</style>`)
    .replace(/<script src="shared\/generator-core\.js"><\/script>/, () => `<script>\n${core}\n</script>`);
  const url = URL.createObjectURL(new Blob([inlined], { type: 'text/html' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activeProgram.id}-generator.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/*************************************************************************
 * 5. 100% FREE, PRECISE-COORDINATE PUBLIC 3D PRINTER RADAR MAP
 *************************************************************************/
// Verified listings live in data/public-printers.json (name, coordinates, source, verified date).
// Unverified OpenStreetMap candidates live in data/osm-candidates.json and are shown only when toggled on.
let PUBLIC_PRINTERS = [];
let CANDIDATE_PRINTERS = [];

async function loadJSON(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    return [];
  }
}

async function loadPublicPrinters() {
  PUBLIC_PRINTERS = await loadJSON('data/public-printers.json');
  CANDIDATE_PRINTERS = await loadJSON('data/osm-candidates.json');
  document.getElementById('candidate-count').textContent = CANDIDATE_PRINTERS.length;
  return PUBLIC_PRINTERS;
}

let leafletMap = null;
let markersLayer = null;
let candidatesLayer = null;
let userMarker = null;

function renderPrinterMap() {
  hideAllScreens();
  document.getElementById('map-screen').style.display = 'block';

  setTimeout(() => {
    if (!leafletMap) {
      initLeafletMap();
    } else {
      leafletMap.invalidateSize();
    }
  }, 120);
}

const NORTH_AMERICA_VIEW = { center: [48.5, -100], zoom: 3 };

function initLeafletMap() {
  leafletMap = L.map('printer-map').setView(NORTH_AMERICA_VIEW.center, NORTH_AMERICA_VIEW.zoom);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    className: 'blueprint-arcgis-tiles',
    attribution: 'Tiles &copy; Esri // MAKER MAKERS FREE KEYLESS RADAR'
  }).addTo(leafletMap);

  markersLayer = L.layerGroup().addTo(leafletMap);
  candidatesLayer = L.layerGroup();
  renderPrinterLocations(PUBLIC_PRINTERS);
}

function placeUserMarker(lat, lng, label) {
  if (userMarker) leafletMap.removeLayer(userMarker);
  userMarker = L.marker([lat, lng], {
    icon: L.divIcon({ className: '', html: '<div class="bp-user-dot"></div>', iconSize: [18, 18] })
  }).addTo(leafletMap).bindPopup(`<div class="bp-popup"><h3>SCAN ORIGIN</h3><p>${label}</p></div>`);
}

// Popup for one location. Entries with verified === false get an unverified notice.
function printerPopupHTML(loc) {
  const unverifiedNotice = loc.verified === false
    ? `<p><strong>UNVERIFIED:</strong> Found on OpenStreetMap. Print-submission policy and cost are not confirmed; check with the site before submitting.</p>`
    : '';
  return `
    <div class="bp-popup">
      <h3>${loc.name}</h3>
      <p><strong>TYPE:</strong> ${loc.type}</p>
      <p><strong>ADDRESS:</strong> ${loc.address}</p>
      ${loc.equipment ? `<p><strong>EQUIPMENT:</strong> ${loc.equipment}</p>` : ''}
      ${loc.access ? `<p><strong>PUBLIC ACCESS:</strong> ${loc.access}</p>` : ''}
      ${loc.fee ? `<p><strong>COST:</strong> ${loc.fee}</p>` : ''}
      ${loc.verifiedDate ? `<p><strong>VERIFIED:</strong> ${loc.verifiedDate} · <a href="${loc.url}" target="_blank" rel="noopener noreferrer">${loc.source}</a></p>` : ''}
      ${unverifiedNotice}
      ${loc.checked ? `<p><strong>CHECK LOG:</strong> ${loc.checked}</p>` : ''}
      ${loc.url ? `<a class="popup-link" href="${loc.url}" target="_blank" rel="noopener noreferrer">&#8599; Visit Website / Submit STL</a>` : ''}
    </div>
  `;
}

function renderPrinterLocations(locations) {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  const listEl = document.getElementById('printer-list');
  document.getElementById('hub-count').textContent = `${locations.length} ACTIVE`;

  const dotIcon = L.divIcon({
    className: '',
    html: '<div class="bp-map-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });

  listEl.innerHTML = '';

  locations.forEach((loc, idx) => {
    const popupHTML = printerPopupHTML(loc);

    const marker = L.marker([loc.lat, loc.lng], { icon: dotIcon })
      .bindPopup(popupHTML)
      .addTo(markersLayer);

    const card = document.createElement('div');
    card.className = 'printer-card';
    card.innerHTML = `
      <span class="badge">${loc.type}${loc.free === true ? ' // FREE' : loc.free === false ? ' // PAID' : ''}</span>
      <h4>${loc.name}</h4>
      <p>${loc.address}</p>
      <p style="color: var(--bp-cyan);">${loc.equipment}</p>
      <a href="${loc.url}" target="_blank" rel="noopener noreferrer" style="color: var(--bp-amber); font-size: 0.72rem; font-weight: bold;" onclick="event.stopPropagation();">&#8599; Open Official Website</a>
    `;
    card.onclick = () => {
      leafletMap.flyTo([loc.lat, loc.lng], 16, { duration: 0.8 });
      marker.openPopup();
    };
    listEl.appendChild(card);

    if (idx === 0) {
      setTimeout(() => marker.openPopup(), 300);
    }
  });
}

// Unverified candidates are drawn on their own layer, off unless the toggle is checked.
let showCandidates = false;

function renderCandidateMarkers() {
  if (!candidatesLayer) return;
  candidatesLayer.clearLayers();
  if (!showCandidates) return;

  const candidateIcon = L.divIcon({
    className: '',
    html: '<div class="bp-map-dot bp-map-dot-candidate"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  CANDIDATE_PRINTERS.forEach(loc => {
    L.marker([loc.lat, loc.lng], { icon: candidateIcon })
      .bindPopup(printerPopupHTML(loc))
      .addTo(candidatesLayer);
  });
}

function toggleCandidates(on) {
  showCandidates = on;
  if (!leafletMap) return;
  if (on) {
    candidatesLayer.addTo(leafletMap);
  } else {
    leafletMap.removeLayer(candidatesLayer);
  }
  renderCandidateMarkers();
}

function resetToNorthAmerica() {
  if (!leafletMap) return;
  document.getElementById('map-status-tag').textContent = 'SECTOR: US & CANADA (VERIFIED LISTINGS)';
  leafletMap.flyTo(NORTH_AMERICA_VIEW.center, NORTH_AMERICA_VIEW.zoom, { duration: 1 });
  renderPrinterLocations(PUBLIC_PRINTERS);
}

async function searchLocationWorldwide() {
  const query = document.getElementById('map-search-input').value.trim();
  if (!query) return;

  document.getElementById('map-status-tag').textContent = `GEOCODING "${query.toUpperCase()}"...`;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();
    if (!data || data.length === 0) {
      document.getElementById('map-status-tag').textContent = 'LOCATION NOT FOUND // SHOWING US & CANADA';
      return;
    }
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    await scanGlobalPrintersNear(lat, lon, data[0].display_name.split(',')[0].toUpperCase());
  } catch (e) {
    resetToNorthAmerica();
  }
}

async function scanGlobalPrintersNear(lat, lng, label) {
  // Only a typed search reaches here. The lookup sends coordinates rounded to ~1 km.
  const qLat = lat.toFixed(2), qLng = lng.toFixed(2);
  if (!leafletMap) initLeafletMap();
  leafletMap.flyTo([lat, lng], 13, { duration: 1 });

  placeUserMarker(lat, lng, label);

  let combinedResults = PUBLIC_PRINTERS.filter(loc => Math.hypot(lat - loc.lat, lng - loc.lng) < 0.45);

  document.getElementById('map-status-tag').textContent = `SCANNING MAKERSPACES & LIBRARIES NEAR ${label}...`;

  const overpassQuery = `
    [out:json][timeout:12];
    (
      node["leisure"="hackerspace"](around:25000,${qLat},${qLng});
      way["leisure"="hackerspace"](around:25000,${qLat},${qLng});
      node["craft"="3d_printing"](around:25000,${qLat},${qLng});
      node["amenity"="library"](around:15000,${qLat},${qLng});
      way["amenity"="library"](around:15000,${qLat},${qLng});
    );
    out center 25;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery
    });
    const json = await response.json();

    const osmLocations = (json.elements || []).map(el => {
      const elLat = el.lat || (el.center && el.center.lat);
      const elLon = el.lon || (el.center && el.center.lon);
      const tags = el.tags || {};
      const name = tags.name || 'Community Makerspace / Public Library';
      const isMaker = tags.leisure === 'hackerspace' || tags.craft === '3d_printing';
      const website = tags.website || tags['contact:website'] || `https://www.google.com/search?q=${encodeURIComponent(name + ' 3D printing makerspace')}`;

      return {
        name,
        type: isMaker ? 'MAKERSPACE / FABLAB' : 'PUBLIC LIBRARY (CHECK 3D PRINT DESK)',
        lat: elLat,
        lng: elLon,
        address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(' ') || `Coords: ${elLat.toFixed(4)}, ${elLon.toFixed(4)}`,
        equipment: isMaker ? 'Public 3D Printers / Rapid Prototyping Gear' : 'Public Library Tech Center — Call/Check link for .STL queue',
        access: 'Click website link below for submission hours & filament policies.',
        url: website,
        verified: false
      };
    }).filter(item => item.lat && item.lng);

    const existingNames = new Set(combinedResults.map(r => r.name.toLowerCase()));
    for (const loc of osmLocations) {
      if (!existingNames.has(loc.name.toLowerCase())) {
        combinedResults.push(loc);
        existingNames.add(loc.name.toLowerCase());
      }
    }
  } catch (err) {}

  if (combinedResults.length === 0) {
    combinedResults = PUBLIC_PRINTERS;
    document.getElementById('map-status-tag').textContent = `NO PUBLIC HUBS DETECTED IN SECTOR // SHOWING US & CANADA`;
  } else {
    document.getElementById('map-status-tag').textContent = `SECTOR SCAN COMPLETE: ${combinedResults.length} HUBS NEAR ${label}`;
  }

  renderPrinterLocations(combinedResults);
}

loadPublicPrinters().then(() => {
  if (leafletMap) {
    renderPrinterLocations(PUBLIC_PRINTERS);
    renderCandidateMarkers();
  }
});

initSplash();
window.addEventListener('hashchange', renderRoute);
renderRoute();
