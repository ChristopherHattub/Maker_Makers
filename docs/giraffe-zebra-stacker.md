# Giraffe & Zebra Stackers (slot 130)

A ring-stacker toy, `programs/giraffe-zebra-stacker.html`, in the Toys & Games group. A base carries a keyed rod; a neck of 3 to 12 loose rings slides down the rod; a head with a socket tops it off. The viewport shows the toy assembled; the Print tab and every export show the print layout (`printMeshes`, so the Sculpt tab is not offered, see [generator-styling.md](generator-styling.md#display-pose-and-print-plate)).

Nothing here has been physically printed. The 0.4 mm ring fit, the tall rod standing on its base and the stamp relief are unproven until a real print.

## Parts and print pose

Y up, millimetres, front is +Z. Every part is built in its own local frame on y = 0 and every solid is a closed shell.

| Mesh | What it is |
| --- | --- |
| `base` | Round plate (or a savanna hill, or a small foot) plus the keyed rod standing on it. The rod is a circle with a flat on the back, so rings and head can only go on facing the right way. It prints upright. |
| `rings` | One shell per ring, each its own paintable part. A ring is a barrel-shaped frustum (the neck tapers from the base width to the top width), 45 to 55 degree chamfers on both ends, and a keyed hole, `Ring fit gap` larger than the rod all round. Rings print flat, no supports. |
| `pattern` | Spot or stripe stamps. Each stamp is a closed shell embedded 0.55 mm in the wall and raised by the `Stamp relief` slider (capped at half a spot radius, or 55 % of a stripe half-width, so the slope stays printable). One mesh, one colour (`singlePart`). Spots are irregular blobs with seeded jitter; stripes are pointed lenses tilted alternately. Stamps skip the back of the ring when a mane is on. |
| `head` | A domed skull (a lathe with the keyed socket in it; the socket roof is a 45 degree cone so there is no bridge) and a flat-bottomed muzzle loft. The muzzle's chin rises at 54 degrees and its lower corners are chamfered, so the whole head prints chin down with no supports. |
| `ears`, `eyes`, `pupils`, `nose` | Ellipsoids on the skull and muzzle. Ears tilt 58 to 72 degrees from flat so their undersides print clean. |
| `horns` | Ossicones: a tapered stem with a 55 degree flare into a ball tip. |
| `mane` | A swept fin on the back of every ring, plus a row of blades along the skull's centre line. Lower edges are 54 degrees, so no supports. |

Head stamps (`Stamps on the head`) use the same stamp code on the skull profile, and skip the eyes, ears, horns, mane line and muzzle.

## Sliders

- **Neck**: rings (3 to 12), ring height, width at the base and taper. Tall necks mean a tall rod (about 150 mm at 12 rings of 11 mm); the rod is the weak point, so print tall ones slowly or keep the ring count down.
- **Coat**: spots, stripes or plain; spot size / stripe width, density, relief, and whether the head is marked.
- **Head**: giraffe, zebra or baby shape, head size, muzzle length, eye size, ear size. **Topper**: horns, mane, both, or bare, with horn length and mane height.
- **Base**: flat plate, savanna hill or small foot, and its radius.
- **Fit & size**: overall size and the ring fit gap (0.3 to 0.7 mm; raise it if rings stick).

## Print layout

`printMeshes` shelf-packs the base with its rod, the head and every ring in rows no wider than 160 mm, 6 mm apart. The default kit is about 135 x 130 mm, so it fits a 184 mm bed. A preset's ring colours come from the mesh `color` fields (gold or cream rings, brown or ink stamps) and can be repainted per ring in the Color tool.

## Print check notes

The voxel print check cell is `span / 170`, so a large layout is checked coarsely. The layout is kept compact for that reason. Every chamfer and underside is at least 49 degrees from flat (45 degrees exactly reads as a false overhang on a coarse grid). The loft rows include the chin start row so the chin slope is exact however long the muzzle is. `check-mesh.mjs --all` passes for the defaults and every preset, and a 50-variant sweep (every slider at its minimum and maximum, plus combined extremes) was clean.

## Presets

Default giraffe, Zebra, Tall giraffe, Baby giraffe, Baby zebra, Savanna hill pair, Plain rainbow rings (paint each ring a different colour).
