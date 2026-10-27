# Homepage: the generator world map

The whole home screen is one big pannable, zoomable 2D map. Every group of generators is a tinted **region**, and every generator is a **tile** inside its region. Related regions sit next to each other, so the map reads like a heatmap of what exists: Halloween touches Christmas, which touches Easter, and the Home, Garden and Toys regions below fill in the rest of the world. Open slots show as dashed empty tiles, and whole regions marked `planned` show where future generators will go.

## Using it

- **Pan:** drag, trackpad scroll, or arrow keys.
- **Zoom:** pinch on touch screens, Ctrl+scroll (or trackpad pinch), the + and minus buttons, or the + and - keys. The square button (or key 0) shows the whole map. The minimap at bottom left jumps the camera.
- **Select a tile:** the camera snaps to it and a details panel opens with the group (description, counts, a strip of its generators) and the tile (picture, category, description).
- **Open it:** select the tile again, or press "Open generator" in the panel. This goes to the generator editor.
- **Select an empty slot:** the panel explains it is reserved, and offers "Suggest a generator", which opens the idea form. Selecting the slot again also opens the form.
- **Select a region heading:** frames the whole group and shows the group panel.
- **Search:** the box in the top left dims every tile that does not match (title, category, description or group) and pans to the first match.
- **Keyboard:** Tab moves between tiles and selects the focused one, Enter opens it, Esc closes the panel.

Hovering a tile lifts it with a glowing energy pool and rippling ring beneath it, and the connectors to its neighbours brighten. Zoomed far out, region names enlarge and tile labels hide. Reduced-motion settings turn the animations off. The site collects no data: search and camera state live only in the page.

## Adding to the map

Everything is data in `js/programs.js`; see [generator-registry.md](generator-registry.md).

- **New generator in an existing group:** give it `bundle: '<group id>'`. It takes the next free tile in that region. If a region runs out of cells it grows downward, so leave a free row below any region you expect to fill.
- **New group:** add a `BUNDLES` entry with `at: [col, row]` (its top-left cell on the world grid) and `size: [cols, rows]`. A region is one header row plus its tile rows, and one cell is one tile. Put it beside related groups. Groups with no `at` are packed into rows below everything else, so nothing is lost.
- **Reserve space for a future group:** add the entry with `planned: true` and no generators.
- **Generators in no group** appear in an automatic "More" region at the bottom.

## How it is built

- `js/worldmap.js` holds layout, rendering, camera, selection, input and the minimap. The map is a `div` moved with one CSS `transform`, so panning and zooming stay smooth.
- Empty slots are not DOM elements. Each region paints its empty cells as a repeating background and taps are mapped to cells with arithmetic, so the number of empty slots costs nothing as the map grows.
- The map fills the window between the header and footer, so the disclaimer stays visible.
- Styles are the "HOMEPAGE WORLD MAP" section at the end of `css/styles.css`.

## Growing further

Tiles are plain DOM, which is fine for hundreds of generators. If the map reaches many thousands, render only the regions near the camera (the layout data already knows every region's rectangle).
