# Holiday Tree Topper (slot 107)

`programs/holiday-tree-topper.html`, in the Christmas group. A faceted crystal star, sparkle burst or heart on a socket that slips over the tree tip. Unprinted: the spinner clearance and the socket fit are unproven until a real print.

## Layout

Y up, millimetres, centred on the axis, resting on the bed (y = 0). Three bodies, all lathes (shared rings, so watertight) except the head:

| Mesh | What it is |
| --- | --- |
| `base` | The socket: a tapered bore (open at the bed, 45 degree ceiling), a column, a 45 degree flare out to a flat **ledge**, a 45 degree shoulder going up to a **post**: a 4 mm neck and a mushroom head with a 45 degree underside and roof. |
| `cap` | The spinning cone, printed in place around the post. Flat underside 0.4 mm above the ledge, a 45 degree chamfer out to the cone's rim, a 45 degree outer cone up to the apex, and inside it the cavity, offset from the post by the clearance, with a lip under the head that keeps it on. |
| `star` | The head: the outline (star, sparkle or heart) joined to a front and a back apex, so every face is a facet. |

## Why the cone is big

A downward-pointing corner of the head (a lower star arm) would start in mid-air, so every one is buried in the cone: `outlineStats` finds the corners that point down and the cone apex `Sc` is raised until its 45 degree surface covers them. The head's lowest edge near the axis must also clear the post's cavity by 1.5 mm. Even-point stars and sparkles have arms pointing sideways-down, so their cone is large (up to about 100 mm across). The default 5-point star and the heart keep it small.

## Print in place

Clearance (`clr`, 0.3 to 0.6, default 0.4) is the perpendicular gap on every 45 degree surface. **Fixed** mode uses a 0.5 mm overlap instead, so the cone fuses to the post. The cone's first layer prints 0.4 mm above the ledge, so give it a twist after printing to break the bond.

The print check voxelises at `max(0.4, longest side / 170)`. `layout` lowers the ledge by less than one cell (`dY`, the ledge gets narrower) so the cone's underside lands in the cell right above the ledge's top cell. Nothing else moves, so the cell size does not change. A clearance above about the cell size can still read as "overhang" in the check chip.

## Support-free status

Defaults and every preset pass `check-generator.mjs` except the Sparkle burst, which carries a 3 mm warning. Slider extremes: points 4, 7, 8 and 9 (at low pointiness), sparkle with 4, 5 or 8 arms, and the biggest sizes make lower arms with shallow undersides and read "needs supports". Thinner puff helps; a 3D-faceted face tilted less than 45 degrees from flat does not print clean.

## Known limits

- Unprinted: the 0.4 mm clearance, the first layer over the ledge gap, and the fit of the bore on a real tree tip.
- Hologram tile and side-panel render are not done yet.
