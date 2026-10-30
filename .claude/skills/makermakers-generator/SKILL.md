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
2. **Config**: set `code` (`MM-` plus the slot number in three digits, e.g. `MM-066`), `category` (`UPPER // CASE` label, e.g. `SPOOKY // FIGURES`), `title`, `fileName` (no extension), `palette`, `partNames`, `parameters`, `presets`.
3. **Write `build(params, api)`** (contract below). Aim for one closed, watertight surface per printable solid.
4. **Check printability** with the script: `node .claude/skills/makermakers-generator/check-mesh.mjs programs/<name>.html ["Preset label"]`. Run it for the defaults and for every preset, plus slider extremes (temporarily edit values).
5. **Register the slot and thumbnail** (below).
6. **Verify live** with the checklist at the end. Do not report done without opening it in the preview.
7. **Hologram tile**: render poster + atlas per `docs/hologram-tiles.md`.
8. **Docs**: update `docs/slot-registry.md` (and `docs/file-structure.md` if needed). Commit only your own files (other work may be in the tree: stage by path, never `git add -A`).

## Mobile layout is mandatory and engine-owned

Every generator, new or existing, **must** use the shared phone layout from `generator-core.js` / `generator.css`: pinned viewport on top (40%), resizable bottom sheet below with sticky tabs, accordion slider sections, large touch sliders, no page scroll (exports live in the Print tab). Never write generator-specific mobile CSS, never override the sheet or tab bar, and never make a generator's controls scroll the page. A generator that uses the engine as described here gets it automatically; if a control looks wrong on a phone, fix it in `shared/generator.css` for everyone. Always verify at 375x667 and 390x844 before finishing.

## Print tab realistic render is engine-owned

Opening the Print tab automatically switches the viewport to a realistic render (painted colors, material finish for PLA/PETG/ABS/ASA/TPU, faint layer lines, studio lighting). Every generator gets it for free. The tab has one option, **Material**, plus the **Export block** (triangle count, file name, Export .STL, standalone .html download, disclaimer); there are no slicer settings. The Export block has **Export .STL** and **Export .OBJ (colors)**; the OBJ zip carries the Color-tab colors as materials for Bambu, Orca and Prusa (engine-owned, nothing to add per generator; there is no 3MF export). Never put export, file name or download controls in another tab. Never add your own print preview, print settings or extra Print tab controls, and never change materials or lighting in the generator. Check it in the live preview: open the Print tab, change the material, and confirm the model looks right.

## Page rules (the standalone bundler depends on these)

- `<body class="mm-gen">`.
- Exactly `<link rel="stylesheet" href="shared/generator.css">` and exactly `<script src="shared/generator-core.js"></script>`; the config `<script>` comes **before** the engine tag.
- three.js r128 and OrbitControls from the CDN tags in the Ghost Builder, nothing else. No other `src`/stylesheet tags, no fonts, no libraries.
- Never write a literal `</script>` inside the config (write `<\/script>`).
- Relative paths only (`programs/x.html`, `assets/thumbnails/x.svg`), never a leading `/`.
- Plain JS in an IIFE with `'use strict'`; `var`/function style matching Ghost Builder, single quotes, semicolons, 2-space indent.
- No colors, fonts or layout rules in the generator page. Missing style? Add it to `shared/generator.css` for all generators.

## Choice controls (engine-owned)

Real quantities are sliders. Categorical parameters are **not**: two options render as two side-by-side buttons with the selected one highlighted (all on/off switches), three or more as a dropdown. Picture pickers (`choices: [{ label, svg }]`) stay as icon buttons. Declare a plain integer parameter (`step: 1`, 2 to 8 values) with either `options: ['Off', 'On']` (value = `min` + index) or a `format` that returns names without digits (`v >= 1 ? 'On' : 'Off'`, `['None','Ball','Sparkle'][v]`); the engine detects it. `slider: true` opts out. A format containing digits (`v + ' mm'`) stays a slider. Do not hand-build chips or toggles in `mount()` for categorical params.

## Config

| Field | Notes |
| --- | --- |
| `code`, `category`, `title`, `fileName` | Required. `fileName` is the default export name; the engine strips spaces/symbols. |
| `palette` | Required `[{ name, color }]`. Use **eight** entries (two tidy rows). Pastel/matte, printable filament-like colors with friendly names (Ghost Builder: Bone White, Glow Mint, Pumpkin Matte...). Include one dark and one light. |
| `defaultColor` | Optional; defaults to first palette entry. |
| `printSettings` | Optional. Only `material` is read (`'PLA'` default); it picks the Print tab's starting material. Leave it out unless the model needs a different default. |
| `partNames` | Mesh name -> label, e.g. `{ body: 'Ghost body', face: 'Eyes & mouth', detail: 'Stamp' }`. Every mesh name you return should have one. |
| `parameters` | `{ group, key, label, unit, min, max, step, value, format? }`. `unit` includes its leading space (`' mm'`) or is `'°'`/`'%'`. Plain-word group names (engine upper-cases them). Sensible defaults that already look good. |
| `presets` | `[{ label, values }]`, values override only some keys. Include a "Default ..." preset that restores everything, including non-visual params. |
| `tabs` | Optional extra editor tabs shown after Parametric: `[{ id, label, hint, mount(container, api), onHover(hit, api), onPick(hit, api) }]`. `hint` replaces the viewport hint while the tab is open; `onHover`/`onPick` work like the generator-level ones but only fire in that tab. Sliders for the tab go in `parameters` with `tab: '<id>'` (rendered as open accordion sections under the tab's `mount` content). Pumpkin Plotter's Carve tab is the example. |
| `testSetup(params)` | Optional, used by `check-mesh.mjs`: set up closure state (stamps, carves) so the check covers it. |
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
- Size sanity: the viewport build plate grows to fit the model: 184 mm (A1 mini), 256 mm, 350 mm, then bigger. Aim for defaults that fit the 184 mm bed, centred on the origin. Typical printable models are 40-120 mm; the size readout top-right shows `X x Y x Z MM // <bed> MM BED`.
- Sit the model on the bed: its lowest point must be y = 0 (nothing below, nothing floating). The engine does not lift models.

## Color and part segmentation (Color tool requirements)

The Color tool paints **parts** the engine detects per mesh: triangles that share an edge join a part unless the surface turns more than 50° across it (`CREASE_COS`); parts under 200 triangles merge into their most-touching neighbor (`MIN_PART_TRIS`). Do not change those constants per generator.

So, to make a feature independently paintable:
- Put it in **its own mesh entry** (own `name`), even if it touches or overlaps another. Ghost Builder: `body`, `face` (eyes/mouth, smooth walls, still split out by triangle membership), `detail` (one entry per stamp).
- Give split-surface entries the same `smoothGroup` so lighting has no seam.
- A feature on the same mesh only becomes its own part if there is a sharp (>50°) edge and at least 200 triangles. Use a finer mesh or a separate entry otherwise.
- Largest part of a mesh takes the `partNames` label, the rest are `Part 2`, `Part 3`... Verify the list in the Color tab reads sensibly and that no tiny parts appear.
- Paint is stored by part centre and re-matched within 40 mm when sliders change; it resets on reload (by design). Parametric tab is always neutral matte; colors show only in the Color tab.

## Exports and printability

- **STL**: binary, one solid, no color. File name from the panel field. Uses the Z-up transform above.
- Every closed solid must be **watertight and manifold**: no open edges, no edge shared by more than two triangles, no degenerate (zero-area) or NaN triangles. `check-mesh.mjs` tests this after welding. It reports per mesh and per `smoothGroup`: a mesh that is only part of a split surface legitimately shows open edges alone, the combined smoothGroup line is what must be OK. Independent solids (stamps, separate parts) must each pass alone.
- Overlapping shells (a stamp embedded 1.8 mm into the body) are acceptable; slicers union them. Embed placed features into the surface (no gaps, no hairline contact) and keep them proud enough to print (>= 0.8 mm).
- **Smooth holes and cut-outs**: no stair-stepped or jagged edges. Use a smooth falloff (`smootherstep`: zero slope/curvature at both ends) so cut-outs blend into the surface; pack angular segments toward where detail is (Ghost Builder `FRONT_BIAS`); use enough segments that circles/ellipses look round (>= 48 per full circle; Ghost Builder uses 160 around). Holes must keep a printable wall: do not let `effectiveR`-style depth cut through (clamp with `Math.max`).
- Avoid overhangs > ~55° without intent (see Support-free by default), features thinner than ~1.2 mm, and a base smaller than the footprint. Presets and slider extremes must not produce self-intersection, negative radius or inverted triangles.
- Keep `build()` fast and re-run the check at slider min/max.

## Support-free by default (required)

Every generator's **defaults and presets must print with no supports, or as few as possible**: Chris's rule is to prevent supports wherever the geometry allows. So design low and flat first:
- Rest on a flat base or a flat-cut belly (clamp the lowest vertices to the bed plane, as Spider does) instead of floating on thin legs or a point. Keep a wide first layer.
- Keep slopes and overhangs gentle (about 45° from vertical or less); round or chamfer the unavoidable ones. Limbs, arms and legs should lie along the bed or rise at a steep angle, never arch high over empty space.
- Say in the `description` or a slider label which slider extremes (raised body, high arches, long overhangs) bring supports back, e.g. `Body height (low = no supports)`. There is no per-generator print-notes field.
- Check the **lowest point stays at the bed** for defaults, presets and slider min/max (the sweep that matches the manifold check), and that nothing floats.

## Slot and thumbnail

`js/programs.js` has a `GENERATORS` list; `PROGRAMS` is built from it (any slot number works, gaps are fine) and the homepage map shows every entry with a `programUrl`. Activate a slot by appending an entry to `GENERATORS` (slot 1 = Ghost Builder is the model to follow):

```js
{
  slot: 2,
  title: 'Honeycomb Hook',
  category: 'HOOKS & WALL STORAGE',
  thumbnailUrl: 'assets/thumbnails/honeycomb-hook.svg',
  programUrl: 'programs/honeycomb-hook.html',
  description: 'One sentence of what it makes, the main knobs, and that parts can be painted and exported as .STL.'
}
```

- Use the next free slot; the `code` in the config (`MM-0NN`) matches the slot number. Add `bundle: '<bundle id>'` to put it in a map region (see Bundles below); without one it lands in the automatic "More" region. Record the slot in `docs/slot-registry.md`. Slots 76-90 are reserved for animals; the next free slot is 102.
- Titles, categories and descriptions are plain text (the homepage escapes them; keep them free of markup).
- A slot with `programUrl` gets a homepage tile and loads in the viewer; without `thumbnailUrl` the tile shows a plus sign.
- **Thumbnail**: see the next section. File `assets/thumbnails/<kebab-name>.svg`, same name as the page. It is shown in the homepage details panel and the Workshop's Generators set, and its basename is the hologram tile id.
- **Hologram tile**: every new generator also gets a rendered hover hologram on the homepage. Follow `docs/hologram-tiles.md` (render `tools/hologram.html?gen=<thumbnail id>&save=1`, then `scripts/build-holo.py`) and commit `assets/thumbnails/sprites/holo-<id>.webp` plus `manifest-v2.json`. Tune colour in `scripts/hologram-config.json`.

## Thumbnail style

All slot thumbnails share one look, so the grid reads as a set. **Start from [thumbnail-template.svg](thumbnail-template.svg)** (copy it, set the `MM-0NN` code and `TITLE`, draw the subject where the SUBJECT comment is). Do not change the frame.

- Canvas `viewBox="0 0 400 300"` (4:3, shown `object-fit: cover`), no external fonts/images/filters. Subject centered, x 70-330, y 40-250, with its base resting on the build plate ellipse (cy 248). Draw the model's most recognizable view (front or 3/4), not a technical drawing.
- Frame (already in the template, matches the site CSS): radial navy background (`#14407f` > `#0d2b59` > `#06152d`), 20 px/100 px cyan grid, glowing build plate ellipse with a contact shadow, cyan corner brackets, a `MM-0NN` chip top-left, and the title in `Courier New` 12 px, letter-spacing 3, `#eef7ff`, bottom center (upper case, plain text).
- Shading (fake 3D, the same on every thumbnail): fill each solid with a radial gradient lit from the upper left. `url(#mat)` is the default cool bone/white; `url(#warm)` for orange-ish models, `url(#green)` for greenery. Outline every solid with `stroke="#00e5ff" stroke-width="2" stroke-linejoin="round"`. Add one soft specular streak per major form (`stroke="url(#gloss)"`, width 5-7, round caps) on the upper-left edge. Cavities and holes are `#06152d`/`#0a2246` with a slightly darker inner shape for depth. Overlap order = depth order.
- Accent: exactly one small purple `#c084fc` detail (a band, buckle, dots or trim; no star stamps) with a white 1.2-1.4 stroke. At most one other hue (the model's own material).
- Thin parts (legs, handles) are drawn as stacked strokes: cyan wide, mid-blue, light, then a thin white highlight.
- Gradient/pattern ids (`bg`, `plate`, `shadow`, `gloss`, `mat`, `warm`, `green`, `gridMinor`, `gridMajor`) are shared names; keep them as in the template and do not add new ids that collide.
- Check it at card size: open `index.html` in the preview (or an `<img>` on the dev server; `file://` previews do not load images) and confirm nothing is cropped and the silhouette reads at ~200 px wide.

## Bundles

A bundle groups generators under a theme (Halloween, Christmas...) and is one tinted region on the homepage map. Bundles live in the `BUNDLES` array in `js/programs.js`, under `GENERATORS`:

```js
{ id: 'halloween', name: 'Halloween', accent: '#ff8a1f', description: 'Plain text.',
  generators: ['SLOT-02', 'SLOT-03'] }   // optional ordered list of generator ids
```

- Declare membership on the generator with `bundle: 'halloween'` (string, or an array for several bundles) in its `GENERATORS` entry, and/or list its id in the bundle's `generators`. The two are merged without duplicates; the list sets display order, tagged generators are appended.
- To make a new bundle, append an entry to `BUNDLES` (id, name, accent, description) and tag its generators. Position and size on the map are automatic (`at` / `size` are ignored). `planned: true` reserves a placeholder region with no generators.
- Only generators with a `programUrl` count as members. Use plain text in names and descriptions.
- Nothing extra to draw for a bundle; see `docs/homepage.md` for the map.

## Visual style conventions (engine-owned, do not override)

Every generator shows the engine's disclaimer at the bottom of the Print tab (as-is, print at your own risk, not legal advice). It comes from `generator-core.js` automatically; do not add your own or hide it. Wording is edited in `generator-core.js`, `index.html` and `DISCLAIMER.md` together. The engine also shows a consent modal (`confirmDownload`, must tick the checkbox) before every .STL/.OBJ export; it is automatic, so never add a download button that bypasses it, never call export functions directly from generator code, and a new download type must go through `confirmDownload` too.


Blueprint look: deep navy, cyan lines/active states, green ("Find local printer") and amber ("Download program") secondary actions, monospace throughout. Panel 380 px left on desktop, tabs Parametric / Color tool / Print; no footer: the Print tab's Export block holds triangle count, file name, Export .STL, standalone download and the disclaimer, so other tabs show more settings. Viewport right with orbit, size readout, Front/Iso buttons, a build plate sized to fit the model (184 / 256 / 350 mm). Slider groups, Presets, `mount()` extras and View are accordion sections (first group open; optional `openGroups` and `extrasTitle` config fields; put the most-used group first). Optional generator tabs (`tabs`, see Config) sit after Parametric. Below 860 px the layout is a pinned viewport (top 40%) over a resizable bottom sheet with sticky tabs, big touch sliders; the page never scrolls. Inside the site viewer (iframe) the engine adds `mm-framed` and hides its own header; the viewer's top bar has Save STL, Send to Workshop and Back to Generators instead. Slider labels: short, plain, optional parenthetical hint like `Eye slant (cute ↔ fierce)`.

## Verification checklist (live preview)

Start the dev server with the preview tool (`maker-makers`, port 5173, from `.claude/launch.json`; never run servers with Bash), then:

- [ ] `programs/<name>.html` loads standalone: no console errors, model visible, header shows code/category/title.
- [ ] Open from the homepage map: the tile shows its hologram on hover, the details panel shows the thumbnail, the viewer iframe loads the generator, Save STL and Send to Workshop work, no placeholder "NO GENERATOR LOADED".
- [ ] Every slider and preset rebuilds the model with no gaps, spikes or inside-out faces; try min and max of each. Triangle count stays reasonable.
- [ ] `check-mesh.mjs` passes for defaults and each preset.
- [ ] Color tab: palette shows 8 swatches, part list is sensible with readable names, painting by click and from the list works, paint survives a slider change, Parametric tab stays neutral.
- [ ] Parametric tab View switch: Solid / Wireframe / Solid + edges all render, sliders rebuild in each, Color tab shows solid.
- [ ] Print tab shows the realistic render (colors kept, changing Material updates it live) and has no other options.
- [ ] Export .STL downloads and opens (size ~ 84 + 50 x triangles bytes; model sits on the bed).
- [ ] Export .OBJ (colors) after painting two parts: `<name>-obj.zip` holds `<name>.obj` and `<name>.mtl`, with one `newmtl` per used color and a `usemtl` group per color covering all faces. A new download type must go through `confirmDownload`.
- [ ] "Download standalone .html generator" (Print tab, and *Download program (.html)* in the standalone header) produces one working file (needs http, not file://).
- [ ] Clicking Export .STL opens the consent modal; the download button stays disabled until the box is ticked; Cancel/Esc/backdrop close it without downloading.
- [ ] The Disclaimer block shows at the bottom of the Print tab under the Export block (engine-provided; never remove or override it in a generator page) and expands to readable text.
- [ ] Phone width (resize to 375x667 and 390x844): no page scroll or horizontal scroll, model visible above the sliders, sheet handle drags, Print tab shows Export block, accordion sections open/close.
- [ ] Slot listing: title, category, description render as plain text; thumbnail not cropped badly.
- [ ] `git status`: only your files staged and committed.
