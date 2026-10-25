function createMachineryFrameHTML(prog) {
  const hasThumb = Boolean(prog.thumbnailUrl);
  const displayTitle = prog.title || 'UNASSIGNED MODULE';
  const displayCat = prog.category || 'AWAITING UPLOAD';

  const visualContent = hasThumb
    ? `<img class="swappable-thumb" src="${prog.thumbnailUrl}" alt="${displayTitle}">`
    : `<div class="socket-empty-bay">
         <div class="crosshair"></div>
         <span>[ EMPTY SOCKET ]</span>
       </div>`;

  return `
    <div class="machinery-frame" onclick="openProgram('${prog.id}')" title="${prog.id}">
      <div class="machinery-clamp-top"></div>
      <span class="rivet tl"></span><span class="rivet tr"></span>
      <span class="rivet bl"></span><span class="rivet br"></span>
      <div class="thumbnail-socket">
        <div class="socket-top-bar">
          <span>${prog.id}</span>
          <span>#${prog.slot}</span>
        </div>
        ${visualContent}
        <div class="socket-labelplate">
          <h4>${displayTitle}</h4>
          <span>${displayCat}</span>
        </div>
      </div>
    </div>
  `;
}

let currentSlide = 0;
let featuredList = [];
let carouselTimer = null;

function initSplash() {
  document.getElementById('program-grid').innerHTML = PROGRAMS.map(p => createMachineryFrameHTML(p)).join('');

  featuredList = PROGRAMS.filter(p => p.featured);
  const trackEl = document.getElementById('carousel-track');
  const dotsEl = document.getElementById('carousel-dots');

  trackEl.innerHTML = featuredList.map((prog, idx) => `
    <div class="carousel-slide">
      <div style="max-width: 220px; margin: 0 auto; width: 100%;">
        ${createMachineryFrameHTML(prog)}
      </div>
      <div class="carousel-info">
        <div>
          <span class="featured-badge">FEATURED SLOT 0${idx + 1} // STANDBY</span>
          <h3>${prog.title || `[ EMPTY FEATURED SLOT 0${idx + 1} ]`}</h3>
          <p>${prog.description || 'No generator assigned to this featured carousel slot yet.'}</p>
          <div class="spec-table">
            <div><strong>SOCKET ID</strong>${prog.id}</div>
            <div><strong>TARGET EXPORTS</strong>.STL / .3MF / .HTML</div>
            <div><strong>STATUS</strong>${prog.programUrl ? 'ONLINE' : 'EMPTY TEMPLATE'}</div>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="btn" onclick="openProgram('${prog.id}')">&#9881; Inspect Slot Shell</button>
        </div>
      </div>
    </div>
  `).join('');

  dotsEl.innerHTML = featuredList.map((_, idx) =>
    `<button class="dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${idx})"></button>`
  ).join('');

  startCarouselAutoPlay();
  renderIdeasLog();
}

function updateCarouselPosition() {
  document.getElementById('carousel-track').style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === currentSlide));
}

function moveCarousel(dir) {
  currentSlide = (currentSlide + dir + featuredList.length) % featuredList.length;
  updateCarouselPosition();
  startCarouselAutoPlay();
}

function goToSlide(idx) {
  currentSlide = idx;
  updateCarouselPosition();
  startCarouselAutoPlay();
}

function startCarouselAutoPlay() {
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    currentSlide = (currentSlide + 1) % featuredList.length;
    updateCarouselPosition();
  }, 5500);
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
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('viewer-screen').style.display = 'none';
  document.getElementById('map-screen').style.display = 'none';
}

function showSplashScreen() {
  hideAllScreens();
  document.getElementById('splash-screen').style.display = 'block';
}

function openProgram(progId) {
  activeProgram = PROGRAMS.find(p => p.id === progId) || PROGRAMS[0];

  hideAllScreens();
  document.getElementById('viewer-screen').style.display = 'block';
  document.getElementById('viewer-code').textContent = `${activeProgram.id} // ${activeProgram.category || 'EMPTY BAY'}`;
  document.getElementById('viewer-title').textContent = activeProgram.title || 'UNASSIGNED MODULE';
  document.getElementById('stage-slot-tag').textContent = `MACHINERY SOCKET // ${activeProgram.id}`;

  const iframe = document.getElementById('external-program-iframe');
  const emptyMsg = document.getElementById('empty-stage-message');
  const dlBtn = document.getElementById('btn-dl-html');

  if (activeProgram.programUrl) {
    emptyMsg.style.display = 'none';
    iframe.style.display = 'block';
    iframe.src = activeProgram.programUrl;
    dlBtn.disabled = false;
  } else {
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    emptyMsg.style.display = 'block';
    dlBtn.disabled = true;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadStandaloneHTML() {
  if (!activeProgram.programUrl) return;
  const a = document.createElement('a');
  a.href = activeProgram.programUrl;
  a.download = `${activeProgram.id}-generator.html`;
  a.click();
}

/*************************************************************************
 * 5. 100% FREE, PRECISE-COORDINATE PUBLIC 3D PRINTER RADAR MAP
 *************************************************************************/
const DOVER_NH_PRINTERS = [
  {
    name: 'Dover Public Library Makerspace',
    type: 'PUBLIC LIBRARY // STL SUBMISSION',
    lat: 43.1932,
    lng: -70.8755,
    address: '73 Locust St, Dover, NH 03820',
    equipment: 'Ultimaker 2+ (PLA Filament, $1.50/oz, max 8" build)',
    access: 'Public .STL file submission via online form or email.',
    url: 'https://www.dover.nh.gov/government/city-operations/library/services/makerspace/3d-print.html'
  },
  {
    name: 'UNH CEPS Makerspace (Kingsbury Hall)',
    type: 'UNIVERSITY MAKERSPACE',
    lat: 43.1336,
    lng: -70.9352,
    address: '33 Academic Way, Durham, NH 03824',
    equipment: 'Bambu Lab X1 Carbon, Formlabs 3+ & 4L Resin Printers, 3D Scanner',
    access: 'Open to UNH students/staff & community collaboration inquiries.',
    url: 'https://ceps.unh.edu/about/ceps-makerspace'
  },
  {
    name: 'Portsmouth Public Library Lab',
    type: 'PUBLIC LIBRARY // 3D PRINTING',
    lat: 43.0722,
    lng: -70.7596,
    address: '175 Parrott Ave, Portsmouth, NH 03801',
    equipment: 'FDM 3D Printers & Digital Fabrication Tools',
    access: 'Public library cardholders & community workshops.',
    url: 'https://www.cityofportsmouth.com/library'
  },
  {
    name: 'Port City Makerspace',
    type: 'COMMUNITY MAKERSPACE',
    lat: 43.0745,
    lng: -70.7712,
    address: '68 Morning St, Portsmouth, NH 03801',
    equipment: 'FDM & SLA 3D Printers, Laser Cutters, CNC, Wood/Metal Shop',
    access: 'Public day passes, memberships, and open shop hours.',
    url: 'https://www.portcitymakerspace.com/'
  },
  {
    name: 'Somersworth Public Library',
    type: 'LOCAL LIBRARY HUB',
    lat: 43.2592,
    lng: -70.8675,
    address: '25 Main St, Somersworth, NH 03878',
    equipment: 'Community Maker & Technology Services',
    access: 'Local public access 10 mins north of Dover 03820.',
    url: 'https://www.somersworthnh.gov/library'
  },
  {
    name: 'MakeIt Labs (Nashua NH Regional Hub)',
    type: 'NH LARGEST MAKERSPACE',
    lat: 42.7654,
    lng: -71.4676,
    address: '25 Crown St, Nashua, NH 03060',
    equipment: 'Multi-printer 3D Printing Lab, Rapid Prototyping & CNC',
    access: 'Public memberships, classes, and open house tours.',
    url: 'https://www.makeitlabs.com/'
  }
];

let leafletMap = null;
let markersLayer = null;
let userMarker = null;

function showPrinterMapScreen() {
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

function initLeafletMap() {
  leafletMap = L.map('printer-map').setView([43.1932, -70.8755], 12);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    className: 'blueprint-arcgis-tiles',
    attribution: 'Tiles &copy; Esri // MAKER MAKERS FREE KEYLESS RADAR'
  }).addTo(leafletMap);

  markersLayer = L.layerGroup().addTo(leafletMap);
  renderPrinterLocations(DOVER_NH_PRINTERS);
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
    const popupHTML = `
      <div class="bp-popup">
        <h3>${loc.name}</h3>
        <p><strong>TYPE:</strong> ${loc.type}</p>
        <p><strong>ADDRESS:</strong> ${loc.address}</p>
        <p><strong>EQUIPMENT:</strong> ${loc.equipment}</p>
        <p><strong>PUBLIC ACCESS:</strong> ${loc.access}</p>
        <a class="popup-link" href="${loc.url}" target="_blank" rel="noopener noreferrer">&#8599; Visit Website / Submit STL</a>
      </div>
    `;

    const marker = L.marker([loc.lat, loc.lng], { icon: dotIcon })
      .bindPopup(popupHTML)
      .addTo(markersLayer);

    const card = document.createElement('div');
    card.className = 'printer-card';
    card.innerHTML = `
      <span class="badge">${loc.type}</span>
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

function centerOnDoverNH() {
  if (!leafletMap) return;
  document.getElementById('map-status-tag').textContent = 'SECTOR: DOVER, NH 03820 (VERIFIED SEACOAST HUBS)';
  leafletMap.flyTo([43.1932, -70.8755], 12, { duration: 1 });
  renderPrinterLocations(DOVER_NH_PRINTERS);
}

function locateUserGPS() {
  if (!navigator.geolocation) {
    centerOnDoverNH();
    return;
  }
  document.getElementById('map-status-tag').textContent = 'ACQUIRING GPS TELEMETRY...';
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await scanGlobalPrintersNear(latitude, longitude, 'YOUR GPS LOCATION');
    },
    () => {
      document.getElementById('map-status-tag').textContent = 'GPS UNAVAILABLE IN SANDBOX // SHOWING DOVER, NH 03820';
      centerOnDoverNH();
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

async function searchLocationWorldwide() {
  const query = document.getElementById('map-search-input').value.trim();
  if (!query) return;

  document.getElementById('map-status-tag').textContent = `GEOCODING "${query.toUpperCase()}"...`;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();
    if (!data || data.length === 0) {
      document.getElementById('map-status-tag').textContent = 'LOCATION NOT FOUND // SHOWING DOVER, NH 03820';
      return;
    }
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    await scanGlobalPrintersNear(lat, lon, data[0].display_name.split(',')[0].toUpperCase());
  } catch (e) {
    centerOnDoverNH();
  }
}

async function scanGlobalPrintersNear(lat, lng, label) {
  if (!leafletMap) initLeafletMap();
  leafletMap.flyTo([lat, lng], 13, { duration: 1 });

  if (userMarker) leafletMap.removeLayer(userMarker);
  userMarker = L.marker([lat, lng], {
    icon: L.divIcon({ className: '', html: '<div class="bp-user-dot"></div>', iconSize: [18, 18] })
  }).addTo(leafletMap).bindPopup(`<div class="bp-popup"><h3>SCAN ORIGIN</h3><p>${label}</p></div>`);

  const distFromDover = Math.hypot(lat - 43.1932, lng - (-70.8755));
  let combinedResults = distFromDover < 0.45 ? [...DOVER_NH_PRINTERS] : [];

  document.getElementById('map-status-tag').textContent = `SCANNING MAKERSPACES & LIBRARIES NEAR ${label}...`;

  const overpassQuery = `
    [out:json][timeout:12];
    (
      node["leisure"="hackerspace"](around:25000,${lat},${lng});
      way["leisure"="hackerspace"](around:25000,${lat},${lng});
      node["craft"="3d_printing"](around:25000,${lat},${lng});
      node["amenity"="library"](around:15000,${lat},${lng});
      way["amenity"="library"](around:15000,${lat},${lng});
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
        url: website
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
    combinedResults = DOVER_NH_PRINTERS;
    document.getElementById('map-status-tag').textContent = `NO PUBLIC HUBS DETECTED IN SECTOR // SHOWING DOVER, NH 03820`;
  } else {
    document.getElementById('map-status-tag').textContent = `SECTOR SCAN COMPLETE: ${combinedResults.length} HUBS NEAR ${label}`;
  }

  renderPrinterLocations(combinedResults);
}

initSplash();
