# Printer Map

The map screen (`#map-screen`) shows public 3D printers and makerspaces on a Leaflet map, with a directory list alongside it. It needs no API key.

> **Status:** uncommitted working-tree change. Verified listings are in `data/public-printers.json`, and unverified OpenStreetMap candidates are in `data/osm-candidates.json`. Verification is ongoing, starting with New Hampshire.

## Two layers

The map has two layers, so unverified data is never mistaken for confirmed public print sites:

- **Verified (solid dots and the directory).** Listings in `data/public-printers.json` where the official page was checked and the record has a `verifiedDate`. Only these appear in the directory list and the "N ACTIVE" count.
- **Unverified candidates (dimmed dots, off by default).** Candidates with a `checked` note show it in a CHECK LOG line in their popup. 340 makerspaces, hackerspaces and 3D-printing shops in the US and Canada from OpenStreetMap, in `data/osm-candidates.json`. Turn them on with the checkbox "Show unverified OSM candidates" in the control bar. Each popup shows an UNVERIFIED notice.

OpenStreetMap confirms that a space exists and where it is. It does not confirm that the public can submit prints, or whether that is free or legal. Only the verified layer makes those claims.

## Screen layout

- **Control bar.** "Use My GPS Location", "Reset to US & Canada", a search box with "Scan Sector", the candidates checkbox, and "Back to Grid".
- **Directory.** A list of cards, one per location, with the hub count ("N ACTIVE"). Clicking a card flies the map to that location and opens its popup.
- **Map.** Markers for each location. Clicking a marker opens a popup with the name, type, address, equipment, public access, cost and verification details, and a link to the official site or submission page.
- **Status line.** The meta tag at the top of the screen. It reports what the last action did: scanning, geocoding, GPS unavailable, no results, or the scan result.

## Initialization

1. At page load, `loadPublicPrinters()` in `js/app.js` fetches `data/public-printers.json` into `PUBLIC_PRINTERS`. If the fetch or parse fails, the list is empty.
2. The Leaflet map is created the first time the screen is shown (`initLeafletMap()`). It opens centered on North America (`NORTH_AMERICA_VIEW`: `[48.5, -100]`, zoom 3) with Esri's World Street Map tiles. On that first open, the map asks for the visitor's position (`centerMapOnUser()`) and zooms to it if allowed. If permission is denied or the position is unavailable, the North America view stays.
3. If the data finishes loading after the map exists, the map re-renders the list.

Later visits call `invalidateSize()` so the map redraws at the right size.

## Data: `data/public-printers.json`

The verified listings live in one JSON array. Each entry:

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | yes | Location name shown on the card and popup |
| `city`, `region`, `country` | recommended | Context fields; `region` is the state or province code |
| `type` | yes | Short label, such as `PUBLIC LIBRARY // FREE PRINT BY REQUEST` |
| `lat`, `lng` | yes | Decimal coordinates; entries without them are not useful on the map |
| `address` | yes | Street address as shown on the card |
| `equipment` | yes | Printers and materials |
| `access` | yes | How the public can use it |
| `free` | recommended | Boolean |
| `fee` | optional | Shown as "COST" when present |
| `url` | yes | Official page or submission form |
| `source` | yes | Where the facts came from |
| `verifiedDate` | yes | `YYYY-MM-DD`; shown as "VERIFIED" with a link to `url` |
| `notes` | optional | Free text for maintainers; not displayed |

Current entries (9): Dover Public Library (NH), Portsmouth Public Library (NH), Belmont Public Library (MA), Norfolk Public Library (MA), Boston Public Library, Kirstein Business Library (MA), Louisville Public Library (CO), Yonkers Public Library, Riverfront Branch (NY), Toronto Reference Library (ON), and North Vancouver District Public Library, Lynn Valley Branch (BC). The `notes` field records how each entry was checked.

### Unverified candidates: `data/osm-candidates.json`

Generated from OpenStreetMap elements tagged `leisure=hackerspace`, `amenity=makerspace`, or `craft=3d_printing` inside the US and Canada boundaries (340 entries). Each has `name`, `type`, `lat`, `lng`, `address` and `website` where OSM had them, an `osm` reference (for example `node/12345`), and `verified: false`. Many lack a state or city tag, so filter by coordinates when checking a region.

### Verification progress

| Region | Status |
| --- | --- |
| New Hampshire | In progress. Dover PL and Portsmouth PL verified against official city pages. Richards Free Library (Newport) and Concord PL pages returned 404 and 500, so they are not confirmed. Port City Makerspace and MakeIt Labs have no published public print-submission policy that I could confirm. |
| Massachusetts | Public libraries done: Belmont, Norfolk and Boston (Kirstein) verified against official pages. Boston's page gives no fee, and its address is from the geocoder. Of the MA makerspace candidates, 8 were searched on 2026-10-25 and none publishes a public print-submission service. Their `checked` note records this. The rest are still unchecked. MIT's Project Manus service is limited to MIT, and UMass Amherst's library is for campus affiliates, so neither is listed as public. |
| Massachusetts, remaining | Searched the remaining MA candidates. The UMass Amherst campus spaces are affiliates-only, and the rest are membership-based. Not yet found: public libraries beyond Belmont, Norfolk and Boston. Worcester Public Library's page turned out to be a Maryland library. Dedham's policy page is blocked (403). Each town's library still needs its own lookup. |
| Rhode Island | Brown Design Workshop checked (Brown community focus, no print service). Only one RI candidate was in the file. Public libraries not yet searched. |
| Connecticut | MakeHaven, MakerspaceCT, Spark Makerspace and Fairfield County Makers Guild are all membership-based, with no public print-submission service found. Danbury HackerSpace has no website and is unchecked. Public libraries not yet searched. |
| Rest of US and Canada | Not started. |

The file is maintained by hand: only facts confirmed on an official page should go in. Coordinates may come from OpenStreetMap, as the Dover entry's notes say.

### Adding a listing

1. Confirm the facts on the official page: access rules, equipment, cost, and the submission route.
2. Add an object to `data/public-printers.json` with every required field, using today's date for `verifiedDate`.
3. Check the coordinates on a map.
4. Reload the page and open the card and popup.

Since the data is loaded at run time, no code change is needed.

## Live search

Two entry points call the same function, `scanGlobalPrintersNear(lat, lng, label)`:

- **GPS.** "Use My GPS Location" calls `navigator.geolocation` with an 8-second timeout. If it is denied or fails, the map falls back to the North America view and says so in the status line.
- **Search.** Enter in the search box, or "Scan Sector", geocodes the text with OpenStreetMap Nominatim (`limit=1`) and scans around the first result.

The scan builds its results in this order:

1. **Verified listings.** Entries in `PUBLIC_PRINTERS` within a rough 0.45-degree distance (`Math.hypot` on degrees, not kilometers) of the search point.
2. **OpenStreetMap.** An Overpass API query for elements within:

   | OSM tag | Radius |
   | --- | --- |
   | `leisure=hackerspace` (node or way) | 25 km |
   | `craft=3d_printing` (node) | 25 km |
   | `amenity=library` (node or way) | 15 km |

   The query returns up to 25 elements. Each becomes a location with a name from `name` (or "Community Makerspace / Public Library"), a type ("MAKERSPACE / FABLAB" for hackerspaces and 3D-printing shops, "PUBLIC LIBRARY (CHECK 3D PRINT DESK)" for libraries), an address from `addr:*` tags or the coordinates, and a website from `website` or `contact:website`, falling back to a Google search for the name.

3. **De-duplication.** OSM results whose names match a verified listing are dropped, so the verified entry wins. Scan results from OSM carry `verified: false` and show the UNVERIFIED notice.

If nothing is found, the map shows the full verified list with the status "NO PUBLIC HUBS DETECTED IN SECTOR // SHOWING US & CANADA". Overpass errors are caught silently, so a failed scan looks like an empty one with the verified list shown.

## How the scan is shown

- A "SCAN ORIGIN" marker is placed at the searched point.
- The map flies to the origin at zoom 13.
- Results replace the previous markers and directory cards.
- The first result's popup opens automatically after 300 ms.

## Known issues

- Live OSM results are inserted into popups and cards without escaping. A `website` tag containing a `javascript:` URL would become a link. See [architecture.md](architecture.md#known-issues).
- Both JSON files are loaded from `data/`, which the deploy workflow copies.
- The Dover PDF policy could not be read during verification; its service page was checked instead.
- The 0.45-degree match is a rough distance, not kilometers.
