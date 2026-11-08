// 3D Printing Guides: a searchable list of links to guides on other sites.
// Every URL here was opened and loaded when this list was written (8 Nov 2026).
// Add an entry to GUIDES; no other code needs to change. Plain text only (it is escaped on render).
var GUIDES = [
  { title: 'Bambu Lab Wiki', url: 'https://wiki.bambulab.com/en/home', topic: 'Printer manuals', source: 'Bambu Lab',
    desc: 'Official wiki: printer manuals, AMS, Bambu Studio, filament, maintenance and troubleshooting.', tags: 'bambu x1 p1 a1 h2d ams bambu studio maintenance troubleshooting official' },
  { title: 'Prusa Knowledge Base', url: 'https://help.prusa3d.com/', topic: 'Printer manuals', source: 'Prusa Research',
    desc: 'Official guides for Prusa printers, PrusaSlicer, materials, assembly and print problems.', tags: 'prusa mk4 mk3 mini core one prusaslicer troubleshooting official' },
  { title: 'Creality Wiki', url: 'https://wiki.creality.com/', topic: 'Printer manuals', source: 'Creality',
    desc: 'Official Creality wiki: manuals and setup for Ender, K1 and other Creality printers.', tags: 'creality ender k1 cr-10 official manual' },
  { title: 'ELEGOO Wiki', url: 'https://wiki.elegoo.com/', topic: 'Printer manuals', source: 'ELEGOO',
    desc: 'Official ELEGOO wiki: manuals and setup for Neptune, Centauri and resin printers.', tags: 'elegoo neptune centauri saturn mars resin official manual' },
  { title: 'OrcaSlicer Wiki', url: 'https://www.orcaslicer.com/wiki/', topic: 'Slicers', source: 'OrcaSlicer',
    desc: 'Official OrcaSlicer wiki: print settings explained, calibration tools and release notes.', tags: 'orca orcaslicer slicer settings calibration bambu' },
  { title: 'OrcaSlicer Wiki (GitHub)', url: 'https://github.com/SoftFever/OrcaSlicer/wiki', topic: 'Slicers', source: 'GitHub',
    desc: 'The same wiki on GitHub, handy if the main site is slow.', tags: 'orca orcaslicer slicer github' },
  { title: 'Ellis\' Print Tuning Guide', url: 'https://ellis3dp.com/Print-Tuning-Guide/', topic: 'Calibration', source: 'Ellis',
    desc: 'Step-by-step tuning: extruder calibration, pressure advance, retraction, first layer and print defects.', tags: 'calibration tuning pressure advance retraction flow extruder troubleshooting klipper' },
  { title: 'Teaching Tech Calibration Guide', url: 'https://teachingtechyt.github.io/calibration.html', topic: 'Calibration', source: 'Teaching Tech',
    desc: 'A browser calibration tool and guide: frame check, e-steps, flow, temperature, retraction, speed and acceleration.', tags: 'calibration temperature tower e-steps flow retraction acceleration beginner' },
  { title: 'Simplify3D Print Quality Guide', url: 'https://www.simplify3d.com/resources/print-quality-troubleshooting/', topic: 'Troubleshooting', source: 'Simplify3D',
    desc: 'Photos of about 30 common print defects (stringing, warping, under-extrusion, layer shifts) with fixes.', tags: 'troubleshooting stringing warping under-extrusion layer shift defects quality any printer' },
  { title: 'Klipper Documentation', url: 'https://www.klipper3d.org/', topic: 'Firmware & control', source: 'Klipper',
    desc: 'Install, configure and tune Klipper: bed leveling, pressure advance, resonance compensation.', tags: 'klipper firmware config pressure advance input shaper bed leveling' },
  { title: 'Mainsail Docs', url: 'https://docs.mainsail.xyz/', topic: 'Firmware & control', source: 'Mainsail',
    desc: 'Set up and use the Mainsail web interface for Klipper printers.', tags: 'mainsail klipper web interface setup' },
  { title: 'OctoPrint Documentation', url: 'https://docs.octoprint.org/', topic: 'Firmware & control', source: 'OctoPrint',
    desc: 'Docs for the OctoPrint web interface: features, plugins and events.', tags: 'octoprint raspberry pi remote monitoring plugins' },
  { title: 'Voron Documentation', url: 'https://docs.vorondesign.com/', topic: 'Build your own', source: 'Voron Design',
    desc: 'Build, wiring, software and tuning docs for Voron printers, plus community guides.', tags: 'voron diy build corexy enclosed wiring' }
];

var guidesState = { q: '', topic: '' };

function guidesTopics() {
  var seen = [];
  GUIDES.forEach(function (g) { if (seen.indexOf(g.topic) < 0) seen.push(g.topic); });
  return seen;
}

function initGuides() {
  var box = document.getElementById('guides-filters');
  var search = document.getElementById('guides-search');
  if (!box || !search) return;
  var topics = [''].concat(guidesTopics());
  box.innerHTML = topics.map(function (t) {
    return '<button type="button" class="btn guides-chip" data-topic="' + escapeHTML(t) + '" aria-pressed="' + (t === '' ? 'true' : 'false') + '">' + escapeHTML(t || 'All') + '</button>';
  }).join('');
  box.addEventListener('click', function (e) {
    var b = e.target.closest('.guides-chip');
    if (!b) return;
    guidesState.topic = b.dataset.topic;
    renderGuidesList();
  });
  search.addEventListener('input', function () { guidesState.q = search.value; renderGuidesList(); });
  renderGuidesList();
}

function renderGuidesList() {
  var list = document.getElementById('guides-list');
  if (!list) return;
  var words = guidesState.q.toLowerCase().split(/\s+/).filter(Boolean);
  var shown = GUIDES.filter(function (g) {
    if (guidesState.topic && g.topic !== guidesState.topic) return false;
    var hay = (g.title + ' ' + g.desc + ' ' + g.topic + ' ' + g.source + ' ' + (g.tags || '')).toLowerCase();
    return words.every(function (w) { return hay.indexOf(w) >= 0; });
  });
  document.querySelectorAll('.guides-chip').forEach(function (b) {
    b.setAttribute('aria-pressed', b.dataset.topic === guidesState.topic ? 'true' : 'false');
  });
  document.getElementById('guides-count').textContent = shown.length + ' OF ' + GUIDES.length + ' GUIDES';
  if (!shown.length) {
    list.innerHTML = '<div class="guides-empty">No guides match. Try fewer words or pick All.</div>';
    return;
  }
  list.innerHTML = shown.map(function (g) {
    return '<a class="guide-card" href="' + escapeHTML(g.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="guide-kicker">' + escapeHTML(g.topic) + ' // ' + escapeHTML(g.source) + '</span>' +
      '<strong>' + escapeHTML(g.title) + ' <span aria-hidden="true">&#8599;</span></strong>' +
      '<span class="guide-desc">' + escapeHTML(g.desc) + '</span>' +
      '<span class="guide-host">' + escapeHTML(g.url.replace(/^https:\/\//, '').replace(/\/$/, '')) + '</span></a>';
  }).join('');
}

function renderGuides() {
  hideAllScreens();
  document.getElementById('guides-screen').style.display = 'block';
  var iframe = document.getElementById('external-program-iframe');
  if (iframe) setFrameUrl(iframe, 'about:blank');
  window.scrollTo({ top: 0 });
}
