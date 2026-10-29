# Architecture

## Overview

The site is a single HTML page (`index.html`) with four screens that share one page. A small script (`js/app.js`) switches between them by showing and hiding sections. There is no router, no framework, and no server-side code.

```
index.html
 ├── Header (brand, screen buttons, "Submit Generator Idea")
 ├── <main>
 │    └── Generator world map (pannable regions of tiles)   #splash-screen
 │    ├── #viewer-screen   generator viewer (iframe + controls)
 │    ├── #workshop-screen Workshop 3D editor (js/workshop.js)
 │    └── #map-screen      printer radar (Leaflet + directory list)
 ├── Idea modal (#idea-modal)
 └── Footer
```

Script load order at the bottom of `index.html`:

1. `js/programs.js` defines the `PROGRAMS` array (the slot registry).
2. `js/worldmap.js` (homepage map) and `js/workshop.js` (Workshop editor) define the homepage map and Workshop that `app.js` calls.
3. `js/app.js` renders everything and wires up the UI. It runs `initSplash()` at the end of the file, and starts loading `data/public-printers.json` in the background.

Leaflet 1.9.4 is loaded from unpkg in the `<head>` (CSS) and before the local scripts (JS).

## Screens

Only one screen is visible at a time. `hideAllScreens()` sets `display: none` on `#splash-screen`, `#viewer-screen` and `#map-screen`, and each navigation function shows the one it needs.

| Function | Shows | Notes |
| --- | --- | --- |
| `showSplashScreen()` | Splash (generators hub) | Also reached from the brand block and the "Generators" button |
| `openProgram(id)` | Viewer | Looks up the slot by id, then loads `programUrl` into the iframe or shows the empty-bay message |
| `showPrinterMapScreen()` | Printer map | Creates the Leaflet map on first open, otherwise calls `invalidateSize()` |

Navigation is entirely in-page. Scrolling to the top happens in `openProgram()`.

## Rendering model

Everything on the hub and viewer is generated from data at load time:

- `initSplash()` calls `initWorldMap()` in `js/worldmap.js`, which lays out every group in `BUNDLES` as a region of tiles on the world map (see [homepage.md](homepage.md)).
- Tiles call `openProgram('SLOT-NN')` from an inline `onclick`.

Markup is built with template strings and assigned with `innerHTML`. Content from `PROGRAMS` and `data/public-printers.json` is trusted, so it is not escaped (see [Known issues](#known-issues)).

## State

| State | Where | Lifetime |
| --- | --- | --- |
| Slot registry | `PROGRAMS` in `js/programs.js` | Static, edited by hand |
| Active generator | `activeProgram` in `app.js` | Page session |
| Generator idea queue | `localStorage` key `mm_generator_ideas` | Per browser, survives reloads |
| Verified printer list | `PUBLIC_PRINTERS`, loaded from `data/public-printers.json` | Page session |
| Leaflet map and markers | `leafletMap`, `markersLayer`, `userMarker` | Page session |

The idea queue is the only persisted state. Every read and write of it is wrapped in `try/catch`, so the site still works when storage is blocked. Ideas are never sent anywhere; "Export Queue (.JSON)" downloads them as a file.

## Generator idea queue

`handleIdeaSubmit()` adds `{ title, desc, date }` to the front of the stored array. The log shows the five newest entries. `exportIdeasJSON()` downloads the full array as `maker-makers-generator-ideas.json`.

## External services

The site calls no first-party backend. Everything else is a public, keyless service.

| Service | Used for | Where in code |
| --- | --- | --- |
| unpkg.com (Leaflet 1.9.4) | Map library and CSS | `index.html` |
| Local `data/public-printers.json` | Verified printer listings | `loadPublicPrinters()` |
| Esri ArcGIS World Street Map tiles | Map tiles | `initLeafletMap()` |
| OpenStreetMap Nominatim | Worldwide place search (geocoding) | `searchLocationWorldwide()` |
| Overpass API (overpass-api.de) | Nearby hackerspaces, 3D printing shops and libraries | `scanGlobalPrintersNear()` |

If a service is unreachable, the map shows the verified listings and the status line says so. Overpass errors are caught silently.

## Styling

`css/styles.css` holds all styles. It uses a "blueprint" theme built from CSS custom properties (`--bp-cyan`, `--bp-amber`, `--bp-bg-main`, and so on) defined in `:root` at the top of the file. Layout is responsive; the hub tiles and viewer switch sizes at the 1100px and 680px breakpoints.

## Known issues

These are current behaviors to know about. None are blocking for the static, trusted-data use the site has today.

- **Unescaped HTML.** Titles, categories, descriptions, and the printer fields are inserted with `innerHTML` without escaping. Data from `PROGRAMS` and the printer JSON file is trusted, but live OpenStreetMap results are not. Their name, address and equipment text appear in popups and cards, and their `website` tag becomes an `href`. A `javascript:` URL in that tag would run when clicked. Validate or escape these before the scan results are shown.
- **Saved ideas are unescaped too.** The idea log writes the stored title and description as HTML. Only the submitting browser sees them, but they should still be escaped.
- **Viewer buttons.** The viewer header has Save STL (clicks the generator's own export button, consent modal included) and Send to Workshop. Exporting itself happens inside the generator (STL, and OBJ + MTL zip; there is no 3MF).
- **Silent scan failures.** Overpass errors are swallowed, so a failed scan looks like an empty one.
- **Distance check is in degrees.** Deciding which verified listings to include in a scan uses a degree distance, not kilometers.
