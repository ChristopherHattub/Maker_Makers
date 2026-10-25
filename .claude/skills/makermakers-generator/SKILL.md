---
name: makermakers-generator
description: Create or modify a MakerMakers STL generator (a parametric 3D model page in programs/ that uses the shared engine). Use when asked to add a new generator, build a new model for the grid, register a slot in js/programs.js, add a slot thumbnail, make a generator's Color tool or exports work, or check a generator is printable.
---

# MakerMakers generator

A generator is one HTML page in `programs/` that holds a config (`window.MM_GENERATOR`) and loads the shared engine. The engine supplies the layout, 3D viewport, Parametric and Color tabs, picking, exports and the standalone download. **The generator supplies only: parameters, presets, a palette, and `build()` which returns triangles.** Never restyle the page or write your own UI shell.

Sources of truth (read them before changing anything, they may have moved on since this skill was written):
`docs/generator-styling.md` (contract), `docs/generator-registry.md` (slots), `programs/ghost-builder.html` (reference generator), `programs/shared/generator-core.js` (engine), `programs/shared/generator.css`, `js/programs.js`. Template and extra snippets: [reference.md](reference.md).

## Workflow

1. **Copy** `programs/ghost-builder.html` to `programs/<kebab-name>.html`. Keep the head and tail exactly (see Page rules). Delete the ghost geometry, stamps, `mount`, `onHover`, `onPick` unless the new model needs them.
2. **Config**: set `code` (next free `MM-00N`, matches slot number), `category` (`UPPER // CASE` label, e.g. `SPOOKY // FIGURES`), `title`, `fileName` (no extension), `palette`, `partNames`, `printSettings`, `parameters`, `presets`.
3. **Write `build(params, api)`** (contract below). Aim for one closed, watertight surface per printable solid.
4. **Check printability** with the script: `node .claude/skills/makermakers-generator/check-mesh.mjs programs/<name>.html ["Preset label"]`. Run it for the defaults and for every preset, plus slider extremes (temporarily edit values).
5. **Register the slot and thumbnail** (below).
6. **Verify live** with the checklist at the end. Do not report done without opening it in the preview.
7. **Docs**: update `docs/generator-registry.md` / `docs/file-structure.md` if they describe the slot list or thumbnails. Commit only your own files (other work may be in the tree: stage by path, never `git add -A`).

## Page rules (the standalone bundler depends on these)

- `<body class="mm-gen">`.
- Exactly `<link rel="stylesheet" href="shared/generator.css">` and exactly `<script src="shared/generator-core.js"></script>`; the config `<script>` comes **before** the engine tag.
- three.js r128 and OrbitControls from the CDN tags in the Ghost Builder, nothing else. No other `src`/stylesheet tags, no fonts, no libraries.
- Never write a literal `</script>` inside the config (write `<\/script>`).
- Relative paths only (`programs/x.html`, `assets/thumbnails/x.svg`), never a leading `/`.
- Plain JS in an IIFE with `'use strict'`; `var`/function style matching Ghost Builder, single quotes, semicolons, 2-space indent.
- No colors, fonts or layout rules in the generator page. Missing style? Add it to `shared/generator.css` for all generators.

## Config

| Field | Notes |
| --- | --- |
| `code`, `category`, `title`, `fileName` | Required. `fileName` is the default export name; the engine strips spaces/symbols. |
| `palette` | Required `[{ name, color }]`. Use **eight** entries (two tidy rows). Pastel/matte, printable filament-like colors with friendly names (Ghost Builder: Bone White, Glow Mint, Pumpkin Matte...). Include one dark and one light. |
| `defaultColor` | Optional; defaults to first palette entry. |
| `printSettings` | Recommended slicer settings written into the .3MF (`material`, `nozzle`, `layerHeight`, `infill`, `walls`, `topLayers`, `bottomLayers`, `supports`, `brim`, optional `speed`, `notes`). Seeds the engine's **Print** tab (users can edit every value there; the export writes their edits). Always set it with values right for the model (supports/brim if it has overhangs or a small base). Slicer import is untested; do not claim it works. |
| `partNames` | Mesh name -> label, e.g. `{ body: 'Ghost body', face: 'Eyes & mouth', detail: 'Stamp' }`. Every mesh name you return should have one. |
| `parameters` | `{ group, key, label, unit, min, max, step, value, format? }`. `unit` includes its leading space (`' mm'`) or is `'°'`/`'%'`. Plain-word group names (engine upper-cases them). Sensible defaults that already look good. |
| `presets` | `[{ label, values }]`, values override only some keys. Include a "Default ..." preset that restores everything, including non-visual params. |
| `mount(container, api)` | Only for generator-only controls; use classes `mm-group`/`mm-group-title`, `mm-note`, `mm-chips`/`mm-chip`, `mm-btn` (`--green --amber --solid --block`), `mm-export-row`, `mm-icon-chips`/`mm-icon-chip`. |
| `onHover(hit, api)` / `onPick(hit, api)` | Placement tools. `hit` = `{ point, normal (THREE.Vector3), meshName, part }` or null on hover. `onPick` fires only in the Parametric tab. |
| `printerLink` | Optional; default is right. |

Limits that bite: keep slider counts modest; `build()` runs on every slider move (engine batches to one per frame) so keep it to tens of thousands of triangles, and precompute topology once outside `build`. `build` must be deterministic from `params` plus closure state (e.g. a stamps array), call `api.rebuild()` after changing closure state.

## The build() contract

```js
build: function (params, api) {
  return [{
    name: 'body',                // label key (partNames) and hit.meshName
    positions: Float32Array,     // NON-indexed triangles, 9 numbers per triangle, millimetres
    shade: Float32Array,         // optional, 1 value per vertex (3/triangle), 0..1, 1 darkens (cavities)
    smoothGroup: 'ghost'         // optional; same value = lit as one surface, no seam
  }];
}
```

- **Y-up, millimetres.** The engine converts to Z-up for export `(x,y,z) -> (x,-z,y)` and drops the lowest point to z=0. Do not rotate or place on the bed yourself; do keep the model's base flat so it has a proper first layer.
- **Winding**: counter-clockwise seen from outside (outward normals). Check by looking at the viewport (inside-out shows dark/inverted) and by `volume` in the check script being positive.
- Triangles are welded at 0.001 mm by the engine. Build topology from shared grid vertices (as Ghost Builder does) rather than duplicating vertices with slightly different floats.
- Use `api.THREE` for helpers. For placed features, build a `THREE.ExtrudeGeometry`, call `.toNonIndexed()`, `applyMatrix4`, then copy `attributes.position.array.slice()` (see `stampPositions` in Ghost Builder).
- Size sanity: the viewport build plate is 160 mm square. Typical printable models are 40-120 mm; the size readout top-right shows `X x Y x Z MM`.

## Color and part segmentation (Color tool requirements)

The Color tool paints **parts** the engine detects per mesh: triangles that share an edge join a part unless the surface turns more than 50° across it (`CREASE_COS`); parts under 200 triangles merge into their most-touching neighbor (`MIN_PART_TRIS`). Do not change those constants per generator.

So, to make a feature independently paintable:
- Put it in **its own mesh entry** (own `name`), even if it touches or overlaps another. Ghost Builder: `body`, `face` (eyes/mouth, smooth walls, still split out by triangle membership), `detail` (one entry per stamp).
- Give split-surface entries the same `smoothGroup` so lighting has no seam.
- A feature on the same mesh only becomes its own part if there is a sharp (>50°) edge and at least 200 triangles. Use a finer mesh or a separate entry otherwise.
- Largest part of a mesh takes the `partNames` label, the rest are `Part 2`, `Part 3`... Verify the list in the Color tab reads sensibly and that no tiny parts appear.
- Paint is stored by part centre and re-matched within 40 mm when sliders change; it resets on reload (by design). Parametric tab is always neutral matte; colors show only in the Color tab.

## Exports and printability

- **STL**: binary, one solid, no color. **3MF**: one base material per color, per-triangle color. File name from the panel field. Both use the same Z-up transform.
- Every closed solid must be **watertight and manifold**: no open edges, no edge shared by more than two triangles, no degenerate (zero-area) or NaN triangles. `check-mesh.mjs` tests this after welding. It reports per mesh and per `smoothGroup`: a mesh that is only part of a split surface legitimately shows open edges alone, the combined smoothGroup line is what must be OK. Independent solids (stamps, separate parts) must each pass alone.
- Overlapping shells (a stamp embedded 1.8 mm into the body) are acceptable; slicers union them. Embed placed features into the surface (no gaps, no hairline contact) and keep them proud enough to print (>= 0.8 mm).
- **Smooth holes and cut-outs**: no stair-stepped or jagged edges. Use a smooth falloff (`smootherstep`: zero slope/curvature at both ends) so cut-outs blend into the surface; pack angular segments toward where detail is (Ghost Builder `FRONT_BIAS`); use enough segments that circles/ellipses look round (>= 48 per full circle; Ghost Builder uses 160 around). Holes must keep a printable wall: do not let `effectiveR`-style depth cut through (clamp with `Math.max`).
- Avoid overhangs > ~55° without intent, features thinner than ~1.2 mm, and a base smaller than the footprint. Presets and slider extremes must not produce self-intersection, negative radius or inverted triangles.
- Keep `build()` fast and re-run the check at slider min/max.

## Slot and thumbnail

`js/programs.js` has a `GENERATORS` list; the grid builds `PROGRAMS` from it and adds rows automatically (at least 40 sockets, any slot number works). Activate a slot by appending an entry to `GENERATORS` (slot 1 = Ghost Builder is the model to follow):

```js
{
  slot: 2,
  title: 'Honeycomb Hook',
  category: 'HOOKS & WALL STORAGE',
  thumbnailUrl: 'assets/thumbnails/honeycomb-hook.svg',
  programUrl: 'programs/honeycomb-hook.html',
  description: 'One sentence of what it makes, the main knobs, and that parts can be painted and exported as .STL or .3MF.'
}
```

- Use the next free slot; the `code` in the config (`MM-00N`) matches the slot number. `featured` defaults to true for slots 1-3 only; change deliberately.
- Titles/categories/descriptions are inserted as HTML unescaped: plain text, no `&`, `<`.
- A slot with `programUrl` is "ONLINE" (viewer iframe, Download enabled); without `thumbnailUrl` it shows the empty crosshair.
- **Thumbnail** convention: `assets/thumbnails/<kebab-name>.svg`, same name as the page, `viewBox="0 0 400 300"` (4:3, shown `object-fit: cover`), flat illustration in the blueprint style of `assets/thumbnails/ghost-builder.svg`: navy `#0d2b59` background, faint cyan `#00e5ff` grid at 0.08 opacity, an elliptical dark build-plate shadow near the bottom, the object drawn with light fill and a 2 px cyan stroke, one purple/accent detail, cyan corner brackets, and a monospace label `MM-00N TITLE` at the bottom (`Courier New`, size 11, letter-spacing 2). No external fonts or images. Keep the subject centered with margin.

## Visual style conventions (engine-owned, do not override)

Every generator shows the engine's footer disclaimer (as-is, print at your own risk, not legal advice). It comes from `generator-core.js` automatically; do not add your own or hide it. Wording is edited in `generator-core.js`, `index.html` and `DISCLAIMER.md` together.


Blueprint look: deep navy, cyan lines/active states, green ("Find local printer") and amber ("Download program") secondary actions, monospace throughout. Panel 380 px left on desktop, tabs Parametric / Color tool, footer with triangle count, file name, exports and standalone download. Viewport right with orbit, size readout, Front/Iso buttons, 160 mm build plate. Slider groups, Presets, `mount()` extras and View are accordion sections (first group open; optional `openGroups` and `extrasTitle` config fields; put the most-used group first). Below 860 px the layout is a pinned viewport (top 40%) over a resizable bottom sheet with sticky tabs, big touch sliders and always-visible export buttons; the page never scrolls. Inside the site viewer (iframe) the engine adds `mm-framed` and hides its own header. Slider labels: short, plain, optional parenthetical hint like `Eye slant (cute ↔ fierce)`.

## Verification checklist (live preview)

Start the dev server with the preview tool (`maker-makers`, port 5173, from `.claude/launch.json`; never run servers with Bash), then:

- [ ] `programs/<name>.html` loads standalone: no console errors, model visible, header shows code/category/title.
- [ ] Open from the grid: socket shows the thumbnail, viewer iframe loads the generator, header buttons work, no placeholder "NO GENERATOR LOADED".
- [ ] Every slider and preset rebuilds the model with no gaps, spikes or inside-out faces; try min and max of each. Triangle count stays reasonable.
- [ ] `check-mesh.mjs` passes for defaults and each preset.
- [ ] Color tab: palette shows 8 swatches, part list is sensible with readable names, painting by click and from the list works, paint survives a slider change, Parametric tab stays neutral.
- [ ] Parametric tab View switch: Solid / Wireframe / Solid + edges all render, sliders rebuild in each, Color tab shows solid.
- [ ] Print tab shows your `printSettings` as defaults, edits change the 3MF, Reset restores them.
- [ ] Export .STL and .3MF download and open (STL size ~ 84 + 50 x triangles bytes; model sits on the bed; 3MF has the colors; the zip lists `Metadata/Slic3r_PE.config`, `project_settings.config`, `print-settings.txt` with your `printSettings`).
- [ ] "Download standalone .html generator" and the viewer's Download both produce one working file (needs http, not file://).
- [ ] The collapsed "Disclaimer" block shows under the panel footer buttons (engine-provided; never remove or override it in a generator page) and expands to readable text.
- [ ] Phone width (resize to 375x667 and 390x844): no page scroll or horizontal scroll, model visible above the sliders, sheet handle drags, export buttons visible, accordion sections open/close.
- [ ] Slot listing: title, category, description render as plain text; thumbnail not cropped badly.
- [ ] `git status`: only your files staged and committed.
