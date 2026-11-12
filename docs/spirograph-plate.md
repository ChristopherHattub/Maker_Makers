# Spirograph Art Plate (slot 134)

`programs/spirograph-plate.html`, bundle `decor`. A wall plaque of nested spirograph curves raised on a flat plate, with an optional rim and hanging hole. Printed flat, curves up, no supports. Unprinted.

## The curve

Each line is a real spirograph curve: a wheel with `wheel` teeth rolling around (or outside) a fixed ring with `ring` teeth, with a pen hole at `pen` percent of the wheel radius.

- Inside the ring is a hypotrochoid, outside is an epitrochoid.
- The curve closes after `wheel / gcd(ring, wheel)` turns and has `ring / gcd(ring, wheel)` lobes. Ratios that share a large factor (96 and 32) draw a simple shape with few lobes; coprime teeth (105 and 41) draw very dense webs. The presets pick tidy ratios.
- Each curve is scaled so its widest point reaches the space inside the rim, minus half a line width.

## Nested lines

`layers` (1 to 6) curves are drawn. Line 1 is the outer one; later lines shrink linearly to `inner` percent of the first. Per line the generator can also change the pen hole (`penStep`), the wheel teeth (`ratioStep`, a different ratio for every line) and rotate the curve (`twist`). Lines cross each other freely: they are separate shells that overlap, and slicers union them.

## Geometry (why it prints with no supports)

- The plate lies on the bed. The curves are tapered ribbons (a trapezoid section, 0.3 mm embedded in the plate), so every wall leans inward and nothing overhangs.
- The curve is resampled by arc length and turning angle (about 1.5 mm or 5 degrees), then capped to 1500-3000 points per line so very busy ratios stay under about 130,000 triangles in total.
- Where the curve turns tighter than the line is wide (hairpins near the pen-hole limit), the ribbon narrows instead of folding over itself. Points closer than 0.15 mm are dropped. Every ribbon vertex also gets a deterministic wobble of about 0.01 to 0.03 mm so two crossings never land on exactly the same welded point (that would make a non-manifold edge).
- Outlines: circle, hexagon (flats at the top and bottom) and a star with 5 to 12 points. The outline is a star-shaped polygon, so the plate is a simple fan prism. The hexagon and star are rounded by smoothing passes ("Corner rounding"); the star always gets a minimum of rounding so its tips stay printable, and its rim is capped at 4 mm. The rim is the outline inset along its normals.
- Hanging hole: a ring-shaped lug (a lathe with a raised eyelet) sits on the top edge (the -Z side) and overlaps the plate by about 2 mm. It is its own mesh, so it can be painted or removed in the Sculpt tab.

## Parts for the Color tool

`plate`, `rim`, `lug` (hanging hole) and `curve1` to `curve6` (Line 1 outer to Line 6 inner). Each line is a separate shell, so every curve can be a different filament. Every mesh is flagged `singlePart` so the Color tool shows one part per line (without it a ribbon splits into its walls and top at the 50 degree crease).

## Checks

- `node .claude/skills/makermakers-generator/check-mesh.mjs programs/spirograph-plate.html --all` passes (watertight, "no supports needed") for the defaults and all eight presets.
- A sweep of 162 cases (every slider at its minimum and maximum, all three outlines, with and without the hole, both wheel directions, and the busiest and thickest settings) had no open or non-manifold edges and no print-check errors. It is not kept in the repo; rebuild it from `window.MM_GENERATOR.build` and `analyse()` in the check script if needed.
- Hologram tile and side-panel render are made (config in `scripts/hologram-config.json` and `scripts/panel-thumbs-config.json`).

## Known open items

**Unprinted.** Lines under about 1.2 mm may not print cleanly at 0.4 mm nozzles; the line thickness slider starts at 1.0 mm. The busiest ratios (ring 150 with a wheel near 120) make several thousand crossings and a heavy mesh. Default colour is one filament; paint the lines in the Color tool for a multicolour plaque.
