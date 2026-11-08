# Pet Bowl Maker (slot 112)

`programs/pet-bowl.html`. A single or double pet bowl. Checked only by `check-mesh.mjs` (defaults, all nine presets) and a slider-extreme sweep; **not printed yet**.

## How it is built

Each bowl is one lathe-style surface: a ring list (bottom pole, outside, rim, inside, fillet, floor pole) swept around 144 segments, so it is watertight by construction. A per-angle outline table (round, rounded square, hexagon, octagon, oval, flower, heart; mean radius 1) scales every ring. The surface is split into three meshes for the Color tool: `out`, `rim`, `in` (`out2`, `rim2`, `in2` for the second bowl), all in one `smoothGroup`. The spill tray and link bar are separate stadium-shaped solids (`tray`).

## Support-free rules

- Walls lean out at most about 31 degrees (`TAN_WALL`, divided by the largest outline factor, because a wide outline stretches the slope). The base widens automatically to keep this, so a "steep" profile still prints.
- Wall patterns only cut inward, with depth capped (`wall - 1.2 mm`, and 11% of the ring spacing for rings and quilting), so they never add overhang.
- The outer lip has a shallow bevel underneath; the pedestal flare is about 42 degrees; the anti-tip flange has a flat bottom and a sloping top.
- The rim scallops lower the rim along the same profile curve, so the wall slope does not change.
- The bed edge has a 0.6 mm chamfer against elephant foot.

## Double bowls

Bowls sit along X. The gap is measured between the outline extents, so a heart or flower still has the set gap. The second bowl has its own width and height (% of the first). Join with a low link bar (buried in the bowl floors, so the cavities stay clear) or a spill tray (stadium plate with a 2.4 mm rim wall; the bowls overlap its floor and slicers union them). A tray can also go under a single bowl.

## Open items

- Hologram tile and side-panel preview are not rendered yet ([hologram-tiles.md](hologram-tiles.md)).
- The default bowl looks fairly conical because the slope limit widens the base; raise "Base width" for a straighter wall or lower it for a rounder look.
