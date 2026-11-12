# Pet Bowl Housing (slot 112)

`programs/pet-bowl-housing.html`. A housing (holder or feeder stand) with a pocket for the visitor's own pet bowl, one or two. Checked only by `check-mesh.mjs` (defaults, all ten presets) and a sweep of 800 combinations (every slider at min and max with single, tray, platform and pedestal; five fonts, five names, six plate shapes, all plate positions); **not printed yet**, and the pocket fit is unproven.

## What the sliders mean

- **Your bowl** (Bowls group): width across the rim, width just under the rim, width of the bottom, height, rim seat depth and fit clearance. The pocket is cut from these: a counterbore for a flared rim to rest in (the seat), then a pocket that narrows to the bottom width, then a flat floor. With no flared rim (rim about equal to body) there is no seat. Measure the real bowl and add the clearance (1.5 mm default).
- **Housing**: wall around the pocket, floor thickness, and how a double set is joined (none, low link bar, spill tray, raised platform).
- **Shape / Surface / Base**: outline, side profile, base width, outer lip, wall patterns, and flat, anti-tip flange or raised pedestal base. The housing height is derived: floor + bowl height + 1 mm.

## How it is built

Each housing is one lathe-style surface: a ring list (bottom pole, outside up, rim, seat, pocket, floor pole) swept around 144 segments, so it is watertight by construction. A per-angle outline table (mean radius 1) scales the outside only; the pocket stays round. The outside is widened where needed so the wall around the pocket is never thinner than the Wall slider, even at the narrowest point of the outline. The surface is split into `out`, `rim` and `in` meshes for the Color tool (`out2`, `rim2`, `in2` for the second housing), one `smoothGroup` each. The tray, link bar and platform are separate stadium-shaped solids (`tray`).

## Support-free rules

- Walls lean out at most about 31 degrees (`TAN_WALL`, divided by the largest outline factor, because a wide outline stretches the slope). The base widens automatically to keep this.
- The pocket narrows towards the floor and the seat faces up, so nothing in the pocket overhangs.
- Wall patterns only cut inward, with depth capped (wall minus 3 mm, and 11% of the ring spacing for rings and quilting).
- The outer lip has a shallow bevel underneath; the pedestal flare is about 42 degrees; the flange has a flat bottom and a sloping top.
- A raised platform lifts the housings; the housings start 0.8 mm inside the platform so the slicer unions them. The Base style is ignored with a platform.
- The bed edge has a 0.6 mm chamfer against elephant foot.

## Name plate (Name tab)

The pet's name is the main feature. The **Name** tab holds the text box (two lines at most), a font (Bold block, Bubble, Slab serif, Script, Chunky caps) and capitals. **Name plate position** puts a sloped plate in front of the housing (a ramp, low at the front, rising towards the bowl), behind it (a board, rising away from the bowl), or both. Plate shapes: rounded rectangle, oval, pill, arch, hexagon, heart. Sliders set plate width (% of the housing set), depth up the slope, slope angle (15 to 45 degrees), edge height, border, letter height, how far the letters stand up, spacing and space around the name. Letters shrink to fit; a longer name needs a wider or deeper plate.

- The plate is a solid wedge (vertical walls down to the bed) whose top leans back at most 45 degrees from flat, and the letters and border stand along the plate normal, so their walls lean at most 45 degrees from vertical and nothing needs supports.
- The plate is placed as close to the housing as it can be without entering any bowl pocket (`plateClear` checks outline points against the pocket radius at the plate height). A 3 mm thick tongue per housing, kept below the pocket floor, ties the plate to the housing base.
- Lettering, triangulation and the extruder are copied from the Text Generator (`programs/text-generator.html`); only a subset of five fonts and the characters a pet name needs is loaded from `programs/shared/fonts-pet.js` (`FONTDATA`, SIL OFL 1.1, see [text-generator.md](text-generator.md)). To change the fonts, regenerate the subset from the Text Generator's data.
- Color tool parts: Name ramp, Ramp border, Pet name (ramp), Ramp link, and the same four for the board. The name is not a slider, so presets keep whatever name is typed.

## Double sets

Housings sit along X. The gap is measured between outline extents. The second housing has its own bowl size (% of the first) and height. The link bar is buried in the housing floors (so the pockets stay clear); the tray is a stadium plate with a 2.4 mm rim wall; the platform is a stadium slab with a chamfered top edge.

## Open items

- The housings are solid, so they use a lot of filament at 100% infill (the default is about 650 cm3). Use low infill.
- Hologram tile and side-panel preview are not rendered yet ([hologram-tiles.md](hologram-tiles.md)).
- A bowl with a very different shape (square, very flared) needs the pocket sliders set to its widest and narrowest points; the pocket itself is always round.
