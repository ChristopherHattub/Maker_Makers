# Maker Makers: agent entry point

A static website of parametric 3D-print generators (STL / OBJ), a Workshop 3D editor, and a map of public 3D printers. Plain HTML, CSS and JavaScript. **No build step, no dependencies, no backend.** Read this page first, then the doc for the area you are touching (index at [docs/README.md](docs/README.md)).

## Run it

```bash
npm run dev          # http://localhost:5173 with live reload (opens a browser)
npm run serve        # same, without opening a browser
```

Node 18+, no `npm install`. In the desktop app use the `maker-makers` entry in `.claude/launch.json` (same server, port 5173) via the preview tool, not Bash. There are no tests or linters; check by hand in the browser (see [docs/development.md](docs/development.md)). The one automated check is the printability workflow on GitHub Actions, one job per generator ([docs/printability-ci.md](docs/printability-ci.md)); locally `npm install --no-save three@0.128.0` once, then `node scripts/ci/check-generator.mjs <name>`. Work in a git worktree off `origin/main` when other branches are in flight; stage files by path, never `git add -A`.

## Deploy

GitHub Pages serves the repo root straight from `main` (no workflow, `.nojekyll`). **Pushing to `main` is publishing.** Use relative paths everywhere (the site lives under a project subpath). See [docs/deployment.md](docs/deployment.md).

## Architecture in one screen

- `index.html` holds four screens shown one at a time: `#splash-screen` (homepage world map), `#viewer-screen` (generator iframe), `#workshop-screen` and `#map-screen` (printer radar). URL hash: none = homepage, `#/generator/SLOT-NN`, `#/workshop`, `#/map`. See [docs/architecture.md](docs/architecture.md).
- `js/programs.js` is the data: `GENERATORS` (slots) and `BUNDLES` (groups). Everything on the homepage is built from it. [docs/generator-registry.md](docs/generator-registry.md), [docs/slot-registry.md](docs/slot-registry.md).
- `js/worldmap.js` lays out and renders the homepage; `js/workshop.js` is the Workshop editor; `js/app.js` is navigation, viewer and printer map; `js/guides.js` is the printing guides page. [docs/homepage.md](docs/homepage.md), [docs/workshop.md](docs/workshop.md).
- Each generator is one page in `programs/` holding only config + `build()`. The shared engine `programs/shared/generator-core.js` + `generator.css` supplies the UI, Color tool, exports and phone layout. **Never restyle a generator page or write per-generator mobile CSS**; fix it in the engine for everyone. [docs/generator-styling.md](docs/generator-styling.md).
- `programs/shared/print-check.js` is the printability check (floating parts, overhangs over ~50°, thin walls). The engine shows it as a live chip over the 3D view and `check-mesh.mjs` prints it. Treat a red chip on a default or preset as a bug. [docs/generator-styling.md](docs/generator-styling.md#print-check-live-warning-chip).
- Skill for making generators: `.claude/skills/makermakers-generator/` (template, `check-mesh.mjs` printability check, thumbnail template).
- Flexi creatures (slots 91-100) are generated from `tools/flexi/`; edit the sources and run `node tools/flexi/build.mjs`. [docs/flexi-creatures.md](docs/flexi-creatures.md).
- Hover holograms on homepage tiles are rendered from the real models (`tools/hologram.html`, `scripts/build-holo.py`). A new generator needs a hologram render. [docs/hologram-tiles.md](docs/hologram-tiles.md).

## Slots

Slots 1-75 are built (14 and 39 are unused gaps), 76-90 are the animals (`tools/animals/`, [docs/animals.md](docs/animals.md)), 91-100 are the Flexi Creatures, 101 is the Text Generator, 102 is the Fancy Ring, 103 is the Pin Maker, 104 is the Paper Towel Holder, 105 is the Sedan Maker, 106 is the Console Faceplate, 108 is the Nutcracker, 112 is the Pet Bowl Housing. Next free slot: 109 (check open PRs first; 113 and up are free too). Full list: [docs/slot-registry.md](docs/slot-registry.md).

## Adding a generator (checklist)

1. Page in `programs/<name>.html` from the skill's template; run `check-mesh.mjs` on defaults, every preset and slider extremes.
2. Thumbnail `assets/thumbnails/<name>.svg` from `thumbnail-template.svg`.
3. `GENERATORS` entry in `js/programs.js` with the next free slot and a `bundle`.
4. Hologram tile (poster + atlas) via [docs/hologram-tiles.md](docs/hologram-tiles.md).
5. Side-panel preview render (full colour) via [docs/homepage.md](docs/homepage.md#side-panel-previews-full-colour).
6. Verify live (desktop and 375x667 / 390x844), then update [docs/slot-registry.md](docs/slot-registry.md).

Defaults and presets should print with no supports. Say in a slider label which extremes bring supports back.

## Exports

**Export .STL** (binary, no colour) and **Export .OBJ (colors)**: a zip containing `name.obj` + `name.mtl`, one material per Color-tab colour, for Bambu / Orca / Prusa to map to filaments. **There is no 3MF export**; it was replaced and no print settings are written. Every download goes through the consent modal (`confirmDownload`). The site viewer's top bar also has Save STL and Send to Workshop; the Workshop saves STL and OBJ zip too.

## Privacy rule (hard rule): no data collection

The site collects nothing and sends nothing about visitors anywhere. No analytics, trackers, cookies, accounts, telemetry, ad or font beacons, or server calls of our own. Do not add any. `localStorage` is allowed only for the visitor's own convenience (homepage layout `mm-home-layout`, Workshop autosave) and every use is wrapped in `try/catch`. The printer map never requests the visitor's location; the only text sent out is a place search the visitor types, to OpenStreetMap Nominatim and Overpass, with coordinates rounded. Models and files stay in the browser. All third-party code and fonts are self-hosted in `vendor/` (three.js r128 + controls, Leaflet 1.9.4, the Workshop CSG bundle, Fredoka and Nunito); no CDN is contacted. The only outside requests are map tiles (Esri) and the place search. See [docs/architecture.md](docs/architecture.md).

## Printer map: verified vs unverified

`data/public-printers.json` holds **verified** listings: only facts confirmed on the venue's official page, each with a `verifiedDate`. Only these appear in the directory and the "N ACTIVE" count. `data/osm-candidates.json` and live Overpass results are **unverified**: dimmed, off by default, labelled UNVERIFIED. OpenStreetMap proves a space exists, not that the public can submit prints, so never move or add an entry to the verified file without checking the official page. Never state in the UI that a location accepts public prints unless it is verified. See [docs/printer-map.md](docs/printer-map.md).

## Conventions

JS: single quotes, semicolons, 2-space indent, `var`/function style inside generators. UTF-8, LF, final newline (`.editorconfig`). Plain-text titles and descriptions (the homepage escapes them; keep them free of markup). Escape anything that comes from outside the repo's own data. Keep docs in step with code: update `docs/` in the same change.

## Known untested / open items

- **Dice Tower** (slot 66): a small round castle printed and worked (2026-10-31), the first print reported as a success. Its other themes, tray shapes and stamps are unprinted. [docs/dice-tower.md](docs/dice-tower.md).
- **Most generators have not been physically printed.** Printability is checked only by `check-mesh.mjs` (watertight, manifold) and, for flexi creatures, `check-flexi.mjs` (joint clearance). Treat supports-free claims and flexi clearances as unproven until real prints.
- **Pumpkin Plotter** (slot 2) had a reported test error; details were not recorded. `check-mesh.mjs` on the defaults currently passes (combined surface watertight), so re-test its Carve tab and presets before trusting it.
- **Rattle Ball Cage** (slot 48): Chris's first print (icosahedron, round ball) failed: sagging struts, a flat top bridge, and the round ball's underside started in mid-air. The default is now the support-free Lantern cage (bars at least 47° from flat, ball on a stout 6 mm pedestal with a 1.7 mm snap-off neck, 41° ball underside). Print 1 of it: cage printed well, but the ball (first version on a 1.5 mm pin) collapsed halfway; the pedestal is the fix and is unprinted. It passes the print check and a mesh trap test, but has not been physically printed yet. The classic polyhedra are kept and labelled "needs supports".
- **Spinner Ring** (slot 46): two prints of the rigid snap-fit band jammed while turning flat. The inner band now has a slit and pushes in straight ([docs/spinner-ring.md](docs/spinner-ring.md)); that version has not been printed. Its hologram tile and side-panel render still show the older ring.
- **Fancy Ring** (slot 102): prints as two halves glued around the stone. Unprinted; the glue seam and fit of the stone are unproven. [docs/fancy-ring.md](docs/fancy-ring.md).
- **Pin Maker** (slot 103): a picture traced into a badge pin, in the browser only. Unprinted; it has a flat back for a glued pin-back, no printed pin-back. [docs/pin-maker.md](docs/pin-maker.md).
- **Sedan Maker** (slot 105): a toy sedan with print-in-place wheels in round wheel wells, on hidden diamond-section axle pins, plus a Car parts stamp tab. Unprinted; the tolerance, the hidden axle heads and the tire flats are unproven. The round arches read "needs supports" in the print check (a short bridge, recorded in the baseline). [docs/sedan-maker.md](docs/sedan-maker.md).
- **Console Faceplate** (slot 106): flat decorative covers for Switch / Switch 2 dock, PS5 panel and Xbox Series X front, at fixed sizes. The plate sizes are estimates, not measured on hardware, and nothing is printed. No hologram tile or side-panel render yet. [docs/console-faceplate.md](docs/console-faceplate.md).
- **Nutcracker** (slot 108): working jaw prints in place (quarter-disc chin in a concentric bowl, diamond pins, 0.35 mm default gap). Unprinted; the gap, the 30° opening and the thin side-hair plates are unproven. [docs/nutcracker.md](docs/nutcracker.md).
- **Infinity Cube** was dropped from the plan and has no slot; do not look for it.
- **Hologram tiles are weak for some generators** (thin, flat or low-contrast models read poorly). Retune with `scripts/hologram-config.json` or re-render.
- Workshop: generator shapes are single-colour and not autosaved. Overpass scan errors are swallowed (a failed scan looks empty). See "Known issues" in [docs/architecture.md](docs/architecture.md).
