# Generator Styling and Conventions

Every generator on the site uses the same layout, the same controls and the same export buttons. A generator does not write any of that. It supplies its parameters, presets, a color palette and a `build()` function that returns triangles. The shared engine does the rest.

This page covers the file layout, the generator contract, the Color tool, exports, and the visual rules. For how the slots are registered on the grid, see [generator-registry.md](generator-registry.md).

## Files

| File | Role |
| --- | --- |
| `programs/shared/generator.css` | Layout and styling for every generator. Uses the same colors and fonts as the site. |
| `programs/shared/generator-core.js` | The engine: page shell, 3D viewport, Parametric and Color tabs, picking, parts, exports, standalone download. |
| `programs/<name>.html` | One generator. It holds `window.MM_GENERATOR` (the config) and loads the two shared files. |

A generator page looks like this:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MM-002 My Generator // Maker Makers</title>
  <link rel="stylesheet" href="shared/generator.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body class="mm-gen">
  <script>
    window.MM_GENERATOR = { /* config, see below */ };
  </script>
  <script src="shared/generator-core.js"></script>
</body>
</html>
```

Rules for these lines:

- The `<body>` must have `class="mm-gen"`. The engine builds everything inside it.
- The stylesheet link must be exactly `<link rel="stylesheet" href="shared/generator.css">`.
- The engine script tag must be exactly `<script src="shared/generator-core.js"></script>`.
- The config script comes **before** the engine script.
- Use three.js r128 with OrbitControls (the versions the site already uses). Do not add other libraries.

The standalone download depends on those exact tags (see [Standalone download](#standalone-download)).

## The config (`window.MM_GENERATOR`)

| Field | Required | Meaning |
| --- | --- | --- |
| `code` | yes | Id shown in the header, for example `MM-001`. |
| `category` | yes | Short label after the id, for example `SPOOKY // FIGURES`. |
| `title` | yes | Name shown big in the header and used for the standalone file name. |
| `fileName` | yes | Default export file name, without extension. Spaces and symbols are removed. |
| `printerLink` | no | Target of "Find local printer for this STL". Defaults to `../index.html#map-screen`. |
| `defaultColor` | no | Paint color used for parts with no paint. Defaults to the first palette entry. |
| `palette` | yes | `[{ name, color }]`. Shown as swatches in the Color tool. Eight entries lay out as two rows. |
| `partNames` | no | Maps a mesh name to a label, for example `{ body: 'Ghost body', detail: 'Stamp' }`. |
| `printSettings` | no | Recommended print settings, written into the .3MF. See [Print settings](#print-settings-in-the-3mf). |
| `parameters` | yes | The sliders. See below. |
| `presets` | no | `[{ label, values }]`. Each preset sets some parameters. |
| `build(params, api)` | yes | Returns the mesh list. See [build()](#build-params-api). |
| `mount(container, api)` | no | Adds generator-only controls under the sliders (for example, a stamp picker). |
| `onHover(hit, api)` | no | Called on pointer move with the hit under the cursor, or `null`. |
| `onPick(hit, api)` | no | Called on a click in the Parametric tab. The hit has the same shape as for `onHover`. |

### Parameters

Each entry in `parameters` makes one slider. Sliders are grouped by `group` in the order they first appear.

```js
{ group: 'Body', key: 'height', label: 'Height', unit: ' mm', min: 40, max: 120, step: 1, value: 85 }
```

- `key` is the property name in `params`.
- `unit` is appended to the value shown. Put the leading space in yourself, for example `' mm'`, or use `'°'` for an angle.
- `format(v)` (optional) replaces the value text entirely, for example `'Flat line'` at zero.
- Changes rebuild the model. The engine batches rebuilds into one per animation frame, so a generator does not need its own throttling.

Name the groups with plain words. The engine upper-cases them.

### build(params, api)

`build` returns an array of mesh entries. Each entry is:

```js
{
  name: 'body',                    // Used for part labels and for onPick/onHover hit.meshName
  positions: Float32Array,         // Triangles, non-indexed: 9 numbers per triangle, in mm
  shade: Float32Array,             // Optional. One value 0..1 per vertex (3 per triangle). 1 darkens the vertex (cavities).
  smoothGroup: 'ghost'             // Optional. Entries with the same value are lit as one surface (no seam between them).
}
```

Coordinates:

- Use **Y-up** in the model, the same as three.js. The engine turns it into Z-up for printing when you export. Do not rotate it yourself.
- Units are millimetres.
- Do not put the model on the bed yourself. The engine moves the lowest point to `z = 0` on export.
- Write triangles, not indexed geometry. Shared vertices are welded by the engine (to 0.001 mm) when it smooths normals and finds parts.

Split a surface into several entries when part of it should be painted on its own (the Ghost Builder puts the eyes and mouth in a `face` entry). Give the entries the same `smoothGroup` so the lighting has no seam where they meet. The part list shows each entry's parts separately.

Build from `params` only. Anything the model depends on should be a parameter or part of the config closure, so the same inputs always give the same mesh.

Use `api.THREE` for three.js helpers (geometry, matrices). A common pattern for placed features, such as stamps, is to build a `THREE.ExtrudeGeometry`, transform it with `applyMatrix4`, then copy `position.array` into the entry.

### The api object

| Member | Use |
| --- | --- |
| `api.THREE` | The three.js namespace. |
| `api.params` | Live parameter values. Read them, do not write them. Use `setParams` instead. |
| `api.setParams(values)` | Sets several parameters, updates the sliders and rebuilds. Used by presets. |
| `api.rebuild()` | Rebuilds the model on the next frame. Call it after your own state (for example, a list of stamps) changes. |
| `api.setPreview(entry or null)` | Shows a translucent preview mesh (`{ positions }`). Use it for hover previews. |
| `api.toast(message)` | Shows a short message above the viewport. |
| `api.centerCamera('front' or 'iso')` | Frames the model. |

## Parametric and Color tabs

The panel has three tabs: Parametric, Color tool and Print. Only one is shown at a time.

**Parametric** starts with a **View** switch (engine-owned, every generator gets it): *Solid*, *Wireframe* (only the triangle edges the model is built from) and *Solid + edges* (shaded model with the edges on top). It is a display mode only; exports are unchanged, and the Color tab always shows the solid so painting stays readable. Below it are presets, the sliders, and anything from `mount`. The model is drawn in one neutral matte color. Paint is not shown here.

Placement tools belong to the Parametric tab. In the Color tab the engine does not call `onHover` or `onPick`, clears any preview, and uses a pointer cursor (a crosshair in the Parametric tab when the generator has `onPick`). A generator does not need to handle this itself.

**Color tool** shows the palette, a custom color picker, and the list of parts. Colors appear only in this tab. Click the model to paint the part under the cursor, or click a part in the list.

### How parts are found

The engine splits each mesh into parts, so the user can paint a whole body, a detail, or a stamp in one click:

1. Two triangles that share an edge join the same part, unless the surface turns more than **50°** across that edge.
2. Parts with fewer than **200 triangles** are merged into the neighboring part they touch most. This stops jagged cut-out faces from becoming single-triangle parts.
3. Each mesh is treated separately, so a stamp sitting on the body is its own part even when it overlaps it.

The largest part of a mesh is named by `partNames`. The others are numbered `Part 2`, `Part 3`, and so on. Every label shows its triangle count.

Both thresholds are constants at the top of `generator-core.js` (`CREASE_COS`, `MIN_PART_TRIS`). Change them there, not per generator, so every generator splits parts the same way.

### How paint is kept

Paint is stored by each part's centre, not by its triangle numbers. When a slider changes the mesh, each saved paint is matched to the nearest part of the same mesh name within 40 mm. So paint survives normal edits. A part that moves far from where it was painted loses its color.

Paint resets when the page reloads. The engine does not save it.

## Exports

| Button | Output |
| --- | --- |
| Export .STL | Binary STL, one solid, Z-up, on the bed. No color (STL cannot carry color). |
| Export .3MF | 3MF package with the paint: one base material per color, one color per triangle. |
| Download standalone .html generator | A single HTML file that contains the generator, the shared styles and the engine. |

The file name is the `File name` field in the panel footer, which starts from `fileName`.

Both model exports apply the same transform: Y-up becomes Z-up (`x, y, z` becomes `x, -z, y`), and the lowest point sits on the bed. Keep this in mind when you compare an export with the viewport.

### Print settings in the 3MF

The **Print** tab (engine-owned) lets the user edit slicer settings: material, nozzle, layer height, infill, walls, top/bottom layers, brim, speed (0 = slicer default) and supports. Each field starts at the generator's recommended value from `printSettings`, and "Reset to recommended" restores it. The .3MF export writes whatever is set in the tab at that moment. Settings are not saved between page loads. Without `printSettings` the tab starts from the engine defaults, so every 3MF carries settings.

```js
printSettings: {
  material: 'PLA', nozzle: 0.4, layerHeight: 0.2, infill: 15, walls: 3,
  topLayers: 5, bottomLayers: 4, supports: false, brim: 0,
  speed: 60,          // optional, mm/s
  notes: 'Prints upright on its flat base.' // optional, free text
}
```

Every field is optional (`notes` is shown under the fields and written to the summary); the defaults are PLA, 0.4 mm nozzle, 0.2 mm layers, 15% infill, 3 walls, 5 top / 4 bottom layers, no supports, no brim. The export writes the same values in four places:

| Where | What | Read by |
| --- | --- | --- |
| `3D/3dmodel.model` `<metadata name="Description">` | Human-readable summary (also `Title`, `Designer`) | Anything that shows 3MF metadata (standard 3MF field) |
| `Metadata/Slic3r_PE.config` | `; key = value` lines using PrusaSlicer option names | Meant for PrusaSlicer project import |
| `Metadata/project_settings.config` | JSON using Bambu Studio / OrcaSlicer option names | Meant for Bambu Studio / OrcaSlicer |
| `Metadata/print-settings.txt` | The same summary as plain text | People: rename the file to `.zip` and open it |

**Not tested.** These file names and keys follow what those slicers write themselves, but no slicer import was tried. Treat the settings as a recommendation: a slicer may ignore them, apply only some, or keep the user's own profile (Bambu Studio in particular may expect a full project and only read the model). The text summary and the Description metadata are the dependable part.

## Standalone download

The standalone button fetches the generator's own HTML, then inlines `shared/generator.css` and `shared/generator-core.js` in place of the two shared tags. The result runs with no server, apart from the three.js CDN.

The download needs the page served over `http(s)`, so it works on the dev server and on GitHub Pages. Opening the file directly from disk (`file://`) shows "Open the generator through the site to download it".

The site's grid viewer uses the same bundling for its **Download** button, so both give the same file.

Keep these rules so the bundling stays correct:

- Never write a literal `</script>` inside the engine or the config. Write `<\/script>`. The inlined text would otherwise close the script early.
- Keep the two tags exactly as shown above, so the replacement matches.
- Keep helper code inside the config or the engine. Do not add extra `src` script or stylesheet tags to a generator page.

## Visual conventions

The engine applies these. A generator should not restyle the page.

- **Header.** The id and category on top, the title below it. Three buttons on the right: *Find local printer for this STL* (green), *Download program (.html)* (amber), and *Back to grid*.
- **Inside the site viewer.** The viewer's own top bar already shows the id, title and the same three buttons, so a generator loaded in the viewer hides its header and fills the frame. The engine adds `mm-framed` to `<body>` when the page is in an iframe. The viewer hides its empty placeholder panel for any slot that has a `programUrl` (the `has-program` class in `css/styles.css`). Opened on its own, the generator keeps its header.
- **Panel.** Left column, 380 px wide on desktop. Two tabs at the top. Footer with the triangle count, file name, export buttons, and the standalone download. Button text wraps, so long labels never overflow.
- **Viewport.** Right column. Orbit by dragging. The top-left hint and the top-right size readout (`X x Y x Z MM`) are fixed. *Front* and *Iso* sit at the bottom right.
- **Colors and fonts.** Blueprint palette from `css/styles.css`: deep navy background, cyan for lines and active states, green and amber for the two secondary actions. Monospace font throughout.
- **Build plate.** A 160 mm square plate, drawn for every generator, so a model's size is easy to judge.
- **Phone width.** Below 860 px the viewport moves above the panel. The page scrolls; it never scrolls sideways.

Do not add colors, fonts or layout rules inside a generator page. If a generator needs a new style, add it to `shared/generator.css` so every generator gets it.

### Classes for generator-only controls

Use these in `mount()` so extra controls look like the rest of the panel:

| Class | Use |
| --- | --- |
| `mm-group` / `mm-group-title` | A labelled section. |
| `mm-note` | Small explanatory text. |
| `mm-chips` / `mm-chip` | A row of toggle chips. Set `aria-pressed="true"` on the active one. |
| `mm-icon-chips` / `mm-icon-chip` | A row of picture buttons: an inline `<svg>` (filled with the accent color) above a short label. Use these when choices are shapes. Set `aria-pressed="true"` on the active one. |
| `mm-btn` (with `mm-btn--green`, `--amber`, `--solid`, `--block`) | Buttons. |
| `mm-export-row` | Two equal columns. |

## Checklist for a new generator

1. Copy `programs/ghost-builder.html` and change the config. Keep the two shared tags and the script order.
2. Set `code`, `category`, `title`, `fileName` and `palette`.
3. Add one entry per slider to `parameters`, grouped by topic.
4. Write `build(params)`. Return triangles in Y-up millimetres. Add `shade` only if the model has cavities worth darkening.
5. Add `presets` if the model has recognisable settings.
6. Add `mount`, `onHover` and `onPick` only if the user needs to place things on the model.
7. Add a slot entry in `js/programs.js`, pointing `programUrl` at the page (see [generator-registry.md](generator-registry.md)).
8. Do nothing for the footer disclaimer: the engine adds it.
9. Open the page in the preview. Check that the Color tool lists sensible parts, that paint survives a slider change, that the STL and 3MF open, and that the standalone download runs.

## Footer disclaimer

The engine adds a collapsed "Disclaimer" block under the panel footer buttons of every generator (and so in the standalone download, which has no external links). A generator page must not add or remove it. The text lives in `DISCLAIMER_SHORT` / `DISCLAIMER_ITEMS` in `generator-core.js`, and is mirrored in `index.html` (`#site-disclaimer`) and in [`DISCLAIMER.md`](../DISCLAIMER.md). Edit all three together. It is a best-effort draft and not legal advice; a lawyer should review it for the owner's jurisdiction. Styles are `.mm-disclaimer*` in `shared/generator.css`.

## Limits

- Paint is not saved. Reloading the page clears it.
- Part detection uses fixed thresholds. A very coarse mesh can split into more or fewer parts than expected. Use a finer mesh for parts that must be painted separately.
- 3MF print settings are metadata only and slicer support is untested (see above).
- 3MF colors are per triangle. Slicers that ignore per-triangle colors will show the base color only.
- `build()` runs on every slider move. Keep it fast: a few tens of thousands of triangles rebuild comfortably. Much larger models will feel slow.
