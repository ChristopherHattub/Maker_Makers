# Workshop: free-range 3D editor

A large tile in the middle of the homepage map opens `#/workshop`, a 3D editor for combining shapes and imported STLs.

## Using it

- **Add:** pick a shape in the tab at the top. Collapsed, it shows the current set as a horizontal strip; "All sets" pulls down every set, and the search box filters across all sets.
- **Move:** drag a shape across the bed. **Rotate / Scale:** the Rotate and Scale buttons (keys E, R) show a gizmo. The inspector also has exact position, rotation and size in mm (printer axes: Z is up).
- **Import / export:** Import STL (or drop files on the viewport); Export STL writes the whole visible scene as one file.
- **Generators:** the Generators set lists the finished generators (fidgets, clickers and other functional models are left out for now). Double-click one in the scene to open its generator.
- **Text:** the Text shape accepts any keyboard character; edit text, height and thickness in the inspector.
- **Quality of life:** undo/redo, duplicate, delete, multi-select (shift-click), drop to bed, centre, mirror, hide, lock, colour, snap, top/front/iso views, a build-plate size with out-of-bounds warning, autosave.
- **Merge / Cut / Intersect:** select two or more shapes (the first selected is the base) and use the Combine buttons in the inspector. The result is one new shape; Ctrl+Z restores the originals. It uses three-bvh-csg, loaded from esm.sh on first use, and works best on closed shapes.
- **Keys:** W/E/R move/rotate/scale, G snap, B drop to bed, H hide, F focus, Ctrl+D duplicate, Ctrl+Z / Ctrl+Shift+Z undo / redo, Del delete.

## Privacy

Nothing is uploaded. Files are read in the browser. Autosave goes to `localStorage` only, and holds catalog shapes, not imported STLs.

## How it is built

- `js/workshop.js` loads three.js from the CDN on first visit (same versions as the generators) and holds the catalog, scene, history and STL code. `css/workshop.css` holds the editor and tile styles.
- The homepage tile is `workshopTileHTML()` in `js/worldmap.js`; its position is `WORKSHOP` at the top of that file. It is not a generator and has no hologram sprite: its art is an animated SVG.
- The scene is Z-up like a slicer, so exports need no axis change.

## Adding shapes

Add an entry to a set in `wsCatalog()`: `{ id, name, icon, build(params) }`, where `build` returns a Z-up geometry in mm (`U` rotates a Y-up three.js primitive, `merge` joins parts). Give it `params` to make it editable in the inspector. Generator shapes are listed automatically from `PROGRAMS`.

## Not done yet

Generator shapes are plinth placeholders with the generator's name. The real geometry only exists inside each generator page, so double-click opens it rather than editing in place, and nothing brings a generator's result back into the Workshop. Per-part colour in the export are also not done.
