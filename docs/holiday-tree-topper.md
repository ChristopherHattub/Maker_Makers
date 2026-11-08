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

## Shapes

Star (3 to 10 points), Sparkle (alternating long and short points, 3 to 9), Heart, Gem (brilliant-cut silhouette), Drop, Crest and Diamond. Every outline is star-shaped about the centre and joined to a front and back apex, so each edge becomes a facet.

## Support-free status

Lower edges of the outline that run shallower than about 35 degrees from flat print as overhangs. The Gem, Drop, Crest, Diamond and Heart have undersides steeper than 50 degrees. For Star and Sparkle, `FIT` holds, per shape and point count, a half-turn and a minimum pointiness found with the print check at sizes 28, 38 and 55 mm (puff 24): `outline` applies them automatically, so the Pointiness slider is raised for a count that needs it. Regenerate `FIT` by looping over turn and pointiness and keeping the first combination with no error. Puff is capped at 40 percent because thicker sparkles fail again. Defaults, all presets and the socket and clearance extremes pass; the Small fixed star and a few Fixed variants carry a 3 to 4 mm warning.

## Known limits

- Unprinted: the 0.4 mm clearance, the first layer over the ledge gap, and the fit of the bore on a real tree tip.
- Hologram tile and side-panel render are not done yet.
