# Architecture

## Overview

The site is a single HTML page (`index.html`) with four screens that share one page. `js/app.js` switches between them by showing and hiding sections, driven by the URL hash. There is no framework and no server-side code.

```
index.html
 ├── Header (brand, screen buttons, "Submit Generator Idea")
 ├── <main>
 │    ├── #splash-screen    generator world map (pannable regions of tiles, js/worldmap.js)
 │    ├── #viewer-screen    generator viewer (iframe + top bar)
 │    ├── #workshop-screen  Workshop 3D editor (js/workshop.js)
 │    └── #map-screen       printer radar (Leaflet + directory list)
 ├── Idea modal (#idea-modal)
 └── Footer (with the site disclaimer)
```

Script load order at the bottom of `index.html`:

1. `js/programs.js` defines `GENERATORS`, `BUNDLES` and the `PROGRAMS` array built from them (the slot registry).
2. `js/worldmap.js` holds the homepage world map (layout, camera, hologram hover tiles, minimap, sort and rearrange).
3. `js/workshop.js` holds the Workshop editor. It loads three.js itself the first time the Workshop opens.
4. `js/app.js` holds the router, viewer, idea queue and printer map. At the end of the file it starts loading the printer data, runs `initSplash()`, then renders the current route.

Leaflet 1.9.4 is loaded from unpkg in the `<head>` (CSS) and before the local scripts (JS).

## Screens

Only one screen is visible at a time. Navigation sets `location.hash`; `renderRoute()` runs on every `hashchange`, calls `hideAllScreens()` and shows the screen for the hash. So Back and Forward work.

| Hash | Renderer | Reached from | Notes |
| --- | --- | --- | --- |
| (none) | `renderSplash()` | `showSplashScreen()`, brand block, "Generators" | Blanks the generator iframe |
| `#/generator/SLOT-NN` | `renderProgram(id)` | `openProgram(id)` (map tiles and panel) | Loads `programUrl` into the iframe with `location.replace` (no extra history entry) or shows the empty-bay message |
| `#/workshop` | `renderWorkshop()` | Workshop tile, `sendToWorkshop()` | Calls `openWorkshop()` in `js/workshop.js` |
| `#/map` | `renderPrinterMap()` | `showPrinterMapScreen()` | Creates the Leaflet map on first open, otherwise calls `invalidateSize()` |

## Viewer

The viewer's top bar shows the code, category and title, plus three buttons:

- **Save STL** clicks the generator's own Export .STL button inside the iframe (`saveGeneratorStl()`), so its consent prompt still runs.
- **Send to Workshop** reads the model, settings and extras from the generator (`window.MM_STAGE.getEmbed()`, exposed by the engine), puts them in `window.MM_WORKSHOP_INBOX`, and opens `#/workshop` (`sendToWorkshop()`).
- **Back to Generators.**

The generator runs on the same origin, so the viewer can reach into the iframe. For a slot with a `programUrl` the old placeholder control panel (disabled Export buttons) is hidden by the `has-program` class and the iframe fills the screen.

## Rendering model

Everything on the hub and viewer is generated from data at load time:

- `initSplash()` calls `initWorldMap()` in `js/worldmap.js`, which lays out every group in `BUNDLES` as a region of tiles on the world map (see [homepage.md](homepage.md)).
- Selecting a tile opens a details panel; selecting it again (or "Open generator") calls `openProgram('SLOT-NN')`.

Markup is built with template strings and assigned with `innerHTML`. The homepage map escapes generator and group text with `escapeHTML()`. The printer map and the idea log do not (see [Known issues](#known-issues)).

## State

| State | Where | Lifetime |
| --- | --- | --- |
| Slot registry | `PROGRAMS` in `js/programs.js` | Static, edited by hand |
| Active generator | `activeProgram` in `app.js` | Page session |
| Generator idea queue | `localStorage` key `mm_generator_ideas` | Per browser, survives reloads |
| Homepage sort and tile arrangement | `localStorage` key `mm-home-layout` | Per browser, survives reloads |
| Workshop scene autosave | `localStorage` key `mm-workshop-v1` (catalog shapes only) | Per browser, survives reloads |
| Model handed to the Workshop | `window.MM_WORKSHOP_INBOX` | Until the Workshop picks it up |
| Verified printer list | `PUBLIC_PRINTERS`, loaded from `data/public-printers.json` | Page session |
| Leaflet map and markers | `leafletMap`, `markersLayer`, `userMarker` | Page session |

All persisted state is in `localStorage` only. Every read and write is wrapped in `try/catch`, so the site still works when storage is blocked. Ideas are never sent anywhere; "Export Queue (.JSON)" downloads them as a file.

## Generator idea queue

`handleIdeaSubmit()` adds `{ title, desc, date }` to the front of the stored array. The log shows the five newest entries. `exportIdeasJSON()` downloads the full array as `maker-makers-generator-ideas.json`.

## External services

The site calls no first-party backend. Everything else is a public, keyless service.

| Service | Used for | Where in code |
| --- | --- | --- |
| unpkg.com (Leaflet 1.9.4) | Map library and CSS | `index.html` |
| cdnjs / jsDelivr (three.js r128 and its example controls) | Generators and the Workshop | generator pages, `js/workshop.js` |
| esm.sh (three 0.160, three-bvh-csg 0.0.16) | Workshop Merge / Cut / Intersect, loaded on first use | `js/workshop.js` |
| Local `data/public-printers.json` | Verified printer listings | `loadPublicPrinters()` |
| Esri ArcGIS World Street Map tiles | Map tiles | `initLeafletMap()` |
| OpenStreetMap Nominatim | Worldwide place search (geocoding) | `searchLocationWorldwide()` |
| Overpass API (overpass-api.de) | Nearby hackerspaces, 3D printing shops and libraries | `scanGlobalPrintersNear()` |

If a service is unreachable, the map shows the verified listings and the status line says so. Overpass errors are caught silently.

## Styling

`css/styles.css` holds all styles. It uses a "blueprint" theme built from CSS custom properties (`--bp-cyan`, `--bp-amber`, `--bp-bg-main`, and so on) defined in `:root` at the top of the file. Layout is responsive; the hub tiles and viewer switch sizes at the 1100px and 680px breakpoints.

## Known issues

These are current behaviors to know about. None are blocking for the static, trusted-data use the site has today.

- **Unescaped HTML on the printer map.** Printer fields are inserted with `innerHTML` without escaping. The printer JSON files are trusted, but live OpenStreetMap results are not. Their name, address and equipment text appear in popups and cards, and their `website` tag becomes an `href`. A `javascript:` URL in that tag would run when clicked. Validate or escape these before the scan results are shown.
- **Saved ideas are unescaped too.** The idea log writes the stored title and description as HTML. Only the submitting browser sees them, but they should still be escaped.
- **Viewer buttons.** The viewer header has Save STL (clicks the generator's own export button, consent modal included) and Send to Workshop. Exporting itself happens inside the generator (STL, and OBJ + MTL zip; there is no 3MF).
- **Leftover viewer code.** The viewer's placeholder panel still has disabled "Export .STL / .OBJ" and "Download Standalone .HTML" buttons (only visible on empty slots), and `downloadStandaloneHTML()` / `confirmSiteDownload()` in `app.js` are no longer called by anything. Downloads happen inside the generator.
- **Candidate popups have no link.** Unverified candidates store their site in `website`, but the popup only links `url`, so candidate popups show no website link.
- **Silent scan failures.** Overpass errors are swallowed, so a failed scan looks like an empty one.
- **Distance check is in degrees.** Deciding which verified listings to include in a scan uses a degree distance, not kilometers.
