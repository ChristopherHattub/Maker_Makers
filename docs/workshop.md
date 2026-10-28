# Workshop: free-range 3D editor

A large tile in the middle of the homepage map opens `#/workshop`, a 3D editor for combining shapes and imported STLs.

## Using it

- **Add:** pick a shape in the tab at the top. Collapsed, it shows the current set as a horizontal strip; "All sets" pulls down every set, and the search box filters across all sets.
- **Move:** drag a shape across the bed. **Turn / Size:** the gizmo buttons (keys E, R). The side panel has big picture buttons instead of number boxes: a move pad, spin / tip / flip, bigger / smaller / taller / flatter / wider / thinner, and colour dots. Shape pictures in the tab are renders of the real 3D shapes.
- **Import / export:** Import STL (or drop files on the viewport); Export STL writes the whole visible scene as one file.
- **Generators:** the Generators set lists the finished generators (fidgets, clickers and other functional models are left out for now). Adding one places that generator's real default model. Double-click it to zoom in and open a mini editor (the generator's own Parametric controls) beside it; the shape rebuilds as you change sliders.
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

Add an entry to a set in `wsCatalog()`: `{ id, name, icon, build(params) }`, where `build` returns a Z-up geometry in mm (`U` rotates a Y-up three.js primitive, `merge` joins parts). Give it `params` to make it editable in the inspector. Generator shapes are listed automatically from `PROGRAMS`. They work through `?embed=workshop` in `programs/shared/generator-core.js`: the page shows only the Parametric tab and posts its built model to the parent after every rebuild (`mm-model`); the parent can send `mm-set-params`.

## Not done yet

Generator shapes are single-colour in the Workshop (Color-tool paint is not carried over), and they are not kept by autosave. The mini editor shows the generator's Parametric tab only. Per-part colour in the export are also not done.
