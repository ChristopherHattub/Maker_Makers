# Holiday Tree Topper (slot 107)

`programs/holiday-tree-topper.html`, in the Christmas group. A faceted crystal star (four or five points), heart or gem on a fluted bell that spins on a socket that slips over the tree tip. Unprinted: the spinner clearance and the socket fit are unproven until a real print.

## Layout

Y up, millimetres, centred on the axis, resting on the bed (y = 0). Three bodies. `base` and `cap` are lathes (shared rings, so watertight); `star` is the outline joined to a front and back apex.

| Mesh | What it is |
| --- | --- |
| `base` | The socket: a tapered bore (cone ceiling), a column with an optional collar ring, a flare out to a flat **ledge**, a shoulder going up to a **post**: a 4 mm neck and a mushroom head with a conical underside and roof. |
| `cap` | The spinning bell, printed in place around the post. Flat underside 0.4 mm above the ledge, a conical chamfer out to the rim, a conical outer surface (fluted: 24 soft ridges) up to the apex, and inside it the cavity, offset from the post by the clearance, with a lip under the head that keeps it on. |
| `star` | The head: the outline joined to a front and a back apex, so every edge becomes a facet. Star tips are 2 mm flat, not needles. |

## Support-free rules

Every surface that faces down is a cone line, 36 degrees from vertical (`M = 0.72`), so a fluted ridge stays under 40 degrees. The only flat downward surface is the 3 mm ring over the ledge (the print-in-place gap, see below). The lower tips of the head would start in mid air, so each one is buried in the bell: `outlineStats` finds every corner that points down and the bell's cone `Sc` is raised until it covers them. The head's lowest edge near the axis also clears the post cavity by 1.5 mm.

Two checks must pass, because each misses what the other sees:

- `check-generator.mjs` (the voxel print check in CI).
- `.claude/skills/makermakers-generator/check-overhang.mjs programs/holiday-tree-topper.html 41` adds up the triangles that face down and are steeper than 41 degrees from vertical. The voxel check hides knife-edge arm undersides and let 6-, 8- and 10-point stars, a sparkle shape, drops, crests and diamonds through; that is why those were removed.

`FIT` holds, per star point count, a half-turn and a minimum pointiness found with `check-overhang.mjs` at sizes 28 to 55 and puff 20 to 36; `outline` applies them, so Pointiness is raised for a count that needs it. Six and seven points fail the voxel check with any fit, so the slider is Four or Five.

## Print in place

Clearance (`clr`, 0.3 to 0.6, default 0.4) is the perpendicular gap on the cone surfaces. **Fixed** mode uses a 0.5 mm overlap instead, so the bell fuses to the post.

The bell's first layers print as a 3 mm flat ring 0.4 mm above the ledge. That is a real bridge over air, the one place that is not support-free in the strict sense; it works like the vertical gap on any print-in-place spinner and fuses lightly, so give the bell a twist after printing. `layout` lowers the ledge by less than one voxel (`dY`) so the voxel check sees the ring sitting on it.

## Known limits

- Unprinted: the 0.4 mm clearance, the first layer over the ledge gap, the fluted bell, and the bore fit on a real tip.
- The bell is big on purpose (it buries the lower arms), so the star reads smaller than its size slider.
- Hologram tile and side-panel render are not done yet.
