# Homepage: the generator world map

The whole home screen is one big pannable, zoomable 2D map. Every group of generators is a tinted **region**, and every generator is a **tile** inside its region. Regions are packed in rings around the central Workshop tile, so the map reads like a heatmap of what exists. Regions marked `planned` show where future generators will go.

## Using it

- **Pan:** drag, trackpad scroll, or arrow keys.
- **Zoom:** pinch on touch screens, Ctrl+scroll (or trackpad pinch), the + and minus buttons, or the + and - keys. The square button (or key 0) shows the whole map. The minimap at bottom left jumps the camera.
- **Select a tile:** the camera snaps to it and a details panel opens with the group (description, counts, a strip of its generators) and the tile (picture, category, description).
- **Open it:** select the tile again, or press "Open generator" in the panel. This goes to the generator editor.
- **Select an empty planned group's slot:** the panel explains it is reserved, and offers "Suggest a generator", which opens the idea form.
- **Select a region heading:** frames the whole group and shows the group panel.
- **Search:** the box in the top left dims every tile that does not match (title, category, description or group) and pans to the first match.
- **Keyboard:** Tab moves between tiles and selects the focused one, Enter opens it, Esc closes the panel.

Hovering a tile lifts it with a glowing energy pool and rippling ring beneath it, and the connectors to its neighbours brighten. Zoomed far out, region names enlarge and tile labels hide. Reduced-motion settings turn the animations off. The site collects no data: search and camera state live only in the page, and the sort and arrangement stay in the visitor's own browser.

## Layout, sorting and rearranging

- **Auto layout:** the map is laid out by code, not by hand. Each group's outline is sized to its tiles (a near-square block with the header on top; a part-filled last row is cut out of the outline, so there is no empty space). Groups are then packed in rings around the Workshop tile: each goes to the free spot closest to the Workshop that touches something already placed, so the map builds outward from the centre. Empty (`planned`) groups are small placeholders at the edge.
- **Start view:** each time the page loads, the camera centres on the Workshop tile.
- **Sort** (dropdown under the search box): groups with the biggest nearest the middle (default), groups A to Z, groups newest first, or no groups at all (one block, A to Z or newest first).
- **Rearrange:** press the button, then drag any tile to a new spot in its group or into another group. Taps do nothing while it is on; press Done to go back to panning. Moving a tile only moves one transform while dragging and one marker, so it stays smooth. "Reset" forgets the arrangement.
- The sort and arrangement are saved in this browser's `localStorage` (`mm-home-layout`). Nothing is sent anywhere.

## Adding to the map

Everything is data in `js/programs.js`; see [generator-registry.md](generator-registry.md).

- **New generator in an existing group:** give it `bundle: '<group id>'`. The group grows and the layout re-packs by itself.
- **New group:** add a `BUNDLES` entry (id, name, accent, description). Position and size are automatic; any `at` or `size` fields are ignored.
- **Reserve space for a future group:** add the entry with `planned: true` and no generators.
- **Generators in no group** appear in an automatic "More" region.

## How it is built

- `js/worldmap.js` holds layout, rendering, camera, selection, input and the minimap. The map is a `div` moved with one CSS `transform`, so panning and zooming stay smooth.
- Planned regions paint their empty cells as a repeating background, and taps are mapped to cells with arithmetic.
- Region outlines are SVG paths computed from the tile count; layout is `layoutWorld`, sort and the saved arrangement are `worldViewGroups`.
- The map fills the window between the header and footer, so the disclaimer stays visible.
- Styles are the "HOMEPAGE WORLD MAP" section at the end of `css/styles.css`.

## Growing further

Tiles are plain DOM, which is fine for hundreds of generators. If the map reaches many thousands, render only the regions near the camera (the layout data already knows every region's rectangle).
