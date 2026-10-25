# Architecture

## Overview

The site is a single HTML page (`index.html`) with three screens that share one page. A small script (`js/app.js`) switches between them by showing and hiding sections. There is no router, no framework, and no server-side code.

```
index.html
 ├── Header (brand, screen buttons, "Submit Generator Idea")
 ├── <main>
 │    ├── [01] Featured Generator carousel        ─┐
 │    ├── [01B] Featured Community Models strip     │  #splash-screen
 │    └── [02] 4 x 10 machinery grid               ┘
 │    ├── #viewer-screen   generator viewer (iframe + controls)
 │    └── #map-screen      printer radar (Leaflet + directory list)
 ├── Idea modal (#idea-modal)
 └── Footer
```

Script load order at the bottom of `index.html`:

1. `js/programs.js` defines the `PROGRAMS` array (the slot registry).
2. `js/featured.js` defines `FEATURED_MODELS` for the Featured Community Models strip (see [featured-carousel.md](featured-carousel.md)).
3. `js/app.js` renders everything and wires up the UI. It runs `initSplash()` and `initFeaturedStrip()` at the end of the file, and starts loading `data/public-printers.json` in the background.

Leaflet 1.9.4 is loaded from unpkg in the `<head>` (CSS) and before the local scripts (JS).

## Screens

Only one screen is visible at a time. `hideAllScreens()` sets `display: none` on `#splash-screen`, `#viewer-screen` and `#map-screen`, and each navigation function shows the one it needs.

| Function | Shows | Notes |
| --- | --- | --- |
| `showSplashScreen()` | Splash (carousel + grid) | Also reached from the brand block and the "4x10 Grid" button |
| `openProgram(id)` | Viewer | Looks up the slot by id, then loads `programUrl` into the iframe or shows the empty-bay message |
| `showPrinterMapScreen()` | Printer map | Creates the Leaflet map on first open, otherwise calls `invalidateSize()` |

Navigation is entirely in-page. Scrolling to the top happens in `openProgram()`.

## Rendering model

Everything on the grid, carousel and viewer is generated from data at load time:

- `initSplash()` maps `PROGRAMS` through `createMachineryFrameHTML()` into `#program-grid`.
- The carousel uses the subset of `PROGRAMS` where `featured` is true.
- Slot cards call `openProgram('SLOT-NN')` from an inline `onclick`.

Markup is built with template strings and assigned with `innerHTML`. Content from `PROGRAMS`, `FEATURED_MODELS` and `data/public-printers.json` is trusted, so it is not escaped (see [Known issues](#known-issues)).

## State

| State | Where | Lifetime |
| --- | --- | --- |
| Slot registry | `PROGRAMS` in `js/programs.js` | Static, edited by hand |
| Carousel position | `currentSlide`, `carouselTimer` in `app.js` | Page session |
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
| Browser geolocation | "Use My GPS Location" | `locateUserGPS()` |

If a service is unreachable, the map shows the verified listings and the status line says so. Overpass errors are caught silently.

## Styling

`css/styles.css` holds all styles. It uses a "blueprint" theme built from CSS custom properties (`--bp-cyan`, `--bp-amber`, `--bp-bg-main`, and so on) defined in `:root` at the top of the file. Layout is responsive; the grid and carousel switch sizes at the 1100px and 680px breakpoints.

## Known issues

These are current behaviors to know about. None are blocking for the static, trusted-data use the site has today.

- **Unescaped HTML.** Titles, categories, descriptions, and the printer fields are inserted with `innerHTML` without escaping. Data from `PROGRAMS`, `FEATURED_MODELS` and the printer JSON file is trusted, but live OpenStreetMap results are not. Their name, address and equipment text appear in popups and cards, and their `website` tag becomes an `href`. A `javascript:` URL in that tag would run when clicked. Validate or escape these before the scan results are shown.
- **Saved ideas are unescaped too.** The idea log writes the stored title and description as HTML. Only the submitting browser sees them, but they should still be escaped.
- **Carousel autoplay does not pause.** The Featured Generator carousel keeps advancing on hover and focus. The Featured Community Models strip pauses. See [featured-carousel.md](featured-carousel.md).
- **Export buttons are placeholders.** The viewer's "Export .STL" and "Export .3MF" buttons are disabled and not wired.
- **Silent scan failures.** Overpass errors are swallowed, so a failed scan looks like an empty one.
- **Distance check is in degrees.** Deciding which verified listings to include in a scan uses a degree distance, not kilometers.
- **Data path is not deployed.** `data/` is not copied by the Pages workflow yet. See [deployment.md](deployment.md#what-gets-published).
- **Featured default differs from the README.** The code features slots 1 to 3 by default. The README tells you to set `featured: true` by hand.
